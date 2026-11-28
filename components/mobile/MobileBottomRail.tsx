'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { useWorkspaceTransition } from '@/components/WorkspaceTransitionProvider';
import { MobileArchitecturalDrawer } from './MobileArchitecturalDrawer';
import { IconArrowRight, IconPlus } from '@/components/workspace/Icons';

export function MobileBottomRail() {
  const pathname = usePathname();
  const { navigateWithLoader } = useWorkspaceTransition();
  const {
    rooms,
    savedListings,
    availableCredits,
    reservedCredits,
    setPostModalOpen,
    setSpaceModalOpen,
    setEditingSpaceId,
    setSpaceForm,
  } = useWorkspace();

  const [commandDrawerOpen, setCommandDrawerOpen] = useState(false);

  const activeRoomsCount = rooms.length;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t-[1.5px] border-[#021F94] et-m-safe-bottom select-none">
        <nav
          aria-label="Mobile primary navigation"
          className="h-[58px] grid grid-cols-5 divide-x divide-[#021F94]/18"
        >
          {/* 01 / HOME */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center relative active:opacity-80 transition-colors ${
              pathname === '/dashboard' ? 'bg-[#F5F2F3]' : 'bg-white'
            }`}
          >
            {pathname === '/dashboard' && (
              <span className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#021F94]" />
            )}
            <span
              className={`font-mono text-[9px] font-bold ${
                pathname === '/dashboard' ? 'text-[#021F94]' : 'text-[#565C73]'
              }`}
            >
              01
            </span>
            <span
              className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                pathname === '/dashboard' ? 'text-[#0B1026]' : 'text-[#565C73]'
              }`}
            >
              HOME
            </span>
          </Link>

          {/* 02 / EXPLORE */}
          <Link
            href="/explore"
            className={`flex flex-col items-center justify-center relative active:opacity-80 transition-colors ${
              pathname === '/explore' ? 'bg-[#F5F2F3]' : 'bg-white'
            }`}
          >
            {pathname === '/explore' && (
              <span className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#021F94]" />
            )}
            <span
              className={`font-mono text-[9px] font-bold ${
                pathname === '/explore' ? 'text-[#021F94]' : 'text-[#565C73]'
              }`}
            >
              02
            </span>
            <span
              className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                pathname === '/explore' ? 'text-[#0B1026]' : 'text-[#565C73]'
              }`}
            >
              EXPLORE
            </span>
          </Link>

          {/* + / NEW (Flush solid #021F94 cell) */}
          <button
            type="button"
            onClick={() => setCommandDrawerOpen(true)}
            aria-label="Open creation actions"
            className="flex flex-col items-center justify-center bg-[#021F94] text-[#F5F2F3] active:bg-[#061354] transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            <span className="font-mono text-[9.5px] font-black uppercase tracking-widest mt-0.5">
              NEW
            </span>
          </button>

          {/* 03 / ROOMS */}
          <Link
            href="/agreement"
            className={`flex flex-col items-center justify-center relative active:opacity-80 transition-colors ${
              pathname === '/agreement' ? 'bg-[#F5F2F3]' : 'bg-white'
            }`}
          >
            {pathname === '/agreement' && (
              <span className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#021F94]" />
            )}
            <div className="flex items-center gap-1">
              <span
                className={`font-mono text-[9px] font-bold ${
                  pathname === '/agreement' ? 'text-[#021F94]' : 'text-[#565C73]'
                }`}
              >
                03
              </span>
              {activeRoomsCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-none bg-[#D93829]" />
              )}
            </div>
            <span
              className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                pathname === '/agreement' ? 'text-[#0B1026]' : 'text-[#565C73]'
              }`}
            >
              ROOMS
            </span>
          </Link>

          {/* 04 / SPACES */}
          <Link
            href="/community"
            className={`flex flex-col items-center justify-center relative active:opacity-80 transition-colors ${
              pathname === '/community' ? 'bg-[#F5F2F3]' : 'bg-white'
            }`}
          >
            {pathname === '/community' && (
              <span className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#021F94]" />
            )}
            <span
              className={`font-mono text-[9px] font-bold ${
                pathname === '/community' ? 'text-[#021F94]' : 'text-[#565C73]'
              }`}
            >
              04
            </span>
            <span
              className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                pathname === '/community' ? 'text-[#0B1026]' : 'text-[#565C73]'
              }`}
            >
              SPACES
            </span>
          </Link>
        </nav>
      </div>

      {/* Architectural Command Drawer */}
      <MobileArchitecturalDrawer
        isOpen={commandDrawerOpen}
        onClose={() => setCommandDrawerOpen(false)}
        title="COMMAND MENU · INSTANT ACTIONS"
      >
        <div className="space-y-4">
          {/* Quick Ledger Telemetry Strip */}
          <div className="bg-[#021F94] text-[#F5F2F3] p-3 rounded-[2px] border border-[#021F94] flex items-center justify-between font-mono text-[11px]">
            <div>
              <div className="text-[9px] text-[#B9C8FF] uppercase">Available Balance</div>
              <div className="font-bold text-base tabular">{Number(availableCredits).toFixed(2)} ECHO</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-[#B9C8FF] uppercase">Escrow Hold</div>
              <div className="font-bold text-base tabular text-[#D93829]">{Number(reservedCredits).toFixed(2)} ECHO</div>
            </div>
          </div>

          {/* 4 Instant Actions */}
          <div className="divide-y divide-[#021F94]/18 border border-[#021F94]/30 bg-white rounded-[2px]">
            {/* 01 · Post Skill */}
            <button
              type="button"
              onClick={() => {
                setCommandDrawerOpen(false);
                setPostModalOpen(true);
              }}
              className="w-full p-3.5 text-left flex items-center justify-between hover:bg-[#F5F2F3] active:opacity-80 transition-colors"
            >
              <div>
                <div className="font-mono text-[10px] font-bold text-[#021F94] uppercase tracking-wider">
                  01 · MARKETPLACE
                </div>
                <div className="font-sans font-bold text-sm text-[#0B1026] mt-0.5">
                  POST A SKILL / REQUEST
                </div>
                <div className="text-xs text-[#565C73] mt-0.5">
                  Offer what you know or request help for 1.00 ECHO/hr
                </div>
              </div>
              <span className="font-mono text-sm text-[#021F94] font-bold"><IconArrowRight className="w-4 h-4" /></span>
            </button>

            {/* 02 · Create Space */}
            <button
              type="button"
              onClick={() => {
                setCommandDrawerOpen(false);
                setEditingSpaceId(null);
                setSpaceForm({ kind: 'Project', tag: 'tech', title: '', description: '' });
                setSpaceModalOpen(true);
              }}
              className="w-full p-3.5 text-left flex items-center justify-between hover:bg-[#F5F2F3] active:opacity-80 transition-colors"
            >
              <div>
                <div className="font-mono text-[10px] font-bold text-[#021F94] uppercase tracking-wider">
                  02 · COMMUNITY
                </div>
                <div className="font-sans font-bold text-sm text-[#0B1026] mt-0.5">
                  CREATE COMMUNITY SPACE
                </div>
                <div className="text-xs text-[#565C73] mt-0.5">
                  Start a campus project, study group, or hackathon team
                </div>
              </div>
              <span className="font-mono text-sm text-[#021F94] font-bold"><IconArrowRight className="w-4 h-4" /></span>
            </button>

            {/* 03 · Saved Skills */}
            <button
              type="button"
              onClick={() => {
                setCommandDrawerOpen(false);
                navigateWithLoader('/saved');
              }}
              className="w-full p-3.5 text-left flex items-center justify-between hover:bg-[#F5F2F3] active:opacity-80 transition-colors"
            >
              <div>
                <div className="font-mono text-[10px] font-bold text-[#021F94] uppercase tracking-wider">
                  03 · BOOKMARKS ({savedListings.length})
                </div>
                <div className="font-sans font-bold text-sm text-[#0B1026] mt-0.5">
                  SAVED SKILL LISTINGS
                </div>
                <div className="text-xs text-[#565C73] mt-0.5">
                  View and manage skill offers you bookmarked to your account
                </div>
              </div>
              <span className="font-mono text-sm text-[#021F94] font-bold"><IconArrowRight className="w-4 h-4" /></span>
            </button>

            {/* 04 · Open Wallet */}
            <button
              type="button"
              onClick={() => {
                setCommandDrawerOpen(false);
                navigateWithLoader('/wallet');
              }}
              className="w-full p-3.5 text-left flex items-center justify-between hover:bg-[#F5F2F3] active:opacity-80 transition-colors"
            >
              <div>
                <div className="font-mono text-[10px] font-bold text-[#021F94] uppercase tracking-wider">
                  04 · FINANCIAL AUDIT
                </div>
                <div className="font-sans font-bold text-sm text-[#0B1026] mt-0.5">
                  OPEN WALLET LEDGER
                </div>
                <div className="text-xs text-[#565C73] mt-0.5">
                  View full double-entry transaction history and movements
                </div>
              </div>
              <span className="font-mono text-sm text-[#021F94] font-bold"><IconArrowRight className="w-4 h-4" /></span>
            </button>

            {/* 05 · Subscription */}
            <button
              type="button"
              onClick={() => {
                setCommandDrawerOpen(false);
                navigateWithLoader('/subscription');
              }}
              className="w-full p-3.5 text-left flex items-center justify-between hover:bg-[#F5F2F3] active:opacity-80 transition-colors"
            >
              <div>
                <div className="font-mono text-[10px] font-bold text-[#021F94] uppercase tracking-wider">
                  05 · PROTOCOL TIERS
                </div>
                <div className="font-sans font-bold text-sm text-[#0B1026] mt-0.5">
                  SUBSCRIPTION & BETA PLANS
                </div>
                <div className="text-xs text-[#565C73] mt-0.5">
                  Explore Student Pro, Club, and Campus tier waitlists
                </div>
              </div>
              <span className="font-mono text-sm text-[#021F94] font-bold"><IconArrowRight className="w-4 h-4" /></span>
            </button>
          </div>
        </div>
      </MobileArchitecturalDrawer>
    </>
  );
}
