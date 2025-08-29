import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/db/client';
import { memberships, rsvps, users } from '@/app/db/schema';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/app/auth';

const rsvpSchema = z.object({
  status: z.enum(['going', 'maybe', 'not_going']),
  notes: z.string().max(4000).optional().nullable(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id)
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).membershipStatus !== 'active') {
    return Response.json({ error: 'Membership not active' }, { status: 403 });
  }

  const json = await req.json();
  const body = rsvpSchema.parse(json);

  const [row] = await db
    .insert(rsvps)
    .values({
      eventId: params.id,
      userId: (session.user as any).id as string,
      status: body.status,
      notes: body.notes ?? null,
    })
    .onConflictDoUpdate({
      target: [rsvps.eventId, rsvps.userId],
      set: { status: body.status, notes: body.notes ?? null },
    })
    .returning();

  return Response.json({ rsvp: row });
}
