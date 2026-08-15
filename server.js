const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// プリセットのデフォルトRSS（ITmediaニュースなど）
const DEFAULT_RSS_URL = 'https://rss.itmedia.co.jp/rss/2.0/news_bursts.xml';

// 背景カラーのバリエーション（動画風モック用）
const BG_THEMES = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  'linear-gradient(135deg, #2b1055 0%, #7597de 100%)',
  'linear-gradient(135deg, #0f2027 0%, #203a43 100%, #2c5364 100%)',
  'linear-gradient(135deg, #3a1c71 0%, #d76d77 100%, #ffaf7b 100%)'
];

// RSS取得およびショート動画風データへの変換API
app.get('/api/generate-shorts', async (req, res) => {
  const rssUrl = req.query.url || DEFAULT_RSS_URL;

  try {
    const feed = await parser.parseURL(rssUrl);
    
    // RSSの各アイテムをショート動画用のデータ構造に変換
    const shortsData = feed.items.slice(0, 10).map((item, index) => {
      // ShortGPTなどの動画生成エンジンに渡すテキスト抽出処理のベース
      const rawTitle = item.title || '無題のニュース';
      const rawContent = item.contentSnippet || item.content || item.summary || '詳細情報はありません。';
      
      // 15秒のショート動画向けにテキストを簡潔化・構造化
      const shortScript = {
        hook: `【速報】${rawTitle}`,
        body: rawContent.length > 90 ? rawContent.substring(0, 90) + '…' : rawContent,
        cta: '元記事をチェック ↗'
      };

      return {
        id: `short-${index}`,
        title: rawTitle,
        link: item.link || '#',
        pubDate: item.pubDate ? new Date(item.pubDate).toLocaleString('ja-JP') : '',
        script: shortScript,
        background: BG_THEMES[index % BG_THEMES.length],
        // モック用動画URL（実運用時はここでShortGPT等で生成したMP4のURLを割り当て）
        videoUrl: null 
      };
    });

    res.json({
      success: true,
      feedTitle: feed.title || 'RSSショート動画',
      count: shortsData.length,
      items: shortsData
    });

  } catch (error) {
    console.error('RSS Parse Error:', error);
    res.status(500).json({
      success: false,
      message: 'RSSの取得または解析に失敗しました。URLを確認してください。',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});