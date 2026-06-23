import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [pregnancy, setPregnancy] = useState<any>(null);
  const [todaySymptoms, setTodaySymptoms] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pregnancyRes, symptomsRes, medsRes] = await Promise.all([
        api.getCurrentPregnancy(),
        api.getCurrentPregnancy().then((res) => 
          api.getTodaySymptoms(res.data.id)
        ),
        api.getCurrentPregnancy().then((res) => 
          api.getMedications(res.data.id)
        ),
      ]);

      setPregnancy(pregnancyRes.data);
      setTodaySymptoms(symptomsRes.data);
      setMedications(medsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!pregnancy) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🤰</Text>
        <Text style={styles.emptyTitle}>Welcome to CareCompass</Text>
        <Text style={styles.emptySubtitle}>
          Set up your pregnancy profile to get started
        </Text>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('Onboarding')}
          size="large"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.name}>{user?.firstName} 👋</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Pregnancy Week Badge */}
      <View style={styles.weekBadge}>
        <Text style={styles.weekText}>
          🤰 Week {pregnancy.pregnancyWeek} · {pregnancy.trimester === 1 ? 'First' : pregnancy.trimester === 2 ? 'Second' : 'Third'} Trimester
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>92%</Text>
          <Text style={styles.statLabel}>Med adherence</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{pregnancy.daysRemaining}</Text>
          <Text style={styles.statLabel}>Days to go</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{medications.length}</Text>
          <Text style={styles.statLabel}>Active meds</Text>
        </Card>
      </View>

      {/* Today's Medications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Medications</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Medications')}>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>

        {medications.slice(0, 3).map((med: any) => (
          <Card key={med.id}>
            <View style={styles.medCard}>
              <View style={styles.medIcon}>
                <Text>💊</Text>
              </View>
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDose}>
                  {med.dosage} {med.dosageUnit} · {med.frequency}
                </Text>
              </View>
              <View style={styles.medStatus}>
                <Text style={styles.medTime}>8:00 AM</Text>
                <View style={styles.statusDot} />
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Journal')}
          >
            <Text style={styles.quickActionIcon}>📝</Text>
            <Text style={styles.quickActionText}>Log{'\n'}Symptoms</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Vitals')}
          >
            <Text style={styles.quickActionIcon}>💉</Text>
            <Text style={styles.quickActionText}>Record{'\n'}BP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Vitals')}
          >
            <Text style={styles.quickActionIcon}>🍎</Text>
            <Text style={styles.quickActionText}>Blood{'\n'}Sugar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Reports')}
          >
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>Doctor{'\n'}Note</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* How are you feeling? */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <View style={styles.moodContainer}>
          {['😊 Good', '🙂 Okay', '😐 Meh', '😔 Low', '😣 Rough'].map((mood) => (
            <TouchableOpacity key={mood} style={styles.moodButton}>
              <Text style={styles.moodText}>{mood}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
  },
  loadingText: {
    fontSize: 16,
    color: '#78716C',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#78716C',
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 14,
    color: '#78716C',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1917',
  },
  settingsIcon: {
    fontSize: 24,
  },
  weekBadge: {
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  weekText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9D174D',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#DB2777',
  },
  statLabel: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1917',
  },
  sectionLink: {
    fontSize: 14,
    color: '#DB2777',
    fontWeight: '600',
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  medIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1917',
  },
  medDose: {
    fontSize: 13,
    color: '#78716C',
  },
  medStatus: {
    alignItems: 'flex-end',
  },
  medTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DB2777',
  },
  statusDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5E6D3',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#78716C',
    textAlign: 'center',
  },
  moodContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  moodButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5E6D3',
  },
  moodText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C1917',
  },
});
