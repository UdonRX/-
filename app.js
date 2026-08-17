// --- JMA (気象庁API) 地域コード定義 & 地名マッピング表 ---
// forecast/data/forecast/{code}.json の府県予報区コードは6桁。
const JMA_PREF_CODES = {
  "宗谷地方": "011000",
  "上川・留萌地方": "012000",
  "石狩・空知・後志地方": "016000",
  "網走・北見・紋別地方": "013000",
  "釧路・根室地方": "014100",
  "十勝地方": "014030",
  "胆振・日高地方": "015000",
  "渡島・檜山地方": "017000",
  "青森県": "020000",
  "秋田県": "050000",
  "岩手県": "030000",
  "宮城県": "040000",
  "山形県": "060000",
  "福島県": "070000",
  "茨城県": "080000",
  "栃木県": "090000",
  "群馬県": "100000",
  "埼玉県": "110000",
  "東京都": "130000",
  "千葉県": "120000",
  "神奈川県": "140000",
  "長野県": "200000",
  "山梨県": "190000",
  "静岡県": "220000",
  "愛知県": "230000",
  "岐阜県": "210000",
  "三重県": "240000",
  "新潟県": "150000",
  "富山県": "160000",
  "石川県": "170000",
  "福井県": "180000",
  "滋賀県": "250000",
  "京都府": "260000",
  "大阪府": "270000",
  "兵庫県": "280000",
  "奈良県": "290000",
  "和歌山県": "300000",
  "岡山県": "330000",
  "広島県": "340000",
  "島根県": "320000",
  "鳥取県": "310000",
  "徳島県": "360000",
  "香川県": "370000",
  "愛媛県": "380000",
  "高知県": "390000",
  "山口県": "350000",
  "福岡県": "400000",
  "大分県": "440000",
  "長崎県": "420000",
  "佐賀県": "410000",
  "熊本県": "430000",
  "宮崎県": "450000",
  "鹿児島県": "460100",
  "沖縄本島地方": "471000",
  "大東島地方": "472000",
  "宮古島地方": "473000",
  "八重山地方": "474000"
};

// 実在する都道府県リスト
const ALL_PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

// 北海道・沖縄の振分マッピング
const HOKKAIDO_SUB_AREAS = {
  "稚内": "011000", "宗谷": "011000",
  "旭川": "012000", "留萌": "012000", "上川": "012000",
  "札幌": "016000", "石狩": "016000", "空知": "016000", "後志": "016000", "小樽": "016000",
  "網走": "013000", "北見": "013000", "紋別": "013000",
  "釧路": "014100", "根室": "014100",
  "帯広": "014030", "十勝": "014030",
  "室欄": "015000", "苫小牧": "015000", "胆振": "015000", "日高": "015000",
  "函館": "017000", "渡島": "017000", "檜山": "017000"
};

const OKINAWA_SUB_AREAS = {
  "那覇": "471000", "沖縄": "471000", "本島": "471000",
  "南大東": "472000", "北大東": "472000", "大東": "472000",
  "宮古": "473000", "宮古島": "473000",
  "石垣": "474000", "八重山": "474000", "西表": "474000", "与那国": "474000"
};

// --- YouTube Data API v3 設定 ---
const YOUTUBE_API_KEY = "AIzaSyCIu3TLMlWdKLjjU7mDsuhY8Rmdp-lSxWM";

// WeatherCode -> アイコン変換 (Google Weather API アイコン名参照)
function getJmaWeatherIconUrl(code, isNight = false) {
  const c = parseInt(code, 10);
  let iconName = "sunny";

  if (c === 100) iconName = isNight ? "clear_night" : "sunny";
  else if (c >= 101 && c <= 119) iconName = "partly_cloudy";
  else if (c >= 120 && c <= 181) iconName = "partly_cloudy";
  else if (c === 200) iconName = "cloudy";
  else if (c >= 201 && c <= 208) iconName = "cloudy";
  else if (c === 209) iconName = "fog";
  else if (c >= 210 && c <= 231) iconName = "cloudy";
  else if (c === 240 || c === 250) iconName = "thunderstorms";
  else if (c >= 260 && c <= 281) iconName = "rain_s_cloudy";
  else if (c >= 300 && c <= 304) iconName = "rain";
  else if (c === 306 || c === 308) iconName = "rain_heavy";
  else if (c === 309) iconName = "rain_snow";
  else if (c >= 311 && c <= 329) iconName = "rain";
  else if (c === 340) iconName = "rain_snow";
  else if (c === 350) iconName = "thunderstorms";
  else if (c >= 361 && c <= 371) iconName = "rain";
  else if (c >= 400 && c <= 403) iconName = "snow";
  else if (c >= 405 && c <= 407) iconName = "snow";
  else if (c === 409) iconName = "sleet";
  else if (c >= 411 && c <= 427) iconName = "snow";
  else if (c === 450) iconName = "thunderstorms";

  return `https://ssl.gstatic.com/onebox/weather/64/${iconName}.png`;
}

// 日付に応じた曜日カラーを取得するヘルパー関数
function getDateColorClassOrStyle(dateObj) {
  const day = dateObj.getDay();
  if (day === 0) {
    return 'color: #ff3b30;'; // 日曜日（赤）
  } else if (day === 6) {
    return 'color: #007aff;'; // 土曜日（青）
  }
  return 'color: #333333;'; // 平日
}

// 共通の日付フォーマット関数（当日：時刻のみ、それ以外：月/日 時刻）
function formatCustomDate(dateObj) {
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '';
  const today = new Date();
  const isToday = dateObj.getFullYear() === today.getFullYear() &&
                  dateObj.getMonth() === today.getMonth() &&
                  dateObj.getDate() === today.getDate();

  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (isToday) {
    return timeStr;
  } else {
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    return `${month}/${day} ${timeStr}`;
  }
}

// 初期データ
const DEFAULT_WEATHER_LOCATIONS = [
  {
    name: "京都府",
    code: "260000"
  }
];

const CURATED_NEWS_FEEDS_V16 = [
  { name: "全国ニュース", url: "/api/news-feed?category=national" },
  { name: "日本政治ニュース", url: "/api/news-feed?category=politics" },
  { name: "国内企業ニュース", url: "/api/news-feed?category=domestic-business" },
  { name: "海外企業ニュース", url: "/api/news-feed?category=global-business" },
  { name: "海外ニュース", url: "/api/news-feed?category=world" },
  { name: "IT系", url: "/api/news-feed?category=it" },
  { name: "家電", url: "/api/news-feed?category=appliances" },
  { name: "香川のニュース", url: "/api/news-feed?category=kagawa" },
  { name: "京都のニュース", url: "/api/news-feed?category=kyoto" },
  { name: "論文", url: "/api/papers-feed" }
];

const DEFAULT_NEWS = [...CURATED_NEWS_FEEDS_V16];

const DEFAULT_KNOWLEDGE = [
  { name: "Qiita", url: "https://qiita.com/tags/javascript/feed.atom" },
  { name: "GIGAZINE", url: "https://gigazine.net/news/rss_2.0/" }
];

const DEFAULT_YOUTUBE = [];

const DEFAULT_TWITCH = [];

const DEFAULT_TWITTER = [
  { name: "デフォルトリスト", url: "2087706843519111304" }
];

