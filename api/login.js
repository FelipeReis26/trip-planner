// Vercel serverless function — checks the submitted password against
// SITE_PASSWORD and, if correct, sets the session cookie middleware.js
// checks on every other request. The cookie holds a hash of the password,
// never the password itself.

const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const expected = process.env.SITE_PASSWORD;
  if (!expected) {
    res.status(500).json({ error: 'SITE_PASSWORD is not set up yet. See README.md.' });
    return;
  }

  const password = (req.body || {}).password;
  if (password !== expected) {
    res.status(401).json({ error: 'Wrong password.' });
    return;
  }

  const token = crypto.createHash('sha256').update(expected + ':tripsy-auth-salt').digest('hex');
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  res.setHeader('Set-Cookie', `tripsy_auth=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`);
  res.status(200).json({ ok: true });
};
