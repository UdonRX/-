import jsdomPackage from 'jsdom';
import { rssXml } from '../lib/rss-merge.mjs';
import { generateGemini } from '../lib/gemini.mjs';

const { JSDOM } = jsdomPackage;

/*
 * v22 論文フィード
 * - J-STAGE: 日本語論文 + 国内メーカー名検索
 * - Semantic Scholar: 英語を中心とした公開PDF付き論文
 * - Crossref: 競合メーカー所属著者の論文を affiliation から追加
 * - 炊飯/湯沸かし/断熱だけでなく、ミキサー、コーヒー、圧力調理、ホットプレート、トースター、フードジャーまで対象
 * - 英語タイトルは既存のGeminiでまとめて日本語化
 * - Crossrefの query.affiliation は関連度検索なので、レスポンス内の author.affiliation を再照合して誤検出を除外
 */

// v21: 製品名だけでなく、周辺の要素技術・熱現象まで検索対象を広げる。
// J-STAGEは日本語の関連語を複数検索し、Semantic ScholarはBoolean検索で広く拾った後、
// タイトル+抄録から関連度スコアを付けてノイズを落とす。
const JSTAGE_SEARCH_TERMS = [
  // 製品そのもの
  '炊飯器',
  '炊飯ジャー',
  '電気ケトル',
  '電気ポット',
  '真空断熱 ボトル',
  '魔法瓶',
  'フードジャー',
  'ミキサー 調理',
  'ブレンダー 調理',
  'コーヒーメーカー',
  '電気圧力鍋',
  'ホットプレート 調理',
  'オーブントースター',

  // 要素技術・現象
  'IH 炊飯',
  '誘導加熱 調理',
  '米飯 加熱',
  '湯沸かし 温度制御',
  '真空断熱 容器',
  '保温 容器 熱',
  'コーヒー 抽出 温度',
  '圧力調理',
  '赤外線 加熱 調理',
  '対流 加熱 調理',
  '撹拌 食品 流動',

  // 国内メーカー。J-STAGE全文に会社名が出る論文も補助的に拾う。
  'タイガー魔法瓶',
  '象印マホービン',
  'パナソニック 調理家電',
  'サーモス 真空断熱',
  '三菱電機 炊飯',
  'シャープ 調理家電',
  'アイリスオーヤマ 調理家電'
];

const SEMANTIC_SCHOLAR_QUERIES = [
  {
    name: '調理家電・製品名',
    query: '(("rice cooker" | "electric kettle" | "water boiler" | "hot water dispenser" | "vacuum flask" | "vacuum insulated bottle" | "food jar" | blender | mixer | "coffee maker" | "coffee machine" | "pressure cooker" | multicooker | "hot plate" | griddle | "toaster oven" | toaster))'
  },
  {
    name: '加熱・温度制御',
    query: '((cooking | beverage | food | water | rice) + ("induction heating" | heating | boiling | "temperature control" | thermal | infrared | convection | steam) + (appliance | cooker | kettle | boiler | oven | toaster | plate | griddle))'
  },
  {
    name: '断熱・保温',
    query: '((bottle | flask | container | jar | vessel) + (vacuum | insulat* | thermal) + (heat | retention | conductivity | beverage | food))'
  },
  {
    name: 'ミキサー・食品撹拌',
    query: '((blender | mixer | "food processor" | blade | mixing) + (food | beverage | kitchen | rheology | flow | particle | homogenization))'
  },
  {
    name: 'コーヒー・抽出',
    query: '((coffee | espresso | brewing | extraction) + (machine | maker | temperature | pressure | grinder | beverage | thermal))'
  },
  {
    name: '圧力調理・ホットプレート・トースター',
    query: '(("pressure cooking" | "pressure cooker" | multicooker | griddle | "hot plate" | "toaster oven" | toaster | countertop) + (cooking | food | heating | thermal | temperature | browning | convection | infrared))'
  },
  {
    name: 'メーカー・ブランド言及',
    query: '((Panasonic | Zojirushi | "Tiger Corporation" | Thermos | "Mitsubishi Electric" | "Iris Ohyama" | Tefal | SUPOR | Krups | Moulinex | WMF | DeLonghi | Kenwood | Braun | NutriBullet | SharkNinja | Breville | Midea | Joyoung | Cuckoo | Cuchen | Philips | "Hamilton Beach" | "Instant Pot" | Thermomix) + (cooker | kettle | bottle | flask | blender | mixer | coffee | pressure | griddle | toaster | kitchen | cooking))'
  }
];

