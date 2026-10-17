import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BrandLogo from '../../components/BrandLogo';
import Icon from '../../components/Icon';
import Notice from '../../components/Notice';
import { Button, TextField } from '../../components/ui';
import { useApp } from '../../store/AppContext';
import { colors, gradients, radius, shadow, spacing } from '../../theme/theme';

const AVATAR_GRADIENTS = [
  ['#A346A6', '#5E1F63'],
  ['#6A4BA8', '#37235E'],
  ['#B65B7A', '#682942'],
  ['#5E7AA8', '#2D3B58'],
  ['#9B6B45', '#57402C'],
  ['#4E8C7D', '#285249'],
];

function initials(name) {
  return String(name || 'M')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function yearFromDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value).slice(0, 4) : String(d.getFullYear());
}

function profileYears(profile) {
  const birth = yearFromDate(profile?.birthDate);
  const death = yearFromDate(profile?.deathDate);
  if (birth && death) return `${birth} – ${death}`;
  if (birth) return `Born ${birth}`;
  if (death) return `Passed ${death}`;
  return profile?.relationship || 'Memorial profile';
}

function ProfileCard({ profile, index, managing, onChoose, onEdit }) {
  const colorsForAvatar = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  return (
    <Pressable
      onPress={() => (managing ? onEdit(profile) : onChoose(profile))}
      accessibilityLabel={`${managing ? 'Edit' : 'Open'} memorial profile for ${profile.displayName}`}
      style={({ pressed }) => [styles.profileCard, pressed && { transform: [{ scale: 0.98 }] }]}
    >
      <View style={styles.avatarWrap}>
        <LinearGradient colors={colorsForAvatar} style={[styles.avatar, shadow.raised]}>
          <Text style={styles.avatarInitials}>{initials(profile.displayName)}</Text>
        </LinearGradient>
        {managing ? (
          <View style={styles.editBadge}>
            <Icon name="edit" size={14} color={colors.onPrimary} strokeWidth={2.2} />
          </View>
        ) : null}
      </View>
      <Text style={styles.profileName} numberOfLines={2}>{profile.displayName}</Text>
      <Text style={styles.profileMeta} numberOfLines={1}>{profileYears(profile)}</Text>
    </Pressable>
  );
}

function AddProfileCard({ onPress, locked, pending }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={pending}
      accessibilityLabel={pending ? 'Checking subscription' : locked ? 'Subscribe to add another memorial profile' : 'Add another memorial profile'}
      style={({ pressed }) => [styles.profileCard, pressed && { opacity: 0.75 }]}
    >
      <View style={[styles.avatar, styles.addAvatar, locked && styles.addAvatarLocked]}>
        <Icon name={pending ? 'clock' : locked ? 'crown' : 'plus'} size={locked || pending ? 34 : 38} color={colors.accentSoft} strokeWidth={1.8} />
      </View>
      <Text style={styles.profileName}>Add profile</Text>
      <Text style={styles.profileMeta}>{pending ? 'Checking plan…' : locked ? 'Subscription required' : 'Another loved one'}</Text>
    </Pressable>
  );
}

function PlanOption({ title, description, loading, disabled, onPress }) {
  return (
    <View style={styles.planOption}>
      <View style={styles.planIcon}>
        <Icon name="crown" size={22} color={colors.primary} strokeWidth={2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.planOptionTitle}>{title}</Text>
        <Text style={styles.planOptionDesc}>{description}</Text>
      </View>
      <Button
        label={loading ? 'Activating…' : 'Choose'}
        onPress={onPress}
        loading={loading}
        disabled={disabled}
        style={styles.planButton}
      />
    </View>
  );
}

