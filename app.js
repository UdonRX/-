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

// 天気初期データ
const DEFAULT_WEATHER_LOCATIONS = [
  {
    name: "京都市",
    lat: "35.0211",
    lon: "135.7538"
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
let currentWeatherMode = 'hourly'; // 'hourly' または 'daily'

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
      <div id="weather-data-container"></div>
    </div>

    <div style="display: flex; gap: 8px; margin-top: 12px;">
      <button id="weather-hourly-btn" class="btn ${currentWeatherMode === 'hourly' ? 'active' : ''}" style="flex: 1; padding: 8px;">1時間ごと</button>
      <button id="weather-daily-btn" class="btn ${currentWeatherMode === 'daily' ? 'active' : ''}" style="flex: 1; padding: 8px;">2週間</button>
    </div>
  `;

  // イベントバインド
  document.getElementById('add-weather-btn').onclick = openAddWeatherModal;
  document.getElementById('edit-weather-btn').onclick = openEditWeatherModal;

  const hourlyBtn = document.getElementById('weather-hourly-btn');
  const dailyBtn = document.getElementById('weather-daily-btn');

  hourlyBtn.onclick = () => {
    currentWeatherMode = 'hourly';
    hourlyBtn.classList.add('active');
    dailyBtn.classList.remove('active');
    renderWeatherData();
  };

  dailyBtn.onclick = () => {
    currentWeatherMode = 'daily';
    dailyBtn.classList.add('active');
    hourlyBtn.classList.remove('active');
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
      renderWeatherTabs();
      renderWeatherData();
    };
    tabsContainer.appendChild(btn);
  });
}

async function renderWeatherData() {
  const container = document.getElementById('weather-data-container');
  if (!container) return;

  if (weatherLocations.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding: 16px; color:#888;">追加ボタンから地域を登録してください。</div>';
    return;
  }

  const loc = weatherLocations[currentWeatherIdx];
  if (!loc) return;

  container.innerHTML = '<div class="loading" style="text-align:center; padding:16px;">天気情報を読み込み中...</div>';

  const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

  if (currentWeatherMode === 'hourly') {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&hourly=temperature_2m,precipitation_probability,weather_code&timezone=Asia%2FTokyo&forecast_days=1`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      
      if (!data.hourly) throw new Error("APIエラー");

      const { time, temperature_2m, precipitation_probability, weather_code } = data.hourly;
      
      const firstDate = new Date(time[0]);
      const dateHeaderStr = `${firstDate.getMonth() + 1}月${firstDate.getDate()}日（${dayOfWeek[firstDate.getDay()]}）`;

      let itemsHtml = '';
      time.forEach((t, i) => {
        const hour = t.split('T')[1].substring(0, 5);
        const temp = temperature_2m[i];
        const prob = precipitation_probability[i];
        const code = weather_code[i];
        const icon = WEATHER_CODES[code] || "❓";

        itemsHtml += `
          <div style="flex: 0 0 auto; width: 65px; text-align: center; border-right: 1px solid #eee; padding: 0 4px;">
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">${hour}</div>
            <div style="font-size: 22px; margin-bottom: 4px;">${icon}</div>
            <div style="font-size: 11px; color: #007aff; margin-bottom: 4px;">${prob}%</div>
            <div style="font-size: 12px; font-weight: bold;">${temp}°C</div>
          </div>
        `;
      });

      container.innerHTML = `
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; position: sticky; left: 0;">${dateHeaderStr}</div>
        <div style="display: flex; overflow-x: auto; padding-bottom: 8px; scrollbar-width: thin;">
          ${itemsHtml}
        </div>
      `;
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div style="text-align:center; padding: 16px; color:red;">天気データの取得に失敗しました</div>';
    }
  } else {
    // 2週間
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&daily=weather_code,precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=Asia%2FTokyo&forecast_days=14`;
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.daily) throw new Error("APIエラー");

      const { time, weather_code, precipitation_probability_max, temperature_2m_max, temperature_2m_min } = data.daily;

      let itemsHtml = '';
      time.forEach((t, i) => {
        const d = new Date(t);
        const dateStr = `${d.getMonth() + 1}/${d.getDate()} (${dayOfWeek[d.getDay()]})`;
        const code = weather_code[i];
        const icon = WEATHER_CODES[code] || "❓";
        const prob = precipitation_probability_max[i];
        const maxTemp = temperature_2m_max[i];
        const minTemp = temperature_2m_min[i];

        itemsHtml += `
          <div style="flex: 0 0 auto; width: 80px; text-align: center; border-right: 1px solid #eee; padding: 0 4px;">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; white-space: nowrap;">${dateStr}</div>
            <div style="font-size: 22px; margin-bottom: 4px;">${icon}</div>
            <div style="font-size: 11px; color: #007aff; margin-bottom: 4px;">${prob}%</div>
            <div style="font-size: 12px; color: #ff3b30; font-weight: bold;">${maxTemp}°C</div>
            <div style="font-size: 12px; color: #007aff; font-weight: bold;">${minTemp}°C</div>
          </div>
        `;
      });

      container.innerHTML = `
        <div style="display: flex; overflow-x: auto; padding-bottom: 8px; scrollbar-width: thin;">
          ${itemsHtml}
        </div>
      `;
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div style="text-align:center; padding: 16px; color:red;">天気データの取得に失敗しました</div>';
    }
  }
}

// --- 天気 モーダル処理 ---
function openAddWeatherModal() {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');

  if (!modal || !modalTitle || !modalBody || !cancelBtn || !submitBtn) return;

  // 追加ボタン等クリーンアップ
  const cleanupExtra = () => {
    const addRowBtn = document.getElementById('modal-add-row-btn');
    if (addRowBtn) addRowBtn.remove();
  };
  cleanupExtra();

  modalTitle.textContent = "地名の追加";
  modalBody.innerHTML = '';

  const createLocationRow = () => {
    const row = document.createElement('div');
    row.className = 'modal-weather-row';
    row.style.cssText = "display: flex; gap: 8px; margin-bottom: 8px; align-items: center;";
    
    row.innerHTML = `
      <input type="text" class="input-location" placeholder="地名を入力 (例: 京都、京都市)" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #ccc;" autocomplete="off">
      <button type="button" class="btn danger remove-weather-row-btn" style="padding: 4px 8px; display: none;">✕</button>
    `;

    const input = row.querySelector('.input-location');
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
      if (rows.length > 1) {
        btn.style.display = 'inline-block';
      } else {
        btn.style.display = 'none';
      }
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

  cancelBtn.textContent = 'キャンセル';
  cancelBtn.style.display = 'inline-block';
  cancelBtn.onclick = () => {
    cleanupExtra();
    modal.classList.add('hidden');
  };

  submitBtn.textContent = '保存';
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
    submitBtn.textContent = "検索中...";

    // 各地名入力に対してジオコーディングを実施・解析
    const resolvedLocations = [];

    for (const q of queries) {
      // 末尾判定 (都道府県市町村がついているか)
      const hasSuffix = /[都道府県市町村区]$/.test(q);

      try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=10&language=ja&format=json`;
        const res = await fetch(geoUrl);
        const data = await res.json();

        if (!data.results || data.results.length === 0) {
          alert(`「${q}」に該当する地名はありません。`);
          submitBtn.disabled = false;
          submitBtn.textContent = '保存';
          return;
        }

        let selectedResult = null;

        if (hasSuffix) {
          selectedResult = data.results[0];
        } else {
          // 選択候補モーダルの構築
          const choices = data.results.map(r => {
            const admin = r.admin1 || '';
            const name = r.name || '';
            return {
              displayName: `${admin} ${name}`.trim() || name,
              lat: r.latitude.toFixed(4),
              lon: r.longitude.toFixed(4)
            };
          });

          // 候補選択ダイアログ表示のためにプロンプト一時停止
          selectedResult = await promptSelectLocation(q, choices);
          if (!selectedResult) {
            submitBtn.disabled = false;
            submitBtn.textContent = '保存';
            return; // キャンセルされた場合
          }
        }

        if (selectedResult) {
          resolvedLocations.push({
            name: selectedResult.displayName || selectedResult.name || q,
            lat: parseFloat(selectedResult.latitude || selectedResult.lat).toFixed(4),
            lon: parseFloat(selectedResult.longitude || selectedResult.lon).toFixed(4)
          });
        }
      } catch (e) {
        console.error(e);
        alert(`「${q}」の検索に失敗しました。`);
        submitBtn.disabled = false;
        submitBtn.textContent = '保存';
        return;
      }
    }

    if (resolvedLocations.length > 0) {
      weatherLocations.push(...resolvedLocations);
      saveStoredFeeds('weatherLocations', weatherLocations);
      currentWeatherIdx = weatherLocations.length - resolvedLocations.length;
      cleanupExtra();
      modal.classList.add('hidden');
      initWeatherUI();
    }

    submitBtn.disabled = false;
    submitBtn.textContent = '保存';
  };

  modal.classList.remove('hidden');
}

