import { Card, Group, Stack, Text, Title } from '@mantine/core';
import { auth } from '@/app/auth';
import AuthButton from '@/app/components/AuthButton';

export default async function WaitingPage() {
  const session = await auth();
  return (
    <Stack align="center" mt={40}>
      <Card withBorder shadow="sm" maw={720} w="100%">
        <Stack>
          <Title order={2}>Thanks for joining</Title>
          <Text>
            Your account is pending approval. An admin will activate your
            membership soon.
          </Text>
          {session?.user?.email && (
            <Text c="dimmed">Signed in as {session.user.email}</Text>
          )}
          <Group justify="space-between" mt="sm">
            <Text c="dimmed">You will be able to access events once approved.</Text>
            <AuthButton />
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
