import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function DiscreteModeScreen({ navigation }: any) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [appName, setAppName] = useState('Health Tracker');
  const [notificationText, setNotificationText] = useState('Reminder');
  const [hideFromRecents, setHideFromRecents] = useState(false);

  const handleSave = () => {
    Alert.alert('Saved', 'Discrete mode settings updated');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discrete Mode</Text>
        <Text style={styles.subtitle}>Privacy protection for sensitive environments</Text>
      </View>

      {/* How It Works */}
      <Card variant="primary">
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🔒</Text>
          <Text style={styles.infoTitle}>How It Works</Text>
          <Text style={styles.infoText}>
            When enabled, the app changes its appearance to hide pregnancy-related content. 
            Perfect for workplace or shared devices.
          </Text>
        </View>
      </Card>

      {/* Main Toggle */}
      <Card>
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Enable Discrete Mode</Text>
            <Text style={styles.toggleDesc}>Changes app appearance</Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={setIsEnabled}
            trackColor={{ true: '#DB2777' }}
          />
        </View>
      </Card>

      {/* Settings */}
      {isEnabled && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Appearance</Text>
            
            <Card>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>App Name</Text>
                  <Text style={styles.settingDesc}>How the app appears on your device</Text>
                </View>
              </View>
              <TextInput
                style={styles.input}
                value={appName}
                onChangeText={setAppName}
                placeholder="Health Tracker"
                placeholderTextColor="#A8A29E"
              />
            </Card>

            <Card>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Notification Text</Text>
                  <Text style={styles.settingDesc}>What notifications say</Text>
                </View>
              </View>
              <TextInput
                style={styles.input}
                value={notificationText}
                onChangeText={setNotificationText}
                placeholder="Reminder"
                placeholderTextColor="#A8A29E"
              />
            </Card>

            <Card>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Hide from Recent Apps</Text>
                  <Text style={styles.toggleDesc}>Won't show pregnancy screens in app switcher</Text>
                </View>
                <Switch
                  value={hideFromRecents}
                  onValueChange={setHideFromRecents}
                  trackColor={{ true: '#DB2777' }}
                />
              </View>
            </Card>
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <Card>
              <View style={styles.previewCard}>
                <View style={styles.previewIcon}>
                  <Text style={styles.previewIconText}>📊</Text>
                </View>
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName}>{appName || 'Health Tracker'}</Text>
                  <Text style={styles.previewDesc}>This is what others will see</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Notification Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Preview</Text>
            <Card>
              <View style={styles.notifPreview}>
                <View style={styles.notifHeader}>
                  <View style={styles.notifIcon}>
                    <Text>📊</Text>
                  </View>
                  <Text style={styles.notifAppName}>{appName || 'Health Tracker'}</Text>
                  <Text style={styles.notifTime}>now</Text>
                </View>
                <Text style={styles.notifBody}>{notificationText || 'Reminder'}</Text>
              </View>
            </Card>
          </View>
        </>
      )}

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <Button
          title="Save Settings"
          onPress={handleSave}
          size="large"
        />
      </View>

      {/* Privacy Note */}
      <Card style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>🛡️ Your Privacy</Text>
        <Text style={styles.privacyText}>
          Discrete mode only changes the visual appearance. All your data remains intact and accessible when you open the app.
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1917',
  },
  toggleDesc: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 2,
  },
  settingRow: {
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1917',
  },
  settingDesc: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 2,
  },
  input: {
    backgroundColor: '#FDF2F8',
    borderWidth: 1.5,
    borderColor: '#F5E6D3',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1C1917',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIconText: {
    fontSize: 28,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1917',
  },
  previewDesc: {
    fontSize: 13,
    color: '#78716C',
  },
  notifPreview: {
    backgroundColor: '#F5F5F4',
    borderRadius: 12,
    padding: 12,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  notifIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifAppName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1917',
    flex: 1,
  },
  notifTime: {
    fontSize: 12,
    color: '#78716C',
  },
  notifBody: {
    fontSize: 14,
    color: '#1C1917',
  },
  saveContainer: {
    padding: 20,
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
