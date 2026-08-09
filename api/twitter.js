export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ status: 'error', message: 'url parameter is required' });
  }

  try {
    // ブラウザそっくりのヘッダーを付与して弾かれにくくする
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    const xmlText = await response.text();

    if (!response.ok) {
      return res.status(500).json({ 
        status: 'error', 
        message: `External server returned status ${response.status}`,
        bodySnippet: xmlText.slice(0, 200)
      });
    }

    const items = [];
    const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];

    const titleMatch = xmlText.match(/<channel>[\s\S]*?<title>(.*?)<\/title>/);
    let feedTitle = '';
    if (titleMatch && titleMatch[1]) {
      feedTitle = titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
    }

    for (const itemStr of itemMatches) {
      const getTagContent = (tagName) => {
        const regex = new RegExp(`<(${tagName})[^>]*>([\\s\\S]*?)<\\/\\1>`, 'i');
        const match = itemStr.match(regex);
        if (!match) return '';
        let content = match[2];
        content = content.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
        return content.trim();
      };

      items.push({
        title: getTagContent('title'),
        link: getTagContent('link'),
        pubDate: getTagContent('pubDate'),
        description: getTagContent('description'),
        author: getTagContent('dc:creator') || getTagContent('author') || feedTitle,
        feedTitle
      });
    }

    return res.status(200).json({
      status: 'ok',
      feed: { title: feedTitle },
      items
    });

  } catch (error) {
    console.error('API Catch Error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: error.message,
      name: error.name
    });
  }
}
