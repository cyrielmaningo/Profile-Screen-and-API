import React from 'react';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '../theme/theme';

/**
 * Real, scannable QR code renderer.
 *
 * Pass the full public memorial URL as `value`. A phone camera can then open
 * the zero-install memorial website directly after scanning.
 */
export default function QRDisplay({ value = 'https://memento.invalid', size = 200, color = colors.primaryDeep }) {
  return (
    <QRCode
      value={String(value)}
      size={size}
      color={color}
      backgroundColor="#FFFFFF"
    />
  );
}
