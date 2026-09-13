// ==========================================
// PIXI.JS NOTE POOL (PHASE 3: ADVANCED NOTE VISUALS & HOLD BODIES)
// High-performance object pooling with theme textures and GPU blend modes
// ==========================================

function toHexNum(str, fallback = 0x38bdf8) {
  if (!str || typeof str !== 'string') return fallback;
  const clean = str.trim();
  if (clean.startsWith('#')) {
    const hex = clean.slice(1);
    if (hex.length === 3) {
      return parseInt(hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2], 16);
    }
    return parseInt(hex.slice(0, 6), 16) || fallback;
  }
  return fallback;
}

export class PixiNotePool {
  constructor() {
    this.PIXI = null;
    this.app = null;
    this.notesLayer = null;

    // Config & dimensions
    this.laneWidth = 100;
    this.noteWidth = 88;
    this.noteHeight = 160;
    this.padding = 6;
    this.margin = 16; // SpriteCache margin

    // Object pools
    this.tapPool = [];
    this.holdPool = [];
    this.MAX_TAPS = 64;
    this.MAX_HOLDS = 16;

    // Pre-generated / theme textures map
    this.tierTextures = {
      tap: new Map(),
      head: new Map(),
      tail: new Map()
    };

    this.defaultTextures = {
      tap: null,
      holdHead: null,
      holdTail: null
    };

    this.isInitialized = false;
  }

  /**
   * Initializes pools and adds inactive display objects to notesLayer.
   */
  init(PIXI, app, notesLayer, dims = {}) {
    if (this.isInitialized) this.destroy();
    this.PIXI = PIXI;
    this.app = app;
    this.notesLayer = notesLayer;

    if (dims.laneWidth) this.laneWidth = dims.laneWidth;
    if (dims.noteWidth) this.noteWidth = dims.noteWidth;
    if (dims.noteHeight) this.noteHeight = dims.noteHeight;
    if (dims.padding) this.padding = dims.padding;

    this._generateFallbackTextures();
    this._buildPools();
    this.isInitialized = true;

    console.log(`[PixiNotePool] Initialized with ${this.MAX_TAPS} tap slots and ${this.MAX_HOLDS} hold slots.`);
  }

  /**
   * Imports high-resolution baked canvases from SpriteCache into GPU textures.
   */
  updateTexturesFromCache(SpriteCache) {
    if (!this.PIXI || !SpriteCache) return;

    const previous = new Set(Object.values(this.tierTextures).flatMap(map => [...map.values()]));
    const next = { tap: new Map(), head: new Map(), tail: new Map() };
    try {
      for (const [kind, source] of [['tap', SpriteCache.tap], ['head', SpriteCache.longHead], ['tail', SpriteCache.longTail]]) {
        for (const [key, canvas] of Object.entries(source || {})) {
          if (canvas) next[kind].set(key, this.PIXI.Texture.from(canvas));
        }
      }
    } catch (err) {
      const created = new Set(Object.values(next).flatMap(map => [...map.values()]));
      for (const texture of created) if (!previous.has(texture)) texture.destroy(true);
      console.warn("[PixiNotePool] Failed to sync theme textures:", err);
      return;
    }
    this.reset();
    // Detach pooled sprites before disposing textures they may still reference.
    this._useFallbackTextures();
    this.tierTextures = next;
    const retained = new Set(Object.values(next).flatMap(map => [...map.values()]));
    for (const texture of previous) if (!retained.has(texture)) texture.destroy(true);
  }

  _useFallbackTextures() {
    for (const item of this.tapPool) item.sprite.texture = this.defaultTextures.tap;
    for (const item of this.holdPool) {
      item.headSprite.texture = this.defaultTextures.holdHead;
      item.tailSprite.texture = this.defaultTextures.holdTail;
    }
  }

  destroy() {
    this.reset();
    for (const item of this.tapPool) item.sprite.destroy();
    for (const item of this.holdPool) item.container.destroy({ children: true });
    const textures = new Set([
      ...Object.values(this.defaultTextures),
      ...Object.values(this.tierTextures).flatMap(map => [...map.values()])
    ]);
    for (const texture of textures) if (texture) texture.destroy(true);
    for (const map of Object.values(this.tierTextures)) map.clear();
    for (const key of Object.keys(this.defaultTextures)) this.defaultTextures[key] = null;
    this.tapPool = [];
    this.holdPool = [];
    this.notesLayer = this.app = this.PIXI = null;
    this.isInitialized = false;
  }

