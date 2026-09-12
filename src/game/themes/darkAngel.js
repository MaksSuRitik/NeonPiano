// ==========================================
// DARK ANGEL THEME MODULE (Gothic Mysticism & Obsidian Seraph)
// ==========================================

export const DARK_ANGEL_THEME = {
  id: 'dark_angel',
  nameKey: 'themeDarkAngel',
  descKey: 'themeDarkAngelDesc',
  badgeKey: 'themeDarkAngelBadge',
  price: 50,
  unlockedByDefault: false,
  accentColor: '#a855f7',
  previewBg: 'linear-gradient(135deg, #1e0938, #3b0764, #581c87)',
  colors: {
    bgCenter: '#240a3e',
    bgMid: '#120322',
    bgOuter: '#05010a',
    bgAura: 'rgba(168, 85, 247, 0.18)',
    strings: ['#f3e8ff', '#d8b4fe', '#c084fc', '#a855f7'],
    stringGlow: 'rgba(168, 85, 247, 0.5)',
    receptorBorder: 'rgba(168, 85, 247, 0.5)',
    particleType: 'seraph_wisp'
  },
  comboTiers: [
    { min: 0, max: 49, name: 'amethyst_dusk', border: 'rgba(168, 85, 247, 0.55)', glow: 'rgba(147, 51, 234, 0.4)', particleColors: ['#a855f7', '#d8b4fe', '#c084fc'] },
    { min: 50, max: 99, name: 'void_purple', border: 'rgba(147, 51, 234, 0.75)', glow: 'rgba(107, 33, 168, 0.6)', particleColors: ['#9333ea', '#c084fc', '#f3e8ff'] },
    { min: 100, max: 199, name: 'violet_arcane', border: 'rgba(192, 132, 252, 0.85)', glow: 'rgba(147, 51, 234, 0.7)', particleColors: ['#c084fc', '#e9d5ff', '#ffffff'] },
    { min: 200, max: 399, name: 'gothic_magenta', border: 'rgba(217, 70, 239, 0.9)', glow: 'rgba(162, 28, 175, 0.75)', particleColors: ['#d946ef', '#f5d0fe', '#ffffff'] },
    { min: 400, max: 799, name: 'obsidian_astral', border: 'rgba(168, 85, 247, 0.95)', glow: 'rgba(88, 28, 135, 0.85)', particleColors: ['#a855f7', '#7c3aed', '#ffffff'] },
    { min: 800, max: Infinity, name: 'seraphic_ray', border: 'rgba(232, 121, 249, 0.95)', glow: 'rgba(192, 132, 252, 0.9)', particleColors: ['#e879f9', '#f0abfc', '#ffffff'] }
  ],

  getTier(combo) {
    const tiers = this.comboTiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (combo >= tiers[i].min) return tiers[i];
    }
    return tiers[0];
  },

  /**
   * Custom note decoration for Dark Angel theme:
   * Faceted obsidian crystal note body with glowing angelic rune sigil and feather quill.
   */
  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    ctx.save();
    const cx = x + w / 2;
    const cy = yTop + h / 2;

    // Obsidian crystal facet cuts
    ctx.strokeStyle = isLight ? 'rgba(147, 51, 234, 0.7)' : (comboTier?.border || '#c084fc');
    ctx.lineWidth = 1.2;

    // Wing / feather rune glyph
    const runeW = Math.max(12, w * 0.3);
    const runeH = Math.max(5, h * 0.35);

    ctx.beginPath();
    // Central vertical spine
    ctx.moveTo(cx, cy - runeH);
    ctx.lineTo(cx, cy + runeH);
    // Angel wing feathers angled outwards
    ctx.moveTo(cx - runeW, cy - runeH * 0.4);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + runeW, cy - runeH * 0.4);
    ctx.moveTo(cx - runeW * 0.7, cy + runeH * 0.3);
    ctx.lineTo(cx, cy + runeH * 0.6);
    ctx.lineTo(cx + runeW * 0.7, cy + runeH * 0.3);
    ctx.stroke();

    // Runic halo jewel
    ctx.fillStyle = isLight ? '#9333ea' : '#f3e8ff';
    ctx.beginPath();
    ctx.arc(cx, cy - runeH - 1, 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  /**
   * Custom receptor for Dark Angel theme:
   * Gothic cathedral winged arch silhouette with obsidian rune accents.
   */
  drawReceptor(ctx, x, y, w, h, isActive, isLight) {
    ctx.save();
    const radius = 8;
    const col = isActive 
      ? (isLight ? '#9333ea' : '#c084fc') 
      : (isLight ? 'rgba(147, 51, 234, 0.35)' : 'rgba(168, 85, 247, 0.3)');

    ctx.strokeStyle = col;
    ctx.lineWidth = isActive ? 2.2 : 1.2;
    const isMob = (typeof window !== 'undefined' && (window.innerWidth <= 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1)));
    if (isActive && !isLight && !isMob) {
      ctx.shadowColor = '#a855f7';
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

    // Gothic cathedral pointed peak indicator on top
    const cx = x + w / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 6, y);
    ctx.lineTo(cx, y - 3);
    ctx.lineTo(cx + 6, y);
    ctx.strokeStyle = isActive ? '#ffffff' : col;
    ctx.stroke();

    ctx.restore();
  },

  /**
   * Unique Note Tap Hit Animation for Dark Angel Theme:
   * Gothic Seraph Winged Sigil Explosion:
   * Two majestic gothic seraph wings sweep open and lift upward into the abyss,
   * framed by an 8-pointed dark arcane sigil circle and upward floating amethyst embers.
   */
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now) {
    const easeOut = 1 - Math.pow(1 - p, 3);
    const alpha = Math.max(0, 1.0 - Math.pow(p, 1.3));
    if (alpha <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const colPurple = isPerfect ? 'rgba(232, 121, 249,' : 'rgba(168, 85, 247,';
    const colBright = isPerfect ? 'rgba(250, 232, 255,' : 'rgba(216, 180, 254,';

    // 1. Eight-Pointed Gothic Arcane Sigil Circle
    const sigilR = (w * 0.18) + easeOut * (w * 0.40);
    ctx.strokeStyle = `${colPurple} ${alpha * 0.75})`;
    ctx.lineWidth = Math.max(1, 1.8 * (1.0 - p));
    ctx.beginPath();
    ctx.arc(cx, cy, sigilR, 0, Math.PI * 2);
    ctx.stroke();

    // Sigil 8-pointed star peaks
    if (p < 0.7) {
      const starAlpha = (1.0 - p / 0.7) * 0.75;
      ctx.strokeStyle = `${colBright} ${starAlpha})`;
      ctx.lineWidth = 1.0;
      const rot = now * 0.0015;
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const ang = rot + k * Math.PI / 4;
        const outerR = sigilR * 1.15;
        const innerR = sigilR * 0.85;
        const ox = cx + Math.cos(ang) * outerR;
        const oy = cy + Math.sin(ang) * outerR;
        const ix = cx + Math.cos(ang + Math.PI / 8) * innerR;
        const iy = cy + Math.sin(ang + Math.PI / 8) * innerR;
        if (k === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
        ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 2. Gothic Seraph Wings Opening Upward
    // Lift upward as they expand (negative Y offset)
    const wingLiftY = cy - easeOut * 24;
    const wingSpan = (w * 0.25) + easeOut * (w * 0.55);
    const wingHeight = Math.max(8, (w * 0.35) * (1.0 - p * 0.5));
    const wingAlpha = Math.max(0, (1.0 - p) * 0.9);

    ctx.save();
    ctx.strokeStyle = `${colBright} ${wingAlpha})`;
    ctx.fillStyle = `${colPurple} ${wingAlpha * 0.25})`;
    ctx.lineWidth = 1.4;

    // Left Wing
    ctx.beginPath();
    ctx.moveTo(cx - 2, wingLiftY);
    ctx.bezierCurveTo(cx - wingSpan * 0.4, wingLiftY - wingHeight * 1.2, cx - wingSpan * 0.8, wingLiftY - wingHeight * 0.8, cx - wingSpan, wingLiftY - wingHeight * 0.3);
    // Wing feather cuts
    ctx.bezierCurveTo(cx - wingSpan * 0.8, wingLiftY - wingHeight * 0.1, cx - wingSpan * 0.6, wingLiftY + wingHeight * 0.2, cx - 2, wingLiftY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Left wing primary feather spine lines
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(cx - 2, wingLiftY);
    ctx.lineTo(cx - wingSpan * 0.7, wingLiftY - wingHeight * 0.6);
    ctx.moveTo(cx - 2, wingLiftY);
    ctx.lineTo(cx - wingSpan * 0.85, wingLiftY - wingHeight * 0.2);
    ctx.stroke();

    // Right Wing
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx + 2, wingLiftY);
    ctx.bezierCurveTo(cx + wingSpan * 0.4, wingLiftY - wingHeight * 1.2, cx + wingSpan * 0.8, wingLiftY - wingHeight * 0.8, cx + wingSpan, wingLiftY - wingHeight * 0.3);
    // Wing feather cuts
    ctx.bezierCurveTo(cx + wingSpan * 0.8, wingLiftY - wingHeight * 0.1, cx + wingSpan * 0.6, wingLiftY + wingHeight * 0.2, cx + 2, wingLiftY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right wing primary feather spine lines
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(cx + 2, wingLiftY);
    ctx.lineTo(cx + wingSpan * 0.7, wingLiftY - wingHeight * 0.6);
    ctx.moveTo(cx + 2, wingLiftY);
    ctx.lineTo(cx + wingSpan * 0.85, wingLiftY - wingHeight * 0.2);
    ctx.stroke();

    ctx.restore();

    // 3. Central Amethyst Holy Sigil Core
    if (p < 0.45) {
      const coreAlpha = (1.0 - p / 0.45);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, wingLiftY, Math.max(2, 6 * coreAlpha), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  /**
   * Unique Atmosphere for Dark Angel Theme:
   * Cathedral of the Abyss:
   * Absolutely NO falling elements!
   * Ethereal dark violet wisps and amethyst soul particles floating UPWARD (speedY < 0)
   * toward the cathedral heights + glowing gothic cathedral rose window sigil in the dark background center.
   */
  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const gw = State.gameWidth || 400;
    const gh = State.gameHeight || 700;
    const isLight = document.body.getAttribute('data-theme') === 'light';

    if (!State.themeAtmosphereParticles || State.currentAtmosphereTheme !== 'dark_angel') {
      State.currentAtmosphereTheme = 'dark_angel';
      State.themeAtmosphereParticles = [];
      const count = 24;
      for (let i = 0; i < count; i++) {
        State.themeAtmosphereParticles.push({
          x: Math.random() * gw,
          y: Math.random() * gh,
          size: Math.random() * 5 + 3,
          speedY: -(Math.random() * 1.5 + 0.8), // Floating UPWARD!
          speedX: (Math.random() - 0.5) * 0.5,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.025,
          swaySpeed: Math.random() * 0.003 + 0.001,
          swayOffset: Math.random() * 1000,
          alpha: Math.random() * 0.35 + 0.25
        });
      }
    }

    ctx.save();

    // 1. Gothic Cathedral Rose Window Sigil in Background Center
    const cx = gw / 2;
    const cy = gh * 0.42;
    const roseR = Math.min(gw * 0.34, 110);
    const pulse = State.bgPulse || 0;
    const breath = Math.sin(songTime * 0.002) * 0.05 + pulse * 0.08;
    const baseAlpha = (isLight ? 0.07 : 0.12) + breath;

    ctx.strokeStyle = isLight ? `rgba(147, 51, 234, ${baseAlpha})` : `rgba(168, 85, 247, ${baseAlpha})`;
    ctx.lineWidth = 1.2;

    // Cathedral Gothic Rosette (пакетне малювання за 1 виклик stroke)
    ctx.beginPath();
    ctx.arc(cx, cy, roseR, 0, Math.PI * 2);
    ctx.moveTo(cx + roseR * 0.65, cy);
    ctx.arc(cx, cy, roseR * 0.65, 0, Math.PI * 2);
    ctx.moveTo(cx + roseR * 0.32, cy);
    ctx.arc(cx, cy, roseR * 0.32, 0, Math.PI * 2);

    // Cathedral 8-petal arch geometry
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4;
      const ax = cx + Math.cos(ang) * roseR * 0.65;
      const ay = cy + Math.sin(ang) * roseR * 0.65;
      ctx.moveTo(ax + roseR * 0.35, ay);
      ctx.arc(ax, ay, roseR * 0.35, 0, Math.PI * 2);
    }
    ctx.stroke();

    // 2. Ascending Ethereal Amethyst Soul Wisps & Incense Smoke (floating UPWARD)
    const parts = State.themeAtmosphereParticles;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.y += p.speedY * warpMult * speedBoost; // Negative speed = moves up
      p.rot += p.rotSpeed;
      const sway = Math.sin((songTime + p.swayOffset) * p.swaySpeed) * 0.6;
      p.x += (p.speedX + sway) * warpMult;

      // Wrap around when reaching the top
      if (p.y < -20) {
        p.y = gh + 20;
        p.x = Math.random() * gw;
      }
      if (p.x < -20) p.x = gw + 20;
      if (p.x > gw + 20) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;

      // Ascending mystical flame/wisp shape
      ctx.fillStyle = (i % 2 === 0) ? '#a855f7' : '#7c3aed';
      const isMob = (typeof window !== 'undefined' && (window.innerWidth <= 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1)));
      if (!isMob) {
        ctx.shadowColor = 'rgba(168, 85, 247, 0.45)';
        ctx.shadowBlur = 6;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.moveTo(0, p.size * 1.5);
      ctx.quadraticCurveTo(p.size * 0.8, 0, 0, -p.size * 1.8);
      ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, p.size * 1.5);
      ctx.fill();

      // Core white wisp spark
      ctx.fillStyle = '#f3e8ff';
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  },

  /**
   * Custom Particle renderer for Dark Angel Theme:
   * Obsidian crystal shards and dark amethyst seraph feathers.
   */
  drawParticle(ctx, pt, life) {
    const ps = Math.max(2, (pt.size || 5) * life);
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(pt.angle);

    // Dark angel feather / obsidian shard
    ctx.beginPath();
    ctx.moveTo(0, -ps * 1.8);
    ctx.quadraticCurveTo(ps * 0.5, -ps * 0.3, ps * 0.2, ps * 1.8);
    ctx.quadraticCurveTo(0, ps * 2.0, -ps * 0.2, ps * 1.8);
    ctx.quadraticCurveTo(-ps * 0.5, -ps * 0.3, 0, -ps * 1.8);
    ctx.fill();

    // Feather central spine
    ctx.strokeStyle = '#e9d5ff';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(0, -ps * 1.6);
    ctx.lineTo(0, ps * 1.7);
    ctx.stroke();

    ctx.restore();
  }
};
