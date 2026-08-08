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
  { name: "Yahoo!ニュース", url: "https://news.yahoo.co.jp/rss/media/aptsushinv/all.xml" }
];

const DEFAULT_TWITTER = [];

// localStorage 管理
let newsFeeds = JSON.parse(localStorage.getItem('newsFeeds')) || DEFAULT_NEWS;
let twitterFeeds = JSON.parse(localStorage.getItem('twitterFeeds')) || DEFAULT_TWITTER;

// 通信競合防止用のフラグ
let currentNewsUrl = '';

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
// Vercel Serverless Function経由でRSSを取得・解析する関数（カタカナXML完全対応版）
// ----------------------------------------------------
async function fetchAndParseRSS(feedUrl) {
  const apiUrl = `/api/rss?url=${encodeURIComponent(feedUrl)}`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('RSS取得エラー');
  const xmlText = await response.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('XMLパースエラー');
  }

  // item / entry / アイテム のいずれも取得
  let items = Array.from(xmlDoc.querySelectorAll('item, entry, アイテム'));

  // 万が一要素が取れない場合は、直下の全子要素から探す
  if (items.length === 0) {
    const channel = xmlDoc.querySelector('channel, チャンネル') || xmlDoc;
    items = Array.from(channel.children).filter(node => 
      ['item', 'entry', 'アイテム'].includes(node.tagName.toLowerCase())
    );
  }

  // タグ名に揺らぎ（日本語・英語）があっても要素テキストを取得するヘルパー関数
  const getTagText = (parent, selectors) => {
    for (const selector of selectors) {
      const elem = parent.querySelector(selector);
      if (elem && elem.textContent) {
        return elem.textContent.trim();
      }
    }
    return '';
  };

  // 日本語形式の日付を安全に Date オブジェクトへ変換する関数
  const parseCustomDate = (dateStr) => {
    if (!dateStr) return new Date();
    
    // "2026 年 8 月 8 日土曜日 09:16:00 GMT" などの日本語表現をハイフン/スラッシュ区切りへ正規化
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
    // 1. タイトル取得
    const title = getTagText(item, ['title', 'タイトル']) || '無題';

    // 2. リンク取得 (属性 href もチェック)
    let link = getTagText(item, ['link', 'リンク', 'url', 'URL']);
    if (!link) {
      const linkElem = item.querySelector('link, リンク');
      if (linkElem && linkElem.getAttribute('href')) {
        link = linkElem.getAttribute('href');
      }
    }

    // 3. 日付取得
    const pubDateRaw = getTagText(item, [
      'pubDate', 'date', 'published', 'updated', 
      '公開日時', '投稿日時', '日付', '発行日時'
    ]);

    // 4. 本文・概要取得
    const description = getTagText(item, [
      'description', 'content', 'encoded', 
      '詳細', '概要', '内容', '本文'
    ]);

    // 5. 投稿者取得
    const author = getTagText(item, [
      'creator', 'dc\\:creator', 'author name', 'author', 
      '製作者', '投稿者', '作者'
    ]);

    return {
      title,
      link,
      pubDate: parseCustomDate(pubDateRaw),
      description: description || title, // 本文が空ならタイトルで代用
      author
    };
  });
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
  if (newsFeeds.length > 0) {
    loadNewsContent(newsFeeds[0].url);
  } else {
    document.getElementById('news-content').innerHTML = '<div class="loading">配信先を追加してください</div>';
  }
}

async function loadNewsContent(url) {
  currentNewsUrl = url;
  const container = document.getElementById('news-content');
  container.innerHTML = '<div class="loading">ニュースを読み込み中...</div>';

  try {
    const items = await fetchAndParseRSS(url);
    
    // 非同期通信中に別のタブへ切り替えられた場合は描画をスキップ
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

// ----------------------------------------------------
// 3. Twitter タイムライン一括取得
// ----------------------------------------------------
function initTwitter() {
  loadAllTwitterContent();
}

async function loadAllTwitterContent() {
  const container = document.getElementById('twitter-content');
  
  if (twitterFeeds.length === 0) {
    container.innerHTML = '<div class="loading">アカウントが登録されていません。「+ 追加」から登録してください。</div>';
    return;
  }

  container.innerHTML = '<div class="loading">すべてのツイートを読み込み中...</div>';

  try {
    const fetchPromises = twitterFeeds.map(async (feed) => {
      try {
        const items = await fetchAndParseRSS(feed.url);
        return items.map(item => ({
          ...item,
          accountName: feed.name
        }));
      } catch (err) {
        console.error(`Failed to fetch feed for ${feed.name}:`, err);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    let allTweets = results.flat();

    if (allTweets.length === 0) {
      container.innerHTML = '<div class="loading">ツイートを取得できませんでした</div>';
      return;
    }

    allTweets.sort((a, b) => b.pubDate - a.pubDate);

    container.innerHTML = '';
    allTweets.forEach(item => {
      const tweetDiv = document.createElement('div');
      tweetDiv.className = 'tweet-item';
      
      const dateStr = item.pubDate instanceof Date && !isNaN(item.pubDate)
        ? item.pubDate.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';

      const author = item.author || item.accountName;

      tweetDiv.innerHTML = `
        <div class="tweet-header">
          <span class="tweet-account">👤 ${author}</span>
          <span class="tweet-time">${dateStr}</span>
        </div>
        <div class="tweet-body">${item.description}</div>
      `;
      container.appendChild(tweetDiv);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="loading">ツイートの取得中にエラーが発生しました</div>';
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
      <input type="text" id="input-name" placeholder="配信先（例: Yahoo!ニュース）">
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
