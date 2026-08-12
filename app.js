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
  "室蘭": "15000", "苫小牧": "15000", "胆振": "15000", "日高": "15000",
  "函館": "17000", "渡島": "17000", "檜山": "17000"
};

const OKINAWA_SUB_AREAS = {
  "那覇": "471000", "沖縄": "471000", "本島": "471000",
  "南大東": "472000", "北大東": "472000", "大東": "472000",
  "宮古": "473000", "宮古島": "473000",
  "石垣": "474000", "八重山": "474000", "西表": "474000", "与那国": "474000"
};

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

let currentNewsUrl = '';
let currentKnowledgeUrl = '';

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  weatherLocations = loadStoredFeeds('weatherLocations', DEFAULT_WEATHER_LOCATIONS);
  newsFeeds = loadStoredFeeds('newsFeeds', DEFAULT_NEWS);
  knowledgeFeeds = loadStoredFeeds('knowledgeFeeds', DEFAULT_KNOWLEDGE);
  youtubeFeeds = loadStoredFeeds('youtubeFeeds', DEFAULT_YOUTUBE);

  initWeatherUI();
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

// --- 天気機能 コンポーネント描画 ＆ 制御 ---
function initWeatherUI() {
  const weatherSection = document.getElementById('weather-section') || document.querySelector('.weather-section') || document.getElementById('weather-container')?.parentNode;
  
  if (!weatherSection) return;

  // 構造のリセットと再構築
  weatherSection.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <span style="font-weight: bold; font-size: 16px;">天気</span>
      <div style="display: flex; gap: 8px;">
        <button id="add-weather-btn" class="btn" style="padding: 4px 8px; font-size: 12px;">追加</button>
        <button id="edit-weather-btn" class="btn" style="padding: 4px 8px; font-size: 12px;">編集</button>
      </div>
    </div>
    
    <div id="weather-tabs" style="display: flex; gap: 4px; overflow-x: auto; margin-bottom: 12px; border-bottom: 1px solid var(--border-color, #ccc); padding-bottom: 4px;"></div>
    
    <div id="weather-info-box" style="background: var(--bg-card, #fff); border-radius: 8px; padding: 12px; border: 1px solid var(--border-color, #e0e0e0);">
      <div id="weather-area-select-container" style="margin-bottom: 8px;"></div>
      <div id="weather-data-container"></div>
    </div>

    <div style="display: flex; gap: 8px; margin-top: 12px;">
      <button id="weather-3day-btn" class="btn ${currentWeatherMode === '3day' ? 'active' : ''}" style="flex: 1; padding: 8px;">3日間</button>
      <button id="weather-1week-btn" class="btn ${currentWeatherMode === '1week' ? 'active' : ''}" style="flex: 1; padding: 8px;">1週間</button>
    </div>
  `;

  // イベントバインド
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

// 日付フォーマット変換 (YYYY-MM-DD)
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

    // --- 共通データ構文解析 (json[0]: 短期予報) ---
    const ts0 = json0.timeSeries[0]; // 天気
    const ts1 = json0.timeSeries[1]; // 降水確率
    const ts2 = json0.timeSeries[2]; // 短期気温

    const areas = ts0 ? ts0.areas : [];
    if (areas.length === 0) throw new Error("エリア情報が見つかりません");
    if (currentAreaSubIndex >= areas.length) currentAreaSubIndex = 0;

    // --- エリア切替UI ---
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

    // 降水確率データ解析 (日付キー map)
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

    // 気温データ解析 (timeSeries[2] の配列要素を日付単位に紐付け)
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

    // 1週間予報データ解析 (json[1])
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
      // --- 3日間表示 ---
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

        // 降水確率表示
        const popItems = popMapByDate[dateKey] || [];
        let popHtml = '';
        if (popItems.length > 0) {
          // 3日間データ (時間帯ごとのリスト) がある場合
          popHtml = popItems.map(item => `
            <div style="display: flex; justify-content: space-between; gap: 4px; font-size: 10px; color: #007aff; line-height: 1.2;">
              <span style="color: #666;">${item.label}</span>
              <span style="font-weight: bold;">${isNaN(item.val) ? '--' : item.val + '%'}</span>
            </div>
          `).join('');
        } else if (weekDataMap[dateKey] && weekDataMap[dateKey].pop !== undefined && weekDataMap[dateKey].pop !== "") {
          // 翌々日等で3日間データに存在しない場合、1週間予報データから補完 (○%)
          const popVal = weekDataMap[dateKey].pop;
          popHtml = `
            <div style="font-size: 11px; color: #007aff; font-weight: bold; text-align: center; padding: 2px 0;">
              ${popVal}%
            </div>
          `;
        } else {
          popHtml = `<div style="font-size: 11px; color: #999; text-align: center;">--</div>`;
        }

        // 気温表示
        let tempHtml = '';
        const dayTemps = tempMapByDate[dateKey];

        if (dayTemps && dayTemps.length >= 2) {
          // 短期予報(ts2)にデータが存在する場合 (朝9時, 日中最高)
          const temp9 = dayTemps[0] !== undefined ? dayTemps[0] : "--";
          const tempMax = dayTemps[1] !== undefined ? dayTemps[1] : "--";
          tempHtml = `
            <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #eee;">
              <div style="font-size: 10px; color: #007aff;">朝9時: ${temp9}°C</div>
              <div style="font-size: 11px; color: #ff3b30; font-weight: bold;">最高: ${tempMax}°C</div>
            </div>
          `;
        } else if (weekDataMap[dateKey]) {
          // 翌々日など1週間データ側から補完する場合
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
      // --- 1週間表示（取得当日〜） ---
      const allDatesList = [];
      const dateKeySet = new Set();

      // 当日〜翌日のデータをタイムシリーズから収集
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

      // 1週間予報から追加分を取得
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

        // 降水確率の計算（3日間データの平均値、存在しない場合は週間予報値）
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

        // 気温の計算（青字：朝9時/最低、赤字：最高）
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

// モーダル全体の表示状態を初期化するヘルパー関数
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

// 入力地名の解析・都道府県判定ロジック
async function processLocationQuery(query) {
  let targetPref = null;
  let isDirectMatch = false;

  // 1. ○○都/道/府/県、または都/道/府/県を付けた場合実在するか判定
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

  // 直で都道府県と特定できた場合（例: 京都 -> 京都府）
  if (targetPref) {
    if (!isDirectMatch) {
      const confirmOk = await showCustomConfirm(`${targetPref}ですか？`, true);
      if (!confirmOk) return null;
    }
    const code = resolveJmaCode(targetPref, query);
    return code ? { name: targetPref, code: code } : null;
  }

  // 2. 実在しない場合、市町村を国土地理院API等で逆引き検索
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

// 北海道・沖縄の地域コード自動判別含むコード解決
function resolveJmaCode(prefName, originalQuery) {
  if (prefName === "北海道") {
    for (const key in HOKKAIDO_SUB_AREAS) {
      if (originalQuery.includes(key)) {
        return HOKKAIDO_SUB_AREAS[key];
      }
    }
    return "16000"; // デフォルト: 石狩・空知・後志地方
  }

  if (prefName === "沖縄県") {
    for (const key in OKINAWA_SUB_AREAS) {
      if (originalQuery.includes(key)) {
        return OKINAWA_SUB_AREAS[key];
      }
    }
    return "471000"; // デフォルト: 沖縄本島地方
  }

  return JMA_PREF_CODES[prefName] || null;
}

// カスタムダイアログ（OK / Cancel あるいは Cancelのみ）
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

// --- Twitter 領域 ---
function initTwitter() {
  const container = document.getElementById('twitter-content');
  if (!container) return;

  container.innerHTML = '';
  
  const foloWrapper = document.createElement('div');
  foloWrapper.style.display = 'flex';
  foloWrapper.style.justifyContent = 'center';
  foloWrapper.style.alignItems = 'center';
  foloWrapper.style.padding = '20px 0';

  const foloBtn = document.createElement('a');
  foloBtn.href = '#';
  foloBtn.style.display = 'inline-block';
  foloBtn.style.textDecoration = 'none';
  foloBtn.style.transition = 'transform 0.1s ease, opacity 0.2s ease';

  const img = document.createElement('img');
  img.src = 'icons/folo.png'; 
  img.alt = 'Folo';
  img.style.width = '64px';
  img.style.height = '64px';
  img.style.borderRadius = '16px';
  img.style.objectFit = 'cover';
  img.style.display = 'block';

  foloBtn.appendChild(img);

  foloBtn.addEventListener('touchstart', () => { foloBtn.style.transform = 'scale(0.92)'; });
  foloBtn.addEventListener('touchend', () => { foloBtn.style.transform = 'scale(1)'; });

  foloBtn.onclick = (e) => {
    e.preventDefault();
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      window.location.href = 'follow://';
    } else {
      window.open('https://app.folo.is/timeline/articles/all/pending', '_blank', 'noopener,noreferrer');
    }
  };

  foloWrapper.appendChild(foloBtn);
  container.appendChild(foloWrapper);
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

    window.currentVideoList = [];
    window.selectedChannel = 'ALL';
    window.modalPos = { x: null, y: null };

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

        <div style="display: flex; gap: 8px;">
          <button id="yt-tab-long" class="tab-btn active" style="flex: 1; padding: 8px 12px; cursor: pointer; background: #ffffff; color: #333; border: 1px solid #ccc; border-radius: 6px; font-weight: bold;" onclick="switchYtTab('long')">動画</button>
          <button id="yt-tab-shorts" class="tab-btn" style="flex: 1; padding: 8px 12px; cursor: pointer; background: #ffffff; color: #333; border: 1px solid #ccc; border-radius: 6px;" onclick="switchYtTab('short')">Shorts</button>
        </div>
      </div>

      <div id="yt-table-container"></div>
    `;

    window.currentType = 'long';

    window.updateVideoDisplay = function() {
      const filtered = allVideoDataList.filter(item => {
        const matchesType = window.currentType === 'short' ? item.isShort : !item.isShort;
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
      const btnLong = document.getElementById('yt-tab-long');
      const btnShorts = document.getElementById('yt-tab-shorts');
      if (type === 'long') {
        if (btnLong) {
          btnLong.classList.add('active');
          btnLong.style.fontWeight = 'bold';
        }
        if (btnShorts) {
          btnShorts.classList.remove('active');
          btnShorts.style.fontWeight = 'normal';
        }
      } else {
        if (btnShorts) {
          btnShorts.classList.add('active');
          btnShorts.style.fontWeight = 'bold';
        }
        if (btnLong) {
          btnLong.classList.remove('active');
          btnLong.style.fontWeight = 'normal';
        }
      }
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
        const dateStr = item.pubDate instanceof Date && !isNaN(item.pubDate)
          ? item.pubDate.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '';

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

// --- ミニプレイヤー表示関数 ---
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
