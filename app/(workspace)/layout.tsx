import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session-token';
import { WorkspaceClientLayout } from '@/components/workspace/WorkspaceClientLayout';

export const dynamic = 'force-dynamic';

/**
 * Layer 2 Auth Guard — Server Component Layout.
 * Verifies the et_session JWT AND confirms the account still exists in Neon PostgreSQL
 * before any protected workspace HTML or client state is streamed to the browser.
 */
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session?.userId) {
    redirect('/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true },
  });

  if (!dbUser) {
    redirect('/login');
  }

  return <WorkspaceClientLayout>{children}</WorkspaceClientLayout>;
}
