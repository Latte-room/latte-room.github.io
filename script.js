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

  // クォータ節約のため最大2ページまで
  const maxTries = 2;

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

      if (searchData.error) {
        console.error("最新動画APIエラー:", searchData.error);
        break;
      }

      if (!searchData.items || searchData.items.length === 0) {
        break;
      }

      const videoIds = searchData.items
        .map(item => item.id.videoId)
        .filter(Boolean)
        .join(",");

      pageToken = searchData.nextPageToken || "";

      if (!videoIds) break;

      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos` +
        `?key=${API_KEY}` +
        `&id=${videoIds}` +
        `&part=snippet`
      );

      const videoData = await videoRes.json();

      if (videoData.error) {
        console.error("動画情報APIエラー:", videoData.error);
        break;
      }

      if (!videoData.items) {
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


  // ==================================================
  // 🎬 横動画
  // ==================================================

  const latestVideo =
    document.getElementById("latest-video");

  if (latestVideo) {
    latestVideo.innerHTML = normalVideo
      ? `
        <div class="video-card">
          <iframe
            src="https://www.youtube.com/embed/${normalVideo}"
            title="${normalTitle}"
            allowfullscreen>
          </iframe>

          <p>${normalTitle}</p>
        </div>
      `
      : `<p>動画が見つかりません</p>`;
  }


  // ==================================================
  // 📱 Shorts
  // ==================================================

  const latestShorts =
    document.getElementById("latest-shorts");

  if (latestShorts) {
    latestShorts.innerHTML = shortsVideo
      ? `
        <div class="video-card shorts">
          <iframe
            src="https://www.youtube.com/embed/${shortsVideo}"
            title="${shortsTitle}"
            allowfullscreen>
          </iframe>

          <p>${shortsTitle}</p>
        </div>
      `
      : `<p>ショートが見つかりません</p>`;
  }
}



// ==================================================
// 🎵 プレイリストから動画を取得
//
// ここで1回だけプレイリストを取得して、
// オリジナル曲・歌ってみた・山下学園に振り分ける
// ==================================================

async function fetchPlaylistSongs() {

  let originalSongs = [];
  let covers = [];
  let gakuen = [];

  let pageToken = "";
  let tryCount = 0;

  // 必要なら増やせる
  const maxTries = 10;

  try {

    while (tryCount < maxTries) {
      tryCount++;

      let url =
        `https://www.googleapis.com/youtube/v3/playlistItems` +
        `?key=${API_KEY}` +
        `&playlistId=${PLAYLIST_ID}` +
        `&part=snippet` +
        `&maxResults=50`;

      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.error) {
        console.error("プレイリストAPIエラー:", data.error);
        break;
      }

      if (!data.items || data.items.length === 0) {
        break;
      }


      // ==================================================
      // 取得した動画を振り分け
      // ==================================================

      for (const item of data.items) {

        const rawTitle =
          item.snippet?.title || "";

        const title =
          rawTitle.normalize("NFC");

        const videoId =
          item.snippet?.resourceId?.videoId;

        if (!videoId) {
          continue;
        }


        const videoData = {
          id: videoId,
          title: rawTitle,
          thumbnail:
            item.snippet?.thumbnails?.medium?.url ||
            item.snippet?.thumbnails?.default?.url ||
            "",
          publishedAt:
            item.snippet?.publishedAt || ""
        };


        // ==================================================
        // 🎵 オリジナル曲
        // ==================================================

        const isOriginal =
          title.includes("オリジナル曲");


        // Shortsを除外
        const isShorts =
          title.includes("#shorts") ||
          title.toLowerCase().includes("shorts") ||
          title.includes("ショート");


        if (isOriginal && !isShorts) {

          if (!originalSongs.some(v => v.id === videoId)) {
            originalSongs.push(videoData);
          }

        }


        // ==================================================
        // ☕️ 山下学園
        // ==================================================

        const isGakuen =
          title.includes("山下学園") ||
          title.includes("BEATNIXS") ||
          title.includes("@山下") ||
          title.includes("フリーライブ");


        // ==================================================
        // 🎤 歌ってみた
        // ==================================================

        const isCover =
          title.includes("Covered") ||
          title.includes("covered") ||
          title.includes("COVERED") ||
          title.includes("歌ってみた");


        if (isGakuen) {

          if (!gakuen.some(v => v.id === videoId)) {
            gakuen.push(videoData);
          }

        } else if (isCover) {

          if (!covers.some(v => v.id === videoId)) {
            covers.push(videoData);
          }

        }

      }


      pageToken =
        data.nextPageToken || "";

      if (!pageToken) {
        break;
      }
    }


    // ==================================================
    // 📅 公開日順
    // ==================================================

    originalSongs.sort(
      (a, b) =>
        (b.publishedAt || "")
          .localeCompare(a.publishedAt || "")
    );

    covers.sort(
      (a, b) =>
        (b.publishedAt || "")
          .localeCompare(a.publishedAt || "")
    );

    gakuen.sort(
      (a, b) =>
        (b.publishedAt || "")
          .localeCompare(a.publishedAt || "")
    );


    // ==================================================
    // 🎵 オリジナル曲
    // ==================================================

    createThumbSlider(
      "original-songs",
      originalSongs
    );


    // ==================================================
    // 🎤 歌ってみた
    // ==================================================

    createThumbSlider(
      "covers-slider",
      covers
    );


    // ==================================================
    // ☕️ 山下学園
    // ==================================================

    createThumbSlider(
      "gakuen-slider",
      gakuen
    );


  } catch (err) {

    console.error(
      "プレイリスト取得エラー:",
      err
    );

  }
}



