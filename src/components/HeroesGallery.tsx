import React, { useState } from 'react';
import { HEROES } from '../game/data';
import { progression } from '../game/progression';
import { useLanguage, getLocalizedHero } from '../game/i18n';
import { X, Lock, Shield, Swords, Wind, Zap } from 'lucide-react';

interface HeroesGalleryProps {
  onClose: () => void;
}

export const HeroesGallery: React.FC<HeroesGalleryProps> = ({ onClose }) => {
  const { language, t } = useLanguage();
  const [selectedHeroId, setSelectedHeroId] = useState(HEROES[0].id);

  const rawSelectedHero = HEROES.find(h => h.id === selectedHeroId) || HEROES[0];
  const selectedHero = getLocalizedHero(rawSelectedHero, language);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-800 pb-3 mb-5">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display">
            {t('heroesGallery')}
          </span>
          <h2 className="font-title text-2xl sm:text-3xl font-black text-white tracking-wider">
            {language === 'ru' ? 'ГЕРОИ И БОЕВЫЕ СТИЛИ' : 'HEROES & COMBAT STYLES'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* HEROES LIST */}
          <div className="md:col-span-6 grid grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
            {HEROES.map(rawHero => {
              const hero = getLocalizedHero(rawHero, language);
              const isUnlocked = progression.isHeroUnlocked(rawHero.id);
              const isSelected = selectedHeroId === rawHero.id;

              return (
                <div
                  key={hero.id}
                  onClick={() => setSelectedHeroId(rawHero.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  } ${!isUnlocked && 'opacity-60'}`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-title font-bold text-sm shrink-0 border"
                    style={{
                      backgroundColor: hero.secondaryColor,
                      color: hero.accentColor,
                      borderColor: hero.color,
                    }}
                  >
                    {hero.name.charAt(0)}
                  </div>

                  <div className="truncate">
                    <h4 className="font-title text-sm font-bold text-white truncate">
                      {hero.name}
                    </h4>
                    <p className="text-[11px] text-amber-400/80 truncate">
                      {hero.style}
                    </p>
                  </div>

                  {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500 ml-auto shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* HERO PROFILE DETAIL */}
          <div className="md:col-span-6 bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-850 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display">
                  {selectedHero.title}
                </span>
                <h3 className="font-title text-2xl font-black text-white">
                  {selectedHero.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('fightingStyle')}: <span className="text-slate-200 font-semibold">{selectedHero.style}</span>
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-5">
                {selectedHero.description}
              </p>

              {/* STAT GRID */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <Swords className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-slate-400">{t('statAttack')}:</span>
                  <span className="font-mono font-bold text-slate-100">{selectedHero.stats.attack}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-400">{t('statDefense')}:</span>
                  <span className="font-mono font-bold text-slate-100">{selectedHero.stats.defense}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400">{t('statSpeed')}:</span>
                  <span className="font-mono font-bold text-slate-100">{selectedHero.stats.speed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-400">{t('statEnergy')}:</span>
                  <span className="font-mono font-bold text-slate-100">{selectedHero.stats.energy}</span>
                </div>
              </div>

              {/* ABILITY */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {selectedHero.ability.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedHero.ability.cooldown / 1000}{t('cooldownSec')}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {selectedHero.ability.description}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs">
              <span className="text-slate-400">{language === 'ru' ? 'Требование открытия:' : 'Unlock Requirement:'}</span>
              <span className="font-bold text-amber-400">
                {rawSelectedHero.unlockedByDefault
                  ? (language === 'ru' ? 'Доступен сразу' : 'Unlocked by Default')
                  : (language === 'ru' ? `Требуется уровень игрока ${rawSelectedHero.requiredLevel}` : `Requires Player Level ${rawSelectedHero.requiredLevel}`)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
