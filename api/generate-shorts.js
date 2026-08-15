// --- ShortGPTなどのショート動画用データ生成スクリプト (generate-shorts.js) ---

const fs = require('fs');
const path = require('path');

// 設定：読み込む元データファイルや出力先の設定
const OUTPUT_DIR = path.join(__dirname, 'output_shorts');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'shorts_payload.json');

/**
 * ニュースや知識のRSS/APIデータから、ShortGPTなどの縦型動画生成ツールに
 * 投入するためのJSONペイロード（タイトル、本文、背景、音声用テキストなど）を構築する関数
 * @param {Array} rawItems RSSなどから取得した記事オブジェクトの配列
 * @returns {Array} ショート動画用データ形式の配列
 */
function generateShortsData(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    console.warn('変換対象のデータが存在しません。');
    return [];
  }

  return rawItems.map((item, index) => {
    // 1記事あたりショート動画1本分の構成要素を作成
    const title = item.title || '無題のトピック';
    
    // 本文やディスクリプションからHTMLタグを除去してプレーンテキスト化
    const rawDescription = item.description || item.content || title;
    const cleanDescription = rawDescription
      .replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '') // HTMLタグ削除
      .replace(/\s+/g, ' ')
      .trim();

    // ショート動画の読み上げ用・字幕用に文字数を適度に切り詰める（例: 最大100文字程度）
    const narrationText = cleanDescription.length > 100 
      ? cleanDescription.substring(0, 100) + '...' 
      : cleanDescription;

    return {
      id: `short_${index + 1}_${Date.now()}`,
      sceneNumber: index + 1,
      title: title,
      narration: narrationText,
      sourceUrl: item.link || '',
      pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      // ShortGPTや動画編集自動化スクリプト側で利用するメタデータ
      metadata: {
        aspectRatio: '9:16',
        targetPlatform: 'YouTube Shorts / TikTok / Instagram Reels',
        visualPrompt: `Background video showing a modern concept related to: ${title}`,
        backgroundMusic: 'lo-fi upbeat'
      }
    };
  });
}

/**
 * メイン処理実行関数
 * @param {Array} sampleData テスト用または外部から渡されたデータ
 */
function runShortsPayloadGenerator(sampleData = []) {
  console.log('ShortGPT用ショート動画データの生成を開始します...');

  // 出力ディレクトリが存在しない場合は作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const shortsPayload = generateShortsData(sampleData);

  // JSONファイルとして書き出し
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(shortsPayload, null, 2), 'utf-8');
  
  console.log(`データの生成が完了しました。出力先: ${OUTPUT_FILE}`);
  console.log(`生成されたショート動画データ数: ${shortsPayload.length}件`);

  return shortsPayload;
}

// 直接スクリプトとして実行された場合
if (require.main === module) {
  // サンプルデータを用いた実行テスト
  const dummyData = [
    {
      title: 'JavaScriptの最新トレンドと今後の展望',
      description: 'JavaScriptエコシステムは日々進化しています。フレームワークの選択やパフォーマンス向上の手法について解説します。',
      link: 'https://example.com/js-trend',
      pubDate: new Date()
    },
    {
      title: '気象庁APIを活用した天気予報アプリの作り方',
      description: '日本国内の正確な気象データを取得し、ブラウザ上で美しくレンダリングする方法を分かりやすく紹介します。',
      link: 'https://example.com/jma-weather',
      pubDate: new Date()
    }
  ];

  runShortsPayloadGenerator(dummyData);
}

module.exports = {
  generateShortsData,
  runShortsPayloadGenerator
};