function promptSelectLocation(query, choices) {
  return new Promise((resolve) => {
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('modal-submit-btn');
    const addRowBtn = document.getElementById('modal-add-row-btn');

    if (addRowBtn) addRowBtn.style.display = 'none';
    submitBtn.style.display = 'none';

    modalTitle.textContent = `「${query}」の候補選択`;
    modalBody.innerHTML = '<div style="margin-bottom:8px; font-size:13px;">該当する地域を選択してください:</div>';

    const listContainer = document.createElement('div');
    listContainer.style.cssText = "display: flex; flex-direction: column; gap: 6px; max-height: 200px; overflow-y: auto;";

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.cssText = "text-align: left; padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 6px; background: #f9f9f9;";
      btn.textContent = choice.displayName;
      btn.onclick = () => {
        submitBtn.style.display = 'inline-block';
        if (addRowBtn) addRowBtn.style.display = 'inline-block';
        resolve(choice);
      };
      listContainer.appendChild(btn);
    });

    modalBody.appendChild(listContainer);
  });
}

function openEditWeatherModal() {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');

  if (!modal || !modalTitle || !modalBody || !cancelBtn || !submitBtn) return;

  const cleanupExtra = () => {
    const addRowBtn = document.getElementById('modal-add-row-btn');
    if (addRowBtn) addRowBtn.remove();
  };
  cleanupExtra();

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
    cancelBtn.style.display = 'inline-block';
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
