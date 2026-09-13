// ==========================================
// COSMIC GALAXY THEME MODULE (Deep Space Nebula & Planetary Orbits)
// ==========================================

export const COSMIC_THEME = {
  id: 'cosmic',
  nameKey: 'themeCosmic',
  descKey: 'themeCosmicDesc',
  badgeKey: 'themeCosmicBadge',
  price: 60,
  unlockedByDefault: false,
  accentColor: '#818cf8',
  previewBg: 'linear-gradient(135deg, #07192f, #1e1b4b, #312e81)',
  colors: {
    bgCenter: '#0d2242',
    bgMid: '#09152b',
    bgOuter: '#020712',
    bgAura: 'rgba(99, 102, 241, 0.18)',
    strings: ['#e0e7ff', '#a5b4fc', '#818cf8', '#6366f1'],
    stringGlow: 'rgba(99, 102, 241, 0.5)',
    receptorBorder: 'rgba(99, 102, 241, 0.5)',
    particleType: 'starburst'
  },
  comboTiers: [
    { min: 0, max: 49, name: 'deep_nebula', border: 'rgba(99, 102, 241, 0.55)', glow: 'rgba(79, 70, 229, 0.4)', particleColors: ['#818cf8', '#a5b4fc', '#e0e7ff'] },
    { min: 50, max: 99, name: 'andromeda_blue', border: 'rgba(56, 189, 248, 0.75)', glow: 'rgba(14, 165, 233, 0.6)', particleColors: ['#38bdf8', '#7dd3fc', '#ffffff'] },
    { min: 100, max: 199, name: 'solar_flare', border: 'rgba(245, 158, 11, 0.85)', glow: 'rgba(217, 119, 6, 0.7)', particleColors: ['#f59e0b', '#fde047', '#ffffff'] },
    { min: 200, max: 399, name: 'supernova_pink', border: 'rgba(236, 72, 153, 0.9)', glow: 'rgba(190, 24, 93, 0.75)', particleColors: ['#ec4899', '#fbcfe8', '#ffffff'] },
    { min: 400, max: 799, name: 'hyper_cosmic', border: 'rgba(99, 102, 241, 0.95)', glow: 'rgba(67, 56, 202, 0.85)', particleColors: ['#6366f1', '#c7d2fe', '#ffffff'] },
    { min: 800, max: Infinity, name: 'singularity_stardust', border: 'rgba(34, 211, 238, 0.95)', glow: 'rgba(99, 102, 241, 0.9)', particleColors: ['#22d3ee', '#818cf8', '#ffffff'] }
  ],

  getTier(combo) {
    const tiers = this.comboTiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (combo >= tiers[i].min) return tiers[i];
    }
    return tiers[0];
  },

  /**
   * Custom note decoration for Cosmic theme:
   * Celestial astral orb with pulsing orbit rings and planetary starlight core.
   */
  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    ctx.save();
    const cx = x + w / 2;
    const cy = yTop + h / 2;

    // Outer elliptical orbit ring
    ctx.strokeStyle = isLight ? 'rgba(79, 70, 229, 0.7)' : (comboTier?.border || '#a5b4fc');
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.max(14, w * 0.36), Math.max(5, h * 0.32), -0.25, 0, Math.PI * 2);
    ctx.stroke();

    // Central astral starlight orb
    const orbGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, 5);
    orbGrad.addColorStop(0, '#ffffff');
    orbGrad.addColorStop(0.5, isLight ? '#6366f1' : '#818cf8');
    orbGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    // Small orbiting satellite node
    const orbitAngle = Date.now() * 0.003;
    const satX = cx + Math.cos(orbitAngle) * (w * 0.34);
    const satY = cy + Math.sin(orbitAngle) * (h * 0.28);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(satX, satY, 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  /**
   * Custom receptor for Cosmic theme:
   * Planetary orbital ring receptor with satellite nodes.
   */
  drawReceptor(ctx, x, y, w, h, isActive, isLight) {
    ctx.save();
    const radius = 10;
    const col = isActive 
      ? (isLight ? '#4f46e5' : '#818cf8') 
      : (isLight ? 'rgba(79, 70, 229, 0.35)' : 'rgba(99, 102, 241, 0.3)');

    ctx.strokeStyle = col;
    ctx.lineWidth = isActive ? 2.2 : 1.2;
    const isMob = (typeof window !== 'undefined' && (window.innerWidth <= 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1)));
    if (isActive && !isLight && !isMob) {
      ctx.shadowColor = '#6366f1';
      ctx.shadowBlur = 12;
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

    // Orbit ring satellite dots on left & right edge
    ctx.fillStyle = isActive ? '#ffffff' : col;
    ctx.beginPath();
    ctx.arc(x + 4, y + h / 2, 2.2, 0, Math.PI * 2);
    ctx.arc(x + w - 4, y + h / 2, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  /**
   * Unique Note Tap Hit Animation for Cosmic Theme:
   * Supernova Planetary Singularity:
   * Miniature starlight singularity core that bursts into twin tilted 3D elliptical
   * planetary rings with rotating 4-pointed celestial starburst spikes and orbital stardust.
   */
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now) {
    const easeOut = 1 - Math.pow(1 - p, 3);
    const alpha = Math.max(0, 1.0 - Math.pow(p, 1.3));
    if (alpha <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const colIndigo = isPerfect ? 'rgba(129, 140, 248,' : 'rgba(99, 102, 241,';
    const colCyan = isPerfect ? 'rgba(56, 189, 248,' : 'rgba(14, 165, 233,';
    const colWhite = isPerfect ? 'rgba(255, 255, 255,' : 'rgba(224, 231, 255,';

    // 1. Twin Tilted Planetary Orbit Rings (expanding in 3D perspective)
    const ringMajor = (w * 0.22) + easeOut * (w * 0.46);
    const ringMinor = ringMajor * 0.42;
    const ringTilt1 = -0.32;
    const ringTilt2 = 0.38;

    ctx.lineWidth = Math.max(1, 2.2 * (1.0 - p));
    ctx.strokeStyle = `${colIndigo} ${alpha * 0.85})`;

    // Primary planetary ring
    ctx.beginPath();
    ctx.ellipse(cx, cy, ringMajor, ringMinor, ringTilt1, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary equatorial ring
    if (p < 0.8) {
      const ring2Alpha = (1.0 - p / 0.8) * 0.65;
      ctx.lineWidth = Math.max(0.8, 1.5 * (1.0 - p));
      ctx.strokeStyle = `${colCyan} ${ring2Alpha})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, ringMajor * 0.82, ringMinor * 0.9, ringTilt2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Rotating 4-Point Celestial Starburst Lens Flare
    if (p < 0.65) {
      const starP = p / 0.65;
      const rayLen = (w * 0.25) + Math.pow(starP, 0.6) * (w * 0.38);
      const starAlpha = (1.0 - starP) * 0.9;
      const starRot = (now * 0.002) + starP * 0.5;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(starRot);

      // 4-pointed radiant flare spikes
      ctx.lineWidth = Math.max(0.8, 2.5 * (1.0 - starP));
      ctx.strokeStyle = `${colWhite} ${starAlpha})`;
      ctx.beginPath();
      ctx.moveTo(-rayLen, 0); ctx.lineTo(rayLen, 0);
      ctx.moveTo(0, -rayLen); ctx.lineTo(0, rayLen);
      ctx.stroke();

      // Soft diagonal secondary rays
      ctx.lineWidth = Math.max(0.6, 1.2 * (1.0 - starP));
      ctx.strokeStyle = `${colCyan} ${starAlpha * 0.6})`;
      const diagLen = rayLen * 0.55;
      ctx.beginPath();
      ctx.moveTo(-diagLen, -diagLen); ctx.lineTo(diagLen, diagLen);
      ctx.moveTo(-diagLen, diagLen); ctx.lineTo(diagLen, -diagLen);
      ctx.stroke();

      ctx.restore();
    }

    // 3. Orbiting Planetary Nodes (Stardust nodes along the orbit)
    if (p < 0.6) {
      const nodeAlpha = (1.0 - p / 0.6);
      const nodeAng1 = (now * 0.004);
      const nodeAng2 = nodeAng1 + Math.PI;

      const cos1 = Math.cos(nodeAng1); const sin1 = Math.sin(nodeAng1);
      const nx1 = cx + (cos1 * ringMajor * Math.cos(ringTilt1) - sin1 * ringMinor * Math.sin(ringTilt1));
      const ny1 = cy + (cos1 * ringMajor * Math.sin(ringTilt1) + sin1 * ringMinor * Math.cos(ringTilt1));

      const cos2 = Math.cos(nodeAng2); const sin2 = Math.sin(nodeAng2);
      const nx2 = cx + (cos2 * ringMajor * Math.cos(ringTilt1) - sin2 * ringMinor * Math.sin(ringTilt1));
      const ny2 = cy + (cos2 * ringMajor * Math.sin(ringTilt1) + sin2 * ringMinor * Math.cos(ringTilt1));

      ctx.fillStyle = `${colWhite} ${nodeAlpha})`;
      ctx.beginPath();
      ctx.arc(nx1, ny1, 2.2, 0, Math.PI * 2);
      ctx.arc(nx2, ny2, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Central Singularity Core
    if (p < 0.4) {
      const coreR = Math.max(2, 7 * (1.0 - p / 0.4));
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  // Helper palette resolver for Cosmic Galaxy
  _getPalette(combo = 0, isDead = false) {
    if (isDead) {
      return {
        border: '#475569', core: '#94a3b8', glow: 'rgba(71, 85, 105, 0.3)',
        track: 'rgba(15, 23, 42, 0.65)', star: '#64748b', nebula: '#334155'
      };
    }
    const tier = (typeof combo === 'number') ? combo : 0;
    if (tier >= 800) {
      return {
        border: '#22d3ee', core: '#ffffff', glow: 'rgba(34, 211, 238, 0.85)',
        track: 'rgba(4, 30, 48, 0.75)', star: '#a5f3fc', nebula: '#06b6d4'
      };
    }
    if (tier >= 400) {
      return {
        border: '#6366f1', core: '#ffffff', glow: 'rgba(99, 102, 241, 0.80)',
        track: 'rgba(15, 20, 56, 0.75)', star: '#c7d2fe', nebula: '#818cf8'
      };
    }
    if (tier >= 200) {
      return {
        border: '#ec4899', core: '#ffffff', glow: 'rgba(236, 72, 153, 0.80)',
        track: 'rgba(38, 8, 30, 0.75)', star: '#fbcfe8', nebula: '#f472b6'
      };
    }
    if (tier >= 100) {
      return {
        border: '#f59e0b', core: '#ffffff', glow: 'rgba(245, 158, 11, 0.75)',
        track: 'rgba(42, 24, 6, 0.75)', star: '#fde047', nebula: '#fbbf24'
      };
    }
    if (tier >= 50) {
      return {
        border: '#38bdf8', core: '#ffffff', glow: 'rgba(56, 189, 248, 0.70)',
        track: 'rgba(6, 26, 46, 0.75)', star: '#bae6fd', nebula: '#0ea5e9'
      };
    }
    return {
      border: '#818cf8', core: '#ffffff', glow: 'rgba(99, 102, 241, 0.60)',
      track: 'rgba(10, 16, 42, 0.70)', star: '#e0e7ff', nebula: '#6366f1'
    };
  },

  /**
   * Neck junction collar for Cosmic theme (locking comet stream into note head)
   */
  drawNeck(ctx, x, actualYHeadTop, w, headH, tile, isLight, combo = 0) {
    const dead = Boolean(tile && (tile.released || tile.failed));
    const pal = this._getPalette(dead ? 0 : combo, dead);
    const bodyW = Math.max(10, Math.round(w - 16));
    const cx = Math.round(x + 8 + bodyW / 2);
    const collarH = Math.max(4, Math.round(headH * 0.20));
    const collarW = Math.round(bodyW * 0.72);

    ctx.save();
    // Sleek planetary gravitational ring collar
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, actualYHeadTop - collarH * 0.35, collarW / 2, collarH * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Twin satellite beads
    ctx.fillStyle = pal.core;
    ctx.beginPath();
    ctx.arc(cx - collarW * 0.40, actualYHeadTop - collarH * 0.35, 1.3, 0, Math.PI * 2);
    ctx.arc(cx + collarW * 0.40, actualYHeadTop - collarH * 0.35, 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  /**
   * Procedural Hold Body: Sleek Astral Starlight Comet Stream (Clean, minimal, high readability)
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

    // 1. Sleek Deep Space Nebula Track Foundation
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

    // 2. Lateral Stardust Guides
    ctx.strokeStyle = dead ? 'rgba(71, 85, 105, 0.3)' : 'rgba(99, 102, 241, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(bodyX + 3, yTail);
    ctx.lineTo(bodyX + 3, headTopY);
    ctx.moveTo(bodyX + bodyLaneW - 3, yTail);
    ctx.lineTo(bodyX + bodyLaneW - 3, headTopY);
    ctx.stroke();

    // 3. Central Luminous Starlight Singularity Core
    if (!dead) {
      // Soft ambient nebula halo
      ctx.strokeStyle = pal.glow;
      ctx.lineWidth = Math.min(12, hw * 0.75);
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();

      // Colored nebula ray
      ctx.strokeStyle = pal.nebula;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();

      // Pure white singularity starlight thread
      ctx.strokeStyle = pal.core;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 4. Subtle, Elegant Constellation Stars (Spaced 64px apart, minimal & uncluttered)
    const starSpacing = 64;
    const startY = headTopY - 16;
    const endY = yTail + 16;

    if (startY > endY) {
      const numStars = Math.max(1, Math.floor((startY - endY) / starSpacing));
      const effectiveSpacing = (startY - endY) / numStars;

      for (let i = 0; i <= numStars; i++) {
        const sy = startY - i * effectiveSpacing;
        // Subtle micro diamond star
        ctx.fillStyle = dead ? '#475569' : pal.star;
        ctx.beginPath();
        ctx.moveTo(cx, sy - 2.5);
        ctx.lineTo(cx + 2.0, sy);
        ctx.lineTo(cx, sy + 2.5);
        ctx.lineTo(cx - 2.0, sy);
        ctx.closePath();
        ctx.fill();
      }

      // 5. Holding energetic starlight pulse rushing down the ribbon
      if (holding && !dead) {
        const pulseOffset = ((now || 0) * 0.22) % effectiveSpacing;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i <= numStars; i++) {
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
   * Terminal Nova Star Needle Tail Tip (Clean, sharp, non-cluttered)
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

    // 1. Sleek Singularity Spear Needle
    ctx.fillStyle = dead ? '#1e293b' : pal.track;
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

    // Starlight center spine
    ctx.strokeStyle = dead ? '#64748b' : pal.core;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx, yTail);
    ctx.lineTo(cx, tipY);
    ctx.stroke();

    // 2. Compact 4-Pointed Nova Star Accent
    const starY = yTail - tailLen * 0.38;
    if (!dead) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, starY - 3.5);
      ctx.lineTo(cx + 1.2, starY - 1.2);
      ctx.lineTo(cx + 3.5, starY);
      ctx.lineTo(cx + 1.2, starY + 1.2);
      ctx.lineTo(cx, starY + 3.5);
      ctx.lineTo(cx - 1.2, starY + 1.2);
      ctx.lineTo(cx - 3.5, starY);
      ctx.lineTo(cx - 1.2, starY - 1.2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  },

  /**
   * Revamped Atmosphere for Cosmic Theme:
   * Interstellar Void, Ringed Exoplanet & Volumetric Nebula:
   * Multi-layer volumetric nebular clouds reacting to bass, distant ringed gas giant in deep parallax,
   * twinkling multi-spectral star clusters, and revolving 12-node zodiac constellation map.
   */
  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const gw = ctx.canvas?.width || State?.gameWidth || 400;
    const gh = ctx.canvas?.height || State?.gameHeight || 700;
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const t = (typeof songTime === 'number' && !isNaN(songTime)) ? songTime : (State?.songTime || 0);
    const bass = (typeof State !== 'undefined' && typeof State?.bgPulse === 'number' && !isNaN(State.bgPulse)) ? State.bgPulse : 0;

    ctx.save();

    // 1. Distant Ringed Gas Giant Planet in Deep Space (Parallax Background)
    const planetCX = gw * 0.82;
    const planetCY = gh * 0.24;
    const planetR = Math.min(gw * 0.16, 52);

    // Planet body with atmospheric shadow / terminator
    const pg = ctx.createRadialGradient(planetCX - planetR * 0.35, planetCY - planetR * 0.35, 2, planetCX, planetCY, planetR);
    pg.addColorStop(0, isLight ? '#818cf8' : '#6366f1');
    pg.addColorStop(0.65, isLight ? '#4f46e5' : '#312e81');
    pg.addColorStop(1, '#050a18');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(planetCX, planetCY, planetR, 0, Math.PI * 2);
    ctx.fill();

    // Planet outer atmosphere glow
    const pag = ctx.createRadialGradient(planetCX, planetCY, planetR * 0.9, planetCX, planetCY, planetR * 1.5);
    pag.addColorStop(0, isLight ? 'rgba(99, 102, 241, 0.25)' : 'rgba(56, 189, 248, 0.32)');
    pag.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = pag;
    ctx.beginPath();
    ctx.arc(planetCX, planetCY, planetR * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Celestial Planetary Rings (tilted ellipse)
    ctx.strokeStyle = isLight ? 'rgba(165, 180, 252, 0.45)' : 'rgba(199, 210, 254, 0.55)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(planetCX, planetCY, planetR * 2.2, planetR * 0.55, -0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = isLight ? 'rgba(99, 102, 241, 0.30)' : 'rgba(56, 189, 248, 0.38)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.ellipse(planetCX, planetCY, planetR * 2.6, planetR * 0.68, -0.45, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Volumetric Interstellar Nebula Clouds (pulsing to music bass)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const nebulaAlpha = (0.12 + bass * 0.15);

    // Deep cyan-indigo nebula cloud (top-left)
    const ng1 = ctx.createRadialGradient(gw * 0.2, gh * 0.3, 10, gw * 0.2, gh * 0.3, gw * 0.55);
    ng1.addColorStop(0, `rgba(56, 189, 248, ${nebulaAlpha * 1.1})`);
    ng1.addColorStop(0.5, `rgba(99, 102, 241, ${nebulaAlpha * 0.7})`);
    ng1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ng1;
    ctx.beginPath();
    ctx.arc(gw * 0.2, gh * 0.3, gw * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Ultraviolet-magenta nebula cloud (mid-bottom)
    const ng2 = ctx.createRadialGradient(gw * 0.65, gh * 0.62, 10, gw * 0.65, gh * 0.62, gw * 0.60);
    ng2.addColorStop(0, `rgba(236, 72, 153, ${nebulaAlpha * 0.9})`);
    ng2.addColorStop(0.5, `rgba(168, 85, 247, ${nebulaAlpha * 0.6})`);
    ng2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ng2;
    ctx.beginPath();
    ctx.arc(gw * 0.65, gh * 0.62, gw * 0.60, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Shimmering 12-Node Astral Constellation Map (slowly revolving)
    if (!State.themeCosmicStars || State.currentAtmosphereTheme !== 'cosmic') {
      State.currentAtmosphereTheme = 'cosmic';
      State.themeCosmicStars = [];

      // Multi-spectral stars (cyan, gold, lavender, white)
      for (let i = 0; i < 36; i++) {
        const starColors = ['#e0e7ff', '#7dd3fc', '#fef08a', '#fbcfe8', '#ffffff'];
        State.themeCosmicStars.push({
          x: Math.random() * gw,
          y: Math.random() * gh,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          size: Math.random() * 2.2 + 0.9,
          color: starColors[i % starColors.length],
          twinkleSpeed: Math.random() * 0.004 + 0.002,
          twinklePhase: Math.random() * Math.PI * 2,
          baseAlpha: Math.random() * 0.45 + 0.30
        });
      }

      // 12-node zodiac constellation map
      State.themeConstellation = [
        { nx: 0.22, ny: 0.22, conn: [1, 2] },
        { nx: 0.42, ny: 0.16, conn: [2, 3] },
        { nx: 0.35, ny: 0.36, conn: [4] },
        { nx: 0.68, ny: 0.20, conn: [5] },
        { nx: 0.52, ny: 0.48, conn: [5, 6] },
        { nx: 0.78, ny: 0.40, conn: [6, 7] },
        { nx: 0.62, ny: 0.62, conn: [8] },
        { nx: 0.85, ny: 0.58, conn: [8, 9] },
        { nx: 0.45, ny: 0.72, conn: [10] },
        { nx: 0.70, ny: 0.80, conn: [11] },
        { nx: 0.28, ny: 0.65, conn: [11] },
        { nx: 0.38, ny: 0.85, conn: [] }
      ];
    }

    const constel = State.themeConstellation;
    const rotSpeed = songTime * 0.00015;
    const ccx = gw * 0.50;
    const ccy = gh * 0.42;
    const cRadius = Math.min(gw, gh) * 0.44;

    if (!State._computedNodes || State._computedNodes.length !== constel.length) {
      State._computedNodes = constel.map(node => ({ x: 0, y: 0, conn: node.conn }));
    }
    const computedNodes = State._computedNodes;
    const cosR = Math.cos(rotSpeed);
    const sinR = Math.sin(rotSpeed);
    for (let i = 0; i < constel.length; i++) {
      const node = constel[i];
      const dx = (node.nx - 0.5) * cRadius;
      const dy = (node.ny - 0.4) * cRadius;
      computedNodes[i].x = ccx + (dx * cosR - dy * sinR);
      computedNodes[i].y = ccy + (dx * sinR + dy * cosR);
      computedNodes[i].conn = node.conn;
    }

    const constelAlpha = isLight ? 0.14 : (0.20 + bass * 0.12);
    ctx.strokeStyle = isLight ? `rgba(79, 70, 229, ${constelAlpha})` : `rgba(129, 140, 248, ${constelAlpha})`;
    ctx.lineWidth = 1.0;

    // Draw constellation lines
    ctx.beginPath();
    for (let i = 0; i < computedNodes.length; i++) {
      const src = computedNodes[i];
      for (const targetIdx of src.conn) {
        if (targetIdx < computedNodes.length) {
          const dst = computedNodes[targetIdx];
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(dst.x, dst.y);
        }
      }
    }
    ctx.stroke();

    // Draw constellation star nodes
    for (let i = 0; i < computedNodes.length; i++) {
      const node = computedNodes[i];
      const twinkle = Math.sin(songTime * 0.003 + i) * 0.35 + 0.65;
      ctx.fillStyle = isLight ? '#4f46e5' : '#ffffff';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2.5 * twinkle, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Parallax Twinkling Deep Stars
    const stars = State.themeCosmicStars;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.x += s.vx * warpMult * speedBoost;
      s.y += s.vy * warpMult * speedBoost;

      if (s.x < 0) s.x = gw;
      if (s.x > gw) s.x = 0;
      if (s.y < 0) s.y = gh;
      if (s.y > gh) s.y = 0;

      const twinkle = Math.sin(songTime * s.twinkleSpeed + s.twinklePhase) * 0.35 + 0.65;
      const alpha = s.baseAlpha * twinkle * (0.8 + bass * 0.4);

      ctx.fillStyle = s.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  /**
   * Custom Particle renderer for Cosmic Theme:
   * 4-pointed radiant starburst crystals and glowing stardust orbs.
   */
  drawParticle(ctx, pt, life) {
    const rOuter = Math.max(2, (pt.size || 5) * life + 1);
    const rInner = rOuter * 0.3;
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.beginPath();
    for (let a = 0; a < 4; a++) {
      const ang = pt.angle + (a * Math.PI / 2);
      const angMid = ang + Math.PI / 4;
      ctx.lineTo(Math.cos(ang) * rOuter, Math.sin(ang) * rOuter);
      ctx.lineTo(Math.cos(angMid) * rInner, Math.sin(angMid) * rInner);
    }
    ctx.closePath();
    ctx.fill();

    // Center star twinkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.6, rOuter * 0.22), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};
