// ==========================================
// NEON PIANO GAME ENGINE
// ==========================================
import { audioEngine } from "../audio/audioEngine.js";
import { saveGameStats } from "../services/stats.js";

export class NeonPianoGame {
  constructor(canvasContainer, options = {}) {
    this.container = canvasContainer;
    this.canvas = null;
    this.ctx = null;

    // Track & Audio Buffer
    this.currentTrack = null;
    this.audioBuffer = null;

    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.perfectCount = 0;
    this.goodCount = 0;
    this.missCount = 0;
    this.totalNotes = 0;

    // 4 Lanes setup
    this.laneCount = 4;
    this.laneKeys = ["d", "f", "j", "k"];
    this.laneColors = [
      { main: "#00f0ff", glow: "rgba(0, 240, 255, 0.6)", hit: "#70f7ff" }, // Neon Cyan
      { main: "#ff007f", glow: "rgba(255, 0, 127, 0.6)", hit: "#ff66b2" }, // Neon Magenta
      { main: "#ffe600", glow: "rgba(255, 230, 0, 0.6)", hit: "#fff380" }, // Neon Yellow
      { main: "#b026ff", glow: "rgba(176, 38, 255, 0.6)", hit: "#d480ff" }  // Neon Purple
    ];

    // Timing & Physics
    this.tileFallDuration = 1.8; // Time (in seconds) it takes a tile to travel from top (0) to hit line
    this.hitLineY = 0; // Calculated on resize
    this.tiles = []; // Array of active tiles { id, lane, hitTime, isHit, isMissed }
    this.particles = []; // Visual particle explosions
    this.judgments = []; // Floating judgment texts ("PERFECT", "GOOD", "MISS")
    this.activeKeyLanes = [false, false, false, false];

    // Callbacks
    this.onScoreUpdate = options.onScoreUpdate || (() => {});
    this.onGameEnd = options.onGameEnd || (() => {});

    this.animationFrameId = null;
    this._boundLoop = this.loop.bind(this);
    this._loadGeneration = 0;
    this._destroyed = false;
    this._boundKeyDown = this.handleKeyDown.bind(this);
    this._boundKeyUp = this.handleKeyUp.bind(this);
    this._boundResize = this.resize.bind(this);
    this._boundPointerDown = this.handlePointerDown.bind(this);
    this._boundPointerUp = this.handlePointerUp.bind(this);

    this.initCanvas();
  }

  initCanvas() {
    this.container.innerHTML = "";
    this.canvas = document.createElement("canvas");
    this.canvas.className = "neon-game-canvas";
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    this.resize();
    window.addEventListener("resize", this._boundResize);
    window.addEventListener("keydown", this._boundKeyDown);
    window.addEventListener("keyup", this._boundKeyUp);

    // Touch & Mouse events for lanes
    this.canvas.addEventListener("pointerdown", this._boundPointerDown);
    window.addEventListener("pointerup", this._boundPointerUp);
  }