  /**
   * Builds the pre-allocated display object pools.
   */
  _buildPools() {
    if (!this.PIXI || !this.notesLayer) return;

    this.notesLayer.removeChildren();
    this.tapPool = [];
    this.holdPool = [];

    const baseTex = this.defaultTextures.tap;

    // 1. Pre-allocate Tap Note pool
    for (let i = 0; i < this.MAX_TAPS; i++) {
      const sprite = new this.PIXI.Sprite(baseTex);
      sprite.width = this.noteWidth + this.margin * 2;
      sprite.height = this.noteHeight + this.margin * 2;
      sprite.visible = false;
      sprite.alpha = 1.0;
      sprite.label = `tap_${i}`;

      this.notesLayer.addChild(sprite);

      this.tapPool.push({
        id: i,
        type: 'tap',
        sprite: sprite,
        inUse: false,
        tileRef: null
      });
    }

    // 2. Pre-allocate Hold Note pool
    for (let i = 0; i < this.MAX_HOLDS; i++) {
      const container = new this.PIXI.Container();
      container.label = `hold_${i}`;
      container.visible = false;

      // Base geometry graphics (track & thorns)
      const bodyGraphics = new this.PIXI.Graphics();

      // Additive glow graphics for neon beam / laser incision
      const glowGraphics = new this.PIXI.Graphics();
      glowGraphics.blendMode = 'add';

      // Tail sprite (crystal tip / cap)
      const tailSprite = new this.PIXI.Sprite(this.defaultTextures.holdTail);

      // Head sprite (crystal receptor head)
      const headSprite = new this.PIXI.Sprite(this.defaultTextures.holdHead);

      container.addChild(bodyGraphics);
      container.addChild(glowGraphics);
      container.addChild(tailSprite);
      container.addChild(headSprite);

      this.notesLayer.addChild(container);

      this.holdPool.push({
        id: i,
        type: 'long',
        container: container,
        bodyGraphics: bodyGraphics,
        glowGraphics: glowGraphics,
        headSprite: headSprite,
        tailSprite: tailSprite,
        inUse: false,
        tileRef: null
      });
    }
  }

  /**
   * Generates crisp vector textures using Pixi renderer as fallback before SpriteCache loads.
   */
  _generateFallbackTextures() {
    if (!this.PIXI || !this.app?.renderer) return;

    try {
      const w = Math.max(32, Math.round(this.noteWidth || 80));
      const h = Math.max(32, Math.round(this.noteHeight || 150));
      const margin = this.margin;

      // Tap note texture
      const gTap = new this.PIXI.Graphics();
      gTap.roundRect(margin, margin, w, h, 10);
      gTap.fill({ color: 0x0284c7, alpha: 0.90 });
      gTap.stroke({ width: 2.5, color: 0x38bdf8, alpha: 1.0 });
      this.defaultTextures.tap = this.app.renderer.generateTexture(gTap);
      gTap.destroy();

      // Hold head texture
      const gHead = new this.PIXI.Graphics();
      gHead.roundRect(margin, margin, w, h, 10);
      gHead.fill({ color: 0x0369a1, alpha: 0.95 });
      gHead.stroke({ width: 3, color: 0x7dd3fc, alpha: 1.0 });
      this.defaultTextures.holdHead = this.app.renderer.generateTexture(gHead);
      gHead.destroy();

      // Hold tail texture
      const gTail = new this.PIXI.Graphics();
      gTail.roundRect(margin, margin, w, Math.round(h * 0.4), 6);
      gTail.fill({ color: 0x0284c7, alpha: 0.85 });
      gTail.stroke({ width: 2, color: 0x38bdf8, alpha: 0.9 });
      this.defaultTextures.holdTail = this.app.renderer.generateTexture(gTail);
      gTail.destroy();
    } catch (err) {
      console.warn("[PixiNotePool] Failed to generate fallback textures:", err);
    }
  }

