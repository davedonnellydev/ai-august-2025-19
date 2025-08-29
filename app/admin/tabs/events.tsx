'use client';

import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { DateTime } from 'luxon';

type EventItem = {
  id: string;
  title: string;
  startsAt: string;
  venue: string;
  contentCount: number;
};

type ContentItem = {
  id: string;
  type: 'book' | 'podcast' | 'film' | 'other';
  title: string;
  sourceUrl: string | null;
  notes: string | null;
};

export default function EventsTab() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [venue, setVenue] = useState('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch('/api/events');
    if (res.ok) {
      const data = (await res.json()) as { events: EventItem[] };
      setEvents(data.events);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createEvent = async () => {
    setLoading(true);
    try {
      const dt = DateTime.fromISO(`${date}T${time}`);
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, startsAt: dt.toISO(), venue }),
      });
      setTitle('');
      setVenue('');
      await load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <Title order={4}>Create event</Title>
      <Group align="flex-end">
        <TextInput
          label="Title"
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          miw={200}
        />
        <TextInput
          label="Date"
          placeholder="YYYY-MM-DD"
          value={date}
          onChange={(e) => setDate(e.currentTarget.value)}
          miw={140}
        />
        <TextInput
          label="Time"
          placeholder="HH:mm"
          value={time}
          onChange={(e) => setTime(e.currentTarget.value)}
          miw={100}
        />
        <TextInput
          label="Venue"
          placeholder="Venue"
          value={venue}
          onChange={(e) => setVenue(e.currentTarget.value)}
          miw={180}
        />
        <Button
          onClick={createEvent}
          loading={loading}
          disabled={!title || !date || !time || !venue}
        >
          Create
        </Button>
      </Group>

      <Title order={4}>Upcoming events</Title>
      {events.map((ev) => (
        <Card key={ev.id} withBorder>
          <Group justify="space-between">
            <div>
              <Text fw={600}>{ev.title}</Text>
              <Text c="dimmed">
                {DateTime.fromISO(ev.startsAt).toLocaleString(
                  DateTime.DATETIME_MED
                )}
              </Text>
              <Text c="dimmed">Venue: {ev.venue}</Text>
            </div>
            <Badge variant="light">{ev.contentCount} items</Badge>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
