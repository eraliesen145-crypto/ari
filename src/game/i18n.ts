import { useState, useEffect } from 'react';
import { HeroDefinition, WeaponDefinition, ArenaDefinition } from '../types/game';

export type Language = 'ru' | 'en';

type Listener = (lang: Language) => void;

class I18nManager {
  private currentLanguage: Language;
  private listeners: Set<Listener> = new Set();

  constructor() {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('boh_lang') : null;
    // Default to 'ru' since Russian is requested, fallback to 'ru'
    this.currentLanguage = (saved === 'en' || saved === 'ru') ? saved : 'ru';
  }

  public get language(): Language {
    return this.currentLanguage;
  }

  public setLanguage(lang: Language) {
    if (this.currentLanguage === lang) return;
    this.currentLanguage = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('boh_lang', lang);
    }
    this.notify();
  }

  public toggleLanguage(): Language {
    const next = this.currentLanguage === 'ru' ? 'en' : 'ru';
    this.setLanguage(next);
    return next;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.currentLanguage));
  }
}

export const i18n = new I18nManager();

// React hook for components
export function useLanguage() {
  const [lang, setLang] = useState<Language>(i18n.language);

  useEffect(() => {
    return i18n.subscribe(newLang => {
      setLang(newLang);
    });
  }, []);

  return {
    language: lang,
    setLanguage: (l: Language) => i18n.setLanguage(l),
    toggleLanguage: () => i18n.toggleLanguage(),
    t: (key: TranslationKey) => translations[lang][key] || key,
  };
}

