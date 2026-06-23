import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePregnancyMedicationDto } from './dto/create-pregnancy-medication.dto';
import { LogMedicationDto } from './dto/log-medication.dto';

@Injectable()
export class PregnancyMedicationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, pregnancyId: string, dto: CreatePregnancyMedicationDto) {
    await this.verifyOwnership(userId, pregnancyId);

    return this.prisma.pregnancyMedication.create({
      data: {
        userId,
        pregnancyId,
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      },
    });
  }

  async findAll(userId: string, pregnancyId: string) {
    await this.verifyOwnership(userId, pregnancyId);

    return this.prisma.pregnancyMedication.findMany({
      where: { pregnancyId, isActive: true },
      include: {
        logs: {
          orderBy: { scheduledTime: 'desc' },
          take: 7,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, pregnancyId: string, medicationId: string) {
    await this.verifyOwnership(userId, pregnancyId);

    const medication = await this.prisma.pregnancyMedication.findFirst({
      where: {
        id: medicationId,
        pregnancyId,
      },
      include: {
        logs: {
          orderBy: { scheduledTime: 'desc' },
          take: 30,
        },
      },
    });

    if (!medication) {
      throw new NotFoundException('Medication not found');
    }

    return medication;
  }

  async update(userId: string, pregnancyId: string, medicationId: string, dto: Partial<CreatePregnancyMedicationDto>) {
    await this.findOne(userId, pregnancyId, medicationId);

    return this.prisma.pregnancyMedication.update({
      where: { id: medicationId },
      data: dto,
    });
  }

  async deactivate(userId: string, pregnancyId: string, medicationId: string) {
    await this.findOne(userId, pregnancyId, medicationId);

    return this.prisma.pregnancyMedication.update({
      where: { id: medicationId },
      data: {
        isActive: false,
        endDate: new Date(),
      },
    });
  }

  async logDose(userId: string, pregnancyId: string, medicationId: string, dto: LogMedicationDto) {
    await this.findOne(userId, pregnancyId, medicationId);

    return this.prisma.pregnancyMedicationLog.create({
      data: {
        medicationId,
        userId,
        pregnancyId,
        scheduledTime: dto.scheduledTime ? new Date(dto.scheduledTime) : new Date(),
        actualTime: dto.actualTime ? new Date(dto.actualTime) : new Date(),
        status: dto.status,
        sideEffectsNoted: dto.sideEffectsNoted || [],
        notes: dto.notes,
      },
    });
  }

  async getDoseHistory(userId: string, pregnancyId: string, medicationId: string) {
    await this.findOne(userId, pregnancyId, medicationId);

    return this.prisma.pregnancyMedicationLog.findMany({
      where: { medicationId },
      orderBy: { scheduledTime: 'desc' },
      take: 90, // Last 90 days
    });
  }

  async getAdherence(userId: string, pregnancyId: string) {
    await this.verifyOwnership(userId, pregnancyId);

    const medications = await this.prisma.pregnancyMedication.findMany({
      where: { pregnancyId, isActive: true },
    });

    const adherenceData = [];

    for (const med of medications) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const logs = await this.prisma.pregnancyMedicationLog.findMany({
        where: {
          medicationId: med.id,
          scheduledTime: { gte: sevenDaysAgo },
        },
      });

      const taken = logs.filter(l => l.status === 'taken').length;
      const total = logs.length;
      const adherencePercent = total > 0 ? Math.round((taken / total) * 100) : 0;

      adherenceData.push({
        medication: med.name,
        taken,
        total,
        adherencePercent,
      });
    }

    return adherenceData;
  }

  async logSideEffect(userId: string, pregnancyId: string, medicationId: string, symptomName: string, severity: number, notes?: string) {
    await this.findOne(userId, pregnancyId, medicationId);

    // Store as a medication log entry with side effect noted
    return this.prisma.pregnancyMedicationLog.create({
      data: {
        medicationId,
        userId,
        pregnancyId,
        scheduledTime: new Date(),
        actualTime: new Date(),
        status: 'side_effect_reported',
        sideEffectsNoted: [symptomName],
        notes: `Side effect: ${symptomName} (severity: ${severity}/10)${notes ? ` - ${notes}` : ''}`,
      },
    });
  }

  private async verifyOwnership(userId: string, pregnancyId: string) {
    const pregnancy = await this.prisma.pregnancyProfile.findFirst({
      where: {
        id: pregnancyId,
        userId,
      },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    return pregnancy;
  }
}
