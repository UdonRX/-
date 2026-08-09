// Weather Code 変換マップ
const WEATHER_CODES = {
  0: "☀️", 1: "🌤️", 2: "🌤️", 3: "⛅", 4: "💨", 5: "🌫️", 6: "🪨", 7: "💨", 8: "🌪️", 9: "🏜️",
  10: "🌫️", 11: "🌫️", 12: "🌫️", 13: "🌩️", 14: "☁️", 15: "🌧️", 16: "🌧️", 17: "🌩️", 18: "💨", 19: "🌪️",
  20: "🌦️", 21: "🌦️", 22: "🌨️", 23: "🌨️", 24: "🧊", 25: "🌦️", 26: "🌨️", 27: "🌩️", 28: "🌫️", 29: "⛈️",
  30: "🏜️", 31: "🏜️", 32: "🏜️", 33: "🏜️", 34: "🏜️", 35: "🏜️", 36: "❄️", 37: "❄️", 38: "❄️", 39: "❄️",
  40: "🌫️", 41: "🌫️", 42: "🌫️", 43: "🌫️", 44: "🌫️", 45: "🌫️", 46: "🌫️", 47: "🌫️", 48: "🌫️", 49: "🌫️",
  50: "🌧️", 51: "🌧️", 52: "🌧️", 53: "🌧️", 54: "🌧️", 55: "🌧️", 56: "🧊", 57: "🧊", 58: "🌧️", 59: "🌧️",
  60: "🌧️", 61: "🌧️", 62: "🌧️", 63: "🌧️", 64: "🌧️", 65: "🌧️", 66: "🧊", 67: "🧊", 68: "🌨️", 69: "🌨️",
  70: "🌨️", 71: "🌨️", 72: "🌨️", 73: "🌨️", 74: "❄️", 75: "❄️", 76: "💎", 77: "❄️", 78: "❄️", 79: "🧊",
  80: "🌦️", 81: "🌧️", 82: "🌧️", 83: "🌨️", 84: "🌨️", 85: "🌨️", 86: "🌨️", 87: "🌨️", 88: "🌨️", 89: "🌩️",
  90: "🌩️", 91: "⛈️", 92: "⛈️", 93: "⛈️", 94: "⛈️", 95: "⛈️", 96: "⛈️", 97: "⛈️", 98: "🌩️", 99: "⛈️"
};

// 初期データ
const DEFAULT_NEWS = [
  { name: "朝日新聞(政治)", url: "https://www.asahi.com/rss/asahi/politics.rdf" },
  { name: "Yahoo!ニュース", url: "https://news.yahoo.co.jp/rss/media/aptsushinv/all.xml" }
];

const DEFAULT_KNOWLEDGE = [
  { name: "Qiita", url: "https://qiita.com/tags/javascript/feed.atom" },
  { name: "GIGAZINE", url: "https://gigazine.net/news/rss_2.0/" }
];

const DEFAULT_TWITTER = [];
const DEFAULT_YOUTUBE = [];

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

// グローバル変数
let newsFeeds = loadStoredFeeds('newsFeeds', DEFAULT_NEWS);
let knowledgeFeeds = loadStoredFeeds('knowledgeFeeds', DEFAULT_KNOWLEDGE);
let twitterFeeds = loadStoredFeeds('twitterFeeds', DEFAULT_TWITTER);
let youtubeFeeds = loadStoredFeeds('youtubeFeeds', DEFAULT_YOUTUBE);

