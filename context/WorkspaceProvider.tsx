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
} from '@/types/workspace';
import {
  INITIAL_LISTINGS,
  INITIAL_ROOMS,
  INITIAL_TRANSACTIONS,
  INITIAL_SPACES,
  INITIAL_BETA_PLANS,
} from '@/lib/seed-workspace';

interface WorkspaceContextType {
  // Theme
  themeMode: 'dark' | 'light';
  setThemeMode: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
  toggleTheme: () => void;

  // Auth
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

  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState<string>('khaled.ahmeed@alexu.edu.eg');
  const [authPassword, setAuthPassword] = useState<string>('••••••••••••');
  const [authFullName, setAuthFullName] = useState<string>('Khaled Amr Ahmeed');

  // Ledger
  const [availableCredits, setAvailableCredits] = useState<number>(6);
  const [reservedCredits, setReservedCredits] = useState<number>(0);
  const [earnedLifetime, setEarnedLifetime] = useState<number>(1);
  const [spentLifetime, setSpentLifetime] = useState<number>(0);
  const [completedExchanges, setCompletedExchanges] = useState<number>(1);
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

  // Profile
  const [profileFullName, setProfileFullName] = useState<string>('Khaled Amr Ahmeed');
  const [profileUsername, setProfileUsername] = useState<string>('khaled-amr-ahmeed');
  const [profileUniversity, setProfileUniversity] = useState<string>('');
  const [profileBio, setProfileBio] = useState<string>('');
  const [profileAvailability, setProfileAvailability] = useState<string>('Weekends');
  const [hasProfilePhoto, setHasProfilePhoto] = useState<boolean>(false);
  const [offeredSkills, setOfferedSkills] = useState<string[]>(['UI/UX']);
  const [newSkillInput, setNewSkillInput] = useState<string>('');

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

  const userInitials = useMemo(() => {
    const parts = profileFullName.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'KA';
    return ((parts[0][0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'KA';
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
  }, []);

  const handleCreateListing = useCallback(
    (form: {
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
    },
    [userInitials, profileFullName, pushToast]
  );

  const handleOpenRoomForListing = useCallback(
    (listing: SkillListing) => {
      const existing = rooms.find(
        (r) =>
          r.title.toLowerCase() === listing.title.toLowerCase() &&
          r.peerName.toLowerCase() === listing.authorName.toLowerCase()
      );
      if (existing) {
        setActiveRoomId(existing.id);
        router.push(`/agreement?roomId=${existing.id}`);
      } else {
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
      }
      pushToast(`Opened Agreement room for "${listing.title}" with ${listing.authorName}.`);
    },
    [rooms, router, pushToast]
  );

  const handleSendChatMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || !activeRoom) return;
      const msg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'me',
        author: profileFullName,
        text: chatInput.trim(),
        time: 'Just now',
      };
      setRooms((prev) =>
        prev.map((r) => (r.id === activeRoom.id ? { ...r, messages: [...r.messages, msg] } : r))
      );
      setChatInput('');
    },
    [chatInput, activeRoom, profileFullName]
  );

  const handleUpdateRoomTerms = useCallback(
    (patch: Partial<AgreementRoom>) => {
      if (!activeRoom || activeRoom.stage !== 'Negotiating') return;
      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoom.id ? { ...r, ...patch, termsVersion: r.termsVersion + 1 } : r
        )
      );
    },
    [activeRoom]
  );

  const handleAdvanceAgreementStage = useCallback(() => {
    if (!activeRoom) return;
    const totalCredits = activeRoom.durationHrs * activeRoom.creditsPerHr;

    if (activeRoom.stage === 'Negotiating') {
      if (activeRoom.role === 'requester' && availableCredits < totalCredits) {
        pushToast('Not enough available credits to reserve this exchange.');
        return;
      }
      if (activeRoom.role === 'requester') {
        setAvailableCredits((c) => c - totalCredits);
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
                    text: `Terms v${r.termsVersion} confirmed & escrowed (${totalCredits} credit${totalCredits > 1 ? 's' : ''}).`,
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
  }, [activeRoom, availableCredits, pushToast]);

  const handleCancelExchange = useCallback(() => {
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
  }, [activeRoom, pushToast]);

  const handleSaveSpace = useCallback(
    (e: React.FormEvent) => {
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
    },
    [pushToast]
  );

  const handleAddOfferedSkill = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const cleaned = newSkillInput.trim();
      if (!cleaned) return;
      if (!offeredSkills.includes(cleaned)) {
        setOfferedSkills((prev) => [...prev, cleaned]);
      }
      setNewSkillInput('');
    },
    [newSkillInput, offeredSkills]
  );

  const handleRemoveOfferedSkill = useCallback((skill: string) => {
    setOfferedSkills((prev) => prev.filter((item) => item !== skill));
  }, []);

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
    setIsAuthenticated(false);
    pushToast('Logged out of student workspace.');
    router.push('/login');
  }, [router, pushToast]);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      toggleTheme,
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
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
