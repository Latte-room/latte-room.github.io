const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI"; // あなたのAPIキー
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";
const PLAYLIST_ID = "PLLJ57zRrF1yPhtd2yTExV-7A6wgbKV1Nx";


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

      if (!searchData.items || searchData.items.length === 0) break;

      const videoIds = searchData.items.map(item => item.id.videoId).join(",");
      pageToken = searchData.nextPageToken || "";

      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=snippet`
      );
      const videoData = await videoRes.json();

      if (!videoData.items) break;

      for (const item of videoData.items) {
        const id = item.id;
        const title = item.snippet.title || "";

        const isShorts = title.includes("#shorts") || title.toLowerCase().includes("shorts");

        if (isShorts && !shortsVideo) {
          shortsVideo = id;
          shortsTitle = title;
        }
        if (!isShorts && !normalVideo) {
          normalVideo = id;
          normalTitle = title;
        }
        if (shortsVideo && normalVideo) break;
      }

      if (!pageToken) break;
    }
  } catch (err) {
    console.error("最新動画取得エラー:", err);
  }

  // 横動画
  const latestVideo = document.getElementById("latest-video");
  if (latestVideo) {
    latestVideo.innerHTML = normalVideo
      ? `<div class="video-card">
           <iframe src="https://www.youtube.com/embed/${normalVideo}" title="${normalTitle}" allowfullscreen></iframe>
           <p>${normalTitle}</p>
         </div>`
      : `<p>動画が見つかりません</p>`;
  }

  // ショート
  const latestShorts = document.getElementById("latest-shorts");
  if (latestShorts) {
    latestShorts.innerHTML = shortsVideo
      ? `<div class="video-card shorts">
           <iframe src="https://www.youtube.com/embed/${shortsVideo}" title="${shortsTitle}" allowfullscreen></iframe>
           <p>${shortsTitle}</p>
         </div>`
      : `<p>ショートが見つかりません</p>`;
  }
}

// ==================================================
// 🎵 オリジナル曲（サムネイル付きスライダー）
// ==================================================
async function fetchOriginalSongs() {
  const container = document.getElementById("original-songs");
  if (!container) return;

  let originalVideos = [];
  let pageToken = "";
  let tryCount = 0;
  const maxTries = 8;

  try {
    while (originalVideos.length < 10 && tryCount < maxTries) {
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

      if (pageToken) searchUrl += `&pageToken=${pageToken}`;

      const res = await fetch(searchUrl);
      const data = await res.json();

      if (data.error || !data.items || data.items.length === 0) break;

      for (const item of data.items) {
        const rawTitle = item.snippet?.title || "";
        const title = rawTitle.normalize("NFC");
        const id = item.id?.videoId;
        if (!id) continue;

        const isShorts = title.includes("#shorts") || title.toLowerCase().includes("shorts") || title.includes("ショート");
        const isOriginal = title.includes("オリジナル曲");

        if (isOriginal && !isShorts) {
          if (!originalVideos.some(v => v.id === id)) {
            originalVideos.push({
              id: id,
              title: rawTitle,
              thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url
            });
          }
        }
        if (originalVideos.length >= 10) break;
      }

      pageToken = data.nextPageToken || "";
      if (!pageToken) break;
    }

    // サムネイル付きスライダーで表示
    createThumbSlider("original-songs", originalVideos);

  } catch (err) {
    console.error("オリジナル曲取得エラー:", err);
    container.innerHTML = "<p>オリジナル曲を読み込めませんでした</p>";
  }
}

// ==================================================
// 🎵 歌ってみた（カバー）＆ 山下学園
// ==================================================
async function fetchPlaylistSongs() {
  let covers = [];
  let gakuen = [];
  let pageToken = "";
  let tryCount = 0;
  const maxTries = 10;

  try {
    while (tryCount < maxTries) {
      tryCount++;

      let url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${PLAYLIST_ID}&part=snippet&maxResults=50`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.error || !data.items) break;

      for (const item of data.items) {
        const title = (item.snippet?.title || "").normalize("NFC");
        const videoId = item.snippet?.resourceId?.videoId;
        if (!videoId) continue;

        const videoData = {
          id: videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url
        };

        const isGakuen = title.includes("山下学園") || title.includes("BEATNIXS") || title.includes("@山下") || title.includes("フリーライブ");
        const isCover = title.includes("Covered") || title.includes("covered") || title.includes("COVERED") || title.includes("歌ってみた");

        if (isGakuen) {
          gakuen.push(videoData);
        } else if (isCover) {
          covers.push(videoData);
        }
      }

      pageToken = data.nextPageToken || "";
      if (!pageToken) break;
    }

    createThumbSlider("covers-slider", covers);
    createThumbSlider("gakuen-slider", gakuen);

  } catch (err) {
    console.error("プレイリスト取得エラー:", err);
  }
}


function createThumbSlider(containerId, videos) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (videos.length === 0) {
    container.innerHTML = "<p>動画が見つかりませんでした</p>";
    return;
  }

  let currentIndex = 0;

  function render() {
    const video = videos[currentIndex];

    let thumbsHtml = "";
    videos.forEach((v, i) => {
      thumbsHtml += `
        <div class="thumb-item ${i === currentIndex ? "active" : ""}" data-index="${i}"
             style="flex:0 0 140px; width:140px; min-width:140px;">
          <img src="${v.thumbnail}" alt="" style="width:100%; height:80px; object-fit:cover; display:block;">
          <p style="color:white; font-size:12px; padding:6px; margin:0; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${v.title}</p>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="thumb-main">
        <iframe src="https://www.youtube.com/embed/${video.id}" title="${video.title}" allowfullscreen></iframe>
        <p>${video.title}</p>
      </div>
      <div class="thumb-list-wrapper" style="display:flex; align-items:center; gap:10px;">
        <button class="thumb-arrow thumb-prev">‹</button>
        <div class="thumb-list" style="display:flex; flex-direction:row; flex-wrap:nowrap; overflow-x:auto; gap:12px; padding:8px 4px; width:100%;">
          ${thumbsHtml}
        </div>
        <button class="thumb-arrow thumb-next">›</button>
      </div>
    `;

    container.querySelectorAll(".thumb-item").forEach(item => {
      item.addEventListener("click", () => {
        currentIndex = Number(item.getAttribute("data-index"));
        render();
      });
    });

    container.querySelector(".thumb-prev").addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + videos.length) % videos.length;
      render();
    });

    container.querySelector(".thumb-next").addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % videos.length;
      render();
    });
  }

  render();
}


// ==================================================
// 🚀 実行
// ==================================================
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM読み込み完了 → 動画取得開始");

  fetchLatestVideos();
  fetchOriginalSongs();
  fetchPlaylistSongs();
});