  resize() {
    if (!this.canvas || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.width = rect.width;
    this.height = rect.height;
    this.hitLineY = this.height - 110;
    this.laneWidth = this.width / this.laneCount;
  }

  /**
   * Generates a dynamic rhythmic beatmap for any loaded track.
   * Generates rhythmic patterns tuned to the track duration.
   */
  generateBeatmap(duration, bpm = 128) {
    if (!Number.isFinite(duration) || duration <= 2) return [];
    if (!Number.isFinite(bpm) || bpm <= 0) bpm = 128;
    const beatInterval = 60 / bpm; // In seconds
    const notes = [];
    let id = 0;

    // Start 2 seconds in to give player prep time
    let currentTime = 2.0;
    const endTime = Math.max(2, duration - 1.0);

    let lastLane = -1;

    while (currentTime < endTime) {
      // Pick random lane, avoiding 3 repeats in a row
      let lane = Math.floor(Math.random() * this.laneCount);
      if (lane === lastLane) {
        lane = (lane + 1 + Math.floor(Math.random() * (this.laneCount - 1))) % this.laneCount;
      }
      lastLane = lane;

      notes.push({
        id: id++,
        lane: lane,
        hitTime: currentTime,
        isHit: false,
        isMissed: false
      });

      // Occasional simultaneous double chord (2 lanes hit at once)
      if (Math.random() < 0.22 && id > 4) {
        const secondLane = (lane + 2) % this.laneCount;
        notes.push({
          id: id++,
          lane: secondLane,
          hitTime: currentTime,
          isHit: false,
          isMissed: false
        });
      }

      // Rhythm variance: quarter notes, eighth notes, syncopation
      const rhythmChoice = Math.random();
      if (rhythmChoice < 0.6) {
        currentTime += beatInterval; // 1 beat
      } else if (rhythmChoice < 0.85) {
        currentTime += beatInterval * 0.5; // 1/2 beat
      } else {
        currentTime += beatInterval * 1.5; // dotted beat
      }
    }

    return notes;
  }

  /**
   * Loads track and prepares game
   */
  async loadTrack(track) {
    if (this._destroyed) return;
    this.stop();
    const generation = ++this._loadGeneration;
    this.audioBuffer = null;
    this.currentTrack = track;
    this.tiles = [];
    this.particles = [];
    this.judgments = [];
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.perfectCount = 0;
    this.goodCount = 0;
    this.missCount = 0;

    // Pre-decode audio buffer with zero latency
    const buffer = await audioEngine.loadTrackBuffer(track.audioUrl, track.id);
    if (this._destroyed || generation !== this._loadGeneration) return;
    this.audioBuffer = buffer;
    
    // Generate beatmap
    const duration = this.audioBuffer.duration;
    this.tiles = this.generateBeatmap(duration, 128);
    this.totalNotes = this.tiles.length;
    this.onScoreUpdate(this.getStatsSnapshot());
  }

  start() {
    if (!this.audioBuffer || this.isRunning || this._destroyed) return;
    this.isRunning = true;
    this.isPaused = false;

    // Play track with zero latency
    audioEngine.play(this.audioBuffer, {
      onEnded: () => {
        this.finishGame();
      }
    });

    this.lastFrameTime = performance.now();
    this.loop();
  }

  pause() {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;
    this._cancelFrame();
    this.activeKeyLanes.fill(false);
    audioEngine.pause();
  }

  resume() {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;
    audioEngine.resume(this.audioBuffer);
    this.loop();
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this._cancelFrame();
    this.activeKeyLanes.fill(false);
    audioEngine.stop();
  }

  _cancelFrame() {
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = null;
  }

  destroy() {
    this._destroyed = true;
    ++this._loadGeneration;
    this.stop();
    this.audioBuffer = null;
    this.tiles = [];
    this.particles = [];
    this.judgments = [];
    window.removeEventListener("resize", this._boundResize);
    window.removeEventListener("keydown", this._boundKeyDown);
    window.removeEventListener("keyup", this._boundKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener("pointerdown", this._boundPointerDown);
    }
    window.removeEventListener("pointerup", this._boundPointerUp);
  }

  /**
   * Main game loop running on requestAnimationFrame
   */
  loop() {
    this.animationFrameId = null;
    if (!this.isRunning || this.isPaused) return;

    this.update();
    this.render();

    if (this.isRunning && !this.isPaused) {
      this.animationFrameId = requestAnimationFrame(this._boundLoop);
    }
  }

  update() {
    const songTime = audioEngine.getCurrentTime();

    // Check for missed tiles (tiles that passed beyond hit line without hit)
    const missThreshold = 0.25; // 250ms after ideal hit time
    for (const tile of this.tiles) {
      if (!tile.isHit && !tile.isMissed) {
        if (songTime - tile.hitTime > missThreshold) {
          tile.isMissed = true;
          this.registerHit("MISS", tile.lane);
        }
      }
    }

    // Update particle explosions
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating judgment badges
    for (let i = this.judgments.length - 1; i >= 0; i--) {
      const j = this.judgments[i];
      j.y -= 1.2;
      j.alpha -= 0.025;
      if (j.alpha <= 0) {
        this.judgments.splice(i, 1);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const songTime = audioEngine.getCurrentTime();

    // 1. Clear background
    ctx.clearRect(0, 0, w, h);

    // 2. Draw 4 Lanes and Dividers
    for (let i = 0; i < this.laneCount; i++) {
      const laneX = i * this.laneWidth;

      // Active key press background glow
      if (this.activeKeyLanes[i]) {
        const grad = ctx.createLinearGradient(0, this.hitLineY - 180, 0, h);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, this.laneColors[i].glow);
        ctx.fillStyle = grad;
        ctx.fillRect(laneX, 0, this.laneWidth, h);
      }

      // Lane separator line
      if (i > 0) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(laneX, 0);
        ctx.lineTo(laneX, h);
        ctx.stroke();
      }

      // Lane key hints at bottom
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "bold 15px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(this.laneKeys[i].toUpperCase(), laneX + this.laneWidth / 2, h - 25);
    }

    // 3. Draw Target Hit-Line with Neon Glow
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(0, this.hitLineY);
    ctx.lineTo(w, this.hitLineY);
    ctx.stroke();
    ctx.restore();

    // 4. Draw Falling Neon Tiles
    const tileHeight = 65;
    const tileMargin = 8;
    const tileWidth = this.laneWidth - tileMargin * 2;

    for (const tile of this.tiles) {
      if (tile.isHit) continue;

      // Time until tile reaches the hit-line (can be negative if just passed)
      const timeDiff = tile.hitTime - songTime;

      // Calculate Y position: hitLineY when timeDiff === 0
      const progress = 1 - (timeDiff / this.tileFallDuration);
      const tileY = progress * this.hitLineY;

      // Only draw if within visible screen bounds
      if (tileY >= -tileHeight && tileY <= h + 50) {
        const tileX = tile.lane * this.laneWidth + tileMargin;
        const color = this.laneColors[tile.lane];

        ctx.save();
        ctx.shadowColor = color.main;
        ctx.shadowBlur = tile.isMissed ? 2 : 18;

        // Tile body
        ctx.fillStyle = tile.isMissed ? "rgba(120, 120, 120, 0.4)" : color.main;
        this.drawRoundedRect(ctx, tileX, tileY - tileHeight, tileWidth, tileHeight, 10);
        ctx.fill();

        // Inner glowing core
        if (!tile.isMissed) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          this.drawRoundedRect(ctx, tileX + 4, tileY - tileHeight + 4, tileWidth - 8, 8, 4);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // 5. Draw Particle Explosions
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. Draw Floating Judgment Labels
    for (const j of this.judgments) {
      ctx.save();
      ctx.globalAlpha = j.alpha;
      ctx.font = "bold 20px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = j.color;
      ctx.shadowColor = j.color;
      ctx.shadowBlur = 12;
      ctx.fillText(j.text, j.x, j.y);
      ctx.restore();
    }
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

  /**
   * Spawns neon particle bursts on tap
   */
  spawnParticles(x, y, color) {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 2,
        color: color,
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  /**
   * Registers player hit judgment
   */
  playJudgmentSound(lane, perfect, missed = false) {
    const ctx = audioEngine.audioCtx;
    if (!ctx || ctx.state !== 'running' || audioEngine.isMuted) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    oscillator.type = missed ? 'triangle' : 'sine';
    oscillator.frequency.setValueAtTime(missed ? 110 : [523.25, 659.25, 783.99, 1046.5][lane], now);
    gain.gain.setValueAtTime(perfect ? 0.09 : 0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    oscillator.connect(gain);
    gain.connect(audioEngine.masterGain);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(now);
    oscillator.stop(now + 0.13);
  }

  registerHit(type, laneIndex) {
    const laneX = laneIndex * this.laneWidth + this.laneWidth / 2;

    if (type === "PERFECT") {
      this.score += 100 + Math.min(this.combo * 2, 50);
      this.combo++;
      this.perfectCount++;
      this.playJudgmentSound(laneIndex, true);
      this.spawnParticles(laneX, this.hitLineY, this.laneColors[laneIndex].hit);
      this.judgments.push({ text: "PERFECT! 🔥", x: laneX, y: this.hitLineY - 20, color: "#ffe600", alpha: 1.0 });
    } else if (type === "GOOD") {
      this.score += 50 + Math.min(this.combo, 25);
      this.combo++;
      this.goodCount++;
      this.playJudgmentSound(laneIndex, false);
      this.spawnParticles(laneX, this.hitLineY, this.laneColors[laneIndex].main);
      this.judgments.push({ text: "GOOD", x: laneX, y: this.hitLineY - 20, color: "#00f0ff", alpha: 1.0 });
    } else {
      // MISS
      this.combo = 0;
      this.missCount++;
      this.playJudgmentSound(laneIndex, false, true);
      this.judgments.push({ text: "MISS", x: laneX, y: this.hitLineY - 20, color: "#ff0055", alpha: 1.0 });
    }

    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    this.onScoreUpdate(this.getStatsSnapshot());
  }

  /**
   * Handles user tapping or pressing a lane
   */
  triggerLane(laneIndex) {
    if (!this.isRunning || this.isPaused) return;

    this.activeKeyLanes[laneIndex] = true;
    const songTime = audioEngine.getCurrentTime();

    // Find candidate tile in this lane closest to the hit line
    let closestTile = null;
    let minTimeDiff = Infinity;

    for (const tile of this.tiles) {
      if (tile.lane === laneIndex && !tile.isHit && !tile.isMissed) {
        const timeDiff = Math.abs(tile.hitTime - songTime);
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          closestTile = tile;
        }
      }
    }

    // Judgment timing windows (in seconds):
    // Perfect: within 80ms
    // Good: within 170ms
    const perfectWindow = 0.08;
    const goodWindow = 0.17;

    if (closestTile && minTimeDiff <= goodWindow) {
      closestTile.isHit = true;
      if (minTimeDiff <= perfectWindow) {
        this.registerHit("PERFECT", laneIndex);
      } else {
        this.registerHit("GOOD", laneIndex);
      }
    } else {
      // Pressed lane when no note is in range
      this.registerHit("MISS", laneIndex);
    }
  }

  releaseLane(laneIndex) {
    this.activeKeyLanes[laneIndex] = false;
  }

  handleKeyDown(e) {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    const laneIndex = this.laneKeys.indexOf(key);

    if (laneIndex !== -1) {
      e.preventDefault();
      this.triggerLane(laneIndex);
    } else if (key === "escape" || key === " ") {
      // Pause / Resume
      if (this.isPaused) this.resume();
      else this.pause();
    }
  }

  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    const laneIndex = this.laneKeys.indexOf(key);
    if (laneIndex !== -1) {
      this.releaseLane(laneIndex);
    }
  }

  handlePointerDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const laneIndex = Math.floor(clientX / this.laneWidth);
    if (laneIndex >= 0 && laneIndex < this.laneCount) {
      this.triggerLane(laneIndex);
    }
  }

  handlePointerUp() {
    this.activeKeyLanes = [false, false, false, false];
  }

  getStatsSnapshot() {
    const totalAttempted = this.perfectCount + this.goodCount + this.missCount;
    const accuracy = totalAttempted > 0 
      ? Math.round(((this.perfectCount * 1.0 + this.goodCount * 0.5) / totalAttempted) * 100) 
      : 100;

    return {
      score: this.score,
      combo: this.combo,
      maxCombo: this.maxCombo,
      accuracy: accuracy,
      perfectCount: this.perfectCount,
      goodCount: this.goodCount,
      missCount: this.missCount
    };
  }

  async finishGame() {
    if (!this.isRunning || this._destroyed) return;
    const generation = this._loadGeneration;
    this.stop();
    const stats = this.getStatsSnapshot();
    const result = {
      ...stats,
      trackId: this.currentTrack?.id || "demo",
      trackTitle: this.currentTrack?.title || "Neon Anthem",
      artist: this.currentTrack?.artist || "Cyber Synth"
    };

    // Automatically encrypt and persist to Firestore
    try {
      await saveGameStats(result);
      console.log("Game stats successfully encrypted and saved to Firestore.");
    } catch (err) {
      console.warn("Stats could not be saved to Firestore (guest or network):", err.message);
    }

    if (!this._destroyed && generation === this._loadGeneration) this.onGameEnd(result);
  }
}