// Translations dictionary
export const translations = {
  ru: {
    // General & Brand
    gameTitle: 'БИТВА ГЕРОЕВ',
    gameSubtitle: 'ТАКТИЧЕСКИЙ 2D ФАЙТИНГ',
    gameDesc: 'Управляйте легендарными чемпионами, овладейте сокрушительным оружием и побеждайте на арене в динамичных битвах.',
    enterBattle: 'В БОЙ',
    heroesRoster: 'СПИСОК ГЕРОЕВ',
    warArmory: 'ОРУЖЕЙНАЯ',
    ranksRewards: 'РАНГИ И НАГРАДЫ',
    settingsControls: 'НАСТРОЙКИ И УПРАВЛЕНИЕ',
    footerInfo: '8 Уникальных Героев · 12 Видов Оружия · 5 Динамических Арен',
    footerControls: 'Клавиатура и Сенсорное управление',
    champion: 'ЧЕМПИОН',
    level: 'УРОВЕНЬ',
    xp: 'ОПЫТ',
    language: 'Язык',
    langName: 'Русский',
    otherLangName: 'English',

    // Mode Select Modal
    selectCombatMode: 'ВЫБОР РЕЖИМА ИГРЫ',
    chooseArenaExp: 'ВЫБЕРИТЕ ТИП СРАЖЕНИЯ',
    pveTitle: 'Игрок против ИИ',
    pveBadge: 'ОДИНОЧНЫЙ',
    pveDesc: 'Сразитесь в дуэли против боевого бота с настраиваемым уровнем сложности.',
    pvpTitle: 'Игрок против Игрока',
    pvpBadge: 'ЛОКАЛЬНО 1 НА 1',
    pvpDesc: 'Битва двух игроков на одной клавиатуре. Разделите клавиши и выясните, кто сильнее.',
    eveTitle: 'ИИ против ИИ',
    eveBadge: 'СИМУЛЯЦИЯ',
    eveDesc: 'Зрелищный показательный бой двух полностью автономных чемпионов.',
    trainingTitle: 'Тренировочное Додзё',
    trainingBadge: 'ПРАКТИКА',
    trainingDesc: 'Отрабатывайте комбо-цепочки, тайминги атак и спецприемы без лимита времени.',
    aiDifficulty: 'СЛОЖНОСТЬ ИИ',
    diffEasy: 'Легкая',
    diffNormal: 'Обычная',
    diffHard: 'Эксперт',
    diffEasyDesc: 'Бот реже атакует и дает пространство для маневра.',
    diffNormalDesc: 'Сбалансированное поведение с блоками и комбо.',
    diffHardDesc: 'Агрессивный ИИ с быстрой реакцией и спецприемами.',
    proceedToSelection: 'ПРОДОЛЖИТЬ ВЫБОР',

    // Hero Select
    theArenaAwaits: 'АРЕНА ОЖИДАЕТ',
    selectYourChampion: 'ВЫБЕРИТЕ ЧЕМПИОНА',
    player1: 'ИГРОК 1',
    player2: 'ИГРОК 2',
    bot: 'БОТ',
    ready: 'ГОТОВ',
    locked: 'ЗАБЛОКИРОВАНО',
    unlockedByDefault: 'Доступен сразу',
    requiresPlayerLevel: 'Требуется уровень',
    fightingStyle: 'Боевой стиль',
    statAttack: 'Атака',
    statDefense: 'Защита',
    statSpeed: 'Скорость',
    statEnergy: 'Энергия',
    specialAbility: 'Суперспособность',
    cooldownSec: 'сек КД',
    selectWeapons: 'ВЫБРАТЬ ОРУЖИЕ',
    back: 'НАЗАД',

    // Weapon Select
    loadoutPrep: 'ПОДГОТОВКА ЭКИПИРОВКИ',
    selectArsenal: 'ВЫБОР ОРУЖИЯ',
    all: 'Все',
    melee: 'Ближнее',
    ranged: 'Дальнее',
    magic: 'Магия',
    baseDamage: 'Базовый урон',
    attackSpeed: 'Скорость атаки',
    rangeReach: 'Дальность / Радиус',
    critChance: 'Крит. шанс',
    selectArena: 'ВЫБРАТЬ АРЕНУ',
    weaponP1: 'ОРУЖИЕ P1',
    weaponP2: 'ОРУЖИЕ P2',

    // Arena Select
    battleground: 'ПОЛЕ БИТВЫ',
    selectBattleArena: 'ВЫБОР АРЕНЫ',
    randomArena: 'СЛУЧАЙНАЯ АРЕНА',
    startBattle: 'НАЧАТЬ СРАЖЕНИЕ',

    // In-game HUD
    round1: 'РАУНД 1',
    hp: 'ЗДОРОВЬЕ',
    energy: 'ЭНЕРГИЯ',
    combo: 'КОМБО',
    hits: 'УДАРОВ',
    pause: 'ПАУЗА',
    reset: 'СБРОС',
    exit: 'ВЫХОД',
    weaponDropNotification: 'Оружие упало на арену! Подойдите, чтобы подобрать.',

    // Pause Menu
    paused: 'ПАУЗА',
    resumeFight: 'ПРОДОЛЖИТЬ БОЙ',
    restartMatch: 'ПЕРЕЗАПУСТИТЬ',
    quitToMenu: 'В ГЛАВНОЕ МЕНЮ',

    // Touch controls
    touchLight: 'УДАР',
    touchHeavy: 'СИЛЬНЫЙ',
    touchBlock: 'БЛОК',
    touchDodge: 'РЫВОК',
    touchSpecial: 'СУПЕР',

    // Victory / Defeat Modal
    victory: 'ПОБЕДА!',
    defeat: 'ПОРАЖЕНИЕ!',
    draw: 'НИЧЬЯ!',
    player1Wins: 'ИГРОК 1 ПОБЕДИЛ!',
    player2Wins: 'ИГРОК 2 ПОБЕДИЛ!',
    botWins: 'БОТ ОДЕРЖАЛ ПОБЕДУ!',
    timeExpired: 'ВРЕМЯ ИСТЕКЛО',
    knockout: 'НОКАУТ (K.O.)',
    postMatchSummary: 'ИТОГИ СРАЖЕНИЯ',
    damageDealt: 'Нанесенный урон',
    hitsLanded: 'Точных ударов',
    maxCombo: 'Пиковое комбо',
    xpEarned: 'Получено опыта',
    rematch: 'РЕВАНШ',
    changeHero: 'СМЕНИТЬ ГЕРОЯ',
    mainMenu: 'В ГЛАВНОЕ МЕНЮ',

    // Settings Modal
    systemPreferences: 'СИСТЕМНЫЕ НАСТРОЙКИ',
    settingsTitle: 'НАСТРОЙКИ И УПРАВЛЕНИЕ',
    audioSettings: 'ЗВУК И МУЗЫКА',
    sfxVolume: 'Звуковые эффекты',
    musicVolume: 'Музыка арены',
    muteAll: 'Отключить звук',
    languageSetting: 'ЯЗЫК ИНТЕРФЕЙСА',
    touchGamepadSetting: 'ВИРТУАЛЬНЫЙ ГЕЙМПАД',
    touchGamepadDesc: 'Отображать экранные кнопки управления для мобильных устройств и планшетов.',
    keyboardBindings: 'НАЗНАЧЕНИЕ КЛАВИШ',
    p1BindingsTitle: 'Игрок 1 (WASD + JKL / Пробел)',
    p2BindingsTitle: 'Игрок 2 (Стрелки + 1,2,3 / 0)',
    resetToDefault: 'СБРОСИТЬ КЛАВИШИ',
    pressAnyKey: 'Нажмите клавишу...',
    keyMoveLeft: 'Влево',
    keyMoveRight: 'Вправо',
    keyJump: 'Прыжок',
    keyBlock: 'Блок',
    keyAttackLight: 'Быстрый удар',
    keyAttackHeavy: 'Тяжелый удар',
    keyDodge: 'Рывок',
    keySpecial: 'Способность',

    // Progression Modal
    championProgression: 'ПРОГРЕССИЯ ЧЕМПИОНА',
    ranksAndRewards: 'РАНГИ И НАГРАДЫ',
    xpUntilNextRank: 'XP до следующего ранга',
    battles: 'Боев',
    victories: 'Побед',
    peakComboStat: 'Пиковое комбо',
    rankUnlockMilestones: 'Вехи рангов и разблокировок',
    unlocks: 'Открывает',

    // Galleries
    heroesAndStyles: 'ГЕРОИ И БОЕВЫЕ СТИЛИ',
    weaponsAndArtifacts: 'ОРУЖИЕ И АРТЕФАКТЫ',
    warArmoryHeading: 'ВОЕННЫЙ АРСЕНАЛ',
    championsRosterHeading: 'СПИСОК ЧЕМПИОНОВ',
    unlockRequirement: 'Условие разблокировки',

    // Banners on canvas
    canvasRound1: 'РАУНД 1',
    canvasGetReady: 'ПРИГОТОВЬТЕСЬ',
    canvasFight: 'В БОЙ!',
    canvasUnleashFury: 'НЕ ЗНАЙ ПОЩАДЫ',

    // Extra keys
    heroesGallery: 'СПИСОК ГЕРОЕВ',
    progression: 'ПРОГРЕССИЯ',
    totalBattles: 'Боев',
    totalWins: 'Побед',
    highestCombo: 'Пиковое комбо',
    settings: 'НАСТРОЙКИ',
    audioVolume: 'Громкость звука',
    soundMuted: 'Без звука',
    soundEnabled: 'Включен',
    bgmVolume: 'Музыка арены',
    touchControlsTitle: 'Виртуальный сенсорный геймпад',
    touchControlsDesc: 'Отображать экранные кнопки управления',
    alwaysOn: 'ВСЕГДА ВКЛЮЧЕН',
    autoOff: 'АВТО / ВЫКЛ',
    keybindingsTitle: 'Назначение клавиш',
    resetDefaults: 'Сбросить по умолчанию',
    player1Controls: 'Управление Игрока 1',
    player2Controls: 'Управление Игрока 2 (PVP)',
    saveReturn: 'СОХРАНИТЬ И ВЕРНУТЬСЯ',
    weaponsGallery: 'ОРУЖЕЙНАЯ',
  },

  en: {
    // General & Brand
    gameTitle: 'BATTLE OF HEROES',
    gameSubtitle: 'TACTICAL 2D FIGHTING ARENA',
    gameDesc: 'Unleash legendary champions, master devastating weapons, and conquer the battlefield in intense real-time combat.',
    enterBattle: 'ENTER BATTLE',
    heroesRoster: 'HEROES ROSTER',
    warArmory: 'WAR ARMORY',
    ranksRewards: 'RANKS & REWARDS',
    settingsControls: 'SETTINGS & CONTROLS',
    footerInfo: '8 Unique Heroes · 12 Armaments · 5 Dynamic Arenas',
    footerControls: 'Keyboard & Touch Supported',
    champion: 'CHAMPION',
    level: 'LEVEL',
    xp: 'XP',
    language: 'Language',
    langName: 'English',
    otherLangName: 'Русский',

    // Mode Select Modal
    selectCombatMode: 'SELECT COMBAT MODE',
    chooseArenaExp: 'CHOOSE YOUR ARENA EXPERIENCE',
    pveTitle: 'Player vs AI',
    pveBadge: 'SOLO COMBAT',
    pveDesc: 'Duel against tactical bots with adjustable combat intelligence.',
    pvpTitle: 'Player vs Player (Local)',
    pvpBadge: 'LOCAL 1V1',
    pvpDesc: 'Two champions on one device and keyboard. Share controls and settle scores.',
    eveTitle: 'AI vs AI Simulation',
    eveBadge: 'SPECTATE',
    eveDesc: 'Witness cinematic clash between two autonomous combatants.',
    trainingTitle: 'Training Dojo',
    trainingBadge: 'PRACTICE',
    trainingDesc: 'Master combos, parry windows, and weapon reaches without round limits.',
    aiDifficulty: 'AI DIFFICULTY',
    diffEasy: 'Easy',
    diffNormal: 'Normal',
    diffHard: 'Hard',
    diffEasyDesc: 'Forgiving reaction times and relaxed aggression.',
    diffNormalDesc: 'Adaptive combatant that blocks and strings combos.',
    diffHardDesc: 'Ruthless punisher with razor-sharp reflexes and evasion.',
    proceedToSelection: 'PROCEED TO SELECTION',

    // Hero Select
    theArenaAwaits: 'THE ARENA AWAITS',
    selectYourChampion: 'SELECT YOUR CHAMPION',
    player1: 'PLAYER 1',
    player2: 'PLAYER 2',
    bot: 'BOT',
    ready: 'READY',
    locked: 'LOCKED',
    unlockedByDefault: 'Unlocked by Default',
    requiresPlayerLevel: 'Requires Level',
    fightingStyle: 'Fighting Style',
    statAttack: 'Attack',
    statDefense: 'Defense',
    statSpeed: 'Speed',
    statEnergy: 'Energy',
    specialAbility: 'Special Ability',
    cooldownSec: 's CD',
    selectWeapons: 'SELECT WEAPONS',
    back: 'BACK',

    // Weapon Select
    loadoutPrep: 'LOADOUT PREPARATION',
    selectArsenal: 'SELECT ARSENAL',
    all: 'All',
    melee: 'Melee',
    ranged: 'Ranged',
    magic: 'Magic',
    baseDamage: 'Base Damage',
    attackSpeed: 'Attack Speed',
    rangeReach: 'Range / Reach',
    critChance: 'Crit Chance',
    selectArena: 'SELECT ARENA',
    weaponP1: 'P1 WEAPON',
    weaponP2: 'P2 WEAPON',

    // Arena Select
    battleground: 'BATTLEGROUND',
    selectBattleArena: 'SELECT BATTLE ARENA',
    randomArena: 'RANDOM ARENA',
    startBattle: 'START BATTLE',

    // In-game HUD
    round1: 'ROUND 1',
    hp: 'HEALTH',
    energy: 'ENERGY',
    combo: 'COMBO',
    hits: 'HITS',
    pause: 'PAUSE',
    reset: 'RESET',
    exit: 'EXIT',
    weaponDropNotification: 'Weapon drop on the arena! Step over to equip.',

    // Pause Menu
    paused: 'PAUSED',
    resumeFight: 'RESUME FIGHT',
    restartMatch: 'RESTART MATCH',
    quitToMenu: 'QUIT TO MENU',

    // Touch controls
    touchLight: 'LIGHT',
    touchHeavy: 'HEAVY',
    touchBlock: 'BLOCK',
    touchDodge: 'DODGE',
    touchSpecial: 'SPECIAL',

    // Victory / Defeat Modal
    victory: 'VICTORY!',
    defeat: 'DEFEAT!',
    draw: 'DRAW!',
    player1Wins: 'PLAYER 1 WINS!',
    player2Wins: 'PLAYER 2 WINS!',
    botWins: 'BOT WINS!',
    timeExpired: 'TIME EXPIRED',
    knockout: 'KNOCKOUT (K.O.)',
    postMatchSummary: 'POST-MATCH SUMMARY',
    damageDealt: 'Damage Dealt',
    hitsLanded: 'Hits Landed',
    maxCombo: 'Max Combo',
    xpEarned: 'XP Earned',
    rematch: 'REMATCH',
    changeHero: 'CHANGE HERO',
    mainMenu: 'MAIN MENU',

    // Settings Modal
    systemPreferences: 'SYSTEM PREFERENCES',
    settingsTitle: 'SETTINGS & CONTROLS',
    audioSettings: 'AUDIO & SOUND EFFECTS',
    sfxVolume: 'SFX Volume',
    musicVolume: 'Music Volume',
    muteAll: 'Mute All Audio',
    languageSetting: 'LANGUAGE',
    touchGamepadSetting: 'VIRTUAL TOUCH GAMEPAD',
    touchGamepadDesc: 'Display on-screen d-pad and action buttons for phones & tablets.',
    keyboardBindings: 'KEYBOARD CONTROLS',
    p1BindingsTitle: 'Player 1 (WASD + JKL / Space)',
    p2BindingsTitle: 'Player 2 (Numpad / Arrows)',
    resetToDefault: 'RESET TO DEFAULT',
    pressAnyKey: 'Press any key...',
    keyMoveLeft: 'Move Left',
    keyMoveRight: 'Move Right',
    keyJump: 'Jump',
    keyBlock: 'Block',
    keyAttackLight: 'Light Attack',
    keyAttackHeavy: 'Heavy Attack',
    keyDodge: 'Dodge',
    keySpecial: 'Special',

    // Progression Modal
    championProgression: 'CHAMPION PROGRESSION',
    ranksAndRewards: 'RANKS & REWARDS',
    xpUntilNextRank: 'XP until next rank',
    battles: 'Battles',
    victories: 'Victories',
    peakComboStat: 'Peak Combo',
    rankUnlockMilestones: 'Rank Unlock Milestones',
    unlocks: 'Unlocks',

    // Galleries
    heroesAndStyles: 'HEROES & COMBAT STYLES',
    weaponsAndArtifacts: 'WEAPONS & ARTIFACTS',
    warArmoryHeading: 'WAR ARMORY',
    championsRosterHeading: 'CHAMPIONS ROSTER',
    unlockRequirement: 'Unlock Requirement',

    // Banners on canvas
    canvasRound1: 'ROUND 1',
    canvasGetReady: 'GET READY',
    canvasFight: 'FIGHT!',
    canvasUnleashFury: 'UNLEASH FURY',

    // Extra keys
    heroesGallery: 'HEROES ROSTER',
    progression: 'PROGRESSION',
    totalBattles: 'Battles',
    totalWins: 'Victories',
    highestCombo: 'Peak Combo',
    settings: 'SETTINGS',
    audioVolume: 'Audio Volumes',
    soundMuted: 'Muted',
    soundEnabled: 'Enabled',
    bgmVolume: 'Battle Music',
    touchControlsTitle: 'On-Screen Virtual Touch Gamepad',
    touchControlsDesc: 'Display virtual D-pad and thumb buttons',
    alwaysOn: 'ALWAYS ON',
    autoOff: 'AUTO / OFF',
    keybindingsTitle: 'Keyboard Keybindings',
    resetDefaults: 'Reset Defaults',
    player1Controls: 'Player 1 Controls',
    player2Controls: 'Player 2 Controls (PVP)',
    saveReturn: 'SAVE & RETURN',
    weaponsGallery: 'WAR ARMORY',
  },
};

