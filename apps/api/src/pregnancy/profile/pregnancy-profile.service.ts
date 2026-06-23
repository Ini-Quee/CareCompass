import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePregnancyProfileDto } from './dto/create-pregnancy-profile.dto';
import { UpdatePregnancyProfileDto } from './dto/update-pregnancy-profile.dto';

@Injectable()
export class PregnancyProfileService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePregnancyProfileDto) {
    // Check if user already has an active pregnancy
    const existing = await this.prisma.pregnancyProfile.findFirst({
      where: {
        userId,
        status: 'active',
      },
    });

    if (existing) {
      throw new ForbiddenException('You already have an active pregnancy profile');
    }

    return this.prisma.pregnancyProfile.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async getCurrent(userId: string) {
    const profile = await this.prisma.pregnancyProfile.findFirst({
      where: {
        userId,
        status: 'active',
      },
      include: {
        medications: {
          where: { isActive: true },
        },
        _count: {
          select: {
            symptomEntries: true,
            bpLogs: true,
            bloodSugarLogs: true,
            appointments: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('No active pregnancy profile found');
    }

    // Calculate pregnancy week
    const today = new Date();
    const dueDate = profile.dueDate ? new Date(profile.dueDate) : null;
    let pregnancyWeek = null;
    let daysRemaining = null;

    if (dueDate) {
      // Pregnancy is ~40 weeks from LMP
      const lmpDate = profile.lastMenstrualPeriod 
        ? new Date(profile.lastMenstrualPeriod)
        : new Date(dueDate.getTime() - 280 * 24 * 60 * 60 * 1000);
      
      const daysSinceLMP = Math.floor((today.getTime() - lmpDate.getTime()) / (24 * 60 * 60 * 1000));
      pregnancyWeek = Math.floor(daysSinceLMP / 7);
      daysRemaining = Math.floor((dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    }

    return {
      ...profile,
      pregnancyWeek,
      daysRemaining,
      trimester: pregnancyWeek ? (pregnancyWeek <= 12 ? 1 : pregnancyWeek <= 27 ? 2 : 3) : null,
    };
  }

  async getById(userId: string, pregnancyId: string) {
    const profile = await this.prisma.pregnancyProfile.findFirst({
      where: {
        id: pregnancyId,
        userId,
      },
    });

    if (!profile) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    return profile;
  }

  async update(userId: string, pregnancyId: string, dto: UpdatePregnancyProfileDto) {
    // Verify ownership
    await this.getById(userId, pregnancyId);

    return this.prisma.pregnancyProfile.update({
      where: { id: pregnancyId },
      data: dto,
    });
  }

  async archive(userId: string, pregnancyId: string) {
    // Verify ownership
    await this.getById(userId, pregnancyId);

    return this.prisma.pregnancyProfile.update({
      where: { id: pregnancyId },
      data: { status: 'archived' },
    });
  }

  async getSummary(userId: string, pregnancyId: string) {
    const profile = await this.getById(userId, pregnancyId);

    // Get counts
    const [
      symptomCount,
      medicationCount,
      bpReadingCount,
      bloodSugarCount,
      appointmentCount,
      concernCount,
    ] = await Promise.all([
      this.prisma.pregnancySymptomEntry.count({
        where: { pregnancyId },
      }),
      this.prisma.pregnancyMedication.count({
        where: { pregnancyId, isActive: true },
      }),
      this.prisma.bloodPressureLog.count({
        where: { pregnancyId },
      }),
      this.prisma.bloodSugarLog.count({
        where: { pregnancyId },
      }),
      this.prisma.pregnancyAppointment.count({
        where: { pregnancyId },
      }),
      this.prisma.pregnancyConcern.count({
        where: { pregnancyId, addressed: false },
      }),
    ]);

    return {
      profile,
      counts: {
        symptoms: symptomCount,
        medications: medicationCount,
        bpReadings: bpReadingCount,
        bloodSugarReadings: bloodSugarCount,
        appointments: appointmentCount,
        openConcerns: concernCount,
      },
    };
  }
}
