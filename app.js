// --- JMA (気象庁API) 地域コード定義 & 地名マッピング表 ---
const JMA_PREF_CODES = {
  "宗谷地方": "11000", "上川・留萌地方": "12000", "石狩・空知・後志地方": "16000", "網走・北見・紋別地方": "13000",
  "釧路・根室地方、十勝地方": "14100", "胆振・日高地方": "15000", "渡島・檜山地方": "17000", "青森県": "20000",
  "秋田県": "50000", "岩手県": "30000", "宮城県": "40000", "山形県": "60000", "福島県": "70000",
  "茨城県": "80000", "栃木県": "90000", "群馬県": "100000", "埼玉県": "110000", "東京都": "130000",
  "千葉県": "120000", "神奈川県": "140000", "長野県": "200000", "山梨県": "190000", "静岡県": "220000",
  "愛知県": "230000", "岐阜県": "210000", "三重県": "240000", "新潟県": "150000", "富山県": "160000",
  "石川県": "170000", "福井県": "180000", "滋賀県": "250000", "京都府": "260000", "大阪府": "270000",
  "兵庫県": "280000", "奈良県": "290000", "和歌山県": "300000", "岡山県": "330000", "広島県": "340000",
  "島根県": "320000", "鳥取県": "310000", "徳島県": "360000", "香川県": "370000", "愛媛県": "380000",
  "高知県": "390000", "山口県": "350000", "福岡県": "400000", "大分県": "440000", "長崎県": "420000",
  "佐賀県": "410000", "熊本県": "430000", "宮崎県": "450000", "鹿児島県、奄美地方": "460100",
  "沖縄本島地方": "471000", "大東島地方": "472000", "宮古島地方": "473000", "八重山地方": "474000"
};

const ALL_PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

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
    try { return JSON.parse(stored); } catch (e) { }
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
let currentNewsItems = []; // ショート動画連携用キャッシュ

document.addEventListener('DOMContentLoaded', () => {
  initWeatherUI();
  initNews();
  initKnowledge();
  initTwitter();
  initYoutube();
  initShortsPlayerUI();
  registerSW();
});

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
  }
}

async function fetchNewsRSS(feedUrl) {
  const apiUrl = `/api/rss?url=${encodeURIComponent(feedUrl)}`;
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('RSS取得エラー');
  const xmlText = await response.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  if (xmlDoc.querySelector('parsererror')) throw new Error('XMLパースエラー');

  let items = Array.from(xmlDoc.querySelectorAll('item, entry, アイテム'));
  return items.map(item => {
    const title = item.querySelector('title')?.textContent?.trim() || '無題';
    const link = item.querySelector('link')?.textContent?.trim() || item.querySelector('link')?.getAttribute('href') || '';
    const pubDateRaw = item.querySelector('pubDate, date, published, updated')?.textContent?.trim() || '';
    const description = item.querySelector('description, content, encoded')?.textContent?.trim() || title;
    return { title, link, pubDate: new Date(pubDateRaw || Date.now()), description };
  });
}

function formatCustomDate(dateObj) {
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '';
  const today = new Date();
  const isToday = dateObj.toDateString() === today.toDateString();
  const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  return isToday ? timeStr : `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${timeStr}`;
}

// --- ニュース機能 & ショート動画連携 ---
function initNews() {
  renderTabs('news-tabs', newsFeeds, loadNewsContent);
  if (newsFeeds.length > 0) loadNewsContent(newsFeeds[0].url);
  
  // 動画プレイヤー起動ボタンのイベント紐付け
  const videoBtn = document.getElementById('news-video-player-btn');
  if (videoBtn) {
    videoBtn.onclick = () => openShortsModal(currentNewsItems);
  }
}

function renderTabs(containerId, feeds, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  feeds.forEach((feed, idx) => {
    const btn = document.createElement('button');
    btn.className = `btn ${idx === 0 ? 'primary' : ''}`;
    btn.style.whiteSpace = 'nowrap';
    btn.textContent = feed.name;
    btn.onclick = () => {
      container.querySelectorAll('.btn').forEach(b => b.classList.remove('primary'));
      btn.classList.add('primary');
      callback(feed.url);
    };
    container.appendChild(btn);
  });
}

