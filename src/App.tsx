/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HeroDefinition, WeaponDefinition, ArenaDefinition, GameMode, AIDifficulty } from './types/game';
import { HEROES, WEAPONS, ARENAS } from './game/data';
import { MainMenu } from './components/MainMenu';
import { ModeSelectModal } from './components/ModeSelectModal';
import { HeroSelect } from './components/HeroSelect';
import { WeaponSelect } from './components/WeaponSelect';
import { ArenaSelect } from './components/ArenaSelect';
import { FightView } from './components/FightView';
import { HeroesGallery } from './components/HeroesGallery';
import { WeaponsGallery } from './components/WeaponsGallery';
import { ProgressionModal } from './components/ProgressionModal';
import { SettingsModal } from './components/SettingsModal';
import { sound } from './game/sound';

type GameScreen = 'MENU' | 'HERO_SELECT' | 'WEAPON_SELECT' | 'ARENA_SELECT' | 'FIGHT';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('MENU');

  // Selected match parameters
  const [mode, setMode] = useState<GameMode>('PVE');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('NORMAL');

  const [p1Hero, setP1Hero] = useState<HeroDefinition>(HEROES[0]);
  const [p2Hero, setP2Hero] = useState<HeroDefinition>(HEROES[1]);

  const [p1Weapon, setP1Weapon] = useState<WeaponDefinition>(WEAPONS[0]);
  const [p2Weapon, setP2Weapon] = useState<WeaponDefinition>(WEAPONS[1]);

  const [selectedArena, setSelectedArena] = useState<ArenaDefinition>(ARENAS[0]);

  // Modals
  const [isModeSelectOpen, setIsModeSelectOpen] = useState(false);
  const [isHeroesGalleryOpen, setIsHeroesGalleryOpen] = useState(false);
  const [isWeaponsGalleryOpen, setIsWeaponsGalleryOpen] = useState(false);
  const [isProgressionOpen, setIsProgressionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-detect mobile/touch capability
  const [showTouchControls, setShowTouchControls] = useState(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  // Global user gesture unlock for audio
  useEffect(() => {
    const handleGesture = () => {
      sound.resumeAudio();
    };
    window.addEventListener('click', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });
    window.addEventListener('touchstart', handleGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
  }, []);

  // Flow handlers
  const handleSelectMode = (selectedMode: GameMode, selectedDiff: AIDifficulty) => {
    setMode(selectedMode);
    setDifficulty(selectedDiff);
    setIsModeSelectOpen(false);
    setCurrentScreen('HERO_SELECT');
  };

  const handleHeroSelected = (p1H: HeroDefinition, p2H: HeroDefinition) => {
    setP1Hero(p1H);
    setP2Hero(p2H);
    // Auto pick starter weapons initially
    const starterW1 = WEAPONS.find(w => w.id === p1H.starterWeaponId) || WEAPONS[0];
    const starterW2 = WEAPONS.find(w => w.id === p2H.starterWeaponId) || WEAPONS[1];
    setP1Weapon(starterW1);
    setP2Weapon(starterW2);
    setCurrentScreen('WEAPON_SELECT');
  };

  const handleWeaponSelected = (p1W: WeaponDefinition, p2W: WeaponDefinition) => {
    setP1Weapon(p1W);
    setP2Weapon(p2W);
    setCurrentScreen('ARENA_SELECT');
  };

  const handleArenaSelected = (arena: ArenaDefinition) => {
    setSelectedArena(arena);
    setCurrentScreen('FIGHT');
  };

  const handleExitFight = () => {
    setCurrentScreen('MENU');
  };

  const handleChangeHero = () => {
    setCurrentScreen('HERO_SELECT');
  };

  return (
    <main className="w-full h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* SCREEN ROUTING */}
      {currentScreen === 'MENU' && (
        <MainMenu
          onStartClick={() => setIsModeSelectOpen(true)}
          onOpenHeroes={() => setIsHeroesGalleryOpen(true)}
          onOpenWeapons={() => setIsWeaponsGalleryOpen(true)}
          onOpenProgression={() => setIsProgressionOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {currentScreen === 'HERO_SELECT' && (
        <HeroSelect
          mode={mode}
          onSelect={handleHeroSelected}
          onBack={() => setCurrentScreen('MENU')}
        />
      )}

      {currentScreen === 'WEAPON_SELECT' && (
        <WeaponSelect
          p1Hero={p1Hero}
          p2Hero={p2Hero}
          mode={mode}
          onConfirm={handleWeaponSelected}
          onBack={() => setCurrentScreen('HERO_SELECT')}
        />
      )}

      {currentScreen === 'ARENA_SELECT' && (
        <ArenaSelect
          onSelectArena={handleArenaSelected}
          onBack={() => setCurrentScreen('WEAPON_SELECT')}
        />
      )}

      {currentScreen === 'FIGHT' && (
        <FightView
          p1Hero={p1Hero}
          p1Weapon={p1Weapon}
          p2Hero={p2Hero}
          p2Weapon={p2Weapon}
          arena={selectedArena}
          mode={mode}
          difficulty={difficulty}
          showTouchControls={showTouchControls}
          onExitFight={handleExitFight}
          onChangeHero={handleChangeHero}
        />
      )}

      {/* MODALS */}
      {isModeSelectOpen && (
        <ModeSelectModal
          onSelectMode={handleSelectMode}
          onClose={() => setIsModeSelectOpen(false)}
        />
      )}

      {isHeroesGalleryOpen && (
        <HeroesGallery onClose={() => setIsHeroesGalleryOpen(false)} />
      )}

      {isWeaponsGalleryOpen && (
        <WeaponsGallery onClose={() => setIsWeaponsGalleryOpen(false)} />
      )}

      {isProgressionOpen && (
        <ProgressionModal onClose={() => setIsProgressionOpen(false)} />
      )}

      {isSettingsOpen && (
        <SettingsModal
          showTouchControls={showTouchControls}
          onToggleTouchControls={setShowTouchControls}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </main>
  );
}
