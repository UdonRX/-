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

const DEFAULT_KNOWLEDGE = [
  { name: "Qiita", url: "https://qiita.com/tags/javascript/feed.atom" },
  { name: "GIGAZINE", url: "https://gigazine.net/news/rss_2.0/" }
];

const DEFAULT_TWITTER = [];

// localStorage 管理
let newsFeeds = JSON.parse(localStorage.getItem('newsFeeds')) || DEFAULT_NEWS;
let knowledgeFeeds = JSON.parse(localStorage.getItem('knowledgeFeeds')) || DEFAULT_KNOWLEDGE;
let twitterFeeds = JSON.parse(localStorage.getItem('twitterFeeds')) || DEFAULT_TWITTER;

// 通信競合防止用のフラグ
let currentNewsUrl = '';
let currentKnowledgeUrl = '';

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
  initWeather();
  initNews();
  initKnowledge();
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
// ニュース・知識用：/api/rss を経由してXMLを取得・解析する関数
// ----------------------------------------------------
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
      if (elem && elem.textContent) {
        return elem.textContent.trim();
      }
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

    const pubDateRaw = getTagText(item, [
      'pubDate', 'date', 'published', 'updated', 
      '公開日時', '投稿日時', '日付', '発行日時'
    ]);

    const description = getTagText(item, [
      'description', 'content', 'encoded', 
      '詳細', '概要', '内容', '本文'
    ]);

    const author = getTagText(item, [
      'creator', 'dc\\:creator', 'author name', 'author', 
      '製作者', '投稿者', '作者'
    ]);

    return {
      title,
      link,
      pubDate: parseCustomDate(pubDateRaw),
      description: description || title,
      author
    };
  });
}

