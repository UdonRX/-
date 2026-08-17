import jsdomPackage from 'jsdom';
import { rssXml } from '../lib/rss-merge.mjs';
import { generateGemini } from '../lib/gemini.mjs';

const { JSDOM } = jsdomPackage;

/*
 * v21 論文フィード
 * - J-STAGE: 日本語論文
 * - Semantic Scholar: 英語を中心とした公開PDF付き論文
 * - 製品名だけでなく周辺の熱工学・加熱・断熱技術まで検索
 * - 英語タイトルは既存のGeminiでまとめて日本語化
 *
 * Semantic Scholar側は openAccessPdf を指定し、公開PDF URLがある論文だけを採用する。
 * そのPDF URLをRSSのlinkにするので、既存のPDF AI要約機能をそのまま利用できる。
 */

// v21: 製品名だけでなく、周辺の要素技術・熱現象まで検索対象を広げる。
// J-STAGEは日本語の関連語を複数検索し、Semantic ScholarはBoolean検索で広く拾った後、
// タイトル+抄録から関連度スコアを付けてノイズを落とす。
const JSTAGE_SEARCH_TERMS = [
  '炊飯器',
  '炊飯 加熱',
  'IH 炊飯',
  '誘導加熱 炊飯',
  '米飯 加熱',
  '電気ケトル',
  '電気 湯沸かし',
  '電気ポット',
  '保温 ポット',
  '真空断熱',
  '真空断熱 容器',
  '魔法瓶',
  'ステンレスボトル',
  '保温 ボトル',
  '断熱 ボトル'
];

const SEMANTIC_SCHOLAR_QUERIES = [
  {
    name: '製品名',
    query: '(("rice cooker" | "electric kettle" | "water boiler" | "hot water dispenser" | "vacuum flask" | "vacuum insulated bottle" | "insulated bottle" | thermos))'
  },
  {
    name: '炊飯・誘導加熱',
    query: '((rice | grain) + (cooking | heating | temperature) + (induction | thermal | appliance | cooker))'
  },
  {
    name: '湯沸かし・温度制御',
    query: '((water | beverage) + (heating | boiling | temperature) + (kettle | boiler | dispenser | appliance))'
  },
  {
    name: '断熱容器',
    query: '((bottle | flask | container | vessel) + (vacuum | insulat* | thermal) + (heat | retention | conductivity | beverage))'
  },
  {
    name: '熱効率・熱損失',
    query: '(("energy efficiency" | "thermal efficiency" | "heat loss" | "temperature control") + (cooker | kettle | boiler | "water heating" | bottle | flask | container))'
  }
];

const JSTAGE_ENDPOINT = 'https://api.jstage.jst.go.jp/searchapi/do';
const SEMANTIC_SCHOLAR_ENDPOINT = 'https://api.semanticscholar.org/graph/v1/paper/search/bulk';

const TTL = 20 * 60 * 1000;
const JSTAGE_PER_TERM = 35;
const SEMANTIC_SCHOLAR_PER_QUERY = 100;
const MAX_ITEMS = 220;
const TRANSLATION_BATCH_SIZE = 60;
const TRANSLATION_CACHE_MAX = 500;

let cache = { at: 0, xml: '' };
const translationCache = new Map();

function normalizeSpace(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

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
  if (year) return new Date(`${year}-01-01T00:00:00Z`);
  return new Date(0);
}