// ==================================================
// 🎞️ サムネイル付きスライダー
// ==================================================

function createThumbSlider(
  containerId,
  videos
) {

  const container =
    document.getElementById(containerId);

  if (!container) {
    return;
  }


  if (!videos || videos.length === 0) {

    container.innerHTML =
      "<p>動画が見つかりませんでした</p>";

    return;
  }


  let currentIndex = 0;


  // ==================================================
  // 表示
  // ==================================================

  function render() {

    const video =
      videos[currentIndex];


    // --------------------------------------------------
    // サムネイル
    // --------------------------------------------------

    let thumbsHtml = "";

    videos.forEach((v, i) => {

      thumbsHtml += `
        <div
          class="thumb-item ${i === currentIndex ? "active" : ""}"
          data-index="${i}"
          style="
            flex:0 0 210px;
            width:210px;
            min-width:210px;
          "
        >

          <img
            src="${v.thumbnail}"
            alt=""
            style="
              width:100%;
              height:80px;
              object-fit:cover;
              display:block;
            "
          >

          <p
            style="
              color:white;
              font-size:12px;
              padding:6px;
              margin:0;
              text-align:center;
              white-space:nowrap;
              overflow:hidden;
              text-overflow:ellipsis;
            "
          >
            ${v.title}
          </p>

        </div>
      `;

    });


    // --------------------------------------------------
    // メイン画面
    // --------------------------------------------------

    container.innerHTML = `

      <div class="thumb-main">

        <iframe
          src="https://www.youtube.com/embed/${video.id}"
          title="${video.title}"
          allowfullscreen>
        </iframe>

        <p>
          ${video.title}
        </p>

      </div>


      <div
        class="thumb-list-wrapper"
        style="
          display:flex;
          align-items:center;
          gap:10px;
        "
      >

        <button
          class="thumb-arrow thumb-prev"
        >
          ‹
        </button>


        <div
          class="thumb-list"
          style="
            display:flex;
            flex-direction:row;
            flex-wrap:nowrap;
            overflow-x:auto;
            gap:12px;
            padding:8px 4px;
            width:100%;
          "
        >

          ${thumbsHtml}

        </div>


        <button
          class="thumb-arrow thumb-next"
        >
          ›
        </button>

      </div>

    `;


    // ==================================================
    // サムネイルクリック
    // ==================================================

    container
      .querySelectorAll(".thumb-item")
      .forEach(item => {

        item.addEventListener(
          "click",
          () => {

            currentIndex =
              Number(
                item.getAttribute("data-index")
              );

            render();

          }
        );

      });


    // ==================================================
    // ◀ 前
    // ==================================================

    const prevButton =
      container.querySelector(".thumb-prev");

    if (prevButton) {

      prevButton.addEventListener(
        "click",
        () => {

          currentIndex =
            (currentIndex - 1 + videos.length)
            % videos.length;

          render();

        }
      );

    }


    // ==================================================
    // ▶ 次
    // ==================================================

    const nextButton =
      container.querySelector(".thumb-next");

    if (nextButton) {

      nextButton.addEventListener(
        "click",
        () => {

          currentIndex =
            (currentIndex + 1)
            % videos.length;

          render();

        }
      );

    }


    // ==================================================
    // 選択中サムネイルを自動スクロール
    // ==================================================

    const activeThumb =
      container.querySelector(
        ".thumb-item.active"
      );

    const thumbList =
      container.querySelector(
        ".thumb-list"
      );


    if (activeThumb && thumbList) {

      const listRect =
        thumbList.getBoundingClientRect();

      const thumbRect =
        activeThumb.getBoundingClientRect();


      if (thumbRect.left < listRect.left) {

        thumbList.scrollBy({
          left:
            thumbRect.left -
            listRect.left -
            20,
          behavior: "smooth"
        });

      } else if (
        thumbRect.right >
        listRect.right
      ) {

        thumbList.scrollBy({
          left:
            thumbRect.right -
            listRect.right +
            20,
          behavior: "smooth"
        });

      }

    }

  }


  render();

}



// ==================================================
// 🚀 実行
// ==================================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "DOM読み込み完了 → 動画取得開始"
    );


    // 最新動画
    fetchLatestVideos();


    // プレイリスト
    // オリジナル曲・歌ってみた・山下学園を
    // ここ1回でまとめて取得
    fetchPlaylistSongs();

  }
);
