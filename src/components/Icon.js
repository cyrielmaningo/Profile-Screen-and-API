import React from 'react';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { colors } from '../theme/theme';

/**
 * Small inline SVG icon set (stroke-based, 24x24 grid) for the auth flow.
 * No external icon dependency — everything is drawn with react-native-svg.
 * Usage: <Icon name="mail" size={18} color={colors.inkFaint} />
 */
export default function Icon({ name, size = 20, color = colors.inkMuted, strokeWidth = 1.8 }) {
  const common = {
    stroke: color,
    strokeWidth,
    fill: 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'mail' && (
        <>
          <Rect x="3" y="5" width="18" height="14" rx="3" {...common} />
          <Path d="M3.5 7.5 L12 13 L20.5 7.5" {...common} />
        </>
      )}
      {name === 'lock' && (
        <>
          <Rect x="4.5" y="10.5" width="15" height="9.5" rx="2.4" {...common} />
          <Path d="M8 10.5 V8 a4 4 0 0 1 8 0 v2.5" {...common} />
          <Circle cx="12" cy="15" r="1.4" fill={color} stroke="none" />
        </>
      )}
      {name === 'user' && (
        <>
          <Circle cx="12" cy="8.5" r="3.6" {...common} />
          <Path d="M5 20 c0-3.6 3.1-6 7-6 s7 2.4 7 6" {...common} />
        </>
      )}
      {name === 'eye' && (
        <>
          <Path d="M2.5 12 C4.8 7.5 8.2 5.3 12 5.3 s7.2 2.2 9.5 6.7 C19.2 16.5 15.8 18.7 12 18.7 S4.8 16.5 2.5 12 Z" {...common} />
          <Circle cx="12" cy="12" r="3" {...common} />
        </>
      )}
      {name === 'eye-off' && (
        <>
          <Path d="M3 12 C5.2 7.8 8.4 5.6 12 5.6 c1.4 0 2.7 0.3 3.9 0.9" {...common} />
          <Path d="M20.6 9.4 C21 10.2 21 10.2 21.4 11 21 12 21 12 21 12 18.8 16.2 15.6 18.4 12 18.4 c-1 0-1.9-0.15-2.8-0.45" {...common} />
          <Circle cx="12" cy="12" r="3" {...common} />
          <Line x1="4" y1="4" x2="20" y2="20" {...common} />
        </>
      )}
      {name === 'arrow-right' && (
        <>
          <Line x1="4.5" y1="12" x2="18.5" y2="12" {...common} />
          <Path d="M13 6.5 L19 12 L13 17.5" {...common} />
        </>
      )}
      {name === 'shield' && (
        <>
          <Path d="M12 3 L19 5.6 V11 c0 4.4-3 7.6-7 9 -4-1.4-7-4.6-7-9 V5.6 Z" {...common} />
          <Path d="M9 12 L11.2 14.2 L15.2 9.8" {...common} />
        </>
      )}
      {name === 'home' && (
        <>
          <Path d="M4 11 L12 4 L20 11" {...common} />
          <Path d="M6 10 V19 a1 1 0 0 0 1 1 h10 a1 1 0 0 0 1-1 V10" {...common} />
        </>
      )}
      {name === 'film' && (
        <>
          <Rect x="3.5" y="5" width="17" height="14" rx="2.6" {...common} />
          <Path d="M14.5 12 L10.5 9.6 v4.8 Z" fill={color} stroke="none" />
        </>
      )}
      {name === 'play' && (
        <Path d="M8 6.5 L17.5 12 L8 17.5 Z" {...common} fill={color} />
      )}
      {name === 'qr' && (
        <>
          <Rect x="4" y="4" width="6" height="6" rx="1.4" {...common} />
          <Rect x="14" y="4" width="6" height="6" rx="1.4" {...common} />
          <Rect x="4" y="14" width="6" height="6" rx="1.4" {...common} />
          <Rect x="14.5" y="14.5" width="2" height="2" fill={color} stroke="none" />
          <Rect x="18.5" y="14.5" width="1.5" height="1.5" fill={color} stroke="none" />
          <Rect x="14.5" y="18.5" width="1.5" height="1.5" fill={color} stroke="none" />
          <Rect x="18" y="18" width="2" height="2" fill={color} stroke="none" />
        </>
      )}
      {name === 'plus' && (
        <>
          <Line x1="12" y1="5.5" x2="12" y2="18.5" {...common} />
          <Line x1="5.5" y1="12" x2="18.5" y2="12" {...common} />
        </>
      )}
      {name === 'chevron-right' && (
        <Path d="M9.5 5.5 L16 12 L9.5 18.5" {...common} />
      )}
      {name === 'clock' && (
        <>
          <Circle cx="12" cy="12" r="8.2" {...common} />
          <Path d="M12 7.5 V12 L15 14" {...common} />
        </>
      )}
      {name === 'image' && (
        <>
          <Rect x="3.5" y="4.5" width="17" height="15" rx="2.6" {...common} />
          <Circle cx="8.5" cy="9.5" r="1.7" {...common} />
          <Path d="M4.5 17 L9.5 12.5 L13 15.5 L16 12.5 L20 16.5" {...common} />
        </>
      )}
      {name === 'download' && (
        <>
          <Path d="M12 4 V14.5" {...common} />
          <Path d="M8 11 L12 15 L16 11" {...common} />
          <Path d="M5 18.5 H19" {...common} />
        </>
      )}
      {name === 'heart' && (
        <Path d="M12 20 C6 16 3.5 12.6 3.5 9.2 A4.2 4.2 0 0 1 12 7 A4.2 4.2 0 0 1 20.5 9.2 C20.5 12.6 18 16 12 20 Z" {...common} />
      )}
      {name === 'sparkle' && (
        <>
          <Path d="M12 3.5 C12.6 8 13.8 9.4 18.5 10 C13.8 10.6 12.6 12 12 16.5 C11.4 12 10.2 10.6 5.5 10 C10.2 9.4 11.4 8 12 3.5 Z" {...common} />
          <Path d="M18 15 C18.2 16.7 18.6 17.2 20.3 17.5 C18.6 17.8 18.2 18.3 18 20 C17.8 18.3 17.4 17.8 15.7 17.5 C17.4 17.2 17.8 16.7 18 15 Z" {...common} fill={color} />
        </>
      )}
      {name === 'check' && (
        <Path d="M5 12.5 L10 17.5 L19 7" {...common} />
      )}
      {name === 'share' && (
        <>
          <Circle cx="17.5" cy="6" r="2.4" {...common} />
          <Circle cx="6.5" cy="12" r="2.4" {...common} />
          <Circle cx="17.5" cy="18" r="2.4" {...common} />
          <Line x1="8.7" y1="10.9" x2="15.3" y2="7.1" {...common} />
          <Line x1="8.7" y1="13.1" x2="15.3" y2="16.9" {...common} />
        </>
      )}
      {name === 'cloud' && (
        <Path d="M7.5 18 A3.8 3.8 0 0 1 7 10.5 A4.8 4.8 0 0 1 16.3 9.6 A3.6 3.6 0 0 1 16.8 18 Z" {...common} />
      )}
      {name === 'link' && (
        <>
          <Path d="M9.5 14.5 L14.5 9.5" {...common} />
          <Path d="M8 12 L6.5 13.5 a3 3 0 0 0 4.2 4.2 L12.2 16" {...common} />
          <Path d="M16 12 L17.5 10.5 a3 3 0 0 0-4.2-4.2 L11.8 8" {...common} />
        </>
      )}
      {name === 'edit' && (
        <>
          <Path d="M5 19 L5 15.5 L15.5 5 L19 8.5 L8.5 19 Z" {...common} />
          <Line x1="13" y1="7.5" x2="16.5" y2="11" {...common} />
        </>
      )}
      {name === 'key' && (
        <>
          <Circle cx="8" cy="8" r="3.6" {...common} />
          <Path d="M10.6 10.6 L19 19" {...common} />
          <Path d="M16 16 L18 14" {...common} />
        </>
      )}
      {name === 'crown' && (
        <Path d="M4.5 17.5 L4 8 L8.5 11 L12 5.5 L15.5 11 L20 8 L19.5 17.5 Z" {...common} />
      )}
      {name === 'logout' && (
        <>
          <Path d="M14 5 H6.5 a1.5 1.5 0 0 0-1.5 1.5 v11 a1.5 1.5 0 0 0 1.5 1.5 H14" {...common} />
          <Path d="M17 8 L21 12 L17 16" {...common} />
          <Line x1="21" y1="12" x2="10" y2="12" {...common} />
        </>
      )}
      {name === 'alert-circle' && (
        <>
          <Circle cx="12" cy="12" r="8.5" {...common} />
          <Line x1="12" y1="7.5" x2="12" y2="13" {...common} />
          <Circle cx="12" cy="16.7" r="1" fill={color} stroke="none" />
        </>
      )}
    </Svg>
  );
}