const CROSSREF_COMPANIES = [
  { label: 'タイガー', query: 'Tiger Corporation', aliases: ['Tiger Corporation', 'Tiger Vacuum Bottle', 'タイガー魔法瓶'] },
  { label: '象印', query: 'Zojirushi Corporation', aliases: ['Zojirushi Corporation', 'Zojirushi', '象印マホービン', '象印魔法瓶'] },
  { label: 'Panasonic', query: 'Panasonic Corporation', aliases: ['Panasonic Corporation', 'Panasonic Holdings Corporation', 'Panasonic', 'Matsushita Electric Industrial', '松下電器産業'] },
  { label: 'THERMOS', query: 'THERMOS K.K.', aliases: ['THERMOS K.K.', 'Thermos LLC', 'Thermos L.L.C.', 'Thermos (China) Housewares', 'Thermos (Jiangsu) Housewares', 'Thermos', 'サーモス'] },
  { label: '三菱電機', query: 'Mitsubishi Electric Corporation', aliases: ['Mitsubishi Electric Corporation', 'Mitsubishi Electric', '三菱電機'] },
  { label: 'シャープ', query: 'Sharp Corporation', aliases: ['Sharp Corporation', 'Sharp', 'シャープ'] },
  { label: 'アイリスオーヤマ', query: 'Iris Ohyama', aliases: ['Iris Ohyama', 'IRIS OHYAMA', 'アイリスオーヤマ'] },
  { label: 'Groupe SEB', query: 'Groupe SEB', aliases: ['Groupe SEB', 'SEB S.A.', 'SEB SA'] },
  { label: 'SUPOR', query: 'Zhejiang Supor', aliases: ['Zhejiang Supor', 'SUPOR', 'Supor'] },
  { label: "De'Longhi", query: "De Longhi", aliases: ["De'Longhi", 'De Longhi', 'DeLonghi', "De'Longhi Group"] },
  { label: 'SharkNinja', query: 'SharkNinja', aliases: ['SharkNinja', 'SharkNinja Operating LLC', 'Ninja Kitchen'] },
  { label: 'Breville', query: 'Breville', aliases: ['Breville Group', 'Breville Pty', 'Breville'] },
  { label: 'Midea', query: 'Midea Group', aliases: ['Midea Group', 'Midea'] },
  { label: 'Joyoung', query: 'Joyoung', aliases: ['Joyoung Co', 'Joyoung', '九阳'] },
  { label: 'Cuckoo', query: 'Cuckoo Electronics', aliases: ['Cuckoo Electronics', 'CUCKOO Electronics', 'Cuckoo'] },
  { label: 'Cuchen', query: 'Cuchen', aliases: ['Cuchen Co', 'Cuchen'] },
  { label: 'Philips', query: 'Philips', aliases: ['Koninklijke Philips', 'Philips Domestic Appliances', 'Philips'] },
  { label: 'Hamilton Beach', query: 'Hamilton Beach Brands', aliases: ['Hamilton Beach Brands', 'Hamilton Beach'] },
  { label: 'Instant Brands', query: 'Instant Brands', aliases: ['Instant Brands', 'Instant Pot'] },
  { label: 'Vorwerk', query: 'Vorwerk', aliases: ['Vorwerk', 'Thermomix'] }
];

