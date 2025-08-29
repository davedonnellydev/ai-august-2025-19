import { db } from '@/app/db/client';
import { events } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/app/auth';

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || (user as any).role !== 'admin') {
    throw new Error('Forbidden');
  }
  return user;
}

export async function requireAdminOrFacilitator(eventId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  const role = (user as any).role as 'member' | 'admin' | undefined;
  if (role === 'admin') {
    return user;
  }

  const evt = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!evt) {
    throw new Error('Event not found');
  }
  if (evt.facilitatorUserId === (user as any).id) {
    return user;
  }
  throw new Error('Forbidden');
}
