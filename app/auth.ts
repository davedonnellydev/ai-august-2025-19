import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth.config';

export async function auth() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

