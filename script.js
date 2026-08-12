const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI"; // あなたのAPIキー
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";


// ========================================
// 🎬 最新の横動画 ＆ 📱 最新ショート
// ========================================
          title.toLowerCase().includes("#shorts") ||
          title.toLowerCase().includes("shorts");

        // 最新Shorts
        if (isShorts && !shortsVideo) {
          shortsVideo = id;
          shortsTitle = title;
        }

        // 最新の横動画
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


  // 🎬 横動画を表示
  const latestVideo = document.getElementById("latest-video");

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
      "<p>動画が見つかりませんでした</p>";
  }


  // 📱 Shortsを表示
  const latestShorts = document.getElementById("latest-shorts");

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
      "<p>ショートが見つかりませんでした</p>";
  }
}



// ========================================
// 🎵 オリジナル曲
// ========================================

async function fetchOriginalSongs() {

  const container = document.getElementById("original-songs");

  if (!container) {
    console.error("original-songs が見つかりません");
    return;
  }

  let originalVideos = [];

  let pageToken = "";
  let tryCount = 0;

  // 最大250本まで検索
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


      if (!data.items || data.items.length === 0) {
        break;
      }


      for (const item of data.items) {

        const title = item.snippet?.title || "";
        const id = item.id?.videoId;


        if (!id) {
          continue;
        }


        // ==================================
        // 「【オリジナル曲】」を含む動画
        // ==================================

        if (
          title.includes("【オリジナル曲】") ||
          title.includes("[オリジナル曲]") ||
          title.includes("オリジナル曲")
        ) {

          // 同じ動画を重複させない
          if (!originalVideos.some(video => video.id === id)) {

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


        // 5曲見つかったら終了
        if (originalVideos.length >= 5) {
          break;
        }
      }


      pageToken = data.nextPageToken || "";


      if (!pageToken) {
        break;
      }
    }


    // ==================================
    // 見つからなかった場合
    // ==================================

    if (originalVideos.length === 0) {

      container.innerHTML =
        "<p>オリジナル曲が見つかりませんでした</p>";

      console.log(
        "🎵 オリジナル曲が見つかりませんでした"
      );

      return;
    }


    // ==================================
    // 🎵 スライダー表示
    // ==================================

    container.innerHTML = originalVideos
      .map(video => {

        return `
          <div class="song-slide">

            <iframe
              src="https://www.youtube.com/embed/${video.id}"
              title="${video.title}"
              allowfullscreen>
            </iframe>

            <p>${video.title}</p>

          </div>
        `;

      })
      .join("");


    console.log(
      "🎵 オリジナル曲:",
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



// ========================================
// 🚀 実行
// ========================================

fetchLatestVideos();

fetchOriginalSongs();


/*========================================
   🎵 オリジナル曲スライダー
======================================== */

.songs-slider {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 5px 20px;

  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.song-slide {
  flex: 0 0 320px;

  background: #111;
  border-radius: 12px;

  padding: 8px;

  scroll-snap-align: start;
}

.song-slide iframe {
  width: 100%;
  height: 180px;

  border: none;
  border-radius: 8px;

  display: block;
}

.song-slide p {
  color: white;

  font-size: 14px;
  line-height: 1.4;

  margin: 10px 4px 4px;
}


/* スクロールバー */

.songs-slider::-webkit-scrollbar {
  height: 6px;
}

.songs-slider::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.5);
  border-radius: 3px;
}

