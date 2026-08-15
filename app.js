// --- JMA (気象庁API) 地域コード定義 & 地名マッピング表 ---
const JMA_PREF_CODES = {
  "宗谷地方": "11000",
  "上川・留萌地方": "12000",
  "石狩・空知・後志地方": "16000",
  "網走・北見・紋別地方": "13000",
  "釧路・根室地方、十勝地方": "14100",
  "胆振・日高地方": "15000",
  "渡島・檜山地方": "17000",
  "青森県": "20000",
  "秋田県": "50000",
  "岩手県": "30000",
  "宮城県": "40000",
  "山形県": "60000",
  "福島県": "70000",
  "茨城県": "80000",
  "栃木県": "90000",
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
  "鹿児島県、奄美地方": "460100",
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
  "稚内": "11000", "宗谷": "11000",
  "旭川": "12000", "留萌": "12000", "上川": "12000",
  "札幌": "16000", "石狩": "16000", "空知": "16000", "後志": "16000", "小樽": "16000",
  "網走": "13000", "北見": "13000", "紋別": "13000",
  "釧路": "14100", "根室": "14100", "帯広": "14100", "十勝": "14100",
  "室欄": "15000", "苫小牧": "15000", "胆振": "15000", "日高": "15000",
  "函館": "17000", "渡島": "17000", "檜山": "17000"
};

const OKINAWA_SUB_AREAS = {
  "那覇": "471000", "沖縄": "471000", "本島": "471000",
  "南大東": "472000", "北大東": "472000", "大東": "472000",
  "宮古": "473000", "宮古島": "473000",
  "石垣": "474000", "八重山": "474000", "西表": "474000", "与那国": "474000"
};

// --- YouTube Data API v3 設定 ---
const YOUTUBE_API_KEY = "AIzaSyCIu3TLMlWdKLjjU7mDsuhY8Rmdp-lSxWM";

// WeatherCode -> アイコン変換
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

function getDateColorClassOrStyle(dateObj) {
  const day = dateObj.getDay();
  if (day === 0) return 'color: #ff3b30;';
  else if (day === 6) return 'color: #007aff;';
  return 'color: #333333;';
}

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

const DEFAULT_WEATHER_LOCATIONS = [{ name: "京都府", code: "260000" }];
const DEFAULT_NEWS = [
  { name: "朝日新聞(政治)", url: "https://www.asahi.com/rss/asahi/politics.rdf" },
  { name: "Yahoo!ニュース", url: "https://news.yahoo.co.jp/rss/media/aptsushinv/all.xml" }
];
const DEFAULT_KNOWLEDGE = [
  { name: "Qiita", url: "https://qiita.com/tags/javascript/feed.atom" },
  { name: "GIGAZINE", url: "https://gigazine.net/news/rss_2.0/" }
];
const DEFAULT_YOUTUBE = [];
const DEFAULT_TWITTER = [{ name: "デフォルトリスト", url: "2087706843519111304" }];

function loadStoredFeeds(key, defaultValue) {
  const stored = localStorage.getItem(key);
  if (stored !== null) {
    try { return JSON.parse(stored); } catch (e) { console.error(e); }
  }
  localStorage.setItem(key, JSON.stringify(defaultValue));
  return defaultValue;
}

