import React from 'react';
import { StyleSheet, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { colors, radius } from '../theme/theme';

/**
 * Native/Expo video player used for both selected local files and uploaded
 * cloud videos. Keeping this in one component avoids showing a fake play card
 * after an upload has completed.
 */
export default function TributeVideoPlayer({ uri, style }) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
  });

  return (
    <View style={[styles.shell, style]}>
      <VideoView
        player={player}
        style={styles.video}
        nativeControls
        contentFit="contain"
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#08060B',
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  video: {
    flex: 1,
    backgroundColor: '#08060B',
  },
});
