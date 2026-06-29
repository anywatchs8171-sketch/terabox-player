// Vercel Serverless Function - CORS Proxy for TeradiskPlayer API
export default async function handler(req, res) {
  // Enable CORS for all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Missing url parameter' });
    }

    // Extract surl from Terabox URL
    let surl = null;
    const patterns = [
      /[?&]surl=([a-zA-Z0-9_-]+)/,
      /\/s\/([a-zA-Z0-9_-]+)/,
      /\/v\/1?([a-zA-Z0-9_-]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) { surl = m[1]; break; }
    }

    if (!surl) {
      try {
        const parsed = new URL(url);
        const parts = parsed.pathname.split('/').filter(x => x);
        const last = parts[parts.length - 1];
        if (last && last.length > 10) surl = last;
      } catch (e) {}
    }

    if (!surl) {
      return res.status(400).json({ success: false, error: 'Invalid Terabox URL' });
    }

    // Remove leading '1' if present
    const cleanSurl = surl.startsWith('1') ? surl.slice(1) : surl;
    const teraboxUrl = `https://www.1024tera.com/sharing/link?surl=${cleanSurl}`;
    const apiUrl = `https://teradiskplayer.com/api/get-video?url=${encodeURIComponent(teraboxUrl)}`;

    // Fetch from TeradiskPlayer API
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