function saveStoredFeeds(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

let weatherLocations = loadStoredFeeds('weatherLocations', DEFAULT_WEATHER_LOCATIONS);
let currentWeatherIdx = 0;
let currentWeatherMode = '3day';
let currentAreaSubIndex = 0;

let newsFeeds = loadStoredFeeds('newsFeeds', DEFAULT_NEWS);
let knowledgeFeeds = loadStoredFeeds('knowledgeFeeds', DEFAULT_KNOWLEDGE);
let youtubeFeeds = loadStoredFeeds('youtubeFeeds', DEFAULT_YOUTUBE);
let twitterFeeds = loadStoredFeeds('twitterFeeds', DEFAULT_TWITTER);
let currentTwitterIdx = 0;

let currentNewsUrl = '';
let currentKnowledgeUrl = '';

document.addEventListener('DOMContentLoaded', () => {
  weatherLocations = loadStoredFeeds('weatherLocations', DEFAULT_WEATHER_LOCATIONS);
  newsFeeds = loadStoredFeeds('newsFeeds', DEFAULT_NEWS);
  knowledgeFeeds = loadStoredFeeds('knowledgeFeeds', DEFAULT_KNOWLEDGE);
  youtubeFeeds = loadStoredFeeds('youtubeFeeds', DEFAULT_YOUTUBE);
  twitterFeeds = loadStoredFeeds('twitterFeeds', DEFAULT_TWITTER);

  initWeatherUI();
  initNews();
  initKnowledge();
  initTwitter();
  initYoutube();
  initFutocyan();
  initModals();
  registerSW();
  initNewsShortsFeature(); // ショート動画プレイヤー連携機能の初期化
});

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
  }
}

// --- ニュースショート動画機能（API連携） ---
function initNewsShortsFeature() {
  // 各セクションヘッダーなどに「ショート動画で見る」ボタンを動的追加する例
  const newsSectionHeader = document.querySelector('#news-section .section-header .action-buttons') || 
                            document.querySelector('.news-section .section-header') ||
                            document.getElementById('news-tabs')?.parentNode;

  if (newsSectionHeader && !document.getElementById('open-shorts-btn')) {
    const shortsBtn = document.createElement('button');
    shortsBtn.id = 'open-shorts-btn';
    shortsBtn.className = 'btn primary';
    shortsBtn.textContent = '🎬 ショート動画';
    shortsBtn.style.cssText = 'background: #ff2a5f; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;';
    shortsBtn.onclick = () => openShortsPlayer();
    newsSectionHeader.appendChild(shortsBtn);
  }
}

async function openShortsPlayer() {
  let modal = document.getElementById('shorts-player-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'shorts-player-modal';
    document.body.appendChild(modal);
  }

  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: #000; z-index: 9999999; display: flex; flex-direction: column;
    align-items: center; justify-content: center; color: #fff; font-family: sans-serif;
  `;

  modal.innerHTML = `
    <div style="position: absolute; top: 16px; right: 16px; z-index: 1000000;">
      <button id="close-shorts-modal" style="background: rgba(255,255,255,0.2); border: none; color: #fff; font-size: 20px; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
    </div>
    <div id="shorts-container" style="width: 100%; max-width: 420px; height: 100%; overflow-y: scroll; scroll-snap-type: y mandatory; position: relative; background: #111;">
      <div style="display: flex; align-items: center; justify-content: center; height: 100%;">ショート動画データを生成中...</div>
    </div>
  `;

  modal.querySelector('#close-shorts-modal').onclick = () => modal.remove();

  try {
    // 現在選択中のニュースフィードから記事を取得してサーバーレスAPIに渡す
    let rawItems = [];
    if (currentNewsUrl) {
      rawItems = await fetchNewsRSS(currentNewsUrl);
    } else if (newsFeeds.length > 0) {
      rawItems = await fetchNewsRSS(newsFeeds[0].url);
    }

    // サーバーレスAPI /api/generate-shorts を呼び出し
    const response = await fetch('https://wntgetting.vercel.app/api/generate-shorts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawItems: rawItems.slice(0, 10) })
    });

    if (!response.ok) throw new Error('ショート動画データの生成に失敗しました');
    const shortsData = await response.json();

    renderShortsSlides(shortsData);

  } catch (err) {
    console.error(err);
    const container = modal.querySelector('#shorts-container');
    if (container) {
      container.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff3b30; padding: 20px; text-align: center;">エラーが発生しました。<br>APIサーバーの状態を確認してください。</div>`;
    }
  }
}

