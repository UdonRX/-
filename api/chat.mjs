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

function formatHistory(history) {
  if (!Array.isArray(history)) return '';

  return history
    .slice(-8)
    .map(message => {
      const role = message?.role === 'assistant' ? 'AI' : 'ユーザー';
      const content = clampText(message?.content, 1500);
      return content ? `${role}: ${content}` : '';
    })
    .filter(Boolean)
    .join('\n');
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
  const question = clampText(body.question, 2000);
  const article = body.article || {};
  const summary = body.summary || {};

  if (!question) {
    return res.status(400).json({ error: '質問を入力してください' });
  }

  const rssTitle = clampText(article.title, 500);
  const rssDescription = clampText(article.description, 12000);
  const source = clampText(article.source, 200);
  const url = clampText(article.url, 3000);
  const catchcopy = clampText(summary.catchcopy, 500);
  const points = Array.isArray(summary.points)
    ? summary.points.slice(0, 4).map(point => clampText(point, 800)).filter(Boolean)
    : [];

  let articleTitle = rssTitle;
  let articleText = rssDescription;
  let contentSource = 'rss';

  if (url) {
    try {
      const extracted = await extractArticleFromUrl(url, { maxTextLength: MAX_ARTICLE_TEXT });
      if (extracted?.text) {
        articleTitle = extracted.title || rssTitle;
        articleText = extracted.text;
        contentSource = 'article';
      }
    } catch (err) {
      console.warn('[chat] article extraction fallback:', err?.message || err, url);
    }
  }

  const historyText = formatHistory(body.history);

  const input = [
    '【対象記事】',
    source ? `配信元: ${source}` : '',
    url ? `元記事URL: ${url}` : '',
    articleTitle ? `タイトル: ${articleTitle}` : '',
    articleText
      ? `${contentSource === 'article' ? 'リンク先から抽出した記事本文' : 'RSS本文'}:\n${articleText}`
      : '',
    catchcopy ? `要約キャッチコピー: ${catchcopy}` : '',
    points.length ? `要約ポイント:\n- ${points.join('\n- ')}` : '',
    historyText ? `\n【これまでの会話】\n${historyText}` : '',
    `\n【今回の質問】\n${question}`
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
          'あなたはニュース記事について質問に答える日本語アシスタントです。',
          '提供された対象記事本文と会話履歴を根拠に答えてください。',
          '記事本文だけでは断定できない場合は、そのことを明示してください。',
          '本文にない事実を、記事に書かれている事実であるかのように追加しないでください。',
          'ユーザーが求めない限り、回答は短く読みやすくしてください。',
          '箇条書きが適切な場合は2〜5項目程度にまとめてください。'
        ].join('\n'),
        input,
        max_output_tokens: 900
      })
    });

    const data = await openaiResponse.json().catch(() => ({}));

    if (!openaiResponse.ok) {
      console.error('[chat] OpenAI API error:', data?.error?.message || openaiResponse.status);
      return res.status(502).json({ error: 'AI回答の生成に失敗しました' });
    }

    const answer = extractOutputText(data);
    if (!answer) {
      return res.status(502).json({ error: 'AI回答が空でした' });
    }

    return res.status(200).json({ answer, contentSource });
  } catch (err) {
    console.error('[chat] request failed:', err);
    return res.status(500).json({ error: 'AIチャットAPIとの通信に失敗しました' });
  }
}
