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

export function ReportsScreen({ navigation }: any) {
  const [reports, setReports] = useState<any[]>([]);
  const [concerns, setConcerns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;

      const [reportsRes, concernsRes] = await Promise.all([
        api.getReports(pregnancyId),
        api.getConcerns(pregnancyId),
      ]);

      setReports(reportsRes.data);
      setConcerns(concernsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;

      const result = await api.generateReport(pregnancyId, {
        sections: ['medications', 'symptoms', 'bp', 'concerns', 'questions'],
      });

      Alert.alert('Report Generated', 'Your provider report is ready.');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report');
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
        <Text style={styles.title}>Provider Reports</Text>
        <Text style={styles.subtitle}>Evidence-builder for appointments</Text>
      </View>

      {/* Generate Report Card */}
      <Card variant="primary">
        <View style={styles.generateCard}>
          <Text style={styles.generateIcon}>📋</Text>
          <Text style={styles.generateTitle}>Evidence Builder</Text>
          <Text style={styles.generateDescription}>
            Generate a clinical-language report to share with your provider
          </Text>
          <Button
            title="Generate New Report"
            onPress={handleGenerateReport}
            style={styles.generateButton}
          />
        </View>
      </Card>

      {/* My Concerns */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Concerns</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {concerns.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>
              No concerns added yet. Add topics you want to discuss with your provider.
            </Text>
          </Card>
        ) : (
          concerns.map((concern) => (
            <Card key={concern.id}>
              <View style={styles.concernRow}>
                <View style={styles.concernInfo}>
                  <Text style={styles.concernText}>{concern.concernText}</Text>
                  <Text style={styles.concernDate}>
                    Added {new Date(concern.dateRaised).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.concernSeverity,
                    concern.severity === 'high' && styles.concernSeverityHigh,
                    concern.severity === 'medium' && styles.concernSeverityMedium,
                  ]}
                >
                  <Text style={styles.concernSeverityText}>
                    {concern.severity || 'low'}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>

      {/* Previous Reports */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Previous Reports</Text>

        {reports.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>
              No reports generated yet. Generate your first report for your next appointment.
            </Text>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <TouchableOpacity style={styles.reportRow}>
                <View style={styles.reportIcon}>
                  <Text>📄</Text>
                </View>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>
                    Provider Report - {new Date(report.reportDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.reportSections}>
                    {report.sectionsIncluded?.length || 0} sections included
                  </Text>
                </View>
                <Text style={styles.reportArrow}>→</Text>
              </TouchableOpacity>
            </Card>
          ))
        )}
      </View>

      {/* Tips */}
      <Card variant="warning">
        <View style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Pro Tip</Text>
            <Text style={styles.tipText}>
              Generate a report 1-2 days before your appointment. Review it and add any additional questions.
            </Text>
          </View>
        </View>
      </Card>
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
  generateCard: {
    alignItems: 'center',
    padding: 16,
  },
  generateIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  generateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9D174D',
    marginBottom: 8,
  },
  generateDescription: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    marginBottom: 16,
  },
  generateButton: {
    width: '100%',
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
  sectionLink: {
    fontSize: 14,
    color: '#DB2777',
    fontWeight: '600',
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
    alignItems: 'center',
  },
  concernInfo: {
    flex: 1,
  },
  concernText: {
    fontSize: 14,
    color: '#1C1917',
  },
  concernDate: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 4,
  },
  concernSeverity: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F5F5F4',
  },
  concernSeverityHigh: {
    backgroundColor: '#FEE2E2',
  },
  concernSeverityMedium: {
    backgroundColor: '#FEF3C7',
  },
  concernSeverityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78716C',
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
  },
  reportSections: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
  reportArrow: {
    fontSize: 18,
    color: '#DB2777',
  },
  tipCard: {
    flexDirection: 'row',
    gap: 12,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
});
