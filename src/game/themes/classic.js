// ==========================================
// CLASSIC THEME MODULE (Cyberpunk Neon / Digital Laser Grid)
// ==========================================

export const CLASSIC_THEME = {
  id: 'classic',
  nameKey: 'themeClassic',
  descKey: 'themeClassicDesc',
  badgeKey: 'themeClassicBadge',
  price: 0,
  unlockedByDefault: true,
  accentColor: '#38bdf8',
  previewBg: 'linear-gradient(135deg, #0b132b, #1c2541, #3a506b)',
  colors: {
    bgCenter: '#182452',
    bgMid: '#0d1533',
    bgOuter: '#050818',
    bgAura: 'rgba(56, 189, 248, 0.14)',
    strings: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8'],
    stringGlow: 'rgba(56, 189, 248, 0.4)',
    receptorBorder: 'rgba(56, 189, 248, 0.4)',
    particleType: 'cyber_bit'
  },
  comboTiers: [
    { min: 0, max: 49, name: 'steel', border: 'rgba(56, 189, 248, 0.45)', glow: 'rgba(56, 189, 248, 0.35)', particleColors: ['#38bdf8', '#7dd3fc', '#bae6fd'] },
    { min: 50, max: 99, name: 'electric', border: 'rgba(14, 165, 233, 0.65)', glow: 'rgba(14, 165, 233, 0.55)', particleColors: ['#0284c7', '#38bdf8', '#e0f2fe'] },
    { min: 100, max: 199, name: 'cyber_cyan', border: 'rgba(6, 182, 212, 0.8)', glow: 'rgba(6, 182, 212, 0.65)', particleColors: ['#06b6d4', '#67e8f9', '#ffffff'] },
    { min: 200, max: 399, name: 'golden_neon', border: 'rgba(234, 179, 8, 0.85)', glow: 'rgba(234, 179, 8, 0.7)', particleColors: ['#facc15', '#fef08a', '#ffffff'] },
    { min: 400, max: 799, name: 'purple_laser', border: 'rgba(168, 85, 247, 0.9)', glow: 'rgba(168, 85, 247, 0.75)', particleColors: ['#a855f7', '#d8b4fe', '#ffffff'] },
    { min: 800, max: Infinity, name: 'quantum_emerald', border: 'rgba(16, 185, 129, 0.95)', glow: 'rgba(16, 185, 129, 0.85)', particleColors: ['#10b981', '#6ee7b7', '#ffffff'] }
  ],

  getTier(combo) {
    const tiers = this.comboTiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (combo >= tiers[i].min) return tiers[i];
    }
    return tiers[0];
  },

  /**
   * Custom note decoration for Classic theme:
   * Futuristic cyber-glass bevel with electric laser core diamond and horizontal trace.
   */
  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    ctx.save();
    const cx = x + w / 2;
    const cy = yTop + h / 2;
    const coreW = Math.max(12, w * 0.32);
    const coreH = Math.max(4, h * 0.28);
    
    ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.8)' : (comboTier?.border || '#38bdf8');
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - coreW / 2, cy);
    ctx.lineTo(cx, cy - coreH / 2);
    ctx.lineTo(cx + coreW / 2, cy);
    ctx.lineTo(cx, cy + coreH / 2);
    ctx.closePath();
    ctx.stroke();

    // Horizontal laser trace
    ctx.strokeStyle = isLight ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, cy);
    ctx.lineTo(cx - coreW / 2 - 2, cy);
    ctx.moveTo(cx + coreW / 2 + 2, cy);
    ctx.lineTo(x + w - 8, cy);
    ctx.stroke();
    ctx.restore();
  },

  /**
   * Custom receptor for Classic theme:
   * High-tech digital receptor border with corner brackets.
   */
  drawReceptor(ctx, x, y, w, h, isActive, isLight) {
    ctx.save();
    const radius = 8;
    const col = isActive 
      ? (isLight ? '#0284c7' : '#38bdf8') 
      : (isLight ? 'rgba(2, 132, 199, 0.3)' : 'rgba(56, 189, 248, 0.25)');
    
    ctx.strokeStyle = col;
    ctx.lineWidth = isActive ? 2 : 1;
    const isMob = (typeof window !== 'undefined' && (window.innerWidth <= 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1)));
    if (isActive && !isLight && !isMob) {
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowBlur = 0;
    }

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, radius);
      ctx.stroke();
    } else {
      ctx.strokeRect(x, y, w, h);
    }

    // High-tech corner brackets
    const cs = 5;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isActive ? '#ffffff' : col;
    ctx.beginPath();
    ctx.moveTo(x, y + cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y);
    ctx.moveTo(x + w - cs, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cs);
    ctx.moveTo(x, y + h - cs); ctx.lineTo(x, y + h); ctx.lineTo(x + cs, y + h);
    ctx.moveTo(x + w - cs, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cs);
    ctx.stroke();
    ctx.restore();
  },

  /**
   * Unique Note Tap Hit Animation for Classic Theme:
   * Digital Hologram Crosshair [ + ] + Dual Laser "X" Slash + expanding cyber reticle.
   */
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now) {
    const easeOut = 1 - Math.pow(1 - p, 3);
    const alpha = Math.max(0, 1.0 - Math.pow(p, 1.4));
    if (alpha <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const colMain = isPerfect 
      ? (isLight ? 'rgba(2, 132, 199,' : 'rgba(56, 189, 248,')
      : (isLight ? 'rgba(14, 165, 233,' : 'rgba(6, 182, 212,');
    const colBright = isPerfect ? 'rgba(255, 255, 255,' : 'rgba(224, 242, 254,';

    // 1. Expanding Digital Reticle Brackets [ + ]
    const boxSize = (w * 0.28) + easeOut * (w * 0.42);
    const bracketLen = Math.max(4, boxSize * 0.35);
    ctx.lineWidth = Math.max(1, 2.2 * (1.0 - p));
    ctx.strokeStyle = `${colMain} ${alpha * 0.85})`;

    // Top-left bracket
    ctx.beginPath();
    ctx.moveTo(cx - boxSize, cy - boxSize + bracketLen);
    ctx.lineTo(cx - boxSize, cy - boxSize);
    ctx.lineTo(cx - boxSize + bracketLen, cy - boxSize);
    // Top-right bracket
    ctx.moveTo(cx + boxSize - bracketLen, cy - boxSize);
    ctx.lineTo(cx + boxSize, cy - boxSize);
    ctx.lineTo(cx + boxSize, cy - boxSize + bracketLen);
    // Bottom-left bracket
    ctx.moveTo(cx - boxSize, cy + boxSize - bracketLen);
    ctx.lineTo(cx - boxSize, cy + boxSize);
    ctx.lineTo(cx - boxSize + bracketLen, cy + boxSize);
    // Bottom-right bracket
    ctx.moveTo(cx + boxSize - bracketLen, cy + boxSize);
    ctx.lineTo(cx + boxSize, cy + boxSize);
    ctx.lineTo(cx + boxSize, cy + boxSize - bracketLen);
    ctx.stroke();

    // 2. Dual Laser "X" Slash (Diagonal Neon Cuts)
    if (p < 0.65) {
      const slashP = p / 0.65;
      const slashLen = (w * 0.2) + Math.pow(slashP, 0.6) * (w * 0.45);
      const slashAlpha = (1.0 - slashP) * 0.9;
      
      // Laser glow
      ctx.lineWidth = Math.max(1, 3.5 * (1.0 - slashP));
      ctx.strokeStyle = `${colMain} ${slashAlpha * 0.7})`;
      ctx.beginPath();
      ctx.moveTo(cx - slashLen, cy - slashLen * 0.55); ctx.lineTo(cx + slashLen, cy + slashLen * 0.55);
      ctx.moveTo(cx - slashLen, cy + slashLen * 0.55); ctx.lineTo(cx + slashLen, cy - slashLen * 0.55);
      ctx.stroke();

      // Sharp white laser core
      ctx.lineWidth = Math.max(0.8, 1.5 * (1.0 - slashP));
      ctx.strokeStyle = `${colBright} ${slashAlpha})`;
      ctx.beginPath();
      ctx.moveTo(cx - slashLen * 0.9, cy - slashLen * 0.55 * 0.9); ctx.lineTo(cx + slashLen * 0.9, cy + slashLen * 0.55 * 0.9);
      ctx.moveTo(cx - slashLen * 0.9, cy + slashLen * 0.55 * 0.9); ctx.lineTo(cx + slashLen * 0.9, cy - slashLen * 0.55 * 0.9);
      ctx.stroke();
    }

    // 3. Central Digital Crosshair (+) & Core Diamond
    const crossLen = Math.max(3, (w * 0.14) * (1.0 - p));
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = `${colBright} ${alpha * 0.9})`;
    ctx.beginPath();
    ctx.moveTo(cx - crossLen, cy); ctx.lineTo(cx + crossLen, cy);
    ctx.moveTo(cx, cy - crossLen); ctx.lineTo(cx, cy + crossLen);
    ctx.stroke();

    // 4. Horizontal Laser Trace burst
    if (p < 0.45) {
      const hTraceLen = (w * 0.3) + easeOut * (w * 0.35);
      const traceAlpha = (1.0 - p / 0.45) * 0.6;
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = `${colMain} ${traceAlpha})`;
      ctx.beginPath();
      ctx.moveTo(cx - hTraceLen, cy); ctx.lineTo(cx + hTraceLen, cy);
      ctx.stroke();
    }

    ctx.restore();
  },

  // Helper palette resolver for Classic Cyberpunk
  _getPalette(combo = 0, isDead = false) {
    if (isDead) {
      return {
        border: '#475569', core: '#94a3b8', glow: 'rgba(71, 85, 105, 0.3)',
        track: 'rgba(15, 23, 42, 0.65)', node: '#64748b', beam: '#475569'
      };
    }
    const tier = (typeof combo === 'number') ? combo : 0;
    if (tier >= 800) {
      return {
        border: '#10b981', core: '#ffffff', glow: 'rgba(16, 185, 129, 0.75)',
        track: 'rgba(6, 44, 32, 0.75)', node: '#6ee7b7', beam: '#34d399'
      };
    }
    if (tier >= 400) {
      return {
        border: '#a855f7', core: '#ffffff', glow: 'rgba(168, 85, 247, 0.75)',
        track: 'rgba(36, 10, 62, 0.75)', node: '#d8b4fe', beam: '#c084fc'
      };
    }
    if (tier >= 200) {
      return {
        border: '#facc15', core: '#ffffff', glow: 'rgba(234, 179, 8, 0.75)',
        track: 'rgba(46, 35, 6, 0.75)', node: '#fef08a', beam: '#fde047'
      };
    }
    if (tier >= 100) {
      return {
        border: '#06b6d4', core: '#ffffff', glow: 'rgba(6, 182, 212, 0.70)',
        track: 'rgba(8, 38, 50, 0.75)', node: '#67e8f9', beam: '#22d3ee'
      };
    }
    if (tier >= 50) {
      return {
        border: '#0ea5e9', core: '#ffffff', glow: 'rgba(14, 165, 233, 0.65)',
        track: 'rgba(8, 28, 50, 0.70)', node: '#7dd3fc', beam: '#38bdf8'
      };
    }
    return {
      border: '#38bdf8', core: '#ffffff', glow: 'rgba(56, 189, 248, 0.60)',
      track: 'rgba(11, 25, 44, 0.70)', node: '#bae6fd', beam: '#38bdf8'
    };
  },

  /**
   * Neck junction collar for Classic theme (locking laser conduit into note head)
   */
  drawNeck(ctx, x, actualYHeadTop, w, headH, tile, isLight, combo = 0) {
    const dead = Boolean(tile && (tile.released || tile.failed));
    const pal = this._getPalette(dead ? 0 : combo, dead);
    const bodyW = Math.max(10, Math.round(w - 16));
    const cx = Math.round(x + 8 + bodyW / 2);
    const collarH = Math.max(4, Math.round(headH * 0.20));
    const collarW = Math.round(bodyW * 0.72);

    ctx.save();
    // Sleek cyber coupling socket
    ctx.fillStyle = dead ? '#1e293b' : '#09152b';
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(cx - collarW / 2, actualYHeadTop - collarH, collarW, collarH + 1, 3);
    ctx.fill();
    ctx.stroke();

    // Center laser contacts
    ctx.fillStyle = pal.core;
    ctx.beginPath();
    ctx.arc(cx - collarW * 0.26, actualYHeadTop - collarH * 0.35, 1.4, 0, Math.PI * 2);
    ctx.arc(cx + collarW * 0.26, actualYHeadTop - collarH * 0.35, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  /**
   * Procedural Hold Body: Sleek Cyber Laser Conduit (Clean, minimal, high readability)
   */
  drawHoldBody(ctx, x, yTail, w, headH, tile, isLight, now, tailH, currentCombo = 0, actualYHeadTop = null, isReleased = false) {
    const headTopY = (actualYHeadTop !== null && actualYHeadTop !== undefined) ? actualYHeadTop : (yTail + tailH);
    if (tailH <= 2 || headTopY <= yTail) return false;

    const dead = Boolean(isReleased || (tile && tile.failed));
    const holding = Boolean(tile && tile.holding && tile.hit);
    const liveCombo = (currentCombo !== undefined && currentCombo !== null && currentCombo > 0)
      ? currentCombo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : 0);
    const pal = this._getPalette(dead ? 0 : liveCombo, dead);

    const bodyLaneW = Math.max(12, Math.round(w - 16));
    const bodyX = Math.round(x + 8);
    const cx = bodyX + bodyLaneW / 2;
    const hw = Math.round(bodyLaneW * 0.44);

    ctx.save();

    // 1. Sleek Cyber Bus Track Foundation
    ctx.fillStyle = pal.track;
    ctx.strokeStyle = dead ? 'rgba(71, 85, 105, 0.4)' : pal.border;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(bodyX, yTail, bodyLaneW, tailH, 4);
    } else {
      ctx.rect(bodyX, yTail, bodyLaneW, tailH);
    }
    ctx.fill();
    ctx.stroke();

    // 2. Lateral Edge Guides
    ctx.strokeStyle = dead ? 'rgba(71, 85, 105, 0.3)' : 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(bodyX + 3, yTail);
    ctx.lineTo(bodyX + 3, headTopY);
    ctx.moveTo(bodyX + bodyLaneW - 3, yTail);
    ctx.lineTo(bodyX + bodyLaneW - 3, headTopY);
    ctx.stroke();

    // 3. Central Luminous Laser Beam
    if (!dead) {
      // Soft outer bloom
      ctx.strokeStyle = pal.glow;
      ctx.lineWidth = Math.min(12, hw * 0.75);
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();

      // Colored laser beam
      ctx.strokeStyle = pal.beam;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();

      // Pure incandescent white fiber core
      ctx.strokeStyle = pal.core;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. Clean High-Tech Tick Marks (spaced 64px apart, minimal & uncluttered)
    const tickSpacing = 64;
    const startY = headTopY - 16;
    const endY = yTail + 16;

    if (startY > endY) {
      const numTicks = Math.max(1, Math.floor((startY - endY) / tickSpacing));
      const effectiveSpacing = (startY - endY) / numTicks;

      ctx.strokeStyle = dead ? 'rgba(71, 85, 105, 0.4)' : pal.border;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      for (let i = 0; i <= numTicks; i++) {
        const ty = startY - i * effectiveSpacing;
        // Left & right micro tick
        ctx.moveTo(bodyX + 3, ty);
        ctx.lineTo(bodyX + 7, ty);
        ctx.moveTo(bodyX + bodyLaneW - 3, ty);
        ctx.lineTo(bodyX + bodyLaneW - 7, ty);
      }
      ctx.stroke();

      // 5. Holding energetic light pulse racing down the laser line
      if (holding && !dead) {
        const pulseOffset = ((now || 0) * 0.22) % effectiveSpacing;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i <= numTicks; i++) {
          const py = startY - i * effectiveSpacing - pulseOffset;
          if (py >= yTail && py <= headTopY) {
            ctx.beginPath();
            ctx.arc(cx, py, 2.0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    ctx.restore();
    return true;
  },

  /**
   * Terminal Cyber Chevron / Arrow Tail Tip (Clean, sharp, non-cluttered)
   */
  drawHoldTail(ctx, x, yTail, w, headH, tile, isLight, now, tailH = 0, currentCombo = 0, actualYHeadTop = null, nextTileDist = 9999) {
    const bodyW = Math.max(10, Math.round(w - 16));
    const bodyX = Math.round(x + 8);
    const cx = bodyX + bodyW / 2;
    const hw = Math.round(bodyW * 0.42);

    const dead = Boolean(tile && tile.failed);
    const liveCombo = (currentCombo !== undefined && currentCombo !== null && currentCombo > 0)
      ? currentCombo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : 0);
    const pal = this._getPalette(dead ? 0 : liveCombo, dead);

    // Dynamic anti-overlap safety clamping
    const availableGap = (typeof nextTileDist === 'number' && nextTileDist > 0) ? nextTileDist : 9999;
    const maxSafeTailLen = Math.max(8, Math.round(availableGap - 16));
    const baseTailLen = Math.min(26, Math.round(headH * 0.42));
    const tailLen = Math.min(baseTailLen, maxSafeTailLen);

    if (tailLen <= 5) return;

    const tipY = yTail - tailLen;
    ctx.save();

    // 1. Sleek Angular Cyber Chevron Arrow
    ctx.fillStyle = dead ? '#1e293b' : '#061325';
    ctx.strokeStyle = dead ? '#475569' : pal.border;
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.lineTo(cx + hw * 0.38, yTail - tailLen * 0.35);
    ctx.lineTo(cx + hw * 0.16, yTail);
    ctx.lineTo(cx - hw * 0.16, yTail);
    ctx.lineTo(cx - hw * 0.38, yTail - tailLen * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center laser line
    ctx.strokeStyle = dead ? '#64748b' : pal.core;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx, yTail);
    ctx.lineTo(cx, tipY);
    ctx.stroke();

    // 2. Compact Glowing Laser Diode
    const diodeY = yTail - tailLen * 0.38;
    if (!dead) {
      ctx.fillStyle = pal.core;
      ctx.beginPath();
      ctx.arc(cx, diodeY, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  /**
   * Revamped Atmospheric Background for Classic Theme:
   * Neo-Tokyo Cyber Skyline + Horizon Grid + Dynamic Multi-Band Audio Equalizers
   */
  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const gw = (typeof State !== 'undefined' && State && typeof State.gameWidth === 'number' && State.gameWidth > 0)
      ? State.gameWidth
      : (ctx.canvas?.clientWidth || (ctx.canvas ? ctx.canvas.width / (window.devicePixelRatio || 1) : 400));
    const gh = (typeof State !== 'undefined' && State && typeof State.gameHeight === 'number' && State.gameHeight > 0)
      ? State.gameHeight
      : (ctx.canvas?.clientHeight || (ctx.canvas ? ctx.canvas.height / (window.devicePixelRatio || 1) : 700));
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const t = (typeof songTime === 'number' && !isNaN(songTime)) ? songTime : (State?.songTime || 0);
    const bass = (typeof State !== 'undefined' && typeof State?.bgPulse === 'number' && !isNaN(State.bgPulse)) ? State.bgPulse : 0;

    ctx.save();

    // 1. Distant Neo-Tokyo Skyscraper Skyline Silhouette (above horizon)
    const horizonY = gh * 0.60;
    const skylineBaseY = horizonY;

    // Cache static skyline silhouettes to zero GC overhead
    if (!this._skylineBuildings || this._skylineGw !== gw) {
      this._skylineGw = gw;
      this._skylineBuildings = [];
      const numBuildings = 14;
      let curX = -10;
      for (let b = 0; b < numBuildings; b++) {
        const bw = (gw / 10) + ((b * 13) % 18);
        const bh = 50 + ((b * 29) % 95);
        this._skylineBuildings.push({ x: curX, w: bw, h: bh, winSeed: b });
        curX += bw * 0.75;
      }
    }

    // Draw skyline silhouettes
    ctx.fillStyle = isLight ? 'rgba(203, 213, 225, 0.4)' : 'rgba(7, 14, 28, 0.9)';
    ctx.strokeStyle = isLight ? 'rgba(148, 163, 184, 0.3)' : 'rgba(30, 58, 95, 0.5)';
    ctx.lineWidth = 1.0;
    for (let i = 0; i < this._skylineBuildings.length; i++) {
      const b = this._skylineBuildings[i];
      const by = skylineBaseY - b.h;
      ctx.fillRect(b.x, by, b.w, b.h);
      ctx.strokeRect(b.x, by, b.w, b.h);

      // Lit cyber windows (subtle glowing dots)
      if (!isLight) {
        ctx.fillStyle = ((i + Math.floor(songTime * 0.002)) % 3 === 0) ? 'rgba(56, 189, 248, 0.45)' : 'rgba(234, 179, 8, 0.35)';
        for (let wy = by + 8; wy < skylineBaseY - 10; wy += 12) {
          ctx.fillRect(b.x + b.w * 0.3, wy, 2.5, 3.5);
          ctx.fillRect(b.x + b.w * 0.65, wy, 2.5, 3.5);
        }
      }
    }

    // 2. Synthwave Horizon Sunset Glow / Sun Flare pulsating to the beat
    const sunR = Math.min(gw * 0.28, 100);
    const sunGlow = ctx.createRadialGradient(gw / 2, horizonY, 2, gw / 2, horizonY, sunR * (1.2 + bass * 0.4));
    sunGlow.addColorStop(0, isLight ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.45)');
    sunGlow.addColorStop(0.35, isLight ? 'rgba(14, 165, 233, 0.18)' : 'rgba(14, 165, 233, 0.25)');
    sunGlow.addColorStop(0.75, 'rgba(168, 85, 247, 0.10)');
    sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(gw / 2, horizonY, sunR * (1.2 + bass * 0.4), 0, Math.PI * 2);
    ctx.fill();

    // 3. 3D Perspective Cyber Matrix Grid in lower field
    const gridBottomY = gh;
    const gridH = gridBottomY - horizonY;
    if (gridH > 20) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, horizonY - 1, gw, gridH + 2);
      ctx.clip();

      // Soft cyber fog at horizon
      const fogGrad = ctx.createLinearGradient(0, horizonY, 0, horizonY + gridH * 0.45);
      fogGrad.addColorStop(0, isLight ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.20)');
      fogGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, horizonY, gw, gridH * 0.45);

      // Horizontal perspective grid lines
      const lineCount = 8;
      const gridScroll = (songTime * 0.0014 * warpMult * speedBoost) % 1.0;
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.26)' : 'rgba(56, 189, 248, 0.32)';
      ctx.beginPath();
      for (let i = 0; i < lineCount; i++) {
        const norm = (i + gridScroll) / lineCount;
        const curve = Math.pow(norm, 2.3);
        const ly = horizonY + curve * gridH;
        ctx.moveTo(0, ly);
        ctx.lineTo(gw, ly);
      }
      ctx.stroke();

      // Vanishing perspective lines fanning out
      const vanishingX = gw / 2;
      const vLineCount = 12;
      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.16)' : 'rgba(56, 189, 248, 0.22)';
      ctx.beginPath();
      for (let v = 0; v <= vLineCount; v++) {
        const bottomX = (gw / vLineCount) * v;
        ctx.moveTo(vanishingX, horizonY);
        ctx.lineTo(bottomX, gridBottomY);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 4. Dynamic Multi-Band Audio Equalizer Towers on left and right margins
    const barCount = 7;
    const barW = 4.5;
    const barSpacing = 6.5;
    const eqBaseY = horizonY - 4;

    for (let b = 0; b < barCount; b++) {
      const wave = Math.sin(songTime * 0.007 + b * 0.85) * 0.5 + 0.5;
      const barH = Math.max(6, 10 + wave * 24 + bass * 28 * (1 + b * 0.15));
      const bAlpha = (isLight ? 0.30 : 0.38) + (b / barCount) * 0.25;
      
      // Gradient equalizers (cyan to electric purple)
      ctx.fillStyle = (b % 2 === 0)
        ? (isLight ? `rgba(2, 132, 199, ${bAlpha})` : `rgba(56, 189, 248, ${bAlpha})`)
        : `rgba(168, 85, 247, ${bAlpha * 0.85})`;

      // Left tower
      const lx = 6 + b * barSpacing;
      ctx.fillRect(lx, eqBaseY - barH, barW, barH);
      // Top peak dot
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(lx, eqBaseY - barH - 2.5, barW, 1.5);

      // Right tower
      const rx = gw - 6 - (b + 1) * barSpacing;
      ctx.fillStyle = (b % 2 === 0)
        ? (isLight ? `rgba(2, 132, 199, ${bAlpha})` : `rgba(56, 189, 248, ${bAlpha})`)
        : `rgba(168, 85, 247, ${bAlpha * 0.85})`;
      ctx.fillRect(rx, eqBaseY - barH, barW, barH);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rx, eqBaseY - barH - 2.5, barW, 1.5);
    }

    // 5. Ambient Cyber Dust / Data Bits (subtle upward floating cyber packets)
    if (!State.classicCyberBits || State.classicCyberBitsGw !== gw) {
      State.classicCyberBitsGw = gw;
      State.classicCyberBits = [];
      for (let i = 0; i < 18; i++) {
        State.classicCyberBits.push({
          x: Math.random() * gw,
          y: Math.random() * gh,
          speed: 0.3 + Math.random() * 0.6,
          size: 1.5 + Math.random() * 2.0,
          alpha: 0.2 + Math.random() * 0.4
        });
      }
    }
    ctx.fillStyle = isLight ? 'rgba(2, 132, 199, 0.4)' : '#38bdf8';
    for (let i = 0; i < State.classicCyberBits.length; i++) {
      const bit = State.classicCyberBits[i];
      bit.y -= bit.speed * speedBoost;
      if (bit.y < 0) { bit.y = gh; bit.x = Math.random() * gw; }
      ctx.globalAlpha = bit.alpha * (0.8 + bass * 0.5);
      ctx.fillRect(bit.x, bit.y, bit.size, bit.size * 1.5);
    }

    ctx.restore();
  },

  /**
   * Custom Particle renderer for Classic Theme:
   * High-tech cyber bits, mini diamonds, and laser shards.
   */
  drawParticle(ctx, pt, life) {
    const size = Math.max(2, (pt.size || 5) * life);
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(pt.angle);

    // Sharp diamond / data bit
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.3);
    ctx.lineTo(size * 0.7, 0);
    ctx.lineTo(0, size * 1.3);
    ctx.lineTo(-size * 0.7, 0);
    ctx.closePath();
    ctx.fill();

    // Central bright dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.8, size * 0.28), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};
