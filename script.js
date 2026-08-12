const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI"; // あなたのAPIキー
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";


// ==================================================
// 🎬 最新の横動画 ＆ 最新ショート
// ==================================================

async function fetchOriginalSongs() {
  const container = document.getElementById("original-songs");

  if (!container) return;

  let originalVideos = [];
  let pageToken = "";
  let tryCount = 0;
  const maxTries = 5;

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
        `&type=video`;

      if (pageToken) {
        searchUrl += `&pageToken=${pageToken}`;
      }

      const res = await fetch(searchUrl);
      const data = await res.json();

      console.log("オリジナル曲検索:", data);

      if (!data.items || data.items.length === 0) {
        break;
      }

      for (const item of data.items) {
        const title = item.snippet.title || "";
        const id = item.id.videoId;

        // 「オリジナル曲」がタイトルに入っているもの
        if (title.includes("オリジナル曲")) {

          const alreadyExists =
            originalVideos.some(video => video.id === id);

          if (!alreadyExists) {
            originalVideos.push({
              id: id,
              title: title
            });

            console.log("オリジナル曲発見:", title);
          }
        }

        if (originalVideos.length >= 5) {
          break;
        }
      }

      pageToken = data.nextPageToken || "";

      if (!pageToken) {
        break;
      }
    }

    if (originalVideos.length === 0) {
      container.innerHTML =
        "<p>オリジナル曲が見つかりませんでした</p>";

      console.log("オリジナル曲は0件でした");
      return;
    }

    // 🎵 オリジナル曲を表示
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

    console.log(
      "オリジナル曲取得完了:",
      originalVideos
    );

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
