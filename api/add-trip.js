// Vercel serverless function — runs server-side only, never shipped to the browser.
// Needs two environment variables set in the Vercel project (Settings > Environment Variables):
//   GITHUB_TOKEN  — a fine-grained GitHub token scoped to this one repo, Contents: Read & write
//   GITHUB_REPO   — "owner/repo", e.g. "FelipeReis26/trip-planner"
// See README.md "Adding a trip from the app" for how to create the token.

const THEMES = ['brazil', 'bali', 'pink', 'sky'];

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

  const body = req.body || {};
  const name = (body.name || '').trim();
  const flag = (body.flag || '\u{1F4CD}').trim();
  const startDate = (body.startDate || '').trim();
  const endDate = (body.endDate || '').trim();
  const pitch = (body.pitch || '').trim();
  const leaveDays = parseInt(body.leaveDays, 10) || 0;
  const totalCost = (body.totalCost || '').trim();

  if (!name || !startDate || !endDate) {
    res.status(400).json({ error: 'Name, start date, and end date are required.' });
    return;
  }
  if (new Date(endDate) < new Date(startDate)) {
    res.status(400).json({ error: 'End date is before start date.' });
    return;
  }

  const [owner, repoName] = repo.split('/');

  async function gh(path, opts) {
    const r = await fetch('https://api.github.com/repos/' + owner + '/' + repoName + path, Object.assign({
      headers: Object.assign({
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
      }, (opts && opts.headers) || {})
    }, opts));
    if (!r.ok) {
      const text = await r.text();
      throw new Error('GitHub API ' + r.status + ': ' + text);
    }
    return r.json();
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function slugify(s) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '');
  }

  function formatDateRange(startISO, endISO) {
    const s = new Date(startISO + 'T00:00:00');
    const e = new Date(endISO + 'T00:00:00');
    const sStr = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const eStr = e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return sStr + ' \u2013 ' + eStr;
  }

  function buildTripPage({ name, flag, theme, dates, pitch, leaveDays, totalCost }) {
    const safeName = escapeHtml(name);
    const safePitch = escapeHtml(pitch || 'Fill in why this trip, why now.');
    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '<title>' + safeName + '</title>\n<link rel="stylesheet" href="../style.css">\n</head>\n' +
      '<body class="' + theme + '-page">\n\n' +
      '<div class="hero ' + theme + '">\n' +
      '  <span class="mark">' + flag + '</span>\n' +
      '  <div class="hero-inner">\n' +
      '    <a class="back" href="../index.html">&larr; All trips</a>\n' +
      '    <span class="flag">' + flag + '</span>\n' +
      '    <h1>' + safeName + '</h1>\n' +
      '    <div class="dates">' + dates + '</div>\n' +
      '    <p class="pitch">' + safePitch + '</p>\n' +
      '    <div class="heroes">\n' +
      '      <div><div class="num">' + leaveDays + '</div><div class="lbl">leave days</div></div>\n' +
      '      <div><div class="num">' + escapeHtml(totalCost || '\u20AC0') + '</div><div class="lbl">total, both of you</div></div>\n' +
      '    </div>\n  </div>\n</div>\n\n' +
      '<div class="page">\n\n' +
      '  <!-- Quick-added from the app with just the basics. Flesh out each\n' +
      '       accordion below the same way the other trips were built —\n' +
      '       ask Claude to fill these in with the real details, including\n' +
      '       a .leg-price line under every flight leg. -->\n\n' +
      '  <div class="acc open">\n' +
      '    <div class="acc-head" onclick="this.parentElement.classList.toggle(\'open\')">\n' +
      '      <span class="chip">&#9992;</span><span class="t">Flights</span><span class="chev">&#9662;</span>\n' +
      '    </div>\n' +
      '    <div class="acc-body"><div class="acc-body-inner">\n' +
      '      <div class="kv"><span class="k">Fill in</span><span>fill in</span></div>\n' +
      '    </div></div>\n  </div>\n\n' +
      '  <div class="acc">\n' +
      '    <div class="acc-head" onclick="this.parentElement.classList.toggle(\'open\')">\n' +
      '      <span class="chip">&#9728;</span><span class="t">Weather &amp; entry</span><span class="chev">&#9662;</span>\n' +
      '    </div>\n' +
      '    <div class="acc-body"><div class="acc-body-inner">\n' +
      '      <div class="kv"><span class="k">Fill in</span><span>fill in</span></div>\n' +
      '    </div></div>\n  </div>\n\n' +
      '  <div class="acc">\n' +
      '    <div class="acc-head" onclick="this.parentElement.classList.toggle(\'open\')">\n' +
      '      <span class="chip">&#127968;</span><span class="t">Accommodation</span><span class="chev">&#9662;</span>\n' +
      '    </div>\n' +
      '    <div class="acc-body"><div class="acc-body-inner">\n' +
      '      <div class="kv"><span class="k">Fill in</span><span>fill in</span></div>\n' +
      '      <div class="kv pop"><span class="k">Total</span><span>\u20AC0</span></div>\n' +
      '    </div></div>\n  </div>\n\n' +
      '  <div class="acc">\n' +
      '    <div class="acc-head" onclick="this.parentElement.classList.toggle(\'open\')">\n' +
      '      <span class="chip">&#8364;</span><span class="t">Cost</span><span class="chev">&#9662;</span>\n' +
      '    </div>\n' +
      '    <div class="acc-body"><div class="acc-body-inner">\n' +
      '      <div class="kv pop total-row"><span class="k">Trip total</span><span>' + escapeHtml(totalCost || '\u20AC0') + '</span></div>\n' +
      '    </div></div>\n  </div>\n\n' +
      '</div>\n\n' +
      '<div class="tripfoot"><a href="../index.html">&larr; Back to all trips</a></div>\n\n' +
      '</body>\n</html>\n';
  }

  function buildCard({ name, flag, theme, slug, dates, endISO, leaveDays, totalCost, year }) {
    const safeName = escapeHtml(name);
    const safeMeta = dates + ' &middot; ' + leaveDays + ' leave &middot; ' + escapeHtml(totalCost || '\u20AC0');
    return '    <a class="polaroid ' + theme + '" href="trips/' + slug + '.html" data-leave="' + leaveDays + '" data-year="' + year + '" data-end="' + endISO + '">\n' +
      '      <div class="tapecorner"></div>\n' +
      '      <div class="photo">' + flag + '</div><div class="cap">' + safeName + '</div><div class="meta">' + safeMeta + '</div>\n' +
      '    </a>\n';
  }

  try {
    const indexFile = await gh('/contents/index.html');
    const indexContent = Buffer.from(indexFile.content, 'base64').toString('utf-8');

    const existingCount = (indexContent.match(/class="polaroid /g) || []).length;
    const theme = THEMES[existingCount % THEMES.length];

    const year = new Date(startDate).getFullYear();
    const slug = year + '-' + slugify(name);
    const filePath = 'trips/' + slug + '.html';
    const dates = formatDateRange(startDate, endDate);

    // 1) create the new trip page
    const tripHtml = buildTripPage({ name, flag, theme, dates, pitch, leaveDays, totalCost });
    await gh('/contents/' + filePath, {
      method: 'PUT',
      body: JSON.stringify({
        message: 'Add trip: ' + name,
        content: Buffer.from(tripHtml, 'utf-8').toString('base64')
      })
    });

    // 2) insert its card into index.html, right before #trip-data's closing tag
    const marker = '  </div>\n\n  <div class="section-label">Coming up</div>';
    if (!indexContent.includes(marker)) {
      throw new Error('Could not find the trip-data insertion point in index.html — has its structure changed?');
    }
    const card = buildCard({ name, flag, theme, slug, dates, endISO: endDate, leaveDays, totalCost, year });
    const updatedIndex = indexContent.replace(marker, card + marker);

    await gh('/contents/index.html', {
      method: 'PUT',
      body: JSON.stringify({
        message: 'Add ' + name + ' card to home page',
        content: Buffer.from(updatedIndex, 'utf-8').toString('base64'),
        sha: indexFile.sha
      })
    });

    res.status(200).json({ ok: true, slug: slug, theme: theme });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
};
