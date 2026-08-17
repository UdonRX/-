import { rssXml } from '../lib/rss-merge.mjs';

const SEARCH_TERMS = [
  'rice cooker',
  'electric kettle',
  'vacuum insulated bottle',
  'vacuum flask',
  'electric water boiler',
  'electric pot',
  'vacuum insulated flask',
  '炊飯器',
  '電気ケトル',
  '電気ポット',
  '真空断熱ボトル',
  '真空断熱'
];

const RELEVANCE = [
  'rice cooker', 'electric kettle', 'vacuum insulated bottle', 'vacuum flask',
  'electric water boiler', 'electric pot', 'thermal bottle', 'insulated bottle',
  '炊飯器', '電気ケトル', '電気ポット', '真空断熱ボトル', '真空断熱'
];

let cache = { at: 0, xml: '' };
const TTL = 30 * 60 * 1000;

function abstractText(inverted) {
  if (!inverted || typeof inverted !== 'object') return '';
  const words = [];
  Object.entries(inverted).forEach(([word, positions]) => {
    (Array.isArray(positions) ? positions : []).forEach(pos => words.push([Number(pos), word]));
  });
  words.sort((a, b) => a[0] - b[0]);
  return words.map(x => x[1]).join(' ').trim();
}

function oaUrl(work) {
  return work?.best_oa_location?.landing_page_url ||
    work?.best_oa_location?.pdf_url ||
    work?.primary_location?.landing_page_url ||
    work?.doi ||
    work?.id || '';
}

async function searchOpenAlex(term, apiKey) {
  const url = new URL('https://api.openalex.org/works');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('search', term);
  url.searchParams.set('filter', 'open_access.is_oa:true,type:article');
  url.searchParams.set('sort', 'publication_date:desc');
  url.searchParams.set('per_page', '20');

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'PersonalDashboardPapers/1.0' },
    signal: AbortSignal.timeout(15_000)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || data?.message || `OpenAlex HTTP ${response.status}`);
  return Array.isArray(data.results) ? data.results : [];
}

export default async function handler(req, res) {
  try {
    const apiKey = String(process.env.OPENALEX_API_KEY || '').trim();
    if (!apiKey) {
      return res.status(500).send('OPENALEX_API_KEY がVercelに設定されていません。');
    }

    const forceRefresh = Boolean(req.query?._fresh || req.query?.refresh);
    if (!forceRefresh && cache.xml && Date.now() - cache.at < TTL) {
      res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
      res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
      return res.status(200).send(cache.xml);
    }

    const results = await Promise.allSettled(SEARCH_TERMS.map(term => searchOpenAlex(term, apiKey)));
    const works = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);

    const seen = new Set();
    const items = works.map(work => {
      const title = work.display_name || work.title || '無題';
      const abstract = abstractText(work.abstract_inverted_index);
      const haystack = `${title} ${abstract}`.toLowerCase();
      const relevant = RELEVANCE.some(term => haystack.includes(term.toLowerCase()));
      if (!relevant) return null;

      const link = oaUrl(work);
      if (!link) return null;
      const key = work.doi || work.id || link;
      if (seen.has(key)) return null;
      seen.add(key);

      const authors = (work.authorships || [])
        .slice(0, 6)
        .map(a => a?.author?.display_name)
        .filter(Boolean)
        .join(', ');
      const journal = work.primary_location?.source?.display_name || '';
      const description = [abstract, authors && `Authors: ${authors}`, journal && `Journal: ${journal}`]
        .filter(Boolean)
        .join('\n\n');

      return {
        title,
        link,
        pubDate: new Date(work.publication_date || work.created_date || 0),
        author: authors || journal || 'OpenAlex',
        sourceName: journal || 'OpenAlex OA',
        description: description || title
      };
    }).filter(Boolean);

    items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    const xml = rssXml('論文', '家電製品に関するオープンアクセス論文（OpenAlex）', items.slice(0, 80));
    cache = { at: Date.now(), xml };

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('[papers-feed]', err);
    return res.status(502).send(`OpenAlex取得エラー: ${err?.message || 'unknown'}`);
  }
}
