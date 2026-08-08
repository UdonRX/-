// 稼働率の高い Nitter 代替インスタンス一覧
const NITTER_INSTANCES = [
  'https://nitter.privacydev.net',
  'https://nitter.poast.org',
  'https://nitter.lucabased.xyz'
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  let { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // 試行するURLのリストを作成
  const targetUrls = [url];

  // URLが nitter.net または他Nitterドメインの場合、代替インスタンスのURLも候補に追加
  if (url.includes('nitter') || url.includes('/rss')) {
    const urlObj = new URL(url);
    const path = urlObj.pathname + urlObj.search;
    
    NITTER_INSTANCES.forEach(instance => {
      const fallbackUrl = `${instance}${path}`;
      if (!targetUrls.includes(fallbackUrl)) {
        targetUrls.push(fallbackUrl);
      }
    });
  }

  // 成功するまで順番にリクエストを試行
  for (const targetUrl of targetUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 各リクエスト5秒

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        redirect: 'follow'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const xmlText = await response.text();
        // 最低限XMLらしいデータが返ってきたかチェック
        if (xmlText.includes('<rss') || xmlText.includes('<feed') || xmlText.includes('<チャンネル')) {
          res.setHeader('Content-Type', 'text/xml; charset=utf-8');
          return res.status(200).send(xmlText);
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch from ${targetUrl}:`, err.message);
      // エラー時は次の候補インスタンスへ
    }
  }

  // すべてのインスタンスで失敗した場合
  return res.status(500).json({ error: 'All Nitter instances failed to respond' });
}