function renderShortsSlides(shortsData) {
  const container = document.getElementById('shorts-container');
  if (!container) return;

  if (!Array.isArray(shortsData) || shortsData.length === 0) {
    container.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%;">表示できるショート動画がありません。</div>`;
    return;
  }

  container.innerHTML = '';

  shortsData.forEach((item, index) => {
    const slide = document.createElement('div');
    slide.style.cssText = `
      width: 100%; height: 100%; scroll-snap-align: start; position: relative;
      display: flex; flex-direction: column; justify-content: flex-end;
      padding: 24px; box-sizing: border-box; background: linear-gradient(135deg, #1f1c2c, #928DAB);
    `;

    slide.innerHTML = `
      <div style="position: absolute; top: 20px; left: 20px; font-size: 12px; background: rgba(0,0,0,0.4); padding: 4px 8px; border-radius: 12px;">
        #${index + 1} ショート動画
      </div>
      <div style="background: rgba(0, 0, 0, 0.65); padding: 20px; border-radius: 12px; backdrop-filter: blur(4px);">
        <h2 style="font-size: 18px; margin: 0 0 10px 0; line-height: 1.4;">${item.title}</h2>
        <p style="font-size: 14px; margin: 0 0 16px 0; color: #ddd; line-height: 1.5;">${item.narration}</p>
        ${item.sourceUrl ? `<a href="${item.sourceUrl}" target="_blank" rel="noopener" style="display: inline-block; color: #fff; background: #007aff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: bold;">元記事を読む →</a>` : ''}
      </div>
    `;
    container.appendChild(slide);
  });
}

// --- 通信処理 ---
async function fetchNewsRSS(feedUrl) {
  const apiUrl = `/api/rss?url=${encodeURIComponent(feedUrl)}`;
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('RSS取得エラー');
  const xmlText = await response.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  if (xmlDoc.querySelector('parsererror')) throw new Error('XMLパースエラー');

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
    const cleaned = dateStr.replace(/年|月/g, '/').replace(/日/g, '').replace(/（.*?）/g, ' ').trim();
    const parsedDate = new Date(cleaned);
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  };

  return items.map(item => {
    const title = getTagText(item, ['title', 'タイトル']) || '無題';
    let link = getTagText(item, ['link', 'リンク', 'url', 'URL']);
    if (!link) {
      const linkElem = item.querySelector('link, リンク');
      if (linkElem && linkElem.getAttribute('href')) link = linkElem.getAttribute('href');
    }
    const pubDateRaw = getTagText(item, ['pubDate', 'date', 'published', 'updated', '公開日時']);
    const description = getTagText(item, ['description', 'content', 'encoded', '詳細', '概要', '本文']);

    return {
      title,
      link,
      pubDate: parseCustomDate(pubDateRaw),
      description: description || title
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

  const videoIds = playlistData.items.map(item => item.contentDetails.videoId);
  const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`);
  const detailsData = await detailsRes.json();

  if (!detailsData.items) return [];

  return detailsData.items.map(video => {
    const videoId = video.id;
    const title = video.snippet.title;
    const publishedAt = video.snippet.publishedAt;
    const thumbnail = video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    
    const liveDetails = video.liveStreamingDetails;
    let liveStatus = 'none'; 
    let wasEverLive = false;

    if (liveDetails) {
      if (liveDetails.actualEndTime) {
        liveStatus = 'completed'; wasEverLive = true;
      } else if (liveDetails.actualStartTime) {
        liveStatus = 'live'; wasEverLive = true;
      } else if (liveDetails.scheduledStartTime) {
        liveStatus = 'upcoming';
      } else {
        liveStatus = 'completed'; wasEverLive = true;
      }
    }

    let isShort = false;
    const durationISO = video.contentDetails?.duration || '';
    if (durationISO) {
      const match = durationISO.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (match) {
        const hours = parseInt(match[1] || 0, 10);
        const mins = parseInt(match[2] || 0, 10);
        const secs = parseInt(match[3] || 0, 10);
        const totalSeconds = (hours * 3600) + (mins * 60) + secs;
        if (hours === 0 && mins === 0 && totalSeconds > 0 && totalSeconds <= 60) isShort = true;
      }
    }
    if (title.toLowerCase().includes('#shorts') || title.toLowerCase().includes('#short')) isShort = true;

    return {
      videoId, title, link: `https://www.youtube.com/watch?v=${videoId}`,
      pubDate: new Date(publishedAt), channelName, thumbnail, isShort,
      liveStatus, scheduledStartTime: liveDetails?.scheduledStartTime ? new Date(liveDetails.scheduledStartTime) : null,
      durationISO, liveDetails, wasEverLive
    };
  });
}