// ----------------------------------------------------
// Twitter用：rss2json.com を経由して取得する関数
// ----------------------------------------------------
async function fetchTwitterRSS(feedUrl) {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
  
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('Twitter RSS取得エラー');
  
  const data = await response.json();
  if (data.status !== 'ok' || !Array.isArray(data.items)) {
    throw new Error('Twitter RSS解析エラー');
  }

  const feedTitle = data.feed ? data.feed.title : '';

  return data.items.map(item => {
    let parsedDate = new Date(item.pubDate);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date();
    }

    return {
      title: item.title || '無題',
      link: item.link || '',
      pubDate: parsedDate,
      description: item.description || item.content || item.title || '',
      author: item.author || feedTitle,
      feedTitle: feedTitle
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
// 2. 今日のニュース ( /api/rss を使用 )
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

// ----------------------------------------------------
// 3. 知識 ( /api/rss を使用 )
// ----------------------------------------------------
function initKnowledge() {
  renderTabs('knowledge-tabs', knowledgeFeeds, loadKnowledgeContent);
  if (knowledgeFeeds.length > 0) {
    loadKnowledgeContent(knowledgeFeeds[0].url);
  } else {
    document.getElementById('knowledge-content').innerHTML = '<div class="loading">配信先を追加してください</div>';
  }
}

async function loadKnowledgeContent(url) {
  currentKnowledgeUrl = url;
  const container = document.getElementById('knowledge-content');
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

// ----------------------------------------------------
// 4. Twitter タイムライン一括取得 ( rss2json.com を使用 )
// ----------------------------------------------------
function initTwitter() {
  loadAllTwitterContent();
}

function extractUsername(rawText) {
  if (!rawText) return '無題';
  let cleaned = rawText.split(/[\(@\/]/)[0].trim();
  return cleaned || rawText;
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
        const items = await fetchTwitterRSS(feed.url);
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

      const rawTitle = item.feedTitle || item.author || item.title;
      const author = extractUsername(rawTitle);

      let cleanDescription = item.description
        .replace(/<hr\s*\/?>/gi, '')
        .replace(/<b>\s*(リンク|Link)\s*<\/b>/gi, '')
        .replace(/(リンク|Link)<br\s*\/?>/gi, '');

      tweetDiv.innerHTML = `
        <div class="tweet-header">
          <span class="tweet-account">${author}</span>
          <span class="tweet-time">${dateStr}</span>
        </div>
        <div class="tweet-body">${cleanDescription}</div>
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
// モーダル管理（複数動的追加・並べ替え・削除機能）
// ----------------------------------------------------
function initModals() {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const submitBtn = document.getElementById('modal-submit-btn');

  const cleanupExtraButtons = () => {
    const extraBtn = document.getElementById('modal-nitter-btn');
    if (extraBtn) extraBtn.remove();
    const addRowBtn = document.getElementById('modal-add-row-btn');
    if (addRowBtn) addRowBtn.remove();
  };

  const closeModal = () => {
    cleanupExtraButtons();
    modal.classList.add('hidden');
  };
  
  cancelBtn.onclick = closeModal;

  // 動的に入力行を生成する共通関数
  const createInputRow = (placeholderName, placeholderUrl) => {
    const row = document.createElement('div');
    row.className = 'modal-input-row';
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.marginBottom = '8px';
    row.style.alignItems = 'center';

    row.innerHTML = `
      <input type="text" class="input-name" placeholder="${placeholderName}" style="flex: 1;">
      <input type="url" class="input-url" placeholder="${placeholderUrl}" style="flex: 2;">
      <button class="btn danger remove-row-btn" style="padding: 4px 8px;">✕</button>
    `;

    // 個別削除ボタンの動作（最初の1行は削除不可にするためチェック）
    row.querySelector('.remove-row-btn').onclick = () => {
      if (modalBody.querySelectorAll('.modal-input-row').length > 1) {
        row.remove();
      }
    };

    return row;
  };

  // 複数追加フォームを初期化するセットアップ関数
  const setupMultiAddModal = (title, placeholderName, placeholderUrl, onSave) => {
    cleanupExtraButtons();
    modalTitle.textContent = title;
    modalBody.innerHTML = '';

    // 最初の1行目を追加
    modalBody.appendChild(createInputRow(placeholderName, placeholderUrl));

    // 「+ 行を追加」ボタンをモーダル下部（ボタン領域）に配置
    const addRowBtn = document.createElement('button');
    addRowBtn.id = 'modal-add-row-btn';
    addRowBtn.className = 'btn';
    addRowBtn.textContent = '+ 入力欄を追加';
    addRowBtn.style.marginRight = 'auto'; // 左寄せる
    addRowBtn.onclick = () => {
      modalBody.appendChild(createInputRow(placeholderName, placeholderUrl));
    };

    cancelBtn.parentNode.insertBefore(addRowBtn, cancelBtn);

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

  // 1. ニュース追加
  document.getElementById('add-news-btn').onclick = () => {
    setupMultiAddModal('ニュースRSSをまとめて追加', '配信先', 'RSS URL', (newItems) => {
      newsFeeds.push(...newItems);
      localStorage.setItem('newsFeeds', JSON.stringify(newsFeeds));
      initNews();
    });
  };

  // 2. ニュース管理（並べ替え・削除）
  document.getElementById('del-news-btn').onclick = () => {
    cleanupExtraButtons();
    modalTitle.textContent = 'ニュース配信先の管理';
    renderManageList(newsFeeds, (newFeeds) => {
      newsFeeds = newFeeds;
      localStorage.setItem('newsFeeds', JSON.stringify(newsFeeds));
      initNews();
    });
    submitBtn.onclick = closeModal;
    modal.classList.remove('hidden');
  };

  // 3. 知識追加
  document.getElementById('add-knowledge-btn').onclick = () => {
    setupMultiAddModal('知識RSSをまとめて追加', '配信先', 'RSS URL', (newItems) => {
      knowledgeFeeds.push(...newItems);
      localStorage.setItem('knowledgeFeeds', JSON.stringify(knowledgeFeeds));
      initKnowledge();
    });
  };

  // 4. 知識管理（並べ替え・削除）
  document.getElementById('del-knowledge-btn').onclick = () => {
    cleanupExtraButtons();
    modalTitle.textContent = '知識配信先の管理';
    renderManageList(knowledgeFeeds, (newFeeds) => {
      knowledgeFeeds = newFeeds;
      localStorage.setItem('knowledgeFeeds', JSON.stringify(knowledgeFeeds));
      initKnowledge();
    });
    submitBtn.onclick = closeModal;
    modal.classList.remove('hidden');
  };

  // 5. Twitter追加
  document.getElementById('add-twitter-btn').onclick = () => {
    setupMultiAddModal('Twitter RSSをまとめて追加', '配信先', 'Nitter RSS URL', (newItems) => {
      twitterFeeds.push(...newItems);
      localStorage.setItem('twitterFeeds', JSON.stringify(twitterFeeds));
      initTwitter();
    });

    // Twitter特有の Nitter ボタンを挿入
    const nitterBtn = document.createElement('button');
    nitterBtn.id = 'modal-nitter-btn';
    nitterBtn.className = 'btn';
    nitterBtn.style.marginRight = '8px';
    nitterBtn.textContent = 'Nitter';
    nitterBtn.onclick = () => {
      window.open('https://nitter.net', '_blank', 'noopener,noreferrer');
    };
    cancelBtn.parentNode.insertBefore(nitterBtn, cancelBtn.nextSibling);
  };

  // 6. Twitter管理（削除）
  document.getElementById('del-twitter-btn').onclick = () => {
    cleanupExtraButtons();
    modalTitle.textContent = 'Twitterアカウントの管理';
    renderManageList(twitterFeeds, (newFeeds) => {
      twitterFeeds = newFeeds;
      localStorage.setItem('twitterFeeds', JSON.stringify(twitterFeeds));
      initTwitter();
    });
    submitBtn.onclick = closeModal;
    modal.classList.remove('hidden');
  };
}
// 配信先の並べ替え・削除用リスト描画関数
function renderManageList(feeds, saveCallback) {
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = '';
  
  if (feeds.length === 0) {
    modalBody.innerHTML = '<div>登録されていません</div>';
    return;
  }

  feeds.forEach((feed, idx) => {
    const row = document.createElement('div');
    row.className = 'delete-list-item';
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'space-between';
    row.style.marginBottom = '8px';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = feed.name;
    nameSpan.style.flex = '1';

    const btnGroup = document.createElement('div');
    btnGroup.style.display = 'flex';
    btnGroup.style.gap = '4px';

    // 上へ移動ボタン
    const upBtn = document.createElement('button');
    upBtn.className = 'btn';
    upBtn.style.padding = '2px 8px';
    upBtn.textContent = '↑';
    upBtn.disabled = idx === 0; // 一番上は無効化
    upBtn.onclick = () => {
      const temp = feeds[idx];
      feeds[idx] = feeds[idx - 1];
      feeds[idx - 1] = temp;
      saveCallback(feeds);
      renderManageList(feeds, saveCallback);
    };

    // 下へ移動ボタン
    const downBtn = document.createElement('button');
    downBtn.className = 'btn';
    downBtn.style.padding = '2px 8px';
    downBtn.textContent = '↓';
    downBtn.disabled = idx === feeds.length - 1; // 一番下は無効化
    downBtn.onclick = () => {
      const temp = feeds[idx];
      feeds[idx] = feeds[idx + 1];
      feeds[idx + 1] = temp;
      saveCallback(feeds);
      renderManageList(feeds, saveCallback);
    };

    // 削除ボタン
    const delBtn = document.createElement('button');
    delBtn.className = 'btn danger';
    delBtn.style.padding = '2px 8px';
    delBtn.textContent = '削除';
    delBtn.onclick = () => {
      feeds.splice(idx, 1);
      saveCallback(feeds);
      renderManageList(feeds, saveCallback);
    };

    btnGroup.appendChild(upBtn);
    btnGroup.appendChild(downBtn);
    btnGroup.appendChild(delBtn);

    row.appendChild(nameSpan);
    row.appendChild(btnGroup);
    modalBody.appendChild(row);
  });
}
