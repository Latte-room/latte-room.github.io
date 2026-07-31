const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI"; // あなたのAPIキー
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";

fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=id&order=date&maxResults=15&type=video`)
  .then(res => res.json())
  .then(searchData => {
    if (!searchData.items || searchData.items.length === 0) {
      console.log("動画が見つかりませんでした");
      return;
    }

    const videoIds = searchData.items.map(item => item.id.videoId).join(",");
    console.log("取得した動画ID:", videoIds);

    return fetch(`https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=contentDetails,snippet`);
  })
  .then(res => {
    if (!res) return;
    return res.json();
  })
  .then(data => {
    if (!data || !data.items) return;

    let normalVideo = null;
    let shortsVideo = null;

    console.log("----- 動画一覧 -----");
    data.items.forEach(item => {
      const id = item.id;
      const title = item.snippet.title;
      const seconds = parseDuration(item.contentDetails.duration);
      const isShorts = seconds <= 60;

      console.log(`${isShorts ? "【ショート】" : "【横動画】"} ${seconds}秒 - ${title}`);

      if (isShorts) {
        if (!shortsVideo) shortsVideo = id;
      } else {
        if (!normalVideo) normalVideo = id;
      }
    });

    console.log("選ばれた横動画ID:", normalVideo);
    console.log("選ばれたショートID:", shortsVideo);

    if (normalVideo) {
      document.getElementById("latest-video").innerHTML =
        `<iframe src="https://www.youtube.com/embed/${normalVideo}" allowfullscreen></iframe>`;
    } else {
      console.log("横動画が見つかりませんでした（最新15件が全部ショートの可能性）");
    }

    if (shortsVideo) {
      document.getElementById("latest-shorts").innerHTML =
        `<iframe src="https://www.youtube.com/embed/${shortsVideo}" allowfullscreen></iframe>`;
    }
  })
  .catch(err => console.error("エラーが発生しました:", err));

function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}