let currentNewsUrl = '';
let currentKnowledgeUrl = '';

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  newsFeeds = loadStoredFeeds('newsFeeds', DEFAULT_NEWS);
  knowledgeFeeds = loadStoredFeeds('knowledgeFeeds', DEFAULT_KNOWLEDGE);
  twitterFeeds = loadStoredFeeds('twitterFeeds', DEFAULT_TWITTER);
  youtubeFeeds = loadStoredFeeds('youtubeFeeds', DEFAULT_YOUTUBE);

  initWeather();
  initNews();
  initKnowledge();
  initTwitter();
  initYoutube();
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
async function fetchNewsRSS(feedUrl) {
  const apiUrl = `/api/rss?url=${encodeURIComponent(feedUrl)}`;
  const response = await fetch(apiUrl);
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

async function fetchTwitterRSS(feedUrl) {
  const apiKey = 'vnxteaxirpi0jgkt7eyymepu1b1ywzkg0zvtrhdg';
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&api_key=${apiKey}`;
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('Twitter RSS取得エラー');
  
  const data = await response.json();
  if (data.status !== 'ok' || !Array.isArray(data.items)) {
    throw new Error('Twitter RSS解析エラー');
  }

  const feedTitle = data.feed ? data.feed.title : '';
  const feedAvatar = data.feed?.image || data.feed?.avatar || '';

  const originalTweets = data.items.filter(item => {
    const title = item.title || '';
    const isRetweet = /^RT\s/i.test(title.trim()) || /^RT\s+by\s/i.test(title.trim());
    return !isRetweet;
  });

  return originalTweets.map(item => {
    let rawDateStr = item.pubDate;
    if (typeof rawDateStr === 'string' && !rawDateStr.endsWith('Z') && !rawDateStr.includes('+')) {
      rawDateStr = rawDateStr.replace(' ', 'T') + 'Z';
    }

    let parsedDate = new Date(rawDateStr);
    if (isNaN(parsedDate.getTime())) parsedDate = new Date(item.pubDate);

    let avatarUrl = item.thumbnail || item.enclosure?.link || feedAvatar;

    return {
      title: item.title || '無題',
      link: item.link || '',
      pubDate: parsedDate,
      description: item.description || item.content || item.title || '',
      author: item.author || feedTitle,
      feedTitle: feedTitle,
      avatarUrl: avatarUrl
    };
  });
}

async function fetchYoutubeRSS(channelId) {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
  const apiUrl = `/api/rss?url=${encodeURIComponent(feedUrl)}`;
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('YouTube RSS取得エラー');
  const xmlText = await response.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('XMLパースエラー');
  }

  const authorName = xmlDoc.querySelector('author > name')?.textContent?.trim() || '';
  const entries = Array.from(xmlDoc.querySelectorAll('entry'));

  return entries.map(entry => {
    const videoId = entry.querySelector('yt\\:videoId, videoId')?.textContent?.trim() || '';
    const title = entry.querySelector('title')?.textContent?.trim() || '無題';
    const link = entry.querySelector('link')?.getAttribute('href') || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#');
    const published = entry.querySelector('published')?.textContent?.trim() || '';
    const channelName = authorName || entry.querySelector('author > name')?.textContent?.trim() || '不明なチャンネル';
    const thumbnail = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';

    let pubDate = new Date(published);
    if (isNaN(pubDate.getTime())) pubDate = new Date();

    return {
      title,
      link,
      pubDate,
      channelName,
      thumbnail
    };
  });
}

// --- コンポーネント描画 ---
async function initWeather() {
  const container = document.getElementById('weather-container');
  if (!container) return;
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=35.0211&longitude=135.7538&hourly=temperature_2m,weather_code&timezone=Asia%2FTokyo&forecast_days=1';
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    container.innerHTML = '';
    const { time, temperature_2m, weather_code } = data.hourly;

    time.forEach((t, i) => {
      const hour = t.split('T')[1].substring(0, 5);
      const temp = temperature_2m[i];
      const code = weather_code[i];
      const icon = WEATHER_CODES[code] || "❓";

      const item = document.createElement('div');
      item.className = 'weather-item';
      item.innerHTML = `
        <div class="weather-time">${hour}</div>
        <div class="weather-icon">${icon}</div>
        <div class="weather-temp">${temp}°C</div>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    container.innerHTML = '<div class="loading">天気データの取得に失敗しました</div>';
  }
}

function initNews() {
  renderTabs('news-tabs', newsFeeds, loadNewsContent);
  if (newsFeeds.length > 0) {
    loadNewsContent(newsFeeds[0].url);
  } else {
    const content = document.getElementById('news-content');
    if (content) content.innerHTML = '<div class="loading">配信先を追加してください</div>';
  }
}

