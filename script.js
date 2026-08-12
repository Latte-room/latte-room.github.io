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




> 2026/08/12 15:31、川原直也 <0421orange2525@gmail.com>のメール:

川原直也 <0421orange2525@gmail.com>
15:48 (2 分前)
To 自分

const API_KEY = "AIzaSy..."; // ← 自分のAPIキーを入れる
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";


// ==================================================
// 🎬 最新の横動画 ＆ 📱 最新ショート
// ==================================================
        // Shorts判定
      "💥 最新動画取得エラー:",
      error
    );
  }


  // ==================================================
  // 🎬 横動画を表示
  // ==================================================

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


  // ==================================================
  // 📱 Shortsを表示
  // ==================================================

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
    "✅ 最新動画の最終結果:",
    {
      normalVideo,
      shortsVideo
    }
  );
}



// ==================================================
// 🎵 オリジナル曲
// タイトルに「オリジナル曲」が入っている動画を取得
// ==================================================

async function fetchOriginalSongs() {

  console.log("🎵 オリジナル曲の取得開始");

  const container =
    document.getElementById(
      "original-songs"
    );

  if (!container) {
    console.log(
      "オリジナル曲表示場所がありません"
    );
    return;
  }

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
        searchUrl +=
          `&pageToken=${pageToken}`;
      }

      const res =
        await fetch(searchUrl);

      const data =
        await res.json();

      console.log(
        `🎵 オリジナル曲検索 ${tryCount}ページ目:`,
        data
      );

      if (
        !data.items ||
        data.items.length === 0
      ) {
        break;
      }


      // ----------------------------------------------
      // タイトルに「オリジナル曲」がある動画だけ取得
      // ----------------------------------------------

      for (const item of data.items) {

        const title =
          item.snippet.title || "";

        const id =
          item.id.videoId;

        if (
          title.includes("オリジナル曲") &&
          id
        ) {

          // 同じ動画を重複させない
          const alreadyExists =
            originalVideos.some(
              video => video.id === id
            );

          if (!alreadyExists) {

            originalVideos.push({
              id: id,
              title: title
            });

            console.log(
              "🎵 オリジナル曲発見:",
              title
            );
          }
        }

        if (
          originalVideos.length >= 5
        ) {
          break;
        }
      }


      pageToken =
        data.nextPageToken || "";

      if (!pageToken) {
        break;
      }
    }


    // ==================================================
    // 🎵 表示
    // ==================================================

    if (
      originalVideos.length === 0
    ) {

      container.innerHTML =
        "<p>オリジナル曲が見つかりませんでした</p>";

      console.log(
        "🎵 オリジナル曲は見つかりませんでした"
      );

      return;
    }


    // 新しい順で横スライド
    container.innerHTML =
      originalVideos
        .map(video => `

          <div class="song-slide">

            <iframe
              src="https://www.youtube.com/embed/${video.id}"
              title="${video.title}"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>

            <p>${video.title}</p>

          </div>

        `)
        .join("");


    console.log(
      "✅ オリジナル曲表示完了:",
      originalVideos
    );

  } catch (error) {

    console.error(
      "💥 オリジナル曲取得エラー:",
      error
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
