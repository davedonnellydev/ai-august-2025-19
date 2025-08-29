import { Badge, Card, Group, Stack, Text, Title } from '@mantine/core';
import { format } from 'date-fns';
import { auth } from '@/app/auth';
import RsvpForm from './rsvp-form';

type ContentItem = {
  id: string;
  type: 'book' | 'podcast' | 'film' | 'other';
  title: string;
  sourceUrl: string | null;
  notes: string | null;
};

type AIOutput = {
  id: string;
  contentItemId: string;
  shortSummary: string;
  longSummary: string;
  questionsJson: string;
  activitiesJson: string;
  model: string;
  updatedAt: string;
};

type EventDetail = {
  event: {
    id: string;
    title: string;
    startsAt: string;
    venue: string;
  };
  contentItems: ContentItem[];
  aiOutputs: AIOutput[];
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/events/${id}`,
    {
      cache: 'no-store',
    }
  );
  if (!res.ok) {
    return (
      <Stack>
        <Title order={3}>Event not found</Title>
        <Text c="dimmed">The event you are looking for does not exist.</Text>
      </Stack>
    );
  }
  const data = (await res.json()) as EventDetail;

  const outputsByItem = new Map<string, AIOutput>(
    data.aiOutputs.map((o) => [o.contentItemId, o])
  );

  const starts = new Date(data.event.startsAt);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={2}>{data.event.title}</Title>
          <Text c="dimmed">{format(starts, 'eeee, MMMM d, yyyy • h:mma')}</Text>
          <Text c="dimmed">Venue: {data.event.venue}</Text>
        </div>
        {session?.user && <RsvpForm eventId={data.event.id} />}
      </Group>

      {data.contentItems.map((item) => {
        const out = outputsByItem.get(item.id);
        return (
          <Card key={item.id} withBorder shadow="sm">
            <Group justify="space-between" mb="xs">
              <Group>
                <Badge variant="light" color="blue">
                  {item.type}
                </Badge>
                <Title order={4}>{item.title}</Title>
              </Group>
              {item.sourceUrl && (
                <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                  Source
                </a>
              )}
            </Group>
            {item.notes && (
              <Text size="sm" mb="sm">
                {item.notes}
              </Text>
            )}
            {out ? (
              <Stack gap={6}>
                <Text fw={600}>Short summary</Text>
                <Text>{out.shortSummary}</Text>
                <Text fw={600}>Long summary</Text>
                <Text>{out.longSummary}</Text>
                <Text fw={600}>Discussion questions</Text>
                <Stack gap={4}>
                  {JSON.parse(out.questionsJson as unknown as string).map(
                    (q: string, idx: number) => (
                      <Text key={idx}>• {q}</Text>
                    )
                  )}
                </Stack>
                <Text fw={600}>Activities</Text>
                <Stack gap={4}>
                  {JSON.parse(out.activitiesJson as unknown as string).map(
                    (
                      act: {
                        title: string;
                        description: string;
                        duration: number;
                      },
                      idx: number
                    ) => (
                      <Text key={idx}>
                        • {act.title} — {act.duration} min: {act.description}
                      </Text>
                    )
                  )}
                </Stack>
              </Stack>
            ) : (
              <Text c="dimmed">AI outputs not generated yet.</Text>
            )}
          </Card>
        );
      })}
    </Stack>
  );
}