async function loadNewsContent(url) {
  currentNewsUrl = url;
  const container = document.getElementById('news-content');
  if (!container) return;
  container.innerHTML = '<div class="loading">ニュースを読み込み中...</div>';

  try {
    const items = await fetchNewsRSS(url);
    if (currentNewsUrl !== url) return;

    if (items.length === 0) {
      container.innerHTML = '<div class="loading">記事が見つかりませんでした</div>';
      return;
    }

    container.innerHTML = '';
    items.forEach(item => {
      const newsDiv = document.createElement('div');
      newsDiv.className = 'news-item';
      const dateStr = item.pubDate instanceof Date && !isNaN(item.pubDate) 
        ? item.pubDate.toLocaleString('ja-JP') 
        : '';

      newsDiv.innerHTML = `
        <a href="${item.link}" target="_blank" rel="noopener" class="news-link">${item.title}</a>
        <div class="news-time">${dateStr}</div>
      `;
      container.appendChild(newsDiv);
    });
  } catch (err) {
    if (currentNewsUrl !== url) return;
    console.error(err);
    container.innerHTML = '<div class="loading">ニュースの取得に失敗しました</div>';
  }
}

function initKnowledge() {
  renderTabs('knowledge-tabs', knowledgeFeeds, loadKnowledgeContent);
  if (knowledgeFeeds.length > 0) {
    loadKnowledgeContent(knowledgeFeeds[0].url);
  } else {
    const content = document.getElementById('knowledge-content');
    if (content) content.innerHTML = '<div class="loading">配信先を追加してください</div>';
  }
}

async function loadKnowledgeContent(url) {
  currentKnowledgeUrl = url;
  const container = document.getElementById('knowledge-content');
  if (!container) return;
  container.innerHTML = '<div class="loading">知識を読み込み中...</div>';

  try {
    const items = await fetchNewsRSS(url);
    if (currentKnowledgeUrl !== url) return;

    if (items.length === 0) {
      container.innerHTML = '<div class="loading">記事が見つかりませんでした</div>';
      return;
    }

    container.innerHTML = '';
    items.forEach(item => {
      const newsDiv = document.createElement('div');
      newsDiv.className = 'news-item';
      const dateStr = item.pubDate instanceof Date && !isNaN(item.pubDate) 
        ? item.pubDate.toLocaleString('ja-JP') 
        : '';

      newsDiv.innerHTML = `
        <a href="${item.link}" target="_blank" rel="noopener" class="news-link">${item.title}</a>
        <div class="news-time">${dateStr}</div>
      `;
      container.appendChild(newsDiv);
    });
  } catch (err) {
    if (currentKnowledgeUrl !== url) return;
    console.error(err);
    container.innerHTML = '<div class="loading">知識の取得に失敗しました</div>';
  }
}

function initTwitter() {
  const addTwitterBtn = document.getElementById('add-twitter-btn');
  if (addTwitterBtn && !document.getElementById('refresh-twitter-btn')) {
    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'refresh-twitter-btn';
    refreshBtn.type = 'button';
    refreshBtn.className = 'btn';
    refreshBtn.style.marginRight = '4px';
    refreshBtn.style.padding = '6px';
    refreshBtn.style.display = 'inline-flex';
    refreshBtn.style.alignItems = 'center';
    refreshBtn.style.justifyContent = 'center';
    refreshBtn.innerHTML = '<img src="icons/refresh.png" alt="更新" style="width: 16px; height: 16px; display: block;">';
    refreshBtn.title = '最新のツイートを取得';
    refreshBtn.onclick = () => loadAllTwitterContent(true);
    
    addTwitterBtn.parentNode.insertBefore(refreshBtn, addTwitterBtn);
  }

  loadAllTwitterContent(false);
}

