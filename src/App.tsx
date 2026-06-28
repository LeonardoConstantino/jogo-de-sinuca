import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Game } from './core/Game';
import { BALL_CONFIGS } from './config/constants';
import { GameState } from './types';
import { Trophy, RotateCcw, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  // Sync state from Game instance to React for UI re-renders
  const [gameState, setGameState] = useState<GameState>(GameState.AIMING);
  const [gameMessage, setGameMessage] = useState<string>('');
  const [shotsCount, setShotsCount] = useState<number>(0);
  const [scratchCount, setScratchCount] = useState<number>(0);
  const [ballsSunkCount, setBallsSunkCount] = useState<number>(0);
  const [pocketedList, setPocketedList] = useState<number[]>([]);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isDefeat, setIsDefeat] = useState<boolean>(false);

  // Sync function called by the Game instance when logic changes state or stats
  const syncGameState = () => {
    if (!gameRef.current) return;
    const game = gameRef.current;
    
    setGameState(game.stateManager.currentState);
    setGameMessage(game.stateManager.gameMessage);
    setShotsCount(game.stateManager.stats.shots);
    setScratchCount(game.stateManager.stats.cueSunkCount);
    setBallsSunkCount(game.stateManager.stats.ballsSunk);
    setIsVictory(game.stateManager.isVictory);
    setIsDefeat(game.stateManager.isDefeat);

    // Sync pocketed ball numbers
    const sunkNumbers = game.balls
      .filter(b => b.type !== 'cue' && b.isPocketed)
      .map(b => b.number)
      .sort((a, b) => a - b);
    setPocketedList(sunkNumbers);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create the game instance
    const gameInstance = new Game(canvasRef.current, syncGameState);
    gameRef.current = gameInstance;

    // Initial sync
    syncGameState();

    // Clean up on unmount
    return () => {
      gameInstance.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.restart();
      syncGameState();
    }
  };

  // Get ball configuration for visual listings
  const getBallStyle = (num: number) => {
    const cfg = BALL_CONFIGS.find(b => b.number === num);
    return {
      color: cfg?.color || '#ffffff',
      type: cfg?.type || 'solid'
    };
  };

  // List of all 15 object balls
  const allBallNumbers = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-6 font-sans">
      {/* BACKGROUND DECORATIVE ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      {/* HEADER SECTION */}
      <header className="w-full max-w-6xl mx-auto z-10 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-emerald-600 to-emerald-400 p-2.5 rounded-xl shadow-lg shadow-emerald-900/30">
            <span className="text-2xl">🎱</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-200 bg-clip-text text-transparent">
              Sinuca Master Class
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Física de Alta Precisão & Estilo em TypeScript
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-sm font-medium px-4 py-2.5 rounded-xl transition duration-200 border border-slate-700 hover:border-emerald-500/40 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            Reiniciar Partida
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="w-full max-w-6xl mx-auto z-10 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start my-2">
        
        {/* LEFT PANEL: STATS & PROGRESS */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col gap-5 backdrop-blur-md shadow-xl h-full">
          <h2 className="text-sm font-semibold tracking-wider uppercase text-emerald-400 font-mono border-b border-slate-800 pb-2">
            Estatísticas
          </h2>

          <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
            {/* STAT 1: SHOTS */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-0.5">Tacadas</span>
              <span className="text-2xl font-bold text-white font-mono">{shotsCount}</span>
            </div>

            {/* STAT 2: Sunk Balls */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-0.5">Encaçapadas</span>
              <span className="text-2xl font-bold text-amber-400 font-mono">
                {ballsSunkCount} <span className="text-xs text-slate-500">/ 15</span>
              </span>
            </div>

            {/* STAT 3: SCRATCHES */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-0.5">Penalidades</span>
              <span className={`text-2xl font-bold font-mono ${scratchCount > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                {scratchCount}
              </span>
            </div>
          </div>

          {/* RACK PROGRESS CARD */}
          <div className="flex-1 flex flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 font-mono mt-2">
              Estado do Rack (1 - 15)
            </h3>
            
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 flex flex-wrap gap-2.5 items-center justify-center">
              {allBallNumbers.map((num) => {
                const isSunk = pocketedList.includes(num);
                const ball = getBallStyle(num);
                
                return (
                  <div
                    key={num}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all duration-300 ${
                      isSunk 
                        ? 'opacity-20 scale-90 border border-transparent grayscale' 
                        : 'scale-100 border border-slate-800 hover:scale-105'
                    }`}
                    style={{
                      background: isSunk ? 'rgba(30, 41, 59, 0.4)' : ball.color,
                      color: num === 8 ? '#ffffff' : '#18181b'
                    }}
                    title={`Bola ${num} (${ball.type}) - ${isSunk ? 'Encaçapada' : 'Na mesa'}`}
                  >
                    {/* Stripe line representation overlay */}
                    {!isSunk && ball.type === 'striped' && (
                      <div className="absolute inset-0 rounded-full border-t-[7px] border-b-[7px] border-white pointer-events-none opacity-90" />
                    )}
                    {/* Small white center circle for number */}
                    {!isSunk && (
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center z-10 scale-90">
                        <span className="text-[9px] font-mono leading-none text-slate-950">{num}</span>
                      </div>
                    )}
                    {/* Sunk Overlay Check */}
                    {isSunk && <span className="text-slate-600 text-[10px] font-mono">X</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TIPS BOARD */}
          <div className="bg-emerald-950/20 border border-emerald-900/30 p-3.5 rounded-xl text-xs text-emerald-300/90 leading-relaxed flex gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold block mb-0.5">Dica Profissional</span>
              Puxe o mouse mais para trás para conseguir tacadas de alta potência. Use o guia tracejado para planejar rebotes tabelados perfeitos!
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: GAME TABLE CANVAS */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* STATE CONSOLE / ALERT BANNER */}
          <div className="w-full bg-slate-900 border border-slate-800 px-4 py-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2 rounded-xl shrink-0 ${
                gameState === GameState.GAME_OVER 
                  ? 'bg-rose-500/20 text-rose-400' 
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {gameState === GameState.GAME_OVER ? <Trophy className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <p className="text-sm text-slate-200 leading-snug font-medium truncate">
                {gameMessage}
              </p>
            </div>
            
            <div className="shrink-0 flex items-center gap-1.5 font-mono text-[10px] uppercase bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${
                gameState === GameState.BALLS_MOVING ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`} />
              {gameState === GameState.BALLS_MOVING ? 'Processando Física' : 'Esperando Jogador'}
            </div>
          </div>

          {/* TABLE CONTAINER FRAME */}
          <div className="relative w-full aspect-[2/1] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 md:p-8 flex items-center justify-center">
            {/* CANVAS WRAPPER with scaling */}
            <div className="w-full max-w-[800px] aspect-[2/1] relative z-10 flex items-center justify-center">
              <canvas
                id="billiards-canvas"
                ref={canvasRef}
                width={800}
                height={400}
                className="w-full h-full bg-transparent block select-none cursor-crosshair rounded-lg touch-none"
              />
            </div>

            {/* OVERLAY SCREENS FOR WIN / LOSS */}
            {gameState === GameState.GAME_OVER && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center"
              >
                {isVictory ? (
                  <div className="max-w-md flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl animate-bounce">
                      🏆
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                      Vitória Espetacular!
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Você limpou todas as bolas e encaçapou a bola 8 preta de forma legal. Suas habilidades são inquestionáveis!
                    </p>
                    <div className="bg-slate-900 border border-slate-800 py-2.5 px-6 rounded-xl font-mono text-xs text-slate-400">
                      Total de Tacadas: <span className="font-bold text-emerald-400 text-base ml-1">{shotsCount}</span>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 text-3xl">
                      💀
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
                      Falta Grave (Derrota)
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      A bola 8 preta caiu na caçapa antes que o resto da mesa estivesse completamente limpa. Isso é uma derrota instantânea!
                    </p>
                  </div>
                )}

                <button
                  onClick={handleRestart}
                  className="mt-6 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-emerald-950/40 hover:shadow-emerald-900/50 hover:scale-105 transition duration-200 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Jogar Novamente
                </button>
              </motion.div>
            )}
          </div>

          {/* FOOTER SHORTCUTS / HOW-TO LEGEND */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl text-xs text-slate-400">
            <div className="flex items-center gap-2.5">
              <span className="font-bold font-mono bg-slate-950 border border-slate-800 text-slate-200 px-2 py-1 rounded">MIRA</span>
              <span>Mova o mouse sobre a mesa para mirar o taco.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold font-mono bg-slate-950 border border-slate-800 text-slate-200 px-2 py-1 rounded">FORÇA</span>
              <span>Pressione o botão esquerdo e arraste para trás.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-bold font-mono bg-slate-950 border border-slate-800 text-slate-200 px-2 py-1 rounded">DISPARO</span>
              <span>Solte o botão do mouse para desferir a tacada.</span>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER SECTION */}
      <footer className="w-full max-w-6xl mx-auto z-10 border-t border-slate-900 pt-4 mt-6 text-center flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-[10px] text-slate-500 font-mono">
          © 2026 Sinuca Master Class MVP. Todos os direitos reservados.
        </p>
        <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 justify-center">
          Construído com <span className="text-emerald-500">TypeScript</span> + <span className="text-emerald-500">React</span> + <span className="text-emerald-500">HTML5 Canvas</span>
        </p>
      </footer>
    </div>
  );
}
