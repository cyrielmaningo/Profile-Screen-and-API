import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, spacing, typography, shadow } from '../theme/theme';
import Icon from './Icon';

/* ---------------------------------- Button --------------------------------- */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  iconRight, // optional trailing icon name (e.g. 'arrow-right') — primary CTAs
}) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  const labelColor = isPrimary ? colors.onPrimary : colors.primary;

  const content = (
    <View style={styles.btnInner}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.primary} />
      ) : (
        <View style={styles.btnRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.btnLabel,
              isPrimary && { color: colors.onPrimary },
              (isGhost || variant === 'outline') && { color: colors.primary },
            ]}
          >
            {label}
          </Text>
          {iconRight ? (
            <View style={styles.btnIcon}>
              <Icon name={iconRight} size={18} color={labelColor} strokeWidth={2.2} />
            </View>
          ) : null}
        </View>
      )}
    </View>
  );

  if (isPrimary) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.btn,
          shadow.soft,
          disabled ? { opacity: 0.5 } : null,
          pressed && !disabled ? styles.btnPressed : null,
          style,
        ]}
      >
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btnGradient}
        >
          {/* top sheen — a soft inner highlight for a crafted, tactile feel */}
          <LinearGradient
            colors={gradients.sheen}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.btnSheen}
            pointerEvents="none"
          />
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        styles.btnAlt,
        isGhost && styles.btnGhost,
        disabled ? { opacity: 0.5 } : null,
        pressed && !disabled ? styles.btnAltPressed : null,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

/* ----------------------------------- Card ---------------------------------- */
export function Card({ children, style }) {
  return <View style={[styles.card, shadow.card, style]}>{children}</View>;
}

/* -------------------------------- TextField -------------------------------- */
export function TextField({
  label,
  hint,
  style,
  multiline,
  icon, // optional leading icon name (e.g. 'mail', 'lock', 'user')
  secureTextEntry,
  onFocus,
  onBlur,
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const inputRef = useRef(null);
  const refocusing = useRef(false);
  const isPassword = !!secureTextEntry;

  // Android workaround for the "keyboard flashes open then closes" bug that
  // occurs when a TextInput sits inside a ScrollView nested in a bottom-tab
  // navigator (windowSoftInputMode adjustResize + tab resize). Re-requesting
  // focus re-opens the soft keyboard. iOS is left untouched.
  const refocusOnAndroidEnabled = false;

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
    const input = inputRef.current;
    if (!refocusOnAndroidEnabled || !input || Platform.OS !== 'android' || refocusing.current) {
      return;
    }
    refocusing.current = true;
    input.blur();
    requestAnimationFrame(() => {
      setTimeout(() => {
        input.focus();
        refocusing.current = false;
      }, 40);
    });
  };
  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.fieldWrap, style]}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View
        style={[
          styles.inputBox,
          multiline && styles.inputBoxMultiline,
          focused && styles.inputBoxFocused,
        ]}
      >
        {icon && !multiline ? (
          <View style={styles.leadingIcon}>
            <Icon name={icon} size={19} color={focused ? colors.primary : colors.inkFaint} />
          </View>
        ) : null}
        <TextInput
          ref={inputRef}
          placeholderTextColor={colors.inkFaint}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            icon && !multiline && styles.inputWithIcon,
            isPassword && styles.inputWithTrailing,
          ]}
          multiline={multiline}
          secureTextEntry={isPassword && !reveal}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setReveal((v) => !v)}
            hitSlop={10}
            style={styles.trailingIcon}
            accessibilityLabel={reveal ? 'Hide password' : 'Show password'}
          >
            <Icon name={reveal ? 'eye-off' : 'eye'} size={19} color={colors.inkFaint} />
          </Pressable>
        ) : null}
      </View>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

/* ---------------------------------- Badge ---------------------------------- */
export function Badge({ label, tone = 'default' }) {
  const map = {
    default: { bg: colors.lavender, fg: colors.primaryDark },
    success: { bg: '#DDF1E6', fg: colors.success },
    warning: { bg: '#F7ECD6', fg: colors.warning },
    info: { bg: '#E7DAE9', fg: colors.primary },
  };
  const t = map[tone] || map.default;
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

/* --------------------------------- Section --------------------------------- */
export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

/* ------------------------------ SectionHeader ------------------------------ */
/**
 * Eyebrow kicker + heading with optional trailing accessory. Gives each
 * content block a clear, consistent typographic anchor.
 */
export function SectionHeader({ eyebrow, title, right, style }) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.sectionEyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionHeading}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

/* --------------------------------- IconTile -------------------------------- */
/**
 * A small rounded tile holding an icon. `tone`:
 *   'lavender' (default) – soft lilac fill, primary icon
 *   'brand'              – gradient fill, white icon (for emphasis)
 *   'ghost'              – hairline outline on surface
 */
