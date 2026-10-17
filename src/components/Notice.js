import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, radius, spacing } from '../theme/theme';

export default function Notice({ title, message, tone = 'error', style }) {
  if (!title && !message) return null;
  const palette = {
    error: { bg: '#FFF2F1', border: '#F0C5C0', fg: colors.danger, icon: 'alert-circle' },
    success: { bg: '#F0FAF5', border: '#C6E8D6', fg: colors.success, icon: 'check' },
    info: { bg: colors.lavenderMist, border: colors.lavender, fg: colors.primary, icon: 'shield' },
  }[tone] || {};

  return (
    <View style={[styles.notice, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      <View style={[styles.icon, { backgroundColor: `${palette.fg}14` }]}>
        <Icon name={palette.icon} size={19} color={palette.fg} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        {title ? <Text style={[styles.title, { color: palette.fg }]}>{title}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  message: { color: colors.inkMuted, fontSize: 13.5, lineHeight: 19 },
});
