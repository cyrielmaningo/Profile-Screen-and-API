import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { get, post, patch, del } from '../api/client';
import { resolveMediaUrl } from '../api/config';

const AppContext = createContext(null);
export const FREE_PROFILE_LIMIT = 3;

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    firstName: row.firstName,
    middleName: row.middleName,
    lastName: row.lastName,
    accountType: row.accountType,
    createdAt: row.createdAt,
  };
}

function mapProfile(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    userId: Number(row.userId),
    displayName: row.displayName,
    relationship: row.relationship || '',
    birthDate: row.birthDate || null,
    deathDate: row.deathDate || null,
    profileImageUrl: row.profileImageUrl || null,
    biography: row.biography || '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapSubscription(row) {
  if (!row) return null;
  return {
    id: Number(row.id ?? row.Subscription_ID),
    userId: Number(row.userId ?? row.User_ID),
    planType: row.planType ?? row.plan_type ?? '',
    status: row.status ?? '',
    expiryDate: row.expiryDate ?? row.expiry_date ?? null,
  };
}

function isSubscriptionActive(subscription) {
  if (!subscription) return false;
  if (String(subscription.status || '').trim().toLowerCase() !== 'active') return false;
  if (!subscription.expiryDate) return true;

  const expiry = new Date(subscription.expiryDate);
  if (Number.isNaN(expiry.getTime())) return false;
  expiry.setHours(23, 59, 59, 999);
  return expiry.getTime() >= Date.now();
}

function mapTribute(row) {
  const narrative = row.narrative_text || '';
  const lines = narrative.trim().split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const title = lines[0] || `Tribute #${row.Tribute_ID}`;
  const storedYears = lines[1] || '';
  const displayNarrative = lines.length > 2 ? lines.slice(2).join('\n') : narrative;
  return {
    id: String(row.Tribute_ID),
    dbId: row.Tribute_ID,
    profileId: row.Deceased_Profile_ID,
    name: title.length > 42 ? `${title.slice(0, 42)}…` : title,
    years: storedYears || (row.created_at ? new Date(row.created_at).getFullYear().toString() : ''),
    narrative: displayNarrative,
    videoUrl: resolveMediaUrl(row.video_url),
    status: row.render_status || 'draft',
    images: row.images?.length ?? 0,
    hasQR: false,
    qrId: null,
    createdAt: row.created_at,
  };
}