export default function ProfileChooserScreen() {
  const {
    user,
    profiles,
    profilesLoading,
    profilesReady,
    profileError,
    subscription,
    subscriptionLoading,
    subscriptionError,
    hasActiveSubscription,
    freeProfileLimit,
    selectProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    activateSubscription,
    logout,
  } = useApp();

  const [managing, setManaging] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [limitWarningOpen, setLimitWarningOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activatingPlan, setActivatingPlan] = useState('');
  const [localError, setLocalError] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [biography, setBiography] = useState('');

  const firstName = useMemo(() => user?.firstName || user?.name?.split(' ')[0] || 'there', [user]);
  const requiresFirstProfile = profilesReady && !profilesLoading && profiles.length === 0;
  const profileLimitPending = profiles.length >= freeProfileLimit && subscriptionLoading;
  const freeLimitReached = profiles.length >= freeProfileLimit && !subscriptionLoading && !hasActiveSubscription;
  const currentPlanLabel = hasActiveSubscription
    ? `Memento Keepsake · ${subscription?.planType || 'Active'}`
    : 'Standard · Free';

  const resetForm = (profile = null) => {
    setEditingProfile(profile);
    setDisplayName(profile?.displayName || '');
    setRelationship(profile?.relationship || '');
    setBirthDate(profile?.birthDate ? String(profile.birthDate).slice(0, 10) : '');
    setDeathDate(profile?.deathDate ? String(profile.deathDate).slice(0, 10) : '');
    setBiography(profile?.biography || '');
    setLocalError('');
  };

  const openCreate = () => {
    if (profileLimitPending) return;
    if (freeLimitReached) {
      setLimitWarningOpen(true);
      return;
    }
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (profile) => {
    resetForm(profile);
    setModalOpen(true);
  };

  const save = async () => {
    const cleanName = displayName.trim();
    if (!cleanName) return setLocalError('Please enter the deceased person’s name.');
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (birthDate && !datePattern.test(birthDate)) return setLocalError('Use YYYY-MM-DD for the date of birth.');
    if (deathDate && !datePattern.test(deathDate)) return setLocalError('Use YYYY-MM-DD for the date of passing.');
    if (birthDate && deathDate && deathDate < birthDate) return setLocalError('Date of passing cannot be earlier than date of birth.');

    setSaving(true);
    setLocalError('');
    const payload = {
      displayName: cleanName,
      relationship: relationship.trim() || null,
      birthDate: birthDate || null,
      deathDate: deathDate || null,
      biography: biography.trim() || null,
    };

    const saved = editingProfile
      ? await updateProfile(editingProfile.id, payload)
      : await addProfile(payload);

    setSaving(false);
    if (!saved) return;

    setModalOpen(false);
    setManaging(false);
    setEditingProfile(null);
    resetForm();
  };

  const chooseSubscription = async (planType) => {
    setActivatingPlan(planType);
    const activated = await activateSubscription(planType);
    setActivatingPlan('');
    if (!activated) return;

    setSubscriptionModalOpen(false);
    resetForm();
    setModalOpen(true);
  };

  const remove = () => {
    if (!editingProfile) return;
    Alert.alert(
      'Remove memorial profile?',
      `This will remove ${editingProfile.displayName}'s profile only when it has no saved tributes.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            const ok = await deleteProfile(editingProfile.id);
            setSaving(false);
            if (ok) {
              setModalOpen(false);
              setEditingProfile(null);
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={gradients.heroRich} style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <View style={styles.logoTile}><BrandLogo size={30} /></View>
              <View>
                <Text style={styles.brand}>Memento</Text>
                <Text style={styles.tagline}>Digital remembrance</Text>
              </View>
            </View>
            <Pressable onPress={logout} style={styles.signOut}>
              <Icon name="logout" size={17} color={colors.onDarkFaint} />
              <Text style={styles.signOutText}>Sign out</Text>
            </Pressable>
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Welcome, {firstName}</Text>
            <Text style={styles.title}>Whose memory would you like to visit?</Text>
            <Text style={styles.subtitle}>
              Choose a loved one to open their tributes, QR codes, and memories. Each profile stays separate under your family account.
            </Text>
          </View>

          <View style={styles.planSummary}>
            <View style={styles.planSummaryIcon}>
              <Icon name={hasActiveSubscription ? 'crown' : 'user'} size={18} color={colors.accentSoft} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.planSummaryTitle}>{currentPlanLabel}</Text>
              <Text style={styles.planSummaryText}>
                {hasActiveSubscription
                  ? `${profiles.length} memorial profile${profiles.length === 1 ? '' : 's'} · additional profiles unlocked while your subscription is active`
                  : `${profiles.length} of ${freeProfileLimit} free memorial profiles used`}
              </Text>
            </View>
            {subscriptionLoading ? <ActivityIndicator size="small" color={colors.accentSoft} /> : null}
          </View>

          {profileError ? (
            <Notice title="Profile notice" message={profileError} tone="error" style={styles.notice} />
          ) : null}
          {subscriptionError ? (
            <Notice title="Subscription notice" message={subscriptionError} tone="error" style={styles.notice} />
          ) : null}

          {profilesLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.accentSoft} size="large" />
              <Text style={styles.loadingText}>Preparing your memorial profiles…</Text>
            </View>
          ) : (
            <>
              <View style={styles.grid}>
                {profiles.map((profile, index) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    index={index}
                    managing={managing}
                    onChoose={selectProfile}
                    onEdit={openEdit}
                  />
                ))}
                <AddProfileCard onPress={openCreate} locked={freeLimitReached} pending={profileLimitPending} />
              </View>

              <Pressable onPress={() => setManaging((v) => !v)} style={styles.manageButton}>
                <Icon name={managing ? 'check' : 'edit'} size={17} color={colors.onPrimary} />
                <Text style={styles.manageText}>{managing ? 'Done managing' : 'Manage profiles'}</Text>
              </Pressable>

              {profiles.length === 0 ? (
                <Text style={styles.emptyHelp}>
                  No memorial profiles yet. Tap Add profile to create one for a deceased loved one. Your first three profiles are free.
                </Text>
              ) : freeLimitReached ? (
                <Text style={styles.emptyHelp}>
                  You have used all {freeProfileLimit} free memorial profiles. Tap Add profile to choose a Monthly or Annual subscription before creating another one.
                </Text>
              ) : null}
            </>
          )}
        </ScrollView>

        <Modal
          visible={modalOpen}
          animationType="slide"
          transparent
          onRequestClose={() => {
            if (!saving) setModalOpen(false);
          }}
        >
          <View style={styles.modalBackdrop}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalKeyboard}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalEyebrow}>
                      {editingProfile ? 'Manage profile' : requiresFirstProfile ? 'First memorial' : 'New memorial'}
                    </Text>
                    <Text style={styles.modalTitle}>
                      {editingProfile ? 'Edit memorial profile' : requiresFirstProfile ? 'Add your first loved one' : 'Add a loved one'}
                    </Text>
                  </View>
                  <Pressable onPress={() => !saving && setModalOpen(false)} hitSlop={12} style={styles.closeButton}>
                    <Text style={styles.closeText}>×</Text>
                  </Pressable>
                </View>

                <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                  {localError ? <Notice title="Check these details" message={localError} tone="error" /> : null}
                  {!localError && profileError ? <Notice title="Couldn’t save profile" message={profileError} tone="error" /> : null}
                  {requiresFirstProfile && !localError && !profileError ? (
                    <Notice
                      title="Your first memorial profile"
                      message="Add the deceased loved one you want to remember. After saving, you’ll return to the profile chooser and tap the profile when you’re ready to enter its dashboard."
                      tone="info"
                    />
                  ) : null}

                  <TextField label="Deceased person's name" icon="user" placeholder="Eleanor M. Hayes" value={displayName} onChangeText={(t) => { setDisplayName(t); setLocalError(''); }} />
                  <TextField label="Relationship (optional)" icon="heart" placeholder="Mother, grandfather, sibling…" value={relationship} onChangeText={setRelationship} />
                  <TextField label="Date of birth (optional)" icon="clock" placeholder="1948-05-22" value={birthDate} onChangeText={setBirthDate} autoCapitalize="none" />
                  <TextField label="Date of passing (optional)" icon="clock" placeholder="2023-11-03" value={deathDate} onChangeText={setDeathDate} autoCapitalize="none" />
                  <TextField label="Short biography (optional)" placeholder="A few words about who they were…" multiline value={biography} onChangeText={setBiography} />

                  <Button
                    label={editingProfile ? 'Save Profile' : requiresFirstProfile ? 'Create First Memorial Profile' : 'Create Profile'}
                    onPress={save}
                    loading={saving}
                    disabled={saving}
                  />
                  {editingProfile ? (
                    <Pressable onPress={remove} disabled={saving} style={styles.removeButton}>
                      <Text style={styles.removeText}>Remove this profile</Text>
                    </Pressable>
                  ) : null}
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        <Modal
          visible={limitWarningOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setLimitWarningOpen(false)}
        >
          <View style={styles.subscriptionBackdrop}>
            <View style={styles.limitWarningCard}>
              <View style={styles.warningHeroIcon}>
                <Icon name="lock" size={28} color={colors.onPrimary} strokeWidth={1.9} />
              </View>
              <Text style={styles.subscriptionEyebrow}>Profile limit reached</Text>
              <Text style={styles.subscriptionTitle}>You’ve used all {freeProfileLimit} free profiles</Text>
              <Text style={styles.subscriptionCopy}>
                Your Standard account already has the maximum number of free memorial profiles. If you wish to add another deceased profile, please check the available subscription options.
              </Text>

              <View style={styles.limitInfoRow}>
                <Icon name="users" size={18} color={colors.primary} strokeWidth={2} />
                <Text style={styles.limitInfoText}>
                  Existing profiles: {profiles.length} / {freeProfileLimit} free profiles
                </Text>
              </View>

              <Button
                label="View Subscription"
                onPress={() => {
                  setLimitWarningOpen(false);
                  setSubscriptionModalOpen(true);
                }}
                style={styles.warningPrimaryButton}
              />

              <Pressable
                onPress={() => setLimitWarningOpen(false)}
                style={styles.subscriptionCancel}
              >
                <Text style={styles.subscriptionCancelText}>Maybe later</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal
          visible={subscriptionModalOpen}
          animationType="fade"
          transparent
          onRequestClose={() => {
            if (!activatingPlan) setSubscriptionModalOpen(false);
          }}
        >
          <View style={styles.subscriptionBackdrop}>
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeroIcon}>
                <Icon name="crown" size={30} color={colors.onPrimary} strokeWidth={1.9} />
              </View>
              <Text style={styles.subscriptionEyebrow}>Memento Keepsake</Text>
              <Text style={styles.subscriptionTitle}>Keep more loved ones together</Text>
              <Text style={styles.subscriptionCopy}>
                Your Standard account includes {freeProfileLimit} memorial profiles. A subscription is required to create profile {freeProfileLimit + 1} and beyond.
              </Text>

              <View style={styles.subscriptionInfoBox}>
                <View style={styles.subscriptionInfoLine}>
                  <Icon name="check" size={17} color={colors.primary} strokeWidth={2.2} />
                  <Text style={styles.subscriptionInfoText}>Your first {freeProfileLimit} memorial profiles remain free.</Text>
                </View>
                <View style={styles.subscriptionInfoLine}>
                  <Icon name="check" size={17} color={colors.primary} strokeWidth={2.2} />
                  <Text style={styles.subscriptionInfoText}>Monthly unlocks additional profiles for one month.</Text>
                </View>
                <View style={styles.subscriptionInfoLine}>
                  <Icon name="check" size={17} color={colors.primary} strokeWidth={2.2} />
                  <Text style={styles.subscriptionInfoText}>Annual unlocks additional profiles for one year.</Text>
                </View>
                <View style={styles.subscriptionInfoLine}>
                  <Icon name="check" size={17} color={colors.primary} strokeWidth={2.2} />
                  <Text style={styles.subscriptionInfoText}>Existing memorial profiles stay accessible if the subscription later expires.</Text>
                </View>
              </View>

              {subscriptionError ? (
                <Notice title="Subscription not activated" message={subscriptionError} tone="error" />
              ) : null}

              <PlanOption
                title="Monthly"
                description="Unlock additional memorial profiles for one month."
                loading={activatingPlan === 'Monthly'}
                disabled={!!activatingPlan}
                onPress={() => chooseSubscription('Monthly')}
              />
              <PlanOption
                title="Annual"
                description="Unlock additional memorial profiles for one year."
                loading={activatingPlan === 'Annual'}
                disabled={!!activatingPlan}
                onPress={() => chooseSubscription('Annual')}
              />

              <Pressable
                onPress={() => !activatingPlan && setSubscriptionModalOpen(false)}
                disabled={!!activatingPlan}
                style={styles.subscriptionCancel}
              >
                <Text style={styles.subscriptionCancelText}>Not now</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, minHeight: '100%' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoTile: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  brand: { color: colors.onPrimary, fontSize: 20, fontWeight: '800' },
  tagline: { color: colors.onDarkFaint, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2 },
  signOut: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 10 },
  signOutText: { color: colors.onDarkFaint, fontSize: 13, fontWeight: '700' },
  heroCopy: { alignItems: 'center', paddingTop: spacing.xxl, paddingBottom: spacing.lg, paddingHorizontal: spacing.sm },
  eyebrow: { color: colors.accentSoft, fontSize: 12, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: spacing.sm },
  title: { color: colors.onPrimary, fontSize: 30, lineHeight: 36, fontWeight: '800', textAlign: 'center', maxWidth: 540 },
  subtitle: { color: colors.onDarkFaint, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: spacing.md, maxWidth: 580 },
  notice: { maxWidth: 620, alignSelf: 'center', width: '100%' },
  planSummary: { flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: 620, width: '100%', alignSelf: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: 12, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  planSummaryIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },
  planSummaryTitle: { color: colors.onPrimary, fontSize: 13.5, fontWeight: '800' },
  planSummaryText: { color: colors.onDarkFaint, fontSize: 12.5, lineHeight: 18, marginTop: 2 },
  loadingWrap: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  loadingText: { color: colors.onDarkFaint, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.lg, maxWidth: 720, alignSelf: 'center' },
  profileCard: { width: 150, alignItems: 'center' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 132, height: 132, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.22)' },
  avatarInitials: { color: colors.onPrimary, fontSize: 42, fontWeight: '800', letterSpacing: 1 },
  addAvatar: { backgroundColor: 'rgba(255,255,255,0.07)', borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.3)' },
  addAvatarLocked: { backgroundColor: 'rgba(255,255,255,0.10)', borderColor: 'rgba(232,195,236,0.55)' },
  editBadge: { position: 'absolute', right: -7, bottom: -7, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.primaryDeep, alignItems: 'center', justifyContent: 'center' },
  profileName: { color: colors.onPrimary, fontSize: 15, fontWeight: '800', textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  profileMeta: { color: colors.onDarkFaint, fontSize: 12.5, textAlign: 'center', marginTop: 3 },
  manageButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 8, marginTop: spacing.xl, paddingHorizontal: 18, paddingVertical: 11, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.08)' },
  manageText: { color: colors.onPrimary, fontSize: 13.5, fontWeight: '800' },
  emptyHelp: { color: colors.onDarkFaint, fontSize: 13.5, lineHeight: 20, textAlign: 'center', marginTop: spacing.lg, maxWidth: 500, alignSelf: 'center' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20,8,23,0.72)' },
  modalKeyboard: { maxHeight: '92%' },
  modalCard: { backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: spacing.xl, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  modalEyebrow: { color: colors.accent, fontSize: 11.5, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  modalTitle: { color: colors.ink, fontSize: 23, fontWeight: '800', marginTop: 3 },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.lavenderMist, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.inkMuted, fontSize: 28, lineHeight: 30 },
  removeButton: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.sm },
  removeText: { color: colors.danger, fontSize: 14, fontWeight: '800' },

  subscriptionBackdrop: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: 'rgba(20,8,23,0.78)' },
  limitWarningCard: { width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: colors.background, borderRadius: radius.xl, padding: spacing.lg, ...shadow.card },
  warningHeroIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: spacing.md },
  limitInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.lavenderMist, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 12, marginBottom: spacing.lg },
  limitInfoText: { flex: 1, color: colors.ink, fontSize: 13.5, lineHeight: 19, fontWeight: '700' },
  warningPrimaryButton: { marginTop: spacing.xs || 4 },
  subscriptionCard: { width: '100%', maxWidth: 560, alignSelf: 'center', backgroundColor: colors.background, borderRadius: radius.xl, padding: spacing.lg, ...shadow.card },
  subscriptionHeroIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: spacing.md },
  subscriptionEyebrow: { color: colors.accent, fontSize: 11.5, fontWeight: '800', letterSpacing: 1.25, textTransform: 'uppercase', textAlign: 'center' },
  subscriptionTitle: { color: colors.ink, fontSize: 24, lineHeight: 30, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  subscriptionCopy: { color: colors.inkMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  subscriptionInfoBox: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, gap: 10 },
  subscriptionInfoLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  subscriptionInfoText: { flex: 1, color: colors.inkMuted, fontSize: 12.8, lineHeight: 18 },
  planOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  planIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.lavenderMist, alignItems: 'center', justifyContent: 'center' },
  planOptionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  planOptionDesc: { color: colors.inkMuted, fontSize: 12.5, lineHeight: 18, marginTop: 2, paddingRight: 4 },
  planButton: { width: 104 },
  subscriptionCancel: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.xs || 4 },
  subscriptionCancelText: { color: colors.inkMuted, fontSize: 14, fontWeight: '800' },
});
