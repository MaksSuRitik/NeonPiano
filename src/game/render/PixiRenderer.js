// ==========================================
// PIXI.JS GRAPHICS RENDERER (PHASE 1: HYBRID CORE)
// NeonPiano WebGL / WebGPU High-Performance Graphics Layer
// ==========================================

const PIXI_CDN_URL = "https://cdn.jsdelivr.net/npm/pixi.js@8.7.3/dist/pixi.mjs";
import { pixiNotePool } from "./PixiNotePool.js";
import { pixiParticleSystem } from "./PixiParticleSystem.js";

/**
 * Loads the PixiJS v8 engine either from global window.PIXI (if loaded via script tag)
 * or dynamically via ES Module import from CDN.
 */
async function loadPixiEngine() {
  if (typeof window !== 'undefined' && window.PIXI && window.PIXI.Application) {
    return window.PIXI;
  }
  try {
    const pixiModule = await import(PIXI_CDN_URL);
    return pixiModule;
  } catch (err) {
    console.error("[PixiRenderer] Failed to load PixiJS from CDN:", err);
    throw err;
  }
}

export class PixiRenderer {
  constructor() {
    this.PIXI = null;
    this.app = null;
    this.canvas = null;
    this.isReady = false;
    this.isInitializing = false;

    this.containerEl = null;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;

    // Strict Z-Layer Container Hierarchy
    this.stage = null;
    this.backgroundLayer = null;
    this.fieldLayer = null;
    this.notesLayer = null;
    this.effectsLayer = null;
    this.uiLayer = null;

    // Phase 1 verification badge / indicator
    this.statusIndicator = null;
    this.backendName = "Unknown";
    this.areNotesHandled = false;
    this.areParticlesHandled = false;
    this.particleSystem = pixiParticleSystem;
    this.cachedSpriteCache = null;
    this._initGeneration = 0;
  }

  /**
   * Initializes PIXI.Application in hybrid mode alongside Canvas 2D.
   * @param {Object} options
   * @param {HTMLElement} options.container - DOM container element (#game-container)
   * @param {number} options.width - Game width in CSS pixels
   * @param {number} options.height - Game height in CSS pixels
   * @param {number} options.dpr - Device pixel ratio (e.g. 1.0 - 1.5)
   */
  async init({ container, width, height, dpr = 1 }) {
    if (this.isReady || this.isInitializing) return;
    this.isInitializing = true;
    const generation = ++this._initGeneration;
    let pendingApp = null;

    try {
      const PIXI = await loadPixiEngine();
      if (generation !== this._initGeneration) return;
      this.PIXI = PIXI;
      this.containerEl = container;
      this.width = width || 400;
      this.height = height || 800;
      this.dpr = Math.min(dpr || (typeof window !== 'undefined' ? window.devicePixelRatio : 1), 1.5);

      const app = pendingApp = new this.PIXI.Application();

      // Async initialization in Pixi.js v8
      await app.init({
        width: this.width,
        height: this.height,
        resolution: this.dpr,
        autoDensity: true,
        backgroundAlpha: 0, // Fully transparent to let Canvas 2D / UI show through
        antialias: true,
        powerPreference: 'high-performance'
      });

      if (generation !== this._initGeneration) {
        app.destroy(true, { children: true });
        return;
      }
      this.app = app;

      // Stop automatic ticker: we render strictly from the game's audio-synced gameLoop()
      if (this.app.ticker) {
        this.app.ticker.stop();
      }

      this.canvas = this.app.canvas;
      if (this.canvas) {
        this.canvas.id = 'pixiCanvas';
        this.canvas.className = 'pixi-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
        this.canvas.style.zIndex = '11'; // Placed directly above rhythmCanvas (z-index 10)
        this.canvas.style.pointerEvents = 'none'; // Critical: all clicks/touches pass to rhythmCanvas
        this.canvas.style.touchAction = 'none';

        // Insert into game-container adjacent to rhythmCanvas
        const rhythmCanvas = document.getElementById('rhythmCanvas');
        if (rhythmCanvas && rhythmCanvas.parentNode) {
          rhythmCanvas.parentNode.insertBefore(this.canvas, rhythmCanvas.nextSibling);
        } else if (container) {
          container.appendChild(this.canvas);
        }

        // WebGL Context Loss & Restore Resilience (Phase 5)
        this.canvas.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          console.warn("[PixiRenderer] WebGL context lost! Falling back seamlessly to Canvas 2D.");
          this.isReady = false;
          this.areNotesHandled = false;
          this.areParticlesHandled = false;
        }, false);

        this.canvas.addEventListener('webglcontextrestored', () => {
          console.log("[PixiRenderer] WebGL context restored! Re-synchronizing textures.");
          try {
            if (this.cachedSpriteCache) {
              this.syncThemeTextures(this.cachedSpriteCache);
            }
            this.isReady = true;
            this.areNotesHandled = false;
            this.areParticlesHandled = true;
          } catch (err) {
            console.error("[PixiRenderer] Context restoration failed:", err);
          }
        }, false);
      }

