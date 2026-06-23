import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePregnancySymptomDto } from './dto/create-pregnancy-symptom.dto';

@Injectable()
export class PregnancySymptomService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, pregnancyId: string, dto: CreatePregnancySymptomDto) {
    // Verify pregnancy ownership
    await this.verifyOwnership(userId, pregnancyId);

    return this.prisma.pregnancySymptomEntry.create({
      data: {
        userId,
        pregnancyId,
        ...dto,
        entryDate: dto.entryDate ? new Date(dto.entryDate) : new Date(),
      },
    });
  }

  async findAll(userId: string, pregnancyId: string, startDate?: string, endDate?: string) {
    await this.verifyOwnership(userId, pregnancyId);

    const where: any = { pregnancyId };

    if (startDate || endDate) {
      where.entryDate = {};
      if (startDate) where.entryDate.gte = new Date(startDate);
      if (endDate) where.entryDate.lte = new Date(endDate);
    }

    return this.prisma.pregnancySymptomEntry.findMany({
      where,
      orderBy: { entryDate: 'desc' },
    });
  }

  async getToday(userId: string, pregnancyId: string) {
    await this.verifyOwnership(userId, pregnancyId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.pregnancySymptomEntry.findMany({
      where: {
        pregnancyId,
        entryDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTrends(userId: string, pregnancyId: string, days: number = 14) {
    await this.verifyOwnership(userId, pregnancyId);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await this.prisma.pregnancySymptomEntry.findMany({
      where: {
        pregnancyId,
        entryDate: { gte: startDate },
      },
      orderBy: { entryDate: 'asc' },
    });

    // Calculate trends for each symptom
    const symptomFields = [
      'nauseaSeverity',
      'headacheSeverity',
      'dizzinessSeverity',
      'fatigueSeverity',
      'swellingSeverity',
      'painLevel',
    ];

    const trends: Record<string, any> = {};

    for (const field of symptomFields) {
      const values = entries
        .filter(e => e[field] !== null && e[field] !== undefined)
        .map(e => ({ date: e.entryDate, value: e[field] }));

      if (values.length === 0) continue;

      const avg = values.reduce((sum, v) => sum + v.value, 0) / values.length;
      const max = Math.max(...values.map(v => v.value));
      const frequency = values.length / days;

      // Calculate trend direction using simple linear regression
      const n = values.length;
      const xValues = values.map((_, i) => i);
      const yValues = values.map(v => v.value);
      const xMean = xValues.reduce((a, b) => a + b, 0) / n;
      const yMean = yValues.reduce((a, b) => a + b, 0) / n;
      
      let numerator = 0;
      let denominator = 0;
      for (let i = 0; i < n; i++) {
        numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
        denominator += (xValues[i] - xMean) ** 2;
      }
      
      const slope = denominator !== 0 ? numerator / denominator : 0;
      const trendDirection = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable';

      trends[field] = {
        average: Math.round(avg * 10) / 10,
        max,
        frequency: Math.round(frequency * 100) / 100,
        dataPoints: values.length,
        trendDirection,
        slope: Math.round(slope * 100) / 100,
      };
    }

    return {
      period: { days, startDate, endDate: new Date() },
      totalEntries: entries.length,
      trends,
    };
  }

  async findOne(userId: string, pregnancyId: string, entryId: string) {
    await this.verifyOwnership(userId, pregnancyId);

    const entry = await this.prisma.pregnancySymptomEntry.findFirst({
      where: {
        id: entryId,
        pregnancyId,
      },
    });

    if (!entry) {
      throw new NotFoundException('Symptom entry not found');
    }

    return entry;
  }

  async update(userId: string, pregnancyId: string, entryId: string, dto: Partial<CreatePregnancySymptomDto>) {
    await this.findOne(userId, pregnancyId, entryId);

    return this.prisma.pregnancySymptomEntry.update({
      where: { id: entryId },
      data: dto,
    });
  }

  async remove(userId: string, pregnancyId: string, entryId: string) {
    await this.findOne(userId, pregnancyId, entryId);

    return this.prisma.pregnancySymptomEntry.delete({
      where: { id: entryId },
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
