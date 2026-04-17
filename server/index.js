const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = new Map();

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("createRoom", ({ playerName, gameType = "XO" }) => {
    const roomId = generateRoomCode();
    const roomData = {
      roomId,
      gameType,
      players: [
        { id: socket.id, name: playerName || "Player 1", symbol: "X" },
      ],
      board: Array(9).fill(null),
      currentTurn: socket.id,
      status: "waiting",
      winner: null,
      winningLine: null, // For XO
      winningLines: [],  // For SOS
      scores: {},        // For SOS: { [socketId]: 0 }
      rematchRequests: [],
    };
    rooms.set(roomId, roomData);
    socket.join(roomId);
    socket.emit("roomCreated", roomData);
    console.log(`Room created: ${roomId} (${gameType}) by ${socket.id}`);
  });

  socket.on("joinRoom", ({ roomId, playerName }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit("error", { message: "Room is full" });
      return;
    }

    room.players.push({
      id: socket.id,
      name: playerName || "Player 2",
      symbol: "O",
    });
    
    // Initialize scores for both players if SOS
    if (room.gameType === "SOS") {
      room.players.forEach(p => {
        room.scores[p.id] = 0;
      });
    }

    room.status = "playing";
    socket.join(roomId);
    io.to(roomId).emit("gameUpdate", room);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on("playerMove", ({ roomId, index, letter }) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== "playing") return;
    if (room.currentTurn !== socket.id) return;
    if (room.board[index] !== null) return;

    if (room.gameType === "XO") {
      const currentPlayer = room.players.find((p) => p.id === socket.id);
      room.board[index] = currentPlayer.symbol;

      const winResult = checkWinnerXO(room.board);
      if (winResult) {
        room.status = "gameOver";
        room.winner = socket.id;
        room.winningLine = winResult.line;
      } else if (room.board.every((cell) => cell !== null)) {
        room.status = "gameOver";
        room.winner = "draw";
      } else {
        const nextPlayer = room.players.find((p) => p.id !== socket.id);
        room.currentTurn = nextPlayer.id;
      }
    } else if (room.gameType === "SOS") {
      // letter should be 'S' or 'O'
      room.board[index] = letter;
      
      const newPatterns = checkSOS(room.board, index);
      if (newPatterns.length > 0) {
        room.scores[socket.id] += newPatterns.length;
        // Collect new unique lines
        newPatterns.forEach(pattern => {
          room.winningLines.push(pattern);
        });
        
        // Check if board full
        if (room.board.every(cell => cell !== null)) {
          room.status = "gameOver";
          const p1 = room.players[0].id;
          const p2 = room.players[1].id;
          if (room.scores[p1] > room.scores[p2]) {
            room.winner = p1;
          } else if (room.scores[p2] > room.scores[p1]) {
            room.winner = p2;
          } else {
            room.winner = "draw";
          }
        }
        // Turn stays with current player because they scored
      } else {
        // No SOS formed, check if board full
        if (room.board.every(cell => cell !== null)) {
          room.status = "gameOver";
          const p1 = room.players[0].id;
          const p2 = room.players[1].id;
          if (room.scores[p1] > room.scores[p2]) {
            room.winner = p1;
          } else if (room.scores[p2] > room.scores[p1]) {
            room.winner = p2;
          } else {
            room.winner = "draw";
          }
        } else {
          // Switch turn
          const nextPlayer = room.players.find((p) => p.id !== socket.id);
          room.currentTurn = nextPlayer.id;
        }
      }
    }

    io.to(roomId).emit("gameUpdate", room);
  });

  socket.on("rematchRequest", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    if (!room.rematchRequests.includes(socket.id)) {
      room.rematchRequests.push(socket.id);
    }

    if (room.rematchRequests.length === 2) {
      room.board = Array(9).fill(null);
      room.status = "playing";
      room.winner = null;
      room.winningLine = null;
      room.winningLines = [];
      room.rematchRequests = [];
      if (room.gameType === "SOS") {
        room.players.forEach(p => room.scores[p.id] = 0);
      }
      io.to(roomId).emit("gameUpdate", room);
    } else {
      io.to(roomId).emit("rematchRequested", { from: socket.id });
    }
  });

  socket.on("sendEmoji", ({ roomId, emoji }) => {
    socket.to(roomId).emit("emojiReceived", { from: socket.id, emoji });
  });

  socket.on("sendMessage", ({ roomId, message, playerName }) => {
    io.to(roomId).emit("messageReceived", { from: socket.id, message, playerName, time: new Date() });
  });

  socket.on("disconnect", () => {
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);
      if (playerIndex !== -1) {
        socket.to(roomId).emit("opponentDisconnected");
        rooms.delete(roomId);
        break;
      }
    }
  });
});

function checkWinnerXO(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

function checkSOS(board, index) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6],           // Diagonals
  ];
  
  const newlyFormed = [];
  
  // A pattern is formed if any of the predefined lines equals ["S", "O", "S"]
  // AND the current index is part of that line.
  for (let line of lines) {
    if (line.includes(index)) {
      const pattern = line.map(idx => board[idx]).join("");
      if (pattern === "SOS") {
        newlyFormed.push(line);
      }
    }
  }
  
  return newlyFormed;
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
