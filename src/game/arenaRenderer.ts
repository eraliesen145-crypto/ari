import { ArenaDefinition, ParticleEffect } from '../types/game';

export class ArenaRenderer {
  private images: Map<string, HTMLImageElement> = new Map();
  private ambientParticles: ParticleEffect[] = [];

  constructor() {
    // Ambient particles pool will be initialized on resize
  }

  public preload(arenas: ArenaDefinition[]) {
    arenas.forEach(arena => {
      if (arena.imagePath && !this.images.has(arena.id)) {
        const img = new Image();
        img.src = arena.imagePath;
        this.images.set(arena.id, img);
      }
    });
  }

  public initParticles(arena: ArenaDefinition, width: number, height: number) {
    this.ambientParticles = [];
    const count = 45;

    for (let i = 0; i < count; i++) {
      this.ambientParticles.push(this.createParticle(arena, width, height, true));
    }
  }

  private createParticle(
    arena: ArenaDefinition,
    width: number,
    height: number,
    randomY: boolean = false
  ): ParticleEffect {
    const y = randomY ? Math.random() * height : height + 10;
    const x = Math.random() * width;

    let vx = (Math.random() - 0.5) * 0.8;
    let vy = -0.5 - Math.random() * 1.5;
    let size = 2 + Math.random() * 3;
    let color = '#f97316';
    let maxLife = 120 + Math.random() * 180;
    let shape: ParticleEffect['shape'] = 'circle';

    switch (arena.ambientParticles) {
      case 'torch_embers':
        color = Math.random() > 0.3 ? '#f97316' : '#ef4444';
        size = 1.5 + Math.random() * 2.5;
        vy = -0.8 - Math.random() * 1.8;
        shape = 'spark';
        break;

      case 'fireflies':
        color = Math.random() > 0.5 ? '#38bdf8' : '#34d399';
        size = 2 + Math.random() * 2.5;
        vx = (Math.random() - 0.5) * 1.2;
        vy = (Math.random() - 0.5) * 0.8;
        maxLife = 200 + Math.random() * 200;
        break;

      case 'sandstorm':
        color = '#d97706';
        vx = 3.5 + Math.random() * 4.5;
        vy = 0.2 + (Math.random() - 0.5) * 0.5;
        size = 1.5 + Math.random() * 3;
        shape = 'spark';
        break;

      case 'embers_smoke':
        color = Math.random() > 0.4 ? '#ea580c' : '#52525b';
        size = 3 + Math.random() * 5;
        shape = Math.random() > 0.5 ? 'smoke' : 'spark';
        vy = -0.6 - Math.random() * 1.4;
        break;

      case 'arcane_motes':
        color = Math.random() > 0.5 ? '#c084fc' : '#38bdf8';
        size = 2 + Math.random() * 3;
        shape = 'rune';
        vx = (Math.random() - 0.5) * 1.5;
        vy = -0.4 - Math.random() * 1.2;
        break;
    }

    return {
      x,
      y,
      vx,
      vy,
      size,
      color,
      alpha: 0.1 + Math.random() * 0.8,
      life: maxLife,
      maxLife,
      shape,
    };
  }

  public drawBackground(
    ctx: CanvasRenderingContext2D,
    arena: ArenaDefinition,
    width: number,
    height: number,
    cameraX: number
  ) {
    const img = this.images.get(arena.id);

    if (img && img.complete && img.naturalWidth > 0) {
      // Draw background image with subtle parallax
      const parallaxFactor = 0.15;
      const drawX = -cameraX * parallaxFactor;
      // Draw image stretched to cover
      ctx.drawImage(img, drawX - 40, 0, width + 80, height);
      // Dark vignette scrim over background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, width, height);
    } else {
      // Procedural fantasy backdrop gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.6, arena.floorColor);
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // Atmosphere ambient color gradient on horizon
    const horizonGrad = ctx.createRadialGradient(
      width / 2,
      height * 0.65,
      width * 0.1,
      width / 2,
      height * 0.65,
      width * 0.75
    );
    horizonGrad.addColorStop(0, `${arena.ambientColor}22`);
    horizonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, 0, width, height);
  }

  public drawFloor(
    ctx: CanvasRenderingContext2D,
    arena: ArenaDefinition,
    width: number,
    height: number,
    floorY: number
  ) {
    ctx.save();
    // Floor slab
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, height);
    floorGrad.addColorStop(0, arena.floorColor);
    floorGrad.addColorStop(0.2, '#0f172a');
    floorGrad.addColorStop(1, '#020617');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, width, height - floorY);

    // Stone rim highlight line
    ctx.strokeStyle = `${arena.ambientColor}88`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(width, floorY);
    ctx.stroke();

    // Floor flagstone lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x - 40, height);
      ctx.stroke();
    }

    ctx.restore();
  }

  public updateAndDrawParticles(
    ctx: CanvasRenderingContext2D,
    arena: ArenaDefinition,
    width: number,
    height: number
  ) {
    if (this.ambientParticles.length === 0) {
      this.initParticles(arena, width, height);
    }

    ctx.save();
    for (let i = 0; i < this.ambientParticles.length; i++) {
      const p = this.ambientParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      if (p.life <= 0 || p.y < -10 || p.x < -20 || p.x > width + 20) {
        this.ambientParticles[i] = this.createParticle(arena, width, height);
        continue;
      }

      const lifeRatio = p.life / p.maxLife;
      const currentAlpha = Math.sin(lifeRatio * Math.PI) * p.alpha;

      ctx.fillStyle = p.color;
      ctx.globalAlpha = currentAlpha;

      if (p.shape === 'spark') {
        ctx.fillRect(p.x, p.y, p.size * 1.8, p.size * 0.8);
      } else if (p.shape === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + (1 - lifeRatio)), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

export const arenaRenderer = new ArenaRenderer();
