import React from 'react';
import { MatchResult, GameMode } from '../types/game';
import { Trophy, Swords, Zap, Timer, RotateCcw, Users, Home } from 'lucide-react';
import { useLanguage, getLocalizedHero } from '../game/i18n';

interface VictoryModalProps {
  result: MatchResult;
  mode: GameMode;
  onRematch: () => void;
  onChangeHero: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  result,
  mode,
  onRematch,
  onChangeHero,
  onMainMenu,
}) => {
  const { language, t } = useLanguage();
  const isP1Winner = result.winnerId === 'p1';
  const isDraw = result.winnerId === 'DRAW';

  const locWinnerHero = getLocalizedHero(result.winnerHero, language);

  let titleText = t('victory');
  if (isDraw) {
    titleText = t('draw');
  } else if (mode === 'PVP') {
    titleText = isP1Winner ? t('player1Wins') : t('player2Wins');
  } else if (!isP1Winner) {
    titleText = mode === 'EVE' ? t('botWins') : t('defeat');
  }

  const titleColor = isDraw ? 'text-slate-400' : isP1Winner ? 'text-amber-400' : mode === 'PVP' ? 'text-rose-400' : 'text-red-500';
  const bannerGlow = isDraw
    ? 'from-slate-800/80 via-slate-900 to-black'
    : isP1Winner
    ? 'from-amber-950/80 via-slate-900 to-black'
    : 'from-red-950/80 via-slate-900 to-black';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`w-full max-w-xl bg-gradient-to-b ${bannerGlow} border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden`}>
        {/* Background ambient light */}
        <div className="absolute -top-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="flex items-center gap-3 mb-1">
          {isP1Winner && <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />}
          <h2 className={`font-title text-3xl sm:text-5xl font-black tracking-widest ${titleColor} drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]`}>
            {titleText}
          </h2>
          {isP1Winner && <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />}
        </div>

        <p className="text-sm text-slate-400 mb-6 font-medium">
          {isDraw ? (language === 'ru' ? 'Оба чемпиона сражались на пределе возможностей' : 'Both champions fought to exhaustion') : `${t('champion')}: ${locWinnerHero.name} (${locWinnerHero.title})`}
        </p>

        {/* STATS BREAKDOWN */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 mb-6 shadow-inner">
          <div className="grid grid-cols-3 gap-2 pb-2 mb-3 border-b border-slate-800/80 text-xs font-semibold text-slate-400">
            <span className="text-left text-amber-400 font-bold truncate">{result.p1Stats.heroName} (P1)</span>
            <span className="uppercase font-display tracking-wider">{t('postMatchSummary')}</span>
            <span className="text-right text-rose-400 font-bold truncate">{result.p2Stats.heroName} (P2)</span>
          </div>

          <div className="space-y-2.5 text-sm">
            {/* Damage */}
            <div className="grid grid-cols-3 items-center">
              <span className="text-left font-mono font-bold text-slate-200 tabular-nums">
                {result.p1Stats.damageDealt}
              </span>
              <span className="text-slate-400 text-xs flex items-center justify-center gap-1">
                <Swords className="w-3.5 h-3.5 text-amber-500" /> {t('damageDealt')}
              </span>
              <span className="text-right font-mono font-bold text-slate-200 tabular-nums">
                {result.p2Stats.damageDealt}
              </span>
            </div>

            {/* Hits */}
            <div className="grid grid-cols-3 items-center">
              <span className="text-left font-mono font-bold text-slate-200 tabular-nums">
                {result.p1Stats.hitsLanded}
              </span>
              <span className="text-slate-400 text-xs flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 text-blue-500" /> {t('hitsLanded')}
              </span>
              <span className="text-right font-mono font-bold text-slate-200 tabular-nums">
                {result.p2Stats.hitsLanded}
              </span>
            </div>

            {/* Max Combo */}
            <div className="grid grid-cols-3 items-center">
              <span className="text-left font-mono font-bold text-slate-200 tabular-nums">
                {result.p1Stats.maxCombo}x
              </span>
              <span className="text-slate-400 text-xs">{t('maxCombo')}</span>
              <span className="text-right font-mono font-bold text-slate-200 tabular-nums">
                {result.p2Stats.maxCombo}x
              </span>
            </div>

            {/* Match Duration */}
            <div className="grid grid-cols-3 items-center pt-2 border-t border-slate-900">
              <span className="text-left text-xs text-slate-500 flex items-center gap-1">
                <Timer className="w-3 h-3" /> {result.duration}s
              </span>
              <span className="text-xs text-amber-400 font-bold col-span-2 text-right">
                +{result.xpEarned} {t('xpEarned')}
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onRematch}
            className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm tracking-wide rounded-xl shadow-lg hover:shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-title"
          >
            <RotateCcw className="w-4 h-4" />
            {t('rematch')}
          </button>

          <button
            onClick={onChangeHero}
            className="w-full sm:flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm tracking-wide rounded-xl border border-slate-700 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-title"
          >
            <Users className="w-4 h-4" />
            {t('changeHero')}
          </button>

          <button
            onClick={onMainMenu}
            className="w-full sm:w-auto py-3 px-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium rounded-xl border border-slate-800 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            title={t('mainMenu')}
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
