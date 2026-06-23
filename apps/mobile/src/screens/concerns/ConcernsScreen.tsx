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

export function ConcernsScreen({ navigation }: any) {
  const [concerns, setConcerns] = useState<any[]>([]);
  const [newConcern, setNewConcern] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    loadConcerns();
  }, []);

  const loadConcerns = async () => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;
      const concernsRes = await api.getConcerns(pregnancyId);
      setConcerns(concernsRes.data);
    } catch (error) {
      console.error('Error loading concerns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddConcern = async () => {
    if (!newConcern.trim()) {
      Alert.alert('Error', 'Please enter your concern');
      return;
    }

    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;

      await api.addConcern(pregnancyId, {
        concernText: newConcern.trim(),
        severity,
      });

      setNewConcern('');
      setShowAdd(false);
      loadConcerns();
    } catch (error) {
      Alert.alert('Error', 'Failed to add concern');
    }
  };

  const handleMarkAddressed = async (concernId: string) => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;

      await api.markConcernAddressed(pregnancyId, concernId);
      loadConcerns();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark as addressed');
    }
  };

  const openConcerns = concerns.filter((c) => !c.addressed);
  const addressedConcerns = concerns.filter((c) => c.addressed);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'high': return { bg: '#FEE2E2', text: '#991B1B' };
      case 'medium': return { bg: '#FEF3C7', text: '#92400E' };
      case 'low': return { bg: '#D1FAE5', text: '#065F46' };
      default: return { bg: '#F5F5F4', text: '#78716C' };
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Concerns</Text>
        <Text style={styles.subtitle}>Questions and topics for your provider</Text>
      </View>

      {/* Add Concern */}
      {!showAdd ? (
        <View style={styles.addContainer}>
          <Button
            title="+ Add Concern"
            onPress={() => setShowAdd(true)}
          />
        </View>
      ) : (
        <Card>
          <Text style={styles.addTitle}>New Concern</Text>
          <TextInput
            style={styles.input}
            value={newConcern}
            onChangeText={setNewConcern}
            placeholder="What would you like to discuss with your provider?"
            placeholderTextColor="#A8A29E"
            multiline
            numberOfLines={3}
          />

          <View style={styles.severityContainer}>
            <Text style={styles.severityLabel}>Priority:</Text>
            <View style={styles.severityButtons}>
              {['low', 'medium', 'high'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.severityButton,
                    severity === s && styles.severityButtonActive,
                    { backgroundColor: getSeverityColor(s).bg },
                  ]}
                  onPress={() => setSeverity(s)}
                >
                  <Text style={[
                    styles.severityButtonText,
                    severity === s && { color: getSeverityColor(s).text },
                  ]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.addActions}>
            <Button
              title="Cancel"
              onPress={() => setShowAdd(false)}
              variant="ghost"
              size="small"
            />
            <Button
              title="Add"
              onPress={handleAddConcern}
              size="small"
            />
          </View>
        </Card>
      )}

      {/* Open Concerns */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Open ({openConcerns.length})
        </Text>

        {openConcerns.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>
              No open concerns. Add topics you want to discuss with your provider.
            </Text>
          </Card>
        ) : (
          openConcerns.map((concern) => {
            const colors = getSeverityColor(concern.severity);
            return (
              <Card key={concern.id}>
                <View style={styles.concernRow}>
                  <View style={styles.concernInfo}>
                    <Text style={styles.concernText}>{concern.concernText}</Text>
                    <Text style={styles.concernDate}>
                      Added {new Date(concern.dateRaised).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={[styles.severityBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.severityBadgeText, { color: colors.text }]}>
                      {concern.severity || 'low'}
                    </Text>
                  </View>
                </View>
                <View style={styles.concernActions}>
                  <TouchableOpacity
                    style={styles.addressedButton}
                    onPress={() => handleMarkAddressed(concern.id)}
                  >
                    <Text style={styles.addressedButtonText}>✓ Mark Addressed</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}
      </View>

      {/* Addressed Concerns */}
      {addressedConcerns.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Addressed ({addressedConcerns.length})
          </Text>

          {addressedConcerns.map((concern) => (
            <Card key={concern.id} style={styles.addressedCard}>
              <View style={styles.concernRow}>
                <View style={styles.concernInfo}>
                  <Text style={styles.concernTextAddressed}>{concern.concernText}</Text>
                  <Text style={styles.concernDate}>
                    Addressed {concern.addressedDate ? new Date(concern.addressedDate).toLocaleDateString() : ''}
                  </Text>
                </View>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Generate Report */}
      <View style={styles.reportContainer}>
        <Card variant="primary">
          <Text style={styles.reportTitle}>📋 Include in Provider Report</Text>
          <Text style={styles.reportText}>
            Your concerns will be included in your next provider report.
          </Text>
          <Button
            title="Generate Report"
            onPress={() => navigation.navigate('Reports')}
            variant="secondary"
            size="small"
            style={styles.reportButton}
          />
        </Card>
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
  addContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FDF2F8',
    borderWidth: 1.5,
    borderColor: '#F5E6D3',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1C1917',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  severityContainer: {
    marginBottom: 16,
  },
  severityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78716C',
    marginBottom: 8,
  },
  severityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  severityButtonActive: {
    borderWidth: 2,
    borderColor: '#DB2777',
  },
  severityButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78716C',
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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
  concernRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  concernInfo: {
    flex: 1,
    marginRight: 12,
  },
  concernText: {
    fontSize: 15,
    color: '#1C1917',
    lineHeight: 22,
  },
  concernTextAddressed: {
    fontSize: 15,
    color: '#78716C',
    lineHeight: 22,
    textDecorationLine: 'line-through',
  },
  concernDate: {
    fontSize: 12,
    color: '#A8A29E',
    marginTop: 4,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  concernActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5E6D3',
  },
  addressedButton: {
    alignSelf: 'flex-end',
  },
  addressedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  addressedCard: {
    opacity: 0.7,
  },
  checkmark: {
    fontSize: 18,
    color: '#059669',
    fontWeight: '700',
  },
  reportContainer: {
    padding: 20,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9D174D',
    marginBottom: 8,
  },
  reportText: {
    fontSize: 13,
    color: '#78716C',
    marginBottom: 12,
  },
  reportButton: {
    alignSelf: 'flex-start',
  },
});
