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

export function BloodSugarScreen({ navigation }: any) {
  const [readingType, setReadingType] = useState('fasting');
  const [bloodSugar, setBloodSugar] = useState('');
  const [mealDesc, setMealDesc] = useState('');
  const [carbs, setCarbs] = useState('');
  const [insulin, setInsulin] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const readingTypes = [
    { key: 'fasting', label: 'Fasting', target: '<95', icon: '🌅' },
    { key: 'post_breakfast', label: 'Post-Breakfast', target: '<140', icon: '🥣' },
    { key: 'post_lunch', label: 'Post-Lunch', target: '<140', icon: '🥗' },
    { key: 'post_dinner', label: 'Post-Dinner', target: '<140', icon: '🍽️' },
    { key: 'bedtime', label: 'Bedtime', target: '<120', icon: '🌙' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;

      const [historyRes, trendsRes] = await Promise.all([
        api.getBloodSugarHistory(pregnancyId, 7),
        api.getBloodSugarTrends(pregnancyId),
      ]);

      setHistory(historyRes.data);
      setTrends(trendsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogReading = async () => {
    if (!bloodSugar) {
      Alert.alert('Error', 'Please enter your blood sugar reading');
      return;
    }

    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;

      await api.logBloodSugar(pregnancyId, {
        readingType,
        bloodSugarValue: parseFloat(bloodSugar),
        mealDescription: mealDesc,
        carbCount: carbs ? parseInt(carbs) : undefined,
        insulinDose: insulin ? parseFloat(insulin) : undefined,
      });

      Alert.alert('Logged', 'Blood sugar reading saved');
      setBloodSugar('');
      setMealDesc('');
      setCarbs('');
      setInsulin('');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to log reading');
    }
  };

  const getTargetForType = (type: string) => {
    const target = readingTypes.find((t) => t.key === type);
    return target?.target || '';
  };

  const isAboveTarget = (value: number, type: string) => {
    if (type === 'fasting') return value >= 95;
    if (type === 'bedtime') return value >= 120;
    return value >= 140;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Blood Sugar</Text>
        <Text style={styles.subtitle}>Gestational Diabetes Management</Text>
      </View>

      {/* Trend Alert */}
      {trends?.trends?.fasting?.aboveTarget > 3 && (
        <Card variant="warning">
          <View style={styles.alertCard}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Pattern Alert</Text>
              <Text style={styles.alertText}>
                Fasting glucose above target for {trends.trends.fasting.aboveTarget} of {trends.trends.fasting.readings} days.
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Reading Type Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reading Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {readingTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.typeButton,
                readingType === type.key && styles.typeButtonActive,
              ]}
              onPress={() => setReadingType(type.key)}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={[
                styles.typeLabel,
                readingType === type.key && styles.typeLabelActive,
              ]}>
                {type.label}
              </Text>
              <Text style={styles.typeTarget}>Target: {type.target}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Log Reading */}
      <Card>
        <Text style={styles.cardTitle}>Log Reading</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Blood Sugar (mg/dL)</Text>
            <TextInput
              style={styles.input}
              value={bloodSugar}
              onChangeText={setBloodSugar}
              placeholder="120"
              placeholderTextColor="#A8A29E"
              keyboardType="numeric"
            />
          </View>
          {readingType.startsWith('post_') && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Carbs (g)</Text>
              <TextInput
                style={styles.input}
                value={carbs}
                onChangeText={setCarbs}
                placeholder="45"
                placeholderTextColor="#A8A29E"
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        {readingType.startsWith('post_') && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>What did you eat?</Text>
            <TextInput
              style={styles.input}
              value={mealDesc}
              onChangeText={setMealDesc}
              placeholder="Oatmeal with berries, coffee..."
              placeholderTextColor="#A8A29E"
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Insulin Dose (units, if applicable)</Text>
          <TextInput
            style={styles.input}
            value={insulin}
            onChangeText={setInsulin}
            placeholder="12"
            placeholderTextColor="#A8A29E"
            keyboardType="numeric"
          />
        </View>

        <Button title="Log Reading" onPress={handleLogReading} />
      </Card>

      {/* Today's Readings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Readings</Text>
        
        {history.filter((r) => {
          const today = new Date().toISOString().split('T')[0];
          return new Date(r.logDate).toISOString().split('T')[0] === today;
        }).length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No readings today yet</Text>
          </Card>
        ) : (
          history
            .filter((r) => {
              const today = new Date().toISOString().split('T')[0];
              return new Date(r.logDate).toISOString().split('T')[0] === today;
            })
            .map((reading, index) => (
              <Card key={index}>
                <View style={styles.readingRow}>
                  <View>
                    <Text style={styles.readingType}>{reading.readingType.replace('_', ' ')}</Text>
                    <Text style={styles.readingTime}>{reading.logTime}</Text>
                  </View>
                  <View style={styles.readingValueContainer}>
                    <Text style={[
                      styles.readingValue,
                      isAboveTarget(Number(reading.bloodSugarValue), reading.readingType) && styles.readingValueHigh,
                    ]}>
                      {Number(reading.bloodSugarValue)}
                    </Text>
                    <Text style={styles.readingUnit}>mg/dL</Text>
                  </View>
                  <View style={[
                    styles.readingBadge,
                    isAboveTarget(Number(reading.bloodSugarValue), reading.readingType) ? styles.readingBadgeWarning : styles.readingBadgeNormal,
                  ]}>
                    <Text style={styles.readingBadgeText}>
                      {isAboveTarget(Number(reading.bloodSugarValue), reading.readingType) ? 'Above' : 'In range'}
                    </Text>
                  </View>
                </View>
                {reading.mealDescription && (
                  <Text style={styles.readingMeal}>🍽️ {reading.mealDescription}</Text>
                )}
              </Card>
            ))
        )}
      </View>

      {/* Weekly Summary */}
      {trends?.trends && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Summary</Text>
          
          {Object.entries(trends.trends).map(([type, data]: [string, any]) => (
            <Card key={type}>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryType}>{type.replace('_', ' ')}</Text>
                  <Text style={styles.summaryReadings}>{data.readings} readings</Text>
                </View>
                <View style={styles.summaryValues}>
                  <Text style={styles.summaryAvg}>Avg: {data.average}</Text>
                  <Text style={styles.summaryMax}>Max: {data.max}</Text>
                </View>
                {data.aboveTarget > 0 && (
                  <View style={styles.summaryAlert}>
                    <Text style={styles.summaryAlertText}>{data.aboveTarget} above</Text>
                  </View>
                )}
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Export Button */}
      <View style={styles.exportContainer}>
        <Button
          title="📋 Weekly Log for Endocrinologist"
          onPress={() => {
            // TODO: Generate weekly log report
            Alert.alert('Coming Soon', 'This feature will generate a weekly log for your doctor.');
          }}
          variant="secondary"
        />
      </View>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 12,
  },
  typeButton: {
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F5E6D3',
    marginRight: 10,
    minWidth: 100,
  },
  typeButtonActive: {
    borderColor: '#DB2777',
    backgroundColor: '#FDF2F8',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716C',
  },
  typeLabelActive: {
    color: '#DB2777',
  },
  typeTarget: {
    fontSize: 10,
    color: '#A8A29E',
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716C',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FDF2F8',
    borderWidth: 1.5,
    borderColor: '#F5E6D3',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1C1917',
  },
  emptyText: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    padding: 16,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readingType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
    textTransform: 'capitalize',
  },
  readingTime: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
  readingValueContainer: {
    alignItems: 'center',
  },
  readingValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1917',
  },
  readingValueHigh: {
    color: '#F97316',
  },
  readingUnit: {
    fontSize: 11,
    color: '#78716C',
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
    fontSize: 11,
    fontWeight: '600',
  },
  readingMeal: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F5E6D3',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
    textTransform: 'capitalize',
  },
  summaryReadings: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
  summaryValues: {
    alignItems: 'flex-end',
  },
  summaryAvg: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
  },
  summaryMax: {
    fontSize: 12,
    color: '#78716C',
  },
  summaryAlert: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  summaryAlertText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  exportContainer: {
    padding: 20,
  },
});
