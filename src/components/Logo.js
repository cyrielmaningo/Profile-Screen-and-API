import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, G } from 'react-native-svg';
import { colors, radius } from '../theme/theme';

/**
 * A compact QR-inspired monogram used as the Memento mark.
 * The pattern nods to the logo's QR-patterned ribbon; the "M"
 * negative space is carved from a small module grid.
 */

// 7x7 module map. 1 = filled, 0 = empty. Shaped to suggest an "M".
const GRID = [
  [1, 0, 1, 1, 1, 0, 1],
  [1, 1, 0, 1, 0, 1, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1],
];

export function LogoMark({ size = 64, color = colors.onPrimary, bg = 'transparent' }) {
  const modules = GRID.length;
  const cell = size / modules;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {bg !== 'transparent' && (
        <Rect x={0} y={0} width={size} height={size} rx={size * 0.18} fill={bg} />
      )}
      <G>
        {GRID.map((row, r) =>
          row.map((v, c) =>
            v ? (
              <Rect
                key={`${r}-${c}`}
                x={c * cell + cell * 0.08}
                y={r * cell + cell * 0.08}
                width={cell * 0.84}
                height={cell * 0.84}
                rx={cell * 0.18}
                fill={color}
              />
            ) : null
          )
        )}
      </G>
    </Svg>
  );
}

/** Full lockup: monogram tile + wordmark. */
export function LogoLockup({ tileSize = 56, tint = colors.primary, onDark = false }) {
  return (
    <View style={styles.row}>
      <View style={[styles.tile, { backgroundColor: onDark ? 'rgba(255,255,255,0.12)' : colors.primary }]}>
        <LogoMark size={tileSize * 0.66} color={colors.onPrimary} />
      </View>
      <Text style={[styles.word, { color: onDark ? colors.onPrimary : tint }]}>Memento</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  tile: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  word: { fontSize: 30, fontWeight: '800', letterSpacing: 0.5 },
});

export default LogoMark;
