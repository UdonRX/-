export default async function handler(req, res) {
  // CORSを許可
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ status: 'error', message: 'url parameter is required' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status}`);
    }

    const xmlText = await response.text();

    // 簡易的なXML解析（正規表現を使用してアイテムを抽出）
    const items = [];
    const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];

    // チャンネル全体のタイトルなどを取得
    const titleMatch = xmlText.match(/<channel>[\s\S]*?<title>(.*?)<\/title>/);
    const feedTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '';

    for (const itemStr of itemMatches) {
      const getTagContent = (tagName) => {
        const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
        const match = itemStr.match(regex);
        if (!match) return '';
        let content = match[1];
        // CDATAセクションの除去
        content = content.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
        return content.trim();
      };

      const title = getTagContent('title');
      const link = getTagContent('link');
      const pubDate = getTagContent('pubDate');
      const description = getTagContent('description');
      const author = getTagContent('dc:creator') || getTagContent('author') || feedTitle;

      items.push({
        title,
        link,
        pubDate,
        description,
        author,
        feedTitle
      });
    }

    return res.status(200).json({
      status: 'ok',
      feed: { title: feedTitle },
      items
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}