  /**
   * Updates dimensions and regenerates fallback textures on screen resize.
   */
  updateDimensions(laneWidth, noteWidth, noteHeight, padding = 6) {
    this.laneWidth = laneWidth;
    this.noteWidth = noteWidth;
    this.noteHeight = noteHeight;
    this.padding = padding;

    // Fallback artwork scales with the sprites; resizing needs no new GPU textures.

    // Update sprite sizes in pool
    for (const item of this.tapPool) {
      if (item.sprite) {
        item.sprite.width = this.noteWidth + this.margin * 2;
        item.sprite.height = this.noteHeight + this.margin * 2;
      }
    }
  }

  /**
   * Acquires a tap note item for a tile.
   */
  acquireTap(tile) {
    for (let i = 0; i < this.tapPool.length; i++) {
      const item = this.tapPool[i];
      if (!item.inUse) {
        item.inUse = true;
        item.tileRef = tile;
        item.sprite.visible = true;
        tile._pixiItem = item;
        return item;
      }
    }
    return null;
  }

  /**
   * Acquires a hold note item for a tile.
   */
  acquireHold(tile) {
    for (let i = 0; i < this.holdPool.length; i++) {
      const item = this.holdPool[i];
      if (!item.inUse) {
        item.inUse = true;
        item.tileRef = tile;
        item.container.visible = true;
        tile._pixiItem = item;
        return item;
      }
    }
    return null;
  }

  /**
   * Releases a visual item back to the pool.
   */
  release(item) {
    if (!item) return;
    item.inUse = false;
    if (item.tileRef) {
      item.tileRef._pixiItem = null;
      item.tileRef = null;
    }
    if (item.type === 'tap') {
      item.sprite.visible = false;
    } else if (item.type === 'long') {
      item.container.visible = false;
      item.bodyGraphics.clear();
      item.glowGraphics.clear();
    }
  }

  /**
   * Deactivates and hides all notes.
   */
  reset() {
    for (let i = 0; i < this.tapPool.length; i++) {
      this.release(this.tapPool[i]);
    }
    for (let i = 0; i < this.holdPool.length; i++) {
      this.release(this.holdPool[i]);
    }
  }

  /**
   * Resolves combo tier name for texture lookups.
   */
  _getTierName(combo = 0, activeTheme = null) {
    if (activeTheme && typeof activeTheme.getTier === 'function') {
      const tier = activeTheme.getTier(combo);
      if (tier && tier.name) return tier.name;
    }
    if (combo < 100) return 'steel';
    if (combo < 200) return 'electric';
    if (combo < 400) return 'gold';
    if (combo < 800) return 'cosmic';
    return 'legendary';
  }

