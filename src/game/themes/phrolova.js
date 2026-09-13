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
    { min: 0,   max: 49,       name: 'crimson_rose',      border: 'rgba(190, 18, 60, 0.70)', glow: 'rgba(190, 18, 60, 0.45)', particleColors: ['#be123c', '#fda4af', '#e11d48'] },
    { min: 50,  max: 99,       name: 'blood_velvet',      border: 'rgba(225, 29, 72, 0.85)', glow: 'rgba(225, 29, 72, 0.60)', particleColors: ['#e11d48', '#fb7185', '#ffe4e6'] },
    { min: 100, max: 199,      name: 'lycoris_radiata',   border: 'rgba(244, 63, 94, 0.90)', glow: 'rgba(244, 63, 94, 0.70)', particleColors: ['#f43f5e', '#fda4af', '#fff1f2'] },
    { min: 200, max: 399,      name: 'scarlet_requiem',   border: 'rgba(255, 23, 68, 0.95)', glow: 'rgba(255, 23, 68, 0.80)', particleColors: ['#ff1744', '#ff4d6d', '#ffffff'] },
    { min: 400, max: 799,      name: 'claret_resonance',  border: 'rgba(255, 0, 85, 0.98)',  glow: 'rgba(255, 0, 85, 0.90)',  particleColors: ['#ff0055', '#ff758f', '#ffffff'] },
    { min: 800, max: Infinity, name: 'ash_requiem',       border: '#f8fafc',                  glow: 'rgba(225, 29, 72, 0.95)', particleColors: ['#f8fafc', '#ff1744', '#cbd5e1'] }
  ],

  getTier(combo) {
    const tiers = this.comboTiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (combo >= tiers[i].min) return tiers[i];
    }
    return tiers[0];
  },

  _resolveTierNum(tier) {
    if (typeof tier === 'number') return tier;
    if (tier && typeof tier === 'object') {
      if (typeof tier.min === 'number') return tier.min;
      if (typeof tier.tier === 'number') return tier.tier;
      if (typeof tier.name === 'string') tier = tier.name;
    }
    if (typeof tier === 'string') {
      const s = tier.toLowerCase();
      if (s === 'ash_requiem' || s === 'celestial_lily' || s === 'legendary' || s === 'gold_tier') return 800;
      if (s === 'claret_resonance' || s === 'royal_vermilion' || s === 'cosmic') return 400;
      if (s === 'scarlet_requiem' || s === 'fiery_carnation' || s === 'gold') return 200;
      if (s === 'lycoris_radiata' || s === 'rose_gold' || s === 'electric') return 100;
      if (s === 'blood_velvet') return 50;
      if (s === 'crimson_rose' || s === 'steel') return 0;
    }
    return 0;
  },

  getStringColors(combo = 0) {
    const tier = this._resolveTierNum(combo);
    if (tier >= 800) {
      return ['#f8fafc', '#e2e8f0', '#cbd5e1', '#ff1744'];
    }
    if (tier >= 400) {
      return ['#ffffff', '#fda4af', '#ff758f', '#ff0055'];
    }
    if (tier >= 200) {
      return ['#ffffff', '#fecdd3', '#fda4af', '#ff1744'];
    }
    if (tier >= 100) {
      return ['#fff1f2', '#fecdd3', '#fda4af', '#f43f5e'];
    }
    if (tier >= 50) {
      return ['#fecdd3', '#fda4af', '#f43f5e', '#e11d48'];
    }
    return ['#fda4af', '#fb7185', '#f43f5e', '#be123c'];
  },

  // Color palette by combo tier (Authentic Phrolova: Obsidian, Blood Crimson, Lycoris Ruby, Bordeaux Claret, Ash Platinum Silver — ZERO yellow/orange)
  _getPalette(tierInput, isDead = false) {
    if (isDead) {
      return {
        bgTop: '#1e293b', bgMid: '#0f172a', bgBot: '#050811',
        border: '#475569', core: '#94a3b8', ribbonGlow: 'rgba(71, 85, 105, 0.3)',
        starCol: '#94a3b8', stringCol: '#64748b', beadCol: '#94a3b8',
        gemCol: '#334155', obsCol: '#111827', trackBg: 'rgba(20, 25, 35, 0.40)'
      };
    }
    const tier = this._resolveTierNum(tierInput);

    if (tier >= 800) {
      // 800+: ash_requiem (Phrolova's Signature Ash-Platinum Silver & Bleeding Crimson)
      return {
        bgTop: '#2d3748', bgMid: '#1a202c', bgBot: '#0f172a',
        border: '#f8fafc', core: '#ffffff', ribbonGlow: 'rgba(225, 29, 72, 0.85)',
        starCol: '#ffffff', stringCol: '#e2e8f0', beadCol: '#f8fafc',
        gemCol: '#ff1744', obsCol: '#0f1117', trackBg: 'rgba(20, 24, 32, 0.45)'
      };
    }
    if (tier >= 400) {
      // 400+: claret_resonance (Royal Deep Claret Wine & Pure Diamond White)
      return {
        bgTop: '#6b0724', bgMid: '#430415', bgBot: '#180108',
        border: '#ff0055', core: '#ffffff', ribbonGlow: 'rgba(255, 0, 85, 0.80)',
        starCol: '#ffffff', stringCol: '#fda4af', beadCol: '#ff0055',
        gemCol: '#ff3366', obsCol: '#0d0106', trackBg: 'rgba(28, 2, 12, 0.45)'
      };
    }
    if (tier >= 200) {
      // 200+: scarlet_requiem (Pure Intense Neon Blood Scarlet)
      return {
        bgTop: '#7f1d1d', bgMid: '#450a0a', bgBot: '#190308',
        border: '#ff1744', core: '#ffffff', ribbonGlow: 'rgba(255, 23, 68, 0.75)',
        starCol: '#ffffff', stringCol: '#fecdd3', beadCol: '#ff1744',
        gemCol: '#ff2a55', obsCol: '#100105', trackBg: 'rgba(26, 2, 8, 0.45)'
      };
    }
    if (tier >= 100) {
      // 100+: lycoris_radiata (Radiant Spider Lily Carmine & Petal Pink)
      return {
        bgTop: '#831843', bgMid: '#4c0519', bgBot: '#1a0309',
        border: '#f43f5e', core: '#fff1f2', ribbonGlow: 'rgba(244, 63, 94, 0.70)',
        starCol: '#ffffff', stringCol: '#fda4af', beadCol: '#f43f5e',
        gemCol: '#fb7185', obsCol: '#0e0207', trackBg: 'rgba(24, 2, 9, 0.45)'
      };
    }
    if (tier >= 50) {
      // 50+: blood_velvet (Deep Blood Carmine Velvet)
      return {
        bgTop: '#6b0724', bgMid: '#390312', bgBot: '#170206',
        border: '#e11d48', core: '#ffe4e6', ribbonGlow: 'rgba(225, 29, 72, 0.60)',
        starCol: '#ffffff', stringCol: '#fda4af', beadCol: '#e11d48',
        gemCol: '#f43f5e', obsCol: '#0a0104', trackBg: 'rgba(22, 2, 7, 0.45)'
      };
    }
    // Tier 0 (0-49): crimson_rose (Dark Velvet Crimson & Void Obsidian)
    return {
      bgTop: '#4c0519', bgMid: '#28030c', bgBot: '#120105',
      border: '#be123c', core: '#fecdd3', ribbonGlow: 'rgba(190, 18, 60, 0.50)',
      starCol: '#ffffff', stringCol: '#fda4af', beadCol: '#be123c',
      gemCol: '#e11d48', obsCol: '#080104', trackBg: 'rgba(18, 2, 7, 0.45)'
    };
  },

  // ==========================================================================
  // NOTE SPRITE BAKING (Fast 60fps offscreen sprite caching)
  // - Obsidian-Crimson crystal body with razor-thorn laceration borders
  // - Luminous 4-pointed rhombus diamond star (✦) in center (Image 3)
  // - Delicate violin f-hole / Lycoris stamen filigree lines
  // ==========================================================================
  bakeTapNote(ctx, x, yTop, w, h, isLight, style) {
    const tier = this._resolveTierNum(style);
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
    ctx.strokeStyle = pal.border;
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
    ctx.fillStyle = pal.core;
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
    const tier = this._resolveTierNum(style);
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

  // Authentic Wuthering Waves Phrolova Soundweave Blade-Whip Segment
  // - Central faceted ruby resonance nucleus with specular core
  // - Sinuous double-hooked obsidian scythe wings (forward barb + sweeping curved sickle blade)
  // - Razor border rims and inner glowing crimson resonance veins
  _drawSoundweaveSegment(ctx, cx, ly, hw, pal, isDead, isHolding, now = 0, idx = 0) {
    const borderCol = isDead ? '#475569' : pal.border;
    const bodyCol   = isDead ? '#1e293b' : pal.obsCol;
    const coreCol   = isDead ? '#64748b' : (pal.gemCol || '#f43f5e');
    const sparkCol  = isDead ? '#94a3b8' : (pal.core || '#ffffff');

    ctx.save();

    // 1. Twin Sinuous Barbed Scythe Wings (Парные гарпунные крылья-лезвия)
    // Symmetrical left (side = -1) and right (side = 1)
    for (const side of [-1, 1]) {
      // 1A. Outer Obsidian Blade Body
      ctx.fillStyle   = bodyCol;
      ctx.strokeStyle = borderCol;
      ctx.lineWidth   = 1.4;

      ctx.beginPath();
      // Start at lower nucleus junction
      ctx.moveTo(cx + side * 4.5, ly + 5);
      // Forward-facing barb / tooth (передний шип-клык)
      ctx.quadraticCurveTo(cx + side * (hw * 0.25), ly + 8, cx + side * (hw * 0.44), ly + 9.5);
      // Sharp inward razor notch
      ctx.lineTo(cx + side * (hw * 0.32), ly + 3);
      // Sweeping main scythe blade curving outward and back
      ctx.quadraticCurveTo(cx + side * (hw * 0.72), ly - 4, cx + side * hw, ly - 16);
      // Razor sickle tip returning inward along concave inner curve
      ctx.quadraticCurveTo(cx + side * (hw * 0.46), ly - 9, cx + side * 4.5, ly - 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 1B. Inner Crimson Resonance Vein / Inlay (Световая резонансная бороздка)
      if (!isDead) {
        ctx.strokeStyle = coreCol;
        ctx.lineWidth   = 1.1;
        ctx.beginPath();
        ctx.moveTo(cx + side * 6, ly - 1);
        ctx.quadraticCurveTo(cx + side * (hw * 0.50), ly - 5, cx + side * (hw * 0.88), ly - 14);
        ctx.stroke();

        // Secondary razor barb highlight
        ctx.beginPath();
        ctx.moveTo(cx + side * 5, ly + 4);
        ctx.lineTo(cx + side * (hw * 0.38), ly + 7.5);
        ctx.stroke();

        // Razor tip sparkling diamond point
        ctx.fillStyle = sparkCol;
        ctx.beginPath();
        ctx.arc(cx + side * hw, ly - 16, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Central Faceted Ruby Resonance Nucleus (Гранёное рубиновое ядро)
    // 2A. Outer Faceted Bezel Housing
    ctx.fillStyle   = isDead ? '#0f172a' : pal.bgTop;
    ctx.strokeStyle = borderCol;
    ctx.lineWidth   = 1.3;

    ctx.beginPath();
    ctx.moveTo(cx, ly - 11);               // Top socket point
    ctx.lineTo(cx + 6, ly - 3);            // Upper right shoulder
    ctx.lineTo(cx + 4.5, ly + 6);          // Lower right hip
    ctx.lineTo(cx, ly + 11);               // Bottom socket point
    ctx.lineTo(cx - 4.5, ly + 6);          // Lower left hip
    ctx.lineTo(cx - 6, ly - 3);            // Upper left shoulder
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2B. Inner Glowing Ruby Facet
    ctx.fillStyle = coreCol;
    ctx.beginPath();
    ctx.moveTo(cx, ly - 7);
    ctx.lineTo(cx + 3.8, ly - 1);
    ctx.lineTo(cx, ly + 7);
    ctx.lineTo(cx - 3.8, ly - 1);
    ctx.closePath();
    ctx.fill();

    // 2C. Center Sparkling Specular Star Point
    ctx.fillStyle = sparkCol;
    ctx.beginPath();
    ctx.arc(cx, ly, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Holding energetic micro-spark
    if (isHolding && !isDead) {
      const pulse = Math.sin((now || 0) * 0.012 + idx * 0.8) * 0.5 + 0.5;
      ctx.strokeStyle = sparkCol;
      ctx.lineWidth   = 0.9;
      const rRay = 3.5 + pulse * 2.0;
      ctx.beginPath();
      ctx.moveTo(cx - rRay, ly); ctx.lineTo(cx + rRay, ly);
      ctx.moveTo(cx, ly - rRay); ctx.lineTo(cx, ly + rRay);
      ctx.stroke();
    }

    ctx.restore();
  },

  bakeLongTail(ctx, tailW, tailH, isLight, style) {
    const tier = this._resolveTierNum(style);
    const pal = this._getPalette(tier, false);
    const cx = tailW / 2;
    const hw = Math.round(tailW * 0.44);

    // 1. Ethereal Soundwave Resonance Aura along the whip axis
    const auraGrad = ctx.createLinearGradient(cx - hw * 0.9, 0, cx + hw * 0.9, 0);
    auraGrad.addColorStop(0,   'rgba(0, 0, 0, 0)');
    auraGrad.addColorStop(0.3, pal.ribbonGlow || 'rgba(225, 29, 72, 0.12)');
    auraGrad.addColorStop(0.5, pal.ribbonGlow || 'rgba(225, 29, 72, 0.22)');
    auraGrad.addColorStop(0.7, pal.ribbonGlow || 'rgba(225, 29, 72, 0.12)');
    auraGrad.addColorStop(1,   'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(cx - hw * 0.9, 0, hw * 1.8, tailH);

    // 2. Central Taut Crimson Soundweave Laser Cord
    ctx.strokeStyle = pal.ribbonGlow;
    ctx.lineWidth   = Math.min(18, hw * 0.85);
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, tailH);
    ctx.stroke();

    ctx.strokeStyle = pal.border;
    ctx.lineWidth   = 2.6;
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, tailH);
    ctx.stroke();

    ctx.strokeStyle = pal.core || '#ffffff';
    ctx.lineWidth   = 1.1;
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, tailH);
    ctx.stroke();

    // 3. Repeating Soundweave Barbed Scythe Segments
    const linkSpacing = 36;
    const numLinks = Math.max(1, Math.floor(tailH / linkSpacing));
    const effectiveSpacing = tailH / numLinks;

    for (let i = 0; i <= numLinks; i++) {
      const ly = i * effectiveSpacing;
      this._drawSoundweaveSegment(ctx, cx, ly, hw, pal, false, false, 0, i);
    }

    return true;
  },

  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    return this.bakeTapNote(ctx, x, yTop, w, h, isLight, comboTier);
  },

  // ==========================================================================
  // PROCEDURAL HOLD BODY — THORNED WHIP / SEGMENTED BLADES / BLOOD SLASH
  // - Straight, taut razor energy string (NO snaking/undulation)
  // - Standard tail width: bodyLaneW = Math.max(10, Math.round(w - 16))
  // - Alternating thorn pairs: Long pair vs Short pair (через 1 пару разной длины)
  // - Hooked sickle claws rounded backwards (шыпы заокруглены назад)
  // - Central glowing scarlet/crimson energy incision ("Кровавый след")
  // - Full color palette adaptation across all 6 combo tiers
  // ==========================================================================
  // ==========================================================================
  // PROCEDURAL HOLD BODY — AUTHENTIC SOUNDWEAVE BLADE-WHIP
  // - Ethereal soundwave acoustic resonance aura (NO solid dark rectangle!)
  // - Straight, taut crimson laser cord
  // - Repeating barbed scythe segments with faceted ruby cores and obsidian wings
  // - Dynamic energy pulse down the cord when holding
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

    const bodyLaneW = Math.max(10, Math.round(w - 16));
    const bodyX = Math.round(x + 8);
    const cx = bodyX + bodyLaneW / 2;
    const headTopY = (actualYHeadTop !== null && actualYHeadTop !== undefined) ? actualYHeadTop : (yTail + tailH);
    const hw = Math.round(bodyLaneW * 0.44); // Authentic wide reach of barbed wings

    ctx.save();

    // 1. Ethereal Soundwave Resonance Aura along the whip axis (NO solid dark rectangle!)
    if (!dead) {
      // Soft crimson soundwave dispersion halo
      const auraGrad = ctx.createLinearGradient(cx - hw * 0.9, 0, cx + hw * 0.9, 0);
      auraGrad.addColorStop(0,   'rgba(0, 0, 0, 0)');
      auraGrad.addColorStop(0.3, pal.ribbonGlow || 'rgba(225, 29, 72, 0.12)');
      auraGrad.addColorStop(0.5, pal.ribbonGlow || 'rgba(225, 29, 72, 0.22)');
      auraGrad.addColorStop(0.7, pal.ribbonGlow || 'rgba(225, 29, 72, 0.12)');
      auraGrad.addColorStop(1,   'rgba(0, 0, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.fillRect(cx - hw * 0.9, yTail, hw * 1.8, tailH);

      // Subtle high-frequency soundwave acoustic lines along the sides
      ctx.strokeStyle = pal.border + '33';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(bodyX + 2, yTail); ctx.lineTo(bodyX + 2, headTopY);
      ctx.moveTo(bodyX + bodyLaneW - 2, yTail); ctx.lineTo(bodyX + bodyLaneW - 2, headTopY);
      ctx.stroke();
    }

    // 2. Central Taut Crimson Soundweave Laser Cord (Натянутая лазерная струна)
    // 2A. Soft Outer Bloom
    if (!dead) {
      ctx.strokeStyle = pal.ribbonGlow;
      ctx.lineWidth   = Math.min(18, hw * 0.85);
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();
    }

    // 2B. Razor Crimson Energy Line
    ctx.strokeStyle = dead ? '#666666' : pal.border;
    ctx.lineWidth   = 2.6;
    ctx.beginPath();
    ctx.moveTo(cx, yTail);
    ctx.lineTo(cx, headTopY);
    ctx.stroke();

    // 2C. Incandescent Laser Filament
    ctx.strokeStyle = dead ? '#999999' : (pal.core || '#ffffff');
    ctx.lineWidth   = 1.1;
    ctx.beginPath();
    ctx.moveTo(cx, yTail);
    ctx.lineTo(cx, headTopY);
    ctx.stroke();

    // 3. Repeating Authentic Soundweave Barbed Scythe Segments
    const linkSpacing = 36;
    const startY = headTopY - 18;
    const endY = yTail + 14;

    if (startY > endY) {
      const numLinks = Math.max(1, Math.floor((startY - endY) / linkSpacing));
      const effectiveSpacing = (startY - endY) / numLinks;

      for (let i = 0; i <= numLinks; i++) {
        const ly = startY - i * effectiveSpacing;
        this._drawSoundweaveSegment(ctx, cx, ly, hw, pal, dead, holding, now, i);
      }

      // 4. Holding/Audio energetic resonance pulse down the cord
      if (holding && !dead) {
        const pulseOffset = ((now || 0) * 0.16) % effectiveSpacing;
        ctx.fillStyle = pal.core || '#ffffff';
        ctx.beginPath();
        for (let i = 0; i <= numLinks; i++) {
          const py = startY - i * effectiveSpacing - pulseOffset;
          if (py >= yTail && py <= headTopY) {
            ctx.moveTo(cx + 2.5, py);
            ctx.arc(cx, py, 2.5, 0, Math.PI * 2);
          }
        }
        ctx.fill();
      }
    }

    ctx.restore();
    return true;
  },

  // ==========================================================================
  // HOLD TAIL TIP (Резонансная сфера звукоплетения и оконечный шпиль)
  // - Authentic radiant Crimson Resonance Orb per Screenshot 1
  // - 4-pointed radiant flare and terminal stiletto spearhead
  // - Dynamic anti-overlap safety clamping
  // ==========================================================================
  drawHoldTail(ctx, x, yTail, w, headH, tile, isLight, now, tailH = 0, currentCombo = 0, actualYHeadTop = null, nextTileDist = 9999) {
    const bodyW = Math.max(10, Math.round(w - 16));
    const bodyX = Math.round(x + 8);
    const cx = bodyX + bodyW / 2;
    const hw = Math.round(bodyW * 0.44);

    const dead = tile && tile.failed;
    const liveCombo = (currentCombo !== undefined && currentCombo !== null && currentCombo > 0)
      ? currentCombo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : (tile?.style?.tier || 0));

    const tier = dead ? 0 : liveCombo;
    const pal = this._getPalette(tier, dead);

    // Dynamic anti-overlap safety clamping: guarantee tail tip never breaches the next incoming note
    const availableGap = (typeof nextTileDist === 'number' && nextTileDist > 0) ? nextTileDist : 9999;
    const maxSafeTailLen = Math.max(8, Math.round(availableGap - 16));
    const baseTailLen = Math.min(42, Math.round(headH * 0.55));
    const tailLen = Math.min(baseTailLen, maxSafeTailLen);

    if (tailLen <= 6) return;

    const tipY = yTail - tailLen;
    ctx.save();

    // 1. Terminal Stiletto Spearhead with Flared Barbs (Оконечный гарпунный шпиль)
    ctx.fillStyle   = dead ? '#222222' : pal.obsCol;
    ctx.strokeStyle = dead ? '#555555' : pal.border;
    ctx.lineWidth   = 1.3;

    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.lineTo(cx + hw * 0.38, yTail - tailLen * 0.45);
    ctx.lineTo(cx + hw * 0.22, yTail - tailLen * 0.25);
    ctx.lineTo(cx + hw * 0.12, yTail);
    ctx.lineTo(cx - hw * 0.12, yTail);
    ctx.lineTo(cx - hw * 0.22, yTail - tailLen * 0.25);
    ctx.lineTo(cx - hw * 0.38, yTail - tailLen * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Stiletto razor spine
    ctx.strokeStyle = dead ? '#888888' : pal.core;
    ctx.lineWidth   = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, yTail);
    ctx.lineTo(cx, tipY);
    ctx.stroke();

    // 2. Radiant Crimson Resonance Orb (Сфера резонанса Звукоплетения per Screenshot 1)
    const orbY = yTail - tailLen * 0.35;
    const orbR = 7.0;

    // Outer aura halo
    if (!dead) {
      const og = ctx.createRadialGradient(cx, orbY, 1, cx, orbY, orbR * 2.8);
      og.addColorStop(0,    pal.core || '#ffffff');
      og.addColorStop(0.35, pal.border);
      og.addColorStop(0.70, pal.ribbonGlow || 'rgba(225, 29, 72, 0.4)');
      og.addColorStop(1,    'rgba(0, 0, 0, 0)');
      ctx.fillStyle = og;
      ctx.beginPath();
      ctx.arc(cx, orbY, orbR * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // 4-Pointed Radiant Lens Star Flare
      const flareLen = orbR * 2.8;
      ctx.strokeStyle = pal.core || '#ffffff';
      ctx.lineWidth   = 1.1;
      ctx.beginPath();
      ctx.moveTo(cx - flareLen, orbY); ctx.lineTo(cx + flareLen, orbY);
      ctx.moveTo(cx, orbY - flareLen * 1.2); ctx.lineTo(cx, orbY + flareLen * 1.2);
      ctx.stroke();
    }

    // Solid Ruby Sphere Core
    ctx.fillStyle = dead ? '#666666' : (pal.gemCol || pal.border);
    ctx.beginPath();
    ctx.arc(cx, orbY, orbR * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Specular center point
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, orbY, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // ==========================================================================
  // NECK JUNCTION COLLAR (Armored obsidian coupling locking whip into note head)
  // ==========================================================================
  drawNeck(ctx, x, junctionY, w, headH, tile, isReleased = false, currentCombo = 0) {
    const bodyW = Math.max(10, Math.round(w - 16));
    const bodyX = Math.round(x + 8);
    const cx = bodyX + bodyW / 2;
    const neckH = Math.min(12, Math.round(headH * 0.26));

    const dead = isReleased || Boolean(tile && tile.failed);
    const liveCombo = (currentCombo !== undefined && currentCombo !== null && currentCombo > 0)
      ? currentCombo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : 0);
    const pal = this._getPalette(dead ? 0 : liveCombo, dead);

    ctx.save();

    // Armored obsidian coupling collar locking the whip cord into note head
    ctx.fillStyle   = dead ? '#1e293b' : pal.obsCol;
    ctx.strokeStyle = dead ? '#475569' : pal.border;
    ctx.lineWidth   = 1.4;

    ctx.beginPath();
    ctx.moveTo(cx - 7, junctionY - 4);
    ctx.lineTo(cx + 7, junctionY - 4);
    ctx.lineTo(cx + 10, junctionY + neckH);
    ctx.lineTo(cx - 10, junctionY + neckH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central diamond lock gem
    ctx.fillStyle = dead ? '#666666' : (pal.gemCol || pal.border);
    ctx.beginPath();
    ctx.moveTo(cx, junctionY - 2);
    ctx.lineTo(cx + 3.5, junctionY + neckH * 0.5);
    ctx.lineTo(cx, junctionY + neckH + 1);
    ctx.lineTo(cx - 3.5, junctionY + neckH * 0.5);
    ctx.closePath();
    ctx.fill();

    // Continuous laser filament through the collar
    ctx.strokeStyle = dead ? '#999999' : (pal.core || '#ffffff');
    ctx.lineWidth   = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, junctionY - 4);
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

    const pal = this._getPalette(combo);
    const colBlade = isPerfect ? (combo >= 800 ? '#f8fafc' : pal.border) : pal.gemCol;
    const colCore = isPerfect ? '#ffffff' : (combo >= 800 ? '#ffffff' : pal.core);

    // 1. Acoustic Soundwave Resonance Ripples
    const rippleR = (w * 0.16) + easeOut * (w * 0.56);
    const rippleAlpha = Math.max(0, (1.0 - p) * 0.65);
    ctx.lineWidth = Math.max(1, 2.2 * (1.0 - p));
    ctx.strokeStyle = (combo >= 800) ? `rgba(248, 250, 252, ${rippleAlpha})` : `rgba(244, 63, 94, ${rippleAlpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Authentic Wuthering Waves Razor Shatter Star (Колючая звезда разрушения per Screenshot 2)
    // 8 razor obsidian spikes with vivid glowing crimson outer contours
    const starR = (w * 0.24) + easeOut * (w * 0.56);
    const innerR = starR * 0.26;
    const numPoints = 8;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(p * 0.35);

    // 2A. Spiked Obsidian Star Silhouette
    ctx.beginPath();
    for (let i = 0; i < numPoints * 2; i++) {
      const angle = (i * Math.PI) / numPoints;
      // Alternate primary long spikes vs secondary intermediate spikes
      const isTip = (i % 2 === 0);
      const isMajor = (i % 4 === 0);
      const r = isTip ? (isMajor ? starR : starR * 0.68) : innerR;
      const sx = Math.cos(angle) * r;
      const sy = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();

    ctx.fillStyle = `rgba(18, 2, 7, ${alpha * 0.92})`;
    ctx.fill();
    ctx.strokeStyle = colBlade;
    ctx.lineWidth = Math.max(1, 2.4 * (1.0 - p * 0.5));
    ctx.stroke();

    // 2B. Central Soundweave 4-Pointed Star Radiant Seal (✦)
    const sealR = innerR * 1.4;
    ctx.fillStyle = colCore;
    ctx.beginPath();
    ctx.moveTo(0, -sealR);
    ctx.quadraticCurveTo(0, 0, sealR * 0.45, 0);
    ctx.quadraticCurveTo(0, 0, 0, sealR);
    ctx.quadraticCurveTo(0, 0, -sealR * 0.45, 0);
    ctx.quadraticCurveTo(0, 0, 0, -sealR);
    ctx.closePath();
    ctx.fill();

    // 2C. Crimson Electrical Discharge Arcs (Молнии резонанса)
    if (isPerfect) {
      ctx.strokeStyle = colCore;
      ctx.lineWidth = 1.1;
      for (let a = 0; a < 4; a++) {
        const aAngle = (a * Math.PI / 2) + p * 1.6;
        const dist = starR * 0.88;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(aAngle) * (dist * 0.45) + (a % 2 === 0 ? 4 : -4), Math.sin(aAngle) * (dist * 0.45) + (a % 2 === 0 ? -4 : 4));
        ctx.lineTo(Math.cos(aAngle) * dist, Math.sin(aAngle) * dist);
        ctx.stroke();
      }
    }

    ctx.restore();

    // 3. Dispersing Lycoris radiata Flower Petals & Glass Shards
    const shardCount = 7;
    for (let s = 0; s < shardCount; s++) {
      const angle = (s * Math.PI * 2 / shardCount) + (s * 0.4);
      const dist = (w * 0.15) + easeOut * (w * 0.60);
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const sz = Math.max(2, 5.5 * (1.0 - p * 0.65));

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle + p * 2.5);

      // Curved Lycoris Petal
      ctx.fillStyle = `rgba(225, 29, 72, ${alpha * 0.85})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.65})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -sz * 1.3);
      ctx.quadraticCurveTo(sz * 0.7, 0, 0, sz * 1.3);
      ctx.quadraticCurveTo(-sz * 0.7, 0, 0, -sz * 1.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
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
    const gw = ctx.canvas?.width || State?.gameWidth || 400;
    const gh = ctx.canvas?.height || State?.gameHeight || 700;
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const pulse = State.bgPulse || 0;
    const now = songTime || 0;
    const combo = State.combo || 0;
    const pal = this._getPalette(combo);

    ctx.save();

    // ------------------------------------------------------------------------
    // 1. THE SHATTERED GOTHIC MIRROR ARCH SIGIL (В центре на заднем плане)
    // ------------------------------------------------------------------------
    const mcx = gw / 2;
    const mcy = gh * 0.38;
    const archW = Math.min(gw * 0.48, 180);
    const archH = archW * 1.55;
    const breath = Math.sin(now * 0.0018) * 0.03 + pulse * 0.10;
    const archAlpha = (isLight ? 0.16 : 0.28) + breath;

    const archLeft = mcx - archW / 2;
    const archRight = mcx + archW / 2;
    const archBot = mcy + archH * 0.5;
    const archSpringY = mcy - archH * 0.15;
    const archTopY = mcy - archH * 0.5;

    // Dark crimson obsidian glass backing fill
    const mirrorFill = ctx.createLinearGradient(mcx, archTopY, mcx, archBot);
    mirrorFill.addColorStop(0, isLight ? 'rgba(254, 205, 211, 0.15)' : 'rgba(42, 5, 14, 0.55)');
    mirrorFill.addColorStop(0.5, isLight ? 'rgba(244, 63, 94, 0.08)' : 'rgba(20, 2, 7, 0.65)');
    mirrorFill.addColorStop(1, 'rgba(8, 1, 4, 0.75)');
    ctx.fillStyle = mirrorFill;

    ctx.beginPath();
    ctx.moveTo(archLeft, archBot);
    ctx.lineTo(archLeft, archSpringY);
    ctx.bezierCurveTo(archLeft, archTopY + archH * 0.12, mcx - archW * 0.15, archTopY, mcx, archTopY);
    ctx.bezierCurveTo(mcx + archW * 0.15, archTopY, archRight, archTopY + archH * 0.12, archRight, archSpringY);
    ctx.lineTo(archRight, archBot);
    ctx.closePath();
    ctx.fill();

    // Outer Gothic Arch Silhouette (adapts to combo!)
    ctx.strokeStyle = isLight ? `rgba(225, 29, 72, ${archAlpha})` : ((combo >= 800) ? `rgba(248, 250, 252, ${archAlpha})` : pal.border);
    ctx.lineWidth = 1.4;
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
    const crackAlpha = (isLight ? 0.20 : 0.40) + pulse * 0.40;
    ctx.strokeStyle = isLight ? `rgba(225, 29, 72, ${crackAlpha})` : ((combo >= 800) ? `rgba(248, 250, 252, ${crackAlpha})` : pal.border);
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
    const shardCount = 8;
    ctx.fillStyle = isLight ? 'rgba(225, 29, 72, 0.25)' : 'rgba(254, 205, 211, 0.35)';
    ctx.strokeStyle = isLight ? 'rgba(225, 29, 72, 0.4)' : ((combo >= 800) ? 'rgba(248, 250, 252, 0.6)' : pal.border);
    ctx.lineWidth = 0.8;
    for (let i = 0; i < shardCount; i++) {
      const orbitAng = (now * 0.0006) + (i * Math.PI * 2 / shardCount);
      const orbitRx = archW * 0.60;
      const orbitRy = archH * 0.46;
      const shx = mcx + Math.cos(orbitAng) * orbitRx;
      const shy = mcy + Math.sin(orbitAng) * orbitRy;
      const shSz = 4 + (i % 3) * 2.5;

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
    // 2. RESONANT STRINGS OF FATE (4 Вертикальные светящиеся струны Звукоплетения)
    // ------------------------------------------------------------------------
    const stringCount = 4;
    ctx.lineWidth = 1.2;
    for (let s = 0; s < stringCount; s++) {
      const sx = (gw / (stringCount + 1)) * (s + 1);
      const stringAlpha = (isLight ? 0.18 : 0.26) + pulse * 0.22;
      ctx.strokeStyle = isLight ? `rgba(225, 29, 72, ${stringAlpha})` : `rgba(244, 63, 94, ${stringAlpha})`;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      for (let y = 0; y <= gh; y += 24) {
        const wave = Math.sin(now * 0.003 + y * 0.012 + s * 1.5) * (3 + pulse * 7);
        ctx.lineTo(sx + wave, y);
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
