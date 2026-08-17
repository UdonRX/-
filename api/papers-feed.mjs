import jsdomPackage from 'jsdom';
import { rssXml } from '../lib/rss-merge.mjs';

const { JSDOM } = jsdomPackage;

// 家電製品に関する日本語検索語。
// J-STAGE WebAPI の text 検索は論文本文等を対象に日本語で検索できる。
const SEARCH_TERMS = [
  '炊飯器',
  '炊飯ジャー',
  '電気ケトル',
  '電気ポット',
  '電気湯沸かし',
  '真空断熱ボトル',
  '真空断熱容器',
  '真空断熱',
  '魔法瓶'
];

const JSTAGE_ENDPOINT = 'https://api.jstage.jst.go.jp/searchapi/do';
const TTL = 15 * 60 * 1000;
const PER_TERM = 25;
const MAX_ITEMS = 100;

let cache = { at: 0, xml: '' };

function nodeText(node, selector) {
  return node?.querySelector(selector)?.textContent?.trim() || '';
}

function firstText(node, selectors) {
  for (const selector of selectors) {
    const value = nodeText(node, selector);
    if (value) return value;
  }
  return '';
}

function safeDate(value, fallbackYear = '') {
  const d = new Date(value || '');
  if (Number.isFinite(d.getTime())) return d;

  const year = String(fallbackYear || '').match(/\d{4}/)?.[0];
  if (year) return new Date(`${year}-01-01T00:00:00+09:00`);
  return new Date(0);
}

function normalizeHttps(value) {
  return String(value || '').replace(/^http:\/\//i, 'https://').trim();
}

function parseEntry(entry) {
  const title = firstText(entry, [
    'article_title > ja',
    'article_title > en',
    'title'
  ]) || '無題';

  const link = normalizeHttps(firstText(entry, [
    'article_link > ja',
    'article_link > en'
  ]) || entry.querySelector('link')?.getAttribute('href') || nodeText(entry, 'id'));

  const authorsJa = Array.from(entry.querySelectorAll('author > ja > name'))
    .map(el => el.textContent?.trim())
    .filter(Boolean);
  const authorsEn = Array.from(entry.querySelectorAll('author > en > name'))
    .map(el => el.textContent?.trim())
    .filter(Boolean);
  const authors = (authorsJa.length ? authorsJa : authorsEn).slice(0, 8).join(', ');

  const journal = firstText(entry, [
    'material_title > ja',
    'material_title > en'
  ]);
  const doi = firstText(entry, ['prism\\:doi', 'doi']);
  const pubyear = nodeText(entry, 'pubyear');
  const updated = nodeText(entry, 'updated');
  const pubDate = safeDate(updated, pubyear);

  const details = [
    journal && `掲載誌: ${journal}`,
    authors && `著者: ${authors}`,
    doi && `DOI: ${doi}`,
    '情報提供元: J-STAGE'
  ].filter(Boolean).join('\n');

  return {
    title,
    link,
    pubDate,
    author: authors || journal || 'J-STAGE',
    sourceName: 'J-STAGE',
    description: details || title,
    doi
  };
}

function parseJStageXml(xml, term) {
  const dom = new JSDOM(xml, { contentType: 'text/xml' });
  const doc = dom.window.document;
  if (doc.querySelector('parsererror')) {
    throw new Error(`J-STAGE XML解析エラー (${term})`);
  }

  const status = nodeText(doc, 'result > status');
  const message = nodeText(doc, 'result > message');

  // J-STAGEは0件でもHTTP 200 + ERR_001を返す。
  if (status === 'ERR_001') return [];
  if (status && status !== '0' && !status.startsWith('WARN_')) {
    throw new Error(`J-STAGE ${status}${message ? `: ${message}` : ''}`);
  }

  return Array.from(doc.querySelectorAll('entry'))
    .map(parseEntry)
    .filter(item => item.link && item.title);
}

async function searchJStage(term) {
  const url = new URL(JSTAGE_ENDPOINT);
  url.searchParams.set('service', '3');
  url.searchParams.set('text', term);
  url.searchParams.set('count', String(PER_TERM));

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/atom+xml, application/xml, text/xml, */*;q=0.5',
      'User-Agent': 'PersonalDashboardPapers/2.0'
    },
    signal: AbortSignal.timeout(12_000)
  });

  if (!response.ok) {
    throw new Error(`J-STAGE HTTP ${response.status} (${term})`);
  }

  return parseJStageXml(await response.text(), term);
}

// J-STAGEの同時アクセス制限を踏みにくくするため、最大2並列で検索する。
async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function runner() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      try {
        results[index] = { status: 'fulfilled', value: await worker(items[index]) };
      } catch (reason) {
        results[index] = { status: 'rejected', reason };
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner));
  return results;
}

export default async function handler(req, res) {
  try {
    const forceRefresh = Boolean(req.query?._fresh || req.query?.refresh);

    if (!forceRefresh && cache.xml && Date.now() - cache.at < TTL) {
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=900');
      return res.status(200).send(cache.xml);
    }

    const settled = await runWithConcurrency(SEARCH_TERMS, 2, searchJStage);
    const items = settled.flatMap(result =>
      result?.status === 'fulfilled' ? result.value : []
    );

    const errors = settled
      .filter(result => result?.status === 'rejected')
      .map(result => result.reason?.message || 'J-STAGE取得失敗');

    // 全検索が失敗した場合だけAPIエラーにする。
    if (!items.length && errors.length === SEARCH_TERMS.length) {
      throw new Error(errors.join(' / '));
    }

    const seen = new Set();
    const deduped = items.filter(item => {
      const key = (item.doi || item.link || item.title).toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // J-STAGE WebAPIの updated は記事の公開日。
    deduped.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    const xml = rssXml(
      '論文',
      '炊飯器・電気ケトル・電気ポット・真空断熱・魔法瓶などの関連論文。Powered by J-STAGE',
      deduped.slice(0, MAX_ITEMS)
    );

    cache = { at: Date.now(), xml };

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=900');
    res.setHeader('X-Papers-Source', 'J-STAGE');
    if (errors.length) res.setHeader('X-Papers-Partial-Errors', String(errors.length));
    return res.status(200).send(xml);
  } catch (err) {
    console.error('[papers-feed:J-STAGE]', err);
    return res.status(502).send(`J-STAGE論文取得エラー: ${err?.message || 'unknown'}`);
  }
}
