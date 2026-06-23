import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
}

export function Card({ children, variant = 'default', style }: CardProps) {
  return (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5E6D3',
    marginBottom: 12,
  },
  default: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F5E6D3',
  },
  primary: {
    backgroundColor: '#FDF2F8',
    borderColor: 'rgba(219, 39, 119, 0.15)',
  },
  success: {
    backgroundColor: '#ECFDF5',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  warning: {
    backgroundColor: '#FFFBEB',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  error: {
    backgroundColor: '#FEF2F2',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
});
