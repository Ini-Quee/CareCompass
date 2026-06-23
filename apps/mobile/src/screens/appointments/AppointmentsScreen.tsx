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

export function AppointmentsScreen({ navigation }: any) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;
      // TODO: Add appointments API endpoint
      setAppointments([]);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.appointmentDate) >= new Date() && a.status === 'scheduled'
  );

  const pastAppointments = appointments.filter(
    (a) => new Date(a.appointmentDate) < new Date() || a.status === 'completed'
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Appointments</Text>
        <Text style={styles.subtitle}>Manage your healthcare visits</Text>
      </View>

      {/* Add Appointment */}
      <View style={styles.addContainer}>
        <Button
          title="+ Add Appointment"
          onPress={() => {
            // TODO: Navigate to add appointment screen
            Alert.alert('Coming Soon', 'This feature will allow you to add appointments.');
          }}
        />
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming</Text>
        
        {upcomingAppointments.length === 0 ? (
          <Card>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No Upcoming Appointments</Text>
              <Text style={styles.emptyText}>
                Add your next OB visit or specialist appointment
              </Text>
            </View>
          </Card>
        ) : (
          upcomingAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <TouchableOpacity style={styles.appointmentCard}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateDay}>
                    {new Date(appointment.appointmentDate).getDate()}
                  </Text>
                  <Text style={styles.dateMonth}>
                    {new Date(appointment.appointmentDate).toLocaleString('default', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentDoctor}>{appointment.providerName}</Text>
                  <Text style={styles.appointmentSpecialty}>{appointment.providerSpecialty}</Text>
                  <Text style={styles.appointmentTime}>
                    {appointment.appointmentTime} · {appointment.locationName}
                  </Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>

              {/* Quick Actions */}
              <View style={styles.appointmentActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>📋</Text>
                  <Text style={styles.actionText}>Prep Questions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>🗺️</Text>
                  <Text style={styles.actionText}>Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>📝</Text>
                  <Text style={styles.actionText}>Add Notes</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </View>

      {/* Past Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Past Visits</Text>
        
        {pastAppointments.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No past appointments recorded</Text>
          </Card>
        ) : (
          pastAppointments.map((appointment) => (
            <Card key={appointment.id} style={styles.pastCard}>
              <View style={styles.pastRow}>
                <View style={styles.pastDot} />
                <View style={styles.pastInfo}>
                  <Text style={styles.pastDoctor}>{appointment.providerName}</Text>
                  <Text style={styles.pastDate}>
                    {new Date(appointment.appointmentDate).toLocaleDateString()} · {appointment.purpose || 'Routine visit'}
                  </Text>
                  {appointment.doctorSaid && (
                    <Text style={styles.pastNotes}>"{appointment.doctorSaid}"</Text>
                  )}
                </View>
              </View>
            </Card>
          ))
        )}
      </View>

      {/* Calendar Integration */}
      <Card style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>📅 Sync with Calendar</Text>
        <Text style={styles.calendarText}>
          Add appointments to your phone's calendar for automatic reminders
        </Text>
        <Button
          title="Sync Now"
          onPress={() => {
            Alert.alert('Coming Soon', 'This feature will sync with your phone calendar.');
          }}
          variant="secondary"
          size="small"
          style={styles.calendarButton}
        />
      </Card>

      {/* Visit Preparation */}
      <Card style={styles.prepCard}>
        <Text style={styles.prepTitle}>📋 Prepare for Your Visit</Text>
        <Text style={styles.prepText}>
          Generate a provider report with your symptoms, medications, and questions before your appointment.
        </Text>
        <Button
          title="Generate Report"
          onPress={() => navigation.navigate('Reports')}
          variant="secondary"
          size="small"
          style={styles.prepButton}
        />
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
  addContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 12,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  dateBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#DB2777',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
  },
  appointmentSpecialty: {
    fontSize: 13,
    color: '#78716C',
  },
  appointmentTime: {
    fontSize: 13,
    color: '#DB2777',
    marginTop: 2,
  },
  arrow: {
    fontSize: 18,
    color: '#DB2777',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5E6D3',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#FDF2F8',
    borderRadius: 10,
  },
  actionIcon: {
    fontSize: 14,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DB2777',
  },
  pastCard: {
    opacity: 0.8,
  },
  pastRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginTop: 6,
  },
  pastInfo: {
    flex: 1,
  },
  pastDoctor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
  },
  pastDate: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
  pastNotes: {
    fontSize: 13,
    color: '#78716C',
    fontStyle: 'italic',
    marginTop: 4,
  },
  calendarCard: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  calendarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
  },
  calendarText: {
    fontSize: 13,
    color: '#78716C',
    marginBottom: 12,
  },
  calendarButton: {
    alignSelf: 'flex-start',
  },
  prepCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  prepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 8,
  },
  prepText: {
    fontSize: 13,
    color: '#78716C',
    marginBottom: 12,
  },
  prepButton: {
    alignSelf: 'flex-start',
  },
});
