import { auth } from '@/app/auth';
import { db } from '@/app/db/client';
import { rsvps } from '@/app/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const row = await db.query.rsvps.findFirst({
    where: and(
      eq(rsvps.eventId, params.id),
      eq(rsvps.userId, (session.user as any).id as string)
    ),
  });

  return Response.json({ rsvp: row ?? null });
}