// --- 天気機能 ---
function initWeatherUI() {
  const weatherSection = document.getElementById('weather-section') || document.querySelector('.weather-section');
  if (!weatherSection) return;

  weatherSection.innerHTML = `
    <div class="section-header">
      <h2>天気</h2>
      <div class="action-buttons">
        <button id="add-weather-btn" class="btn primary">追加</button>
        <button id="edit-weather-btn" class="btn warning">編集</button>
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

  const btn3day = document.getElementById('weather-3day-btn');
  const btn1week = document.getElementById('weather-1week-btn');

  btn3day.onclick = () => { currentWeatherMode = '3day'; btn3day.classList.add('active'); btn1week.classList.remove('active'); currentAreaSubIndex = 0; renderWeatherData(); };
  btn1week.onclick = () => { currentWeatherMode = '1week'; btn1week.classList.add('active'); btn3day.classList.remove('active'); currentAreaSubIndex = 0; renderWeatherData(); };

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
  if (currentWeatherIdx >= weatherLocations.length) currentWeatherIdx = 0;

  weatherLocations.forEach((loc, idx) => {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${idx === currentWeatherIdx ? 'active' : ''}`;
    btn.style.cssText = "padding: 4px 12px; border: 1px solid #ccc; border-radius: 16px; background: #fff; cursor: pointer; font-size: 13px; white-space: nowrap;";
    if (idx === currentWeatherIdx) { btn.style.background = "#007aff"; btn.style.color = "#fff"; btn.style.borderColor = "#007aff"; }
    btn.textContent = loc.name;
    btn.onclick = () => { currentWeatherIdx = idx; currentAreaSubIndex = 0; renderWeatherTabs(); renderWeatherData(); };
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
  container.innerHTML = '<div class="loading" style="text-align:center; padding:16px;">天気情報を読み込み中...</div>';

  try {
    const res = await fetch(`https://www.jma.go.jp/bosai/forecast/data/forecast/${loc.code}.json`);
    if (!res.ok) throw new Error("気象庁API取得エラー");
    const data = await res.json();
    const json0 = data[0];
    const json1 = data[1];
    const ts0 = json0.timeSeries[0];
    const areas = ts0 ? ts0.areas : [];
    
    if (currentAreaSubIndex >= areas.length) currentAreaSubIndex = 0;

    if (areaSelectContainer) {
      if (currentWeatherMode === '3day' && areas.length > 1) {
        let opts = areas.map((a, i) => `<option value="${i}" ${i === currentAreaSubIndex ? 'selected' : ''}>${a.area.name}</option>`).join('');
        areaSelectContainer.innerHTML = `<div style="display:flex; align-items:center; gap:8px;"><span style="font-size:12px; color:#666;">地域切替:</span><select id="jma-area-select" style="padding:2px 8px; font-size:12px; border-radius:4px; border:1px solid #ccc;">${opts}</select></div>`;
        document.getElementById('jma-area-select').onchange = (e) => { currentAreaSubIndex = parseInt(e.target.value, 10); renderWeatherData(); };
      } else {
        areaSelectContainer.innerHTML = '';
      }
    }

    const weatherArea = areas[currentAreaSubIndex];
    const weatherCodes = weatherArea ? weatherArea.weatherCodes : [];
    const timeDefines0 = ts0.timeDefines || [];

    let itemsHtml = '';
    timeDefines0.forEach((t, idx) => {
      const d = new Date(t);
      const code = weatherCodes[idx] || "100";
      const iconUrl = getJmaWeatherIconUrl(code, false);
      itemsHtml += `<div style="flex: 0 0 auto; width: 105px; text-align: center; border-right: 1px solid #eee; padding: 0 6px;"><div style="font-size: 11px; font-weight: bold;">${d.getMonth()+1}/${d.getDate()}</div><img src="${iconUrl}" style="width: 36px; height: 36px; margin: 4px auto;" alt="weather"></div>`;
    });

    container.innerHTML = `<div style="display: flex; overflow-x: auto; padding-bottom: 8px;">${itemsHtml}</div>`;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div style="text-align:center; padding: 16px; color:red;">天気データの取得に失敗しました</div>';
  }
}