function mergeQr(tributes, qrs) {
  const byTribute = new Map((qrs || []).map((q) => [String(q.Tribute_ID), q]));
  return tributes.map((t) => {
    const q = byTribute.get(String(t.dbId));
    return q ? { ...t, hasQR: true, qrId: q.QR_code_key, qr: q } : t;
  });
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesReady, setProfilesReady] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [tributes, setTributes] = useState([]);
  const [qrCodes, setQrCodes] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  const clearMemorialData = () => {
    setTributes([]);
    setQrCodes([]);
  };

  const refreshProfiles = async (activeUser = user) => {
    if (!activeUser?.id) return [];
    setProfilesLoading(true);
    setProfilesReady(false);
    setProfileError(null);
    try {
      const rows = await get(`/deceased-profiles?userId=${encodeURIComponent(activeUser.id)}`);
      const mapped = (rows || []).map(mapProfile);
      setProfiles(mapped);
      return mapped;
    } catch (err) {
      setProfileError(err.message || 'Unable to load memorial profiles.');
      setProfiles([]);
      return [];
    } finally {
      setProfilesLoading(false);
      setProfilesReady(true);
    }
  };

  const refreshSubscription = async (activeUser = user) => {
    if (!activeUser?.id) return null;
    setSubscriptionLoading(true);
    setSubscriptionError(null);
    try {
      const rows = await get(`/subscriptions?userId=${encodeURIComponent(activeUser.id)}`);
      const mapped = (rows || []).map(mapSubscription).filter(Boolean);
      const current = mapped.find(isSubscriptionActive) || mapped[0] || null;
      setSubscription(current);
      return current;
    } catch (err) {
      setSubscriptionError(err.message || 'Unable to load your subscription.');
      setSubscription(null);
      return null;
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const refreshData = async (activeUser = user, memorial = activeProfile) => {
    if (!activeUser?.id || !memorial?.id) return;
    setDataLoading(true);
    try {
      const qs = `userId=${encodeURIComponent(activeUser.id)}&profileId=${encodeURIComponent(memorial.id)}`;
      const [tributeRows, qrRows] = await Promise.all([
        get(`/tributes?${qs}`),
        get(`/qr?${qs}`),
      ]);
      const mapped = (tributeRows || []).map(mapTribute);
      setQrCodes(qrRows || []);
      setTributes(mergeQr(mapped, qrRows || []));
    } catch (err) {
      console.warn('Dashboard data refresh failed:', err.message);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setProfiles([]);
      setActiveProfile(null);
      setProfilesReady(false);
      setSubscription(null);
      setSubscriptionError(null);
      clearMemorialData();
      return;
    }
    setActiveProfile(null);
    setProfilesReady(false);
    clearMemorialData();
    refreshProfiles(user);
    refreshSubscription(user);
  }, [user?.id]);

  useEffect(() => {
    clearMemorialData();
    if (user?.id && activeProfile?.id) refreshData(user, activeProfile);
  }, [user?.id, activeProfile?.id]);

  const value = useMemo(() => {
    const register = async (name, email, password) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const created = await post('/users', { fullName: name, email, password });
        setActiveProfile(null);
        setProfiles([]);
        setProfilesReady(false);
        setSubscription(null);
        clearMemorialData();
        setUser(mapUser(created));
        setHasLoggedOut(false);
        return true;
      } catch (err) {
        setAuthError(err.message || 'We could not create your account.');
        return false;
      } finally {
        setAuthLoading(false);
      }
    };

    const login = async (email, password) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const loggedIn = await post('/users/login', { email, password });
        setActiveProfile(null);
        setProfiles([]);
        setProfilesReady(false);
        setSubscription(null);
        clearMemorialData();
        setUser(mapUser(loggedIn));
        setHasLoggedOut(false);
        return true;
      } catch (err) {
        setAuthError(err.message || 'We could not sign you in.');
        return false;
      } finally {
        setAuthLoading(false);
      }
    };

    const logout = () => {
      setUser(null);
      setActiveProfile(null);
      setProfiles([]);
      setProfilesReady(false);
      setSubscription(null);
      setHasLoggedOut(true);
      setAuthError(null);
      setProfileError(null);
      setSubscriptionError(null);
      clearMemorialData();
    };

    const updateUser = async (patchData) => {
      if (!user?.id) return false;
      setAuthError(null);
      try {
        const updated = await patch(`/users/${user.id}`, patchData);
        setUser(mapUser(updated));
        return true;
      } catch (err) {
        setAuthError(err.message || 'Profile update failed.');
        return false;
      }
    };

    const selectProfile = (profile) => {
      if (!profile || Number(profile.userId) !== Number(user?.id)) {
        setProfileError('That memorial profile is not available for this account.');
        return false;
      }
      setProfileError(null);
      setActiveProfile(profile);
      return true;
    };

    const switchProfile = () => {
      setActiveProfile(null);
      clearMemorialData();
    };

    const addProfile = async (profileData) => {
      if (!user?.id) return null;
      setProfileError(null);

      if (profiles.length >= FREE_PROFILE_LIMIT && !isSubscriptionActive(subscription)) {
        setProfileError(`Your free account includes ${FREE_PROFILE_LIMIT} memorial profiles. Choose a subscription to add more.`);
        return null;
      }

      try {
        const created = mapProfile(await post('/deceased-profiles', {
          userId: user.id,
          ...profileData,
        }));
        setProfiles((current) => [...current, created]);
        setProfilesReady(true);
        return created;
      } catch (err) {
        setProfileError(err.message || 'Unable to create this memorial profile.');
        return null;
      }
    };

    const updateProfile = async (profileId, profileData) => {
      setProfileError(null);
      try {
        const updated = mapProfile(await patch(`/deceased-profiles/${profileId}`, profileData));
        setProfiles((current) => current.map((p) => (p.id === updated.id ? updated : p)));
        if (activeProfile?.id === updated.id) setActiveProfile(updated);
        return updated;
      } catch (err) {
        setProfileError(err.message || 'Unable to update this memorial profile.');
        return null;
      }
    };

    const deleteProfile = async (profileId) => {
      setProfileError(null);
      try {
        await del(`/deceased-profiles/${profileId}`);
        setProfiles((current) => current.filter((p) => p.id !== profileId));
        if (activeProfile?.id === profileId) setActiveProfile(null);
        return true;
      } catch (err) {
        setProfileError(err.message || 'Unable to remove this memorial profile.');
        return false;
      }
    };

    const activateSubscription = async (planType) => {
      if (!user?.id) return null;
      setSubscriptionLoading(true);
      setSubscriptionError(null);
      try {
        const created = mapSubscription(await post('/subscriptions', {
          userId: user.id,
          planType,
        }));
        setSubscription(created);
        return created;
      } catch (err) {
        setSubscriptionError(err.message || 'Unable to activate this subscription.');
        return null;
      } finally {
        setSubscriptionLoading(false);
      }
    };

    const addTribute = async (t) => {
      if (!user?.id || !activeProfile?.id) {
        setProfileError('Choose a memorial profile before creating a tribute.');
        return null;
      }
      const created = await post('/tributes', {
        userId: user.id,
        profileId: activeProfile.id,
        narrativeText: t.narrative || t.name || '',
        videoUrl: t.videoUrl || null,
        renderStatus: t.status || 'draft',
      });
      await refreshData(user, activeProfile);
      return created;
    };

    const updateTribute = async (id, patchData) => {
      const updated = await patch(`/tributes/${id}`, patchData);
      await refreshData(user, activeProfile);
      return updated;
    };

    const deleteTribute = async (id) => {
      await del(`/tributes/${id}`);
      await refreshData(user, activeProfile);
    };

    const createQr = async (tributeId, code) => {
      const created = await post('/qr', { tributeId: Number(tributeId), code });
      await refreshData(user, activeProfile);
      return created;
    };

    return {
      user,
      profiles,
      activeProfile,
      tributes,
      qrCodes,
      subscription,
      hasActiveSubscription: isSubscriptionActive(subscription),
      freeProfileLimit: FREE_PROFILE_LIMIT,
      authLoading,
      profilesLoading,
      profilesReady,
      subscriptionLoading,
      dataLoading,
      authError,
      profileError,
      subscriptionError,
      hasLoggedOut,
      login,
      register,
      logout,
      updateUser,
      refreshProfiles,
      refreshSubscription,
      selectProfile,
      switchProfile,
      addProfile,
      updateProfile,
      deleteProfile,
      activateSubscription,
      refreshData,
      addTribute,
      updateTribute,
      deleteTribute,
      createQr,
    };
  }, [
    user,
    profiles,
    activeProfile,
    tributes,
    qrCodes,
    subscription,
    authLoading,
    profilesLoading,
    profilesReady,
    subscriptionLoading,
    dataLoading,
    authError,
    profileError,
    subscriptionError,
    hasLoggedOut,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
