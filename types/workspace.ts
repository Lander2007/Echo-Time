export type TopSection = 'home' | 'community' | 'subscription' | 'profile';
export type HomeTab = 'dashboard' | 'explore' | 'agreement' | 'wallet';
export type ListingType = 'Offering' | 'Looking for';
export type ListingFormat = 'Online' | 'In-person' | 'Hybrid';
export type AgreementStage = 'Negotiating' | 'Confirmed & escrowed' | 'Delivered' | 'Completed' | 'Cancelled';
export type CommunityCategory = 'Project' | 'Group' | 'Event';

export interface SkillListing {
  id: string;
  category: string;
  type: ListingType;
  authorInitials: string;
  authorName: string;
  listedAt: string;
  rating: number | null;
  reviewsCount: number;
  title: string;
  description: string;
  format: ListingFormat;
  creditsPerHr: number;
  saved: boolean;
  isMine?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'system' | 'me' | 'peer';
  author: string;
  text: string;
  time: string;
}

export interface AgreementRoom {
  id: string;
  title: string;
  category: string;
  peerName: string;
  peerInitials: string;
  role: 'requester' | 'provider';
  goal: string;
  format: ListingFormat;
  durationHrs: number;
  creditsPerHr: number;
  termsVersion: number;
  stage: AgreementStage;
  messages: ChatMessage[];
}

export interface WalletTransaction {
  id: string;
  initials: string;
  counterparty: string;
  title: string;
  availableDelta: number;
  reservedDelta: number;
  typeLabel: string;
  time: string;
}

export interface CommunitySpace {
  id: string;
  kind: CommunityCategory;
  tag: string;
  eyebrowCta: string;
  title: string;
  description: string;
  hostName: string;
  hostInitials: string;
  members: number;
  isHost: boolean;
}

export interface BetaPlan {
  id: string;
  name: string;
  tagline: string;
  priceHint: string;
  accent: string;
  highlights: string[];
  onWaitlist: boolean;
}

export interface ToastMessage {
  id: number;
  text: string;
}

export interface UserProfile {
  fullName: string;
  username: string;
  university: string;
  bio: string;
  availability: string;
  hasProfilePhoto: boolean;
  offeredSkills: string[];
}

export interface ProfileChecklistItem {
  id: string;
  label: string;
  done: boolean;
}
