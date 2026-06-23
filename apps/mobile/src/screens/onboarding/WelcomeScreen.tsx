import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../../components/ui/Button';

export function WelcomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🤰</Text>
        <Text style={styles.title}>CareCompass</Text>
        <Text style={styles.subtitle}>
          Your pregnancy companion. Not another milestone tracker.
        </Text>
        <Text style={styles.description}>
          Track symptoms. Remember medications.{'\n'}
          Communicate better with your doctor.{'\n'}
          One place for everything.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📝</Text>
            <Text style={styles.featureText}>One-tap symptom logging</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💊</Text>
            <Text style={styles.featureText}>Smart medication reminders</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Trend detection & alerts</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📋</Text>
            <Text style={styles.featureText}>Doctor-ready reports</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('PregnancySetup')}
          size="large"
        />
        <View style={styles.trustBadges}>
          <Text style={styles.trustText}>🔒 100% Encrypted</Text>
          <Text style={styles.trustText}>🚫 0 Ads Ever</Text>
          <Text style={styles.trustText}>🏥 HIPAA Ready</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1C1917',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#78716C',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#A8A29E',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  features: {
    width: '100%',
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F5E6D3',
  },
  featureIcon: {
    fontSize: 28,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1917',
  },
  footer: {
    gap: 16,
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  trustText: {
    fontSize: 12,
    color: '#78716C',
  },
});
