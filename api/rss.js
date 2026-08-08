export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // タイムアウト設定付きでRSSを取得（User-Agentを設定してブロックを回避）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒でタイムアウト

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/rss+xml, application/rdf+xml, application/atom+xml, application/xml, text/xml, */*'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();

    // CORSヘッダーを設定して返却
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.status(200).send(xmlText);

  } catch (error) {
    console.error('Fetch RSS Error:', error);
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
}