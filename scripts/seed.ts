import 'dotenv/config';
import { addMonths, set } from 'date-fns';
import { and, eq } from 'drizzle-orm';
import { db, pool } from '../app/db/client';
import {
  clubs,
  contentItems,
  events,
  memberships,
  users,
} from '../app/db/schema';

async function main() {
  const adminEmail =
    process.env.SEED_ADMIN_EMAIL ?? 'davepauldonnelly@gmail.com';
  const pendingEmail =
    process.env.SEED_PENDING_EMAIL ?? 'tysondonnelly@gmail.com';

  // Upsert admin user
  const [adminUser] = await db
    .insert(users)
    .values({
      email: adminEmail,
      name: 'Admin User',
      role: 'admin',
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { role: 'admin', name: 'Admin User' },
    })
    .returning();

  // Upsert pending member
  const [pendingUser] = await db
    .insert(users)
    .values({ email: pendingEmail, name: 'Pending Member', role: 'member' })
    .onConflictDoNothing()
    .returning();

  // Create single club
  const [club] = await db
    .insert(clubs)
    .values({ name: 'AI Content Club', slug: 'ai-content-club' })
    .onConflictDoNothing()
    .returning();
  const clubId =
    club?.id ??
    (
      await db.query.clubs.findFirst({
        where: eq(clubs.slug, 'ai-content-club'),
      })
    )?.id;
  if (!clubId) throw new Error('Failed to resolve club id');

  // Admin membership active
  await db
    .insert(memberships)
    .values({ clubId, userId: adminUser.id, status: 'active' })
    .onConflictDoNothing();

  // Pending membership
  if (pendingUser) {
    await db
      .insert(memberships)
      .values({
        clubId,
        userId: pendingUser.id,
        status: 'pending',
      })
      .onConflictDoNothing();
  }

  // Create next-month event on 25th at 19:00 local
  const nextMonth = addMonths(new Date(), 1);
  const startsAt = set(nextMonth, {
    date: 25,
    hours: 19,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  const [event] = await db
    .insert(events)
    .values({
      clubId,
      title: 'AI Content Club - September Session',
      startsAt,
      venue: 'Community Hub',
      facilitatorUserId: adminUser.id,
    })
    .onConflictDoNothing()
    .returning();

  const eventId =
    event?.id ??
    (
      await db.query.events.findFirst({
        where: and(
          eq(events.clubId, clubId),
          eq(events.title, 'AI Content Club - September Session')
        ),
      })
    )?.id;
  if (!eventId) throw new Error('Failed to resolve event id');

  // Content items (up to 2)
  await db
    .insert(contentItems)
    .values([
      {
        eventId,
        type: 'book',
        title: 'Deep Work by Cal Newport',
        sourceUrl: 'https://www.calnewport.com/books/deep-work/',
        notes: 'Focus, distraction, and productivity.',
      },
      {
        eventId,
        type: 'podcast',
        title: 'Lex Fridman - Episode 409 with Geoff Hinton',
        sourceUrl: 'https://lexfridman.com/episodes/',
        notes: 'Deep learning and AGI.',
      },
    ])
    .onConflictDoNothing();

  console.log('Seed completed.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
