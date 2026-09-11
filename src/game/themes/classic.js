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

  /**
   * Unique Atmosphere for Classic Theme:
   * 3D Perspective Synthwave / Matrix Cyber Grid at the bottom + Digital Equalizer bars on borders.
   * ZERO falling particles!
   */
  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const gw = State.gameWidth || 400;
    const gh = State.gameHeight || 700;
    const isLight = document.body.getAttribute('data-theme') === 'light';

    ctx.save();

    // 1. 3D Perspective Cyber Grid Horizon in the lower half of the playfield
    const horizonY = gh * 0.62;
    const gridBottomY = gh;
    const gridH = gridBottomY - horizonY;

    if (gridH > 20) {
      ctx.save();
      // Clip to lower grid area
      ctx.beginPath();
      ctx.rect(0, horizonY - 1, gw, gridH + 2);
      ctx.clip();

      // Soft cyan / purple cyber fog at horizon
      const fogGrad = ctx.createLinearGradient(0, horizonY, 0, horizonY + gridH * 0.4);
      fogGrad.addColorStop(0, isLight ? 'rgba(56, 189, 248, 0.22)' : 'rgba(56, 189, 248, 0.18)');
      fogGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fogGrad;
      ctx.fillRect(0, horizonY, gw, gridH * 0.4);

      // Horizontal perspective grid lines (spaced exponentially toward viewer)
      const lineCount = 7;
      const gridScroll = (songTime * 0.0012 * warpMult * speedBoost) % 1.0;
      ctx.lineWidth = 1;
      
      for (let i = 0; i < lineCount; i++) {
        const norm = (i + gridScroll) / lineCount;
        const curve = Math.pow(norm, 2.2); // Exponential perspective spacing
        const ly = horizonY + curve * gridH;
        const lineAlpha = curve * (isLight ? 0.25 : 0.30);

        ctx.strokeStyle = isLight ? `rgba(2, 132, 199, ${lineAlpha})` : `rgba(56, 189, 248, ${lineAlpha})`;
        ctx.beginPath();
        ctx.moveTo(0, ly);
        ctx.lineTo(gw, ly);
        ctx.stroke();
      }

      // Vanishing perspective lines fanning out from horizon center
      const vanishingX = gw / 2;
      const vLineCount = 10;
      for (let v = 0; v <= vLineCount; v++) {
        const bottomX = (gw / vLineCount) * v;
        const vAlpha = isLight ? 0.14 : 0.18;
        ctx.strokeStyle = isLight ? `rgba(2, 132, 199, ${vAlpha})` : `rgba(56, 189, 248, ${vAlpha})`;
        ctx.beginPath();
        ctx.moveTo(vanishingX, horizonY);
        ctx.lineTo(bottomX, gridBottomY);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Digital Audio Equalizer meters on the left and right margins of the screen
    const barCount = 5;
    const barW = 5;
    const barSpacing = 7;
    const eqBaseY = horizonY - 10;
    const pulse = State.bgPulse || 0;

    for (let b = 0; b < barCount; b++) {
      const wave = Math.sin(songTime * 0.006 + b * 0.9) * 0.5 + 0.5;
      const barH = Math.max(6, 12 + wave * 22 + pulse * 18);
      const bAlpha = (isLight ? 0.22 : 0.28) + (b / barCount) * 0.15;
      const col = isLight ? `rgba(2, 132, 199, ${bAlpha})` : `rgba(56, 189, 248, ${bAlpha})`;
      
      ctx.fillStyle = col;
      // Left margin equalizer
      const lx = 8 + b * barSpacing;
      ctx.fillRect(lx, eqBaseY - barH, barW, barH);

      // Right margin equalizer
      const rx = gw - 8 - (b + 1) * barSpacing;
      ctx.fillRect(rx, eqBaseY - barH, barW, barH);
    }

    // 3. Subtle horizontal cyber scanline sweep
    const scanY = (songTime * 0.15) % gh;
    const scanAlpha = isLight ? 0.08 : 0.12;
    ctx.strokeStyle = isLight ? `rgba(2, 132, 199, ${scanAlpha})` : `rgba(56, 189, 248, ${scanAlpha})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, scanY);
    ctx.lineTo(gw, scanY);
    ctx.stroke();

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
