/* Credits to Dustin */

function log(...content) {
  let mainContent = content[0];
  if (typeof mainContent == "string") content.shift();
  else mainContent = null;

  console.log(
    `%cLanyard API%c ${mainContent}`,
    "padding: 10px; font-size: 1em; line-height: 1.4em; color: white; background: #151515; border-radius: 15px;",
    "font-size: 15px;",
    ...content
  );
}

function time(ms) {
  let minutes = Math.floor(ms / 60000);
  let seconds = Number(((ms % 60000) / 1000).toFixed(0));
  return seconds == 60
    ? minutes + 1 + ":00"
    : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

const Op = {
  Event: 0,
  Hello: 1,
  Initalize: 2,
  Heartbeat: 3,
};

const Event = {
  InitState: "INIT_STATE",
  PresenceUpdate: "PRESENCE_UPDATE",
};

let lanyardHeartbeat;
let spotifyInterval;

document.onreadystatechange = () => {
  if (document.readyState != "complete") return;

  const Elements = {
    Spotify: document.getElementById("album"),
    Name: document.getElementById("name"),
    Artist: document.getElementById("artist"),
    Timestamp: document.getElementById("timestamp"),
  };

  function presenceUpdate(presence) {
    if (!presence.listening_to_spotify) {
      Elements.Name.innerText = "Nothing playing";
      Elements.Artist.innerText = "";
      Elements.Timestamp.innerText = "";
      Elements.Spotify.style.visibility = "hidden"
      clearInterval(spotifyInterval);
    } else {
      var artist = `${presence.spotify.artist.split(";")[0].split(",")[0]}`;
      var song = `${presence.spotify.song.split("(")[0]}`;
      log(presence.spotify);
      Elements.Name.innerText = song;
      Elements.Artist.innerText = artist;
      //   log(Elements.Spotify.style['background-image'])
      Elements.Spotify.style.visibility = "visible"
      Elements.Spotify.src = presence.spotify.album_art_url;

      function updateTimestamp() {
  
        Elements.Timestamp.innerText = `${time(
          new Date().getTime() - presence.spotify.timestamps.start
        )} - ${time(
          presence.spotify.timestamps.end - presence.spotify.timestamps.start
        )}`;
      }

      clearInterval(spotifyInterval);
      spotifyInterval = setInterval(() => updateTimestamp(), 900);
      updateTimestamp();
    }
  }

  function connect() {
    const socket = new WebSocket("wss://api.lanyard.rest/socket");

    function send(op, d) {
      if (socket.readyState != socket.OPEN) return;
      return socket.send(JSON.stringify({ op, d }));
    }

    socket.onopen = () => {
      log("Connected to socket");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.op) {
        case Op.Hello: {
          log("Got hello op");

          lanyardHeartbeat = setInterval(
            () => send(Op.Heartbeat),
            data.d.heartbeat_interval
          );

          send(Op.Initalize, { subscribe_to_id: "937051733773938689" });

          break;
        }
        case Op.Event: {
          switch (data.t) {
            case Event.InitState:
            case Event.PresenceUpdate: {
              presenceUpdate(data.d);
              break;
            }
          }

          break;
        }
      }
    };

    socket.onclose = (event) => {
      clearInterval(lanyardHeartbeat);
      clearInterval(spotifyInterval);
      log("Socket closed", event.reason, event.code);
      connect();
    };
  }

  connect();
};