  /**
   * Procedural hold body rendering for Phrolova (Thorned whip / Raptor thorns / Blood slash).
   */
  _renderPhrolovaHoldBody(bg, glow, x, yTail, w, headH, tailH, actualHeadTop, tile, combo, now, activeTheme) {
    const dead = Boolean(tile.released || tile.failed);
    const holding = Boolean(tile.holding && tile.hit);
    const pal = (activeTheme && typeof activeTheme._getPalette === 'function')
      ? activeTheme._getPalette(dead ? 0 : combo, dead)
      : null;

    const bodyLaneW = Math.max(10, Math.round(w - 16));
    const bodyX = Math.round(x + 8);
    const cx = bodyX + bodyLaneW / 2;
    const hw = Math.round(bodyLaneW * 0.46);

    const borderColor = pal ? toHexNum(pal.border, 0xe11d48) : 0xe11d48;
    const obsColor = pal ? toHexNum(pal.obsCol, 0x080104) : 0x080104;
    const gemColor = pal ? toHexNum(pal.gemCol, 0xf43f5e) : 0xf43f5e;
    const coreColor = pal ? toHexNum(pal.core, 0xffffff) : 0xffffff;

    // 1. Semi-transparent Obsidian/Crimson Track
    bg.roundRect(bodyX, yTail, bodyLaneW, tailH, 4);
    bg.fill({ color: dead ? 0x1e293b : obsColor, alpha: 0.65 });
    bg.stroke({ width: 1, color: dead ? 0x475569 : borderColor, alpha: 0.35 });

    // 2. Repeating Segmented Blades / Raptor Thorns ("Сегментированные лезвия")
    const linkSpacing = 28;
    const startY = actualHeadTop - 14;
    const endY = yTail + 12;

    if (startY > endY) {
      const numLinks = Math.max(1, Math.floor((startY - endY) / linkSpacing));
      const effectiveSpacing = (startY - endY) / numLinks;

      // 2a. Outer Obsidian Sickle Claws (Alternating long/short pairs)
      for (let i = 0; i <= numLinks; i++) {
        const ly = startY - i * effectiveSpacing;
        const isLong = (i % 2 === 0);
        const curHW = isLong ? hw : Math.round(hw * 0.52);
        const backLen = isLong ? 24 : 12;
        const fwdLen = isLong ? 8 : 4;

        const tipXL = cx - curHW + (isLong ? 2.5 : 1.0);
        const tipXR = cx + curHW - (isLong ? 2.5 : 1.0);
        const tipY = ly - backLen;

        // Left curved razor blade
        bg.moveTo(cx - 3, ly + fwdLen);
        bg.quadraticCurveTo(cx - curHW * 1.05, ly + fwdLen * 0.20, tipXL, tipY);
        bg.quadraticCurveTo(cx - curHW * 0.40, ly - backLen * 0.20, cx - 2.5, ly - 2);
        bg.closePath();

        // Right curved razor blade
        bg.moveTo(cx + 3, ly + fwdLen);
        bg.quadraticCurveTo(cx + curHW * 1.05, ly + fwdLen * 0.20, tipXR, tipY);
        bg.quadraticCurveTo(cx + curHW * 0.40, ly - backLen * 0.20, cx + 2.5, ly - 2);
        bg.closePath();
      }
      bg.fill({ color: dead ? 0x222222 : obsColor, alpha: 0.95 });
      bg.stroke({ width: 1.2, color: dead ? 0x555555 : borderColor, alpha: 0.9 });

      // 2b. Central Glowing Chevron Arrowheads
      for (let i = 0; i <= numLinks; i++) {
        const ly = startY - i * effectiveSpacing;
        const isLong = (i % 2 === 0);
        const gemW = isLong ? 7 : 4.5;
        const backLen = isLong ? 24 : 12;
        const fwdLen = isLong ? 8 : 4;
        const gemTop = ly - backLen * 0.45;
        const gemBot = ly + fwdLen + 2;

        bg.moveTo(cx, gemBot);
        bg.lineTo(cx + gemW, ly + 1);
        bg.lineTo(cx, gemTop);
        bg.lineTo(cx - gemW, ly + 1);
        bg.closePath();
      }
      bg.fill({ color: dead ? 0x444444 : gemColor, alpha: 0.95 });
      bg.stroke({ width: 1.0, color: dead ? 0x666666 : borderColor, alpha: 0.85 });

      // 2c. Diamond core sparkling highlight dots
      for (let i = 0; i <= numLinks; i++) {
        const ly = startY - i * effectiveSpacing;
        bg.circle(cx, ly, 1.3);
      }
      bg.fill({ color: dead ? 0x888888 : coreColor, alpha: 0.95 });

      // 3. Central "Кровавый след" (Blood slash) with GPU Additive Blending
      if (!dead) {
        // Soft aura bloom
        glow.moveTo(cx, yTail);
        glow.lineTo(cx, actualHeadTop);
        glow.stroke({ width: Math.min(18, hw), color: borderColor, alpha: 0.35 });

        // Razor Crimson Energy Beam
        glow.moveTo(cx, yTail);
        glow.lineTo(cx, actualHeadTop);
        glow.stroke({ width: 3.2, color: borderColor, alpha: 0.85 });

        // Incandescent White Cord
        glow.moveTo(cx, yTail);
        glow.lineTo(cx, actualHeadTop);
        glow.stroke({ width: 1.2, color: 0xffffff, alpha: 0.95 });

        // 4. Energetic pulse rushing down the cord while holding
        if (holding) {
          const pulseOffset = ((now || 0) * 0.12) % effectiveSpacing;
          for (let i = 0; i <= numLinks; i++) {
            const py = startY - i * effectiveSpacing - pulseOffset;
            if (py >= yTail && py <= actualHeadTop) {
              glow.circle(cx, py, 2.5);
            }
          }
          glow.fill({ color: 0xffffff, alpha: 0.95 });
        }
      } else {
        // Dead release stem
        bg.moveTo(cx, yTail);
        bg.lineTo(cx, actualHeadTop);
        bg.stroke({ width: 2.0, color: 0x64748b, alpha: 0.7 });
      }
    }
  }

