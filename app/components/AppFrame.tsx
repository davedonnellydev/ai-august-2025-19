'use client';

import Link from 'next/link';
import { AppShell, Burger, Group, Title } from '@mantine/core';
import { useSession } from 'next-auth/react';
import AuthButton from './AuthButton';

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';

  return (
    <AppShell header={{ height: 56 }} padding="md">
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          <Group>
            <Burger opened={false} size="sm" aria-label="Toggle navigation" />
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Title order={3}>Content Club</Title>
            </Link>
          </Group>
          <Group>
            {isAdmin && (
              <Link href="/admin" style={{ textDecoration: 'none' }}>
                Admin
              </Link>
            )}
            <AuthButton />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
