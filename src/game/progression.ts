import { HEROES, WEAPONS } from './data';

const STORAGE_KEY = 'battle_of_heroes_save_v1';

export interface PlayerProgression {
  level: number;
  xp: number;
  xpToNextLevel: number;
  unlockedHeroIds: string[];
  unlockedWeaponIds: string[];
  totalBattles: number;
  totalWins: number;
  highestCombo: number;
}

const DEFAULT_PROGRESSION: PlayerProgression = {
  level: 1,
  xp: 0,
  xpToNextLevel: 300,
  unlockedHeroIds: HEROES.filter(h => h.unlockedByDefault).map(h => h.id),
  unlockedWeaponIds: WEAPONS.filter(w => w.unlockedByDefault).map(w => w.id),
  totalBattles: 0,
  totalWins: 0,
  highestCombo: 0,
};

export class ProgressionManager {
  private state: PlayerProgression;

  constructor() {
    this.state = this.load();
  }

  public getProgression(): PlayerProgression {
    return { ...this.state };
  }

  private load(): PlayerProgression {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure defaults if any new keys exist
        return {
          ...DEFAULT_PROGRESSION,
          ...parsed,
          unlockedHeroIds: Array.from(new Set([...DEFAULT_PROGRESSION.unlockedHeroIds, ...(parsed.unlockedHeroIds || [])])),
          unlockedWeaponIds: Array.from(new Set([...DEFAULT_PROGRESSION.unlockedWeaponIds, ...(parsed.unlockedWeaponIds || [])])),
        };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_PROGRESSION };
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // storage unavailable
    }
  }

  public addBattleResult(won: boolean, maxCombo: number, baseXP: number = 100): {
    xpGained: number;
    leveledUp: boolean;
    newUnlocks: { heroes: string[]; weapons: string[] };
  } {
    this.state.totalBattles += 1;
    if (won) this.state.totalWins += 1;
    if (maxCombo > this.state.highestCombo) {
      this.state.highestCombo = maxCombo;
    }

    const xpGained = baseXP + (won ? 150 : 50) + (maxCombo * 10);
    this.state.xp += xpGained;

    let leveledUp = false;
    const newUnlocks = {
      heroes: [] as string[],
      weapons: [] as string[],
    };

    while (this.state.xp >= this.state.xpToNextLevel) {
      this.state.xp -= this.state.xpToNextLevel;
      this.state.level += 1;
      this.state.xpToNextLevel = Math.floor(this.state.xpToNextLevel * 1.4);
      leveledUp = true;

      // Check new unlocks for the new level
      HEROES.forEach(h => {
        if (h.requiredLevel <= this.state.level && !this.state.unlockedHeroIds.includes(h.id)) {
          this.state.unlockedHeroIds.push(h.id);
          newUnlocks.heroes.push(h.name);
        }
      });

      WEAPONS.forEach(w => {
        if (w.requiredLevel <= this.state.level && !this.state.unlockedWeaponIds.includes(w.id)) {
          this.state.unlockedWeaponIds.push(w.id);
          newUnlocks.weapons.push(w.name);
        }
      });
    }

    this.save();
    return { xpGained, leveledUp, newUnlocks };
  }

  public recordMatch(won: boolean, xpEarned: number, maxCombo: number) {
    this.state.totalBattles += 1;
    if (won) this.state.totalWins += 1;
    if (maxCombo > this.state.highestCombo) {
      this.state.highestCombo = maxCombo;
    }
    this.state.xp += xpEarned;

    while (this.state.xp >= this.state.xpToNextLevel) {
      this.state.xp -= this.state.xpToNextLevel;
      this.state.level += 1;
      this.state.xpToNextLevel = Math.floor(this.state.xpToNextLevel * 1.4);

      HEROES.forEach(h => {
        if (h.requiredLevel <= this.state.level && !this.state.unlockedHeroIds.includes(h.id)) {
          this.state.unlockedHeroIds.push(h.id);
        }
      });

      WEAPONS.forEach(w => {
        if (w.requiredLevel <= this.state.level && !this.state.unlockedWeaponIds.includes(w.id)) {
          this.state.unlockedWeaponIds.push(w.id);
        }
      });
    }

    this.save();
  }

  public isHeroUnlocked(id: string): boolean {
    return this.state.unlockedHeroIds.includes(id);
  }

  public isWeaponUnlocked(id: string): boolean {
    return this.state.unlockedWeaponIds.includes(id);
  }

  public resetProgression() {
    this.state = { ...DEFAULT_PROGRESSION };
    this.save();
  }
}

export const progression = new ProgressionManager();