  /**
   * Default sleek neon laser hold body for other themes.
   */
  _renderDefaultHoldBody(bg, glow, x, yTail, w, headH, tailH, actualHeadTop, tile, tierName) {
    const bodyX = Math.round(x + 8);
    const bodyW = Math.round(w - 16);
    const cx = bodyX + bodyW / 2;
    const bodyH = Math.round(tailH + headH * 0.4);

    const fillColor = tile.released ? 0x64748b : (tile.failed ? 0xef4444 : 0x0284c7);
    const strokeColor = tile.released ? 0x94a3b8 : (tile.failed ? 0xf87171 : 0x38bdf8);

    bg.roundRect(bodyX, yTail, bodyW, bodyH, 6);
    bg.fill({ color: fillColor, alpha: 0.55 });
    bg.stroke({ width: 2, color: strokeColor, alpha: 0.85 });

    if (!tile.released && !tile.failed) {
      glow.moveTo(cx, yTail + 4);
      glow.lineTo(cx, actualHeadTop);
      glow.stroke({ width: 3.5, color: strokeColor, alpha: 0.75 });

      glow.moveTo(cx, yTail + 4);
      glow.lineTo(cx, actualHeadTop);
      glow.stroke({ width: 1.5, color: 0xffffff, alpha: 0.95 });
    }
  }

