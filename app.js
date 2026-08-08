// Weather Code 変換マップ
const WEATHER_CODES = {
  0:"☀️", 1:"☀️", 2:"☀️", 3:"☁️", 4:"🌫", 5:"🌬", 6:"🌬", 7:"🌬", 8:"🌬", 9:"🌬", 10:"🌫",
  11:"🌫", 12:"🌫", 13:"⚡", 14:"🌂", 15:"🌂", 16:"🌂", 17:"⛈", 18:"🌬", 19:"🌬", 20:"❄",
  21:"🌂", 22:"❄", 23:"🌂", 24:"🌂", 25:"🌂", 26:"❄", 27:"❄", 28:"❄", 29:"⛈", 30:"🌬",
  31:"🌬", 32:"🌬", 33:"🌬", 34:"🌬", 35:"🌬", 36:"☃", 37:"☃", 38:"☃", 39:"☃", 40:"❄",
  41:"❄", 42:"❄", 43:"❄", 44:"❄", 45:"❄", 46:"❄", 47:"❄", 48:"🌫", 49:"🌫", 50:"🌂",
  51:"🌂", 52:"☔", 53:"☔", 54:"☔", 55:"☔", 56:"🌂", 57:"🌂", 58:"🌂", 59:"🌂", 60:"🌂",
  61:"☔", 62:"☔", 63:"☔", 64:"☔", 65:"☔", 66:"🌂", 67:"☔", 68:"🌂", 69:"☔", 70:"❄",
  71:"❄", 72:"☃", 73:"☃", 74:"☃", 75:"☃", 76:"☃", 77:"❄", 78:"❄", 79:"❄", 80:"🌂",
  81:"🌂", 82:"🌂", 83:"🌂", 84:"🌂", 85:"❄", 86:"☃", 87:"🌂", 88:"🌂", 89:"🌂", 90:"🌂",
  91:"🌂", 92:"🌂", 93:"🌂", 94:"☃", 95:"⛈", 96:"⛈", 97:"⛈", 98:"⛈", 99:"⛈"
};

// 初期RSSデータ
const DEFAULT_NEWS = [
  { name: "朝日新聞(政治)", url: "https://www.asahi.com/rss/asahi/politics.rdf" },
  { name: "Yahoo!ニュース", url: "https://news.yahoo.co.jp/rss/media/zdn_n/all.xml" }
];

const DEFAULT_TWITTER = [];

// localStorage 管理
let newsFeeds = JSON.parse(localStorage.getItem('newsFeeds')) || DEFAULT_NEWS;
let twitterFeeds = JSON.parse(localStorage.getItem('twitterFeeds')) || DEFAULT_TWITTER;

// RSS取得用API (CORS制限回避)
const RSS2JSON_API = "https://api.rss2json.com/v1/api.json?rss_url=";

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
  initWeather();
  initNews();
  initTwitter();
  initModals();
  registerSW();
});

// ServiceWorker登録
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
  }
}

