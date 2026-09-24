import React, { useState } from 'react';
import { HeroDefinition, WeaponDefinition, GameMode, WeaponType } from '../types/game';
import { WEAPONS } from '../game/data';
import { progression } from '../game/progression';
import { sound } from '../game/sound';
import { useLanguage, getLocalizedWeapon, getLocalizedHero } from '../game/i18n';
import { Swords, Zap, ArrowRight, ArrowLeft, Lock, Target } from 'lucide-react';

interface WeaponSelectProps {
  p1Hero: HeroDefinition;
  p2Hero: HeroDefinition;
  mode: GameMode;
  onConfirm: (p1Weapon: WeaponDefinition, p2Weapon: WeaponDefinition) => void;
  onBack: () => void;
}

export const WeaponSelect: React.FC<WeaponSelectProps> = ({
  p1Hero,
  p2Hero,
  mode,
  onConfirm,
  onBack,
}) => {
  const [selectedP1WeaponId, setSelectedP1WeaponId] = useState(p1Hero.starterWeaponId);
  const [selectedP2WeaponId, setSelectedP2WeaponId] = useState(p2Hero.starterWeaponId);
  const [activeTab, setActiveTab] = useState<'all' | WeaponType>('all');
  const [selectingPlayer, setSelectingPlayer] = useState<'p1' | 'p2'>('p1');
  const { language, t } = useLanguage();

  const locP1Hero = getLocalizedHero(p1Hero, language);
  const locP2Hero = getLocalizedHero(p2Hero, language);
  const currentHero = selectingPlayer === 'p1' ? locP1Hero : locP2Hero;

  const filteredWeapons = activeTab === 'all'
    ? WEAPONS
    : WEAPONS.filter(w => w.type === activeTab);

  const currentSelectedId = selectingPlayer === 'p1' ? selectedP1WeaponId : selectedP2WeaponId;
  const rawCurrentWeapon = WEAPONS.find(w => w.id === currentSelectedId) || WEAPONS[0];
  const currentWeapon = getLocalizedWeapon(rawCurrentWeapon, language);

  const typeLabels: Record<'all' | WeaponType, string> = {
    all: t('all'),
    melee: t('melee'),
    ranged: t('ranged'),
    magic: t('magic'),
  };

  const handleWeaponClick = (weapon: WeaponDefinition) => {
    if (!progression.isWeaponUnlocked(weapon.id)) {
      sound.playBlock();
      return;
    }

    sound.playUiSelect();
    if (selectingPlayer === 'p1') {
      setSelectedP1WeaponId(weapon.id);
      if (mode === 'PVP') {
        setSelectingPlayer('p2');
      }
    } else {
      setSelectedP2WeaponId(weapon.id);
    }
  };

  const handleProceed = () => {
    sound.playUiClick();
    if (mode === 'PVP' && selectingPlayer === 'p1') {
      setSelectingPlayer('p2');
      return;
    }

    const p1W = WEAPONS.find(w => w.id === selectedP1WeaponId) || WEAPONS[0];
    const p2W = WEAPONS.find(w => w.id === selectedP2WeaponId) || WEAPONS[1];
    onConfirm(p1W, p2W);
  };

  const getSubHeader = () => {
    const pLabel = mode === 'PVP' ? (selectingPlayer === 'p1' ? t('weaponP1') : t('weaponP2')) : currentHero.name;
    return `${pLabel} · ${t('loadoutPrep')}`;
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
            {t('selectArsenal')}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {getSubHeader()}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          {(['all', 'melee', 'ranged', 'magic'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                sound.playUiClick();
              }}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {typeLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* WEAPONS GRID & PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-4">
        {/* WEAPONS CARDS */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredWeapons.map((rawW) => {
            const w = getLocalizedWeapon(rawW, language);
            const isUnlocked = progression.isWeaponUnlocked(rawW.id);
            const isSelected = selectingPlayer === 'p1' ? selectedP1WeaponId === rawW.id : selectedP2WeaponId === rawW.id;

            return (
              <div
                key={w.id}
                onClick={() => handleWeaponClick(rawW)}
                className={`group rounded-xl border p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                  !isUnlocked
                    ? 'bg-slate-900/40 border-slate-850 opacity-60'
                    : isSelected
                    ? 'bg-slate-900/95 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-[1.02]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{w.icon}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {typeLabels[w.type]}
                      </span>
                      {!isUnlocked && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          <Lock className="w-3 h-3" /> Lv.{w.requiredLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-title text-base font-bold text-slate-100 tracking-wide">
                    {w.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {w.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-3 mt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>{t('statAttack')}</span>
                    <span className="font-mono font-bold text-red-400">{w.damage}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>{t('statSpeed')}</span>
                    <span className="font-mono font-bold text-amber-400">{w.speed}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>{t('rangeReach')}</span>
                    <span className="font-mono font-bold text-cyan-400">{w.range}px</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>{t('critChance')}</span>
                    <span className="font-mono font-bold text-yellow-400">{Math.round(w.critChance * 100)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SELECTED WEAPON DOSSIER */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
              <span className="text-4xl p-2 bg-slate-950 rounded-xl border border-slate-800">
                {currentWeapon.icon}
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display">
                  {typeLabels[currentWeapon.type]}
                </span>
                <h2 className="font-title text-2xl font-black text-white tracking-wider">
                  {currentWeapon.name}
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {currentWeapon.description}
            </p>

            {/* SPECIFICATION BARS */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-850 mb-6">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-red-400" /> {t('baseDamage')}
                  </span>
                  <span className="font-mono font-bold text-red-400">{currentWeapon.damage}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${(currentWeapon.damage / 70) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> {t('attackSpeed')}
                  </span>
                  <span className="font-mono font-bold text-amber-400">{currentWeapon.speed}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${currentWeapon.speed}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-cyan-400" /> {t('rangeReach')}
                  </span>
                  <span className="font-mono font-bold text-cyan-400">{currentWeapon.range}px</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${(currentWeapon.range / 400) * 100}%` }} />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
                <span>{t('cooldownSec')}:</span>
                <span className="font-mono font-bold text-slate-200">{currentWeapon.cooldown}ms</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleProceed}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm tracking-wider uppercase rounded-xl shadow-lg hover:shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer font-title"
          >
            {mode === 'PVP' && selectingPlayer === 'p1' ? `${t('player1')}: ${t('ready')} -> ${t('player2')}` : t('selectArena')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
