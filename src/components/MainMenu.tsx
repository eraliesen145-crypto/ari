import React from 'react';
import { sound } from '../game/sound';
import { progression } from '../game/progression';
import { useLanguage } from '../game/i18n';
import { Swords, Shield, Trophy, Settings, Volume2, VolumeX, Sparkles, Flame, Languages } from 'lucide-react';

interface MainMenuProps {
  onStartClick: () => void;
  onOpenHeroes: () => void;
  onOpenWeapons: () => void;
  onOpenProgression: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartClick,
  onOpenHeroes,
  onOpenWeapons,
  onOpenProgression,
  onOpenSettings,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.isMuted);
  const userProgress = progression.getProgression();
  const { language, toggleLanguage, t } = useLanguage();

  const handleToggleMute = () => {
    const m = sound.toggleMute();
    setIsMuted(m);
  };

  const handleToggleLang = () => {
    sound.playUiClick();
    toggleLanguage();
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden text-slate-100">
      {/* Background artwork */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/src/assets/images/cover_battle.png"
          alt="Battle of Heroes"
          className="w-full h-full object-cover object-center opacity-40 scale-105 filter contrast-125"
        />
        {/* Gradient scrim overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/90" />
      </div>

      {/* TOP BAR: Player Profile summary, Language toggle & Audio toggle */}
      <div className="relative z-10 w-full flex items-center justify-between">
        {/* Player level & rank */}
        <button
          onClick={() => {
            sound.playUiClick();
            onOpenProgression();
          }}
          className="flex items-center gap-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 px-3.5 py-1.5 rounded-xl backdrop-blur-sm transition-all cursor-pointer shadow-lg"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-title font-bold text-amber-400 text-sm">
            {userProgress.level}
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
              {t('champion')}
            </span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              {userProgress.xp} {t('xp')}
            </span>
          </div>
        </button>

        {/* Action Controls: Language & Audio */}
        <div className="flex items-center gap-2">
          {/* Quick Language Toggle */}
          <button
            onClick={handleToggleLang}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-amber-400 hover:text-amber-300 transition-colors cursor-pointer shadow-lg backdrop-blur-sm text-xs font-bold font-mono tracking-wider"
            title={language === 'ru' ? 'Сменить на English' : 'Switch to Russian'}
          >
            <Languages className="w-4 h-4 text-amber-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer shadow-lg backdrop-blur-sm"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* CENTER: TITLE & HERO BRANDING */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-2xl mx-auto py-6">
        {/* Flame crest emblem */}
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-400 font-display">
            {t('gameSubtitle')}
          </span>
          <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
        </div>

        {/* Game Title */}
        <h1 className="font-title text-5xl sm:text-7xl lg:text-8xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-600 drop-shadow-[0_10px_25px_rgba(245,158,11,0.4)] leading-tight">
          {t('gameTitle')}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-lg mt-3 font-medium drop-shadow leading-relaxed">
          {t('gameDesc')}
        </p>

        {/* MAIN MENU BUTTONS */}
        <div className="w-full max-w-xs sm:max-w-sm flex flex-col gap-3 mt-8">
          {/* PLAY BUTTON */}
          <button
            onClick={() => {
              sound.playUiClick();
              onStartClick();
            }}
            className="group relative w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-title font-black text-lg tracking-widest uppercase rounded-xl shadow-[0_4px_25px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_30px_rgba(245,158,11,0.5)] active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer overflow-hidden"
          >
            <Swords className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {t('enterBattle')}
            <Sparkles className="w-4 h-4 text-amber-900" />
          </button>

          {/* HEROES */}
          <button
            onClick={() => {
              sound.playUiClick();
              onOpenHeroes();
            }}
            className="w-full py-3 px-5 bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white font-title font-bold text-sm tracking-widest uppercase rounded-xl border border-slate-700/80 backdrop-blur-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            {t('heroesRoster')}
          </button>

          {/* WEAPONS */}
          <button
            onClick={() => {
              sound.playUiClick();
              onOpenWeapons();
            }}
            className="w-full py-3 px-5 bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white font-title font-bold text-sm tracking-widest uppercase rounded-xl border border-slate-700/80 backdrop-blur-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Swords className="w-4 h-4 text-cyan-400" />
            {t('warArmory')}
          </button>

          {/* SETTINGS */}
          <button
            onClick={() => {
              sound.playUiClick();
              onOpenSettings();
            }}
            className="w-full py-2.5 px-5 bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-bold tracking-wider uppercase rounded-xl border border-slate-800/80 backdrop-blur-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            {t('settingsControls')}
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 border-t border-slate-800/60 pt-4">
        <span>{t('footerInfo')}</span>
        <span>{t('footerControls')}</span>
      </div>
    </div>
  );
};
