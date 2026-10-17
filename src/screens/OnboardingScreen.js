import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Path, Circle, G } from 'react-native-svg';
import { colors, gradients, spacing, radius, typography } from '../theme/theme';
import BrandLogo from '../components/BrandLogo';

const { width } = Dimensions.get('window');

/**
 * Onboarding: a 4-slide summary of what Memento is and does, mapped to the
 * app's four feature areas (from the FDD): create AI video tributes, mint a
 * Legacy QR code, let anyone reminisce by scanning, all kept in cloud memory.
 */
const SLIDES = [
  {
    key: 'welcome',
    art: 'logo',
    title: 'Welcome to Memento',
    body:
      'A gentle way to keep a loved one’s story alive. Memento turns memories into a lasting, shareable tribute — triggered by a simple scan.',
  },
  {
    key: 'tribute',
    art: 'film',
    title: 'AI Video Tributes',
    body:
      'Write a life-story narrative, add a few photos, and Memento generates a heartfelt video tribute you can preview and save to cloud memory.',
  },
  {
    key: 'qr',
    art: 'qr',
    title: 'A Legacy QR Code',
    body:
      'Mint a unique QR code linked to the tribute. Print it for a headstone, plaque, or keepsake — a doorway to remembrance that lasts.',
  },
  {
    key: 'viewer',
    art: 'scan',
    title: 'Reminiscence, Anywhere',
    body:
      'Anyone who scans it opens a zero-install web player — streaming the tribute and biography instantly, with no app to download.',
  },
];

/* --------------------------------- Artwork -------------------------------- */
function Artwork({ type }) {
  const S = 150;
  if (type === 'logo') {
    return (
      <View style={[styles.artTile, styles.logoTile]}>
        <BrandLogo size={132} />
      </View>
    );
  }
  if (type === 'film') {
    return (
      <View style={styles.artTile}>
        <Svg width={S} height={S} viewBox="0 0 100 100">
          <Rect x="18" y="26" width="64" height="48" rx="8" fill="rgba(255,255,255,0.14)" />
          <Rect x="26" y="34" width="40" height="32" rx="4" fill={colors.onPrimary} opacity={0.9} />
          <Path d="M44 42 L58 50 L44 58 Z" fill={colors.primary} />
          <Rect x="70" y="36" width="10" height="28" rx="3" fill={colors.accentSoft} />
        </Svg>
      </View>
    );
  }
  if (type === 'qr') {
    // small QR-like grid
    const cells = [
      [1,1,1,0,1,1,1],
      [1,0,1,0,1,0,1],
      [1,1,1,0,1,1,1],
      [0,0,0,1,0,0,0],
      [1,1,0,1,0,1,1],
      [1,0,1,0,1,0,1],
      [1,1,1,0,1,1,1],
    ];
    const c = 11;
    // Grid span = 6*c + (c-2) = 75 within a 100x100 viewBox.
    // Center it: offset = (100 - 75) / 2 = 12.5 (was 22, which pushed it right).
    const span = 6 * c + (c - 2);
    const offset = (100 - span) / 2;
    return (
      <View style={styles.artTile}>
        <Svg width={S} height={S} viewBox="0 0 100 100">
          <G>
            {cells.map((row, r) =>
              row.map((v, col) =>
                v ? (
                  <Rect
                    key={`${r}-${col}`}
                    x={offset + col * c}
                    y={offset + r * c}
                    width={c - 2}
                    height={c - 2}
                    rx={1.5}
                    fill={colors.onPrimary}
                  />
                ) : null
              )
            )}
          </G>
        </Svg>
      </View>
    );
  }
  // scan
  return (
    <View style={styles.artTile}>
      <Svg width={S} height={S} viewBox="0 0 100 100">
        <Path d="M28 20 H20 V28" stroke={colors.onPrimary} strokeWidth="4" fill="none" strokeLinecap="round" />
        <Path d="M72 20 H80 V28" stroke={colors.onPrimary} strokeWidth="4" fill="none" strokeLinecap="round" />
        <Path d="M28 80 H20 V72" stroke={colors.onPrimary} strokeWidth="4" fill="none" strokeLinecap="round" />
        <Path d="M72 80 H80 V72" stroke={colors.onPrimary} strokeWidth="4" fill="none" strokeLinecap="round" />
        <Rect x="34" y="34" width="32" height="32" rx="5" fill="rgba(255,255,255,0.18)" />
        <Circle cx="50" cy="50" r="9" fill={colors.accentSoft} />
        <Path d="M22 50 H78" stroke={colors.accentSoft} strokeWidth="2.5" strokeLinecap="round" opacity={0.6} />
      </Svg>
    </View>
  );
}

/* ---------------------------------- Slide --------------------------------- */
function Slide({ item }) {
  return (
    <View style={[styles.slide, { width }]}>
      <Artwork type={item.art} />
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideBody}>{item.body}</Text>
    </View>
  );
}

/* ------------------------------- Onboarding ------------------------------- */
export default function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);
  const isLast = index === SLIDES.length - 1;

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems?.length) setIndex(viewableItems[0].index ?? 0);
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 60 });

  const finish = () => navigation.replace('Auth', { screen: 'Login' });

  const next = () => {
    if (isLast) finish();
    else listRef.current?.scrollToIndex({ index: index + 1 });
  };

  return (
    <LinearGradient colors={gradients.hero} style={styles.fill}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.brandBadge}>
              <BrandLogo size={24} />
            </View>
            <Text style={styles.brandText}>Memento</Text>
          </View>
          {!isLast && (
            <Pressable onPress={finish} hitSlop={12}>
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(i) => i.key}
          renderItem={({ item }) => <Slide item={item} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>

          <Pressable onPress={next} style={styles.cta}>
            <Text style={styles.ctaText}>{isLast ? 'Get Started' : 'Next'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandBadge: {
    width: 32, height: 32, borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  brandText: { color: colors.onPrimary, fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  skip: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '600' },

  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  artTile: {
    width: 180,
    height: 180,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  logoTile: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0,0,0,0.06)',
  },
  slideTitle: {
    color: colors.onPrimary,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: 0.3,
  },
  slideBody: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },

  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.lg, gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: { width: 22, backgroundColor: colors.onPrimary },

  cta: {
    backgroundColor: colors.onPrimary,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: colors.primaryDark, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
