<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>ダッシュボード</title>
  
  <!-- PWA & iOS 設定 -->
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#f2f2f7">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="ダッシュボード">
  <link rel="apple-touch-icon" href="icons/icon-192.png">

  <link rel="stylesheet" href="style.css">
</head>
<body>

  <main>
    <!-- 1. 今日の天気 -->
    <section class="card" id="weather-section">
      <div class="section-header">
        <h2>天気</h2>
        <div class="action-buttons">
          <button id="add-weather-btn" class="btn primary">追加</button>
          <button id="del-weather-btn" class="btn warning">編集</button>
        </div>
      </div>
      <div id="weather-container" class="horizontal-scroll">
        <div class="loading">天気データを読み込み中...</div>
      </div>
    </section>

    <!-- 2. 今日のニュース -->
    <section class="card" id="news-section">
      <div class="section-header">
        <h2>ニュース</h2>
        <div class="action-buttons">
          <!-- 動画生成・視聴ボタンを追加 -->
          <button id="news-video-gen-btn" class="btn primary" title="ショート動画で視聴">
            <img src="icons/video-play.png" alt="動画" style="width:16px; height:16px; vertical-align:middle;"> 動画
          </button>
          <button id="add-news-btn" class="btn primary">追加</button>
          <button id="del-news-btn" class="btn warning">編集</button>
        </div>
      </div>
      <div id="news-tabs" class="tab-container horizontal-scroll"></div>
      <div id="news-content" class="vertical-scroll">
        <div class="loading">ニュースを選択してください</div>
      </div>
    </section>

    <!-- 3. 知識 -->
    <section class="card" id="knowledge-section">
      <div class="section-header">
        <h2>知識</h2>
        <div class="action-buttons">
          <!-- 動画生成・視聴ボタンを追加 -->
          <button id="knowledge-video-gen-btn" class="btn primary" title="ショート動画で視聴">
            <img src="icons/video-play.png" alt="動画" style="width:16px; height:16px; vertical-align:middle;"> 動画
          </button>
          <button id="add-knowledge-btn" class="btn primary">追加</button>
          <button id="del-knowledge-btn" class="btn warning">編集</button>
        </div>
      </div>
      <div id="knowledge-tabs" class="tab-container horizontal-scroll"></div>
      <div id="knowledge-content" class="vertical-scroll">
        <div class="loading">知識データを選択してください</div>
      </div>
    </section>

    <!-- 4. Twitter -->
    <section class="card" id="twitter-section">
      <div class="section-header">
        <h2>Twitter</h2>
        <div class="action-buttons">
          <button id="add-twitter-btn" class="btn primary">追加</button>
          <button id="del-twitter-btn" class="btn warning">編集</button>
        </div>
      </div>
      <div id="twitter-content" class="vertical-scroll"></div>
    </section>

    <!-- 5. YouTube -->
    <section class="card" id="youtube-section">
      <div class="section-header">
        <h2>YouTube</h2>
        <div class="action-buttons">
          <button id="add-youtube-btn" class="btn primary">追加</button>
          <button id="del-youtube-btn" class="btn warning">編集</button>
        </div>
      </div>
      <div id="youtube-content" class="vertical-scroll">
        <div class="loading">配信先を追加してください。</div>
      </div>
    </section>
  </main>

  <!-- 縦型ショート動画スワイププレイヤー用モーダル -->
  <div id="shorts-player-modal" class="modal hidden" style="background: #000; padding: 0;">
    <div id="shorts-container" class="shorts-container">
      <!-- 動的にショート動画スライドが挿入されます -->
    </div>
    <button id="close-shorts-modal" class="btn" style="position: absolute; top: env(safe-area-inset-top, 16px); right: 16px; z-index: 10000; background: rgba(0,0,0,0.6); color: #fff; border-radius: 50%; width: 40px; height: 40px; border: none; font-size: 18px;">✕</button>
  </div>

  <!-- 汎用モーダルダイアログ -->
  <div id="modal" class="modal hidden">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="modal-title">項目を追加</h3>
      </div>
      <div id="modal-body"></div>
      <div class="modal-actions">
        <button id="modal-cancel-btn" class="btn">キャンセル</button>
        <button id="modal-submit-btn" class="btn primary">保存</button>
      </div>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
