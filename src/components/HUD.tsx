import React from 'react';
import { PlayerFighterState, GameMode } from '../types/game';
import { Pause, Play, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { sound } from '../game/sound';
import { useLanguage, getLocalizedHero, getLocalizedWeapon } from '../game/i18n';

interface HUDProps {
  p1: PlayerFighterState;
  p2: PlayerFighterState;
  timeLeft: number;
  mode: GameMode;
  isPaused: boolean;
  onTogglePause: () => void;
  onResetTraining?: () => void;
  onExitFight: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  p1,
  p2,
  timeLeft,
  mode,
  isPaused,
  onTogglePause,
  onResetTraining,
  onExitFight,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.isMuted);
  const { language, t } = useLanguage();

  const toggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const locP1Hero = getLocalizedHero(p1.hero, language);
  const locP1Weapon = getLocalizedWeapon(p1.weapon, language);
  const locP2Hero = getLocalizedHero(p2.hero, language);
  const locP2Weapon = getLocalizedWeapon(p2.weapon, language);

  const p1HpPercent = Math.max(0, Math.min(100, (p1.hp / p1.maxHp) * 100));
  const p1BufferedHpPercent = Math.max(0, Math.min(100, (p1.bufferedHp / p1.maxHp) * 100));
  const p1EnergyPercent = Math.max(0, Math.min(100, (p1.energy / p1.maxEnergy) * 100));

  const p2HpPercent = Math.max(0, Math.min(100, (p2.hp / p2.maxHp) * 100));
  const p2BufferedHpPercent = Math.max(0, Math.min(100, (p2.bufferedHp / p2.maxHp) * 100));
  const p2EnergyPercent = Math.max(0, Math.min(100, (p2.energy / p2.maxEnergy) * 100));

  const p1AbilityCdSec = Math.max(0, Math.ceil(p1.abilityCooldown / 1000));
  const p2AbilityCdSec = Math.max(0, Math.ceil(p2.abilityCooldown / 1000));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* --- TOP ROW: FIGHTER BARS & TIMER --- */}
      <div className="w-full flex items-start justify-between gap-2 sm:gap-6">
        {/* P1 HEALTH & ENERGY */}
        <div className="flex-1 max-w-[42%] flex flex-col items-start gap-1">
          <div className="flex items-baseline justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="font-title text-base sm:text-xl font-bold tracking-wider text-amber-400 drop-shadow">
                {locP1Hero.name}
              </span>
              <span className="text-xs text-slate-400 hidden md:inline truncate max-w-[120px]">
                {locP1Weapon.name}
              </span>
            </div>
            <span className="font-mono text-xs text-slate-300 tabular-nums">
              {Math.max(0, Math.round(p1.hp))} / {p1.maxHp}
            </span>
          </div>

          {/* HP Bar */}
          <div className="w-full h-4 sm:h-5 bg-slate-950/80 border border-slate-700/80 rounded-sm relative overflow-hidden shadow-inner">
            {/* Red buffer bar (delayed damage) */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-red-800 transition-all duration-300"
              style={{ width: `${p1BufferedHpPercent}%` }}
            />
            {/* Primary green/amber HP bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 transition-[width] duration-75"
              style={{ width: `${p1HpPercent}%` }}
            />
          </div>

          {/* Energy Bar & Ability Status */}
          <div className="w-full flex items-center gap-2">
            <div className="flex-1 h-2 sm:h-2.5 bg-slate-950/80 border border-slate-800 rounded-sm relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-[width] duration-75"
                style={{ width: `${p1EnergyPercent}%` }}
              />
            </div>
            <div
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors truncate max-w-[120px] ${
                p1AbilityCdSec > 0 || p1.energy < p1.hero.ability.energyCost
                  ? 'border-slate-700 text-slate-500 bg-slate-900/60'
                  : 'border-cyan-400 text-cyan-200 bg-cyan-950/80 animate-pulse'
              }`}
            >
              {p1AbilityCdSec > 0 ? `${p1AbilityCdSec}${t('cooldownSec').trim()}` : locP1Hero.ability.name}
            </div>
          </div>
        </div>

        {/* CENTER: TIME & CONTROLS */}
        <div className="flex flex-col items-center shrink-0 pt-1">
          <div className="bg-slate-950/90 border border-amber-500/40 px-3 py-1 rounded shadow-lg flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold font-display">
              {mode === 'TRAINING' ? (language === 'ru' ? 'ТРЕНИРОВКА' : 'TRAINING') : (language === 'ru' ? 'ВРЕМЯ' : 'TIME')}
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-amber-300 tabular-nums">
              {mode === 'TRAINING' ? '∞' : Math.max(0, Math.ceil(timeLeft))}
            </span>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-1.5 mt-2 pointer-events-auto">
            <button
              onClick={onTogglePause}
              className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isPaused ? t('resumeFight') : t('pause')}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            {mode === 'TRAINING' && onResetTraining && (
              <button
                onClick={onResetTraining}
                className="p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={t('reset')}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* P2 HEALTH & ENERGY */}
        <div className="flex-1 max-w-[42%] flex flex-col items-end gap-1">
          <div className="flex items-baseline justify-between w-full flex-row-reverse">
            <div className="flex items-center gap-2 flex-row-reverse">
              <span className="font-title text-base sm:text-xl font-bold tracking-wider text-rose-400 drop-shadow">
                {locP2Hero.name}
              </span>
              <span className="text-xs text-slate-400 hidden md:inline truncate max-w-[120px]">
                {locP2Weapon.name}
              </span>
            </div>
            <span className="font-mono text-xs text-slate-300 tabular-nums">
              {Math.max(0, Math.round(p2.hp))} / {p2.maxHp}
            </span>
          </div>

          {/* HP Bar (reversed fill) */}
          <div className="w-full h-4 sm:h-5 bg-slate-950/80 border border-slate-700/80 rounded-sm relative overflow-hidden shadow-inner">
            <div
              className="absolute right-0 top-0 bottom-0 bg-red-800 transition-all duration-300"
              style={{ width: `${p2BufferedHpPercent}%` }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-rose-500 via-red-500 to-amber-500 transition-[width] duration-75"
              style={{ width: `${p2HpPercent}%` }}
            />
          </div>

          {/* Energy Bar & Ability Status */}
          <div className="w-full flex items-center justify-end gap-2 flex-row-reverse">
            <div className="flex-1 h-2 sm:h-2.5 bg-slate-950/80 border border-slate-800 rounded-sm relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-purple-500 to-indigo-500 transition-[width] duration-75 ml-auto"
                style={{ width: `${p2EnergyPercent}%` }}
              />
            </div>
            <div
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors truncate max-w-[120px] ${
                p2AbilityCdSec > 0 || p2.energy < p2.hero.ability.energyCost
                  ? 'border-slate-700 text-slate-500 bg-slate-900/60'
                  : 'border-purple-400 text-purple-200 bg-purple-950/80'
              }`}
            >
              {p2AbilityCdSec > 0 ? `${p2AbilityCdSec}${t('cooldownSec').trim()}` : locP2Hero.ability.name}
            </div>
          </div>
        </div>
      </div>

      {/* --- COMBO COUNTERS --- */}
      <div className="w-full flex items-center justify-between px-6 pointer-events-none">
        {/* P1 Combo */}
        <div>
          {p1.comboCount >= 2 && (
            <div className="flex flex-col items-start animate-bounce">
              <span className="font-title text-2xl sm:text-4xl font-black italic tracking-wider text-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.6)]">
                {t('combo')} x{p1.comboCount}
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-white/90">
                {p1.comboCount >= 5 ? (language === 'ru' ? '🔥 СОКРУШИТЕЛЬНЫЙ УДАР!' : '🔥 DEVASTATING HIT!') : (language === 'ru' ? 'СЕРИЯ УДАРОВ' : 'STRIKE CHAIN')}
              </span>
            </div>
          )}
        </div>

        {/* P2 Combo */}
        <div>
          {p2.comboCount >= 2 && (
            <div className="flex flex-col items-end animate-bounce">
              <span className="font-title text-2xl sm:text-4xl font-black italic tracking-wider text-rose-400 drop-shadow-[0_4px_12px_rgba(244,63,94,0.6)]">
                {t('combo')} x{p2.comboCount}
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-white/90">
                {p2.comboCount >= 5 ? (language === 'ru' ? '🔥 СОКРУШИТЕЛЬНЫЙ УДАР!' : '🔥 DEVASTATING HIT!') : (language === 'ru' ? 'СЕРИЯ УДАРОВ' : 'STRIKE CHAIN')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* --- BOTTOM DESKTOP CONTROLS GUIDE --- */}
      <div className="w-full flex items-center justify-between text-[11px] text-slate-400/90 bg-slate-950/70 border border-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="font-bold text-amber-400">P1:</span>
          <span>A/D {t('keyMoveLeft')}/{t('keyMoveRight')}</span>
          <span>W {t('keyJump')}</span>
          <span>S {t('keyBlock')}</span>
          <span>J {t('keyAttackLight')}</span>
          <span>K {t('keyAttackHeavy')}</span>
          <span>L {t('keySpecial')}</span>
          <span>Space {t('keyDodge')}</span>
        </div>

        {mode === 'PVP' ? (
          <div className="flex items-center gap-3">
            <span className="font-bold text-rose-400">P2:</span>
            <span>←/→ {t('keyMoveLeft')}/{t('keyMoveRight')}</span>
            <span>↑ {t('keyJump')}</span>
            <span>↓ {t('keyBlock')}</span>
            <span>1 {t('keyAttackLight')}</span>
            <span>2 {t('keyAttackHeavy')}</span>
            <span>3 {t('keySpecial')}</span>
            <span>0 {t('keyDodge')}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onExitFight}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              {language === 'ru' ? 'Сдаться / Выйти' : 'Surrender / Exit'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
