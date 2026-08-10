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
let youtubeFeeds = loadStoredFeeds('youtubeFeeds', DEFAULT_YOUTUBE);

let currentNewsUrl = '';
let currentKnowledgeUrl = '';

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  newsFeeds = loadStoredFeeds('newsFeeds', DEFAULT_NEWS);
  knowledgeFeeds = loadStoredFeeds('knowledgeFeeds', DEFAULT_KNOWLEDGE);
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

// --- Twitter 領域: Foloアイコンボタン ＆ アプリ強制起動処理 ---
function initTwitter() {
  const container = document.getElementById('twitter-content');
  if (!container) return;

  container.innerHTML = '';
  
  const foloWrapper = document.createElement('div');
  foloWrapper.style.display = 'flex';
  foloWrapper.style.justifyContent = 'center';
  foloWrapper.style.alignItems = 'center';
  foloWrapper.style.padding = '20px 0';

  // 画像ボタンの生成
  const foloBtn = document.createElement('a');
  foloBtn.href = '#';
  foloBtn.style.display = 'inline-block';
  foloBtn.style.textDecoration = 'none';
  foloBtn.style.transition = 'transform 0.1s ease, opacity 0.2s ease';

  // アイコン画像
  const img = document.createElement('img');
  img.src = 'icons/folo.png'; 
  img.alt = 'Folo';
  img.style.width = '64px';
  img.style.height = '64px';
  img.style.borderRadius = '16px';
  img.style.objectFit = 'cover';
  img.style.display = 'block';

  foloBtn.appendChild(img);

  // タップ時のフィードバック演出
  foloBtn.addEventListener('touchstart', () => { foloBtn.style.transform = 'scale(0.92)'; });
  foloBtn.addEventListener('touchend', () => { foloBtn.style.transform = 'scale(1)'; });

  foloBtn.onclick = (e) => {
    e.preventDefault();

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      // iPhoneの場合：アプリの起動のみを行う（Webサイトへの遷移タイマーは排除）
      window.location.href = 'follow://';
    } else {
      // PC等、iPhone以外の場合はブラウザでWeb版を開く
      window.open('https://app.folo.is/timeline/articles/all/pending', '_blank', 'noopener,noreferrer');
    }
  };

  foloWrapper.appendChild(foloBtn);
  container.appendChild(foloWrapper);
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

// YouTubeカードのHTML生成部分（Sticky固定 ＆ プルダウン75%幅調整版）
window.currentVideoList = [];
window.selectedChannel = 'ALL';
window.currentType = 'long';

// 1. 動画(通常)とShortsの自動判定・分類およびチャンネル一覧抽出
const allVideoDataList = [];
const channelSet = new Set();

allVideos.forEach(item => {
  let videoId = '';
  let isShort = false;

  if (item.link && item.link.includes('/shorts/')) {
    videoId = item.link.split('/shorts/')[1]?.split('?')[0]?.split('&')[0];
    isShort = true;
  } else if (item.link && item.link.includes('v=')) {
    videoId = item.link.split('v=')[1]?.split('&')[0];
  }

  const videoData = { ...item, videoId, isShort };
  allVideoDataList.push(videoData);

  if (item.displayName) {
    channelSet.add(item.displayName);
  }
});

// 2. チャンネルプルダウンの選択肢生成
const channels = Array.from(channelSet);
let channelOptionsHtml = '<option value="ALL">すべてのチャンネル</option>';
channels.forEach(ch => {
  channelOptionsHtml += `<option value="${ch}">${ch}</option>`;
});

// 3. UIの構築（sticky固定 ＋ 指定の並び順・幅設定）
container.innerHTML = `
  <!-- スクロール時上部固定ヘッダーエリア -->
  <div style="position: sticky; top: 0; background: inherit; z-index: 10; padding-top: 4px;">
    <!-- ① チャンネル選択プルダウン（75%幅）＆解除バッジ（残り幅） -->
    <div style="display: flex; gap: 8px; margin-bottom: 10px; align-items: center; width: 100%;">
      <select id="yt-channel-select" onchange="filterYtByChannel(this.value)" style="width: 75%; padding: 6px 8px; border-radius: 6px; background: rgba(255,255,255,0.08); color: inherit; border: 1px solid rgba(255,255,255,0.2); font-size: 13px; box-sizing: border-box;">
        ${channelOptionsHtml}
      </select>
      <div id="yt-channel-badge" style="display: none; flex: 1; min-width: 0; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.12); color: inherit; padding: 6px 8px; border-radius: 6px; font-size: 12px; box-sizing: border-box;">
        <span id="yt-channel-badge-name" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: bold;"></span>
        <button onclick="resetYtChannelFilter()" style="background: none; border: none; color: inherit; opacity: 0.8; cursor: pointer; font-size: 14px; line-height: 1; padding: 0 0 0 4px;">✕</button>
      </div>
    </div>

    <!-- ② タブ（動画 / Shorts）＋ ③ 下部区切り線（横棒） -->
    <div class="card-tabs yt-filter-tabs" style="display: flex; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 8px;">
      <button id="yt-tab-long" class="tab-btn active" style="flex: 1; cursor: pointer;" onclick="switchYtTab('long')">動画</button>
      <button id="yt-tab-shorts" class="tab-btn" style="flex: 1; cursor: pointer;" onclick="switchYtTab('short')">Shorts</button>
    </div>
  </div>

  <!-- 動画リスト表示コンテナ -->
  <div id="yt-table-container"></div>
`;