export type TranslationKey = keyof typeof translations['en'];

// Hero translations
interface HeroI18n {
  name: string;
  title: string;
  description: string;
  style: string;
  abilityName: string;
  abilityDesc: string;
}

export const HERO_TRANSLATIONS: Record<string, Record<Language, HeroI18n>> = {
  iron: {
    ru: {
      name: 'АЙРОН',
      title: 'Железный Бастион',
      description: 'Могучий воин в зачарованных доспехах из закаленной стали. Медлителен в наступлении, но несокрушим в обороне и смертоносен вблизи.',
      style: 'Тяжелый Джаггернаут',
      abilityName: 'Железная Крепость',
      abilityDesc: 'Ударяет по земле, вызывая сейсмические каменные столпы, пробивающие блок и отбрасывающие врага.',
    },
    en: {
      name: 'IRON',
      title: 'The Iron Bastion',
      description: 'A hulking warrior encased in enchanted tempered steel. Slow to advance, but practically immovable and punishing up close.',
      style: 'Heavy Juggernaut',
      abilityName: 'Iron Fortress',
      abilityDesc: 'Slams the earth creating seismic shockwave pillars that pierce guard and blast opponents backward.',
    },
  },
  shadow: {
    ru: {
      name: 'ШЭДОУ',
      title: 'Шепот Смерти',
      description: 'Призрачный ассасин, владеющий тайными техниками дыма. Атакует с молниеносной скоростью и мгновенно проскальзывает за спину врага.',
      style: 'Теневой Убийца',
      abilityName: 'Теневой Скачок',
      abilityDesc: 'Растворяется в облаке дыма и мгновенно наносит сокрушительный удар в спину противника.',
    },
    en: {
      name: 'SHADOW',
      title: 'Whisper of Death',
      description: 'An ethereal assassin trained in forbidden smoke arts. Strikes with blistering speed and slips behind enemy lines.',
      style: 'Shadow Assassin',
      abilityName: 'Shadow Blink',
      abilityDesc: 'Vanishes into a cloud of smoke and instantly executes a devastating surprise strike behind the target.',
    },
  },
  valkyrie: {
    ru: {
      name: 'ВАЛЬКИРИЯ',
      title: 'Сияющий Эгис',
      description: 'Небесная воительница света. Сочетает идеальный баланс фехтования, дальнобойного копья и солнечной магии.',
      style: 'Божественный Авангард',
      abilityName: 'Копье Света',
      abilityDesc: 'Метнет ослепительную молнию солнечной энергии через всю арену, оглушая и отбрасывая цель.',
    },
    en: {
      name: 'VALKYRIE',
      title: 'Radiant Aegis',
      description: 'Champion of the celestial sky. Commands balanced martial prowess, piercing polearms, and solar light magic.',
      style: 'Divine Vanguard',
      abilityName: 'Spear of Light',
      abilityDesc: 'Hurls a blinding bolt of solar lightning across the arena, causing heavy stagger and knockback.',
    },
  },
  blade: {
    ru: {
      name: 'БЛЕЙД',
      title: 'Святой Меча',
      description: 'Мастер смертоносных лезвий. Связывает быстрые взмахи катаны в непрерывные комбо, наказывая за малейшую ошибку.',
      style: 'Мастер Клинка',
      abilityName: 'Омни-разрез',
      abilityDesc: 'Совершает серию из четырех молниеносных пространственных рассечений сквозь врага во мгновение ока.',
    },
    en: {
      name: 'BLADE',
      title: 'Sword Saint',
      description: 'Master of lethal edge techniques. Chains rapid katana and longsword flourishes that easily punish opponent openings.',
      style: 'Sword Saint',
      abilityName: 'Omnislash',
      abilityDesc: 'Unleashes a rapid barrage of four consecutive dimensional cuts through the enemy in the blink of an eye.',
    },
  },
  raven: {
    ru: {
      name: 'РЕЙВЕН',
      title: 'Меткий Страж',
      description: 'Одинокий стрелок в плаще из вороньих перьев. Доминирует на дистанции благодаря убийственной точности лука.',
      style: 'Меткий Лучник',
      abilityName: 'Буря Воронов',
      abilityDesc: 'Выпускает стаю острых как бритва призрачных воронов, преследующих и бомбардирующих противника сверху.',
    },
    en: {
      name: 'RAVEN',
      title: 'Deadeye Warden',
      description: 'A solitary marksman draped in raven plumage. Dominates combat from long distances with lethal bow precision.',
      style: 'Deadeye Marksman',
      abilityName: 'Raven Tempest',
      abilityDesc: 'Releases a swarm of razor-sharp spirit ravens that track and bombard the target from above.',
    },
  },
  titan: {
    ru: {
      name: 'ТИТАН',
      title: 'Колосс Разрушения',
      description: 'Древний титан, пробужденный из раскаленных глубин. Каждый его удар крушит броню и сбивает противника с ног.',
      style: 'Колоссальный Берсерк',
      abilityName: 'Сейсмический Кратер',
      abilityDesc: 'Взмывает высоко в воздух и обрушивается вниз сокрушительным огненным извержением, сотрясающим арену.',
    },
    en: {
      name: 'TITAN',
      title: 'Colossus of Ruin',
      description: 'A primal giant awakened from molten deeps. Every blow shatters armor and sends opponents flying.',
      style: 'Colossal Berserker',
      abilityName: 'Seismic Crater',
      abilityDesc: 'Leaps high into the air and crashes down with a cataclysmic fiery eruption that rocks the entire arena.',
    },
  },
  phantom: {
    ru: {
      name: 'ФАНТОМ',
      title: 'Призрачный Дуэлянт',
      description: 'Мастер иллюзий и ледяных призрачных образов. Уклоняется от любых атак с помощью фазового сдвига.',
      style: 'Призрачный Ловкач',
      abilityName: 'Призрачная Обманка',
      abilityDesc: 'Фазово отскакивает назад, оставляя нестабильную энергетическую копию, взрывающуюся при контакте с врагом.',
    },
    en: {
      name: 'PHANTOM',
      title: 'Spectral Duelist',
      description: 'A master of illusion wrapped in icy blue apparitions. Evades attacks with effortless phase-shifting.',
      style: 'Evasive Trickster',
      abilityName: 'Spectral Decoy',
      abilityDesc: 'Phases backward leaving behind an unstable energy decoy that detonates when touched by the opponent.',
    },
  },
  arcane: {
    ru: {
      name: 'АРКЕЙН',
      title: 'Архимаг Бездны',
      description: 'Повелевает космосом и сферами пустоты. Контролирует арену самонаводящимися заклинаниями и гравитационными волнами.',
      style: 'Мистический Маг',
      abilityName: 'Астральная Сверхновая',
      abilityDesc: 'Создает расширяющееся ядро космической энергии, выпускающее орбитальные плазменные снаряды.',
    },
    en: {
      name: 'ARCANE',
      title: 'Archmage of the Void',
      description: 'Commands ancient cosmos and void spheres. Controls the arena with homing sorceries and reality-warping blasts.',
      style: 'Mystic Magus',
      abilityName: 'Arcane Supernova',
      abilityDesc: 'Summons an expanding core of cosmic energy that discharges multiple orbiting stellar projectiles.',
    },
  },
};

