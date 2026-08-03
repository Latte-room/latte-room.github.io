const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI"; // あなたのAPIキー
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";

async function fetchLatestVideos() {
  console.log("関数スタート");

  let normalVideo = null;
  let shortsVideo = null;
  let pageToken = "";
  let tryCount = 0;
  const maxTries = 5;

  try {
    while ((!normalVideo || !shortsVideo) && tryCount < maxTries) {
      tryCount++;
      console.log("ループ回数:", tryCount);

      let searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=id&order=date&maxResults=50&type=video`;
      if (pageToken) searchUrl += `&pageToken=${pageToken}`;

      console.log("searchURL:", searchUrl);

      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      console.log("searchData:", searchData);

      if (!searchData.items || searchData.items.length === 0) {
        console.log("動画なし");
        break;
      }

      const videoIds = searchData.items.map(item => item.id.videoId).join(",");
      pageToken = searchData.nextPageToken || "";

      console.log("videoIds:", videoIds);

      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=snippet`
      );

      console.log("ここ通ってる①");

      const videoData = await videoRes.json();

      console.log("ここ通ってる②");
      console.log("videoData:", videoData);

      if (!videoData.items) {
        console.error("videoData壊れてる", videoData);
        break;
      }

      for (const item of videoData.items) {
        const id = item.id;
        const title = item.snippet.title || "";

        const isShorts =
          title.includes("#shorts") ||
          title.toLowerCase().includes("shorts");

        if (isShorts && !shortsVideo) {
          shortsVideo = id;
          console.log("Shorts見つけた:", id);
        }

        if (!isShorts && !normalVideo) {
          normalVideo = id;
          console.log("横動画見つけた:", id);
        }

        if (shortsVideo && normalVideo) break;
      }

      if (!pageToken) break;
    }
  } catch (err) {
    console.error("💥 fetchでエラー:", err);
  }

  console.log("最終結果", { normalVideo, shortsVideo });

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
  } else {
    document.getElementById("latest-shorts").innerHTML =
      `<p>ショート動画が見つかりませんでした</p>`;
  }
}

// ⭐ 忘れがち
fetchLatestVideos();
