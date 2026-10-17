import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, G } from 'react-native-svg';
import { LogoMark } from './Logo';

/**
 * HeaderDecor — the signature texture behind the auth header.
 *
 * Layers, all very low opacity so they read as intentional craft, not noise:
 *   1. A soft radial glow in the upper-right (adds depth to the flat gradient).
 *   2. A fine QR-module grid — a nod to the Legacy QR motif of the brand.
 *   3. An oversized, faint QR monogram watermark bleeding off the bottom-right.
 *
 * Purely decorative: absolutely fills its parent and ignores touches.
 */

// Deterministic QR-ish module map (16 cols x 12 rows). Woven, not random,
// so it tiles the header with a calm, even rhythm.
const COLS = 16;
const ROWS = 12;
const MODULES = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    // Stable pseudo-pattern — carves quiet zones so it feels like real QR fabric.
    const on = (r * 5 + c * 3 + ((r * c) % 7)) % 4 === 0;
    if (on) MODULES.push({ r, c });
  }
}

export default function HeaderDecor({ tint = '#FFFFFF' }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${COLS} ${ROWS}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          <RadialGradient id="glow" cx="82%" cy="8%" r="70%">
            <Stop offset="0" stopColor={tint} stopOpacity={0.16} />
            <Stop offset="0.55" stopColor={tint} stopOpacity={0.04} />
            <Stop offset="1" stopColor={tint} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* soft radial glow */}
        <Rect x="0" y="0" width={COLS} height={ROWS} fill="url(#glow)" />

        {/* fine QR-module grid texture */}
        <G>
          {MODULES.map(({ r, c }) => (
            <Rect
              key={`${r}-${c}`}
              x={c + 0.16}
              y={r + 0.16}
              width={0.68}
              height={0.68}
              rx={0.14}
              fill={tint}
              opacity={0.06}
            />
          ))}
        </G>
      </Svg>

      {/* oversized monogram watermark, bleeding off the bottom-right corner */}
      <View style={styles.watermark} pointerEvents="none">
        <LogoMark size={260} color="rgba(255,255,255,0.05)" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  watermark: {
    position: 'absolute',
    right: -70,
    bottom: -96,
    transform: [{ rotate: '-8deg' }],
  },
});
