import { PlayerFighterState, AIDifficulty } from '../types/game';

export interface AIActionIntent {
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  block: boolean;
  lightAttack: boolean;
  heavyAttack: boolean;
  special: boolean;
  dodge: boolean;
}

export class FightingAI {
  private lastActionChange: number = 0;
  private currentIntent: AIActionIntent = this.emptyIntent();
  private comboChainStep: number = 0;
  private reactionDelay: number = 0;

  private emptyIntent(): AIActionIntent {
    return {
      moveLeft: false,
      moveRight: false,
      jump: false,
      block: false,
      lightAttack: false,
      heavyAttack: false,
      special: false,
      dodge: false,
    };
  }

  public update(
    aiFighter: PlayerFighterState,
    targetFighter: PlayerFighterState,
    difficulty: AIDifficulty,
    currentTime: number
  ): AIActionIntent {
    // If stunned, knocked down, or executing locked action, cannot trigger new inputs
    if (['HIT_STUN', 'KNOCKDOWN', 'VICTORY', 'DEFEAT'].includes(aiFighter.action)) {
      return this.emptyIntent();
    }

    const dist = Math.abs(aiFighter.x - targetFighter.x);
    const optimalRange = Math.max(70, aiFighter.weapon.range * 0.85);

    // Decision update rate based on difficulty
    const updateInterval = difficulty === 'HARD' ? 120 : difficulty === 'NORMAL' ? 240 : 420;

    if (currentTime - this.lastActionChange > updateInterval) {
      this.lastActionChange = currentTime;
      this.currentIntent = this.emptyIntent();

      const opponentIsAttacking =
        targetFighter.action === 'ATTACK_LIGHT' ||
        targetFighter.action === 'ATTACK_HEAVY' ||
        targetFighter.action === 'SPECIAL';

      // 1. DEFENSE REACTION (Block or Dodge)
      if (opponentIsAttacking && dist < optimalRange + 50) {
        const blockChance = difficulty === 'HARD' ? 0.75 : difficulty === 'NORMAL' ? 0.45 : 0.2;
        const dodgeChance = difficulty === 'HARD' ? 0.35 : difficulty === 'NORMAL' ? 0.15 : 0.05;

        if (targetFighter.action === 'SPECIAL' && Math.random() < dodgeChance && aiFighter.dodgeCooldown <= 0) {
          this.currentIntent.dodge = true;
          return this.currentIntent;
        } else if (Math.random() < blockChance) {
          this.currentIntent.block = true;
          return this.currentIntent;
        }
      }

      // 2. SPECIAL ABILITY USAGE
      if (
        aiFighter.energy >= aiFighter.hero.ability.energyCost &&
        aiFighter.abilityCooldown <= 0 &&
        dist < 320
      ) {
        const specialChance = difficulty === 'HARD' ? 0.6 : difficulty === 'NORMAL' ? 0.35 : 0.2;
        if (Math.random() < specialChance) {
          this.currentIntent.special = true;
          return this.currentIntent;
        }
      }

      // 3. OFFENSIVE ATTACKS IN RANGE
      if (dist <= optimalRange) {
        // We are within strike distance
        const attackRoll = Math.random();

        // Check if combo follow-up is active
        if (this.comboChainStep > 0 && Math.random() < 0.8) {
          this.currentIntent.heavyAttack = true;
          this.comboChainStep = 0;
          return this.currentIntent;
        }

        if (attackRoll < 0.65) {
          // Light attack
          this.currentIntent.lightAttack = true;
          this.comboChainStep = 1;
        } else if (attackRoll < 0.88) {
          // Heavy attack
          this.currentIntent.heavyAttack = true;
        } else if (difficulty === 'HARD' && Math.random() < 0.3 && aiFighter.dodgeCooldown <= 0) {
          // Roll through / dodge behind
          this.currentIntent.dodge = true;
        }
        return this.currentIntent;
      }

      // 4. MOVEMENT & SPACING
      const isTooFar = dist > optimalRange;
      const isTooClose = dist < optimalRange * 0.45 && aiFighter.weapon.type !== 'melee';

      if (isTooFar) {
        // Advance toward target
        if (aiFighter.x < targetFighter.x) {
          this.currentIntent.moveRight = true;
        } else {
          this.currentIntent.moveLeft = true;
        }

        // Occasional jump gap close
        if (dist > 220 && Math.random() < (difficulty === 'HARD' ? 0.25 : 0.1) && aiFighter.isGrounded) {
          this.currentIntent.jump = true;
        }
      } else if (isTooClose) {
        // Back up to keep spacing
        if (aiFighter.x < targetFighter.x) {
          this.currentIntent.moveLeft = true;
        } else {
          this.currentIntent.moveRight = true;
        }
      }
    }

    return this.currentIntent;
  }

  public reset() {
    this.currentIntent = this.emptyIntent();
    this.lastActionChange = 0;
    this.comboChainStep = 0;
  }
}
