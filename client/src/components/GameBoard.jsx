import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, Copy, MessageSquare, Send, Zap, MousePointer2 } from 'lucide-react';

const PlayerBadge = ({ player, isTurn, symbol, isMe, score, gameType }) => (
  <div className={`p-4 rounded-2xl flex items-center gap-3 transition-all duration-500 ${
    isTurn 
      ? 'bg-accent/20 border border-accent ring-4 ring-accent/10 scale-105' 
      : 'bg-white/5 border border-white/5 opacity-60'
  }`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
      symbol === 'X' ? 'bg-highlight text-background' : 'bg-white text-background'
    }`}>
      {gameType === 'XO' ? symbol : (player?.name?.charAt(0) || '?')}
    </div>
    <div className="flex flex-col flex-grow">
      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
        {isMe ? 'YOU' : 'OPPONENT'}
      </span>
      <span className="text-white font-bold truncate max-w-[100px]">{player?.name}</span>
    </div>
    {gameType === 'SOS' && (
      <div className="text-xl font-black text-highlight animate-in fade-in zoom-in">
        {score || 0}
      </div>
    )}
    {isTurn && (
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }} 
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="w-2 h-2 bg-accent rounded-full ml-auto"
      />
    )}
  </div>
);

const XIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-4">
    <motion.line x1="25" y1="25" x2="75" y2="75" stroke="#D4AF37" strokeWidth="12" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
    <motion.line x1="75" y1="25" x2="25" y2="75" stroke="#D4AF37" strokeWidth="12" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.1 }} />
  </svg>
);

const OIcon = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full p-4">
    <motion.circle cx="50" cy="50" r="25" fill="transparent" stroke="white" strokeWidth="12" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
  </svg>
);

const LetterDisplay = ({ letter }) => (
  <motion.span 
    initial={{ scale: 0, rotate: -20 }}
    animate={{ scale: 1, rotate: 0 }}
    className={`text-4xl md:text-5xl font-black ${letter === 'S' ? 'text-highlight' : 'text-white'}`}
  >
    {letter}
  </motion.span>
);

const GameBoard = ({ room, socketId, onMove, onRematch, onSendEmoji, emojis, onSendMessage, messages }) => {
  const me = room.players.find(p => p.id === socketId);
  const opponent = room.players.find(p => p.id !== socketId);
  const myTurn = room.currentTurn === socketId;
  const isGameOver = room.status === 'gameOver';
  
  const [chatMessage, setChatMessage] = useState('');
  const [selectingIdx, setSelectingIdx] = useState(null);

  const handleCellClick = (idx) => {
    if (room.board[idx] || !myTurn || isGameOver) return;
    
    if (room.gameType === 'XO') {
      onMove(idx);
    } else {
      setSelectingIdx(idx);
    }
  };

  const handleSOSMove = (letter) => {
    onMove(selectingIdx, letter);
    setSelectingIdx(null);
  };

  const currentScoreMe = room.scores[socketId] || 0;
  const currentScoreOpp = room.scores[opponent?.id] || 0;
  const iAmWinner = room.winner === socketId;
  const isDraw = room.winner === 'draw';

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen p-4 gap-8 max-w-6xl mx-auto w-full">
      {/* Sidebar */}
      <div className="w-full md:w-80 space-y-4 order-2 md:order-1">
        <div className="glass-card p-4 rounded-3xl space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Game Status</h3>
            <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full">{room.gameType} MODE</span>
          </div>
          
          <PlayerBadge 
            player={me} 
            isTurn={room.currentTurn === socketId && !isGameOver} 
            symbol={me?.symbol} 
            isMe={true} 
            score={currentScoreMe}
            gameType={room.gameType}
          />
          
          <div className="flex justify-center -my-1">
             <div className="text-[10px] font-black text-white/10 uppercase tracking-widest italic animate-bounce">VS</div>
          </div>

          <PlayerBadge 
            player={opponent} 
            isTurn={room.currentTurn === opponent?.id && !isGameOver} 
            symbol={opponent?.symbol} 
            isMe={false} 
            score={currentScoreOpp}
            gameType={room.gameType}
          />
        </div>

        {/* Chat */}
        <div className="glass-card p-4 rounded-3xl flex flex-col h-60">
           <div className="flex items-center gap-2 mb-3 text-white/20">
             <MessageSquare size={14} />
             <span className="text-[8px] font-bold uppercase tracking-widest">Global Comms</span>
           </div>
           
           <div className="flex-grow overflow-y-auto space-y-2 mb-3 pr-2 scrollbar-none">
              {messages.map((msg, i) => (
                <div key={i} className={`text-[11px] p-2 rounded-xl ${msg.from === socketId ? 'bg-accent/10 ml-4 border-l-2 border-accent' : 'bg-white/5 mr-4'}`}>
                  <span className="font-black text-[9px] text-white/30 block mb-0.5 uppercase">
                    {msg.from === socketId ? 'You' : msg.playerName}
                  </span>
                  <span className="text-white/80">{msg.message}</span>
                </div>
              ))}
           </div>

           <form onSubmit={(e) => { e.preventDefault(); if(chatMessage.trim()){ onSendMessage(chatMessage); setChatMessage(''); } }} className="flex gap-2">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type here..."
                className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-accent"
              />
              <button type="submit" className="p-2 bg-accent/20 text-accent rounded-xl hover:bg-accent hover:text-white transition-all">
                <Send size={14} />
              </button>
           </form>
        </div>
      </div>

      {/* Main Board */}
      <div className="flex-grow flex flex-col items-center justify-center order-1 md:order-2 w-full pt-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
          {/* Room ID */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 group cursor-pointer hover:bg-white/10 transition-all">
             <span className="text-[9px] uppercase font-black text-white/30 tracking-widest">Arena:</span>
             <span className="text-xs font-mono text-highlight font-black tracking-widest uppercase">{room.roomId}</span>
             <Copy size={12} className="text-white/20 group-hover:text-highlight transition-colors" />
          </div>

          {/* Winning Progress - Current Player Highlight */}
          {myTurn && !isGameOver && (
             <motion.div 
               animate={{ y: [0, -5, 0], opacity: [0.6, 1, 0.6] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="absolute -top-4 -right-4 bg-accent p-2 rounded-xl text-white shadow-lg z-20"
             >
                <Zap size={16} fill="currentColor" />
             </motion.div>
          )}

          <div className="grid grid-cols-3 gap-3 bg-white/5 p-4 rounded-[2.5rem] border border-white/10 relative shadow-2xl overflow-hidden">
            {room.board.map((cell, i) => (
              <motion.button
                key={i}
                whileHover={!cell && myTurn && !isGameOver ? { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}}
                whileTap={!cell && myTurn && !isGameOver ? { scale: 0.95 } : {}}
                onClick={() => handleCellClick(i)}
                className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center transition-all relative ${
                  !cell && myTurn && !isGameOver ? 'cursor-pointer hover:shadow-inner' : 'cursor-default'
                } ${cell ? 'bg-white/5' : 'bg-white/2'}`}
              >
                <AnimatePresence>
                  {room.gameType === 'XO' ? (
                    <>
                      {cell === 'X' && <XIcon />}
                      {cell === 'O' && <OIcon />}
                    </>
                  ) : (
                    cell && <LetterDisplay letter={cell} />
                  )}
                </AnimatePresence>

                {/* SOS Selector Popup */}
                <AnimatePresence>
                  {selectingIdx === i && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0, y: 10 }}
                      className="absolute inset-0 z-50 bg-background/90 rounded-3xl flex flex-col items-center justify-center gap-2 border border-accent/30 shadow-2xl backdrop-blur-md"
                    >
                      <span className="text-[8px] font-black text-white/40 mb-1 tracking-widest">CHOOSE</span>
                      <div className="flex gap-3">
                        <button onClick={() => handleSOSMove('S')} className="w-10 h-10 rounded-xl bg-highlight text-background font-black text-lg hover:scale-110 transition-transform">S</button>
                        <button onClick={() => handleSOSMove('O')} className="w-10 h-10 rounded-xl bg-white text-background font-black text-lg hover:scale-110 transition-transform">O</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}

            {/* XO Win Line */}
            {room.gameType === 'XO' && room.winningLine && <WinningLine line={room.winningLine} color="#D4AF37" />}

            {/* SOS Win Lines */}
            {room.gameType === 'SOS' && room.winningLines.map((line, idx) => (
               <WinningLine key={idx} line={line} color={idx % 2 === 0 ? "#D4AF37" : "#1F7A8C"} isMulti={true} />
            ))}
          </div>
        </motion.div>

        {/* Emoji Bar */}
        <div className="flex gap-4 mt-8 bg-white/5 p-3 rounded-2xl border border-white/5">
           {['🔥', '😎', '😂', '💀', '👍', '🙏'].map(emoji => (
             <motion.button
               key={emoji}
               whileHover={{ scale: 1.3, y: -5, rotate: 10 }}
               whileTap={{ scale: 0.9 }}
               onClick={() => onSendEmoji(emoji)}
               className="text-2xl grayscale hover:grayscale-0 transition-all duration-300 filter drop-shadow-md"
             >
               {emoji}
             </motion.button>
           ))}
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {isGameOver && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 text-center space-y-4"
            >
              <div className="space-y-1">
                <h2 className={`text-5xl font-black italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] ${
                  isDraw ? 'text-white' : (iAmWinner ? 'text-highlight' : 'text-red-500')
                }`}>
                  {isDraw ? 'DRAW 🤝' : (iAmWinner ? 'VICTORY 🎉' : 'DEFEAT 😢')}
                </h2>
                <div className="flex items-center justify-center gap-2">
                   <div className="h-px w-8 bg-white/10" />
                   <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-black">
                    {room.gameType === 'SOS' ? `Final Score: ${currentScoreMe} - ${currentScoreOpp}` : 'Arena Match Ended'}
                   </p>
                   <div className="h-px w-8 bg-white/10" />
                </div>
              </div>

              <div className="flex gap-4 justify-center pt-2">
                <button onClick={onRematch} className="btn-primary">
                  <RotateCcw size={18} />
                   Elite Rematch
                </button>
              </div>
              
              {room.rematchRequests.includes(opponent?.id) && (
                <p className="text-accent text-[10px] font-black uppercase tracking-widest animate-pulse mt-4">Opponent is ready for vengeance!</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Emojis */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[100]">
           {emojis.map(e => (
             <motion.div
               key={e.id}
               initial={{ y: '100vh', x: e.x, opacity: 0, scale: 0.5, rotate: Math.random() * 360 }}
               animate={{ y: '-20vh', opacity: [0, 1, 1, 0], scale: [0.5, 2, 2, 1.5], rotate: Math.random() * 360 }}
               transition={{ duration: 2.5, ease: "easeOut" }}
               className="absolute text-5xl select-none"
             >
               {e.emoji}
             </motion.div>
           ))}
        </div>
      </div>

      {/* Stats Card */}
      <div className="w-full md:w-60 order-3 space-y-6 hidden lg:block">
         <div className="glass-card p-6 rounded-[2rem] text-center space-y-6 border-highlight/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-highlight/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
            <Trophy className="mx-auto text-highlight drop-shadow-[0_0_10px_#D4AF37]" size={36} />
            <div className="space-y-1 relative">
               <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Battle Rank</h4>
               <div className="text-2xl font-black text-white italic tracking-tighter">ELITE WIZARD</div>
            </div>
            <div className="h-px bg-white/5" />
            <div className="text-[9px] text-white/20 font-bold uppercase tracking-widest leading-relaxed">
              Winning streaks grant higher visibility in the global hall of fame.
            </div>
            <div className="flex justify-center gap-1">
               {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i <= 3 ? 'bg-highlight' : 'bg-white/10'}`} />)}
            </div>
         </div>
      </div>
    </div>
  );
};

const WinningLine = ({ line, color, isMulti }) => {
  const getStyle = () => {
    const isRow = Math.abs(line[0] - line[1]) === 1;
    const isCol = Math.abs(line[0] - line[1]) === 3;
    const isDiagDown = line[0] === 0 && line[2] === 8;
    const isDiagUp = line[0] === 2 && line[2] === 6;

    const base = {
      position: 'absolute',
      backgroundColor: color,
      borderRadius: '4px',
      boxShadow: `0 0 15px ${color}`,
      zIndex: 10,
    };

    if (isRow) {
      const row = Math.floor(line[0] / 3);
      return { ...base, top: `${row * 33.3 + 16.6}%`, left: '10%', width: '80%', height: '4px', transform: 'scaleX(0)', transformOrigin: 'left' };
    }
    if (isCol) {
      const col = line[0];
      return { ...base, left: `${col * 33.3 + 16.6}%`, top: '10%', height: '80%', width: '4px', transform: 'scaleY(0)', transformOrigin: 'top' };
    }
    if (isDiagDown) {
      return { ...base, top: '50%', left: '10%', width: '110%', height: '4px', transform: 'rotate(45deg) scaleX(0)', transformOrigin: 'left' };
    }
    if (isDiagUp) {
      return { ...base, top: '50%', left: '10%', width: '110%', height: '4px', transform: 'rotate(-45deg) scaleX(0)', transformOrigin: 'left' };
    }
    return base;
  };

  const style = getStyle();
  const isCol = style.height === '80%';

  return (
    <motion.div 
      initial={isCol ? { scaleY: 0 } : { scaleX: 0 }}
      animate={isCol ? { scaleY: 1 } : { scaleX: 1 }}
      transition={{ duration: 0.6, ease: "circOut" }}
      style={style}
    />
  );
};

export default GameBoard;
