import { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { db } from '@/lib/db';
import { users, workspaces, workspaceMembers } from '@oncallkit/db';
import { eq } from '@oncallkit/db';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: 'smtp.resend.com',
        port: 465,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: 'noreply@oncallkit.io',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.email) return false;

      try {
        // Upsert user in DB
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);

        let dbUserId: string;

        if (existing.length === 0) {
          const [newUser] = await db
            .insert(users)
            .values({
              email: user.email,
              name: user.name ?? profile?.name ?? null,
              image: user.image ?? null,
            })
            .returning();
          dbUserId = newUser.id;

          // Auto-create default workspace for new user
          const slug = slugify(user.name ?? user.email.split('@')[0]);
          const uniqueSlug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;

          const [workspace] = await db
            .insert(workspaces)
            .values({
              name: user.name ? `${user.name}'s Team` : 'My Team',
              slug: uniqueSlug,
            })
            .returning();

          await db.insert(workspaceMembers).values({
            workspaceId: workspace.id,
            userId: dbUserId,
            role: 'owner',
          });

          // Store workspace in user object for JWT callback
          (user as { workspaceId?: string }).workspaceId = workspace.id;
          (user as { workspaceSlug?: string }).workspaceSlug = workspace.slug;
        } else {
          dbUserId = existing[0].id;
          // Load existing workspace
          const membership = await db
            .select({ workspaceId: workspaceMembers.workspaceId, workspace: workspaces })
            .from(workspaceMembers)
            .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
            .where(eq(workspaceMembers.userId, dbUserId))
            .limit(1);

          if (membership.length > 0) {
            (user as { workspaceId?: string }).workspaceId = membership[0].workspaceId;
            (user as { workspaceSlug?: string }).workspaceSlug = membership[0].workspace.slug;
          }
        }

        (user as { dbId?: string }).dbId = dbUserId;
      } catch (err) {
        console.error('SignIn DB error:', err);
        return false;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { dbId?: string }).dbId ?? user.id;
        token.workspaceId = (user as { workspaceId?: string }).workspaceId;
        token.workspaceSlug = (user as { workspaceSlug?: string }).workspaceSlug;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { workspaceId?: string }).workspaceId = token.workspaceId as string;
        (session.user as { workspaceSlug?: string }).workspaceSlug = token.workspaceSlug as string;
      }
      return session;
    },
  },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
}
