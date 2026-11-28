'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceProvider';
import { WorkspaceTransitionProvider } from '@/components/WorkspaceTransitionProvider';
import { WorkspaceHourglassLoader } from '@/components/WorkspaceHourglassLoader';
import { TopNavbar } from '@/components/workspace/TopNavbar';
import { HomeSidebar } from '@/components/workspace/HomeSidebar';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { MobileBottomRail } from '@/components/mobile/MobileBottomRail';
import { PostListingModal } from '@/components/workspace/PostListingModal';
import { SpaceModal } from '@/components/workspace/SpaceModal';
import { ToastStack } from '@/components/workspace/ToastStack';

function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { themeMode, authStatus } = useWorkspace();

  const showHomeSidebar =
    pathname === '/dashboard' ||
    pathname === '/explore' ||
    pathname === '/saved' ||
    pathname === '/agreement' ||
    pathname === '/wallet';

  // Layer 3 Client Gate: never flash protected workspace HTML until /api/auth/session confirms HTTP 200
  if (authStatus !== 'authenticated') {
    return <WorkspaceHourglassLoader visible={true} label="VERIFYING SESSION..." />;
  }

  return (
    <div
      className={`et-shell ${themeMode === 'dark' ? 'et-app-dark' : 'et-app-light'} flex flex-col min-h-screen overflow-x-clip`}
    >
      {/* Mobile Top Telemetry Bar (< 1024px) */}
      <MobileTopBar />

      {/* Desktop Top Navigation Bar (>= 1024px STRICT LOCK) */}
      <div className="hidden lg:block">
        <TopNavbar />
      </div>

      {/* Mobile Bottom 5-Column Navigation Rail (< 1024px) */}
      <MobileBottomRail />

      {/* Main Workspace Frame */}
      <div className="flex-1 max-w-[1460px] w-full mx-auto px-3.5 sm:px-7 py-3 sm:py-8 pb-[88px] lg:pb-8 flex flex-col lg:flex-row gap-7 items-start">
        {/* Desktop-Only Sidebar Navigation (>= 1024px STRICT LOCK) */}
        {showHomeSidebar && (
          <div className="hidden lg:block shrink-0">
            <HomeSidebar />
          </div>
        )}
        <main className="flex-1 min-w-0 w-full">{children}</main>
      </div>

      <PostListingModal />
      <SpaceModal />
      <ToastStack />
    </div>
  );
}

export function WorkspaceClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceTransitionProvider>
      <WorkspaceProvider>
        <WorkspaceShell>{children}</WorkspaceShell>
      </WorkspaceProvider>
    </WorkspaceTransitionProvider>
  );
}
