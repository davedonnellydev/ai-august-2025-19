'use client';

import { Avatar, Badge, Button, Group, Table, Text } from '@mantine/core';
import { useEffect, useState } from 'react';

type Member = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: 'member' | 'admin';
  membershipStatus: 'pending' | 'active' | 'removed';
};

export default function MembersTab() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/members');
      if (res.ok) {
        const data = (await res.json()) as { members: Member[] };
        setMembers(data.members);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateMember = async (
    userId: string,
    body: {
      membershipStatus?: Member['membershipStatus'];
      promoteToAdmin?: boolean;
    }
  ) => {
    await fetch(`/api/admin/members/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    await load();
  };

  return (
    <Table highlightOnHover stickyHeader stickyHeaderOffset={0} withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>User</Table.Th>
          <Table.Th>Email</Table.Th>
          <Table.Th>Role</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Action</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {members.map((m) => (
          <Table.Tr key={m.id}>
            <Table.Td>
              <Group>
                <Avatar src={m.image ?? undefined} radius="xl" />
                <Text>{m.name ?? '—'}</Text>
              </Group>
            </Table.Td>
            <Table.Td>{m.email}</Table.Td>
            <Table.Td>
              <Badge color={m.role === 'admin' ? 'green' : 'gray'}>
                {m.role}
              </Badge>
            </Table.Td>
            <Table.Td>
              <Badge
                color={
                  m.membershipStatus === 'active'
                    ? 'blue'
                    : m.membershipStatus === 'pending'
                      ? 'yellow'
                      : 'red'
                }
              >
                {m.membershipStatus}
              </Badge>
            </Table.Td>
            <Table.Td>
              <Group gap="xs" justify="flex-end">
                {m.membershipStatus === 'pending' && (
                  <Button
                    size="xs"
                    onClick={() =>
                      updateMember(m.id, { membershipStatus: 'active' })
                    }
                  >
                    Approve
                  </Button>
                )}
                {m.role !== 'admin' && (
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => updateMember(m.id, { promoteToAdmin: true })}
                  >
                    Promote to admin
                  </Button>
                )}
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
        {!loading && members.length === 0 && (
          <Table.Tr>
            <Table.Td colSpan={5}>
              <Text c="dimmed">No members found.</Text>
            </Table.Td>
          </Table.Tr>
        )}
      </Table.Tbody>
    </Table>
  );
}
