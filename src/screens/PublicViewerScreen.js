import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, spacing, radius } from '../theme/theme';
import { useApp } from '../store/AppContext';
import BrandLogo from '../components/BrandLogo';
import Icon from '../components/Icon';
import TributeVideoPlayer from '../components/TributeVideoPlayer';

/**
 * Public Reminiscence Web Framework (Public Viewer role).
 * Simulates the zero-install experience a visitor gets after scanning a
 * physical Legacy QR code: scan -> web player -> stream tribute + biography.
 */
export default function PublicViewerScreen({ navigation, route }) {
  const { tributes } = useApp();
  const preferred = route?.params?.id;
  const tribute =
    tributes.find((t) => t.id === String(preferred) && t.hasQR) ||
    tributes.find((t) => t.hasQR) ||
    tributes[0];

  const [stage, setStage] = useState('scan'); // scan -> loading -> player

  const scan = () => {
    setStage('loading');
    setTimeout(() => setStage('player'), 1400);
  };

  return (
    <View style={styles.fill}>
      <LinearGradient colors={gradients.hero} style={styles.fill}>
        <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
          <View style={styles.topBar}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
            <View style={styles.brandRow}>
              <View style={styles.brandBadge}>
                <BrandLogo size={20} />
              </View>
              <Text style={styles.brandText}>Memento Viewer</Text>
            </View>
            <View style={{ width: 20 }} />
          </View>

          {stage === 'scan' && (
            <View style={styles.center}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.tl]} />
                <View style={[styles.corner, styles.tr]} />
                <View style={[styles.corner, styles.bl]} />
                <View style={[styles.corner, styles.br]} />
                <Text style={styles.scanHint}>Point at a Legacy QR code</Text>
              </View>
              <Text style={styles.title}>Scan to remember</Text>
              <Text style={styles.sub}>
                A visitor scans the QR code placed on a headstone, plaque, or keepsake — no app to
                install.
              </Text>
              <Pressable style={styles.cta} onPress={scan}>
                <Text style={styles.ctaText}>Simulate Scan</Text>
              </Pressable>
            </View>
          )}

          {stage === 'loading' && (
            <View style={styles.center}>
              <View style={styles.spinner} />
              <Text style={styles.title}>Opening web player…</Text>
              <Text style={styles.sub}>Streaming a cloud-hosted tribute. Zero install.</Text>
            </View>
          )}

          {stage === 'player' && (
            <ScrollView contentContainerStyle={styles.playerScroll} showsVerticalScrollIndicator={false}>
              {tribute?.videoUrl ? (
                <TributeVideoPlayer uri={tribute.videoUrl} style={{ marginBottom: spacing.lg }} />
              ) : (
                <View style={styles.video}>
                  <View style={styles.playBtn}>
                    <Icon name="play" size={26} color={colors.onPrimary} strokeWidth={2} />
                  </View>
                  <Text style={styles.videoMeta}>Video not available</Text>
                </View>
              )}

              <Text style={styles.eyebrow}>In loving memory</Text>
              <Text style={styles.name}>{tribute?.name}</Text>
              <Text style={styles.years}>{tribute?.years}</Text>

              <View style={styles.bioPanel}>
                <View style={styles.bioHeadingRow}>
                  <Icon name="heart" size={15} color={colors.accentSoft} strokeWidth={1.8} />
                  <Text style={styles.bioHeading}>Their story</Text>
                </View>
                <Text style={styles.bioText}>{tribute?.narrative}</Text>
              </View>

              <Text style={styles.footerNote}>
                Presented by Memento · linked via {tribute?.qrId || 'MEM-XXXXX'}
              </Text>

              <Pressable style={styles.cta} onPress={() => setStage('scan')}>
                <Text style={styles.ctaText}>Scan Another</Text>
              </Pressable>
            </ScrollView>
          )}
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm,
  },
  close: { color: colors.onPrimary, fontSize: 20, fontWeight: '600' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandBadge: {
    width: 30, height: 30, borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  brandText: { color: colors.onPrimary, fontSize: 15, fontWeight: '700' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  scanFrame: {
    width: 220, height: 220, borderRadius: radius.lg, marginBottom: spacing.xl,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  corner: { position: 'absolute', width: 34, height: 34, borderColor: colors.accentSoft },
  tl: { top: 10, left: 10, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 },
  tr: { top: 10, right: 10, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 },
  bl: { bottom: 10, left: 10, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 },
  br: { bottom: 10, right: 10, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 },
  scanHint: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },

  title: { color: colors.onPrimary, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  sub: {
    color: 'rgba(255,255,255,0.8)', fontSize: 15, textAlign: 'center',
    lineHeight: 22, marginTop: spacing.sm, marginBottom: spacing.xl,
  },
  spinner: {
    width: 54, height: 54, borderRadius: 27, borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.25)', borderTopColor: colors.accentSoft, marginBottom: spacing.lg,
  },
  cta: {
    backgroundColor: colors.onPrimary, borderRadius: radius.pill,
    paddingVertical: 15, paddingHorizontal: spacing.xxl, alignItems: 'center',
  },
  ctaText: { color: colors.primaryDark, fontSize: 16, fontWeight: '800' },

  playerScroll: { padding: spacing.lg },
  video: {
    backgroundColor: colors.primaryDeep, borderRadius: radius.lg, height: 210,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg, gap: spacing.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  playBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center',
  },
  playIcon: { color: colors.onPrimary, fontSize: 24, marginLeft: 4 },
  videoMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accentSoft },
  videoMeta: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  eyebrow: {
    color: colors.accentSoft, fontSize: 12, fontWeight: '700',
    letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6,
  },
  name: { color: colors.onPrimary, fontSize: 26, fontWeight: '800' },
  years: { color: 'rgba(255,255,255,0.75)', fontSize: 15, marginTop: 2, marginBottom: spacing.lg },
  bioPanel: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  bioHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: spacing.sm },
  bioHeading: { color: colors.accentSoft, fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  bioText: { color: 'rgba(255,255,255,0.9)', fontSize: 16, lineHeight: 24 },
  footerNote: { color: 'rgba(255,255,255,0.55)', fontSize: 12, textAlign: 'center', marginVertical: spacing.lg },
});
