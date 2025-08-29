import Link from 'next/link';
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { format } from 'date-fns';
import { auth } from '@/app/auth';

type EventListItem = {
  id: string;
  title: string;
  startsAt: string;
  venue: string;
  contentCount: number;
  rsvpCount: number;
};

export default async function HomePage() {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/events`,
    {
      cache: 'no-store',
    }
  ).catch(() => undefined);

  let events: EventListItem[] = [];
  if (res?.ok) {
    const data = (await res.json()) as { events: EventListItem[] };
    events = data.events ?? [];
  }

  return (
    <Stack gap="md">
      <Title order={2}>Upcoming events</Title>
      {events.length === 0 && (
        <Alert title="Nothing scheduled yet" color="gray" variant="light">
          <Stack gap={8}>
            <Text c="dimmed">
              No upcoming events yet. Please check back soon.
            </Text>
            {isAdmin && (
              <Button component={Link} href="/admin" variant="light">
                Create an event (admins)
              </Button>
            )}
          </Stack>
        </Alert>
      )}
      {events.map((event) => {
        const starts = new Date(event.startsAt);
        return (
          <Card
            key={event.id}
            withBorder
            shadow="sm"
            component={Link}
            href={`/events/${event.id}`}
          >
            <Group justify="space-between" mb="xs">
              <Title order={4}>{event.title}</Title>
              <Badge>{format(starts, 'eee, MMM d • h:mma')}</Badge>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Venue: {event.venue}
              </Text>
              <Group gap="xs">
                <Badge variant="light">{event.contentCount} items</Badge>
                <Badge variant="light">{event.rsvpCount} RSVPs</Badge>
              </Group>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}
