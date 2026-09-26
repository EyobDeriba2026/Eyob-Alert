let peer;
let connection = null;

let audioContext = null;
let alarmInterval = null;

const myId = document.getElementById("myId");
const friendId = document.getElementById("friendId");
const connectBtn = document.getElementById("connectBtn");
const copyBtn = document.getElementById("copyBtn");

const connectionStatus =
  document.getElementById("connectionStatus");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const alertBox = document.getElementById("alertBox");


// ============================
// CREATE YOUR ID
// ============================

peer = new Peer();

peer.on("open", function(id) {

  myId.textContent = id;

});


// ============================
// RECEIVE CONNECTION
// ============================

peer.on("connection", function(conn) {

  connection = conn;

  connectionStatus.textContent =
    "Connected to " + conn.peer;

  conn.on("data", function(data) {

    if (data === "START") {
      receiveStart();
    }

    if (data === "STOP") {
      receiveStop();
    }

  });

  conn.on("close", function() {

    connectionStatus.textContent =
      "Connection closed";

  });

});


// ============================
// CONNECT TO PERSON
// ============================

connectBtn.addEventListener("click", function() {

  const id = friendId.value.trim();

  if (id === "") {
    alert("Enter the person's ID.");
    return;
  }

  connectionStatus.textContent =
    "Connecting...";

  connection = peer.connect(id);

  connection.on("open", function() {

    connectionStatus.textContent =
      "Connected successfully";

  });

  connection.on("close", function() {

    connectionStatus.textContent =
      "Connection closed";

  });

  connection.on("error", function() {

    connectionStatus.textContent =
      "Connection error";

  });

});


// ============================
// START
// ============================

startBtn.addEventListener("click", async function() {

  if (!connection || !connection.open) {

    alert("Connect to the person's ID first.");

    return;
  }

  connection.send("START");

});


// ============================
// STOP
// ============================

stopBtn.addEventListener("click", function() {

  if (connection && connection.open) {
    connection.send("STOP");
  }

});


// ============================
// RECEIVE START
// ============================

async function receiveStart() {

  alertBox.textContent =
    "🚨 EMERGENCY! SOMEONE IS CALLING YOU!";

  alertBox.classList.add("alert-active");

  await startAlarm();

}


// ============================
// RECEIVE STOP
// ============================

function receiveStop() {

  stopAlarm();

  alertBox.textContent =
    "No active alert";

  alertBox.classList.remove("alert-active");

}


// ============================
// ALARM
// ============================

async function startAlarm() {

  if (alarmInterval) {
    return;
  }

  audioContext = new (
    window.AudioContext ||
    window.webkitAudioContext
  )();

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  playBeep();

  alarmInterval = setInterval(function() {

    playBeep();

  }, 800);

}


// ============================
// BEEP
// ============================

function playBeep() {

  if (!audioContext) return;

  const oscillator =
    audioContext.createOscillator();

  const gain =
    audioContext.createGain();

  oscillator.type = "square";

  oscillator.frequency.value = 1000;

  gain.gain.setValueAtTime(
    0.0001,
    audioContext.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.5,
    audioContext.currentTime + 0.03
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioContext.currentTime + 0.5
  );

  oscillator.connect(gain);

  gain.connect(audioContext.destination);

  oscillator.start();

  oscillator.stop(
    audioContext.currentTime + 0.5
  );
}


// ============================
// STOP ALARM
// ============================

function stopAlarm() {

  if (alarmInterval) {

    clearInterval(alarmInterval);

    alarmInterval = null;
  }

  if (audioContext) {

    audioContext.close();

    audioContext = null;
  }

}


// ============================
// COPY ID
// ============================

copyBtn.addEventListener("click", function() {

  navigator.clipboard.writeText(
    myId.textContent
  );

  copyBtn.textContent = "COPIED ✓";

  setTimeout(function() {

    copyBtn.textContent = "COPY ID";

  }, 1500);

});