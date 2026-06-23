import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';

export function EmergencyScreen({ navigation }: any) {
  const [pregnancy, setPregnancy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      setPregnancy(pregnancyRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall911 = () => {
    Alert.alert(
      'Call 911',
      'Are you experiencing a medical emergency?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call 911',
          style: 'destructive',
          onPress: () => Linking.openURL('tel:911'),
        },
      ]
    );
  };

  const handleCallOB = () => {
    if (pregnancy?.obPhone) {
      Linking.openURL(`tel:${pregnancy.obPhone}`);
    } else {
      Alert.alert('No OB Phone', 'Add your OB phone number in settings');
    }
  };

  const handleCallEmergency1 = () => {
    if (pregnancy?.emergencyContact1Phone) {
      Linking.openURL(`tel:${pregnancy.emergencyContact1Phone}`);
    }
  };

  const handleCallEmergency2 = () => {
    if (pregnancy?.emergencyContact2Phone) {
      Linking.openURL(`tel:${pregnancy.emergencyContact2Phone}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Medical ID</Text>
        <Text style={styles.subtitle}>Accessible from lock screen</Text>
      </View>

      {/* Emergency Card */}
      <View style={styles.emergencyCard}>
        <View style={styles.emergencyHeader}>
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={styles.emergencyTitle}>Medical Information</Text>
        </View>

        <View style={styles.emergencyRows}>
          <View style={styles.emergencyRow}>
            <Text style={styles.emergencyLabel}>Name</Text>
            <Text style={styles.emergencyValue}>
              {pregnancy?.user?.firstName} {pregnancy?.user?.lastName}
            </Text>
          </View>

          <View style={styles.emergencyRow}>
            <Text style={styles.emergencyLabel}>Pregnancy Week</Text>
            <Text style={styles.emergencyValue}>
              {pregnancy?.pregnancyWeek ? `Week ${pregnancy.pregnancyWeek}` : '--'}
            </Text>
          </View>

          <View style={styles.emergencyRow}>
            <Text style={styles.emergencyLabel}>Blood Type</Text>
            <Text style={styles.emergencyValue}>
              {pregnancy?.bloodType || '--'} {pregnancy?.rhFactor || ''}
            </Text>
          </View>

          <View style={styles.emergencyRow}>
            <Text style={styles.emergencyLabel}>High Risk</Text>
            <Text style={styles.emergencyValue}>
              {pregnancy?.isHighRisk ? 'Yes' : 'No'}
              {pregnancy?.highRiskConditions?.length > 0 && 
                ` — ${pregnancy.highRiskConditions.join(', ')}`
              }
            </Text>
          </View>

          <View style={styles.emergencyRow}>
            <Text style={styles.emergencyLabel}>Allergies</Text>
            <Text style={styles.emergencyValue}>
              {pregnancy?.allergies?.length > 0 ? pregnancy.allergies.join(', ') : 'None listed'}
            </Text>
          </View>

          <View style={styles.emergencyRow}>
            <Text style={styles.emergencyLabel}>Medications</Text>
            <Text style={styles.emergencyValue}>
              {pregnancy?.medications?.map((m: any) => m.name).join(', ') || 'None listed'}
            </Text>
          </View>

          <View style={[styles.emergencyRow, styles.emergencyRowLast]}>
            <Text style={styles.emergencyLabel}>OB</Text>
            <Text style={styles.emergencyValue}>
              {pregnancy?.obName || '--'}
              {pregnancy?.obPhone && `\n${pregnancy.obPhone}`}
            </Text>
          </View>
        </View>

        {/* Call 911 Button */}
        <TouchableOpacity style={styles.call911Button} onPress={handleCall911}>
          <Text style={styles.call911Text}>📞 Call 911</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>

        {pregnancy?.emergencyContact1Name && (
          <Card>
            <View style={styles.contactRow}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{pregnancy.emergencyContact1Name}</Text>
                <Text style={styles.contactRelationship}>
                  {pregnancy.emergencyContact1Relationship}
                </Text>
              </View>
              <TouchableOpacity style={styles.callButton} onPress={handleCallEmergency1}>
                <Text style={styles.callButtonText}>📞 Call</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {pregnancy?.emergencyContact2Name && (
          <Card>
            <View style={styles.contactRow}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{pregnancy.emergencyContact2Name}</Text>
                <Text style={styles.contactRelationship}>
                  {pregnancy.emergencyContact2Relationship}
                </Text>
              </View>
              <TouchableOpacity style={styles.callButton} onPress={handleCallEmergency2}>
                <Text style={styles.callButtonText}>📞 Call</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {pregnancy?.obName && (
          <Card>
            <View style={styles.contactRow}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{pregnancy.obName}</Text>
                <Text style={styles.contactRelationship}>OB/GYN</Text>
              </View>
              <TouchableOpacity style={styles.callButton} onPress={handleCallOB}>
                <Text style={styles.callButtonText}>📞 Call</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </View>

      {/* Nearest ER */}
      <Card style={styles.erCard}>
        <Text style={styles.erTitle}>🏥 Nearest Emergency Room</Text>
        <Text style={styles.erText}>
          In case of emergency, call 911 or go to your nearest ER.
        </Text>
        <TouchableOpacity style={styles.erButton}>
          <Text style={styles.erButtonText}>Find Nearest ER</Text>
        </TouchableOpacity>
      </Card>

      {/* Info */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ Lock Screen Access</Text>
        <Text style={styles.infoText}>
          This information can be accessed from your phone's lock screen in an emergency. 
          First responders can see this without unlocking your phone.
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
  emergencyCard: {
    margin: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#EF4444',
    padding: 24,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  emergencyIcon: {
    fontSize: 32,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#991B1B',
  },
  emergencyRows: {
    gap: 0,
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.2)',
  },
  emergencyRowLast: {
    borderBottomWidth: 0,
  },
  emergencyLabel: {
    fontSize: 14,
    color: '#78716C',
  },
  emergencyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  call911Button: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  call911Text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
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
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
  },
  contactRelationship: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 2,
  },
  callButton: {
    backgroundColor: '#DB2777',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  erCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  erTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
  },
  erText: {
    fontSize: 13,
    color: '#78716C',
    marginBottom: 12,
  },
  erButton: {
    backgroundColor: '#FDF2F8',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  erButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DB2777',
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#78716C',
    lineHeight: 20,
  },
});