// Weapon translations
interface WeaponI18n {
  name: string;
  description: string;
}

export const WEAPON_TRANSLATIONS: Record<string, Record<Language, WeaponI18n>> = {
  sword: {
    ru: {
      name: 'Полуторный меч',
      description: 'Сбалансированный стальной обоюдоострый клинок с надежным размахом и парированием.',
    },
    en: {
      name: 'Bastard Longsword',
      description: 'Balanced steel double-edged blade. Reliable swing arcs and solid parry defense.',
    },
  },
  katana: {
    ru: {
      name: 'Катана Мурамаса',
      description: 'Выкована из теневой стали. Мгновенные удары с высоким шансом критического урона.',
    },
    en: {
      name: 'Muramasa Katana',
      description: 'Forged from folded shadow steel. Extremely swift draw attacks with high critical strike rate.',
    },
  },
  axe: {
    ru: {
      name: 'Обсидиановый топор',
      description: 'Тяжелый боевой топор, сокрушающий вражеский блок чистой силой инерции.',
    },
    en: {
      name: 'Obsidian Battleaxe',
      description: 'Heavy cleaving greataxe capable of sundering enemy guards with sheer rotational force.',
    },
  },
  spear: {
    ru: {
      name: 'Небесная пика',
      description: 'Длинное серебряное копье, удерживающее врага на расстоянии стремительными уколами.',
    },
    en: {
      name: 'Celestial Lance',
      description: 'Long silver spear that keeps opponents at distance with safe, high-velocity thrusts.',
    },
  },
  hammer: {
    ru: {
      name: 'Молот Буревестника',
      description: 'Гигантский боевой молот огромной силы. Накладывает оглушение и сотрясает землю.',
    },
    en: {
      name: 'Thunderforge Hammer',
      description: 'Gigantic war hammer with massive stopping power. Inflicts heavy stun and ground impact shockwaves.',
    },
  },
  daggers: {
    ru: {
      name: 'Парные Клыки Ночи',
      description: 'Двойные зазубренные кинжалы для молниеносных комбо и быстрого отката.',
    },
    en: {
      name: 'Twin Nightfangs',
      description: 'Dual serrated daggers allowing ultra-fast combo chains and quick recovery windows.',
    },
  },
  bow: {
    ru: {
      name: 'Лук Теневого Ястреба',
      description: 'Легкий композитный лук, выпускающий скоростные пронзающие стрелы через всю арену.',
    },
    en: {
      name: 'Shadow Hawk Bow',
      description: 'Lightweight composite bow that shoots high-velocity piercing arrows across the arena.',
    },
  },
  crossbow: {
    ru: {
      name: 'Тяжелый арбалет',
      description: 'Механический арбалет, стреляющий бронебойными болтами с сильным отбрасыванием.',
    },
    en: {
      name: 'Arbalest Heavy Crossbow',
      description: 'Mechanized arbalest firing armor-piercing heavy bolts with intense knockback.',
    },
  },
  throwing_knives: {
    ru: {
      name: 'Ядовитые ножи',
      description: 'Быстрые парные метательные клинки, застающие уклоняющегося врага врасплох.',
    },
    en: {
      name: 'Venom Throwing Knives',
      description: 'Rapidly hurls paired steel blades that catch dodging foes off-guard.',
    },
  },
  staff: {
    ru: {
      name: 'Посох Затмения',
      description: 'Древний артефакт, выпускающий самонаводящиеся звездные сферы с защитной аурой.',
    },
    en: {
      name: 'Staff of the Eclipse',
      description: 'Ancient conduit that releases homing stellar orbs and emits a pulsing protective aura.',
    },
  },
  magic_blade: {
    ru: {
      name: 'Эфирный Клинок',
      description: 'Клинок из чистой эфирной энергии, посылающий волны полумесяцев при каждом взмахе.',
    },
    en: {
      name: 'Ether Brand',
      description: 'A blade woven of condensed pure ether that sends crescent arc waves with every slash.',
    },
  },
  energy_orbs: {
    ru: {
      name: 'Сферы Звездной Бездны',
      description: 'Парящие мистические сферы, выпускающие тройные залпы космической плазмы во врага.',
    },
    en: {
      name: 'Void Star Orbs',
      description: 'Hovering mystical focus orbs firing tri-bursts of cosmic plasma into the opponent.',
    },
  },
};

