import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phone: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        bloodType: true,
        preferredPharmacy: true,
        insuranceProvider: true,
        insuranceId: true,
        mfaEnabled: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        phone: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        bloodType: true,
        preferredPharmacy: true,
        insuranceProvider: true,
        insuranceId: true,
      },
    });
  }

  async getPreferences(userId: string) {
    const preferences = await this.prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      return this.prisma.userPreference.create({
        data: { userId },
      });
    }

    return preferences;
  }

  async updatePreferences(userId: string, data: any) {
    return this.prisma.userPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }

  async deleteAccount(userId: string) {
    // This will cascade delete all related data
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Account deleted successfully' };
  }
}
