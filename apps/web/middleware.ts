import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ token }) {
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/incidents/:path*',
    '/api/monitors/:path*',
    '/api/schedules/:path*',
    '/api/alert-channels/:path*',
    '/api/workspaces/:path*',
    '/api/stripe/checkout',
    '/api/stripe/portal',
  ],
};
