'use client';

import { Tabs, Title } from '@mantine/core';
import MembersTab from './tabs/members';
import EventsTab from './tabs/events';
import AITab from './tabs/ai';

export default function AdminTabs() {
  return (
    <Tabs defaultValue="members">
      <Title order={2} mb="md">
        Admin dashboard
      </Title>
      <Tabs.List>
        <Tabs.Tab value="members">Members</Tabs.Tab>
        <Tabs.Tab value="events">Events</Tabs.Tab>
        <Tabs.Tab value="ai">AI</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="members" pt="md">
        <MembersTab />
      </Tabs.Panel>
      <Tabs.Panel value="events" pt="md">
        <EventsTab />
      </Tabs.Panel>
      <Tabs.Panel value="ai" pt="md">
        <AITab />
      </Tabs.Panel>
    </Tabs>
  );
}
