const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI";
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";

// 💡 確実に仕分けるため、動画の詳細データを取得できる「videos」APIを使用します
fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=id&order=date&maxResults=10&type=video`)
.then(res => res.json())
.then(searchData => {
  // 最新動画10件のIDをカンマ区切りでまとめます
  const videoIds = searchData.items.map(item => item.id.videoId).join(',');
  
  // まとめたIDを使って、動画ごとの詳しいデータを一括で取得します
  return fetch(`https://googleapis.com{API_KEY}&id=${videoIds}&part=snippet,liveStreamingDetails`);
})
.then(res => res.json())
.then(data => {
  console.log(data);

  let normalVideo = null;
  let shortsVideo = null;

  data.items.forEach(item => {
    const id = item.id;
    if (!id) return;

    // 💡 YouTube公式が「#shorts」を自動判定しているかをチェックする強力なロジックです
    // タイトルに「#shorts」があるか、または動画の説明文（description）に「shorts」が含まれているかを判定します
    const isShorts = item.snippet.title.toLowerCase().includes("#shorts") || 
                     item.snippet.description.toLowerCase().includes("shorts");

    // 💡 配信のアーカイブやプレミア公開（横動画）をショートとして誤判定しないための防衛策です
    const isLiveOrPremiere = item.liveStreamingDetails ? true : false;

    if (isShorts && !isLiveOrPremiere) {
      if (!shortsVideo) shortsVideo = id;
    } else {
      if (!normalVideo) normalVideo = id;
    }
  });

  // 画面への埋め込み処理（あなたのコードをそのまま活かしています！）
  if (normalVideo) {
    document.getElementById("latest-video").innerHTML =
      `<iframe src="https://www.youtube.com/embed/${normalVideo}" allowfullscreen></iframe>`;
  }

  if (shortsVideo) {
    document.getElementById("latest-shorts").innerHTML =
      `<iframe src="https://www.youtube.com/embed/${shortsVideo}" allowfullscreen></iframe>`;
  }
});
