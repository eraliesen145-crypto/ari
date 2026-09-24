import React, { useEffect, useRef, useState } from 'react';
import { HeroDefinition, WeaponDefinition, ArenaDefinition, GameMode, AIDifficulty, MatchResult } from '../types/game';
import { FightEngine } from '../game/engine';
import { HUD } from './HUD';
import { TouchControls } from './TouchControls';
import { VictoryModal } from './VictoryModal';
import { progression } from '../game/progression';
import { sound } from '../game/sound';
import { useLanguage } from '../game/i18n';
import { Play, RotateCcw, Home } from 'lucide-react';

interface FightViewProps {
  p1Hero: HeroDefinition;
  p1Weapon: WeaponDefinition;
  p2Hero: HeroDefinition;
  p2Weapon: WeaponDefinition;
  arena: ArenaDefinition;
  mode: GameMode;
  difficulty: AIDifficulty;
  showTouchControls: boolean;
  onExitFight: () => void;
  onChangeHero: () => void;
}

export const FightView: React.FC<FightViewProps> = ({
  p1Hero,
  p1Weapon,
  p2Hero,
  p2Weapon,
  arena,
  mode,
  difficulty,
  showTouchControls,
  onExitFight,
  onChangeHero,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<FightEngine | null>(null);

  const [, setTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const { t } = useLanguage();

  // Initialize engine and canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const engine = new FightEngine(canvasRef.current);
    engineRef.current = engine;

    // Handle canvas dimensions
    const updateDimensions = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      engine.setSize(rect.width, rect.height);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Setup match callbacks
    engine.onStateUpdate = () => {
      setTick(t => (t + 1) % 1000);
    };

    engine.onMatchEnd = (result: MatchResult) => {
      setMatchResult(result);
      // Record progress to storage
      progression.recordMatch(
        result.winnerId === 'p1',
        result.xpEarned,
        Math.max(result.p1Stats.maxCombo, result.p2Stats.maxCombo)
      );
    };

    // Initialize fight
    engine.init(p1Hero, p1Weapon, p2Hero, p2Weapon, arena, mode, difficulty);
    engine.start();

    return () => {
      window.removeEventListener('resize', updateDimensions);
      engine.stop();
      engineRef.current = null;
    };
  }, [p1Hero, p1Weapon, p2Hero, p2Weapon, arena, mode, difficulty]);

  const handleTogglePause = () => {
    if (!engineRef.current || matchResult) return;
    const nextPause = !isPaused;
    engineRef.current.isPaused = nextPause;
    setIsPaused(nextPause);
    sound.playUiClick();
  };

  const handleRematch = () => {
    if (!engineRef.current) return;
    setMatchResult(null);
    setIsPaused(false);
    engineRef.current.init(p1Hero, p1Weapon, p2Hero, p2Weapon, arena, mode, difficulty);
  };

  const handleResetTraining = () => {
    if (!engineRef.current) return;
    engineRef.current.p1.x = 240;
    engineRef.current.p1.y = engineRef.current.floorY;
    engineRef.current.p1.hp = engineRef.current.p1.maxHp;
    engineRef.current.p1.energy = engineRef.current.p1.maxEnergy;

    engineRef.current.p2.x = 760;
    engineRef.current.p2.y = engineRef.current.floorY;
    engineRef.current.p2.hp = engineRef.current.p2.maxHp;
    engineRef.current.p2.energy = engineRef.current.p2.maxEnergy;

    sound.playUiSelect();
  };

  const engine = engineRef.current;

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* 2D Canvas Arena */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Combat HUD Overlay */}
      {engine && engine.p1 && engine.p2 && (
        <HUD
          p1={engine.p1}
          p2={engine.p2}
          timeLeft={engine.roundTimeLeft}
          mode={mode}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onResetTraining={handleResetTraining}
          onExitFight={onExitFight}
        />
      )}

      {/* Mobile Touch Controls */}
      {showTouchControls && engine && engine.p1 && !matchResult && !isPaused && (
        <TouchControls abilityName={engine.p1.hero.ability.name} />
      )}

      {/* In-Game Pause Menu Modal */}
      {isPaused && !matchResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
            <h3 className="font-title text-3xl font-black text-amber-400 tracking-wider mb-6">
              {t('paused')}
            </h3>

            <div className="w-full space-y-3">
              <button
                onClick={handleTogglePause}
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" /> {t('resumeFight')}
              </button>

              <button
                onClick={handleRematch}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm tracking-wider uppercase rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> {t('restartMatch')}
              </button>

              <button
                onClick={onExitFight}
                className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-sm tracking-wider uppercase rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" /> {t('quitToMenu')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Match Victory / Defeat Modal */}
      {matchResult && (
        <VictoryModal
          result={matchResult}
          mode={mode}
          onRematch={handleRematch}
          onChangeHero={onChangeHero}
          onMainMenu={onExitFight}
        />
      )}
    </div>
  );
};
