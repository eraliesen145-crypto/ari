import { PlayerFighterState } from '../types/game';

/**
 * High-fidelity 2D fighter renderer with skeletal pose interpolation,
 * dynamic weapon rendering, slash trails, armor plates, and hero-specific gear.
 */
export class CharacterRenderer {
  public draw(
    ctx: CanvasRenderingContext2D,
    fighter: PlayerFighterState,
    currentTime: number,
    isP2: boolean = false
  ) {
    ctx.save();

    const { x, y, width, height, facing, action, actionTime, actionDuration, hero, weapon } = fighter;
    const progress = actionDuration > 0 ? Math.min(1, actionTime / actionDuration) : 0;

    // Ground shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x, y + 4, width * 0.75, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();
    ctx.restore();

    // Phantom hero has ethereal transparency
    if (hero.id === 'phantom') {
      ctx.globalAlpha = fighter.isDodging ? 0.35 : 0.88;
    } else if (fighter.isDodging) {
      ctx.globalAlpha = 0.45;
    }

    // Flip context horizontally based on facing direction
    ctx.translate(x, y);
    ctx.scale(facing, 1);

    // Dodge afterimage ghost trail
    if (fighter.isDodging) {
      ctx.save();
      ctx.translate(-facing * 20, 0);
      ctx.fillStyle = hero.accentColor;
      ctx.fillRect(-width / 2, -height, width, height);
      ctx.restore();
    }

    // Calculate pose angles based on current action
    const pose = this.computePose(action, progress, currentTime, fighter.isGrounded);

    // Hero specific scale (Titan is bigger, Shadow is leaner)
    const scaleFactor = hero.id === 'titan' ? 1.18 : hero.id === 'shadow' ? 0.94 : 1.0;
    ctx.scale(scaleFactor, scaleFactor);

    // Draw Arcane sigil halo if Arcane hero
    if (hero.id === 'arcane') {
      this.drawArcaneHalo(ctx, hero.accentColor, currentTime);
    }

    // 1. Back Arm & Weapon (if dual or behind)
    this.drawArm(ctx, hero, pose.backArmAngle, -1, false);

    // 2. Legs & Feet
    this.drawLegs(ctx, hero, pose.legLeftAngle, pose.legRightAngle, pose.torsoOffset);

    // 3. Torso & Armor
    this.drawTorso(ctx, hero, pose.torsoAngle, pose.torsoOffset, action === 'BLOCK');

    // 4. Head & Helmet
    this.drawHead(ctx, hero, pose.headAngle, pose.torsoOffset);

    // 5. Front Arm & Weapon
    this.drawArm(ctx, hero, pose.frontArmAngle, 1, true, weapon, action, progress);

    // 6. Action effects (Slash trails, energy shields, auras)
    this.drawActionFX(ctx, fighter, progress, pose);

    ctx.restore();
  }

