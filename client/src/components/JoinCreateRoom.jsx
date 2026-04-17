import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, LogIn, Swords, Hash, HelpCircle } from 'lucide-react';

const JoinCreateRoom = ({ onCreate, onJoin, error }) => {
  const [step, setStep] = useState('selection'); // selection, room
  const [gameType, setGameType] = useState('XO');
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleGameSelect = (type) => {
    setGameType(type);
    setStep('room');
  };

  const backToSelection = () => {
    setStep('selection');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 rounded-2xl w-full max-w-md space-y-8 relative overflow-hidden"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6 }}
            className="inline-block"
          >
            <Swords size={48} className="text-highlight mx-auto" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-white text-glow">
            ARCADE <span className="text-accent underline decoration-highlight/30">XOXO</span>
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Premium Multiplayer Arena</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'selection' ? (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="text-center">
                 <h2 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-[0.2em]">Select Your Challenge</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => handleGameSelect('XO')}
                  className="group relative flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-accent hover:bg-accent/5 transition-all duration-300 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    <span className="text-2xl font-black">XO</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Tic Tac Toe</h3>
                    <p className="text-white/40 text-xs">The classic tactical duel</p>
                  </div>
                </button>

                <button
                  onClick={() => handleGameSelect('SOS')}
                  className="group relative flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-highlight hover:bg-highlight/5 transition-all duration-300 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-highlight/20 flex items-center justify-center text-highlight group-hover:bg-highlight group-hover:text-background transition-colors">
                    <span className="text-xl font-black">SOS</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold">SOS Game</h3>
                    <p className="text-white/40 text-xs">Form SOS patterns for points</p>
                  </div>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="room"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                 <button onClick={backToSelection} className="text-[10px] font-bold text-accent uppercase tracking-widest hover:underline">
                   ← Change Game ({gameType})
                 </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Warrior Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="h-px bg-white/10 my-4" />

              {error && <p className="text-red-400 text-[10px] font-bold text-center uppercase animate-pulse">{error}</p>}

              <div className="space-y-4">
                <button
                  onClick={() => onCreate(playerName, gameType)}
                  disabled={!playerName.trim()}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  <PlusCircle size={18} />
                  <span>Create {gameType} Room</span>
                </button>

                <div className="relative py-2 flex items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-4 text-white/20 text-xs font-black italic">VS</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input
                      type="text"
                      placeholder="ROOM CODE"
                      maxLength={6}
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-center text-xl tracking-[0.5em] font-mono outline-none focus:border-highlight transition-colors placeholder:tracking-normal placeholder:font-sans placeholder:text-xs"
                    />
                  </div>
                  <button
                    onClick={() => onJoin(roomId, playerName)}
                    disabled={!playerName.trim() || roomId.length !== 6}
                    className="btn-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogIn size={18} />
                    <span>Join Arena</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="pt-4 flex justify-center">
           <button className="flex items-center gap-2 text-white/20 hover:text-white/40 transition-colors text-[10px] font-bold uppercase">
             <HelpCircle size={12} />
             How to play SOS?
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinCreateRoom;
