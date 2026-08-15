const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// ===== 定数 =====

const BG_THEMES = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  'linear-gradient(135deg, #2b1055 0%, #7597de 100%)',
  'linear-gradient(135deg, #0f2027 0%, #203a43 100%, #2c5364 100%)',
  'linear-gradient(135deg, #3a1c71 0%, #d76d77 100%, #ffaf7b 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
];

const ICON_URLS = [
  '📰', '📚', '🚀', '💡', '🌟', '📢', '🎯', '✨'
];

// ===== キャッシュ =====

const videoCache = new Map();

// ===== ユーティリティ関数 =====

/**
 * テキストを15秒の音読時間に最適な長さに要約
 */
function optimizeTextForVoiceOver(text, maxChars = 60) {
  const sentences = text.split(/[。！？]/);
  let result = '';
  
  for (const sentence of sentences) {
    if ((result + sentence).length > maxChars) break;
    result += sentence + '。';
  }
  
  return result.trim() || text.substring(0, maxChars);
}

/**
 * SVG ベースのプレースホルダー画像を生成
 */
function generatePlaceholderSVG(title, bgGradient) {
  const svgContent = `
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#grad)"/>
      <text x="540" y="960" font-size="72" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">
        ${title.substring(0, 20)}
      </text>
      <text x="540" y="1050" font-size="32" fill="rgba(255,255,255,0.7)" text-anchor="middle" font-family="Arial">
        ニュース
      </text>
    </svg>
  `;
  
  return Buffer.from(svgContent).toString('base64');
}

/**
 * キャッシュキーを生成
 */
function generateCacheKey(title, content) {
  return `${Buffer.from(title).toString('base64')}_${Buffer.from(content).toString('base64')}`.substring(0, 80);
}

// ===== API エンドポイント =====

/**
 * GET /api/rss
 * RSS フィード取得用（CORS プロキシ）
 */
app.get('/api/rss', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'url パラメータが必須です'
    });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsReader/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    res.set('Content-Type', 'application/xml');
    res.send(xmlText);
  } catch (error) {
    console.error('RSS fetch error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/generate-video
 * RSS アイテムをショート動画データに変換
 */
app.post('/api/generate-video', async (req, res) => {
  const { title, content, source = 'news', feedName } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      error: 'title と content は必須です'
    });
  }

  try {
    const cacheKey = generateCacheKey(title, content);
    if (videoCache.has(cacheKey)) {
      console.log(`✓ Cache hit: ${cacheKey.substring(0, 20)}...`);
      return res.json({
        success: true,
        videoData: videoCache.get(cacheKey),
        cached: true
      });
    }

    const voiceOverText = optimizeTextForVoiceOver(content);
    const bgGradient = BG_THEMES[Math.floor(Math.random() * BG_THEMES.length)];
    const icon = ICON_URLS[Math.floor(Math.random() * ICON_URLS.length)];
    const thumbnailBase64 = generatePlaceholderSVG(title, bgGradient);

    const videoData = {
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.substring(0, 100),
      content: content.substring(0, 200),
      voiceOverText: voiceOverText,
      thumbnailBase64: thumbnailBase64,
      duration: 15,
      background: bgGradient,
      icon: icon,
      source: source,
      feedName: feedName || 'Unknown',
      timestamp: new Date().toISOString()
    };

    videoCache.set(cacheKey, videoData);

    res.json({
      success: true,
      videoData: videoData,
      cached: false
    });

  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/generate-shorts-batch
 * 複数の RSS アイテムをバッチ処理
 */
app.post('/api/generate-shorts-batch', async (req, res) => {
  const { items = [], source = 'news' } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'items 配列は必須で、最低1つの要素が必要です'
    });
  }

  try {
    const videoDataList = items.map((item, idx) => {
      const { title, content, feedName } = item;

      if (!title || !content) {
        return null;
      }

      const cacheKey = generateCacheKey(title, content);
      if (videoCache.has(cacheKey)) {
        return videoCache.get(cacheKey);
      }

      const voiceOverText = optimizeTextForVoiceOver(content);
      const bgGradient = BG_THEMES[idx % BG_THEMES.length];
      const icon = ICON_URLS[idx % ICON_URLS.length];
      const thumbnailBase64 = generatePlaceholderSVG(title, bgGradient);

      const videoData = {
        id: `video_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`,
        title: title.substring(0, 100),
        content: content.substring(0, 200),
        voiceOverText: voiceOverText,
        thumbnailBase64: thumbnailBase64,
        duration: 15,
        background: bgGradient,
        icon: icon,
        source: source,
        feedName: feedName || 'Unknown',
        timestamp: new Date().toISOString()
      };

      videoCache.set(cacheKey, videoData);
      return videoData;
    }).filter(v => v !== null);

    res.json({
      success: true,
      count: videoDataList.length,
      videoDataList: videoDataList
    });

  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/cache-stats
 * キャッシュ統計（デバッグ用）
 */
app.get('/api/cache-stats', (req, res) => {
  res.json({
    cacheSize: videoCache.size
  });
});

// ===== エラーハンドリング =====

app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// ===== サーバー起動 =====

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available`);
});