      // Root scene graph setup
      this.stage = this.app.stage;

      // Build Z-layer containers
      this.backgroundLayer = new this.PIXI.Container();
      this.backgroundLayer.label = 'backgroundLayer';

      this.fieldLayer = new this.PIXI.Container();
      this.fieldLayer.label = 'fieldLayer';

      this.notesLayer = new this.PIXI.Container();
      this.notesLayer.label = 'notesLayer';

      this.effectsLayer = new this.PIXI.Container();
      this.effectsLayer.label = 'effectsLayer';

      this.uiLayer = new this.PIXI.Container();
      this.uiLayer.label = 'uiLayer';

      this.stage.addChild(this.backgroundLayer);
      this.stage.addChild(this.fieldLayer);
      this.stage.addChild(this.notesLayer);
      this.stage.addChild(this.effectsLayer);
      this.stage.addChild(this.uiLayer);

      // Initialize Phase 2 object pool for notes
      const laneW = this.width / 4;
      const padding = 6;
      const w = laneW - (padding * 2);
      const noteHeight = Math.round(w * 1.858);
      pixiNotePool.init(this.PIXI, this.app, this.notesLayer, {
        laneWidth: laneW,
        noteWidth: w,
        noteHeight: noteHeight,
        padding: padding
      });

      // Initialize Phase 4 visual effects and particle system
      this.particleSystem.init(this.PIXI, this.app, this.effectsLayer, this.backgroundLayer);
      this.areParticlesHandled = true;

      // Detect active graphics backend (WebGPU or WebGL2)
      this.backendName = (this.app.renderer && this.app.renderer.type) ? String(this.app.renderer.type) : "WebGL";
      if (this.app.renderer?.name) {
        this.backendName = this.app.renderer.name;
      }

      // Create subtle verification indicator in uiLayer (Phase 1 sanity check)
      this._createPhase1Indicator();

      this.isReady = true;
      this.isInitializing = false;

