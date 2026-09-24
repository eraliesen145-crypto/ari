import React from 'react';
import { inputManager } from '../game/input';
import { useLanguage } from '../game/i18n';
import { Shield, Zap, Wind, Swords, Flame, ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';

interface TouchControlsProps {
  abilityName: string;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ abilityName }) => {
  const { t } = useLanguage();

  const handleTouch = (control: Parameters<typeof inputManager.setVirtualInput>[0], active: boolean) => {
    inputManager.setVirtualInput(control, active);
  };

  return (
    <div className="absolute inset-x-0 bottom-10 px-4 flex items-end justify-between pointer-events-none select-none z-30">
      {/* LEFT D-PAD: Movement, Jump, Block */}
      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        {/* Jump */}
        <button
          onTouchStart={() => handleTouch('jump', true)}
          onTouchEnd={() => handleTouch('jump', false)}
          onMouseDown={() => handleTouch('jump', true)}
          onMouseUp={() => handleTouch('jump', false)}
          className="w-13 h-13 rounded-full bg-slate-900/80 border border-slate-700/80 active:bg-amber-500/40 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        {/* Left, Block, Right */}
        <div className="flex items-center gap-2">
          <button
            onTouchStart={() => handleTouch('moveLeft', true)}
            onTouchEnd={() => handleTouch('moveLeft', false)}
            onMouseDown={() => handleTouch('moveLeft', true)}
            onMouseUp={() => handleTouch('moveLeft', false)}
            className="w-13 h-13 rounded-full bg-slate-900/80 border border-slate-700/80 active:bg-amber-500/40 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          <button
            onTouchStart={() => handleTouch('block', true)}
            onTouchEnd={() => handleTouch('block', false)}
            onMouseDown={() => handleTouch('block', true)}
            onMouseUp={() => handleTouch('block', false)}
            className="w-13 h-13 rounded-full bg-slate-900/80 border border-blue-500/60 active:bg-blue-500/40 text-blue-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <Shield className="w-5 h-5" />
          </button>

          <button
            onTouchStart={() => handleTouch('moveRight', true)}
            onTouchEnd={() => handleTouch('moveRight', false)}
            onMouseDown={() => handleTouch('moveRight', true)}
            onMouseUp={() => handleTouch('moveRight', false)}
            className="w-13 h-13 rounded-full bg-slate-900/80 border border-slate-700/80 active:bg-amber-500/40 text-slate-200 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* RIGHT ACTION BUTTONS: Attacks, Dodge, Ability */}
      <div className="grid grid-cols-2 gap-2 pointer-events-auto items-center">
        {/* Dodge */}
        <button
          onTouchStart={() => handleTouch('dodge', true)}
          onTouchEnd={() => handleTouch('dodge', false)}
          onMouseDown={() => handleTouch('dodge', true)}
          onMouseUp={() => handleTouch('dodge', false)}
          className="w-12 h-12 rounded-full bg-slate-900/80 border border-cyan-500/60 active:bg-cyan-500/40 text-cyan-300 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Wind className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase">{t('touchDodge')}</span>
        </button>

        {/* Special Ability */}
        <button
          onTouchStart={() => handleTouch('special', true)}
          onTouchEnd={() => handleTouch('special', false)}
          onMouseDown={() => handleTouch('special', true)}
          onMouseUp={() => handleTouch('special', false)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 border border-yellow-300/80 active:brightness-125 text-slate-950 flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform"
        >
          <Zap className="w-5 h-5 font-black" />
          <span className="text-[9px] font-black uppercase tracking-tight">{t('touchSpecial')}</span>
        </button>

        {/* Light Attack */}
        <button
          onTouchStart={() => handleTouch('lightAttack', true)}
          onTouchEnd={() => handleTouch('lightAttack', false)}
          onMouseDown={() => handleTouch('lightAttack', true)}
          onMouseUp={() => handleTouch('lightAttack', false)}
          className="w-14 h-14 rounded-full bg-slate-800/90 border border-emerald-500/70 active:bg-emerald-500/40 text-emerald-300 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Swords className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase">{t('touchLight')}</span>
        </button>

        {/* Heavy Attack */}
        <button
          onTouchStart={() => handleTouch('heavyAttack', true)}
          onTouchEnd={() => handleTouch('heavyAttack', false)}
          onMouseDown={() => handleTouch('heavyAttack', true)}
          onMouseUp={() => handleTouch('heavyAttack', false)}
          className="w-14 h-14 rounded-full bg-slate-800/90 border border-rose-500/70 active:bg-rose-500/40 text-rose-300 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Flame className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase">{t('touchHeavy')}</span>
        </button>
      </div>
    </div>
  );
};
