// ============================================================================
// PHROLOVA THEME MODULE — Crimson Requiem (Багряний Реквієм / Фролова)
// Inspired by Wuthering Waves: Phrolova's Soundweave, Lycoris radiata (Хиганбана),
// and Shattered Gothic Mirror aesthetic.
// ============================================================================

export const PHROLOVA_THEME = {
  id: 'phrolova',
  nameKey: 'themePhrolova',
  descKey: 'themePhrolovaDesc',
  badgeKey: 'themePhrolovaBadge',
  price: 30,
  unlockedByDefault: false,
  accentColor: '#e11d48',
  previewBg: 'linear-gradient(135deg, #180309, #3f0714, #881337, #080204)',
  colors: {
    bgCenter: '#2a050e',
    bgMid: '#140207',
    bgOuter: '#080104',
    bgAura: 'rgba(225, 29, 72, 0.22)',
    strings: ['#fecdd3', '#fda4af', '#f43f5e', '#e11d48'],
    stringGlow: 'rgba(225, 29, 72, 0.65)',
    receptorBorder: 'rgba(244, 63, 94, 0.75)',
    particleType: 'petal'
  },
  comboTiers: [
    { min: 0,   max: 49,       name: 'crimson_rose',    border: 'rgba(244, 63, 94, 0.65)', glow: 'rgba(225, 29, 72, 0.45)', particleColors: ['#f43f5e', '#fda4af', '#e11d48'] },
    { min: 50,  max: 99,       name: 'blood_velvet',    border: 'rgba(225, 29, 72, 0.85)', glow: 'rgba(190, 18, 60, 0.65)', particleColors: ['#e11d48', '#fb7185', '#ffe4e6'] },
    { min: 100, max: 199,      name: 'rose_gold',       border: 'rgba(251, 146, 60, 0.90)', glow: 'rgba(225, 29, 72, 0.75)', particleColors: ['#fb923c', '#fda4af', '#fff1f2'] },
    { min: 200, max: 399,      name: 'fiery_carnation', border: 'rgba(249, 115, 22, 0.95)', glow: 'rgba(234, 88, 12, 0.80)', particleColors: ['#f97316', '#fed7aa', '#ffffff'] },
    { min: 400, max: 799,      name: 'royal_vermilion', border: 'rgba(255, 77, 109, 0.98)', glow: 'rgba(225, 29, 72, 0.90)', particleColors: ['#ff4d6d', '#ff758f', '#fff0f3'] },
    { min: 800, max: Infinity, name: 'celestial_lily',   border: '#ffd700',                  glow: 'rgba(251, 191, 36, 0.95)', particleColors: ['#ffd700', '#ff0054', '#ffffff'] }
  ],

  getTier(combo) {
    const tiers = this.comboTiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (combo >= tiers[i].min) return tiers[i];
    }
    return tiers[0];
  },

  // Color palette by combo tier
  _getPalette(tier, isDead = false) {
    if (isDead) {
      return {
        bgTop: '#1e293b', bgMid: '#0f172a', bgBot: '#050811',
        border: '#475569', core: '#94a3b8', ribbonGlow: 'rgba(71, 85, 105, 0.3)',
        starCol: '#94a3b8', stringCol: '#64748b', beadCol: '#94a3b8'
      };
    }
    if (tier >= 800) {
      return {
        bgTop: '#78350f', bgMid: '#450a0a', bgBot: '#1c050a',
        border: '#ffd700', core: '#fffbeb', ribbonGlow: 'rgba(251, 191, 36, 0.70)',
        starCol: '#ffffff', stringCol: '#fef08a', beadCol: '#ffd700'
      };
    }
    if (tier >= 400) {
      return {
        bgTop: '#881337', bgMid: '#4c0519', bgBot: '#1a0309',
        border: '#ff4d6d', core: '#fff0f3', ribbonGlow: 'rgba(255, 77, 109, 0.65)',
        starCol: '#ffffff', stringCol: '#ff758f', beadCol: '#ff4d6d'
      };
    }
    if (tier >= 200) {
      return {
        bgTop: '#7c1d1d', bgMid: '#450a0a', bgBot: '#190308',
        border: '#fb7185', core: '#ffe4e6', ribbonGlow: 'rgba(251, 113, 133, 0.60)',
        starCol: '#ffffff', stringCol: '#fda4af', beadCol: '#fb7185'
      };
    }
    if (tier >= 100) {
      return {
        bgTop: '#831843', bgMid: '#4c0519', bgBot: '#1a0309',
        border: '#f43f5e', core: '#fff1f2', ribbonGlow: 'rgba(244, 63, 94, 0.55)',
        starCol: '#ffffff', stringCol: '#fda4af', beadCol: '#f43f5e'
      };
    }
    if (tier >= 50) {
      return {
        bgTop: '#6b0724', bgMid: '#390312', bgBot: '#170206',
        border: '#e11d48', core: '#ffe4e6', ribbonGlow: 'rgba(225, 29, 72, 0.50)',
        starCol: '#ffffff', stringCol: '#fda4af', beadCol: '#e11d48'
      };
    }
    // Tier 0
    return {
      bgTop: '#4c0519', bgMid: '#28030c', bgBot: '#120105',
      border: '#be123c', core: '#fecdd3', ribbonGlow: 'rgba(190, 18, 60, 0.45)',
      starCol: '#ffffff', stringCol: '#fda4af', beadCol: '#be123c'
    };
  },

  // ==========================================================================
  // NOTE SPRITE BAKING (Fast 60fps offscreen sprite caching)
  // - Obsidian-Crimson crystal body with razor-thorn laceration borders
  // - Luminous 4-pointed rhombus diamond star (✦) in center (Image 3)
  // - Delicate violin f-hole / Lycoris stamen filigree lines
  // ==========================================================================
  bakeTapNote(ctx, x, yTop, w, h, isLight, style) {
    const tier = style?.tier || 0;
    const isGold = (tier >= 800);
    const pal = this._getPalette(tier, false);
    const cx = x + w / 2;
    const cy = yTop + h / 2;

    ctx.save();

    // 1. Faceted Obsidian-Crimson Crystal Base
    const bg = ctx.createLinearGradient(x, yTop, x + w, yTop + h);
    if (isLight) {
      bg.addColorStop(0, '#fff1f2');
      bg.addColorStop(0.5, '#fecdd3');
      bg.addColorStop(1, '#fda4af');
    } else {
      bg.addColorStop(0, pal.bgTop);
      bg.addColorStop(0.45, pal.bgMid);
      bg.addColorStop(1, pal.bgBot);
    }
    ctx.fillStyle = bg;

    const r = Math.min(8, h * 0.22);
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x + 2, yTop + 2, w - 4, h - 4, r);
      ctx.fill();
    } else {
      ctx.fillRect(x + 2, yTop + 2, w - 4, h - 4);
    }

    // 2. Razor-Thorn Laceration Notches along outer lateral edges (per skill slash)
    ctx.fillStyle = pal.border;
    const spikeH = Math.max(3, h * 0.22);
    // Left thorns
    ctx.beginPath();
    ctx.moveTo(x + 2, cy - spikeH);
    ctx.lineTo(x - 3, cy);
    ctx.lineTo(x + 2, cy + spikeH);
    ctx.closePath();
    ctx.fill();

    // Right thorns
    ctx.beginPath();
    ctx.moveTo(x + w - 2, cy - spikeH);
    ctx.lineTo(x + w + 3, cy);
    ctx.lineTo(x + w - 2, cy + spikeH);
    ctx.closePath();
    ctx.fill();

    // 3. Outer Crystal Border
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = isLight ? 1.4 : 1.6;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x + 2, yTop + 2, w - 4, h - 4, r);
      ctx.stroke();
    } else {
      ctx.strokeRect(x + 2, yTop + 2, w - 4, h - 4);
    }

    // 4. Subtle Crimson Violin f-hole Filigree curves
    const span = Math.max(12, w * 0.26);
    ctx.strokeStyle = isLight ? 'rgba(225, 29, 72, 0.4)' : 'rgba(253, 164, 175, 0.35)';
    ctx.lineWidth = 1.0;
    // Left f-curve
    ctx.beginPath();
    ctx.moveTo(cx - span, cy - h * 0.22);
    ctx.quadraticCurveTo(cx - span * 0.6, cy, cx - span, cy + h * 0.22);
    ctx.stroke();
    // Right f-curve
    ctx.beginPath();
    ctx.moveTo(cx + span, cy - h * 0.22);
    ctx.quadraticCurveTo(cx + span * 0.6, cy, cx + span, cy + h * 0.22);
    ctx.stroke();

    // 5. Central Radiant 4-Pointed Rhombus Diamond Star (✦ per Image 3 skill motif)
    const starW = Math.max(5, Math.min(10, w * 0.14));
    const starH = Math.max(7, Math.min(14, h * 0.44));

    // Outer diamond facet
    ctx.fillStyle = isLight ? 'rgba(225, 29, 72, 0.25)' : 'rgba(0, 0, 0, 0.65)';
    ctx.strokeStyle = isGold ? '#ffd700' : pal.border;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - starH);
    ctx.lineTo(cx + starW, cy);
    ctx.lineTo(cx, cy + starH);
    ctx.lineTo(cx - starW, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Radiant scarlet-white 4-point star core
    const coreW = starW * 0.55;
    const coreH = starH * 0.55;
    ctx.fillStyle = isGold ? '#ffffff' : pal.core;
    ctx.beginPath();
    ctx.moveTo(cx, cy - coreH);
    ctx.quadraticCurveTo(cx, cy, cx + coreW, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + coreH);
    ctx.quadraticCurveTo(cx, cy, cx - coreW, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - coreH);
    ctx.closePath();
    ctx.fill();

    // Center sparkling point
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return true;
  },

  bakeLongHead(ctx, x, yTop, w, h, isLight, style) {
    this.bakeTapNote(ctx, x, yTop, w, h, isLight, style);
    const tier = style?.tier || 0;
    const pal = this._getPalette(tier, false);
    const cx = x + w / 2;

    ctx.save();
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, yTop + 4, Math.max(4, w * 0.12), Math.PI, 0);
    ctx.stroke();
    ctx.restore();
    return true;
  },

  bakeLongTail(ctx, tailW, tailH, isLight, style) {
    const tier = style?.tier || 0;
    const pal = this._getPalette(tier, false);
    const cx = tailW / 2;
    const hw = Math.round(tailW * 0.46);
    const isGold = (tier >= 800);

    // 1. Semi-transparent Obsidian-Crimson Track (matches standard tail width)
    const bg = ctx.createLinearGradient(0, 0, 0, tailH);
    bg.addColorStop(0, pal.bgTop);
    bg.addColorStop(0.5, pal.bgMid);
    bg.addColorStop(1, pal.bgBot);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, tailW, tailH);

    // Edge guideline borders
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(0.5, 0); ctx.lineTo(0.5, tailH);
    ctx.moveTo(tailW - 0.5, 0); ctx.lineTo(tailW - 0.5, tailH);
    ctx.stroke();

    // 2. Central "Кровавый след" (Blood Slash / Luminous Razor Axis)
    ctx.strokeStyle = pal.ribbonGlow;
    ctx.lineWidth = Math.min(18, hw);
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, tailH);
    ctx.stroke();

    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, tailH);
    ctx.stroke();

    ctx.strokeStyle = isGold ? '#fef08a' : (pal.core || '#ffffff');
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, tailH);
    ctx.stroke();

    // 3. Segmented Blade Links / Raptor Thorns
    const linkSpacing = 28;
    const numLinks = Math.max(1, Math.floor(tailH / linkSpacing));
    const effectiveSpacing = tailH / numLinks;

    ctx.beginPath();
    for (let i = 0; i <= numLinks; i++) {
      const ly = i * effectiveSpacing;
      const topY = ly - 7;
      const botY = ly + 8;
      const midY = ly;

      // Left curved blade
      ctx.moveTo(cx - 3, topY);
      ctx.quadraticCurveTo(cx - hw * 0.45, topY + 2, cx - hw, midY + 4);
      ctx.quadraticCurveTo(cx - hw * 0.65, botY - 2, cx - hw * 0.4, botY);
      ctx.lineTo(cx - 2, botY - 3);
      ctx.lineTo(cx - 2, midY);
      ctx.closePath();

      // Right curved blade
      ctx.moveTo(cx + 3, topY);
      ctx.quadraticCurveTo(cx + hw * 0.45, topY + 2, cx + hw, midY + 4);
      ctx.quadraticCurveTo(cx + hw * 0.65, botY - 2, cx + hw * 0.4, botY);
      ctx.lineTo(cx + 2, botY - 3);
      ctx.lineTo(cx + 2, midY);
      ctx.closePath();
    }
    ctx.fillStyle = '#0d0106';
    ctx.fill();
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Central ruby diamond cores
    ctx.beginPath();
    for (let i = 0; i <= numLinks; i++) {
      const ly = i * effectiveSpacing;
      ctx.moveTo(cx, ly - 6);
      ctx.lineTo(cx + 4, ly);
      ctx.lineTo(cx, ly + 6);
      ctx.lineTo(cx - 4, ly);
      ctx.closePath();
    }
    ctx.fillStyle = pal.beadCol || '#f43f5e';
    ctx.fill();

    return true;
  },

  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    return this.bakeTapNote(ctx, x, yTop, w, h, isLight, { tier: comboTier?.min || 0 });
  },

  // ==========================================================================
  // PROCEDURAL HOLD BODY — THORNED WHIP / SEGMENTED BLADES / BLOOD SLASH
  // - Straight, taut razor energy string (NO snaking/undulation)
  // - Standard tail width: bodyLaneW = Math.max(10, Math.round(w - 16))
  // - Central glowing scarlet/crimson energy incision ("Кровавый след")
  // - Repeating segmented obsidian blade arrowheads / chitinous raptor thorns
  // - Audio/holding energetic pulse along the axis
  // ==========================================================================
  drawHoldBody(ctx, x, yTail, w, headH, tile, isLight, now, tailH, currentCombo = 0, actualYHeadTop = null, isReleased = false) {
    if (tailH <= 2) return true;

    const dead = isReleased || Boolean(tile && tile.failed);
    const holding = Boolean(tile && tile.holding && tile.hit);
    const liveCombo = (currentCombo !== undefined && currentCombo !== null && currentCombo > 0)
      ? currentCombo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : (tile?.style?.tier || 0));

    const tier = dead ? 0 : liveCombo;
    const pal = this._getPalette(tier, dead);
    const isGold = (tier >= 800);

    const bodyLaneW = Math.max(10, Math.round(w - 16));
    const bodyX = Math.round(x + 8);
    const cx = bodyX + bodyLaneW / 2;
    const headTopY = (actualYHeadTop !== null && actualYHeadTop !== undefined) ? actualYHeadTop : (yTail + tailH);
    const hw = Math.round(bodyLaneW * 0.46); // outer blade tip reach, perfectly matches standard tail width!

    ctx.save();

    // 1. Semi-transparent Obsidian/Crimson Track (defines standard tail body width)
    const trackGrad = ctx.createLinearGradient(0, yTail, 0, headTopY);
    trackGrad.addColorStop(0, dead ? 'rgba(30, 30, 30, 0.35)' : 'rgba(26, 3, 10, 0.45)');
    trackGrad.addColorStop(0.5, dead ? 'rgba(20, 20, 20, 0.30)' : 'rgba(40, 5, 16, 0.40)');
    trackGrad.addColorStop(1, dead ? 'rgba(10, 10, 10, 0.35)' : 'rgba(18, 2, 8, 0.45)');
    ctx.fillStyle = trackGrad;
    ctx.fillRect(bodyX, yTail, bodyLaneW, tailH);

    // Subtle edge guideline borders
    ctx.strokeStyle = dead ? 'rgba(100, 100, 100, 0.2)' : (pal.border + '33');
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(bodyX + 0.5, yTail);
    ctx.lineTo(bodyX + 0.5, headTopY);
    ctx.moveTo(bodyX + bodyLaneW - 0.5, yTail);
    ctx.lineTo(bodyX + bodyLaneW - 0.5, headTopY);
    ctx.stroke();

    // 2. Central "Кровавый след" (Blood Slash / Luminous Razor Axis)
    // 2a. Soft Outer Crimson Aura Bloom
    if (!dead) {
      const auraW = Math.min(22, hw * 1.1);
      ctx.strokeStyle = pal.ribbonGlow;
      ctx.lineWidth = auraW;
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();
    }

    // 2b. Razor Crimson Energy Beam
    ctx.strokeStyle = dead ? '#666666' : pal.border;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(cx, yTail);
    ctx.lineTo(cx, headTopY);
    ctx.stroke();

    // 2c. Incandescent White/Gold Laser Cord
    ctx.strokeStyle = dead ? '#999999' : (isGold ? '#fef08a' : (pal.core || '#ffffff'));
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, yTail);
    ctx.lineTo(cx, headTopY);
    ctx.stroke();

    // 3. Repeating Segmented Blades / Chitinous Raptor Thorns ("Сегментированные лезвия")
    // Each link is composed of crossed obsidian blades + glowing ruby diamond core
    const linkSpacing = 28;
    const startY = headTopY - 14;
    const endY = yTail + 12;

    if (startY > endY) {
      const numLinks = Math.max(1, Math.floor((startY - endY) / linkSpacing));
      const effectiveSpacing = (startY - endY) / numLinks;

      // Pass 3a: All Outer Obsidian Razor Blades (batched path for 60fps)
      ctx.beginPath();
      for (let i = 0; i <= numLinks; i++) {
        const ly = startY - i * effectiveSpacing;
        const topY = ly - 7;
        const botY = ly + 8;
        const midY = ly;

        // Left curved razor blade / claw
        ctx.moveTo(cx - 3, topY);
        ctx.quadraticCurveTo(cx - hw * 0.45, topY + 2, cx - hw, midY + 4);
        ctx.quadraticCurveTo(cx - hw * 0.65, botY - 2, cx - hw * 0.4, botY);
        ctx.lineTo(cx - 2, botY - 3);
        ctx.lineTo(cx - 2, midY);
        ctx.closePath();

        // Right curved razor blade / claw (symmetrical)
        ctx.moveTo(cx + 3, topY);
        ctx.quadraticCurveTo(cx + hw * 0.45, topY + 2, cx + hw, midY + 4);
        ctx.quadraticCurveTo(cx + hw * 0.65, botY - 2, cx + hw * 0.4, botY);
        ctx.lineTo(cx + 2, botY - 3);
        ctx.lineTo(cx + 2, midY);
        ctx.closePath();
      }
      ctx.fillStyle = dead ? '#222222' : '#0d0106';
      ctx.fill();

      // Sharp razor edge outlines on the obsidian blades
      ctx.strokeStyle = dead ? '#555555' : pal.border;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Pass 3b: Central Glowing Diamond Jewel Cores (threaded on the axis)
      ctx.beginPath();
      for (let i = 0; i <= numLinks; i++) {
        const ly = startY - i * effectiveSpacing;
        const rY = 6;
        const rX = 4;
        ctx.moveTo(cx, ly - rY);
        ctx.lineTo(cx + rX, ly);
        ctx.lineTo(cx, ly + rY);
        ctx.lineTo(cx - rX, ly);
        ctx.closePath();
      }
      ctx.fillStyle = dead ? '#444444' : (pal.beadCol || '#f43f5e');
      ctx.fill();

      // Diamond core sparkling highlight dots
      ctx.beginPath();
      for (let i = 0; i <= numLinks; i++) {
        const ly = startY - i * effectiveSpacing;
        ctx.moveTo(cx + 1.2, ly);
        ctx.arc(cx, ly, 1.2, 0, Math.PI * 2);
      }
      ctx.fillStyle = isGold ? '#ffffff' : '#ffe4e6';
      ctx.fill();

      // 4. Holding/Audio energetic pulse: glowing blood particles rushing down the cord
      if (holding && !dead) {
        const pulseOffset = ((now || 0) * 0.12) % effectiveSpacing;
        ctx.fillStyle = isGold ? '#fef08a' : '#ffffff';
        ctx.beginPath();
        for (let i = 0; i <= numLinks; i++) {
          const py = startY - i * effectiveSpacing - pulseOffset;
          if (py >= yTail && py <= headTopY) {
            ctx.moveTo(cx + 2.2, py);
            ctx.arc(cx, py, 2.2, 0, Math.PI * 2);
          }
        }
        ctx.fill();
      }
    }

    ctx.restore();
    return true;
  },

  // ==========================================================================
  // HOLD TAIL TIP (Кристальний шипастий наконечник-шпиль плети)
  // - Dynamic anti-overlap safety clamping: guarantee tail tip never breaches the next incoming note
  // ==========================================================================
  drawHoldTail(ctx, x, yTail, w, headH, tile, isLight, now, tailH = 0, currentCombo = 0, actualYHeadTop = null, nextTileDist = 9999) {
    const bodyW = Math.max(10, Math.round(w - 16));
    const bodyX = Math.round(x + 8);
    const cx = bodyX + bodyW / 2;
    const hw = Math.round(bodyW * 0.46);

    const dead = tile && tile.failed;
    const liveCombo = (currentCombo !== undefined && currentCombo !== null && currentCombo > 0)
      ? currentCombo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : (tile?.style?.tier || 0));

    const tier = dead ? 0 : liveCombo;
    const pal = this._getPalette(tier, dead);
    const isGold = (tier >= 800);

    // Dynamic anti-overlap safety clamping: guarantee tail tip never breaches the next incoming note
    const availableGap = (typeof nextTileDist === 'number' && nextTileDist > 0) ? nextTileDist : 9999;
    const maxSafeTailLen = Math.max(8, Math.round(availableGap - 16));
    const baseTailLen = Math.min(36, Math.round(headH * 0.42));
    const tailLen = Math.min(baseTailLen, maxSafeTailLen);

    if (tailLen <= 6) return;

    const tipY = yTail - tailLen;
    const finialW = Math.min(16, hw * 0.65);

    ctx.save();

    // Terminal Razor Arrowhead / Needle Spear Finial
    // Tapers to a razor-sharp needle point at tipY
    ctx.beginPath();
    ctx.moveTo(cx - finialW * 0.5, yTail);
    ctx.lineTo(cx - finialW * 0.8, tipY + tailLen * 0.45); // Left flare barb
    ctx.lineTo(cx, tipY);                                  // Sharp needle apex
    ctx.lineTo(cx + finialW * 0.8, tipY + tailLen * 0.45); // Right flare barb
    ctx.lineTo(cx + finialW * 0.5, yTail);
    ctx.closePath();

    ctx.fillStyle = dead ? '#1a1a1a' : '#0d0106';
    ctx.fill();
    ctx.strokeStyle = dead ? '#555555' : pal.border;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Central ruby laser filament tapering to the point
    ctx.strokeStyle = dead ? '#888888' : (isGold ? '#fef08a' : (pal.core || '#ffffff'));
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx, yTail);
    ctx.lineTo(cx, tipY + 1);
    ctx.stroke();

    // Terminal diamond star at apex
    const starR = Math.max(2.5, Math.min(5, tailLen * 0.16));
    ctx.fillStyle = isGold ? '#ffffff' : (pal.beadCol || '#f43f5e');
    ctx.beginPath();
    ctx.moveTo(cx, tipY - starR * 0.5);
    ctx.lineTo(cx + starR * 0.5, tipY);
    ctx.lineTo(cx, tipY + starR * 0.5);
    ctx.lineTo(cx - starR * 0.5, tipY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  // ==========================================================================
  // NECK JUNCTION COLLAR (Zero-gap connection between note head and whip body)
  // ==========================================================================
  drawNeck(ctx, x, junctionY, w, headH, tile, isReleased = false, currentCombo = 0) {
    const bodyW = Math.max(10, Math.round(w - 16));
    const bodyX = Math.round(x + 8);
    const cx = bodyX + bodyW / 2;
    const hw = Math.round(bodyW * 0.46);
    const neckH = Math.min(10, Math.round(headH * 0.25));

    const dead = isReleased || Boolean(tile && tile.failed);
    const liveCombo = (currentCombo !== undefined && currentCombo !== null && currentCombo > 0)
      ? currentCombo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : 0);
    const pal = this._getPalette(dead ? 0 : liveCombo, dead);

    ctx.save();
    // Straight obsidian coupling collar connecting straight into head
    ctx.fillStyle = dead ? '#222222' : '#0d0106';
    ctx.strokeStyle = dead ? '#555555' : pal.border;
    ctx.lineWidth = 1.3;

    ctx.beginPath();
    ctx.moveTo(cx - hw * 0.6, junctionY);
    ctx.lineTo(cx - hw * 0.4, junctionY + neckH);
    ctx.lineTo(cx + hw * 0.4, junctionY + neckH);
    ctx.lineTo(cx + hw * 0.6, junctionY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Continuous scarlet laser through the collar
    ctx.strokeStyle = dead ? '#888888' : pal.border;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx, junctionY);
    ctx.lineTo(cx, junctionY + neckH);
    ctx.stroke();

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
   * OVERHAULED HIT ANIMATION:
   * Razor-sharp cross laceration slash burst (/ and \) with spiky thorn silhouette,
   * shattering glass crystal shards (inspired by broken mirror & Image 5),
   * dispersing Lycoris petals, and acoustic soundwave ripples.
   */
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now, combo = 0) {
    const easeOut = 1 - Math.pow(1 - p, 3);
    const alpha = Math.max(0, 1.0 - Math.pow(p, 1.3));
    if (alpha <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const colBlade = isPerfect ? '#ff4d6d' : '#e11d48';
    const colCore = isPerfect ? '#ffffff' : '#fecdd3';

    // 1. Acoustic Soundwave Resonance Ripples
    const rippleR = (w * 0.18) + easeOut * (w * 0.52);
    const rippleAlpha = Math.max(0, (1.0 - p) * 0.6);
    ctx.lineWidth = Math.max(1, 2.2 * (1.0 - p));
    ctx.strokeStyle = `rgba(244, 63, 94, ${rippleAlpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Razor-Sharp Cross Laceration Slashes (X-Slash inspired by Phrolova's skills in Images 1, 2 & 3)
    const slashLen = (w * 0.28) + easeOut * (w * 0.55);
    const slashW = Math.max(1.5, 4.2 * (1.0 - p * 0.7));

    ctx.save();
    ctx.translate(cx, cy);

    // Slash 1: Diagonal \
    ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = colBlade;
    ctx.lineWidth = slashW;
    ctx.beginPath();
    ctx.moveTo(-slashLen, 0);
    // Jagged thorny laceration edge
    ctx.lineTo(-slashLen * 0.4, -4);
    ctx.lineTo(0, 0);
    ctx.lineTo(slashLen * 0.4, 4);
    ctx.lineTo(slashLen, 0);
    ctx.stroke();

    // Brilliant white core
    ctx.strokeStyle = colCore;
    ctx.lineWidth = slashW * 0.45;
    ctx.beginPath();
    ctx.moveTo(-slashLen * 0.85, 0);
    ctx.lineTo(slashLen * 0.85, 0);
    ctx.stroke();

    // Slash 2: Diagonal /
    ctx.rotate(-Math.PI / 2);
    ctx.strokeStyle = colBlade;
    ctx.lineWidth = slashW;
    ctx.beginPath();
    ctx.moveTo(-slashLen, 0);
    ctx.lineTo(-slashLen * 0.4, 4);
    ctx.lineTo(0, 0);
    ctx.lineTo(slashLen * 0.4, -4);
    ctx.lineTo(slashLen, 0);
    ctx.stroke();

    ctx.strokeStyle = colCore;
    ctx.lineWidth = slashW * 0.45;
    ctx.beginPath();
    ctx.moveTo(-slashLen * 0.85, 0);
    ctx.lineTo(slashLen * 0.85, 0);
    ctx.stroke();

    ctx.restore();

    // 3. Shattered Glass Crystal Shards (Inspired by broken mirror & Image 5)
    const shardCount = 8;
    ctx.fillStyle = 'rgba(255, 255, 255, ' + (alpha * 0.9) + ')';
    ctx.strokeStyle = 'rgba(244, 63, 94, ' + (alpha * 0.8) + ')';
    ctx.lineWidth = 0.8;

    for (let s = 0; s < shardCount; s++) {
      const angle = (s * Math.PI * 2 / shardCount) + (s * 0.35);
      const dist = (w * 0.12) + easeOut * (w * 0.48);
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;
      const sz = Math.max(2, 5 * (1.0 - p * 0.6));

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle + p * 2);
      ctx.beginPath();
      ctx.moveTo(0, -sz * 1.4);
      ctx.lineTo(sz * 0.8, 0);
      ctx.lineTo(0, sz * 1.4);
      ctx.lineTo(-sz * 0.8, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 4. Fluttering Lycoris Petals radiating outward
    const petalCount = 6;
    ctx.fillStyle = isPerfect ? '#ff4d6d' : '#e11d48';
    for (let i = 0; i < petalCount; i++) {
      const angle = (i * Math.PI * 2 / petalCount) + easeOut * 0.5;
      const dist = (w * 0.15) + easeOut * (w * 0.42);
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const pLen = Math.max(3, 7 * (1.0 - p * 0.7));

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle + Math.PI / 2);
      ctx.globalAlpha = alpha * 0.85;
      ctx.beginPath();
      ctx.moveTo(0, -pLen);
      ctx.bezierCurveTo(2.5, -pLen * 0.3, 1.8, pLen * 0.6, 0, pLen);
      ctx.bezierCurveTo(-1.8, pLen * 0.6, -2.5, -pLen * 0.3, 0, -pLen);
      ctx.fill();
      ctx.restore();
    }

    // 5. Central 4-point Diamond Star Flash (✦)
    if (p < 0.4) {
      const starP = p / 0.4;
      const sSize = Math.max(3, 12 * (1.0 - starP));
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - sSize);
      ctx.quadraticCurveTo(cx, cy, cx + sSize * 0.6, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy + sSize);
      ctx.quadraticCurveTo(cx, cy, cx - sSize * 0.6, cy);
      ctx.quadraticCurveTo(cx, cy, cx, cy - sSize);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  },

  // ==========================================================================
  // PROCEDURAL ATMOSPHERE & BACKGROUND (Интересный процедурный анимированный фон)
  // - The Shattered Gothic Mirror Arch Sigil in center with audio-reactive radial cracks
  // - Orbiting floating shattered glass crystal shards
  // - Flowing crimson Strings of Fate (soundweave threads) waving across upper hall
  // - Silhouette field of blooming Red Spider Lilies (Lycoris radiata) swaying at the bottom
  // - Falling fluttering Lycoris petals with 3D rotation
  // ==========================================================================
  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const gw = State.gameWidth || 400;
    const gh = State.gameHeight || 700;
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const pulse = State.bgPulse || 0;
    const now = songTime || 0;

    ctx.save();

    // ------------------------------------------------------------------------
    // 1. THE SHATTERED GOTHIC MIRROR ARCH SIGIL (В центре на заднем плане)
    // ------------------------------------------------------------------------
    const mcx = gw / 2;
    const mcy = gh * 0.38;
    const archW = Math.min(gw * 0.46, 170);
    const archH = archW * 1.55;
    const breath = Math.sin(now * 0.0018) * 0.03 + pulse * 0.09;
    const archAlpha = (isLight ? 0.12 : 0.22) + breath;

    // Outer Gothic Arch Silhouette
    ctx.strokeStyle = isLight ? `rgba(225, 29, 72, ${archAlpha})` : `rgba(244, 63, 94, ${archAlpha})`;
    ctx.lineWidth = 1.4;

    const archLeft = mcx - archW / 2;
    const archRight = mcx + archW / 2;
    const archBot = mcy + archH * 0.5;
    const archSpringY = mcy - archH * 0.15;
    const archTopY = mcy - archH * 0.5;

    ctx.beginPath();
    // Vertical columns
    ctx.moveTo(archLeft, archBot);
    ctx.lineTo(archLeft, archSpringY);
    // Pointed gothic arch curves meeting at top peak
    ctx.bezierCurveTo(archLeft, archTopY + archH * 0.12, mcx - archW * 0.15, archTopY, mcx, archTopY);
    ctx.bezierCurveTo(mcx + archW * 0.15, archTopY, archRight, archTopY + archH * 0.12, archRight, archSpringY);
    ctx.lineTo(archRight, archBot);
    ctx.lineTo(archLeft, archBot);
    ctx.stroke();

    // Inner concentric gothic arch
    const inPad = 12;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(archLeft + inPad, archBot - 4);
    ctx.lineTo(archLeft + inPad, archSpringY);
    ctx.bezierCurveTo(archLeft + inPad, archTopY + archH * 0.14, mcx - archW * 0.12, archTopY + inPad, mcx, archTopY + inPad);
    ctx.bezierCurveTo(mcx + archW * 0.12, archTopY + inPad, archRight - inPad, archTopY + archH * 0.14, archRight - inPad, archSpringY);
    ctx.lineTo(archRight - inPad, archBot - 4);
    ctx.stroke();

    // Shattered Mirror Crystalline Cracks radiating from center nexus (Audio-Reactive!)
    const crackAlpha = (isLight ? 0.18 : 0.35) + pulse * 0.35;
    ctx.strokeStyle = isLight ? `rgba(225, 29, 72, ${crackAlpha})` : `rgba(255, 115, 140, ${crackAlpha})`;
    ctx.lineWidth = 1.1;

    // Crack rays
    const crackAngles = [0.15, 0.65, 1.25, 1.85, 2.45, 3.10, 3.75, 4.40, 5.05, 5.70];
    const crackLenBase = archW * 0.38;
    ctx.beginPath();
    for (let c = 0; c < crackAngles.length; c++) {
      const ang = crackAngles[c];
      const cLen = crackLenBase * (0.6 + ((c * 37) % 5) * 0.1);
      const mx1 = mcx + Math.cos(ang) * (cLen * 0.45) + Math.sin(ang * 3) * 4;
      const my1 = mcy + Math.sin(ang) * (cLen * 0.45) - Math.cos(ang * 3) * 4;
      const mx2 = mcx + Math.cos(ang) * cLen;
      const my2 = mcy + Math.sin(ang) * cLen;

      ctx.moveTo(mcx, mcy);
      ctx.lineTo(mx1, my1);
      ctx.lineTo(mx2, my2);

      // Branching spiderweb micro-cracks
      const branchAng = ang + 0.38;
      ctx.lineTo(mx1 + Math.cos(branchAng) * (cLen * 0.3), my1 + Math.sin(branchAng) * (cLen * 0.3));
    }
    ctx.stroke();

    // Center radiant shattered nexus star
    const starFlashAlpha = 0.4 + pulse * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${starFlashAlpha})`;
    const sRad = 2.5 + pulse * 3.0;
    ctx.beginPath();
    ctx.arc(mcx, mcy, sRad, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting Shattered Glass Shards around the mirror arch
    const shardCount = 6;
    ctx.fillStyle = isLight ? 'rgba(225, 29, 72, 0.25)' : 'rgba(254, 205, 211, 0.32)';
    ctx.strokeStyle = isLight ? 'rgba(225, 29, 72, 0.4)' : 'rgba(255, 77, 109, 0.5)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < shardCount; i++) {
      const orbitAng = (now * 0.0006) + (i * Math.PI * 2 / shardCount);
      const orbitRx = archW * 0.58;
      const orbitRy = archH * 0.45;
      const shx = mcx + Math.cos(orbitAng) * orbitRx;
      const shy = mcy + Math.sin(orbitAng) * orbitRy;
      const shSz = 4 + (i % 3) * 2;

      ctx.save();
      ctx.translate(shx, shy);
      ctx.rotate(orbitAng * 2 + now * 0.001);
      ctx.beginPath();
      ctx.moveTo(0, -shSz);
      ctx.lineTo(shSz * 0.7, 0);
      ctx.lineTo(0, shSz);
      ctx.lineTo(-shSz * 0.7, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // ------------------------------------------------------------------------
    // 2. RESONANT STRINGS OF FATE (Скрипичные светящиеся нити звукоплетения)
    // ------------------------------------------------------------------------
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = isLight ? 'rgba(225, 29, 72, 0.22)' : 'rgba(244, 63, 94, 0.28)';
    const stringYPositions = [gh * 0.20, gh * 0.32, gh * 0.48];
    for (let s = 0; s < stringYPositions.length; s++) {
      const baseSy = stringYPositions[s];
      const phaseOffset = s * 2.2;
      ctx.beginPath();
      ctx.moveTo(0, baseSy);
      for (let x = 0; x <= gw; x += 30) {
        const wave = Math.sin(now * 0.0018 + x * 0.009 + phaseOffset) * (8 + pulse * 14);
        ctx.lineTo(x, baseSy + wave);
      }
      ctx.stroke();
    }

    // ------------------------------------------------------------------------
    // 3. SILHOUETTE FIELD OF RED SPIDER LILIES (Хиганбана / Ликорис вдоль пола)
    // ------------------------------------------------------------------------
    const floorY = gh * 0.88;
    const lilyAlpha = isLight ? 0.14 : 0.22;
    ctx.strokeStyle = isLight ? `rgba(225, 29, 72, ${lilyAlpha})` : `rgba(244, 63, 94, ${lilyAlpha})`;
    ctx.lineWidth = 1.1;

    // Soft glowing mist above the lily field
    const mistGrad = ctx.createLinearGradient(0, floorY - 60, 0, gh);
    mistGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    mistGrad.addColorStop(0.4, isLight ? 'rgba(255, 228, 230, 0.18)' : 'rgba(76, 5, 25, 0.22)');
    mistGrad.addColorStop(1, isLight ? 'rgba(255, 228, 230, 0.45)' : 'rgba(40, 3, 12, 0.45)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, floorY - 60, gw, gh - floorY + 60);

    // Procedural Lycoris blossoms spaced along the bottom
    const lilyCount = Math.max(6, Math.floor(gw / 60));
    for (let l = 0; l <= lilyCount; l++) {
      const lx = (l / lilyCount) * gw + (l % 2 === 0 ? 8 : -8);
      const ly = floorY + (l % 3) * 12;
      const sway = Math.sin(now * 0.002 + l * 1.5) * 4;

      // Central stem
      ctx.beginPath();
      ctx.moveTo(lx, gh);
      ctx.quadraticCurveTo(lx + sway * 0.5, ly + 20, lx + sway, ly);
      ctx.stroke();

      // Curved Lycoris Petals
      const petalSpan = 16;
      ctx.beginPath();
      // Left curling petals
      ctx.moveTo(lx + sway, ly);
      ctx.quadraticCurveTo(lx + sway - petalSpan * 0.6, ly - 8, lx + sway - petalSpan, ly - 3);
      ctx.moveTo(lx + sway, ly);
      ctx.quadraticCurveTo(lx + sway - petalSpan * 0.8, ly - 16, lx + sway - petalSpan * 0.9, ly - 14);
      // Right curling petals
      ctx.moveTo(lx + sway, ly);
      ctx.quadraticCurveTo(lx + sway + petalSpan * 0.6, ly - 8, lx + sway + petalSpan, ly - 3);
      ctx.moveTo(lx + sway, ly);
      ctx.quadraticCurveTo(lx + sway + petalSpan * 0.8, ly - 16, lx + sway + petalSpan * 0.9, ly - 14);
      ctx.stroke();

      // Long graceful upward-arching Stamens with pollen tips (Distinctive Lycoris feature!)
      const stamenH = 24;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(lx + sway, ly);
      ctx.quadraticCurveTo(lx + sway - 12, ly - stamenH * 0.7, lx + sway - 18, ly - stamenH);
      ctx.moveTo(lx + sway, ly);
      ctx.quadraticCurveTo(lx + sway - 5, ly - stamenH * 0.8, lx + sway - 8, ly - stamenH * 1.1);
      ctx.moveTo(lx + sway, ly);
      ctx.quadraticCurveTo(lx + sway + 5, ly - stamenH * 0.8, lx + sway + 8, ly - stamenH * 1.1);
      ctx.moveTo(lx + sway, ly);
      ctx.quadraticCurveTo(lx + sway + 12, ly - stamenH * 0.7, lx + sway + 18, ly - stamenH);
      ctx.stroke();
      ctx.lineWidth = 1.1;
    }

    // ------------------------------------------------------------------------
    // 4. DRIFTING CRIMSON LYCORIS PETALS & SILK THREAD PARTICLES
    // ------------------------------------------------------------------------
    if (!State.themeAtmosphereParticles || State.currentAtmosphereTheme !== 'phrolova') {
      State.currentAtmosphereTheme = 'phrolova';
      State.themeAtmosphereParticles = [];
      const count = 26;
      for (let i = 0; i < count; i++) {
        State.themeAtmosphereParticles.push({
          x: Math.random() * gw,
          y: Math.random() * gh,
          size: Math.random() * 5 + 4,
          speedY: Math.random() * 1.3 + 0.7,
          speedX: (Math.random() - 0.5) * 0.5,
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
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      p.y += p.speedY * warpMult * speedBoost;
      p.rot += p.rotSpeed;
      const sway = Math.sin((now + p.swayOffset) * p.swaySpeed) * 0.8;
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

    ctx.restore();
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