// 絞り込み実行＆描画更新
window.updateVideoDisplay = function() {
  const filtered = allVideoDataList.filter(item => {
    const matchesType = window.currentType === 'short' ? item.isShort : !item.isShort;
    const matchesChannel = window.selectedChannel === 'ALL' || item.displayName === window.selectedChannel;
    return matchesType && matchesChannel;
  });

  const badgeDiv = document.getElementById('yt-channel-badge');
  const badgeName = document.getElementById('yt-channel-badge-name');
  const selectElem = document.getElementById('yt-channel-select');

  if (selectElem) selectElem.value = window.selectedChannel;

  if (window.selectedChannel !== 'ALL') {
    if (badgeDiv) badgeDiv.style.display = 'flex';
    if (badgeName) badgeName.textContent = window.selectedChannel;
  } else {
    if (badgeDiv) badgeDiv.style.display = 'none';
  }

  renderVideoTable(filtered);
};

// タブ切替関数
window.switchYtTab = function(type) {
  window.currentType = type;
  const btnLong = document.getElementById('yt-tab-long');
  const btnShorts = document.getElementById('yt-tab-shorts');
  if (type === 'long') {
    if (btnLong) btnLong.classList.add('active');
    if (btnShorts) btnShorts.classList.remove('active');
  } else {
    if (btnShorts) btnShorts.classList.add('active');
    if (btnLong) btnLong.classList.remove('active');
  }
  updateVideoDisplay();
};

// チャンネルフィルタ変更関数
window.filterYtByChannel = function(channelName) {
  window.selectedChannel = channelName;
  updateVideoDisplay();
};

// チャンネルフィルタ解除関数
window.resetYtChannelFilter = function() {
  window.selectedChannel = 'ALL';
  updateVideoDisplay();
};

// テーブル描画関数
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
    const dateStr = item.pubDate instanceof Date && !isNaN(item.pubDate)
      ? item.pubDate.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '';

    html += `
      <tr onclick="openYoutubeModalByIndex(${index})" style="border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer;">
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

// 初期描画
updateVideoDisplay();

  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="loading">YouTube情報の取得中にエラーが発生しました</div>';
  }
}

// --- グローバル定義: モーダル表示関数 ---
window.openYoutubeModalByIndex = function(index) {
  const list = window.currentVideoList;
  if (!list || index < 0 || index >= list.length) return;

  const item = list[index];
  const videoId = item.videoId;
  const title = item.title || '';

  const existingModal = document.getElementById('youtube-video-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'youtube-video-modal';
  modal.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.85) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 999999 !important;
    padding: 16px !important;
    box-sizing: border-box !important;
  `;

  const hasPrev = index > 0;
  const hasNext = index < list.length - 1;

  modal.innerHTML = `
    <div style="width: 100%; max-width: 960px; background: #000; border-radius: 12px; overflow: hidden; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #1c1c1e; color: #fff;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <button onclick="openYoutubeModalByIndex(${index - 1})" ${!hasPrev ? 'disabled' : ''} style="background: rgba(255,255,255,0.15); border: none; color: #fff; padding: 4px 10px; border-radius: 4px; cursor: ${hasPrev ? 'pointer' : 'default'}; opacity: ${hasPrev ? '1' : '0.3'};">▲ 前</button>
          <button onclick="openYoutubeModalByIndex(${index + 1})" ${!hasNext ? 'disabled' : ''} style="background: rgba(255,255,255,0.15); border: none; color: #fff; padding: 4px 10px; border-radius: 4px; cursor: ${hasNext ? 'pointer' : 'default'}; opacity: ${hasNext ? '1' : '0.3'};">▼ 次</button>
        </div>
        <div style="font-size: 13px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0 10px; flex: 1; text-align: center;">${title}</div>
        <button onclick="closeYoutubeModal()" style="background: none; border: none; color: #fff; font-size: 20px; cursor: pointer; padding: 4px 8px; line-height: 1;">✕</button>
      </div>
      <div style="position: relative; width: 100%; padding-top: 56.25%; background: #000;">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&vq=hd1080" 
          title="${title}"
          style="position: absolute; top:0; left:0; width: 100%; height: 100%; border: none;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen>
        </iframe>
      </div>
    </div>
  `;

  modal.onclick = (e) => {
    if (e.target === modal) window.closeYoutubeModal();
  };

  document.body.appendChild(modal);
};

