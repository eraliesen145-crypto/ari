export type GameMode = 'PVE' | 'PVP' | 'EVE' | 'TRAINING';
export type AIDifficulty = 'EASY' | 'NORMAL' | 'HARD';
export type WeaponType = 'melee' | 'ranged' | 'magic';

export type CharacterAction = 
  | 'IDLE' 
  | 'WALK_FORWARD' 
  | 'WALK_BACK' 
  | 'JUMP' 
  | 'ATTACK_LIGHT' 
  | 'ATTACK_HEAVY' 
  | 'SPECIAL' 
  | 'BLOCK' 
  | 'DODGE' 
  | 'HIT_STUN' 
  | 'KNOCKDOWN' 
  | 'VICTORY' 
  | 'DEFEAT';

export interface HeroStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  range: number;
  energy: number;
}

export interface HeroDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  style: string;
  color: string;
  secondaryColor: string;
  accentColor: string;
  stats: HeroStats;
  starterWeaponId: string;
  ability: {
    name: string;
    description: string;
    energyCost: number;
    cooldown: number; // in milliseconds
    type: 'dash' | 'strike' | 'beam' | 'projectile' | 'nova' | 'teleport' | 'slam' | 'clone';
  };
  unlockedByDefault: boolean;
  requiredLevel: number;
}

export interface WeaponDefinition {
  id: string;
  name: string;
  type: WeaponType;
  description: string;
  damage: number;
  speed: number;       // 1 - 100
  range: number;       // pixels in melee / reach
  radius: number;      // hitbox width/arc
  cooldown: number;    // ms between attacks
  critChance: number;  // 0 - 1
  color: string;
  icon: string;
  unlockedByDefault: boolean;
  requiredLevel: number;
}

export interface ArenaDefinition {
  id: string;
  name: string;
  theme: string;
  description: string;
  imagePath?: string;
  ambientParticles: 'torch_embers' | 'fireflies' | 'sandstorm' | 'embers_smoke' | 'arcane_motes';
  floorColor: string;
  ambientColor: string;
}

export interface Projectile {
  id: number;
  ownerId: 'p1' | 'p2';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  trailColor: string;
  piercing: boolean;
  life: number;
  maxLife: number;
  type: 'arrow' | 'bolt' | 'knife' | 'orb' | 'arcane_wave' | 'flock' | 'lightning';
}

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'spark' | 'smoke' | 'rune';
}

export interface DamagePopup {
  id: number;
  x: number;
  y: number;
  value: number | string;
  color: string;
  life: number;
  maxLife: number;
  isCrit?: boolean;
  isBlock?: boolean;
}

export interface ArenaWeaponDrop {
  id: number;
  weapon: WeaponDefinition;
  x: number;
  y: number;
  collected: boolean;
}

export interface PlayerFighterState {
  id: 'p1' | 'p2';
  hero: HeroDefinition;
  weapon: WeaponDefinition;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1; // 1 = right, -1 = left
  isGrounded: boolean;

  hp: number;
  maxHp: number;
  bufferedHp: number; // for smooth red damage bar drop
  energy: number;
  maxEnergy: number;

  action: CharacterAction;
  actionTime: number;
  actionDuration: number;

  isBlocking: boolean;
  isDodging: boolean;
  dodgeCooldown: number;
  
  abilityCooldown: number;
  attackCooldown: number;

  comboCount: number;
  comboTimer: number;

  hitStunTime: number;
  knockdownTime: number;

  // Stats for post-match
  damageDealt: number;
  hitsLanded: number;
  maxCombo: number;
}

export interface KeyBindings {
  left: string;
  right: string;
  jump: string;
  block: string;
  lightAttack: string;
  heavyAttack: string;
  special: string;
  dodge: string;
}

export interface MatchResult {
  winnerId: 'p1' | 'p2' | 'DRAW';
  winnerName: string;
  winnerHero: HeroDefinition;
  p1Stats: {
    heroName: string;
    damageDealt: number;
    hitsLanded: number;
    maxCombo: number;
  };
  p2Stats: {
    heroName: string;
    damageDealt: number;
    hitsLanded: number;
    maxCombo: number;
  };
  duration: number; // seconds
  xpEarned: number;
}
