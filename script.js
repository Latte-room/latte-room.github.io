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
// 「オリジナル曲」をタイトルに含む動画だけ取得
// ==================================================

async function fetchOriginalSongs() {
  const container = document.getElementById("original-songs");
  if (!container) return;

  let originalVideos = [];
  let pageToken = "";
  let tryCount = 0;
  const maxTries = 8;

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
        `&q=${encodeURIComponent("オリジナル曲")}`;

      if (pageToken) {
        searchUrl += `&pageToken=${pageToken}`;
      }

      const res = await fetch(searchUrl);
      const data = await res.json();

      if (data.error) {
        console.error("APIエラー:", data.error);
        break;
      }

      if (!data.items || data.items.length === 0) break;

      for (const item of data.items) {
        const rawTitle = item.snippet?.title || "";
        const title = rawTitle.normalize("NFC");
        const id = item.id?.videoId;

        if (!id) continue;

        const isShorts =
          title.includes("#shorts") ||
          title.toLowerCase().includes("shorts") ||
          title.includes("ショート");

        const isOriginal = title.includes("オリジナル曲");

        if (isOriginal && !isShorts) {
          const alreadyExists =
            originalVideos.some(v => v.id === id);

          if (!alreadyExists) {
            originalVideos.push({
              id: id,
              title: rawTitle
            });
          }
        }

        if (originalVideos.length >= 5) break;
      }

      pageToken = data.nextPageToken || "";

      if (!pageToken) break;
    }

    if (originalVideos.length === 0) {
      container.innerHTML =
        "<p>オリジナル曲が見つかりませんでした</p>";
      return;
    }

    // ==========================================
    // 🎵 オリジナル曲を中央に1本表示
    // ==========================================

    let currentIndex = 0;

    function showSong(index) {
  currentIndex = index;

  const video = originalVideos[currentIndex];

  container.innerHTML = `
    <div class="song-slider-wrapper">
      <button class="song-arrow song-prev" aria-label="前の曲">‹</button>

      <div class="video-card">
        <iframe
          src="https://www.youtube.com/embed/${video.id}"
          title="${video.title}"
          allowfullscreen>
        </iframe>
        <p>${video.title}</p>
        <div class="song-count">${currentIndex + 1} / ${originalVideos.length}</div>
      </div>

      <button class="song-arrow song-next" aria-label="次の曲">›</button>
    </div>
  `;

  // 前の曲
  container.querySelector(".song-prev").addEventListener("click", function() {
    const nextIndex = (currentIndex - 1 + originalVideos.length) % originalVideos.length;
    showSong(nextIndex);
  });

  // 次の曲
  container.querySelector(".song-next").addEventListener("click", function() {
    const nextIndex = (currentIndex + 1) % originalVideos.length;
    showSong(nextIndex);
  });
}

    // 最初の曲を表示
    showSong(0);

  } catch (err) {
    console.error("オリジナル曲取得エラー:", err);

    container.innerHTML =
      "<p>オリジナル曲を読み込めませんでした</p>";
  }
}

// ==================================================
// 🚀 実行
// ==================================================

document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM読み込み完了 → 動画取得開始");
  fetchLatestVideos();
  fetchOriginalSongs();
});