function extractUsername(rawText) {
  if (!rawText) return '無題';
  let cleaned = rawText.split(/[\(@\/]/)[0].trim();
  return cleaned || rawText;
}

async function loadAllTwitterContent(isManualRefresh = false) {
  const container = document.getElementById('twitter-content');
  const refreshBtn = document.getElementById('refresh-twitter-btn');
  if (!container) return;
  
  if (twitterFeeds.length === 0) {
    container.innerHTML = '<div class="loading">配信先を追加してください。</div>';
    return;
  }

  // キャッシュの確認（30分以内ならAPIを叩かない）
  const CACHE_KEY = 'twitter_cache_data';
  const TIME_KEY = 'twitter_cache_time';
  const cachedData = localStorage.getItem(CACHE_KEY);
  const cachedTime = localStorage.getItem(TIME_KEY);
  const now = Date.now();
  const CACHE_VALID_MINUTES = 30;

  if (!isManualRefresh && cachedData && cachedTime && (now - cachedTime < CACHE_VALID_MINUTES * 60 * 1000)) {
    try {
      const allTweets = JSON.parse(cachedData);
      allTweets.forEach(t => t.pubDate = new Date(t.pubDate));
      renderTweets(allTweets, container);
      return;
    } catch (e) {
      console.error('Cache parse error', e);
    }
  }

  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.style.opacity = '0.5';
  }

  container.innerHTML = '<div class="loading">ツイートを安全に取得中（制限対策モード）...</div>';

  try {
    let allTweets = [];
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2); // 2日前を計算

    // 60アカウント分の同時リクエストによる Too Many Requests (429) を防ぐため、1件ずつ順番に取得する
    for (let i = 0; i < twitterFeeds.length; i++) {
      const feed = twitterFeeds[i];
      try {
        const fetchUrl = isManualRefresh 
          ? `${feed.url}${feed.url.includes('?') ? '&' : '?'}_t=${Date.now()}` 
          : feed.url;
        
        const items = await fetchTwitterRSS(fetchUrl);
        
        // 2日前までのツイートだけにフィルタリング
        const filteredItems = items.filter(item => {
          const itemDate = new Date(item.pubDate);
          return !isNaN(itemDate) && itemDate >= twoDaysAgo;
        });

        const mapped = filteredItems.map(item => ({
          ...item,
          accountName: feed.name
        }));
        
        allTweets.push(...mapped);

        // サーバーに負荷をかけすぎないよう、リクエストの合間に少しウェイト（100ms）を入れる
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        console.error(`Failed to fetch feed for ${feed.name}:`, err);
        // エラーが出ても処理を止めず次のアカウントへ進む
      }
    }

    if (allTweets.length === 0) {
      container.innerHTML = '<div class="loading">有効なツイートを取得できませんでした（API制限または2日以内のツイートがない可能性があります）</div>';
      return;
    }

    allTweets.sort((a, b) => b.pubDate - a.pubDate);

    // キャッシュに保存
    localStorage.setItem(CACHE_KEY, JSON.stringify(allTweets));
    localStorage.setItem(TIME_KEY, now);

    renderTweets(allTweets, container);

  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="loading">ツイートの取得中にエラーが発生しました</div>';
  } finally {
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.style.opacity = '1';
    }
  }
}

