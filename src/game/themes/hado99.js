// ============================================================================
// HADO 99 THEME MODULE — Sōsuke Aizen & Hadō #99: Goryūtenmetsu (破道の九十九 五龍転滅)
// Features:
// - Top-down dragon head matching user sketch with rich multi-tonal shading
// - Seamless long note body and tail matching user tail sketch (barbed arrowhead spade blade,
//   vertebrae chain, lateral fin spikes)
// - Unique color palettes for each combo tier (0, 50, 100, 200, 400, and 800+ Gold)
// ============================================================================

// Preload multi-tonal dragon head sprites for all combo tiers
const dragonSprites = {
  tier0: typeof Image !== 'undefined' ? new Image() : null,
  tier1: typeof Image !== 'undefined' ? new Image() : null,
  tier2: typeof Image !== 'undefined' ? new Image() : null,
  tier3: typeof Image !== 'undefined' ? new Image() : null,
  tier4: typeof Image !== 'undefined' ? new Image() : null,
  tier5: typeof Image !== 'undefined' ? new Image() : null,
  dead:  typeof Image !== 'undefined' ? new Image() : null
};
if (dragonSprites.tier0) dragonSprites.tier0.src = './assets/themes/hado99_dragon_tier0.png?v=71.5';
if (dragonSprites.tier1) dragonSprites.tier1.src = './assets/themes/hado99_dragon_tier1.png?v=71.5';
if (dragonSprites.tier2) dragonSprites.tier2.src = './assets/themes/hado99_dragon_tier2.png?v=71.5';
if (dragonSprites.tier3) dragonSprites.tier3.src = './assets/themes/hado99_dragon_tier3.png?v=71.5';
if (dragonSprites.tier4) dragonSprites.tier4.src = './assets/themes/hado99_dragon_tier4.png?v=71.5';
if (dragonSprites.tier5) dragonSprites.tier5.src = './assets/themes/hado99_dragon_tier5.png?v=71.5';
if (dragonSprites.dead)  dragonSprites.dead.src  = './assets/themes/hado99_dragon_dead.png?v=71.5';

