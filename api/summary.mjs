import { extractArticleFromUrl } from '../lib/article-reader.mjs';

const OPENAI_URL = 'https://api.openai.com/v1/responses';
const MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';
const MAX_ARTICLE_TEXT = 60000;

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (_) {
      return {};
    }
  }
  return req.body;
}

function clampText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function extractOutputText(data) {
  if (!data || !Array.isArray(data.output)) return '';

  return data.output
    .flatMap(item => Array.isArray(item.content) ? item.content : [])
    .filter(part => part && part.type === 'output_text' && typeof part.text === 'string')
    .map(part => part.text)
    .join('\n')
    .trim();
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY が設定されていません' });
  }

  const body = getBody(req);
  const rssTitle = clampText(body.title, 500);
  const rssDescription = clampText(body.description, 12000);
  const source = clampText(body.source, 200);
  const url = clampText(body.url, 3000);

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

  const inputText = [
    source ? `配信元: ${source}` : '',
    url ? `元記事URL: ${url}` : '',
    articleTitle ? `タイトル: ${articleTitle}` : '',
    contentSource === 'article'
      ? `【リンク先から抽出した記事本文】\n${articleText}`
      : `【RSS本文（リンク先本文を取得できなかったためフォールバック）】\n${articleText}`
  ].filter(Boolean).join('\n\n');

  try {
    const openaiResponse = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        store: false,
        instructions: [
          'あなたは日本語ニュースの要約アシスタントです。',
          '提供された記事本文だけを根拠に要約してください。',
          '本文にない事実を追加・推測しないでください。',
          '広告、ナビゲーション、関連記事、定型フッターらしき内容は重要ポイントに含めないでください。',
          'catchcopyは内容を一瞬で理解できる自然な日本語で、原則40文字以内。',
          'pointsは重要度の高い順に3〜4項目。各項目は簡潔な1文にしてください。'
        ].join('\n'),
        input: inputText,
        max_output_tokens: 600,
        text: {
          format: {
            type: 'json_schema',
            name: 'news_article_summary',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                catchcopy: { type: 'string' },
                points: {
                  type: 'array',
                  minItems: 3,
                  maxItems: 4,
                  items: { type: 'string' }
                }
              },
              required: ['catchcopy', 'points']
            }
          }
        }
      })
    });

    const data = await openaiResponse.json().catch(() => ({}));

    if (!openaiResponse.ok) {
      console.error('[summary] OpenAI API error:', data?.error?.message || openaiResponse.status);
      return res.status(502).json({ error: 'AI要約の生成に失敗しました' });
    }

    const outputText = extractOutputText(data);
    if (!outputText) {
      return res.status(502).json({ error: 'AI要約が空でした' });
    }

    let summary;
    try {
      summary = JSON.parse(outputText);
    } catch (err) {
      console.error('[summary] JSON parse error:', err);
      return res.status(502).json({ error: 'AI要約の形式が不正でした' });
    }

    return res.status(200).json({
      catchcopy: clampText(summary.catchcopy, 300),
      points: Array.isArray(summary.points)
        ? summary.points.slice(0, 4).map(point => clampText(point, 500)).filter(Boolean)
        : [],
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
      fallbackReason: contentSource === 'rss' ? extractionError || 'リンク先本文を取得できませんでした' : ''
    });
  } catch (err) {
    console.error('[summary] request failed:', err);
    return res.status(500).json({ error: 'AI要約APIとの通信に失敗しました' });
  }
}
