import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';

export function PregnancyTimelineScreen({ navigation }: any) {
  const [pregnancy, setPregnancy] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      setPregnancy(pregnancyRes.data);
      
      // Generate milestones
      const week = pregnancyRes.data.pregnancyWeek || 0;
      setMilestones(getMilestones(week));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMilestones = (currentWeek: number) => {
    const allMilestones = [
      { week: 4, title: 'Heart begins beating', icon: '❤️', category: 'baby' },
      { week: 8, title: 'Baby is called a fetus', icon: '👶', category: 'baby' },
      { week: 12, title: 'End of first trimester', icon: '🎉', category: 'milestone' },
      { week: 13, title: 'Second trimester begins', icon: '🌟', category: 'milestone' },
      { week: 16, title: 'Baby can hear sounds', icon: '👂', category: 'baby' },
      { week: 18, title: 'Quickening (first kicks)', icon: '🦶', category: 'baby' },
      { week: 20, title: 'Anatomy scan', icon: '📷', category: 'appointment' },
      { week: 24, title: 'Viability milestone', icon: '🎯', category: 'milestone' },
      { week: 28, title: 'Third trimester begins', icon: '🌟', category: 'milestone' },
      { week: 28, title: 'Start kick counting', icon: '👶', category: 'appointment' },
      { week: 32, title: 'Baby practices breathing', icon: '🫁', category: 'baby' },
      { week: 36, title: 'Baby drops into pelvis', icon: '⬇️', category: 'baby' },
      { week: 37, title: 'Full term', icon: '🎉', category: 'milestone' },
      { week: 39, title: 'Baby is full term', icon: '✅', category: 'milestone' },
      { week: 40, title: 'Due date', icon: '🎂', category: 'milestone' },
    ];

    return allMilestones.map((m) => ({
      ...m,
      isPast: currentWeek >= m.week,
      isCurrent: currentWeek >= m.week && currentWeek < m.week + 1,
    }));
  };

  const currentWeek = pregnancy?.pregnancyWeek || 0;
  const weeksRemaining = pregnancy?.daysRemaining ? Math.ceil(pregnancy.daysRemaining / 7) : 40 - currentWeek;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pregnancy Timeline</Text>
        <Text style={styles.subtitle}>Your journey week by week</Text>
      </View>

      {/* Progress */}
      <Card variant="primary">
        <View style={styles.progressCard}>
          <Text style={styles.progressWeek}>Week {currentWeek}</Text>
          <Text style={styles.progressTrimester}>
            {currentWeek <= 12 ? 'First Trimester' : 
             currentWeek <= 27 ? 'Second Trimester' : 
             'Third Trimester'}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentWeek / 40) * 100}%` }]} />
          </View>
          <Text style={styles.progressRemaining}>{weeksRemaining} weeks to go</Text>
        </View>
      </Card>

      {/* Baby Size */}
      <Card>
        <View style={styles.sizeCard}>
          <Text style={styles.sizeIcon}>
            {currentWeek <= 8 ? '🫐' :
             currentWeek <= 12 ? '🍋' :
             currentWeek <= 16 ? '🥑' :
             currentWeek <= 20 ? '🍌' :
             currentWeek <= 24 ? '🌽' :
             currentWeek <= 28 ? '🍆' :
             currentWeek <= 32 ? '🎃' :
             currentWeek <= 36 ? '🍈' :
             '🍉'}
          </Text>
          <View style={styles.sizeInfo}>
            <Text style={styles.sizeTitle}>Baby is about the size of a</Text>
            <Text style={styles.sizeFruit}>
              {currentWeek <= 8 ? 'Poppy Seed' :
               currentWeek <= 12 ? 'Lime' :
               currentWeek <= 16 ? 'Avocado' :
               currentWeek <= 20 ? 'Banana' :
               currentWeek <= 24 ? 'Ear of Corn' :
               currentWeek <= 28 ? 'Eggplant' :
               currentWeek <= 32 ? 'Pumpkin' :
               currentWeek <= 36 ? 'Honeydew' :
               'Watermelon'}
            </Text>
            <Text style={styles.sizeWeeks}>at {currentWeek} weeks</Text>
          </View>
        </View>
      </Card>

      {/* Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Milestones</Text>
        
        {milestones.map((milestone, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineLine}>
              <View style={[
                styles.timelineDot,
                milestone.isPast && styles.timelineDotPast,
                milestone.isCurrent && styles.timelineDotCurrent,
              ]} />
              {index < milestones.length - 1 && (
                <View style={[
                  styles.timelineConnector,
                  milestone.isPast && styles.timelineConnectorPast,
                ]} />
              )}
            </View>
            <View style={[
              styles.timelineContent,
              milestone.isPast && styles.timelineContentPast,
            ]}>
              <View style={styles.timelineHeader}>
                <Text style={styles.timelineWeek}>Week {milestone.week}</Text>
                <Text style={styles.timelineIcon}>{milestone.icon}</Text>
              </View>
              <Text style={[
                styles.timelineTitle,
                milestone.isPast && styles.timelineTitlePast,
              ]}>
                {milestone.title}
              </Text>
              {milestone.isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Tips */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Week {currentWeek} Tips</Text>
        <Text style={styles.tipsText}>
          {currentWeek <= 12 ? 
            '• Rest when you need to\n• Start prenatal vitamins if you haven\'t\n• Stay hydrated\n• Schedule your first prenatal visit' :
           currentWeek <= 27 ?
            '• Start planning the nursery\n• Consider prenatal classes\n• Continue regular exercise\n• Monitor your weight gain' :
            '• Finalize your birth plan\n• Pack your hospital bag\n• Practice kick counting daily\n• Rest as much as possible'}
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1917',
  },
  subtitle: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 4,
  },
  progressCard: {
    alignItems: 'center',
    padding: 16,
  },
  progressWeek: {
    fontSize: 36,
    fontWeight: '800',
    color: '#DB2777',
  },
  progressTrimester: {
    fontSize: 14,
    color: '#9D174D',
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(219, 39, 119, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#DB2777',
    borderRadius: 5,
  },
  progressRemaining: {
    fontSize: 14,
    color: '#78716C',
  },
  sizeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  sizeIcon: {
    fontSize: 48,
  },
  sizeInfo: {
    flex: 1,
  },
  sizeTitle: {
    fontSize: 13,
    color: '#78716C',
  },
  sizeFruit: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1917',
    marginVertical: 4,
  },
  sizeWeeks: {
    fontSize: 13,
    color: '#78716C',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLine: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F5E6D3',
    borderWidth: 2,
    borderColor: '#E7E5E4',
  },
  timelineDotPast: {
    backgroundColor: '#DB2777',
    borderColor: '#DB2777',
  },
  timelineDotCurrent: {
    backgroundColor: '#DB2777',
    borderColor: '#DB2777',
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: '#F5E6D3',
    minHeight: 40,
  },
  timelineConnectorPast: {
    backgroundColor: '#DB2777',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
    paddingLeft: 12,
  },
  timelineContentPast: {
    opacity: 0.7,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineWeek: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716C',
  },
  timelineIcon: {
    fontSize: 20,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1917',
  },
  timelineTitlePast: {
    color: '#78716C',
  },
  currentBadge: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DB2777',
  },
  tipsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#78716C',
    lineHeight: 20,
  },
});
