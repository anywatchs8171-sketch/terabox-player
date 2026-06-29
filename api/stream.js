export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({success:false,error:'Missing URL'});
    let surl = null;
    const patterns = [/[?&]surl=([a-zA-Z0-9_-]+)/, /\/s\/([a-zA-Z0-9_-]+)/, /\/v\/1?([a-zA-Z0-9_-]+)/];
    for (const p of patterns) { const m = url.match(p); if (m) { surl = m[1]; break; } }
    if (!surl) { try { const parsed = new URL(url); const parts = parsed.pathname.split('/').filter(x => x); const last = parts[parts.length - 1]; if (last && last.length > 10) surl = last; } catch (e) {} }
    if (!surl) return res.status(400).json({success:false,error:'Invalid URL'});
    const cleanSurl = surl.startsWith('1') ? surl.slice(1) : surl;
    const teraboxUrl = `https://www.1024tera.com/sharing/link?surl=${cleanSurl}`;
    const apiUrl = `https://teradiskplayer.com/api/get-video?url=${encodeURIComponent(teraboxUrl)}`;
    const response = await fetch(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({success:false,error:error.message});
  }
}