// --- Storage 管理関数 ---
function loadStoredFeeds(key, defaultValue) {
  const stored = localStorage.getItem(key);
  if (stored !== null) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Failed to parse ${key} from localStorage`, e);
    }
  }
  localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
}

function saveStoredFeeds(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function migrateCuratedNewsFeedsV16(feeds) {
  const existing = Array.isArray(feeds) ? feeds : [];
  const migrationKey = 'curatedNewsFeedsV16Installed';
  if (localStorage.getItem(migrationKey) === '1') return existing;

  // 新しい標準カテゴリを先頭へ追加し、既存のユーザー登録RSSは消さず後ろへ残す。
  const merged = CURATED_NEWS_FEEDS_V16.map(feed => ({ ...feed }));
  const known = new Set(merged.map(feed => feed.url));
  existing.forEach(feed => {
    if (!feed || !feed.url || known.has(feed.url)) return;
    merged.push({ ...feed });
    known.add(feed.url);
  });

  saveStoredFeeds('newsFeeds', merged);
  localStorage.setItem(migrationKey, '1');
  return merged;
}

// v14: v13以前で先頭の0が欠けた5桁コードが保存済みでも自動修復する。
// 例: 宮城県 40000 -> 040000。
function normalizeJmaForecastCode(code) {
  const raw = String(code ?? '').trim();
  if (!/^\d+$/.test(raw)) return raw;
  return raw.length < 6 ? raw.padStart(6, '0') : raw;
}

function migrateStoredWeatherLocationCodes(locations) {
  if (!Array.isArray(locations)) return [];
  let changed = false;
  const migrated = locations.map((loc) => {
    if (!loc || typeof loc !== 'object') return loc;
    const normalized = normalizeJmaForecastCode(loc.code);
    if (normalized && normalized !== String(loc.code ?? '')) {
      changed = true;
      return { ...loc, code: normalized };
    }
    return loc;
  });
  if (changed) saveStoredFeeds('weatherLocations', migrated);
  return migrated;
}

// グローバル変数
let weatherLocations = migrateStoredWeatherLocationCodes(
  loadStoredFeeds('weatherLocations', DEFAULT_WEATHER_LOCATIONS)
);
let currentWeatherIdx = 0;
let currentWeatherMode = '3day';
let currentAreaSubIndex = 0;

let newsFeeds = migrateCuratedNewsFeedsV16(loadStoredFeeds('newsFeeds', DEFAULT_NEWS));
let knowledgeFeeds = loadStoredFeeds('knowledgeFeeds', DEFAULT_KNOWLEDGE);
let youtubeFeeds = loadStoredFeeds('youtubeFeeds', DEFAULT_YOUTUBE);
let twitterFeeds = loadStoredFeeds('twitterFeeds', DEFAULT_TWITTER);
let twitchFeeds = loadStoredFeeds('twitchFeeds', DEFAULT_TWITCH);
let currentTwitchIdx = 0;
const TWITTER_ACTIVE_INDEX_KEY = 'twitterActiveIndexV2';
let currentTwitterIdx = (() => {
  const n = Number(sessionStorage.getItem(TWITTER_ACTIVE_INDEX_KEY) || localStorage.getItem(TWITTER_ACTIVE_INDEX_KEY));
  return Number.isInteger(n) && n >= 0 ? n : 0;
})();

// Twitter: Render Free のコールドスタート復帰待ちを自動再試行する。
// 取得処理が「まだ情報なし」で完了した後、5秒待って次の取得を行う。
// fetchはawaitで直列実行されるのでリクエストは重複しない。
const TWITTER_WAKE_RETRY_MS = 5000;
let twitterRetryTimer = null;
let twitterRetryCount = 0;
let twitterRetryFeedUrl = '';
let twitterFetchController = null;
let twitterLoadSerial = 0;

// Twitter: 外部リンク等から戻ったときにフィードごとのスクロール位置を復元する
const TWITTER_SCROLL_STORAGE_KEY = 'twitterScrollPositionsV1';
let twitterScrollPositions = (() => {
  try {
    return JSON.parse(sessionStorage.getItem(TWITTER_SCROLL_STORAGE_KEY) || localStorage.getItem(TWITTER_SCROLL_STORAGE_KEY) || '{}');
  } catch (_) {
    return {};
  }
})();

// v10: scrollTopだけでなく、画面先頭付近のツイート自体も記録する。
// iPhone Safari/PWAで復帰時に画像高さが変わっても同じツイートへ戻せる。
const TWITTER_ANCHOR_STORAGE_KEY = 'twitterScrollAnchorsV1';
let twitterScrollAnchors = (() => {
  try {
    return JSON.parse(sessionStorage.getItem(TWITTER_ANCHOR_STORAGE_KEY) || localStorage.getItem(TWITTER_ANCHOR_STORAGE_KEY) || '{}');
  } catch (_) {
    return {};
  }
})();


// v11: Twitter外部動画から戻ったときの復帰位置を永続化する。
const TWITTER_EXTERNAL_RETURN_KEY = 'twitterExternalReturnV3';
let twitterExternalReturnState = (() => {
  try {
    return JSON.parse(sessionStorage.getItem(TWITTER_EXTERNAL_RETURN_KEY) || localStorage.getItem(TWITTER_EXTERNAL_RETURN_KEY) || 'null');
  } catch (_) {
    return null;
  }
})();
let twitterExternalRestoreTimers = [];
let twitterScrollRestoreTimers = [];
let twitterScrollSaveSuspended = false;
let twitterScrollResumeTimer = null;
let twitterExternalRestoreSucceeded = false;

function clearTwitterExternalReturnState() {
  twitterExternalReturnState = null;
  twitterExternalRestoreSucceeded = false;
  try {
    sessionStorage.removeItem(TWITTER_EXTERNAL_RETURN_KEY);
    localStorage.removeItem(TWITTER_EXTERNAL_RETURN_KEY);
  } catch (_) {}
}

function cancelTwitterRestoreTimers({ clearExternal = false } = {}) {
  twitterExternalRestoreTimers.forEach(timer => clearTimeout(timer));
  twitterExternalRestoreTimers = [];

  twitterScrollRestoreTimers.forEach(timer => clearTimeout(timer));
  twitterScrollRestoreTimers = [];

  if (twitterScrollResumeTimer) {
    clearTimeout(twitterScrollResumeTimer);
    twitterScrollResumeTimer = null;
  }

  setTwitterScrollSaveSuspended(false);

  if (clearExternal) {
    clearTwitterExternalReturnState();
  }
}

// v12: 動画から戻った位置の復元は「戻った直後だけ」。
// ユーザーがタイムラインに触れた瞬間、それ以降の復元予約をすべて破棄する。
function cancelTwitterRestoreOnUserInteraction() {
  const hasPendingRestore =
    twitterExternalRestoreTimers.length > 0 ||
    twitterScrollRestoreTimers.length > 0 ||
    Boolean(twitterScrollResumeTimer) ||
    Boolean(twitterExternalReturnState?.feedUrl);

  if (!hasPendingRestore) return;
  cancelTwitterRestoreTimers({ clearExternal: true });
}

function persistTwitterScrollState() {
  try {
    const positionsJson = JSON.stringify(twitterScrollPositions);
    const anchorsJson = JSON.stringify(twitterScrollAnchors);
    sessionStorage.setItem(TWITTER_SCROLL_STORAGE_KEY, positionsJson);
    sessionStorage.setItem(TWITTER_ANCHOR_STORAGE_KEY, anchorsJson);
    localStorage.setItem(TWITTER_SCROLL_STORAGE_KEY, positionsJson);
    localStorage.setItem(TWITTER_ANCHOR_STORAGE_KEY, anchorsJson);
    sessionStorage.setItem(TWITTER_ACTIVE_INDEX_KEY, String(currentTwitterIdx));
    localStorage.setItem(TWITTER_ACTIVE_INDEX_KEY, String(currentTwitterIdx));
  } catch (_) {}
}

function setTwitterScrollSaveSuspended(value) {
  twitterScrollSaveSuspended = Boolean(value);
  if (!value && twitterScrollResumeTimer) {
    clearTimeout(twitterScrollResumeTimer);
    twitterScrollResumeTimer = null;
  }
}

function rememberTwitterExternalReturn(feedUrl, tweetKey = '') {
  // 前回の復元予約が残っていたら必ず破棄してから、新しい1回分だけ記録する。
  cancelTwitterRestoreTimers({ clearExternal: true });
  twitterExternalRestoreSucceeded = false;
  saveTwitterScrollPosition(feedUrl, true);
  const container = document.getElementById('twitter-content');
  const card = tweetKey
    ? Array.from(container?.querySelectorAll?.('.tweet-card[data-tweet-key]') || [])
        .find(el => el.dataset.tweetKey === tweetKey)
    : null;
  const containerRect = container?.getBoundingClientRect?.();

  twitterExternalReturnState = {
    feedUrl,
    feedIndex: currentTwitterIdx,
    tweetKey,
    scrollTop: getTwitterSavedScrollPosition(feedUrl),
    cardOffset: card && containerRect
      ? Math.round(card.getBoundingClientRect().top - containerRect.top)
      : null,
    openedAt: Date.now()
  };

  try {
    const json = JSON.stringify(twitterExternalReturnState);
    sessionStorage.setItem(TWITTER_EXTERNAL_RETURN_KEY, json);
    localStorage.setItem(TWITTER_EXTERNAL_RETURN_KEY, json);
  } catch (_) {}
}

function restoreTwitterExternalReturnPosition() {
  const state = twitterExternalReturnState;
  if (!state?.feedUrl) return false;

  if (Date.now() - Number(state.openedAt || 0) > 30 * 60 * 1000) {
    clearTwitterExternalReturnState();
    return false;
  }

  const targetIndex = twitterFeeds.findIndex(feed => feed.url === state.feedUrl);
  if (targetIndex >= 0 && currentTwitterIdx !== targetIndex) {
    currentTwitterIdx = targetIndex;
    renderTwitterTabs();
  }

  const container = document.getElementById('twitter-content');
  if (!container || twitterFeeds[currentTwitterIdx]?.url !== state.feedUrl) return false;

  if (state.tweetKey) {
    const card = Array.from(container.querySelectorAll('.tweet-card[data-tweet-key]'))
      .find(el => el.dataset.tweetKey === state.tweetKey);
    if (!card) return false;

    const containerRect = container.getBoundingClientRect();
    const currentOffset = card.getBoundingClientRect().top - containerRect.top;
    const wantedOffset = Number.isFinite(Number(state.cardOffset)) ? Number(state.cardOffset) : 0;
    container.scrollTop += currentOffset - wantedOffset;
    twitterScrollPositions[state.feedUrl] = Math.max(0, Math.round(container.scrollTop || 0));
    persistTwitterScrollState();
    return true;
  }

  container.scrollTop = Math.max(0, Number(state.scrollTop) || 0);
  return true;
}

function scheduleTwitterExternalReturnRestore() {
  twitterExternalRestoreTimers.forEach(timer => clearTimeout(timer));
  twitterExternalRestoreTimers = [];
  twitterExternalRestoreSucceeded = false;

  // v12: 数秒間ずっと固定し続けない。
  // 戻った直後のDOM/画像レイアウト安定待ちとして最大0.8秒だけ再確認する。
  [0, 60, 140, 280, 480, 720].forEach(delay => {
    twitterExternalRestoreTimers.push(window.setTimeout(() => {
      const restored = restoreTwitterExternalReturnPosition();
      if (restored) twitterExternalRestoreSucceeded = true;
    }, delay));
  });

  twitterExternalRestoreTimers.push(window.setTimeout(() => {
    // 対象ツイートが更新で消えていても、ツイート一覧自体が描画済みならscrollTopを最後の保険にする。
    if (!twitterExternalRestoreSucceeded && twitterExternalReturnState?.feedUrl) {
      const container = document.getElementById('twitter-content');
      const hasRenderedTweets = Boolean(container?.querySelector('.tweet-card[data-tweet-key]'));
      if (
        hasRenderedTweets &&
        twitterFeeds[currentTwitterIdx]?.url === twitterExternalReturnState.feedUrl
      ) {
        container.scrollTop = Math.max(0, Number(twitterExternalReturnState.scrollTop) || 0);
        twitterExternalRestoreSucceeded = true;
      }
    }

    // 1回でも復元できたら、この時点で復元処理を完全終了する。
    // 以降ユーザーがスクロールしても元の動画位置へ戻さない。
    if (twitterExternalRestoreSucceeded) {
      clearTwitterExternalReturnState();
      setTwitterScrollSaveSuspended(false);
      saveTwitterScrollPosition(twitterFeeds[currentTwitterIdx]?.url, true);
    }

    twitterExternalRestoreTimers = [];
  }, 820));
}

function openTwitterVideoExternally(videoUrl, feedUrl, tweetKey) {
  rememberTwitterExternalReturn(feedUrl, tweetKey);

  // iPhoneで安定して再生できる外部MP4ビューアだけを使う。
  // ユーザー操作中の<a target="_blank">として開くことで、PWA本体はその場に残す。
  const anchor = document.createElement('a');
  anchor.href = videoUrl;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

let currentNewsUrl = '';
let currentKnowledgeUrl = '';

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  weatherLocations = migrateStoredWeatherLocationCodes(
    loadStoredFeeds('weatherLocations', DEFAULT_WEATHER_LOCATIONS)
  );
  newsFeeds = migrateCuratedNewsFeedsV16(loadStoredFeeds('newsFeeds', DEFAULT_NEWS));
  knowledgeFeeds = loadStoredFeeds('knowledgeFeeds', DEFAULT_KNOWLEDGE);
  youtubeFeeds = loadStoredFeeds('youtubeFeeds', DEFAULT_YOUTUBE);
  twitterFeeds = loadStoredFeeds('twitterFeeds', DEFAULT_TWITTER);
  twitchFeeds = loadStoredFeeds('twitchFeeds', DEFAULT_TWITCH);

  initWeatherUI();
  initNews();
  initKnowledge();
  initSummaryUI();
  initTwitter();
  initTwitch();
  initYoutube();
  initFutocyan();
  initModals();
  registerSW();
});

// Service Worker 登録
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
  }
}

// --- 通信処理 ---
async function fetchNewsRSS(feedUrl, { forceRefresh = false } = {}) {
  const raw = String(feedUrl || '').trim();
  let apiUrl;

  // v16: Vercel内で生成する統合RSSは /api/rss を二重経由させず直接取得する。
  if (raw.startsWith('/api/')) {
    const url = new URL(raw, location.origin);
    if (forceRefresh) url.searchParams.set('_fresh', String(Date.now()));
    apiUrl = `${url.pathname}${url.search}`;
  } else {
    apiUrl = `/api/rss?url=${encodeURIComponent(raw)}`;
    if (forceRefresh) apiUrl += `&_fresh=${Date.now()}`;
  }

  const response = await fetch(apiUrl, { cache: forceRefresh ? 'no-store' : 'default' });
  if (!response.ok) throw new Error('RSS取得エラー');
  const xmlText = await response.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('XMLパースエラー');
  }

  let items = Array.from(xmlDoc.querySelectorAll('item, entry, アイテム'));
  if (items.length === 0) {
    const channel = xmlDoc.querySelector('channel, チャンネル') || xmlDoc;
    items = Array.from(channel.children).filter(node => 
      ['item', 'entry', 'アイテム'].includes(node.tagName.toLowerCase())
    );
  }

  const getTagText = (parent, selectors) => {
    for (const selector of selectors) {
      const elem = parent.querySelector(selector);
      if (elem && elem.textContent) return elem.textContent.trim();
    }
    return '';
  };

  const parseCustomDate = (dateStr) => {
    if (!dateStr) return new Date();
    const cleaned = dateStr
      .replace(/年|月/g, '/')
      .replace(/日/g, '')
      .replace(/（.*?）|土曜日|日曜日|月曜日|火曜日|水曜日|木曜日|金曜日/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const parsedDate = new Date(cleaned);
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  };

  return items.map(item => {
    const title = getTagText(item, ['title', 'タイトル']) || '無題';
    let link = getTagText(item, ['link', 'リンク', 'url', 'URL']);
    if (!link) {
      const linkElem = item.querySelector('link, リンク');
      if (linkElem && linkElem.getAttribute('href')) {
        link = linkElem.getAttribute('href');
      }
    }
    const pubDateRaw = getTagText(item, ['pubDate', 'date', 'published', 'updated', '公開日時', '投稿日時', '日付', '発行日時']);
    const description = getTagText(item, ['description', 'content', 'encoded', '詳細', '概要', '内容', '本文']);
    const author = getTagText(item, ['creator', 'dc\\:creator', 'author name', 'author', '製作者', '投稿者', '作者']);

    return {
      title,
      link,
      pubDate: parseCustomDate(pubDateRaw),
      description: description || title,
      author
    };
  });
}

// --- YouTube API ---
async function fetchYoutubeData(channelIdentifier) {
  let channelId = channelIdentifier;

  if (channelIdentifier.startsWith('@') || !channelIdentifier.startsWith('UC')) {
    const searchPart = channelIdentifier.startsWith('@') ? channelIdentifier.substring(1) : channelIdentifier;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id,snippet&forHandle=${encodeURIComponent(searchPart)}&key=${YOUTUBE_API_KEY}`);
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      channelId = data.items[0].id;
    } else {
      const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelIdentifier)}&key=${YOUTUBE_API_KEY}`);
      const searchData = await searchRes.json();
      if (searchData.items && searchData.items.length > 0) {
        channelId = searchData.items[0].snippet.channelId;
      } else {
        throw new Error('YouTubeチャンネルが見つかりませんでした');
      }
    }
  }

  const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`);
  const channelData = await channelRes.json();
  if (!channelData.items || channelData.items.length === 0) throw new Error('チャンネル情報の取得に失敗しました');

  const channelName = channelData.items[0].snippet.title;
  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

  const playlistRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`);
  const playlistData = await playlistRes.json();
  if (!playlistData.items) return [];

  const videoIds = playlistData.items.map(item => item.contentDetails.videoId).filter(Boolean);
  if (!videoIds.length) return [];

  const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`);
  const detailsData = await detailsRes.json();
  if (!detailsData.items) return [];

  const durationSeconds = (iso) => {
    const match = String(iso || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    return (Number(match[1] || 0) * 3600) + (Number(match[2] || 0) * 60) + Number(match[3] || 0);
  };

  return detailsData.items.map(video => {
    const videoId = video.id;
    const snippet = video.snippet || {};
    const title = snippet.title || '';
    const description = snippet.description || '';
    const tags = Array.isArray(snippet.tags) ? snippet.tags : [];
    const publishedAt = snippet.publishedAt;
    const thumbnail = snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const liveDetails = video.liveStreamingDetails || null;
    const liveBroadcastContent = snippet.liveBroadcastContent || 'none';
    const durationISO = video.contentDetails?.duration || '';
    const totalSeconds = durationSeconds(durationISO);

    let liveStatus = 'none';
    let scheduledStartTime = null;
    let wasEverLive = false;

    if (liveDetails) {
      if (liveDetails.actualEndTime) {
        liveStatus = 'completed';
        wasEverLive = true;
      } else if (liveDetails.actualStartTime || liveBroadcastContent === 'live') {
        liveStatus = 'live';
        wasEverLive = true;
      } else if (liveDetails.scheduledStartTime || liveBroadcastContent === 'upcoming') {
        liveStatus = 'upcoming';
        scheduledStartTime = new Date(liveDetails.scheduledStartTime || Date.now());
      }
    }

    const metaText = `${title}\n${description}\n${tags.join(' ')}`.toLowerCase();

    // YouTube Data APIには公開動画の「これはShorts」という専用フラグや、
    // 一般公開動画の縦横アスペクト比が返る保証がないため、durationだけでは判定しない。
    // #shorts / Shorts / ショート の明示メタデータを優先して誤分類を減らす。
    const shortMarker = /(^|[\s#\[【])shorts?([\s#\]】]|$)|ショート動画|youtube shorts/i.test(metaText);
    const isShort = Boolean(shortMarker && totalSeconds > 0 && totalSeconds <= 180 && !liveDetails);

    // Data APIのliveStreamingDetailsはライブとプレミア公開の双方で付くため、
    // 公開APIだけでは両者を100%識別できない。タイトル/説明/タグの明示表現を使い、
    // プレミア公開は「動画」側へ寄せる。
    const isPremiere = /プレミア公開|プレミア配信|premiere\b|premiered\b/i.test(metaText);
    const isLiveBroadcast = Boolean(liveDetails && !isPremiere);

    return {
      videoId,
      title,
      link: `https://www.youtube.com/watch?v=${videoId}`,
      pubDate: new Date(publishedAt),
      channelName,
      thumbnail,
      isShort,
      isPremiere,
      isLiveBroadcast,
      liveBroadcastContent,
      liveStatus,
      scheduledStartTime,
      durationISO,
      totalSeconds,
      liveDetails,
      wasEverLive
    };
  });
}

// --- 天気機能 ---
function initWeatherUI() {
  const weatherSection = document.getElementById('weather-section') || document.querySelector('.weather-section') || document.getElementById('weather-container')?.parentNode;
  
  if (!weatherSection) return;

  weatherSection.innerHTML = `
    <div class="section-header">
      <h2>天気</h2>
      <div class="action-buttons">
        <button id="add-weather-btn" class="btn primary">追加</button>
        <button id="edit-weather-btn" class="btn warning">編集</button>
        <button id="refresh-weather-btn" class="btn refresh">更新</button>
      </div>
    </div>
    
    <div id="weather-tabs" style="display: flex; gap: 4px; overflow-x: auto; margin-bottom: 12px; border-bottom: 1px solid var(--border-color, #ccc); padding-bottom: 4px;"></div>
    
    <div id="weather-info-box" style="background: var(--card-bg, #fff); border-radius: 8px; padding: 12px; border: 1px solid var(--border-color, #e0e0e0);">
      <div id="weather-area-select-container" style="margin-bottom: 8px;"></div>
      <div id="weather-data-container"></div>
    </div>

    <div style="display: flex; gap: 8px; margin-top: 12px;">
      <button id="weather-3day-btn" class="btn ${currentWeatherMode === '3day' ? 'active' : ''}" style="flex: 1; padding: 8px;">3日間</button>
      <button id="weather-1week-btn" class="btn ${currentWeatherMode === '1week' ? 'active' : ''}" style="flex: 1; padding: 8px;">1週間</button>
    </div>
  `;

  document.getElementById('add-weather-btn').onclick = openAddWeatherModal;
  document.getElementById('edit-weather-btn').onclick = openEditWeatherModal;
  document.getElementById('refresh-weather-btn').onclick = () => renderWeatherData();

  const btn3day = document.getElementById('weather-3day-btn');
  const btn1week = document.getElementById('weather-1week-btn');

  btn3day.onclick = () => {
    currentWeatherMode = '3day';
    btn3day.classList.add('active');
    btn1week.classList.remove('active');
    currentAreaSubIndex = 0;
    renderWeatherData();
  };

  btn1week.onclick = () => {
    currentWeatherMode = '1week';
    btn1week.classList.add('active');
    btn3day.classList.remove('active');
    currentAreaSubIndex = 0;
    renderWeatherData();
  };

  renderWeatherTabs();
  renderWeatherData();
}

function renderWeatherTabs() {
  const tabsContainer = document.getElementById('weather-tabs');
  if (!tabsContainer) return;
  tabsContainer.innerHTML = '';

  if (weatherLocations.length === 0) {
    tabsContainer.innerHTML = '<span style="font-size: 12px; color: #888;">登録されている地域がありません</span>';
    return;
  }

  if (currentWeatherIdx >= weatherLocations.length) {
    currentWeatherIdx = 0;
  }

  weatherLocations.forEach((loc, idx) => {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${idx === currentWeatherIdx ? 'active' : ''}`;
    btn.style.cssText = "padding: 4px 12px; border: 1px solid #ccc; border-radius: 16px; background: #fff; cursor: pointer; font-size: 13px; white-space: nowrap;";
    if (idx === currentWeatherIdx) {
      btn.style.background = "#007aff";
      btn.style.color = "#fff";
      btn.style.borderColor = "#007aff";
    }
    btn.textContent = loc.name;
    btn.onclick = () => {
      currentWeatherIdx = idx;
      currentAreaSubIndex = 0;
      renderWeatherTabs();
      renderWeatherData();
    };
    tabsContainer.appendChild(btn);
  });
}

function toYYYYMMDD(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function renderWeatherData() {
  const container = document.getElementById('weather-data-container');
  const areaSelectContainer = document.getElementById('weather-area-select-container');
  if (!container) return;

  if (weatherLocations.length === 0) {
    if (areaSelectContainer) areaSelectContainer.innerHTML = '';
    container.innerHTML = '<div style="text-align:center; padding: 16px; color:#888;">追加ボタンから地域を登録してください。</div>';
    return;
  }

  const loc = weatherLocations[currentWeatherIdx];
  if (!loc || !loc.code) {
    if (areaSelectContainer) areaSelectContainer.innerHTML = '';
    container.innerHTML = '<div style="text-align:center; padding: 16px; color:#888;">地域コードが無効です。</div>';
    return;
  }

  const normalizedCode = normalizeJmaForecastCode(loc.code);
  if (normalizedCode !== String(loc.code)) {
    loc.code = normalizedCode;
    saveStoredFeeds('weatherLocations', weatherLocations);
  }

  container.innerHTML = '<div class="loading" style="text-align:center; padding:16px;">天気情報を読み込み中...</div>';

  const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
  const url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${loc.code}.json`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("気象庁API取得エラー");
    const data = await res.json();

    const json0 = data[0];
    const json1 = data[1];

    if (!json0 || !json0.timeSeries) throw new Error("データ構造エラー");

    const ts0 = json0.timeSeries[0];
    const ts1 = json0.timeSeries[1];
    const ts2 = json0.timeSeries[2];

    const areas = ts0 ? ts0.areas : [];
    if (areas.length === 0) throw new Error("エリア情報が見つかりません");
    if (currentAreaSubIndex >= areas.length) currentAreaSubIndex = 0;

    if (areaSelectContainer) {
      if (currentWeatherMode === '3day' && areas.length > 1) {
        let opts = areas.map((a, i) => `<option value="${i}" ${i === currentAreaSubIndex ? 'selected' : ''}>${a.area.name}</option>`).join('');
        areaSelectContainer.innerHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:12px; color:#666;">地域切替:</span>
            <select id="jma-area-select" style="padding:2px 8px; font-size:12px; border-radius:4px; border:1px solid #ccc;">${opts}</select>
          </div>
        `;
        document.getElementById('jma-area-select').onchange = (e) => {
          currentAreaSubIndex = parseInt(e.target.value, 10);
          renderWeatherData();
        };
      } else {
        areaSelectContainer.innerHTML = '';
      }
    }

    const weatherArea = areas[currentAreaSubIndex];
    const weatherCodes = weatherArea ? weatherArea.weatherCodes : [];
    const timeDefines0 = ts0.timeDefines || [];

    const popTimes = ts1 ? ts1.timeDefines || [] : [];
    const popArea = ts1 && ts1.areas ? ts1.areas[currentAreaSubIndex] || ts1.areas[0] : null;
    const pops = popArea ? popArea.pops || [] : [];

    const popMapByDate = {};
    popTimes.forEach((tStr, idx) => {
      const d = new Date(tStr);
      const dateKey = toYYYYMMDD(d);
      const startHour = String(d.getHours()).padStart(2, '0');
      const endHour = String((d.getHours() + 6) % 24).padStart(2, '0');
      const label = `${startHour}-${endHour}`;
      const val = pops[idx] !== undefined && pops[idx] !== "" ? pops[idx] : "--";

      if (!popMapByDate[dateKey]) {
        popMapByDate[dateKey] = [];
      }
      popMapByDate[dateKey].push({ label, val: parseInt(val, 10) });
    });

    const tempArea2 = ts2 && ts2.areas ? ts2.areas[0] : null;
    const tempTimes2 = ts2 ? ts2.timeDefines || [] : [];
    const temps2 = tempArea2 ? tempArea2.temps || [] : [];

    const tempMapByDate = {};
    tempTimes2.forEach((tStr, idx) => {
      const d = new Date(tStr);
      const dateKey = toYYYYMMDD(d);
      if (!tempMapByDate[dateKey]) tempMapByDate[dateKey] = [];
      tempMapByDate[dateKey].push(temps2[idx]);
    });

    const weekTs0 = json1 && json1.timeSeries ? json1.timeSeries[0] : null;
    const weekTs1 = json1 && json1.timeSeries ? json1.timeSeries[1] : null;
    const weekWeatherArea = weekTs0 && weekTs0.areas ? weekTs0.areas[0] : null;
    const weekTempArea = weekTs1 && weekTs1.areas ? weekTs1.areas[0] : null;

    const weekTimeDefines = weekTs0 ? weekTs0.timeDefines || [] : [];
    const weekWeatherCodes = weekWeatherArea ? weekWeatherArea.weatherCodes || [] : [];
    const weekPops = weekWeatherArea ? weekWeatherArea.pops || [] : [];
    const weekTempsMin = weekTempArea ? weekTempArea.tempsMin || [] : [];
    const weekTempsMax = weekTempArea ? weekTempArea.tempsMax || [] : [];

    const weekDataMap = {};
    weekTimeDefines.forEach((tStr, idx) => {
      const d = new Date(tStr);
      const dateKey = toYYYYMMDD(d);
      weekDataMap[dateKey] = {
        weatherCode: weekWeatherCodes[idx],
        pop: weekPops[idx],
        tempMin: weekTempsMin[idx],
        tempMax: weekTempsMax[idx]
      };
    });

    let itemsHtml = '';

    if (currentWeatherMode === '3day') {
      timeDefines0.forEach((t, idx) => {
        const d = new Date(t);
        const dateKey = toYYYYMMDD(d);

        const colorStyle = getDateColorClassOrStyle(d);
        const dateStr = `${d.getMonth() + 1}月${d.getDate()}日`;
        const dayStr = `（${dayOfWeek[d.getDay()]}）`;

        const hourNum = d.getHours();
        const isNight = hourNum < 6 || hourNum >= 18;
        const code = weatherCodes[idx] || "100";
        const iconUrl = getJmaWeatherIconUrl(code, isNight);

        const popItems = popMapByDate[dateKey] || [];
        let popHtml = '';
        if (popItems.length > 0) {
          popHtml = popItems.map(item => `
            <div style="display: flex; justify-content: space-between; gap: 4px; font-size: 10px; color: #007aff; line-height: 1.2;">
              <span style="color: #666;">${item.label}</span>
              <span style="font-weight: bold;">${isNaN(item.val) ? '--' : item.val + '%'}</span>
            </div>
          `).join('');
        } else if (weekDataMap[dateKey] && weekDataMap[dateKey].pop !== undefined && weekDataMap[dateKey].pop !== "") {
          const popVal = weekDataMap[dateKey].pop;
          popHtml = `
            <div style="font-size: 11px; color: #007aff; font-weight: bold; text-align: center; padding: 2px 0;">
              ${popVal}%
            </div>
          `;
        } else {
          popHtml = `<div style="font-size: 11px; color: #999; text-align: center;">--</div>`;
        }

        let tempHtml = '';
        const dayTemps = tempMapByDate[dateKey];

        if (dayTemps && dayTemps.length >= 2) {
          const temp9 = dayTemps[0] !== undefined ? dayTemps[0] : "--";
          const tempMax = dayTemps[1] !== undefined ? dayTemps[1] : "--";
          tempHtml = `
            <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #eee;">
              <div style="font-size: 10px; color: #007aff;">朝9時: ${temp9}°C</div>
              <div style="font-size: 11px; color: #ff3b30; font-weight: bold;">最高: ${tempMax}°C</div>
            </div>
          `;
        } else if (weekDataMap[dateKey]) {
          const minVal = weekDataMap[dateKey].tempMin || "--";
          const maxVal = weekDataMap[dateKey].tempMax || "--";
          tempHtml = `
            <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #eee;">
              <div style="font-size: 10px; color: #007aff;">最低: ${minVal}°C</div>
              <div style="font-size: 11px; color: #ff3b30; font-weight: bold;">最高: ${maxVal}°C</div>
            </div>
          `;
        } else {
          tempHtml = `
            <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #eee;">
              <div style="font-size: 10px; color: #999;">--</div>
            </div>
          `;
        }

        itemsHtml += `
          <div style="flex: 0 0 auto; width: 105px; text-align: center; border-right: 1px solid #eee; padding: 0 6px; box-sizing: border-box;">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 2px; ${colorStyle}">
              ${dateStr}${dayStr}
            </div>
            <div style="margin: 4px 0;">
              <img src="${iconUrl}" style="width: 36px; height: 36px; display: block; margin: 0 auto;" alt="weather">
            </div>
            
            <div style="background: #f4f8ff; padding: 4px; border-radius: 4px; margin: 4px 0;">
              <div style="font-size: 9px; color: #007aff; font-weight: bold; margin-bottom: 2px;">☔ 降水確率</div>
              ${popHtml}
            </div>

            ${tempHtml}
          </div>
        `;
      });

    } else {
      const allDatesList = [];
      const dateKeySet = new Set();

      timeDefines0.forEach((t, idx) => {
        const d = new Date(t);
        const dateKey = toYYYYMMDD(d);
        if (!dateKeySet.has(dateKey)) {
          dateKeySet.add(dateKey);
          allDatesList.push({
            date: d,
            dateKey: dateKey,
            weatherCode: weatherCodes[idx]
          });
        }
      });

      weekTimeDefines.forEach((t, idx) => {
        const d = new Date(t);
        const dateKey = toYYYYMMDD(d);
        if (!dateKeySet.has(dateKey)) {
          dateKeySet.add(dateKey);
          allDatesList.push({
            date: d,
            dateKey: dateKey,
            weatherCode: weekWeatherCodes[idx]
          });
        }
      });

      allDatesList.forEach(item => {
        const d = item.date;
        const dateKey = item.dateKey;

        const colorStyle = getDateColorClassOrStyle(d);
        const dateStr = `${d.getMonth() + 1}月${d.getDate()}日`;
        const dayStr = `（${dayOfWeek[d.getDay()]}）`;

        const code = item.weatherCode || (weekDataMap[dateKey] ? weekDataMap[dateKey].weatherCode : "100");
        const iconUrl = getJmaWeatherIconUrl(code, false);

        let popValStr = "--";
        const popItems = popMapByDate[dateKey] || [];

        if (popItems.length > 0) {
          const validPops = popItems.map(p => p.val).filter(v => !isNaN(v));
          if (validPops.length > 0) {
            const avg = Math.round(validPops.reduce((a, b) => a + b, 0) / validPops.length);
            popValStr = `${avg}%`;
          }
        } else if (weekDataMap[dateKey] && weekDataMap[dateKey].pop !== undefined && weekDataMap[dateKey].pop !== "") {
          popValStr = `${weekDataMap[dateKey].pop}%`;
        }

        let tempMinStr = "--";
        let tempMaxStr = "--";
        const dayTemps = tempMapByDate[dateKey];

        if (dayTemps && dayTemps.length >= 2) {
          tempMinStr = dayTemps[0] !== undefined ? `${dayTemps[0]}°C` : "--";
          tempMaxStr = dayTemps[1] !== undefined ? `${dayTemps[1]}°C` : "--";
        } else if (weekDataMap[dateKey]) {
          tempMinStr = weekDataMap[dateKey].tempMin !== undefined && weekDataMap[dateKey].tempMin !== "" ? `${weekDataMap[dateKey].tempMin}°C` : "--";
          tempMaxStr = weekDataMap[dateKey].tempMax !== undefined && weekDataMap[dateKey].tempMax !== "" ? `${weekDataMap[dateKey].tempMax}°C` : "--";
        }

        itemsHtml += `
          <div style="flex: 0 0 auto; width: 95px; text-align: center; border-right: 1px solid #eee; padding: 0 6px; box-sizing: border-box;">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 2px; ${colorStyle}">
              ${dateStr}${dayStr}
            </div>
            <div style="margin: 4px 0;">
              <img src="${iconUrl}" style="width: 36px; height: 36px; display: block; margin: 0 auto;" alt="weather">
            </div>
            <div style="font-size: 11px; color: #007aff; font-weight: bold; margin-bottom: 4px;">☔ ${popValStr}</div>
            <div style="font-size: 10px; color: #666;">
              <span style="color: #007aff;">${tempMinStr}</span> / <span style="color: #ff3b30;">${tempMaxStr}</span>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = `
      <div style="display: flex; overflow-x: auto; padding-bottom: 8px; scrollbar-width: thin;">
        ${itemsHtml}
      </div>
    `;

  } catch (err) {
    console.error(err);
    if (areaSelectContainer) areaSelectContainer.innerHTML = '';
    container.innerHTML = `
      <div style="text-align:center; padding:16px; color:red;">
        天気データの取得に失敗しました
        <div style="font-size:10px; opacity:.7; margin-top:4px;">気象庁コード: ${String(loc.code || '')}</div>
      </div>
    `;
  }
}

function resetModalButtons() {
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');
  
  if (cancelBtn) {
    cancelBtn.style.display = 'inline-block';
    cancelBtn.textContent = 'キャンセル';
  }
  if (submitBtn) {
    submitBtn.style.display = 'inline-block';
    submitBtn.disabled = false;
    submitBtn.textContent = '保存';
  }
  
  const addRowBtn = document.getElementById('modal-add-row-btn');
  if (addRowBtn) addRowBtn.remove();
  const extraBtn = document.getElementById('modal-nitter-btn');
  if (extraBtn) extraBtn.remove();
}

function openAddWeatherModal() {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');

  if (!modal || !modalTitle || !modalBody || !cancelBtn || !submitBtn) return;

  resetModalButtons();

  modalTitle.textContent = "地名の追加";
  modalBody.innerHTML = '';

  const createLocationRow = () => {
    const row = document.createElement('div');
    row.className = 'modal-weather-row';
    row.style.cssText = "display: flex; gap: 8px; margin-bottom: 8px; align-items: center;";
    
    row.innerHTML = `
      <input type="text" class="input-location" placeholder="地名を入力 (例: 京都、高松)" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #ccc;" autocomplete="off">
      <button type="button" class="btn danger remove-weather-row-btn" style="padding: 4px 8px; display: none;">✕</button>
    `;

    const removeBtn = row.querySelector('.remove-weather-row-btn');
    removeBtn.onclick = () => {
      row.remove();
      updateWeatherRowButtons();
    };

    return row;
  };

  const updateWeatherRowButtons = () => {
    const rows = modalBody.querySelectorAll('.modal-weather-row');
    rows.forEach(r => {
      const btn = r.querySelector('.remove-weather-row-btn');
      btn.style.display = rows.length > 1 ? 'inline-block' : 'none';
    });
  };

  modalBody.appendChild(createLocationRow());

  const addRowBtn = document.createElement('button');
  addRowBtn.id = 'modal-add-row-btn';
  addRowBtn.type = 'button';
  addRowBtn.className = 'btn';
  addRowBtn.textContent = '+ 入力欄を追加';
  
  addRowBtn.onclick = (e) => {
    e.preventDefault();
    modalBody.appendChild(createLocationRow());
    updateWeatherRowButtons();
  };

  cancelBtn.parentNode.insertBefore(addRowBtn, cancelBtn);

  cancelBtn.onclick = () => {
    resetModalButtons();
    modal.classList.add('hidden');
  };

  submitBtn.onclick = async () => {
    const inputs = modalBody.querySelectorAll('.input-location');
    const queries = [];
    inputs.forEach(inp => {
      const val = inp.value.trim();
      if (val) queries.push(val);
    });

    if (queries.length === 0) {
      alert("地名を入力してください");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "確認中...";

    const resolvedLocations = [];

    for (const rawQuery of queries) {
      const result = await processLocationQuery(rawQuery);
      if (result) {
        resolvedLocations.push(result);
      } else {
        resetModalButtons();
        modal.classList.add('hidden');
        return;
      }
    }

    if (resolvedLocations.length > 0) {
      const newIndex = weatherLocations.length;
      weatherLocations.push(...resolvedLocations);
      saveStoredFeeds('weatherLocations', weatherLocations);
      
      currentWeatherIdx = newIndex;

      resetModalButtons();
      modal.classList.add('hidden');

      renderWeatherTabs();
      renderWeatherData();
    } else {
      resetModalButtons();
    }
  };

  modal.classList.remove('hidden');
}

async function processLocationQuery(query) {
  let targetPref = null;
  let isDirectMatch = false;

  if (ALL_PREFECTURES.includes(query)) {
    targetPref = query;
    isDirectMatch = true;
  } else {
    for (const suffix of ["都", "府", "県", "道"]) {
      const cand = query + suffix;
      if (ALL_PREFECTURES.includes(cand)) {
        targetPref = cand;
        break;
      }
    }
  }

  if (targetPref) {
    if (!isDirectMatch) {
      const confirmOk = await showCustomConfirm(`${targetPref}ですか？`, true);
      if (!confirmOk) return null;
    }
    const code = resolveJmaCode(targetPref, query);
    return code ? { name: targetPref, code: code } : null;
  }

  try {
    const geoUrl = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(query)}`;
    const res = await fetch(geoUrl);
    if (!res.ok) throw new Error("APIエラー");
    const data = await res.json();

    if (!data || data.length === 0) {
      await showCustomConfirm("ありません", false);
      return null;
    }

    let foundPref = null;
    for (const item of data) {
      const fullTitle = item.properties.title || '';
      for (const pref of ALL_PREFECTURES) {
        if (fullTitle.startsWith(pref)) {
          foundPref = pref;
          break;
        }
      }
      if (foundPref) break;
    }

    if (foundPref) {
      const confirmOk = await showCustomConfirm(`${foundPref}ですか？`, true);
      if (!confirmOk) return null;

      const code = resolveJmaCode(foundPref, query);
      return code ? { name: foundPref, code: code } : null;
    } else {
      await showCustomConfirm("ありません", false);
      return null;
    }

  } catch (e) {
    console.error(e);
    await showCustomConfirm("ありません", false);
    return null;
  }
}

function resolveJmaCode(prefName, originalQuery) {
  if (prefName === "北海道") {
    for (const key in HOKKAIDO_SUB_AREAS) {
      if (originalQuery.includes(key)) {
        return HOKKAIDO_SUB_AREAS[key];
      }
    }
    return "016000";
  }

  if (prefName === "沖縄県") {
    for (const key in OKINAWA_SUB_AREAS) {
      if (originalQuery.includes(key)) {
        return OKINAWA_SUB_AREAS[key];
      }
    }
    return "471000";
  }

  return JMA_PREF_CODES[prefName] || null;
}

function showCustomConfirm(message, showOk = true) {
  return new Promise((resolve) => {
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('modal-submit-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const addRowBtn = document.getElementById('modal-add-row-btn');

    if (addRowBtn) addRowBtn.style.display = 'none';

    modalTitle.textContent = "確認";
    modalBody.innerHTML = `<div style="text-align: center; padding: 16px; font-size: 16px; font-weight: bold;">${message}</div>`;

    if (showOk) {
      submitBtn.style.display = 'inline-block';
      submitBtn.textContent = 'OK';
      submitBtn.disabled = false;
      submitBtn.onclick = () => resolve(true);
    } else {
      submitBtn.style.display = 'none';
    }

    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => resolve(false);
  });
}

function openEditWeatherModal() {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');

  if (!modal || !modalTitle || !modalBody || !cancelBtn || !submitBtn) return;

  resetModalButtons();

  modalTitle.textContent = "地域の編集";
  cancelBtn.style.display = 'none';
  submitBtn.textContent = '完了';

  const renderList = () => {
    modalBody.innerHTML = '';
    if (weatherLocations.length === 0) {
      modalBody.innerHTML = '<div style="color: #888; font-size: 14px;">登録されていません</div>';
      return;
    }

    weatherLocations.forEach((loc, idx) => {
      const row = document.createElement('div');
      row.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding: 8px; background: #f9f9f9; border-radius: 6px; border: 1px solid #ccc;";

      const nameSpan = document.createElement('span');
      nameSpan.style.cssText = "font-weight: 500; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";
      nameSpan.textContent = loc.name;

      const btnGroup = document.createElement('div');
      btnGroup.style.cssText = "display: flex; gap: 4px;";

      const upBtn = document.createElement('button');
      upBtn.className = 'btn';
      upBtn.style.padding = '2px 8px';
      upBtn.textContent = '↑';
      upBtn.disabled = idx === 0;
      upBtn.onclick = () => {
        const temp = weatherLocations[idx];
        weatherLocations[idx] = weatherLocations[idx - 1];
        weatherLocations[idx - 1] = temp;
        saveStoredFeeds('weatherLocations', weatherLocations);
        renderList();
        renderWeatherTabs();
        renderWeatherData();
      };

      const downBtn = document.createElement('button');
      downBtn.className = 'btn';
      downBtn.style.padding = '2px 8px';
      downBtn.textContent = '↓';
      downBtn.disabled = idx === weatherLocations.length - 1;
      downBtn.onclick = () => {
        const temp = weatherLocations[idx];
        weatherLocations[idx] = weatherLocations[idx + 1];
        weatherLocations[idx + 1] = temp;
        saveStoredFeeds('weatherLocations', weatherLocations);
        renderList();
        renderWeatherTabs();
        renderWeatherData();
      };

      const delBtn = document.createElement('button');
      delBtn.className = 'btn danger';
      delBtn.style.padding = '2px 8px';
      delBtn.textContent = '削除';
      delBtn.onclick = () => {
        weatherLocations.splice(idx, 1);
        if (currentWeatherIdx >= weatherLocations.length) {
          currentWeatherIdx = Math.max(0, weatherLocations.length - 1);
        }
        saveStoredFeeds('weatherLocations', weatherLocations);
        renderList();
        renderWeatherTabs();
        renderWeatherData();
      };

      btnGroup.appendChild(upBtn);
      btnGroup.appendChild(downBtn);
      btnGroup.appendChild(delBtn);

      row.appendChild(nameSpan);
      row.appendChild(btnGroup);
      modalBody.appendChild(row);
    });
  };

  submitBtn.onclick = () => {
    resetModalButtons();
    modal.classList.add('hidden');
  };

  renderList();
  modal.classList.remove('hidden');
}

// --- ニュース / 知識：Swiper対応 + AI要約 ---
let newsFeedSwiper = null;
let knowledgeFeedSwiper = null;
let currentNewsFeedIdx = 0;
let currentKnowledgeFeedIdx = 0;

const feedItemsCache = {
  news: new Map(),
  knowledge: new Map()
};

const feedLoadPromises = {
  news: new Map(),
  knowledge: new Map()
};

const summaryCache = new Map();
const summaryChatHistories = new Map();

let summarySwiper = null;
let summaryContext = null;
let summaryBodyScrollY = 0;
let summaryFeedSwitching = false;
let summaryEdgeClosing = false;

const SUMMARY_EDGE_SWIPE_WIDTH = 30;

const ALL_FEED_URL = '__ALL__';

function getStoredFeedsByType(type) {
  return type === 'news' ? newsFeeds : knowledgeFeeds;
}

function getFeedsByType(type) {
  const stored = getStoredFeedsByType(type);
  if (!stored.length) return [];
  return [
    { name: 'All', url: ALL_FEED_URL, virtualAll: true },
    ...stored
  ];
}

function mergeFeedItemsChronologically(groups) {
  const seen = new Set();
  return groups.flat().filter(item => {
    const key = String(item?.link || '').replace(/[?#].*$/, '') || String(item?.title || '').toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => {
    const ad = a?.pubDate instanceof Date ? a.pubDate.getTime() : new Date(a?.pubDate || 0).getTime();
    const bd = b?.pubDate instanceof Date ? b.pubDate.getTime() : new Date(b?.pubDate || 0).getTime();
    return bd - ad;
  });
}

function getFeedContentId(type) {
  return type === 'news' ? 'news-content' : 'knowledge-content';
}

function getFeedTabsId(type) {
  return type === 'news' ? 'news-tabs' : 'knowledge-tabs';
}

function getFeedSwiper(type) {
  return type === 'news' ? newsFeedSwiper : knowledgeFeedSwiper;
}

function setFeedSwiper(type, swiper) {
  if (type === 'news') {
    newsFeedSwiper = swiper;
  } else {
    knowledgeFeedSwiper = swiper;
  }
}


function getCurrentFeedIndex(type) {
  return type === 'news' ? currentNewsFeedIdx : currentKnowledgeFeedIdx;
}

function setCurrentFeedIndex(type, index) {
  if (type === 'news') {
    currentNewsFeedIdx = index;
  } else {
    currentKnowledgeFeedIdx = index;
  }
}

function setCurrentFeedUrl(type, url) {
  if (type === 'news') {
    currentNewsUrl = url;
  } else {
    currentKnowledgeUrl = url;
  }
}

function getFeedLoadingText(type) {
  return type === 'news' ? 'ニュースを読み込み中...' : '知識を読み込み中...';
}

function getFeedFailureText(type) {
  return type === 'news' ? 'ニュースの取得に失敗しました' : '知識の取得に失敗しました';
}

function initNews() {
  initSwipeFeedSection('news');
}

function initKnowledge() {
  initSwipeFeedSection('knowledge');
}

function initSwipeFeedSection(type) {
  const feeds = getFeedsByType(type);
  const container = document.getElementById(getFeedContentId(type));
  if (!container) return;

  if (typeof container._feedSwipeCleanup === 'function') {
    container._feedSwipeCleanup();
    container._feedSwipeCleanup = null;
  }

  const oldSwiper = getFeedSwiper(type);
  if (oldSwiper) {
    oldSwiper.destroy(true, true);
    setFeedSwiper(type, null);
  }

  container.classList.add('feed-swiper', 'swiper');

  if (feeds.length === 0) {
    container.classList.remove('feed-swiper', 'swiper');
    container.innerHTML = '<div class="loading">配信先を追加してください</div>';
    renderTabs(getFeedTabsId(type), feeds, () => {});
    return;
  }

  const safeIndex = Math.min(getCurrentFeedIndex(type), feeds.length - 1);
  setCurrentFeedIndex(type, Math.max(0, safeIndex));

  const wrapper = document.createElement('div');
  wrapper.className = 'swiper-wrapper';

  feeds.forEach((feed, index) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide feed-swiper-slide';
    slide.dataset.feedIndex = String(index);

    const scrollArea = document.createElement('div');
    scrollArea.className = 'feed-slide-scroll';
    scrollArea.dataset.feedIndex = String(index);
    scrollArea.innerHTML = `<div class="loading">${getFeedLoadingText(type)}</div>`;

    slide.appendChild(scrollArea);
    wrapper.appendChild(slide);
  });

  container.innerHTML = '';
  container.appendChild(wrapper);

  renderTabs(getFeedTabsId(type), feeds, (_url, index) => {
    activateFeedIndex(type, index);
  });

  if (typeof Swiper !== 'function') {
    console.error('Swiper.js が読み込まれていません');
    loadFeedContent(type, getCurrentFeedIndex(type));
    return;
  }

  // iPhoneでは「横Swiperの中に縦スクロール」があるため、
  // Swiper自身に方向判定を任せつつ、touch-action: pan-y で縦スクロールをSafariへ渡す。
  const swiper = new Swiper(`#${getFeedContentId(type)}`, {
    direction: 'horizontal',
    slidesPerView: 1,
    initialSlide: getCurrentFeedIndex(type),
    speed: 260,
    resistance: true,
    resistanceRatio: 0.65,
    allowTouchMove: true,
    touchEventsTarget: 'container',
    threshold: 8,
    touchAngle: 55,
    touchStartPreventDefault: false,
    touchMoveStopPropagation: false,
    passiveListeners: false,
    preventClicks: true,
    preventClicksPropagation: true,
    preventInteractionOnTransition: true,
    watchSlidesProgress: true,
    on: {
      slideChange() {
        activateFeedIndex(type, this.activeIndex, true);
      }
    }
  });

  setFeedSwiper(type, swiper);
  installFeedSwipeFallback(type, container, swiper);
  activateFeedIndex(type, getCurrentFeedIndex(type), true);
}

// SwiperのドラッグがiOS Safari側に取り込まれた場合の保険。
// 横方向が明確なジェスチャーだけ、指を離した時点でSwiperを1枚送る。
function installFeedSwipeFallback(type, container, swiper) {
  if (!container || !swiper) return;

  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let startIndex = 0;
  let tracking = false;

  const onStart = (event) => {
    if (event.touches?.length > 1) return;
    const point = event.touches?.[0] || event;
    startX = point.clientX || 0;
    startY = point.clientY || 0;
    startTime = Date.now();
    startIndex = swiper.activeIndex;
    tracking = true;
  };

  const onEnd = (event) => {
    if (!tracking) return;
    tracking = false;

    const point = event.changedTouches?.[0] || event;
    const dx = (point.clientX || 0) - startX;
    const dy = (point.clientY || 0) - startY;
    const elapsed = Math.max(1, Date.now() - startTime);
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const velocityX = absX / elapsed;

    if (absX <= absY * 1.25) return;
    if (absX < 56 && velocityX < 0.35) return;

    // Swiper自身のtouch/pointer処理が終わるのを1フレーム待つ。
    // すでにSwiperが切り替えていれば、二重移動しない。
    requestAnimationFrame(() => {
      if (swiper.destroyed || swiper.activeIndex !== startIndex) return;

      container.dataset.suppressClickUntil = String(Date.now() + 350);

      if (dx < 0 && !swiper.isEnd) {
        swiper.slideNext();
      } else if (dx > 0 && !swiper.isBeginning) {
        swiper.slidePrev();
      }
    });
  };

  const onCancel = () => { tracking = false; };
  const onClick = (event) => {
    const until = Number(container.dataset.suppressClickUntil || 0);
    if (Date.now() < until) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  container.addEventListener('touchstart', onStart, { passive: true });
  container.addEventListener('touchend', onEnd, { passive: true });
  container.addEventListener('touchcancel', onCancel, { passive: true });
  container.addEventListener('click', onClick, true);

  container._feedSwipeCleanup = () => {
    container.removeEventListener('touchstart', onStart);
    container.removeEventListener('touchend', onEnd);
    container.removeEventListener('touchcancel', onCancel);
    container.removeEventListener('click', onClick, true);
  };
}

function activateFeedIndex(type, index, fromSwiper = false) {
  const feeds = getFeedsByType(type);
  if (!feeds.length) return;

  const safeIndex = Math.max(0, Math.min(index, feeds.length - 1));
  setCurrentFeedIndex(type, safeIndex);
  setCurrentFeedUrl(type, feeds[safeIndex].url);

  const tabs = document.getElementById(getFeedTabsId(type));
  if (tabs) {
    const buttons = Array.from(tabs.querySelectorAll('.tab-btn'));
    buttons.forEach((btn, idx) => btn.classList.toggle('active', idx === safeIndex));
    const activeBtn = buttons[safeIndex];
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  const swiper = getFeedSwiper(type);
  if (!fromSwiper && swiper && swiper.activeIndex !== safeIndex) {
    swiper.slideTo(safeIndex);
  }

  loadFeedContent(type, safeIndex);
}

async function loadNewsContent(url) {
  const foundIndex = getFeedsByType('news').findIndex(feed => feed.url === url);
  activateFeedIndex('news', foundIndex >= 0 ? foundIndex : 0);
}

async function loadKnowledgeContent(url) {
  const foundIndex = getFeedsByType('knowledge').findIndex(feed => feed.url === url);
  activateFeedIndex('knowledge', foundIndex >= 0 ? foundIndex : 0);
}

async function loadFeedContent(type, index, { forceRefresh = false } = {}) {
  const feeds = getFeedsByType(type);
  const feed = feeds[index];
  if (!feed) return;

  const container = document.getElementById(getFeedContentId(type));
  const target = container?.querySelector(`.feed-slide-scroll[data-feed-index="${index}"]`);
  if (!target) return;

  setCurrentFeedUrl(type, feed.url);

  if (forceRefresh) {
    feedItemsCache[type].delete(feed.url);
    feedLoadPromises[type].delete(feed.url);
  }

  const cachedItems = feedItemsCache[type].get(feed.url);
  if (cachedItems && !forceRefresh) {
    renderFeedItems(type, index, cachedItems);
    return;
  }

  const existingPromise = feedLoadPromises[type].get(feed.url);
  if (existingPromise && !forceRefresh) {
    try {
      const items = await existingPromise;
      renderFeedItems(type, index, items);
    } catch (_) {}
    return;
  }

  target.innerHTML = `<div class="loading">${getFeedLoadingText(type)}</div>`;

  let loadPromise;
  if (feed.virtualAll) {
    // Allは保存された全タブを同時取得→重複除外→公開日時の新しい順に統合する。
    const actualFeeds = getStoredFeedsByType(type);
    loadPromise = Promise.all(
      actualFeeds.map(async actualFeed => {
        if (forceRefresh) {
          feedItemsCache[type].delete(actualFeed.url);
          feedLoadPromises[type].delete(actualFeed.url);
        }
        const cached = feedItemsCache[type].get(actualFeed.url);
        if (cached && !forceRefresh) return cached;
        try {
          const items = await fetchNewsRSS(actualFeed.url, { forceRefresh });
          feedItemsCache[type].set(actualFeed.url, items);
          return items;
        } catch (err) {
          console.warn(`[${type}:All] ${actualFeed.name} failed`, err);
          return [];
        }
      })
    ).then(groups => mergeFeedItemsChronologically(groups).slice(0, 150));
  } else {
    loadPromise = fetchNewsRSS(feed.url, { forceRefresh });
  }

  feedLoadPromises[type].set(feed.url, loadPromise);

  try {
    const items = await loadPromise;
    feedItemsCache[type].set(feed.url, items);

    if (items.length === 0) {
      target.innerHTML = '<div class="loading">記事が見つかりませんでした</div>';
      return;
    }

    renderFeedItems(type, index, items);
  } catch (err) {
    console.error(err);
    target.innerHTML = `<div class="loading">${getFeedFailureText(type)}<br><small>${escapeHtmlAttribute(err?.message || '')}</small></div>`;
  } finally {
    feedLoadPromises[type].delete(feed.url);
  }
}

async function refreshFeedSection(type) {
  const feeds = getFeedsByType(type);
  if (!feeds.length) return;

  feedItemsCache[type].clear();
  feedLoadPromises[type].clear();

  const index = Math.max(0, Math.min(getCurrentFeedIndex(type), feeds.length - 1));
  await loadFeedContent(type, index, { forceRefresh: true });
}

function renderFeedItems(type, feedIndex, items) {
  const container = document.getElementById(getFeedContentId(type));
  const target = container?.querySelector(`.feed-slide-scroll[data-feed-index="${feedIndex}"]`);
  if (!target) return;

  target.innerHTML = '';

  items.forEach((item, itemIndex) => {
    const newsDiv = document.createElement('div');
    newsDiv.className = 'news-item';

    const link = document.createElement('a');
    link.href = item.link || '#';
    link.target = '_blank';
    link.rel = 'noopener';
    link.className = 'news-link';
    link.textContent = item.title || '無題';

    const right = document.createElement('div');
    right.className = 'news-item-actions';

    const summaryBtn = document.createElement('button');
    summaryBtn.type = 'button';
    summaryBtn.className = 'summary-icon-btn';
    summaryBtn.setAttribute('aria-label', `${item.title || '記事'}をAIで要約`);
    summaryBtn.innerHTML = '<img src="icons/summary.png" alt="" class="summary-icon-img">';
    summaryBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openSummaryOverlay(type, feedIndex, itemIndex);
    });

    const time = document.createElement('div');
    time.className = 'news-time';
    time.textContent = formatCustomDate(item.pubDate);

    right.appendChild(summaryBtn);
    right.appendChild(time);

    newsDiv.appendChild(link);
    newsDiv.appendChild(right);
    target.appendChild(newsDiv);
  });
}

function initSummaryUI() {
  const overlay = document.getElementById('summary-overlay');
  const closeBtn = document.getElementById('summary-close-btn');
  const form = document.getElementById('summary-chat-form');

  if (!overlay || !closeBtn || !form) return;

  closeBtn.addEventListener('click', closeSummaryOverlay);
  form.addEventListener('submit', handleSummaryChatSubmit);

  // 要約画面では上下=記事移動、左右=RSSタブ移動として役割を分離する。
  installSummaryFeedSwipe();
  // 重要ポイント/チャット履歴の内部スクロール中は、親の縦Swiperを停止する。
  installSummaryInnerScrollGuard();
  // iPhone: 左端から右へスワイプするとSafariの戻る操作のように要約画面を閉じる。
  installSummaryEdgeBackGesture();

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.classList.contains('hidden')) {
      closeSummaryOverlay();
    }
  });
}

function installSummaryFeedSwipe() {
  const surface = document.getElementById('summary-swiper');
  if (!surface || surface.dataset.feedSwipeInstalled === '1') return;

  surface.dataset.feedSwipeInstalled = '1';

  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let startTime = 0;
  let tracking = false;
  let direction = '';

  const isInteractiveTarget = (target) => Boolean(
    target?.closest?.('a, button, input, textarea, select, label')
  );

  const onStart = (event) => {
    if (event.touches?.length > 1 || isInteractiveTarget(event.target)) {
      tracking = false;
      return;
    }

    const point = event.touches?.[0];
    if (!point) return;

    // 左端30pxは「戻る/閉じる」ジェスチャー専用に予約する。
    if (point.clientX <= SUMMARY_EDGE_SWIPE_WIDTH) {
      tracking = false;
      return;
    }

    startX = lastX = point.clientX;
    startY = lastY = point.clientY;
    startTime = Date.now();
    tracking = true;
    direction = '';
  };

  const onMove = (event) => {
    if (!tracking) return;

    const point = event.touches?.[0];
    if (!point) return;

    lastX = point.clientX;
    lastY = point.clientY;

    const dx = lastX - startX;
    const dy = lastY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (!direction && Math.max(absX, absY) >= 10) {
      if (absX > absY * 1.3) {
        direction = 'horizontal';
      } else if (absY > absX * 1.15) {
        direction = 'vertical';
      }
    }

    // 横タブ切替と判定した後だけSafariの横ページジェスチャーを抑える。
    // 上下方向はpreventDefaultしないので、記事の上下Swiperやチャット履歴スクロールを邪魔しない。
    if (direction === 'horizontal' && event.cancelable) {
      event.preventDefault();
    }
  };

  const finish = (event) => {
    if (!tracking) return;
    tracking = false;

    const point = event.changedTouches?.[0];
    if (point) {
      lastX = point.clientX;
      lastY = point.clientY;
    }

    const dx = lastX - startX;
    const dy = lastY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const elapsed = Math.max(1, Date.now() - startTime);
    const velocityX = absX / elapsed;

    if (direction !== 'horizontal') return;
    if (absX <= absY * 1.3) return;
    if (absX < 58 && velocityX < 0.32) return;

    surface.dataset.suppressClickUntil = String(Date.now() + 350);

    // 左スワイプ=次タブ、右スワイプ=前タブ
    switchSummaryFeed(dx < 0 ? 1 : -1);
  };

  const cancel = () => {
    tracking = false;
    direction = '';
  };

  const suppressClick = (event) => {
    const until = Number(surface.dataset.suppressClickUntil || 0);
    if (Date.now() < until) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  surface.addEventListener('touchstart', onStart, { passive: true });
  surface.addEventListener('touchmove', onMove, { passive: false });
  surface.addEventListener('touchend', finish, { passive: true });
  surface.addEventListener('touchcancel', cancel, { passive: true });
  surface.addEventListener('click', suppressClick, true);
}



function installSummaryInnerScrollGuard() {
  const surface = document.getElementById('summary-swiper');
  if (!surface || surface.dataset.innerScrollGuardInstalled === '1') return;

  surface.dataset.innerScrollGuardInstalled = '1';
  let guarding = false;

  const isInnerScrollable = (target) => Boolean(
    target?.closest?.('.summary-ai-content, .summary-chat-log')
  );

  const onStart = (event) => {
    if (!isInnerScrollable(event.target)) return;
    guarding = true;
    if (summarySwiper && !summarySwiper.destroyed) {
      summarySwiper.allowTouchMove = false;
    }
  };

  const release = () => {
    if (!guarding) return;
    guarding = false;
    // touchend と同じターンで有効化するとSwiperが終端処理を拾うことがあるため次フレームで戻す。
    requestAnimationFrame(() => {
      if (summarySwiper && !summarySwiper.destroyed && document.getElementById('summary-overlay')?.dataset.edgeSwiping !== '1') {
        summarySwiper.allowTouchMove = true;
      }
    });
  };

  surface.addEventListener('touchstart', onStart, { passive: true, capture: true });
  surface.addEventListener('touchend', release, { passive: true, capture: true });
  surface.addEventListener('touchcancel', release, { passive: true, capture: true });
}

function installSummaryEdgeBackGesture() {
  const overlay = document.getElementById('summary-overlay');
  if (!overlay || overlay.dataset.edgeBackInstalled === '1') return;

  overlay.dataset.edgeBackInstalled = '1';

  let tracking = false;
  let horizontal = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let startTime = 0;

  const resetVisualState = () => {
    overlay.classList.remove('summary-edge-dragging', 'summary-edge-finishing');
    overlay.style.transform = '';
    overlay.style.transition = '';
    overlay.style.willChange = '';
    overlay.style.boxShadow = '';
    overlay.dataset.edgeSwiping = '0';
    if (summarySwiper && !summarySwiper.destroyed) {
      summarySwiper.allowTouchMove = true;
    }
  };

  const onStart = (event) => {
    if (overlay.classList.contains('hidden') || summaryEdgeClosing) return;
    if (event.touches?.length !== 1) return;

    const point = event.touches[0];
    if (point.clientX > SUMMARY_EDGE_SWIPE_WIDTH) return;

    // 入力欄やボタン操作は優先。ただし本文の左端からは戻る操作を許可。
    if (event.target?.closest?.('input, textarea, select')) return;

    tracking = true;
    horizontal = false;
    startX = lastX = point.clientX;
    startY = point.clientY;
    startTime = Date.now();
    overlay.dataset.edgeSwiping = '1';
  };

  const onMove = (event) => {
    if (!tracking) return;
    const point = event.touches?.[0];
    if (!point) return;

    const dx = Math.max(0, point.clientX - startX);
    const dy = point.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    lastX = point.clientX;

    if (!horizontal) {
      if (absY > 16 && absY > absX * 1.15) {
        tracking = false;
        overlay.dataset.edgeSwiping = '0';
        return;
      }
      if (absX >= 8 && absX > absY * 1.1) {
        horizontal = true;
        overlay.classList.add('summary-edge-dragging');
        overlay.style.transition = 'none';
        overlay.style.willChange = 'transform';
        if (summarySwiper && !summarySwiper.destroyed) {
          summarySwiper.allowTouchMove = false;
        }
      }
    }

    if (!horizontal) return;

    if (event.cancelable) event.preventDefault();
    event.stopPropagation();

    // 指の動きにほぼ1:1で追従。画面幅を超えないように制限する。
    const translateX = Math.min(window.innerWidth, dx);
    overlay.style.transform = `translate3d(${translateX}px, 0, 0)`;
    overlay.style.boxShadow = '-14px 0 30px rgba(0,0,0,0.16)';
  };

  const finish = (event) => {
    if (!tracking) {
      if (horizontal) resetVisualState();
      return;
    }

    tracking = false;
    if (!horizontal) {
      resetVisualState();
      return;
    }

    const point = event.changedTouches?.[0];
    if (point) lastX = point.clientX;

    const dx = Math.max(0, lastX - startX);
    const elapsed = Math.max(1, Date.now() - startTime);
    const velocity = dx / elapsed;
    const threshold = Math.min(window.innerWidth * 0.30, 150);
    const shouldClose = dx >= threshold || velocity >= 0.55;

    if (shouldClose) {
      summaryEdgeClosing = true;
      overlay.classList.remove('summary-edge-dragging');
      overlay.classList.add('summary-edge-finishing');
      overlay.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';
      overlay.style.transform = `translate3d(${window.innerWidth}px, 0, 0)`;

      window.setTimeout(() => {
        closeSummaryOverlay();
        summaryEdgeClosing = false;
        resetVisualState();
      }, 225);
    } else {
      overlay.classList.remove('summary-edge-dragging');
      overlay.classList.add('summary-edge-finishing');
      overlay.style.transition = 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)';
      overlay.style.transform = 'translate3d(0, 0, 0)';

      window.setTimeout(() => {
        resetVisualState();
      }, 185);
    }
  };

  const cancel = () => {
    tracking = false;
    horizontal = false;
    resetVisualState();
  };

  overlay.addEventListener('touchstart', onStart, { passive: true, capture: true });
  overlay.addEventListener('touchmove', onMove, { passive: false, capture: true });
  overlay.addEventListener('touchend', finish, { passive: true, capture: true });
  overlay.addEventListener('touchcancel', cancel, { passive: true, capture: true });
}

async function switchSummaryFeed(step) {
  if (!summaryContext || summaryFeedSwitching) return;

  const type = summaryContext.type;
  const feeds = getFeedsByType(type);
  const targetFeedIndex = summaryContext.feedIndex + step;

  // 端のタブではそれ以上進めない。
  if (targetFeedIndex < 0 || targetFeedIndex >= feeds.length) return;

  const currentArticleIndex = getCurrentSummaryIndex();
  const targetFeed = feeds[targetFeedIndex];
  const title = document.querySelector('.summary-topbar-title');
  const counter = document.getElementById('summary-position');

  summaryFeedSwitching = true;
  if (title) title.textContent = 'タブを読み込み中…';
  if (counter) counter.textContent = `${targetFeedIndex + 1}/${feeds.length}`;

  try {
    // メイン画面のタブ状態も同期する。
    activateFeedIndex(type, targetFeedIndex);

    if (!feedItemsCache[type].has(targetFeed.url)) {
      await loadFeedContent(type, targetFeedIndex);
    }

    const nextItems = feedItemsCache[type].get(targetFeed.url) || [];
    if (!nextItems.length) {
      throw new Error('切替先の記事を取得できませんでした');
    }

    // v12: 左右スワイプでカテゴリを切り替えた場合は、必ず一番上の記事から表示する。
    // 前カテゴリで何番目の記事を見ていたかは引き継がない。
    const nextArticleIndex = 0;
    await openSummaryOverlay(type, targetFeedIndex, nextArticleIndex);
  } catch (err) {
    console.error('[summary] feed switch failed:', err);
    updateSummaryPosition(currentArticleIndex);
  } finally {
    summaryFeedSwitching = false;
  }
}

async function openSummaryOverlay(type, feedIndex, itemIndex) {
  const feeds = getFeedsByType(type);
  const feed = feeds[feedIndex];
  if (!feed) return;

  if (!feedItemsCache[type].has(feed.url)) {
    await loadFeedContent(type, feedIndex);
  }

  const items = feedItemsCache[type].get(feed.url) || [];
  if (!items[itemIndex]) return;

  const overlay = document.getElementById('summary-overlay');
  const wrapper = document.getElementById('summary-swiper-wrapper');
  if (!overlay || !wrapper) return;

  // 既存Swiperは、新しいスライドDOMを作る前に破棄する。
  // タブ切替時に旧Swiperが新しいDOMのstyleを掃除してしまうのを防ぐ。
  if (summarySwiper) {
    summarySwiper.destroy(true, true);
    summarySwiper = null;
  }

  summaryContext = { type, feedIndex, feed, items };

  wrapper.innerHTML = '';
  items.forEach((item, index) => {
    wrapper.appendChild(createSummarySlide(item, feed, index));
  });

  const wasHidden = overlay.classList.contains('hidden');
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');

  // タブ切替で要約画面を再構築するときは元ページのスクロール位置を上書きしない。
  if (wasHidden) {
    summaryBodyScrollY = window.scrollY;
    document.body.style.top = `-${summaryBodyScrollY}px`;
    document.body.classList.add('summary-open');
  }

  if (typeof Swiper !== 'function') {
    console.error('Swiper.js が読み込まれていません');
    updateSummaryPosition(itemIndex);
    ensureSummaryLoaded(itemIndex);
    renderCurrentChatHistory(itemIndex);
    return;
  }

  summarySwiper = new Swiper('#summary-swiper', {
    direction: 'vertical',
    initialSlide: itemIndex,
    speed: 260,
    threshold: 12,
    touchAngle: 45,
    resistanceRatio: 0.68,
    touchStartPreventDefault: false,
    touchMoveStopPropagation: false,
    passiveListeners: false,
    noSwiping: true,
    noSwipingSelector: '.summary-no-swipe',
    on: {
      slideChange() {
        const activeIndex = this.activeIndex;
        ensureSummaryLoaded(activeIndex);
        renderCurrentChatHistory(activeIndex);
        updateSummaryPosition(activeIndex);
      }
    }
  });

  updateSummaryPosition(itemIndex);
  renderCurrentChatHistory(itemIndex);
  ensureSummaryLoaded(itemIndex);
}

function closeSummaryOverlay() {
  const overlay = document.getElementById('summary-overlay');
  if (!overlay || overlay.classList.contains('hidden')) return;

  overlay.classList.add('hidden');
  overlay.classList.remove('summary-edge-dragging', 'summary-edge-finishing');
  overlay.style.transform = '';
  overlay.style.transition = '';
  overlay.style.willChange = '';
  overlay.style.boxShadow = '';
  overlay.dataset.edgeSwiping = '0';
  overlay.setAttribute('aria-hidden', 'true');

  if (summarySwiper) {
    summarySwiper.destroy(true, true);
    summarySwiper = null;
  }

  summaryContext = null;

  document.body.classList.remove('summary-open');
  document.body.style.top = '';
  window.scrollTo(0, summaryBodyScrollY);
}

function createSummarySlide(item, feed, index) {
  const slide = document.createElement('div');
  slide.className = 'swiper-slide summary-slide';
  slide.dataset.articleIndex = String(index);

  const article = document.createElement('article');
  article.className = 'summary-card';

  const meta = document.createElement('div');
  meta.className = 'summary-card-meta';

  const source = document.createElement('span');
  source.className = 'summary-source';
  source.textContent = feed.name || 'RSS';

  const date = document.createElement('span');
  date.textContent = formatCustomDate(item.pubDate);

  meta.appendChild(source);
  meta.appendChild(date);

  const originalTitle = document.createElement('h2');
  originalTitle.className = 'summary-original-title';
  originalTitle.textContent = item.title || '無題';

  const aiContent = document.createElement('div');
  aiContent.className = 'summary-ai-content summary-no-swipe';
  aiContent.setAttribute('data-swiper-no-swiping', 'true');
  aiContent.dataset.summaryContent = String(index);
  aiContent.innerHTML = '<div class="summary-loading"><span class="summary-spinner"></span>記事本文を取得してAIが要約中...</div>';

  const originalLink = document.createElement('a');
  originalLink.className = 'summary-original-link summary-no-swipe';
  originalLink.href = item.link || '#';
  originalLink.target = '_blank';
  originalLink.rel = 'noopener';
  originalLink.textContent = '元記事を開く ↗';

  const chatLog = document.createElement('div');
  chatLog.className = 'summary-chat-log summary-no-swipe';
  chatLog.setAttribute('data-swiper-no-swiping', 'true');
  chatLog.dataset.chatLog = String(index);
  chatLog.setAttribute('aria-live', 'polite');

  article.appendChild(meta);
  article.appendChild(originalTitle);
  article.appendChild(aiContent);
  article.appendChild(originalLink);
  article.appendChild(chatLog);

  slide.appendChild(article);
  return slide;
}

function updateSummaryPosition(index) {
  const counter = document.getElementById('summary-position');
  const title = document.querySelector('.summary-topbar-title');
  if (!summaryContext) return;

  const feeds = getFeedsByType(summaryContext.type);
  if (title) {
    title.textContent = summaryContext.feed?.name || 'AI要約';
  }

  if (counter) {
    const feedNo = summaryContext.feedIndex + 1;
    const feedTotal = feeds.length;
    const articleNo = Math.min(index + 1, summaryContext.items.length);
    const articleTotal = summaryContext.items.length;
    counter.textContent = `${feedNo}/${feedTotal} · ${articleNo}/${articleTotal}`;
  }
}

function getSummaryArticleKey(item, feed) {
  return `${feed.url}::${item.link || ''}::${item.title || ''}`;
}

function cleanRssText(value) {
  const raw = String(value || '');
  const first = new DOMParser().parseFromString(`<body>${raw}</body>`, 'text/html').body.textContent || '';
  const second = new DOMParser().parseFromString(`<body>${first}</body>`, 'text/html').body.textContent || first;
  return second.replace(/\s+/g, ' ').trim();
}

async function ensureSummaryLoaded(index) {
  if (!summaryContext) return;

  const item = summaryContext.items[index];
  if (!item) return;

  const content = document.querySelector(`.summary-ai-content[data-summary-content="${index}"]`);
  if (!content) return;

  const key = getSummaryArticleKey(item, summaryContext.feed);
  const cached = summaryCache.get(key);

  if (cached) {
    renderSummaryResult(content, cached);
    return;
  }

  if (content.dataset.loading === '1') return;
  content.dataset.loading = '1';
  content.innerHTML = '<div class="summary-loading"><span class="summary-spinner"></span>記事本文を取得してAIが要約中...</div>';

  try {
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: item.title || '',
        description: cleanRssText(item.description).slice(0, 12000),
        source: summaryContext.feed.name || '',
        url: item.link || ''
      })
    });

    const rawResponse = await response.text();
    let data = {};
    try {
      data = rawResponse ? JSON.parse(rawResponse) : {};
    } catch (_) {
      data = {};
    }

    if (!response.ok) {
      const detail = [data.error, data.detail].filter(Boolean).join(' / ');
      throw new Error(detail || `要約APIエラー (HTTP ${response.status})`);
    }

    const result = {
      points: Array.isArray(data.points) ? data.points : [],
      contentSource: data.contentSource || 'rss',
      extractedLength: Number(data.extractedLength) || 0,
      fallbackReason: data.fallbackReason || ''
    };

    summaryCache.set(key, result);
    renderSummaryResult(content, result);
  } catch (err) {
    console.error(err);
    content.innerHTML = '';

    const errorText = document.createElement('div');
    errorText.className = 'summary-error';
    errorText.textContent = `要約の取得に失敗しました。\n${err?.message || '原因を取得できませんでした'}`;

    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'summary-retry-btn summary-no-swipe';
    retry.textContent = '再試行';
    retry.addEventListener('click', () => {
      content.dataset.loading = '0';
      ensureSummaryLoaded(index);
    });

    content.appendChild(errorText);
    content.appendChild(retry);
  } finally {
    content.dataset.loading = '0';
  }
}