function resetModalButtons() {
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');
  if (cancelBtn) { cancelBtn.style.display = 'inline-block'; cancelBtn.textContent = 'キャンセル'; }
  if (submitBtn) { submitBtn.style.display = 'inline-block'; submitBtn.disabled = false; submitBtn.textContent = '保存'; }
  document.getElementById('modal-add-row-btn')?.remove();
}

function openAddWeatherModal() {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');
  if (!modal) return;

  resetModalButtons();
  modalTitle.textContent = "地名の追加";
  modalBody.innerHTML = `<div class="modal-weather-row" style="display: flex; gap: 8px; margin-bottom: 8px;"><input type="text" class="input-location" placeholder="地名を入力 (例: 京都)" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #ccc;"></div>`;

  submitBtn.onclick = async () => {
    const val = modalBody.querySelector('.input-location').value.trim();
    if (!val) return;
    weatherLocations.push({ name: val, code: "260000" }); // 簡易デフォルト
    saveStoredFeeds('weatherLocations', weatherLocations);
    modal.classList.add('hidden');
    renderWeatherTabs();
    renderWeatherData();
  };
  modal.classList.remove('hidden');
}

function openEditWeatherModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.add('hidden');
}

// --- ニュース・知識・その他タブ表示の共通処理 ---
function initNews() { renderTabs('news-tabs', newsFeeds, loadNewsContent); if (newsFeeds.length > 0) loadNewsContent(newsFeeds[0].url); }
async function loadNewsContent(url) {
  currentNewsUrl = url;
  const container = document.getElementById('news-content');
  if (!container) return;
  container.innerHTML = '<div class="loading">ニュースを読み込み中...</div>';
  try {
    const items = await fetchNewsRSS(url);
    container.innerHTML = items.map(item => `<div class="news-item"><a href="${item.link}" target="_blank" class="news-link">${item.title}</a><div class="news-time">${formatCustomDate(item.pubDate)}</div></div>`).join('');
  } catch(e) { container.innerHTML = '<div class="loading">取得失敗</div>'; }
}

function initKnowledge() { renderTabs('knowledge-tabs', knowledgeFeeds, loadKnowledgeContent); if (knowledgeFeeds.length > 0) loadKnowledgeContent(knowledgeFeeds[0].url); }
async function loadKnowledgeContent(url) {
  currentKnowledgeUrl = url;
  const container = document.getElementById('knowledge-content');
  if (!container) return;
  container.innerHTML = '<div class="loading">知識を読み込み中...</div>';
  try {
    const items = await fetchNewsRSS(url);
    container.innerHTML = items.map(item => `<div class="news-item"><a href="${item.link}" target="_blank" class="news-link">${item.title}</a><div class="news-time">${formatCustomDate(item.pubDate)}</div></div>`).join('');
  } catch(e) { container.innerHTML = '<div class="loading">取得失敗</div>'; }
}

function initTwitter() { loadTwitterContent(); }
async function loadTwitterContent() {}
function initYoutube() {}
function initFutocyan() {}
function initModals() {}

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
