const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI"; // あなたのAPIキー
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";


// ==================================================
// 🎬 最新動画・ショート
        const isShorts =
          title.toLowerCase().includes("#shorts") ||
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


  // 横動画
  const latestVideo =
    document.getElementById("latest-video");

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


  // ショート
  const latestShorts =
    document.getElementById("latest-shorts");

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
        "<p>ショートが見つかりませんでした</p>";

    }
  }

}



// ==================================================
// 🎵 オリジナル曲
      for (const item of data.items) {

        const title =
          item.snippet.title || "";

        const id =
          item.id.videoId;

        // タイトルに「オリジナル曲」が入っているもの
        if (
          title.includes("オリジナル曲") &&
          !originalVideos.some(video => video.id === id)
        ) {

          originalVideos.push({
            id: id,
            title: title
          });

          console.log(
            "🎵 オリジナル曲を発見:",
            title
          );
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


    if (originalVideos.length === 0) {

      container.innerHTML =
        "<p>オリジナル曲が見つかりませんでした</p>";

      return;
    }


    // スライダー

    container.innerHTML =
      originalVideos.map(video => `

        <div class="song-slide">

          <iframe
            src="https://www.youtube.com/embed/${video.id}"
            title="${video.title}"
            allowfullscreen>
          </iframe>

          <p class="song-title">
            ${video.title}
          </p>

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

