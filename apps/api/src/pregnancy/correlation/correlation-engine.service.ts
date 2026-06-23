import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface CorrelationResult {
  type: 'trend_increase' | 'trend_decrease' | 'medication_correlation' | 'vital_correlation';
  symptom: string;
  description: string;
  confidence: 'low' | 'medium' | 'high';
  dataPoints: number;
  suggestion?: string;
}

@Injectable()
export class CorrelationEngineService {
  constructor(private prisma: PrismaService) {}

  async analyzeCorrelations(userId: string, pregnancyId: string): Promise<CorrelationResult[]> {
    const results: CorrelationResult[] = [];

    // Get data for analysis
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

    const [currentSymptoms, previousSymptoms, bpReadings, medicationChanges] = await Promise.all([
      this.prisma.pregnancySymptomEntry.findMany({
        where: { pregnancyId, entryDate: { gte: fourteenDaysAgo } },
        orderBy: { entryDate: 'asc' },
      }),
      this.prisma.pregnancySymptomEntry.findMany({
        where: {
          pregnancyId,
          entryDate: { gte: twentyEightDaysAgo, lt: fourteenDaysAgo },
        },
        orderBy: { entryDate: 'asc' },
      }),
      this.prisma.bloodPressureLog.findMany({
        where: { pregnancyId, logDate: { gte: fourteenDaysAgo } },
        orderBy: { logDate: 'asc' },
      }),
      this.prisma.pregnancyMedicationLog.findMany({
        where: {
          pregnancyId,
          status: 'side_effect_reported',
          createdAt: { gte: fourteenDaysAgo },
        },
      }),
    ]);

    // Analyze symptom frequency trends
    const symptomFields = [
      { field: 'headacheSeverity', name: 'Headache' },
      { field: 'nauseaSeverity', name: 'Nausea' },
      { field: 'dizzinessSeverity', name: 'Dizziness' },
      { field: 'fatigueSeverity', name: 'Fatigue' },
      { field: 'swellingSeverity', name: 'Swelling' },
    ];

    for (const { field, name } of symptomFields) {
      const currentCount = currentSymptoms.filter(s => s[field] !== null && s[field] > 0).length;
      const previousCount = previousSymptoms.filter(s => s[field] !== null && s[field] > 0).length;

      if (previousCount > 0) {
        const changePercent = ((currentCount - previousCount) / previousCount) * 100;

        if (Math.abs(changePercent) > 20) {
          results.push({
            type: changePercent > 0 ? 'trend_increase' : 'trend_decrease',
            symptom: name,
            description: `${name} ${changePercent > 0 ? 'increased' : 'decreased'} ${Math.abs(Math.round(changePercent))}% in the last 14 days (${currentCount} vs ${previousCount} occurrences)`,
            confidence: Math.abs(changePercent) > 40 ? 'high' : Math.abs(changePercent) > 25 ? 'medium' : 'low',
            dataPoints: currentCount + previousCount,
            suggestion: changePercent > 30
              ? `Consider mentioning this trend at your next appointment`
              : undefined,
          });
        }
      }
    }

    // Analyze BP correlation with headaches
    const headacheDays = currentSymptoms
      .filter(s => s.headacheSeverity && s.headacheSeverity > 5)
      .map(s => s.entryDate.toISOString().split('T')[0]);

    if (headacheDays.length > 0 && bpReadings.length > 0) {
      const highBPDays = bpReadings
        .filter(bp => bp.systolic >= 135 || bp.diastolic >= 85)
        .map(bp => bp.logDate.toISOString().split('T')[0]);

      const coOccurrences = headacheDays.filter(d => highBPDays.includes(d));

      if (coOccurrences.length >= 2 && coOccurrences.length / headacheDays.length > 0.5) {
        results.push({
          type: 'vital_correlation',
          symptom: 'Headache',
          description: `${coOccurrences.length} of ${headacheDays.length} headache episodes coincided with elevated BP readings (≥135/85)`,
          confidence: coOccurrences.length / headacheDays.length > 0.7 ? 'high' : 'medium',
          dataPoints: headacheDays.length,
          suggestion: 'This pattern may indicate a connection worth discussing with your provider',
        });
      }
    }

    return results;
  }
}