const JSTAGE_ENDPOINT = 'https://api.jstage.jst.go.jp/searchapi/do';
const SEMANTIC_SCHOLAR_ENDPOINT = 'https://api.semanticscholar.org/graph/v1/paper/search/bulk';
const SEMANTIC_SCHOLAR_BATCH_ENDPOINT = 'https://api.semanticscholar.org/graph/v1/paper/batch';
const CROSSREF_ENDPOINT = 'https://api.crossref.org/works';

const TTL = 20 * 60 * 1000;
const JSTAGE_PER_TERM = 35;
const SEMANTIC_SCHOLAR_PER_QUERY = 100;
const CROSSREF_ROWS_PER_COMPANY = 45;
const MAX_ITEMS = 300;
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
  /vacuum[-\s]+insulat\w*\s+(?:bottle|flask|container|vessel|jar)/,
  /vacuum\s+flask/,
  /thermos(?:\s+bottle)?/,
  /insulated\s+(?:bottle|flask|container|food\s+jar)/,
  /food\s+jar/,
  /(?:kitchen\s+)?blender/,
  /(?:food|stand|hand)\s+mixer/,
  /food\s+processor/,
  /coffee\s+(?:maker|machine|brewer)/,
  /espresso\s+(?:machine|maker)/,
  /electric\s+pressure\s+cooker/,
  /pressure\s+cooker/,
  /multi[-\s]?cooker/,
  /electric\s+(?:hot\s+plate|griddle)/,
  /hot\s+plate/,
  /toaster\s+oven/,
  /countertop\s+oven/
];

const SEMANTIC_CONTEXT_PATTERNS = [
  /cooker/,
  /kettle/,
  /boiler/,
  /water\s+heater/,
  /hot\s+water/,
  /bottle/,
  /flask/,
  /food\s+jar/,
  /beverage\s+container/,
  /food\s+container/,
  /rice\s+cook/,
  /cooking\s+appliance/,
  /kitchen\s+appliance/,
  /small\s+domestic\s+appliance/,
  /blender/,
  /mixer/,
  /food\s+processor/,
  /coffee/,
  /espresso/,
  /brewing/,
  /pressure\s+cook/,
  /griddle/,
  /hot\s+plate/,
  /toaster/,
  /countertop\s+oven/
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
  /stainless\s+steel/,
  /heating\s+element/,
  /infrared\s+heating/,
  /convection\s+heating/,
  /steam\s+heating/,
  /coffee\s+extraction/,
  /brewing\s+temperature/,
  /extraction\s+yield/,
  /mixing\s+performance/,
  /blade\s+(?:design|geometry|speed)/,
  /homogenization/,
  /rheolog/,
  /pressure\s+control/,
  /browning/,
  /maillard/
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
  /chemical\s+reactor/,
  /semiconductor/,
  /photovoltaic/,
  /battery\s+cell/,
  /electric\s+vehicle/,
  /automotive\s+engine/,
  /cancer/,
  /tumou?r/,
  /medical\s+imaging/
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
  if (/bottle|flask|container|vessel|jar/.test(haystack) && /vacuum|insulat|thermal/.test(haystack) && /heat|retention|conductiv|beverage|food/.test(haystack)) score += 7;
  if (/blender|mixer|food processor/.test(haystack) && /food|beverage|mix|blade|flow|rheolog|homogen/.test(haystack)) score += 7;
  if (/coffee|espresso/.test(haystack) && /maker|machine|brew|extract|temperature|pressure/.test(haystack)) score += 7;
  if (/pressure cooker|multicooker|pressure cooking/.test(haystack) && /food|cook|heat|temperature|steam/.test(haystack)) score += 7;
  if (/hot plate|griddle|toaster|countertop oven/.test(haystack) && /cook|heat|thermal|temperature|browning|infrared|convection/.test(haystack)) score += 7;

  return score;
}