async function loadNewsContent(url) {
  currentNewsUrl = url;
  const container = document.getElementById('news-content');
  if (!container) return;
  container.innerHTML = '<div class="loading">ニュースを読み込み中...</div>';

  try {
    const items = await fetchNewsRSS(url);
    if (currentNewsUrl !== url) return;
    currentNewsItems = items; // 保持
    container.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'news-item';
      div.innerHTML = `
        <a href="${item.link}" target="_blank" rel="noopener" class="news-link">${item.title}</a>
        <div class="news-time">${formatCustomDate(item.pubDate)}</div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = '<div class="loading">ニュースの取得に失敗しました</div>';
  }
}

// --- ショート動画機能（TikTok風UI・音声同期・スワイプ制御） ---
function initShortsPlayerUI() {
  const closeBtn = document.getElementById('shorts-close-btn');
  const modal = document.getElementById('shorts-modal');
  if (closeBtn && modal) {
    closeBtn.onclick = () => {
      modal.classList.add('hidden');
      stopAllShortsAudio();
    };
  }

  // 左右スワイプ（タブ切り替え）と上下スワイプの競合防止用 Hammer.js 設定
  const modalElem = document.getElementById('shorts-modal');
  if (modalElem && typeof Hammer !== 'undefined') {
    const hammerManager = new Hammer(modalElem);
    hammerManager.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    
    hammerManager.on('swiperight', () => {
      switchNewsTabRelative(-1); // 前のタブへ
    });
    hammerManager.on('swipeleft', () => {
      switchNewsTabRelative(1); // 次のタブへ
    });
  }
}

let activeAudioElement = null;
function stopAllShortsAudio() {
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement = null;
  }
}

async function openShortsModal(items) {
  const modal = document.getElementById('shorts-modal');
  const container = document.getElementById('shorts-container');
  if (!modal || !container) return;

  if (!items || items.length === 0) {
    alert("再生するニュースがありません。");
    return;
  }

  container.innerHTML = '<div class="loading">ショート動画を生成・読み込み中...</div>';
  modal.classList.remove('hidden');

  try {
    // バックエンドへニュース一覧を渡し、生成済みJSON（音声・画像・テロップ等）を取得
    const res = await fetch('/api/shorts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items.slice(0, 10) }) // 上位10件
    });
    
    if (!res.ok) throw new Error('ショート動画データの生成に失敗しました');
    const shortsData = await res.json(); // [{ title, pubDate, image_url, audio_url, telop }]

    container.innerHTML = '';

    shortsData.forEach((data, index) => {
      const slide = document.createElement('div');
      slide.className = 'short-slide';
      slide.innerHTML = `
        <img src="${data.image_url || 'placeholder.jpg'}" alt="背景画像">
        <div class="short-overlay">
          <div class="short-date">${formatCustomDate(new Date(data.pubDate))}</div>
          <div class="short-title">${data.title}</div>
          <div class="short-telop">${data.telop}</div>
        </div>
        <audio src="${data.audio_url}" preload="auto" playsinline></audio>
      `;

      slide.onclick = () => {
        const audio = slide.querySelector('audio');
        if (audio.paused) {
          stopAllShortsAudio();
          audio.play();
          activeAudioElement = audio;
        } else {
          audio.pause();
          activeAudioElement = null;
        }
      };

      // 最後まで再生したら自動的に次のスライドへ遷移
      const audio = slide.querySelector('audio');
      audio.onended = () => {
        const nextSlide = container.children[index + 1];
        if (nextSlide) {
          nextSlide.scrollIntoView({ behavior: 'smooth' });
          const nextAudio = nextSlide.querySelector('audio');
          if (nextAudio) {
            stopAllShortsAudio();
            nextAudio.play();
            activeAudioElement = nextAudio;
          }
        }
      };

      container.appendChild(slide);
    });

    // Intersection Observer APIによる自動再生/停止制御
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const audio = entry.target.querySelector('audio');
        if (!audio) return;
        if (entry.isIntersecting) {
          stopAllShortsAudio();
          // iOS Autoplay制限対策: 初回はユーザー操作（ボタンクリック）モーダルオープン経由のため再生可能
          audio.play().then(() => {
            activeAudioElement = audio;
          }).catch(e => console.log("Autoplay blocked, waiting for tap", e));
        } else {
          audio.pause();
          if (activeAudioElement === audio) activeAudioElement = null;
        }
      });
    }, { threshold: 0.7 });

    container.querySelectorAll('.short-slide').forEach(slide => observer.observe(slide));

  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="loading" style="color:red;">ショート動画の読み込みにエラーが発生しました</div>';
  }
}

function switchNewsTabRelative(direction) {
  const currentIndex = newsFeeds.findIndex(f => f.url === currentNewsUrl);
  const newIndex = currentIndex + direction;
  if (newIndex >= 0 && newIndex < newsFeeds.length) {
    const targetFeed = newsFeeds[newIndex];
    currentNewsUrl = targetFeed.url;
    stopAllShortsAudio();
    
    // タブの選択状態を更新して再読み込み＆ショート動画の再構築
    fetchNewsRSS(targetFeed.url).then(items => {
      currentNewsItems = items;
      openShortsModal(items); // 隣のタブの1番上の動画から自動再生開始
    });
  }
}

// --- 知識・Twitter・YouTube・天気の既存ヘルパー関数等 ---
function initKnowledge() { renderTabs('knowledge-tabs', knowledgeFeeds, loadKnowledgeContent); if (knowledgeFeeds.length > 0) loadKnowledgeContent(knowledgeFeeds[0].url); }
async function loadKnowledgeContent(url) { currentKnowledgeUrl = url; try { await fetchNewsRSS(url); } catch(e){} }
function initWeatherUI() { renderWeatherTabs(); renderWeatherData(); }
function renderWeatherTabs() {}
async function renderWeatherData() {}
function initTwitter() {}
function initYoutube() {}