window.closeYoutubeModal = function() {
  const modal = document.getElementById('youtube-video-modal');
  if (modal) modal.remove();
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
      onClickCallback(feed.url);
    };
    container.appendChild(btn);
  });
}

// --- モーダル表示関数 ---
function openYoutubeModalByIndex(index) {
  if (!currentVideoList || index < 0 || index >= currentVideoList.length) return;

  const item = currentVideoList[index];
  const videoId = item.videoId;
  const title = item.title || '';

  const existingModal = document.getElementById('youtube-video-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'youtube-video-modal';
  modal.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.85) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 99999 !important;
    padding: 16px !important;
    box-sizing: border-box !important;
    backdrop-filter: blur(4px);
  `;

  const modalContainer = document.createElement('div');
  modalContainer.style.cssText = `
    width: 100%;
    max-width: 800px;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  `;

  const hasPrev = index > 0;
  const hasNext = index < currentVideoList.length - 1;

  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #1c1c1e;
    color: #fff;
  `;
  header.innerHTML = `
    <div style="display: flex; align-items: center; gap: 6px;">
      <button id="yt-prev-btn" ${!hasPrev ? 'disabled' : ''} style="background: rgba(255,255,255,0.15); border: none; color: #fff; padding: 4px 10px; border-radius: 4px; cursor: ${hasPrev ? 'pointer' : 'default'}; opacity: ${hasPrev ? '1' : '0.3'};">▲ 前</button>
      <button id="yt-next-btn" ${!hasNext ? 'disabled' : ''} style="background: rgba(255,255,255,0.15); border: none; color: #fff; padding: 4px 10px; border-radius: 4px; cursor: ${hasNext ? 'pointer' : 'default'}; opacity: ${hasNext ? '1' : '0.3'};">▼ 次</button>
    </div>
    <div style="font-size: 13px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0 10px; flex: 1; text-align: center;">${title}</div>
    <button id="close-yt-modal" style="background: none; border: none; color: #fff; font-size: 20px; cursor: pointer; padding: 4px 8px; line-height: 1;">✕</button>
  `;

  const playerWrapper = document.createElement('div');
  playerWrapper.style.cssText = `
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    background: #000;
  `;

  const iframeContainer = document.createElement('div');
  iframeContainer.id = 'yt-player-target';
  iframeContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `;

  playerWrapper.appendChild(iframeContainer);
  modalContainer.appendChild(header);
  modalContainer.appendChild(playerWrapper);
  modal.appendChild(modalContainer);

  let player = null;

  const closeModal = () => {
    if (player && typeof player.destroy === 'function') {
      player.destroy();
    }
    modal.remove();
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  header.querySelector('#close-yt-modal').addEventListener('click', closeModal);

  const prevBtn = header.querySelector('#yt-prev-btn');
  if (hasPrev) {
    prevBtn.addEventListener('click', () => {
      closeModal();
      openYoutubeModalByIndex(index - 1);
    });
  }

  const nextBtn = header.querySelector('#yt-next-btn');
  if (hasNext) {
    nextBtn.addEventListener('click', () => {
      closeModal();
      openYoutubeModalByIndex(index + 1);
    });
  }

  document.body.appendChild(modal);

  // iframeダイレクト埋め込み（動作保証を優先）
  if (videoId) {
    iframeContainer.innerHTML = `
      <iframe 
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1" 
        title="${title}"
        style="width: 100%; height: 100%; border: none;"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        allowfullscreen>
      </iframe>
    `;
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

  const setupManageModal = (title, feeds, onSave, onRefresh) => {
    cleanupExtraButtons();
    modalTitle.textContent = title;
    
    const renderList = () => {
      modalTitle.textContent = title;
      submitBtn.textContent = '完了';
      cancelBtn.textContent = 'キャンセル';
      cancelBtn.style.display = 'none';
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
            }
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

  // 5. YouTube追加ボタン
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

  // 6. YouTube削除（管理）ボタン
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

function showEditModal(feed, onOverwrite, onCancel) {
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
      const newUrl = document.getElementById('edit-url-input').value.trim();

      if (!newName) {
        alert('名前を入力してください');
        return;
      }

      const finalUrl = newUrl || feed.url;
      onOverwrite({ ...feed, name: newName, url: finalUrl, isError: false });
    };
  }
}
