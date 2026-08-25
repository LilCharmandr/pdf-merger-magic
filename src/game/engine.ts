import { PART_DEFS, statsForPart } from "./partDefs";
import type { EngineSnapshot, PartInstance } from "./types";

interface Enemy {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  dps: number;
  coinValue: number;
  radius: number;
  hitFlash: number;
}

interface Weapon {
  id: string;
  type: PartInstance["type"];
  tier: number;
  cooldown: number;
}

interface Particle {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
  color: string;
  kind: "shot" | "splash" | "heal";
}

const CAT_MAX_HP_BASE = 120;
const WAVE_CLEAR_PAUSE = 1.6;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export class GunHeroEngine {
  coins = 30;
  wave = 1;
  bestWave = 0;
  catHp = CAT_MAX_HP_BASE;
  catMaxHp = CAT_MAX_HP_BASE;
  gameOver = false;
  paused = false;

  private enemies: Enemy[] = [];
  private particles: Particle[] = [];
  private weapons: Weapon[] = [];
  private waveTotal = 0;
  private waveSpawned = 0;
  private waveKilled = 0;
  private spawnTimer = 0;
  private clearTimer = 0;
  private width = 400;
  private height = 220;
  private onCoinsEarned?: (amount: number) => void;
  private onWaveClear?: (wave: number) => void;
  private onGameOver?: () => void;

  constructor(bestWave: number) {
    this.bestWave = bestWave;
    this.beginWave();
  }

  setCallbacks(cbs: {
    onCoinsEarned?: (amount: number) => void;
    onWaveClear?: (wave: number) => void;
    onGameOver?: () => void;
  }) {
    this.onCoinsEarned = cbs.onCoinsEarned;
    this.onWaveClear = cbs.onWaveClear;
    this.onGameOver = cbs.onGameOver;
  }

  setLoadout(parts: PartInstance[]) {
    const nextIds = new Set(parts.map((p) => p.id));
    this.weapons = this.weapons.filter((w) => nextIds.has(w.id));
    const known = new Set(this.weapons.map((w) => w.id));
    for (const p of parts) {
      if (known.has(p.id)) {
        const w = this.weapons.find((w) => w.id === p.id)!;
        w.tier = p.tier;
        w.type = p.type;
      } else {
        this.weapons.push({ id: p.id, type: p.type, tier: p.tier, cooldown: rand(0, 0.3) });
      }
    }
  }

  restart() {
    this.coins = 30;
    this.wave = 1;
    this.catHp = CAT_MAX_HP_BASE;
    this.catMaxHp = CAT_MAX_HP_BASE;
    this.gameOver = false;
    this.paused = false;
    this.enemies = [];
    this.particles = [];
    this.beginWave();
  }

  private beginWave() {
    this.waveTotal = 5 + this.wave * 2;
    this.waveSpawned = 0;
    this.waveKilled = 0;
    this.spawnTimer = 0;
    this.clearTimer = 0;
  }

  private spawnEnemy() {
    const w = this.width;
    const hp = Math.round(16 * 1.16 ** (this.wave - 1));
    const enemy: Enemy = {
      id: `${Date.now()}-${Math.random()}`,
      x: w * rand(0.94, 1.02),
      y: this.height * rand(0.3, 0.85),
      hp,
      maxHp: hp,
      speed: rand(16, 24) + Math.min(this.wave, 10),
      dps: 4 + this.wave * 0.6,
      coinValue: 2 + Math.floor(this.wave / 3),
      radius: 12,
      hitFlash: 0,
    };
    this.enemies.push(enemy);
    this.waveSpawned++;
  }

  private catX() {
    return this.width * 0.12;
  }

  private catY() {
    return this.height * 0.55;
  }

  update(dt: number) {
    if (this.gameOver || this.paused) return;
    dt = Math.min(dt, 0.1);

    if (this.clearTimer > 0) {
      this.clearTimer -= dt;
      if (this.clearTimer <= 0) {
        this.wave++;
        this.beginWave();
      }
    } else if (this.waveSpawned < this.waveTotal) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnEnemy();
        this.spawnTimer = Math.max(1.6 - this.wave * 0.03, 0.5);
      }
    }

    const catX = this.catX();
    for (const e of this.enemies) {
      if (e.x > catX + e.radius) {
        e.x -= e.speed * dt;
      } else {
        this.catHp -= e.dps * dt;
      }
      if (e.hitFlash > 0) e.hitFlash -= dt;
    }

    for (const w of this.weapons) {
      w.cooldown -= dt;
      if (w.cooldown > 0) continue;
      const def = PART_DEFS[w.type];
      const stats = statsForPart(w.type, w.tier);
      w.cooldown = 1 / stats.fireRate;

      if (def.role === "support") {
        this.catHp = Math.min(this.catMaxHp, this.catHp + stats.damage);
        this.particles.push({
          x1: catX,
          y1: this.catY(),
          x2: catX,
          y2: this.catY() - 30,
          life: 0.5,
          maxLife: 0.5,
          color: "#4ade80",
          kind: "heal",
        });
        continue;
      }

      const target = this.findTarget(catX, stats.range);
      if (!target) continue;

      if (def.role === "splash") {
        const splashRadius = 55;
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - target.x, e.y - target.y);
          if (d <= splashRadius) this.damageEnemy(e, stats.damage);
        }
        this.particles.push({
          x1: catX,
          y1: this.catY(),
          x2: target.x,
          y2: target.y,
          life: 0.3,
          maxLife: 0.3,
          color: def.color,
          kind: "splash",
        });
      } else {
        this.damageEnemy(target, stats.damage);
        this.particles.push({
          x1: catX,
          y1: this.catY(),
          x2: target.x,
          y2: target.y,
          life: 0.15,
          maxLife: 0.15,
          color: def.color,
          kind: "shot",
        });
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].hp <= 0) {
        const dead = this.enemies[i];
        this.coins += dead.coinValue;
        this.onCoinsEarned?.(dead.coinValue);
        this.waveKilled++;
        this.enemies.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].life -= dt;
      if (this.particles[i].life <= 0) this.particles.splice(i, 1);
    }

    if (
      this.clearTimer <= 0 &&
      this.waveSpawned >= this.waveTotal &&
      this.enemies.length === 0 &&
      this.waveKilled >= this.waveTotal
    ) {
      this.clearTimer = WAVE_CLEAR_PAUSE;
      this.coins += 10 + this.wave * 2;
      this.catHp = Math.min(this.catMaxHp, this.catHp + this.catMaxHp * 0.15);
      if (this.wave > this.bestWave) this.bestWave = this.wave;
      this.onWaveClear?.(this.wave);
    }

    if (this.catHp <= 0 && !this.gameOver) {
      this.catHp = 0;
      this.gameOver = true;
      if (this.wave > this.bestWave) this.bestWave = this.wave;
      this.onGameOver?.();
    }
  }

  private findTarget(catX: number, range: number): Enemy | null {
    let best: Enemy | null = null;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      if (e.x - catX > range) continue;
      if (!best || e.x < best.x) best = e;
    }
    return best;
  }

  private damageEnemy(e: Enemy, dmg: number) {
    e.hp -= dmg;
    e.hitFlash = 0.12;
  }

  getSnapshot(): EngineSnapshot {
    return {
      coins: this.coins,
      wave: this.wave,
      bestWave: this.bestWave,
      catHp: Math.max(0, this.catHp),
      catMaxHp: this.catMaxHp,
      waveKilled: this.waveKilled,
      waveTotal: this.waveTotal,
      gameOver: this.gameOver,
      paused: this.paused,
    };
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.width = width;
    this.height = height;
    ctx.clearRect(0, 0, width, height);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, "#7dd3fc");
    skyGrad.addColorStop(1, "#bae6fd");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#fde68a";
    ctx.fillRect(0, height * 0.72, width, height * 0.28);

    const catX = this.catX();
    const catY = this.catY();

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(catX, 0);
    ctx.lineTo(catX, height);
    ctx.stroke();
    ctx.restore();

    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = p.kind === "splash" ? 4 : 2;
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    for (const e of this.enemies) {
      ctx.fillStyle = e.hitFlash > 0 ? "#ffffff" : "#7f1d1d";
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${e.radius * 1.6}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("👾", e.x, e.y + 1);

      const barW = 24;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(e.x - barW / 2, e.y - e.radius - 10, barW, 4);
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(e.x - barW / 2, e.y - e.radius - 10, barW * Math.max(0, e.hp / e.maxHp), 4);
    }

    ctx.font = "34px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🐱", catX, catY);

    ctx.font = "13px sans-serif";
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillText(`Wave ${this.wave}`, width / 2, 16);
  }
}
