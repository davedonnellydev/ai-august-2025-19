import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const ContentSummary = z.object({
  short_summary: z.string().min(40).max(1200),
  long_summary: z.string().min(200).max(3000),
  questions: z.array(z.string().min(10).max(240)).min(6).max(10),
  activities: z
    .array(
      z.object({
        title: z.string().min(3).max(120),
        description: z.string().min(20).max(800),
        duration: z.number().int().min(5).max(60),
      })
    )
    .min(3)
    .max(5),
});

export type AIOutputs = z.infer<typeof ContentSummary>;

export async function generateAIOutputsForContentItem(input: {
  type: 'book' | 'podcast' | 'film' | 'other';
  title: string;
  sourceUrl?: string | null;
  notes?: string | null;
  model?: string;
}): Promise<AIOutputs> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const model = input.model ?? (process.env.OPENAI_MODEL || 'gpt-4.1');

  const instructions = `You are assisting a community content club facilitator. You will be given details regarding a content item that the content club will be discussing. Generate:
1) A short summary (150-200 words) of the content
2) A long summary (400-600 words)
3) 6-10 open-ended discussion questions
4) 3-5 facilitator activities with duration (5-60 min) and clear goals`;

  const userPrompt = `Content item details:
- Type: ${input.type}
- Title: ${input.title}
- URL: ${input.sourceUrl ?? 'n/a'}
- Notes: ${input.notes ?? 'n/a'}
`;

  // Use Structured Outputs via responses.parse with Zod schema
  const response = await openai.responses.parse({
    model,
    instructions,
    input: userPrompt,
    text: {
      format: zodTextFormat(ContentSummary, 'content_summary'),
    },
  });

  // Prefer the convenience field if present; fall back to first parsed item
  const parsedDirect = (response as any).output_parsed as AIOutputs | undefined;
  const parsedFirst = (response as any).output?.[0]?.parsed as
    | AIOutputs
    | undefined;
  const parsed = parsedDirect ?? parsedFirst;
  if (!parsed) {
    throw new Error('Failed to parse structured output');
  }
  return parsed;
}
