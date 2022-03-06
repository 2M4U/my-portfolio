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
 function bday(d1, d2) {
    //console.log(d2)
    let date1 = new Date(d1);
    let date2 = new Date(d2);
    let yearsDiff =  date2.getFullYear() - date1.getFullYear();
    return yearsDiff;
}
setInterval(() => {
  update_presence()
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
function update_presence() {
  //console.log(api.d);
  let status;
  switch (api.d.discord_status) {
    case "dnd":
      status =
        '<div style="display: inline-block;  width: 10px; height: 10px; border-radius: 50%; background-color: red;"></div>';
      break;
    case "idle":
      status =
        '<div style="display: inline-block;  width: 10px; height: 10px; border-radius: 50%; background-color: yellow;"></div>';
      break;
    case "online":
      status =
        '<div style="display: inline-block;  width: 10px; height: 10px; border-radius: 50%; background-color: green;"></div>';
      break;
    case "offline":
      status =
        '<div style="display: inline-block;  width: 10px; height: 10px; border-radius: 50%; background-color: grey;"></div>';
      break;
  }
  let spotify = api.d.spotify;
  if (api.d.listening_to_spotify == true) {
    const songLength = spotify.timestamps.end - spotify.timestamps.start;
    const timeElapsed = currentTime - spotify.timestamps.start;
    function msToMinSeconds(millis) {
      var minutes = Math.floor(millis / 60000);
      var seconds = Number(((millis % 60000) / 1000).toFixed(0));
      return seconds == 60
        ? minutes + 1 + ":00"
        : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    }
    var artist = `${spotify.artist.split(";")[0].split(",")[0]}`;
    var song = `${spotify.song.split("(")[0]}`;
    spotifyListening.innerHTML = `sh ./portfolio.sh<br>Name: 2M4U ${status} <sup>(${api.d.discord_user.username})</sup><br>Loc: United Kingdom<br>Repositories: <a href="https://github.com/2m4u">Github</a> <br>Contact Me: comingsoon@2m4u.lol<br>About Me:<br>I'm a ${bday("1994", Date())} year old Full-Stack Developer from Ireland who has a sole passion for coding and computers.<br>I have over 5 years experience in JavaScript, HTML, LSL, Discord Bots and much more.<br>I have alot of open-source projects on my Github.<br>I will eventually add my resume to this site at a later date.<br>
   <!-- <div class="typer"> --><i class="fab fa-spotify spotify ml-1 mr-1"></i> Listening to <a href="https://open.spotify.com/track/${api.d.spotify.track_id}" target="_blank" class="hover:text-gray-500 text-d-yes" style="color: grey;">${song}</a> by ${artist}<br> ${msToMinSeconds(timeElapsed)} - ${msToMinSeconds(songLength)}<span id="terminal__prompt--cursor"></span><!---</div>-->`;
  } else {
    spotifyListening.innerHTML = `sh ./portfolio.sh<br>Name: 2M4U ${status} <sup>(${api.d.discord_user.username})</sup><br>Loc: United Kingdom<br>Repositories: <a href="https://github.com/2m4u">Github</a> <br>Contact Me: comingsoon@2m4u.lol<br>About Me:<br>I'm a ${bday("1994", Date())} year old Full-Stack Developer from Ireland who has a sole passion for coding and computers.<br>I have over 5 years experience in JavaScript, HTML, LSL, Discord Bots and much more.<br>I have alot of open-source projects on my Github.<br>I will eventually add my resume to this site at a later date.<span id="terminal__prompt--cursor"></span>`;
  }
}
