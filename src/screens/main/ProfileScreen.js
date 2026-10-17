import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../../components/Screen';
import { Card, Button, TextField, Divider, StatCard, IconTile } from '../../components/ui';
import Icon from '../../components/Icon';
import Notice from '../../components/Notice';
import { useApp } from '../../store/AppContext';
import { colors, gradients, spacing, radius, shadow } from '../../theme/theme';

function InfoRow({ icon, label, value, last }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <IconTile name={icon} size={40} iconSize={20} tone="lavender" />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

function formatDate(value) {
  if (!value) return 'No expiry date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function ProfileScreen() {
  const {
    user,
    updateUser,
    logout,
    tributes,
    profiles,
    activeProfile,
    switchProfile,
    subscription,
    hasActiveSubscription,
    freeProfileLimit,
    authError,
  } = useApp();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const initials = (user?.name || 'M')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('');

  const planLabel = hasActiveSubscription
    ? `Memento Keepsake · ${subscription?.planType || 'Active'}`
    : 'Standard · Free';

  const profileUsage = hasActiveSubscription
    ? `${profiles.length} memorial profile${profiles.length === 1 ? '' : 's'} · additional profiles unlocked`
    : `${profiles.length} of ${freeProfileLimit} free memorial profiles used`;

  const resetPasswordFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const cancelEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    resetPasswordFields();
    setEditing(false);
  };

  const saveProfile = async () => {
    const wantsPasswordChange = currentPassword || newPassword || confirmPassword;
    if (wantsPasswordChange) {
      if (!currentPassword) return setError('Enter your current password.');
      if (newPassword.length < 8) return setError('New password must be at least 8 characters.');
      if (newPassword !== confirmPassword) return setError('New passwords do not match.');
    }

    const ok = await updateUser({ fullName: name, email, ...(wantsPasswordChange ? { currentPassword, newPassword } : {}) });
    if (!ok) return;
    resetPasswordFields();
    setEditing(false);
  };

  return (
    <Screen eyebrow="Account" title="Profile" subtitle="Your account & memories">
      <LinearGradient
        colors={gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.identity, shadow.card]}
      >
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.identityName}>{user?.name}</Text>
          <Text style={styles.identityEmail}>{user?.email}</Text>
          <View style={styles.planTag}>
            <Icon name={hasActiveSubscription ? 'crown' : 'user'} size={13} color={colors.onPrimary} strokeWidth={1.9} />
            <Text style={styles.planText}>{planLabel}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <StatCard icon="film" value={tributes.length} label="Tributes" />
        <StatCard icon="qr" value={tributes.filter((t) => t.hasQR).length} label="QR Codes" />
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.h}>Current memorial</Text>
        <InfoRow icon="heart" label="Remembering" value={activeProfile?.displayName || 'No memorial selected'} />
        <InfoRow icon="user" label="Relationship" value={activeProfile?.relationship || 'Not specified'} last />
        <View style={{ height: spacing.md }} />
        <Button label="Switch Memorial Profile" variant="outline" iconRight="arrow-right" onPress={switchProfile} />
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <Text style={styles.h}>Subscription</Text>
        <InfoRow icon={hasActiveSubscription ? 'crown' : 'user'} label="Plan" value={planLabel} />
        <InfoRow icon="heart" label="Memorial profiles" value={profileUsage} />
        {hasActiveSubscription ? (
          <InfoRow icon="clock" label="Active until" value={formatDate(subscription?.expiryDate)} last />
        ) : (
          <InfoRow icon="crown" label="More profiles" value="After 3 profiles, switch memorial and tap Add profile to choose Monthly or Annual." last />
        )}
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        {editing ? (
          <>
            <Text style={styles.h}>Edit details</Text>
            <TextField label="Full name" icon="user" value={name} onChangeText={setName} />
            <TextField label="Email" icon="mail" value={email} onChangeText={setEmail} autoCapitalize="none" />

            <Divider />
            <Text style={styles.h}>Change password</Text>
            <Text style={styles.note}>Leave these blank to keep your current password.</Text>
            <TextField
              label="Current password"
              icon="lock"
              placeholder="••••••••"
              secureTextEntry
              value={currentPassword}
              onChangeText={(t) => { setCurrentPassword(t); setError(''); }}
            />
            <TextField
              label="New password"
              icon="key"
              placeholder="At least 8 characters"
              secureTextEntry
              value={newPassword}
              onChangeText={(t) => { setNewPassword(t); setError(''); }}
            />
            <TextField
              label="Confirm new password"
              icon="key"
              placeholder="Re-enter new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
            />
            {error ? <Notice title="Check your password" message={error} tone="error" /> : authError ? <Notice title="Profile not updated" message={authError} tone="error" /> : null}

            <View style={styles.row}>
              <Button label="Cancel" variant="outline" style={styles.half} onPress={cancelEdit} />
              <Button label="Save" style={styles.half} onPress={saveProfile} />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.h}>Account details</Text>
            <InfoRow icon="user" label="Name" value={user?.name} />
            <InfoRow icon="mail" label="Email" value={user?.email} />
            <InfoRow icon="lock" label="Password" value="••••••••" />
            <InfoRow icon="crown" label="Plan" value={planLabel} last />
            <View style={{ height: spacing.md }} />
            <Button label="Edit Profile" variant="outline" iconRight="edit" onPress={() => setEditing(true)} />
          </>
        )}
      </Card>

      <View style={{ height: spacing.lg }} />
      <Pressable
        onPress={logout}
        style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
      >
        <Icon name="logout" size={18} color={colors.danger} strokeWidth={2} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
  },
  avatar: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.onPrimary, fontSize: 22, fontWeight: '800' },
  identityName: { fontSize: 19, fontWeight: '800', color: colors.onPrimary },
  identityEmail: { fontSize: 13.5, color: 'rgba(255,255,255,0.82)', marginTop: 2 },
  planTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, marginTop: 8,
  },
  planText: { color: colors.onPrimary, fontSize: 11.5, fontWeight: '700', letterSpacing: 0.3 },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },

  h: { fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm },
  note: { fontSize: 13, color: colors.inkMuted, marginBottom: spacing.md, marginTop: -4 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 12, color: colors.inkFaint, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  infoValue: { fontSize: 15, lineHeight: 20, color: colors.ink, fontWeight: '600', marginTop: 2 },

  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  half: { flex: 1 },

  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 15,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(192,57,43,0.28)',
    backgroundColor: 'rgba(192,57,43,0.05)',
  },
  logoutPressed: { opacity: 0.85, backgroundColor: 'rgba(192,57,43,0.10)' },
  logoutText: { color: colors.danger, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