function renderTweets(allTweets, container) {
  container.innerHTML = '';
  allTweets.forEach(item => {
    const tweetDiv = document.createElement('div');
    tweetDiv.className = 'tweet-item';
    
    const dateStr = item.pubDate instanceof Date && !isNaN(item.pubDate)
      ? item.pubDate.toLocaleString('ja-JP', { 
          timeZone: 'Asia/Tokyo',
          month: 'numeric', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      : '';

    const rawTitle = item.feedTitle || item.author || item.title;
    const author = extractUsername(rawTitle);

    const avatarHtml = item.avatarUrl
      ? `<img src="${item.avatarUrl}" class="tweet-avatar" alt="${author}" onerror="this.onerror=null; this.outerHTML='<div class=&quot;tweet-avatar-placeholder&quot;>${author.charAt(0)}</div>';">`
      : `<div class="tweet-avatar-placeholder">${author.charAt(0)}</div>`;

    let cleanDescription = item.description
      .replace(/<hr\s*\/?>/gi, '')
      .replace(/<b>\s*(リンク|Link)\s*<\/b>/gi, '')
      .replace(/(リンク|Link)<br\s*\/?>/gi, '');

    tweetDiv.innerHTML = `
      <div class="tweet-header">
        <div class="tweet-user-info">
          ${avatarHtml}
          <span class="tweet-account">${author}</span>
        </div>
        <span class="tweet-time">${dateStr}</span>
      </div>
      <div class="tweet-body">${cleanDescription}</div>
    `;
    container.appendChild(tweetDiv);
  });
}

function initYoutube() {
  loadAllYoutubeContent();
}

async function loadAllYoutubeContent() {
  const container = document.getElementById('youtube-content');
  if (!container) return;

  if (youtubeFeeds.length === 0) {
    container.innerHTML = '<div class="loading">配信先を追加してください。</div>';
    return;
  }

  container.innerHTML = '<div class="loading">動画を読み込み中...</div>';

  try {
    const fetchPromises = youtubeFeeds.map(async (feed) => {
      try {
        const items = await fetchYoutubeRSS(feed.url);
        return items.map(item => ({
          ...item,
          displayName: feed.name || item.channelName
        }));
      } catch (err) {
        console.error(`Failed to fetch YouTube feed for ${feed.name}:`, err);
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
    allVideos.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'youtube-item';

      const dateStr = item.pubDate instanceof Date && !isNaN(item.pubDate)
        ? item.pubDate.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';

      itemDiv.innerHTML = `
        ${item.thumbnail ? `<img src="${item.thumbnail}" class="youtube-thumbnail" alt="thumbnail" loading="lazy">` : ''}
        <div class="youtube-info">
          <div class="youtube-channel">${item.displayName}</div>
          <a href="${item.link}" target="_blank" rel="noopener" class="youtube-link">${item.title}</a>
          <div class="youtube-time">${dateStr}</div>
        </div>
      `;
      container.appendChild(itemDiv);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="loading">YouTube情報の取得中にエラーが発生しました</div>';
  }
}

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
      onClickCallback(feed.url);
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
    cancelBtn.textContent = 'キャンセル';
    cancelBtn.style.display = 'inline-block';
    modal.classList.add('hidden');
  };
  
  cancelBtn.onclick = closeModal;

  const createInputRow = (placeholderName, placeholderUrl) => {
    const row = document.createElement('div');
    row.className = 'modal-input-row';
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.marginBottom = '8px';
    row.style.alignItems = 'center';

    row.innerHTML = `
      <input type="text" class="input-name" placeholder="${placeholderName}" autocomplete="off" autocorrect="off" autocapitalize="off" style="flex: 1;">
      <input type="text" class="input-url" placeholder="${placeholderUrl}" autocomplete="off" autocorrect="off" autocapitalize="off" style="flex: 2;">
      <button type="button" class="btn danger remove-row-btn" style="padding: 4px 8px;">✕</button>
    `;

    row.querySelector('.remove-row-btn').onclick = () => {
      if (modalBody.querySelectorAll('.modal-input-row').length > 1) {
        row.remove();
      }
    };

    return row;
  };

  const setupMultiAddModal = (title, placeholderName, placeholderUrl, onSave) => {
    cleanupExtraButtons();
    modalTitle.textContent = title;
    modalBody.innerHTML = '';

    modalBody.appendChild(createInputRow(placeholderName, placeholderUrl));

    const addRowBtn = document.createElement('button');
    addRowBtn.id = 'modal-add-row-btn';
    addRowBtn.type = 'button';
    addRowBtn.className = 'btn';
    addRowBtn.textContent = '+ 入力欄を追加';
    
    addRowBtn.onclick = (e) => {
      e.preventDefault();
      modalBody.appendChild(createInputRow(placeholderName, placeholderUrl));
    };

    cancelBtn.parentNode.insertBefore(addRowBtn, cancelBtn);

    cancelBtn.textContent = 'キャンセル';
    cancelBtn.onclick = closeModal;
    submitBtn.textContent = '保存';
    submitBtn.onclick = () => {
      const rows = modalBody.querySelectorAll('.modal-input-row');
      const newItems = [];

      rows.forEach(row => {
        const name = row.querySelector('.input-name').value.trim();
        const url = row.querySelector('.input-url').value.trim();
        if (name && url) {
          newItems.push({ name, url });
        }
      });

      if (newItems.length > 0) {
        onSave(newItems);
        closeModal();
      }
    };

    modal.classList.remove('hidden');
  };

  const setupManageModal = (title, feeds, onSave, onRefresh, isTwitter = false) => {
    cleanupExtraButtons();
    modalTitle.textContent = title;
    
    const renderList = () => {
      modalTitle.textContent = title;
      submitBtn.textContent = '完了';
      cancelBtn.textContent = 'キャンセル';
      cancelBtn.style.display = 'none'; // 管理画面一覧では「完了」ボタンのみ使用
      cancelBtn.onclick = closeModal;
      submitBtn.onclick = closeModal;

      renderManageList(
        feeds, 
        (updatedFeeds) => {
          feeds = updatedFeeds;
          onSave(feeds);
          onRefresh();
          renderList();
        },
        (feed, idx) => {
          showEditModal(
            feed,
            (updatedItem) => {
              feeds[idx] = updatedItem;
              onSave(feeds);
              onRefresh();
              renderList();
            },
            () => {
              renderList();
            },
            isTwitter
          );
        }
      );
    };

    renderList();
    modal.classList.remove('hidden');
  };

  // 1. ニュース追加ボタン
  const addNewsBtn = document.getElementById('add-news-btn');
  if (addNewsBtn) {
    addNewsBtn.onclick = () => {
      setupMultiAddModal('ニュースRSSをまとめて追加', '配信先', 'RSS URL', (newItems) => {
        newsFeeds.push(...newItems);
        saveStoredFeeds('newsFeeds', newsFeeds);
        initNews();
      });
    };
  }

  // 2. ニュース削除（管理）ボタン
  const delNewsBtn = document.getElementById('del-news-btn');
  if (delNewsBtn) {
    delNewsBtn.onclick = () => {
      setupManageModal('ニュース配信先の管理', newsFeeds, (updated) => {
        newsFeeds = updated;
        saveStoredFeeds('newsFeeds', newsFeeds);
      }, initNews);
    };
  }

  // 3. 知識追加ボタン
  const addKnowledgeBtn = document.getElementById('add-knowledge-btn');
  if (addKnowledgeBtn) {
    addKnowledgeBtn.onclick = () => {
      setupMultiAddModal('知識RSSを追加', '配信先', 'RSS URL', (newItems) => {
        knowledgeFeeds.push(...newItems);
        saveStoredFeeds('knowledgeFeeds', knowledgeFeeds);
        initKnowledge();
      });
    };
  }

  // 4. 知識削除（管理）ボタン
  const delKnowledgeBtn = document.getElementById('del-knowledge-btn');
  if (delKnowledgeBtn) {
    delKnowledgeBtn.onclick = () => {
      setupManageModal('知識配信先の管理', knowledgeFeeds, (updated) => {
        knowledgeFeeds = updated;
        saveStoredFeeds('knowledgeFeeds', knowledgeFeeds);
      }, initKnowledge);
    };
  }

  // 5. Twitter追加ボタン
  const addTwitterBtn = document.getElementById('add-twitter-btn');
  if (addTwitterBtn) {
    addTwitterBtn.onclick = () => {
      setupMultiAddModal('Twitter RSSを追加', '配信先', 'ユーザーID', (newItems) => {
        const formattedItems = newItems.map(item => {
          let cleanUrl = item.url.trim();
          if (cleanUrl.startsWith('https://nitter.net')) {
            return { name: item.name, url: cleanUrl };
          }
          const cleanUserId = cleanUrl.replace(/^@/, '');
          return {
            name: item.name,
            url: `https://nitter.net/${cleanUserId}/rss`
          };
        });

        twitterFeeds.push(...formattedItems);
        saveStoredFeeds('twitterFeeds', twitterFeeds);
        initTwitter();
      });

      const nitterBtn = document.createElement('button');
      nitterBtn.id = 'modal-nitter-btn';
      nitterBtn.type = 'button';
      nitterBtn.className = 'btn';
      nitterBtn.textContent = 'Nitter';
      nitterBtn.onclick = () => {
        window.open('https://nitter.net', '_blank', 'noopener,noreferrer');
      };
      cancelBtn.parentNode.insertBefore(nitterBtn, cancelBtn);
    };
  }

  // 6. Twitter削除（管理）ボタン
  const delTwitterBtn = document.getElementById('del-twitter-btn');
  if (delTwitterBtn) {
    delTwitterBtn.onclick = () => {
      setupManageModal('Twitterアカウントの管理', twitterFeeds, (updated) => {
        twitterFeeds = updated;
        saveStoredFeeds('twitterFeeds', twitterFeeds);
      }, initTwitter, true);
    };
  }

  // 7. YouTube追加ボタン
  const addYoutubeBtn = document.getElementById('add-youtube-btn');
  if (addYoutubeBtn) {
    addYoutubeBtn.onclick = () => {
      setupMultiAddModal('YouTubeチャンネルを追加', '配信先', 'チャンネルID', (newItems) => {
        youtubeFeeds.push(...newItems);
        saveStoredFeeds('youtubeFeeds', youtubeFeeds);
        initYoutube();
      });

      const youtubeExternalBtn = document.createElement('button');
      youtubeExternalBtn.id = 'modal-nitter-btn';
      youtubeExternalBtn.type = 'button';
      youtubeExternalBtn.className = 'btn';
      youtubeExternalBtn.textContent = 'YouTube';
      youtubeExternalBtn.onclick = () => {
        window.open('https://m.youtube.com/?ra=m', '_blank', 'noopener,noreferrer');
      };
      cancelBtn.parentNode.insertBefore(youtubeExternalBtn, cancelBtn);
    };
  }

  // 8. YouTube削除（管理）ボタン
  const delYoutubeBtn = document.getElementById('del-youtube-btn');
  if (delYoutubeBtn) {
    delYoutubeBtn.onclick = () => {
      setupManageModal('YouTubeチャンネルの管理', youtubeFeeds, (updated) => {
        youtubeFeeds = updated;
        saveStoredFeeds('youtubeFeeds', youtubeFeeds);
      }, initYoutube);
    };
  }
}

function renderManageList(feeds, saveCallback, onEdit) {
  const modalBody = document.getElementById('modal-body');
  if (!modalBody) return;
  modalBody.innerHTML = '';
  
  if (feeds.length === 0) {
    modalBody.innerHTML = '<div style="color: var(--text-sub); font-size: 14px;">登録されていません</div>';
    return;
  }

  feeds.forEach((feed, idx) => {
    const row = document.createElement('div');
    row.className = 'delete-list-item';
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'space-between';
    row.style.marginBottom = '8px';
    row.style.padding = '8px 12px';
    row.style.backgroundColor = 'var(--bg-main)';
    row.style.borderRadius = '8px';
    row.style.border = feed.isError ? '1px solid #ff4d4f' : '1px solid var(--border-color)';

    const errorBadge = feed.isError 
      ? `<span title="データを受け取れませんでした。ID/URLが間違っている可能性があります" style="display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; background-color:#ff4d4f; color:#fff; border-radius:50%; font-weight:bold; font-size:12px; margin-right:8px; flex-shrink:0;">!</span>`
      : '';

    const nameWrapper = document.createElement('div');
    nameWrapper.style.display = 'flex';
    nameWrapper.style.alignItems = 'center';
    nameWrapper.style.minWidth = '0';
    nameWrapper.style.flex = '1';
    nameWrapper.style.marginRight = '8px';
    nameWrapper.innerHTML = `
      ${errorBadge}
      <span style="font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${feed.name}</span>
    `;

    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '4px';
    btnGroup.style.flexShrink = '0';

    const upBtn = document.createElement('button');
    upBtn.type = 'button';
    upBtn.className = 'btn';
    upBtn.style.padding = '2px 8px';
    upBtn.textContent = '↑';
    upBtn.disabled = idx === 0;
    upBtn.onclick = () => {
      const temp = feeds[idx];
      feeds[idx] = feeds[idx - 1];
      feeds[idx - 1] = temp;
      saveCallback(feeds);
    };

    const downBtn = document.createElement('button');
    downBtn.type = 'button';
    downBtn.className = 'btn';
    downBtn.style.padding = '2px 8px';
    downBtn.textContent = '↓';
    downBtn.disabled = idx === feeds.length - 1;
    downBtn.onclick = () => {
      const temp = feeds[idx];
      feeds[idx] = feeds[idx + 1];
      feeds[idx + 1] = temp;
      saveCallback(feeds);
    };

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn';
    editBtn.style.padding = '2px 8px';
    editBtn.textContent = '変更';
    editBtn.onclick = () => {
      if (onEdit) onEdit(feed, idx);
    };

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn danger';
    delBtn.style.padding = '2px 8px';
    delBtn.textContent = '削除';
    delBtn.onclick = () => {
      feeds.splice(idx, 1);
      saveCallback(feeds);
    };

    btnGroup.appendChild(upBtn);
    btnGroup.appendChild(downBtn);
    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(delBtn);

    row.appendChild(nameWrapper);
    row.appendChild(btnGroup);
    modalBody.appendChild(row);
  });
}

// 変更（上書き）用ダイアログを表示する関数
function showEditModal(feed, onOverwrite, onCancel, isTwitter = false) {
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');

  modalTitle.textContent = '配信先の変更';
  modalBody.innerHTML = '';

  const editForm = document.createElement('div');
  editForm.style.display = 'flex';
  editForm.style.flexDirection = 'column';
  editForm.style.gap = '12px';

  editForm.innerHTML = `
    <div>
      <label style="font-size: 12px; color: var(--text-sub); display: block; margin-bottom: 4px;">名前</label>
      <input type="text" id="edit-name-input" value="${feed.name || ''}" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-main);" autocomplete="off">
    </div>
    <div>
      <label style="font-size: 12px; color: var(--text-sub); display: block; margin-bottom: 4px;">現在のURL / ID</label>
      <input type="text" value="${feed.url || ''}" disabled style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-main); opacity: 0.6; color: var(--text-main);">
    </div>
    <div>
      <label style="font-size: 12px; color: var(--text-sub); display: block; margin-bottom: 4px;">新しいURL / ID（変更する場合のみ入力）</label>
      <input type="text" id="edit-url-input" placeholder="新しいURLまたはIDを入力" value="" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-main); color: var(--text-main);" autocomplete="off">
    </div>
  `;

  modalBody.appendChild(editForm);

  if (cancelBtn) {
    cancelBtn.style.display = 'inline-block';
    cancelBtn.textContent = 'キャンセル';
    cancelBtn.onclick = () => {
      onCancel();
    };
  }

  if (submitBtn) {
    submitBtn.textContent = '上書き';
    submitBtn.onclick = () => {
      const newName = document.getElementById('edit-name-input').value.trim();
      let newUrl = document.getElementById('edit-url-input').value.trim();

      if (!newName) {
        alert('名前を入力してください');
        return;
      }

      let finalUrl = feed.url;

      if (newUrl) {
        if (isTwitter) {
          if (newUrl.startsWith('https://nitter.net')) {
            finalUrl = newUrl;
          } else {
            const cleanUserId = newUrl.replace(/^@/, '');
            finalUrl = `https://nitter.net/${cleanUserId}/rss`;
          }
        } else {
          finalUrl = newUrl;
        }
      }

      onOverwrite({ ...feed, name: newName, url: finalUrl, isError: false });
    };
  }
}
