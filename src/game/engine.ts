import {
  PlayerFighterState,
  HeroDefinition,
  WeaponDefinition,
  ArenaDefinition,
  GameMode,
  AIDifficulty,
  Projectile,
  ParticleEffect,
  DamagePopup,
  ArenaWeaponDrop,
  MatchResult,
} from '../types/game';
import { characterRenderer } from './characterRenderer';
import { arenaRenderer } from './arenaRenderer';
import { sound } from './sound';
import { inputManager, InputState } from './input';
import { FightingAI } from './ai';
import { WEAPONS } from './data';
import { i18n, translations, getLocalizedWeapon } from './i18n';

export class FightEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public width: number = 1000;
  public height: number = 600;
  public floorY: number = 490;

  public p1!: PlayerFighterState;
  public p2!: PlayerFighterState;

  public mode: GameMode = 'PVE';
  public difficulty: AIDifficulty = 'NORMAL';
  public arena!: ArenaDefinition;

  private ai1: FightingAI = new FightingAI();
  private ai2: FightingAI = new FightingAI();

  // Match state
  public matchState: 'INTRO' | 'FIGHT' | 'ROUND_END' | 'MATCH_OVER' = 'INTRO';
  public roundIntroTimer: number = 3.5; // "ROUND 1" -> "3", "2", "1", "FIGHT!"
  public roundTimeLeft: number = 60;
  public isPaused: boolean = false;

  // Visual effects
  public screenShake: number = 0;
  public hitStopFrames: number = 0;
  public projectiles: Projectile[] = [];
  public particles: ParticleEffect[] = [];
  public damagePopups: DamagePopup[] = [];
  public weaponDrops: ArenaWeaponDrop[] = [];

  // Drop timer
  private nextWeaponDropTime: number = 15; // seconds until drop
  private dropCounter: number = 0;

  // Callbacks for React HUD
  public onMatchEnd?: (result: MatchResult) => void;
  public onStateUpdate?: () => void;

  private animFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private matchDuration: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  public init(
    p1Hero: HeroDefinition,
    p1Weapon: WeaponDefinition,
    p2Hero: HeroDefinition,
    p2Weapon: WeaponDefinition,
    arena: ArenaDefinition,
    mode: GameMode,
    difficulty: AIDifficulty = 'NORMAL'
  ) {
    this.mode = mode;
    this.difficulty = difficulty;
    this.arena = arena;
    this.matchState = 'INTRO';
    this.roundIntroTimer = 3.5;
    this.roundTimeLeft = mode === 'TRAINING' ? 9999 : 60;
    this.matchDuration = 0;
    this.projectiles = [];
    this.particles = [];
    this.damagePopups = [];
    this.weaponDrops = [];
    this.screenShake = 0;
    this.hitStopFrames = 0;
    this.nextWeaponDropTime = 16;
    this.dropCounter = 0;

    this.ai1.reset();
    this.ai2.reset();

    arenaRenderer.preload([arena]);
    arenaRenderer.initParticles(arena, this.width, this.height);

    this.p1 = this.createFighter('p1', p1Hero, p1Weapon, 240, 1);
    this.p2 = this.createFighter('p2', p2Hero, p2Weapon, 760, -1);

    sound.startBattleMusic();
    sound.playRoundStart();
  }

  private createFighter(
    id: 'p1' | 'p2',
    hero: HeroDefinition,
    weapon: WeaponDefinition,
    startX: number,
    facing: 1 | -1
  ): PlayerFighterState {
    return {
      id,
      hero,
      weapon,
      x: startX,
      y: this.floorY,
      vx: 0,
      vy: 0,
      width: 44,
      height: 90,
      facing,
      isGrounded: true,

      hp: hero.stats.hp,
      maxHp: hero.stats.hp,
      bufferedHp: hero.stats.hp,
      energy: 50,
      maxEnergy: hero.stats.energy,

      action: 'IDLE',
      actionTime: 0,
      actionDuration: 0,

      isBlocking: false,
      isDodging: false,
      dodgeCooldown: 0,

      abilityCooldown: 0,
      attackCooldown: 0,

      comboCount: 0,
      comboTimer: 0,

      hitStunTime: 0,
      knockdownTime: 0,

      damageDealt: 0,
      hitsLanded: 0,
      maxCombo: 0,
    };
  }

  public setSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.floorY = height - 100;

    if (this.p1 && this.p1.isGrounded) this.p1.y = this.floorY;
    if (this.p2 && this.p2.isGrounded) this.p2.y = this.floorY;

    if (this.arena) {
      arenaRenderer.initParticles(this.arena, width, height);
    }
  }

  public start() {
    this.lastTimestamp = performance.now();
    const loop = (timestamp: number) => {
      const dt = Math.min(0.05, (timestamp - this.lastTimestamp) / 1000);
      this.lastTimestamp = timestamp;

      if (!this.isPaused) {
        this.update(dt, timestamp);
      }
      this.render(timestamp);

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sound.stopBattleMusic();
  }

  // --- UPDATE LOOP ---

  private update(dt: number, timestamp: number) {
    // Hit stop freeze frame
    if (this.hitStopFrames > 0) {
      this.hitStopFrames--;
      return;
    }

    // Match Intro Countdown
    if (this.matchState === 'INTRO') {
      const prevIntro = Math.ceil(this.roundIntroTimer);
      this.roundIntroTimer -= dt;
      const currentIntro = Math.ceil(this.roundIntroTimer);

      if (currentIntro < prevIntro && currentIntro > 0) {
        sound.playCountdown(false);
      }

      if (this.roundIntroTimer <= 0) {
        this.matchState = 'FIGHT';
        sound.playCountdown(true);
      }
      return;
    }

    // Match duration timer
    if (this.matchState === 'FIGHT') {
      this.matchDuration += dt;
      if (this.mode !== 'TRAINING') {
        this.roundTimeLeft = Math.max(0, this.roundTimeLeft - dt);
        if (this.roundTimeLeft <= 0) {
          this.endMatchByTime();
          return;
        }
      }

      // Arena weapon drop spawner
      this.dropCounter += dt;
      if (this.dropCounter >= this.nextWeaponDropTime) {
        this.dropCounter = 0;
        this.nextWeaponDropTime = 22 + Math.random() * 10;
        this.spawnArenaWeaponDrop();
      }
    }

    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Update Input Intents
    let p1Input: InputState;
    let p2Input: InputState;

    if (this.mode === 'PVE') {
      p1Input = inputManager.getP1Input();
      p2Input = this.ai2.update(this.p2, this.p1, this.difficulty, timestamp);
    } else if (this.mode === 'PVP') {
      p1Input = inputManager.getP1Input();
      p2Input = inputManager.getP2Input();
    } else if (this.mode === 'EVE') {
      p1Input = this.ai1.update(this.p1, this.p2, this.difficulty, timestamp);
      p2Input = this.ai2.update(this.p2, this.p1, this.difficulty, timestamp);
    } else {
      // Training mode: P1 player, P2 passive/training dummy
      p1Input = inputManager.getP1Input();
      p2Input = {
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

    // Update Fighters
    this.updateFighter(this.p1, this.p2, p1Input, dt, timestamp);
    this.updateFighter(this.p2, this.p1, p2Input, dt, timestamp);

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Particles
    this.updateParticles(dt);

    // Update Damage Popups
    this.updateDamagePopups(dt);

    // Check weapon drops collection
    this.updateWeaponDrops();

    // Notify React HUD to update HP bars etc.
    if (this.onStateUpdate) {
      this.onStateUpdate();
    }

    // Check Win/Loss
    if (this.matchState === 'FIGHT') {
      if (this.p1.hp <= 0 || this.p2.hp <= 0) {
        this.handleKnockout();
      }
    }
  }

  private updateFighter(
    f: PlayerFighterState,
    target: PlayerFighterState,
    input: InputState,
    dt: number,
    timestamp: number
  ) {
    // Smooth buffered HP bar drop
    if (f.bufferedHp > f.hp) {
      f.bufferedHp = Math.max(f.hp, f.bufferedHp - dt * 280);
    }

    // Passive Energy Regen
    f.energy = Math.min(f.maxEnergy, f.energy + dt * 5.5);

    // Cooldown reductions
    if (f.attackCooldown > 0) f.attackCooldown -= dt * 1000;
    if (f.abilityCooldown > 0) f.abilityCooldown -= dt * 1000;
    if (f.dodgeCooldown > 0) f.dodgeCooldown -= dt * 1000;

    // Combo timer decay
    if (f.comboTimer > 0) {
      f.comboTimer -= dt;
      if (f.comboTimer <= 0) {
        f.comboCount = 0;
      }
    }

    // Facing direction: always face opponent unless in locked attack/dash
    if (!['ATTACK_LIGHT', 'ATTACK_HEAVY', 'SPECIAL', 'DODGE'].includes(f.action)) {
      f.facing = f.x < target.x ? 1 : -1;
    }

    // Action execution update
    if (f.actionDuration > 0) {
      f.actionTime += dt * 1000;
      if (f.actionTime >= f.actionDuration) {
        this.completeAction(f);
      }
    }

    // Stun / Knockdown recovery
    if (f.hitStunTime > 0) {
      f.hitStunTime -= dt * 1000;
      if (f.hitStunTime <= 0) {
        f.action = 'IDLE';
      }
    }

    if (f.knockdownTime > 0) {
      f.knockdownTime -= dt * 1000;
      if (f.knockdownTime <= 0) {
        f.action = 'IDLE';
        f.isGrounded = true;
        f.y = this.floorY;
      }
    }

    // Physics: Apply Gravity
    if (!f.isGrounded) {
      f.vy += 1500 * dt; // Gravity
      f.y += f.vy * dt;
      if (f.y >= this.floorY) {
        f.y = this.floorY;
        f.vy = 0;
        f.isGrounded = true;
        if (f.action === 'JUMP') {
          f.action = 'IDLE';
          sound.playLand();
          this.spawnDust(f.x, f.y);
        }
      }
    }

    // Apply horizontal velocity with friction
    f.x += f.vx * dt;
    f.vx *= Math.pow(0.05, dt);

    // Keep within arena bounds
    const margin = 50;
    if (f.x < margin) {
      f.x = margin;
      f.vx = 0;
    } else if (f.x > this.width - margin) {
      f.x = this.width - margin;
      f.vx = 0;
    }

    // If locked in stun/knockdown/defeat, ignore new action inputs
    if (['HIT_STUN', 'KNOCKDOWN', 'DEFEAT', 'VICTORY'].includes(f.action)) {
      return;
    }

    // --- HANDLE ACTIONS FROM INPUT ---

    // 1. Dodge
    if (input.dodge && f.dodgeCooldown <= 0 && f.action !== 'DODGE') {
      f.action = 'DODGE';
      f.actionTime = 0;
      f.actionDuration = 320;
      f.isDodging = true;
      f.dodgeCooldown = 1400;
      f.vx = f.facing * 480;
      sound.playDodge();
      this.spawnSmoke(f.x, f.y - 40, f.hero.accentColor);
      return;
    }

    // 2. Special Ability
    if (
      input.special &&
      f.abilityCooldown <= 0 &&
      f.energy >= f.hero.ability.energyCost &&
      !['ATTACK_LIGHT', 'ATTACK_HEAVY', 'SPECIAL', 'DODGE'].includes(f.action)
    ) {
      this.executeSpecial(f, target);
      return;
    }

    // 3. Heavy Attack
    if (
      input.heavyAttack &&
      f.attackCooldown <= 0 &&
      !['ATTACK_LIGHT', 'ATTACK_HEAVY', 'SPECIAL', 'DODGE', 'BLOCK'].includes(f.action)
    ) {
      f.action = 'ATTACK_HEAVY';
      f.actionTime = 0;
      const duration = f.weapon.cooldown * 1.5;
      f.actionDuration = duration;
      f.attackCooldown = duration + 100;
      f.vx = f.facing * 140; // slight forward step
      sound.playSwingHeavy();
      // Strike check is scheduled at 50% through duration
      setTimeout(() => {
        if (f.action === 'ATTACK_HEAVY') {
          this.checkMeleeHit(f, target, true);
        }
      }, duration * 0.45);
      return;
    }

    // 4. Light Attack
    if (
      input.lightAttack &&
      f.attackCooldown <= 0 &&
      !['ATTACK_LIGHT', 'ATTACK_HEAVY', 'SPECIAL', 'DODGE', 'BLOCK'].includes(f.action)
    ) {
      f.action = 'ATTACK_LIGHT';
      f.actionTime = 0;
      const duration = f.weapon.cooldown;
      f.actionDuration = duration;
      f.attackCooldown = duration + 50;
      f.vx = f.facing * 90;
      sound.playSwingLight();

      // If weapon is ranged or magic, shoot projectile
      if (f.weapon.type === 'ranged' || f.weapon.type === 'magic') {
        this.fireWeaponProjectile(f);
      } else {
        setTimeout(() => {
          if (f.action === 'ATTACK_LIGHT') {
            this.checkMeleeHit(f, target, false);
          }
        }, duration * 0.35);
      }
      return;
    }

    // 5. Block
    if (input.block && f.isGrounded && !['ATTACK_LIGHT', 'ATTACK_HEAVY', 'SPECIAL', 'DODGE'].includes(f.action)) {
      f.action = 'BLOCK';
      f.isBlocking = true;
      f.vx = 0;
      return;
    } else if (f.action === 'BLOCK' && !input.block) {
      f.action = 'IDLE';
      f.isBlocking = false;
    }

    // 6. Jump
    if (input.jump && f.isGrounded && !['ATTACK_LIGHT', 'ATTACK_HEAVY', 'SPECIAL', 'DODGE', 'BLOCK'].includes(f.action)) {
      f.action = 'JUMP';
      f.vy = -620;
      f.isGrounded = false;
      sound.playJump();
      this.spawnDust(f.x, f.y);
      return;
    }

    // 7. Movement Left / Right
    if (!['ATTACK_LIGHT', 'ATTACK_HEAVY', 'SPECIAL', 'DODGE', 'BLOCK'].includes(f.action)) {
      const speed = (f.hero.stats.speed / 100) * 260;

      if (input.moveRight) {
        f.vx = speed;
        f.action = f.facing === 1 ? 'WALK_FORWARD' : 'WALK_BACK';
      } else if (input.moveLeft) {
        f.vx = -speed;
        f.action = f.facing === -1 ? 'WALK_FORWARD' : 'WALK_BACK';
      } else if (f.isGrounded) {
        f.action = 'IDLE';
      }
    }
  }

  private completeAction(f: PlayerFighterState) {
    if (f.action === 'DODGE') {
      f.isDodging = false;
    }
    f.action = f.isGrounded ? 'IDLE' : 'JUMP';
    f.actionDuration = 0;
    f.actionTime = 0;
  }

  // --- COMBAT RESOLUTION ---

  private checkMeleeHit(attacker: PlayerFighterState, defender: PlayerFighterState, isHeavy: boolean) {
    // If defender is invincible / dodging
    if (defender.isDodging) return;

    const reach = attacker.weapon.range + (isHeavy ? 25 : 0);
    const inRange = attacker.facing === 1
      ? defender.x >= attacker.x && defender.x <= attacker.x + reach
      : defender.x <= attacker.x && defender.x >= attacker.x - reach;

    const yDiff = Math.abs(attacker.y - defender.y);

    if (inRange && yDiff < 85) {
      this.applyHit(attacker, defender, isHeavy ? attacker.weapon.damage * 1.55 : attacker.weapon.damage, isHeavy);
    }
  }

  public applyHit(
    attacker: PlayerFighterState,
    defender: PlayerFighterState,
    baseDamage: number,
    isHeavy: boolean,
    isSpecial: boolean = false
  ) {
    if (defender.isDodging) return;

    // Critical roll
    const isCrit = Math.random() < (attacker.weapon.critChance + (isHeavy ? 0.1 : 0));
    let finalDamage = baseDamage * (attacker.hero.stats.attack / 80);
    if (isCrit) finalDamage *= 1.6;

    // Combo system multiplier
    attacker.comboCount += 1;
    attacker.comboTimer = 1.35; // 1.35s window to continue combo
    if (attacker.comboCount > attacker.maxCombo) {
      attacker.maxCombo = attacker.comboCount;
    }
    // Combo damage boost (+8% per combo hit up to +60%)
    const comboBonus = Math.min(0.6, (attacker.comboCount - 1) * 0.08);
    finalDamage *= (1 + comboBonus);

    // Defense reduction
    const defFactor = 1 - (defender.hero.stats.defense / 200);
    finalDamage *= Math.max(0.35, defFactor);

    // Block check (guard reduces damage by 75% and cancels knockback)
    const isBlocked = defender.isBlocking && !isSpecial;
    if (isBlocked) {
      finalDamage *= 0.22;
      sound.playBlock();
      this.spawnSparks(defender.x, defender.y - 50, '#facc15', 6);
      this.addDamagePopup(defender.x, defender.y - 70, Math.round(finalDamage), '#facc15', false, true);
    } else {
      if (isHeavy || isSpecial) {
        sound.playHitHeavy();
        this.screenShake = 14;
        this.hitStopFrames = 6;
      } else {
        sound.playHitLight();
        this.screenShake = 4;
        this.hitStopFrames = 2;
      }

      this.spawnSparks(defender.x, defender.y - 50, isCrit ? '#f43f5e' : '#ffffff', isHeavy ? 16 : 8);
      this.addDamagePopup(
        defender.x,
        defender.y - 70,
        Math.round(finalDamage),
        isCrit ? '#f43f5e' : '#ffffff',
        isCrit,
        false
      );

      // Recoil & Knockdown
      if (isHeavy || isSpecial) {
        defender.action = 'KNOCKDOWN';
        defender.knockdownTime = 700;
        defender.vx = attacker.facing * 340;
        defender.vy = -180;
        defender.isGrounded = false;
      } else {
        defender.action = 'HIT_STUN';
        defender.hitStunTime = 220;
        defender.vx = attacker.facing * 120;
      }
    }

    // Apply Damage
    const roundedDamage = Math.max(1, Math.round(finalDamage));
    defender.hp = Math.max(0, defender.hp - roundedDamage);
    attacker.damageDealt += roundedDamage;
    attacker.hitsLanded += 1;

    // Energy gain from combat
    attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + (isHeavy ? 14 : 7));
    defender.energy = Math.min(defender.maxEnergy, defender.energy + 5);
  }

  // --- SPECIAL ABILITIES ---

  private executeSpecial(f: PlayerFighterState, target: PlayerFighterState) {
    f.energy -= f.hero.ability.energyCost;
    f.abilityCooldown = f.hero.ability.cooldown;
    f.action = 'SPECIAL';
    f.actionTime = 0;
    f.actionDuration = 550;
    sound.playSpecial();

    const heroId = f.hero.id;

    if (heroId === 'iron') {
      // Iron Fortress: Shockwave rock spikes across floor
      f.vx = 0;
      setTimeout(() => {
        this.screenShake = 18;
        sound.playHitHeavy();
        this.spawnShockwave(f.x + f.facing * 60, this.floorY, f.hero.accentColor);
        // Hits target if on floor within 380px
        const dist = Math.abs(f.x - target.x);
        if (dist < 400 && target.isGrounded) {
          this.applyHit(f, target, 75, true, true);
        }
      }, 250);
    } else if (heroId === 'shadow') {
      // Shadow Blink: Teleport behind target and backstab
      this.spawnSmoke(f.x, f.y - 45, '#a855f7');
      setTimeout(() => {
        f.x = target.x - target.facing * 45;
        f.facing = target.facing;
        this.spawnSmoke(f.x, f.y - 45, '#a855f7');
        sound.playSwingHeavy();
        this.applyHit(f, target, 82, true, true);
      }, 200);
    } else if (heroId === 'valkyrie') {
      // Spear of Light: High-speed solar lightning beam
      setTimeout(() => {
        this.fireBeamProjectile(f, 'lightning', '#fde047', 85);
      }, 220);
    } else if (heroId === 'blade') {
      // Omnislash: 4 rapid slashes dashing through
      let slashCount = 0;
      const interval = setInterval(() => {
        if (slashCount >= 4 || this.matchState !== 'FIGHT') {
          clearInterval(interval);
          return;
        }
        slashCount++;
        f.x = target.x + (slashCount % 2 === 0 ? -60 : 60);
        f.facing = f.x < target.x ? 1 : -1;
        sound.playSwingLight();
        this.spawnSparks(target.x, target.y - 45, '#ef4444', 10);
        this.applyHit(f, target, 24, false, true);
      }, 120);
    } else if (heroId === 'raven') {
      // Raven Tempest: Flock of homing raven projectiles
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          this.fireHomingProjectile(f, target, 'flock', '#06b6d4', 28);
        }, i * 140);
      }
    } else if (heroId === 'titan') {
      // Seismic Crater: Jump and ground smash
      f.vy = -550;
      f.isGrounded = false;
      setTimeout(() => {
        f.vy = 800; // crash down
        setTimeout(() => {
          this.screenShake = 24;
          sound.playHitHeavy();
          this.spawnShockwave(f.x, this.floorY, '#ea580c');
          const dist = Math.abs(f.x - target.x);
          if (dist < 420) {
            this.applyHit(f, target, 90, true, true);
          }
        }, 300);
      }, 280);
    } else if (heroId === 'phantom') {
      // Spectral Decoy: phase backwards leaving exploding decoy
      f.x -= f.facing * 180;
      this.spawnSmoke(f.x, f.y - 40, '#38bdf8');
      // Create trap projectile at old position
      this.projectiles.push({
        id: Math.random(),
        ownerId: f.id,
        x: f.x + f.facing * 180,
        y: this.floorY - 40,
        vx: 0,
        vy: 0,
        radius: 35,
        damage: 65,
        color: '#38bdf8',
        trailColor: '#bae6fd',
        piercing: false,
        life: 240,
        maxLife: 240,
        type: 'orb',
      });
    } else if (heroId === 'arcane') {
      // Arcane Supernova: Expanding cosmic burst
      this.screenShake = 16;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
        this.projectiles.push({
          id: Math.random(),
          ownerId: f.id,
          x: f.x,
          y: f.y - 45,
          vx: Math.cos(angle) * 360,
          vy: Math.sin(angle) * 360,
          radius: 14,
          damage: 32,
          color: '#d946ef',
          trailColor: '#f0abfc',
          piercing: true,
          life: 90,
          maxLife: 90,
          type: 'orb',
        });
      }
    }
  }

  // --- PROJECTILES & WEAPON SHOTS ---

  private fireWeaponProjectile(f: PlayerFighterState) {
    sound.playProjectile();
    const speed = f.facing * (f.weapon.speed * 8);

    this.projectiles.push({
      id: Math.random(),
      ownerId: f.id,
      x: f.x + f.facing * 35,
      y: f.y - 46,
      vx: speed,
      vy: 0,
      radius: f.weapon.type === 'magic' ? 12 : 7,
      damage: f.weapon.damage,
      color: f.weapon.color,
      trailColor: f.hero.accentColor,
      piercing: f.weapon.id === 'bow',
      life: 90,
      maxLife: 90,
      type: f.weapon.id === 'bow' ? 'arrow' : f.weapon.id === 'crossbow' ? 'bolt' : f.weapon.id === 'throwing_knives' ? 'knife' : 'orb',
    });
  }

  private fireBeamProjectile(f: PlayerFighterState, type: Projectile['type'], color: string, damage: number) {
    sound.playProjectile();
    this.projectiles.push({
      id: Math.random(),
      ownerId: f.id,
      x: f.x + f.facing * 40,
      y: f.y - 50,
      vx: f.facing * 950,
      vy: 0,
      radius: 20,
      damage,
      color,
      trailColor: '#ffffff',
      piercing: true,
      life: 60,
      maxLife: 60,
      type,
    });
  }

  private fireHomingProjectile(
    f: PlayerFighterState,
    target: PlayerFighterState,
    type: Projectile['type'],
    color: string,
    damage: number
  ) {
    sound.playProjectile();
    this.projectiles.push({
      id: Math.random(),
      ownerId: f.id,
      x: f.x,
      y: f.y - 70,
      vx: f.facing * 320,
      vy: -150,
      radius: 12,
      damage,
      color,
      trailColor: color,
      piercing: false,
      life: 140,
      maxLife: 140,
      type,
    });
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life--;

      // Homing behavior for flocks
      if (p.type === 'flock') {
        const target = p.ownerId === 'p1' ? this.p2 : this.p1;
        const dx = target.x - p.x;
        const dy = (target.y - 45) - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
          p.vx += (dx / dist) * 450 * dt;
          p.vy += (dy / dist) * 450 * dt;
        }
      }

      // Check collision against opponent
      const target = p.ownerId === 'p1' ? this.p2 : this.p1;
      const attacker = p.ownerId === 'p1' ? this.p1 : this.p2;

      const dist = Math.hypot(p.x - target.x, p.y - (target.y - 45));
      if (dist < p.radius + 30) {
        this.applyHit(attacker, target, p.damage, false);
        this.spawnSparks(p.x, p.y, p.color, 8);
        if (!p.piercing) {
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Out of bounds or dead
      if (p.life <= 0 || p.x < 0 || p.x > this.width || p.y > this.floorY + 20) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  // --- ARENA WEAPON DROPS ---

  private spawnArenaWeaponDrop() {
    const randomWeapon = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
    const x = 150 + Math.random() * (this.width - 300);

    this.weaponDrops.push({
      id: Math.random(),
      weapon: randomWeapon,
      x,
      y: this.floorY - 15,
      collected: false,
    });

    this.spawnSparks(x, this.floorY - 15, randomWeapon.color, 15);
  }

  private updateWeaponDrops() {
    for (let i = this.weaponDrops.length - 1; i >= 0; i--) {
      const drop = this.weaponDrops[i];

      // Check P1 pickup
      if (Math.abs(this.p1.x - drop.x) < 35 && this.p1.isGrounded) {
        this.p1.weapon = drop.weapon;
        this.spawnSparks(this.p1.x, this.p1.y - 40, drop.weapon.color, 20);
        sound.playUiSelect();
        this.weaponDrops.splice(i, 1);
        continue;
      }

      // Check P2 pickup
      if (Math.abs(this.p2.x - drop.x) < 35 && this.p2.isGrounded) {
        this.p2.weapon = drop.weapon;
        this.spawnSparks(this.p2.x, this.p2.y - 40, drop.weapon.color, 20);
        sound.playUiSelect();
        this.weaponDrops.splice(i, 1);
        continue;
      }
    }
  }

  // --- PARTICLES & FX ---

  private spawnSparks(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 320;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1,
        life: 25 + Math.random() * 20,
        maxLife: 45,
        shape: 'spark',
      });
    }
  }

  private spawnSmoke(x: number, y: number, color: string) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 50,
        vy: -40 - Math.random() * 60,
        size: 10 + Math.random() * 14,
        color,
        alpha: 0.6,
        life: 40,
        maxLife: 40,
        shape: 'smoke',
      });
    }
  }

  private spawnDust(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y - 5,
        vx: (Math.random() - 0.5) * 80,
        vy: -20 - Math.random() * 40,
        size: 5 + Math.random() * 6,
        color: '#64748b',
        alpha: 0.5,
        life: 25,
        maxLife: 25,
        shape: 'smoke',
      });
    }
  }

  private spawnShockwave(x: number, y: number, color: string) {
    this.spawnSparks(x, y - 10, color, 25);
    for (let i = -1; i <= 1; i += 2) {
      this.particles.push({
        x,
        y,
        vx: i * 400,
        vy: -50,
        size: 14,
        color,
        alpha: 0.8,
        life: 30,
        maxLife: 30,
        shape: 'spark',
      });
    }
  }

  private addDamagePopup(
    x: number,
    y: number,
    value: number,
    color: string,
    isCrit: boolean,
    isBlock: boolean
  ) {
    this.damagePopups.push({
      id: Math.random(),
      x: x + (Math.random() - 0.5) * 24,
      y,
      value: isBlock ? `🛡️ ${value}` : isCrit ? `CRIT! ${value}` : `${value}`,
      color,
      life: 45,
      maxLife: 45,
      isCrit,
      isBlock,
    });
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateDamagePopups(dt: number) {
    for (let i = this.damagePopups.length - 1; i >= 0; i--) {
      const dp = this.damagePopups[i];
      dp.y -= 45 * dt; // float upward
      dp.life--;

      if (dp.life <= 0) {
        this.damagePopups.splice(i, 1);
      }
    }
  }

  // --- MATCH ENDING ---

  private handleKnockout() {
    this.matchState = 'MATCH_OVER';
    sound.playKO();

    let winnerId: 'p1' | 'p2' | 'DRAW' = 'DRAW';
    let winnerHero = this.p1.hero;
    let winnerName = 'DRAW';

    if (this.p1.hp <= 0 && this.p2.hp <= 0) {
      this.p1.action = 'DEFEAT';
      this.p2.action = 'DEFEAT';
    } else if (this.p1.hp <= 0) {
      this.p1.action = 'DEFEAT';
      this.p2.action = 'VICTORY';
      winnerId = 'p2';
      winnerHero = this.p2.hero;
      winnerName = this.p2.hero.name;
    } else {
      this.p1.action = 'VICTORY';
      this.p2.action = 'DEFEAT';
      winnerId = 'p1';
      winnerHero = this.p1.hero;
      winnerName = this.p1.hero.name;
    }

    if (winnerId === 'p1') {
      sound.playVictory();
    } else {
      sound.playDefeat();
    }

    setTimeout(() => {
      this.emitMatchResult(winnerId, winnerName, winnerHero);
    }, 1800);
  }

  private endMatchByTime() {
    this.matchState = 'MATCH_OVER';
    sound.playKO();

    let winnerId: 'p1' | 'p2' | 'DRAW' = 'DRAW';
    let winnerHero = this.p1.hero;
    let winnerName = 'DRAW';

    if (this.p1.hp > this.p2.hp) {
      winnerId = 'p1';
      winnerHero = this.p1.hero;
      winnerName = this.p1.hero.name;
      this.p1.action = 'VICTORY';
      this.p2.action = 'DEFEAT';
      sound.playVictory();
    } else if (this.p2.hp > this.p1.hp) {
      winnerId = 'p2';
      winnerHero = this.p2.hero;
      winnerName = this.p2.hero.name;
      this.p2.action = 'VICTORY';
      this.p1.action = 'DEFEAT';
      sound.playDefeat();
    } else {
      this.p1.action = 'DEFEAT';
      this.p2.action = 'DEFEAT';
    }

    setTimeout(() => {
      this.emitMatchResult(winnerId, winnerName, winnerHero);
    }, 1800);
  }

  private emitMatchResult(
    winnerId: 'p1' | 'p2' | 'DRAW',
    winnerName: string,
    winnerHero: HeroDefinition
  ) {
    const result: MatchResult = {
      winnerId,
      winnerName,
      winnerHero,
      p1Stats: {
        heroName: this.p1.hero.name,
        damageDealt: this.p1.damageDealt,
        hitsLanded: this.p1.hitsLanded,
        maxCombo: this.p1.maxCombo,
      },
      p2Stats: {
        heroName: this.p2.hero.name,
        damageDealt: this.p2.damageDealt,
        hitsLanded: this.p2.hitsLanded,
        maxCombo: this.p2.maxCombo,
      },
      duration: Math.round(this.matchDuration),
      xpEarned: 100 + (winnerId === 'p1' ? 150 : 50) + this.p1.maxCombo * 10,
    };

    if (this.onMatchEnd) {
      this.onMatchEnd(result);
    }
  }

  // --- RENDERING ---

  public render(timestamp: number) {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    ctx.save();

    // Screen shake transform
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Camera Center (midpoint between fighters)
    const midX = (this.p1.x + this.p2.x) / 2;

    // 1. Parallax Arena Background
    arenaRenderer.drawBackground(ctx, this.arena, width, height, midX);

    // 2. Ambient Atmosphere Particles
    arenaRenderer.updateAndDrawParticles(ctx, this.arena, width, height);

    // 3. Arena Floor Slab
    arenaRenderer.drawFloor(ctx, this.arena, width, height, this.floorY);

    // 4. Arena Weapon Drops
    this.renderWeaponDrops();

    // 5. Fighters
    // P1
    characterRenderer.draw(ctx, this.p1, timestamp, false);
    // P2
    characterRenderer.draw(ctx, this.p2, timestamp, true);

    // 6. Projectiles
    this.renderProjectiles();

    // 7. Combat Particles (Sparks, blood, slashes)
    this.renderCombatParticles();

    // 8. Damage Popups
    this.renderDamagePopups();

    // 9. Match Intro Countdown Banner
    if (this.matchState === 'INTRO') {
      this.renderIntroOverlay();
    }

    ctx.restore();
  }

  private renderWeaponDrops() {
    for (const drop of this.weaponDrops) {
      this.ctx.save();
      this.ctx.translate(drop.x, drop.y);

      // Glowing aura circle
      this.ctx.fillStyle = `${drop.weapon.color}33`;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 22, 0, Math.PI * 2);
      this.ctx.fill();

      // Weapon Icon / Symbol
      this.ctx.font = '18px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(drop.weapon.icon, 0, 0);

      // Label
      const lang = i18n.language;
      const locWeapon = getLocalizedWeapon(drop.weapon, lang);
      this.ctx.font = 'bold 10px sans-serif';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(locWeapon.name, 0, -22);

      this.ctx.restore();
    }
  }

  private renderProjectiles() {
    for (const p of this.projectiles) {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);

      // Trail
      this.ctx.fillStyle = p.trailColor;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 10;

      if (p.type === 'arrow' || p.type === 'bolt') {
        const angle = Math.atan2(p.vy, p.vx);
        this.ctx.rotate(angle);
        this.ctx.fillRect(-18, -2, 36, 4);
      } else if (p.type === 'knife') {
        this.ctx.fillRect(-8, -2, 16, 4);
      } else {
        // Glowing Orb / Star / Lightning
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
      }

      this.ctx.restore();
    }
  }

  private renderCombatParticles() {
    for (const p of this.particles) {
      this.ctx.save();
      const alpha = Math.max(0, p.life / p.maxLife) * p.alpha;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;

      if (p.shape === 'spark') {
        this.ctx.fillRect(p.x, p.y, p.size * 2, p.size);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }

  private renderDamagePopups() {
    for (const dp of this.damagePopups) {
      this.ctx.save();
      const alpha = Math.min(1, dp.life / (dp.maxLife * 0.4));
      this.ctx.globalAlpha = alpha;
      this.ctx.font = dp.isCrit ? '900 24px var(--font-rajdhani), sans-serif' : '700 18px var(--font-rajdhani), sans-serif';
      this.ctx.fillStyle = dp.color;
      this.ctx.shadowColor = '#000000';
      this.ctx.shadowBlur = 6;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${dp.value}`, dp.x, dp.y);
      this.ctx.restore();
    }
  }

  private renderIntroOverlay() {
    const { ctx, width, height, roundIntroTimer } = this;
    ctx.save();

    const t = roundIntroTimer;
    const lang = i18n.language;
    const tStrings = translations[lang] || translations.en;

    let mainText = '';
    let subText = tStrings.canvasRound1;

    if (t > 2.5) {
      mainText = tStrings.canvasRound1;
      subText = tStrings.canvasGetReady;
    } else if (t > 1.8) {
      mainText = '3';
    } else if (t > 1.0) {
      mainText = '2';
    } else if (t > 0.2) {
      mainText = '1';
    } else {
      mainText = tStrings.canvasFight;
      subText = tStrings.canvasUnleashFury;
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow backing
    ctx.font = '900 64px var(--font-cinzel), sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 24;
    ctx.fillText(mainText, width / 2, height / 2 - 20);

    ctx.font = '600 20px var(--font-rajdhani), sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.fillText(subText, width / 2, height / 2 + 35);

    ctx.restore();
  }
}
