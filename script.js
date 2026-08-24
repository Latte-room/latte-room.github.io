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

      if (pageToken) searchUrl += `&pageToken=${pageToken}`;

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

  const latestVideo = document.getElementById("latest-video");
  if (latestVideo) {
    latestVideo.innerHTML = normalVideo
      ? `<div class="video-card">
           <iframe src="https://www.youtube.com/embed/${normalVideo}" title="${normalTitle}" allowfullscreen></iframe>
           <p>${normalTitle}</p>
         </div>`
      : `<p>動画が見つかりません</p>`;
  }

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
// 🎵 オリジナル曲
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
              thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
              publishedAt: item.snippet.publishedAt || ""
            });
          }
        }
        if (originalVideos.length >= 10) break;
      }

      pageToken = data.nextPageToken || "";
      if (!pageToken) break;
    }

    // 新しい順に並び替え
    originalVideos.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
    createThumbSlider("original-songs", originalVideos);

  } catch (err) {
    console.error("オリジナル曲取得エラー:", err);
    container.innerHTML = "<p>オリジナル曲を読み込めませんでした</p>";
  }
}


// ==================================================
// 🎵 歌ってみた（カバー）＆ 山下学園
// プレイリスト内の動画を「動画公開日順」に並べる
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

      let url =
        `https://www.googleapis.com/youtube/v3/playlistItems` +
        `?key=${API_KEY}` +
        `&playlistId=${PLAYLIST_ID}` +
        `&part=snippet,contentDetails` +
        `&maxResults=50`;

      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.error || !data.items) {
        console.error("プレイリストAPIエラー:", data.error);
        break;
      }

      for (const item of data.items) {
        const title = (item.snippet?.title || "").normalize("NFC");
        const videoId = item.snippet?.resourceId?.videoId;

        if (!videoId) continue;

        // ★ 動画そのものの公開日
        const publishedAt =
          item.contentDetails?.videoPublishedAt || "";

        const videoData = {
          id: videoId,
          title: item.snippet.title,
          thumbnail:
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url,
          publishedAt: publishedAt
        };

        // 山下学園関連
        const isGakuen =
          title.includes("山下学園") ||
          title.includes("BEATNIXS") ||
          title.includes("@山下") ||
          title.includes("フリーライブ");

        // 歌ってみた関連
        const isCover =
          title.includes("Covered") ||
          title.includes("covered") ||
          title.includes("COVERED") ||
          title.includes("歌ってみた");

        if (isGakuen) {
          gakuen.push(videoData);
        } else if (isCover) {
          covers.push(videoData);
        }
      }

      pageToken = data.nextPageToken || "";

      if (!pageToken) {
        break;
      }
    }

    // ==============================================
    // ★ 動画の公開日が新しい順
    // ==============================================
    covers.sort((a, b) =>
      (b.publishedAt || "").localeCompare(a.publishedAt || "")
    );

    gakuen.sort((a, b) =>
      (b.publishedAt || "").localeCompare(a.publishedAt || "")
    );

    createThumbSlider("covers-slider", covers);
    createThumbSlider("gakuen-slider", gakuen);

  } catch (err) {
    console.error("プレイリスト取得エラー:", err);
  }
}
});
