// ========================================
// ショート動画プレイヤー機能
// ========================================

const ShortVideoState = {
  newsVideos: [],
  knowledgeVideos: [],
  currentTab: 'news',
  currentVideoIndex: 0,
  currentFeedIndex: 0,
  isGenerating: false,
  isPlayerOpen: false,
  touchStartX: 0,
  touchStartY: 0,
  touchEndX: 0,
  touchEndY: 0,
  touchStartTime: 0
};

// DOMContentLoaded後に初期化
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initShortVideoPlayer();
  }, 500);
});

async function initShortVideoPlayer() {
  // ニュース・知識セクションのボタンを追加
  addShortVideoButtons('news', newsFeeds);
  addShortVideoButtons('knowledge', knowledgeFeeds);
  console.log('✓ ショート動画プレイヤー初期化完了');
}

function addShortVideoButtons(type, feeds) {
  const sectionId = type === 'news' ? 'news-section' : 'knowledge-section';
  const section = document.getElementById(sectionId);
  
  if (!section) return;

  const header = section.querySelector('.section-header .action-buttons');
  if (!header) return;

  // 既に追加済みならスキップ
  if (document.getElementById(`${type}-short-video-btn`)) return;

  const btn = document.createElement('button');
  btn.id = `${type}-short-video-btn`;
  btn.className = 'btn primary';
  btn.innerHTML = '🎬 ショート';
  btn.style.cssText = 'margin-left: 8px; padding: 6px 12px; font-size: 12px;';
  btn.onclick = () => {
    ShortVideoState.currentTab = type;
    ShortVideoState.currentFeedIndex = 0;
    ShortVideoState.currentVideoIndex = 0;
    openShortVideoPlayer();
  };

  header.appendChild(btn);
}

function createShortVideoPlayerModal() {
  if (document.getElementById('short-video-player-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'short-video-player-modal';
  modal.className = 'short-video-player-modal hidden';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    background: #000;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    padding: max(env(safe-area-inset-top), 8px) 
             max(env(safe-area-inset-right), 8px)
             max(env(safe-area-inset-bottom), 8px)
             max(env(safe-area-inset-left), 8px);
  `;

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; color: #fff; margin-bottom: 12px;">
      <div style="flex: 1; text-align: center;">
        <div id="current-feed-info" style="font-size: 14px; font-weight: bold;">ニュース</div>
      </div>
      <button class="short-video-close-btn" onclick="closeShortVideoPlayer()" 
              style="background: none; border: none; color: #fff; font-size: 24px; cursor: pointer;">✕</button>
    </div>
    
    <div class="short-video-scroll-container" id="video-scroll-container" 
         style="flex: 1; overflow-y: scroll; scroll-snap-type: y mandatory; -webkit-overflow-scrolling: touch;">
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center; color: #fff; margin-top: 12px; gap: 8px;">
      <button class="tab-switch-btn" onclick="switchFeed(-1)" 
              style="background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 8px 12px; border-radius: 6px; cursor: pointer;">◀ 前</button>
      <div style="text-align: center; flex: 1;">
        <span id="current-video-num" style="font-weight: bold;">1</span> / 
        <span id="total-video-num">0</span>
      </div>
      <button class="tab-switch-btn" onclick="switchFeed(1)" 
              style="background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 8px 12px; border-radius: 6px; cursor: pointer;">次 ▶</button>
    </div>
  `;

  document.body.appendChild(modal);
}

function openShortVideoPlayer() {
  let modal = document.getElementById('short-video-player-modal');
  
  if (!modal) {
    createShortVideoPlayerModal();
    modal = document.getElementById('short-video-player-modal');
  }
  
  modal.classList.remove('hidden');
  modal.classList.add('active');
  ShortVideoState.isPlayerOpen = true;
  
  // iOSスクロール対応
  document.body.style.overflow = 'hidden';
  
  loadCurrentVideo();
  setupTouchHandlers();
}

function closeShortVideoPlayer() {
  const modal = document.getElementById('short-video-player-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('active');
  }
  ShortVideoState.isPlayerOpen = false;
  document.body.style.overflow = '';
}

async function loadCurrentVideo() {
  const feeds = ShortVideoState.currentTab === 'news' 
    ? newsFeeds
    : knowledgeFeeds;
  
  const videoArrayKey = ShortVideoState.currentTab === 'news' 
    ? 'newsVideos' 
    : 'knowledgeVideos';

  if (feeds.length === 0) {
    alert('フィードを追加してください');
    return;
  }

  ShortVideoState.isGenerating = true;

  try {
    const feedUrl = feeds[ShortVideoState.currentFeedIndex].url;
    const feedName = feeds[ShortVideoState.currentFeedIndex].name;
    
    const items = await fetchNewsRSS(feedUrl);
    
    if (items.length === 0) {
      alert('記事がありません');
      return;
    }

    const batch = items.slice(0, 10).map(item => ({
      title: item.title,
      content: item.description || item.title,
      feedName: feedName
    }));

    const response = await fetch('/api/generate-shorts-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: batch,
        source: ShortVideoState.currentTab
      })
    });

    if (!response.ok) throw new Error('生成エラー');

    const data = await response.json();
    
    if (data.success) {
      ShortVideoState[videoArrayKey] = data.videoDataList;
      ShortVideoState.currentVideoIndex = 0;
      renderVideoCards();
      updateIndicator();
      updateFeedInfo();
    }

  } catch (error) {
    console.error('エラー:', error);
    alert('動画生成に失敗しました');
  } finally {
    ShortVideoState.isGenerating = false;
  }
}

