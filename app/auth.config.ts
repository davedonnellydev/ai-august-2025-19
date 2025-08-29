import type { NextAuthOptions } from 'next-auth';
import Google from 'next-auth/providers/google';
import { db } from '@/app/db/client';
import { clubs, memberships, users } from '@/app/db/schema';
import { and, desc, eq } from 'drizzle-orm';

const googleClientId = process.env.GOOGLE_CLIENT_ID as string;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET as string;

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  callbacks: {
    // Prevent sign-in for removed members
    async signIn({ user }) {
      try {
        if (!user?.email) return false;

        // Ensure base user exists; default role 'member'
        await db
          .insert(users)
          .values({
            email: user.email,
            name: user.name ?? (null as unknown as string),
            image: user.image ?? (null as unknown as string),
          })
          .onConflictDoNothing();

        // Ensure membership row exists (pending by default) for single club
        const club = await db.query.clubs.findFirst({
          where: eq(clubs.slug, 'ai-content-club'),
        });
        if (club) {
          const userRow = await db.query.users.findFirst({
            where: eq(users.email, user.email),
          });
          if (userRow) {
            await db
              .insert(memberships)
              .values({
                clubId: club.id,
                userId: userRow.id,
                status: 'pending',
              })
              .onConflictDoNothing();
          }
        }

        // If explicitly removed, block sign-in
        if (user?.email && club) {
          const row = await db.query.users.findFirst({
            where: eq(users.email, user.email),
          });
          if (row) {
            const m = await db.query.memberships.findFirst({
              where: and(
                eq(memberships.clubId, club.id),
                eq(memberships.userId, row.id)
              ),
              orderBy: [desc(memberships.createdAt)],
            });
            if (m?.status === 'removed') return false;
          }
        }

        return true;
      } catch (e) {
        return false;
      }
    },
    async jwt({ token, user }) {
      if (!token?.email) return token;
      // Refresh user role & membership on each call; cheap single queries
      const userRow = await db.query.users.findFirst({
        where: eq(users.email, token.email),
      });
      token.userId = userRow?.id;
      token.role = userRow?.role ?? 'member';
      const club = await db.query.clubs.findFirst({
        where: eq(clubs.slug, 'ai-content-club'),
      });
      if (club && userRow) {
        const m = await db.query.memberships.findFirst({
          where: and(
            eq(memberships.clubId, club.id),
            eq(memberships.userId, userRow.id)
          ),
          orderBy: [desc(memberships.createdAt)],
        });
        token.membershipStatus = m?.status ?? 'pending';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId as string | undefined;
        (session.user as any).role = (token.role as string) ?? 'member';
        (session.user as any).membershipStatus =
          (token.membershipStatus as string) ?? 'pending';
      }
      return session;
    },
  },
};

declare module 'next-auth' {
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: 'member' | 'admin';
      membershipStatus?: 'pending' | 'active' | 'removed';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    role?: 'member' | 'admin';
    membershipStatus?: 'pending' | 'active' | 'removed';
  }
}