  /**
   * Synchronizes active tiles from game state with Pixi display objects.
   */
  update(songTime, activeTiles, state, config, activeTheme = null) {
    if (!this.isInitialized || !Array.isArray(activeTiles)) return;

    const hitY = (state.gameHeight || 800) * (config?.hitPosition || 0.88);
    const speed = state.currentSpeed || 800;
    const laneW = this.laneWidth;
    const padding = this.padding;
    const margin = this.margin;
    const w = this.noteWidth;
    const headH = this.noteHeight;
    const now = Date.now();
    const combo = state.combo || 0;

    const tierName = this._getTierName(combo, activeTheme);
    const activeSet = new Set();

    for (let i = 0; i < activeTiles.length; i++) {
      const tile = activeTiles[i];
      if (tile.completed) {
        if (tile._pixiItem) this.release(tile._pixiItem);
        continue;
      }

      activeSet.add(tile);
      const x = tile.lane * laneW + padding;

      if (tile.type === 'tap') {
        const progressStart = 1 - (tile.time - songTime) / speed;
        const visualY = (tile.hit && tile.hitVisualY > 0) ? tile.hitVisualY : progressStart * hitY;
        const yTop = visualY - headH;

        // Viewport Culling
        if (yTop > (state.gameHeight + 40) || (yTop + headH < -40)) {
          if (tile._pixiItem) tile._pixiItem.sprite.visible = false;
          continue;
        }

        // Tap note hit handling
        if (tile.hit) {
          if (tile._pixiItem) this.release(tile._pixiItem);
          continue;
        }

        let item = tile._pixiItem;
        if (!item || !item.inUse) {
          item = this.acquireTap(tile);
        }

        if (item && item.sprite) {
          item.sprite.visible = true;

          // Select theme texture by combo tier
          const tapTex = this.tierTextures.tap.get(tierName) || this.defaultTextures.tap;
          if (item.sprite.texture !== tapTex) {
            item.sprite.texture = tapTex;
          }

          // Exact placement taking into account SpriteCache margin
          item.sprite.x = Math.round(x - margin);
          item.sprite.y = Math.round(yTop - margin);
          item.sprite.width = Math.round(w + margin * 2);
          item.sprite.height = Math.round(headH + margin * 2);
          item.sprite.alpha = 1.0;
        }
      } else if (tile.type === 'long') {
        let yHead, yTail;

        if (tile.released) {
          if (!tile.releaseSongTime) tile.releaseSongTime = songTime;
          const elapsedRelease = songTime - tile.releaseSongTime;
          yHead = hitY + (elapsedRelease / speed) * hitY;
          const progressEnd = 1 - (tile.endTime - songTime) / speed;
          yTail = progressEnd * hitY;
          if (yTail > yHead) yTail = yHead;
        } else {
          const progressStart = 1 - (tile.time - songTime) / speed;
          const rawHeadY = progressStart * hitY;
          const progressEnd = 1 - (tile.endTime - songTime) / speed;
          const rawTailY = progressEnd * hitY;

          if (tile.hit && tile.holding) {
            yHead = hitY;
            yTail = Math.min(rawTailY, hitY);
          } else {
            yHead = rawHeadY;
            yTail = rawTailY;
          }
          if (yTail > yHead) yTail = yHead;
        }

        yHead = Math.round(yHead);
        yTail = Math.round(yTail);
        const actualHeadTop = Math.round(yHead - headH);
        const tailH = Math.max(0, actualHeadTop - yTail);

        // Viewport Culling
        if (yTail > (state.gameHeight + 40) || (actualHeadTop < -headH - 40 && yTail < -40)) {
          if (tile._pixiItem) tile._pixiItem.container.visible = false;
          continue;
        }

        let item = tile._pixiItem;
        if (!item || !item.inUse) {
          item = this.acquireHold(tile);
        }

        if (item && item.container) {
          item.container.visible = true;

          // Alpha fade on early release
          let alpha = 1.0;
          if (tile.released) {
            const elapsedFade = now - (tile.fadeStartTime || now);
            alpha = Math.max(0, 1.0 - elapsedFade / 1600);
          }
          item.container.alpha = alpha;

          // Render procedural hold body
          item.bodyGraphics.clear();
          item.glowGraphics.clear();

          if (tailH > 1) {
            if (activeTheme && activeTheme.id === 'phrolova') {
              this._renderPhrolovaHoldBody(item.bodyGraphics, item.glowGraphics, x, yTail, w, headH, tailH, actualHeadTop, tile, combo, now, activeTheme);
            } else {
              this._renderDefaultHoldBody(item.bodyGraphics, item.glowGraphics, x, yTail, w, headH, tailH, actualHeadTop, tile, tierName);
            }
          }

          // Select head texture
          const headKey = tile.released ? 'released' : (tile.failed ? 'dead' : tierName);
          const headTex = this.tierTextures.head.get(headKey) || this.tierTextures.head.get(tierName) || this.defaultTextures.holdHead;
          if (item.headSprite.texture !== headTex) {
            item.headSprite.texture = headTex;
          }
          item.headSprite.x = Math.round(x - margin);
          item.headSprite.y = Math.round(actualHeadTop - margin);
          item.headSprite.width = Math.round(w + margin * 2);
          item.headSprite.height = Math.round(headH + margin * 2);
          item.headSprite.visible = (actualHeadTop > -headH - 20 && actualHeadTop < state.gameHeight + 40);

          // Select tail texture (hidden on released tiles per authentic game design)
          if (!tile.released) {
            const tailKey = tile.failed ? 'dead' : tierName;
            const tailTex = this.tierTextures.tail.get(tailKey) || this.tierTextures.tail.get(tierName) || this.defaultTextures.holdTail;
            if (item.tailSprite.texture !== tailTex) {
              item.tailSprite.texture = tailTex;
            }
            item.tailSprite.x = Math.round(x - margin);
            item.tailSprite.y = Math.round(yTail - margin);
            item.tailSprite.width = Math.round(w + margin * 2);
            item.tailSprite.height = Math.round(headH * 0.5 + margin * 2);
            item.tailSprite.visible = (tailH > 1);
          } else {
            item.tailSprite.visible = false;
          }
        }
      }
    }

    // Release any pool items whose tiles are no longer in activeTiles
    for (let i = 0; i < this.tapPool.length; i++) {
      const item = this.tapPool[i];
      if (item.inUse && (!item.tileRef || !activeSet.has(item.tileRef))) {
        this.release(item);
      }
    }
    for (let i = 0; i < this.holdPool.length; i++) {
      const item = this.holdPool[i];
      if (item.inUse && (!item.tileRef || !activeSet.has(item.tileRef))) {
        this.release(item);
      }
    }
  }
}

export const pixiNotePool = new PixiNotePool();