function renderSummaryResult(container, result) {
  container.innerHTML = '';

  const sourceNote = document.createElement('div');
  sourceNote.className = `summary-content-source ${result.contentSource === 'article' ? 'article' : 'rss'}`;
  sourceNote.textContent = result.contentSource === 'article'
    ? `リンク先の記事本文から要約${result.extractedLength ? `（${result.extractedLength.toLocaleString()}文字取得）` : ''}`
    : 'リンク先本文を取得できなかったためRSS本文から要約';

  const pointLabel = document.createElement('div');
  pointLabel.className = 'summary-section-label summary-points-label';
  pointLabel.textContent = '重要ポイント';

  const list = document.createElement('ul');
  list.className = 'summary-points';

  (result.points || []).forEach(point => {
    const li = document.createElement('li');
    li.textContent = point;
    list.appendChild(li);
  });

  container.appendChild(sourceNote);
  container.appendChild(pointLabel);
  container.appendChild(list);
}

function getCurrentSummaryIndex() {
  return summarySwiper ? summarySwiper.activeIndex : 0;
}

function renderCurrentChatHistory(index = getCurrentSummaryIndex()) {
  if (!summaryContext) return;

  const item = summaryContext.items[index];
  const log = document.querySelector(`.summary-chat-log[data-chat-log="${index}"]`);
  if (!item || !log) return;

  const key = getSummaryArticleKey(item, summaryContext.feed);
  const history = summaryChatHistories.get(key) || [];

  log.innerHTML = '';

  history.forEach(message => {
    const bubble = document.createElement('div');
    bubble.className = `summary-chat-bubble ${message.role === 'user' ? 'user' : 'assistant'}`;
    bubble.textContent = message.content;
    log.appendChild(bubble);
  });

  log.scrollTop = log.scrollHeight;
}

