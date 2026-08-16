import dns from 'node:dns/promises';
import net from 'node:net';
import readabilityPackage from '@mozilla/readability';
import jsdomPackage from 'jsdom';

const { Readability } = readabilityPackage;
const { JSDOM } = jsdomPackage;

const MAX_HTML_BYTES = 4 * 1024 * 1024; // 4 MB
const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 12000;
const DEFAULT_MAX_TEXT_LENGTH = 60000;
const MIN_ARTICLE_LENGTH = 180;

const articleCache = new Map();
const ARTICLE_CACHE_TTL_MS = 10 * 60 * 1000;
const ARTICLE_CACHE_MAX = 80;

function normalizeText(value) {
  return String(value || '')
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isPrivateIPv4(address) {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;

  const [a, b, c] = parts;

  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0 && c === 0) return true;
  if (a === 192 && b === 0 && c === 2) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a === 198 && b === 51 && c === 100) return true;
  if (a === 203 && b === 0 && c === 113) return true;
  if (a >= 224) return true;

  return false;
}

function isPrivateIPv6(address) {
  const value = address.toLowerCase().split('%')[0];

  if (value === '::' || value === '::1') return true;
  if (value.startsWith('fc') || value.startsWith('fd')) return true;
  if (/^fe[89ab]/.test(value)) return true;
  if (value.startsWith('2001:db8:')) return true;
  if (value.startsWith('ff')) return true;
  // IPv4-mapped IPv6は保守的に拒否。16進表記のプライベートIPv4埋め込みも防ぐ。
  if (value.startsWith('::ffff:')) return true;

  const mapped = value.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);

  return false;
}

function isPrivateAddress(address) {
  const family = net.isIP(address);
  if (family === 4) return isPrivateIPv4(address);
  if (family === 6) return isPrivateIPv6(address);
  return true;
}

async function assertPublicUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('記事URLが不正です');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('記事URLのプロトコルが許可されていません');
  }

  if (url.username || url.password) {
    throw new Error('認証情報を含むURLは取得できません');
  }

  if (url.port && !['80', '443'].includes(url.port)) {
    throw new Error('通常以外のポートは取得できません');
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error('ローカルネットワークのURLは取得できません');
  }

  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new Error('プライベートIPは取得できません');
  } else {
    let addresses;
    try {
      addresses = await dns.lookup(hostname, { all: true, verbatim: true });
    } catch {
      throw new Error('記事サイトの名前解決に失敗しました');
    }

    if (!addresses.length || addresses.some(entry => isPrivateAddress(entry.address))) {
      throw new Error('取得先が安全な公開アドレスではありません');
    }
  }

  return url;
}

async function readResponseBufferLimited(response, maxBytes = MAX_HTML_BYTES) {
  const declaredLength = Number(response.headers.get('content-length') || 0);
  if (declaredLength > maxBytes) {
    throw new Error('記事HTMLが大きすぎます');
  }

  if (!response.body || typeof response.body.getReader !== 'function') {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > maxBytes) throw new Error('記事HTMLが大きすぎます');
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        try { await reader.cancel(); } catch {}
        throw new Error('記事HTMLが大きすぎます');
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    try { reader.releaseLock(); } catch {}
  }

  return Buffer.concat(chunks);
}

async function fetchHtmlSafely(rawUrl) {
  let currentUrl = await assertPublicUrl(rawUrl);

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',
          'Accept-Language': 'ja,en-US;q=0.8,en;q=0.6',
          'User-Agent': 'PersonalNewsSummary/1.0 (server-side article reader)'
        }
      });
    } catch (err) {
      if (err?.name === 'AbortError') throw new Error('記事取得がタイムアウトしました');
      throw new Error('記事ページを取得できませんでした');
    } finally {
      clearTimeout(timeout);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) throw new Error('リダイレクト先がありません');
      if (redirectCount >= MAX_REDIRECTS) throw new Error('リダイレクトが多すぎます');
      currentUrl = await assertPublicUrl(new URL(location, currentUrl).href);
      continue;
    }

    if (!response.ok) {
      throw new Error(`記事ページの取得に失敗しました (${response.status})`);
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (contentType && !contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error('記事リンクがHTMLページではありません');
    }

    const htmlBuffer = await readResponseBufferLimited(response);
    return { htmlBuffer, finalUrl: currentUrl.href };
  }

  throw new Error('記事ページを取得できませんでした');
}