export function IconTile({ name, size = 46, iconSize, tone = 'lavender', style }) {
  const r = Math.round(size * 0.3);
  const isize = iconSize || Math.round(size * 0.5);

  if (tone === 'brand') {
    return (
      <LinearGradient
        colors={gradients.tile}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.iconTile, { width: size, height: size, borderRadius: r }, style]}
      >
        <Icon name={name} size={isize} color={colors.onPrimary} strokeWidth={2} />
      </LinearGradient>
    );
  }

  const bg = tone === 'ghost' ? colors.surface : colors.lavenderMist;
  return (
    <View
      style={[
        styles.iconTile,
        { width: size, height: size, borderRadius: r, backgroundColor: bg },
        tone === 'ghost' && { borderWidth: 1, borderColor: colors.border },
        tone === 'lavender' && { borderWidth: 1, borderColor: colors.lavender },
        style,
      ]}
    >
      <Icon name={name} size={isize} color={colors.primary} strokeWidth={2} />
    </View>
  );
}

/* -------------------------------- ProgressBar ------------------------------ */
/** Slim progress rail. `value` is 0..1. `tone` picks the fill color. */
export function ProgressBar({ value = 0, height = 8, tone = 'brand', track, style }) {
  const pct = Math.max(0, Math.min(1, value));
  const fill = tone === 'warning' ? colors.warning : tone === 'success' ? colors.success : colors.primary;
  return (
    <View style={[styles.progressTrack, { height, borderRadius: height / 2, backgroundColor: track || colors.track }, style]}>
      <View style={{ width: `${Math.round(pct * 100)}%`, height, borderRadius: height / 2, backgroundColor: fill }} />
    </View>
  );
}

/* ---------------------------------- StatCard ------------------------------- */
/** Icon tile + big number + label. A considered dashboard metric. */
export function StatCard({ icon, value, label, style }) {
  return (
    <View style={[styles.statCard, shadow.soft, style]}>
      <IconTile name={icon} size={34} iconSize={18} tone="lavender" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ----------------------------------- ListRow ------------------------------- */
/**
 * A tappable row: leading icon tile, title + optional description, optional
 * right accessory (defaults to a chevron). Used for quick actions & settings.
 */
export function ListRow({
  icon,
  iconTone = 'lavender',
  title,
  desc,
  right,
  onPress,
  chevron = true,
  style,
}) {
  const body = (
    <View style={[styles.listRow, shadow.soft, style]}>
      {icon ? <IconTile name={icon} size={44} tone={iconTone} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.listTitle}>{title}</Text>
        {desc ? <Text style={styles.listDesc}>{desc}</Text> : null}
      </View>
      {right}
      {chevron ? (
        <View style={styles.listChevron}>
          <Icon name="chevron-right" size={18} color={colors.inkFaint} strokeWidth={2.2} />
        </View>
      ) : null}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => (pressed ? { opacity: 0.9, transform: [{ scale: 0.995 }] } : null)}>
      {body}
    </Pressable>
  );
}

/* --------------------------------- Divider --------------------------------- */
export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  btn: { borderRadius: radius.pill, overflow: 'hidden' },
  btnGradient: { borderRadius: radius.pill },
  btnSheen: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '58%',
    borderTopLeftRadius: radius.pill,
    borderTopRightRadius: radius.pill,
  },
  btnInner: { paddingVertical: 15, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnIcon: { marginLeft: 8, marginTop: 1 },
  btnLabel: { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  btnPressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  btnAltPressed: { opacity: 0.9, backgroundColor: colors.lavender },
  btnAlt: { backgroundColor: colors.lavenderMist, borderWidth: 1.5, borderColor: colors.border },
  btnGhost: { backgroundColor: 'transparent', borderColor: 'transparent' },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  fieldWrap: { marginBottom: spacing.md },
  fieldLabel: {
    ...typography.label,
    color: colors.inkMuted,
    marginBottom: 7,
    marginLeft: 2,
    textTransform: 'uppercase',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  inputBoxMultiline: { alignItems: 'stretch' },
  inputBoxFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.inputFocusBg,
  },
  leadingIcon: { marginRight: 10 },
  trailingIcon: { marginLeft: 8, paddingVertical: 4 },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.ink,
  },
  inputWithIcon: {},
  inputWithTrailing: {},
  inputMultiline: { minHeight: 120, textAlignVertical: 'top', paddingTop: 14 },
  fieldHint: { ...typography.caption, color: colors.inkFaint, marginTop: 6, marginLeft: 2 },

  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  badgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

  sectionTitle: { ...typography.heading, color: colors.ink, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionEyebrow: { ...typography.eyebrow, color: colors.accent, marginBottom: 5 },
  sectionHeading: { ...typography.heading, color: colors.ink },

  iconTile: { alignItems: 'center', justifyContent: 'center' },

  progressTrack: { width: '100%', overflow: 'hidden' },

  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 25, fontWeight: '800', color: colors.ink, marginTop: 9 },
  statLabel: { fontSize: 11.5, color: colors.inkMuted, marginTop: 1, fontWeight: '600', letterSpacing: 0.2 },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listTitle: { fontSize: 15.5, fontWeight: '700', color: colors.ink },
  listDesc: { fontSize: 13, color: colors.inkMuted, marginTop: 3, lineHeight: 18 },
  listChevron: { marginLeft: 2 },
});