async function handleSummaryChatSubmit(event) {
  event.preventDefault();
  if (!summaryContext) return;

  const input = document.getElementById('summary-chat-input');
  const sendBtn = document.getElementById('summary-chat-send');
  if (!input || !sendBtn) return;

  const question = input.value.trim();
  if (!question) return;

  const index = getCurrentSummaryIndex();
  const item = summaryContext.items[index];
  if (!item) return;

  const key = getSummaryArticleKey(item, summaryContext.feed);
  const previousHistory = (summaryChatHistories.get(key) || []).filter(message => !message.pending);

  summaryChatHistories.set(key, [
    ...previousHistory,
    { role: 'user', content: question },
    { role: 'assistant', content: '回答を作成中…', pending: true }
  ]);
  renderCurrentChatHistory(index);

  input.value = '';
  input.blur();
  sendBtn.disabled = true;

  try {
    const cachedSummary = summaryCache.get(key);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        article: {
          title: item.title || '',
          description: cleanRssText(item.description).slice(0, 12000),
          source: summaryContext.feed.name || '',
          url: item.link || ''
        },
        summary: cachedSummary || null,
        history: previousHistory.slice(-8)
      })
    });

    const rawResponse = await response.text();
    let data = {};
    try {
      data = rawResponse ? JSON.parse(rawResponse) : {};
    } catch (_) {
      data = {};
    }

    if (!response.ok) {
      const detail = [data.error, data.detail].filter(Boolean).join(' / ');
      throw new Error(detail || `チャットAPIエラー (HTTP ${response.status})`);
    }

    summaryChatHistories.set(key, [
      ...previousHistory,
      { role: 'user', content: question },
      { role: 'assistant', content: data.answer || '回答を取得できませんでした。' }
    ]);
  } catch (err) {
    console.error(err);
    summaryChatHistories.set(key, [
      ...previousHistory,
      { role: 'user', content: question },
      { role: 'assistant', content: `回答の取得に失敗しました。${err?.message ? `\n${err.message}` : ''}` }
    ]);
  } finally {
    sendBtn.disabled = false;
    renderCurrentChatHistory(index);
  }
}

