import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/db/client';
import { contentItems } from '@/app/db/schema';
import { and, count, eq } from 'drizzle-orm';
import { requireAdminOrFacilitator } from '@/app/lib/authz';

const createContentItemSchema = z.object({
  type: z.enum(['book', 'podcast', 'film', 'other']),
  title: z.string().min(2).max(240),
  sourceUrl: z.string().url().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;
  await requireAdminOrFacilitator(eventId);

  // Enforce max 3 content items per event
  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(contentItems)
    .where(eq(contentItems.eventId, eventId));
  if ((existingCount ?? 0) >= 3) {
    return Response.json(
      { error: 'Maximum of 3 content items per event' },
      { status: 400 }
    );
  }

  const json = await req.json();
  const body = createContentItemSchema.parse(json);

  const [row] = await db
    .insert(contentItems)
    .values({
      eventId,
      type: body.type,
      title: body.title,
      sourceUrl: body.sourceUrl ?? null,
      notes: body.notes ?? null,
    })
    .returning();

  return Response.json({ contentItem: row }, { status: 201 });
}
