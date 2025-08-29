import { NextRequest } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/db/client';
import { aiOutputs, contentItems } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdminOrFacilitator } from '@/app/lib/authz';
import { generateAIOutputsForContentItem } from '@/app/lib/ai';

const bodySchema = z.object({ contentItemId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const json = await req.json();
  const { contentItemId } = bodySchema.parse(json);

  const item = await db.query.contentItems.findFirst({ where: eq(contentItems.id, contentItemId) });
  if (!item) return Response.json({ error: 'Not found' }, { status: 404 });

  await requireAdminOrFacilitator(item.eventId);

  const generated = await generateAIOutputsForContentItem({
    type: item.type,
    title: item.title,
    sourceUrl: item.sourceUrl,
    notes: item.notes,
  });

  const [row] = await db
    .insert(aiOutputs)
    .values({
      contentItemId,
      shortSummary: generated.short_summary,
      longSummary: generated.long_summary,
      questionsJson: JSON.stringify(generated.questions),
      activitiesJson: JSON.stringify(generated.activities),
      model: process.env.OPENAI_MODEL || 'gpt-4.1',
    })
    .onConflictDoUpdate({
      target: aiOutputs.contentItemId,
      set: {
        shortSummary: generated.short_summary,
        longSummary: generated.long_summary,
        questionsJson: JSON.stringify(generated.questions),
        activitiesJson: JSON.stringify(generated.activities),
        model: process.env.OPENAI_MODEL || 'gpt-4.1',
        updatedAt: new Date(),
      },
    })
    .returning();

  return Response.json({ aiOutputs: row });
}