export const HADO99_THEME = {
  id: 'hado99',
  nameKey: 'themeHado99',
  descKey: 'themeHado99Desc',
  badgeKey: 'themeHado99Badge',
  price: 100,
  unlockedByDefault: false,
  accentColor: '#c084fc',
  previewBg: 'linear-gradient(135deg, #070110, #1b052f, #3b0764, #05000a)',
  colors: {
    bgCenter: '#150328',
    bgMid: '#0a0115',
    bgOuter: '#030008',
    bgAura: 'rgba(192, 132, 252, 0.25)',
    strings: ['#f3e8ff', '#d8b4fe', '#c084fc', '#9333ea'],
    stringGlow: 'rgba(192, 132, 252, 0.65)',
    receptorBorder: 'rgba(232, 121, 249, 0.85)',
    particleType: 'reiatsu_dragon'
  },
  comboTiers: [
    { min: 0,   max: 49,       name: 'reikaku_awakening', border: '#9333ea', glow: 'rgba(147, 51, 234, 0.55)', particleColors: ['#c084fc', '#a855f7', '#7e22ce'] },
    { min: 50,  max: 99,       name: 'kyoka_suigetsu',    border: '#c084fc', glow: 'rgba(192, 132, 252, 0.65)', particleColors: ['#e9d5ff', '#d8b4fe', '#c084fc'] },
    { min: 100, max: 199,      name: 'kurohitsugi',       border: '#d946ef', glow: 'rgba(217, 70, 239, 0.70)', particleColors: ['#f5d0fe', '#d946ef', '#9333ea'] },
    { min: 200, max: 399,      name: 'las_noches',        border: '#f0abfc', glow: 'rgba(240, 171, 252, 0.80)', particleColors: ['#ffffff', '#fdf4ff', '#e879f9'] },
    { min: 400, max: 799,      name: 'hogyoku_fusion',    border: '#e879f9', glow: 'rgba(232, 121, 249, 0.85)', particleColors: ['#fdf4ff', '#e879f9', '#d946ef'] },
    { min: 800, max: Infinity, name: 'goryutenmetsu',     border: '#ffd700', glow: 'rgba(251, 191, 36, 0.95)', particleColors: ['#ffffff', '#ffd700', '#fbbf24'] }
  ],

  getTier(combo) {
    const tiers = this.comboTiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (combo >= tiers[i].min) return tiers[i];
    }
    return tiers[0];
  },

  // Pick dragon head sprite matching the combo tier
  _getDragonSprite(tier, isDead) {
    if (isDead) return dragonSprites.dead;
    if (tier >= 800) return dragonSprites.tier5;
    if (tier >= 400) return dragonSprites.tier4;
    if (tier >= 200) return dragonSprites.tier3;
    if (tier >= 100) return dragonSprites.tier2;
    if (tier >= 50)  return dragonSprites.tier1;
    return dragonSprites.tier0;
  },

  // Multi-tonal color palette for body, tail and effects by combo tier
  _getTierPalette(tier, isDead, isHolding) {
    if (isDead) {
      return {
        bgTop: '#0f172a', bgBot: '#1e293b',
        borderCol: '#334155', chevronCol: 'rgba(100, 116, 139, 0.40)',
        spineCol: '#64748b', beadCol: '#94a3b8',
        bladeCol: '#1e293b', bladeBorder: '#475569',
        finSpikeCol: '#1e293b', lightningCol: '#64748b',
        auraCol: 'rgba(71, 85, 105, 0.35)', breathCol: '#64748b'
      };
    }
    if (tier >= 800) { // Tier 5: Goryutenmetsu Gold (800+)
      return {
        bgTop: '#78350f', bgBot: '#b45309',
        borderCol: '#fbbf24', chevronCol: 'rgba(253, 224, 71, 0.60)',
        spineCol: '#ffffff', beadCol: '#fef08a',
        bladeCol: '#d97706', bladeBorder: '#fde68a',
        finSpikeCol: '#b45309', lightningCol: '#ffffff',
        auraCol: 'rgba(251, 191, 36, 0.50)', breathCol: '#fbbf24'
      };
    }
    if (tier >= 400) { // Tier 4: Hogyoku Fusion (400-799)
      return {
        bgTop: isHolding ? '#701a75' : '#4a044e', bgBot: isHolding ? '#be185d' : '#9d174d',
        borderCol: '#fb7185', chevronCol: 'rgba(254, 240, 138, 0.55)',
        spineCol: '#fef08a', beadCol: '#ffffff',
        bladeCol: '#be185d', bladeBorder: '#fef08a',
        finSpikeCol: '#9d174d', lightningCol: '#fef08a',
        auraCol: 'rgba(251, 113, 133, 0.45)', breathCol: '#f472b6'
      };
    }
    if (tier >= 200) { // Tier 3: Las Noches (200-399)
      return {
        bgTop: isHolding ? '#581c87' : '#3b0764', bgBot: isHolding ? '#a21caf' : '#86198f',
        borderCol: '#e879f9', chevronCol: 'rgba(245, 208, 254, 0.50)',
        spineCol: '#ffffff', beadCol: '#ffffff',
        bladeCol: '#a21caf', bladeBorder: '#ffffff',
        finSpikeCol: '#86198f', lightningCol: '#ffffff',
        auraCol: 'rgba(232, 121, 249, 0.45)', breathCol: '#e879f9'
      };
    }
    if (tier >= 100) { // Tier 2: Kurohitsugi (100-199)
      return {
        bgTop: isHolding ? '#4a044e' : '#2e0854', bgBot: isHolding ? '#86198f' : '#701a75',
        borderCol: '#d946ef', chevronCol: 'rgba(232, 121, 249, 0.45)',
        spineCol: '#f5d0fe', beadCol: '#fae8ff',
        bladeCol: '#86198f', bladeBorder: '#f0abfc',
        finSpikeCol: '#701a75', lightningCol: '#f5d0fe',
        auraCol: 'rgba(217, 70, 239, 0.40)', breathCol: '#d946ef'
      };
    }
    if (tier >= 50) { // Tier 1: Kyoka Suigetsu (50-99)
      return {
        bgTop: isHolding ? '#3b0764' : '#1e0538', bgBot: isHolding ? '#6b1da8' : '#4c1d95',
        borderCol: '#c084fc', chevronCol: 'rgba(216, 180, 254, 0.40)',
        spineCol: '#e9d5ff', beadCol: '#f3e8ff',
        bladeCol: '#6b1da8', bladeBorder: '#e9d5ff',
        finSpikeCol: '#581c87', lightningCol: '#e9d5ff',
        auraCol: 'rgba(192, 132, 252, 0.40)', breathCol: '#c084fc'
      };
    }
    // Tier 0: Reikaku Awakening (0-49)
    return {
      bgTop: isHolding ? '#2e0854' : '#150328', bgBot: isHolding ? '#581c87' : '#3b0764',
      borderCol: 'rgba(168, 85, 247, 0.85)', chevronCol: 'rgba(192, 132, 252, 0.35)',
      spineCol: '#d8b4fe', beadCol: '#e9d5ff',
      bladeCol: '#581c87', bladeBorder: '#d8b4fe',
      finSpikeCol: '#3b0764', lightningCol: '#d8b4fe',
      auraCol: 'rgba(168, 85, 247, 0.38)', breathCol: '#a855f7'
    };
  },

  // ==========================================================================
  // DRAGON HEAD RENDERER (TOP-DOWN AERIAL VIEW per user sketch)
  // Multi-tonal shaded segmented horns, scalloped crown collar, side quills, snout (no eyes).
  // ==========================================================================
  _drawDragonHead(ctx, cx, cy, w, h, tier, isDead) {
    const pal = this._getTierPalette(tier, isDead, false);
    const sprite = this._getDragonSprite(tier, isDead);

    ctx.save();

    // 1. Soft Reiatsu Aura behind head
    const auraG = ctx.createRadialGradient(cx, cy, w * 0.1, cx, cy, w * 0.65);
    auraG.addColorStop(0,   pal.auraCol);
    auraG.addColorStop(0.65, 'rgba(20, 5, 40, 0.10)');
    auraG.addColorStop(1,   'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraG;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.58, h * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw preloaded multi-tonal dragon head sprite
    let drawnFromSprite = false;
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      const targetH = h * 0.94;
      const targetW = targetH * (246 / 371);
      const drawW   = Math.min(w * 0.96, targetW);
      const drawH   = drawW / (246 / 371);
      const drawX   = cx - drawW / 2;
      const drawY   = cy - drawH / 2;

      ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
      drawnFromSprite = true;
    }

    // Procedural fallback if image is not yet loaded
    if (!drawnFromSprite) {
      const scale = Math.min(w / 246, h / 371) * 0.92;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      ctx.fillStyle = pal.bgBot;
      ctx.strokeStyle = pal.borderCol;
      ctx.lineWidth = 2.0;

      // Scalloped neck collar (top)
      ctx.beginPath();
      ctx.moveTo(-45, -120); ctx.lineTo(-25, -150); ctx.lineTo(0, -135);
      ctx.lineTo(25, -150); ctx.lineTo(45, -120); ctx.lineTo(0, -90);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Middle crown plate
      ctx.beginPath();
      ctx.moveTo(-35, -70); ctx.lineTo(-18, -100); ctx.lineTo(0, -85);
      ctx.lineTo(18, -100); ctx.lineTo(35, -70); ctx.lineTo(0, -45);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Front chevron
      ctx.beginPath();
      ctx.moveTo(-24, -20); ctx.lineTo(0, -55); ctx.lineTo(24, -20);
      ctx.lineTo(0, 15); ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Snout (bottom)
      ctx.fillStyle = pal.bgTop;
      ctx.beginPath();
      ctx.moveTo(-30, 20); ctx.lineTo(30, 20);
      ctx.lineTo(20, 120); ctx.lineTo(16, 145);
      ctx.lineTo(-16, 145); ctx.lineTo(-20, 120);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Snout nostrils & bridge
      ctx.strokeStyle = pal.spineCol;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-10, 132); ctx.lineTo(-5, 140);
      ctx.moveTo(10, 132); ctx.lineTo(5, 140);
      ctx.moveTo(0, 80); ctx.lineTo(0, 120);
      ctx.stroke();

      // Segmented Horns
      for (const side of [-1, 1]) {
        for (let s = 0; s < 7; s++) {
          const t = s / 7;
          const y0 = 20 - t * 180;
          const x0 = side * (32 + Math.sin(t * 2.2) * 55);
          ctx.beginPath();
          ctx.ellipse(x0, y0, 14 * (1 - t * 0.7), 12, side * 0.25, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(side * 30, 20);
        ctx.quadraticCurveTo(side * 85, -40, side * 92, -90);
        ctx.stroke();
      }
    }

    // 3. Radiant Reiatsu breath glow at snout tip
    if (!isDead) {
      const snoutY = cy + h * 0.44;
      const bG = ctx.createRadialGradient(cx, snoutY, 0.5, cx, snoutY, w * 0.20);
      bG.addColorStop(0,   '#ffffff');
      bG.addColorStop(0.3, pal.breathCol);
      bG.addColorStop(0.7, pal.auraCol);
      bG.addColorStop(1,   'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bG;
      ctx.beginPath();
      ctx.arc(cx, snoutY, w * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  // ==========================================================================
  // SPRITE BAKING HOOKS
  // ==========================================================================
  bakeTapNote(ctx, x, yTop, w, h, isLight, style) {
    this._drawDragonHead(ctx, x + w / 2, yTop + h / 2, w, h, style?.tier || 0, false);
    return true;
  },

  bakeLongHead(ctx, x, yTop, w, h, isLight, style) {
    this._drawDragonHead(ctx, x + w / 2, yTop + h / 2, w, h, style?.tier || 0, false);
    return true;
  },

  // Body of the long note: multi-tonal gradient, side borders, chevrons & vertebrae chain
  bakeLongTail(ctx, tailW, tailH, isLight, style) {
    const tier = style?.tier || 0;
    const pal  = this._getTierPalette(tier, false, false);
    const cx   = tailW / 2;

    // 1. Multi-tonal body gradient
    const bg = ctx.createLinearGradient(0, 0, 0, tailH);
    bg.addColorStop(0,   pal.bgTop);
    bg.addColorStop(0.5, pal.bgBot);
    bg.addColorStop(1,   pal.bgTop);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, tailW, tailH);

    // 2. Left and right border strokes (continuous with tail contours)
    ctx.strokeStyle = pal.borderCol;
    ctx.lineWidth   = 1.6;
    ctx.beginPath();
    ctx.moveTo(1, 0); ctx.lineTo(1, tailH);
    ctx.moveTo(tailW - 1, 0); ctx.lineTo(tailW - 1, tailH);
    ctx.stroke();

    // 3. V-shaped chevron armor scales pointing down towards the head
    const rowCount = Math.round(tailH / 22);
    ctx.strokeStyle = pal.chevronCol;
    ctx.lineWidth   = 1.5;
    for (let r = 0; r < rowCount; r++) {
      const y = r * 22 + 10;
      ctx.beginPath();
      ctx.moveTo(cx - tailW * 0.42, y - 5);
      ctx.lineTo(cx, y + 7);
      ctx.lineTo(cx + tailW * 0.42, y - 5);
      ctx.stroke();
    }

    // 4. Central spinal cord
    const sg = ctx.createLinearGradient(0, 0, 0, tailH);
    sg.addColorStop(0,   pal.chevronCol);
    sg.addColorStop(0.5, pal.spineCol);
    sg.addColorStop(1,   '#ffffff');
    ctx.strokeStyle = sg;
    ctx.lineWidth   = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, tailH);
    ctx.stroke();

    // 5. Chain of vertebrae beads (о-о-о-о-о) down the center spine
    ctx.fillStyle = pal.beadCol;
    for (let y = 14; y < tailH; y += 22) {
      ctx.beginPath();
      ctx.ellipse(cx, y, 2.5, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    return true;
  },

  // ==========================================================================
  // HOLD TAIL (per user sketch media_1789237167068.png)
  // - Seamless vertical tangent at body connection (w - 16)
  // - Tapering shaft with lateral fin spikes
  // - Chain of vertebrae beads (о-о-о-о-о)
  // - Arrowhead / crescent spade dragon blade at the tip
  // - Multi-tonal shading by combo tier (800+ Gold)
  // ==========================================================================
  drawHoldTail(ctx, x, yTail, w, headH, tile, isLight, now, tailH = 0) {
    const isMob   = typeof window !== 'undefined' && (window.innerWidth <= 768 || navigator.maxTouchPoints > 1);
    const bodyW   = Math.max(10, Math.round(w - 16));
    const bodyX   = Math.round(x + 8);
    const cx      = bodyX + bodyW / 2;
    const hw      = bodyW / 2;

    const holding = tile.holding && tile.hit;
    const dead    = tile.failed;
    const tier    = tile?.style?.tier ?? (typeof State !== 'undefined' ? State?.combo : 0);
    const pal     = this._getTierPalette(tier, dead, holding);

    // Dimensions
    const tailLen      = Math.min(105, Math.round(headH * 0.58));
    const bladeH       = Math.min(28, tailLen * 0.28);
    const shaftLen     = tailLen - bladeH;
    const tipY         = yTail - tailLen;
    const bladeRootY   = tipY + bladeH;
    const shaftNeckHW  = Math.max(5, hw * 0.16); // narrow shaft at base of blade

    // ── NECK/SHOULDER JUNCTION ─────────────────────────────────────────────
    // Fills the gap between the baked tail body sprite and the dragon head sprite.
    // Placed at the BOTTOM of the body (yTail + tailH), fanning from bodyW → headW.
    // When tailH = 0 (note being held at receptor), junctionY = yTail = actualYHeadTop.
    {
      const junctionY = yTail + tailH;           // bottom edge of body = where head starts
      const neckH     = Math.round(headH * 0.50);// how far down the collar extends into head area
      const headHW    = Math.round(w * 0.52);    // half-width matching the head sprite (w + 16px padding / 2)
      const neckBot   = junctionY + neckH;

      const ng = ctx.createLinearGradient(cx, junctionY, cx, neckBot);
      ng.addColorStop(0,    pal.bgBot);
      ng.addColorStop(0.50, pal.bgTop);
      ng.addColorStop(1,    'rgba(0,0,0,0)');
      ctx.save();
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.moveTo(cx - hw,     junctionY);
      ctx.bezierCurveTo(cx - hw,     junctionY + neckH * 0.4,
                        cx - headHW, junctionY + neckH * 0.7,
                        cx - headHW, neckBot);
      ctx.lineTo(cx + headHW, neckBot);
      ctx.bezierCurveTo(cx + headHW, junctionY + neckH * 0.7,
                        cx + hw,     junctionY + neckH * 0.4,
                        cx + hw,     junctionY);
      ctx.closePath();
      ctx.fill();

      // Side border lines continuing from the tail body edges
      ctx.strokeStyle = pal.borderCol;
      ctx.lineWidth   = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx - hw, junctionY);
      ctx.bezierCurveTo(cx - hw,     junctionY + neckH * 0.4,
                        cx - headHW, junctionY + neckH * 0.7,
                        cx - headHW, neckBot);
      ctx.moveTo(cx + hw, junctionY);
      ctx.bezierCurveTo(cx + hw,     junctionY + neckH * 0.4,
                        cx + headHW, junctionY + neckH * 0.7,
                        cx + headHW, neckBot);
      ctx.stroke();

      // Small chevrons inside collar (continuation of body armor scales)
      ctx.strokeStyle = pal.chevronCol;
      ctx.lineWidth   = 1.2;
      for (let i = 1; i <= 2; i++) {
        const t   = i / 3;
        const cy2 = junctionY + t * neckH * 0.75;
        const cw2 = hw + (headHW - hw) * t;
        ctx.beginPath();
        ctx.moveTo(cx - cw2 * 0.80, cy2 - 3);
        ctx.lineTo(cx,              cy2 + 5);
        ctx.lineTo(cx + cw2 * 0.80, cy2 - 3);
        ctx.stroke();
      }

      // Central spine extends through the collar
      ctx.strokeStyle = pal.spineCol;
      ctx.lineWidth   = holding ? 2.2 : 1.6;
      ctx.beginPath();
      ctx.moveTo(cx, junctionY);
      ctx.lineTo(cx, neckBot);
      ctx.stroke();

      ctx.restore();
    }
    // ── END NECK ──────────────────────────────────────────────────────────

    ctx.save();

    // 1. Tapering dragon tail shaft (cubic bezier with vertical tangent at body connection)
    const tg = ctx.createLinearGradient(cx, tipY, cx, yTail + 2);
    tg.addColorStop(0, pal.bgTop);
    tg.addColorStop(1, pal.bgBot);
    ctx.fillStyle = tg;

    ctx.beginPath();
    ctx.moveTo(cx - hw, yTail + 2);
    ctx.bezierCurveTo(
      cx - hw,           yTail - shaftLen * 0.35,
      cx - shaftNeckHW * 2.2, bladeRootY + shaftLen * 0.25,
      cx - shaftNeckHW,  bladeRootY
    );
    ctx.lineTo(cx + shaftNeckHW, bladeRootY);
    ctx.bezierCurveTo(
      cx + shaftNeckHW * 2.2, bladeRootY + shaftLen * 0.25,
      cx + hw,           yTail - shaftLen * 0.35,
      cx + hw,           yTail + 2
    );
    ctx.closePath();
    ctx.fill();

    // Stroke ONLY left and right outer contours (NO horizontal line at the base!)
    ctx.strokeStyle = pal.borderCol;
    ctx.lineWidth   = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - hw, yTail + 2);
    ctx.bezierCurveTo(
      cx - hw,           yTail - shaftLen * 0.35,
      cx - shaftNeckHW * 2.2, bladeRootY + shaftLen * 0.25,
      cx - shaftNeckHW,  bladeRootY
    );
    ctx.moveTo(cx + shaftNeckHW, bladeRootY);
    ctx.bezierCurveTo(
      cx + shaftNeckHW * 2.2, bladeRootY + shaftLen * 0.25,
      cx + hw,           yTail - shaftLen * 0.35,
      cx + hw,           yTail + 2
    );
    ctx.stroke();

    // 2. Lateral fin spikes along the shaft (from user sketch)
    if (!dead) {
      ctx.fillStyle   = pal.finSpikeCol;
      ctx.strokeStyle = pal.bladeBorder;
      ctx.lineWidth   = 1.1;

      const spikeRatios = [0.35, 0.68];
      for (const r of spikeRatios) {
        const sy = yTail - r * shaftLen;
        const curW = hw * Math.pow(1.0 - r, 1.2) + shaftNeckHW;
        const spikeSpan = 13 * (1.0 - r * 0.35);

        // Left spike
        ctx.beginPath();
        ctx.moveTo(cx - curW + 2, sy + 4);
        ctx.lineTo(cx - curW - spikeSpan, sy - 8);
        ctx.lineTo(cx - curW + 1, sy - 5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Right spike
        ctx.beginPath();
        ctx.moveTo(cx + curW - 2, sy + 4);
        ctx.lineTo(cx + curW + spikeSpan, sy - 8);
        ctx.lineTo(cx + curW - 1, sy - 5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      }
    }

    // 3. Tapering chevron armor scales on shaft
    ctx.strokeStyle = pal.chevronCol;
    ctx.lineWidth   = 1.3;
    const chevrons  = 3;
    for (let i = 1; i <= chevrons; i++) {
      const t = i / (chevrons + 1);
      const cyT = yTail - t * shaftLen * 0.85;
      const curHW = hw * Math.pow(1.0 - t, 1.25);
      ctx.beginPath();
      ctx.moveTo(cx - curHW + 2, cyT - 3);
      ctx.lineTo(cx, cyT + 5);
      ctx.lineTo(cx + curHW - 2, cyT - 3);
      ctx.stroke();
    }

    // 4. Spine line & Chain of vertebrae beads (о-о-о-о-о)
    ctx.strokeStyle = pal.spineCol;
    ctx.lineWidth   = holding ? 2.6 : 2.0;
    ctx.beginPath();
    ctx.moveTo(cx, yTail + 4);
    ctx.lineTo(cx, bladeRootY);
    ctx.stroke();

    ctx.fillStyle   = pal.beadCol;
    ctx.strokeStyle = pal.spineCol;
    ctx.lineWidth   = 1.0;
    const numBeads  = 6;
    for (let i = 0; i < numBeads; i++) {
      const t = (i + 1) / (numBeads + 1);
      const vy = yTail - t * shaftLen;
      const bw = 3.2 * (1.0 - t * 0.40);
      const bh = bw * 1.35;
      ctx.beginPath();
      ctx.ellipse(cx, vy, bw, bh, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 5. Arrowhead / Crescent Spade Dragon Blade at tip (per sketch)
    const bladeW = Math.min(22, hw * 0.42);
    ctx.fillStyle   = pal.bladeCol;
    ctx.strokeStyle = pal.bladeBorder;
    ctx.lineWidth   = 1.5;

    ctx.beginPath();
    ctx.moveTo(cx, tipY);                                        // blade tip
    ctx.bezierCurveTo(
      cx - bladeW * 0.38, tipY + bladeH * 0.45,
      cx - bladeW * 0.85, tipY + bladeH * 0.80,
      cx - bladeW,        tipY + bladeH                          // left barb wing tip
    );
    ctx.bezierCurveTo(
      cx - bladeW * 0.65, tipY + bladeH - 5,
      cx - bladeW * 0.25, tipY + bladeH - 3,
      cx,                 bladeRootY                             // center root
    );
    ctx.bezierCurveTo(
      cx + bladeW * 0.25, tipY + bladeH - 3,
      cx + bladeW * 0.65, tipY + bladeH - 5,
      cx + bladeW,        tipY + bladeH                          // right barb wing tip
    );
    ctx.bezierCurveTo(
      cx + bladeW * 0.85, tipY + bladeH * 0.80,
      cx + bladeW * 0.38, tipY + bladeH * 0.45,
      cx,                 tipY
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Blade central spine ridge & crystalline bevel lines
    ctx.strokeStyle = pal.spineCol;
    ctx.lineWidth   = 2.0;
    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.lineTo(cx, bladeRootY);
    ctx.stroke();

    ctx.strokeStyle = pal.bladeBorder;
    ctx.lineWidth   = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx, tipY + bladeH * 0.35);
    ctx.lineTo(cx - bladeW * 0.88, tipY + bladeH - 2);
    ctx.moveTo(cx, tipY + bladeH * 0.35);
    ctx.lineTo(cx + bladeW * 0.88, tipY + bladeH - 2);
    ctx.stroke();

    // 6. Spiritual lightning arcs when holding
    if (holding && !isMob) {
      const fl = Math.sin(now * 0.022) * 3.5;
      ctx.strokeStyle = pal.lightningCol;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, tipY - 8);
      ctx.lineTo(cx + fl, tipY - 18);
      ctx.lineTo(cx - fl * 0.6, tipY - 28);
      ctx.stroke();
    }

    ctx.restore();
  },

  // ==========================================================================
  // RECEPTOR
  // ==========================================================================
  drawReceptor(ctx, x, y, w, h, isActive, isLight) {
    ctx.save();
    const cx = x + w / 2, cy = y + h / 2;

    ctx.strokeStyle = isActive ? '#ffffff' : 'rgba(192, 132, 252, 0.60)';
    ctx.lineWidth   = isActive ? 2.2 : 1.3;
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 8);
    else ctx.strokeRect(x, y, w, h);
    ctx.stroke();

    const cl = 7, fc = isActive ? '#ffffff' : '#a855f7';
    ctx.fillStyle = fc;
    ctx.fillRect(x,          y,          cl, 2); ctx.fillRect(x,          y,          2, cl);
    ctx.fillRect(x + w - cl, y,          cl, 2); ctx.fillRect(x + w - 2,  y,          2, cl);
    ctx.fillRect(x,          y + h - 2,  cl, 2); ctx.fillRect(x,          y + h - cl, 2, cl);
    ctx.fillRect(x + w - cl, y + h - 2,  cl, 2); ctx.fillRect(x + w - 2,  y + h - cl, 2, cl);

    if (isActive) {
      const cg = ctx.createRadialGradient(cx, cy, 2, cx, cy, w * 0.48);
      cg.addColorStop(0,    'rgba(255, 255, 255, 0.70)');
      cg.addColorStop(0.45, 'rgba(192, 132, 252, 0.35)');
      cg.addColorStop(1,    'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cg;
      ctx.fillRect(x, y, w, h);
    }
    ctx.restore();
  },

  // ==========================================================================
  // HIT ANIMATION (5-Ray Goryūtenmetsu Shockwave)
  // ==========================================================================
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now) {
    if (p >= 1) return;
    const ease = 1 - (1 - p) * (1 - p);
    ctx.save();

    const dist = (w * 0.80) * ease;
    ctx.globalAlpha = Math.max(0, 0.90 - ease * 0.90);
    ctx.lineCap     = 'round';
    ctx.lineWidth   = 3.0;

    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const ex = cx + Math.cos(angle) * dist, ey = cy + Math.sin(angle) * dist;
      const mx = cx + Math.cos(angle) * dist * 0.55, my = cy + Math.sin(angle) * dist * 0.55;
      const wg = ctx.createLinearGradient(cx, cy, ex, ey);
      wg.addColorStop(0,   isPerfect ? 'rgba(255, 255, 255, 0.9)' : 'rgba(192, 132, 252, 0.9)');
      wg.addColorStop(0.6, isPerfect ? 'rgba(251, 191, 36, 0.75)'  : 'rgba(147, 51, 234, 0.75)');
      wg.addColorStop(1,   'rgba(0, 0, 0, 0)');
      ctx.strokeStyle = wg;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(mx + Math.cos(angle + Math.PI / 2) * 8, my + Math.sin(angle + Math.PI / 2) * 8, ex, ey);
      ctx.stroke();
    }

    const dr = (w * 0.65) * ease;
    ctx.strokeStyle = isPerfect ? '#ffd700' : '#c084fc';
    ctx.lineWidth   = isPerfect ? 2.2 : 1.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy - dr);
    ctx.lineTo(cx + dr, cy);
    ctx.lineTo(cx, cy + dr);
    ctx.lineTo(cx - dr, cy);
    ctx.closePath();
    ctx.stroke();

    if (p < 0.30) {
      ctx.globalAlpha = (0.30 - p) / 0.30;
      ctx.fillStyle   = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(0, (w * 0.28) * (1 - p * 3.3)), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  // ==========================================================================
  // PARTICLES
  // ==========================================================================
  drawParticle(ctx, pt, life) {
    if (!pt.active || life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, life);
    const mode = (pt.x | 0) % 3;
    if (mode === 0) {
      const sz = 3.8 * life;
      ctx.fillStyle = pt.color || '#c084fc';
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.angle || 0);
      ctx.beginPath();
      ctx.moveTo(0, -sz * 1.4);
      ctx.lineTo(sz * 0.62, 0);
      ctx.lineTo(0, sz * 1.4);
      ctx.lineTo(-sz * 0.62, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (mode === 1) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.7 * life, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#e9d5ff';
      ctx.fillRect(pt.x - 1, pt.y - 2.5 * life, 2, 5 * life);
    }
    ctx.restore();
  },

  // ==========================================================================
  // ATMOSPHERE — Bleach Hadō 99 Background Scene
  // ==========================================================================
  _atm: null, _bgGrad: null, _bgKey: '',

  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const W = State.gameWidth, H = State.gameHeight;
    const t = songTime * 0.001, isMob = State.isMobile;

    if (!this._atm || this._atm._W !== W || this._atm._H !== H) {
      this._atm = {
        _W: W, _H: H,
        shards: Array.from({ length: isMob ? 16 : 34 }, () => ({
          x: Math.random() * W, y: Math.random() * H,
          vy: -0.40 - Math.random() * 1.0, vx: (Math.random() - 0.5) * 0.24,
          sz: 3 + Math.random() * (isMob ? 7 : 11), angle: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.025, bright: Math.random() > 0.55, amber: Math.random() > 0.84
        })),
        dragons: [
          { bxR: 0.76, byR: 0.36, segs: isMob ? 9 : 15, bw: isMob ? 18 : 30, col: '#2e0548', spine: '#9333ea', sp: 0.19, amp: W * 0.13, freq: 0.0038, ph: 0.0 },
          { bxR: 0.24, byR: 0.50, segs: isMob ? 7 : 12, bw: isMob ? 14 : 24, col: '#1c0332', spine: '#7e22ce', sp: 0.16, amp: W * 0.11, freq: 0.0048, ph: 2.4 }
        ]
      };
      this._bgGrad = null;
    }
    const atm = this._atm;

    if (!this._bgGrad || this._bgKey !== `${W}x${H}`) {
      this._bgKey = `${W}x${H}`;
      const g = ctx.createRadialGradient(W * 0.5, H * 0.46, W * 0.06, W * 0.5, H * 0.46, W * 0.80);
      g.addColorStop(0,    'rgba(88, 28, 135, 0.22)');
      g.addColorStop(0.55, 'rgba(59, 7, 100, 0.10)');
      g.addColorStop(1,    'rgba(0, 0, 0, 0)');
      this._bgGrad = g;
    }

    ctx.save();
    ctx.fillStyle = this._bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Grand dragon silhouettes in distant sky
    for (let d = 0; d < atm.dragons.length; d++) {
      const dr = atm.dragons[d], bx = W * dr.bxR, by = H * dr.byR;
      const alpha = 0.22 + Math.sin(t * 1.0 + dr.ph) * 0.05, stepY = (H * 0.70) / dr.segs;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      let first = true, hx = bx, hy = by;
      for (let s = 0; s <= dr.segs; s++) {
        const py = by - (dr.segs * 0.5 - s) * stepY, px = bx + Math.sin(py * dr.freq + t * dr.sp + dr.ph) * dr.amp;
        if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
        if (s === 0) { hx = px; hy = py; }
      }
      ctx.strokeStyle = dr.col; ctx.lineWidth = dr.bw; ctx.lineCap = 'round'; ctx.stroke();
      ctx.strokeStyle = dr.spine; ctx.lineWidth = isMob ? 2.5 : 4.5; ctx.stroke();

      // Background dragon head
      const hs = isMob ? 9 : 15;
      ctx.save();
      ctx.translate(hx, hy);
      ctx.fillStyle = dr.col;
      ctx.beginPath();
      ctx.moveTo(0, -hs * 0.8);
      ctx.bezierCurveTo(hs * 1.2, -hs * 0.9, hs * 1.5, hs * 0.2, hs * 0.5, hs * 0.9);
      ctx.bezierCurveTo(hs * 0.15, hs * 1.1, -hs * 0.15, hs * 1.1, -hs * 0.5, hs * 0.9);
      ctx.bezierCurveTo(-hs * 1.5, hs * 0.2, -hs * 1.2, -hs * 0.9, 0, -hs * 0.8);
      ctx.closePath(); ctx.fill();

      ctx.strokeStyle = dr.spine; ctx.lineWidth = isMob ? 1.4 : 2.2; ctx.lineCap = 'round';
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * hs * 0.45, -hs * 0.65);
        ctx.bezierCurveTo(s * hs * 0.75, -hs * 1.30, s * hs * 1.0, -hs * 1.60, s * hs * 0.85, -hs * 2.0);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Aizen silhouette
    ctx.globalAlpha = 0.88;
    const ax = W * 0.5, ay = H * 0.72, asc = isMob ? 0.78 : 1.08;
    const halo = ctx.createRadialGradient(ax, ay - 26 * asc, 7, ax, ay - 26 * asc, 42 * asc);
    halo.addColorStop(0,   'rgba(255, 255, 255, 0.36)');
    halo.addColorStop(0.4, 'rgba(192, 132, 252, 0.20)');
    halo.addColorStop(1,   'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(ax, ay - 26 * asc, 42 * asc, 0, Math.PI * 2);
    ctx.fill();

    if (!isMob) {
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.25)';
      ctx.lineWidth   = 1.0;
      for (let r = 0; r < 8; r++) {
        const ang = r * Math.PI / 4 + t * 0.13, cos = Math.cos(ang), sin = Math.sin(ang), hy2 = ay - 26 * asc;
        ctx.beginPath();
        ctx.moveTo(ax + cos * 16, hy2 + sin * 16);
        ctx.lineTo(ax + cos * 38, hy2 + sin * 38);
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#04000d'; ctx.strokeStyle = '#04000d';
    ctx.beginPath(); ctx.arc(ax, ay - 50 * asc, 6 * asc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(ax - 7 * asc, ay - 43 * asc);
    ctx.lineTo(ax + 7 * asc, ay - 43 * asc);
    ctx.lineTo(ax + 14 * asc, ay);
    ctx.lineTo(ax - 14 * asc, ay);
    ctx.closePath(); ctx.fill();
    ctx.lineWidth = 3.0 * asc;
    ctx.beginPath(); ctx.moveTo(ax + 6 * asc, ay - 38 * asc); ctx.lineTo(ax + 22 * asc, ay - 50 * asc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax - 6 * asc, ay - 37 * asc); ctx.lineTo(ax - 14 * asc, ay - 28 * asc); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.0 * asc;
    ctx.beginPath(); ctx.moveTo(ax - 14 * asc, ay - 28 * asc); ctx.lineTo(ax - 24 * asc, ay - 14 * asc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax, ay - 42 * asc); ctx.lineTo(ax, ay); ctx.stroke();

    // Dark Obsidian Cliffs
    ctx.globalAlpha = 1.0; ctx.fillStyle = '#03000a';
    ctx.beginPath();
    ctx.moveTo(0, H); ctx.lineTo(0, H * 0.72); ctx.lineTo(W * 0.12, H * 0.76);
    ctx.lineTo(W * 0.23, H * 0.70); ctx.lineTo(W * 0.36, H * 0.84); ctx.lineTo(W * 0.36, H);
    ctx.closePath(); ctx.fill();

    ctx.beginPath();
    ctx.moveTo(W, H); ctx.lineTo(W, H * 0.70); ctx.lineTo(W * 0.86, H * 0.74);
    ctx.lineTo(W * 0.76, H * 0.68); ctx.lineTo(W * 0.62, H * 0.83); ctx.lineTo(W * 0.62, H);
    ctx.closePath(); ctx.fill();

    ctx.beginPath();
    ctx.moveTo(W * 0.32, H); ctx.lineTo(W * 0.40, ay + 4);
    ctx.lineTo(W * 0.50, ay); ctx.lineTo(W * 0.60, ay + 6); ctx.lineTo(W * 0.68, H);
    ctx.closePath(); ctx.fill();

    ctx.strokeStyle = '#7e22ce'; ctx.lineWidth = 1.1; ctx.globalAlpha = 0.50;
    ctx.beginPath();
    ctx.moveTo(W * 0.05, H * 0.76); ctx.lineTo(W * 0.12, H * 0.84); ctx.lineTo(W * 0.18, H * 0.92);
    ctx.moveTo(W * 0.92, H * 0.74); ctx.lineTo(W * 0.84, H * 0.81); ctx.lineTo(W * 0.78, H * 0.89);
    ctx.stroke();

    // Floating Diamond Shards
    for (let i = 0; i < atm.shards.length; i++) {
      const sh = atm.shards[i];
      sh.y += sh.vy * warpMult;
      sh.x += sh.vx + Math.sin(t * 1.3 + sh.y * 0.011) * 0.20;
      sh.angle += sh.vRot;
      if (sh.y < -18) { sh.y = H + 18; sh.x = Math.random() * W; }
      ctx.save();
      ctx.translate(sh.x, sh.y);
      ctx.rotate(sh.angle);
      ctx.globalAlpha = sh.bright ? 0.68 : 0.32;
      ctx.fillStyle   = sh.amber ? '#fbbf24' : (sh.bright ? '#c084fc' : '#4c1d95');
      ctx.strokeStyle = sh.bright ? '#e9d5ff' : 'rgba(147, 51, 234, 0.5)';
      ctx.lineWidth   = 0.8;
      const sz = sh.sz;
      ctx.beginPath();
      ctx.moveTo(0, -sz * 1.3); ctx.lineTo(sz * 0.55, 0);
      ctx.lineTo(0, sz * 1.3); ctx.lineTo(-sz * 0.55, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // Reflective dark waters
    const wh = H * 0.12, wg = ctx.createLinearGradient(0, H - wh, 0, H);
    wg.addColorStop(0,   'rgba(19, 4, 36, 0)');
    wg.addColorStop(0.5, 'rgba(59, 7, 100, 0.20)');
    wg.addColorStop(1,   'rgba(88, 28, 135, 0.35)');
    ctx.fillStyle = wg; ctx.globalAlpha = 1.0;
    ctx.fillRect(0, H - wh, W, wh);
    if (!isMob) {
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.28)'; ctx.lineWidth = 1.0;
      for (let wy = H - wh + 8; wy < H; wy += 14) {
        const wo = Math.sin(t * 1.8 + wy * 0.08) * (W * 0.06);
        ctx.beginPath(); ctx.moveTo(W * 0.22 + wo, wy); ctx.lineTo(W * 0.78 + wo, wy); ctx.stroke();
      }
    }
    ctx.restore();
  }
};