  private computePose(action: string, progress: number, time: number, isGrounded: boolean) {
    const idleBob = Math.sin(time * 0.005) * 2;
    const walkBob = Math.sin(time * 0.015) * 4;

    let torsoAngle = 0;
    let torsoOffset = idleBob;
    let headAngle = 0;
    let frontArmAngle = 0.2;
    let backArmAngle = -0.3;
    let legLeftAngle = 0.1;
    let legRightAngle = -0.1;

    switch (action) {
      case 'IDLE':
        frontArmAngle = 0.2 + Math.sin(time * 0.004) * 0.08;
        backArmAngle = -0.2 - Math.sin(time * 0.004) * 0.08;
        legLeftAngle = 0.1;
        legRightAngle = -0.1;
        break;

      case 'WALK_FORWARD':
        torsoAngle = 0.1;
        torsoOffset = walkBob;
        legLeftAngle = Math.sin(time * 0.012) * 0.6;
        legRightAngle = -Math.sin(time * 0.012) * 0.6;
        frontArmAngle = -Math.sin(time * 0.012) * 0.5 + 0.2;
        backArmAngle = Math.sin(time * 0.012) * 0.5 - 0.2;
        break;

      case 'WALK_BACK':
        torsoAngle = -0.08;
        torsoOffset = walkBob;
        legLeftAngle = -Math.sin(time * 0.012) * 0.5;
        legRightAngle = Math.sin(time * 0.012) * 0.5;
        frontArmAngle = Math.sin(time * 0.012) * 0.4;
        backArmAngle = -Math.sin(time * 0.012) * 0.4;
        break;

      case 'JUMP':
        torsoAngle = 0.15;
        torsoOffset = -6;
        legLeftAngle = 0.5;
        legRightAngle = 0.2;
        frontArmAngle = -0.6;
        backArmAngle = -0.8;
        break;

      case 'ATTACK_LIGHT':
        // Fast swing: wind up (0 - 0.25), forward slash (0.25 - 0.6), recovery (0.6 - 1)
        if (progress < 0.25) {
          const p = progress / 0.25;
          torsoAngle = -0.15 * p;
          frontArmAngle = -0.8 * p;
        } else if (progress < 0.6) {
          const p = (progress - 0.25) / 0.35;
          torsoAngle = -0.15 + 0.4 * p;
          frontArmAngle = -0.8 + 2.2 * p;
        } else {
          const p = (progress - 0.6) / 0.4;
          torsoAngle = 0.25 - 0.25 * p;
          frontArmAngle = 1.4 - 1.2 * p;
        }
        legLeftAngle = 0.3;
        legRightAngle = -0.2;
        break;

      case 'ATTACK_HEAVY':
        // Deep windup, devastating overhead slam
        if (progress < 0.38) {
          const p = progress / 0.38;
          torsoAngle = -0.3 * p;
          frontArmAngle = -1.6 * p;
          backArmAngle = -1.4 * p;
        } else if (progress < 0.7) {
          const p = (progress - 0.38) / 0.32;
          torsoAngle = -0.3 + 0.6 * p;
          frontArmAngle = -1.6 + 3.2 * p;
          backArmAngle = -1.4 + 2.6 * p;
        } else {
          const p = (progress - 0.7) / 0.3;
          torsoAngle = 0.3 - 0.3 * p;
          frontArmAngle = 1.6 - 1.4 * p;
        }
        legLeftAngle = 0.45;
        legRightAngle = -0.35;
        break;

      case 'SPECIAL':
        // Dramatic power stance
        torsoAngle = 0.1;
        torsoOffset = 4;
        frontArmAngle = -1.2 + Math.sin(time * 0.02) * 0.2;
        backArmAngle = -1.0;
        legLeftAngle = 0.5;
        legRightAngle = -0.5;
        break;

      case 'BLOCK':
        torsoAngle = -0.18;
        frontArmAngle = 1.2;
        backArmAngle = 0.9;
        legLeftAngle = 0.35;
        legRightAngle = -0.3;
        break;

      case 'DODGE':
        torsoAngle = 0.45;
        torsoOffset = 10;
        frontArmAngle = -0.9;
        backArmAngle = 0.7;
        legLeftAngle = 0.7;
        legRightAngle = -0.5;
        break;

      case 'HIT_STUN':
        torsoAngle = -0.4;
        torsoOffset = -2;
        headAngle = -0.3;
        frontArmAngle = -0.5;
        backArmAngle = 0.4;
        legLeftAngle = 0.2;
        legRightAngle = -0.4;
        break;

      case 'KNOCKDOWN':
        torsoAngle = -1.2;
        torsoOffset = 25;
        headAngle = -0.6;
        frontArmAngle = -0.8;
        backArmAngle = 0.8;
        legLeftAngle = 0.8;
        legRightAngle = 0.6;
        break;

      case 'VICTORY':
        torsoAngle = 0;
        frontArmAngle = -2.2;
        backArmAngle = -0.4;
        legLeftAngle = 0.2;
        legRightAngle = -0.2;
        break;

      case 'DEFEAT':
        torsoAngle = -1.4;
        torsoOffset = 30;
        headAngle = -0.8;
        frontArmAngle = 0.2;
        backArmAngle = 0.4;
        legLeftAngle = 0.9;
        legRightAngle = 0.7;
        break;
    }

    return { torsoAngle, torsoOffset, headAngle, frontArmAngle, backArmAngle, legLeftAngle, legRightAngle };
  }

