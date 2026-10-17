import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing, radius, typography } from '../theme/theme';
import BrandLogo from './BrandLogo';
import HeaderDecor from './Decor';
import Icon from './Icon';

/**
 * Shared header + card layout for auth screens.
 *
 * Props:
 *   title     – required display heading (unchanged API)
 *   subtitle  – optional muted supporting line (unchanged API)
 *   children  – form body (unchanged API)
 *   eyebrow   – optional small uppercase kicker above the title (new, optional)
 *   footNote  – optional reassurance line under the card (new, optional; has a
 *               sensible memorial-appropriate default)
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  eyebrow,
  footNote = 'Private by design — your memories stay yours.',
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.fill}>
      <LinearGradient
        colors={gradients.heroRich}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <HeaderDecor />
        <View style={styles.brand}>
          <View style={styles.tile}>
            <BrandLogo size={32} />
          </View>
          <View>
            <Text style={styles.brandText}>Memento</Text>
            <Text style={styles.brandTagline}>Digital remembrance</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            <View style={styles.rule} />
            {children}
          </View>

          {footNote ? (
            <View style={styles.footNote}>
              <Icon name="shield" size={15} color={colors.inkFaint} strokeWidth={1.7} />
              <Text style={styles.footNoteText}>{footNote}</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingBottom: spacing.xxl + spacing.sm,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tile: {
    width: 50, height: 50, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  brandText: { color: colors.onPrimary, fontSize: 23, fontWeight: '800', letterSpacing: 0.5 },
  brandTagline: {
    color: colors.onDarkFaint,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  // Pull the whole scroll area up so the card overlaps the header, while the
  // ScrollView's clip bounds move with it (the card top is never clipped).
  scrollView: {
    flex: 1,
    marginTop: -spacing.xl,
  },
  scroll: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: 0,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    paddingTop: spacing.lg + spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#2A1230',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  title: { fontSize: 27, fontWeight: '800', color: colors.ink, letterSpacing: 0.2 },
  subtitle: { fontSize: 15, color: colors.inkMuted, marginTop: 8, lineHeight: 22 },
  // A short hairline rule instead of a big empty gap — tightens the rhythm.
  rule: {
    width: 34,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.lavender,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  footNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  footNoteText: { color: colors.inkFaint, fontSize: 12.5, fontWeight: '500', letterSpacing: 0.2 },
});
