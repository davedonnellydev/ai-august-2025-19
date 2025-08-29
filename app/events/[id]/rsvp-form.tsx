'use client';

import { useEffect, useState } from 'react';
import { Button, Group, Radio, Stack, Textarea } from '@mantine/core';

type Rsvp = {
  id: string;
  status: 'going' | 'maybe' | 'not_going';
  notes: string | null;
};

export default function RsvpForm({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'going' | 'maybe' | 'not_going' | ''>(
    ''
  );
  const [notes, setNotes] = useState('');
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/rsvp/me`);
        if (res.ok) {
          const data = (await res.json()) as { rsvp: Rsvp | null };
          if (data.rsvp) {
            setStatus(data.rsvp.status);
            setNotes(data.rsvp.notes ?? '');
          }
        }
      } finally {
        setInitialLoaded(true);
      }
    };
    load();
  }, [eventId]);

  const onSave = async () => {
    setLoading(true);
    try {
      await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: notes || null }),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack miw={320}>
      <Radio.Group
        label="RSVP"
        value={status}
        onChange={(v) => setStatus(v as 'going' | 'maybe' | 'not_going')}
      >
        <Group>
          <Radio value="going" label="Going" />
          <Radio value="maybe" label="Maybe" />
          <Radio value="not_going" label="Not going" />
        </Group>
      </Radio.Group>
      <Textarea
        label="Notes"
        placeholder="Optional notes"
        autosize
        minRows={2}
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
      />
      <Group justify="flex-end">
        <Button
          onClick={onSave}
          loading={loading}
          disabled={!initialLoaded || !status}
        >
          Save RSVP
        </Button>
      </Group>
    </Stack>
  );
}
