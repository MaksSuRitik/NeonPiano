// ==========================================
// DANCE GAME: AUTHENTIC CANVAS 2D RHYTHM ENGINE
// ==========================================
import { audioEngine } from "../audio/audioEngine.js";
import { generateTilesFromAudio } from "./pulseEngine.js";

export const CONFIG = {
  speedStart: 800,
  speedEnd: 500,
  hitPosition: 0.85,
  noteHeight: 210,
  hitScale: 1.15,
  scorePerfect: 50,
  scoreGood: 20,
  scoreHoldTick: 5,
  colorsDark: {
    tap: ["#00d2ff", "#3a7bd5"],
    long: ["#ff0099", "#493240"],
    dead: ["#555", "#222"],
    released: ["#666", "#444"],
    stroke: "rgba(255,255,255,0.8)",
    laneLine: "rgba(255,255,255,0.1)"
  },
  colorsLight: {
    tap: ["#0077aa", "#005588"],
    long: ["#aa0066", "#770044"],
    dead: ["#999", "#777"],
    released: ["#888", "#666"],
    stroke: "#000000",
    laneLine: "rgba(0,0,0,0.2)"
  }
};

export const PALETTES = {
  STEEL: {
    light: "#cfd8dc",
    main: "#90a4ae",
    dark: "#263238",
    glow: "#90a4ae",
    border: "#eceff1",
    long1: "#37474f",
    long2: "#90a4ae"
  },
  ELECTRIC: {
    tap1: "#eceff1",
    tap2: "#607d8b",
    glow: "#00bcd4",
    border: "#80deea",
    long1: "#006064",
    long2: "#37474f"
  },
  GOLD: {
    black: "#1a1a1a",
    choco: "#2d1b15",
    amber: "#e6ca3fff",
    light: "#bcaaa4",
    glow: "#e6ca3fff",
    border: "#e6ca3fff",
    long1: "#5D4037",
    long2: "#e6ca3fff"
  },
  COSMIC: {
    core: "#2a003b",
    accent: "#d500f9",
    glitch: "#00e5ff",
    glow: "#d500f9",
    border: "#00e5ff",
    long1: "#4a148c",
    long2: "#d500f9"
  },
  LEGENDARY: {
    body: "#3ef5b8ff",
    accent: "#7FFFD4",
    glow: "#7FFFD4",
    aura: "rgba(153, 147, 102, 1)",
    tap1: "#26c691ff",
    tap2: "#08191dff",
    long1: "#004d40",
    long2: "#3ef5b8"
  }
};

const MAX_PARTICLES = 120;

