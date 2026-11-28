'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useWorkspaceTransition } from '@/components/WorkspaceTransitionProvider';
import {
  SkillListing,
  AgreementRoom,
  ChatMessage,
  ChatAttachment,
  WalletTransaction,
  CommunitySpace,
  BetaPlan,
  ToastMessage,
  ListingType,
  ListingFormat,
  CommunityCategory,
  ProfileChecklistItem,
  AgreementStage,
  WorkspaceNotification,
} from '@/types/workspace';
import { INITIAL_BETA_PLANS } from '@/lib/seed-workspace';
import { compressAvatarFile } from '@/lib/avatar';

function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'ET';
  return ((parts[0][0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'ET';
}

function mapApiListing(l: any, currentUserId?: string): SkillListing {
  const authorName = l.authorName || l.author?.fullName || 'Student Member';
  const authorInitials = getInitials(authorName);
  const isMine = Boolean(currentUserId && (l.authorId === currentUserId || l.isMine));

  return {
    id: l.id,
    authorId: l.authorId,
    category: l.category || 'General',
    type: (l.type === 'LOOKING_FOR' || l.type === 'Looking for' || l.type === 'Requests') ? 'Looking for' : 'Offering',
    authorInitials,
    authorName,
    listedAt: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Listed recently',
    rating: l.rating ?? 5.0,
    reviewsCount: l.reviewsCount ?? 0,
    title: l.title,
    description: l.description,
    format: (l.format === 'IN_PERSON' || l.format === 'In-person') ? 'In-person' : (l.format === 'HYBRID' || l.format === 'Hybrid') ? 'Hybrid' : 'Online',
    creditsPerHr: l.creditsPerHr || 1,
    saved: Boolean(l.isSaved || l.saved),
    savedAt: l.savedAt ?? null,
    isMine,
  };
}

function mapApiRoom(r: any, currentUserId: string): AgreementRoom {
  const isRequester = r.requesterId === currentUserId;
  const peer = isRequester ? r.provider : r.requester;
  const peerName = peer?.fullName || 'Peer Student';
  const stageMap: Record<string, AgreementStage> = {
    NEGOTIATING: 'Negotiating',
    CONFIRMED_ESCROWED: 'Confirmed & escrowed',
    DELIVERED: 'Delivered',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  return {
    id: r.id,
    title: r.title,
    category: r.category,
    peerName,
    peerInitials: getInitials(peerName),
    role: isRequester ? 'requester' : 'provider',
    goal: r.goal,
    format: r.format === 'In-person' ? 'In-person' : r.format === 'Hybrid' ? 'Hybrid' : 'Online',
    durationHrs: r.durationHrs,
    creditsPerHr: r.creditsPerHr,
    termsVersion: r.termsVersion,
    stage: stageMap[r.stage] || 'Negotiating',
    messages: (r.messages || []).map((m: any) => ({
      id: m.id,
      sender: m.senderType === 'SYSTEM' ? 'system' : m.senderId === currentUserId ? 'me' : 'peer',
      author: m.authorLabel,
      text: m.body,
      attachment: m.attachmentUrl
        ? {
            url: m.attachmentUrl,
            name: m.attachmentName || 'Attachment',
            type: (m.attachmentType as 'image' | 'audio' | 'file') || 'file',
            size: m.attachmentSize || '',
          }
        : undefined,
      time: m.createdAt
        ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now',
    })),
  };
}

interface WorkspaceContextType {
  // Theme
  themeMode: 'dark' | 'light';
  setThemeMode: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
  toggleTheme: () => void;

  // Auth
  currentUserId: string;
  authStatus: 'loading' | 'authenticated' | 'unauthenticated';
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (val: 'login' | 'signup') => void;
  authEmail: string;
  setAuthEmail: (val: string) => void;
  authPassword: string;
  setAuthPassword: (val: string) => void;
  authFullName: string;
  setAuthFullName: (val: string) => void;
  handleAuthSubmit: (e: React.FormEvent) => void;
  handleLogout: () => void;

  // Ledger
  availableCredits: number;
  reservedCredits: number;
  earnedLifetime: number;
  spentLifetime: number;
  completedExchanges: number;
  transactions: WalletTransaction[];

  // Explore Listings
  listings: SkillListing[];
  savedListings: SkillListing[];
  savingListingIds: Record<string, boolean>;
  refreshSavedListings: () => Promise<void>;
  handleToggleSaveListing: (id: string) => Promise<void>;
  handleCreateListing: (form: {
    type: ListingType;
    category: string;
    title: string;
    description: string;
    format: ListingFormat;
    creditsPerHr: number;
  }) => void;
  postModalOpen: boolean;
  setPostModalOpen: (val: boolean) => void;

  // Agreement Rooms
  rooms: AgreementRoom[];
  activeRoomId: string;
  setActiveRoomId: (id: string) => void;
  activeRoom: AgreementRoom | undefined;
  roomSwitcherOpen: boolean;
  setRoomSwitcherOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatInput: string;
  setChatInput: (val: string) => void;
  chatAttachment: ChatAttachment | null;
  setChatAttachment: React.Dispatch<React.SetStateAction<ChatAttachment | null>>;
  editingGoal: boolean;
  setEditingGoal: (val: boolean) => void;
  handleSendChatMessage: (e?: React.FormEvent, overrideAttachment?: ChatAttachment | null) => void;
  handleUpdateRoomTerms: (patch: Partial<AgreementRoom>) => void;
  handleAdvanceAgreementStage: () => void;
  handleCancelExchange: () => void;
  handleOpenRoomForListing: (listing: SkillListing) => void;

  // Community Spaces
  spaces: CommunitySpace[];
  spaceModalOpen: boolean;
  setSpaceModalOpen: (val: boolean) => void;
  editingSpaceId: string | null;
  setEditingSpaceId: (id: string | null) => void;
  spaceForm: {
    kind: CommunityCategory;
    tag: string;
    title: string;
    description: string;
  };
  setSpaceForm: React.Dispatch<
    React.SetStateAction<{
      kind: CommunityCategory;
      tag: string;
      title: string;
      description: string;
    }>
  >;
  handleSaveSpace: (e: React.FormEvent) => void;
  handleDeleteSpace: (id: string) => void;

  // Subscription Beta
  betaPlans: BetaPlan[];
  handleToggleWaitlist: (planId: string) => void;

  // Profile
  profileFullName: string;
  setProfileFullName: (val: string) => void;
  profileUsername: string;
  setProfileUsername: (val: string) => void;
  profileUniversity: string;
  setProfileUniversity: (val: string) => void;
  profileBio: string;
  setProfileBio: (val: string) => void;
  profileAvailability: string;
  setProfileAvailability: (val: string) => void;
  hasProfilePhoto: boolean;
  setHasProfilePhoto: React.Dispatch<React.SetStateAction<boolean>>;
  avatarUrl: string | null;
  setAvatarUrl: React.Dispatch<React.SetStateAction<string | null>>;
  authProvider: string;
  userCreatedAt: string | null;
  avatarSaving: boolean;
  handleUploadAvatar: (file: File) => Promise<void>;
  handleRemoveAvatar: () => Promise<void>;
  offeredSkills: string[];
  setOfferedSkills: React.Dispatch<React.SetStateAction<string[]>>;
  newSkillInput: string;
  setNewSkillInput: (val: string) => void;
  handleAddOfferedSkill: (e: React.FormEvent) => void;
  handleRemoveOfferedSkill: (skill: string) => void;
  userInitials: string;
  profileChecklist: ProfileChecklistItem[];
  profileCompletionPct: number;

  // Toasts
  toasts: ToastMessage[];
  pushToast: (text: string) => void;

  // Notifications
  notifications: WorkspaceNotification[];
  unreadNotifs: number;
  setUnreadNotifs: (val: number) => void;
  notifOpen: boolean;
  setNotifOpen: React.Dispatch<React.SetStateAction<boolean>>;
  browserNotifPermission: NotificationPermission | 'unsupported';
  requestBrowserNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refreshNotifications: (announceNew?: boolean) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { navigateWithLoader } = useWorkspaceTransition();

  // Theme
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('et-theme');
      if (saved === 'light' || saved === 'dark') {
        setThemeMode(saved);
      }
    } catch {
      // Ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('et-theme', next);
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  // Auth & Profile
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authFullName, setAuthFullName] = useState<string>('');
  const [profileFullName, setProfileFullName] = useState<string>('');
  const [profileUsername, setProfileUsername] = useState<string>('');
  const [profileUniversity, setProfileUniversity] = useState<string>('');
  const [profileBio, setProfileBio] = useState<string>('');
  const [profileAvailability, setProfileAvailability] = useState<string>('Weekends & Evenings');
  const [hasProfilePhoto, setHasProfilePhoto] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [authProvider, setAuthProvider] = useState<string>('EMAIL');
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState<boolean>(false);
  const [offeredSkills, setOfferedSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState<string>('');

  // Ledger & Balances
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [reservedCredits, setReservedCredits] = useState<number>(0);
  const [earnedLifetime, setEarnedLifetime] = useState<number>(0);
  const [spentLifetime, setSpentLifetime] = useState<number>(0);
  const [completedExchanges, setCompletedExchanges] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  // Explore Listings
  const [listings, setListings] = useState<SkillListing[]>([]);
  const [savingListingIds, setSavingListingIds] = useState<Record<string, boolean>>({});
  const savingIdsRef = useRef<Set<string>>(new Set());
  const [postModalOpen, setPostModalOpen] = useState<boolean>(false);

  const savedListings = useMemo(() => {
    return listings
      .filter((l) => l.saved)
      .sort((a, b) => {
        const aTime = a.savedAt ? Date.parse(a.savedAt) : 0;
        const bTime = b.savedAt ? Date.parse(b.savedAt) : 0;
        return bTime - aTime;
      });
  }, [listings]);

  // Agreement Rooms
  const [rooms, setRooms] = useState<AgreementRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [roomSwitcherOpen, setRoomSwitcherOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatAttachment, setChatAttachment] = useState<ChatAttachment | null>(null);
  const [editingGoal, setEditingGoal] = useState<boolean>(false);

  // Community
  const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
  const [spaceModalOpen, setSpaceModalOpen] = useState<boolean>(false);
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  const [spaceForm, setSpaceForm] = useState<{
    kind: CommunityCategory;
    tag: string;
    title: string;
    description: string;
  }>({
    kind: 'Project',
    tag: 'tech',
    title: '',
    description: '',
  });

  // Subscription Beta
  const [betaPlans, setBetaPlans] = useState<BetaPlan[]>(INITIAL_BETA_PLANS);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Notifications
  const [notifications, setNotifications] = useState<WorkspaceNotification[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState<number>(0);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);
  const [browserNotifPermission, setBrowserNotifPermission] = useState<
    NotificationPermission | 'unsupported'
  >('unsupported');
  const seenNotifIdsRef = useRef<Set<string>>(new Set());
  const notifsSeededRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserNotifPermission(window.Notification.permission);
    }
  }, []);

  const pushToast = useCallback((text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const applyIncomingNotifications = useCallback(
    (incomingList: WorkspaceNotification[], incomingUnread: number, announceNew: boolean) => {
      setNotifications(incomingList);
      setUnreadNotifs(incomingUnread);

      const newlyArrivedUnread = incomingList.filter(
        (n) => !n.read && !seenNotifIdsRef.current.has(n.id)
      );

      for (const item of incomingList) {
        seenNotifIdsRef.current.add(item.id);
      }

      if (!notifsSeededRef.current) {
        notifsSeededRef.current = true;
        return;
      }

      if (!announceNew || newlyArrivedUnread.length === 0) return;

      const latest = newlyArrivedUnread[0];
      pushToast(`${latest.title} — ${latest.body}`);

      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        window.Notification.permission === 'granted'
      ) {
        try {
          const browserNotif = new window.Notification(latest.title, {
            body: latest.body,
            tag: `echotime-${latest.id}`,
          });
          browserNotif.onclick = () => {
            window.focus();
            if (latest.href) {
              navigateWithLoader(latest.href);
            }
            browserNotif.close();
          };
        } catch {
          // Ignore browsers blocking Notification constructor inside unsupported tabs
        }
      }
    },
    [pushToast, navigateWithLoader]
  );

  const requestBrowserNotifications = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserNotifPermission('unsupported');
      pushToast('This browser does not support desktop web notifications.');
      return;
    }

    try {
      const perm = await window.Notification.requestPermission();
      setBrowserNotifPermission(perm);
      if (perm === 'granted') {
        pushToast('Web browser alerts enabled — you will be alerted when peers request your skills.');
      } else if (perm === 'denied') {
        pushToast('Web alerts blocked. Enable notifications in your browser site settings.');
      }
    } catch {
      pushToast('Could not update browser notification permission.');
    }
  }, [pushToast]);

  const markNotificationRead = useCallback(async (id: string) => {
    let decremented = false;
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.read) {
          decremented = true;
          return { ...n, read: true };
        }
        return n;
      })
    );
    if (decremented) {
      setUnreadNotifs((u) => Math.max(0, u - 1));
    }

    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data?.unreadCount === 'number') {
          setUnreadNotifs(data.unreadCount);
        }
      }
    } catch {
      // Keep optimistic read UI
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadNotifs(0);

    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data?.unreadCount === 'number') {
          setUnreadNotifs(data.unreadCount);
        }
      }
    } catch {
      // Keep optimistic read UI
    }
  }, []);

  // Sync with live PostgreSQL Backend API cleanly without triggering dev overlays on transient disconnects
  const refreshDatabaseState = useCallback(async (signal?: AbortSignal) => {
    const safeFetchJson = async (url: string) => {
      try {
        const res = await fetch(url, { cache: 'no-store', signal });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    };

    try {
      // 1. Strict Session Verification Gate
      let sessionRes: Response;
      try {
        sessionRes = await fetch('/api/auth/session', { cache: 'no-store', signal });
      } catch {
        return;
      }
      if (signal?.aborted) return;

      if (sessionRes.status === 401 || sessionRes.status === 403) {
        setIsAuthenticated(false);
        setAuthStatus('unauthenticated');
        window.location.replace('/login');
        return;
      }

      const sessionData = sessionRes.ok ? await sessionRes.json().catch(() => null) : null;
      if (signal?.aborted) return;

      if (!sessionData?.authenticated || !sessionData?.user) {
        setIsAuthenticated(false);
        setAuthStatus('unauthenticated');
        window.location.replace('/login');
        return;
      }

      const u = sessionData.user;
      const loggedInUserId = u.id;
      setCurrentUserId(u.id);
      setIsAuthenticated(true);
      setAuthStatus('authenticated');
      setProfileFullName(u.fullName || '');
      setAuthFullName(u.fullName || '');
      setAuthEmail(u.email || '');
      setProfileUsername(u.username || '');
      setProfileUniversity(u.university || '');
      setProfileBio(u.bio || '');
      setProfileAvailability(u.availability || 'Weekends & Evenings');
      setAvatarUrl(u.avatarUrl ?? null);
      setAuthProvider(u.authProvider || 'EMAIL');
      setUserCreatedAt(u.createdAt ? String(u.createdAt) : null);
      setHasProfilePhoto(Boolean(u.avatarUrl));
      setOfferedSkills(Array.isArray(u.offeredSkills) ? u.offeredSkills : []);
      setAvailableCredits(typeof u.availableCredits === 'number' ? u.availableCredits : 5.0);
      setReservedCredits(typeof u.reservedCredits === 'number' ? u.reservedCredits : 0.0);
      setEarnedLifetime(typeof u.earnedLifetime === 'number' ? u.earnedLifetime : 0.0);
      setSpentLifetime(typeof u.spentLifetime === 'number' ? u.spentLifetime : 0.0);
      setCompletedExchanges(typeof u.completedExchanges === 'number' ? u.completedExchanges : 0);

      // 2. Wallet & Transactions + 3. Agreement Rooms + 6. Beta Subscription + Notifications
      const [walletData, agreementsData, betaData, listingsData, commData, notifData] = await Promise.all([
        safeFetchJson('/api/wallet'),
        safeFetchJson('/api/agreements'),
        safeFetchJson('/api/subscription/beta'),
        safeFetchJson('/api/listings'),
        safeFetchJson('/api/community'),
        safeFetchJson('/api/notifications'),
      ]);

      if (signal?.aborted) return;

      if (walletData?.telemetry) {
        const t = walletData.telemetry;
        setAvailableCredits(t.availableCredits);
        setReservedCredits(t.reservedCredits);
        setEarnedLifetime(t.earnedLifetime);
        setSpentLifetime(t.spentLifetime);
        setCompletedExchanges(t.completedExchanges);
      }
      if (Array.isArray(walletData?.transactions)) {
        setTransactions(
          walletData.transactions.map((tx: any) => ({
            id: tx.id,
            initials: tx.initials || 'ET',
            counterparty: tx.counterparty,
            title: tx.title,
            availableDelta: tx.availableDelta,
            reservedDelta: tx.reservedDelta,
            typeLabel: tx.type,
            time: tx.date || 'Recent',
          }))
        );
      }

      if (Array.isArray(agreementsData?.agreements)) {
        const mappedRooms = agreementsData.agreements.map((r: any) => mapApiRoom(r, loggedInUserId));
        setRooms(mappedRooms);
        if (mappedRooms[0]) {
          setActiveRoomId((prev) => prev || mappedRooms[0].id);
        }
      }

      if (Array.isArray(listingsData?.listings)) {
        setListings(listingsData.listings.map((l: any) => mapApiListing(l, loggedInUserId)));
      }

      if (Array.isArray(commData?.spaces)) {
        setSpaces(
          commData.spaces.map((s: any) => ({
            id: s.id,
            kind: s.kind === 'GROUP' ? 'Group' : s.kind === 'EVENT' ? 'Event' : 'Project',
            tag: s.tag,
            eyebrowCta: s.eyebrowCta,
            title: s.title,
            description: s.description,
            hostName: s.host?.fullName || 'Campus Peer',
            hostInitials: getInitials(s.host?.fullName || 'CP'),
            members: s.membersCount || 1,
            isHost: Boolean(loggedInUserId && s.hostId === loggedInUserId),
          }))
        );
      }

      if (Array.isArray(betaData?.plans)) {
        setBetaPlans((prev) =>
          prev.map((p) => ({
            ...p,
            onWaitlist: betaData.plans.includes(p.id),
          }))
        );
      }

      if (Array.isArray(notifData?.notifications)) {
        applyIncomingNotifications(
          notifData.notifications,
          typeof notifData.unreadCount === 'number' ? notifData.unreadCount : 0,
          false
        );
      }
    } catch (err) {
      if (!signal?.aborted) {
        console.warn('Database sync skipped:', err);
      }
    }
  }, [applyIncomingNotifications]);

  const refreshNotifications = useCallback(
    async (announceNew = true) => {
      if (authStatus !== 'authenticated') return;
      try {
        const res = await fetch('/api/notifications', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data?.notifications)) return;

        const hasUnseenUnread = (data.notifications as WorkspaceNotification[]).some(
          (n) => !n.read && !seenNotifIdsRef.current.has(n.id)
        );

        applyIncomingNotifications(
          data.notifications,
          typeof data.unreadCount === 'number' ? data.unreadCount : 0,
          announceNew
        );

        // Keep active rooms list in sync when a new skill request notification arrives
        if (hasUnseenUnread && currentUserId) {
          const agreementsRes = await fetch('/api/agreements', { cache: 'no-store' }).catch(() => null);
          if (agreementsRes?.ok) {
            const agreementsData = await agreementsRes.json().catch(() => null);
            if (Array.isArray(agreementsData?.agreements)) {
              setRooms(
                agreementsData.agreements.map((r: any) => mapApiRoom(r, currentUserId))
              );
            }
          }
        }
      } catch {
        // Ignore transient offline errors during background polling
      }
    },
    [authStatus, applyIncomingNotifications, currentUserId]
  );

  useEffect(() => {
    const controller = new AbortController();
    refreshDatabaseState(controller.signal);

    // Re-validate session immediately if restored via browser Back/Forward cache (bfcache)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        refreshDatabaseState();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      controller.abort();
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [refreshDatabaseState]);

  // Real-time background polling & tab-focus sync for incoming Skill Request web notifications
  useEffect(() => {
    if (authStatus !== 'authenticated') return;

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshNotifications(true);
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshNotifications(true);
      }
    }, 10_000);

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [authStatus, refreshNotifications]);

  const userInitials = useMemo(() => {
    return getInitials(profileFullName || 'Student');
  }, [profileFullName]);

  const activeRoom = useMemo(() => {
    return rooms.find((r) => r.id === activeRoomId) || rooms[0];
  }, [rooms, activeRoomId]);

  // Profile Completion Meter — "Add a photo" bound strictly to Boolean(avatarUrl)
  const profileChecklist = useMemo<ProfileChecklistItem[]>(
    () => [
      { id: 'photo', label: 'Add a photo', done: Boolean(avatarUrl) },
      { id: 'bio', label: 'Write a bio', done: profileBio.trim().length >= 8 },
      { id: 'skills', label: 'Offer three skills', done: offeredSkills.length >= 3 },
      { id: 'project', label: 'Add a project', done: spaces.length > 0 },
      { id: 'learn', label: 'Choose a skill to learn', done: true },
    ],
    [avatarUrl, profileBio, offeredSkills.length, spaces.length]
  );

  const profileCompletionPct = useMemo(() => {
    const completed = profileChecklist.filter((c) => c.done).length;
    return Math.round((completed / profileChecklist.length) * 100);
  }, [profileChecklist]);

  const refreshSavedListings = useCallback(async () => {
    try {
      const res = await fetch('/api/listings/saved', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data?.listings)) return;

      const savedMap = new Map<string, string | null>();
      const apiSavedMapped: SkillListing[] = data.listings.map((item: any) => {
        const mapped = mapApiListing({ ...item, isSaved: true, saved: true }, currentUserId);
        savedMap.set(mapped.id, mapped.savedAt ?? null);
        return mapped;
      });

      setListings((prev) => {
        const nextIds = new Set(prev.map((l) => l.id));
        const updated = prev.map((l) =>
          savedMap.has(l.id)
            ? { ...l, saved: true, savedAt: savedMap.get(l.id) ?? l.savedAt ?? null }
            : { ...l, saved: false, savedAt: null }
        );
        const missingFromAll = apiSavedMapped.filter((l) => !nextIds.has(l.id));
        return [...missingFromAll, ...updated];
      });
    } catch {
      // Keep current synced state cleanly on transient offline error
    }
  }, [currentUserId]);

  // Handlers
  const handleToggleSaveListing = useCallback(
    async (id: string) => {
      if (savingIdsRef.current.has(id)) return;

      const existing = listings.find((l) => l.id === id);
      const previousSaved = Boolean(existing?.saved);
      const previousSavedAt = existing?.savedAt ?? null;
      const targetTitle = existing?.title || 'Skill listing';
      const optimisticSaved = !previousSaved;

      savingIdsRef.current.add(id);
      setSavingListingIds((prev) => ({ ...prev, [id]: true }));
      setListings((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                saved: optimisticSaved,
                savedAt: optimisticSaved ? new Date().toISOString() : null,
              }
            : l
        )
      );

      try {
        const res = await fetch(`/api/listings/${encodeURIComponent(id)}/save`, {
          method: 'POST',
          cache: 'no-store',
        });

        if (res.status === 401) {
          setIsAuthenticated(false);
          setAuthStatus('unauthenticated');
          window.location.replace('/login');
          return;
        }

        const data = await res.json().catch(() => null);
        if (!res.ok || typeof data?.saved !== 'boolean') {
          setListings((prev) =>
            prev.map((l) =>
              l.id === id ? { ...l, saved: previousSaved, savedAt: previousSavedAt } : l
            )
          );
          pushToast(data?.error || 'Could not update Saved Skills in database.');
          return;
        }

        const confirmedSaved: boolean = data.saved;
        const confirmedSavedAt: string | null = data.savedAt ?? (confirmedSaved ? new Date().toISOString() : null);

        setListings((prev) =>
          prev.map((l) =>
            l.id === id
              ? { ...l, saved: confirmedSaved, savedAt: confirmedSavedAt }
              : l
          )
        );
        pushToast(
          confirmedSaved
            ? `Saved "${targetTitle}" to Saved Skills.`
            : `Removed "${targetTitle}" from Saved Skills.`
        );
      } catch {
        setListings((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, saved: previousSaved, savedAt: previousSavedAt } : l
          )
        );
        pushToast('Network error — could not save listing to database.');
      } finally {
        savingIdsRef.current.delete(id);
        setSavingListingIds((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    },
    [listings, pushToast]
  );

  const handleCreateListing = useCallback(
    async (form: {
      type: ListingType;
      category: string;
      title: string;
      description: string;
      format: ListingFormat;
      creditsPerHr: number;
    }) => {
      const cleanTitle = form.title?.trim();
      if (!cleanTitle) {
        pushToast('Please add a skill title before publishing.');
        return;
      }

      const cleanCategory = form.category?.trim() || 'Programming';
      const cleanDescription = form.description?.trim() || `1-on-1 collaborative exchange covering ${cleanTitle}.`;

      try {
        const res = await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: cleanTitle,
            description: cleanDescription,
            category: cleanCategory,
            type: form.type === 'Looking for' ? 'LOOKING_FOR' : 'OFFERING',
            format: form.format === 'In-person' ? 'IN_PERSON' : form.format === 'Hybrid' ? 'HYBRID' : 'ONLINE',
            creditsPerHr: form.creditsPerHr || 1,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          pushToast(data.error || 'Failed to publish skill');
          return;
        }

        if (data?.listing) {
          const mapped = mapApiListing(data.listing, currentUserId);
          setListings((prev) => [mapped, ...prev.filter((l) => l.id !== mapped.id)]);
          setPostModalOpen(false);
          pushToast(`Published "${mapped.title}" to Explore marketplace.`);
        }
      } catch (err: any) {
        pushToast(err?.message || 'Error publishing skill to database.');
      }
    },
    [currentUserId, pushToast]
  );

  const handleOpenRoomForListing = useCallback(
    async (listing: SkillListing) => {
      // Check if room already exists locally
      const existing = rooms.find(
        (r) =>
          r.title.toLowerCase() === listing.title.toLowerCase() &&
          r.peerName.toLowerCase() === listing.authorName.toLowerCase()
      );
      if (existing) {
        setActiveRoomId(existing.id);
        navigateWithLoader(`/agreement?roomId=${existing.id}`);
        pushToast(`Navigated to active agreement room for "${listing.title}".`);
        return;
      }

      try {
        const res = await fetch('/api/agreements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId: listing.id,
            providerId: listing.authorId,
            title: listing.title,
            category: listing.category,
            creditsPerHr: listing.creditsPerHr,
            format: listing.format,
          }),
        });

        const data = await res.json();
        if (res.ok && data?.agreement) {
          const mapped = mapApiRoom(data.agreement, currentUserId);
          setRooms((prev) => [mapped, ...prev]);
          setActiveRoomId(mapped.id);
          navigateWithLoader(`/agreement?roomId=${mapped.id}`);
          pushToast(`Opened Agreement room for "${listing.title}" with ${listing.authorName}.`);
        } else {
          pushToast(data?.error || 'Failed to open agreement room');
        }
      } catch (err: any) {
        pushToast(err?.message || 'Error creating agreement room in database.');
      }
    },
    [rooms, currentUserId, navigateWithLoader, pushToast]
  );

  const handleSendChatMessage = useCallback(
    async (e?: React.FormEvent, overrideAttachment?: ChatAttachment | null) => {
      if (e) e.preventDefault();
      const att = overrideAttachment !== undefined ? overrideAttachment : chatAttachment;
      const text = chatInput.trim();
      if ((!text && !att) || !activeRoom) return;

      setChatInput('');
      setChatAttachment(null);

      const tempId = `msg-${Date.now()}`;
      const msg: ChatMessage = {
        id: tempId,
        sender: 'me',
        author: profileFullName,
        text: text || (att ? `Shared attachment: ${att.name}` : ''),
        attachment: att || undefined,
        time: 'Just now',
      };

      setRooms((prev) =>
        prev.map((r) => (r.id === activeRoom.id ? { ...r, messages: [...r.messages, msg] } : r))
      );

      try {
        const res = await fetch(`/api/agreements/${activeRoom.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            body: text,
            attachmentUrl: att?.url || null,
            attachmentName: att?.name || null,
            attachmentType: att?.type || null,
            attachmentSize: att?.size || null,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.message) {
            setRooms((prev) =>
              prev.map((r) =>
                r.id === activeRoom.id
                  ? {
                      ...r,
                      messages: r.messages.map((m) =>
                        m.id === tempId
                          ? {
                              ...m,
                              id: data.message.id,
                              attachment: data.message.attachmentUrl
                                ? {
                                    url: data.message.attachmentUrl,
                                    name: data.message.attachmentName || 'Attachment',
                                    type: (data.message.attachmentType as 'image' | 'audio' | 'file') || 'file',
                                    size: data.message.attachmentSize || '',
                                  }
                                : m.attachment,
                            }
                          : m
                      ),
                    }
                  : r
              )
            );
          }
        }
      } catch (err) {
        console.error('Failed to persist chat message:', err);
      }
    },
    [chatInput, chatAttachment, activeRoom, profileFullName]
  );

  const handleUpdateRoomTerms = useCallback(
    async (patch: Partial<AgreementRoom>) => {
      if (!activeRoom || activeRoom.stage !== 'Negotiating') return;

      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoom.id ? { ...r, ...patch, termsVersion: r.termsVersion + 1 } : r
        )
      );

      try {
        await fetch(`/api/agreements/${activeRoom.id}/terms`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });
      } catch (err) {
        console.error('Failed to update terms in database:', err);
      }
    },
    [activeRoom]
  );

  const handleAdvanceAgreementStage = useCallback(async () => {
    if (!activeRoom) return;
    const totalCredits = activeRoom.durationHrs * activeRoom.creditsPerHr;

    if (activeRoom.stage === 'Negotiating' && activeRoom.role === 'requester' && availableCredits < totalCredits) {
      pushToast(`Insufficient credits. Required: ${totalCredits.toFixed(2)} ECHO, Available: ${availableCredits.toFixed(2)} ECHO.`);
      return;
    }

    try {
      const res = await fetch(`/api/agreements/${activeRoom.id}/advance`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast(data.error || 'Failed to advance agreement');
        return;
      }

      if (data?.agreement) {
        const mapped = mapApiRoom(data.agreement, currentUserId);
        setRooms((prev) => prev.map((r) => (r.id === activeRoom.id ? mapped : r)));
      }

      // Re-fetch fresh wallet and telemetry from database
      const walletRes = await fetch('/api/wallet', { cache: 'no-store' });
      if (walletRes.ok) {
        const wData = await walletRes.json();
        if (wData?.telemetry) {
          setAvailableCredits(wData.telemetry.availableCredits);
          setReservedCredits(wData.telemetry.reservedCredits);
          setEarnedLifetime(wData.telemetry.earnedLifetime);
          setSpentLifetime(wData.telemetry.spentLifetime);
          setCompletedExchanges(wData.telemetry.completedExchanges);
        }
        if (Array.isArray(wData?.transactions)) {
          setTransactions(
            wData.transactions.map((tx: any) => ({
              id: tx.id,
              initials: tx.initials || 'ET',
              counterparty: tx.counterparty,
              title: tx.title,
              availableDelta: tx.availableDelta,
              reservedDelta: tx.reservedDelta,
              typeLabel: tx.type,
              time: tx.date || 'Recent',
            }))
          );
        }
      }

      pushToast(data.message || 'Agreement stage advanced and ledger updated.');
    } catch (err: any) {
      pushToast(err.message || 'Error updating agreement stage.');
    }
  }, [activeRoom, availableCredits, currentUserId, pushToast]);

  const handleCancelExchange = useCallback(async () => {
    if (!activeRoom || activeRoom.stage === 'Completed' || activeRoom.stage === 'Cancelled') return;

    try {
      const res = await fetch(`/api/agreements/${activeRoom.id}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast(data.error || 'Failed to cancel agreement');
        return;
      }

      if (data?.agreement) {
        const mapped = mapApiRoom(data.agreement, currentUserId);
        setRooms((prev) => prev.map((r) => (r.id === activeRoom.id ? mapped : r)));
      }

      // Re-fetch wallet
      const walletRes = await fetch('/api/wallet', { cache: 'no-store' });
      if (walletRes.ok) {
        const wData = await walletRes.json();
        if (wData?.telemetry) {
          setAvailableCredits(wData.telemetry.availableCredits);
          setReservedCredits(wData.telemetry.reservedCredits);
        }
      }

      pushToast('Agreement cancelled. Reserved credits refunded.');
    } catch (err: any) {
      pushToast(err.message || 'Error cancelling agreement.');
    }
  }, [activeRoom, currentUserId, pushToast]);

  const handleSaveSpace = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!spaceForm.title.trim()) {
        pushToast('Enter a title for the space.');
        return;
      }

      try {
        if (editingSpaceId) {
          const res = await fetch(`/api/community/${editingSpaceId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              kind: spaceForm.kind.toUpperCase(),
              tag: spaceForm.tag,
              title: spaceForm.title,
              description: spaceForm.description,
            }),
          });
          const data = await res.json();
          if (res.ok && data?.space) {
            setSpaces((prev) =>
              prev.map((s) =>
                s.id === editingSpaceId
                  ? {
                      ...s,
                      kind: spaceForm.kind,
                      tag: spaceForm.tag,
                      title: spaceForm.title,
                      description: spaceForm.description,
                    }
                  : s
              )
            );
            pushToast('Updated community space in database.');
          }
        } else {
          const eyebrowMap: Record<CommunityCategory, string> = {
            Project: 'Build with peers',
            Group: 'Join study circle',
            Event: 'Attend campus session',
          };

          const res = await fetch('/api/community', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              kind: spaceForm.kind.toUpperCase(),
              tag: spaceForm.tag.trim() || 'tech',
              eyebrowCta: eyebrowMap[spaceForm.kind],
              title: spaceForm.title.trim(),
              description: spaceForm.description.trim() || 'Student collaboration space',
            }),
          });

          const data = await res.json();
          if (res.ok && data?.space) {
            const s = data.space;
            const newSpace: CommunitySpace = {
              id: s.id,
              kind: spaceForm.kind,
              tag: s.tag,
              eyebrowCta: s.eyebrowCta,
              title: s.title,
              description: s.description,
              hostName: profileFullName,
              hostInitials: userInitials,
              members: 1,
              isHost: true,
            };
            setSpaces((prev) => [newSpace, ...prev]);
            pushToast(`Created "${newSpace.title}" in Community database.`);
          }
        }
      } catch (err) {
        console.error('Space save error:', err);
      }

      setSpaceModalOpen(false);
      setEditingSpaceId(null);
      setSpaceForm({ kind: 'Project', tag: 'tech', title: '', description: '' });
    },
    [spaceForm, editingSpaceId, profileFullName, userInitials, pushToast]
  );

  const handleDeleteSpace = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/community/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setSpaces((prev) => prev.filter((s) => s.id !== id));
          pushToast('Deleted space from database.');
        }
      } catch (err) {
        console.error('Delete space error:', err);
      }
    },
    [pushToast]
  );

  const handleToggleWaitlist = useCallback(
    async (planId: string) => {
      setBetaPlans((prev) =>
        prev.map((p) => {
          if (p.id !== planId) return p;
          const next = !p.onWaitlist;
          pushToast(
            next
              ? `Saved Beta interest for ${p.name}. Nothing is charged.`
              : `Removed ${p.name} from your Beta interest list.`
          );
          return { ...p, onWaitlist: next };
        })
      );

      try {
        await fetch('/api/subscription/beta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planKey: planId }),
        });
      } catch (err) {
        console.error('Toggle waitlist error:', err);
      }
    },
    [pushToast]
  );

  const handleAddOfferedSkill = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const cleaned = newSkillInput.trim();
      if (!cleaned) return;
      if (offeredSkills.includes(cleaned)) {
        setNewSkillInput('');
        return;
      }

      const prevSkills = offeredSkills;
      const updated = [...offeredSkills, cleaned];
      setOfferedSkills(updated);
      setNewSkillInput('');

      try {
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offeredSkills: updated }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setOfferedSkills(prevSkills);
          pushToast(data?.error || 'Could not save skill to database.');
          return;
        }
        if (Array.isArray(data?.profile?.offeredSkills)) {
          setOfferedSkills(data.profile.offeredSkills);
        }
        pushToast(`Added "${cleaned}" to skills you offer.`);
      } catch {
        setOfferedSkills(prevSkills);
        pushToast('Network error — could not save skill.');
      }
    },
    [newSkillInput, offeredSkills, pushToast]
  );

  const handleRemoveOfferedSkill = useCallback(
    async (skill: string) => {
      const prevSkills = offeredSkills;
      const updated = offeredSkills.filter((item) => item !== skill);
      setOfferedSkills(updated);
      try {
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offeredSkills: updated }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setOfferedSkills(prevSkills);
          pushToast(data?.error || 'Could not remove skill from database.');
          return;
        }
        if (Array.isArray(data?.profile?.offeredSkills)) {
          setOfferedSkills(data.profile.offeredSkills);
        }
      } catch {
        setOfferedSkills(prevSkills);
        pushToast('Network error — could not remove skill.');
      }
    },
    [offeredSkills, pushToast]
  );

  const handleUploadAvatar = useCallback(
    async (file: File) => {
      try {
        setAvatarSaving(true);
        const compressed = await compressAvatarFile(file);
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarUrl: compressed }),
        });
        const data = await res.json();
        if (!res.ok) {
          pushToast(data?.error || 'Could not update profile photo.');
          return;
        }
        const savedUrl: string | null = data?.profile?.avatarUrl ?? compressed;
        setAvatarUrl(savedUrl);
        setHasProfilePhoto(Boolean(savedUrl));
        pushToast('PROFILE PHOTO UPDATED');
      } catch (err: any) {
        pushToast(err?.message || 'Could not process the selected image.');
      } finally {
        setAvatarSaving(false);
      }
    },
    [pushToast]
  );

  const handleRemoveAvatar = useCallback(async () => {
    try {
      setAvatarSaving(true);
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: null }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushToast(data?.error || 'Could not remove profile photo.');
        return;
      }
      setAvatarUrl(null);
      setHasProfilePhoto(false);
      pushToast('PROFILE PHOTO REMOVED');
    } catch {
      pushToast('Could not remove profile photo.');
    } finally {
      setAvatarSaving(false);
    }
  }, [pushToast]);

  const handleAuthSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      refreshDatabaseState();
      navigateWithLoader('/dashboard');
    },
    [refreshDatabaseState, navigateWithLoader]
  );

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    // Cleanly wipe all user state from client memory & replace browser history entry
    setAuthStatus('unauthenticated');
    setIsAuthenticated(false);
    setCurrentUserId('');
    setProfileFullName('');
    setProfileUsername('');
    setProfileUniversity('');
    setProfileBio('');
    setProfileAvailability('Weekends & Evenings');
    setAvatarUrl(null);
    setAuthProvider('EMAIL');
    setUserCreatedAt(null);
    setHasProfilePhoto(false);
    setOfferedSkills([]);
    setAvailableCredits(0);
    setReservedCredits(0);
    setEarnedLifetime(0);
    setSpentLifetime(0);
    setCompletedExchanges(0);
    setTransactions([]);
    setListings([]);
    setSavingListingIds({});
    setNotifications([]);
    setUnreadNotifs(0);
    seenNotifIdsRef.current.clear();
    notifsSeededRef.current = false;
    setRooms([]);
    setActiveRoomId('');
    window.location.replace('/login');
  }, []);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      toggleTheme,
      currentUserId,
      authStatus,
      isAuthenticated,
      setIsAuthenticated,
      authMode,
      setAuthMode,
      authEmail,
      setAuthEmail,
      authPassword,
      setAuthPassword,
      authFullName,
      setAuthFullName,
      handleAuthSubmit,
      handleLogout,
      availableCredits,
      reservedCredits,
      earnedLifetime,
      spentLifetime,
      completedExchanges,
      transactions,
      listings,
      savedListings,
      savingListingIds,
      refreshSavedListings,
      handleToggleSaveListing,
      handleCreateListing,
      postModalOpen,
      setPostModalOpen,
      rooms,
      activeRoomId,
      setActiveRoomId,
      activeRoom,
      roomSwitcherOpen,
      setRoomSwitcherOpen,
      chatInput,
      setChatInput,
      chatAttachment,
      setChatAttachment,
      editingGoal,
      setEditingGoal,
      handleSendChatMessage,
      handleUpdateRoomTerms,
      handleAdvanceAgreementStage,
      handleCancelExchange,
      handleOpenRoomForListing,
      spaces,
      spaceModalOpen,
      setSpaceModalOpen,
      editingSpaceId,
      setEditingSpaceId,
      spaceForm,
      setSpaceForm,
      handleSaveSpace,
      handleDeleteSpace,
      betaPlans,
      handleToggleWaitlist,
      profileFullName,
      setProfileFullName,
      profileUsername,
      setProfileUsername,
      profileUniversity,
      setProfileUniversity,
      profileBio,
      setProfileBio,
      profileAvailability,
      setProfileAvailability,
      hasProfilePhoto,
      setHasProfilePhoto,
      avatarUrl,
      setAvatarUrl,
      authProvider,
      userCreatedAt,
      avatarSaving,
      handleUploadAvatar,
      handleRemoveAvatar,
      offeredSkills,
      setOfferedSkills,
      newSkillInput,
      setNewSkillInput,
      handleAddOfferedSkill,
      handleRemoveOfferedSkill,
      userInitials,
      profileChecklist,
      profileCompletionPct,
      toasts,
      pushToast,
      notifications,
      unreadNotifs,
      setUnreadNotifs,
      notifOpen,
      setNotifOpen,
      browserNotifPermission,
      requestBrowserNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      refreshNotifications,
    }),
    [
      themeMode,
      toggleTheme,
      currentUserId,
      authStatus,
      isAuthenticated,
      authMode,
      authEmail,
      authPassword,
      authFullName,
      handleAuthSubmit,
      handleLogout,
      availableCredits,
      reservedCredits,
      earnedLifetime,
      spentLifetime,
      completedExchanges,
      transactions,
      listings,
      savedListings,
      savingListingIds,
      refreshSavedListings,
      handleToggleSaveListing,
      handleCreateListing,
      postModalOpen,
      rooms,
      activeRoomId,
      activeRoom,
      roomSwitcherOpen,
      chatInput,
      chatAttachment,
      editingGoal,
      handleSendChatMessage,
      handleUpdateRoomTerms,
      handleAdvanceAgreementStage,
      handleCancelExchange,
      handleOpenRoomForListing,
      spaces,
      spaceModalOpen,
      editingSpaceId,
      spaceForm,
      handleSaveSpace,
      handleDeleteSpace,
      betaPlans,
      handleToggleWaitlist,
      profileFullName,
      profileUsername,
      profileUniversity,
      profileBio,
      profileAvailability,
      hasProfilePhoto,
      avatarUrl,
      authProvider,
      userCreatedAt,
      avatarSaving,
      handleUploadAvatar,
      handleRemoveAvatar,
      offeredSkills,
      newSkillInput,
      handleAddOfferedSkill,
      handleRemoveOfferedSkill,
      userInitials,
      profileChecklist,
      profileCompletionPct,
      toasts,
      pushToast,
      notifications,
      unreadNotifs,
      notifOpen,
      browserNotifPermission,
      requestBrowserNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      refreshNotifications,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return ctx;
}
