import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function WeightTrackingScreen({ navigation }: any) {
  const [weight, setWeight] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [pregnancy, setPregnancy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;
      setPregnancy(pregnancyRes.data);

      const historyRes = await api.getWeightHistory(pregnancyId);
      setHistory(historyRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogWeight = async () => {
    if (!weight) {
      Alert.alert('Error', 'Please enter your weight');
      return;
    }

    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;

      await api.logWeight(pregnancyId, {
        weightLbs: parseFloat(weight),
      });

      Alert.alert('Logged', 'Weight recorded');
      setWeight('');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to log weight');
    }
  };

  const currentWeight = history.length > 0 ? Number(history[0].weightLbs) : null;
  const firstWeight = history.length > 0 ? Number(history[history.length - 1].weightLbs) : null;
  const totalGain = currentWeight && firstWeight ? currentWeight - firstWeight : 0;

  // Recommended weight gain based on pregnancy week
  const getRecommendedGain = () => {
    if (!pregnancy?.pregnancyWeek) return null;
    const week = pregnancy.pregnancyWeek;
    if (week <= 12) return { min: 1, max: 4 };
    if (week <= 27) return { min: 12, max: 22 };
    return { min: 20, max: 30 };
  };

  const recommendedGain = getRecommendedGain();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Weight Tracking</Text>
        <Text style={styles.subtitle}>Monitor your pregnancy weight gain</Text>
      </View>

      {/* Current Weight */}
      <Card variant="primary">
        <View style={styles.currentCard}>
          <Text style={styles.currentLabel}>Current Weight</Text>
          <Text style={styles.currentValue}>
            {currentWeight ? `${currentWeight} lbs` : '--'}
          </Text>
          {totalGain !== 0 && (
            <Text style={styles.totalGain}>
              {totalGain > 0 ? '+' : ''}{totalGain.toFixed(1)} lbs total gain
            </Text>
          )}
        </View>
      </Card>

      {/* Recommended Gain */}
      {recommendedGain && (
        <Card>
          <Text style={styles.recommendedTitle}>📊 Recommended Gain (Week {pregnancy?.pregnancyWeek})</Text>
          <Text style={styles.recommendedText}>
            {recommendedGain.min}-{recommendedGain.lbs} lbs total by now
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min((totalGain / recommendedGain.max) * 100, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressLabel}>
            {totalGain < recommendedGain.min ? 'Below recommended range' :
             totalGain > recommendedGain.max ? 'Above recommended range' :
             'Within recommended range'}
          </Text>
        </Card>
      )}

      {/* Log Weight */}
      <Card>
        <Text style={styles.cardTitle}>Log Weight</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="165"
            placeholderTextColor="#A8A29E"
            keyboardType="numeric"
          />
          <Text style={styles.inputUnit}>lbs</Text>
        </View>
        <Button title="Log Weight" onPress={handleLogWeight} />
      </Card>

      {/* Weight History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>History</Text>
        
        {history.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No weight entries yet. Start tracking!</Text>
          </Card>
        ) : (
          history.slice(0, 10).map((entry, index) => {
            const prevWeight = index < history.length - 1 ? Number(history[index + 1].weightLbs) : null;
            const change = prevWeight ? Number(entry.weightLbs) - prevWeight : 0;

            return (
              <Card key={entry.id}>
                <View style={styles.historyRow}>
                  <View>
                    <Text style={styles.historyWeight}>{Number(entry.weightLbs)} lbs</Text>
                    <Text style={styles.historyDate}>
                      {new Date(entry.logDate).toLocaleDateString()}
                    </Text>
                  </View>
                  {change !== 0 && (
                    <View style={[
                      styles.changeBadge,
                      change > 0 ? styles.changeBadgeUp : styles.changeBadgeDown,
                    ]}>
                      <Text style={styles.changeText}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)} lbs
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          })
        )}
      </View>

      {/* Tips */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Weight Gain Tips</Text>
        <Text style={styles.tipsText}>
          • Weight gain varies by person and pregnancy{'\n'}
          • Focus on nutritious foods, not numbers{'\n'}
          • Discuss any concerns with your provider{'\n'}
          • Sudden large gains may need medical attention
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
  currentCard: {
    alignItems: 'center',
    padding: 16,
  },
  currentLabel: {
    fontSize: 14,
    color: '#9D174D',
    fontWeight: '600',
  },
  currentValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#DB2777',
    marginVertical: 8,
  },
  totalGain: {
    fontSize: 14,
    color: '#78716C',
  },
  recommendedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
  },
  recommendedText: {
    fontSize: 14,
    color: '#78716C',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F5E6D3',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#DB2777',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 13,
    color: '#78716C',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#FDF2F8',
    borderWidth: 1.5,
    borderColor: '#F5E6D3',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1917',
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: 18,
    color: '#78716C',
    fontWeight: '600',
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
  emptyText: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    padding: 16,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyWeight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1917',
  },
  historyDate: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 2,
  },
  changeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeBadgeUp: {
    backgroundColor: '#FEF3C7',
  },
  changeBadgeDown: {
    backgroundColor: '#D1FAE5',
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
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
