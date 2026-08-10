export default async function handler(req, res) {
  // CORSヘッダーの付与（どこからでもアクセス許可）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // プリフライトリクエスト（OPTIONS）への即座の応答
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: 'url query parameter is required' });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RSS-Proxy'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch upstream: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'application/xml';
    const data = await response.text();

    res.setHeader('Content-Type', contentType);
    return res.status(200).send(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to fetch the requested RSS feed', details: error.message });
  }
}