// 画像プレビュー・モーダル表示
function openImagePreviewModal(src) {
  let modal = document.getElementById('image-lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'image-lightbox-modal';
    document.body.appendChild(modal);
  }

  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.85); z-index: 999999;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; touch-action: none; user-select: none;
  `;

  modal.innerHTML = `
    <button id="close-lightbox-btn" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.2); border: none; color: #fff; font-size: 24px; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; z-index: 1000000; display: flex; align-items: center; justify-content: center;">✕</button>
    <div id="lightbox-img-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;">
      <img id="lightbox-img" src="${src}" style="max-width: 90%; max-height: 90%; object-fit: contain; transition: transform 0.05s ease-out; transform-origin: center center; cursor: grab; position: absolute;" />
    </div>
  `;

  const img = modal.querySelector('#lightbox-img');
  const container = modal.querySelector('#lightbox-img-container');
  const closeBtn = modal.querySelector('#close-lightbox-btn');

  let scale = 1;
  let pointX = 0;
  let pointY = 0;
  let startScale = 1;
  let startDistance = 0;
  let lastTapTime = 0;
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let initialPointX = 0;
  let initialPointY = 0;

  const updateTransform = () => {
    img.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
  };

  closeBtn.onclick = () => modal.remove();
  modal.onclick = (e) => {
    if (e.target === modal || e.target === container) modal.remove();
  };

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      isPanning = false;
      startDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      startScale = scale;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapTime < 300) {
        if (scale > 1) {
          scale = 1;
          pointX = 0;
          pointY = 0;
        } else {
          scale = 2.5;
        }
        updateTransform();
      } else if (scale > 1) {
        isPanning = true;
        panStartX = e.touches[0].clientX;
        panStartY = e.touches[0].clientY;
        initialPointX = pointX;
        initialPointY = pointY;
      }
      lastTapTime = now;
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (startDistance > 0) {
        scale = Math.min(Math.max(1, startScale * (dist / startDistance)), 4);
        if (scale === 1) {
          pointX = 0;
          pointY = 0;
        }
        updateTransform();
      }
    } else if (e.touches.length === 1 && isPanning && scale > 1) {
      const deltaX = e.touches[0].clientX - panStartX;
      const deltaY = e.touches[0].clientY - panStartY;
      pointX = initialPointX + deltaX;
      pointY = initialPointY + deltaY;
      updateTransform();
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    isPanning = false;
  });

  container.addEventListener('mousedown', (e) => {
    if (scale > 1) {
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
      initialPointX = pointX;
      initialPointY = pointY;
      img.style.cursor = 'grabbing';
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isPanning && scale > 1) {
      const deltaX = e.clientX - panStartX;
      const deltaY = e.clientY - panStartY;
      pointX = initialPointX + deltaX;
      pointY = initialPointY + deltaY;
      updateTransform();
    }
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
    img.style.cursor = 'grab';
  });
}

// --- Twitter 領域 ---
function saveTwitterScrollPosition(feedUrl = twitterFeeds[currentTwitterIdx]?.url, force = false) {
  const container = document.getElementById('twitter-content');
  if (!container || !feedUrl) return;
  if (twitterScrollSaveSuspended && !force) return;

  twitterScrollPositions[feedUrl] = Math.max(0, Math.round(container.scrollTop || 0));

  const containerRect = container.getBoundingClientRect();
  const cards = Array.from(container.querySelectorAll('.tweet-card[data-tweet-key]'));
  const anchor = cards.find(card => card.getBoundingClientRect().bottom > containerRect.top + 2);
  if (anchor) {
    twitterScrollAnchors[feedUrl] = {
      key: anchor.dataset.tweetKey || '',
      offset: Math.round(anchor.getBoundingClientRect().top - containerRect.top)
    };
  }

  persistTwitterScrollState();
}

function getTwitterSavedScrollPosition(feedUrl) {
  const value = Number(twitterScrollPositions?.[feedUrl]);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function applyTwitterSavedPosition(feedUrl) {
  const container = document.getElementById('twitter-content');
  if (!container || !feedUrl) return;

  const anchorState = twitterScrollAnchors?.[feedUrl];
  if (anchorState?.key) {
    const card = Array.from(container.querySelectorAll('.tweet-card[data-tweet-key]'))
      .find(el => el.dataset.tweetKey === anchorState.key);
    if (card) {
      const containerRect = container.getBoundingClientRect();
      const currentOffset = card.getBoundingClientRect().top - containerRect.top;
      container.scrollTop += currentOffset - Number(anchorState.offset || 0);
      return;
    }
  }

  container.scrollTop = getTwitterSavedScrollPosition(feedUrl);
}

function restoreTwitterScrollPosition(feedUrl, { releaseSaveGuard = false } = {}) {
  const container = document.getElementById('twitter-content');
  if (!container || !feedUrl) {
    if (releaseSaveGuard) setTwitterScrollSaveSuspended(false);
    return;
  }

  // 同じフィードの古い復元予約を残さない。
  twitterScrollRestoreTimers.forEach(timer => clearTimeout(timer));
  twitterScrollRestoreTimers = [];

  const restore = () => {
    if (twitterFeeds[currentTwitterIdx]?.url === feedUrl) {
      applyTwitterSavedPosition(feedUrl);
    }
  };

  requestAnimationFrame(() => {
    restore();
    requestAnimationFrame(restore);
  });

  // 通常のRSS再描画時も短時間だけ補正。ユーザーが触れば即キャンセルされる。
  [120, 320, 650].forEach(delay => {
    twitterScrollRestoreTimers.push(window.setTimeout(restore, delay));
  });

  if (releaseSaveGuard) {
    if (twitterScrollResumeTimer) clearTimeout(twitterScrollResumeTimer);
    twitterScrollResumeTimer = window.setTimeout(() => {
      twitterScrollResumeTimer = null;
      setTwitterScrollSaveSuspended(false);
      saveTwitterScrollPosition(feedUrl, true);
      twitterScrollRestoreTimers = [];
    }, 720);
  }
}

function installTwitterScrollPersistence() {
  const container = document.getElementById('twitter-content');
  if (!container || container.dataset.scrollPersistenceInstalled === '1') return;
  container.dataset.scrollPersistenceInstalled = '1';

  let timer = null;

  // iPhoneではtouchstartが「ユーザーが自分でタイムラインを動かし始めた」最も確実な合図。
  // ここで動画復帰用の遅延restoreを全部止める。
  container.addEventListener('touchstart', cancelTwitterRestoreOnUserInteraction, {
    passive: true,
    capture: true
  });
  container.addEventListener('pointerdown', cancelTwitterRestoreOnUserInteraction, {
    passive: true,
    capture: true
  });
  container.addEventListener('wheel', cancelTwitterRestoreOnUserInteraction, {
    passive: true,
    capture: true
  });

  container.addEventListener('scroll', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => saveTwitterScrollPosition(), 80);
  }, { passive: true });

  container.addEventListener('click', (event) => {
    if (event.target?.closest?.('a')) saveTwitterScrollPosition(undefined, true);
  }, true);

  window.addEventListener('pagehide', () => saveTwitterScrollPosition(undefined, true), { passive: true });

  // 外部動画を開いたときだけ復元する。通常のfocus/pageshowでは勝手にスクロール位置を戻さない。
  const restoreAfterExternal = () => {
    if (twitterExternalReturnState?.feedUrl) {
      scheduleTwitterExternalReturnRestore();
    }
  };

  window.addEventListener('focus', restoreAfterExternal, { passive: true });
  window.addEventListener('pageshow', restoreAfterExternal, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveTwitterScrollPosition(undefined, true);
      return;
    }

    if (twitterRetryFeedUrl && twitterFeeds[currentTwitterIdx]?.url === twitterRetryFeedUrl) {
      if (twitterRetryTimer) {
        clearTimeout(twitterRetryTimer);
        twitterRetryTimer = null;
      }
      loadTwitterContent({ autoRetry: true });
    } else {
      restoreAfterExternal();
    }
  });
}

async function initTwitter() {
  installTwitterScrollPersistence();

  const addBtn = document.getElementById('add-twitter-btn');
  const editBtn = document.getElementById('del-twitter-btn');

  if (addBtn) addBtn.onclick = openAddTwitterModal;
  if (editBtn) editBtn.onclick = openEditTwitterModal;

  const twitterSection = document.getElementById('twitter-section');
  if (twitterSection && !document.getElementById('twitter-refresh-btn')) {
    const header = twitterSection.querySelector('.section-header .action-buttons');
    if (header) {
      const refreshBtn = document.createElement('img');
      refreshBtn.id = 'twitter-refresh-btn';
      refreshBtn.src = 'icons/refresh.png';
      refreshBtn.alt = '更新';
      refreshBtn.title = '再読み込み';
      refreshBtn.style.cssText = 'width: 20px; height: 20px; cursor: pointer; transition: transform 0.3s ease;';
      refreshBtn.onclick = () => {
        refreshBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => { refreshBtn.style.transform = 'none'; }, 300);
        loadTwitterContent();
      };
      header.appendChild(refreshBtn);
    }
  }

  let tabsContainer = document.getElementById('twitter-tabs');
  const twitterContent = document.getElementById('twitter-content');
  
  if (twitterContent) {
    twitterContent.style.cssText += 'max-height: 600px; height: 600px; overflow-y: auto;';
  }

  if (twitterContent && !tabsContainer && twitterContent.parentNode) {
    tabsContainer = document.createElement('div');
    tabsContainer.id = 'twitter-tabs';
    tabsContainer.style.cssText = 'display: flex; gap: 4px; overflow-x: auto; margin-bottom: 12px; border-bottom: 1px solid var(--border-color, #ccc); padding-bottom: 4px;';
    twitterContent.parentNode.insertBefore(tabsContainer, twitterContent);
  }

  if (twitterExternalReturnState?.feedUrl) {
    const pendingIndex = twitterFeeds.findIndex(feed => feed.url === twitterExternalReturnState.feedUrl);
    if (pendingIndex >= 0) currentTwitterIdx = pendingIndex;
  } else if (currentTwitterIdx >= twitterFeeds.length) {
    currentTwitterIdx = 0;
  }
  persistTwitterScrollState();

  renderTwitterTabs();
  loadTwitterContent();
}

function renderTwitterTabs() {
  const tabsContainer = document.getElementById('twitter-tabs');
  if (!tabsContainer) return;
  tabsContainer.innerHTML = '';

  if (twitterFeeds.length === 0) {
    tabsContainer.innerHTML = '<span style="font-size: 12px; color: #888;">登録されているリストがありません</span>';
    return;
  }

  if (currentTwitterIdx >= twitterFeeds.length) {
    currentTwitterIdx = 0;
  }

  twitterFeeds.forEach((feed, idx) => {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${idx === currentTwitterIdx ? 'active' : ''}`;
    btn.style.cssText = "padding: 4px 12px; border: 1px solid #ccc; border-radius: 16px; background: #fff; cursor: pointer; font-size: 13px; white-space: nowrap;";
    if (idx === currentTwitterIdx) {
      btn.style.background = "#007aff";
      btn.style.color = "#fff";
      btn.style.borderColor = "#007aff";
    }
    btn.textContent = feed.name;
    btn.onclick = () => {
      saveTwitterScrollPosition(undefined, true);
      currentTwitterIdx = idx;
      persistTwitterScrollState();
      renderTwitterTabs();
      loadTwitterContent();
    };
    tabsContainer.appendChild(btn);
  });
}

function openAddTwitterModal() {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');

  if (!modal || !modalTitle || !modalBody || !cancelBtn || !submitBtn) return;

  resetModalButtons();

  modalTitle.textContent = "Twitterリストの追加";
  modalBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <div>
        <label style="font-size: 12px; color: var(--text-sub); display: block; margin-bottom: 4px;">リスト名</label>
        <input type="text" id="add-twitter-name" placeholder="リスト名を入力" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color, #ccc); box-sizing: border-box;" autocomplete="off">
      </div>
      <div>
        <label style="font-size: 12px; color: var(--text-sub); display: block; margin-bottom: 4px;">リストID</label>
        <input type="text" id="add-twitter-id" placeholder="リストIDを入力" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color, #ccc); box-sizing: border-box;" autocomplete="off">
      </div>
    </div>
  `;

  cancelBtn.style.display = 'inline-block';
  cancelBtn.textContent = 'キャンセル';
  cancelBtn.onclick = () => {
    resetModalButtons();
    modal.classList.add('hidden');
  };

  submitBtn.style.display = 'inline-block';
  submitBtn.textContent = '追加';
  submitBtn.onclick = () => {
    const name = document.getElementById('add-twitter-name').value.trim();
    const listId = document.getElementById('add-twitter-id').value.trim();

    if (!name || !listId) {
      alert("リスト名とリストIDを入力してください");
      return;
    }

    twitterFeeds.push({ name: name, url: listId });
    saveStoredFeeds('twitterFeeds', twitterFeeds);
    currentTwitterIdx = twitterFeeds.length - 1;

    resetModalButtons();
    modal.classList.add('hidden');

    renderTwitterTabs();
    loadTwitterContent();
  };

  modal.classList.remove('hidden');
}

function openEditTwitterModal() {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');

  if (!modal || !modalTitle || !modalBody || !cancelBtn || !submitBtn) return;

  resetModalButtons();

  modalTitle.textContent = "Twitterリストの編集";
  cancelBtn.style.display = 'none';
  submitBtn.textContent = '完了';
  submitBtn.onclick = () => {
    resetModalButtons();
    modal.classList.add('hidden');
  };

  const renderList = () => {
    modalBody.innerHTML = '';
    if (twitterFeeds.length === 0) {
      modalBody.innerHTML = '<div style="color: #888; font-size: 14px;">登録されているリストがありません</div>';
      return;
    }

    twitterFeeds.forEach((feed, idx) => {
      const row = document.createElement('div');
      row.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding: 8px; background: #f9f9f9; border-radius: 6px; border: 1px solid #ccc;";

      const nameSpan = document.createElement('span');
      nameSpan.style.cssText = "font-weight: 500; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";
      nameSpan.textContent = feed.name;

      const btnGroup = document.createElement('div');
      btnGroup.style.cssText = "display: flex; gap: 4px;";

      const editBtn = document.createElement('button');
      editBtn.className = 'btn';
      editBtn.style.padding = '2px 8px';
      editBtn.textContent = '変更';
      editBtn.onclick = () => {
        showTwitterSubEditModal(feed, idx, () => {
          renderList();
          renderTwitterTabs();
          loadTwitterContent();
        }, () => {
          renderList();
        });
      };

      const delBtn = document.createElement('button');
      delBtn.className = 'btn danger';
      delBtn.style.padding = '2px 8px';
      delBtn.textContent = '削除';
      delBtn.onclick = () => {
        twitterFeeds.splice(idx, 1);
        if (currentTwitterIdx >= twitterFeeds.length) {
          currentTwitterIdx = Math.max(0, twitterFeeds.length - 1);
        }
        saveStoredFeeds('twitterFeeds', twitterFeeds);
        renderList();
        renderTwitterTabs();
        loadTwitterContent();
      };

      btnGroup.appendChild(editBtn);
      btnGroup.appendChild(delBtn);

      row.appendChild(nameSpan);
      row.appendChild(btnGroup);
      modalBody.appendChild(row);
    });
  };

  renderList();
  modal.classList.remove('hidden');
}

function showTwitterSubEditModal(feed, idx, onSave, onCancel) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');

  modalTitle.textContent = 'Twitterリストの変更';
  modalBody.innerHTML = '';

  const editForm = document.createElement('div');
  editForm.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';

  editForm.innerHTML = `
    <div>
      <label style="font-size: 12px; color: var(--text-sub); display: block; margin-bottom: 4px;">現在のリスト名 / リストID</label>
      <input type="text" value="${feed.name} (${feed.url})" disabled style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-main); opacity: 0.6; color: var(--text-main); box-sizing: border-box;">
    </div>
    <div>
      <label style="font-size: 12px; color: var(--text-sub); display: block; margin-bottom: 4px;">新しいリスト名</label>
      <input type="text" id="edit-twitter-name-input" value="${feed.name}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-main); box-sizing: border-box;" autocomplete="off">
    </div>
    <div>
      <label style="font-size: 12px; color: var(--text-sub); display: block; margin-bottom: 4px;">新しいリストID</label>
      <input type="text" id="edit-twitter-id-input" value="${feed.url}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-main); box-sizing: border-box;" autocomplete="off">
    </div>
  `;

  modalBody.appendChild(editForm);

  if (cancelBtn) {
    cancelBtn.style.display = 'inline-block';
    cancelBtn.textContent = 'キャンセル';
    cancelBtn.onclick = () => {
      onCancel();
      cancelBtn.style.display = 'none';
      submitBtn.style.display = 'inline-block';
      submitBtn.textContent = '完了';
      submitBtn.onclick = () => {
        resetModalButtons();
        const modal = document.getElementById('modal');
        if (modal) modal.classList.add('hidden');
      };
    };
  }

  if (submitBtn) {
    submitBtn.textContent = '上書き';
    submitBtn.onclick = () => {
      const newName = document.getElementById('edit-twitter-name-input').value.trim();
      const newId = document.getElementById('edit-twitter-id-input').value.trim();

      if (!newName || !newId) {
        alert('リスト名とリストIDを入力してください');
        return;
      }

      twitterFeeds[idx] = { name: newName, url: newId };
      saveStoredFeeds('twitterFeeds', twitterFeeds);
      onSave();

      if (cancelBtn) cancelBtn.style.display = 'none';
      if (submitBtn) {
        submitBtn.style.display = 'inline-block';
        submitBtn.textContent = '完了';
        submitBtn.onclick = () => {
          resetModalButtons();
          const modal = document.getElementById('modal');
          if (modal) modal.classList.add('hidden');
        };
      }
    };
  }
}

function clearTwitterAutoRetry(resetCount = true) {
  if (twitterRetryTimer) {
    clearTimeout(twitterRetryTimer);
    twitterRetryTimer = null;
  }
  if (resetCount) {
    twitterRetryCount = 0;
    twitterRetryFeedUrl = '';
  }
}

function scheduleTwitterAutoRetry(feedUrl, reason = '') {
  if (!feedUrl) return;
  if (twitterFeeds[currentTwitterIdx]?.url !== feedUrl) return;

  if (twitterRetryTimer) clearTimeout(twitterRetryTimer);
  twitterRetryFeedUrl = feedUrl;
  twitterRetryCount += 1;

  const delay = TWITTER_WAKE_RETRY_MS;

  const container = document.getElementById('twitter-content');
  if (container) {
    container.innerHTML = `
      <div class="loading twitter-wake-loading">
        <div style="font-weight:700; margin-bottom:4px;">Twitterサーバーの起動を待っています…</div>
        <div style="font-size:11px; opacity:.75;">情報なしを確認後、5秒待って自動更新します（${twitterRetryCount}回目）</div>
        ${reason ? `<div style="font-size:10px; opacity:.55; margin-top:4px;">${reason}</div>` : ''}
      </div>
    `;
  }

  twitterRetryTimer = window.setTimeout(() => {
    twitterRetryTimer = null;
    if (twitterFeeds[currentTwitterIdx]?.url !== feedUrl) return;

    // バックグラウンド中は通信もタイマー再生成もしない。
    // visibilitychange で画面へ戻った瞬間に再開する。
    if (document.visibilityState === 'hidden') return;

    loadTwitterContent({ autoRetry: true });
  }, delay);
}

async function loadTwitterContent(options = {}) {
  const { autoRetry = false } = options;
  const container = document.getElementById('twitter-content');
  if (!container) return;

  // 読み込み表示へ差し替えた瞬間のscrollTop=0で保存値を上書きしない。
  setTwitterScrollSaveSuspended(true);

  const restoreFeedUrl = twitterFeeds[currentTwitterIdx]?.url || '';
  const restoreScrollTop = twitterExternalReturnState?.feedUrl === twitterFeeds[currentTwitterIdx]?.url
    ? Math.max(0, Number(twitterExternalReturnState.scrollTop) || getTwitterSavedScrollPosition(twitterFeeds[currentTwitterIdx]?.url))
    : getTwitterSavedScrollPosition(restoreFeedUrl);

  if (!autoRetry) {
    clearTwitterAutoRetry(true);
  }

  // 手動更新やタブ切替では前の通信を止める。自動再試行も常に1本だけにする。
  if (twitterFetchController) {
    try { twitterFetchController.abort(); } catch (_) {}
  }
  twitterFetchController = new AbortController();
  const requestSerial = ++twitterLoadSerial;
  let scrollGuardReleaseScheduled = false;

  container.innerHTML = autoRetry
    ? `<div class="loading">Twitterを再取得中…（${twitterRetryCount}回目）</div>`
    : '<div class="loading">ツイートを読み込み中...</div>';

  if (twitterFeeds.length === 0) {
    container.innerHTML = '<div class="loading">リストを追加してください。</div>';
    setTwitterScrollSaveSuspended(false);
    return;
  }

  if (currentTwitterIdx >= twitterFeeds.length) {
    currentTwitterIdx = 0;
  }

  const currentFeed = twitterFeeds[currentTwitterIdx];
  const feedUrl = `https://rsshub-latest-wekl.onrender.com/twitter/list/${currentFeed.url}`;
  const apiUrl = `/api/rss?url=${encodeURIComponent(feedUrl)}`;

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      signal: twitterFetchController.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (requestSerial !== twitterLoadSerial) return;
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xmlText = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    if (xmlDoc.querySelector('parsererror')) {
      throw new Error('XMLパースエラー');
    }

    const items = Array.from(xmlDoc.querySelectorAll('item'));
    if (items.length === 0) {
      scheduleTwitterAutoRetry(currentFeed.url, 'RSSがまだ空です');
      return;
    }

    // 取得成功。自動再試行を即停止する。
    clearTwitterAutoRetry(true);
    container.innerHTML = '';

    items.forEach(item => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '#';
      const description = item.querySelector('description')?.textContent || '';
      const author = item.querySelector('author')?.textContent || item.querySelector('dc\\:creator, creator')?.textContent || '';
      const pubDateRaw = item.querySelector('pubDate')?.textContent || '';

      if (/^RT[\s:]/i.test(title) || /^RT[\s:]/i.test(description) || title.includes("RT @")) {
        return;
      }

      let pubDate = new Date(pubDateRaw);
      let dateStr = !isNaN(pubDate.getTime()) ? formatCustomDate(pubDate) : pubDateRaw;

      const contentDoc = parser.parseFromString(`<div>${description}</div>`, 'text/html');

      contentDoc.querySelectorAll('img.avatar, img[src*="profile_images"]').forEach(img => img.remove());

      let displayName = author || title.split(':')[0] || 'Twitter User';
      let userId = '';

      if (displayName.includes('(@') && displayName.endsWith(')')) {
        const parts = displayName.split('(@');
        displayName = parts[0].trim();
        userId = '@' + parts[1].slice(0, -1).trim();
      } else if (displayName.startsWith('@')) {
        userId = displayName;
        displayName = displayName.replace(/^@/, '');
      }

      const blockquotes = contentDoc.querySelectorAll('blockquote');
      blockquotes.forEach(bq => {
        const quoteBox = contentDoc.createElement('div');
        quoteBox.className = 'quote-box';
        quoteBox.style.cssText = `
          border: 1px solid #888888;
          border-radius: 12px;
          padding: 10px 12px;
          margin-top: 8px;
          background: rgba(0, 0, 0, 0.03);
          font-size: 12px;
          line-height: 1.4;
        `;
        quoteBox.innerHTML = bq.innerHTML;
        bq.parentNode.replaceChild(quoteBox, bq);
      });

      const mediaElements = Array.from(contentDoc.querySelectorAll('img, video, iframe, a[href*="video.twimg.com"], a[href$=".mp4"]'));
      mediaElements.forEach(media => media.remove());

      function linkifyTextNodes(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const urlRegex = /(https?:\/\/[^\s<]+)/g;
          if (urlRegex.test(node.nodeValue)) {
            const span = document.createElement('span');
            span.innerHTML = node.nodeValue.replace(urlRegex, (url) => {
              return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #1da1f2; text-decoration: none;">${url}</a>`;
            });
            node.parentNode.replaceChild(span, node);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() !== 'a') {
          Array.from(node.childNodes).forEach(linkifyTextNodes);
        }
      }
      linkifyTextNodes(contentDoc.body);

      contentDoc.querySelectorAll('a').forEach(a => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        a.style.color = '#1da1f2';
        a.style.textDecoration = 'none';
      });

      let contentHtml = contentDoc.body.innerHTML;

      const tweetCard = document.createElement('div');
      tweetCard.className = 'tweet-item tweet-card';
      tweetCard.dataset.tweetKey = link || `${pubDateRaw}|${title}`;
      tweetCard.style.cssText = `
        border-bottom: 2px solid #000000;
        padding: 12px 8px;
        box-sizing: border-box;
        width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 4px;
      `;

      const userHeaderHtml = `
        <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-bottom: 0;">
          <a href="${link}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: flex; align-items: baseline; gap: 6px; overflow: hidden;">
            <span style="font-weight: bold; font-size: 15px; color: var(--text-main, #111);">${displayName}</span>
            ${userId ? `<span style="font-size: 12px; color: #666; font-weight: normal;">${userId}</span>` : ''}
          </a>
          <span style="font-size: 11px; color: #888; flex-shrink: 0;">${dateStr}</span>
        </div>
      `;

      tweetCard.innerHTML = userHeaderHtml;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentHtml;
      
      const mediaElementsInBody = tempDiv.querySelectorAll('img, video, a[href*="video.twimg.com"]');
      mediaElementsInBody.forEach(el => el.remove());
      
      const cleanedBodyHtml = tempDiv.innerHTML
        .replace(/<p><br><\/p>/g, '')
        .replace(/<br\s*[\/]?>/gi, '')
        .trim();

      if (cleanedBodyHtml !== '') {
        const bodyWrapper = document.createElement('div');
        bodyWrapper.className = 'tweet-body';
        bodyWrapper.innerHTML = cleanedBodyHtml;
        tweetCard.appendChild(bodyWrapper);
      }

      const mediaContainer = document.createElement('div');
      mediaContainer.className = 'tweet-media-container';

      mediaElements.forEach(media => {
        const tagName = media.tagName.toLowerCase();
        
        let targetVideoUrl = '';
        if (tagName === 'a') {
          targetVideoUrl = media.href;
        } else if (tagName === 'video') {
          targetVideoUrl = media.src || media.querySelector('source')?.src || '';
        }

        if (targetVideoUrl && (targetVideoUrl.includes('video.twimg.com') || targetVideoUrl.endsWith('.mp4'))) {
          // v11: Twitter動画は外部再生だけに戻す。
          const videoButton = document.createElement('button');
          videoButton.type = 'button';
          videoButton.className = 'tweet-video-external-btn';
          videoButton.textContent = '▶ 動画を再生';
          videoButton.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            openTwitterVideoExternally(
              targetVideoUrl,
              currentFeed.url,
              tweetCard.dataset.tweetKey || ''
            );
          };
          mediaContainer.appendChild(videoButton);
        } else if (tagName === 'img') {
          media.style.maxWidth = '100%';
          media.style.height = 'auto';
          media.style.borderRadius = '12px';
          media.style.display = 'block';
          media.style.cursor = 'pointer';
          media.onclick = (e) => {
            e.stopPropagation();
            openImagePreviewModal(media.src);
          };
          mediaContainer.appendChild(media);
        }
      });

      if (mediaContainer.children.length > 0) {
        tweetCard.appendChild(mediaContainer);
      }

      container.appendChild(tweetCard);
    });

    // v12: 外部動画から戻った場合は専用の「短時間・1回限り」復元だけを使う。
    // 通常の再描画は従来どおり保存位置へ戻すが、ユーザー操作が始まれば即キャンセルされる。
    if (twitterExternalReturnState?.feedUrl === currentFeed.url) {
      twitterScrollPositions[currentFeed.url] = restoreScrollTop;
      scrollGuardReleaseScheduled = true;
      scheduleTwitterExternalReturnRestore();
    } else if (restoreFeedUrl === currentFeed.url) {
      twitterScrollPositions[currentFeed.url] = restoreScrollTop;
      scrollGuardReleaseScheduled = true;
      restoreTwitterScrollPosition(currentFeed.url, { releaseSaveGuard: true });
    }

  } catch (err) {
    if (err?.name === 'AbortError') return;
    console.error('[twitter] fetch failed:', err);
    const activeFeed = twitterFeeds[currentTwitterIdx];
    if (activeFeed && activeFeed.url === currentFeed.url) {
      scheduleTwitterAutoRetry(currentFeed.url, err?.message || '取得待ち');
    }
  } finally {
    if (requestSerial === twitterLoadSerial) {
      twitterFetchController = null;
      if (!scrollGuardReleaseScheduled) {
        // 外部動画からの復帰待ち中は、Renderの起動待ち表示でscrollTop=0を保存しない。
        if (twitterExternalReturnState?.feedUrl !== currentFeed?.url) {
          setTwitterScrollSaveSuspended(false);
        }
      }
    }
  }
}


