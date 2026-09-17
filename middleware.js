// Vercel Routing Middleware — runs before any request is served, on every
// path. Gates the whole site behind a single shared password using HTTP
// Basic Auth (the browser's own native login prompt, not a page you could
// skip past by viewing source).
//
// Needs one environment variable set in the Vercel project (Settings >
// Environment Variables): SITE_PASSWORD — the shared password.
// See README.md "Password-protecting the site" for setup steps.

export const config = {
  matcher: '/:path*',
};

export default function middleware(request) {
  const expected = process.env.SITE_PASSWORD;

  // fail safe: if the password isn't configured yet, don't lock everyone
  // out silently — let requests through so the site still works while
  // setup finishes, but this is a real gap, so set SITE_PASSWORD promptly.
  if (!expected) {
    return;
  }

  const auth = request.headers.get('authorization');
  if (auth) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic' && encoded) {
      let decoded = '';
      try {
        decoded = atob(encoded);
      } catch (e) {
        decoded = '';
      }
      const password = decoded.slice(decoded.indexOf(':') + 1);
      if (password === expected) {
        return; // correct password — let the request through
      }
    }
  }

  return new Response('Password required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Tripsy"' },
  });
}
