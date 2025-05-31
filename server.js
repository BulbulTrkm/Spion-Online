
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const lobbies = {}; // lobbyId -> { host, players: [{name, socketId}] }

function generateLobbyId() {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

io.on("connection", (socket) => {
  socket.on("createLobby", (name) => {
    const lobbyId = generateLobbyId();
    lobbies[lobbyId] = {
      host: socket.id,
      players: [{ name, socketId: socket.id }]
    };
    socket.join(lobbyId);
    socket.data = { lobbyId, name };
    socket.emit("lobbyCreated", lobbyId);
    io.to(lobbyId).emit("playerList", lobbies[lobbyId].players.map(p => p.name));
  });

  socket.on("joinLobby", ({ lobbyId, name }) => {
    const lobby = lobbies[lobbyId];
    if (lobby) {
      lobby.players.push({ name, socketId: socket.id });
      socket.join(lobbyId);
      socket.data = { lobbyId, name };
      socket.emit("joinedLobby", { lobbyId });
      io.to(lobbyId).emit("playerList", lobby.players.map(p => p.name));
    } else {
      socket.emit("error", "Lobby nicht gefunden.");
    }
  });

  socket.on("rejoinLobby", ({ lobbyId, name }) => {
    const lobby = lobbies[lobbyId];
    if (lobby) {
      lobby.players.push({ name, socketId: socket.id });
      socket.join(lobbyId);
      socket.data = { lobbyId, name };
      socket.emit("joinedLobby", { lobbyId });
      io.to(lobbyId).emit("playerList", lobby.players.map(p => p.name));
    }
  });

  socket.on("startGame", (lobbyId) => {
    const lobby = lobbies[lobbyId];
    if (lobby && lobby.host === socket.id) {
      io.to(lobbyId).emit("gameStarted");
    }
  });

  socket.on("disconnect", () => {
    const { lobbyId, name } = socket.data || {};
    if (lobbyId && lobbies[lobbyId]) {
      const lobby = lobbies[lobbyId];
      lobby.players = lobby.players.filter(p => p.socketId !== socket.id);
      if (socket.id === lobby.host) {
        delete lobbies[lobbyId];
        io.to(lobbyId).emit("lobbyClosed");
      } else {
        io.to(lobbyId).emit("playerList", lobby.players.map(p => p.name));
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Server läuft auf http://localhost:3000");
});
