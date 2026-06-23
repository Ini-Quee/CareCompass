import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SymptomSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  maxValue?: number;
  color?: string;
}

export function SymptomSlider({
  label,
  value,
  onChange,
  maxValue = 10,
  color = '#DB2777',
}: SymptomSliderProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.sliderContainer}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${percentage}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
        <View style={styles.buttons}>
          {[0, 2, 4, 6, 8, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.button,
                value === num && { backgroundColor: color },
              ]}
              onPress={() => onChange(num)}
            >
              <Text
                style={[
                  styles.buttonText,
                  value === num && styles.buttonTextActive,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  label: {
    width: 75,
    fontSize: 13,
    fontWeight: '600',
    color: '#78716C',
  },
  sliderContainer: {
    flex: 1,
  },
  track: {
    height: 10,
    backgroundColor: '#F5E6D3',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F4',
  },
  buttonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#78716C',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  value: {
    width: 32,
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '700',
  },
});
