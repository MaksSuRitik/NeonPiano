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

  // Helper palette resolver for Dark Angel Gothic Mysticism
  _getPalette(combo = 0, isDead = false) {
    if (isDead) {
      return {
        border: '#475569', core: '#94a3b8', glow: 'rgba(71, 85, 105, 0.3)',
        track: 'rgba(15, 23, 42, 0.65)', obsCol: '#111827', gemCol: '#334155', soul: '#64748b'
      };
    }
    const tier = (typeof combo === 'number') ? combo : 0;
    if (tier >= 800) {
      return {
        border: '#e879f9', core: '#ffffff', glow: 'rgba(232, 121, 249, 0.85)',
        track: 'rgba(38, 7, 54, 0.75)', obsCol: '#0a0112', gemCol: '#f0abfc', soul: '#e879f9'
      };
    }
    if (tier >= 400) {
      return {
        border: '#c084fc', core: '#ffffff', glow: 'rgba(168, 85, 247, 0.80)',
        track: 'rgba(29, 6, 48, 0.75)', obsCol: '#08010f', gemCol: '#d8b4fe', soul: '#a855f7'
      };
    }
    if (tier >= 200) {
      return {
        border: '#d946ef', core: '#ffffff', glow: 'rgba(217, 70, 239, 0.75)',
        track: 'rgba(35, 5, 45, 0.75)', obsCol: '#08010f', gemCol: '#f5d0fe', soul: '#d946ef'
      };
    }
    if (tier >= 100) {
      return {
        border: '#c084fc', core: '#ffffff', glow: 'rgba(192, 132, 252, 0.70)',
        track: 'rgba(24, 5, 40, 0.75)', obsCol: '#090212', gemCol: '#e9d5ff', soul: '#c084fc'
      };
    }
    if (tier >= 50) {
      return {
        border: '#a855f7', core: '#ffffff', glow: 'rgba(168, 85, 247, 0.65)',
        track: 'rgba(20, 4, 34, 0.70)', obsCol: '#0a0214', gemCol: '#c084fc', soul: '#9333ea'
      };
    }
    return {
      border: '#a855f7', core: '#ffffff', glow: 'rgba(147, 51, 234, 0.55)',
      track: 'rgba(18, 3, 30, 0.70)', obsCol: '#07010e', gemCol: '#d8b4fe', soul: '#a855f7'
    };
  },

  /**
   * Neck junction collar for Dark Angel theme (locking spine into note head)
   */
  drawNeck(ctx, x, actualYHeadTop, w, headH, tile, isLight, combo = 0) {
    const dead = Boolean(tile && (tile.released || tile.failed));
    const pal = this._getPalette(dead ? 0 : combo, dead);
    const bodyW = Math.max(10, Math.round(w - 16));
    const cx = Math.round(x + 8 + bodyW / 2);
    const collarH = Math.max(5, Math.round(headH * 0.22));
    const collarW = Math.round(bodyW * 0.72);

    ctx.save();
    // Sleek gothic cathedral collar
    ctx.fillStyle = dead ? '#1e293b' : pal.obsCol;
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, actualYHeadTop - collarH);
    ctx.lineTo(cx + collarW / 2, actualYHeadTop - collarH * 0.35);
    ctx.lineTo(cx + collarW / 2, actualYHeadTop + 1);
    ctx.lineTo(cx - collarW / 2, actualYHeadTop + 1);
    ctx.lineTo(cx - collarW / 2, actualYHeadTop - collarH * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center amethyst rivet
    ctx.fillStyle = pal.core;
    ctx.beginPath();
    ctx.arc(cx, actualYHeadTop - collarH * 0.35, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  /**
   * Procedural Hold Body: Sleek Obsidian Seraph Ray (Clean, elegant, non-cluttered)
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

    // 1. Sleek Obsidian Track Foundation
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

    // 2. Lateral Feather Trim Guidelines
    ctx.strokeStyle = dead ? 'rgba(71, 85, 105, 0.3)' : 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(bodyX + 3, yTail);
    ctx.lineTo(bodyX + 3, headTopY);
    ctx.moveTo(bodyX + bodyLaneW - 3, yTail);
    ctx.lineTo(bodyX + bodyLaneW - 3, headTopY);
    ctx.stroke();

    // 3. Central Luminous Soul Energy Ray
    if (!dead) {
      // Soft purple glow halo
      ctx.strokeStyle = pal.glow;
      ctx.lineWidth = Math.min(12, hw * 0.75);
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();

      // Violet soul filament
      ctx.strokeStyle = pal.soul;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();

      // White incandescent inner core
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

    // 4. Subtle, Elegant Seraph Feather Chevron Accents (Spaced 68px apart, minimal & clean)
    const featherSpacing = 68;
    const startY = headTopY - 18;
    const endY = yTail + 18;

    if (startY > endY) {
      const numFeathers = Math.max(1, Math.floor((startY - endY) / featherSpacing));
      const effectiveSpacing = (startY - endY) / numFeathers;

      for (let i = 0; i <= numFeathers; i++) {
        const fy = startY - i * effectiveSpacing;
        const wingSpan = hw * 0.75;

        ctx.strokeStyle = dead ? 'rgba(71, 85, 105, 0.4)' : pal.border;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        // Left subtle wing feather
        ctx.moveTo(cx - 3, fy);
        ctx.lineTo(cx - wingSpan, fy - 6);
        // Right subtle wing feather
        ctx.moveTo(cx + 3, fy);
        ctx.lineTo(cx + wingSpan, fy - 6);
        ctx.stroke();

        // Small amethyst jewel node
        ctx.fillStyle = dead ? '#475569' : pal.gemCol;
        ctx.beginPath();
        ctx.arc(cx, fy, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Holding pulse gliding smoothly along the soul line
      if (holding && !dead) {
        const pulseOffset = ((now || 0) * 0.18) % effectiveSpacing;
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i <= numFeathers; i++) {
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
   * Terminal Seraphic Stiletto Spear Tip (Clean, sharp, non-cluttered)
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
    const baseTailLen = Math.min(28, Math.round(headH * 0.45));
    const tailLen = Math.min(baseTailLen, maxSafeTailLen);

    if (tailLen <= 5) return;

    const tipY = yTail - tailLen;
    ctx.save();

    // 1. Sleek Seraph Stiletto Spearhead
    ctx.fillStyle = dead ? '#1e293b' : pal.obsCol;
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

    // Center razor line
    ctx.strokeStyle = dead ? '#64748b' : pal.core;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx, yTail);
    ctx.lineTo(cx, tipY);
    ctx.stroke();

    // 2. Compact Amethyst Diamond Accent
    const gemY = yTail - tailLen * 0.38;
    if (!dead) {
      ctx.fillStyle = pal.gemCol;
      ctx.beginPath();
      ctx.moveTo(cx, gemY - 3);
      ctx.lineTo(cx + 2.5, gemY);
      ctx.lineTo(cx, gemY + 3);
      ctx.lineTo(cx - 2.5, gemY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  },

  /**
   * Revamped Atmosphere for Dark Angel Theme:
   * Cathedral of the Obsidian Seraph:
   * Gothic vaulted arches framing the field, grand stained-glass Rose Window sigil,
   * ethereal upward-rising seraph feathers and amethyst soul particles, volumetric light rays.
   */
  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const gw = ctx.canvas?.width || State?.gameWidth || 400;
    const gh = ctx.canvas?.height || State?.gameHeight || 700;
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const t = (typeof songTime === 'number' && !isNaN(songTime)) ? songTime : (State?.songTime || 0);
    const bass = (typeof State !== 'undefined' && typeof State?.bgPulse === 'number' && !isNaN(State.bgPulse)) ? State.bgPulse : 0;

    ctx.save();

    // 1. Gothic Cathedral Vaulted Ribbed Arches (framing top and left/right field)
    const archH = Math.min(gh * 0.35, 180);
    ctx.strokeStyle = isLight ? 'rgba(147, 51, 234, 0.25)' : 'rgba(168, 85, 247, 0.32)';
    ctx.lineWidth = 1.3;

    // Left cathedral ribbed arch
    ctx.beginPath();
    ctx.moveTo(0, archH);
    ctx.quadraticCurveTo(gw * 0.25, archH * 0.15, gw / 2, 0);
    ctx.stroke();

    // Right cathedral ribbed arch
    ctx.beginPath();
    ctx.moveTo(gw, archH);
    ctx.quadraticCurveTo(gw * 0.75, archH * 0.15, gw / 2, 0);
    ctx.stroke();

    // Inner arch pair
    ctx.strokeStyle = isLight ? 'rgba(147, 51, 234, 0.15)' : 'rgba(168, 85, 247, 0.18)';
    ctx.beginPath();
    ctx.moveTo(gw * 0.08, archH);
    ctx.quadraticCurveTo(gw * 0.28, archH * 0.25, gw / 2, 18);
    ctx.moveTo(gw * 0.92, archH);
    ctx.quadraticCurveTo(gw * 0.72, archH * 0.25, gw / 2, 18);
    ctx.stroke();

    // 2. Grand Gothic Stained-Glass Rose Window Sigil in Background Center
    const cx = gw / 2;
    const cy = gh * 0.40;
    const roseR = Math.min(gw * 0.35, 115);
    const breath = Math.sin(t * 0.002) * 0.04 + bass * 0.10;
    const baseAlpha = Math.max(0.01, Math.min(1.0, (isLight ? 0.14 : 0.22) + breath));

    // Pulsing stained glass ambient halo
    const roseGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, roseR * 1.5);
    roseGlow.addColorStop(0, isLight ? 'rgba(147, 51, 234, 0.25)' : 'rgba(168, 85, 247, 0.32)');
    roseGlow.addColorStop(0.5, isLight ? 'rgba(88, 28, 135, 0.10)' : 'rgba(88, 28, 135, 0.15)');
    roseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = roseGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, roseR * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Stained glass rosette filigree rings
    ctx.strokeStyle = isLight ? `rgba(147, 51, 234, ${baseAlpha})` : `rgba(216, 180, 254, ${baseAlpha})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(cx, cy, roseR, 0, Math.PI * 2);
    ctx.moveTo(cx + roseR * 0.68, cy);
    ctx.arc(cx, cy, roseR * 0.68, 0, Math.PI * 2);
    ctx.moveTo(cx + roseR * 0.34, cy);
    ctx.arc(cx, cy, roseR * 0.34, 0, Math.PI * 2);

    // 12 Gothic Petal Rosettes (geometry of stained glass cathedral)
    for (let a = 0; a < 12; a++) {
      const ang = a * Math.PI / 6;
      const ax = cx + Math.cos(ang) * roseR * 0.68;
      const ay = cy + Math.sin(ang) * roseR * 0.68;
      ctx.moveTo(ax + roseR * 0.34, ay);
      ctx.arc(ax, ay, roseR * 0.34, 0, Math.PI * 2);
    }
    ctx.stroke();

    // Rose Window Central Hexagram / Seraph Star
    ctx.strokeStyle = isLight ? `rgba(168, 85, 247, ${baseAlpha * 1.2})` : `rgba(250, 232, 255, ${baseAlpha * 1.2})`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    for (let s = 0; s < 6; s++) {
      const sAng = s * Math.PI / 3;
      const sx = cx + Math.cos(sAng) * roseR * 0.34;
      const sy = cy + Math.sin(sAng) * roseR * 0.34;
      if (s === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.stroke();

    // 3. Volumetric Stained Glass Light Shafts piercing downward
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const numRays = 4;
    for (let r = 0; r < numRays; r++) {
      const rayAng = (r - 1.5) * 0.28;
      const rawAlpha = 0.04 + Math.sin(t * 0.0015 + r) * 0.02 + bass * 0.04;
      const rayAlpha = Math.max(0.001, Math.min(0.5, rawAlpha));
      const rayGrad = ctx.createLinearGradient(cx, cy, cx + Math.sin(rayAng) * gh * 0.7, cy + Math.cos(rayAng) * gh * 0.7);
      rayGrad.addColorStop(0, `rgba(216, 180, 254, ${(rayAlpha * 1.4).toFixed(3)})`);
      rayGrad.addColorStop(0.5, `rgba(147, 51, 234, ${(rayAlpha * 0.7).toFixed(3)})`);
      rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy);
      ctx.lineTo(cx + Math.sin(rayAng - 0.08) * gh * 0.8, cy + Math.cos(rayAng - 0.08) * gh * 0.8);
      ctx.lineTo(cx + Math.sin(rayAng + 0.08) * gh * 0.8, cy + Math.cos(rayAng + 0.08) * gh * 0.8);
      ctx.lineTo(cx + 8, cy);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 4. Ascending Ethereal Amethyst Soul Wisps & Seraph Feathers (floating UPWARD)
    if (!State.themeAtmosphereParticles || State.currentAtmosphereTheme !== 'dark_angel') {
      State.currentAtmosphereTheme = 'dark_angel';
      State.themeAtmosphereParticles = [];
      const count = 26;
      for (let i = 0; i < count; i++) {
        State.themeAtmosphereParticles.push({
          x: Math.random() * gw,
          y: Math.random() * gh,
          size: Math.random() * 5 + 3,
          speedY: -(Math.random() * 1.4 + 0.7), // Ascending upward
          speedX: (Math.random() - 0.5) * 0.5,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.025,
          swaySpeed: Math.random() * 0.003 + 0.001,
          swayOffset: Math.random() * 1000,
          alpha: Math.random() * 0.35 + 0.25,
          isFeather: (i % 3 === 0)
        });
      }
    }

    const parts = State.themeAtmosphereParticles;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.y += p.speedY * warpMult * speedBoost;
      p.rot += p.rotSpeed;
      const sway = Math.sin((songTime + p.swayOffset) * p.swaySpeed) * 0.6;
      p.x += (p.speedX + sway) * warpMult;

      if (p.y < -20) { p.y = gh + 20; p.x = Math.random() * gw; }
      if (p.x < -20) p.x = gw + 20;
      if (p.x > gw + 20) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha * (0.8 + bass * 0.4);

      if (p.isFeather) {
        // Floating seraph feather
        ctx.fillStyle = isLight ? '#a855f7' : '#c084fc';
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 2);
        ctx.quadraticCurveTo(p.size * 0.6, -p.size * 0.3, p.size * 0.2, p.size * 2);
        ctx.quadraticCurveTo(0, p.size * 2.2, -p.size * 0.2, p.size * 2);
        ctx.quadraticCurveTo(-p.size * 0.6, -p.size * 0.3, 0, -p.size * 2);
        ctx.fill();
      } else {
        // Ascending mystical soul spark
        ctx.fillStyle = (i % 2 === 0) ? '#d946ef' : '#a855f7';
        ctx.beginPath();
        ctx.moveTo(0, p.size * 1.5);
        ctx.quadraticCurveTo(p.size * 0.8, 0, 0, -p.size * 1.8);
        ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, p.size * 1.5);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }

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
