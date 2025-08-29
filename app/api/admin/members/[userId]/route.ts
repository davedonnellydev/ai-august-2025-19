import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/app/lib/authz';
import { db } from '@/app/db/client';
import { clubs, memberships, users } from '@/app/db/schema';
import { and, desc, eq } from 'drizzle-orm';

const updateMemberSchema = z.object({
  membershipStatus: z.enum(['pending', 'active', 'removed']).optional(),
  promoteToAdmin: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  await requireAdmin();
  const json = await req.json();
  const body = updateMemberSchema.parse(json);

  const club = await db.query.clubs.findFirst({ where: eq(clubs.slug, 'ai-content-club') });
  if (!club) return Response.json({ error: 'Club not found' }, { status: 404 });

  // Ensure membership exists
  await db
    .insert(memberships)
    .values({ clubId: club.id, userId: params.userId, status: 'pending' })
    .onConflictDoNothing();

  if (body.membershipStatus) {
    await db
      .update(memberships)
      .set({ status: body.membershipStatus })
      .where(and(eq(memberships.clubId, club.id), eq(memberships.userId, params.userId)));
  }

  if (body.promoteToAdmin) {
    await db.update(users).set({ role: 'admin' }).where(eq(users.id, params.userId));
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, params.userId) });
  const membership = await db.query.memberships.findFirst({
    where: and(eq(memberships.clubId, club.id), eq(memberships.userId, params.userId)),
    orderBy: [desc(memberships.createdAt)],
  });

  return Response.json({
    member: {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      image: user?.image,
      role: user?.role,
      membershipStatus: membership?.status ?? 'pending',
    },
  });
}