function renderVideoCards() {
  const container = document.getElementById('video-scroll-container');
  const videoArrayKey = ShortVideoState.currentTab === 'news' 
    ? 'newsVideos' 
    : 'knowledgeVideos';
  const videos = ShortVideoState[videoArrayKey];

  container.innerHTML = '';

  videos.forEach((video, idx) => {
    const card = document.createElement('div');
    card.className = 'short-video-card';
    card.style.cssText = `
      width: 100%;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-image: url('data:image/svg+xml;base64,${video.thumbnailBase64}');
      background-size: cover;
      background-position: center;
      scroll-snap-align: start;
      scroll-snap-stop: always;
      position: relative;
    `;
    
    card.innerHTML = `
      <div class="short-video-card-overlay" style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: max(env(safe-area-inset-top), 16px) 16px max(env(safe-area-inset-bottom), 16px) 16px;
        color: #fff;
      ">
        <div class="short-video-content" style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div class="short-video-icon" style="font-size: 48px; margin-bottom: 12px;">${video.icon}</div>
          <h3 class="short-video-title" style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0; line-height: 1.3; word-break: break-word;">
            ${video.title}
          </h3>
          <p class="short-video-feed-name" style="font-size: 12px; opacity: 0.8; margin: 0;">${video.feedName}</p>
        </div>
        <button class="short-video-play-btn" onclick="playVideoAtIndex(${idx})" style="
          background: rgba(255,255,255,0.2);
          border: 2px solid #fff;
          color: #fff;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          font-weight: bold;
          backdrop-filter: blur(4px);
        ">
          ▶ 再生
        </button>
      </div>
    `;
    
    container.appendChild(card);
  });

  document.getElementById('total-video-num').textContent = videos.length;
}

function playVideoAtIndex(idx) {
  ShortVideoState.currentVideoIndex = idx;
  playCurrentVideo();
}

function playCurrentVideo() {
  const videoArrayKey = ShortVideoState.currentTab === 'news' 
    ? 'newsVideos' 
    : 'knowledgeVideos';
  const videos = ShortVideoState[videoArrayKey];
  const video = videos[ShortVideoState.currentVideoIndex];

  if (!video) return;

  const container = document.getElementById('video-scroll-container');
  container.classList.add('video-player-mode');
  
  showVideoPlayer(video);
}

function showVideoPlayer(videoData) {
  const container = document.getElementById('video-scroll-container');
  
  container.innerHTML = `
    <div class="video-player-wrapper" style="
      width: 100%;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: #000;
    ">
      <div class="video-player" style="
        width: 100%;
        height: 100%;
        background-image: url('data:image/svg+xml;base64,${videoData.thumbnailBase64}');
        background-size: cover;
        background-position: center;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div class="video-overlay" style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #fff;
          padding: 16px;
          text-align: center;
        ">
          <div class="video-icon" style="font-size: 64px; margin-bottom: 16px;">${videoData.icon}</div>
          <h2 class="video-title" style="font-size: 28px; font-weight: bold; margin: 0 0 12px 0; line-height: 1.3; word-break: break-word;">
            ${videoData.title}
          </h2>
          <p class="video-text" style="font-size: 14px; line-height: 1.6; opacity: 0.9; margin: 0;">
            ${videoData.voiceOverText}
          </p>
        </div>
        <button onclick="closeVideoPlayer()" style="
          position: absolute;
          top: max(env(safe-area-inset-top), 12px);
          right: max(env(safe-area-inset-right), 12px);
          background: rgba(0,0,0,0.5);
          border: none;
          color: #fff;
          font-size: 24px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        ">✕</button>
      </div>
    </div>
  `;

  updateIndicator();
}

