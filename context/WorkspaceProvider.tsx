'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  SkillListing,
  AgreementRoom,
  ChatMessage,
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
import {
  INITIAL_LISTINGS,
  INITIAL_ROOMS,
  INITIAL_TRANSACTIONS,
  INITIAL_SPACES,
  INITIAL_BETA_PLANS,
} from '@/lib/seed-workspace';

function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'KA';
  return ((parts[0][0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'KA';
}

function mapApiListing(l: any, currentUserId?: string): SkillListing {
  return {
    id: l.id,
    category: l.category || 'General',
    type: l.type === 'LOOKING_FOR' ? 'Looking for' : 'Offering',
    authorInitials: getInitials(l.author?.fullName || 'Echo Student'),
    authorName: l.author?.fullName || 'Echo Student',
    listedAt: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Listed recently',
    rating: l.rating ?? 5.0,
    reviewsCount: l.reviewsCount ?? 1,
    title: l.title,
    description: l.description,
    format: l.format === 'IN_PERSON' ? 'In-person' : l.format === 'HYBRID' ? 'Hybrid' : 'Online',
    creditsPerHr: l.creditsPerHr || 1,
    saved: Boolean(l.isSaved),
    isMine: Boolean(currentUserId && l.authorId === currentUserId),
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
  activeRoom: AgreementRoom;
  roomSwitcherOpen: boolean;
  setRoomSwitcherOpen: React.Dispatch<React.SetStateAction<boolean>>;
  chatInput: string;
  setChatInput: (val: string) => void;
  editingGoal: boolean;
  setEditingGoal: (val: boolean) => void;
  handleSendChatMessage: (e: React.FormEvent) => void;
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
  const [currentUserId, setCurrentUserId] = useState<string>('usr_seed_khaled');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState<string>('khaled@echotime.edu');
  const [authPassword, setAuthPassword] = useState<string>('••••••••••••');
  const [authFullName, setAuthFullName] = useState<string>('Khaled Amr Ahmeed');
  const [profileFullName, setProfileFullName] = useState<string>('Khaled Amr Ahmeed');
  const [profileUsername, setProfileUsername] = useState<string>('khaled-amr-ahmeed');
  const [profileUniversity, setProfileUniversity] = useState<string>('Cairo University — Computer Engineering');
  const [profileBio, setProfileBio] = useState<string>('Senior Computer Engineering student passionate about distributed systems and time reciprocity.');
  const [profileAvailability, setProfileAvailability] = useState<string>('Weekends & Evenings');
  const [hasProfilePhoto, setHasProfilePhoto] = useState<boolean>(true);
  const [offeredSkills, setOfferedSkills] = useState<string[]>(['Next.js 15', 'TypeScript', 'Prisma ORM']);
  const [newSkillInput, setNewSkillInput] = useState<string>('');

  // Ledger & Balances
  const [availableCredits, setAvailableCredits] = useState<number>(6);
  const [reservedCredits, setReservedCredits] = useState<number>(0);
  const [earnedLifetime, setEarnedLifetime] = useState<number>(4);
  const [spentLifetime, setSpentLifetime] = useState<number>(2);
  const [completedExchanges, setCompletedExchanges] = useState<number>(4);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);

  // Explore Listings
  const [listings, setListings] = useState<SkillListing[]>(INITIAL_LISTINGS);
  const [postModalOpen, setPostModalOpen] = useState<boolean>(false);

  // Agreement Rooms
  const [rooms, setRooms] = useState<AgreementRoom[]>(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>('room-1');
  const [roomSwitcherOpen, setRoomSwitcherOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [editingGoal, setEditingGoal] = useState<boolean>(false);

  // Community
  const [spaces, setSpaces] = useState<CommunitySpace[]>(INITIAL_SPACES);
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
  const [unreadNotifs, setUnreadNotifs] = useState<number>(1);
  const [notifOpen, setNotifOpen] = useState<boolean>(false);

  const pushToast = useCallback((text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // Sync with live Backend API on Mount
  useEffect(() => {
    let isMounted = true;

    async function syncBackendState() {
      try {
        // 1. Session & Profile
        const sessionRes = await fetch('/api/auth/session');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData?.user && isMounted) {
            const u = sessionData.user;
            setCurrentUserId(u.id);
            setIsAuthenticated(true);
            setProfileFullName(u.fullName || 'Khaled Amr Ahmeed');
            setAuthFullName(u.fullName || 'Khaled Amr Ahmeed');
            setProfileUsername(u.username || 'khaled-amr-ahmeed');
            setProfileUniversity(u.university || 'Cairo University');
            if (u.bio) setProfileBio(u.bio);
            if (u.availability) setProfileAvailability(u.availability);
            if (u.offeredSkills?.length) setOfferedSkills(u.offeredSkills);
            if (typeof u.availableCredits === 'number') setAvailableCredits(u.availableCredits);
            if (typeof u.reservedCredits === 'number') setReservedCredits(u.reservedCredits);
            if (typeof u.earnedLifetime === 'number') setEarnedLifetime(u.earnedLifetime);
            if (typeof u.spentLifetime === 'number') setSpentLifetime(u.spentLifetime);
            if (typeof u.completedExchanges === 'number') setCompletedExchanges(u.completedExchanges);
          }
        }

        // 2. Wallet & Transactions
        const walletRes = await fetch('/api/wallet');
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          if (walletData?.telemetry && isMounted) {
            const t = walletData.telemetry;
            setAvailableCredits(t.availableCredits);
            setReservedCredits(t.reservedCredits);
            setEarnedLifetime(t.earnedLifetime);
            setSpentLifetime(t.spentLifetime);
            setCompletedExchanges(t.completedExchanges);
          }
          if (Array.isArray(walletData?.transactions) && walletData.transactions.length > 0 && isMounted) {
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

        // 3. Listings
        const listingsRes = await fetch('/api/listings');
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          if (Array.isArray(listingsData?.listings) && listingsData.listings.length > 0 && isMounted) {
            setListings(listingsData.listings.map((l: any) => mapApiListing(l, currentUserId)));
          }
        }

        // 4. Agreements
        const agreementsRes = await fetch('/api/agreements');
        if (agreementsRes.ok) {
          const agreementsData = await agreementsRes.json();
          if (Array.isArray(agreementsData?.agreements) && agreementsData.agreements.length > 0 && isMounted) {
            const mappedRooms = agreementsData.agreements.map((r: any) => mapApiRoom(r, currentUserId));
            setRooms(mappedRooms);
            if (mappedRooms[0]) {
              setActiveRoomId(mappedRooms[0].id);
            }
          }
        }

        // 5. Community Spaces
        const communityRes = await fetch('/api/community');
        if (communityRes.ok) {
          const commData = await communityRes.json();
          if (Array.isArray(commData?.spaces) && commData.spaces.length > 0 && isMounted) {
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
                isHost: s.hostId === currentUserId,
              }))
            );
          }
        }

        // 6. Beta Subscription Interests
        const betaRes = await fetch('/api/subscription/beta');
        if (betaRes.ok) {
          const betaData = await betaRes.json();
          if (Array.isArray(betaData?.plans) && isMounted) {
            setBetaPlans((prev) =>
              prev.map((p) => ({
                ...p,
                onWaitlist: betaData.plans.includes(p.id),
              }))
            );
          }
        }
      } catch (err) {
        // Gracefully keep initial seeded state
        console.warn('Backend live sync warning (using seeded local state):', err);
      }
    }

    syncBackendState();

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  const userInitials = useMemo(() => {
    return getInitials(profileFullName);
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
  const handleToggleSaveListing = useCallback((id: string) => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, saved: !l.saved } : l)));
    fetch(`/api/listings/${id}/save`, { method: 'POST' }).catch(() => {});
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
      if (!form.title.trim()) {
        pushToast('Add a skill title before publishing.');
        return;
      }

      // Optimistic create
      const created: SkillListing = {
        id: `lst-${Date.now()}`,
        category: form.category,
        type: form.type,
        authorInitials: userInitials,
        authorName: profileFullName,
        listedAt: 'Listed just now',
        rating: 5.0,
        reviewsCount: 1,
        title: form.title.trim(),
        description: form.description.trim() || 'Agree on details inside the agreement room.',
        format: form.format,
        creditsPerHr: form.creditsPerHr,
        saved: false,
        isMine: true,
      };

      setListings((prev) => [created, ...prev]);
      setPostModalOpen(false);
      pushToast(`Published "${created.title}" to Explore marketplace.`);

      // Sync to live DB
      try {
        const res = await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            type: form.type === 'Looking for' ? 'LOOKING_FOR' : 'OFFERING',
            format: form.format === 'In-person' ? 'IN_PERSON' : form.format === 'Hybrid' ? 'HYBRID' : 'ONLINE',
            creditsPerHr: form.creditsPerHr,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.listing?.id) {
            setListings((prev) =>
              prev.map((l) => (l.id === created.id ? mapApiListing(data.listing, currentUserId) : l))
            );
          }
        }
      } catch (e) {
        console.warn('Listing DB write skipped/cached:', e);
      }
    },
    [userInitials, profileFullName, currentUserId, pushToast]
  );

  const handleOpenRoomForListing = useCallback(
    async (listing: SkillListing) => {
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

      const newRoom: AgreementRoom = {
        id: `room-${Date.now()}`,
        title: listing.title,
        category: listing.category,
        peerName: listing.authorName,
        peerInitials: listing.authorInitials,
        role: listing.type === 'Offering' ? 'requester' : 'provider',
        goal: 'Define the outcome you are agreeing to',
        format: listing.format,
        durationHrs: 1,
        creditsPerHr: listing.creditsPerHr,
        termsVersion: 1,
        stage: 'Negotiating',
        messages: [
          {
            id: `sys-${Date.now()}`,
            sender: 'system',
            author: 'System',
            text: 'Exchange started. Agree on the goal, format, duration, and credits, then both confirm the same terms.',
            time: 'Just now',
          },
        ],
      };

      setRooms((prev) => [newRoom, ...prev]);
      setActiveRoomId(newRoom.id);
      router.push(`/agreement?roomId=${newRoom.id}`);
      pushToast(`Opened Agreement room for "${listing.title}" with ${listing.authorName}.`);
    },
    [rooms, router, pushToast]
  );

  const handleSendChatMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || !activeRoom) return;
      const text = chatInput.trim();
      const msg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'me',
        author: profileFullName,
        text,
        time: 'Just now',
      };
      setRooms((prev) =>
        prev.map((r) => (r.id === activeRoom.id ? { ...r, messages: [...r.messages, msg] } : r))
      );
      setChatInput('');

      // Send to DB if real room id
      if (activeRoom.id.length > 10) {
        try {
          await fetch(`/api/agreements/${activeRoom.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: text }),
          });
        } catch {
          // Keep optimistic message
        }
      }
    },
    [chatInput, activeRoom, profileFullName]
  );

  const handleUpdateRoomTerms = useCallback(
    async (patch: Partial<AgreementRoom>) => {
      if (!activeRoom || activeRoom.stage !== 'Negotiating') return;
      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoom.id ? { ...r, ...patch, termsVersion: r.termsVersion + 1 } : r
        )
      );

      if (activeRoom.id.length > 10) {
        try {
          await fetch(`/api/agreements/${activeRoom.id}/terms`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
          });
        } catch {
          // Keep optimistic
        }
      }
    },
    [activeRoom]
  );

  const handleAdvanceAgreementStage = useCallback(async () => {
    if (!activeRoom) return;
    const totalCredits = activeRoom.durationHrs * activeRoom.creditsPerHr;

    if (activeRoom.stage === 'Negotiating') {
      if (activeRoom.role === 'requester' && availableCredits < totalCredits) {
        pushToast('Not enough available credits to reserve this exchange.');
        return;
      }
      if (activeRoom.role === 'requester') {
        setAvailableCredits((c) => Math.max(0, c - totalCredits));
        setReservedCredits((r) => r + totalCredits);
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            initials: activeRoom.peerInitials,
            counterparty: activeRoom.peerName,
            title: `Credits reserved in escrow for ${activeRoom.title}`,
            availableDelta: -totalCredits,
            reservedDelta: totalCredits,
            typeLabel: 'Escrow reserve',
            time: 'Just now',
          },
          ...prev,
        ]);
      }
      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoom.id
            ? {
                ...r,
                stage: 'Confirmed & escrowed',
                messages: [
                  ...r.messages,
                  {
                    id: `sys-${Date.now()}`,
                    sender: 'system',
                    author: 'System',
                    text: `Terms v${r.termsVersion} confirmed & escrowed (${totalCredits} credit${
                      totalCredits > 1 ? 's' : ''
                    }).`,
                    time: 'Just now',
                  },
                ],
              }
            : r
        )
      );
      pushToast(`Agreement confirmed & ${totalCredits} credit(s) escrowed.`);
    } else if (activeRoom.stage === 'Confirmed & escrowed') {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoom.id
            ? {
                ...r,
                stage: 'Delivered',
                messages: [
                  ...r.messages,
                  {
                    id: `sys-${Date.now()}`,
                    sender: 'system',
                    author: 'System',
                    text: 'Deliverable marked as delivered. Awaiting mutual completion confirmation.',
                    time: 'Just now',
                  },
                ],
              }
            : r
        )
      );
      pushToast('Marked as delivered — ready for mutual completion.');
    } else if (activeRoom.stage === 'Delivered') {
      if (activeRoom.role === 'requester') {
        setReservedCredits((r) => Math.max(0, r - totalCredits));
        setSpentLifetime((s) => s + totalCredits);
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            initials: activeRoom.peerInitials,
            counterparty: activeRoom.peerName,
            title: `Credits released for completed ${activeRoom.title}`,
            availableDelta: 0,
            reservedDelta: -totalCredits,
            typeLabel: 'Completed exchange · spend',
            time: 'Just now',
          },
          ...prev,
        ]);
      } else {
        setAvailableCredits((c) => c + totalCredits);
        setEarnedLifetime((e) => e + totalCredits);
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            initials: activeRoom.peerInitials,
            counterparty: activeRoom.peerName,
            title: `Credits earned from completed ${activeRoom.title}`,
            availableDelta: totalCredits,
            reservedDelta: 0,
            typeLabel: 'Completed exchange · earn',
            time: 'Just now',
          },
          ...prev,
        ]);
      }
      setCompletedExchanges((c) => c + 1);
      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoom.id
            ? {
                ...r,
                stage: 'Completed',
                messages: [
                  ...r.messages,
                  {
                    id: `sys-${Date.now()}`,
                    sender: 'system',
                    author: 'System',
                    text: `Exchange completed. ${totalCredits} credit(s) settled atomically.`,
                    time: 'Just now',
                  },
                ],
              }
            : r
        )
      );
      pushToast('Exchange completed! Wallet ledger updated.');
    }

    // Call live backend endpoint if roomId matches database format
    if (activeRoom.id.length > 10) {
      try {
        await fetch(`/api/agreements/${activeRoom.id}/advance`, {
          method: 'POST',
        });
      } catch {
        // Keep optimistic state
      }
    }
  }, [activeRoom, availableCredits, pushToast]);

  const handleCancelExchange = useCallback(async () => {
    if (!activeRoom || activeRoom.stage === 'Completed' || activeRoom.stage === 'Cancelled') return;
    const totalCredits = activeRoom.durationHrs * activeRoom.creditsPerHr;
    if (
      activeRoom.role === 'requester' &&
      (activeRoom.stage === 'Confirmed & escrowed' || activeRoom.stage === 'Delivered')
    ) {
      setReservedCredits((r) => Math.max(0, r - totalCredits));
      setAvailableCredits((c) => c + totalCredits);
    }
    setRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoom.id
          ? {
              ...r,
              stage: 'Cancelled',
              messages: [
                ...r.messages,
                {
                  id: `sys-${Date.now()}`,
                  sender: 'system',
                  author: 'System',
                  text: 'Exchange cancelled. Any reserved credits were returned to Available.',
                  time: 'Just now',
                },
              ],
            }
          : r
      )
    );
    pushToast('Exchange cancelled.');

    if (activeRoom.id.length > 10) {
      try {
        await fetch(`/api/agreements/${activeRoom.id}/cancel`, {
          method: 'POST',
        });
      } catch {
        // Keep optimistic
      }
    }
  }, [activeRoom, pushToast]);

  const handleSaveSpace = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!spaceForm.title.trim()) {
        pushToast('Enter a title for the space.');
        return;
      }
      if (editingSpaceId) {
        setSpaces((prev) =>
          prev.map((s) =>
            s.id === editingSpaceId
              ? {
                  ...s,
                  kind: spaceForm.kind,
                  tag: spaceForm.tag.trim() || 'tech',
                  title: spaceForm.title.trim(),
                  description: spaceForm.description.trim() || 'Student collaboration space',
                }
              : s
          )
        );
        pushToast('Updated community space.');

        if (editingSpaceId.length > 10) {
          fetch(`/api/community/${editingSpaceId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              kind: spaceForm.kind.toUpperCase(),
              tag: spaceForm.tag,
              title: spaceForm.title,
              description: spaceForm.description,
            }),
          }).catch(() => {});
        }
      } else {
        const eyebrowMap: Record<CommunityCategory, string> = {
          Project: 'Build with peers',
          Group: 'Join study circle',
          Event: 'Attend campus session',
        };
        const created: CommunitySpace = {
          id: `sp-${Date.now()}`,
          kind: spaceForm.kind,
          tag: spaceForm.tag.trim() || 'tech',
          eyebrowCta: eyebrowMap[spaceForm.kind],
          title: spaceForm.title.trim(),
          description: spaceForm.description.trim() || 'Student collaboration space',
          hostName: profileFullName,
          hostInitials: userInitials,
          members: 1,
          isHost: true,
        };
        setSpaces((prev) => [created, ...prev]);
        pushToast(`Created "${created.title}" in Community.`);

        fetch('/api/community', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind: spaceForm.kind.toUpperCase(),
            tag: spaceForm.tag,
            eyebrowCta: eyebrowMap[spaceForm.kind],
            title: spaceForm.title,
            description: spaceForm.description,
          }),
        }).catch(() => {});
      }
      setSpaceModalOpen(false);
      setEditingSpaceId(null);
      setSpaceForm({ kind: 'Project', tag: 'tech', title: '', description: '' });
    },
    [spaceForm, editingSpaceId, profileFullName, userInitials, pushToast]
  );

  const handleDeleteSpace = useCallback(
    (id: string) => {
      setSpaces((prev) => {
        const target = prev.find((s) => s.id === id);
        if (target) {
          pushToast(`Deleted "${target.title}".`);
        }
        return prev.filter((s) => s.id !== id);
      });
      if (id.length > 10) {
        fetch(`/api/community/${id}`, { method: 'DELETE' }).catch(() => {});
      }
    },
    [pushToast]
  );

  const handleToggleWaitlist = useCallback(
    (planId: string) => {
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
      fetch('/api/subscription/beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey: planId }),
      }).catch(() => {});
    },
    [pushToast]
  );

  const handleAddOfferedSkill = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const cleaned = newSkillInput.trim();
      if (!cleaned) return;
      if (!offeredSkills.includes(cleaned)) {
        const updated = [...offeredSkills, cleaned];
        setOfferedSkills(updated);
        fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offeredSkills: updated }),
        }).catch(() => {});
      }
      setNewSkillInput('');
    },
    [newSkillInput, offeredSkills]
  );

  const handleRemoveOfferedSkill = useCallback(
    (skill: string) => {
      const updated = offeredSkills.filter((item) => item !== skill);
      setOfferedSkills(updated);
      fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offeredSkills: updated }),
      }).catch(() => {});
    },
    [offeredSkills]
  );

  const handleAuthSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (authMode === 'signup' && authFullName.trim()) {
        setProfileFullName(authFullName.trim());
      }
      setIsAuthenticated(true);
      pushToast(`Signed in as ${authFullName.trim() || profileFullName}.`);
      router.push('/dashboard');
    },
    [authMode, authFullName, profileFullName, router, pushToast]
  );

  const handleLogout = useCallback(() => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setIsAuthenticated(false);
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