// --- Twitch 領域 ---
const twitchSnapshotCache = new Map();

function normalizeTwitchChannelInput(value) {
  let raw = String(value || '').trim();
  if (!raw) return '';
  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      if (!/(^|\.)twitch\.tv$/i.test(url.hostname)) return '';
      raw = url.pathname.split('/').filter(Boolean)[0] || '';
    } else {
      raw = raw
        .replace(/^@/, '')
        .replace(/^www\.twitch\.tv\//i, '')
        .replace(/^twitch\.tv\//i, '')
        .split(/[/?#]/)[0];
    }
  } catch (_) {
    return '';
  }
  raw = raw.toLowerCase();
  return /^[a-z0-9_]{2,25}$/i.test(raw) ? raw : '';
}

function initTwitch() {
  renderTwitchTabs();
  loadTwitchContent(currentTwitchIdx);

  const refreshBtn = document.getElementById('refresh-twitch-btn');
  if (refreshBtn) {
    refreshBtn.onclick = () => loadTwitchContent(currentTwitchIdx, { forceRefresh: true });
  }
}

function renderTwitchTabs() {
  const tabs = document.getElementById('twitch-tabs');
  if (!tabs) return;
  tabs.innerHTML = '';

  if (!twitchFeeds.length) return;
  currentTwitchIdx = Math.max(0, Math.min(currentTwitchIdx, twitchFeeds.length - 1));

  twitchFeeds.forEach((feed, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `tab-btn ${index === currentTwitchIdx ? 'active' : ''}`;
    btn.textContent = feed.name || feed.url;
    btn.onclick = () => {
      currentTwitchIdx = index;
      renderTwitchTabs();
      loadTwitchContent(index);
    };
    tabs.appendChild(btn);
  });
}

async function fetchTwitchSnapshot(feed, { forceRefresh = false } = {}) {
  const login = normalizeTwitchChannelInput(feed?.url || feed?.name || '');
  if (!login) throw new Error('Twitchチャンネル名/URLが正しくありません');

  if (!forceRefresh && twitchSnapshotCache.has(login)) {
    return twitchSnapshotCache.get(login);
  }

  const url = `/api/twitch-feed?channel=${encodeURIComponent(login)}&format=json${forceRefresh ? `&_fresh=${Date.now()}` : ''}`;
  const response = await fetch(url, { cache: forceRefresh ? 'no-store' : 'default' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    throw new Error(data?.error || `Twitch取得エラー (HTTP ${response.status})`);
  }

  twitchSnapshotCache.set(login, data);
  return data;
}

function openTwitchLink(url) {
  if (!url) return;
  // https://www.twitch.tv/... はiOSのUniversal Linkとして、Twitchアプリが利用可能ならアプリへ渡せる。
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function loadTwitchContent(index, { forceRefresh = false } = {}) {
  const container = document.getElementById('twitch-content');
  if (!container) return;

  if (!twitchFeeds.length) {
    container.innerHTML = '<div class="loading">配信者を追加してください。</div>';
    return;
  }

  currentTwitchIdx = Math.max(0, Math.min(index, twitchFeeds.length - 1));
  const feed = twitchFeeds[currentTwitchIdx];
  container.innerHTML = '<div class="loading">Twitch情報を読み込み中...</div>';

  try {
    if (forceRefresh) twitchSnapshotCache.clear();
    const data = await fetchTwitchSnapshot(feed, { forceRefresh });

    // Twitch側の正式表示名へ自動で合わせる。ただしユーザーが明示的に別名へ編集した場合は維持。
    if (!feed.name || feed.name === feed.url || feed.name.toLowerCase() === normalizeTwitchChannelInput(feed.url)) {
      feed.name = data.broadcaster?.displayName || feed.name || feed.url;
      saveStoredFeeds('twitchFeeds', twitchFeeds);
      renderTwitchTabs();
    }

    container.innerHTML = '';

    const status = document.createElement('div');
    status.className = `twitch-status-card ${data.live?.isLive ? 'live' : 'offline'}`;

    const profile = document.createElement('div');
    profile.className = 'twitch-profile-row';
    if (data.broadcaster?.profileImageUrl) {
      const img = document.createElement('img');
      img.className = 'twitch-avatar';
      img.src = data.broadcaster.profileImageUrl;
      img.alt = '';
      profile.appendChild(img);
    }

    const profileText = document.createElement('div');
    profileText.className = 'twitch-profile-text';
    const name = document.createElement('div');
    name.className = 'twitch-streamer-name';
    name.textContent = data.broadcaster?.displayName || feed.name || feed.url;
    const state = document.createElement('button');
    state.type = 'button';
    state.className = `twitch-live-link ${data.live?.isLive ? 'is-live' : ''}`;
    state.textContent = data.live?.isLive ? '● 配信中 — Twitchで見る' : '○ オフライン — チャンネルを開く';
    state.onclick = () => openTwitchLink(data.live?.url || data.broadcaster?.channelUrl);
    profileText.append(name, state);
    profile.appendChild(profileText);
    status.appendChild(profile);

    if (data.live?.isLive && data.live?.title) {
      const liveTitle = document.createElement('button');
      liveTitle.type = 'button';
      liveTitle.className = 'twitch-current-title';
      liveTitle.textContent = data.live.title;
      liveTitle.onclick = () => openTwitchLink(data.live.url);
      status.appendChild(liveTitle);
    }
    container.appendChild(status);

    const heading = document.createElement('div');
    heading.className = 'twitch-archive-heading';
    heading.textContent = 'アーカイブ一覧';
    container.appendChild(heading);

    const archives = Array.isArray(data.archives) ? data.archives : [];
    if (!archives.length) {
      const empty = document.createElement('div');
      empty.className = 'loading';
      empty.textContent = 'アーカイブがありません';
      container.appendChild(empty);
      return;
    }

    archives.forEach(video => {
      const row = document.createElement('div');
      row.className = 'twitch-archive-item';

      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'twitch-archive-link';
      link.textContent = video.title || 'アーカイブ';
      link.onclick = () => openTwitchLink(video.url);

      const meta = document.createElement('div');
      meta.className = 'twitch-archive-meta';
      const d = new Date(video.createdAt || video.publishedAt || '');
      meta.textContent = [
        Number.isFinite(d.getTime()) ? formatCustomDate(d) : '',
        video.duration || ''
      ].filter(Boolean).join(' · ');

      row.append(link, meta);
      container.appendChild(row);
    });
  } catch (err) {
    console.error('[Twitch]', err);
    container.innerHTML = `<div class="loading">Twitch情報の取得に失敗しました<br><small>${escapeHtmlAttribute(err?.message || '')}</small></div>`;
  }
}

// --- YouTube 領域 ---
function initYoutube() {
  // YouTube IFrame Player APIを先に読み込んでおく。
  // 一覧タップ時にすでにAPIが使える状態に近づけ、iPhoneでの即時再生成功率を上げる。
  ensureYoutubeIframeApi().catch((err) => {
    console.info('[YouTube] IFrame API preload notice:', err);
  });
  loadAllYoutubeContent();
}

async function loadAllYoutubeContent() {
  const container = document.getElementById('youtube-content');
  const controlsHost = document.getElementById('youtube-controls-host');
  if (!container) return;

  if (youtubeFeeds.length === 0) {
    if (controlsHost) controlsHost.innerHTML = '';
    container.innerHTML = '<div class="loading">配信先を追加してください。</div>';
    return;
  }

  if (controlsHost) controlsHost.innerHTML = '<div class="youtube-controls-loading">チャンネル情報を読み込み中...</div>';
  container.innerHTML = '<div class="loading">動画を読み込み中...</div>';

  try {
    const fetchPromises = youtubeFeeds.map(async (feed) => {
      try {
        const items = await fetchYoutubeData(feed.url);
        return items.map(item => ({
          ...item,
          displayName: feed.name || item.channelName
        }));
      } catch (err) {
        console.error(`Failed to fetch YouTube API for ${feed.name}:`, err);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    let allVideos = results.flat();

    if (allVideos.length === 0) {
      container.innerHTML = '<div class="loading">動画を取得できませんでした</div>';
      return;
    }

    allVideos.sort((a, b) => b.pubDate - a.pubDate);

    container.innerHTML = '';

    window.currentVideoList = [];
    window.selectedChannel = 'ALL';
    window.modalPos = { x: null, y: null };

    const channelSet = new Set();
    allVideos.forEach(item => {
      if (item.displayName) {
        channelSet.add(item.displayName);
      }
    });

    const channels = Array.from(channelSet);
    let channelOptionsHtml = '<option value="ALL">すべてのチャンネル</option>';
    channels.forEach(ch => {
      channelOptionsHtml += `<option value="${ch}">${ch}</option>`;
    });

    if (controlsHost) {
      controlsHost.innerHTML = `
        <div class="yt-filter-container">
          <select id="yt-channel-select" class="yt-select" onchange="filterYtByChannel(this.value)">
            ${channelOptionsHtml}
          </select>
          <div id="yt-channel-badge" class="yt-badge" style="display:none;">
            <button class="yt-reset-filter-btn" onclick="resetYtChannelFilter()" title="フィルター解除">✕</button>
          </div>
        </div>
        <div class="yt-type-tabs">
          <button id="yt-tab-long" class="tab-btn active yt-type-tab" onclick="switchYtTab('long')">動画</button>
          <button id="yt-tab-shorts" class="tab-btn yt-type-tab" onclick="switchYtTab('short')">Shorts</button>
          <button id="yt-tab-live" class="tab-btn yt-type-tab" onclick="switchYtTab('live')">LIVE</button>
        </div>
      `;
    }

    container.innerHTML = '<div id="yt-table-container"></div>';

    window.currentType = 'long';

    window.updateVideoDisplay = function() {
      const now = new Date();

      const filtered = allVideos.filter(item => {
        let matchesType = false;

        if (window.currentType === 'long') {
          // 普通の投稿動画 + プレミア公開。Shortsと実ライブ/ライブ録画は除外。
          matchesType = !item.isShort && !item.isLiveBroadcast;
        } else if (window.currentType === 'short') {
          // 明示的にShortsと判定できた縦型短尺だけ。
          matchesType = item.isShort && !item.isLiveBroadcast;
        } else if (window.currentType === 'live') {
          // 生配信・配信予定・ライブ録画のみ。プレミア公開は動画タブへ。
          matchesType = item.isLiveBroadcast;
        }

        const matchesChannel = window.selectedChannel === 'ALL' || item.displayName === window.selectedChannel;
        return matchesType && matchesChannel;
      });

      const badgeDiv = document.getElementById('yt-channel-badge');
      const selectElem = document.getElementById('yt-channel-select');

      if (selectElem) selectElem.value = window.selectedChannel;

      if (window.selectedChannel !== 'ALL') {
        if (badgeDiv) badgeDiv.style.display = 'flex';
      } else {
        if (badgeDiv) badgeDiv.style.display = 'none';
      }

      renderVideoTable(filtered);
    };

    window.switchYtTab = function(type) {
      window.currentType = type;
      ['long', 'short', 'live'].forEach(t => {
        const btn = document.getElementById(`yt-tab-${t === 'short' ? 'shorts' : t}`);
        if (btn) {
          if (t === type) {
            btn.classList.add('active');
            btn.style.fontWeight = 'bold';
          } else {
            btn.classList.remove('active');
            btn.style.fontWeight = 'normal';
          }
        }
      });
      updateVideoDisplay();
    };

    window.filterYtByChannel = function(channelName) {
      window.selectedChannel = channelName;
      updateVideoDisplay();
    };

    window.resetYtChannelFilter = function() {
      window.selectedChannel = 'ALL';
      updateVideoDisplay();
    };

    function renderVideoTable(videos) {
      window.currentVideoList = videos;
      const tableContainer = document.getElementById('yt-table-container');
      if (!tableContainer) return;

      if (!videos || videos.length === 0) {
        tableContainer.innerHTML = '<div class="loading" style="padding:16px; text-align:center;">該当する動画がありません</div>';
        return;
      }

      let html = '<table style="width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed;">';
      
      videos.forEach((item, index) => {
        let dateStr = '';
        let isLive = item.liveStatus === 'live';

        if (item.liveStatus === 'upcoming' && item.scheduledStartTime && !item.wasEverLive) {
          dateStr = `予定: ${formatCustomDate(item.scheduledStartTime)}開始`;
        } else if (isLive) {
          dateStr = '';
        } else if (item.pubDate instanceof Date && !isNaN(item.pubDate)) {
          dateStr = formatCustomDate(item.pubDate);
        }

        const rowBgStyle = isLive ? 'background-color: #FEF0E5;' : '';

        html += `
          <tr onclick="openYoutubeModalByIndex(${index})" style="border-bottom: 1px solid rgba(0,0,0,0.1); cursor: pointer; ${rowBgStyle}">
            <td style="padding: 8px 4px; width: 70px;">
              <div style="position: relative; width: 64px; height: 36px; overflow: hidden; border-radius: 4px; background: #000;">
                ${item.thumbnail ? `<img src="${item.thumbnail}" style="width: 100%; height: 100%; object-fit: cover;" alt="thumbnail">` : ''}
                <div style="position: absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3); color:#fff; font-size:10px;">▶</div>
              </div>
            </td>
            <td style="padding: 8px 4px; vertical-align: middle;">
              <div style="font-weight: bold; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.title || 'タイトルなし'}</div>
              <div style="font-size: 11px; opacity: 0.7; margin-top: 2px;">${item.displayName || ''} ${dateStr ? '• ' + dateStr : ''}</div>
            </td>
          </tr>
        `;
      });

      html += '</table>';
      tableContainer.innerHTML = html;
    }

    updateVideoDisplay();

  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="loading">YouTube情報の取得中にエラーが発生しました</div>';
  }
}

// --- 布団ちゃん機能 ---
function initFutocyan() {
  const youtubeSection = document.getElementById('youtube-section') || document.querySelector('.youtube-section');
  if (!youtubeSection) return;

  let futocyanSection = document.getElementById('futocyan-section');
  if (!futocyanSection) {
    futocyanSection = document.createElement('div');
    futocyanSection.id = 'futocyan-section';
    futocyanSection.className = 'section'; 
    futocyanSection.style.cssText = 'margin-top: 24px; background: var(--card-bg, #fff); border-radius: 8px; padding: 12px; border: 1px solid var(--border-color, #e0e0e0);';
    
    youtubeSection.parentNode.insertBefore(futocyanSection, youtubeSection.nextSibling);
  }

  futocyanSection.innerHTML = `
    <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h2 style="font-size: 16px; margin: 0;">布団ちゃん</h2>
      <button id="futocyan-refresh-btn" class="btn" style="padding: 4px 8px; font-size: 12px; cursor: pointer;">更新</button>
    </div>
    <div id="futocyan-content" style="font-size: 13px;">
      <div class="loading">読み込み中...</div>
    </div>
  `;

  document.getElementById('futocyan-refresh-btn').onclick = loadFutocyanContent;
  loadFutocyanContent();
}

async function loadFutocyanContent() {
  const container = document.getElementById('futocyan-content');
  if (!container) return;
  container.innerHTML = '<div class="loading">布団ちゃんの情報を読み込み中...</div>';

  try {
    const feedUrl = 'https://rss.app/feeds/jHml07gZvosRuZXm.xml';
    const items = await fetchNewsRSS(feedUrl);

    if (items.length === 0) {
      container.innerHTML = '<div class="loading">データが見つかりませんでした</div>';
      return;
    }

    container.innerHTML = '';
    const table = document.createElement('table');
    table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 13px; table-layout: fixed;';

    items.forEach(item => {
      const isLive = item.description && item.description.toUpperCase().includes('LIVE');
      
      let dateStr = '';
      if (item.pubDate instanceof Date && !isNaN(item.pubDate)) {
        dateStr = formatCustomDate(item.pubDate);
      }

      const tr = document.createElement('tr');
      const rowBgStyle = isLive ? 'background-color: #FEF0E5;' : '';
      tr.style.cssText = `border-bottom: 1px solid rgba(0,0,0,0.1); ${rowBgStyle}`;

      tr.innerHTML = `
        <td style="padding: 8px 4px; vertical-align: middle;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" style="font-weight: bold; color: var(--text-main, #007aff); text-decoration: none; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3;">
              ${item.title}
            </a>
          </div>
          <div style="font-size: 11px; color: #666; margin-top: 2px;">
            ${dateStr}
          </div>
        </td>
      `;
      table.appendChild(tr);
    });

    container.appendChild(table);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="loading" style="color: red;">情報の取得に失敗しました</div>';
  }
}

// ==========================================
// v13: YouTube IFrame Player API / 自動再生・連続再生
// ==========================================
const YOUTUBE_AUTO_NEXT_STORAGE_KEY = 'youtubeAutoNextEnabledV1';
let youtubeIframeApiPromise = null;
let youtubePlayerController = null;
let youtubePlayerAttachSerial = 0;
let youtubeAutoAdvanceTimer = null;

function isYoutubeAutoNextEnabled() {
  try {
    const stored = localStorage.getItem(YOUTUBE_AUTO_NEXT_STORAGE_KEY);
    // 初回はON。ユーザーがOFFにした状態は端末内へ保存する。
    return stored === null ? true : stored === '1';
  } catch (_) {
    return true;
  }
}

function setYoutubeAutoNextEnabled(enabled) {
  try {
    localStorage.setItem(YOUTUBE_AUTO_NEXT_STORAGE_KEY, enabled ? '1' : '0');
  } catch (_) {}
}

function updateYoutubeAutoNextUi() {
  const button = document.getElementById('yt-auto-next-btn');
  const status = document.getElementById('yt-auto-next-status');
  const enabled = isYoutubeAutoNextEnabled();

  if (button) {
    button.classList.toggle('is-on', enabled);
    button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    button.title = enabled
      ? '動画終了後に次の動画を自動再生します'
      : '動画終了後の自動送りは停止中です';
  }

  if (status) status.textContent = enabled ? 'ON' : 'OFF';
}

window.toggleYoutubeAutoNext = function(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();

  const next = !isYoutubeAutoNextEnabled();
  setYoutubeAutoNextEnabled(next);

  if (!next && youtubeAutoAdvanceTimer) {
    clearTimeout(youtubeAutoAdvanceTimer);
    youtubeAutoAdvanceTimer = null;
  }

  updateYoutubeAutoNextUi();
};

function ensureYoutubeIframeApi() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeIframeApiPromise) {
    return youtubeIframeApiPromise;
  }

  youtubeIframeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    let settled = false;

    const finish = () => {
      if (settled || !window.YT?.Player) return;
      settled = true;
      clearInterval(pollTimer);
      clearTimeout(timeoutTimer);
      resolve(window.YT);
    };

    window.onYouTubeIframeAPIReady = function() {
      try {
        if (typeof previousReady === 'function') previousReady();
      } catch (err) {
        console.info('[YouTube] previous API ready callback notice:', err);
      }
      finish();
    };

    if (!document.querySelector('script[data-youtube-iframe-api="1"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.dataset.youtubeIframeApi = '1';
      script.onerror = () => {
        if (settled) return;
        settled = true;
        clearInterval(pollTimer);
        clearTimeout(timeoutTimer);
        youtubeIframeApiPromise = null;
        reject(new Error('YouTube IFrame APIを読み込めませんでした'));
      };
      document.head.appendChild(script);
    }

    const pollTimer = setInterval(finish, 100);
    const timeoutTimer = setTimeout(() => {
      if (settled) return;
      settled = true;
      clearInterval(pollTimer);
      youtubeIframeApiPromise = null;
      reject(new Error('YouTube IFrame APIの読み込みがタイムアウトしました'));
    }, 15000);
  });

  return youtubeIframeApiPromise;
}

function destroyYoutubePlayerController() {
  youtubePlayerAttachSerial += 1;

  if (youtubeAutoAdvanceTimer) {
    clearTimeout(youtubeAutoAdvanceTimer);
    youtubeAutoAdvanceTimer = null;
  }

  if (youtubePlayerController?.destroy) {
    try {
      youtubePlayerController.destroy();
    } catch (err) {
      console.info('[YouTube] player destroy notice:', err);
    }
  }

  youtubePlayerController = null;
  const modal = document.getElementById('youtube-video-modal');
  if (modal) modal.dataset.playerReady = '0';
}

function updateYoutubeMediaSession(item) {
  if (!item || !('mediaSession' in navigator)) return;

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: item.title || '',
      artist: item.displayName || 'YouTube',
      artwork: item.videoId
        ? [{
            src: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
            sizes: '480x360',
            type: 'image/jpg'
          }]
        : []
    });
  } catch (err) {
    console.info('[YouTube] Media Session metadata notice:', err);
  }
}

function updateYoutubeModalForIndex(index) {
  const list = window.currentVideoList;
  const modal = document.getElementById('youtube-video-modal');
  if (!modal || !list || index < 0 || index >= list.length) return null;

  const item = list[index];
  const isShortsMode = Boolean(item?.isShort);

  modal.dataset.youtubeIndex = String(index);
  modal.dataset.youtubeShortsMode = isShortsMode ? '1' : '0';
  modal.classList.toggle('yt-shorts-mode', isShortsMode);

  // Shortsは縦長専用。横画面モードを持ち越さない。
  if (isShortsMode) {
    modal.dataset.landscapeRequested = '0';
    modal.classList.remove('yt-css-landscape-mode', 'yt-css-landscape-fill');
  }

  const titleNode = modal.querySelector('.yt-modal-title');
  if (titleNode) titleNode.textContent = `⠿ ${item.title || ''}`;

  const prev = modal.querySelector('.yt-prev-btn');
  const next = modal.querySelector('.yt-next-btn');

  if (prev) {
    const enabled = index > 0;
    prev.disabled = !enabled;
    prev.style.opacity = enabled ? '1' : '0.3';
    prev.style.cursor = enabled ? 'pointer' : 'default';
    prev.onclick = enabled ? () => window.switchYoutubeModalVideo(index - 1) : null;
  }

  if (next) {
    const enabled = index < list.length - 1;
    next.disabled = !enabled;
    next.style.opacity = enabled ? '1' : '0.3';
    next.style.cursor = enabled ? 'pointer' : 'default';
    next.onclick = enabled ? () => window.switchYoutubeModalVideo(index + 1) : null;
  }

  const official = modal.querySelector('.yt-open-official');
  if (official && item.videoId) {
    official.href = `https://www.youtube.com/watch?v=${item.videoId}`;
  }

  const iframe = document.getElementById('yt-active-iframe');
  if (iframe) iframe.title = item.title || 'YouTube';

  updateYoutubeMediaSession(item);
  return item;
}

window.switchYoutubeModalVideo = function(index) {
  const list = window.currentVideoList;
  if (!list || index < 0 || index >= list.length) return;

  const item = updateYoutubeModalForIndex(index);
  if (!item?.videoId) return;

  if (youtubePlayerController?.loadVideoById) {
    try {
      // YouTube公式仕様: loadVideoById() は動画を読み込み、そのまま再生する。
      youtubePlayerController.loadVideoById({
        videoId: item.videoId,
        startSeconds: 0
      });
      return;
    } catch (err) {
      console.info('[YouTube] loadVideoById fallback:', err);
    }
  }

  // APIがまだ準備できていない場合だけ従来方式でモーダルを再生成する。
  window.openYoutubeModalByIndex(index);
};

function handleYoutubePlayerStateChange(event) {
  const YT = window.YT;
  if (!YT?.PlayerState) return;

  if (event.data === YT.PlayerState.PLAYING) {
    if (youtubeAutoAdvanceTimer) {
      clearTimeout(youtubeAutoAdvanceTimer);
      youtubeAutoAdvanceTimer = null;
    }
    return;
  }

  if (event.data !== YT.PlayerState.ENDED || !isYoutubeAutoNextEnabled()) {
    return;
  }

  const modal = document.getElementById('youtube-video-modal');
  const list = window.currentVideoList;
  if (!modal || !list?.length) return;

  const currentIndex = Number(modal.dataset.youtubeIndex || 0);
  const nextIndex = currentIndex + 1;
  if (nextIndex >= list.length) return;

  if (youtubeAutoAdvanceTimer) clearTimeout(youtubeAutoAdvanceTimer);

  youtubeAutoAdvanceTimer = setTimeout(() => {
    youtubeAutoAdvanceTimer = null;

    // モーダルを作り直さず同じYT.Playerへ次動画を読み込むため、
    // 横画面/縦画面の状態もそのまま維持される。
    window.switchYoutubeModalVideo(nextIndex);
  }, 250);
}

function attachYoutubePlayerController(index) {
  const iframe = document.getElementById('yt-active-iframe');
  if (!iframe) return;

  const attachSerial = ++youtubePlayerAttachSerial;

  ensureYoutubeIframeApi()
    .then((YT) => {
      if (attachSerial !== youtubePlayerAttachSerial) return;
      if (document.getElementById('yt-active-iframe') !== iframe) return;

      youtubePlayerController = new YT.Player(iframe, {
        events: {
          onReady(event) {
            if (attachSerial !== youtubePlayerAttachSerial) return;
            youtubePlayerController = event.target;
            const readyModal = document.getElementById('youtube-video-modal');
            if (readyModal) readyModal.dataset.playerReady = '1';
            updateYoutubeModalForIndex(index);

            // 一覧タップ時はiframe側の autoplay=1 に加えて、
            // Player APIからもplayVideo()を実行して即再生を試みる。
            try {
              event.target.playVideo();
            } catch (err) {
              console.info('[YouTube] initial play notice:', err);
            }
          },
          onStateChange: handleYoutubePlayerStateChange,
          onAutoplayBlocked() {
            console.info('[YouTube] autoplay blocked by browser');
            const blockedModal = document.getElementById('youtube-video-modal');
            if (blockedModal) blockedModal.dataset.autoplayBlocked = '1';
          },
          onError(event) {
            console.warn('[YouTube] player error:', event?.data);
          }
        }
      });
    })
    .catch((err) => {
      console.info('[YouTube] IFrame API attach notice:', err);
      // APIが読み込めなくても従来iframeはautoplay=1のままなので再生UIは残る。
    });
}

// ==========================================
// A & B 対応: YouTubeモーダルとメディア・画面回転制御
// ==========================================
window.openYoutubeModalByIndex = function(index) {
  const list = window.currentVideoList;
  if (!list || index < 0 || index >= list.length) return;

  const item = list[index];

  // v14: 2回目以降は同じYT.Playerを保持して再利用する。
  // ユーザーが一覧をタップした同じイベント内でloadVideoById()を呼ぶことで、
  // iPhoneでiframeを作り直すたびにautoplayが再ブロックされる問題を避ける。
  const reusableModal = document.getElementById('youtube-video-modal');
  if (
    reusableModal &&
    reusableModal.dataset.playerReady === '1' &&
    youtubePlayerController?.loadVideoById
  ) {
    reusableModal.style.setProperty('display', 'block', 'important');
    reusableModal.style.setProperty('visibility', 'visible', 'important');
    reusableModal.dataset.landscapeRequested = '0';
    reusableModal.classList.remove('yt-css-landscape-mode', 'yt-css-landscape-fill');

    // updateYoutubeModalForIndex() で Shorts/通常モードを先に確定してから
    // それぞれに合うウィンドウサイズを適用する。
    updateYoutubeModalForIndex(index);
    applyYoutubeWindowedModalStyle(reusableModal);
    updateYoutubeAutoNextUi();

    try {
      youtubePlayerController.loadVideoById({
        videoId: item.videoId,
        startSeconds: 0
      });
      youtubePlayerController.playVideo?.();
    } catch (err) {
      console.info('[YouTube] reused player playback notice:', err);
    }

    updateYoutubeMediaSession(item);
    return;
  }

  const videoId = item.videoId;
  const title = item.title || '';
  const channelName = item.displayName || '';

  let modal = document.getElementById('youtube-video-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'youtube-video-modal';
    document.body.appendChild(modal);
  }

  // 横画面中に「前/次」を押しても横画面レイアウトを維持する。
  const keepLandscapeMode =
    modal.dataset.landscapeRequested === '1' ||
    modal.classList.contains('yt-css-landscape-mode') ||
    modal.classList.contains('yt-css-landscape-fill') ||
    Boolean(document.fullscreenElement);

  const hasPrev = index > 0;
  const hasNext = index < list.length - 1;

  // 一覧から別動画を開き直す場合は旧iframeへのPlayer参照だけ破棄する。
  destroyYoutubePlayerController();

  modal.style.cssText = `
    position: fixed !important;
    width: min(320px, 85vw) !important;
    height: auto !important;
    background: #000 !important;
    border-radius: 8px !important;
    overflow: hidden !important;
    z-index: 999999 !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    touch-action: none;
  `;

  if (window.modalPos.x !== null && window.modalPos.y !== null) {
    modal.style.left = `${window.modalPos.x}px`;
    modal.style.top = `${window.modalPos.y}px`;
    modal.style.bottom = 'auto';
    modal.style.right = 'auto';
  } else {
    modal.style.bottom = '16px';
    modal.style.right = '16px';
    modal.style.top = 'auto';
    modal.style.left = 'auto';
  }

  modal.innerHTML = `
    <div class="yt-modal-layout" style="width: 100%; background: #000; position: relative;">
      <div id="yt-modal-drag-handle" class="yt-modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: #1c1c1e; color: #fff; font-size: 12px; cursor: move; user-select: none; -webkit-user-select: none;">
        <div class="yt-nav-buttons" style="display: flex; align-items: center; gap: 4px;">
          <button class="yt-prev-btn" onclick="switchYoutubeModalVideo(${index - 1})" ${!hasPrev ? 'disabled' : ''} style="background: rgba(255,255,255,0.15); border: none; color: #fff; padding: 2px 6px; border-radius: 4px; cursor: ${hasPrev ? 'pointer' : 'default'}; opacity: ${hasPrev ? '1' : '0.3'}; font-size: 11px;">▲ 前</button>
          <button class="yt-next-btn" onclick="switchYoutubeModalVideo(${index + 1})" ${!hasNext ? 'disabled' : ''} style="background: rgba(255,255,255,0.15); border: none; color: #fff; padding: 2px 6px; border-radius: 4px; cursor: ${hasNext ? 'pointer' : 'default'}; opacity: ${hasNext ? '1' : '0.3'}; font-size: 11px;">▼ 次</button>
        </div>
        <div class="yt-modal-title" style="font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0 6px; flex: 1; text-align: center; font-size: 11px;">⠿ ${title}</div>
        <button class="yt-close-btn" onclick="closeYoutubeModal()" style="background: none; border: none; color: #fff; font-size: 16px; cursor: pointer; padding: 0 4px; line-height: 1;">✕</button>
      </div>

      <div style="position: relative; width: 100%; padding-top: 56.25%; background: #000; overflow: hidden;" id="yt-player-wrapper">
        <div style="position: absolute; top: 0; left: 0; width: 200%; height: 200%; transform: scale(0.5); transform-origin: 0 0;">
          <iframe 
            id="yt-active-iframe"
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&vq=hd1080&enablejsapi=1&origin=${encodeURIComponent(location.origin)}" 
            title="${title}"
            style="width: 100%; height: 100%; border: none;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share" 
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen>
          </iframe>
        </div>
      </div>

      <div id="yt-orientation-gesture-zone" class="yt-orientation-control-bar" aria-label="画面方向コントロール">
        <button id="yt-landscape-btn" class="yt-orientation-btn" type="button" onclick="toggleLandscapeFullscreen()" title="横画面 / 縦画面を切り替え">
          <img src="icons/landscape.png" alt="" class="yt-landscape-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
          <span class="yt-landscape-icon-fallback" style="display:none;">⤢</span>
          <span id="yt-orientation-button-label">横画面</span>
        </button>
        <button id="yt-auto-next-btn" class="yt-auto-next-btn" type="button" onclick="toggleYoutubeAutoNext(event)" aria-pressed="true">
          <span>連続再生</span>
          <span id="yt-auto-next-status" class="yt-auto-next-status">ON</span>
        </button>
        <div class="yt-orientation-swipe-hint">↑ 横画面　／　↓ 縦画面</div>
        <a class="yt-open-official" href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener">YouTubeで開く ↗</a>
      </div>
    </div>
  `;

  modal.dataset.youtubeIndex = String(index);
  updateYoutubeModalForIndex(index);
  applyYoutubeWindowedModalStyle(modal);
  updateYoutubeAutoNextUi();
  attachYoutubePlayerController(index);

  setupModalDrag(modal);

  // Media Session API: 再生中動画のメタデータ/対応環境のメディア操作連携
  updateYoutubeMediaSession(item);
  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (youtubePlayerController?.playVideo) {
          youtubePlayerController.playVideo();
          return;
        }
        const iframe = document.getElementById('yt-active-iframe');
        if (iframe) iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (youtubePlayerController?.pauseVideo) {
          youtubePlayerController.pauseVideo();
          return;
        }
        const iframe = document.getElementById('yt-active-iframe');
        if (iframe) iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      });
    } catch (err) {
      console.info('[YouTube] Media Session is partially unsupported:', err);
    }
  }

  // 横画面ボタン + 上/下スワイプ操作を設定。
  installYoutubeOrientationGestures(modal);

  if (keepLandscapeMode) {
    modal.dataset.landscapeRequested = '1';
    applyYoutubeCssLandscapeMode(modal);
    updateYoutubeOrientationButton();
  }
};

