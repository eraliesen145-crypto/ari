import React from 'react';
import { progression } from '../game/progression';
import { useLanguage } from '../game/i18n';
import { X, Trophy, Swords, Zap, CheckCircle2, Lock } from 'lucide-react';

interface ProgressionModalProps {
  onClose: () => void;
}

export const ProgressionModal: React.FC<ProgressionModalProps> = ({ onClose }) => {
  const { language, t } = useLanguage();
  const p = progression.getProgression();
  const xpPercent = Math.min(100, Math.round((p.xp / p.xpToNextLevel) * 100));
  const winRate = p.totalBattles > 0 ? Math.round((p.totalWins / p.totalBattles) * 100) : 0;

  const milestones = [
    {
      level: 1,
      name: language === 'ru' ? 'Новобранец' : 'Recruit',
      heroes: language === 'ru' ? ['ЖЕЛЕЗО', 'ТЕНЬ', 'ВАЛЬКИРИЯ', 'КЛИНОК'] : ['IRON', 'SHADOW', 'VALKYRIE', 'BLADE'],
      weapons: language === 'ru' ? ['Длинный меч', 'Катана', 'Боевой топор', 'Копьё', 'Молот', 'Кинжалы'] : ['Longsword', 'Katana', 'Battleaxe', 'Lance', 'Hammer', 'Daggers'],
    },
    {
      level: 2,
      name: language === 'ru' ? 'Гладиатор' : 'Gladiator',
      heroes: language === 'ru' ? ['ВОРОН'] : ['RAVEN'],
      weapons: language === 'ru' ? ['Теневой лук', 'Метательные ножи'] : ['Shadow Bow', 'Throwing Knives'],
    },
    {
      level: 3,
      name: language === 'ru' ? 'Полководец' : 'Warlord',
      heroes: language === 'ru' ? ['ТИТАН'] : ['TITAN'],
      weapons: language === 'ru' ? ['Тяжёлый арбалет', 'Эфирный клинок'] : ['Heavy Crossbow', 'Ether Brand'],
    },
    {
      level: 4,
      name: language === 'ru' ? 'Мастер' : 'Master',
      heroes: language === 'ru' ? ['ФАНТОМ'] : ['PHANTOM'],
      weapons: language === 'ru' ? ['Посох затмения'] : ['Staff of Eclipse'],
    },
    {
      level: 5,
      name: language === 'ru' ? 'Грандмастер' : 'Grandmaster',
      heroes: language === 'ru' ? ['АРКАН'] : ['ARCANE'],
      weapons: language === 'ru' ? ['Сферы звёздной пустоты'] : ['Void Star Orbs'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-800 pb-3 mb-5">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display">
            {t('progression')}
          </span>
          <h2 className="font-title text-2xl sm:text-3xl font-black text-white tracking-wider">
            {language === 'ru' ? 'РАНГИ И НАГРАДЫ' : 'RANKS & REWARDS'}
          </h2>
        </div>

        {/* LEVEL & XP BAR */}
        <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-title text-3xl font-black text-amber-400">
                {t('level')} {p.level}
              </span>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/40">
                {milestones.find(m => m.level === p.level)?.name || (language === 'ru' ? 'Легенда' : 'Legend')}
              </span>
            </div>
            <span className="font-mono text-xs text-slate-400">
              {p.xp} / {p.xpToNextLevel} XP
            </span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-300 rounded-full"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 text-right">
            {p.xpToNextLevel - p.xp} XP {t('xpUntilNextRank')}
          </p>
        </div>

        {/* COMBAT CAREER STATS */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center">
            <Swords className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="font-mono text-xl font-bold text-white block">{p.totalBattles}</span>
            <span className="text-[11px] text-slate-400">{t('totalBattles')}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center">
            <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <span className="font-mono text-xl font-bold text-white block">{p.totalWins} ({winRate}%)</span>
            <span className="text-[11px] text-slate-400">{t('totalWins')}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-center">
            <Zap className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <span className="font-mono text-xl font-bold text-white block">{p.highestCombo}x</span>
            <span className="text-[11px] text-slate-400">{t('highestCombo')}</span>
          </div>
        </div>

        {/* ROADMAP / UNLOCKS TIERS */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
            {language === 'ru' ? 'Этапы открытия контента' : 'Rank Unlock Milestones'}
          </h4>

          {milestones.map(m => {
            const isReached = p.level >= m.level;

            return (
              <div
                key={m.level}
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isReached
                    ? 'bg-slate-950/70 border-emerald-500/40 text-slate-200'
                    : 'bg-slate-950/30 border-slate-850 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg font-title font-bold text-xs ${
                    isReached ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    LV.{m.level}
                  </div>
                  <div>
                    <h5 className="font-title text-sm font-bold text-white tracking-wide">
                      {m.name}
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      {language === 'ru' ? 'Открывает:' : 'Unlocks:'} <span className="text-amber-400/90 font-medium">{m.heroes.join(', ')}</span>
                      {m.weapons.length > 0 && ` · ${m.weapons.join(', ')}`}
                    </p>
                  </div>
                </div>

                {isReached ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-600 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
