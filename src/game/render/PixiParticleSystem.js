// ==========================================
// PIXI.JS PARTICLE & HIT EFFECT SYSTEM (PHASE 4)
// NeonPiano WebGL / WebGPU High-Performance Visuals
// ==========================================

/**
 * Fast hexadecimal color parser supporting #RRGGBB, #RGB, #RRGGBBAA and numbers.
 */
function parseColor(col, fallback = 0xffffff) {
  if (typeof col === 'number') return col;
  if (!col || typeof col !== 'string') return fallback;
  if (col.startsWith('#')) {
    const hex = col.slice(1);
    if (hex.length === 6) return parseInt(hex, 16);
    if (hex.length === 3) return parseInt(hex.split('').map(c => c + c).join(''), 16);
    if (hex.length === 8) return parseInt(hex.slice(0, 6), 16);
  }
  return fallback;
}

export class PixiParticleSystem {
  constructor() {
    this.PIXI = null;
    this.app = null;
    this.effectsLayer = null;
    this.backgroundLayer = null;
    this.isReady = false;

    // Config & Limits
    this.MAX_PARTICLES = 250;
    this.MAX_HITS = 16;
    this.MAX_AMBIENT = 26;

    // Containers
    this.particlesContainer = null;
    this.hitsContainer = null;
    this.ambientContainer = null;

    // Object Pools
    this.particlePool = [];
    this.particleIndex = 0;

    this.hitPool = [];
    this.hitIndex = 0;

    this.ambientPool = [];

    // Shared Reusable GPU Textures
    this.textures = {
      spark: null,
      diamond: null,
      petal: null,
      star: null,
      silk: null
    };

    this.lastTime = 0;
  }

  /**
   * Initializes particle system, creates shared textures, and pre-allocates object pools.
   */
  init(PIXI, app, effectsLayer, backgroundLayer = null) {
    if (this.isReady) return;
    this.PIXI = PIXI;
    this.app = app;
    this.effectsLayer = effectsLayer;
    this.backgroundLayer = backgroundLayer;

    try {
      this._buildTextures();
      this._buildContainers();
      this._buildParticlePool();
      this._buildHitPool();
      if (this.backgroundLayer) {
        this._buildAmbientPool();
      }

      this.isReady = true;
      console.log(`%c[PixiParticleSystem]%c Initialized: ${this.MAX_PARTICLES} sparks, ${this.MAX_HITS} hit visualizers, ${this.MAX_AMBIENT} ambient particles.`,
        'color: #f43f5e; font-weight: bold;',
        'color: inherit;'
      );
    } catch (err) {
      console.error("[PixiParticleSystem] Initialization failed:", err);
    }
  }