function collectJsonLdCandidates(value, output) {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach(item => collectJsonLdCandidates(item, output));
    return;
  }
  if (typeof value !== 'object') return;

  const articleBody = normalizeText(value.articleBody);
  if (articleBody.length >= MIN_ARTICLE_LENGTH) {
    output.push({
      text: articleBody,
      title: normalizeText(value.headline || value.name),
      byline: normalizeText(
        typeof value.author === 'string'
          ? value.author
          : Array.isArray(value.author)
            ? value.author.map(author => author?.name || '').filter(Boolean).join(', ')
            : value.author?.name || ''
      ),
      publishedTime: normalizeText(value.datePublished),
      siteName: normalizeText(value.publisher?.name)
    });
  }

  Object.values(value).forEach(child => {
    if (child && typeof child === 'object') collectJsonLdCandidates(child, output);
  });
}

function extractBestJsonLdArticle(document) {
  const candidates = [];
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    const raw = script.textContent || '';
    if (!raw || raw.length > 1024 * 1024) return;
    try {
      collectJsonLdCandidates(JSON.parse(raw), candidates);
    } catch {}
  });

  candidates.sort((a, b) => b.text.length - a.text.length);
  return candidates[0] || null;
}

function parseArticle(htmlBuffer, pageUrl, maxTextLength) {
  // runScripts/resources は有効化しない。外部ページのJSを実行しないための安全策。
  // BufferをJSDOMへ渡し、HTML側のcharset宣言も利用できるようにする。
  const dom = new JSDOM(htmlBuffer, {
    url: pageUrl,
    contentType: 'text/html'
  });

  try {
    const document = dom.window.document;
    const jsonLdArticle = extractBestJsonLdArticle(document);

    document.querySelectorAll([
      'script', 'style', 'noscript', 'iframe', 'canvas', 'svg',
      'form', 'button', 'input', 'textarea', 'select', 'template'
    ].join(',')).forEach(node => node.remove());

    const reader = new Readability(document, {
      charThreshold: 120,
      maxElemsToParse: 0
    });

    const article = reader.parse();
    const readabilityText = normalizeText(article?.textContent);
    const jsonLdText = normalizeText(jsonLdArticle?.text);

    const useJsonLd = jsonLdText.length > readabilityText.length;
    const text = useJsonLd ? jsonLdText : readabilityText;

    if (text.length < MIN_ARTICLE_LENGTH) {
      throw new Error('記事本文を抽出できませんでした');
    }

    return {
      title: normalizeText(useJsonLd ? (jsonLdArticle?.title || article?.title) : (article?.title || jsonLdArticle?.title)).slice(0, 1000),
      text: text.slice(0, maxTextLength),
      byline: normalizeText(useJsonLd ? (jsonLdArticle?.byline || article?.byline) : (article?.byline || jsonLdArticle?.byline)).slice(0, 500),
      siteName: normalizeText(useJsonLd ? (jsonLdArticle?.siteName || article?.siteName) : (article?.siteName || jsonLdArticle?.siteName)).slice(0, 500),
      excerpt: normalizeText(article?.excerpt).slice(0, 1500),
      publishedTime: normalizeText(useJsonLd ? (jsonLdArticle?.publishedTime || article?.publishedTime) : (article?.publishedTime || jsonLdArticle?.publishedTime)).slice(0, 200),
      url: pageUrl,
      extractionMethod: useJsonLd ? 'json-ld' : 'readability',
      originalLength: text.length,
      truncated: text.length > maxTextLength
    };
  } finally {
    dom.window.close();
  }
}

function getCached(url) {
  const entry = articleCache.get(url);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > ARTICLE_CACHE_TTL_MS) {
    articleCache.delete(url);
    return null;
  }
  return entry.value;
}

function setCached(url, value) {
  if (articleCache.size >= ARTICLE_CACHE_MAX) {
    const oldestKey = articleCache.keys().next().value;
    if (oldestKey) articleCache.delete(oldestKey);
  }
  articleCache.set(url, { createdAt: Date.now(), value });
}

export async function extractArticleFromUrl(rawUrl, options = {}) {
  const url = String(rawUrl || '').trim();
  if (!url) throw new Error('記事URLがありません');

  const maxTextLength = Math.max(
    2000,
    Math.min(Number(options.maxTextLength) || DEFAULT_MAX_TEXT_LENGTH, 100000)
  );

  const cached = getCached(url);
  if (cached) {
    return {
      ...cached,
      text: cached.text.slice(0, maxTextLength),
      truncated: cached.originalLength > maxTextLength
    };
  }

  const { htmlBuffer, finalUrl } = await fetchHtmlSafely(url);
  const article = parseArticle(htmlBuffer, finalUrl, DEFAULT_MAX_TEXT_LENGTH);
  setCached(url, article);
  
  return {
    ...article,
    text: article.text.slice(0, maxTextLength),
    truncated: article.originalLength > maxTextLength
  };
}
