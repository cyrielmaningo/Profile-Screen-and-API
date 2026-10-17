import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing, radius, typography } from '../theme/theme';
import HeaderDecor from './Decor';

/**
 * Standard content screen: a branded, layered gradient header with an optional
 * eyebrow kicker, a title + optional subtitle, and an optional right accessory,
 * over a scrolling body.
 *
 * API (backward compatible): title, subtitle, right, children, scroll
 * New optional props:
 *   eyebrow  – small uppercase kicker above the title
 *   lead     – element rendered to the LEFT of the title block (e.g. avatar)
 *   overlap  – if true, the body lifts up to tuck under the header curve
 */
export default function Screen({
  title,
  subtitle,
  right,
  children,
  scroll = true,
  eyebrow,
  lead,
  overlap = false,
  onRefresh,
  refreshing = false,
}) {
  const Body = scroll ? ScrollView : View;
  return (
    <View style={styles.fill}>
      <LinearGradient
        colors={gradients.heroRich}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <HeaderDecor />
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            {lead ? <View style={styles.lead}>{lead}</View> : null}
            <View style={{ flex: 1 }}>
              {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
              <Text style={styles.title} numberOfLines={2}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {right ? <View style={styles.right}>{right}</View> : null}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Body
        style={styles.body}
        contentContainerStyle={
          scroll
            ? [styles.bodyContent, overlap && styles.bodyOverlap]
            : undefined
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
      >
        {children}
      </Body>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md },
  lead: { marginRight: spacing.md },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.accentSoft,
    marginBottom: 7,
  },
  title: { color: colors.onPrimary, fontSize: 27, fontWeight: '800', letterSpacing: 0.3 },
  subtitle: { color: colors.onDarkFaint, fontSize: 14, marginTop: 6, lineHeight: 20 },
  right: { marginLeft: spacing.md },
  body: { flex: 1 },
  bodyContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  bodyOverlap: { paddingTop: spacing.lg, marginTop: -spacing.lg },
});
