import { extractArticleFromUrl } from '../lib/article-reader.mjs';
import { generateGemini } from '../lib/gemini.mjs';

const MAX_ARTICLE_TEXT = 60000;

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (_) { return {}; }
  }
  return req.body;
}

function clampText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function stripCodeFence(text) {
  return String(text || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = getBody(req);
  const article = body.article || body;
  const rssTitle = clampText(article.title, 500);
  const rssDescription = clampText(article.description, 12000);
  const source = clampText(article.source, 200);
  const url = clampText(article.url || article.link, 3000);

  if (!rssTitle && !rssDescription && !url) {
    return res.status(400).json({ error: '要約する記事データがありません' });
  }

  let articleTitle = rssTitle;
  let articleText = rssDescription;
  let contentSource = 'rss';
  let articleMeta = null;
  let extractionError = '';

  if (url) {
    try {
      articleMeta = await extractArticleFromUrl(url, { maxTextLength: MAX_ARTICLE_TEXT });
      if (articleMeta?.text) {
        articleTitle = articleMeta.title || rssTitle;
        articleText = articleMeta.text;
        contentSource = 'article';
      }
    } catch (err) {
      extractionError = err?.message || '記事全文を取得できませんでした';
      console.warn('[summary] article extraction fallback:', extractionError, url);
    }
  }

  if (!articleText) {
    return res.status(422).json({
      error: '記事本文を取得できませんでした',
      detail: extractionError || undefined
    });
  }

  const prompt = [
    source ? `配信元: ${source}` : '',
    url ? `元記事URL: ${url}` : '',
    articleTitle ? `タイトル: ${articleTitle}` : '',
    contentSource === 'article'
      ? `【リンク先から抽出した記事本文】\n${articleText}`
      : `【RSS本文（リンク先本文を取得できなかったためフォールバック）】\n${articleText}`
  ].filter(Boolean).join('\n\n');

  const systemInstruction = [
    'あなたは日本語ニュースの要約アシスタントです。',
    '提供された記事本文だけを根拠に要約してください。',
    '本文にない事実を追加・推測しないでください。',
    '広告、ナビゲーション、関連記事、定型フッターらしき内容は重要ポイントに含めないでください。',
    'catchcopyは内容を一瞬で理解できる自然な日本語で、原則40文字以内。',
    'pointsは重要度の高い順に3〜4項目。各項目は簡潔な1文にしてください。'
  ].join('\n');

  const responseSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      catchcopy: {
        type: 'string',
        description: '記事内容を一瞬で理解できる40文字程度までの日本語キャッチコピー'
      },
      points: {
        type: 'array',
        minItems: 3,
        maxItems: 4,
        items: { type: 'string' },
        description: '重要度の高い順の重要ポイント'
      }
    },
    required: ['catchcopy', 'points']
  };

  try {
    const result = await generateGemini({
      prompt,
      systemInstruction,
      maxOutputTokens: 700,
      responseSchema
    });

    let summary;
    try {
      summary = JSON.parse(stripCodeFence(result.text));
    } catch (err) {
      console.error('[summary] Gemini JSON parse error:', result.text);
      return res.status(502).json({
        error: 'Gemini要約の形式が不正でした',
        detail: 'もう一度要約ボタンを押してください。'
      });
    }

    return res.status(200).json({
      catchcopy: clampText(summary.catchcopy, 300),
      points: Array.isArray(summary.points)
        ? summary.points.slice(0, 4).map(point => clampText(point, 500)).filter(Boolean)
        : [],
      provider: 'gemini',
      model: result.model,
      contentSource,
      extractedLength: articleText.length,
      articleTitle: articleTitle || rssTitle,
      articleMeta: articleMeta ? {
        siteName: articleMeta.siteName || '',
        byline: articleMeta.byline || '',
        publishedTime: articleMeta.publishedTime || '',
        truncated: Boolean(articleMeta.truncated),
        originalLength: articleMeta.originalLength || articleText.length,
        finalUrl: articleMeta.url || url
      } : null,
      fallbackReason: contentSource === 'rss'
        ? extractionError || 'リンク先本文を取得できませんでした'
        : ''
    });
  } catch (err) {
    console.error('[summary] Gemini request failed:', err);
    const payload = err?.publicError || {
      error: 'Gemini要約APIとの通信に失敗しました',
      detail: err?.message || 'VercelのFunctionsログを確認してください。'
    };
    return res.status(err?.statusCode || 500).json(payload);
  }
}