// 互換性のため関数名は残すが、YouTube埋め込みプレーヤーのバックグラウンド再生を
// 無音音声などで回避する処理は行わない（YouTube APIポリシー上許可されていないため）。
function setupBackgroundAudioKeepAlive() {
  return false;
}

function applyYoutubeWindowedModalStyle(modal) {
  if (!modal) return;

  const isShortsMode = modal.dataset.youtubeShortsMode === '1';

  if (isShortsMode) {
    // Shortsは9:16のプレーヤー＋上下UIがiPhone画面内に収まる幅にする。
    // 動画/Liveとは完全に独立した縦長ウィンドウ。
    const viewport = getYoutubeVisualViewportBox();
    const reservedUiHeight = 118; // 上部操作 + 下部操作 + 余白
    const widthFromHeight = Math.max(
      180,
      (viewport.height - reservedUiHeight - 20) * 9 / 16
    );
    const shortsWidth = Math.floor(Math.max(
      180,
      Math.min(
        330,
        viewport.width - 20,
        viewport.width * 0.88,
        widthFromHeight
      )
    ));

    modal.style.setProperty('width', `${shortsWidth}px`, 'important');
    modal.style.setProperty('height', 'auto', 'important');
    modal.style.setProperty('max-width', 'calc(100vw - 20px)', 'important');
    modal.style.setProperty('max-height', 'calc(100dvh - 20px)', 'important');
    modal.style.setProperty('transform', 'none', 'important');
    modal.style.setProperty('border-radius', '12px', 'important');
    modal.style.setProperty('overflow', 'hidden', 'important');

    // 通常動画で保存したドラッグ位置がある場合はできるだけ維持しつつ、
    // Shortsの縦長化で画面外へはみ出さない範囲へクランプする。
    if (window.modalPos?.x !== null && window.modalPos?.y !== null) {
      const estimatedHeight = shortsWidth * 16 / 9 + reservedUiHeight;
      const safeLeft = Math.max(
        viewport.offsetLeft + 8,
        Math.min(
          window.modalPos.x,
          viewport.offsetLeft + viewport.width - shortsWidth - 8
        )
      );
      const safeTop = Math.max(
        viewport.offsetTop + 8,
        Math.min(
          window.modalPos.y,
          viewport.offsetTop + viewport.height - estimatedHeight - 8
        )
      );

      modal.style.setProperty('left', `${safeLeft}px`, 'important');
      modal.style.setProperty('top', `${safeTop}px`, 'important');
      modal.style.setProperty('right', 'auto', 'important');
      modal.style.setProperty('bottom', 'auto', 'important');
    } else {
      modal.style.setProperty('left', 'auto', 'important');
      modal.style.setProperty('top', 'auto', 'important');
      modal.style.setProperty('right', '10px', 'important');
      modal.style.setProperty('bottom', '10px', 'important');
    }
    return;
  }

  modal.style.setProperty('width', 'min(320px, 85vw)', 'important');
  modal.style.setProperty('height', 'auto', 'important');
  modal.style.setProperty('max-width', 'none', 'important');
  modal.style.setProperty('max-height', 'none', 'important');
  modal.style.setProperty('transform', 'none', 'important');
  modal.style.setProperty('border-radius', '8px', 'important');
  modal.style.setProperty('overflow', 'hidden', 'important');

  // Shortsから通常動画/LIVEへ戻ったときも、元のドラッグ位置を復元する。
  if (window.modalPos?.x !== null && window.modalPos?.y !== null) {
    modal.style.setProperty('left', `${window.modalPos.x}px`, 'important');
    modal.style.setProperty('top', `${window.modalPos.y}px`, 'important');
    modal.style.setProperty('right', 'auto', 'important');
    modal.style.setProperty('bottom', 'auto', 'important');
  } else {
    modal.style.setProperty('left', 'auto', 'important');
    modal.style.setProperty('top', 'auto', 'important');
    modal.style.setProperty('right', '16px', 'important');
    modal.style.setProperty('bottom', '16px', 'important');
  }
}

