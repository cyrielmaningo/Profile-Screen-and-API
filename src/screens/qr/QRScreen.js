import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import Screen from '../../components/Screen';
import { Card, Button, Badge, Divider, SectionHeader, IconTile } from '../../components/ui';
import Icon from '../../components/Icon';
import QRDisplay from '../../components/QRDisplay';
import { useApp } from '../../store/AppContext';
import { colors, spacing, radius, shadow } from '../../theme/theme';
import { memorialPublicUrl } from '../../api/config';

function randomCode() {
  const s = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 5; i++) out += s[Math.floor(Math.random() * s.length)];
  return `MEM-${out}`;
}

export default function QRScreen() {
  const { tributes, createQr, activeProfile } = useApp();
  const [code, setCode] = useState(null);
  const [linkedId, setLinkedId] = useState(null);

  // A Legacy QR must point to an actual web-playable video. AI/draft items
  // without a stored video URL are intentionally excluded.
  const readyTributes = tributes.filter((t) => t.status === 'ready' && t.videoUrl);
  const history = tributes.filter((t) => t.hasQR);
  const linkedName = tributes.find((t) => t.id === linkedId)?.name;
  const publicUrl = code ? memorialPublicUrl(code) : null;

  const generate = () => {
    setCode(randomCode());
    setLinkedId(null);
  };

  const linkTo = async (id) => {
    try {
      await createQr(id, code);
      setLinkedId(id);
    } catch (err) {
      Alert.alert('QR Code', err.message || 'Unable to create QR code.');
    }
  };

  return (
    <Screen eyebrow="Legacy QR" title="QR Codes" subtitle={`For ${activeProfile?.displayName || 'the selected memorial'}`}>
      {/* Framed keepsake */}
      <View style={[styles.keepsake, shadow.raised]}>
        {code ? (
          <>
            <View style={styles.frame}>
              <QRDisplay value={publicUrl} size={188} />
            </View>
            <View style={styles.codeChip}>
              <Icon name="qr" size={14} color={colors.primary} strokeWidth={2} />
              <Text style={styles.codeChipText}>{code}</Text>
            </View>
            {linkedId ? (
              <Badge label={`Linked to ${linkedName}`} tone="success" />
            ) : (
              <Text style={styles.hint}>Now link this code to a tribute below.</Text>
            )}
          </>
        ) : (
          <>
            <View style={styles.placeholder}>
              <IconTile name="qr" size={56} iconSize={28} tone="lavender" />
              <Text style={styles.placeholderText}>No code yet</Text>
            </View>
            <Text style={styles.hint}>Generate a unique Legacy QR code to place on a memorial.</Text>
          </>
        )}
      </View>

      <View style={{ height: spacing.md }} />
      <Button label={code ? 'Generate Another' : 'Generate Legacy QR Code'} onPress={generate} />

      {code && !linkedId && (
        <Card style={{ marginTop: spacing.lg }}>
          <SectionHeader eyebrow="Step 2" title="Link to a video asset" />
          {readyTributes.length === 0 && (
            <Text style={styles.hint}>No web-ready videos yet. Upload and save a tribute video first.</Text>
          )}
          {readyTributes.map((t, i) => (
            <Pressable
              key={t.id}
              onPress={() => linkTo(t.id)}
              style={[styles.linkRow, i > 0 && styles.linkRowBorder]}
            >
              <View style={styles.thumb}><Text style={styles.thumbInitial}>{t.name[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.linkName}>{t.name}</Text>
                <Text style={styles.linkMeta}>{t.years} · {t.duration}</Text>
              </View>
              <View style={styles.linkChevron}>
                <Icon name="chevron-right" size={18} color={colors.inkFaint} strokeWidth={2.2} />
              </View>
            </Pressable>
          ))}
        </Card>
      )}

      {code && linkedId && (
        <>
          <Card style={{ marginTop: spacing.md }}>
            <Text style={styles.webLabel}>Public memorial website</Text>
            <Text style={styles.webUrl} selectable>{publicUrl}</Text>
            <Text style={styles.hint}>
              This exact website link is encoded in the QR. Scanning it with a phone camera opens the tribute video without requiring the Memento app.
            </Text>
            <View style={{ height: spacing.sm }} />
            <Button
              label="Open Website"
              iconRight="link"
              onPress={async () => {
                try {
                  await Linking.openURL(publicUrl);
                } catch {
                  Alert.alert('Website link', 'Unable to open the public memorial website on this device.');
                }
              }}
            />
          </Card>
          <View style={styles.row}>
            <Button
              label="Download"
              variant="outline"
              iconRight="download"
              style={styles.half}
              onPress={() =>
                Alert.alert(
                  'Layout ready',
                  `A printable QR layout for ${code} has been prepared. In the full app this saves a print-ready PDF.`
                )
              }
            />
            <Button label="Done" style={styles.half} onPress={() => { setCode(null); setLinkedId(null); }} />
          </View>
        </>
      )}

      <Divider />
      <SectionHeader eyebrow="Archive" title="QR code history" />
      {history.length === 0 && (
        <View style={styles.emptyState}>
          <IconTile name="qr" size={48} iconSize={24} tone="lavender" />
          <Text style={styles.emptyTitle}>No codes yet</Text>
          <Text style={styles.hint}>Codes you mint will appear here, ready to place on a memorial.</Text>
        </View>
      )}
      {history.map((t) => (
        <View key={t.id} style={[styles.histRow, shadow.soft]}>
          <View style={styles.histQR}>
            <QRDisplay value={memorialPublicUrl(t.qrId)} size={48} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.linkName}>{t.qrId}</Text>
            <Text style={styles.linkMeta}>→ {t.name}</Text>
          </View>
          <Badge label="Active" tone="success" />
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  keepsake: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  frame: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  codeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: colors.lavenderMist,
    borderWidth: 1, borderColor: colors.lavender,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill,
  },
  codeChipText: { fontSize: 16, fontWeight: '800', color: colors.primaryDark, letterSpacing: 1.5 },
  placeholder: {
    width: 200, height: 200, borderRadius: radius.md,
    backgroundColor: colors.tintSurface, borderWidth: 2, borderColor: colors.border,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  placeholderText: { color: colors.inkFaint, fontWeight: '700', fontSize: 13 },
  hint: { fontSize: 13, color: colors.inkMuted, textAlign: 'center', lineHeight: 19 },
  webLabel: { fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 },
  webUrl: { fontSize: 12.5, color: colors.ink, lineHeight: 18, marginBottom: spacing.sm },

  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  linkRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  thumb: {
    width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.lavender,
    alignItems: 'center', justifyContent: 'center',
  },
  thumbInitial: { color: colors.primary, fontWeight: '800', fontSize: 17 },
  linkName: { fontSize: 15, fontWeight: '700', color: colors.ink },
  linkMeta: { fontSize: 12.5, color: colors.inkMuted, marginTop: 1 },
  linkChevron: { marginLeft: 2 },

  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.tintSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: colors.ink },

  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  half: { flex: 1 },

  histRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm,
    backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.sm + 2,
    borderWidth: 1, borderColor: colors.border,
  },
  histQR: {
    padding: 5, backgroundColor: colors.surface, borderRadius: radius.sm,
    borderWidth: 1, borderColor: colors.border,
  },
});
