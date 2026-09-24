import React, { useState } from 'react';
import { ArenaDefinition } from '../types/game';
import { ARENAS } from '../game/data';
import { sound } from '../game/sound';
import { useLanguage, getLocalizedArena } from '../game/i18n';
import { ArrowLeft, Swords, Sparkles, Shuffle } from 'lucide-react';

interface ArenaSelectProps {
  onSelectArena: (arena: ArenaDefinition) => void;
  onBack: () => void;
}

export const ArenaSelect: React.FC<ArenaSelectProps> = ({ onSelectArena, onBack }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { language, t } = useLanguage();

  const rawArena = ARENAS[selectedIndex];
  const currentArena = getLocalizedArena(rawArena, language);

  const handlePickRandom = () => {
    const randIdx = Math.floor(Math.random() * ARENAS.length);
    setSelectedIndex(randIdx);
    sound.playUiSelect();
  };

  const handleStartBattle = () => {
    sound.playUiClick();
    onSelectArena(rawArena);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none">
      {/* HEADER */}
      <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>

        <div className="text-center">
          <h1 className="font-title text-2xl sm:text-3xl font-black tracking-widest text-amber-400 drop-shadow">
            {t('selectBattleArena')}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-wider font-display">
            {t('battleground')}
          </p>
        </div>

        <button
          onClick={handlePickRandom}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors cursor-pointer uppercase"
        >
          <Shuffle className="w-3.5 h-3.5" />
          {t('randomArena')}
        </button>
      </div>

      {/* ARENAS HORIZONTAL / GRID LIST */}
      <div className="my-auto py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ARENAS.map((rawItem, idx) => {
            const arena = getLocalizedArena(rawItem, language);
            const isSelected = selectedIndex === idx;

            return (
              <div
                key={arena.id}
                onClick={() => {
                  setSelectedIndex(idx);
                  sound.playUiSelect();
                }}
                className={`group rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] scale-[1.03] bg-slate-900'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {/* Image preview */}
                <div className="w-full h-36 bg-slate-950 relative overflow-hidden">
                  {arena.imagePath ? (
                    <img
                      src={arena.imagePath}
                      alt={arena.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-950/60 via-slate-900 to-black"
                    >
                      <Sparkles className="w-8 h-8 text-amber-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-slate-800">
                    {arena.theme}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-title text-base sm:text-lg font-bold text-white tracking-wide mb-1 truncate">
                    {arena.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {arena.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER CTA */}
      <div className="w-full flex items-center justify-between border-t border-slate-800/80 pt-4">
        <div className="text-xs text-slate-400 truncate max-w-sm sm:max-w-md">
          {t('selectBattleArena')}: <span className="text-amber-400 font-bold">{currentArena.name}</span> ({currentArena.theme})
        </div>

        <button
          onClick={handleStartBattle}
          className="py-3.5 px-8 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-title font-black text-base tracking-widest uppercase rounded-xl shadow-xl hover:shadow-amber-500/30 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Swords className="w-5 h-5" />
          {t('startBattle')}
        </button>
      </div>
    </div>
  );
};
