// Vercel Routing Middleware — runs before any request is served, on every
// path. Redirects anyone without a valid session cookie to /login.html,
// a proper page instead of the browser's native Basic Auth popup.
//
// Needs SITE_PASSWORD set in Vercel's Environment Variables (same variable
// as before, if you'd already set it up — this reuses it, no new setup).
// See README.md "Password-protecting the site" for the full setup.

export const config = {
  matcher: '/:path*',
};

// Paths that must stay reachable even when logged out, or nobody could
// ever reach the login page (or its own assets) to log in at all.
const PUBLIC_PATHS = [
  '/login.html', '/api/login',
  '/favicon.svg', '/favicon-32.png', '/favicon-16.png', '/apple-touch-icon.png',
];

async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) === name) return trimmed.slice(eq + 1);
  }
  return null;
}

export default async function middleware(request) {
  const url = new URL(request.url);

  if (PUBLIC_PATHS.includes(url.pathname)) {
    return;
  }

  const expected = process.env.SITE_PASSWORD;
  if (!expected) {
    return; // not configured yet — fail open rather than lock everyone out silently
  }

  const expectedToken = await sha256Hex(expected + ':tripsy-auth-salt');
  const cookieToken = getCookie(request, 'tripsy_auth');

  if (cookieToken === expectedToken) {
    return; // already logged in
  }

  const loginUrl = new URL('/login.html', request.url);
  loginUrl.searchParams.set('redirect', url.pathname + (url.search || ''));
  return Response.redirect(loginUrl, 302);
}
