const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI"; // あなたのAPIキー
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";

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

      let searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=id&order=date&maxResults=50&type=video`;
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

        if (shortsVideo && normalVideo) break;
      }

      if (!pageToken) break;
    }
  } catch (err) {
    console.error("エラー:", err);
  }

  // 🎬 横動画
  document.getElementById("latest-video").innerHTML = normalVideo
    ? `
    <div class="video-card">
      <iframe src="https://www.youtube.com/embed/${normalVideo}" allowfullscreen></iframe>
      <p>${normalTitle}</p>
    </div>`
    : `<p>動画が見つかりません</p>`;

  // 📱 Shorts
  document.getElementById("latest-shorts").innerHTML = shortsVideo
    ? `
    <div class="video-card shorts">
      <iframe src="https://www.youtube.com/embed/${shortsVideo}" allowfullscreen></iframe>
      <p>${shortsTitle}</p>
    </div>`
    : `<p>ショートが見つかりません</p>`;
}

fetchLatestVideos();
