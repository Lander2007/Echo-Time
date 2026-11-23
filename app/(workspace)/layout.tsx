'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceProvider';
import { TopNavbar } from '@/components/workspace/TopNavbar';
import { HomeSidebar } from '@/components/workspace/HomeSidebar';
import { PostListingModal } from '@/components/workspace/PostListingModal';
import { SpaceModal } from '@/components/workspace/SpaceModal';
import { ToastStack } from '@/components/workspace/ToastStack';

function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { themeMode } = useWorkspace();

  const showHomeSidebar =
    pathname === '/dashboard' ||
    pathname === '/explore' ||
    pathname === '/agreement' ||
    pathname === '/wallet';

  return (
    <div className={`et-shell ${themeMode === 'dark' ? 'et-app-dark' : 'et-app-light'} flex flex-col min-h-screen`}>
      <TopNavbar />
      <div className="flex-1 max-w-[1460px] w-full mx-auto px-4 sm:px-7 py-6 sm:py-8 flex flex-col lg:flex-row gap-7 items-start">
        {showHomeSidebar && <HomeSidebar />}
        <main className="flex-1 min-w-0 w-full">{children}</main>
      </div>
      <PostListingModal />
      <SpaceModal />
      <ToastStack />
    </div>
  );
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceProvider>
  );
}
