import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../../components/Screen';
import { Card, Badge, Button, ProgressBar, IconTile } from '../../components/ui';
import Icon from '../../components/Icon';
import { useApp } from '../../store/AppContext';
import { colors, gradients, spacing, radius, shadow } from '../../theme/theme';

function statusTone(s) {
  return s === 'ready' ? 'success' : s === 'rendering' ? 'warning' : 'info';
}
function statusLabel(s) {
  return s === 'ready' ? 'Ready' : s === 'rendering' ? 'Rendering' : 'Draft';
}

function Monogram({ letter }) {
  return (
    <LinearGradient
      colors={gradients.tile}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.thumb}
    >
      <Text style={styles.thumbInitial}>{letter}</Text>
    </LinearGradient>
  );
}

function TributeCard({ item, onPress }) {
  const rendering = item.status === 'rendering';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? { opacity: 0.92, transform: [{ scale: 0.995 }] } : null)}
    >
      <View style={[styles.card, shadow.card]}>
        <View style={styles.cardTop}>
          <Monogram letter={item.name[0]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.years}>{item.years}</Text>
            <View style={styles.metaRow}>
              <Badge label={statusLabel(item.status)} tone={statusTone(item.status)} />
              {item.hasQR && (
                <View style={styles.qrTag}>
                  <Icon name="link" size={12} color={colors.primary} strokeWidth={2} />
                  <Text style={styles.qrTagText}>QR linked</Text>
                </View>
              )}
            </View>
          </View>
          <Icon name="chevron-right" size={20} color={colors.inkFaint} strokeWidth={2.2} />
        </View>

        {rendering ? (
          <View style={styles.progressWrap}>
            <ProgressBar value={item.progress || 0.4} tone="warning" height={6} />
            <Text style={styles.progressText}>
              {Math.round((item.progress || 0.4) * 100)}% · generating video
            </Text>
          </View>
        ) : item.duration ? (
          <View style={styles.footRow}>
            <Icon name="clock" size={14} color={colors.inkFaint} strokeWidth={1.9} />
            <Text style={styles.duration}>{item.duration}</Text>
            <View style={styles.footDot} />
            <Icon name="film" size={14} color={colors.inkFaint} strokeWidth={1.9} />
            <Text style={styles.duration}>Video tribute</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function TributesScreen({ navigation }) {
  const { tributes, dataLoading, refreshData, activeProfile } = useApp();

  return (
    <Screen
      eyebrow="Your collection"
      title="Video Tributes"
      subtitle={`Memories for ${activeProfile?.displayName || 'the selected memorial'}`}
      onRefresh={refreshData}
      refreshing={dataLoading}
    >
      <Button
        label="Create New Tribute"
        onPress={() => navigation.navigate('CreateTribute')}
        style={{ marginBottom: spacing.lg }}
      />

      {tributes.map((t) => (
        <TributeCard
          key={t.id}
          item={t}
          onPress={() => navigation.navigate('TributeDetail', { id: t.id })}
        />
      ))}

      {tributes.length === 0 && (
        <View style={styles.empty}>
          <IconTile name="heart" size={64} iconSize={30} tone="lavender" />
          <Text style={styles.emptyTitle}>No tributes yet</Text>
          <Text style={styles.emptyText}>
            Create your first tribute to begin preserving a cherished story.
          </Text>
          <Button
            label="Create New Tribute"
            onPress={() => navigation.navigate('CreateTribute')}
            style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: {
    width: 56, height: 56, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  thumbInitial: { fontSize: 22, fontWeight: '800', color: colors.onPrimary },
  name: { fontSize: 16.5, fontWeight: '700', color: colors.ink },
  years: { fontSize: 13, color: colors.inkMuted, marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  qrTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.lavenderMist,
    borderWidth: 1, borderColor: colors.lavender,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill,
  },
  qrTagText: { fontSize: 11.5, fontWeight: '700', color: colors.primary },

  progressWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 7,
  },
  progressText: { fontSize: 12.5, color: colors.warning, fontWeight: '600' },

  footRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  duration: { fontSize: 12.5, color: colors.inkMuted, fontWeight: '600' },
  footDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.inkFaint, marginHorizontal: 4 },

  empty: { paddingVertical: spacing.xl, paddingHorizontal: spacing.md, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.ink, marginTop: spacing.md },
  emptyText: { color: colors.inkMuted, textAlign: 'center', marginTop: 6, lineHeight: 20, fontSize: 14 },
});
