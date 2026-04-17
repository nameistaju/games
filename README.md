# XOXO Royale ⚔️

A real-time, premium multiplayer Tic Tac Toe experience built with React, Socket.io, and Framer Motion.

## ✨ Features

- **Real-time Gameplay**: Sync moves instantly across players using Socket.io.
- **Room System**: Create a 6-digit room code or join existing ones.
- **Premium UI**: Dark theme with glassmorphism, glowing accents, and smooth animations.
- **Micro-interactions**: 
  - Dynamic X and O drawing animations.
  - Floating emoji reactions.
  - Integrated battle chat log.
  - Confetti celebrations on victory.
- **Responsive Design**: Fully optimized for mobile and desktop screens.
- **Rematch System**: Easily start a new game with your opponent.

## 🚀 Tech Stack

- **Frontend**: Vite + React + Tailwind CSS 4
- **Backend**: Node.js + Express
- **Real-time**: Socket.io
- **Animations**: Framer Motion
- **Visuals**: Lucide React + Canvas Confetti

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd xoxo
```

### 2. Set up the Backend
```bash
cd server
npm install
npm run dev # or node index.js
```
The server runs on `http://localhost:5000` by default.

### 3. Set up the Frontend
```bash
cd client
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## 🎮 How to Play

1.  **Enter your name** on the home screen.
2.  **Create a Room** to generate a unique 6-digit code.
3.  **Share the code** with a friend.
4.  **Join a Room** by entering the code shared with you.
5.  **Battle!** Use emojis to react or chat in the log while playing.

---

Built with ❤️ by Antigravity.
