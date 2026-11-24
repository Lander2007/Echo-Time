'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@/types/workspace';
import { INITIAL_BETA_PLANS } from '@/lib/seed-workspace';

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
  handleToggleSaveListing: (id: string) => void;
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
  unreadNotifs: number;
  setUnreadNotifs: (val: number) => void;
  notifOpen: boolean;
  setNotifOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

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
  const [hasProfilePhoto, setHasProfilePhoto] = useState<boolean>(true);
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
  const [postModalOpen, setPostModalOpen] = useState<boolean>(false);

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
  const [unreadNotifs, setUnreadNotifs] = useState<number>(0);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);

  const pushToast = useCallback((text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // Sync with live PostgreSQL Backend API on Mount & on Route Change
  const refreshDatabaseState = useCallback(async () => {
    try {
      // 1. Session & Profile
      const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
      let loggedInUserId = '';

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if (sessionData?.user) {
          const u = sessionData.user;
          loggedInUserId = u.id;
          setCurrentUserId(u.id);
          setIsAuthenticated(true);
          setProfileFullName(u.fullName || '');
          setAuthFullName(u.fullName || '');
          setAuthEmail(u.email || '');
          setProfileUsername(u.username || '');
          setProfileUniversity(u.university || '');
          setProfileBio(u.bio || '');
          setProfileAvailability(u.availability || 'Weekends & Evenings');
          setOfferedSkills(Array.isArray(u.offeredSkills) ? u.offeredSkills : []);
          setAvailableCredits(typeof u.availableCredits === 'number' ? u.availableCredits : 5.0);
          setReservedCredits(typeof u.reservedCredits === 'number' ? u.reservedCredits : 0.0);
          setEarnedLifetime(typeof u.earnedLifetime === 'number' ? u.earnedLifetime : 0.0);
          setSpentLifetime(typeof u.spentLifetime === 'number' ? u.spentLifetime : 0.0);
          setCompletedExchanges(typeof u.completedExchanges === 'number' ? u.completedExchanges : 0);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }

      // 2. Wallet & Transactions
      if (loggedInUserId) {
        const walletRes = await fetch('/api/wallet', { cache: 'no-store' });
        if (walletRes.ok) {
          const walletData = await walletRes.json();
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
        }

        // 3. Agreement Rooms
        const agreementsRes = await fetch('/api/agreements', { cache: 'no-store' });
        if (agreementsRes.ok) {
          const agreementsData = await agreementsRes.json();
          if (Array.isArray(agreementsData?.agreements)) {
            const mappedRooms = agreementsData.agreements.map((r: any) => mapApiRoom(r, loggedInUserId));
            setRooms(mappedRooms);
            if (mappedRooms[0] && !activeRoomId) {
              setActiveRoomId(mappedRooms[0].id);
            }
          }
        }
      }

      // 4. All Database Listings (Available to everyone)
      const listingsRes = await fetch('/api/listings', { cache: 'no-store' });
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        if (Array.isArray(listingsData?.listings)) {
          setListings(listingsData.listings.map((l: any) => mapApiListing(l, loggedInUserId)));
        }
      }

      // 5. Community Spaces
      const communityRes = await fetch('/api/community', { cache: 'no-store' });
      if (communityRes.ok) {
        const commData = await communityRes.json();
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
      }

      // 6. Beta Subscription
      if (loggedInUserId) {
        const betaRes = await fetch('/api/subscription/beta', { cache: 'no-store' });
        if (betaRes.ok) {
          const betaData = await betaRes.json();
          if (Array.isArray(betaData?.plans)) {
            setBetaPlans((prev) =>
              prev.map((p) => ({
                ...p,
                onWaitlist: betaData.plans.includes(p.id),
              }))
            );
          }
        }
      }
    } catch (err) {
      console.error('Database sync error:', err);
    }
  }, [activeRoomId]);

  useEffect(() => {
    refreshDatabaseState();
  }, [refreshDatabaseState]);

  const userInitials = useMemo(() => {
    return getInitials(profileFullName || 'Student');
  }, [profileFullName]);

  const activeRoom = useMemo(() => {
    return rooms.find((r) => r.id === activeRoomId) || rooms[0];
  }, [rooms, activeRoomId]);

  // Profile Completion Meter
  const profileChecklist = useMemo<ProfileChecklistItem[]>(
    () => [
      { id: 'photo', label: 'Add a photo', done: hasProfilePhoto },
      { id: 'bio', label: 'Write a bio', done: profileBio.trim().length >= 8 },
      { id: 'skills', label: 'Offer three skills', done: offeredSkills.length >= 3 },
      { id: 'project', label: 'Add a project', done: spaces.length > 0 },
      { id: 'learn', label: 'Choose a skill to learn', done: true },
    ],
    [hasProfilePhoto, profileBio, offeredSkills.length, spaces.length]
  );

  const profileCompletionPct = useMemo(() => {
    const completed = profileChecklist.filter((c) => c.done).length;
    return Math.round((completed / profileChecklist.length) * 100);
  }, [profileChecklist]);

  // Handlers
  const handleToggleSaveListing = useCallback(async (id: string) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, saved: !l.saved } : l)));
    try {
      await fetch(`/api/listings/${id}/save`, { method: 'POST' });
    } catch {
      // Revert if request failed
    }
  }, []);

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
        router.push(`/agreement?roomId=${existing.id}`);
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
          router.push(`/agreement?roomId=${mapped.id}`);
          pushToast(`Opened Agreement room for "${listing.title}" with ${listing.authorName}.`);
        } else {
          pushToast(data?.error || 'Failed to open agreement room');
        }
      } catch (err: any) {
        pushToast(err?.message || 'Error creating agreement room in database.');
      }
    },
    [rooms, currentUserId, router, pushToast]
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
      if (!offeredSkills.includes(cleaned)) {
        const updated = [...offeredSkills, cleaned];
        setOfferedSkills(updated);
        try {
          await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ offeredSkills: updated }),
          });
        } catch {
          // Keep local state
        }
      }
      setNewSkillInput('');
    },
    [newSkillInput, offeredSkills]
  );

  const handleRemoveOfferedSkill = useCallback(
    async (skill: string) => {
      const updated = offeredSkills.filter((item) => item !== skill);
      setOfferedSkills(updated);
      try {
        await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offeredSkills: updated }),
        });
      } catch {
        // Keep local state
      }
    },
    [offeredSkills]
  );

  const handleAuthSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      refreshDatabaseState();
      router.push('/dashboard');
    },
    [refreshDatabaseState, router]
  );

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    // Cleanly wipe all user state from client memory
    setIsAuthenticated(false);
    setCurrentUserId('');
    setProfileFullName('');
    setProfileUsername('');
    setProfileUniversity('');
    setProfileBio('');
    setProfileAvailability('Weekends & Evenings');
    setOfferedSkills([]);
    setAvailableCredits(0);
    setReservedCredits(0);
    setEarnedLifetime(0);
    setSpentLifetime(0);
    setCompletedExchanges(0);
    setTransactions([]);
    setRooms([]);
    setActiveRoomId('');
    pushToast('Logged out of student workspace.');
    router.push('/login');
  }, [router, pushToast]);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      toggleTheme,
      currentUserId,
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
      unreadNotifs,
      setUnreadNotifs,
      notifOpen,
      setNotifOpen,
    }),
    [
      themeMode,
      toggleTheme,
      currentUserId,
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
      offeredSkills,
      newSkillInput,
      handleAddOfferedSkill,
      handleRemoveOfferedSkill,
      userInitials,
      profileChecklist,
      profileCompletionPct,
      toasts,
      pushToast,
      unreadNotifs,
      notifOpen,
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
