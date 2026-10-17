import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../../components/Screen';
import { Button, TextField, Card, ProgressBar, IconTile } from '../../components/ui';
import Icon from '../../components/Icon';
import TributeVideoPlayer from '../../components/TributeVideoPlayer';
import { useApp } from '../../store/AppContext';
import { uploadVideo } from '../../api/client';
import { colors, gradients, spacing, radius, shadow } from '../../theme/theme';

const UPLOAD_STEPS = ['Details', 'Upload', 'Preview'];
const AI_STEPS = ['Story', 'Photos', 'Generate', 'Preview'];

function yearFromDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value).slice(0, 4) : String(d.getFullYear());
}

function memorialYears(profile) {
  const birth = yearFromDate(profile?.birthDate);
  const death = yearFromDate(profile?.deathDate);
  if (birth && death) return `${birth} – ${death}`;
  if (birth) return `Born ${birth}`;
  if (death) return `Passed ${death}`;
  return '—';
}

function Stepper({ steps, step }) {
  const last = steps.length - 1;
  return (
    <View style={styles.stepper}>
      {steps.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <View key={label} style={styles.stepCol}>
            <View style={styles.rail}>
              {/* left connector */}
              <View
                style={[
                  styles.railSeg,
                  styles.railLeft,
                  { backgroundColor: step >= i ? colors.primary : colors.track },
                  i === 0 && styles.railHidden,
                ]}
              />
              {/* right connector */}
              <View
                style={[
                  styles.railSeg,
                  styles.railRight,
                  { backgroundColor: step > i ? colors.primary : colors.track },
                  i === last && styles.railHidden,
                ]}
              />
              <View
                style={[
                  styles.stepDot,
                  done && styles.stepDotDone,
                  active && styles.stepDotActive,
                ]}
              >
                {done ? (
                  <Icon name="check" size={16} color={colors.onPrimary} strokeWidth={2.6} />
                ) : (
                  <Text style={[styles.stepNum, active && styles.stepNumActive]}>{i + 1}</Text>
                )}
              </View>
            </View>
            <Text style={[styles.stepLabel, (active || done) && styles.stepLabelOn]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

/* A large, intentional option card for the method chooser. */
function MethodCard({ icon, title, desc, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.method,
        shadow.card,
        pressed && styles.methodPressed,
      ]}
    >
      <IconTile name={icon} size={52} tone="brand" />
      <View style={{ flex: 1 }}>
        <Text style={styles.methodTitle}>{title}</Text>
        <Text style={styles.methodDesc}>{desc}</Text>
      </View>
      <View style={styles.methodChevron}>
        <Icon name="chevron-right" size={20} color={colors.inkFaint} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

export default function CreateTributeScreen({ navigation }) {
  const { addTribute, activeProfile } = useApp();

  // Path selection: null (chooser) | 'upload' | 'ai'
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(0);

  // Shared: their story
  const [name] = useState(activeProfile?.displayName || '');
  const [years] = useState(memorialYears(activeProfile));
  const [narrative, setNarrative] = useState(activeProfile?.biography || '');

  // Upload flow: chosen video
  const [video, setVideo] = useState(null); // { uri, name, mimeType }
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // AI flow: images
  const [images, setImages] = useState(0);

  // AI flow: generation
  const [progress, setProgress] = useState(0);
  const [rendering, setRendering] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => timer.current && clearInterval(timer.current), []);

  const STEPS = mode === 'upload' ? UPLOAD_STEPS : AI_STEPS;

  const chooseMode = (m) => {
    setMode(m);
    setStep(0);
  };

  const resetToChooser = () => {
    setMode(null);
    setStep(0);
  };

  const pickVideo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo/video access to upload a tribute.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
    });
    if (res.assets && res.assets.length > 0) {
      const asset = res.assets[0];
      const fallbackName = asset.mimeType === 'video/quicktime'
        ? 'tribute-video.mov'
        : asset.mimeType === 'video/webm'
          ? 'tribute-video.webm'
          : 'tribute-video.mp4';
      setVideo({
        uri: asset.uri,
        name: asset.fileName || fallbackName,
        mimeType: asset.mimeType || 'video/mp4',
      });
    }
  };

  const runGeneration = () => {
    setRendering(true);
    setProgress(0);
    setDone(false);
    timer.current = setInterval(() => {
      setProgress((p) => {
        const nextP = p + 0.08;
        if (nextP >= 1) {
          clearInterval(timer.current);
          setRendering(false);
          setDone(true);
          return 1;
        }
        return nextP;
      });
    }, 350);
  };

  const saveAI = async () => {
    await addTribute({
      name: name || 'Untitled Tribute',
      years: years || '—',
      narrative: [name || 'Untitled Tribute', years || '—', narrative].join('\n'),
      images,
      status: 'ready',
      duration: '2:00',
      hasQR: false,
      qrId: null,
      source: 'ai',
    });
    navigation.navigate('TributesList');
  };

  const saveUpload = async () => {
    if (!video?.uri || uploadingVideo) return;

    setUploadingVideo(true);
    try {
      const uploaded = await uploadVideo(video);
      await addTribute({
        name: name || 'Untitled Tribute',
        years: years || '—',
        narrative: [name || 'Untitled Tribute', years || '—', narrative || 'Uploaded tribute video'].join('\n'),
        images: 0,
        status: 'ready',
        duration: '—',
        hasQR: false,
        qrId: null,
        source: 'upload',
        videoUrl: uploaded?.url || null,
        videoName: video?.name || null,
      });
      navigation.navigate('TributesList');
    } catch (err) {
      Alert.alert('Video upload failed', err.message || 'Unable to save this video to Memento.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const subtitle =
    mode === null
      ? 'Choose how you want to create it'
      : mode === 'upload'
      ? 'Add your own tribute video'
      : 'A few gentle steps to a lasting memory';

  return (
    <Screen eyebrow={`Remembering ${activeProfile?.displayName || 'a loved one'}`} title="Create a tribute" subtitle={subtitle}>
      {/* ------------------------------ CHOOSER ------------------------------ */}
      {mode === null && (
        <View>
          <MethodCard
            icon="film"
            title="Upload a video"
            desc="Already have a tribute video? Add it."
            onPress={() => chooseMode('upload')}
          />
          <View style={{ height: spacing.md }} />
          <MethodCard
            icon="sparkle"
            title="Generate with AI"
            desc="Create one from a story and photos."
            onPress={() => chooseMode('ai')}
          />
          <Text style={styles.chooserNote}>
            Uploading keeps your original footage. AI generation is optional.
          </Text>
        </View>
      )}

      {/* ------------------------- ACTIVE FLOW STEPPER ----------------------- */}
      {mode !== null && <Stepper steps={STEPS} step={step} />}

      {/* ============================ UPLOAD FLOW =========================== */}
      {mode === 'upload' && step === 0 && (
        <Card>
          <View style={styles.cardHead}>
            <IconTile name="edit" size={40} tone="brand" />
            <View style={{ flex: 1 }}>
              <Text style={styles.h}>Their story</Text>
              <Text style={styles.p}>Start with a name and a few words to honor them.</Text>
            </View>
          </View>
          <TextField
            label="Their name"
            icon="user"
            placeholder="Eleanor M. Hayes"
            value={name}
            editable={false}
            hint="This tribute will be saved under the memorial profile you selected after login."
          />
          <TextField label="Years" icon="clock" placeholder="1948 – 2023" value={years} editable={false} />
          <TextField
            label="Life story narrative"
            placeholder="Share who they were — their passions, their people, the moments that defined them…"
            multiline
            hint="This biography appears in the public viewer alongside your video."
            value={narrative}
            onChangeText={setNarrative}
          />
          <Button label="Continue" onPress={() => setStep(1)} disabled={!name} />
          <Pressable onPress={resetToChooser} style={styles.changeBtn} hitSlop={8}>
            <Text style={styles.changeText}>Change method</Text>
          </Pressable>
        </Card>
      )}

      {mode === 'upload' && step === 1 && (
        <Card>
          <View style={styles.cardHead}>
            <IconTile name="film" size={40} tone="brand" />
            <View style={{ flex: 1 }}>
              <Text style={styles.h}>Upload your video</Text>
              <Text style={styles.p}>Pick a tribute video from your library — we keep the original.</Text>
            </View>
          </View>

          {!video ? (
            <Pressable style={styles.dropzone} onPress={pickVideo}>
              <View style={styles.dropIcon}>
                <Icon name="cloud" size={30} color={colors.primary} strokeWidth={1.9} />
              </View>
              <Text style={styles.dropTitle}>Tap to choose a video</Text>
              <Text style={styles.dropHint}>MP4, MOV and more from your photo library</Text>
            </Pressable>
          ) : (
            <View style={styles.fileCard}>
              <IconTile name="film" size={44} tone="lavender" />
              <View style={{ flex: 1 }}>
                <Text style={styles.fileName} numberOfLines={1}>{video.name}</Text>
                <Text style={styles.fileMeta}>Ready to save</Text>
              </View>
              <Icon name="check" size={20} color={colors.success} strokeWidth={2.4} />
            </View>
          )}

          {video && (
            <View style={styles.fileActions}>
              <Pressable onPress={pickVideo} hitSlop={8}>
                <Text style={styles.linkAction}>Change</Text>
              </Pressable>
              <Pressable onPress={() => setVideo(null)} hitSlop={8}>
                <Text style={[styles.linkAction, styles.linkDanger]}>Remove</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.row}>
            <Button label="Back" variant="outline" onPress={() => setStep(0)} style={styles.half} />
            <Button label="Continue" onPress={() => setStep(2)} disabled={!video} style={styles.half} />
          </View>
        </Card>
      )}

      {mode === 'upload' && step === 2 && (
        <Card>
          <View style={styles.cardHead}>
            <IconTile name="play" size={40} tone="brand" />
            <View style={{ flex: 1 }}>
              <Text style={styles.h}>Preview</Text>
              <Text style={styles.p}>A first look at the tribute you're about to save.</Text>
            </View>
          </View>

          {video?.uri ? (
            <View style={{ gap: spacing.sm }}>
              <TributeVideoPlayer uri={video.uri} />
              <Text style={styles.fileMeta} numberOfLines={1}>
                Previewing {video?.name || 'tribute-video.mp4'}
              </Text>
            </View>
          ) : null}

          <Text style={styles.p}>
            Happy with it? Save to cloud memory — then mint a Legacy QR code to share.
          </Text>
          <View style={styles.row}>
            <Button label="Back" variant="outline" onPress={() => setStep(1)} style={styles.half} />
            <Button
              label={uploadingVideo ? 'Uploading…' : 'Save to Cloud'}
              onPress={saveUpload}
              disabled={uploadingVideo}
              style={styles.half}
            />
          </View>
        </Card>
      )}

      {/* ============================== AI FLOW ============================= */}
      {mode === 'ai' && step === 0 && (
        <Card>
          <View style={styles.cardHead}>
            <IconTile name="edit" size={40} tone="brand" />
            <View style={{ flex: 1 }}>
              <Text style={styles.h}>Their story</Text>
              <Text style={styles.p}>Start with a name and the story you want to honor.</Text>
            </View>
          </View>
          <TextField
            label="Their name"
            icon="user"
            placeholder="Eleanor M. Hayes"
            value={name}
            editable={false}
            hint="This tribute will be saved under the memorial profile you selected after login."
          />
          <TextField label="Years" icon="clock" placeholder="1948 – 2023" value={years} editable={false} />
          <TextField
            label="Life story narrative"
            placeholder="Share who they were — their passions, their people, the moments that defined them…"
            multiline
            hint="This narrative guides the AI video. The more heartfelt detail, the better."
            value={narrative}
            onChangeText={setNarrative}
          />
          <Button label="Continue" onPress={() => setStep(1)} disabled={!name || !narrative} />
          <Pressable onPress={resetToChooser} style={styles.changeBtn} hitSlop={8}>
            <Text style={styles.changeText}>Change method</Text>
          </Pressable>
        </Card>
      )}

      {mode === 'ai' && step === 1 && (
        <Card>
          <View style={styles.cardHead}>
            <IconTile name="image" size={40} tone="brand" />
            <View style={{ flex: 1 }}>
              <Text style={styles.h}>Add photos</Text>
              <Text style={styles.p}>Portraits, places, and cherished moments make it personal.</Text>
            </View>
          </View>
          <View style={styles.uploadGrid}>
            {Array.from({ length: images }).map((_, i) => (
              <View key={i} style={styles.uploadTile}>
                <Icon name="image" size={22} color={colors.primary} strokeWidth={1.9} />
                <Text style={styles.uploadTileText}>IMG {i + 1}</Text>
              </View>
            ))}
            <Pressable style={styles.uploadAdd} onPress={() => setImages((n) => n + 1)}>
              <Icon name="plus" size={26} color={colors.accent} strokeWidth={2} />
              <Text style={styles.uploadAddText}>Add</Text>
            </Pressable>
          </View>
          <Text style={styles.count}>{images} photo{images === 1 ? '' : 's'} added</Text>
          <View style={styles.row}>
            <Button label="Back" variant="outline" onPress={() => setStep(0)} style={styles.half} />
            <Button label="Continue" onPress={() => setStep(2)} style={styles.half} />
          </View>
        </Card>
      )}

      {mode === 'ai' && step === 2 && (
        <Card>
          <View style={styles.cardHead}>
            <IconTile name="sparkle" size={40} tone="brand" />
            <View style={{ flex: 1 }}>
              <Text style={styles.h}>Generate the video</Text>
              <Text style={styles.p}>Memento weaves your narrative and photos into a tribute — usually a few minutes.</Text>
            </View>
          </View>

          {!rendering && !done && (
            <Button label="Run Text-to-Video Generation" onPress={runGeneration} />
          )}

          {(rendering || done) && (
            <View style={styles.progressWrap}>
              <ProgressBar value={progress} tone={done ? 'success' : 'brand'} height={10} />
              <View style={styles.progressRow}>
                {rendering && <ActivityIndicator size="small" color={colors.primary} />}
                {done && <Icon name="check" size={18} color={colors.success} strokeWidth={2.4} />}
                <Text style={[styles.progressText, done && { color: colors.success }]}>
                  {done ? 'Render complete' : `Rendering… ${Math.round(progress * 100)}%`}
                </Text>
              </View>
            </View>
          )}

          {done && (
            <View style={styles.row}>
              <Button label="Back" variant="outline" onPress={() => setStep(1)} style={styles.half} />
              <Button label="Preview" onPress={() => setStep(3)} style={styles.half} />
            </View>
          )}
        </Card>
      )}

      {mode === 'ai' && step === 3 && (
        <Card>
          <View style={styles.cardHead}>
            <IconTile name="play" size={40} tone="brand" />
            <View style={{ flex: 1 }}>
              <Text style={styles.h}>Preview</Text>
              <Text style={styles.p}>A first look at the finished tribute.</Text>
            </View>
          </View>

          <LinearGradient
            colors={gradients.player}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.player}
          >
            <View style={styles.playBtn}>
              <Icon name="play" size={24} color={colors.onPrimary} strokeWidth={2} />
            </View>
            <Text style={styles.playerName}>{name || 'Your tribute'}</Text>
            <View style={styles.playerMetaRow}>
              <Icon name="clock" size={13} color={colors.onDarkFaint} strokeWidth={1.9} />
              <Text style={styles.playerMeta}>2:00</Text>
              <View style={styles.playerDot} />
              <Icon name="image" size={13} color={colors.onDarkFaint} strokeWidth={1.9} />
              <Text style={styles.playerMeta}>{images} photos</Text>
            </View>
          </LinearGradient>

          <Text style={styles.p}>
            Happy with it? Save to cloud memory — then mint a Legacy QR code to share.
          </Text>
          <View style={styles.row}>
            <Button label="Re-generate" variant="outline" onPress={() => setStep(2)} style={styles.half} />
            <Button label="Save to Cloud" onPress={saveAI} style={styles.half} />
          </View>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: 'row', marginBottom: spacing.lg },
  stepCol: { flex: 1, alignItems: 'center' },
  rail: { width: '100%', height: 34, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  railSeg: { position: 'absolute', top: 15.5, height: 3 },
  railLeft: { left: 0, right: '50%' },
  railRight: { left: '50%', right: 0 },
  railHidden: { backgroundColor: 'transparent' },
  stepDot: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 2, borderColor: colors.track,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepDotActive: { backgroundColor: colors.surface, borderColor: colors.primary, ...shadow.soft },
  stepNum: { fontWeight: '800', color: colors.inkFaint, fontSize: 14 },
  stepNumActive: { color: colors.primary },
  stepLabel: { fontSize: 11.5, color: colors.inkFaint, fontWeight: '600' },
  stepLabelOn: { color: colors.primary },

  // Method chooser
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodPressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },
  methodTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  methodDesc: { fontSize: 13.5, color: colors.inkMuted, lineHeight: 19, marginTop: 3 },
  methodChevron: { marginLeft: 2 },
  chooserNote: {
    fontSize: 12.5, color: colors.inkFaint, textAlign: 'center',
    marginTop: spacing.lg, lineHeight: 18, paddingHorizontal: spacing.md,
  },

  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  h: { fontSize: 17, fontWeight: '700', color: colors.ink },
  p: { fontSize: 13.5, color: colors.inkMuted, lineHeight: 19, marginTop: 3 },

  // Upload dropzone
  dropzone: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.accent,
    borderStyle: 'dashed',
    backgroundColor: colors.lavenderMist,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  dropIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.lavender,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  dropTitle: { fontSize: 15.5, fontWeight: '700', color: colors.ink },
  dropHint: { fontSize: 12.5, color: colors.inkMuted },

  // Chosen file card
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  fileName: { fontSize: 15, fontWeight: '700', color: colors.ink },
  fileMeta: { fontSize: 12.5, color: colors.inkMuted, marginTop: 2 },
  fileActions: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md, marginLeft: 2 },
  linkAction: { fontSize: 14, fontWeight: '700', color: colors.primary },
  linkDanger: { color: colors.warning },

  changeBtn: { alignSelf: 'center', marginTop: spacing.sm, paddingVertical: 4 },
  changeText: { fontSize: 13.5, fontWeight: '700', color: colors.primary },

  uploadGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  uploadTile: {
    width: 78, height: 78, borderRadius: radius.md, backgroundColor: colors.lavenderMist,
    borderWidth: 1, borderColor: colors.lavender,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  uploadTileText: { color: colors.primary, fontWeight: '700', fontSize: 11 },
  uploadAdd: {
    width: 78, height: 78, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.accent, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 3,
  },
  uploadAddText: { fontSize: 12, color: colors.accent, fontWeight: '700' },
  count: { fontSize: 13, color: colors.inkMuted, marginBottom: spacing.md, fontWeight: '600' },

  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  half: { flex: 1 },

  progressWrap: { marginVertical: spacing.sm, gap: spacing.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressText: { fontSize: 14, color: colors.inkMuted, fontWeight: '600' },

  player: {
    borderRadius: radius.lg,
    height: 194,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.lg,
  },
  playBtn: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
    paddingLeft: 3,
  },
  playerName: { color: colors.onPrimary, fontSize: 16, fontWeight: '700' },
  playerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%' },
  playerMeta: { color: colors.onDarkFaint, fontSize: 12.5 },
  playerDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.onDarkFaint, marginHorizontal: 3 },
});