function getYoutubeVisualViewportBox() {
  const vv = window.visualViewport;
  return {
    width: Math.max(1, vv?.width || window.innerWidth || document.documentElement.clientWidth || 1),
    height: Math.max(1, vv?.height || window.innerHeight || document.documentElement.clientHeight || 1),
    offsetLeft: Number(vv?.offsetLeft || 0),
    offsetTop: Number(vv?.offsetTop || 0)
  };
}

function applyYoutubeCssLandscapeMode(modal) {
  if (!modal) return;

  const viewport = getYoutubeVisualViewportBox();
  const viewportIsLandscape = viewport.width > viewport.height;
  const edgeGap = 2;

  modal.classList.toggle('yt-css-landscape-fill', viewportIsLandscape);
  modal.classList.toggle('yt-css-landscape-mode', !viewportIsLandscape);
  modal.style.setProperty('box-sizing', 'border-box', 'important');

  if (viewportIsLandscape) {
    // 実際に端末が横向きなら回転不要。visualViewportぴったりに収める。
    modal.style.setProperty('top', `${viewport.offsetTop + edgeGap}px`, 'important');
    modal.style.setProperty('left', `${viewport.offsetLeft + edgeGap}px`, 'important');
    modal.style.setProperty('right', 'auto', 'important');
    modal.style.setProperty('bottom', 'auto', 'important');
    modal.style.setProperty('width', `${Math.max(1, viewport.width - edgeGap * 2)}px`, 'important');
    modal.style.setProperty('height', `${Math.max(1, viewport.height - edgeGap * 2)}px`, 'important');
    modal.style.setProperty('transform', 'none', 'important');
  } else {
    // iPhoneを縦向きのまま擬似横画面にする場合。
    // 90度回転後の外接矩形がvisualViewport内へ正確に収まるサイズをpxで指定する。
    const centerX = viewport.offsetLeft + viewport.width / 2;
    const centerY = viewport.offsetTop + viewport.height / 2;
    const modalWidthBeforeRotate = Math.max(1, viewport.height - edgeGap * 2);
    const modalHeightBeforeRotate = Math.max(1, viewport.width - edgeGap * 2);

    modal.style.setProperty('top', `${centerY}px`, 'important');
    modal.style.setProperty('left', `${centerX}px`, 'important');
    modal.style.setProperty('right', 'auto', 'important');
    modal.style.setProperty('bottom', 'auto', 'important');
    modal.style.setProperty('width', `${modalWidthBeforeRotate}px`, 'important');
    modal.style.setProperty('height', `${modalHeightBeforeRotate}px`, 'important');
    modal.style.setProperty('transform', 'translate(-50%, -50%) rotate(-90deg)', 'important');
  }

  modal.style.setProperty('max-width', 'none', 'important');
  modal.style.setProperty('max-height', 'none', 'important');
  modal.style.setProperty('border-radius', '0', 'important');
  modal.style.setProperty('overflow', 'hidden', 'important');
}

function syncYoutubeLandscapeForViewport() {
  const modal = document.getElementById('youtube-video-modal');
  if (!modal || modal.dataset.landscapeRequested !== '1' || document.fullscreenElement) return;
  applyYoutubeCssLandscapeMode(modal);
}



function isYoutubeLandscapeMode() {
  const modal = document.getElementById('youtube-video-modal');
  return Boolean(modal?.classList.contains('yt-css-landscape-mode') || modal?.classList.contains('yt-css-landscape-fill') || document.fullscreenElement);
}

function updateYoutubeOrientationButton() {
  const label = document.getElementById('yt-orientation-button-label');
  if (label) label.textContent = isYoutubeLandscapeMode() ? '縦画面' : '横画面';
}

async function enterYoutubeLandscapeMode() {
  const modal = document.getElementById('youtube-video-modal');
  const wrapper = document.getElementById('yt-player-wrapper');
  if (!modal || !wrapper) return;

  // Shortsタブから開いた動画は縦長専用。横画面化は行わない。
  if (modal.dataset.youtubeShortsMode === '1') return;

  let nativeFullscreen = false;
  let orientationLocked = false;
  const canLockOrientation = Boolean(screen.orientation?.lock);

  // orientation.lock が使える環境では標準Fullscreen + 横向き固定を優先する。
  // iPhone Safari/PWAのようにlockが使えない環境では、先にFullscreenへ入ると
  // 親要素のCSS回転が効かなくなるため、最初からCSSフォールバックを使う。
  if (canLockOrientation) {
    try {
      if (!document.fullscreenElement && modal.requestFullscreen) {
        await modal.requestFullscreen();
        nativeFullscreen = true;
      }
    } catch (err) {
      console.info('[YouTube] Fullscreen API unavailable, using CSS fallback:', err);
    }

    try {
      await screen.orientation.lock('landscape');
      orientationLocked = true;
    } catch (err) {
      console.info('[YouTube] Orientation lock unavailable, using visual landscape fallback:', err);
    }
  }

  // iPhone Safari/PWAではorientation.lockが使えないことがあるため、
  // その場合はモーダル自体を90度回転してYouTubeアプリ風の横表示にする。
  if (!orientationLocked) {
    modal.dataset.landscapeRequested = '1';
    applyYoutubeCssLandscapeMode(modal);
  } else {
    modal.dataset.landscapeRequested = '1';
  }

  modal.dataset.nativeFullscreen = nativeFullscreen ? '1' : '0';
  updateYoutubeOrientationButton();
}

async function exitYoutubeLandscapeMode() {
  const modal = document.getElementById('youtube-video-modal');
  if (!modal) return;

  modal.classList.remove('yt-css-landscape-mode', 'yt-css-landscape-fill');
  modal.dataset.landscapeRequested = '0';
  applyYoutubeWindowedModalStyle(modal);

  // 通常表示の位置へ戻す。ドラッグ済みなら保存位置を復元する。
  if (window.modalPos.x !== null && window.modalPos.y !== null) {
    modal.style.left = `${window.modalPos.x}px`;
    modal.style.top = `${window.modalPos.y}px`;
    modal.style.right = 'auto';
    modal.style.bottom = 'auto';
  } else {
    modal.style.left = 'auto';
    modal.style.top = 'auto';
    modal.style.right = '16px';
    modal.style.bottom = '16px';
  }

  try {
    if (screen.orientation?.unlock) {
      screen.orientation.unlock();
    }
  } catch (_) {}

  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
  } catch (err) {
    console.info('[YouTube] exitFullscreen notice:', err);
  }

  modal.dataset.nativeFullscreen = '0';
  updateYoutubeOrientationButton();
}

window.toggleLandscapeFullscreen = async function() {
  const modal = document.getElementById('youtube-video-modal');
  if (modal?.dataset.youtubeShortsMode === '1') return;

  if (isYoutubeLandscapeMode()) {
    await exitYoutubeLandscapeMode();
  } else {
    await enterYoutubeLandscapeMode();
  }
};

function installYoutubeOrientationGestures(modal) {
  const zone = modal?.querySelector('#yt-orientation-gesture-zone');
  if (!zone || zone.dataset.orientationGestureInstalled === '1') return;
  zone.dataset.orientationGestureInstalled = '1';

  let startX = 0;
  let startY = 0;
  let tracking = false;

  zone.addEventListener('touchstart', (event) => {
    if (modal.dataset.youtubeShortsMode === '1') return;
    if (event.touches?.length !== 1) return;
    const point = event.touches[0];
    startX = point.clientX;
    startY = point.clientY;
    tracking = true;
  }, { passive: true });

  zone.addEventListener('touchend', (event) => {
    if (modal.dataset.youtubeShortsMode === '1') {
      tracking = false;
      return;
    }
    if (!tracking) return;
    tracking = false;

    const point = event.changedTouches?.[0];
    if (!point) return;

    const dx = point.clientX - startX;
    const dy = point.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // 明確な縦スワイプだけ採用。上=横画面、下=縦画面。
    if (absY < 46 || absY <= absX * 1.25) return;

    if (dy < 0) {
      enterYoutubeLandscapeMode();
    } else {
      exitYoutubeLandscapeMode();
    }
  }, { passive: true });

  document.addEventListener('fullscreenchange', updateYoutubeOrientationButton);
  if (!window.__youtubeLandscapeViewportSyncInstalled) {
    window.__youtubeLandscapeViewportSyncInstalled = true;
    window.addEventListener('resize', syncYoutubeLandscapeForViewport, { passive: true });
    window.addEventListener('orientationchange', () => window.setTimeout(syncYoutubeLandscapeForViewport, 120), { passive: true });
  }
}

function setupModalDrag(modal) {
  const handle = modal.querySelector('#yt-modal-drag-handle');
  if (!handle) return;

  let isDragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;

  const onStart = (e) => {
    if (e.target.tagName === 'BUTTON') return;

    isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = modal.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    startX = clientX;
    startY = clientY;

    modal.style.bottom = 'auto';
    modal.style.right = 'auto';
    modal.style.left = `${initialLeft}px`;
    modal.style.top = `${initialTop}px`;
  };

  const onMove = (e) => {
    if (!isDragging) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    let newLeft = initialLeft + deltaX;
    let newTop = initialTop + deltaY;

    const maxLeft = window.innerWidth - modal.offsetWidth;
    const maxTop = window.innerHeight - modal.offsetHeight;

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    modal.style.left = `${newLeft}px`;
    modal.style.top = `${newTop}px`;

    window.modalPos.x = newLeft;
    window.modalPos.y = newTop;
  };

  const onEnd = () => {
    isDragging = false;
  };

  handle.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);

  handle.addEventListener('touchstart', onStart, { passive: true });
  document.addEventListener('touchmove', onMove, { passive: true });
  document.addEventListener('touchend', onEnd);
}

window.closeYoutubeModal = async function() {
  // Playerは破棄せず、一時停止して非表示で保持する。
  // 次の一覧タップでは同じPlayerを再利用して即時loadVideoById()する。
  if (youtubeAutoAdvanceTimer) {
    clearTimeout(youtubeAutoAdvanceTimer);
    youtubeAutoAdvanceTimer = null;
  }
  try { youtubePlayerController?.pauseVideo?.(); } catch (_) {}

  const modal = document.getElementById('youtube-video-modal');
  if (modal) {
    await exitYoutubeLandscapeMode();
    modal.style.setProperty('display', 'none', 'important');
    modal.style.setProperty('visibility', 'hidden', 'important');
  }
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = null;
    try { navigator.mediaSession.setActionHandler('play', null); } catch (_) {}
    try { navigator.mediaSession.setActionHandler('pause', null); } catch (_) {}
  }
};

function renderTabs(containerId, feeds, onClickCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  feeds.forEach((feed, idx) => {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${idx === 0 ? 'active' : ''}`;
    btn.textContent = feed.name;
    btn.onclick = () => {
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onClickCallback(feed.url, idx);
    };
    container.appendChild(btn);
  });
}

// --- モーダル制御 ---
function initModals() {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');

  if (!modal || !modalTitle || !modalBody || !cancelBtn || !submitBtn) return;

  const cleanupExtraButtons = () => {
    const extraBtn = document.getElementById('modal-nitter-btn');
    if (extraBtn) extraBtn.remove();
    const addRowBtn = document.getElementById('modal-add-row-btn');
    if (addRowBtn) addRowBtn.remove();
  };

  const closeModal = () => {
    cleanupExtraButtons();
    modalBody.innerHTML = '';
    submitBtn.textContent = '保存';
    submitBtn.onclick = null;
    modal.classList.add('hidden');
  };

  const resetFeedUiAfterMutation = (kind, initFunc) => {
    if (kind === 'news' || kind === 'knowledge') {
      feedItemsCache[kind].clear();
      feedLoadPromises[kind].clear();
      const feeds = getFeedsByType(kind);
      setCurrentFeedIndex(kind, Math.max(0, Math.min(getCurrentFeedIndex(kind), feeds.length - 1)));
    }
    initFunc();
  };

  cancelBtn.onclick = closeModal;

  const setupAddModal = (btnId, titleText, feedsArray, storageKey, initFunc, kind = '') => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    btn.onclick = () => {
      cleanupExtraButtons();
      modalTitle.textContent = titleText;
      modalBody.innerHTML = `
        <div class="feed-modal-form">
          <div>
            <label>サイト名 / チャンネル名</label>
            <input type="text" id="add-feed-name" placeholder="例: NHKニュース" autocomplete="off">
          </div>
          <div>
            <label>${kind === 'youtube' ? 'YouTubeチャンネルID / @ハンドル' : 'RSS URL'}</label>
            <input type="text" id="add-feed-url" placeholder="${kind === 'youtube' ? '例: @channel または UC...' : '例: https://.../rss.xml'}" autocomplete="off">
          </div>
        </div>
      `;

      submitBtn.textContent = '追加';
      submitBtn.onclick = () => {
        const name = document.getElementById('add-feed-name')?.value.trim() || '';
        const url = document.getElementById('add-feed-url')?.value.trim() || '';

        if (!name || !url) {
          alert('すべての項目を入力してください');
          return;
        }

        feedsArray.push({ name, url });
        saveStoredFeeds(storageKey, feedsArray);

        if (kind === 'news' || kind === 'knowledge') {
          // Allがindex 0なので、追加した実フィードは実配列index + 1。
          setCurrentFeedIndex(kind, feedsArray.length);
        }

        closeModal();
        resetFeedUiAfterMutation(kind, initFunc);
      };

      // 旧コードはここが add('hidden') になっており、押してもモーダルが表示されなかった。
      modal.classList.remove('hidden');
      requestAnimationFrame(() => document.getElementById('add-feed-name')?.focus());
    };
  };

  const setupEditModal = (btnId, titleText, feedsArray, storageKey, initFunc, kind = '') => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    btn.onclick = () => {
      cleanupExtraButtons();
      modalTitle.textContent = titleText;

      let draft = feedsArray.map(feed => ({ ...feed }));

      const renderEditor = () => {
        if (!draft.length) {
          modalBody.innerHTML = '<div class="loading">登録されている配信先がありません</div>';
          return;
        }

        modalBody.innerHTML = '';

        draft.forEach((feed, idx) => {
          const row = document.createElement('div');
          row.className = 'feed-edit-row';
          row.innerHTML = `
            <div class="feed-edit-fields">
              <input class="feed-edit-name" type="text" value="${escapeHtmlAttribute(feed.name || '')}" aria-label="配信先名">
              <input class="feed-edit-url" type="text" value="${escapeHtmlAttribute(feed.url || '')}" aria-label="RSS URLまたはチャンネルID">
            </div>
            <div class="feed-edit-actions">
              <button type="button" class="btn feed-move-up" ${idx === 0 ? 'disabled' : ''}>↑</button>
              <button type="button" class="btn feed-move-down" ${idx === draft.length - 1 ? 'disabled' : ''}>↓</button>
              <button type="button" class="btn danger feed-delete">削除</button>
            </div>
          `;

          row.querySelector('.feed-edit-name').addEventListener('input', (e) => {
            draft[idx].name = e.target.value;
          });
          row.querySelector('.feed-edit-url').addEventListener('input', (e) => {
            draft[idx].url = e.target.value;
          });
          row.querySelector('.feed-move-up').addEventListener('click', () => {
            if (idx <= 0) return;
            [draft[idx - 1], draft[idx]] = [draft[idx], draft[idx - 1]];
            renderEditor();
          });
          row.querySelector('.feed-move-down').addEventListener('click', () => {
            if (idx >= draft.length - 1) return;
            [draft[idx + 1], draft[idx]] = [draft[idx], draft[idx + 1]];
            renderEditor();
          });
          row.querySelector('.feed-delete').addEventListener('click', () => {
            draft.splice(idx, 1);
            renderEditor();
          });

          modalBody.appendChild(row);
        });
      };

      submitBtn.textContent = '保存';
      submitBtn.onclick = () => {
        const normalized = draft.map(feed => ({
          name: String(feed.name || '').trim(),
          url: String(feed.url || '').trim()
        }));

        if (normalized.some(feed => !feed.name || !feed.url)) {
          alert('サイト名とURL/チャンネルIDをすべて入力してください');
          return;
        }

        feedsArray.splice(0, feedsArray.length, ...normalized);
        saveStoredFeeds(storageKey, feedsArray);
        closeModal();
        resetFeedUiAfterMutation(kind, initFunc);
      };

      renderEditor();
      modal.classList.remove('hidden');
    };
  };

  setupAddModal('add-news-btn', 'ニュース配信先の追加', newsFeeds, 'newsFeeds', initNews, 'news');
  setupEditModal('del-news-btn', 'ニュース配信先の編集', newsFeeds, 'newsFeeds', initNews, 'news');

  setupAddModal('add-knowledge-btn', '知識配信先の追加', knowledgeFeeds, 'knowledgeFeeds', initKnowledge, 'knowledge');
  setupEditModal('del-knowledge-btn', '知識配信先の編集', knowledgeFeeds, 'knowledgeFeeds', initKnowledge, 'knowledge');

  // 既存YouTubeの追加/編集も壊さないよう同じモーダル基盤へ接続する。
  setupAddModal('add-youtube-btn', 'YouTubeチャンネルの追加', youtubeFeeds, 'youtubeFeeds', initYoutube, 'youtube');
  setupEditModal('del-youtube-btn', 'YouTubeチャンネルの編集', youtubeFeeds, 'youtubeFeeds', initYoutube, 'youtube');

  // Twitch追加はiPhoneでTwitchアプリの共有URLをそのまま貼れる1入力方式。
  const twitchAddBtn = document.getElementById('add-twitch-btn');
  if (twitchAddBtn) {
    twitchAddBtn.onclick = () => {
      cleanupExtraButtons();
      modalTitle.textContent = 'Twitch配信者の追加';
      modalBody.innerHTML = `
        <div class="feed-modal-form">
          <div>
            <label>配信者名 / TwitchチャンネルURL</label>
            <input type="text" id="add-twitch-channel" placeholder="例: twitchdev / @twitchdev / https://www.twitch.tv/twitchdev" autocomplete="off" autocapitalize="none">
            <div class="modal-help">iPhoneのTwitchアプリで配信者ページ → 共有 → リンクをコピー → ここへ貼り付け、でOKです。数値IDは不要です。</div>
          </div>
        </div>
      `;

      submitBtn.textContent = '追加';
      submitBtn.onclick = async () => {
        const raw = document.getElementById('add-twitch-channel')?.value.trim() || '';
        const login = normalizeTwitchChannelInput(raw);
        if (!login) {
          alert('Twitchの配信者名またはチャンネルURLを入力してください');
          return;
        }

        if (twitchFeeds.some(feed => normalizeTwitchChannelInput(feed.url) === login)) {
          alert('この配信者はすでに登録されています');
          return;
        }

        const oldText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '確認中...';
        try {
          const response = await fetch(`/api/twitch-feed?channel=${encodeURIComponent(login)}&format=json`, { cache: 'no-store' });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.ok) throw new Error(data?.error || 'Twitch配信者を確認できませんでした');

          twitchFeeds.push({
            name: data.broadcaster?.displayName || login,
            url: data.broadcaster?.login || login
          });
          currentTwitchIdx = twitchFeeds.length - 1;
          saveStoredFeeds('twitchFeeds', twitchFeeds);
          twitchSnapshotCache.clear();
          closeModal();
          initTwitch();
        } catch (err) {
          alert(err?.message || 'Twitch配信者の追加に失敗しました');
        } finally {
          submitBtn.disabled = false;
          if (!modal.classList.contains('hidden')) submitBtn.textContent = oldText;
        }
      };

      modal.classList.remove('hidden');
      requestAnimationFrame(() => document.getElementById('add-twitch-channel')?.focus());
    };
  }

  setupEditModal('del-twitch-btn', 'Twitch配信者の編集', twitchFeeds, 'twitchFeeds', initTwitch, 'twitch');

  const refreshNewsBtn = document.getElementById('refresh-news-btn');
  if (refreshNewsBtn) refreshNewsBtn.onclick = () => refreshFeedSection('news');
  const refreshKnowledgeBtn = document.getElementById('refresh-knowledge-btn');
  if (refreshKnowledgeBtn) refreshKnowledgeBtn.onclick = () => refreshFeedSection('knowledge');
}

function escapeHtmlAttribute(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

