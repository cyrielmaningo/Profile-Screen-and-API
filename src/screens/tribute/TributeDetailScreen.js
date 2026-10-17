import React from 'react';
import { View, Text, StyleSheet, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../../components/Screen';
import { Card, Badge, Button, Divider, ProgressBar, SectionHeader } from '../../components/ui';
import Icon from '../../components/Icon';
import TributeVideoPlayer from '../../components/TributeVideoPlayer';
import { useApp } from '../../store/AppContext';
import { colors, gradients, spacing, radius } from '../../theme/theme';

export default function TributeDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { tributes } = useApp();
  const t = tributes.find((x) => x.id === String(id)) || tributes[0];
  if (!t) {
    return <Screen eyebrow="Tribute" title="Not found" subtitle="This tribute is no longer available"><Button label="Back" onPress={() => navigation.goBack()} /></Screen>;
  }

  const isReady = t.status === 'ready';
  const pct = Math.round((t.progress || 0.4) * 100);

  const openVideo = async () => {
    if (!t.videoUrl) {
      Alert.alert('Video unavailable', 'This tribute does not have an uploaded video file yet.');
      return;
    }
    try {
      await Linking.openURL(t.videoUrl);
    } catch {
      Alert.alert('Unable to play video', 'The uploaded video link could not be opened. Check that the Memento server is reachable from this device.');
    }
  };

  return (
    <Screen eyebrow="Tribute" title={t.name} subtitle={t.years}>
      {isReady && t.videoUrl ? (
        <>
          <TributeVideoPlayer uri={t.videoUrl} />
          <View style={{ height: spacing.sm }} />
          <Button label="Open Video in Browser" variant="outline" onPress={openVideo} />
        </>
      ) : (
        <LinearGradient
          colors={gradients.player}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {isReady ? (
            <>
              <View style={styles.playBtn}>
                <Icon name="play" size={26} color={colors.onPrimary} strokeWidth={2} />
              </View>
              <Text style={styles.videoActionText}>No uploaded video file</Text>
              <Text style={styles.heroMeta}>This tribute is marked ready, but no video URL is stored.</Text>
            </>
          ) : (
            <View style={styles.heroRendering}>
              <Badge label="Rendering" tone="warning" />
              <ProgressBar value={t.progress || 0.4} tone="warning" height={8} track="rgba(255,255,255,0.2)" style={styles.heroProgress} />
              <Text style={styles.heroMeta}>{pct}% · generating video</Text>
            </View>
          )}
        </LinearGradient>
      )}

      <Card style={{ marginTop: spacing.lg }}>
        <SectionHeader eyebrow="In their memory" title="Life story" />
        <Text style={styles.body}>{t.narrative}</Text>
        <Divider />
        <View style={styles.metaRow}>
          <Badge label={isReady ? 'Ready' : 'Rendering'} tone={isReady ? 'success' : 'warning'} />
          {t.hasQR ? (
            <Badge label={`QR · ${t.qrId}`} tone="default" />
          ) : (
            <Badge label="No QR yet" tone="info" />
          )}
        </View>
      </Card>

      <View style={{ height: spacing.lg }} />

      {isReady && !t.hasQR && (
        <Button label="Link a Legacy QR Code" onPress={() => navigation.getParent()?.navigate('QR')} />
      )}
      {isReady && t.hasQR && (
        <Button
          label="View in Public Viewer"
          onPress={() => navigation.getParent()?.navigate('Viewer', { id: t.id })}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  playBtn: {
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center', justifyContent: 'center',
    paddingLeft: 3,
  },
  heroMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroMeta: { color: colors.onDarkFaint, fontSize: 13 },
  videoActionText: { color: colors.onPrimary, fontSize: 14, fontWeight: '700' },
  heroDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.onDarkFaint, marginHorizontal: 3 },
  heroRendering: { alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, alignSelf: 'stretch' },
  heroProgress: { width: '80%', alignSelf: 'center' },

  body: { fontSize: 15, color: colors.inkMuted, lineHeight: 23 },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
