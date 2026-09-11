// ==========================================
// PHROLOVA THEME MODULE (Wuthering Waves - Lycoris & Soundweave Resonator)
// ==========================================

export const PHROLOVA_THEME = {
  id: 'phrolova',
  nameKey: 'themePhrolova',
  descKey: 'themePhrolovaDesc',
  badgeKey: 'themePhrolovaBadge',
  price: 10,
  unlockedByDefault: false,
  accentColor: '#e11d48',
  previewBg: 'linear-gradient(135deg, #2a0812, #4c0519, #881337)',
  colors: {
    bgCenter: '#2a0812',
    bgMid: '#16040a',
    bgOuter: '#080204',
    bgAura: 'rgba(225, 29, 72, 0.18)',
    strings: ['#fecdd3', '#fda4af', '#f43f5e', '#e11d48'],
    stringGlow: 'rgba(225, 29, 72, 0.5)',
    receptorBorder: 'rgba(225, 29, 72, 0.5)',
    particleType: 'petal'
  },
  comboTiers: [
    { min: 0, max: 49, name: 'crimson_rose', border: 'rgba(244, 63, 94, 0.55)', glow: 'rgba(225, 29, 72, 0.4)', particleColors: ['#f43f5e', '#fda4af', '#e11d48'] },
    { min: 50, max: 99, name: 'blood_velvet', border: 'rgba(225, 29, 72, 0.75)', glow: 'rgba(190, 18, 60, 0.6)', particleColors: ['#e11d48', '#fb7185', '#ffe4e6'] },
    { min: 100, max: 199, name: 'rose_gold', border: 'rgba(251, 146, 60, 0.85)', glow: 'rgba(225, 29, 72, 0.7)', particleColors: ['#fb923c', '#fda4af', '#fff1f2'] },
    { min: 200, max: 399, name: 'fiery_carnation', border: 'rgba(249, 115, 22, 0.9)', glow: 'rgba(234, 88, 12, 0.75)', particleColors: ['#f97316', '#fed7aa', '#ffffff'] },
    { min: 400, max: 799, name: 'royal_vermilion', border: 'rgba(255, 77, 109, 0.95)', glow: 'rgba(225, 29, 72, 0.85)', particleColors: ['#ff4d6d', '#ff758f', '#fff0f3'] },
    { min: 800, max: Infinity, name: 'celestial_lily', border: 'rgba(255, 215, 0, 0.95)', glow: 'rgba(225, 29, 72, 0.9)', particleColors: ['#ffd700', '#ff0054', '#ffffff'] }
  ],

  getTier(combo) {
    const tiers = this.comboTiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (combo >= tiers[i].min) return tiers[i];
    }
    return tiers[0];
  },

  /**
   * Custom note decoration for Phrolova theme:
   * Elegant lacquered crimson body with golden/rose Lycoris (spider lily) filigree crest.
   */
  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    ctx.save();
    const cx = x + w / 2;
    const cy = yTop + h / 2;

    // Golden spider lily petal crest in center
    ctx.strokeStyle = isLight ? 'rgba(225, 29, 72, 0.8)' : (comboTier?.border || '#fda4af');
    ctx.lineWidth = 1.3;
    ctx.fillStyle = isLight ? 'rgba(225, 29, 72, 0.2)' : 'rgba(244, 63, 94, 0.25)';

    // Center petal
    ctx.beginPath();
    ctx.ellipse(cx, cy, 3, Math.max(5, h * 0.35), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Side curved petal arms (Spider Lily tendrils)
    const span = Math.max(10, w * 0.28);
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy);
    ctx.quadraticCurveTo(cx - span * 0.6, cy - h * 0.3, cx - span, cy);
    ctx.quadraticCurveTo(cx - span * 0.6, cy + h * 0.3, cx - 3, cy);
    ctx.moveTo(cx + 3, cy);
    ctx.quadraticCurveTo(cx + span * 0.6, cy - h * 0.3, cx + span, cy);
    ctx.quadraticCurveTo(cx + span * 0.6, cy + h * 0.3, cx + 3, cy);
    ctx.stroke();

    // Central jewel dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  /**
   * Custom receptor for Phrolova theme:
   * Ornate sound resonator ring with lycoris petal filigree tips.
   */
  drawReceptor(ctx, x, y, w, h, isActive, isLight) {
    ctx.save();
    const radius = 9;
    const col = isActive 
      ? (isLight ? '#e11d48' : '#f43f5e') 
      : (isLight ? 'rgba(225, 29, 72, 0.35)' : 'rgba(225, 29, 72, 0.3)');

    ctx.strokeStyle = col;
    ctx.lineWidth = isActive ? 2.2 : 1.2;
    const isMob = (typeof window !== 'undefined' && (window.innerWidth <= 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1)));
    if (isActive && !isLight && !isMob) {
      ctx.shadowColor = '#e11d48';
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

    // Floral tip accents on receptor
    const cx = x + w / 2;
    ctx.fillStyle = isActive ? '#ffffff' : col;
    ctx.beginPath();
    ctx.arc(cx, y + 2, 2, 0, Math.PI * 2);
    ctx.arc(cx, y + h - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  /**
   * Unique Note Tap Hit Animation for Phrolova Theme:
   * Spider Lily Blooming Petal Burst: 6 curved crimson-rose petals unfurling in a circular flower bloom
   * with delicate golden-rose stamen tendrils and acoustic soundwave resonance ripples.
   */
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now) {
    const easeOut = 1 - Math.pow(1 - p, 3);
    const alpha = Math.max(0, 1.0 - Math.pow(p, 1.3));
    if (alpha <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const colPetal = isPerfect 
      ? (isLight ? '#e11d48' : '#f43f5e') 
      : (isLight ? '#be123c' : '#e11d48');
    const colGlow = isPerfect ? 'rgba(254, 205, 211,' : 'rgba(244, 63, 94,';
    const colGold = isPerfect ? 'rgba(253, 224, 71,' : 'rgba(251, 146, 60,';

    // 1. Acoustic Soundwave Resonance Ripples
    const rippleR = (w * 0.16) + easeOut * (w * 0.44);
    const rippleAlpha = Math.max(0, (1.0 - p) * 0.5);
    ctx.lineWidth = Math.max(1, 2.0 * (1.0 - p));
    ctx.strokeStyle = `${colGlow} ${rippleAlpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Spider Lily Bloom: 6 curved petals unfurling in radial symmetry
    const petalDist = (w * 0.1) + easeOut * (w * 0.38);
    const petalLen = Math.max(4, (w * 0.22) * (1.0 - p * 0.7));
    const petalW = Math.max(2, 5 * (1.0 - p * 0.6));
    const petalCount = 6;
    const baseRotation = (now * 0.001) + easeOut * 0.4;

    ctx.fillStyle = colPetal;
    ctx.strokeStyle = `${colGold} ${alpha * 0.9})`;
    ctx.lineWidth = 1;

    for (let i = 0; i < petalCount; i++) {
      const angle = baseRotation + (i * Math.PI * 2 / petalCount);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const px = cx + cosA * petalDist;
      const py = cy + sinA * petalDist;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle + Math.PI / 2);
      ctx.globalAlpha = alpha * 0.85;

      // Curved lycoris petal
      ctx.beginPath();
      ctx.moveTo(0, -petalLen);
      ctx.bezierCurveTo(petalW, -petalLen * 0.3, petalW * 0.6, petalLen * 0.6, 0, petalLen);
      ctx.bezierCurveTo(-petalW * 0.6, petalLen * 0.6, -petalW, -petalLen * 0.3, 0, -petalLen);
      ctx.fill();
      ctx.stroke();

      // Delicate curved stamen thread curling outward
      if (p < 0.6) {
        const stamenLen = petalLen * 1.35;
        const stamenAlpha = (1.0 - p / 0.6) * 0.8;
        ctx.strokeStyle = `${colGold} ${stamenAlpha})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(petalW * 1.6, -stamenLen * 0.5, petalW * 0.5, -stamenLen);
        ctx.stroke();

        // Stamen pollen tip
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(petalW * 0.5, -stamenLen, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 3. Central Ruby / Resonator Core Flash
    if (p < 0.4) {
      const coreP = p / 0.4;
      const coreR = Math.max(3, 8 * (1.0 - coreP));
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  /**
   * Unique Atmosphere for Phrolova Theme:
   * The ONLY theme with falling elements: gently swaying, wind-fluttering crimson Lycoris petals
   * and scarlet silk threads drifting downward with sinusoidal wind drift and acoustic wave ripples.
   */
  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    if (!State.themeAtmosphereParticles || State.currentAtmosphereTheme !== 'phrolova') {
      State.currentAtmosphereTheme = 'phrolova';
      State.themeAtmosphereParticles = [];
      const count = 26;
      for (let i = 0; i < count; i++) {
        State.themeAtmosphereParticles.push({
          x: Math.random() * (State.gameWidth || 400),
          y: Math.random() * (State.gameHeight || 700),
          size: Math.random() * 6 + 5,
          speedY: Math.random() * 1.4 + 0.8, // Falling downward
          speedX: (Math.random() - 0.5) * 0.6,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.035,
          swaySpeed: Math.random() * 0.0025 + 0.0015,
          swayOffset: Math.random() * 1000,
          alpha: Math.random() * 0.35 + 0.35,
          isThread: (i % 3 === 0)
        });
      }
    }

    const parts = State.themeAtmosphereParticles;
    const gw = State.gameWidth || 400;
    const gh = State.gameHeight || 700;

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.y += p.speedY * warpMult * speedBoost;
      p.rot += p.rotSpeed;
      const sway = Math.sin((songTime + p.swayOffset) * p.swaySpeed) * 0.8;
      p.x += (p.speedX + sway) * warpMult;

      if (p.y > gh + 20) {
        p.y = -20;
        p.x = Math.random() * gw;
      }
      if (p.x < -20) p.x = gw + 20;
      if (p.x > gw + 20) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;

      if (p.isThread) {
        // Curved scarlet resonance silk thread
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size);
        ctx.quadraticCurveTo(0, p.size * 0.5, p.size * 1.2, p.size);
        ctx.stroke();
      } else {
        // Falling spider lily petal
        ctx.fillStyle = (i % 2 === 0) ? '#e11d48' : '#be123c';
        const isMob = (typeof window !== 'undefined' && (window.innerWidth <= 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1)));
        if (!isMob) {
          ctx.shadowColor = 'rgba(225, 29, 72, 0.4)';
          ctx.shadowBlur = 4;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.3);
        ctx.bezierCurveTo(p.size * 0.45, -p.size * 0.4, p.size * 0.35, p.size * 0.7, 0, p.size * 1.3);
        ctx.bezierCurveTo(-p.size * 0.35, p.size * 0.7, -p.size * 0.45, -p.size * 0.4, 0, -p.size * 1.3);
        ctx.fill();
        ctx.strokeStyle = '#fda4af';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.0);
        ctx.lineTo(0, p.size * 1.0);
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  /**
   * Custom Particle renderer for Phrolova Theme:
   * Fluttering spider lily petals and curved crimson petal shards.
   */
  drawParticle(ctx, pt, life) {
    const ps = Math.max(2, (pt.size || 5) * life);
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(pt.angle);
    ctx.beginPath();
    ctx.moveTo(0, -ps * 1.5);
    ctx.bezierCurveTo(ps * 0.5, -ps * 0.5, ps * 0.4, ps * 0.8, 0, ps * 1.5);
    ctx.bezierCurveTo(-ps * 0.4, ps * 0.8, -ps * 0.5, -ps * 0.5, 0, -ps * 1.5);
    ctx.fill();
    ctx.restore();
  }
};
