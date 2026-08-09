export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ status: 'error', message: 'url parameter is required' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Target server responded with status: ${response.status}`);
    }

    const xmlText = await response.text();

    const items = [];
    const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];

    const titleMatch = xmlText.match(/<channel>[\s\S]*?<title>(.*?)<\/title>/);
    let feedTitle = '';
    if (titleMatch && titleMatch[1]) {
      feedTitle = titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
    }

    for (const itemStr of itemMatches) {
      const getTagContent = (tagName) => {
        // 名前空間付きタグ（dc:creator等）にも対応
        const regex = new RegExp(`<(${tagName})[^>]*>([\\s\\S]*?)<\\/\\1>`, 'i');
        const match = itemStr.match(regex);
        if (!match) return '';
        let content = match[2];
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
    console.error('API Error Details:', error);
    // 500エラーの際、クライアントに詳細なエラーメッセージを返す
    return res.status(500).json({ 
      status: 'error', 
      message: error.message,
      stack: error.stack 
    });
  }
}
