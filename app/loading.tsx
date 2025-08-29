import { Card, Group, Skeleton, Stack, Title } from '@mantine/core';

export default function Loading() {
  return (
    <Stack gap="md">
      <Title order={2}>Upcoming events</Title>
      {[0, 1, 2].map((i) => (
        <Card key={i} withBorder shadow="sm">
          <Group justify="space-between" mb="xs">
            <Skeleton height={20} width={220} radius="sm" />
            <Skeleton height={20} width={160} radius="sm" />
          </Group>
          <Group justify="space-between">
            <Skeleton height={16} width={180} radius="sm" />
            <Group gap="xs">
              <Skeleton height={18} width={90} radius="xl" />
              <Skeleton height={18} width={90} radius="xl" />
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
