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
const YOUTUBE_API_KEY = "AIzaSyCIu3TLMlWdKLjjU7mDsuhY8Rmdp-lSxWM"; // ここにYouTube Data API v3のキーを設定してください

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

// 初期データ（気象庁API仕様：京都府 260000）
const DEFAULT_WEATHER_LOCATIONS = [
  {
    name: "京都府",
    code: "260000"
  }
];

// 他の初期データ
const DEFAULT_NEWS = [
  { name: "朝日新聞(政治)", url: "https://www.asahi.com/rss/asahi/politics.rdf" },
  { name: "Yahoo!ニュース", url: "https://news.yahoo.co.jp/rss/media/aptsushinv/all.xml" }
];

const DEFAULT_KNOWLEDGE = [
  { name: "Qiita", url: "https://qiita.com/tags/javascript/feed.atom" },
  { name: "GIGAZINE", url: "https://gigazine.net/news/rss_2.0/" }
];

const DEFAULT_YOUTUBE = [];

// Twitter初期データ
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

// グローバル変数
let weatherLocations = loadStoredFeeds('weatherLocations', DEFAULT_WEATHER_LOCATIONS);
let currentWeatherIdx = 0;
let currentWeatherMode = '3day'; // '3day' または '1week'
let currentAreaSubIndex = 0; // エリア切り替え用

let newsFeeds = loadStoredFeeds('newsFeeds', DEFAULT_NEWS);
let knowledgeFeeds = loadStoredFeeds('knowledgeFeeds', DEFAULT_KNOWLEDGE);
let youtubeFeeds = loadStoredFeeds('youtubeFeeds', DEFAULT_YOUTUBE);
let twitterFeeds = loadStoredFeeds('twitterFeeds', DEFAULT_TWITTER);
let currentTwitterIdx = 0;

let currentNewsUrl = '';
let currentKnowledgeUrl = '';

// 初期化
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
  initFutocyan(); // 布団ちゃん機能の初期化
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

// --- YouTube API を利用したデータ取得関数 ---
async function fetchYoutubeData(channelIdentifier) {
  let channelId = channelIdentifier;
  
  // チャンネルIDまたはハンドル(@...)からチャンネルIDを特定する
  if (channelIdentifier.startsWith('@') || !channelIdentifier.startsWith('UC')) {
    const searchPart = channelIdentifier.startsWith('@') ? channelIdentifier.substring(1) : channelIdentifier;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id,snippet&forHandle=${encodeURIComponent(searchPart)}&key=${YOUTUBE_API_KEY}`);
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      channelId = data.items[0].id;
    } else {
      // 検索エンドポイントでフォールバック
      const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelIdentifier)}&key=${YOUTUBE_API_KEY}`);
      const searchData = await searchRes.json();
      if (searchData.items && searchData.items.length > 0) {
        channelId = searchData.items[0].snippet.channelId;
      } else {
        throw new Error('YouTubeチャンネルが見つかりませんでした');
      }
    }
  }

  // チャンネルのアップロード用プレイリストIDを取得
  const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${channelId}&key=${YOUTUBE_API_KEY}`);
  const channelData = await channelRes.json();
  if (!channelData.items || channelData.items.length === 0) throw new Error('チャンネル情報の取得に失敗しました');

  const channelName = channelData.items[0].snippet.title;
  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // アップロード動画一覧を取得 (最大50件)
  const playlistRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`);
  const playlistData = await playlistRes.json();
  
  if (!playlistData.items) return [];

  const videoIds = playlistData.items.map(item => item.contentDetails.videoId);

  // 動画の詳細情報（ライブ配信ステータスや詳細データ）を一括取得
  const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,contentDetails&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`);
  const detailsData = await detailsRes.json();

  if (!detailsData.items) return [];

  return detailsData.items.map(video => {
    const videoId = video.id;
    const title = video.snippet.title;
    const publishedAt = video.snippet.publishedAt;
    const thumbnail = video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    
    const liveDetails = video.liveStreamingDetails;
    let liveStatus = 'none'; // 'none', 'upcoming', 'live', 'completed'
    let scheduledStartTime = null;

    if (liveDetails) {
      if (liveDetails.actualEndTime) {
        liveStatus = 'completed'; // 生配信の録画
      } else if (liveDetails.actualStartTime) {
        liveStatus = 'live'; // 配信中
      } else if (liveDetails.scheduledStartTime) {
        liveStatus = 'upcoming'; // 配信予定
        scheduledStartTime = new Date(liveDetails.scheduledStartTime);
      } else {
        liveStatus = 'completed';
      }
    }

    // Shortsの判定 (通常縦動画やdurationが短いもの、あるいはタイトルのハッシュタグ等)
    let isShort = false;
    const durationISO = video.contentDetails?.duration || '';
    if (durationISO) {
      const match = durationISO.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
      if (match) {
        const mins = parseInt(match[1] || 0, 10);
        const secs = parseInt(match[2] || 0, 10);
        if (mins === 0 && secs > 0 && secs <= 60) {
          isShort = true;
        }
      }
    }
    if (title.toLowerCase().includes('#shorts') || title.toLowerCase().includes('#short')) {
      isShort = true;
    }

    return {
      videoId,
      title,
      link: `https://www.youtube.com/watch?v=${videoId}`,
      pubDate: new Date(publishedAt),
      channelName,
      thumbnail,
      isShort,
      liveStatus,
      scheduledStartTime
    };
  });
}