export class DanceGame {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    const isMobile = (typeof window !== 'undefined') && (
      window.innerWidth < 768 ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0 && window.innerWidth <= 1024)
    );
    this.ctx = canvas.getContext("2d", { alpha: false, desynchronized: !isMobile });

    this.onScoreUpdate = options.onScoreUpdate || (() => {});
    this.onRatingShow = options.onRatingShow || (() => {});
    this.onGameEnd = options.onGameEnd || (() => {});
    this.legendaryOverlay = document.getElementById("legendary-border-overlay");

    // Keys mapped to 4 lanes
    this.KEYS = ["KeyS", "KeyD", "KeyJ", "KeyK"];

    // Game state
    this.isPlaying = false;
    this.isPaused = false;
    this.isBotEnabled = false;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.perfectCount = 0;
    this.goodCount = 0;
    this.missCount = 0;
    this.consecutiveMisses = 0;
    this.starStatus = [0, 0, 0, 0, 0];

    this.gameWidth = 400;
    this.gameHeight = 800;
    this.currentSpeed = CONFIG.speedStart;
    this.maxPossibleScore = 1000;

    this.audioBuffer = null;
    this.mapTiles = [];
    this.activeTiles = [];
    this.holdingTiles = [null, null, null, null];
    this.keyState = [false, false, false, false];

    // Visuals & Effects
    this.ripples = [];
    this.activeRatings = [];
    this.lastRippleUpdateMs = Date.now();
    this.particlePool = [];
    this.initParticlePool();
    this.gradientCache = { tap: {} };

    this.animationFrameId = null;
    this._boundKeyDown = this.handleKeyDown.bind(this);
    this._boundKeyUp = this.handleKeyUp.bind(this);
    this._boundResize = this.resize.bind(this);

    this.initEvents();
    this.resize();
  }

  initParticlePool() {
    this.particlePool = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particlePool.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        color: "#fff",
        alpha: 1.0,
        decay: 0.05
      });
    }
  }

  initGradients() {
    if (!this.ctx) return;
    const h = CONFIG.noteHeight;

    const styles = [
      { name: "steel", c1: PALETTES.STEEL.light, c2: PALETTES.STEEL.main },
      { name: "electric", c1: PALETTES.ELECTRIC.tap1, c2: PALETTES.ELECTRIC.tap2 },
      { name: "gold", c1: PALETTES.GOLD.black, c2: PALETTES.GOLD.choco },
      { name: "cosmic", c1: "#000000", c2: PALETTES.COSMIC.core },
      { name: "legendary", c1: PALETTES.LEGENDARY.tap1, c2: PALETTES.LEGENDARY.tap2 }
    ];

    styles.forEach(style => {
      const grad = this.ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, style.c1);
      grad.addColorStop(1, style.c2);
      this.gradientCache.tap[style.name] = grad;
    });
  }

  resize() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    const rect = container ? container.getBoundingClientRect() : { width: 400, height: 800 };

    this.gameWidth = rect.width || 400;
    this.gameHeight = rect.height || 800;

    this.canvas.width = this.gameWidth;
    this.canvas.height = this.gameHeight;

    this.initGradients();
  }

  initEvents() {
    window.addEventListener("resize", this._boundResize);
    window.addEventListener("keydown", this._boundKeyDown);
    window.addEventListener("keyup", this._boundKeyUp);

    // Pointer events on canvas for mouse & mobile multitouch
    this.canvas.addEventListener("pointerdown", (e) => {
      if (e.cancelable) e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const lane = Math.floor((e.clientX - rect.left) / (rect.width / 4));
      if (lane >= 0 && lane < 4) {
        this.handleInputDown(lane);
        try { this.canvas.setPointerCapture(e.pointerId); } catch (err) {}
      }
    }, { passive: false });

    const handlePointerRelease = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const lane = Math.floor((e.clientX - rect.left) / (rect.width / 4));
      if (lane >= 0 && lane < 4) {
        this.handleInputUp(lane);
      }
    };

    this.canvas.addEventListener("pointerup", handlePointerRelease, { passive: false });
    this.canvas.addEventListener("pointerleave", handlePointerRelease, { passive: false });
    this.canvas.addEventListener("pointercancel", () => {
      this.keyState = [false, false, false, false];
      this.holdingTiles = [null, null, null, null];
    }, { passive: false });
  }

  /**
   * Prepares and loads a track from Firebase Storage URL
   */
  async loadTrack(track) {
    this.resetState();
    this.currentTrack = track;

    // 1. Fetch & decode AudioBuffer via Web Audio API
    this.audioBuffer = await audioEngine.loadTrackBuffer(track.audioUrl, track.id);

    // 2. Generate procedural notes map via Pulse Engine
    const { tiles, maxPossibleScore } = generateTilesFromAudio(
      this.audioBuffer,
      track.title,
      CONFIG,
      this.gameHeight
    );

    this.mapTiles = tiles;
    this.maxPossibleScore = Math.max(100, maxPossibleScore);
  }

  resetState() {
    this.isPlaying = false;
    this.isPaused = false;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.perfectCount = 0;
    this.goodCount = 0;
    this.missCount = 0;
    this.consecutiveMisses = 0;
    this.starStatus = [0, 0, 0, 0, 0];

    this.activeTiles = [];
    this.mapTiles = [];
    this.holdingTiles = [null, null, null, null];
    this.keyState = [false, false, false, false];
    this.ripples = [];

    if (this.legendaryOverlay) this.legendaryOverlay.classList.remove("active");
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  start() {
    if (!this.audioBuffer) return;
    this.isPlaying = true;
    this.isPaused = false;

    // Start Web Audio playback with lead-in delay
    const startDelay = 2.0; // 2 seconds lead time
    audioEngine.play(this.audioBuffer, {
      delay: startDelay,
      onEnded: () => {
        this.endGame(true);
      }
    });

    this.lastFrameTime = performance.now();
    this.loop();
  }

  pause() {
    if (!this.isPlaying || this.isPaused) return;
    this.isPaused = true;
    audioEngine.pause();
  }

  resume() {
    if (!this.isPlaying || !this.isPaused) return;
    this.isPaused = false;
    audioEngine.resume(this.audioBuffer);
    this.loop();
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    audioEngine.stop();
  }

  destroy() {
    this.stop();
    window.removeEventListener("resize", this._boundResize);
    window.removeEventListener("keydown", this._boundKeyDown);
    window.removeEventListener("keyup", this._boundKeyUp);
  }

  loop() {
    if (!this.isPlaying || this.isPaused) return;

    const songTime = audioEngine.getCurrentTime() * 1000; // In milliseconds
    const durationMs = this.audioBuffer ? this.audioBuffer.duration * 1000 : 60000;

    if (songTime > durationMs + 1000) {
      this.endGame(true);
      return;
    }

    this.update(songTime);
    this.draw(songTime);

    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  update(songTime) {
    const hitTimeWindow = this.currentSpeed;
    const hitY = this.gameHeight * CONFIG.hitPosition;
    const now = Date.now();

    // Auto-bot cheat / simulation
    if (this.isBotEnabled && this.isPlaying && !this.isPaused) {
      this.activeTiles.forEach(tile => {
        if (!tile.hit && !tile.completed && !tile.failed && !tile.released) {
          if (tile.time - songTime <= 10) {
            this.handleInputDown(tile.lane);
          }
        }
        if (tile.type === "long" && tile.holding && !tile.completed) {
          if (songTime >= tile.endTime) {
            this.handleInputUp(tile.lane);
          }
        }
      });
    }

    // Spawn tiles arriving into hit window
    for (let i = 0; i < this.mapTiles.length; i++) {
      const tile = this.mapTiles[i];
      if (!tile.spawned && tile.time - hitTimeWindow <= songTime) {
        tile.spawned = true;
        this.activeTiles.push(tile);
      }
    }

    // Process active tiles
    for (let i = this.activeTiles.length - 1; i >= 0; i--) {
      const tile = this.activeTiles[i];

      if (tile.completed) {
        this.activeTiles.splice(i, 1);
        continue;
      }

      if (tile.released) {
        if (!tile.fadeStartTime) tile.fadeStartTime = now;
        if (now - tile.fadeStartTime > 200) {
          this.activeTiles.splice(i, 1);
          continue;
        }
      }

      // Tap note hit animation expiration
      if (tile.type === "tap" && tile.hit) {
        if (now - tile.hitAnimStart > 100) {
          this.activeTiles.splice(i, 1);
        }
        continue;
      }

      // Long hold note logic
      if (tile.type === "long" && tile.hit && !tile.completed && !tile.failed && !tile.released) {
        const isKeyPressed = this.keyState[tile.lane];
        if (isKeyPressed) {
          if (songTime < tile.endTime) {
            tile.holdTicks++;
            if (tile.holdTicks % 10 === 0) {
              const mult = this.getComboMultiplier();
              this.score += Math.round(CONFIG.scoreHoldTick * mult);
              this.combo += 1;
              if (this.combo > this.maxCombo) this.maxCombo = this.combo;
              this.triggerScoreUI();
              this.spawnSparks(tile.lane, hitY, "#00f0ff", "good");
            }
            tile.holding = true;
          } else {
            this.completeLongNote(tile);
          }
        } else {
          // Key released before end
          if (tile.endTime - songTime < 100) {
            this.completeLongNote(tile);
          } else {
            tile.holding = false;
            tile.released = true;
            if (this.holdingTiles[tile.lane] === tile) {
              this.holdingTiles[tile.lane] = null;
            }
          }
        }
      }

      // Note missed past hit line
      const limitY = this.gameHeight + 50;
      const yStart = (1 - (tile.time - songTime) / this.currentSpeed) * hitY;
      const yEnd = tile.type === "long" 
        ? (1 - (tile.endTime - songTime) / this.currentSpeed) * hitY 
        : yStart;

      if ((tile.type === "tap" && yStart > limitY && !tile.hit) ||
          (tile.type === "long" && yEnd > limitY && !tile.hit && !tile.released)) {
        if (!tile.hit && !tile.completed && !tile.failed) {
          this.missNote(tile);
        }
        this.activeTiles.splice(i, 1);
      }
    }

    // Legendary overlay handling
    if (this.legendaryOverlay) {
      if (this.combo >= 75) this.legendaryOverlay.classList.add("active");
      else this.legendaryOverlay.classList.remove("active");
    }

    // Update ripples
    const dtRipple = now - this.lastRippleUpdateMs;
    this.lastRippleUpdateMs = now;
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.age += dtRipple;
      r.power *= 0.95;
      if (r.power < 0.05) this.ripples.splice(i, 1);
    }
  }

  draw(songTime) {
    const ctx = this.ctx;
    if (!ctx) return;

    const isLight = document.body.getAttribute("data-theme") === "light";
    const colors = isLight ? CONFIG.colorsLight : CONFIG.colorsDark;

    // Palette tier
    let p = { tapColor: [], longColor: [], glow: "", border: "", name: "steel" };
    if (this.combo < 15) {
      p.glow = PALETTES.STEEL.main; p.border = PALETTES.STEEL.border; p.name = "steel";
    } else if (this.combo < 30) {
      p.glow = PALETTES.ELECTRIC.glow; p.border = PALETTES.ELECTRIC.border; p.name = "electric";
    } else if (this.combo < 50) {
      p.glow = PALETTES.GOLD.glow; p.border = PALETTES.GOLD.border; p.name = "gold";
    } else if (this.combo < 75) {
      p.glow = PALETTES.COSMIC.glow; p.border = PALETTES.COSMIC.border; p.name = "cosmic";
    } else {
      p.glow = PALETTES.LEGENDARY.glow; p.border = PALETTES.LEGENDARY.accent; p.name = "legendary";
    }

    // 1. Clear Canvas
    ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);

    const laneW = this.gameWidth / 4;
    const hitY = this.gameHeight * CONFIG.hitPosition;
    const padding = 6;

    // 2. Vertical Equalizer from Web Audio AnalyserNode
    if (audioEngine.analyser && audioEngine.dataArray) {
      audioEngine.analyser.getByteFrequencyData(audioEngine.dataArray);
      const eqGrad = ctx.createLinearGradient(0, this.gameHeight, 0, 0);
      eqGrad.addColorStop(0.1, PALETTES.STEEL.main);
      eqGrad.addColorStop(0.4, PALETTES.GOLD.glow);
      eqGrad.addColorStop(0.7, "#d500f9");
      eqGrad.addColorStop(1.0, PALETTES.COSMIC.glitch);

      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.strokeStyle = eqGrad;

      for (let i = 0; i <= 4; i++) {
        let x = i * laneW;
        if (i === 0) x += 2;
        if (i === 4) x -= 2;

        const freqIndex = i === 2 ? 4 : (i === 1 || i === 3 ? 1 : 12);
        const rawValue = audioEngine.dataArray[freqIndex] || 0;
        const percent = Math.min(1.0, Math.pow(rawValue / 255.0, 3) * 1.2);
        const h = this.gameHeight * (0.12 + (percent * 0.85));

        ctx.beginPath();
        ctx.moveTo(x, this.gameHeight);
        ctx.lineTo(x, this.gameHeight - h);
        ctx.stroke();
      }
    }

    // 3. Lane Dividers
    ctx.lineWidth = 2;
    ctx.strokeStyle = colors.laneLine;
    ctx.beginPath();
    for (let i = 1; i < 4; i++) {
      ctx.moveTo(i * laneW, 0);
      ctx.lineTo(i * laneW, this.gameHeight);
    }
    ctx.stroke();

    // 4. Hit-Line with ripples
    ctx.strokeStyle = p.glow;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= this.gameWidth; x += 8) {
      let yOffset = 0;
      for (const r of this.ripples) {
        const dist = Math.abs(x - r.x);
        if (dist < r.radius + 80) {
          const wave = Math.sin(dist * 0.04 - r.age * 0.02);
          yOffset += wave * r.power * (1 / (1 + dist * 0.015));
        }
      }
      if (x === 0) ctx.moveTo(x, hitY + yOffset);
      else ctx.lineTo(x, hitY + yOffset);
    }
    ctx.stroke();

    // 5. Draw Rhythm Tiles
    const tapGradient = this.gradientCache.tap[p.name] || "#00d2ff";

    for (let i = 0; i < this.activeTiles.length; i++) {
      const tile = this.activeTiles[i];
      if (tile.type === "long" && tile.completed) continue;

      const x = tile.lane * laneW + padding;
      const w = laneW - (padding * 2);
      const progressStart = 1 - (tile.time - songTime) / this.currentSpeed;
      const visualY = tile.hit ? hitY : progressStart * hitY;

      if (tile.type === "tap") {
        if (visualY >= -CONFIG.noteHeight && visualY <= this.gameHeight + 100) {
          ctx.fillStyle = tile.failed ? "#555" : tapGradient;
          this.drawRoundedRect(ctx, x, visualY - CONFIG.noteHeight, w, CONFIG.noteHeight, 12);
          ctx.fill();

          ctx.strokeStyle = tile.failed ? "#333" : p.border;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else if (tile.type === "long") {
        const progressEnd = 1 - (tile.endTime - songTime) / this.currentSpeed;
        const visualEnd = progressEnd * hitY;
        const noteLen = Math.max(20, visualY - visualEnd);

        if (visualY >= -50 && visualEnd <= this.gameHeight + 50) {
          // Draw long hold tail
          const tailGrad = ctx.createLinearGradient(0, visualEnd, 0, visualY);
          tailGrad.addColorStop(0, PALETTES[p.name.toUpperCase()]?.long2 || "#3ef5b8");
          tailGrad.addColorStop(1, PALETTES[p.name.toUpperCase()]?.long1 || "#004d40");

          ctx.fillStyle = tile.released ? "rgba(100,100,100,0.5)" : tailGrad;
          this.drawRoundedRect(ctx, x + 4, visualEnd, w - 8, noteLen, 8);
          ctx.fill();

          // Draw note head
          ctx.fillStyle = tile.released ? "#444" : tapGradient;
          this.drawRoundedRect(ctx, x, visualY - 40, w, 40, 10);
          ctx.fill();
        }
      }
    }

    // 6. Draw Sparks
    for (const spark of this.particlePool) {
      if (!spark.active) continue;
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.alpha -= spark.decay;
      if (spark.alpha <= 0) {
        spark.active = false;
        continue;
      }
      ctx.globalAlpha = spark.alpha;
      ctx.fillStyle = spark.color;
      ctx.beginPath();
    }
    ctx.globalAlpha = 1.0;

    // 7. Draw Floating Judgment Ratings (PERFECT, GOOD, MISS)
    const now = Date.now();
    for (let i = this.activeRatings.length - 1; i >= 0; i--) {
      const r = this.activeRatings[i];
      const age = now - r.startTime;
      if (age > 650) {
        this.activeRatings.splice(i, 1);
        continue;
      }
      const progress = age / 650;
      let scale = 1;
      let alpha = 1;
      let yOffset = 0;
      if (progress < 0.2) {
        scale = 0.5 + (progress / 0.2) * 0.7;
        yOffset = -15 * (progress / 0.2);
      } else if (progress < 0.5) {
        scale = 1.2;
        yOffset = -15 - 15 * ((progress - 0.2) / 0.3);
      } else {
        const t = (progress - 0.5) * 2;
        scale = 1.2 - (0.2 * t);
        alpha = 1 - t;
        yOffset = -30 - (20 * t);
      }

      ctx.globalAlpha = Math.max(0, alpha);
      ctx.save();
      ctx.translate(r.x, r.y + yOffset);
      ctx.scale(scale, scale);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const fontSize = r.type === "rating-perfect" ? 48 : 36;
      ctx.font = `900 italic ${fontSize}px sans-serif`;
      ctx.shadowColor = r.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = r.color;
      ctx.fillText(r.text, 0, 0);

      ctx.restore();
      ctx.globalAlpha = 1.0;
    }
  }

  showRating(text, cssClass) {
    let color = "#fff";
    if (cssClass === "rating-perfect") color = "#ff00ff";
    else if (cssClass === "rating-good") color = "#66FCF1";
    else if (cssClass === "rating-miss") color = "#ff3333";

    this.activeRatings.push({
      text: text,
      type: cssClass,
      color: color,
      startTime: Date.now(),
      x: this.gameWidth / 2,
      y: this.gameHeight * 0.4
    });
    this.onRatingShow(text, cssClass);
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  spawnSparks(lane, y, color, type = "perfect") {
    const laneW = this.gameWidth / 4;
    const x = lane * laneW + laneW / 2;
    const count = type === "perfect" ? 18 : 10;

    let spawned = 0;
    for (const p of this.particlePool) {
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.5;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.size = Math.random() * 3 + 1.5;
        p.color = color;
        p.alpha = 1.0;
        p.decay = Math.random() * 0.04 + 0.02;

        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  handleInputDown(lane) {
    if (!this.isPlaying || this.isPaused) return;

    this.keyState[lane] = true;
    const songTime = audioEngine.getCurrentTime() * 1000;
    const hitY = this.gameHeight * CONFIG.hitPosition;
    const now = Date.now();

    // Trigger hit-line ripple
    this.ripples.push({
      x: lane * (this.gameWidth / 4) + (this.gameWidth / 8),
      radius: 40,
      power: 12,
      age: 0
    });

    // Find candidate tile in lane
    let closestTile = null;
    let minDiff = Infinity;

    for (const tile of this.activeTiles) {
      if (tile.lane === lane && !tile.hit && !tile.completed && !tile.failed && !tile.released) {
        const diff = Math.abs(tile.time - songTime);
        if (diff < minDiff) {
          minDiff = diff;
          closestTile = tile;
        }
      }
    }

    const perfectWindow = 80;
    const goodWindow = 175;

    if (closestTile && minDiff <= goodWindow) {
      closestTile.hit = true;
      closestTile.hitAnimStart = now;

      if (closestTile.type === "long") {
        this.holdingTiles[lane] = closestTile;
      }

      const isPerfect = minDiff <= perfectWindow;
      const mult = this.getComboMultiplier();
      const points = isPerfect ? CONFIG.scorePerfect : CONFIG.scoreGood;

      this.score += Math.round(points * mult);
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      if (isPerfect) this.perfectCount++;
      else this.goodCount++;

      this.consecutiveMisses = 0;
      this.triggerScoreUI();

      const ratingText = isPerfect ? "ІДЕАЛЬНО" : "ДОБРЕ";
      const ratingClass = isPerfect ? "rating-perfect" : "rating-good";
      this.showRating(ratingText, ratingClass);

      this.spawnSparks(lane, hitY, isPerfect ? "#ffe600" : "#00f0ff", isPerfect ? "perfect" : "good");
    } else {
      // Empty lane tap
      this.consecutiveMisses++;
      if (this.consecutiveMisses >= 3) {
        this.combo = 0;
        this.triggerScoreUI();
      }
    }
  }

  handleInputUp(lane) {
    this.keyState[lane] = false;
    const holdTile = this.holdingTiles[lane];
    if (holdTile) {
      const songTime = audioEngine.getCurrentTime() * 1000;
      if (holdTile.endTime - songTime < 100) {
        this.completeLongNote(holdTile);
      } else {
        holdTile.holding = false;
        holdTile.released = true;
        this.holdingTiles[lane] = null;
      }
    }
  }

  completeLongNote(tile) {
    tile.completed = true;
    tile.holding = false;
    if (this.holdingTiles[tile.lane] === tile) {
      this.holdingTiles[tile.lane] = null;
    }
    const mult = this.getComboMultiplier();
    this.score += Math.round((CONFIG.scoreHoldTick * 5) * mult);
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.triggerScoreUI();
  }

  missNote(tile) {
    tile.failed = true;
    this.combo = 0;
    this.missCount++;
    this.triggerScoreUI();
    this.showRating("ПРОМАХ", "rating-miss");
  }

  getComboMultiplier() {
    if (this.combo < 15) return 1.0;
    if (this.combo < 30) return 1.5;
    if (this.combo < 50) return 2.0;
    if (this.combo < 75) return 2.5;
    return 3.0;
  }

  triggerScoreUI() {
    // Calculate star count (1 to 3 stars based on score ratio)
    const ratio = Math.min(1.0, this.score / this.maxPossibleScore);
    let stars = 0;
    if (ratio >= 0.9) stars = 3;
    else if (ratio >= 0.6) stars = 2;
    else if (ratio >= 0.3) stars = 1;

    this.onScoreUpdate({
      score: this.score,
      combo: this.combo,
      maxCombo: this.maxCombo,
      stars: stars,
      progress: ratio
    });
  }

  handleKeyDown(e) {
    if (e.repeat) return;
    if (e.code === "Space") {
      e.preventDefault();
      if (this.isPaused) this.resume();
      else this.pause();
      return;
    }
    const lane = this.KEYS.indexOf(e.code);
    if (lane !== -1) {
      this.handleInputDown(lane);
    }
  }

  handleKeyUp(e) {
    const lane = this.KEYS.indexOf(e.code);
    if (lane !== -1) {
      this.handleInputUp(lane);
    }
  }

  endGame(victory = true) {
    this.stop();

    const totalNotes = this.perfectCount + this.goodCount + this.missCount;
    const accuracy = totalNotes > 0 
      ? Math.round(((this.perfectCount + this.goodCount * 0.5) / totalNotes) * 100) 
      : 100;

    let stars = 0;
    const ratio = Math.min(1.0, this.score / this.maxPossibleScore);
    if (ratio >= 0.9) stars = 3;
    else if (ratio >= 0.6) stars = 2;
    else if (ratio >= 0.3) stars = 1;

    this.onGameEnd({
      victory,
      score: this.score,
      maxCombo: this.maxCombo,
      accuracy,
      stars,
      perfectCount: this.perfectCount,
      goodCount: this.goodCount,
      missCount: this.missCount,
      trackId: this.currentTrack?.id || "cloud_track",
      trackTitle: this.currentTrack?.title || "Без назви",
      artist: this.currentTrack?.artist || "Невідомий"
    });
  }
}
