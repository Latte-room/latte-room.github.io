const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI"; // あなたのAPIキー
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";

async function fetchLatestVideos() {
  let normalVideo = null;
  let shortsVideo = null;
  let pageToken = "";
  let tryCount = 0;
  const maxTries = 5; // 最大5ページまで探す（最大250本）

  while ((!normalVideo || !shortsVideo) && tryCount < maxTries) {
    tryCount++;

    // 検索リクエスト
    let searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=id&order=date&maxResults=50&type=video`;
    if (pageToken) searchUrl += `&pageToken=${pageToken}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) break;

    const videoIds = searchData.items.map(item => item.id.videoId).join(",");
    pageToken = searchData.nextPageToken || "";

    // 動画詳細を取得
    const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=contentDetails,snippet`);
    const videoData = await videoRes.json();

    videoData.items.forEach(item => {
      const id = item.id;
      const seconds = parseDuration(item.contentDetails.duration);
      const isShorts = seconds <= 60;

      if (isShorts) {
        if (!shortsVideo) shortsVideo = id;
      } else {
        if (!normalVideo) normalVideo = id;
      }
    });

    // 両方見つかったら終了
    if (normalVideo && shortsVideo) break;

    // 次のページがなければ終了
    if (!pageToken) break;
  }

  // 埋め込み処理
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

function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

// 実行
fetchLatestVideos().catch(err => console.error("エラーが発生しました:", err));
// オリジナル曲を取得して表示（最大5曲・新しい順）
async function fetchOriginalSongs() {
  const container = document.getElementById("original-songs");
  if (!container) return;

  let originalVideos = [];
  let pageToken = "";
  let tryCount = 0;
  const maxTries = 4; // 最大200本まで探す

  while (originalVideos.length < 5 && tryCount < maxTries) {
    tryCount++;

    let searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=50&type=video`;
    if (pageToken) searchUrl += `&pageToken=${pageToken}`;

    const res = await fetch(searchUrl);
    const data = await res.json();

    if (!data.items || data.items.length === 0) break;

    data.items.forEach(item => {
      const title = item.snippet.title || "";
      if (title.includes("【オリジナル曲】") && originalVideos.length < 5) {
        originalVideos.push(item.id.videoId);
      }
    });

    pageToken = data.nextPageToken || "";
    if (!pageToken) break;
  }

  if (originalVideos.length === 0) {
    container.innerHTML = "<p style='color:white;'>オリジナル曲はまだありません</p>";
    return;
  }

  // 新しい曲が左に来るように表示
  container.innerHTML = originalVideos.map(id => 
    `<iframe src="https://www.youtube.com/embed/${id}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`
  ).join("");
}

// 実行
fetchOriginalSongs().catch(err => console.error("オリジナル曲の取得エラー:", err));

これで完成です。ページを更新すると、注意書きの下に「オリジナル曲」が横スクロールで表示されるはずです。試してみて、幅が気になる・高さを変えたい・余白を調整したいなどあれば教えてください！

YouTube Data API v3 の使用方法について詳しく学ぶ

CSS スライダーのアニメーション効果を追加する

オリジナル曲の検索キーワードを調整する

cssはindexでいいんだよね？

はい、その通りです！今の構成だとCSSは全部 index.html の中の <style> タグに書いてあるので、そこに追加すればOKです。別ファイル（style.css など）を作る必要はありません。前回お伝えしたこの部分を、<style> の中にそのまま貼り付けてください：css

/* オリジナル曲スライダー */
.songs-slider {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 0 15px 0;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.songs-slider iframe {
  flex: 0 0 320px;
  height: 180px;
  border: none;
  border-radius: 8px;
  scroll-snap-align: start;
  background: #000;
}

/* スクロールバーを少し目立たなく */
.songs-slider::-webkit-scrollbar {
  height: 6px;
}
.songs-slider::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.5);
  border-radius: 3px;
}
