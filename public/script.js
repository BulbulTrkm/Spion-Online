
const socket = io();
let playerName = "";
let lobbyId = "";

document.addEventListener("DOMContentLoaded", () => {
  const savedLobby = localStorage.getItem("lobbyId");
  const savedName = localStorage.getItem("playerName");
  if (savedLobby && savedName) {
    lobbyId = savedLobby;
    playerName = savedName;
    socket.emit("rejoinLobby", { lobbyId, playerName });
  }
});

function createLobby() {
  playerName = document.getElementById("playerNameInput").value;
  if (!playerName) return alert("Bitte Spielernamen eingeben.");
  socket.emit("createLobby", playerName);
}

function joinLobby() {
  playerName = document.getElementById("playerNameInput").value;
  lobbyId = document.getElementById("lobbyCodeInput").value;
  if (!playerName || !lobbyId) return alert("Name und Lobbycode erforderlich.");
  socket.emit("joinLobby", { lobbyId, playerName });
}

function startGame() {
  socket.emit("startGame", lobbyId);
}

socket.on("lobbyCreated", (id) => {
  lobbyId = id;
  localStorage.setItem("lobbyId", lobbyId);
  localStorage.setItem("playerName", playerName);
  showLobby();
});

socket.on("joinedLobby", (data) => {
  lobbyId = data.lobbyId;
  localStorage.setItem("lobbyId", lobbyId);
  localStorage.setItem("playerName", playerName);
  showLobby();
});

socket.on("playerList", (players) => {
  const list = document.getElementById("playerList");
  list.innerHTML = "";
  players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    list.appendChild(li);
  });
});

socket.on("gameStarted", () => {
  document.getElementById("lobbyScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
});

socket.on("lobbyClosed", () => {
  alert("Lobby geschlossen.");
  localStorage.removeItem("lobbyId");
  localStorage.removeItem("playerName");
  location.reload();
});

function showLobby() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("lobbyScreen").style.display = "block";
  document.getElementById("lobbyIdDisplay").textContent = lobbyId;
  document.getElementById("playerNameDisplay").textContent = playerName;
}
