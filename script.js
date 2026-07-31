const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI"; // あなたのAPIキー
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";

// 1. 最新10件の動画IDを取得
fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=id&order=date&maxResults=10&type=video`)
  .then(res => res.json())
  .then(searchData => {
    if (!searchData.items || searchData.items.length === 0) return;

    const videoIds = searchData.items.map(item => item.id.videoId).join(",");

    // 2. 動画の詳細（長さ・タイトルなど）を取得
    return fetch(`https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=contentDetails,snippet`);
  })
  .then(res => res.json())
  .then(data => {
    if (!data || !data.items) return;

    let normalVideo = null;
    let shortsVideo = null;

    data.items.forEach(item => {
      const id = item.id;
      if (!id) return;

      // ISO 8601形式の長さを秒に変換
      const duration = item.contentDetails.duration; // 例: PT1M23S
      const seconds = parseDuration(duration);

      const isShorts = seconds <= 60; // 60秒以下をショートと判定

      if (isShorts) {
        if (!shortsVideo) shortsVideo = id; // 最新のショート
      } else {
        if (!normalVideo) normalVideo = id; // 最新の横動画
      }
    });

    // 埋め込み
    if (normalVideo) {
      document.getElementById("latest-video").innerHTML =
        `<iframe src="https://www.youtube.com/embed/${normalVideo}" allowfullscreen></iframe>`;
    }

    if (shortsVideo) {
      document.getElementById("latest-shorts").innerHTML =
        `<iframe src="https://www.youtube.com/embed/${shortsVideo}" allowfullscreen></iframe>`;
    }
  })
  .catch(err => console.error("エラーが発生しました:", err));

// 長さを秒に変換する関数
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}
