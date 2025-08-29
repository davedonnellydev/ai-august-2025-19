import { relations } from 'drizzle-orm';
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['member', 'admin']);
export const membershipStatusEnum = pgEnum('membership_status', [
  'pending',
  'active',
  'removed',
]);
export const contentTypeEnum = pgEnum('content_type', [
  'book',
  'podcast',
  'film',
  'other',
]);
export const rsvpStatusEnum = pgEnum('rsvp_status', [
  'going',
  'maybe',
  'not_going',
]);

// Tables
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 120 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    image: text('image'),
    role: userRoleEnum('role').notNull().default('member'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('users_role_idx').on(table.role)]
);

export const clubs = pgTable('clubs', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clubId: uuid('club_id')
      .notNull()
      .references(() => clubs.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: membershipStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('memberships_unique_user_per_club').on(
      table.clubId,
      table.userId
    ),
    index('memberships_status_idx').on(table.status),
  ]
);

export const events = pgTable(
  'events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clubId: uuid('club_id')
      .notNull()
      .references(() => clubs.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 240 }).notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    venue: varchar('venue', { length: 240 }).notNull(),
    facilitatorUserId: uuid('facilitator_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('events_club_idx').on(table.clubId),
    index('events_starts_at_idx').on(table.startsAt),
  ]
);

export const contentItems = pgTable(
  'content_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    type: contentTypeEnum('type').notNull(),
    title: varchar('title', { length: 240 }).notNull(),
    sourceUrl: text('source_url'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('content_items_event_idx').on(table.eventId),
    index('content_items_type_idx').on(table.type),
  ]
);

export const aiOutputs = pgTable(
  'ai_outputs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    contentItemId: uuid('content_item_id')
      .notNull()
      .references(() => contentItems.id, { onDelete: 'cascade' }),
    shortSummary: text('short_summary').notNull(),
    longSummary: text('long_summary').notNull(),
    questionsJson: text('questions_json').notNull(),
    activitiesJson: text('activities_json').notNull(),
    model: varchar('model', { length: 120 }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('ai_outputs_content_item_unique').on(table.contentItemId),
  ]
);

export const rsvps = pgTable(
  'rsvps',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: rsvpStatusEnum('status').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('rsvps_unique_user_per_event').on(table.eventId, table.userId),
    index('rsvps_status_idx').on(table.status),
  ]
);

// Relations (optional, helpful for type inference in queries)
export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  rsvps: many(rsvps),
}));

export const clubsRelations = relations(clubs, ({ many }) => ({
  memberships: many(memberships),
  events: many(events),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
  club: one(clubs, { fields: [memberships.clubId], references: [clubs.id] }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  club: one(clubs, { fields: [events.clubId], references: [clubs.id] }),
  contentItems: many(contentItems),
  rsvps: many(rsvps),
}));

export const contentItemsRelations = relations(contentItems, ({ one }) => ({
  event: one(events, {
    fields: [contentItems.eventId],
    references: [events.id],
  }),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  event: one(events, { fields: [rsvps.eventId], references: [events.id] }),
  user: one(users, { fields: [rsvps.userId], references: [users.id] }),
}));

// Useful types
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type SelectEvent = typeof events.$inferSelect;
