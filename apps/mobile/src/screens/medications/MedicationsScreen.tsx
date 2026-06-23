import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function MedicationsScreen({ navigation }: any) {
  const [medications, setMedications] = useState<any[]>([]);
  const [adherence, setAdherence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;

      const [medsRes, adherenceRes] = await Promise.all([
        api.getMedications(pregnancyId),
        api.getMedicationAdherence(pregnancyId),
      ]);

      setMedications(medsRes.data);
      setAdherence(adherenceRes.data);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogDose = async (medicationId: string, status: string) => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;

      await api.logMedicationDose(pregnancyId, medicationId, {
        status,
        actualTime: new Date().toISOString(),
      });

      Alert.alert('Logged', `Medication marked as ${status}`);
      loadMedications();
    } catch (error) {
      Alert.alert('Error', 'Failed to log medication');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medications</Text>
        <Text style={styles.subtitle}>{medications.length} active medications</Text>
      </View>

      {/* Adherence Summary */}
      {adherence.length > 0 && (
        <Card variant="success">
          <View style={styles.adherenceHeader}>
            <Text style={styles.adherenceIcon}>✅</Text>
            <View>
              <Text style={styles.adherenceTitle}>This Week's Adherence</Text>
              <Text style={styles.adherenceSubtitle}>
                {adherence[0]?.adherencePercent || 0}% average
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Medication List */}
      {medications.map((med) => (
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
              {med.foodRequirement && (
                <Text style={styles.medFood}>🍽️ {med.foodRequirement}</Text>
              )}
              {med.commonSideEffects?.length > 0 && (
                <Text style={styles.medSideEffects}>
                  ⚠️ May cause: {med.commonSideEffects[0]}
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.medActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionTaken]}
              onPress={() => handleLogDose(med.id, 'taken')}
            >
              <Text style={styles.actionTakenText}>✓ Taken</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionSkip]}
              onPress={() => handleLogDose(med.id, 'skipped')}
            >
              <Text style={styles.actionSkipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionSideEffect]}
              onPress={() => {
                // TODO: Open side effect dialog
              }}
            >
              <Text style={styles.actionSideEffectText}>⚠️ Side Effect</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      {/* Add Medication Button */}
      <View style={styles.addContainer}>
        <Button
          title="+ Add Medication"
          onPress={() => {
            // TODO: Navigate to add medication screen
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
  adherenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adherenceIcon: {
    fontSize: 24,
  },
  adherenceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065F46',
  },
  adherenceSubtitle: {
    fontSize: 13,
    color: '#065F46',
  },
  medCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
  },
  medDose: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 2,
  },
  medFood: {
    fontSize: 12,
    color: '#059669',
    marginTop: 4,
  },
  medSideEffects: {
    fontSize: 11,
    color: '#F97316',
    marginTop: 4,
  },
  medActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionTaken: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  actionSkip: {
    backgroundColor: '#F5F5F4',
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  actionSideEffect: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  actionTakenText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  actionSkipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78716C',
  },
  actionSideEffectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  addContainer: {
    padding: 20,
  },
});
