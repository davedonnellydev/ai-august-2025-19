import { requireAdmin } from '@/app/lib/authz';
import { db } from '@/app/db/client';
import { memberships, users, clubs } from '@/app/db/schema';
import { and, asc, eq } from 'drizzle-orm';

export async function GET() {
  await requireAdmin();
  const club = await db.query.clubs.findFirst({ where: eq(clubs.slug, 'ai-content-club') });
  if (!club) return Response.json({ members: [] });

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      membershipStatus: memberships.status,
    })
    .from(users)
    .leftJoin(memberships, and(eq(memberships.userId, users.id), eq(memberships.clubId, club.id)))
    .orderBy(asc(users.email));

  return Response.json({ members: rows });
}
