const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI"; // あなたのAPIキー
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";


// ==================================================
// 🎬 最新の横動画 ＆ 最新ショート
// ==================================================

async function fetchLatestVideos() {
  let normalVideo = null;
  let shortsVideo = null;
  let normalTitle = "";
  let shortsTitle = "";

  let pageToken = "";
  let tryCount = 0;
  const maxTries = 5;

  try {
    while ((!normalVideo || !shortsVideo) && tryCount < maxTries) {
      tryCount++;

      let searchUrl =
        `https://www.googleapis.com/youtube/v3/search` +
        `?key=${API_KEY}` +
        `&channelId=${CHANNEL_ID}` +
        `&part=id` +
        `&order=date` +
        `&maxResults=50` +
        `&type=video`;

      if (pageToken) {
        searchUrl += `&pageToken=${pageToken}`;
      }

      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (!searchData.items || searchData.items.length === 0) {
        break;
      }

      const videoIds =
        searchData.items.map(item => item.id.videoId).join(",");

      pageToken = searchData.nextPageToken || "";

      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos` +
        `?key=${API_KEY}` +
        `&id=${videoIds}` +
        `&part=snippet`
      );

      const videoData = await videoRes.json();

      if (!videoData.items) {
        break;
      }

      for (const item of videoData.items) {
        const id = item.id;
        const title = item.snippet.title || "";

        // Shorts判定
        const isShorts =
          title.includes("#shorts") ||
          title.toLowerCase().includes("shorts");

        if (isShorts && !shortsVideo) {
          shortsVideo = id;
          shortsTitle = title;
        }

        if (!isShorts && !normalVideo) {
          normalVideo = id;
          normalTitle = title;
        }

        if (shortsVideo && normalVideo) {
          break;
        }
      }

      if (!pageToken) {
        break;
      }
    }

  } catch (err) {
    console.error("最新動画取得エラー:", err);
  }


  // 🎬 横動画
  const latestVideo =
    document.getElementById("latest-video");

  if (latestVideo) {
    latestVideo.innerHTML = normalVideo
      ? `
        <div class="video-card">
          <iframe
            src="https://www.youtube.com/embed/${normalVideo}"
            title="${normalTitle}"
            allowfullscreen>
          </iframe>

          <p>${normalTitle}</p>
        </div>
      `
      : `<p>動画が見つかりません</p>`;
  }


  // 📱 Shorts
  const latestShorts =
    document.getElementById("latest-shorts");

  if (latestShorts) {
    latestShorts.innerHTML = shortsVideo
      ? `
        <div class="video-card shorts">
          <iframe
            src="https://www.youtube.com/embed/${shortsVideo}"
            title="${shortsTitle}"
            allowfullscreen>
          </iframe>

          <p>${shortsTitle}</p>
        </div>
      `
      : `<p>ショートが見つかりません</p>`;
  }
}

// ==================================================
// 🎵 オリジナル曲
// ==================================================

async function fetchOriginalSongs() {
  const container = document.getElementById("original-songs");
  if (!container) return;

  let originalVideos = [];
  let pageToken = "";
  let tryCount = 0;
  const maxTries = 5; // 必要なら増やす

  try {
    while (originalVideos.length < 5 && tryCount < maxTries) {
      tryCount++;

      let searchUrl =
        `https://www.googleapis.com/youtube/v3/search` +
        `?key=${API_KEY}` +
        `&channelId=${CHANNEL_ID}` +
        `&part=snippet,id` +
        `&order=date` +
        `&maxResults=50` +
        `&type=video` +
        `&q=${encodeURIComponent("オリジナル曲")}`;  // ← ここが重要！

      if (pageToken) {
        searchUrl += `&pageToken=${pageToken}`;
      }

      const res = await fetch(searchUrl);
      const data = await res.json();

      // エラーチェック（クォータ切れ・キー不正など）
      if (data.error) {
        console.error("YouTube API Error:", data.error);
        container.innerHTML = `<p>APIエラー: ${data.error.message}</p>`;
        return;
      }

      if (!data.items || data.items.length === 0) break;

      for (const item of data.items) {
        const title = (item.snippet?.title || "").normalize("NFC"); // 正規化
        const id = item.id?.videoId;

        if (!id) continue;

        // より緩く「オリジナル」を含むものにする（必要に応じて調整）
        if (title.includes("オリジナル曲") || title.includes("オリジナル")) {
          const alreadyExists = originalVideos.some(v => v.id === id);
          if (!alreadyExists) {
            originalVideos.push({ id, title });
          }
        }

        if (originalVideos.length >= 5) break;
      }

      pageToken = data.nextPageToken || "";
      if (!pageToken) break;
    }

    if (originalVideos.length === 0) {
      container.innerHTML = "<p>オリジナル曲が見つかりませんでした</p>";
      return;
    }

    // 表示
    container.innerHTML = originalVideos.map(video => `
      <div class="song-slide">
        <iframe
          src="https://www.youtube.com/embed/${video.id}"
          title="${video.title}"
          allowfullscreen>
        </iframe>
        <p>${video.title}</p>
      </div>
    `).join("");

  } catch (err) {
    console.error("オリジナル曲取得エラー:", err);
    container.innerHTML = "<p>オリジナル曲を読み込めませんでした</p>";
  }
}

さらに確実にしたい場合（uploadsプレイリスト方式）Search APIより信頼性が高い方法です。js

// チャンネルIDの先頭UCをUUに変えるだけ
const UPLOADS_PLAYLIST_ID = CHANNEL_ID.replace(/^UC/, "UU");

// playlistItemsを使う
let url = `https://www.googleapis.com/youtube/v3/playlistItems` +
  `?key=${API_KEY}` +
  `&playlistId=${UPLOADS_PLAYLIST_ID}` +
  `&part=snippet` +
  `&maxResults=50`;


