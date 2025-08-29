import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/db/client';
import { contentItems } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminOrFacilitator } from '@/app/lib/authz';

const updateContentItemSchema = z.object({
  type: z.enum(['book', 'podcast', 'film', 'other']).optional(),
  title: z.string().min(2).max(240).optional(),
  sourceUrl: z.string().url().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const item = await db.query.contentItems.findFirst({
    where: eq(contentItems.id, id),
  });
  if (!item) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  await requireAdminOrFacilitator(item.eventId);

  const json = await req.json();
  const body = updateContentItemSchema.parse(json);

  const [row] = await db
    .update(contentItems)
    .set({
      ...(body.type ? { type: body.type } : {}),
      ...(body.title ? { title: body.title } : {}),
      sourceUrl: body.sourceUrl ?? null,
      notes: body.notes ?? null,
    })
    .where(eq(contentItems.id, id))
    .returning();

  return Response.json({ contentItem: row });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const item = await db.query.contentItems.findFirst({
    where: eq(contentItems.id, id),
  });
  if (!item) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  await requireAdminOrFacilitator(item.eventId);

  await db.delete(contentItems).where(eq(contentItems.id, id));
  return new Response(null, { status: 204 });
}
