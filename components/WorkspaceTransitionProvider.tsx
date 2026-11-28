'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { WorkspaceHourglassLoader } from '@/components/WorkspaceHourglassLoader';

const ROUTE_LABEL_MAP: Array<{ prefix: string; label: string }> = [
  { prefix: '/dashboard', label: 'OPENING DASHBOARD' },
  { prefix: '/explore', label: 'LOADING MARKETPLACE' },
  { prefix: '/saved', label: 'LOADING SAVED SKILLS' },
  { prefix: '/agreement', label: 'ENTERING AGREEMENT ROOM' },
  { prefix: '/wallet', label: 'SYNCING CREDIT LEDGER' },
  { prefix: '/community', label: 'OPENING COMMUNITY' },
  { prefix: '/subscription', label: 'LOADING BETA PLANS' },
  { prefix: '/profile', label: 'LOADING PROFILE' },
];

const MIN_VISIBLE_MS = 380;
const FAILSAFE_CLEAR_MS = 2500;

function resolveDestinationLabel(pathname: string): string | null {
  const match = ROUTE_LABEL_MAP.find(
    (entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`)
  );
  return match ? match.label : null;
}

interface WorkspaceTransitionContextType {
  navigateWithLoader: (href: string, customLabel?: string) => void;
  startTransitionForPath: (href: string, customLabel?: string) => void;
}

const WorkspaceTransitionContext = createContext<WorkspaceTransitionContextType | null>(null);

export function WorkspaceTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState('SYNCING WORKSPACE');

  const pathnameRef = useRef<string>(pathname);
  const visibleRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const hideTimerRef = useRef<number | null>(null);
  const failsafeTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (failsafeTimerRef.current !== null) {
      window.clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
  }, []);

  const showOverlay = useCallback(
    (nextLabel: string) => {
      clearTimers();
      startTimeRef.current = Date.now();
      visibleRef.current = true;
      setLabel(nextLabel);
      setVisible(true);

      failsafeTimerRef.current = window.setTimeout(() => {
        visibleRef.current = false;
        setVisible(false);
        failsafeTimerRef.current = null;
      }, FAILSAFE_CLEAR_MS);
    },
    [clearTimers]
  );

  const startTransitionForPath = useCallback(
    (href: string, customLabel?: string) => {
      if (typeof window === 'undefined') return;
      try {
        const target = new URL(href, window.location.origin);
        if (target.origin !== window.location.origin) return;
        const resolved = customLabel || resolveDestinationLabel(target.pathname);
        if (!resolved) return;

        // Never trigger loader when clicking the already-active page
        if (target.pathname === pathnameRef.current) {
          return;
        }
        showOverlay(resolved);
      } catch {
        // Ignore malformed href strings
      }
    },
    [showOverlay]
  );

  const navigateWithLoader = useCallback(
    (href: string, customLabel?: string) => {
      if (typeof window === 'undefined') {
        router.push(href);
        return;
      }
      try {
        const target = new URL(href, window.location.origin);
        const sameDestination =
          target.origin === window.location.origin &&
          target.pathname === pathnameRef.current &&
          target.search === window.location.search;

        if (sameDestination) {
          return;
        }

        if (target.origin === window.location.origin && target.pathname !== pathnameRef.current) {
          const resolved = customLabel || resolveDestinationLabel(target.pathname);
          if (resolved) {
            showOverlay(resolved);
          }
        }
      } catch {
        // Fallback to direct push
      }
      router.push(href);
    },
    [router, showOverlay]
  );

  // Dismiss overlay smoothly once pathname settles (honoring 380ms minimum flip beat)
  useEffect(() => {
    if (pathnameRef.current !== pathname) {
      pathnameRef.current = pathname;

      if (visibleRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

        if (hideTimerRef.current !== null) {
          window.clearTimeout(hideTimerRef.current);
        }
        hideTimerRef.current = window.setTimeout(() => {
          clearTimers();
          visibleRef.current = false;
          setVisible(false);
        }, remaining);
      }
    }
  }, [pathname, clearTimers]);

  // Global capture listener for all workspace <Link> / <a> clicks (never re-binds on navigation)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const targetEl = e.target as HTMLElement | null;
      const anchor = targetEl?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const rawHref = anchor.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
        return;
      }

      startTransitionForPath(rawHref);
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [startTransitionForPath]);

  // Clear timers only when the provider itself unmounts
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const contextValue = useMemo(
    () => ({ navigateWithLoader, startTransitionForPath }),
    [navigateWithLoader, startTransitionForPath]
  );

  return (
    <WorkspaceTransitionContext.Provider value={contextValue}>
      {children}
      <WorkspaceHourglassLoader visible={visible} label={label} />
    </WorkspaceTransitionContext.Provider>
  );
}

export function useWorkspaceTransition() {
  const ctx = useContext(WorkspaceTransitionContext);
  if (!ctx) {
    throw new Error('useWorkspaceTransition must be used within WorkspaceTransitionProvider');
  }
  return ctx;
}
