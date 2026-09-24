import React, { useState } from 'react';
import { HeroDefinition, GameMode } from '../types/game';
import { HEROES } from '../game/data';
import { progression } from '../game/progression';
import { sound } from '../game/sound';
import { useLanguage, getLocalizedHero } from '../game/i18n';
import { Shield, Swords, Zap, Wind, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

interface HeroSelectProps {
  mode: GameMode;
  onSelect: (p1Hero: HeroDefinition, p2Hero: HeroDefinition) => void;
  onBack: () => void;
}

export const HeroSelect: React.FC<HeroSelectProps> = ({ mode, onSelect, onBack }) => {
  const [selectedP1Index, setSelectedP1Index] = useState(0);
  const [selectedP2Index, setSelectedP2Index] = useState(1);
  const [selectingPlayer, setSelectingPlayer] = useState<'p1' | 'p2'>('p1');
  const { language, t } = useLanguage();

  const rawP1Hero = HEROES[selectedP1Index];
  const rawP2Hero = HEROES[selectedP2Index];
  const p1Hero = getLocalizedHero(rawP1Hero, language);
  const p2Hero = getLocalizedHero(rawP2Hero, language);
  const currentHero = selectingPlayer === 'p1' ? p1Hero : p2Hero;

  const handleHeroClick = (index: number) => {
    const hero = HEROES[index];
    if (!progression.isHeroUnlocked(hero.id)) {
      sound.playBlock();
      return;
    }

    sound.playUiSelect();
    if (selectingPlayer === 'p1') {
      setSelectedP1Index(index);
      if (mode === 'PVP') {
        setSelectingPlayer('p2');
      }
    } else {
      setSelectedP2Index(index);
    }
  };

  const handleConfirm = () => {
    sound.playUiClick();
    if (mode === 'PVP' && selectingPlayer === 'p1') {
      setSelectingPlayer('p2');
      return;
    }
    onSelect(rawP1Hero, rawP2Hero);
  };

  const getSubHeader = () => {
    if (mode === 'PVP') {
      return selectingPlayer === 'p1' ? `${t('player1')}: ${t('selectYourChampion')}` : `${t('player2')}: ${t('selectYourChampion')}`;
    }
    return t('selectYourChampion');
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
            {t('theArenaAwaits')}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {getSubHeader()}
          </p>
        </div>

        <div className="w-20" />
      </div>

      {/* HERO CARDS GRID & PREVIEW CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-4">
        {/* LEFT: 8 HERO CARDS GRID */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {HEROES.map((rawHero, idx) => {
            const hero = getLocalizedHero(rawHero, language);
            const isUnlocked = progression.isHeroUnlocked(rawHero.id);
            const isSelected = selectingPlayer === 'p1' ? selectedP1Index === idx : selectedP2Index === idx;
            const isP1Selected = selectedP1Index === idx;
            const isP2Selected = selectedP2Index === idx;

            return (
              <div
                key={hero.id}
                onClick={() => handleHeroClick(idx)}
                className={`group relative rounded-xl border p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 overflow-hidden ${
                  !isUnlocked
                    ? 'bg-slate-900/40 border-slate-850 opacity-60'
                    : isSelected
                    ? 'bg-slate-900/95 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.02]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {/* Hero Color Accent Bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: hero.color }}
                />

                {/* Badges for P1 / P2 selections */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1">
                    {isP1Selected && (
                      <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-mono">
                        P1
                      </span>
                    )}
                    {isP2Selected && mode === 'PVP' && (
                      <span className="text-[10px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded font-mono">
                        P2
                      </span>
                    )}
                  </div>
                  {!isUnlocked && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      <Lock className="w-3 h-3 text-amber-500" /> Lv.{hero.requiredLevel}
                    </span>
                  )}
                </div>

                {/* Hero Avatar / Crest Silhouette */}
                <div className="w-full h-24 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-center relative overflow-hidden mb-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-title text-xl font-bold transition-transform group-hover:scale-110 shadow-lg"
                    style={{
                      backgroundColor: hero.secondaryColor,
                      color: hero.accentColor,
                      borderColor: hero.color,
                      borderWidth: 2,
                    }}
                  >
                    {hero.name.charAt(0)}
                  </div>
                  {/* Subtle ambient glow */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ backgroundColor: hero.color }}
                  />
                </div>

                {/* Details */}
                <div>
                  <h3 className="font-title text-sm sm:text-base font-bold text-slate-100 tracking-wide truncate">
                    {hero.name}
                  </h3>
                  <p className="text-[11px] text-amber-400/90 font-medium truncate">
                    {hero.style}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Swords className="w-3 h-3 text-red-400" /> {hero.stats.attack}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-blue-400" /> {hero.stats.defense}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind className="w-3 h-3 text-emerald-400" /> {hero.stats.speed}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT: SELECTED HERO DOSSIER PREVIEW */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-baseline justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display">
                  {currentHero.title}
                </span>
                <h2 className="font-title text-2xl sm:text-3xl font-black text-white tracking-wider">
                  {currentHero.name}
                </h2>
              </div>
              <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2.5 py-1 rounded">
                {currentHero.style}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              {currentHero.description}
            </p>

            {/* STAT BARS */}
            <div className="space-y-2.5 mb-5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-850">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{t('hp')} (HP)</span>
                <span className="font-mono font-bold text-emerald-400">{currentHero.stats.hp}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(currentHero.stats.hp / 1500) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{t('statAttack')}</span>
                <span className="font-mono font-bold text-red-400">{currentHero.stats.attack}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${currentHero.stats.attack}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{t('statDefense')}</span>
                <span className="font-mono font-bold text-blue-400">{currentHero.stats.defense}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${currentHero.stats.defense}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{t('statSpeed')}</span>
                <span className="font-mono font-bold text-amber-400">{currentHero.stats.speed}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${currentHero.stats.speed}%` }}
                />
              </div>
            </div>

            {/* SPECIAL ABILITY CARD */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-3.5 mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  {currentHero.ability.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentHero.ability.energyCost} {t('energy')} · {currentHero.ability.cooldown / 1000}{t('cooldownSec')}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {currentHero.ability.description}
              </p>
            </div>
          </div>

          {/* CONFIRM BUTTON */}
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg hover:shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-title"
          >
            {mode === 'PVP' && selectingPlayer === 'p1' ? `${t('player1')}: ${t('ready')} -> ${t('player2')}` : t('selectWeapons')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
