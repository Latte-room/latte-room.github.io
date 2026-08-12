const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI"; // あなたのAPIキー
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";

async function fetchLatestVideos() {

  console.log("🎬 最新動画の取得開始");

  let normalVideo = null;
  let shortsVideo = null;

  let normalTitle = "";
  let shortsTitle = "";

  let pageToken = "";
  let tryCount = 0;

  const maxTries = 5;

  try {

    while (
      (!normalVideo || !shortsVideo) &&
      tryCount < maxTries
    ) {

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

      console.log(
        `📄 ${tryCount}ページ目`,
        searchData
      );

      if (
        !searchData.items ||
        searchData.items.length === 0
      ) {
        console.log("動画が見つかりません");
        break;
      }

      const videoIds =
        searchData.items
          .map(item => item.id.videoId)
          .join(",");

      pageToken =
        searchData.nextPageToken || "";

      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos` +
        `?key=${API_KEY}` +
        `&id=${videoIds}` +
        `&part=snippet`
      );

      const videoData =
        await videoRes.json();

      console.log(
        "🎥 動画データ:",
        videoData
      );

      if (!videoData.items) {
        console.error(
          "動画詳細の取得に失敗:",
          videoData
        );
        break;
      }

      for (const item of videoData.items) {

        const id = item.id;
        const title =
          item.snippet.title || "";

        const lowerTitle =
          title.toLowerCase();

        const isShorts =
          lowerTitle.includes("#shorts") ||
          lowerTitle.includes("shorts");

        // Shorts
        if (
          isShorts &&
          !shortsVideo
        ) {

          shortsVideo = id;
          shortsTitle = title;

          console.log(
            "📱 Shorts発見:",
            title
          );
        }

        // 横動画
        if (
          !isShorts &&
          !normalVideo
        ) {

          normalVideo = id;
          normalTitle = title;

          console.log(
            "🎬 横動画発見:",
            title
          );
        }

        if (
          normalVideo &&
          shortsVideo
        ) {
          break;
        }
      }

      if (!pageToken) {
        break;
      }
    }

  } catch (error) {

    console.error(
      "💥 エラー:",
      error
    );

  }


  // =========================
  // 🎬 横動画を表示
  // =========================

  const latestVideo =
    document.getElementById(
      "latest-video"
    );

  if (latestVideo) {

    if (normalVideo) {

      latestVideo.innerHTML = `
        <div class="video-card">

          <iframe
            src="https://www.youtube.com/embed/${normalVideo}"
            title="${normalTitle}"
            allowfullscreen>
          </iframe>

          <p>${normalTitle}</p>

        </div>
      `;

    } else {

      latestVideo.innerHTML =
        "<p>横動画が見つかりませんでした</p>";

    }
  }


  // =========================
  // 📱 Shortsを表示
  // =========================

  const latestShorts =
    document.getElementById(
      "latest-shorts"
    );

  if (latestShorts) {

    if (shortsVideo) {

      latestShorts.innerHTML = `
        <div class="video-card shorts">

          <iframe
            src="https://www.youtube.com/embed/${shortsVideo}"
            title="${shortsTitle}"
            allowfullscreen>
          </iframe>

          <p>${shortsTitle}</p>

        </div>
      `;

    } else {

      latestShorts.innerHTML =
        "<p>ショート動画が見つかりませんでした</p>";

    }
  }


  console.log(
    "✅ 最終結果:",
    {
      normalVideo,
      shortsVideo
    }
  );
}


// =========================
// 🚀 実行
// =========================

fetchLatestVideos();