// Arena translations
interface ArenaI18n {
  name: string;
  theme: string;
  description: string;
}

export const ARENA_TRANSLATIONS: Record<string, Record<Language, ArenaI18n>> = {
  castle: {
    ru: {
      name: 'Средневековый Замок',
      theme: 'Готическая Крепость',
      description: 'Древняя твердыня в сумерках с каменными стенами, боевыми знаменами и мерцающими факелами.',
    },
    en: {
      name: 'Medieval Castle',
      theme: 'Gothic Fortress',
      description: 'Ancient twilight stronghold with stone ramparts, torn battle flags, and flickering torches.',
    },
  },
  forest: {
    ru: {
      name: 'Темный Лес',
      theme: 'Зачарованная Чаща',
      description: 'Таинственная поляна в лунном свете среди вековых дубов и парящих светлячков.',
    },
    en: {
      name: 'Dark Forest',
      theme: 'Enchanted Woods',
      description: 'Eerie moonlit glade surrounded by twisted elder oaks and ethereal glowing mist.',
    },
  },
  city: {
    ru: {
      name: 'Разрушенный Город',
      theme: 'Павшая Цитадель',
      description: 'Опустошенный войной город под тревожным огненным закатным небом.',
    },
    en: {
      name: 'Ruined City',
      theme: 'Crumbling Metropolis',
      description: 'War-torn gothic cityscape beneath an apocalyptic burning orange sky.',
    },
  },
  arcane: {
    ru: {
      name: 'Астральное Святилище',
      theme: 'Космический Разлом',
      description: 'Парящие обсидиановые монолиты с рунами, дрейфующие вдоль небесных вихрей.',
    },
    en: {
      name: 'Arcane Sanctum',
      theme: 'Cosmic Rift',
      description: 'Floating obsidian runic monoliths drifting along celestial vortex streams.',
    },
  },
  desert: {
    ru: {
      name: 'Руины Пустыни',
      theme: 'Затонувший Храм',
      description: 'Древние песчаные колонны храма, погребенные посреди бушующей песчаной бури.',
    },
    en: {
      name: 'Desert Ruins',
      theme: 'Sunken Temple',
      description: 'Sunken sand-swept temple pillars buried deep within howling dune storms.',
    },
  },
};

