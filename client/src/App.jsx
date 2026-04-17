import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import JoinCreateRoom from './components/JoinCreateRoom';
import GameBoard from './components/GameBoard';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Share2, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

function App() {
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [messages, setMessages] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    socket.connect();

    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); setRoom(null); }
    function onRoomCreated(roomData) { setRoom(roomData); }
    function onError({ message }) { setError(message); setTimeout(() => setError(''), 3000); }

    function onGameUpdate(roomData) {
      setRoom(roomData);
      
      // Trigger confetti if someone won or if someone scored in SOS
      if (roomData.status === 'gameOver' && roomData.winner !== 'draw') {
        if (roomData.winner === socket.id) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#1F7A8C', '#D4AF37', '#ffffff']
          });
        }
      }
    }

    function onEmojiReceived({ emoji }) {
      const id = Date.now();
      setFloatingEmojis(prev => [...prev, { id, emoji, x: Math.random() * 80 + 10 + '%' }]);
      setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 2500);
    }

    function onMessageReceived(msg) {
      setMessages(prev => [...prev, msg].slice(-50));
    }

    function onOpponentDisconnected() {
      setError('Opponent disconnected. Arena shutting down...');
      setTimeout(() => { setRoom(null); setError(''); }, 3000);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('roomCreated', onRoomCreated);
    socket.on('gameUpdate', onGameUpdate);
    socket.on('error', onError);
    socket.on('emojiReceived', onEmojiReceived);
    socket.on('messageReceived', onMessageReceived);
    socket.on('opponentDisconnected', onOpponentDisconnected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('roomCreated', onRoomCreated);
      socket.off('gameUpdate', onGameUpdate);
      socket.off('error', onError);
      socket.off('emojiReceived', onEmojiReceived);
      socket.off('messageReceived', onMessageReceived);
      socket.off('opponentDisconnected', onOpponentDisconnected);
    };
  }, []);

  const handleCreateRoom = (playerName, gameType) => {
    socket.emit('createRoom', { playerName, gameType });
  };

  const handleJoinRoom = (roomId, playerName) => {
    socket.emit('joinRoom', { roomId, playerName });
  };

  const handleMove = (index, letter = null) => {
    socket.emit('playerMove', { roomId: room.roomId, index, letter });
  };

  const handleRematch = () => {
    socket.emit('rematchRequest', { roomId: room.roomId });
  };

  const handleSendEmoji = (emoji) => {
    socket.emit('sendEmoji', { roomId: room.roomId, emoji });
    const id = Date.now();
    setFloatingEmojis(prev => [...prev, { id, emoji, x: Math.random() * 80 + 10 + '%' }]);
    setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 2500);
  };

  const handleSendMessage = (message) => {
    const me = room.players.find(p => p.id === socket.id);
    socket.emit('sendMessage', { roomId: room.roomId, message, playerName: me.name });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!room) {
    return (
      <div className="relative overflow-hidden w-full bg-background min-h-screen">
        <div className="fixed -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-highlight/5 rounded-full blur-[120px] pointer-events-none" />
        
        <JoinCreateRoom onCreate={handleCreateRoom} onJoin={handleJoinRoom} error={error} />
        
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/10 text-[8px] font-black tracking-[0.4em] uppercase">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_green]' : 'bg-red-500 shadow-[0_0_8px_red]'}`} />
          {isConnected ? 'NODE CONNECTED' : 'CORE OFFLINE'}
        </div>
      </div>
    );
  }

  if (room.status === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 rounded-[3rem] w-full max-w-md space-y-8 relative overflow-hidden ring-1 ring-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse" />
          
          <div className="space-y-4">
            <Loader2 className="mx-auto text-highlight animate-spin mb-2" size={40} />
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Initializing Arena</h2>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Selected Mode: <span className="text-accent">{room.gameType}</span></p>
          </div>

          <div className="space-y-3">
             <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 relative group hover:bg-white/[0.07] transition-all">
                <span className="text-4xl font-mono text-highlight font-black tracking-[0.3em] ml-[0.3em] drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                  {room.roomId}
                </span>
                <button 
                  onClick={copyCode}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 rounded-2xl hover:bg-accent hover:text-white transition-all shadow-xl"
                >
                  {copied ? <Check size={18} /> : <Share2 size={18} />}
                </button>
             </div>
             <p className="text-[10px] font-black text-accent uppercase tracking-widest italic animate-pulse">
               {copied ? 'Link Encrypted & Copied' : 'Share access code with opponent'}
             </p>
          </div>

          <div className="flex items-center gap-8 justify-center pt-2">
             <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border-2 border-accent text-accent">
                   <span className="font-black text-xs uppercase">Me</span>
                </div>
             </div>
             <div className="h-px w-10 bg-white/5" />
             <div className="flex flex-col items-center gap-2 opacity-20">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center">
                   <div className="w-1 h-1 bg-white/50 rounded-full animate-ping" />
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
       <GameBoard 
         room={room} 
         socketId={socket.id} 
         onMove={handleMove}
         onRematch={handleRematch}
         onSendEmoji={handleSendEmoji}
         emojis={floatingEmojis}
         onSendMessage={handleSendMessage}
         messages={messages}
       />
       
       <AnimatePresence>
         {error && (
           <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 glass-card border-red-500/40 px-6 py-4 rounded-[2rem] flex items-center gap-4 text-red-400 z-[200] shadow-2xl backdrop-blur-xl">
             <div className="p-2 bg-red-400/20 rounded-xl"><AlertCircle size={20} /></div>
             <span className="font-black text-[10px] uppercase tracking-widest">{error}</span>
           </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}

export default App;
