import React, { useState } from 'react';
import { WEAPONS } from '../game/data';
import { progression } from '../game/progression';
import { useLanguage, getLocalizedWeapon } from '../game/i18n';
import { X, Lock, Swords, Zap, Target } from 'lucide-react';
import { WeaponType } from '../types/game';

interface WeaponsGalleryProps {
  onClose: () => void;
}

export const WeaponsGallery: React.FC<WeaponsGalleryProps> = ({ onClose }) => {
  const { language, t } = useLanguage();
  const [activeType, setActiveType] = useState<'all' | WeaponType>('all');
  const [selectedWeaponId, setSelectedWeaponId] = useState(WEAPONS[0].id);

  const filteredWeapons = activeType === 'all' ? WEAPONS : WEAPONS.filter(w => w.type === activeType);
  const rawSelectedWeapon = WEAPONS.find(w => w.id === selectedWeaponId) || WEAPONS[0];
  const selectedWeapon = getLocalizedWeapon(rawSelectedWeapon, language);

  const typeLabels: Record<'all' | WeaponType, string> = {
    all: t('all'),
    melee: t('melee'),
    ranged: t('ranged'),
    magic: t('magic'),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-5 gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display">
              {t('weaponsGallery')}
            </span>
            <h2 className="font-title text-2xl sm:text-3xl font-black text-white tracking-wider">
              {language === 'ru' ? 'ОРУЖИЕ И АРТЕФАКТЫ' : 'WEAPONS & ARTIFACTS'}
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-850 self-start sm:self-auto">
            {(['all', 'melee', 'ranged', 'magic'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveType(tab)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                  activeType === tab
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {typeLabels[tab]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* WEAPONS LIST */}
          <div className="md:col-span-6 grid grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredWeapons.map(rawW => {
              const w = getLocalizedWeapon(rawW, language);
              const isUnlocked = progression.isWeaponUnlocked(rawW.id);
              const isSelected = selectedWeaponId === rawW.id;

              return (
                <div
                  key={w.id}
                  onClick={() => setSelectedWeaponId(rawW.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  } ${!isUnlocked && 'opacity-60'}`}
                >
                  <span className="text-2xl p-1.5 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
                    {w.icon}
                  </span>

                  <div className="truncate">
                    <h4 className="font-title text-sm font-bold text-white truncate">
                      {w.name}
                    </h4>
                    <span className="text-[10px] text-amber-400 font-mono uppercase">
                      {typeLabels[w.type]}
                    </span>
                  </div>

                  {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500 ml-auto shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* WEAPON PROFILE DETAIL */}
          <div className="md:col-span-6 bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 border-b border-slate-850 pb-3 mb-4">
                <span className="text-4xl p-2 bg-slate-900 rounded-xl border border-slate-800">
                  {selectedWeapon.icon}
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-mono">
                    {typeLabels[selectedWeapon.type]}
                  </span>
                  <h3 className="font-title text-2xl font-black text-white">
                    {selectedWeapon.name}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                {selectedWeapon.description}
              </p>

              {/* STATS */}
              <div className="space-y-3 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-red-400" /> {t('baseDamage')}
                  </span>
                  <span className="font-mono font-bold text-red-400">{selectedWeapon.damage}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> {t('attackSpeed')}
                  </span>
                  <span className="font-mono font-bold text-amber-400">{selectedWeapon.speed}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-cyan-400" /> {t('rangeReach')}
                  </span>
                  <span className="font-mono font-bold text-cyan-400">{selectedWeapon.range}px</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">{t('critChance')}:</span>
                  <span className="font-mono font-bold text-yellow-400">{Math.round(selectedWeapon.critChance * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-850 flex items-center justify-between text-xs">
              <span className="text-slate-400">{language === 'ru' ? 'Требование открытия:' : 'Unlock Requirement:'}</span>
              <span className="font-bold text-amber-400">
                {rawSelectedWeapon.unlockedByDefault
                  ? (language === 'ru' ? 'Доступно сразу' : 'Unlocked by Default')
                  : (language === 'ru' ? `Требуется уровень игрока ${rawSelectedWeapon.requiredLevel}` : `Requires Player Level ${rawSelectedWeapon.requiredLevel}`)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