// --- 天気機能 コンポーネント描画 ＆ 制御 ---
function initWeatherUI() {
  const weatherSection = document.getElementById('weather-section') || document.querySelector('.weather-section') || document.getElementById('weather-container')?.parentNode;
  
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
    container.innerHTML = '<div style="text-align:center; padding: 16px; color:#888;">地域コードが無効です。地域を再登録してください。</div>';
    return;
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
    container.innerHTML = '<div style="text-align:center; padding: 16px; color:red;">天気データの取得に失敗しました</div>';
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
      <input type="text" class="input-location" placeholder="地名を入力 (例: 京都、高松、造田)" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #ccc;" autocomplete="off">
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
    return "16000";
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

// --- ニュース機能 ---
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

// --- 知識機能 ---
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
async function initTwitter() {
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
  if (twitterContent && !tabsContainer && twitterContent.parentNode) {
    tabsContainer = document.createElement('div');
    tabsContainer.id = 'twitter-tabs';
    tabsContainer.style.cssText = 'display: flex; gap: 4px; overflow-x: auto; margin-bottom: 12px; border-bottom: 1px solid var(--border-color, #ccc); padding-bottom: 4px;';
    twitterContent.parentNode.insertBefore(tabsContainer, twitterContent);
  }

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
      currentTwitterIdx = idx;
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
        <input type="text" id="add-twitter-id" placeholder="リストIDを入力 (例: 2087706843519111304)" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color, #ccc); box-sizing: border-box;" autocomplete="off">
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

async function loadTwitterContent() {
  const container = document.getElementById('twitter-content');
  if (!container) return;

  container.innerHTML = '<div class="loading">ツイートを読み込み中...</div>';

  if (twitterFeeds.length === 0) {
    container.innerHTML = '<div class="loading">リストを追加してください。</div>';
    return;
  }

  if (currentTwitterIdx >= twitterFeeds.length) {
    currentTwitterIdx = 0;
  }

  const currentFeed = twitterFeeds[currentTwitterIdx];
  const feedUrl = `https://rsshub-latest-wekl.onrender.com/twitter/list/${currentFeed.url}`;
  const apiUrl = `/api/rss?url=${encodeURIComponent(feedUrl)}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('ツイートの取得に失敗しました');
    const xmlText = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    if (xmlDoc.querySelector('parsererror')) {
      throw new Error('XMLパースエラー');
    }

    const items = Array.from(xmlDoc.querySelectorAll('item'));
    if (items.length === 0) {
      container.innerHTML = '<div class="loading">ツイートが見つかりませんでした</div>';
      return;
    }

    container.innerHTML = '';

    const today = new Date();

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
      let dateStr = pubDateRaw;
      
      if (!isNaN(pubDate.getTime())) {
        const isToday = pubDate.getFullYear() === today.getFullYear() &&
                        pubDate.getMonth() === today.getMonth() &&
                        pubDate.getDate() === today.getDate();

        if (isToday) {
          const hours = String(pubDate.getHours()).padStart(2, '0');
          const minutes = String(pubDate.getMinutes()).padStart(2, '0');
          dateStr = `${hours}:${minutes}`;
        } else {
          dateStr = pubDate.toLocaleString('ja-JP');
        }
      }

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
          const videoLinkBox = document.createElement('a');
          videoLinkBox.href = targetVideoUrl;
          videoLinkBox.target = '_blank';
          videoLinkBox.rel = 'noopener noreferrer';
          
          videoLinkBox.onclick = (e) => {
            e.stopPropagation();
            window.open(targetVideoUrl, '_blank', 'noopener,noreferrer');
            e.preventDefault();
          };

          videoLinkBox.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            height: 140px;
            background: #15202b;
            color: #ffffff;
            border-radius: 8px;
            text-decoration: none;
            box-sizing: border-box;
            border: 1px solid #38444d;
            cursor: pointer;
          `;
          videoLinkBox.innerHTML = `
            <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(29, 161, 242, 0.9); display: flex; align-items: center; justify-content: center;">
              <span style="color: #fff; font-size: 20px; margin-left: 3px;">▶</span>
            </div>
            <span style="font-size: 13px; font-weight: bold; color: #1da1f2;">動画をタップして再生（外部で開く）</span>
          `;
          mediaContainer.appendChild(videoLinkBox);
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

  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="loading" style="color: red;">ツイートの取得に失敗しました</div>';
  }
}

// --- YouTube 領域 ---
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

    container.innerHTML = `
      <div style="position: sticky; top: 0; z-index: 100; background: #ffffff; padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
        <div style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
          <select id="yt-channel-select" onchange="filterYtByChannel(this.value)" style="width: 75%; padding: 6px 8px; border-radius: 6px; background: #ffffff; color: #333333; border: 1px solid #ccc; font-size: 13px; box-sizing: border-box;">
            ${channelOptionsHtml}
          </select>

          <div id="yt-channel-badge" style="width: 25%; display: none; justify-content: center; align-items: center; box-sizing: border-box;">
            <button onclick="resetYtChannelFilter()" title="フィルター解除" style="width: 100%; padding: 6px 0; background: #f0f0f0; border: 1px solid #ccc; color: #333; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold; line-height: 1;">✕</button>
          </div>
        </div>

        <div style="display: flex; gap: 4px;">
          <button id="yt-tab-long" class="tab-btn active" style="flex: 1; padding: 8px 6px; cursor: pointer; background: #ffffff; color: #333; border: 1px solid #ccc; border-radius: 6px; font-weight: bold; font-size: 12px;" onclick="switchYtTab('long')">動画</button>
          <button id="yt-tab-shorts" class="tab-btn" style="flex: 1; padding: 8px 6px; cursor: pointer; background: #ffffff; color: #333; border: 1px solid #ccc; border-radius: 6px; font-size: 12px;" onclick="switchYtTab('short')">Shorts</button>
          <button id="yt-tab-live" class="tab-btn" style="flex: 1; padding: 8px 6px; cursor: pointer; background: #ffffff; color: #333; border: 1px solid #ccc; border-radius: 6px; font-size: 12px;" onclick="switchYtTab('live')">LIVE</button>
        </div>
      </div>

      <div id="yt-table-container"></div>
    `;

    window.currentType = 'long';

    window.updateVideoDisplay = function() {
      const filtered = allVideos.filter(item => {
        let matchesType = false;
        if (window.currentType === 'long') {
          matchesType = !item.isShort && item.liveStatus === 'none';
        } else if (window.currentType === 'short') {
          matchesType = item.isShort;
        } else if (window.currentType === 'live') {
          matchesType = item.liveStatus === 'live' || item.liveStatus === 'upcoming' || item.liveStatus === 'completed';
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
        if (item.liveStatus === 'upcoming' && item.scheduledStartTime) {
          dateStr = `予定: ${item.scheduledStartTime.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}開始`;
        } else if (item.liveStatus === 'live') {
          dateStr = '🔴 ライブ配信中';
        } else if (item.pubDate instanceof Date && !isNaN(item.pubDate)) {
          dateStr = item.pubDate.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }

        html += `
          <tr onclick="openYoutubeModalByIndex(${index})" style="border-bottom: 1px solid rgba(0,0,0,0.1); cursor: pointer;">
            <td style="padding: 8px 4px; width: 70px;">
              <div style="position: relative; width: 64px; height: 36px; overflow: hidden; border-radius: 4px; background: #000;">
                ${item.thumbnail ? `<img src="${item.thumbnail}" style="width: 100%; height: 100%; object-fit: cover;" alt="thumbnail">` : ''}
                <div style="position: absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.3); color:#fff; font-size:10px;">▶</div>
              </div>
            </td>
            <td style="padding: 8px 4px; vertical-align: middle;">
              <div style="font-weight: bold; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.title || 'タイトルなし'}</div>
              <div style="font-size: 11px; opacity: 0.7; margin-top: 2px; ${item.liveStatus === 'live' ? 'color: #ff3b30; font-weight: bold;' : ''}">${item.displayName || ''} ${dateStr ? '• ' + dateStr : ''}</div>
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

// --- 布団ちゃん機能の追加（YouTubeセクションの下） ---
function initFutocyan() {
  const youtubeSection = document.getElementById('youtube-section') || document.querySelector('.youtube-section');
  if (!youtubeSection) return;

  // すでに存在していなければ作成
  let futocyanSection = document.getElementById('futocyan-section');
  if (!futocyanSection) {
    futocyanSection = document.createElement('div');
    futocyanSection.id = 'futocyan-section';
    futocyanSection.className = 'section'; // 既存の共通セクションクラスがあれば適用
    futocyanSection.style.cssText = 'margin-top: 24px; background: var(--card-bg, #fff); border-radius: 8px; padding: 12px; border: 1px solid var(--border-color, #e0e0e0);';
    
    // YouTubeセクションの直後に挿入
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
      
      // 日本時間に変換
      let dateStr = '';
      if (item.pubDate instanceof Date && !isNaN(item.pubDate)) {
        dateStr = item.pubDate.toLocaleString('ja-JP', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      const tr = document.createElement('tr');
      tr.style.cssText = 'border-bottom: 1px solid rgba(0,0,0,0.1);';

      tr.innerHTML = `
        <td style="padding: 8px 4px; vertical-align: middle;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
            ${isLive ? '<span style="background: #ff3b30; color: #fff; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; animation: pulse 1.5s infinite;">🔴 LIVE中</span>' : ''}
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

window.openYoutubeModalByIndex = function(index) {
  const list = window.currentVideoList;
  if (!list || index < 0 || index >= list.length) return;

  const item = list[index];
  const videoId = item.videoId;
  const title = item.title || '';

  let modal = document.getElementById('youtube-video-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'youtube-video-modal';
    document.body.appendChild(modal);
  }

  const hasPrev = index > 0;
  const hasNext = index < list.length - 1;

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
    <div style="width: 100%; background: #000; position: relative;">
      <div id="yt-modal-drag-handle" style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: #1c1c1e; color: #fff; font-size: 12px; cursor: move; user-select: none; -webkit-user-select: none;">
        <div style="display: flex; align-items: center; gap: 4px;">
          <button onclick="openYoutubeModalByIndex(${index - 1})" ${!hasPrev ? 'disabled' : ''} style="background: rgba(255,255,255,0.15); border: none; color: #fff; padding: 2px 6px; border-radius: 4px; cursor: ${hasPrev ? 'pointer' : 'default'}; opacity: ${hasPrev ? '1' : '0.3'}; font-size: 11px;">▲ 前</button>
          <button onclick="openYoutubeModalByIndex(${index + 1})" ${!hasNext ? 'disabled' : ''} style="background: rgba(255,255,255,0.15); border: none; color: #fff; padding: 2px 6px; border-radius: 4px; cursor: ${hasNext ? 'pointer' : 'default'}; opacity: ${hasNext ? '1' : '0.3'}; font-size: 11px;">▼ 次</button>
        </div>
        <div style="font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0 6px; flex: 1; text-align: center; font-size: 11px;">⠿ ${title}</div>
        <button onclick="closeYoutubeModal()" style="background: none; border: none; color: #fff; font-size: 16px; cursor: pointer; padding: 0 4px; line-height: 1;">✕</button>
      </div>

      <div style="position: relative; width: 100%; padding-top: 56.25%; background: #000; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; width: 200%; height: 200%; transform: scale(0.5); transform-origin: 0 0;">
          <iframe 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&vq=hd1080" 
            title="${title}"
            style="width: 100%; height: 100%; border: none;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
          </iframe>
        </div>
      </div>
    </div>
  `;

  setupModalDrag(modal);
};

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
    modal.classList.add('hidden');
  };

  cancelBtn.onclick = closeModal;

  const setupAddModal = (btnId, titleText, feedsArray, storageKey, initFunc) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    btn.onclick = () => {
      cleanupExtraButtons();
      modalTitle.textContent = titleText;
      modalBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div>
            <label style="font-size: 12px; color: var(--text-sub); display: block; margin-bottom: 4px;">サイト名 / チャンネル名</label>
            <input type="text" id="add-feed-name" placeholder="例: NHKニュース" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color, #ccc); box-sizing: border-box;" autocomplete="off">
          </div>
          <div>
            <label style="font-size: 12px; color: var(--text-sub); display: block; margin-bottom: 4px;">RSS URL または YouTubeチャンネルID</label>
            <input type="text" id="add-feed-url" placeholder="例: https://..." style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border-color, #ccc); box-sizing: border-box;" autocomplete="off">
          </div>
        </div>
      `;

      submitBtn.textContent = '追加';
      submitBtn.onclick = () => {
        const nameInput = document.getElementById('add-feed-name');
        const urlInput = document.getElementById('add-feed-url');
        const name = nameInput ? nameInput.value.trim() : '';
        const url = urlInput ? urlInput.value.trim() : '';

        if (!name || !url) {
          alert("すべての項目を入力してください");
          return;
        }

        feedsArray.push({ name, url });
        saveStoredFeeds(storageKey, feedsArray);
        closeModal();
        initFunc();
      };

      modal.classList.remove('hidden');
    };
  };

  setupAddModal('add-news-btn', 'ニュース配信先の追加', newsFeeds, 'newsFeeds', initNews);
  setupAddModal('add-knowledge-btn', '知識配信先の追加', knowledgeFeeds, 'knowledgeFeeds', initKnowledge);
  setupAddModal('add-youtube-btn', 'YouTubeチャンネルの追加', youtubeFeeds, 'youtubeFeeds', initYoutube);

  const setupEditModal = (btnId, titleText, feedsArray, storageKey, initFunc) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    btn.onclick = () => {
      cleanupExtraButtons();
      modalTitle.textContent = titleText;
      cancelBtn.style.display = 'none';
      submitBtn.textContent = '完了';
      submitBtn.onclick = () => {
        cancelBtn.style.display = 'inline-block';
        closeModal();
      };

      const renderList = () => {
        modalBody.innerHTML = '';
        if (feedsArray.length === 0) {
          modalBody.innerHTML = '<div style="color: #888; font-size: 14px;">登録されていません</div>';
          return;
        }

        feedsArray.forEach((feed, idx) => {
          const row = document.createElement('div');
          row.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding: 8px; background: #f9f9f9; border-radius: 6px; border: 1px solid #ccc;";

          const nameSpan = document.createElement('span');
          nameSpan.style.cssText = "font-weight: 500; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";
          nameSpan.textContent = feed.name;

          const btnGroup = document.createElement('div');
          btnGroup.style.cssText = "display: flex; gap: 4px;";

          const delBtn = document.createElement('button');
          delBtn.className = 'btn danger';
          delBtn.style.padding = '2px 8px';
          delBtn.textContent = '削除';
          delBtn.onclick = () => {
            feedsArray.splice(idx, 1);
            saveStoredFeeds(storageKey, feedsArray);
            renderList();
            initFunc();
          };

          btnGroup.appendChild(delBtn);
          row.appendChild(nameSpan);
          row.appendChild(btnGroup);
          modalBody.appendChild(row);
        });
      };

      renderList();
      modal.classList.remove('hidden');
    };
  };

  setupEditModal('del-news-btn', 'ニュース配信先の編集', newsFeeds, 'newsFeeds', initNews);
  setupEditModal('del-knowledge-btn', '知識配信先の編集', knowledgeFeeds, 'knowledgeFeeds', initKnowledge);
  setupEditModal('del-youtube-btn', 'YouTubeチャンネルの編集', youtubeFeeds, 'youtubeFeeds', initYoutube);
}
