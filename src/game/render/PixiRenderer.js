// ==========================================
// PIXI.JS GRAPHICS RENDERER (PHASE 1: HYBRID CORE)
// NeonPiano WebGL / WebGPU High-Performance Graphics Layer
// ==========================================

const PIXI_CDN_URL = "https://cdn.jsdelivr.net/npm/pixi.js@8.7.3/dist/pixi.mjs";
import { pixiNotePool } from "./PixiNotePool.js";

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

    try {
      this.PIXI = await loadPixiEngine();
      this.containerEl = container;
      this.width = width || 400;
      this.height = height || 800;
      this.dpr = Math.min(dpr || (typeof window !== 'undefined' ? window.devicePixelRatio : 1), 1.5);

      this.app = new this.PIXI.Application();

      // Async initialization in Pixi.js v8
      await this.app.init({
        width: this.width,
        height: this.height,
        resolution: this.dpr,
        autoDensity: true,
        backgroundAlpha: 0, // Fully transparent to let Canvas 2D / UI show through
        antialias: true,
        powerPreference: 'high-performance'
      });

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
   * Manual audio-synchronized frame render, called directly from gameLoop().
   * @param {number} songTime - Current track time in milliseconds
   * @param {Object} state - Game state reference
   * @param {Object} config - Game configuration (hitPosition, noteHeight, etc.)
   */
  render(songTime = 0, state = null, config = null) {
    if (!this.isReady || !this.app || !this.app.renderer) return;

    // Update Phase 2 zero-allocation note pool stream
    if (state && Array.isArray(state.activeTiles)) {
      pixiNotePool.update(songTime, state.activeTiles, state, config);
    }

    // Animate status indicator (smooth neon pulse)
    if (this.statusIndicator) {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.004);
      this.statusIndicator.alpha = 0.4 + pulse * 0.45;
    }

    // Explicit manual draw call
    this.app.render();
  }

  /**
   * Clears all active notes from the scene.
   */
  clearNotes() {
    pixiNotePool.reset();
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
    if (this.app) {
      try {
        this.app.destroy(true, { children: true, texture: true });
      } catch (e) {
        console.warn("[PixiRenderer] Destroy error:", e);
      }
      this.app = null;
      this.isReady = false;
    }
  }
}

export const pixiRenderer = new PixiRenderer();