  /**
   * Generates crisp vector textures using HTML5 2D canvas turned into GPU textures.
   */
  _buildTextures() {
    // 1. Soft glowing radial spark (32x32)
    const cSpark = document.createElement('canvas');
    cSpark.width = 32;
    cSpark.height = 32;
    const ctxSpark = cSpark.getContext('2d');
    const grad = ctxSpark.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctxSpark.fillStyle = grad;
    ctxSpark.fillRect(0, 0, 32, 32);
    this.textures.spark = this.PIXI.Texture.from(cSpark);

    // 2. Razor crystal diamond / rhombus shard (32x32)
    const cDiamond = document.createElement('canvas');
    cDiamond.width = 32;
    cDiamond.height = 32;
    const ctxDia = cDiamond.getContext('2d');
    ctxDia.fillStyle = '#ffffff';
    ctxDia.beginPath();
    ctxDia.moveTo(16, 3);
    ctxDia.lineTo(26, 16);
    ctxDia.lineTo(16, 29);
    ctxDia.lineTo(6, 16);
    ctxDia.closePath();
    ctxDia.fill();
    ctxDia.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctxDia.lineWidth = 1.2;
    ctxDia.stroke();
    this.textures.diamond = this.PIXI.Texture.from(cDiamond);

    // 3. Curved Lycoris (Spider Lily) petal (32x32)
    const cPetal = document.createElement('canvas');
    cPetal.width = 32;
    cPetal.height = 32;
    const ctxPet = cPetal.getContext('2d');
    ctxPet.fillStyle = '#ffffff';
    ctxPet.beginPath();
    ctxPet.moveTo(16, 2);
    ctxPet.bezierCurveTo(24, 7, 23, 23, 16, 30);
    ctxPet.bezierCurveTo(9, 23, 8, 7, 16, 2);
    ctxPet.fill();
    this.textures.petal = this.PIXI.Texture.from(cPetal);

    // 4. Central 4-point Diamond Star Flash (✦) (32x32)
    const cStar = document.createElement('canvas');
    cStar.width = 32;
    cStar.height = 32;
    const ctxStar = cStar.getContext('2d');
    ctxStar.fillStyle = '#ffffff';
    ctxStar.beginPath();
    ctxStar.moveTo(16, 2);
    ctxStar.quadraticCurveTo(16, 16, 30, 16);
    ctxStar.quadraticCurveTo(16, 16, 16, 30);
    ctxStar.quadraticCurveTo(16, 16, 2, 16);
    ctxStar.quadraticCurveTo(16, 16, 16, 2);
    ctxStar.closePath();
    ctxStar.fill();
    this.textures.star = this.PIXI.Texture.from(cStar);

    // 5. Silk Thread (32x32)
    const cSilk = document.createElement('canvas');
    cSilk.width = 32;
    cSilk.height = 32;
    const ctxSilk = cSilk.getContext('2d');
    ctxSilk.strokeStyle = '#ffffff';
    ctxSilk.lineWidth = 1.5;
    ctxSilk.beginPath();
    ctxSilk.moveTo(4, 4);
    ctxSilk.quadraticCurveTo(16, 24, 28, 28);
    ctxSilk.stroke();
    this.textures.silk = this.PIXI.Texture.from(cSilk);
  }

  /**
   * Builds container layers with WebGL additive blending mode.
   */
  _buildContainers() {
    // Hits container in effectsLayer (draws behind sparks)
    this.hitsContainer = new this.PIXI.Container();
    this.hitsContainer.label = 'hitsContainer';
    this.effectsLayer.addChild(this.hitsContainer);

    // Particles container in effectsLayer
    this.particlesContainer = new this.PIXI.Container();
    this.particlesContainer.label = 'particlesContainer';
    this.effectsLayer.addChild(this.particlesContainer);

    // Ambient container in backgroundLayer
    if (this.backgroundLayer) {
      this.ambientContainer = new this.PIXI.Container();
      this.ambientContainer.label = 'ambientContainer';
      this.backgroundLayer.addChild(this.ambientContainer);
    }
  }

