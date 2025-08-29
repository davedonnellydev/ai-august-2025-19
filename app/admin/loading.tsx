import { Card, Group, Skeleton, Stack } from '@mantine/core';

export default function Loading() {
  return (
    <Stack gap="md">
      <Group>
        <Skeleton height={28} width={180} />
        <Skeleton height={28} width={120} />
        <Skeleton height={28} width={90} />
      </Group>

      <Card withBorder>
        <Stack>
          <Group justify="space-between">
            <Skeleton height={20} width={160} />
            <Skeleton height={20} width={100} />
          </Group>
          {[0, 1, 2, 3].map((i) => (
            <Group key={i} justify="space-between">
              <Skeleton height={16} width={240} />
              <Skeleton height={16} width={180} />
              <Skeleton height={16} width={100} />
            </Group>
          ))}
        </Stack>
      </Card>

      <Card withBorder>
        <Stack>
          <Group>
            <Skeleton height={18} width={220} />
            <Skeleton height={18} width={160} />
            <Skeleton height={18} width={160} />
            <Skeleton height={18} width={120} />
          </Group>
          <Skeleton height={14} width="100%" />
          <Skeleton height={14} width="95%" />
          <Skeleton height={14} width="92%" />
        </Stack>
      </Card>
    </Stack>
  );
}


