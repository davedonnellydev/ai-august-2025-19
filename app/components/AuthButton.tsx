'use client';

import { Avatar, Button, Group, Menu, Text } from '@mantine/core';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Button variant="light" disabled>
        Loading…
      </Button>
    );
  }

  if (!session) {
    return (
      <Button onClick={() => signIn('google')} variant="light">
        Sign in with Google
      </Button>
    );
  }

  return (
    <Menu shadow="md" width={220}>
      <Menu.Target>
        <Group gap="xs" style={{ cursor: 'pointer' }}>
          <Avatar src={session.user?.image ?? undefined} radius="xl" size={28}>
            {(session.user?.name?.[0] ?? 'U').toUpperCase()}
          </Avatar>
          <Text size="sm">{session.user?.name ?? session.user?.email}</Text>
        </Group>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          {session.user?.role === 'admin' ? 'Admin' : 'Member'}
          {session.user?.membershipStatus === 'pending' ? ' · Pending' : ''}
        </Menu.Label>
        <Menu.Item onClick={() => signOut()}>Sign out</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
