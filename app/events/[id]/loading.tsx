import { Card, Group, Skeleton, Stack, Title } from '@mantine/core';

export default function Loading() {
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={2}>
            <Skeleton height={28} width={240} />
          </Title>
          <Skeleton height={16} width={220} />
          <Skeleton height={16} width={180} />
        </div>
        <Skeleton height={120} width={320} />
      </Group>
      {[0, 1].map((i) => (
        <Card key={i} withBorder shadow="sm">
          <Group justify="space-between" mb="xs">
            <Group>
              <Skeleton height={18} width={60} />
              <Skeleton height={20} width={220} />
            </Group>
            <Skeleton height={16} width={80} />
          </Group>
          <Skeleton height={14} width="100%" />
          <Skeleton height={14} width="90%" />
          <Skeleton height={14} width="95%" />
        </Card>
      ))}
    </Stack>
  );
}
