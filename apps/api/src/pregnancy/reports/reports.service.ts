import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CorrelationEngineService } from '../correlation/correlation-engine.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private correlationEngine: CorrelationEngineService,
  ) {}

  async generateProviderReport(userId: string, pregnancyId: string, options: {
    dateRangeStart?: string;
    dateRangeEnd?: string;
    sections?: string[];
  }) {
    const pregnancy = await this.prisma.pregnancyProfile.findFirst({
      where: { id: pregnancyId, userId },
    });

    if (!pregnancy) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    const startDate = options.dateRangeStart 
      ? new Date(options.dateRangeStart) 
      : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const endDate = options.dateRangeEnd 
      ? new Date(options.dateRangeEnd) 
      : new Date();

    const sections = options.sections || [
      'medications',
      'symptoms',
      'bp',
      'blood_sugar',
      'weight',
      'concerns',
      'questions',
    ];

    const reportData: any = {
      patientInfo: {
        name: `${pregnancy.userId}`, // Would need to join user table
        pregnancyWeek: this.calculatePregnancyWeek(pregnancy.dueDate),
        dueDate: pregnancy.dueDate,
        isHighRisk: pregnancy.isHighRisk,
        highRiskConditions: pregnancy.highRiskConditions,
      },
      generatedAt: new Date(),
      dateRange: { start: startDate, end: endDate },
      sections: {},
    };

    // Generate each requested section
    for (const section of sections) {
      switch (section) {
        case 'medications':
          reportData.sections.medications = await this.generateMedicationsSection(pregnancyId);
          break;
        case 'symptoms':
          reportData.sections.symptoms = await this.generateSymptomsSection(pregnancyId, startDate, endDate);
          break;
        case 'bp':
          reportData.sections.bloodPressure = await this.generateBPSection(pregnancyId, startDate, endDate);
          break;
        case 'blood_sugar':
          reportData.sections.bloodSugar = await this.generateBloodSugarSection(pregnancyId, startDate, endDate);
          break;
        case 'weight':
          reportData.sections.weight = await this.generateWeightSection(pregnancyId, startDate, endDate);
          break;
        case 'concerns':
          reportData.sections.concerns = await this.generateConcernsSection(pregnancyId);
          break;
        case 'questions':
          reportData.sections.questions = await this.generateQuestionsSection(userId, pregnancyId);
          break;
      }
    }

    // Add correlations
    reportData.correlations = await this.correlationEngine.analyzeCorrelations(userId, pregnancyId);

    // Save report
    const report = await this.prisma.providerReport.create({
      data: {
        userId,
        pregnancyId,
        reportDate: new Date(),
        dateRangeStart: startDate,
        dateRangeEnd: endDate,
        sectionsIncluded: sections,
        reportData,
      },
    });

    return report;
  }

  async getReports(userId: string, pregnancyId: string) {
    return this.prisma.providerReport.findMany({
      where: { pregnancyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReport(userId: string, pregnancyId: string, reportId: string) {
    const report = await this.prisma.providerReport.findFirst({
      where: {
        id: reportId,
        pregnancyId,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  private async generateMedicationsSection(pregnancyId: string) {
    const medications = await this.prisma.pregnancyMedication.findMany({
      where: { pregnancyId, isActive: true },
    });

    return medications.map(med => ({
      name: med.name,
      dosage: `${med.dosage} ${med.dosageUnit || ''}`.trim(),
      frequency: med.frequency,
      purpose: med.purpose,
      startDate: med.startDate,
      foodRequirement: med.foodRequirement,
    }));
  }

  private async generateSymptomsSection(pregnancyId: string, startDate: Date, endDate: Date) {
    const entries = await this.prisma.pregnancySymptomEntry.findMany({
      where: {
        pregnancyId,
        entryDate: { gte: startDate, lte: endDate },
      },
      orderBy: { entryDate: 'asc' },
    });

    const symptomSummary: Record<string, any> = {};
    const symptomFields = [
      { field: 'headacheSeverity', name: 'Headache' },
      { field: 'nauseaSeverity', name: 'Nausea' },
      { field: 'dizzinessSeverity', name: 'Dizziness' },
      { field: 'fatigueSeverity', name: 'Fatigue' },
      { field: 'swellingSeverity', name: 'Swelling' },
    ];

    for (const { field, name } of symptomFields) {
      const values = entries.filter(e => e[field] !== null && e[field] !== undefined);
      if (values.length === 0) continue;

      const severities = values.map(e => e[field]);
      const avg = severities.reduce((a, b) => a + b, 0) / severities.length;
      const max = Math.max(...severities);

      symptomSummary[name] = {
        frequency: `${values.length}/${entries.length} days`,
        averageSeverity: Math.round(avg * 10) / 10,
        maxSeverity: max,
        trend: 'stable', // Would need historical comparison
      };
    }

    return {
      totalEntries: entries.length,
      period: { start: startDate, end: endDate },
      summary: symptomSummary,
      doctorNotes: entries.filter(e => e.notesForDoctor).map(e => ({
        date: e.entryDate,
        note: e.notesForDoctor,
      })),
    };
  }

  private async generateBPSection(pregnancyId: string, startDate: Date, endDate: Date) {
    const readings = await this.prisma.bloodPressureLog.findMany({
      where: {
        pregnancyId,
        logDate: { gte: startDate, lte: endDate },
      },
      orderBy: { logDate: 'asc' },
    });

    if (readings.length === 0) {
      return { message: 'No BP readings in this period' };
    }

    const systolicValues = readings.map(r => r.systolic);
    const diastolicValues = readings.map(r => r.diastolic);

    return {
      totalReadings: readings.length,
      averages: {
        systolic: Math.round(systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length),
        diastolic: Math.round(diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length),
      },
      maximums: {
        systolic: Math.max(...systolicValues),
        diastolic: Math.max(...diastolicValues),
      },
      flaggedReadings: readings.filter(r => r.isFlagged).length,
      readings: readings.map(r => ({
        date: r.logDate,
        time: r.logTime,
        systolic: r.systolic,
        diastolic: r.diastolic,
        isFlagged: r.isFlagged,
      })),
    };
  }

  private async generateBloodSugarSection(pregnancyId: string, startDate: Date, endDate: Date) {
    const readings = await this.prisma.bloodSugarLog.findMany({
      where: {
        pregnancyId,
        logDate: { gte: startDate, lte: endDate },
      },
      orderBy: [{ logDate: 'asc' }, { logTime: 'asc' }],
    });

    if (readings.length === 0) {
      return { message: 'No blood sugar readings in this period' };
    }

    // Group by reading type
    const byType: Record<string, number[]> = {};
    readings.forEach(r => {
      if (!byType[r.readingType]) byType[r.readingType] = [];
      byType[r.readingType].push(Number(r.bloodSugarValue));
    });

    const summary: Record<string, any> = {};
    for (const [type, values] of Object.entries(byType)) {
      summary[type] = {
        average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        max: Math.max(...values),
        readings: values.length,
      };
    }

    return {
      totalReadings: readings.length,
      summary,
      readings: readings.map(r => ({
        date: r.logDate,
        time: r.logTime,
        type: r.readingType,
        value: r.bloodSugarValue,
        meal: r.mealDescription,
        isFlagged: r.isFlagged,
      })),
    };
  }

  private async generateWeightSection(pregnancyId: string, startDate: Date, endDate: Date) {
    const readings = await this.prisma.weightLog.findMany({
      where: {
        pregnancyId,
        logDate: { gte: startDate, lte: endDate },
      },
      orderBy: { logDate: 'asc' },
    });

    if (readings.length === 0) {
      return { message: 'No weight readings in this period' };
    }

    const weights = readings.map(r => Number(r.weightLbs || r.weightKg));
    const weightChange = weights[weights.length - 1] - weights[0];

    return {
      totalReadings: readings.length,
      currentWeight: weights[weights.length - 1],
      weightChange: Math.round(weightChange * 10) / 10,
      unit: readings[0].weightLbs ? 'lbs' : 'kg',
      readings: readings.map(r => ({
        date: r.logDate,
        weight: r.weightLbs || r.weightKg,
      })),
    };
  }

  private async generateConcernsSection(pregnancyId: string) {
    const concerns = await this.prisma.pregnancyConcern.findMany({
      where: {
        pregnancyId,
        addressed: false,
      },
      orderBy: { dateRaised: 'desc' },
    });

    return concerns.map(c => ({
      concern: c.concernText,
      severity: c.severity,
      dateRaised: c.dateRaised,
    }));
  }

  private async generateQuestionsSection(userId: string, pregnancyId: string) {
    // Generate questions based on recent symptoms and concerns
    const concerns = await this.prisma.pregnancyConcern.findMany({
      where: { pregnancyId, addressed: false },
    });

    const recentSymptoms = await this.prisma.pregnancySymptomEntry.findMany({
      where: { pregnancyId },
      orderBy: { entryDate: 'desc' },
      take: 14,
    });

    const questions: string[] = [];

    // Add questions from concerns
    concerns.forEach(c => {
      questions.push(c.concernText);
    });

    // Generate questions from symptom patterns
    const headaches = recentSymptoms.filter(s => s.headacheSeverity && s.headacheSeverity > 5);
    if (headaches.length >= 3) {
      questions.push(`I've had ${headaches.length} headaches in the last 2 weeks with severity above 5/10. Should we be concerned?`);
    }

    const dizziness = recentSymptoms.filter(s => s.dizzinessSeverity && s.dizzinessSeverity > 3);
    if (dizziness.length >= 2) {
      questions.push(`I've been experiencing dizziness (${dizziness.length} episodes). Could this be related to my medication?`);
    }

    return questions;
  }

  private calculatePregnancyWeek(dueDate: Date | null): number | null {
    if (!dueDate) return null;

    const today = new Date();
    const lmpDate = new Date(dueDate.getTime() - 280 * 24 * 60 * 60 * 1000);
    const daysSinceLMP = Math.floor((today.getTime() - lmpDate.getTime()) / (24 * 60 * 60 * 1000));
    return Math.floor(daysSinceLMP / 7);
  }
}
