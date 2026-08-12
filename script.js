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

        // 最新動画・ショートの判定
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
// 「オリジナル曲」を含む通常動画だけ取得
// ==================================================

async function fetchOriginalSongs() {
  const container =
    document.getElementById("original-songs");

  if (!container) return;

  let originalVideos = [];
  let pageToken = "";
  let tryCount = 0;

  const maxTries = 5;

  try {
    while (
      originalVideos.length < 5 &&
      tryCount < maxTries
    ) {
      tryCount++;

      let searchUrl =
        `https://www.googleapis.com/youtube/v3/search` +
        `?key=${API_KEY}` +
        `&channelId=${CHANNEL_ID}` +
        `&part=snippet,id` +
        `&order=date` +
        `&maxResults=50` +
        `&type=video`;

      if (pageToken) {
        searchUrl += `&pageToken=${pageToken}`;
      }

      const res = await fetch(searchUrl);
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        break;
      }

      for (const item of data.items) {
        const title =
          item.snippet.title || "";

        const id =
          item.id.videoId;


        // ⭐ オリジナル曲か？
        const isOriginal =
          title.includes("オリジナル曲");


        // ⭐ Shortsか？
        const isShorts =
          title.includes("#shorts") ||
          title.toLowerCase().includes("shorts");


        // ⭐ オリジナル曲 ＆ Shortsではない
        if (isOriginal && !isShorts) {

          const alreadyExists =
            originalVideos.some(
              video => video.id === id
            );

          if (!alreadyExists) {
            originalVideos.push({
              id: id,
              title: title
            });
          }
        }


        if (originalVideos.length >= 5) {
          break;
        }
      }

      pageToken =
        data.nextPageToken || "";

      if (!pageToken) {
        break;
      }
    }


    // 見つからなかった場合
    if (originalVideos.length === 0) {
      container.innerHTML =
        "<p>オリジナル曲が見つかりませんでした</p>";
      return;
    }


    // 🎵 表示
    container.innerHTML =
      originalVideos.map(video => `
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

    console.error(
      "オリジナル曲取得エラー:",
      err
    );

    container.innerHTML =
      "<p>オリジナル曲を読み込めませんでした</p>";
  }
}



// ==================================================
// 🚀 実行
// ==================================================

fetchLatestVideos();
fetchOriginalSongs();
