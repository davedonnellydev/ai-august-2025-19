'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Group, Stack, Text, Title } from '@mantine/core';

type EventDetail = {
  id: string;
  title: string;
  contentItems: {
    id: string;
    title: string;
  }[];
};

export default function AITab() {
  const [events, setEvents] = useState<EventDetail[]>([]);

  const load = async () => {
    // Simple approach: reuse /api/events list then fetch each detail
    const res = await fetch('/api/events');
    if (!res.ok) {
      return;
    }
    const { events: list } = (await res.json()) as {
      events: { id: string; title: string }[];
    };
    const detailed: EventDetail[] = [];
    for (const ev of list) {
      const r = await fetch(`/api/events/${ev.id}`);
      if (r.ok) {
        const d = await r.json();
        detailed.push({
          id: ev.id,
          title: ev.title,
          contentItems: d.contentItems.map((i: any) => ({
            id: i.id,
            title: i.title,
          })),
        });
      }
    }
    setEvents(detailed);
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async (contentItemId: string, regenerate?: boolean) => {
    await fetch(`/api/ai/${regenerate ? 'regenerate' : 'generate'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentItemId }),
    });
  };

  return (
    <Stack gap="md">
      <Title order={4}>AI outputs</Title>
      {events.map((ev) => (
        <Card key={ev.id} withBorder>
          <Text fw={600}>{ev.title}</Text>
          <Stack gap={6} mt="xs">
            {ev.contentItems.length === 0 && (
              <Text c="dimmed">No content items yet.</Text>
            )}
            {ev.contentItems.map((ci) => (
              <Group key={ci.id} justify="space-between">
                <Text>{ci.title}</Text>
                <Group gap="xs">
                  <Button size="xs" onClick={() => generate(ci.id)}>
                    Generate
                  </Button>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => generate(ci.id, true)}
                  >
                    Regenerate
                  </Button>
                </Group>
              </Group>
            ))}
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
