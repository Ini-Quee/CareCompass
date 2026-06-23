import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VitalsService {
  constructor(private prisma: PrismaService) {}

  // ===== BLOOD PRESSURE =====

  async logBP(userId: string, pregnancyId: string, data: {
    systolic: number;
    diastolic: number;
    heartRate?: number;
    notes?: string;
  }) {
    await this.verifyOwnership(userId, pregnancyId);

    const isFlagged = data.systolic >= 140 || data.diastolic >= 90;

    return this.prisma.bloodPressureLog.create({
      data: {
        userId,
        pregnancyId,
        logDate: new Date(),
        logTime: new Date().toTimeString().split(' ')[0],
        systolic: data.systolic,
        diastolic: data.diastolic,
        heartRate: data.heartRate,
        notes: data.notes,
        isFlagged,
      },
    });
  }

  async getBPHistory(userId: string, pregnancyId: string, days: number = 30) {
    await this.verifyOwnership(userId, pregnancyId);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.bloodPressureLog.findMany({
      where: {
        pregnancyId,
        logDate: { ggte: startDate },
      },
      orderBy: { logDate: 'desc' },
    });
  }

  async getBPTrends(userId: string, pregnancyId: string) {
    await this.verifyOwnership(userId, pregnancyId);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const readings = await this.prisma.bloodPressureLog.findMany({
      where: {
        pregnancyId,
        logDate: { gte: fourteenDaysAgo },
      },
      orderBy: { logDate: 'asc' },
    });

    if (readings.length === 0) {
      return { message: 'No readings in the last 14 days' };
    }

    const systolicValues = readings.map(r => r.systolic);
    const diastolicValues = readings.map(r => r.diastolic);

    const avgSystolic = Math.round(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length);
    const avgDiastolic = Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length);
    const maxSystolic = Math.max(...systolicValues);
    const maxDiastolic = Math.max(...diastolicValues);
    const flaggedCount = readings.filter(r => r.isFlagged).length;

    // Calculate trend
    const firstHalf = readings.slice(0, Math.floor(readings.length / 2));
    const secondHalf = readings.slice(Math.floor(readings.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.systolic, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.systolic, 0) / secondHalf.length;

    const trendDirection = secondHalfAvg > firstHalfAvg + 5 ? 'rising' 
      : secondHalfAvg < firstHalfAvg - 5 ? 'falling' 
      : 'stable';

    return {
      period: { days: 14, startDate: fourteenDaysAgo, endDate: new Date() },
      totalReadings: readings.length,
      averages: { systolic: avgSystolic, diastolic: avgDiastolic },
      maximums: { systolic: maxSystolic, diastolic: maxDiastolic },
      flaggedReadings: flaggedCount,
      trendDirection,
      recentReadings: readings.slice(0, 7),
    };
  }

  async getBPAlerts(userId: string, pregnancyId: string) {
    await this.verifyOwnership(userId, pregnancyId);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const flaggedReadings = await this.prisma.bloodPressureLog.findMany({
      where: {
        pregnancyId,
        isFlagged: true,
        logDate: { gte: sevenDaysAgo },
      },
      orderBy: { logDate: 'desc' },
    });

    const alerts = [];

    if (flaggedReadings.length > 0) {
      alerts.push({
        type: 'bp_above_threshold',
        severity: flaggedReadings.length >= 3 ? 'high' : 'medium',
        message: `${flaggedReadings.length} reading(s) above 140/90 in the last 7 days`,
        readings: flaggedReadings,
      });
    }

    return alerts;
  }

  // ===== BLOOD SUGAR =====

  async logBloodSugar(userId: string, pregnancyId: string, data: {
    readingType: string;
    bloodSugarValue: number;
    mealDescription?: string;
    carbCount?: number;
    insulinDose?: number;
    insulinType?: string;
    notes?: string;
  }) {
    await this.verifyOwnership(userId, pregnancyId);

    // Determine if flagged based on reading type and thresholds
    let isFlagged = false;
    switch (data.readingType) {
      case 'fasting':
        isFlagged = data.bloodSugarValue >= 95;
        break;
      case 'post_breakfast':
      case 'post_lunch':
      case 'post_dinner':
        isFlagged = data.bloodSugarValue >= 140;
        break;
      case 'bedtime':
        isFlagged = data.bloodSugarValue >= 120;
        break;
    }

    return this.prisma.bloodSugarLog.create({
      data: {
        userId,
        pregnancyId,
        logDate: new Date(),
        logTime: new Date().toTimeString().split(' ')[0],
        readingType: data.readingType,
        bloodSugarValue: data.bloodSugarValue,
        mealDescription: data.mealDescription,
        carbCount: data.carbCount,
        insulinDose: data.insulinDose,
        insulinType: data.insulinType,
        notes: data.notes,
        isFlagged,
      },
    });
  }

  async getBloodSugarHistory(userId: string, pregnancyId: string, days: number = 30) {
    await this.verifyOwnership(userId, pregnancyId);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.bloodSugarLog.findMany({
      where: {
        pregnancyId,
        logDate: { gte: startDate },
      },
      orderBy: { logDate: 'desc' },
    });
  }

  async getBloodSugarTrends(userId: string, pregnancyId: string) {
    await this.verifyOwnership(userId, pregnancyId);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const readings = await this.prisma.bloodSugarLog.findMany({
      where: {
        pregnancyId,
        logDate: { gte: fourteenDaysAgo },
      },
      orderBy: { logDate: 'asc' },
    });

    if (readings.length === 0) {
      return { message: 'No readings in the last 14 days' };
    }

    // Group by reading type
    const byType: Record<string, number[]> = {};
    readings.forEach(r => {
      if (!byType[r.readingType]) byType[r.readingType] = [];
      byType[r.readingType].push(Number(r.bloodSugarValue));
    });

    const trends: Record<string, any> = {};
    for (const [type, values] of Object.entries(byType)) {
      const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      const max = Math.max(...values);
      const aboveTarget = type === 'fasting' 
        ? values.filter(v => v >= 95).length
        : values.filter(v => v >= 140).length;

      trends[type] = {
        average: avg,
        max,
        readings: values.length,
        aboveTarget,
        aboveTargetPercent: Math.round((aboveTarget / values.length) * 100),
      };
    }

    return {
      period: { days: 14, startDate: fourteenDaysAgo, endDate: new Date() },
      totalReadings: readings.length,
      trends,
    };
  }

  async getWeeklyLog(userId: string, pregnancyId: string) {
    await this.verifyOwnership(userId, pregnancyId);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const readings = await this.prisma.bloodSugarLog.findMany({
      where: {
        pregnancyId,
        logDate: { gte: sevenDaysAgo },
      },
      orderBy: [{ logDate: 'asc' }, { logTime: 'asc' }],
    });

    // Group by date
    const byDate: Record<string, any[]> = {};
    readings.forEach(r => {
      const dateKey = r.logDate.toISOString().split('T')[0];
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push(r);
    });

    return {
      weekStartDate: sevenDaysAgo,
      weekEndDate: new Date(),
      dailyLogs: byDate,
      totalReadings: readings.length,
    };
  }

  // ===== WEIGHT =====

  async logWeight(userId: string, pregnancyId: string, data: {
    weightLbs?: number;
    weightKg?: number;
    notes?: string;
  }) {
    await this.verifyOwnership(userId, pregnancyId);

    return this.prisma.weightLog.create({
      data: {
        userId,
        pregnancyId,
        logDate: new Date(),
        weightLbs: data.weightLbs,
        weightKg: data.weightKg,
        notes: data.notes,
      },
    });
  }

  async getWeightHistory(userId: string, pregnancyId: string) {
    await this.verifyOwnership(userId, pregnancyId);

    return this.prisma.weightLog.findMany({
      where: { pregnancyId },
      orderBy: { logDate: 'desc' },
    });
  }

  // ===== FETAL MOVEMENT =====

  async logKickSession(userId: string, pregnancyId: string, data: {
    sessionDurationMinutes: number;
    kickCount: number;
    notes?: string;
  }) {
    await this.verifyOwnership(userId, pregnancyId);

    return this.prisma.fetalMovementLog.create({
      data: {
        userId,
        pregnancyId,
        logDate: new Date(),
        logTime: new Date().toTimeString().split(' ')[0],
        sessionDurationMinutes: data.sessionDurationMinutes,
        kickCount: data.kickCount,
        notes: data.notes,
      },
    });
  }

  async getKickHistory(userId: string, pregnancyId: string) {
    await this.verifyOwnership(userId, pregnancyId);

    return this.prisma.fetalMovementLog.findMany({
      where: { pregnancyId },
      orderBy: { logDate: 'desc' },
      take: 30,
    });
  }

  async getKicksToday(userId: string, pregnancyId: string) {
    await this.verifyOwnership(userId, pregnancyId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.fetalMovementLog.findMany({
      where: {
        pregnancyId,
        logDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { createdAt: 'desc' },
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
