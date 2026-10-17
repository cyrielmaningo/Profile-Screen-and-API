import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

/** Minimal line icons for the bottom tab bar. */
export default function TabIcon({ name, color, size = 24, focused = false }) {
  const sw = focused ? 2.4 : 2;
  switch (name) {
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 10.5 12 3l9 7.5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M5 9.5V20h14V9.5" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'tributes':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="5" width="18" height="14" rx="3" stroke={color} strokeWidth={sw} />
          <Path d="M10 9.5v5l4-2.5-4-2.5Z" fill={color} />
        </Svg>
      );
    case 'qr':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={sw} />
          <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={sw} />
          <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth={sw} />
          <Rect x="15" y="15" width="2.5" height="2.5" fill={color} />
          <Rect x="19" y="19" width="2" height="2" fill={color} />
        </Svg>
      );
    case 'profile':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={sw} />
          <Path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    default:
      return null;
  }
}
