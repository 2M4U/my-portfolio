/**
 * @author Dustin; Modified by 2M4U.
 * @description Almost fully working Lanyard/Spotify script in pure Vanilla JS.
 * @copyright 2022
 * @private This script MUST remain with this header if you use this script as it's only fair to give credit where due.
 */

function log(...content) {
  let mainContent = content[0];
  if (typeof mainContent == "string") content.shift();
  else mainContent = null;

  console.log(
    `%cLanyard API%c ${mainContent}`,
    "padding: 6px; font-size: 1em; line-height: 1.4em; color: white; background: #151515; border-radius: 15px;",
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
    Album: document.getElementById("album"),
    Timestamp: document.getElementById("timestamp"),
    Icon: document.getElementById("icon"),
    DiscordUsername: document.getElementById("username"),
    DiscordStatus: document.getElementById("status"),
    Avatar: document.getElementById("avatar"),
    Bio: document.getElementById("bio"),
  };

  var status;
  function presenceUpdate(presence) {
    switch (presence.discord_status) {
      case "dnd":
        status = "red";
        break;
      case "idle":
        status = "yellow";
        break;
      case "online":
        status = "green";
        break;
      case "offline":
        status = "grey";
        break;
    }
    if (!presence.listening_to_spotify) {
      Elements.Icon.href = "";
      Elements.Name.innerText = "";
      Elements.Artist.innerText = "";
      Elements.Timestamp.innerText = "";
      Elements.DiscordUsername.innerText = presence.discord_user.username;
      Elements.DiscordStatus.style["background-color"] = status;
      Elements.Album.style.visibility = "hidden";
      Elements.Album.src = "";
      Elements.Avatar.src = `https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}`;
      clearInterval(spotifyInterval);
    } else {
      var artist = `${presence.spotify.artist.split(";")[0].split(",")[0]}`;
      var song = `${presence.spotify.song.split("(")[0]}`;
      var link = presence.spotify.track_id;
      Elements.Icon.href = `https://open.spotify.com/track/${presence.spotify.track_id}`;
      Elements.Name.innerText = song;
      Elements.Artist.innerText = artist;
      Elements.DiscordUsername.innerText = presence.discord_user.username;
      Elements.DiscordStatus.style["background-color"] = status;
      Elements.Avatar.src = `https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}`;
      //   log(Elements.Spotify.style['background-image'])
      Elements.Album.style.visibility = "visible";
      Elements.Album.src = presence.spotify.album_art_url;

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
      log("Connected to Gateway");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.op) {
        case Op.Hello: {
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
      log("Attempting to reconnect.");
      connect();
    };
  }

  connect();
};
console.log(
  "%cWHOA THERE!",
  "color: #314ef5; font-weight: bold;; font-size: 50px"
);
console.log(
  "%cIf someone told you to paste something here, it's VERY likely you're being scammed.",
  "color: white; font-size: 20px"
);
console.log(
  "%cPasting something here could give hackers access to your browser!",
  "color: red; font-size: 25px"
);
console.log(
  "%cCredits to Discord.com for this lovely meme lmao!",
  "color: white; font-size: 15px"
);
console.log(
  "%cAlso, why skid-rip this site when it's opensourced here: https://github.com/2m4u/my-portfolio",
  "color: white; font-size: 10px"
);
