import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/db/client';
import { aiOutputs, contentItems, events } from '@/app/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireAdminOrFacilitator } from '@/app/lib/authz';

const updateEventSchema = z.object({
  title: z.string().min(3).max(240).optional(),
  startsAt: z.coerce.date().optional(),
  venue: z.string().min(2).max(240).optional(),
  facilitatorUserId: z.string().uuid().nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const event = await db.query.events.findFirst({ where: eq(events.id, id) });
  if (!event) return Response.json({ error: 'Not found' }, { status: 404 });

  const items = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.eventId, id));

  const outputs = await db
    .select()
    .from(aiOutputs)
    .where(and(eq(aiOutputs.contentItemId, contentItems.id as any)) as any);

  return Response.json({ event, contentItems: items, aiOutputs: outputs });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  await requireAdminOrFacilitator(id);

  const json = await req.json();
  const body = updateEventSchema.parse(json);

  const [row] = await db
    .update(events)
    .set({
      ...(body.title ? { title: body.title } : {}),
      ...(body.startsAt ? { startsAt: body.startsAt } : {}),
      ...(body.venue ? { venue: body.venue } : {}),
      facilitatorUserId: body.facilitatorUserId ?? null,
    })
    .where(eq(events.id, id))
    .returning();

  return Response.json({ event: row });
}
