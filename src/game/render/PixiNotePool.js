// ==========================================
// PIXI.JS NOTE POOL (PHASE 2: ZERO-ALLOCATION NOTE FLOW)
// High-performance object pooling for Tap & Hold notes
// ==========================================

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

    // Object pools
    this.tapPool = [];
    this.holdPool = [];
    this.MAX_TAPS = 64;
    this.MAX_HOLDS = 16;

    // Pre-generated textures
    this.textures = {
      tap: null,
      holdHead: null,
      holdTail: null,
      holdBody: null
    };

    this.isInitialized = false;
  }

  /**
   * Initializes pools and adds inactive display objects to notesLayer.
   * @param {Object} PIXI - PixiJS library reference
   * @param {Object} app - PIXI.Application instance
   * @param {Object} notesLayer - Container for note display objects
   * @param {Object} dims - Initial dimensions { laneWidth, noteWidth, noteHeight, padding }
   */
  init(PIXI, app, notesLayer, dims = {}) {
    this.PIXI = PIXI;
    this.app = app;
    this.notesLayer = notesLayer;

    if (dims.laneWidth) this.laneWidth = dims.laneWidth;
    if (dims.noteWidth) this.noteWidth = dims.noteWidth;
    if (dims.noteHeight) this.noteHeight = dims.noteHeight;
    if (dims.padding) this.padding = dims.padding;

    this._generateDefaultTextures();
    this._buildPools();
    this.isInitialized = true;

    console.log(`[PixiNotePool] Initialized with ${this.MAX_TAPS} tap slots and ${this.MAX_HOLDS} hold slots.`);
  }

  /**
   * Builds the pre-allocated display object pools.
   */
  _buildPools() {
    if (!this.PIXI || !this.notesLayer) return;

    // Clear any existing children from layer
    this.notesLayer.removeChildren();
    this.tapPool = [];
    this.holdPool = [];

    // 1. Pre-allocate Tap Note pool
    for (let i = 0; i < this.MAX_TAPS; i++) {
      const sprite = new this.PIXI.Sprite(this.textures.tap);
      sprite.width = this.noteWidth;
      sprite.height = this.noteHeight;
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

      // Hold body: reusable graphics for laser / stem
      const bodyGraphics = new this.PIXI.Graphics();

      // Tail sprite (top of long note)
      const tailSprite = new this.PIXI.Sprite(this.textures.holdTail);
      tailSprite.anchor?.set ? tailSprite.anchor.set(0.5, 0) : (tailSprite.x = 0);

      // Head sprite (bottom of long note, near hit receptor)
      const headSprite = new this.PIXI.Sprite(this.textures.holdHead);
      headSprite.anchor?.set ? headSprite.anchor.set(0.5, 1) : (headSprite.x = 0);

      container.addChild(bodyGraphics);
      container.addChild(tailSprite);
      container.addChild(headSprite);

      this.notesLayer.addChild(container);

      this.holdPool.push({
        id: i,
        type: 'long',
        container: container,
        bodyGraphics: bodyGraphics,
        headSprite: headSprite,
        tailSprite: tailSprite,
        inUse: false,
        tileRef: null
      });
    }
  }

  /**
   * Generates crisp vector textures using Pixi renderer.
   */
  _generateDefaultTextures() {
    if (!this.PIXI || !this.app?.renderer) return;

    try {
      const w = Math.max(32, Math.round(this.noteWidth || 80));
      const h = Math.max(32, Math.round(this.noteHeight || 150));

      // 1. Tap note texture (sleek futuristic neon bar)
      const gTap = new this.PIXI.Graphics();
      gTap.roundRect(0, 0, w, h, 10);
      gTap.fill({ color: 0x0284c7, alpha: 0.88 });
      gTap.stroke({ width: 2.5, color: 0x38bdf8, alpha: 1.0 });

      // Inner core highlight
      gTap.roundRect(4, 4, w - 8, Math.round(h * 0.45), 6);
      gTap.fill({ color: 0xe0f2fe, alpha: 0.22 });

      this.textures.tap = this.app.renderer.generateTexture(gTap);
      gTap.destroy();

      // 2. Hold head texture
      const gHead = new this.PIXI.Graphics();
      gHead.roundRect(0, 0, w, Math.round(h * 0.6), 10);
      gHead.fill({ color: 0x0369a1, alpha: 0.95 });
      gHead.stroke({ width: 3, color: 0x7dd3fc, alpha: 1.0 });
      this.textures.holdHead = this.app.renderer.generateTexture(gHead);
      gHead.destroy();

      // 3. Hold tail texture (cap)
      const gTail = new this.PIXI.Graphics();
      gTail.roundRect(0, 0, w, Math.round(h * 0.35), 6);
      gTail.fill({ color: 0x0284c7, alpha: 0.75 });
      gTail.stroke({ width: 2, color: 0x38bdf8, alpha: 0.9 });
      this.textures.holdTail = this.app.renderer.generateTexture(gTail);
      gTail.destroy();
    } catch (err) {
      console.warn("[PixiNotePool] Failed to generate vector textures:", err);
    }
  }

  /**
   * Updates dimensions and regenerates textures on screen resize.
   */
  updateDimensions(laneWidth, noteWidth, noteHeight, padding = 6) {
    this.laneWidth = laneWidth;
    this.noteWidth = noteWidth;
    this.noteHeight = noteHeight;
    this.padding = padding;

    this._generateDefaultTextures();

    // Update sprite sizes in pool
    for (const item of this.tapPool) {
      if (item.sprite) {
        if (this.textures.tap) item.sprite.texture = this.textures.tap;
        item.sprite.width = this.noteWidth;
        item.sprite.height = this.noteHeight;
      }
    }
    for (const item of this.holdPool) {
      if (item.headSprite && this.textures.holdHead) {
        item.headSprite.texture = this.textures.holdHead;
        item.headSprite.width = this.noteWidth;
      }
      if (item.tailSprite && this.textures.holdTail) {
        item.tailSprite.texture = this.textures.holdTail;
        item.tailSprite.width = this.noteWidth;
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
    return null; // Pool capacity reached
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
    }
  }

  /**
   * Deactivates and hides all notes (e.g. on pause, song reset, or finish).
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
   * Synchronizes active tiles from game state with Pixi display objects.
   * Called every frame from gameLoop() with audio-synced songTime.
   */
  update(songTime, activeTiles, state, config) {
    if (!this.isInitialized || !Array.isArray(activeTiles)) return;

    const hitY = (state.gameHeight || 800) * (config?.hitPosition || 0.88);
    const speed = state.currentSpeed || 800;
    const laneW = this.laneWidth;
    const padding = this.padding;
    const w = this.noteWidth;
    const headH = this.noteHeight;
    const now = Date.now();

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

        // Viewport Culling: off-screen tap notes
        if (yTop > (state.gameHeight + 40) || (yTop + headH < -40)) {
          if (tile._pixiItem) tile._pixiItem.sprite.visible = false;
          continue;
        }

        // Tap note hit handling
        if (tile.hit) {
          if (tile._pixiItem) {
            this.release(tile._pixiItem);
          }
          continue;
        }

        // Ensure display object is assigned from pool
        let item = tile._pixiItem;
        if (!item || !item.inUse) {
          item = this.acquireTap(tile);
        }
        if (item && item.sprite) {
          item.sprite.visible = true;
          item.sprite.x = x;
          item.sprite.y = yTop;
          item.sprite.width = w;
          item.sprite.height = headH;
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

        // Viewport Culling for hold notes
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

          // Render hold body stem via reusable Graphics with zero allocation
          const bg = item.bodyGraphics;
          bg.clear();
          if (tailH > 1) {
            const bodyX = Math.round(x + 8);
            const bodyW = Math.round(w - 16);
            const bodyY = Math.round(yTail);
            const bodyH = Math.round(tailH + headH * 0.4);

            const fillColor = tile.released ? 0x64748b : (tile.failed ? 0xef4444 : 0x0284c7);
            const strokeColor = tile.released ? 0x94a3b8 : (tile.failed ? 0xf87171 : 0x38bdf8);

            bg.roundRect(bodyX, bodyY, bodyW, bodyH, 6);
            bg.fill({ color: fillColor, alpha: 0.55 });
            bg.stroke({ width: 2, color: strokeColor, alpha: 0.85 });

            // Core energy line inside hold body
            bg.moveTo(bodyX + bodyW / 2, bodyY + 4);
            bg.lineTo(bodyX + bodyW / 2, bodyY + bodyH - 4);
            bg.stroke({ width: 2, color: 0xffffff, alpha: 0.6 });
          }

          // Position Head sprite
          if (item.headSprite) {
            item.headSprite.x = x + w / 2;
            item.headSprite.y = yHead;
            item.headSprite.width = w;
            item.headSprite.visible = (actualHeadTop > -headH - 20 && actualHeadTop < state.gameHeight + 40);
          }

          // Position Tail sprite
          if (item.tailSprite) {
            item.tailSprite.x = x + w / 2;
            item.tailSprite.y = yTail;
            item.tailSprite.width = w;
            item.tailSprite.visible = (tailH > 1);
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
