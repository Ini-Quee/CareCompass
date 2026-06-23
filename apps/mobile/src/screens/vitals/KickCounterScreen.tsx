import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';

export function KickCounterScreen({ navigation }: any) {
  const [kickCount, setKickCount] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRecentSessions();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadRecentSessions = async () => {
    try {
      const pregnancyRes = await api.getCurrentPregnancy();
      const pregnancyId = pregnancyRes.data.id;
      const sessionsRes = await api.getKicksToday(pregnancyId);
      setRecentSessions(sessionsRes.data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = () => {
    setIsSessionActive(true);
    setKickCount(0);
    setSessionStartTime(new Date());
    setElapsedTime(0);

    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const recordKick = () => {
    if (!isSessionActive) return;

    setKickCount((prev) => prev + 1);
    Vibration.vibrate(50); // Haptic feedback

    // Check if 10 kicks reached
    if (kickCount + 1 >= 10) {
      endSession();
      Alert.alert(
        '🎉 10 Kicks Reached!',
        `You reached 10 kicks in ${formatTime(elapsedTime)}. That's within normal range!`,
        [{ text: 'Great!' }]
      );
    }
  };

  const endSession = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (kickCount > 0 && sessionStartTime) {
      try {
        const pregnancyRes = await api.getCurrentPregnancy();
        const pregnancyId = pregnancyRes.data.id;

        await api.logKicks(pregnancyId, {
          sessionDurationMinutes: Math.ceil(elapsedTime / 60),
          kickCount,
        });

        loadRecentSessions();
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }

    setIsSessionActive(false);
    setSessionStartTime(null);
  };

  const resetSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSessionActive(false);
    setKickCount(0);
    setElapsedTime(0);
    setSessionStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Kick Counter</Text>
        <Text style={styles.subtitle}>Track fetal movement</Text>
      </View>

      {/* Main Counter */}
      <View style={styles.counterContainer}>
        {!isSessionActive ? (
          <TouchableOpacity style={styles.startButton} onPress={startSession}>
            <Text style={styles.startButtonText}>Start Session</Text>
            <Text style={styles.startButtonSubtext}>Tap when you feel movement</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
            
            <TouchableOpacity style={styles.kickButton} onPress={recordKick}>
              <Text style={styles.kickCount}>{kickCount}</Text>
              <Text style={styles.kickLabel}>kicks</Text>
            </TouchableOpacity>

            <Text style={styles.kickInstruction}>
              Tap the circle each time you feel movement
            </Text>

            <View style={styles.sessionActions}>
              <TouchableOpacity style={styles.resetButton} onPress={resetSession}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.endButton} onPress={endSession}>
                <Text style={styles.endButtonText}>End Session</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Goal Progress */}
      {isSessionActive && (
        <Card style={styles.goalCard}>
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Goal: 10 kicks</Text>
            <Text style={styles.goalProgress}>{kickCount}/10</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${Math.min(kickCount * 10, 100)}%` }]}
            />
          </View>
          {kickCount >= 10 && (
            <Text style={styles.goalReached}>✅ Goal reached!</Text>
          )}
        </Card>
      )}

      {/* Recent Sessions */}
      <View style={styles.recentContainer}>
        <Text style={styles.recentTitle}>Recent Sessions</Text>
        
        {recentSessions.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No sessions today. Start your first kick count!</Text>
          </Card>
        ) : (
          recentSessions.map((session, index) => (
            <Card key={index}>
              <View style={styles.sessionRow}>
                <View>
                  <Text style={styles.sessionKicks}>{session.kickCount} kicks</Text>
                  <Text style={styles.sessionTime}>
                    {session.sessionDurationMinutes} minutes
                  </Text>
                </View>
                <View style={[
                  styles.sessionBadge,
                  session.kickCount >= 10 ? styles.sessionBadgeNormal : styles.sessionBadgeWarning,
                ]}>
                  <Text style={styles.sessionBadgeText}>
                    {session.kickCount >= 10 ? 'Normal' : 'Below goal'}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ When to Count</Text>
        <Text style={styles.infoText}>
          Count kicks at the same time each day, ideally when baby is most active. 
          You should feel 10 movements within 2 hours. If you notice decreased movement, 
          contact your provider.
        </Text>
      </Card>
    </View>
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
  counterContainer: {
    alignItems: 'center',
    padding: 20,
  },
  startButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#DB2777',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DB2777',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  startButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  timerText: {
    fontSize: 16,
    color: '#78716C',
    marginBottom: 16,
  },
  kickButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#DB2777',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DB2777',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  kickCount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  kickLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  kickInstruction: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 16,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resetButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E7E5E4',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78716C',
  },
  endButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DB2777',
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goalCard: {
    marginHorizontal: 20,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
  },
  goalProgress: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DB2777',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F5E6D3',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#DB2777',
    borderRadius: 4,
  },
  goalReached: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginTop: 8,
  },
  recentContainer: {
    padding: 20,
  },
  recentTitle: {
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
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionKicks: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
  },
  sessionTime: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 2,
  },
  sessionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sessionBadgeNormal: {
    backgroundColor: '#D1FAE5',
  },
  sessionBadgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  sessionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
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
