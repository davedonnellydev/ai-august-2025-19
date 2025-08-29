import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/db/client';
import { contentItems, events, rsvps } from '@/app/db/schema';
import { eq, gt, sql } from 'drizzle-orm';
import { requireAdmin } from '@/app/lib/authz';

const createEventSchema = z.object({
  title: z.string().min(3).max(240),
  startsAt: z.coerce.date(),
  venue: z.string().min(2).max(240),
  facilitatorUserId: z.string().uuid().optional().nullable(),
});

export async function GET() {
  const now = new Date();

  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      startsAt: events.startsAt,
      venue: events.venue,
      facilitatorUserId: events.facilitatorUserId,
      contentCount: sql<number>`count(${contentItems.id})`,
      rsvpCount: sql<number>`count(${rsvps.id})`,
    })
    .from(events)
    .leftJoin(contentItems, eq(contentItems.eventId, events.id))
    .leftJoin(rsvps, eq(rsvps.eventId, events.id))
    .where(gt(events.startsAt, now))
    .groupBy(events.id)
    .orderBy(events.startsAt);

  return Response.json({ events: rows });
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const json = await req.json();
  const body = createEventSchema.parse(json);

  const [row] = await db
    .insert(events)
    .values({
      clubId:
        sql`(select id from clubs where slug = 'ai-content-club' limit 1)` as any,
      title: body.title,
      startsAt: body.startsAt,
      venue: body.venue,
      facilitatorUserId: body.facilitatorUserId ?? null,
    })
    .returning();

  return Response.json({ event: row }, { status: 201 });
}