      console.log(`%c[PixiRenderer]%c v8 Engine initialized successfully. Backend: %c${this.backendName}%c (${this.width}x${this.height} @ ${this.dpr}x DPR)`,
        'color: #38bdf8; font-weight: bold;',
        'color: inherit;',
        'color: #4ade80; font-weight: bold;',
        'color: inherit;'
      );
    } catch (error) {
      if (pendingApp && pendingApp !== this.app) {
        try { pendingApp.destroy(true, { children: true }); } catch (_) {}
      }
      if (generation !== this._initGeneration) return;
      this.destroy();
      this.isInitializing = false;
      console.error("[PixiRenderer] Initialization error:", error);
    }
  }

  /**
   * Resizes the Pixi canvas and renderer in sync with gameContainer/rhythmCanvas.
   * @param {number} width - CSS width
   * @param {number} height - CSS height
   * @param {number} dpr - Device pixel ratio
   */
  resize(width, height, dpr) {
    if (!this.isReady || !this.app || !this.app.renderer) return;

    this.width = width;
    this.height = height;
    if (dpr) {
      this.dpr = Math.min(dpr, 1.5);
      if (this.app.renderer.resolution !== this.dpr) {
        this.app.renderer.resolution = this.dpr;
      }
    }

    this.app.renderer.resize(this.width, this.height);

    // Update note pool dimensions
    const laneW = this.width / 4;
    const padding = 6;
    const w = laneW - (padding * 2);
    const noteHeight = Math.round(w * 1.858);
    pixiNotePool.updateDimensions(laneW, w, noteHeight, padding);

    // Update position of status indicator
    if (this.statusIndicator) {
      this.statusIndicator.x = this.width - 95;
      this.statusIndicator.y = 12;
    }
  }

  /**
   * Synchronizes baked theme note textures from SpriteCache into GPU textures.
   */
  syncThemeTextures(SpriteCache) {
    if (!SpriteCache) return;
    this.cachedSpriteCache = SpriteCache;
    try {
      // Notes use Canvas; defer GPU texture uploads until GPU notes are enabled.
      if (this.areNotesHandled) pixiNotePool.updateTexturesFromCache(SpriteCache);
    } catch (err) {
      console.warn("[PixiRenderer] Texture cache sync warning:", err);
    }
    // Canvas 2D handles notes to preserve 100% authentic procedural tails, necks, bodies & overlays
    this.areNotesHandled = false;
  }

  /**
   * Manual audio-synchronized frame render, called directly from gameLoop().
   * @param {number} songTime - Current track time in milliseconds
   * @param {Object} state - Game state reference
   * @param {Object} config - Game configuration (hitPosition, noteHeight, etc.)
   * @param {Object} activeTheme - Current active field theme (Phrolova, etc.)
   */
  render(songTime = 0, state = null, config = null, activeTheme = null) {
    if (!this.isReady || !this.app || !this.app.renderer) return;

    try {
      // Notes are handled natively on Canvas 2D to preserve authentic theme artwork (tails, necks, overlays)
      if (this.areNotesHandled && state && Array.isArray(state.activeTiles)) {
        pixiNotePool.update(songTime, state.activeTiles, state, config, activeTheme);
      }

      // Update Phase 4 visual effects and particle system
      if (this.particleSystem && this.areParticlesHandled) {
        this.particleSystem.update(Date.now(), state ? state.combo : 0, activeTheme);
      }

      // Animate status indicator (smooth neon pulse)
      if (this.statusIndicator) {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.004);
        this.statusIndicator.alpha = 0.4 + pulse * 0.45;
      }

      // Explicit manual draw call
      this.app.render();
    } catch (err) {
      console.warn("[PixiRenderer] Render loop warning:", err);
    }
  }

  /**
   * Clears all active notes from the scene.
   */
  clearNotes() {
    pixiNotePool.reset();
  }

  /**
   * Clears all active particles and hit visualizers.
   */
  clearParticles() {
    if (this.particleSystem) {
      this.particleSystem.reset();
    }
  }

  /**
   * Triggers a cinematic hit explosion with expanding acoustic shockwave, razor lacerations, and diamond shards.
   */
  triggerHitEffect(cx, cy, w, h, isPerfect = true, themeId = 'default', combo = 0, lane = 0, activeTheme = null) {
    try {
      if (this.particleSystem && this.areParticlesHandled) {
        this.particleSystem.spawnHit(cx, cy, w, h, isPerfect, themeId, combo, activeTheme);
      }
    } catch (err) {
      console.warn("[PixiRenderer] triggerHitEffect error:", err);
    }
  }

  /**
   * Spawns directional sparks and shards.
   */
  spawnSparks(cx, cy, count, colorHex, themeId = 'default', type = 'good', combo = 0) {
    try {
      if (this.particleSystem && this.areParticlesHandled) {
        this.particleSystem.spawnSparks(cx, cy, count, colorHex, themeId, type, combo);
      }
    } catch (err) {
      console.warn("[PixiRenderer] spawnSparks error:", err);
    }
  }

  /**
   * Spawns dissolve particles for hold notes.
   */
  spawnDissolve(x, y, w) {
    try {
      if (this.particleSystem && this.areParticlesHandled) {
        this.particleSystem.spawnDissolve(x, y, w);
      }
    } catch (err) {
      console.warn("[PixiRenderer] spawnDissolve error:", err);
    }
  }

  /**
   * Creates a discrete, elegant neon status indicator in the top-right corner to visually confirm WebGL rendering.
   */
  _createPhase1Indicator() {
    if (!this.PIXI || !this.uiLayer) return;

    try {
      const container = new this.PIXI.Container();
      container.x = (this.width || 400) - 95;
      container.y = 12;

      // Glowing dot
      const dot = new this.PIXI.Graphics();
      dot.circle(0, 7, 3);
      dot.fill({ color: 0x38bdf8, alpha: 0.9 });
      container.addChild(dot);

      // Text badge: "PIXI v8"
      const text = new this.PIXI.Text({
        text: "PIXI v8",
        style: {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 10,
          fontWeight: '700',
          fill: 0x38bdf8,
          letterSpacing: 1
        }
      });
      text.x = 8;
      text.y = 0;
      container.addChild(text);

      container.alpha = 0.7;
      this.statusIndicator = container;
      this.uiLayer.addChild(container);
    } catch (e) {
      console.warn("[PixiRenderer] Indicator creation skipped:", e);
    }
  }

  /**
   * Returns runtime diagnostic information.
   */
  getDebugInfo() {
    return {
      isReady: this.isReady,
      backend: this.backendName,
      width: this.width,
      height: this.height,
      dpr: this.dpr,
      areNotesHandled: this.areNotesHandled,
      areParticlesHandled: this.areParticlesHandled,
      childrenCount: {
        background: this.backgroundLayer?.children.length || 0,
        field: this.fieldLayer?.children.length || 0,
        notes: this.notesLayer?.children.length || 0,
        effects: this.effectsLayer?.children.length || 0,
        ui: this.uiLayer?.children.length || 0
      }
    };
  }

  /**
   * Cleans up Pixi resources.
   */
  destroy() {
    ++this._initGeneration;
    this.isInitializing = false;
    this.isReady = false;
    pixiNotePool.destroy();
    this.particleSystem.destroy();
    this.areNotesHandled = false;
    this.areParticlesHandled = false;
    this.cachedSpriteCache = null;
    this.canvas = null;
    this.stage = this.backgroundLayer = this.fieldLayer = this.notesLayer = this.effectsLayer = this.uiLayer = null;
    this.statusIndicator = null;
    if (this.app) {
      try {
        this.app.destroy(true, { children: true });
      } catch (e) {
        console.warn("[PixiRenderer] Destroy error:", e);
      }
      this.app = null;
      this.isReady = false;
    }
  }
}

export const pixiRenderer = new PixiRenderer();
