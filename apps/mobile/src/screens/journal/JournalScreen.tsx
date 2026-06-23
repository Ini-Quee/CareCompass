import React, { useState } from 'react';
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
import { SymptomSlider } from '../../components/ui/SymptomSlider';

export function JournalScreen({ navigation }: any) {
  const [nausea, setNausea] = useState(0);
  const [headache, setHeadache] = useState(0);
  const [dizziness, setDizziness] = useState(0);
  const [fatigue, setFatigue] = useState(0);
  const [swelling, setSwelling] = useState(0);
  const [mood, setMood] = useState('');
  const [vomiting, setVomiting] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const moodOptions = [
    { emoji: '😊', label: 'Great', value: 'great' },
    { emoji: '🙂', label: 'Good', value: 'good' },
    { emoji: '😐', label: 'Okay', value: 'okay' },
    { emoji: '😔', label: 'Low', value: 'low' },
    { emoji: '😣', label: 'Rough', value: 'rough' },
  ];

  const vomitingOptions = [
    { label: 'No', value: 0 },
    { label: 'Once', value: 1 },
    { label: '2-3x', value: 2 },
    { label: '4+', value: 4 },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // Get current pregnancy ID
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;

      await api.logSymptoms(pregnancyId, {
        nauseaSeverity: nausea,
        headacheSeverity: headache,
        dizzinessSeverity: dizziness,
        fatigueSeverity: fatigue,
        swellingSeverity: swelling,
        mood,
        vomitingCount: vomiting,
        notesForDoctor: notes,
        entryMethod: 'manual',
      });

      Alert.alert('Saved', 'Your symptom entry has been saved.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How are you feeling?</Text>
        <Text style={styles.subtitle}>Monday, June 23, 2026</Text>
      </View>

      {/* Symptom Sliders */}
      <Card>
        <SymptomSlider
          label="Nausea"
          value={nausea}
          onChange={setNausea}
          color="#F97316"
        />
        <SymptomSlider
          label="Headache"
          value={headache}
          onChange={setHeadache}
          color="#EF4444"
        />
        <SymptomSlider
          label="Dizziness"
          value={dizziness}
          onChange={setDizziness}
          color="#F59E0B"
        />
        <SymptomSlider
          label="Fatigue"
          value={fatigue}
          onChange={setFatigue}
          color="#DB2777"
        />
        <SymptomSlider
          label="Swelling"
          value={swelling}
          onChange={setSwelling}
          color="#8B5CF6"
        />
      </Card>

      {/* Mood Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood</Text>
        <View style={styles.moodContainer}>
          {moodOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.moodButton,
                mood === option.value && styles.moodButtonActive,
              ]}
              onPress={() => setMood(option.value)}
            >
              <Text style={styles.moodEmoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  mood === option.value && styles.moodLabelActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Vomiting */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vomiting today?</Text>
        <View style={styles.vomitingContainer}>
          {vomitingOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.vomitingButton,
                vomiting === option.value && styles.vomitingButtonActive,
              ]}
              onPress={() => setVomiting(option.value)}
            >
              <Text
                style={[
                  styles.vomitingText,
                  vomiting === option.value && styles.vomitingTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes for your doctor</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything you want to remember for your next visit..."
          placeholderTextColor="#A8A29E"
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Save Check-in"
          onPress={handleSave}
          loading={loading}
          size="large"
        />
        <Button
          title="Forgot earlier? Log retroactively"
          onPress={() => {}}
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 12,
  },
  moodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F5E6D3',
  },
  moodButtonActive: {
    borderColor: '#DB2777',
    backgroundColor: '#FDF2F8',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 10,
    color: '#78716C',
  },
  moodLabelActive: {
    color: '#DB2777',
    fontWeight: '600',
  },
  vomitingContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  vomitingButton: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F5E6D3',
    alignItems: 'center',
  },
  vomitingButtonActive: {
    borderColor: '#DB2777',
    backgroundColor: '#FDF2F8',
  },
  vomitingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
  },
  vomitingTextActive: {
    color: '#DB2777',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F5E6D3',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#1C1917',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actions: {
    padding: 20,
    gap: 12,
  },
});