function normalizeHttps(value) {
  return String(value || '').replace(/^http:\/\//i, 'https://').trim();
}

function hasJapanese(value) {
  return /[\u3040-\u30ff\u3400-\u9fff]/.test(String(value || ''));
}

function stripHtml(value) {
  return normalizeSpace(
    String(value || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
  );
}

function setTranslationCache(original, translated) {
  const key = normalizeSpace(original);
  const value = normalizeSpace(translated);
  if (!key || !value) return;

  if (translationCache.has(key)) translationCache.delete(key);
  translationCache.set(key, value);

  while (translationCache.size > TRANSLATION_CACHE_MAX) {
    const oldest = translationCache.keys().next().value;
    if (!oldest) break;
    translationCache.delete(oldest);
  }
}

function getTranslationCache(title) {
  const key = normalizeSpace(title);
  const value = translationCache.get(key);
  if (!value) return '';
  translationCache.delete(key);
  translationCache.set(key, value);
  return value;
}

function parseJStageEntry(entry) {
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
    title: normalizeSpace(title),
    originalTitle: normalizeSpace(title),
    link,
    pubDate,
    author: authors || journal || 'J-STAGE',
    sourceName: 'J-STAGE',
    description: details || title,
    doi: normalizeSpace(doi),
    sourceId: `jstage:${normalizeSpace(doi || link || title)}`
  };
}

function parseJStageXml(xml, term) {
  const dom = new JSDOM(xml, { contentType: 'text/xml' });
  try {
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
      .map(parseJStageEntry)
      .filter(item => item.link && item.title);
  } finally {
    dom.window.close();
  }
}

async function searchJStage(term) {
  const url = new URL(JSTAGE_ENDPOINT);
  url.searchParams.set('service', '3');
  url.searchParams.set('text', term);
  url.searchParams.set('count', String(JSTAGE_PER_TERM));

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/atom+xml, application/xml, text/xml, */*;q=0.5',
      'User-Agent': 'PersonalDashboardPapers/3.0'
    },
    signal: AbortSignal.timeout(12_000)
  });

  if (!response.ok) {
    throw new Error(`J-STAGE HTTP ${response.status} (${term})`);
  }

  return parseJStageXml(await response.text(), term);
}

function semanticScholarDate(paper) {
  return safeDate(paper?.publicationDate, paper?.year);
}

function semanticScholarAuthors(paper) {
  return (Array.isArray(paper?.authors) ? paper.authors : [])
    .map(author => normalizeSpace(author?.name))
    .filter(Boolean)
    .slice(0, 8)
    .join(', ');
}

const SEMANTIC_STRONG_PATTERNS = [
  /rice\s+cooker/,
  /rice\s+cooking\s+(?:appliance|device|system)/,
  /electric\s+kettle/,
  /(?:electric\s+)?water\s+boiler/,
  /hot\s+water\s+dispenser/,
  /vacuum[-\s]+insulat\w*\s+(?:bottle|flask|container|vessel)/,
  /vacuum\s+flask/,
  /thermos(?:\s+bottle)?/,
  /insulated\s+(?:bottle|flask|container)/,
  /thermal\s+(?:bottle|flask)/
];

const SEMANTIC_CONTEXT_PATTERNS = [
  /cooker/,
  /kettle/,
  /boiler/,
  /water\s+heater/,
  /hot\s+water/,
  /bottle/,
  /flask/,
  /beverage\s+container/,
  /food\s+container/,
  /rice\s+cook/,
  /cooking\s+appliance/
];

const SEMANTIC_TECH_PATTERNS = [
  /induction\s+heating/,
  /electromagnetic\s+induction/,
  /thermal\s+insulat/,
  /vacuum\s+insulat/,
  /heat\s+transfer/,
  /heat\s+loss/,
  /thermal\s+conductiv/,
  /energy\s+efficien/,
  /thermal\s+efficien/,
  /temperature\s+control/,
  /boiling/,
  /heat\s+retention/,
  /thermal\s+retention/,
  /stainless\s+steel/
];

const SEMANTIC_NEGATIVE_PATTERNS = [
  /cryogenic/,
  /liquid\s+(?:hydrogen|nitrogen|helium)/,
  /\blng\b/,
  /spacecraft/,
  /satellite/,
  /building\s+envelope/,
  /wall\s+insulation/,
  /pipeline/,
  /laboratory\s+flask/,
  /chemical\s+reactor/
];

function semanticRelevanceScore(paper) {
  const haystack = `${paper?.title || ''}\n${paper?.abstract || ''}`.toLowerCase();
  if (!haystack.trim()) return 0;

  let score = 0;
  const strongCount = SEMANTIC_STRONG_PATTERNS.filter(pattern => pattern.test(haystack)).length;
  const contextCount = SEMANTIC_CONTEXT_PATTERNS.filter(pattern => pattern.test(haystack)).length;
  const techCount = SEMANTIC_TECH_PATTERNS.filter(pattern => pattern.test(haystack)).length;
  const negativeCount = SEMANTIC_NEGATIVE_PATTERNS.filter(pattern => pattern.test(haystack)).length;

  score += Math.min(16, strongCount * 8);
  score += Math.min(8, contextCount * 3);
  score += Math.min(10, techCount * 2);
  score -= Math.min(14, negativeCount * 7);

  if (/rice|grain/.test(haystack) && /cook|heat|temperature/.test(haystack) && /induction|appliance|cooker|thermal/.test(haystack)) score += 7;
  if (/water|beverage/.test(haystack) && /heat|boil|temperature/.test(haystack) && /kettle|boiler|heater|dispenser|appliance/.test(haystack)) score += 7;
  if (/bottle|flask|container|vessel/.test(haystack) && /vacuum|insulat|thermal/.test(haystack) && /heat|retention|conductiv|beverage/.test(haystack)) score += 7;

  return score;
}

function parseSemanticScholarPaper(paper) {
  const originalTitle = normalizeSpace(paper?.title);
  const pdfUrl = normalizeHttps(paper?.openAccessPdf?.url);
  if (!originalTitle || !pdfUrl) return null;

  const relevanceScore = semanticRelevanceScore(paper);
  if (relevanceScore < 6) return null;

  const authors = semanticScholarAuthors(paper);
  const venue = normalizeSpace(paper?.venue);
  const doi = normalizeSpace(paper?.externalIds?.DOI || paper?.externalIds?.doi);
  const abstract = normalizeSpace(paper?.abstract).slice(0, 4000);
  const s2Url = normalizeHttps(paper?.url);

  const details = [
    `原題: ${originalTitle}`,
    authors && `著者: ${authors}`,
    venue && `掲載先: ${venue}`,
    doi && `DOI: ${doi}`,
    abstract && `抄録: ${abstract}`,
    s2Url && `Semantic Scholar: ${s2Url}`,
    `関連度スコア: ${relevanceScore}`,
    '情報提供元: Semantic Scholar（公開PDF）'
  ].filter(Boolean).join('\n\n');

  return {
    title: originalTitle,
    originalTitle,
    // 公開PDFを直接リンクにすることで、既存のPDF要約処理へ直結する。
    link: pdfUrl,
    pubDate: semanticScholarDate(paper),
    author: authors || venue || 'Semantic Scholar',
    sourceName: 'Semantic Scholar OA',
    description: details,
    doi,
    relevanceScore,
    sourceId: `s2:${normalizeSpace(paper?.paperId || doi || pdfUrl)}`
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchSemanticScholar(queryDef) {
  const url = new URL(SEMANTIC_SCHOLAR_ENDPOINT);
  url.searchParams.set('query', queryDef.query);
  url.searchParams.set('fields', 'title,url,abstract,authors,venue,publicationDate,year,externalIds,openAccessPdf,publicationTypes');
  url.searchParams.set('sort', 'publicationDate:desc');
  url.searchParams.set('publicationTypes', 'JournalArticle,Conference,Review');
  url.searchParams.set('publicationDateOrYear', '2014-01-01:');
  url.searchParams.set('limit', String(SEMANTIC_SCHOLAR_PER_QUERY));

  const requestUrl = `${url.toString()}&openAccessPdf`;
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'PersonalDashboardPapers/4.0'
  };
  if (process.env.SEMANTIC_SCHOLAR_API_KEY) headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;

  const response = await fetch(requestUrl, {
    headers,
    signal: AbortSignal.timeout(18_000)
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Semantic Scholar HTTP ${response.status} [${queryDef.name}]${text ? `: ${text.slice(0, 180)}` : ''}`);
  }

  const data = await response.json();
  const items = (Array.isArray(data?.data) ? data.data : [])
    .map(parseSemanticScholarPaper)
    .filter(Boolean);

  return {
    name: queryDef.name,
    estimatedTotal: Number(data?.total || 0),
    items
  };
}

async function searchSemanticScholarAll() {
  const items = [];
  const errors = [];
  const counts = [];
  const hasOwnKey = Boolean(process.env.SEMANTIC_SCHOLAR_API_KEY);

  for (let i = 0; i < SEMANTIC_SCHOLAR_QUERIES.length; i += 1) {
    if (i > 0) await sleep(hasOwnKey ? 1050 : 1350);
    const queryDef = SEMANTIC_SCHOLAR_QUERIES[i];

    try {
      const result = await searchSemanticScholar(queryDef);
      items.push(...result.items);
      counts.push(`${result.name}:${result.items.length}`);
    } catch (err) {
      errors.push(err?.message || `Semantic Scholar取得失敗 [${queryDef.name}]`);
    }
  }

  return { items, errors, counts };
}

// J-STAGEの同時アクセス制限を踏みにくくするため最大2並列。
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

function splitIntoBatches(items, size) {
  const batches = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

async function translateEnglishTitles(items) {
  const pending = [];

  items.forEach((item, index) => {
    if (!item?.title || hasJapanese(item.title)) return;

    const cached = getTranslationCache(item.title);
    if (cached) {
      item.title = cached;
      return;
    }

    pending.push({ index, title: item.title });
  });

  if (!pending.length) return;

  const batches = splitIntoBatches(pending, TRANSLATION_BATCH_SIZE);

  // 翻訳はRSS取得速度を落としすぎないよう最大2並列。
  await runWithConcurrency(batches, 2, async batch => {
    const prompt = batch
      .map(entry => `${entry.index}\t${entry.title}`)
      .join('\n');

    const responseSchema = {
      type: 'object',
      additionalProperties: false,
      properties: {
        translations: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              index: { type: 'integer' },
              ja: { type: 'string' }
            },
            required: ['index', 'ja']
          }
        }
      },
      required: ['translations']
    };

    try {
      const result = await generateGemini({
        systemInstruction: [
          'あなたは学術論文タイトルの翻訳者です。',
          '英語タイトルを、意味を変えず自然で簡潔な日本語の論文タイトルへ翻訳してください。',
          '要約・補足・解説はしないでください。',
          '製品名、材料名、専門用語、単位、略語は必要に応じて原語を残してください。',
          '入力のindexを必ず維持してください。'
        ].join('\n'),
        prompt: `次の論文タイトルを日本語へ翻訳してください。\n\n${prompt}`,
        maxOutputTokens: 8000,
        responseSchema,
        timeoutMs: 25_000
      });

      const parsed = JSON.parse(
        String(result.text || '')
          .trim()
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/i, '')
      );

      for (const translated of Array.isArray(parsed?.translations) ? parsed.translations : []) {
        const index = Number(translated?.index);
        const ja = normalizeSpace(translated?.ja);
        if (!Number.isInteger(index) || index < 0 || index >= items.length || !ja) continue;

        const original = items[index]?.originalTitle || items[index]?.title;
        if (original) setTranslationCache(original, ja);
        items[index].title = ja;
      }
    } catch (err) {
      // 翻訳だけ失敗しても論文RSS自体は止めない。原題で表示する。
      console.warn('[papers-feed] title translation skipped:', err?.message || err);
    }
  });
}

function dedupePapers(items) {
  const seen = new Set();
  return items.filter(item => {
    const doiKey = normalizeSpace(item?.doi).toLowerCase();
    const linkKey = normalizeSpace(item?.link).replace(/[?#].*$/, '').toLowerCase();
    const titleKey = normalizeSpace(item?.originalTitle || item?.title).toLowerCase();
    const key = doiKey ? `doi:${doiKey}` : linkKey ? `url:${linkKey}` : `title:${titleKey}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default async function handler(req, res) {
  try {
    const forceRefresh = Boolean(req.query?._fresh || req.query?.refresh);

    if (!forceRefresh && cache.xml && Date.now() - cache.at < TTL) {
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1200');
      res.setHeader('X-Papers-Source', 'J-STAGE,Semantic Scholar');
      return res.status(200).send(cache.xml);
    }

    const [jstageSettled, semanticResult] = await Promise.all([
      runWithConcurrency(JSTAGE_SEARCH_TERMS, 2, searchJStage),
      searchSemanticScholarAll()
    ]);

    const jstageItems = jstageSettled.flatMap(result =>
      result?.status === 'fulfilled' ? result.value : []
    );
    const semanticItems = semanticResult.items;

    const errors = [
      ...jstageSettled
        .filter(result => result?.status === 'rejected')
        .map(result => result.reason?.message || 'J-STAGE取得失敗'),
      ...semanticResult.errors
    ];

    const merged = dedupePapers([...jstageItems, ...semanticItems]);
    merged.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    const finalItems = merged.slice(0, MAX_ITEMS);

    // 英語タイトルだけGeminiで和訳。失敗時は英語原題のまま継続する。
    await translateEnglishTitles(finalItems);

    if (!finalItems.length) {
      throw new Error(errors.length ? errors.join(' / ') : '該当論文が見つかりませんでした');
    }

    const xml = rssXml(
      '論文',
      [
        '家電製品名に加え、誘導加熱・湯沸かし・温度制御・熱効率・熱損失・保温・真空断熱など周辺技術まで広く検索。',
        `J-STAGE ${jstageItems.length}件 + Semantic Scholar公開PDF ${semanticItems.length}件を統合。`,
        `Semantic Scholar内訳: ${semanticResult.counts.join(' / ') || '0件'}。`,
        '英語タイトルはGeminiで日本語表示。発行日の新しい順。'
      ].join(' '),
      finalItems
    );

    cache = { at: Date.now(), xml };

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1200');
    res.setHeader('X-Papers-Source', 'J-STAGE,Semantic Scholar');
    res.setHeader('X-Papers-JStage-Count', String(jstageItems.length));
    res.setHeader('X-Papers-SemanticScholar-Count', String(semanticItems.length));
    res.setHeader('X-Papers-SemanticScholar-Queries', semanticResult.counts.join(','));
    if (errors.length) res.setHeader('X-Papers-Partial-Errors', String(errors.length));

    return res.status(200).send(xml);
  } catch (err) {
    console.error('[papers-feed:v21]', err);
    return res.status(502).send(`論文取得エラー: ${err?.message || 'unknown'}`);
  }
}
