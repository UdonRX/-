const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async (req, res) => {
  // リクエストURLから ?url=... を取得
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'url parameter is required' });
  }

  try {
    // Yahooニュース等のブロックを回避するために User-Agent を設定して取得
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const xmlText = await response.text();
    const feed = await parser.parseString(xmlText);

    // フロントエンドで使いやすい形に整形
    const items = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate || item.isoDate || '',
      snippet: item.contentSnippet || item.snippet || item.description || ''
    }));

    // キャッシュヘッダー設定（5分間キャッシュ）
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({ title: feed.title, items });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};