  /**
   * Pre-allocates 250 particle sprites with zero runtime allocations.
   */
  _buildParticlePool() {
    this.particlePool = [];
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const sprite = new this.PIXI.Sprite(this.textures.spark);
      sprite.anchor.set(0.5);
      sprite.visible = false;
      sprite.blendMode = 'add';
      this.particlesContainer.addChild(sprite);

      this.particlePool.push({
        id: i,
        sprite: sprite,
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        gravity: 0.5,
        life: 1.0,
        decay: 0.035,
        angle: 0,
        spin: 0,
        baseScale: 1.0,
        fadeScale: true
      });
    }
  }

  /**
   * Pre-allocates 16 hit visualizers with zero runtime allocations.
   */
  _buildHitPool() {
    this.hitPool = [];
    for (let i = 0; i < this.MAX_HITS; i++) {
      const container = new this.PIXI.Container();
      container.label = `hit_${i}`;
      container.visible = false;

      // 1. Acoustic Resonance Ring Graphics
      const ringGfx = new this.PIXI.Graphics();
      ringGfx.blendMode = 'add';
      container.addChild(ringGfx);

      // 2. Razor-Sharp Cross Laceration (X-Slash)
      const slashGfx = new this.PIXI.Graphics();
      slashGfx.blendMode = 'add';
      container.addChild(slashGfx);

      // 3. Central 4-point Star Flash (✦)
      const starSprite = new this.PIXI.Sprite(this.textures.star);
      starSprite.anchor.set(0.5);
      starSprite.blendMode = 'add';
      starSprite.visible = false;
      container.addChild(starSprite);

      // 4. Shattered Glass Crystal Shards (8 orbiting diamond sprites)
      const shards = [];
      for (let s = 0; s < 8; s++) {
        const sh = new this.PIXI.Sprite(this.textures.diamond);
        sh.anchor.set(0.5);
        sh.blendMode = 'add';
        sh.visible = false;
        container.addChild(sh);
        shards.push(sh);
      }

      // 5. Radiating Lycoris Petals (6 sprites)
      const petals = [];
      for (let p = 0; p < 6; p++) {
        const pet = new this.PIXI.Sprite(this.textures.petal);
        pet.anchor.set(0.5);
        pet.blendMode = 'add';
        pet.visible = false;
        container.addChild(pet);
        petals.push(pet);
      }

      this.hitsContainer.addChild(container);

      this.hitPool.push({
        id: i,
        container: container,
        ringGfx: ringGfx,
        slashGfx: slashGfx,
        starSprite: starSprite,
        shards: shards,
        petals: petals,
        active: false,
        startTime: 0,
        duration: 240,
        cx: 0,
        cy: 0,
        w: 0,
        h: 0,
        isPerfect: true,
        themeId: 'phrolova',
        combo: 0,
        colBlade: 0,
        colCore: 0,
        colRipple: 0
      });
    }
  }

  /**
   * Pre-allocates ambient atmosphere particles in backgroundLayer.
   */
  _buildAmbientPool() {
    if (!this.ambientContainer) return;
    this.ambientPool = [];
    const count = this.MAX_AMBIENT;
    for (let i = 0; i < count; i++) {
      const isThread = (i % 3 === 0);
      const sprite = new this.PIXI.Sprite(isThread ? this.textures.silk : this.textures.petal);
      sprite.anchor.set(0.5);
      sprite.visible = false;
      sprite.blendMode = 'add';
      this.ambientContainer.addChild(sprite);

      this.ambientPool.push({
        sprite: sprite,
        isThread: isThread,
        x: Math.random() * (this.app?.screen?.width || 400),
        y: Math.random() * (this.app?.screen?.height || 700),
        size: Math.random() * 0.3 + 0.3,
        speedY: Math.random() * 1.3 + 0.7,
        speedX: (Math.random() - 0.5) * 0.5,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.035,
        swaySpeed: Math.random() * 0.0025 + 0.0015,
        swayOffset: Math.random() * 1000,
        baseAlpha: Math.random() * 0.35 + 0.35
      });
    }
  }

  /**
   * Computes colors for Phrolova theme strictly following authentic obsidian/crimson/ash-platinum palette.
   * STRICT CONSTRAINT: Absolutely NO yellow (#eab308, #ffd700) or orange (#f97316).
   */
  _getPhrolovaHitColors(combo, isPerfect) {
    let colBlade, colCore, colRipple;

    if (combo >= 800) {
      // Ash-Platinum / Pure White
      colBlade = 0xf8fafc;
      colCore = 0xffffff;
      colRipple = 0xf8fafc;
    } else if (combo >= 400) {
      // Radiant Bright Rose / Carmine
      colBlade = isPerfect ? 0xfb7185 : 0xf43f5e;
      colCore = 0xffffff;
      colRipple = 0xf43f5e;
    } else if (combo >= 200) {
      // Vivid Crimson
      colBlade = isPerfect ? 0xf43f5e : 0xe11d48;
      colCore = isPerfect ? 0xffffff : 0xfda4af;
      colRipple = 0xf43f5e;
    } else if (combo >= 50) {
      // Deep Rose / Carmine
      colBlade = isPerfect ? 0xe11d48 : 0xbe123c;
      colCore = isPerfect ? 0xffffff : 0xf43f5e;
      colRipple = 0xe11d48;
    } else {
      // Ruby / Velvet Crimson
      colBlade = isPerfect ? 0xbe123c : 0x9f1239;
      colCore = isPerfect ? 0xffffff : 0xe11d48;
      colRipple = 0x9f1239;
    }

    return { colBlade, colCore, colRipple };
  }

  /**
   * Computes theme-aware colors for hit effects across all themes.
   */
  _getHitColors(themeId, combo, isPerfect, activeTheme) {
    if (themeId === 'phrolova') {
      return this._getPhrolovaHitColors(combo, isPerfect);
    }

    if (themeId === 'hado99') {
      const isGold = (combo >= 400);
      return {
        colBlade: isGold ? 0xffd700 : 0xa855f7,
        colCore: isGold ? 0xfef08a : 0xffffff,
        colRipple: isGold ? 0xffd700 : 0x8b5cf6
      };
    }

    // Generic themes with tier-based particleColors
    if (activeTheme && typeof activeTheme.getTier === 'function') {
      const tier = activeTheme.getTier(combo);
      if (tier && Array.isArray(tier.particleColors) && tier.particleColors.length > 0) {
        const c1 = parseColor(tier.particleColors[0]);
        const c2 = parseColor(tier.particleColors[1] || tier.particleColors[0]);
        return {
          colBlade: c1,
          colCore: 0xffffff,
          colRipple: c2
        };
      }
    }

    // Default neon tiers
    if (combo >= 800) {
      return { colBlade: 0x2cf5b2, colCore: 0xffffff, colRipple: 0x10b981 };
    } else if (combo >= 400) {
      return { colBlade: 0xd500f9, colCore: 0xffffff, colRipple: 0x00e5ff };
    } else if (combo >= 200) {
      return { colBlade: 0xf59e0b, colCore: 0xfef08a, colRipple: 0xfbbf24 };
    } else if (combo >= 100) {
      return { colBlade: 0x00bcd4, colCore: 0xffffff, colRipple: 0x22d3ee };
    }
    return { colBlade: 0x38bdf8, colCore: 0xffffff, colRipple: 0x0284c7 };
  }

  /**
   * Triggers a cinematic hit explosion with expanding acoustic shockwave, razor lacerations, and diamond shards.
   * @param {number} cx - Center X coordinate of note
   * @param {number} cy - Center Y coordinate of note
   * @param {number} w - Note width
   * @param {number} h - Note height
   * @param {boolean} isPerfect - Perfect judgment rating
   * @param {string} themeId - Active theme id ('phrolova', etc.)
   * @param {number} combo - Current game combo count
   * @param {Object} [activeTheme] - Optional active theme instance
   */
  spawnHit(cx, cy, w, h, isPerfect = true, themeId = 'default', combo = 0, activeTheme = null) {
    if (!this.isReady) return;

    try {
      // 1. Acquire next hit slot
      const slot = this.hitPool[this.hitIndex];
      this.hitIndex = (this.hitIndex + 1) % this.MAX_HITS;

      const { colBlade, colCore, colRipple } = this._getHitColors(themeId, combo, isPerfect, activeTheme);

      slot.active = true;
      slot.startTime = performance.now();
      slot.duration = 240; // High-velocity responsive burst
      slot.cx = cx;
      slot.cy = cy;
      slot.w = w;
      slot.h = h;
      slot.isPerfect = isPerfect;
      slot.themeId = themeId;
      slot.combo = combo;
      slot.colBlade = colBlade;
      slot.colCore = colCore;
      slot.colRipple = colRipple;
      slot.container.visible = true;

      // Reset components visibility
      slot.ringGfx.clear();
      slot.slashGfx.clear();
      slot.starSprite.visible = (themeId !== 'hado99');
      slot.starSprite.position.set(cx, cy);

      // 2. Launch 8-16 explosive directional sparks into particle pool
      const sparkCount = isPerfect ? 16 : 8;
      this.spawnSparks(cx, cy, sparkCount, colBlade, themeId, isPerfect ? 'perfect' : 'good', combo);
    } catch (err) {
      console.warn("[PixiParticleSystem] spawnHit error:", err);
    }
  }

  /**
   * Emits directional sparks and shards from a note hit location.
   */
  spawnSparks(cx, cy, count, colorHex, themeId = 'default', type = 'good', combo = 0) {
    if (!this.isReady) return;

    let spawned = 0;
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      if (spawned >= count) break;
      const idx = (this.particleIndex + i) % this.MAX_PARTICLES;
      const pt = this.particlePool[idx];

      if (!pt.active) {
        pt.active = true;
        pt.x = cx + (Math.random() - 0.5) * 36;
        pt.y = cy;
        pt.vx = (Math.random() - 0.5) * 12;
        pt.vy = (Math.random() - 1) * 12 - 4;
        pt.gravity = 0.5;
        pt.life = 1.0;
        pt.decay = 0.035;
        pt.angle = Math.random() * Math.PI * 2;
        pt.spin = (Math.random() - 0.5) * 0.25;
        pt.baseScale = Math.random() * 0.35 + 0.5;
        pt.fadeScale = true;

        // Texture selection according to theme
        if (themeId === 'phrolova') {
          if (Math.random() > 0.45) {
            pt.sprite.texture = this.textures.petal;
          } else if (Math.random() > 0.3) {
            pt.sprite.texture = this.textures.diamond;
          } else {
            pt.sprite.texture = this.textures.spark;
          }
        } else if (combo >= 400) {
          pt.sprite.texture = Math.random() > 0.4 ? this.textures.diamond : this.textures.spark;
        } else {
          pt.sprite.texture = this.textures.spark;
        }

        pt.sprite.tint = colorHex;
        pt.sprite.alpha = 1.0;
        pt.sprite.visible = true;
        pt.sprite.position.set(pt.x, pt.y);

        spawned++;
      }
    }
    this.particleIndex = (this.particleIndex + count) % this.MAX_PARTICLES;
  }

  /**
   * Emits subtle crystalline/smoky dissolve particles when holding a long note.
   */
  spawnDissolve(x, y, w) {
    if (!this.isReady) return;

    for (let i = 0; i < 2; i++) {
      const idx = (this.particleIndex + i) % this.MAX_PARTICLES;
      const pt = this.particlePool[idx];

      if (!pt.active) {
        pt.active = true;
        pt.x = x + Math.random() * w;
        pt.y = y + (Math.random() * 6 - 3);
        pt.vx = (Math.random() - 0.5) * 2.2;
        pt.vy = -(Math.random() * 1.8 + 0.6);
        pt.gravity = -0.05; // Gentle upward drift
        pt.life = 0.6 + Math.random() * 0.3;
        pt.decay = 0.025;
        pt.angle = Math.random() * Math.PI * 2;
        pt.spin = (Math.random() - 0.5) * 0.12;
        pt.baseScale = Math.random() * 0.25 + 0.35;
        pt.fadeScale = true;

        pt.sprite.texture = this.textures.spark;
        pt.sprite.tint = 0x94a3b8; // Ash slate
        pt.sprite.alpha = 0.55;
        pt.sprite.visible = true;
        pt.sprite.position.set(pt.x, pt.y);
      }
    }
    this.particleIndex = (this.particleIndex + 2) % this.MAX_PARTICLES;
  }

  /**
   * Main per-frame update loop called synchronously from gameLoop.
   * @param {number} now - High-resolution timestamp
   * @param {number} combo - Current game combo
   * @param {Object} [activeTheme] - Current active theme reference
   */
  update(now, combo = 0, activeTheme = null) {
    if (!this.isReady) return;
    try {
      const nowMs = now || performance.now();

      // 1. Update Hit Visualizers
      this._updateHits(nowMs);

      // 2. Update Dynamic Sparks & Shards
      this._updateParticles();

      // 3. Update Ambient Atmosphere in backgroundLayer
      if (this.ambientContainer && this.ambientContainer.visible) {
        this._updateAmbient(nowMs, combo, activeTheme);
      }
    } catch (err) {
      console.warn("[PixiParticleSystem] update error:", err);
    }
  }

  /**
   * Updates expanding rings, razor slashes, star flashes, and radiating shards.
   */
  _updateHits(nowMs) {
    for (let i = 0; i < this.MAX_HITS; i++) {
      const item = this.hitPool[i];
      if (!item.active) continue;

      const elapsed = nowMs - item.startTime;
      if (elapsed >= item.duration) {
        item.active = false;
        item.container.visible = false;
        continue;
      }

      const p = elapsed / item.duration;
      const easeOut = 1 - Math.pow(1 - p, 3);
      const alpha = Math.max(0, 1.0 - Math.pow(p, 1.3));

      if (alpha <= 0.01) {
        item.active = false;
        item.container.visible = false;
        continue;
      }

      // --- 1. Acoustic Resonance Ring Graphics ---
      item.ringGfx.clear();
      if (item.themeId !== 'hado99') {
        const rippleR = (item.w * 0.18) + easeOut * (item.w * 0.52);
        const rippleAlpha = Math.max(0, (1.0 - p) * 0.85);
        const ringWidth = Math.max(1.2, 2.8 * (1.0 - p));
        item.ringGfx.circle(item.cx, item.cy, rippleR);
        item.ringGfx.stroke({ color: item.colRipple, width: ringWidth, alpha: rippleAlpha });
      }

      // --- 2. Razor-Sharp Cross Lacerations (X-Slash) (Phrolova Theme Only) ---
      item.slashGfx.clear();
      if (item.themeId === 'phrolova') {
        const slashLen = (item.w * 0.28) + easeOut * (item.w * 0.55);
        const slashW = Math.max(1.5, 4.2 * (1.0 - p * 0.7));
        const cos45 = 0.7071;
        const sin45 = 0.7071;

        // Diagonal 1: \
        item.slashGfx.moveTo(item.cx - slashLen * cos45, item.cy - slashLen * sin45);
        item.slashGfx.lineTo(item.cx - slashLen * 0.4 * cos45 - 3 * sin45, item.cy - slashLen * 0.4 * sin45 + 3 * cos45);
        item.slashGfx.lineTo(item.cx, item.cy);
        item.slashGfx.lineTo(item.cx + slashLen * 0.4 * cos45 + 3 * sin45, item.cy + slashLen * 0.4 * sin45 - 3 * cos45);
        item.slashGfx.lineTo(item.cx + slashLen * cos45, item.cy + slashLen * sin45);
        item.slashGfx.stroke({ color: item.colBlade, width: slashW, alpha: alpha * 0.95 });

        item.slashGfx.moveTo(item.cx - slashLen * 0.85 * cos45, item.cy - slashLen * 0.85 * sin45);
        item.slashGfx.lineTo(item.cx + slashLen * 0.85 * cos45, item.cy + slashLen * 0.85 * sin45);
        item.slashGfx.stroke({ color: item.colCore, width: slashW * 0.45, alpha: alpha * 1.0 });

        // Diagonal 2: /
        item.slashGfx.moveTo(item.cx - slashLen * cos45, item.cy + slashLen * sin45);
        item.slashGfx.lineTo(item.cx - slashLen * 0.4 * cos45 + 3 * sin45, item.cy + slashLen * 0.4 * sin45 + 3 * cos45);
        item.slashGfx.lineTo(item.cx, item.cy);
        item.slashGfx.lineTo(item.cx + slashLen * 0.4 * cos45 - 3 * sin45, item.cy - slashLen * 0.4 * sin45 - 3 * cos45);
        item.slashGfx.lineTo(item.cx + slashLen * cos45, item.cy - slashLen * sin45);
        item.slashGfx.stroke({ color: item.colBlade, width: slashW, alpha: alpha * 0.95 });

        item.slashGfx.moveTo(item.cx - slashLen * 0.85 * cos45, item.cy + slashLen * 0.85 * sin45);
        item.slashGfx.lineTo(item.cx + slashLen * 0.85 * cos45, item.cy - slashLen * 0.85 * sin45);
        item.slashGfx.stroke({ color: item.colCore, width: slashW * 0.45, alpha: alpha * 1.0 });
      }

      // --- 3. Central 4-point Diamond Star Flash (✦) ---
      if (item.themeId !== 'hado99' && p < 0.45) {
        const starP = p / 0.45;
        item.starSprite.visible = true;
        const s = (1.0 - starP) * 1.4;
        item.starSprite.scale.set(s);
        item.starSprite.alpha = 1.0 - starP * 0.8;
        item.starSprite.tint = 0xffffff;
      } else {
        item.starSprite.visible = false;
      }

      // --- 4. Shattered Glass Crystal Shards (8 sprites) ---
      if (item.themeId !== 'hado99') {
        for (let s = 0; s < item.shards.length; s++) {
          const sh = item.shards[s];
          const ang = (s * Math.PI * 2 / 8) + (s * 0.35);
          const dist = (item.w * 0.12) + easeOut * (item.w * 0.50);
          sh.visible = true;
          sh.position.set(item.cx + Math.cos(ang) * dist, item.cy + Math.sin(ang) * dist);
          sh.rotation = ang + p * 2.5;
          const sz = Math.max(0.2, (1.0 - p * 0.6) * 0.7);
          sh.scale.set(sz);
          sh.alpha = alpha * 0.9;
          sh.tint = (s % 2 === 0) ? 0xffffff : item.colBlade;
        }
      } else {
        for (let s = 0; s < item.shards.length; s++) {
          item.shards[s].visible = false;
        }
      }

      // --- 5. Radiating Lycoris Petals (6 sprites for Phrolova) ---
      if (item.themeId === 'phrolova') {
        for (let i = 0; i < item.petals.length; i++) {
          const pet = item.petals[i];
          const ang = (i * Math.PI * 2 / 6) + easeOut * 0.5;
          const dist = (item.w * 0.15) + easeOut * (item.w * 0.44);
          pet.visible = true;
          pet.position.set(item.cx + Math.cos(ang) * dist, item.cy + Math.sin(ang) * dist);
          pet.rotation = ang + Math.PI / 2 + p * 1.5;
          const pSz = Math.max(0.2, (1.0 - p * 0.7) * 0.8);
          pet.scale.set(pSz);
          pet.alpha = alpha * 0.85;
          pet.tint = item.isPerfect ? 0xff4d6d : 0xe11d48;
        }
      } else {
        for (let i = 0; i < item.petals.length; i++) {
          item.petals[i].visible = false;
        }
      }
    }
  }

  /**
   * Updates position, velocity, gravity, and life of spark sprites.
   */
  _updateParticles() {
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const pt = this.particlePool[i];
      if (!pt.active) continue;

      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += pt.gravity;
      pt.life -= pt.decay;
      pt.angle += pt.spin;

      if (pt.life <= 0.03) {
        pt.active = false;
        pt.sprite.visible = false;
        continue;
      }

      pt.sprite.visible = true;
      pt.sprite.position.set(pt.x, pt.y);
      pt.sprite.rotation = pt.angle;
      pt.sprite.alpha = Math.max(0, Math.min(1, pt.life));

      if (pt.fadeScale) {
        const s = pt.baseScale * (0.3 + 0.7 * pt.life);
        pt.sprite.scale.set(s);
      }
    }
  }

  /**
   * Updates ambient Lycoris petals and silk threads in backgroundLayer.
   */
  _updateAmbient(nowMs, combo = 0, activeTheme = null) {
    if (!activeTheme || activeTheme.id !== 'phrolova') {
      this.ambientContainer.visible = false;
      return;
    }
    this.ambientContainer.visible = true;

    const gw = this.app?.screen?.width || 400;
    const gh = this.app?.screen?.height || 700;

    // Palette tint based on combo
    let ambientTint = (combo >= 800) ? 0xf8fafc : ((combo >= 200) ? 0xf43f5e : 0xbe123c);

    for (let i = 0; i < this.ambientPool.length; i++) {
      const p = this.ambientPool[i];
      p.y += p.speedY;
      p.rot += p.rotSpeed;
      const sway = Math.sin((nowMs + p.swayOffset) * p.swaySpeed) * 0.8;
      p.x += (p.speedX + sway);

      if (p.y > gh + 20) {
        p.y = -20;
        p.x = Math.random() * gw;
      }
      if (p.x < -20) p.x = gw + 20;
      if (p.x > gw + 20) p.x = -20;

      p.sprite.visible = true;
      p.sprite.position.set(p.x, p.y);
      p.sprite.rotation = p.rot;
      p.sprite.scale.set(p.size);
      p.sprite.alpha = p.baseAlpha;
      p.sprite.tint = p.isThread ? 0xf43f5e : ambientTint;
    }
  }

  /**
   * Resets all visual effects and returns all objects to pool.
   */
  reset() {
    for (let i = 0; i < this.MAX_PARTICLES; i++) {
      const pt = this.particlePool[i];
      if (pt) {
        pt.active = false;
        if (pt.sprite) pt.sprite.visible = false;
      }
    }
    for (let i = 0; i < this.MAX_HITS; i++) {
      const hit = this.hitPool[i];
      if (hit) {
        hit.active = false;
        if (hit.container) hit.container.visible = false;
      }
    }
    this.particleIndex = 0;
    this.hitIndex = 0;
  }
}

export const pixiParticleSystem = new PixiParticleSystem();
