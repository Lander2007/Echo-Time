import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { EchoTimeAuthPortal } from '@/components/EchoTimeAuthPortal';
import {
  getSafeRedirectPath,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from '@/lib/session-token';

export const dynamic = 'force-dynamic';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ oauth_error?: string; next?: string }>;
}) {
  const params = await searchParams;

  if (!params.oauth_error) {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (session?.userId) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true },
      });
      if (dbUser) {
        redirect(getSafeRedirectPath(params.next));
      }
    }
  }

  return <EchoTimeAuthPortal initialMode="signup" />;
}
