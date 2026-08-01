const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI"; // あなたのAPIキー
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";

async function fetchLatestVideos() {
  let normalVideo = null;
  let shortsVideo = null;
  let pageToken = "";
  let tryCount = 0;
  const maxTries = 5;

  while ((!normalVideo || !shortsVideo) && tryCount < maxTries) {
    tryCount++;

    let searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=id&order=date&maxResults=50&type=video`;
    if (pageToken) searchUrl += `&pageToken=${pageToken}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) break;

    const videoIds = searchData.items.map(item => item.id.videoId).join(",");
    pageToken = searchData.nextPageToken || "";

    const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=snippet`);
    const videoData = await videoRes.json();
    console.log(videoData); // 

    // ⭐ ここが重要（forに変更）
    for (const item of videoData.items) {
      const id = item.id;
      const title = item.snippet.title || "";

      // ⭐ Shorts判定をタイトルベースに変更
      const isShorts = title.includes("#shorts") || title.toLowerCase().includes("shorts");

      if (isShorts && !shortsVideo) {
        shortsVideo = id;
      }

      if (!isShorts && !normalVideo) {
        normalVideo = id;
      }

      // ⭐ 両方見つかったら即終了（ズレ防止）
      if (shortsVideo && normalVideo) break;
    }

    if (!pageToken) break;
  }

  // 表示
  if (normalVideo) {
    document.getElementById("latest-video").innerHTML =
      `<iframe src="https://www.youtube.com/embed/${normalVideo}" allowfullscreen></iframe>`;
  } else {
    document.getElementById("latest-video").innerHTML =
      `<p>横動画が見つかりませんでした</p>`;
  }

  if (shortsVideo) {
    document.getElementById("latest-shorts").innerHTML =
      `<iframe src="https://www.youtube.com/embed/${shortsVideo}" allowfullscreen></iframe>`;
  }
}