function closeVideoPlayer() {
  const container = document.getElementById('video-scroll-container');
  container.classList.remove('video-player-mode');
  renderVideoCards();
}

function goToPrevVideo() {
  const videoArrayKey = ShortVideoState.currentTab === 'news' 
    ? 'newsVideos' 
    : 'knowledgeVideos';
  const videos = ShortVideoState[videoArrayKey];

  ShortVideoState.currentVideoIndex = Math.max(0, ShortVideoState.currentVideoIndex - 1);
  
  if (ShortVideoState.currentVideoIndex >= 0 && ShortVideoState.currentVideoIndex < videos.length) {
    showVideoPlayer(videos[ShortVideoState.currentVideoIndex]);
  }
}

function goToNextVideo() {
  const videoArrayKey = ShortVideoState.currentTab === 'news' 
    ? 'newsVideos' 
    : 'knowledgeVideos';
  const videos = ShortVideoState[videoArrayKey];

  ShortVideoState.currentVideoIndex = Math.min(videos.length - 1, ShortVideoState.currentVideoIndex + 1);
  
  if (ShortVideoState.currentVideoIndex >= 0 && ShortVideoState.currentVideoIndex < videos.length) {
    showVideoPlayer(videos[ShortVideoState.currentVideoIndex]);
  }
}

function switchFeed(direction) {
  const feeds = ShortVideoState.currentTab === 'news' 
    ? newsFeeds
    : knowledgeFeeds;

  if (feeds.length === 0) return;

  ShortVideoState.currentFeedIndex = (ShortVideoState.currentFeedIndex + direction + feeds.length) % feeds.length;
  ShortVideoState.currentVideoIndex = 0;
  
  updateFeedInfo();
  loadCurrentVideo();
}

function updateFeedInfo() {
  const feeds = ShortVideoState.currentTab === 'news' 
    ? newsFeeds
    : knowledgeFeeds;

  const feedInfo = document.getElementById('current-feed-info');
  if (feeds.length > 0 && feedInfo) {
    feedInfo.textContent = feeds[ShortVideoState.currentFeedIndex].name;
  }
}

function updateIndicator() {
  const videoArrayKey = ShortVideoState.currentTab === 'news' 
    ? 'newsVideos' 
    : 'knowledgeVideos';
  const videos = ShortVideoState[videoArrayKey];

  const numElem = document.getElementById('current-video-num');
  const totalElem = document.getElementById('total-video-num');
  
  if (numElem) numElem.textContent = ShortVideoState.currentVideoIndex + 1;
  if (totalElem) totalElem.textContent = videos.length;
}

function setupTouchHandlers() {
  const container = document.getElementById('video-scroll-container');
  if (!container) return;

  container.addEventListener('touchstart', handleTouchStart, false);
  container.addEventListener('touchend', handleTouchEnd, false);
}

function handleTouchStart(e) {
  ShortVideoState.touchStartX = e.changedTouches[0].clientX;
  ShortVideoState.touchStartY = e.changedTouches[0].clientY;
  ShortVideoState.touchStartTime = Date.now();
}

function handleTouchEnd(e) {
  ShortVideoState.touchEndX = e.changedTouches[0].clientX;
  ShortVideoState.touchEndY = e.changedTouches[0].clientY;

  detectSwipe();
}

function detectSwipe() {
  const deltaX = ShortVideoState.touchEndX - ShortVideoState.touchStartX;
  const deltaY = ShortVideoState.touchEndY - ShortVideoState.touchStartY;
  const deltaTime = Date.now() - ShortVideoState.touchStartTime;
  
  const threshold = 50;
  const maxTime = 500;

  if (deltaTime > maxTime) return;

  const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
  const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

  if (isVertical && Math.abs(deltaY) > threshold) {
    if (deltaY < -threshold) {
      goToNextVideo();
    } else if (deltaY > threshold) {
      goToPrevVideo();
    }
  } else if (isHorizontal && Math.abs(deltaX) > threshold) {
    if (deltaX < -threshold) {
      switchFeed(1);
    } else if (deltaX > threshold) {
      switchFeed(-1);
    }
  }
}
