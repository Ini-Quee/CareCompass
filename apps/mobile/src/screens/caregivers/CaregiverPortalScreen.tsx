import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function CaregiverPortalScreen({ navigation }: any) {
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaregivers();
  }, []);

  const loadCaregivers = async () => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;
      const caregiversRes = await api.getCaregivers(pregnancyId);
      setCaregivers(caregiversRes.data);
    } catch (error) {
      console.error('Error loading caregivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = () => {
    // TODO: Open invite dialog
    Alert.alert('Invite Caregiver', 'This feature will allow you to invite partners or family members.');
  };

  const handleRevoke = (caregiverId: string) => {
    Alert.alert(
      'Revoke Access',
      'Are you sure you want to revoke this caregiver\'s access?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              const pregnancyRes = await api.getCurrentPregnancy();
              await api.updateCaregiverPermissions(pregnancyRes.data.id, caregiverId, {});
              loadCaregivers();
            } catch (error) {
              Alert.alert('Error', 'Failed to revoke access');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Caregiver Portal</Text>
        <Text style={styles.subtitle}>Manage who can see your health data</Text>
      </View>

      {/* How It Works */}
      <Card variant="primary">
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>👨‍👩‍👧</Text>
          <Text style={styles.infoTitle}>How It Works</Text>
          <Text style={styles.infoText}>
            Invite partners or family members to view your health data. You control exactly what they can see. They'll receive alerts when you need support.
          </Text>
        </View>
      </Card>

      {/* Current Caregivers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Caregivers</Text>
          <TouchableOpacity onPress={handleInvite}>
            <Text style={styles.inviteLink}>+ Invite</Text>
          </TouchableOpacity>
        </View>

        {caregivers.length === 0 ? (
          <Card>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No Caregivers Yet</Text>
              <Text style={styles.emptyText}>
                Invite your partner or family member to stay connected
              </Text>
              <Button
                title="Invite Caregiver"
                onPress={handleInvite}
                size="small"
                style={styles.emptyButton}
              />
            </View>
          </Card>
        ) : (
          caregivers.map((caregiver) => (
            <Card key={caregiver.id}>
              <View style={styles.caregiverCard}>
                <View style={styles.caregiverHeader}>
                  <View style={styles.caregiverAvatar}>
                    <Text style={styles.caregiverInitial}>
                      {caregiver.caregiver?.firstName?.charAt(0) || '?'}
                    </Text>
                  </View>
                  <View style={styles.caregiverInfo}>
                    <Text style={styles.caregiverName}>
                      {caregiver.caregiver?.firstName} {caregiver.caregiver?.lastName}
                    </Text>
                    <Text style={styles.caregiverRelationship}>
                      {caregiver.relationship || 'Caregiver'}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    caregiver.status === 'active' ? styles.statusActive : styles.statusPending,
                  ]}>
                    <Text style={styles.statusText}>{caregiver.status}</Text>
                  </View>
                </View>

                {/* Permissions */}
                <View style={styles.permissionsContainer}>
                  <Text style={styles.permissionsTitle}>Permissions</Text>
                  
                  <View style={styles.permissionRow}>
                    <Text style={styles.permissionLabel}>View Medications</Text>
                    <Switch
                      value={caregiver.permissions?.view_medications ?? true}
                      trackColor={{ true: '#DB2777' }}
                      style={styles.permissionSwitch}
                    />
                  </View>
                  
                  <View style={styles.permissionRow}>
                    <Text style={styles.permissionLabel}>View Vitals</Text>
                    <Switch
                      value={caregiver.permissions?.view_vitals ?? true}
                      trackColor={{ true: '#DB2777' }}
                      style={styles.permissionSwitch}
                    />
                  </View>
                  
                  <View style={styles.permissionRow}>
                    <Text style={styles.permissionLabel}>View Appointments</Text>
                    <Switch
                      value={caregiver.permissions?.view_appointments ?? true}
                      trackColor={{ true: '#DB2777' }}
                      style={styles.permissionSwitch}
                    />
                  </View>
                  
                  <View style={styles.permissionRow}>
                    <Text style={styles.permissionLabel}>View Journal Notes</Text>
                    <Switch
                      value={caregiver.permissions?.view_journal_notes ?? false}
                      trackColor={{ true: '#DB2777' }}
                      style={styles.permissionSwitch}
                    />
                  </View>
                </View>

                {/* Alert Thresholds */}
                <View style={styles.thresholdsContainer}>
                  <Text style={styles.thresholdsTitle}>Alert Thresholds</Text>
                  
                  <View style={styles.thresholdRow}>
                    <Text style={styles.thresholdLabel}>BP above 140/90</Text>
                    <Switch
                      value={caregiver.alertThresholds?.bp_systolic_high === 140}
                      trackColor={{ true: '#DB2777' }}
                      style={styles.thresholdSwitch}
                    />
                  </View>
                  
                  <View style={styles.thresholdRow}>
                    <Text style={styles.thresholdLabel}>Missed medication</Text>
                    <Switch
                      value={caregiver.alertThresholds?.medication_missed ?? true}
                      trackColor={{ true: '#DB2777' }}
                      style={styles.thresholdSwitch}
                    />
                  </View>
                  
                  <View style={styles.thresholdRow}>
                    <Text style={styles.thresholdLabel}>Severe symptoms</Text>
                    <Switch
                      value={caregiver.alertThresholds?.severe_symptom ?? true}
                      trackColor={{ true: '#DB2777' }}
                      style={styles.thresholdSwitch}
                    />
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.caregiverActions}>
                  <Button
                    title="Revoke Access"
                    onPress={() => handleRevoke(caregiver.id)}
                    variant="ghost"
                    size="small"
                  />
                </View>
              </View>
            </Card>
          ))
        )}
      </View>

      {/* Privacy Note */}
      <Card style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>🔒 Your Privacy</Text>
        <Text style={styles.privacyText}>
          You control all sharing. Caregivers can only see what you allow. You can revoke access at any time instantly.
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
  infoCard: {
    alignItems: 'center',
    padding: 8,
  },
  infoIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9D174D',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    padding: 20,
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
  inviteLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DB2777',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 150,
  },
  caregiverCard: {
    gap: 16,
  },
  caregiverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  caregiverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DB2777',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caregiverInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  caregiverInfo: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
  },
  caregiverRelationship: {
    fontSize: 13,
    color: '#78716C',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  permissionsContainer: {
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    padding: 12,
  },
  permissionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78716C',
    marginBottom: 8,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  permissionLabel: {
    fontSize: 14,
    color: '#1C1917',
  },
  permissionSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  thresholdsContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
  },
  thresholdsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  thresholdLabel: {
    fontSize: 14,
    color: '#1C1917',
  },
  thresholdSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  caregiverActions: {
    alignItems: 'center',
  },
  privacyCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 13,
    color: '#78716C',
    lineHeight: 20,
  },
});
