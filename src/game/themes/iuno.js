// ==========================================
// IUNO THEME MODULE — Lunar Oracle (Wuthering Waves · 5★ Aero Resonator)
// High Priestess of Tetragon Temple in Septimont
// Aesthetic: antique white & divine gold, midnight-blue field,
//            lunar-azure twin-tails, crescent moon motifs, Aero wind currents
// ==========================================

export const IUNO_THEME = {
  id: 'iuno',
  nameKey: 'themeIuno',
  descKey: 'themeIunoDesc',
  badgeKey: 'themeIunoBadge',
  price: 40,
  unlockedByDefault: false,
  accentColor: '#fbbf24',
  previewBg: 'linear-gradient(135deg, #0b132b, #1a2a4a, #0f2040)',
  colors: {
    bgCenter: '#0b132b',
    bgMid: '#081020',
    bgOuter: '#030810',
    bgAura: 'rgba(56, 189, 248, 0.15)',
    strings: ['#e0f2fe', '#7dd3fc', '#38bdf8', '#2dd4bf'],
    stringGlow: 'rgba(56, 189, 248, 0.55)',
    receptorBorder: 'rgba(251, 191, 36, 0.65)',
    particleType: 'lunar'
  },
  comboTiers: [
    { min: 0,   max: 49,       name: 'oracle_whisper',  border: 'rgba(251, 191, 36, 0.50)', glow: 'rgba(56, 189, 248, 0.30)', particleColors: ['#7dd3fc', '#e0f2fe', '#fbbf24'] },
    { min: 50,  max: 99,       name: 'crescent_song',   border: 'rgba(56, 189, 248, 0.65)',  glow: 'rgba(251, 191, 36, 0.40)', particleColors: ['#38bdf8', '#fbbf24', '#fff1f2'] },
    { min: 100, max: 199,      name: 'temple_wind',     border: 'rgba(45, 212, 191, 0.75)',  glow: 'rgba(56, 189, 248, 0.55)', particleColors: ['#2dd4bf', '#7dd3fc', '#fde68a'] },
    { min: 200, max: 399,      name: 'lunar_veil',      border: 'rgba(251, 191, 36, 0.85)',  glow: 'rgba(45, 212, 191, 0.65)', particleColors: ['#fbbf24', '#2dd4bf', '#ffffff'] },
    { min: 400, max: 799,      name: 'aero_resonance',  border: 'rgba(56, 189, 248, 0.95)',  glow: 'rgba(251, 191, 36, 0.80)', particleColors: ['#38bdf8', '#fbbf24', '#e0f2fe'] },
    { min: 800, max: Infinity, name: 'eclipse_divinity', border: 'rgba(255, 215, 0, 0.97)',  glow: 'rgba(56, 189, 248, 0.95)', particleColors: ['#ffd700', '#38bdf8', '#ffffff'] }
  ],

  getTier(combo) {
    const tiers = this.comboTiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (combo >= tiers[i].min) return tiers[i];
    }
    return tiers[0];
  },

  // ============================================================
  // drawNoteDetails — antique gold filigree with crescent moon
  // ============================================================
  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    const cx = x + w / 2;
    const cy = yTop + h / 2;
    const gold = '#fbbf24';
    const azure = '#38bdf8';
    const r = Math.min(w, h) * 0.26;

    ctx.save();

    const isMob = (typeof window !== 'undefined' && (window.innerWidth <= 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1)));

    // Top & bottom gold filigree lines (antique border)
    ctx.strokeStyle = gold;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(x + 6, yTop + 4);
    ctx.lineTo(x + w - 6, yTop + 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 6, yTop + h - 4);
    ctx.lineTo(x + w - 6, yTop + h - 4);
    ctx.stroke();

    // Crescent moon center jewel — azure glow fill
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = azure;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Crescent outer arc
    ctx.globalAlpha = 0.80;
    ctx.strokeStyle = gold;
    ctx.lineWidth = 1.5;
    if (!isMob) {
      ctx.shadowColor = gold;
      ctx.shadowBlur = 8;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();

    // Inner crescent cut arc
    ctx.beginPath();
    ctx.arc(cx + r * 0.45, cy, r * 0.72, Math.PI * 0.55, -Math.PI * 0.55, true);
    ctx.stroke();

    // Small star dots at crescent tips
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#fde68a';
    if (!isMob) {
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 5;
    }
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.98, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.98, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  // ============================================================
  // drawHitAnimation — Lunar Eclipse Resonance Burst
  // ============================================================
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now) {
    if (p >= 1) return;
    const ease = 1 - (1 - p) * (1 - p); // ease-out quad
    const gold = '#fbbf24';
    const azure = '#38bdf8';
    const teal = '#2dd4bf';
    const isMob = (typeof window !== 'undefined' && (window.innerWidth <= 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1)));

    ctx.save();

    // 1. Expanding eclipse halo ring
    const haloR = (w * 0.7) * ease;
    const haloAlpha = Math.max(0, 0.85 - ease * 0.85);
    ctx.globalAlpha = haloAlpha;
    ctx.strokeStyle = isPerfect ? gold : azure;
    ctx.lineWidth = isPerfect ? 3 : 2;
    if (!isMob) {
      ctx.shadowColor = isPerfect ? gold : azure;
      ctx.shadowBlur = isPerfect ? 18 : 10;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary Aero ring
    if (p < 0.7) {
      const ring2R = haloR * 0.6;
      ctx.globalAlpha = haloAlpha * 0.6;
      ctx.strokeStyle = teal;
      ctx.lineWidth = 1.5;
      if (!isMob) {
        ctx.shadowColor = teal;
        ctx.shadowBlur = 8;
      }
      ctx.beginPath();
      ctx.arc(cx, cy, ring2R, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Crescent moon burst
    if (p < 0.55) {
      const crescentScale = 1.0 - p * 1.8;
      const cr = w * 0.22 * Math.max(0, crescentScale);
      if (cr > 2) {
        ctx.globalAlpha = Math.max(0, 0.9 - p * 1.6);
        ctx.strokeStyle = gold;
        ctx.lineWidth = 2.5;
        if (!isMob) {
          ctx.shadowColor = gold;
          ctx.shadowBlur = 14;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, cr, -Math.PI * 0.7, Math.PI * 0.7);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx + cr * 0.45, cy, cr * 0.7, Math.PI * 0.55, -Math.PI * 0.55, true);
        ctx.stroke();
      }
    }

    // 3. Winged laurel wreath arcs (expanding)
    const arcSpread = (w * 0.9) * ease;
    const arcAlpha = Math.max(0, 0.75 - ease * 0.75);
    ctx.globalAlpha = arcAlpha;
    ctx.strokeStyle = gold;
    ctx.lineWidth = 1.8;
    if (!isMob) {
      ctx.shadowColor = gold;
      ctx.shadowBlur = 10;
    }
    ctx.beginPath();
    ctx.arc(cx - arcSpread * 0.5, cy, arcSpread * 0.4, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + arcSpread * 0.5, cy, arcSpread * 0.4, -Math.PI * 0.9, -Math.PI * 0.1);
    ctx.stroke();

    // 4. Aero diagonal wind rays (perfect only)
    if (isPerfect && p < 0.6) {
      const rayLen = (w * 0.55) * ease;
      const rayAlpha = Math.max(0, 0.8 - ease);
      ctx.globalAlpha = rayAlpha;
      ctx.strokeStyle = azure;
      ctx.lineWidth = 1.5;
      if (!isMob) {
        ctx.shadowColor = azure;
        ctx.shadowBlur = 8;
      }
      const angles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
      for (const a of angles) {
        const startR = w * 0.15;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * startR, cy + Math.sin(a) * startR);
        ctx.lineTo(cx + Math.cos(a) * (startR + rayLen), cy + Math.sin(a) * (startR + rayLen));
        ctx.stroke();
      }
    }

    // 5. Central flash (white-gold radial burst)
    if (p < 0.35) {
      const flashR = (w * 0.18) * (1 - p * 2.8);
      if (flashR > 0) {
        const flashAlpha = Math.max(0, 0.9 - p * 2.5);
        ctx.globalAlpha = flashAlpha;
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, flashR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  // ============================================================
  // drawParticle — lunar sparkles: golden diamonds & azure wind wisps
  // Optimized: no shadowBlur on mobile to save GPU fill-rate budget.
  // ============================================================
  drawParticle(ctx, pt, life) {
    if (!pt.active || life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, life);
    ctx.fillStyle = pt.color;
    // shadowBlur only on desktop — very expensive on mobile GPU
    if (!pt._mobile) {
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 4;
    }

    if ((pt.x | 0) % 3 < 2) {
      // 4-point diamond sparkle
      const size = 3.5 * life;
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.angle || 0);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.35, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.35, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-size * 1.2, -0.8, size * 2.4, 1.6);
      ctx.fillRect(-0.8, -size * 1.2, 1.6, size * 2.4);
      ctx.restore();
    } else {
      // Azure wind wisp — simple rect on mobile instead of scale+arc
      if (pt._mobile) {
        const s = 2 * life;
        ctx.fillRect(pt.x - s * 2, pt.y - s * 0.4, s * 4, s * 0.8);
      } else {
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.angle || 0);
        ctx.scale(1, 0.35);
        ctx.beginPath();
        ctx.arc(0, 0, 3 * life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  // Helper palette resolver for Iuno Lunar Oracle
  _getPalette(combo = 0, isDead = false) {
    if (isDead) {
      return {
        border: '#475569', core: '#94a3b8', glow: 'rgba(71, 85, 105, 0.3)',
        track: 'rgba(15, 23, 42, 0.65)', gold: '#64748b', aero: '#475569'
      };
    }
    const tier = (typeof combo === 'number') ? combo : 0;
    if (tier >= 800) {
      return {
        border: '#ffd700', core: '#ffffff', glow: 'rgba(255, 215, 0, 0.85)',
        track: 'rgba(20, 28, 48, 0.75)', gold: '#ffd700', aero: '#38bdf8'
      };
    }
    if (tier >= 400) {
      return {
        border: '#38bdf8', core: '#ffffff', glow: 'rgba(56, 189, 248, 0.80)',
        track: 'rgba(14, 25, 46, 0.75)', gold: '#fbbf24', aero: '#7dd3fc'
      };
    }
    if (tier >= 200) {
      return {
        border: '#fbbf24', core: '#ffffff', glow: 'rgba(251, 191, 36, 0.75)',
        track: 'rgba(12, 22, 44, 0.75)', gold: '#fde68a', aero: '#2dd4bf'
      };
    }
    if (tier >= 100) {
      return {
        border: '#2dd4bf', core: '#ffffff', glow: 'rgba(45, 212, 191, 0.70)',
        track: 'rgba(10, 20, 40, 0.75)', gold: '#fbbf24', aero: '#5eead4'
      };
    }
    if (tier >= 50) {
      return {
        border: '#38bdf8', core: '#ffffff', glow: 'rgba(56, 189, 248, 0.65)',
        track: 'rgba(8, 18, 36, 0.70)', gold: '#fde68a', aero: '#38bdf8'
      };
    }
    return {
      border: '#fbbf24', core: '#ffffff', glow: 'rgba(251, 191, 36, 0.60)',
      track: 'rgba(7, 15, 32, 0.70)', gold: '#fbbf24', aero: '#7dd3fc'
    };
  },

  /**
   * Neck junction collar for Iuno theme (locking Aero silk ribbon into note head)
   */
  drawNeck(ctx, x, actualYHeadTop, w, headH, tile, isLight, combo = 0) {
    const dead = Boolean(tile && (tile.released || tile.failed));
    const pal = this._getPalette(dead ? 0 : combo, dead);
    const bodyW = Math.max(10, Math.round(w - 16));
    const cx = Math.round(x + 8 + bodyW / 2);
    const collarH = Math.max(4, Math.round(headH * 0.20));
    const collarW = Math.round(bodyW * 0.72);

    ctx.save();
    // Sleek antique golden laurel clasp
    ctx.strokeStyle = pal.gold;
    ctx.fillStyle = dead ? '#1e293b' : '#0a162d';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(cx - collarW / 2, actualYHeadTop - collarH, collarW, collarH + 1, 3);
    ctx.fill();
    ctx.stroke();

    // Central azure jewel
    ctx.fillStyle = dead ? '#64748b' : pal.aero;
    ctx.beginPath();
    ctx.arc(cx, actualYHeadTop - collarH * 0.35, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  /**
   * Procedural Hold Body: Sleek Divine Aero Silk Ribbon (Clean, minimal, high readability)
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

    // 1. Sleek Midnight Azure Track Foundation
    ctx.fillStyle = pal.track;
    ctx.strokeStyle = dead ? 'rgba(71, 85, 105, 0.4)' : pal.gold;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(bodyX, yTail, bodyLaneW, tailH, 4);
    } else {
      ctx.rect(bodyX, yTail, bodyLaneW, tailH);
    }
    ctx.fill();
    ctx.stroke();

    // 2. Lateral Gold Flow Trim
    ctx.strokeStyle = dead ? 'rgba(71, 85, 105, 0.3)' : 'rgba(251, 191, 36, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(bodyX + 3, yTail);
    ctx.lineTo(bodyX + 3, headTopY);
    ctx.moveTo(bodyX + bodyLaneW - 3, yTail);
    ctx.lineTo(bodyX + bodyLaneW - 3, headTopY);
    ctx.stroke();

    // 3. Central Luminous Aero Wind Cord
    if (!dead) {
      // Soft Aero breeze halo
      ctx.strokeStyle = pal.glow;
      ctx.lineWidth = Math.min(12, hw * 0.75);
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();

      // Radiant turquoise core
      ctx.strokeStyle = pal.aero;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();

      // Pure white divine thread
      ctx.strokeStyle = pal.core;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. Subtle, Elegant Laurel Leaf Accents (Spaced 64px apart, minimal & uncluttered)
    const leafSpacing = 64;
    const startY = headTopY - 16;
    const endY = yTail + 16;

    if (startY > endY) {
      const numLeaves = Math.max(1, Math.floor((startY - endY) / leafSpacing));
      const effectiveSpacing = (startY - endY) / numLeaves;

      for (let i = 0; i <= numLeaves; i++) {
        const ly = startY - i * effectiveSpacing;
        // Subtle micro gold laurel notch
        ctx.strokeStyle = dead ? 'rgba(71, 85, 105, 0.4)' : pal.gold;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(cx - 3, ly);
        ctx.lineTo(cx - hw * 0.65, ly - 4);
        ctx.moveTo(cx + 3, ly);
        ctx.lineTo(cx + hw * 0.65, ly - 4);
        ctx.stroke();

        // Azure bead node
        ctx.fillStyle = dead ? '#475569' : pal.aero;
        ctx.beginPath();
        ctx.arc(cx, ly, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Holding divine light pulses rushing down the silk
      if (holding && !dead) {
        const pulseOffset = ((now || 0) * 0.22) % effectiveSpacing;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i <= numLeaves; i++) {
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
   * Terminal Crescent Oracle Talisman Tail Tip (Clean, sharp, non-cluttered)
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
    const baseTailLen = Math.min(26, Math.round(headH * 0.44));
    const tailLen = Math.min(baseTailLen, maxSafeTailLen);

    if (tailLen <= 5) return;

    const tipY = yTail - tailLen;
    ctx.save();

    // 1. Sleek Divine Laurel / Feather Arrow
    ctx.fillStyle = dead ? '#1e293b' : pal.track;
    ctx.strokeStyle = dead ? '#475569' : pal.gold;
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

    // Center divine line
    ctx.strokeStyle = dead ? '#64748b' : pal.core;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx, yTail);
    ctx.lineTo(cx, tipY);
    ctx.stroke();

    // 2. Compact Golden Crescent Moon Accent
    const orbY = yTail - tailLen * 0.38;
    if (!dead) {
      ctx.fillStyle = pal.gold;
      ctx.beginPath();
      ctx.arc(cx, orbY, 4.5, -Math.PI * 0.55, Math.PI * 0.55);
      ctx.arc(cx - 1.5, orbY, 3.4, Math.PI * 0.55, -Math.PI * 0.55, true);
      ctx.closePath();
      ctx.fill();

      // Micro azure jewel center
      ctx.fillStyle = pal.aero;
      ctx.beginPath();
      ctx.arc(cx + 0.5, orbY, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  _atm: null,
  _frameCount: 0,

  /**
   * Revamped Atmosphere for Iuno Theme:
   * Tetragon Temple of Septimont & Lunar Aero Sanctuary:
   * Ancient temple colonnade silhouettes with golden engravings, luminous celestial crescent moon
   * with misty lunar halo, flowing Aero wind currents, and fluttering golden oracle dust.
   */
  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const W = (typeof State !== 'undefined' && State && typeof State.gameWidth === 'number' && State.gameWidth > 0)
      ? State.gameWidth
      : (ctx.canvas?.clientWidth || (ctx.canvas ? ctx.canvas.width / (window.devicePixelRatio || 1) : 400));
    const H = (typeof State !== 'undefined' && State && typeof State.gameHeight === 'number' && State.gameHeight > 0)
      ? State.gameHeight
      : (ctx.canvas?.clientHeight || (ctx.canvas ? ctx.canvas.height / (window.devicePixelRatio || 1) : 700));
    const t = (typeof songTime === 'number' && !isNaN(songTime)) ? songTime * 0.001 : ((State?.songTime || 0) * 0.001);
    const isMobile = State ? State.isMobile : false;
    const bass = (typeof State !== 'undefined' && typeof State?.bgPulse === 'number' && !isNaN(State.bgPulse)) ? State.bgPulse : 0;

    ctx.save();

    // 1. Tetragon Temple Colonnade Silhouettes on Horizon
    const templeBaseY = H * 0.58;
    const colCount = 6;
    const colSpacing = W / (colCount - 1);

    // Temple pediment / lintel beam
    ctx.fillStyle = 'rgba(10, 20, 42, 0.85)';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.fillRect(0, templeBaseY - 18, W, 10);
    ctx.strokeRect(0, templeBaseY - 18, W, 10);

    // Temple fluted pillars
    for (let c = 0; c < colCount; c++) {
      const colX = c * colSpacing;
      ctx.fillRect(colX - 8, templeBaseY - 8, 16, H - templeBaseY + 8);
      ctx.strokeRect(colX - 8, templeBaseY - 8, 16, H - templeBaseY + 8);

      // Gold capital trim atop pillar
      ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
      ctx.fillRect(colX - 11, templeBaseY - 10, 22, 3);
      ctx.fillStyle = 'rgba(10, 20, 42, 0.85)';
    }

    // 2. Luminous Celestial Crescent Moon in Deep Parallax Sky
    const moonCX = W * 0.70;
    const moonCY = H * 0.18;
    const moonR = Math.min(W * 0.12, 42);

    // Outer ethereal lunar halo (expanding with bass)
    const moonHalo = ctx.createRadialGradient(moonCX, moonCY, moonR * 0.8, moonCX, moonCY, moonR * 2.2 * (1 + bass * 0.3));
    moonHalo.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    moonHalo.addColorStop(0.4, 'rgba(251, 191, 36, 0.15)');
    moonHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonHalo;
    ctx.beginPath();
    ctx.arc(moonCX, moonCY, moonR * 2.2 * (1 + bass * 0.3), 0, Math.PI * 2);
    ctx.fill();

    // Radiant Gold & Azure Crescent Moon
    ctx.save();
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(moonCX, moonCY, moonR, -Math.PI * 0.55, Math.PI * 0.55);
    ctx.arc(moonCX - moonR * 0.45, moonCY, moonR * 0.82, Math.PI * 0.55, -Math.PI * 0.55, true);
    ctx.closePath();
    ctx.fill();

    // Lunar star sparkle at the tip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(moonCX, moonCY - moonR, 2.2, 0, Math.PI * 2);
    ctx.arc(moonCX, moonCY + moonR, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Swirling Aero Wind Currents
    const streamCount = isMobile ? 4 : 7;
    const streamStep = isMobile ? 12 : 6;
    ctx.lineWidth = 1.3;
    for (let s = 0; s < streamCount; s++) {
      const sy = H * (0.12 + s * (0.75 / streamCount));
      const speed = 0.3 + (s % 3) * 0.15;
      const amp = (8 + (s % 4) * 6) * (1 + bass * 0.6);
      const phase = s * 1.2;

      ctx.strokeStyle = (s % 2 === 0) ? 'rgba(56, 189, 248, 0.28)' : 'rgba(45, 212, 191, 0.22)';
      ctx.beginPath();
      let first = true;
      for (let px = 0; px <= W; px += streamStep) {
        const waveY = sy + Math.sin((px / W * 3.5 + t * speed + phase) * Math.PI) * amp;
        if (first) { ctx.moveTo(px, waveY); first = false; }
        else ctx.lineTo(px, waveY);
      }
      ctx.stroke();
    }

    // 4. Fluttering Golden Oracle Dust & Laurel Leaves
    if (!this._atm || this._atm._W !== W || this._atm._H !== H) {
      this._atm = {
        _W: W, _H: H,
        motes: Array.from({ length: 32 }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.9 + Math.random() * 1.6,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(0.2 + Math.random() * 0.5),
          phase: Math.random() * Math.PI * 2,
          isGold: Math.random() > 0.45
        }))
      };
    }

    const motes = this._atm.motes;
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.x += m.vx * warpMult;
      m.y += m.vy * warpMult * speedBoost;
      if (m.y < 0) { m.y = H; m.x = Math.random() * W; }
      if (m.x < 0) m.x = W;
      if (m.x > W) m.x = 0;

      const twinkle = Math.sin(t * 2.0 + m.phase) * 0.3 + 0.7;
      ctx.fillStyle = m.isGold ? '#fbbf24' : '#7dd3fc';
      ctx.globalAlpha = (0.35 + bass * 0.3) * twinkle;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
};
