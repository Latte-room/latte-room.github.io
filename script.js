const API_KEY = "AIzaSyBIrDQkZXjtMWbCjznHp_Rga-GhPFwZTWI";
const CHANNEL_ID = "UCKx_KMe4Q92491rkY8JufOg";

fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=10&type=video`)
.then(res => res.json())
.then(data => {
  console.log(data);

  let normalVideo = null;
  let shortsVideo = null;

  data.items.forEach(item => {
    const id = item.id.videoId;
    if (!id) return;

    if (!shortsVideo && item.snippet.title.includes("#shorts")) {
      shortsVideo = id;
    } else if (!normalVideo) {
      normalVideo = id;
    }
  });

  if (normalVideo) {
    document.getElementById("latest-video").innerHTML =
      `<iframe src="https://www.youtube.com/embed/${normalVideo}" allowfullscreen></iframe>`;
  }

  if (shortsVideo) {
    document.getElementById("latest-shorts").innerHTML =
      `<iframe src="https://www.youtube.com/embed/${shortsVideo}" allowfullscreen></iframe>`;
  }
});
