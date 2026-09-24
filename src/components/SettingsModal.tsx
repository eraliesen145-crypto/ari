import React, { useState } from 'react';
import { inputManager, DEFAULT_P1_KEYS, DEFAULT_P2_KEYS } from '../game/input';
import { sound } from '../game/sound';
import { useLanguage } from '../game/i18n';
import { X, Volume2, VolumeX, Keyboard, Smartphone, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  showTouchControls: boolean;
  onToggleTouchControls: (val: boolean) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  showTouchControls,
  onToggleTouchControls,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const [sfxVol, setSfxVol] = useState(sound.sfxVolume);
  const [musicVol, setMusicVol] = useState(sound.musicVolume);
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  const [p1Keys, setP1Keys] = useState(inputManager.p1Keys);
  const [p2Keys, setP2Keys] = useState(inputManager.p2Keys);
  const [listeningFor, setListeningFor] = useState<{ player: 'p1' | 'p2'; action: string } | null>(null);

  const actionLabels: Record<string, string> = {
    moveLeft: t('keyMoveLeft'),
    moveRight: t('keyMoveRight'),
    jump: t('keyJump'),
    block: t('keyBlock'),
    lightAttack: t('keyAttackLight'),
    heavyAttack: t('keyAttackHeavy'),
    special: t('keySpecial'),
    dodge: t('keyDodge'),
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    sound.setSfxVolume(val);
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVol(val);
    sound.setMusicVolume(val);
  };

  const handleToggleMute = () => {
    const m = sound.toggleMute();
    setIsMuted(m);
  };

  const handleResetKeys = () => {
    setP1Keys({ ...DEFAULT_P1_KEYS });
    setP2Keys({ ...DEFAULT_P2_KEYS });
    inputManager.saveKeys(DEFAULT_P1_KEYS, DEFAULT_P2_KEYS);
    sound.playUiClick();
  };

  const handleKeyClick = (player: 'p1' | 'p2', action: string) => {
    setListeningFor({ player, action });
  };

  React.useEffect(() => {
    if (!listeningFor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (listeningFor.player === 'p1') {
        const updated = { ...p1Keys, [listeningFor.action]: e.code };
        setP1Keys(updated);
        inputManager.saveKeys(updated, p2Keys);
      } else {
        const updated = { ...p2Keys, [listeningFor.action]: e.code };
        setP2Keys(updated);
        inputManager.saveKeys(p1Keys, updated);
      }
      setListeningFor(null);
      sound.playUiSelect();
    };

    window.addEventListener('keydown', handleKeyDown, { once: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [listeningFor, p1Keys, p2Keys]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-800 pb-3 mb-5">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 font-display">
            {t('settings')}
          </span>
          <h2 className="font-title text-2xl sm:text-3xl font-black text-white tracking-wider">
            {language === 'ru' ? 'НАСТРОЙКИ И УПРАВЛЕНИЕ' : 'SETTINGS & CONTROLS'}
          </h2>
        </div>

        {/* AUDIO SECTION */}
        <div className="mb-6 bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              {t('audioVolume')}
            </span>
            <button
              onClick={handleToggleMute}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {isMuted ? t('soundMuted') : t('soundEnabled')}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{t('sfxVolume')}</span>
                <span className="font-mono text-slate-200">{Math.round(sfxVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVol}
                onChange={handleSfxChange}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{t('bgmVolume')}</span>
                <span className="font-mono text-slate-200">{Math.round(musicVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVol}
                onChange={handleMusicChange}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* MOBILE TOUCH CONTROLS TOGGLE */}
        <div className="mb-6 bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">{t('touchControlsTitle')}</h4>
              <p className="text-[11px] text-slate-400">{t('touchControlsDesc')}</p>
            </div>
          </div>
          <button
            onClick={() => onToggleTouchControls(!showTouchControls)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              showTouchControls
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {showTouchControls ? t('alwaysOn') : t('autoOff')}
          </button>
        </div>

        {/* KEYBINDINGS SECTION */}
        <div className="mb-6 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-amber-400" />
              {t('keybindingsTitle')}
            </span>
            <button
              onClick={handleResetKeys}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> {t('resetDefaults')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* P1 KEYS */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 pb-1 border-b border-slate-800">
                {t('player1Controls')}
              </h5>
              {Object.entries(p1Keys).map(([action, key]) => {
                const isListening = listeningFor?.player === 'p1' && listeningFor.action === action;
                return (
                  <div key={action} className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-400">{actionLabels[action] || action}</span>
                    <button
                      onClick={() => handleKeyClick('p1', action)}
                      className={`px-2.5 py-0.5 rounded font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                        isListening
                          ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {isListening ? (language === 'ru' ? 'НАЖМИТЕ КЛАВИШУ...' : 'PRESS KEY...') : key.replace('Key', '').replace('Digit', '')}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* P2 KEYS */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 pb-1 border-b border-slate-800">
                {t('player2Controls')}
              </h5>
              {Object.entries(p2Keys).map(([action, key]) => {
                const isListening = listeningFor?.player === 'p2' && listeningFor.action === action;
                return (
                  <div key={action} className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-400">{actionLabels[action] || action}</span>
                    <button
                      onClick={() => handleKeyClick('p2', action)}
                      className={`px-2.5 py-0.5 rounded font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                        isListening
                          ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {isListening ? (language === 'ru' ? 'НАЖМИТЕ КЛАВИШУ...' : 'PRESS KEY...') : key.replace('Arrow', '').replace('Key', '').replace('Digit', '')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wider uppercase rounded-xl transition-colors cursor-pointer font-title"
        >
          {t('saveReturn')}
        </button>
      </div>
    </div>
  );
};
