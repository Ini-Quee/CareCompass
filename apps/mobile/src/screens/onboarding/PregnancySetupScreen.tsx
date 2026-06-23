import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';

export function PregnancySetupScreen({ navigation }: any) {
  const [dueDate, setDueDate] = useState('');
  const [obName, setObName] = useState('');
  const [obPhone, setObPhone] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [isHighRisk, setIsHighRisk] = useState(false);
  const [loading, setLoading] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleCreateProfile = async () => {
    setLoading(true);
    try {
      await api.createPregnancy({
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        obName,
        obPhone,
        bloodType,
        isHighRisk,
      });

      Alert.alert('Success', 'Your pregnancy profile has been created!', [
        { text: 'OK', onPress: () => navigation.navigate('Main') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>Step 2 of 2</Text>
        <Text style={styles.title}>Pregnancy Profile</Text>
        <Text style={styles.subtitle}>
          Tell us about your pregnancy so we can personalize your experience
        </Text>
      </View>

      {/* Due Date */}
      <View style={styles.section}>
        <Text style={styles.label}>Due Date (if known)</Text>
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#A8A29E"
        />
      </View>

      {/* OB Information */}
      <View style={styles.section}>
        <Text style={styles.label}>OB/GYN Name</Text>
        <TextInput
          style={styles.input}
          value={obName}
          onChangeText={setObName}
          placeholder="Dr. Smith"
          placeholderTextColor="#A8A29E"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>OB/GYN Phone</Text>
        <TextInput
          style={styles.input}
          value={obPhone}
          onChangeText={setObPhone}
          placeholder="(555) 123-4567"
          placeholderTextColor="#A8A29E"
          keyboardType="phone-pad"
        />
      </View>

      {/* Blood Type */}
      <View style={styles.section}>
        <Text style={styles.label}>Blood Type</Text>
        <View style={styles.bloodTypeContainer}>
          {bloodTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.bloodTypeButton,
                bloodType === type && styles.bloodTypeButtonActive,
              ]}
              onPress={() => setBloodType(type)}
            >
              <Text
                style={[
                  styles.bloodTypeText,
                  bloodType === type && styles.bloodTypeTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* High Risk */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setIsHighRisk(!isHighRisk)}
        >
          <View style={[styles.checkbox, isHighRisk && styles.checkboxActive]}>
            {isHighRisk && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.checkboxInfo}>
            <Text style={styles.checkboxLabel}>High-Risk Pregnancy</Text>
            <Text style={styles.checkboxDesc}>
              Check if you have gestational diabetes, hypertension, or other complications
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Create Profile Button */}
      <View style={styles.footer}>
        <Button
          title="Create Profile"
          onPress={handleCreateProfile}
          loading={loading}
          size="large"
        />
        <Button
          title="Skip for now"
          onPress={() => navigation.navigate('Main')}
          variant="ghost"
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
    padding: 24,
    paddingTop: 60,
  },
  stepIndicator: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DB2777',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#78716C',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F5E6D3',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#1C1917',
  },
  bloodTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F5E6D3',
  },
  bloodTypeButtonActive: {
    backgroundColor: '#FCE7F3',
    borderColor: '#DB2777',
  },
  bloodTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78716C',
  },
  bloodTypeTextActive: {
    color: '#DB2777',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#F5E6D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#DB2777',
    borderColor: '#DB2777',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxInfo: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
  },
  checkboxDesc: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    gap: 12,
  },
});
