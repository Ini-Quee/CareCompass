import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function VitalsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'bp' | 'sugar' | 'weight' | 'kicks'>('bp');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bpHistory, setBpHistory] = useState<any[]>([]);
  const [bpTrends, setBpTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBPData();
  }, []);

  const loadBPData = async () => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;

      const [historyRes, trendsRes] = await Promise.all([
        api.getBPHistory(pregnancyId, 7),
        api.getBPTrends(pregnancyId),
      ]);

      setBpHistory(historyRes.data);
      setBpTrends(trendsRes.data);
    } catch (error) {
      console.error('Error loading BP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogBP = async () => {
    if (!systolic || !diastolic) {
      Alert.alert('Error', 'Please enter both systolic and diastolic values');
      return;
    }

    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;

      await api.logBP(pregnancyId, {
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        heartRate: heartRate ? parseInt(heartRate) : undefined,
      });

      Alert.alert('Logged', 'Blood pressure reading saved');
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
      loadBPData();
    } catch (error) {
      Alert.alert('Error', 'Failed to log blood pressure');
    }
  };

  const tabs = [
    { key: 'bp', label: 'Blood Pressure', icon: '💉' },
    { key: 'sugar', label: 'Blood Sugar', icon: '🍎' },
    { key: 'weight', label: 'Weight', icon: '⚖️' },
    { key: 'kicks', label: 'Kick Counter', icon: '👶' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vitals Tracking</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Blood Pressure Tab */}
      {activeTab === 'bp' && (
        <>
          {/* Current Reading */}
          <Card variant="primary">
            <View style={styles.bpCurrent}>
              <Text style={styles.bpValue}>
                {bpHistory[0]?.systolic || '--'}/{bpHistory[0]?.diastolic || '--'}
              </Text>
              <Text style={styles.bpUnit}>mmHg</Text>
              {bpHistory[0]?.isFlagged ? (
                <View style={styles.bpBadgeWarning}>
                  <Text style={styles.bpBadgeText}>Above range</Text>
                </View>
              ) : (
                <View style={styles.bpBadgeNormal}>
                  <Text style={styles.bpBadgeText}>In range</Text>
                </View>
              )}
            </View>
          </Card>

          {/* Trend Alert */}
          {bpTrends?.trendDirection === 'rising' && (
            <Card variant="warning">
              <View style={styles.alertCard}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Trend Alert</Text>
                  <Text style={styles.alertText}>
                    BP has been rising over the last 14 days. Consider resting and rechecking.
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Log New Reading */}
          <Card>
            <Text style={styles.cardTitle}>Log New Reading</Text>
            <View style={styles.bpInputRow}>
              <View style={styles.bpInputGroup}>
                <Text style={styles.bpInputLabel}>Systolic</Text>
                <TextInput
                  style={styles.bpInput}
                  value={systolic}
                  onChangeText={setSystolic}
                  placeholder="120"
                  placeholderTextColor="#A8A29E"
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.bpSeparator}>/</Text>
              <View style={styles.bpInputGroup}>
                <Text style={styles.bpInputLabel}>Diastolic</Text>
                <TextInput
                  style={styles.bpInput}
                  value={diastolic}
                  onChangeText={setDiastolic}
                  placeholder="80"
                  placeholderTextColor="#A8A29E"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.bpInputGroup}>
                <Text style={styles.bpInputLabel}>Heart Rate</Text>
                <TextInput
                  style={styles.bpInput}
                  value={heartRate}
                  onChangeText={setHeartRate}
                  placeholder="72"
                  placeholderTextColor="#A8A29E"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <Button title="Log Reading" onPress={handleLogBP} />
          </Card>

          {/* Recent Readings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Readings</Text>
            {bpHistory.slice(0, 5).map((reading, index) => (
              <View key={index} style={styles.readingRow}>
                <View>
                  <Text style={styles.readingValue}>
                    {reading.systolic}/{reading.diastolic}
                  </Text>
                  <Text style={styles.readingDate}>
                    {new Date(reading.logDate).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.readingBadge,
                    reading.isFlagged ? styles.readingBadgeWarning : styles.readingBadgeNormal,
                  ]}
                >
                  <Text style={styles.readingBadgeText}>
                    {reading.isFlagged ? 'Above' : 'Normal'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Placeholder for other tabs */}
      {activeTab !== 'bp' && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderIcon}>
            {tabs.find(t => t.key === activeTab)?.icon}
          </Text>
          <Text style={styles.placeholderTitle}>
            {tabs.find(t => t.key === activeTab)?.label}
          </Text>
          <Text style={styles.placeholderText}>
            This feature is coming soon
          </Text>
        </View>
      )}
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
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F5E6D3',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#FCE7F3',
    borderColor: '#DB2777',
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78716C',
  },
  tabLabelActive: {
    color: '#DB2777',
  },
  bpCurrent: {
    alignItems: 'center',
    padding: 16,
  },
  bpValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#DB2777',
  },
  bpUnit: {
    fontSize: 14,
    color: '#78716C',
    marginTop: 4,
  },
  bpBadgeNormal: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  bpBadgeWarning: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  bpBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertCard: {
    flexDirection: 'row',
    gap: 12,
  },
  alertIcon: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 12,
  },
  bpInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  bpInputGroup: {
    flex: 1,
  },
  bpInputLabel: {
    fontSize: 12,
    color: '#78716C',
    marginBottom: 4,
  },
  bpInput: {
    backgroundColor: '#FDF2F8',
    borderWidth: 1.5,
    borderColor: '#F5E6D3',
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1C1917',
  },
  bpSeparator: {
    fontSize: 24,
    color: '#78716C',
    marginTop: 16,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 12,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  readingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
  },
  readingDate: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
  readingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  readingBadgeNormal: {
    backgroundColor: '#D1FAE5',
  },
  readingBadgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  readingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 40,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#78716C',
  },
});