// Localize Hero helper
export function getLocalizedHero(hero: HeroDefinition, lang: Language = i18n.language): HeroDefinition {
  const trans = HERO_TRANSLATIONS[hero.id]?.[lang];
  if (!trans) return hero;

  return {
    ...hero,
    name: trans.name,
    title: trans.title,
    description: trans.description,
    style: trans.style,
    ability: {
      ...hero.ability,
      name: trans.abilityName,
      description: trans.abilityDesc,
    },
  };
}

// Localize Weapon helper
export function getLocalizedWeapon(weapon: WeaponDefinition, lang: Language = i18n.language): WeaponDefinition {
  const trans = WEAPON_TRANSLATIONS[weapon.id]?.[lang];
  if (!trans) return weapon;

  return {
    ...weapon,
    name: trans.name,
    description: trans.description,
  };
}

// Localize Arena helper
export function getLocalizedArena(arena: ArenaDefinition, lang: Language = i18n.language): ArenaDefinition {
  const trans = ARENA_TRANSLATIONS[arena.id]?.[lang];
  if (!trans) return arena;

  return {
    ...arena,
    name: trans.name,
    theme: trans.theme,
    description: trans.description,
  };
}

// Rank milestone names
export const RANK_NAMES: Record<Language, Record<number, string>> = {
  ru: {
    1: 'Рекрут',
    2: 'Гладиатор',
    3: 'Полководец',
    4: 'Мастер',
    5: 'Грандмастер',
  },
  en: {
    1: 'Recruit',
    2: 'Gladiator',
    3: 'Warlord',
    4: 'Master',
    5: 'Grandmaster',
  },
};
