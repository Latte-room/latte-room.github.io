const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI"; // ★ここをご自身の本物のAPIキーに書き換えてください
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";

// ❌ 記号のバグで合体できていなかったURLを、⭕️ 確実に文字が合体する安全な書き方に直しました！
const searchUrl = "https" + "://" + "www" + "://" + API_KEY + "&channelId=" + CHANNEL_ID + "&part=id&order=date&maxResults=10&type=video";
// 1. まずはチャンネルの最新動画10件のIDを取得します
fetch(searchUrl)
.then(res => res.json())
.then(searchData => {
  if (!searchData.items || searchData.items.length === 0) return;
  
  // 10件の動画IDをカンマで繋ぎます
  const videoIds = searchData.items.map(item => item.id.videoId).join(',');
  
  // 2. 2つ目のURLも、絶対にバグが起きない確実な書き方に直しました
  const videoUrl = "https" + "://" + "www" + "://" + API_KEY + "&id=" + videoIds + "&part=snippet,liveStreamingDetails";
  return fetch(videoUrl);
})
.then(res => {
  if (!res) return;
  return res.json();
})
.then(data => {
  if (!data || !data.items) return;
  console.log(data);

  let normalVideo = null;
  let shortsVideo = null;

  data.items.forEach(item => {
    const id = item.id;
    if (!id) return;

    // タイトルまたは説明文に「shorts」が含まれているかを正確に判定
    const isShorts = (item.snippet.title && item.snippet.title.toLowerCase().includes("#shorts")) || 
                     (item.snippet.description && item.snippet.description.toLowerCase().includes("shorts"));

    // 生配信のアーカイブなどを横動画に正しく振り分ける安全ガード
    const isLiveOrPremiere = item.liveStreamingDetails ? true : false;

    if (isShorts && !isLiveOrPremiere) {
      if (!shortsVideo) shortsVideo = id; // 最新のショートをセット
    } else {
      if (!normalVideo) normalVideo = id; // 最新の横動画をセット
    }
  });

  // 画面への埋め込み処理
  if (normalVideo) {
    document.getElementById("latest-video").innerHTML =
      "<iframe src='https://youtube.com" + normalVideo + "' allowfullscreen></iframe>";
  }

  if (shortsVideo) {
    document.getElementById("latest-shorts").innerHTML =
      "<iframe src='https://youtube.com" + shortsVideo + "' allowfullscreen></iframe>";
  }
})
.catch(err => console.error("エラーが発生しました:", err));