// ----------------------------------------------------
// 1. 今日の天気
// ----------------------------------------------------
async function initWeather() {
  const container = document.getElementById('weather-container');
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

// ----------------------------------------------------
// 2. 今日のニュース
// ----------------------------------------------------
function initNews() {
  renderTabs('news-tabs', newsFeeds, loadNewsContent);
  if (newsFeeds.length > 0) loadNewsContent(newsFeeds[0].url);
}

async function loadNewsContent(url) {
  const container = document.getElementById('news-content');
  container.innerHTML = '<div class="loading">ニュースを読み込み中...</div>';

  try {
    const res = await fetch(RSS2JSON_API + encodeURIComponent(url));
    const data = await res.json();
    
    if (data.status !== 'ok') throw new Error();

    container.innerHTML = '';
    data.items.forEach(item => {
      const newsDiv = document.createElement('div');
      newsDiv.className = 'news-item';
      const date = new Date(item.pubDate).toLocaleString('ja-JP');
      newsDiv.innerHTML = `
        <a href="${item.link}" target="_blank" rel="noopener" class="news-link">${item.title}</a>
        <div class="news-time">${date}</div>
      `;
      container.appendChild(newsDiv);
    });
  } catch (err) {
    container.innerHTML = '<div class="loading">ニュースの取得に失敗しました</div>';
  }
}

// ----------------------------------------------------
// 3. Twitter (Nitter)
// ----------------------------------------------------
function initTwitter() {
  renderTabs('twitter-tabs', twitterFeeds, loadTwitterContent);
  if (twitterFeeds.length > 0) loadTwitterContent(twitterFeeds[0].url);
}

async function loadTwitterContent(url) {
  const container = document.getElementById('twitter-content');
  container.innerHTML = '<div class="loading">ツイートを読み込み中...</div>';

  try {
    const res = await fetch(RSS2JSON_API + encodeURIComponent(url));
    const data = await res.json();
    
    if (data.status !== 'ok') throw new Error();

    container.innerHTML = '';
    data.items.forEach(item => {
      const tweetDiv = document.createElement('div');
      tweetDiv.className = 'tweet-item';
      
      const date = new Date(item.pubDate).toLocaleString('ja-JP');
      const author = item.author || data.feed.title || 'Twitter';

      tweetDiv.innerHTML = `
        <div class="tweet-header">
          <strong>${author}</strong>
          <span style="font-size:11px; color:var(--text-sub);">${date}</span>
        </div>
        <div class="tweet-body">${item.description}</div>
      `;
      container.appendChild(tweetDiv);
    });
  } catch (err) {
    container.innerHTML = '<div class="loading">ツイートの取得に失敗しました</div>';
  }
}

// ----------------------------------------------------
// タブレンダリング共通処理
// ----------------------------------------------------
function renderTabs(containerId, feeds, onClickCallback) {
  const container = document.getElementById(containerId);
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

// ----------------------------------------------------
// モーダル管理（追加・削除機能）
// ----------------------------------------------------
function initModals() {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');

  const closeModal = () => modal.classList.add('hidden');
  cancelBtn.onclick = closeModal;

  // ニュース追加
  document.getElementById('add-news-btn').onclick = () => {
    modalTitle.textContent = 'ニュースRSSを追加';
    modalBody.innerHTML = `
      <input type="text" id="input-name" placeholder="配信先（例: 朝日新聞）">
      <input type="url" id="input-url" placeholder="RSS URL">
    `;
    submitBtn.onclick = () => {
      const name = document.getElementById('input-name').value.trim();
      const url = document.getElementById('input-url').value.trim();
      if (name && url) {
        newsFeeds.push({ name, url });
        localStorage.setItem('newsFeeds', JSON.stringify(newsFeeds));
        initNews();
        closeModal();
      }
    };
    modal.classList.remove('hidden');
  };

  // ニュース削除
  document.getElementById('del-news-btn').onclick = () => {
    modalTitle.textContent = 'ニュース配信先の削除';
    renderDeleteList(newsFeeds, (newFeeds) => {
      newsFeeds = newFeeds;
      localStorage.setItem('newsFeeds', JSON.stringify(newsFeeds));
      initNews();
    });
    submitBtn.onclick = closeModal;
    modal.classList.remove('hidden');
  };

  // Twitter追加
  document.getElementById('add-twitter-btn').onclick = () => {
    modalTitle.textContent = 'Twitter RSSを追加';
    modalBody.innerHTML = `
      <input type="text" id="input-name" placeholder="アカウント名">
      <input type="url" id="input-url" placeholder="Nitter RSS URL">
    `;
    submitBtn.onclick = () => {
      const name = document.getElementById('input-name').value.trim();
      const url = document.getElementById('input-url').value.trim();
      if (name && url) {
        twitterFeeds.push({ name, url });
        localStorage.setItem('twitterFeeds', JSON.stringify(twitterFeeds));
        initTwitter();
        closeModal();
      }
    };
    modal.classList.remove('hidden');
  };

  // Twitter削除
  document.getElementById('del-twitter-btn').onclick = () => {
    modalTitle.textContent = 'Twitterアカウントの削除';
    renderDeleteList(twitterFeeds, (newFeeds) => {
      twitterFeeds = newFeeds;
      localStorage.setItem('twitterFeeds', JSON.stringify(twitterFeeds));
      initTwitter();
    });
    submitBtn.onclick = closeModal;
    modal.classList.remove('hidden');
  };
}

function renderDeleteList(feeds, saveCallback) {
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = '';
  
  if (feeds.length === 0) {
    modalBody.innerHTML = '<div>登録されていません</div>';
    return;
  }

  feeds.forEach((feed, idx) => {
    const row = document.createElement('div');
    row.className = 'delete-list-item';
    row.innerHTML = `
      <span>${feed.name}</span>
      <button class="btn danger" style="padding:2px 8px;">削除</button>
    `;
    row.querySelector('button').onclick = () => {
      feeds.splice(idx, 1);
      saveCallback(feeds);
      renderDeleteList(feeds, saveCallback);
    };
    modalBody.appendChild(row);
  });
}