function parseSemanticScholarPaper(paper) {
  const originalTitle = normalizeSpace(paper?.title);
  const pdfUrl = normalizeHttps(paper?.openAccessPdf?.url);
  if (!originalTitle || !pdfUrl) return null;

  const relevanceScore = semanticRelevanceScore(paper);
  if (relevanceScore < 5) return null;

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
  // publicationTypesは絞り過ぎるとpreprint等を落とすためv22では指定しない。
  url.searchParams.set('publicationDateOrYear', '2010-01-01:');
  url.searchParams.set('limit', String(SEMANTIC_SCHOLAR_PER_QUERY));

  const requestUrl = `${url.toString()}&openAccessPdf`;
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'PersonalDashboardPapers/5.0'
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

// --- Crossref: 競合メーカー所属著者の論文 ------------------------------
// Crossrefの query.affiliation は完全一致フィルタではないため、
// 返却された author[].affiliation[].name を aliases と照合してから採用する。
function normalizeCompanyText(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’'`´]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function crossrefAffiliations(work) {
  return (Array.isArray(work?.author) ? work.author : [])
    .flatMap(author => Array.isArray(author?.affiliation) ? author.affiliation : [])
    .map(aff => normalizeSpace(aff?.name))
    .filter(Boolean);
}

function matchesCompanyAffiliation(affiliations, company) {
  const normalizedAffiliations = affiliations.map(normalizeCompanyText);
  const normalizedAliases = (company?.aliases || [])
    .map(normalizeCompanyText)
    .filter(alias => alias.length >= 4);

  const matched = affiliations.filter((affiliation, index) => {
    const value = normalizedAffiliations[index];
    return normalizedAliases.some(alias => (
      value === alias ||
      value.startsWith(`${alias} `) ||
      value.endsWith(` ${alias}`) ||
      value.includes(` ${alias} `)
    ));
  });

  return matched;
}

function crossrefDateParts(value) {
  const parts = value?.['date-parts']?.[0];
  if (!Array.isArray(parts) || !parts.length) return null;
  const [year, month = 1, day = 1] = parts.map(Number);
  if (!year) return null;
  const date = new Date(Date.UTC(year, Math.max(0, month - 1), Math.max(1, day)));
  return Number.isFinite(date.getTime()) ? date : null;
}

function crossrefDate(work) {
  return (
    crossrefDateParts(work?.['published-online']) ||
    crossrefDateParts(work?.['published-print']) ||
    crossrefDateParts(work?.published) ||
    crossrefDateParts(work?.issued) ||
    crossrefDateParts(work?.created) ||
    new Date(0)
  );
}

function crossrefAuthors(work) {
  return (Array.isArray(work?.author) ? work.author : [])
    .map(author => normalizeSpace([author?.given, author?.family].filter(Boolean).join(' ')))
    .filter(Boolean)
    .slice(0, 10)
    .join(', ');
}

function crossrefTitle(work) {
  const raw = Array.isArray(work?.title) ? work.title[0] : work?.title;
  return normalizeSpace(stripHtml(raw));
}

function crossrefTopicScore(work) {
  const title = crossrefTitle(work);
  const abstract = stripHtml(work?.abstract || '');
  const journal = normalizeSpace(Array.isArray(work?.['container-title']) ? work['container-title'][0] : work?.['container-title']);
  const haystack = `${title}\n${abstract}\n${journal}`.toLowerCase();
  if (!haystack.trim()) return 0;

  const strongCount = SEMANTIC_STRONG_PATTERNS.filter(pattern => pattern.test(haystack)).length;
  const contextCount = SEMANTIC_CONTEXT_PATTERNS.filter(pattern => pattern.test(haystack)).length;
  const techCount = SEMANTIC_TECH_PATTERNS.filter(pattern => pattern.test(haystack)).length;
  const negativeCount = SEMANTIC_NEGATIVE_PATTERNS.filter(pattern => pattern.test(haystack)).length;

  let score = 0;
  score += Math.min(18, strongCount * 8);
  score += Math.min(10, contextCount * 3);
  score += Math.min(10, techCount * 2);
  score -= Math.min(18, negativeCount * 7);

  // 競合企業所属であること自体は強い情報なので、周辺技術1語でも候補に残す。
  if (/kitchen|cooking|food preparation|beverage|household appliance|small domestic appliance/.test(haystack)) score += 4;

  return score;
}

function crossrefBestLink(work) {
  const links = Array.isArray(work?.link) ? work.link : [];
  const pdf = links.find(link => {
    const contentType = String(link?.['content-type'] || link?.contentType || '').toLowerCase();
    const url = String(link?.URL || link?.url || '');
    return contentType.includes('pdf') || /\.pdf(?:$|[?#])/i.test(url);
  });
  const anyFullText = links.find(link => link?.URL || link?.url);
  const doi = normalizeSpace(work?.DOI);

  return normalizeHttps(
    pdf?.URL || pdf?.url ||
    anyFullText?.URL || anyFullText?.url ||
    work?.URL ||
    (doi ? `https://doi.org/${doi}` : '')
  );
}

function parseCrossrefWork(work, company) {
  const type = normalizeSpace(work?.type);
  if (type && !['journal-article', 'proceedings-article', 'posted-content', 'book-chapter', 'report'].includes(type)) {
    return null;
  }

  const title = crossrefTitle(work);
  if (!title) return null;

  const affiliations = crossrefAffiliations(work);
  const matchedAffiliations = matchesCompanyAffiliation(affiliations, company);
  if (!matchedAffiliations.length) return null;

  const relevanceScore = crossrefTopicScore(work);
  if (relevanceScore < 2) return null;

  const link = crossrefBestLink(work);
  if (!link) return null;

  const authors = crossrefAuthors(work);
  const journal = normalizeSpace(Array.isArray(work?.['container-title']) ? work['container-title'][0] : work?.['container-title']);
  const doi = normalizeSpace(work?.DOI);
  const abstract = stripHtml(work?.abstract || '').slice(0, 5000);
  const hasPdfLink = /\.pdf(?:$|[?#])/i.test(link) || (Array.isArray(work?.link) && work.link.some(item => String(item?.['content-type'] || '').toLowerCase().includes('pdf')));

  const details = [
    `企業関与: ${company.label}（著者所属で確認）`,
    `所属表記: ${matchedAffiliations.slice(0, 4).join(' / ')}`,
    authors && `著者: ${authors}`,
    journal && `掲載先: ${journal}`,
    doi && `DOI: ${doi}`,
    abstract && `抄録: ${abstract}`,
    `関連度スコア: ${relevanceScore}`,
    hasPdfLink ? '全文リンク: PDF候補あり' : '全文リンク: DOI/出版社ページ',
    '情報提供元: Crossref affiliation search'
  ].filter(Boolean).join('\n\n');

  return {
    title,
    originalTitle: title,
    link,
    pubDate: crossrefDate(work),
    author: authors || company.label,
    sourceName: `企業研究: ${company.label}`,
    description: details,
    doi,
    relevanceScore,
    companyLabel: company.label,
    sourceId: `crossref:${doi || link}`
  };
}

async function searchCrossrefCompany(company) {
  const url = new URL(CROSSREF_ENDPOINT);
  url.searchParams.set('query.affiliation', company.query);
  url.searchParams.set(
    'query.bibliographic',
    'rice cooker kettle water boiler vacuum insulated bottle food jar blender mixer coffee maker coffee machine pressure cooker hot plate griddle toaster oven kitchen appliance induction heating thermal insulation temperature control'
  );
  url.searchParams.set('filter', 'from-pub-date:2005-01-01,has-affiliation:1');
  url.searchParams.set('rows', String(CROSSREF_ROWS_PER_COMPANY));

  // CROSSREF_MAILTOは任意。未設定でもPublic poolで動作する。
  if (process.env.CROSSREF_MAILTO) {
    url.searchParams.set('mailto', process.env.CROSSREF_MAILTO);
  }

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': process.env.CROSSREF_MAILTO
        ? `PersonalDashboardPapers/5.0 (mailto:${process.env.CROSSREF_MAILTO})`
        : 'PersonalDashboardPapers/5.0'
    },
    signal: AbortSignal.timeout(16_000)
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Crossref HTTP ${response.status} [${company.label}]${text ? `: ${text.slice(0, 160)}` : ''}`);
  }

  const data = await response.json();
  const works = Array.isArray(data?.message?.items) ? data.message.items : [];
  const items = works
    .map(work => parseCrossrefWork(work, company))
    .filter(Boolean);

  return {
    company: company.label,
    total: Number(data?.message?.['total-results'] || 0),
    items
  };
}

async function searchCrossrefCompanies() {
  const settled = await runWithConcurrency(CROSSREF_COMPANIES, 5, searchCrossrefCompany);
  const items = [];
  const errors = [];
  const counts = [];

  settled.forEach((result, index) => {
    if (result?.status === 'fulfilled') {
      items.push(...result.value.items);
      counts.push(`${result.value.company}:${result.value.items.length}`);
    } else {
      const label = CROSSREF_COMPANIES[index]?.label || 'company';
      errors.push(result?.reason?.message || `Crossref取得失敗 [${label}]`);
    }
  });

  return { items, errors, counts };
}

async function enrichCrossrefWithOpenAccessPdf(items) {
  const doiItems = items.filter(item => normalizeSpace(item?.doi));
  if (!doiItems.length) return { enriched: 0, error: '' };

  const byDoi = new Map(
    doiItems.map(item => [normalizeSpace(item.doi).toLowerCase(), item])
  );
  const batches = splitIntoBatches(Array.from(byDoi.keys()), 400);
  let enriched = 0;

  for (const batch of batches) {
    const url = new URL(SEMANTIC_SCHOLAR_BATCH_ENDPOINT);
    url.searchParams.set('fields', 'title,url,externalIds,openAccessPdf,abstract');

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'PersonalDashboardPapers/5.0'
    };
    if (process.env.SEMANTIC_SCHOLAR_API_KEY) headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ids: batch.map(doi => `DOI:${doi}`) }),
        signal: AbortSignal.timeout(18_000)
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`Semantic Scholar batch HTTP ${response.status}${text ? `: ${text.slice(0, 150)}` : ''}`);
      }

      const papers = await response.json();
      for (const paper of Array.isArray(papers) ? papers : []) {
        if (!paper) continue;
        const doi = normalizeSpace(paper?.externalIds?.DOI || paper?.externalIds?.doi).toLowerCase();
        const item = byDoi.get(doi);
        const pdfUrl = normalizeHttps(paper?.openAccessPdf?.url);
        if (!item || !pdfUrl) continue;

        item.link = pdfUrl;
        item.description = `${item.description}\n\n公開PDF: Semantic Scholar経由で確認`;
        item.hasOpenAccessPdf = true;
        enriched += 1;
      }
    } catch (err) {
      // OA PDF補完だけ失敗してもCrossref論文自体は残す。
      return { enriched, error: err?.message || 'Semantic Scholar PDF補完失敗' };
    }

    if (batches.length > 1) await sleep(process.env.SEMANTIC_SCHOLAR_API_KEY ? 1050 : 1350);
  }

  return { enriched, error: '' };
}

function decorateCompanyTitles(items) {
  for (const item of items) {
    if (!item?.companyLabel || !item?.title) continue;
    const prefix = `【${item.companyLabel}】`;
    if (!item.title.startsWith(prefix)) item.title = `${prefix}${item.title}`;
  }
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
      res.setHeader('X-Papers-Source', 'J-STAGE,Semantic Scholar,Crossref');
      return res.status(200).send(cache.xml);
    }

    // 3系統を並列開始。Crossrefは内部で会社ごと最大5並列、J-STAGEは最大2並列。
    const [jstageSettled, semanticResult, crossrefResult] = await Promise.all([
      runWithConcurrency(JSTAGE_SEARCH_TERMS, 2, searchJStage),
      searchSemanticScholarAll(),
      searchCrossrefCompanies()
    ]);

    const jstageItems = jstageSettled.flatMap(result =>
      result?.status === 'fulfilled' ? result.value : []
    );
    const semanticItems = semanticResult.items;
    const crossrefItems = crossrefResult.items;

    // Crossrefで見つけた企業所属論文のDOIをSemantic Scholarへ一括照会し、
    // 公開PDFがあればリンクをPDFへ差し替える。
    const crossrefPdfResult = await enrichCrossrefWithOpenAccessPdf(crossrefItems);

    const errors = [
      ...jstageSettled
        .filter(result => result?.status === 'rejected')
        .map(result => result.reason?.message || 'J-STAGE取得失敗'),
      ...semanticResult.errors,
      ...crossrefResult.errors,
      ...(crossrefPdfResult.error ? [crossrefPdfResult.error] : [])
    ];

    const merged = dedupePapers([
      ...jstageItems,
      ...semanticItems,
      ...crossrefItems
    ]);
    merged.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    const finalItems = merged.slice(0, MAX_ITEMS);

    // 英語タイトルだけGeminiでまとめて和訳。失敗時は英語原題のまま継続。
    await translateEnglishTitles(finalItems);

    // Crossrefの企業所属論文は一覧だけで分かるようにメーカー名を先頭へ付ける。
    decorateCompanyTitles(finalItems);

    if (!finalItems.length) {
      throw new Error(errors.length ? errors.join(' / ') : '該当論文が見つかりませんでした');
    }

    const xml = rssXml(
      '論文',
      [
        '炊飯器、ケトル、ポット、真空断熱ボトル/フードジャー、ミキサー/ブレンダー、コーヒーメーカー、電気圧力鍋、ホットプレート、オーブントースターと周辺技術を検索。',
        'J-STAGEとSemantic Scholarに加え、Crossrefの著者所属情報から国内外の競合メーカーに関与する論文を追加。',
        `J-STAGE ${jstageItems.length}件 + Semantic Scholar公開PDF ${semanticItems.length}件 + 企業所属/Crossref ${crossrefItems.length}件を統合。`,
        `Crossref企業論文のうち ${crossrefPdfResult.enriched}件はSemantic Scholar経由で公開PDFへ補完。`,
        `Semantic Scholar内訳: ${semanticResult.counts.join(' / ') || '0件'}。`,
        `企業所属内訳: ${crossrefResult.counts.join(' / ') || '0件'}。`,
        '英語タイトルはGeminiで日本語表示。発行日の新しい順。'
      ].join(' '),
      finalItems
    );

    cache = { at: Date.now(), xml };

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1200');
    res.setHeader('X-Papers-Source', 'J-STAGE,Semantic Scholar,Crossref');
    res.setHeader('X-Papers-JStage-Count', String(jstageItems.length));
    res.setHeader('X-Papers-SemanticScholar-Count', String(semanticItems.length));
    res.setHeader('X-Papers-Crossref-Company-Count', String(crossrefItems.length));
    res.setHeader('X-Papers-Crossref-OA-PDF-Enriched', String(crossrefPdfResult.enriched));
    res.setHeader('X-Papers-SemanticScholar-Queries', semanticResult.counts.join(','));
    res.setHeader('X-Papers-Crossref-Companies', crossrefResult.counts.join(','));
    if (errors.length) res.setHeader('X-Papers-Partial-Errors', String(errors.length));

    return res.status(200).send(xml);
  } catch (err) {
    console.error('[papers-feed:v22]', err);
    return res.status(502).send(`論文取得エラー: ${err?.message || 'unknown'}`);
  }
}
