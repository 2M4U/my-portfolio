var spotifyListening = document.getElementById("spotifyListening");

const lanyard = new WebSocket("wss://api.lanyard.rest/socket");
const currentTime = new Date().getTime();

var api = {};
var received = false;

lanyard.onclose = function () {
  lanyard.send(
    JSON.stringify({
      op: 2,
      d: {
        subscribe_to_id: "937051733773938689",
      },
    })
  );
};
lanyard.onopen = function () {
  lanyard.send(
    JSON.stringify({
      op: 2,
      d: {
        subscribe_to_id: "937051733773938689",
      },
    })
  );
};

setInterval(() => {
  update_presence();
}, 1000);

setInterval(() => {
  if (received) {
    lanyard.send(
      JSON.stringify({
        op: 3,
      })
    );
  }
}, 30000);

lanyard.onmessage = function (event) {
  received = true;
  api = JSON.parse(event.data);

  switch (api.t) {
    case "INIT_STATE":
    case "PRESENCE_UPDATE":
      update_presence();
      break;
  }
};

function time(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = Number(((millis % 60000) / 1000).toFixed(0));
  return seconds == 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function update_presence() {
  //console.log(api.d);

  let spotify = api.d.spotify;
  if (api.d.listening_to_spotify == true) {
    const songLength = spotify.timestamps.end - spotify.timestamps.start;
    var elapsed = currentTime - spotify.timestamps.start;
    console.log(elapsed);

    var artist = `${spotify.artist.split(";")[0].split(",")[0]}`;
    var song = `${spotify.song.split("(")[0]}`;
    spotifyListening.innerHTML = `sh ./spotify.sh<br>Listening to ${song} by ${artist}<br> ${time(
      elapsed
    )} - ${time(songLength)}<span id="terminal__prompt--cursor"></span>`;
  } else {
    spotifyListening.innerHTML = `<span id="terminal__prompt--cursor"></span>`;
  }
}
