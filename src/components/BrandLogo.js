import React from 'react';
import { Image } from 'react-native';

/**
 * The real Memento bow mark, rendered from the brand PNG asset.
 * Square, aspect-preserving.
 */
export default function BrandLogo({ size = 40 }) {
  return (
    <Image
      source={require('../../assets/bow.png')}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