  private drawArcaneHalo(ctx: CanvasRenderingContext2D, color: string, time: number) {
    ctx.save();
    ctx.translate(0, -65);
    ctx.rotate(time * 0.002);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.cos(angle) * 32 - 2, Math.sin(angle) * 32 - 2, 4, 4);
    }
    ctx.restore();
  }

  private drawTorso(
    ctx: CanvasRenderingContext2D,
    hero: PlayerFighterState['hero'],
    angle: number,
    offsetY: number,
    isBlocking: boolean
  ) {
    ctx.save();
    ctx.translate(0, -50 + offsetY);
    ctx.rotate(angle);

    // Cape for Blade, Raven, Arcane
    if (['blade', 'raven', 'arcane', 'shadow'].includes(hero.id)) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.quadraticCurveTo(-26, 20, -18, 48);
      ctx.lineTo(-4, 44);
      ctx.lineTo(8, -10);
      ctx.closePath();
      ctx.fillStyle = hero.secondaryColor;
      ctx.fill();
      ctx.restore();
    }

    // Torso armor plate
    ctx.fillStyle = hero.color;
    ctx.beginPath();
    ctx.roundRect(-14, -14, 28, 38, [6, 6, 2, 2]);
    ctx.fill();

    // Chestplate emblem/crest
    ctx.fillStyle = hero.secondaryColor;
    ctx.fillRect(-10, -6, 20, 14);

    // Accent line / sigil
    ctx.fillStyle = hero.accentColor;
    ctx.fillRect(-2, -12, 4, 26);

    // Belt
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-14, 18, 28, 6);
    ctx.fillStyle = hero.accentColor;
    ctx.fillRect(-4, 17, 8, 8); // Buckle

    ctx.restore();
  }

  private drawHead(
    ctx: CanvasRenderingContext2D,
    hero: PlayerFighterState['hero'],
    angle: number,
    offsetY: number
  ) {
    ctx.save();
    ctx.translate(0, -68 + offsetY);
    ctx.rotate(angle);

    // Helmet / Face base
    ctx.fillStyle = hero.secondaryColor;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();

    // Hero specific helm details
    if (hero.id === 'iron') {
      // Iron visor
      ctx.fillStyle = hero.color;
      ctx.fillRect(-12, -8, 24, 14);
      ctx.fillStyle = hero.accentColor;
      ctx.fillRect(-2, -3, 12, 3); // Glowing slit
    } else if (hero.id === 'shadow') {
      // Ninja cowl
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hero.accentColor;
      ctx.fillRect(2, -2, 6, 3); // glowing eye
    } else if (hero.id === 'valkyrie') {
      // Winged tiara
      ctx.fillStyle = hero.color;
      ctx.beginPath();
      ctx.moveTo(-8, -12);
      ctx.lineTo(-18, -24);
      ctx.lineTo(-6, -16);
      ctx.closePath();
      ctx.fill();
      // Glowing crown
      ctx.fillStyle = hero.accentColor;
      ctx.fillRect(-6, -10, 12, 4);
    } else if (hero.id === 'titan') {
      // Spiked colossus crest
      ctx.fillStyle = hero.color;
      ctx.beginPath();
      ctx.moveTo(-6, -14);
      ctx.lineTo(0, -22);
      ctx.lineTo(6, -14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffedd5';
      ctx.fillRect(2, -3, 6, 3);
    } else {
      // Default glowing fighter eyes
      ctx.fillStyle = hero.accentColor;
      ctx.fillRect(2, -3, 6, 3);
    }

    ctx.restore();
  }

  private drawLegs(
    ctx: CanvasRenderingContext2D,
    hero: PlayerFighterState['hero'],
    leftAngle: number,
    rightAngle: number,
    offsetY: number
  ) {
    ctx.save();
    ctx.translate(0, -26 + offsetY);

    // Left leg
    ctx.save();
    ctx.translate(-6, 0);
    ctx.rotate(leftAngle);
    ctx.fillStyle = hero.secondaryColor;
    ctx.fillRect(-5, 0, 10, 26);
    // Boot
    ctx.fillStyle = hero.color;
    ctx.fillRect(-6, 20, 14, 7);
    ctx.restore();

    // Right leg
    ctx.save();
    ctx.translate(6, 0);
    ctx.rotate(rightAngle);
    ctx.fillStyle = hero.secondaryColor;
    ctx.fillRect(-5, 0, 10, 26);
    // Boot
    ctx.fillStyle = hero.color;
    ctx.fillRect(-4, 20, 14, 7);
    ctx.restore();

    ctx.restore();
  }

  private drawArm(
    ctx: CanvasRenderingContext2D,
    hero: PlayerFighterState['hero'],
    angle: number,
    side: number,
    hasWeapon: boolean,
    weapon?: PlayerFighterState['weapon'],
    action?: string,
    progress: number = 0
  ) {
    ctx.save();
    ctx.translate(side * 8, -52);
    ctx.rotate(angle);

    // Arm limb
    ctx.fillStyle = hero.color;
    ctx.fillRect(-4, 0, 8, 22);

    // Gauntlet
    ctx.fillStyle = hero.secondaryColor;
    ctx.fillRect(-5, 14, 10, 10);

    // Draw Weapon in hand if this is the front arm
    if (hasWeapon && weapon) {
      this.drawWeapon(ctx, weapon, hero);
    }

    ctx.restore();
  }

  private drawWeapon(
    ctx: CanvasRenderingContext2D,
    weapon: PlayerFighterState['weapon'],
    hero: PlayerFighterState['hero']
  ) {
    ctx.save();
    ctx.translate(0, 22);

    switch (weapon.id) {
      case 'sword':
        // Blade
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-3, -56, 6, 60);
        // Crossguard
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-12, 0, 24, 5);
        // Hilt
        ctx.fillStyle = '#334155';
        ctx.fillRect(-2, 5, 4, 12);
        // Pommel
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-4, 16, 8, 4);
        break;

      case 'katana':
        // Curved slender blade
        ctx.save();
        ctx.rotate(-0.1);
        ctx.fillStyle = '#f87171';
        ctx.fillRect(-2, -62, 4, 65);
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-8, 0, 16, 4);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-2, 4, 4, 16);
        ctx.restore();
        break;

      case 'axe':
        // Shaft
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-3, -55, 6, 75);
        // Axe blade head
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(0, -50);
        ctx.lineTo(24, -62);
        ctx.lineTo(22, -32);
        ctx.lineTo(0, -42);
        ctx.closePath();
        ctx.fill();
        break;

      case 'spear':
        // Shaft
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-2, -85, 4, 105);
        // Spear tip
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.moveTo(0, -105);
        ctx.lineTo(8, -85);
        ctx.lineTo(-8, -85);
        ctx.closePath();
        ctx.fill();
        break;

      case 'hammer':
        // Shaft
        ctx.fillStyle = '#475569';
        ctx.fillRect(-4, -50, 8, 70);
        // Huge hammer head
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-18, -66, 36, 24);
        ctx.fillStyle = hero.accentColor;
        ctx.fillRect(-10, -60, 20, 12);
        break;

      case 'daggers':
        // Fast dual blades
        ctx.fillStyle = '#818cf8';
        ctx.fillRect(-2, -34, 4, 38);
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(-6, 0, 12, 3);
        break;

      case 'bow':
        // Recurve bow
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -20, 32, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
        // Bow string
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, -48);
        ctx.lineTo(10, 8);
        ctx.stroke();
        break;

      case 'crossbow':
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-4, -30, 8, 40);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-20, -26);
        ctx.lineTo(20, -26);
        ctx.stroke();
        break;

      case 'staff':
        // Magic staff with glowing orb
        ctx.fillStyle = '#581c87';
        ctx.fillRect(-3, -75, 6, 95);
        // Orb
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(0, -82, 10, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'magic_blade':
        // Energy blade
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.fillRect(-4, -60, 8, 64);
        ctx.shadowBlur = 0;
        break;

      default:
        ctx.fillStyle = weapon.color;
        ctx.fillRect(-3, -50, 6, 55);
        break;
    }

    ctx.restore();
  }

  private drawActionFX(
    ctx: CanvasRenderingContext2D,
    fighter: PlayerFighterState,
    progress: number,
    pose: ReturnType<CharacterRenderer['computePose']>
  ) {
    const { action, hero, weapon } = fighter;

    // Block Barrier FX
    if (action === 'BLOCK') {
      ctx.save();
      ctx.translate(25, -45);
      ctx.strokeStyle = hero.accentColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 38, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();

      ctx.fillStyle = `${hero.accentColor}33`;
      ctx.fill();
      ctx.restore();
    }

    // Light Attack Slash Arc FX
    if (action === 'ATTACK_LIGHT' && progress > 0.25 && progress < 0.65) {
      ctx.save();
      ctx.translate(15, -45);
      ctx.strokeStyle = weapon.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, weapon.range * 0.7, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.restore();
    }

    // Heavy Attack Smash Arc & Shockwave
    if (action === 'ATTACK_HEAVY' && progress > 0.4 && progress < 0.75) {
      ctx.save();
      ctx.translate(20, -35);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, weapon.range * 0.85, -Math.PI * 0.5, Math.PI * 0.3);
      ctx.stroke();
      ctx.restore();
    }

    // Special Ability Glow Aura
    if (action === 'SPECIAL') {
      ctx.save();
      ctx.translate(0, -45);
      ctx.strokeStyle = hero.accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
}

export const characterRenderer = new CharacterRenderer();
