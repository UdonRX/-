export default async function handler(req, res) {
  // CORSヘッダー
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000); // 9秒タイムアウト

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
      },
      redirect: 'follow'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Fetch failed with status: ${response.status} for URL: ${url}`);
      return res.status(response.status).json({ 
        error: `Target server responded with status ${response.status}` 
      });
    }

    const xmlText = await response.text();

    // 10分間キャッシュを効かせることでYouTubeへのリクエスト頻度を激減させる
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    return res.status(200).send(xmlText);

  } catch (error) {
    console.error('Fetch RSS Error:', error.message);
    
    return res.status(500).json({ 
      error: 'Failed to fetch RSS feed', 
      details: error.message 
    });
  }
}
