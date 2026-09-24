import React, { useState } from 'react';
import { GameMode, AIDifficulty } from '../types/game';
import { sound } from '../game/sound';
import { useLanguage } from '../game/i18n';
import { Bot, Users, Cpu, ShieldAlert, Sparkles, X, ArrowRight } from 'lucide-react';

interface ModeSelectModalProps {
  onSelectMode: (mode: GameMode, difficulty: AIDifficulty) => void;
  onClose: () => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({ onSelectMode, onClose }) => {
  const [difficulty, setDifficulty] = useState<AIDifficulty>('NORMAL');
  const { t } = useLanguage();

  const modes: {
    id: GameMode;
    title: string;
    badge: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    hasDifficulty?: boolean;
  }[] = [
    {
      id: 'PVE',
      title: t('pveTitle'),
      badge: t('pveBadge'),
      description: t('pveDesc'),
      icon: <Bot className="w-6 h-6" />,
      color: 'text-amber-400 border-amber-500/40 hover:border-amber-400',
      hasDifficulty: true,
    },
    {
      id: 'PVP',
      title: t('pvpTitle'),
      badge: t('pvpBadge'),
      description: t('pvpDesc'),
      icon: <Users className="w-6 h-6" />,
      color: 'text-cyan-400 border-cyan-500/40 hover:border-cyan-400',
    },
    {
      id: 'EVE',
      title: t('eveTitle'),
      badge: t('eveBadge'),
      description: t('eveDesc'),
      icon: <Cpu className="w-6 h-6" />,
      color: 'text-purple-400 border-purple-500/40 hover:border-purple-400',
      hasDifficulty: true,
    },
    {
      id: 'TRAINING',
      title: t('trainingTitle'),
      badge: t('trainingBadge'),
      description: t('trainingDesc'),
      icon: <ShieldAlert className="w-6 h-6" />,
      color: 'text-emerald-400 border-emerald-500/40 hover:border-emerald-400',
    },
  ];

  const diffLabels: Record<AIDifficulty, string> = {
    EASY: t('diffEasy'),
    NORMAL: t('diffNormal'),
    HARD: t('diffHard'),
  };

  const handleChoose = (mode: GameMode) => {
    sound.playUiClick();
    onSelectMode(mode, difficulty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display">
            {t('chooseArenaExp')}
          </span>
          <h2 className="font-title text-2xl sm:text-3xl font-black text-white tracking-wider mt-0.5">
            {t('selectCombatMode')}
          </h2>
        </div>

        {/* AI DIFFICULTY SELECTOR */}
        <div className="mb-5 bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-300">{t('aiDifficulty')}:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {(['EASY', 'NORMAL', 'HARD'] as const).map(d => (
              <button
                key={d}
                onClick={() => {
                  setDifficulty(d);
                  sound.playUiClick();
                }}
                className={`px-3 py-1 text-xs font-bold tracking-wider rounded-lg border transition-colors cursor-pointer uppercase ${
                  difficulty === d
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {diffLabels[d]}
              </button>
            ))}
          </div>
        </div>

        {/* MODES LIST */}
        <div className="space-y-3">
          {modes.map(m => (
            <div
              key={m.id}
              onClick={() => handleChoose(m.id)}
              className={`p-4 rounded-xl border bg-slate-950/60 hover:bg-slate-850 cursor-pointer transition-all duration-200 flex items-center justify-between group ${m.color}`}
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform">
                  {m.icon}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-title text-base sm:text-lg font-bold text-white tracking-wide">
                      {m.title}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {m.description}
                  </p>
                </div>
              </div>

              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
