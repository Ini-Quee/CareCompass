import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';

export function SettingsScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile */}
      <Card>
        <TouchableOpacity style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </Card>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Medication Reminders</Text>
              <Text style={styles.settingDesc}>Notify when doses are due</Text>
            </View>
            <Switch value={true} trackColor={{ true: '#DB2777' }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Appointment Reminders</Text>
              <Text style={styles.settingDesc}>1 day and 2 hours before</Text>
            </View>
            <Switch value={true} trackColor={{ true: '#DB2777' }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Daily Check-in</Text>
              <Text style={styles.settingDesc}>8:00 PM symptom prompt</Text>
            </View>
            <Switch value={true} trackColor={{ true: '#DB2777' }} />
          </View>
        </Card>
      </View>

      {/* Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
              <Text style={styles.settingDesc}>Extra login security</Text>
            </View>
            <Switch value={false} trackColor={{ true: '#DB2777' }} />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: '#DB2777' }]}>
                Export All Data
              </Text>
              <Text style={styles.settingDesc}>Download your health records</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Discrete Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discrete Mode</Text>
        <Card>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Enable Discrete Mode</Text>
              <Text style={styles.settingDesc}>Hide pregnancy content at work</Text>
            </View>
            <Switch value={false} trackColor={{ true: '#DB2777' }} />
          </View>
        </Card>
      </View>

      {/* Caregivers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Caregivers</Text>
        <Card>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Manage Caregivers</Text>
              <Text style={styles.settingDesc}>Invite or remove access</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>CareCompass v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DB2777',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1917',
  },
  profileEmail: {
    fontSize: 14,
    color: '#78716C',
  },
  arrow: {
    fontSize: 18,
    color: '#DB2777',
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78716C',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1917',
  },
  settingDesc: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5E6D3',
  },
  logoutContainer: {
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#A8A29E',
  },
});
