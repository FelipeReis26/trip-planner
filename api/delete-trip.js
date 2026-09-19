// Vercel serverless function — deletes trips/{slug}.html and removes its
// card from index.html, committing both changes straight to the repo.
// Mirrors api/add-trip.js. Needs the same GITHUB_TOKEN / GITHUB_REPO env vars.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    res.status(500).json({ error: 'Server is missing GITHUB_TOKEN or GITHUB_REPO. See README.md.' });
    return;
  }

  const slug = ((req.body || {}).slug || '').trim();
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    res.status(400).json({ error: 'Missing or invalid trip slug.' });
    return;
  }

  const [owner, repoName] = repo.split('/');
  const filePath = 'trips/' + slug + '.html';

  async function gh(path, opts) {
    const r = await fetch('https://api.github.com/repos/' + owner + '/' + repoName + path, Object.assign({
      headers: Object.assign({
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      }, (opts && opts.headers) || {}),
    }, opts));
    if (!r.ok) {
      const text = await r.text();
      throw new Error('GitHub API ' + r.status + ': ' + text);
    }
    return r.json();
  }

  try {
    // 1) delete the trip page itself (needs its current sha)
    let tripFile;
    try {
      tripFile = await gh('/contents/' + filePath);
    } catch (e) {
      res.status(404).json({ error: "Couldn't find " + filePath + " — has it already been deleted?" });
      return;
    }
    await gh('/contents/' + filePath, {
      method: 'DELETE',
      body: JSON.stringify({
        message: 'Delete trip: ' + slug,
        sha: tripFile.sha,
      }),
    });

    // 2) remove its entry from trips.json — index.html itself is never touched
    const tripsFile = await gh('/contents/trips.json');
    const trips = JSON.parse(Buffer.from(tripsFile.content, 'base64').toString('utf-8'));
    const filtered = trips.filter((t) => t.slug !== slug);

    if (filtered.length === trips.length) {
      // page deleted fine, but no matching entry found — not fatal, just tell the caller
      res.status(200).json({ ok: true, slug: slug, entryRemoved: false });
      return;
    }

    await gh('/contents/trips.json', {
      method: 'PUT',
      body: JSON.stringify({
        message: 'Remove ' + slug + ' from trips.json',
        content: Buffer.from(JSON.stringify(filtered, null, 2) + '\n', 'utf-8').toString('base64'),
        sha: tripsFile.sha,
      }),
    });

    res.status(200).json({ ok: true, slug: slug, entryRemoved: true });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
};
