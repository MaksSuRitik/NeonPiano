// ============================================================================
// HADO 99 THEME MODULE — Sōsuke Aizen & Hadō #99: Goryūtenmetsu (破道の九十九 五龍転滅)
// Features:
// - Top-down dragon head matching user sketch with 3D volumetric depth and piercing glowing eyes
// - Dynamic Reishi lightning arcs leaping from horns, crest, and snout on tap notes & hold heads
// - Crown of 5 Dragon Heads (Goryūtenmetsu) atop the tail per user sketch
// - Reishi Disintegration & Falling Ash (Option 2): fiery burning edge + dark Kurohitsugi
//   ash flakes and radiant glowing Reishi embers with zero GC allocations
// - Seamless neck/shoulder junction collar at bottom of body (zero gaps)
// - Full combo adaptation for tail tip, 5-head crown, and neck across all tiers (0 to 800+ Gold)
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
if (dragonSprites.tier0) dragonSprites.tier0.src = './assets/themes/hado99_dragon_tier0.png?v=73.2';
if (dragonSprites.tier1) dragonSprites.tier1.src = './assets/themes/hado99_dragon_tier1.png?v=73.2';
if (dragonSprites.tier2) dragonSprites.tier2.src = './assets/themes/hado99_dragon_tier2.png?v=73.2';
if (dragonSprites.tier3) dragonSprites.tier3.src = './assets/themes/hado99_dragon_tier3.png?v=73.2';
if (dragonSprites.tier4) dragonSprites.tier4.src = './assets/themes/hado99_dragon_tier4.png?v=73.2';
if (dragonSprites.tier5) dragonSprites.tier5.src = './assets/themes/hado99_dragon_tier5.png?v=73.2';
if (dragonSprites.dead)  dragonSprites.dead.src  = './assets/themes/hado99_dragon_dead.png?v=73.2';

// Preload 5-Heads Dragon Tail Sprites (Goryūtenmetsu Crown) for all combo tiers
const dragon5HeadsSprites = {
  tier0: typeof Image !== 'undefined' ? new Image() : null,
  tier1: typeof Image !== 'undefined' ? new Image() : null,
  tier2: typeof Image !== 'undefined' ? new Image() : null,
  tier3: typeof Image !== 'undefined' ? new Image() : null,
  tier4: typeof Image !== 'undefined' ? new Image() : null,
  tier5: typeof Image !== 'undefined' ? new Image() : null,
  dead:  typeof Image !== 'undefined' ? new Image() : null
};
if (dragon5HeadsSprites.tier0) dragon5HeadsSprites.tier0.src = './assets/themes/hado99_dragon_5heads_tier0.png?v=73.2';
if (dragon5HeadsSprites.tier1) dragon5HeadsSprites.tier1.src = './assets/themes/hado99_dragon_5heads_tier1.png?v=73.2';
if (dragon5HeadsSprites.tier2) dragon5HeadsSprites.tier2.src = './assets/themes/hado99_dragon_5heads_tier2.png?v=73.2';
if (dragon5HeadsSprites.tier3) dragon5HeadsSprites.tier3.src = './assets/themes/hado99_dragon_5heads_tier3.png?v=73.2';
if (dragon5HeadsSprites.tier4) dragon5HeadsSprites.tier4.src = './assets/themes/hado99_dragon_5heads_tier4.png?v=73.2';
if (dragon5HeadsSprites.tier5) dragon5HeadsSprites.tier5.src = './assets/themes/hado99_dragon_5heads_tier5.png?v=73.2';
if (dragon5HeadsSprites.dead)  dragon5HeadsSprites.dead.src  = './assets/themes/hado99_dragon_5heads_dead.png?v=73.2';

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

  // Pick 5-heads crown sprite matching the combo tier
  _getDragon5HeadsSprite(tier, isDead) {
    if (isDead) return dragon5HeadsSprites.dead;
    if (tier >= 800) return dragon5HeadsSprites.tier5;
    if (tier >= 400) return dragon5HeadsSprites.tier4;
    if (tier >= 200) return dragon5HeadsSprites.tier3;
    if (tier >= 100) return dragon5HeadsSprites.tier2;
    if (tier >= 50)  return dragon5HeadsSprites.tier1;
    return dragon5HeadsSprites.tier0;
  },

  // Multi-tonal color palette for body, tail, volume, and effects by combo tier
  _getTierPalette(tier, isDead, isHolding) {
    if (isDead) {
      return {
        bgTop: '#0f172a', bgBot: '#1e293b', darkShade: '#050811',
        borderCol: '#334155', chevronCol: 'rgba(100, 116, 139, 0.40)',
        spineCol: '#64748b', beadCol: '#94a3b8',
        bladeCol: '#1e293b', bladeBorder: '#475569',
        finSpikeCol: '#1e293b', lightningCol: '#64748b',
        auraCol: 'rgba(71, 85, 105, 0.35)', breathCol: '#64748b',
        eyeCol: '#64748b', eyeGlow: '#334155',
        coreHighlight: 'rgba(148, 163, 184, 0.40)',
        ashCol: 'rgba(51, 65, 85, 0.65)', sparkCol: '#94a3b8', burnCol: '#64748b'
      };
    }
    if (tier >= 800) { // Tier 5: Goryūtenmetsu God Gold (800+)
      return {
        bgTop: '#78350f', bgBot: '#d97706', darkShade: '#3b1702',
        borderCol: '#ffd700', chevronCol: 'rgba(253, 224, 71, 0.70)',
        spineCol: '#ffffff', beadCol: '#fef08a',
        bladeCol: '#d97706', bladeBorder: '#fef08a',
        finSpikeCol: '#b45309', lightningCol: '#fef08a',
        auraCol: 'rgba(251, 191, 36, 0.70)', breathCol: '#ffd700',
        eyeCol: '#ffffff', eyeGlow: '#fbbf24',
        coreHighlight: 'rgba(255, 255, 255, 1.0)',
        ashCol: 'rgba(120, 53, 15, 0.70)', sparkCol: '#fef08a', burnCol: '#fbbf24'
      };
    }
    if (tier >= 400) { // Tier 4: Hōgyoku Fusion (400-799)
      return {
        bgTop: isHolding ? '#701a75' : '#4a044e', bgBot: isHolding ? '#be185d' : '#9d174d', darkShade: '#38033b',
        borderCol: '#fb7185', chevronCol: 'rgba(254, 240, 138, 0.60)',
        spineCol: '#fef08a', beadCol: '#ffffff',
        bladeCol: '#be185d', bladeBorder: '#fef08a',
        finSpikeCol: '#9d174d', lightningCol: '#fef08a',
        auraCol: 'rgba(251, 113, 133, 0.65)', breathCol: '#f472b6',
        eyeCol: '#fef08a', eyeGlow: '#f43f5e',
        coreHighlight: 'rgba(255, 254, 230, 0.95)',
        ashCol: 'rgba(74, 4, 78, 0.75)', sparkCol: '#f472b6', burnCol: '#fb7185'
      };
    }
    if (tier >= 200) { // Tier 3: Las Noches (200-399)
      return {
        bgTop: isHolding ? '#581c87' : '#3b0764', bgBot: isHolding ? '#a21caf' : '#86198f', darkShade: '#26053f',
        borderCol: '#f0abfc', chevronCol: 'rgba(245, 208, 254, 0.55)',
        spineCol: '#ffffff', beadCol: '#ffffff',
        bladeCol: '#a21caf', bladeBorder: '#ffffff',
        finSpikeCol: '#86198f', lightningCol: '#fdf4ff',
        auraCol: 'rgba(240, 171, 252, 0.60)', breathCol: '#e879f9',
        eyeCol: '#ffffff', eyeGlow: '#f0abfc',
        coreHighlight: 'rgba(255, 255, 255, 0.92)',
        ashCol: 'rgba(59, 7, 100, 0.75)', sparkCol: '#f0abfc', burnCol: '#e879f9'
      };
    }
    if (tier >= 100) { // Tier 2: Kurohitsugi (100-199)
      return {
        bgTop: isHolding ? '#4a044e' : '#2e0854', bgBot: isHolding ? '#86198f' : '#701a75', darkShade: '#220326',
        borderCol: '#e879f9', chevronCol: 'rgba(232, 121, 249, 0.52)',
        spineCol: '#ffffff', beadCol: '#fae8ff',
        bladeCol: '#86198f', bladeBorder: '#f0abfc',
        finSpikeCol: '#701a75', lightningCol: '#f5d0fe',
        auraCol: 'rgba(217, 70, 239, 0.55)', breathCol: '#d946ef',
        eyeCol: '#ffffff', eyeGlow: '#d946ef',
        coreHighlight: 'rgba(255, 255, 255, 0.90)',
        ashCol: 'rgba(46, 8, 84, 0.75)', sparkCol: '#e879f9', burnCol: '#d946ef'
      };
    }
    if (tier >= 50) { // Tier 1: Kyōka Suigetsu (50-99)
      return {
        bgTop: isHolding ? '#3b0764' : '#1e0538', bgBot: isHolding ? '#6b21a8' : '#4c1d95', darkShade: '#18032c',
        borderCol: '#d8b4fe', chevronCol: 'rgba(216, 180, 254, 0.50)',
        spineCol: '#ffffff', beadCol: '#f3e8ff',
        bladeCol: '#6b1da8', bladeBorder: '#e9d5ff',
        finSpikeCol: '#581c87', lightningCol: '#d8b4fe',
        auraCol: 'rgba(192, 132, 252, 0.50)', breathCol: '#c084fc',
        eyeCol: '#ffffff', eyeGlow: '#c084fc',
        coreHighlight: 'rgba(255, 255, 255, 0.88)',
        ashCol: 'rgba(30, 5, 56, 0.75)', sparkCol: '#d8b4fe', burnCol: '#c084fc'
      };
    }
    // Tier 0: Reikaku Awakening (0-49)
    return {
      bgTop: isHolding ? '#2e0854' : '#150328', bgBot: isHolding ? '#581c87' : '#3b0764', darkShade: '#120224',
      borderCol: '#c084fc', chevronCol: 'rgba(192, 132, 252, 0.45)',
      spineCol: '#ffffff', beadCol: '#e9d5ff',
      bladeCol: '#581c87', bladeBorder: '#d8b4fe',
      finSpikeCol: '#3b0764', lightningCol: '#c084fc',
      auraCol: 'rgba(168, 85, 247, 0.45)', breathCol: '#a855f7',
      eyeCol: '#f3e8ff', eyeGlow: '#a855f7',
      coreHighlight: 'rgba(255, 255, 255, 0.85)',
      ashCol: 'rgba(21, 3, 40, 0.75)', sparkCol: '#c084fc', burnCol: '#a855f7'
    };
  },

  // ==========================================================================
  // REISHI DISINTEGRATION ASH & EMBERS PARTICLE POOL (0 GC Allocations)
  // ==========================================================================
  _ashPool: Array.from({ length: 64 }, () => ({
    active: false,
    x: 0, y: 0,
    vx: 0, vy: 0,
    life: 0,
    size: 2,
    isSpark: false
  })),
  _ashIdx: 0,
  _lastAshSpawn: 0,

  _spawnReishiAsh(cx, yTail, hw, pal, now) {
    if (now - this._lastAshSpawn < 28) return;
    this._lastAshSpawn = now;

    // Spawn 2 particles along the burning horizon
    for (let c = 0; c < 2; c++) {
      const p = this._ashPool[this._ashIdx];
      this._ashIdx = (this._ashIdx + 1) % this._ashPool.length;
      p.active = true;
      p.x = cx + (Math.random() - 0.5) * (hw * 1.8);
      p.y = yTail + (Math.random() - 0.5) * 6;
      p.isSpark = Math.random() < 0.45; // 45% glowing spark, 55% dark ash
      if (p.isSpark) {
        p.vx = (Math.random() - 0.5) * 2.8;
        p.vy = -(Math.random() * 2.6 + 1.4); // upward drift
        p.life = 0.50 + Math.random() * 0.35;
        p.size = 1.8 + Math.random() * 2.0;
      } else {
        p.vx = (Math.random() - 0.5) * 1.8;
        p.vy = -(Math.random() * 1.8 + 0.8); // upward drift
        p.life = 0.60 + Math.random() * 0.40;
        p.size = 2.6 + Math.random() * 2.8;
      }
    }
  },


  _updateAndDrawReishiAsh(ctx, pal) {
    let hasAsh = false;
    let hasSparks = false;

    // Single-pass position update & boundary check
    const poolLen = this._ashPool.length;
    for (let i = 0; i < poolLen; i++) {
      const p = this._ashPool[i];
      if (!p.active) continue;
      p.x += p.vx;
      p.y += p.vy;
      p.vy -= 0.022; // buoyant spiritual updraft
      p.life -= 0.026;
      if (p.life <= 0.01) {
        p.active = false;
        continue;
      }
      if (p.isSpark) hasSparks = true;
      else hasAsh = true;
    }

    if (!hasAsh && !hasSparks) return;

    ctx.save();

    // Batch 1: Dark Kurohitsugi Ash Flakes
    if (hasAsh) {
      ctx.fillStyle = pal.ashCol || 'rgba(30, 10, 48, 0.70)';
      ctx.beginPath();
      for (let i = 0; i < poolLen; i++) {
        const p = this._ashPool[i];
        if (!p.active || p.isSpark) continue;
        const sz = p.size * p.life;
        ctx.rect(p.x - sz * 0.5, p.y - sz * 0.5, sz, sz);
      }
      ctx.fill();
    }

    // Batch 2: Radiant Reishi Embers
    if (hasSparks) {
      ctx.fillStyle = pal.sparkCol || '#f0abfc';
      ctx.beginPath();
      for (let i = 0; i < poolLen; i++) {
        const p = this._ashPool[i];
        if (!p.active || !p.isSpark) continue;
        const sz = p.size * (0.6 + p.life * 0.4);
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    ctx.restore();
  },


  // Helper for drawing serrated dorsal fins on the outer curves of the serpent body
  _drawSerpentFinSpikes(ctx, headTopY, yTail, tailH, numCoils, maxAmp, bodyCenterX, ribbonHW, pal, waveAnim = 0) {
    ctx.save();
    ctx.fillStyle   = pal.finSpikeCol || '#c084fc';
    ctx.strokeStyle = pal.borderCol;
    ctx.lineWidth   = 1.1;

    const numSpikes = Math.max(4, Math.floor(tailH / 28));
    for (let s = 1; s < numSpikes; s++) {
      const prog = s / numSpikes;
      const y = headTopY - prog * tailH;
      const sinE = Math.sin(prog * Math.PI);
      const env = sinE * sinE;
      const phase = prog * numCoils * Math.PI * 2 - waveAnim;
      const sinV = Math.sin(phase);
      if (Math.abs(sinV) < 0.35) continue; // only on curved sections

      const dir = sinV > 0 ? 1 : -1;
      const cx = bodyCenterX + sinV * (maxAmp * env);
      const fx = cx + dir * ribbonHW;
      const spikeSpan = (8 + Math.abs(sinV) * 6) * dir;

      ctx.beginPath();
      ctx.moveTo(fx, y + 4);
      ctx.lineTo(fx + spikeSpan, y - 5);
      ctx.lineTo(fx, y - 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  },

  // ==========================================================================
  // DRAGON HEAD RENDERING (Top-Down View with 3D Volumetric Depth)
  // ==========================================================================
  _drawDragonHead(ctx, cx, cy, w, h, tier, isDead) {
    const pal = this._getTierPalette(tier, isDead, false);
    const sprite = this._getDragonSprite(tier, isDead);

    ctx.save();

    // 1. Soft Reiatsu Aura behind head
    const auraG = ctx.createRadialGradient(cx, cy, w * 0.08, cx, cy, w * 0.68);
    auraG.addColorStop(0,   pal.auraCol);
    auraG.addColorStop(0.60, 'rgba(20, 5, 40, 0.15)');
    auraG.addColorStop(1,   'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraG;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.60, h * 0.54, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw preloaded multi-tonal dragon head sprite
    let drawnFromSprite = false;
    let headW = w * 0.96;
    let headH = h * 0.94;
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      const targetH = h * 0.94;
      const targetW = targetH * (246 / 371);
      const drawW   = Math.min(w * 0.96, targetW);
      const drawH   = drawW / (246 / 371);
      const drawX   = cx - drawW / 2;
      const drawY   = cy - drawH / 2;

      ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
      drawnFromSprite = true;
      headW = drawW;
      headH = drawH;
    }

    // Procedural fallback if image is not yet loaded
    if (!drawnFromSprite) {
      const scale = Math.min(w / 246, h / 371) * 0.92;
      ctx.save();
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
      ctx.restore();
    }

    // 3. 3D VOLUMETRIC DEPTH OVERLAY (игра цветами для объема)
    if (!isDead) {
      // Longitudinal 3D ridge highlight: center crest is raised and bright, flanks stay in deep shadow
      const ridgeGrad = ctx.createLinearGradient(cx, cy - headH * 0.35, cx, cy + headH * 0.35);
      ridgeGrad.addColorStop(0,    'rgba(255, 255, 255, 0)');
      ridgeGrad.addColorStop(0.35, pal.coreHighlight);
      ridgeGrad.addColorStop(0.70, pal.borderCol);
      ridgeGrad.addColorStop(1,    'rgba(255, 255, 255, 0)');

      ctx.strokeStyle = ridgeGrad;
      ctx.lineWidth   = 2.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy - headH * 0.32);
      ctx.lineTo(cx, cy + headH * 0.30);
      ctx.stroke();

      // Diamond forehead plate highlight (volumetric crown)
      ctx.fillStyle = pal.coreHighlight;
      ctx.beginPath();
      ctx.moveTo(cx, cy - headH * 0.18);
      ctx.lineTo(cx + headW * 0.06, cy - headH * 0.13);
      ctx.lineTo(cx, cy - headH * 0.08);
      ctx.lineTo(cx - headW * 0.06, cy - headH * 0.13);
      ctx.closePath();
      ctx.fill();

      // Piercing glowing dragon eyes
      const eyeY = cy - headH * 0.04;
      const eyeSpread = headW * 0.15;
      const eyeLen = headW * 0.08;

      for (const side of [-1, 1]) {
        const ex = cx + side * eyeSpread;

        // Outer eye glow bloom
        const eg = ctx.createRadialGradient(ex, eyeY, 0.5, ex, eyeY, eyeLen * 1.4);
        eg.addColorStop(0,    pal.eyeCol);
        eg.addColorStop(0.45, pal.eyeGlow);
        eg.addColorStop(1,    'rgba(0, 0, 0, 0)');
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeLen * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Slanted almond eye slit
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(ex - side * eyeLen * 0.6, eyeY + 2);
        ctx.lineTo(ex, eyeY - 2);
        ctx.lineTo(ex + side * eyeLen * 0.6, eyeY - 4);
        ctx.lineTo(ex, eyeY + 1);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  },

  // ==========================================================================
  // SPRITE BAKING HOOKS
  // ==========================================================================
  bakeTapNote(ctx, x, yTop, w, h, isLight, style) {
    const tier   = style?.tier || 0;
    const pal    = this._getTierPalette(tier, false, false);
    const isGold = (pal.borderCol === '#ffd700');
    const radius = 6;
    const cx     = x + w / 2;
    const cy     = yTop + h / 2;

    ctx.save();

    // 1. Multi-tonal Obsidian / Void Glass Body Gradient
    const bgGrad = ctx.createLinearGradient(x, yTop, x, yTop + h);
    bgGrad.addColorStop(0,    pal.bgTop);
    bgGrad.addColorStop(0.55, pal.bgBot);
    bgGrad.addColorStop(1,    pal.darkShade || '#0a0114');

    // Outer soft spiritual aura glow
    ctx.shadowColor = isGold ? '#ffd700' : (pal.borderCol || '#c084fc');
    ctx.shadowBlur  = isGold ? 8 : (tier >= 200 ? 5 : 3);

    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, yTop, w, h, radius);
    else ctx.rect(x, yTop, w, h);
    ctx.fill();

    ctx.shadowBlur = 0;

    // 2. High-precision neon perimeter border
    ctx.strokeStyle = pal.borderCol;
    ctx.lineWidth   = isGold ? 1.8 : 1.4;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, yTop, w, h, radius);
    else ctx.rect(x, yTop, w, h);
    ctx.stroke();

    // 3. Sleek top glass gloss reflection highlight
    const glossGrad = ctx.createLinearGradient(x, yTop, x, yTop + h * 0.42);
    glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
    glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
    ctx.fillStyle = glossGrad;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x + 3, yTop + 2, w - 6, Math.max(3, Math.round(h * 0.38)), 4);
    else ctx.rect(x + 3, yTop + 2, w - 6, Math.max(3, Math.round(h * 0.38)));
    ctx.fill();

    // Subtle dark bevel lip on bottom edge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(x + 2, yTop + h - 3, w - 4, 2);

    // 4. Hadō #99 Kido Corner Seals (Corner Brackets)
    const bracketSize = 5;
    ctx.strokeStyle = isGold ? '#fef08a' : (pal.spineCol || '#ffffff');
    ctx.lineWidth   = 1.1;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(x + 4, yTop + 4 + bracketSize);
    ctx.lineTo(x + 4, yTop + 4);
    ctx.lineTo(x + 4 + bracketSize, yTop + 4);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(x + w - 4 - bracketSize, yTop + 4);
    ctx.lineTo(x + w - 4, yTop + 4);
    ctx.lineTo(x + w - 4, yTop + 4 + bracketSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(x + 4, yTop + h - 4 - bracketSize);
    ctx.lineTo(x + 4, yTop + h - 4);
    ctx.lineTo(x + 4 + bracketSize, yTop + h - 4);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(x + w - 4 - bracketSize, yTop + h - 4);
    ctx.lineTo(x + w - 4, yTop + h - 4);
    ctx.lineTo(x + w - 4, yTop + h - 4 - bracketSize);
    ctx.stroke();

    // 5. Central Hadō #99 Bleach Spiritual Crest (Reishi Diamond Core)
    const lineSpan = Math.round(w * 0.22);
    ctx.strokeStyle = pal.chevronCol || 'rgba(255, 255, 255, 0.40)';
    ctx.lineWidth   = 1.1;
    ctx.beginPath();
    ctx.moveTo(cx - lineSpan, cy);
    ctx.lineTo(cx - 10, cy);
    ctx.moveTo(cx + 10, cy);
    ctx.lineTo(cx + lineSpan, cy);
    ctx.stroke();

    // Central diamond crest
    const diaHW = 8;
    const diaHH = 6;
    ctx.fillStyle   = pal.darkShade || '#150328';
    ctx.strokeStyle = pal.borderCol;
    ctx.lineWidth   = 1.3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - diaHH);
    ctx.lineTo(cx + diaHW, cy);
    ctx.lineTo(cx, cy + diaHH);
    ctx.lineTo(cx - diaHW, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White-hot spiritual center jewel
    ctx.fillStyle = isGold ? '#ffffff' : (pal.coreHighlight || '#ffffff');
    ctx.beginPath();
    ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // For Tier 5 (800+ Gold) or Tier 4 (400+): 4-point radiant lens sparkle in center
    if (tier >= 400) {
      const starR = isGold ? 6.5 : 4.5;
      ctx.strokeStyle = isGold ? '#fef08a' : '#ffffff';
      ctx.lineWidth   = 1.0;
      ctx.beginPath();
      ctx.moveTo(cx - starR, cy); ctx.lineTo(cx + starR, cy);
      ctx.moveTo(cx, cy - starR); ctx.lineTo(cx, cy + starR);
      ctx.stroke();
    }

    ctx.restore();
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
  // DYNAMIC TAP NOTE OVERLAY (Zero Reiatsu for flying tap notes per user request)
  // ==========================================================================
  drawTapOverlay(ctx, x, yTop, w, h, tile, isLight, now, combo = 0) {
    // Regular tap notes fly cleanly without Reiatsu aura per user request
    return;
  },

  drawHeadOverlay(ctx, x, yTop, w, h, tile, isLight, now, combo = 0) {
    if (tile.failed || tile.released) return;
    const isTapNote = (tile.type === 'tap') || !tile.tailLen;
    // Flying tap notes have zero Reiatsu effect; long notes use dragon head baked sprite
    if (isTapNote) return;
    return;
  },

  // ==========================================================================
  // HIT ANIMATION (Snappy Hadō #99 Kido Barrier Prism & Reishi Flash Hit Animation)
  // ==========================================================================
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now, combo = 0) {
    const liveCombo = (combo !== undefined && combo !== null && combo > 0)
      ? combo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : 0);
    const pal = this._getTierPalette(liveCombo, false, true);
    const isGold = (pal.borderCol === '#ffd700');

    const easeOut = 1 - Math.pow(1 - p, 3);
    const alpha = Math.max(0, 1.0 - Math.pow(p, 1.2));
    if (alpha <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const mainCol = isGold ? '#ffd700' : pal.borderCol;
    const coreCol = isGold ? '#fef08a' : (pal.spineCol || '#ffffff');

    // 1. Expanding Rectangular Kido Barrier Frame
    const expandScale = 1.0 + easeOut * 0.28;
    const boxW = w * expandScale;
    const boxH = h * expandScale;
    const boxX = cx - boxW / 2;
    const boxY = cy - boxH / 2;
    const boxR = 6 * expandScale;

    ctx.strokeStyle = mainCol;
    ctx.globalAlpha = alpha * 0.85;
    ctx.lineWidth = Math.max(1, 1.8 * (1 - p * 0.6));
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(boxX, boxY, boxW, boxH, boxR);
    else ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.stroke();

    // 2. Corner Kido Bracket Seals bursting outward
    const bracketLen = 6 * (1 + easeOut * 0.2);
    ctx.strokeStyle = coreCol;
    ctx.globalAlpha = alpha * 0.95;
    ctx.lineWidth = 1.4;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(boxX + 2, boxY + 2 + bracketLen);
    ctx.lineTo(boxX + 2, boxY + 2);
    ctx.lineTo(boxX + 2 + bracketLen, boxY + 2);
    // Top-Right
    ctx.moveTo(boxX + boxW - 2 - bracketLen, boxY + 2);
    ctx.lineTo(boxX + boxW - 2, boxY + 2);
    ctx.lineTo(boxX + boxW - 2, boxY + 2 + bracketLen);
    // Bottom-Left
    ctx.moveTo(boxX + 2, boxY + boxH - 2 - bracketLen);
    ctx.lineTo(boxX + 2, boxY + boxH - 2);
    ctx.lineTo(boxX + 2 + bracketLen, boxY + boxH - 2);
    // Bottom-Right
    ctx.moveTo(boxX + boxW - 2 - bracketLen, boxY + boxH - 2);
    ctx.lineTo(boxX + boxW - 2, boxY + boxH - 2);
    ctx.lineTo(boxX + boxW - 2, boxY + boxH - 2 - bracketLen);
    ctx.stroke();

    // 3. Hadō Reishi Cross Slash (Horizontal & Vertical energy beam)
    const hSlashLen = (w * 0.35) + easeOut * (w * 0.65);
    const vSlashLen = (h * 0.30) + easeOut * (h * 0.55);
    const slashAlpha = Math.max(0, (1 - p * 1.5) * 0.9);

    if (slashAlpha > 0.02) {
      ctx.globalAlpha = slashAlpha;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8 * (1 - p);
      ctx.beginPath();
      ctx.moveTo(cx - hSlashLen, cy);
      ctx.lineTo(cx + hSlashLen, cy);
      ctx.moveTo(cx, cy - vSlashLen);
      ctx.lineTo(cx, cy + vSlashLen);
      ctx.stroke();

      // Outer color halo on cross
      ctx.strokeStyle = mainCol;
      ctx.lineWidth = 3.5 * (1 - p);
      ctx.globalAlpha = slashAlpha * 0.6;
      ctx.beginPath();
      ctx.moveTo(cx - hSlashLen, cy);
      ctx.lineTo(cx + hSlashLen, cy);
      ctx.moveTo(cx, cy - vSlashLen);
      ctx.lineTo(cx, cy + vSlashLen);
      ctx.stroke();
    }

    // 4. Expanding Hadō Spiritual Diamond Core
    const diaScale = 1.0 + easeOut * 1.2;
    const diaHW = 9 * diaScale;
    const diaHH = 7 * diaScale;
    const diaAlpha = Math.max(0, (1 - p * 1.3) * 0.9);

    if (diaAlpha > 0.02) {
      ctx.globalAlpha = diaAlpha;
      ctx.strokeStyle = mainCol;
      ctx.lineWidth = 1.3 * (1 - p * 0.5);
      ctx.beginPath();
      ctx.moveTo(cx, cy - diaHH);
      ctx.lineTo(cx + diaHW, cy);
      ctx.lineTo(cx, cy + diaHH);
      ctx.lineTo(cx - diaHW, cy);
      ctx.closePath();
      ctx.stroke();
    }

    // 5. White-Hot Center Focal Flash (instant tactile punch)
    if (p < 0.4) {
      const flashP = p / 0.4;
      const flashR = (w * 0.20) * (1 - flashP * 0.4);
      const flashAlpha = (1 - flashP) * 0.95;
      const flashGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
      flashGrad.addColorStop(0,   `rgba(255, 255, 255, ${flashAlpha})`);
      flashGrad.addColorStop(0.3, isGold ? `rgba(254, 240, 138, ${flashAlpha * 0.8})` : `rgba(232, 121, 249, ${flashAlpha * 0.8})`);
      flashGrad.addColorStop(1,   'rgba(0, 0, 0, 0)');
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, flashR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  // ==========================================================================
  // SINUOUS SERPENTINE DRAGON BODY (Извивающийся хвост дракона по эскизу)
  // ==========================================================================
  drawHoldBody(ctx, x, yTail, w, headH, tile, isLight, now, tailH, currentCombo = 0, actualYHeadTop = null, isReleased = false) {
    if (tailH <= 2) return true;

    const dead      = isReleased || Boolean(tile && tile.failed);
    const holding   = Boolean(tile && tile.holding && tile.hit);
    const liveCombo = (currentCombo !== undefined && currentCombo !== null && currentCombo > 0)
      ? currentCombo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : (tile?.style?.tier || 0));
    const tier      = dead ? 0 : liveCombo;
    const pal       = this._getTierPalette(tier, dead, holding);
    const isGold    = (pal.borderCol === '#ffd700');

    const bodyLaneW   = Math.max(10, Math.round(w - 16));
    const bodyCenterX = Math.round(x + 8) + bodyLaneW / 2;
    const headTopY    = (actualYHeadTop !== null && actualYHeadTop !== undefined) ? actualYHeadTop : (yTail + tailH);

    ctx.save();

    // 1. Calculate serpentine parameters
    const ribbonHW       = Math.max(7, Math.round(bodyLaneW * 0.22));
    const maxAmpBase     = Math.max(4, (bodyLaneW / 2) - ribbonHW - 2);
    // Smoothly scale amplitude down when tail is short so it doesn't whip near the receptor
    const ampScale       = Math.min(1.0, tailH / 90);
    const maxAmp         = maxAmpBase * ampScale;
    const coilWavelength = 200;
    const numCoils       = Math.max(1.0, tailH / coilWavelength);

    // Dynamic wave animation: living undulating slither travelling along dragon body
    const waveSpeed = (holding && !dead) ? 0.0075 : 0.0042;
    const waveAnim  = (now || 0) * waveSpeed;

    const getCenterX = (y) => {
      const prog = Math.max(0, Math.min(1, (headTopY - y) / tailH));
      // sin^2 envelope ensures BOTH lateral deviation AND horizontal derivative (slope) are STRICTLY 0
      // at prog=0 (neck junction) and prog=1 (tail tip junction).
      // This mathematically guarantees that the slithering body remains 100% vertically aligned
      // with the neck at the bottom and with the tip shaft at the top with ZERO gap or detachment!
      const sinE = Math.sin(prog * Math.PI);
      const env = sinE * sinE;
      const phase = prog * numCoils * Math.PI * 2 - waveAnim;
      return bodyCenterX + Math.sin(phase) * (maxAmp * env);
    };

    const stepY = 16;
    const numSteps = Math.ceil(tailH / stepY);

    // Path 1: Dark ethereal smoky aura hugging the winding body
    const auraWidth = ribbonHW + 7;
    ctx.strokeStyle = isGold ? 'rgba(251, 191, 36, 0.22)' : (pal.auraCol || 'rgba(168, 85, 247, 0.20)');
    ctx.lineWidth   = auraWidth * 2;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    for (let i = 0; i <= numSteps; i++) {
      const y = Math.max(yTail, headTopY - i * stepY);
      const cx = getCenterX(y);
      if (i === 0) ctx.moveTo(cx, y);
      else ctx.lineTo(cx, y);
      if (y <= yTail) break;
    }
    ctx.stroke();

    // Path 2: Solid dragon serpent body (filled ribbon with gradient)
    ctx.beginPath();
    for (let i = 0; i <= numSteps; i++) {
      const y = Math.max(yTail, headTopY - i * stepY);
      const cx = getCenterX(y);
      const lx = cx - ribbonHW;
      if (i === 0) ctx.moveTo(lx, y);
      else ctx.lineTo(lx, y);
      if (y <= yTail) break;
    }
    const topCX = getCenterX(yTail);
    ctx.lineTo(topCX + ribbonHW, yTail);
    for (let i = numSteps; i >= 0; i--) {
      const y = Math.max(yTail, headTopY - i * stepY);
      const cx = getCenterX(y);
      const rx = cx + ribbonHW;
      ctx.lineTo(rx, y);
      if (y >= headTopY) break;
    }
    ctx.closePath();

    const bgGrad = ctx.createLinearGradient(0, yTail, 0, headTopY);
    bgGrad.addColorStop(0,   pal.bgTop);
    bgGrad.addColorStop(0.5, pal.bgBot);
    bgGrad.addColorStop(1,   pal.bgTop);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Outer edge borders of serpent body
    ctx.strokeStyle = pal.borderCol;
    ctx.lineWidth   = 1.6;
    ctx.stroke();

    // 3. Serrated dorsal fin spikes along outer curves (synchronized with animated wave)
    if (!dead) {
      this._drawSerpentFinSpikes(ctx, headTopY, yTail, tailH, numCoils, maxAmp, bodyCenterX, ribbonHW, pal, waveAnim);
    }

    // 5. Chevron armor scales along the winding centerline
    ctx.strokeStyle = pal.chevronCol;
    ctx.lineWidth   = 1.3;
    const chevronStep = 24;
    for (let y = headTopY - 14; y > yTail + 10; y -= chevronStep) {
      const cx = getCenterX(y);
      const cw = ribbonHW * 0.75;
      ctx.beginPath();
      ctx.moveTo(cx - cw, y - 4);
      ctx.lineTo(cx,      y + 4);
      ctx.lineTo(cx + cw, y - 4);
      ctx.stroke();
    }

    // 6. Sinuous central spinal cord & glowing vertebrae beads (о-о-о-о-о)
    ctx.strokeStyle = pal.spineCol;
    ctx.lineWidth   = holding ? 2.2 : 1.8;
    ctx.beginPath();
    for (let i = 0; i <= numSteps; i++) {
      const y = Math.max(yTail, headTopY - i * stepY);
      const cx = getCenterX(y);
      if (i === 0) ctx.moveTo(cx, y);
      else ctx.lineTo(cx, y);
      if (y <= yTail) break;
    }
    ctx.stroke();

    // Glowing vertebrae beads following the undulating S-curve (batched in 2 passes for 60fps)
    const beadStep = 24;
    let beadIdx = 0;
    const beads = [];
    for (let y = headTopY - 12; y > yTail + 8; y -= beadStep) {
      const cx = getCenterX(y);
      const wave = Math.sin(now * 0.008 - beadIdx * 0.6) * 0.5 + 0.5;
      const bRad = 2.4 + wave * 0.7;
      beads.push({ cx, y, bRad });
      beadIdx++;
    }

    if (beads.length > 0) {
      // Outer glow batch
      ctx.fillStyle = isGold ? 'rgba(254, 240, 138, 0.40)' : (pal.auraCol || 'rgba(192, 132, 252, 0.35)');
      ctx.beginPath();
      for (let b = 0; b < beads.length; b++) {
        const item = beads[b];
        ctx.moveTo(item.cx + item.bRad * 1.8, item.y);
        ctx.arc(item.cx, item.y, item.bRad * 1.8, 0, Math.PI * 2);
      }
      ctx.fill();

      // Inner solid core batch
      ctx.fillStyle = pal.beadCol || '#ffffff';
      ctx.beginPath();
      for (let b = 0; b < beads.length; b++) {
        const item = beads[b];
        ctx.moveTo(item.cx + item.bRad, item.y);
        ctx.arc(item.cx, item.y, item.bRad, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    ctx.restore();
    return true;
  },

  // ==========================================================================
  // POST-NOTES OVERLAY (Парящий пепел Рейси после рендеринга всех нот)
  // ==========================================================================
  drawPostNotesOverlay(ctx, now, combo = 0) {
    const liveCombo = (combo !== undefined && combo !== null && combo > 0)
      ? combo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : 0);
    const pal = this._getTierPalette(liveCombo, false, false);
    this._updateAndDrawReishiAsh(ctx, pal);
  },

  // ==========================================================================
  // DRAGON NECK CONNECTOR (Same width as tail body, zero widening, synchronized with head)
  // ==========================================================================
  drawNeck(ctx, x, junctionY, w, headH, tile, isReleased = false, currentCombo = 0) {
    const bodyW   = Math.max(10, Math.round(w - 16));
    const bodyX   = Math.round(x + 8);
    const cx      = bodyX + bodyW / 2;
    // Exactly matches serpent body thickness (Math.round(bodyW * 0.22))
    const hw      = Math.max(7, Math.round(bodyW * 0.22));
    const neckH   = Math.round(headH * 0.45);
    const neckBot = junctionY + neckH;

    const dead    = isReleased || Boolean(tile && tile.failed);
    const holding = Boolean(tile && tile.holding && tile.hit);
    const tier    = dead ? 0 : (currentCombo || (tile?.style?.tier || 0));
    const pal     = this._getTierPalette(tier, dead, holding);

    ctx.save();

    // 1. Uniform neck body matching tail width exactly (NO widening at end)
    const ng = ctx.createLinearGradient(cx, junctionY, cx, neckBot);
    ng.addColorStop(0,    pal.bgBot);
    ng.addColorStop(0.50, pal.bgTop);
    ng.addColorStop(1,    pal.bgBot);
    ctx.fillStyle = ng;
    ctx.beginPath();
    ctx.rect(cx - hw, junctionY, hw * 2, neckH);
    ctx.fill();

    // 2. Parallel side border lines (same width as tail)
    ctx.strokeStyle = pal.borderCol;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - hw, junctionY);
    ctx.lineTo(cx - hw, neckBot);
    ctx.moveTo(cx + hw, junctionY);
    ctx.lineTo(cx + hw, neckBot);
    ctx.stroke();

    // 3. Chevrons inside neck
    ctx.strokeStyle = pal.chevronCol;
    ctx.lineWidth   = 1.2;
    for (let i = 1; i <= 2; i++) {
      const cy2 = junctionY + (i / 3) * neckH;
      ctx.beginPath();
      ctx.moveTo(cx - hw * 0.75, cy2 - 3);
      ctx.lineTo(cx,             cy2 + 4);
      ctx.lineTo(cx + hw * 0.75, cy2 - 3);
      ctx.stroke();
    }

    // 4. Central spine through neck
    ctx.strokeStyle = pal.spineCol;
    ctx.lineWidth   = holding ? 2.2 : 1.8;
    ctx.beginPath();
    ctx.moveTo(cx, junctionY);
    ctx.lineTo(cx, neckBot);
    ctx.stroke();

    ctx.restore();
  },

  // ==========================================================================
  // HOLD TAIL & REISHI DISINTEGRATION ENGINE
  // - Crown of 5 Dragon Heads (Goryūtenmetsu per user sketch media_1789239860628.png)
  // - Reishi Disintegration & Falling Ash (Option 2): fiery burning edge + floating ash/embers
  // - Live combo adaptation across all tiers
  // ==========================================================================
  drawHoldTail(ctx, x, yTail, w, headH, tile, isLight, now, tailH = 0, currentCombo = 0, actualYHeadTop = null, nextTileDist = 9999) {
    const isMob   = typeof window !== 'undefined' && (window.innerWidth <= 768 || navigator.maxTouchPoints > 1);
    const bodyW   = Math.max(10, Math.round(w - 16));
    const bodyX   = Math.round(x + 8);
    const cx      = bodyX + bodyW / 2;
    const hw      = Math.max(7, Math.round(bodyW * 0.22));

    const holding = tile.holding && tile.hit;
    const dead    = tile.failed;

    // Get live combo: from argument, from tile, or from window.GameState
    const liveCombo = (currentCombo !== undefined && currentCombo !== null && currentCombo > 0)
      ? currentCombo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : (tile?.style?.tier || 0));

    const tier    = dead ? 0 : liveCombo;
    const pal     = this._getTierPalette(tier, dead, holding);

    const isGold  = (pal.borderCol === '#ffd700');

    // Dimensions: dynamic safety clamping against upcoming note on same lane
    const availableGap = (typeof nextTileDist === 'number' && nextTileDist > 0) ? nextTileDist : 9999;
    const maxSafeTailLen = Math.max(12, Math.round(availableGap - 22));
    const baseTailLen    = Math.min(105, Math.round(headH * 0.58));
    const tailLen        = Math.min(baseTailLen, maxSafeTailLen);
    const bladeH         = Math.min(28, tailLen * 0.28);
    const shaftLen       = tailLen - bladeH;
    const tipY           = yTail - tailLen;
    const bladeRootY     = tipY + bladeH;
    const shaftNeckHW    = Math.max(4, Math.round(hw * 0.35));

    ctx.save();

    // 1. Tapering dragon tail shaft
    const tg = ctx.createLinearGradient(cx, tipY, cx, yTail + 2);
    tg.addColorStop(0,   pal.bgTop);
    tg.addColorStop(0.5, pal.bgBot);
    tg.addColorStop(1,   pal.bgTop);
    ctx.fillStyle = tg;

    ctx.beginPath();
    ctx.moveTo(cx - hw, yTail + 2);
    ctx.bezierCurveTo(
      cx - hw,                yTail - shaftLen * 0.35,
      cx - shaftNeckHW * 2.2, bladeRootY + shaftLen * 0.25,
      cx - shaftNeckHW,       bladeRootY
    );
    ctx.lineTo(cx + shaftNeckHW, bladeRootY);
    ctx.bezierCurveTo(
      cx + shaftNeckHW * 2.2, bladeRootY + shaftLen * 0.25,
      cx + hw,                yTail - shaftLen * 0.35,
      cx + hw,                yTail + 2
    );
    ctx.closePath();
    ctx.fill();

    // Stroke left and right outer contours
    ctx.strokeStyle = pal.borderCol;
    ctx.lineWidth   = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - hw, yTail + 2);
    ctx.bezierCurveTo(
      cx - hw,                yTail - shaftLen * 0.35,
      cx - shaftNeckHW * 2.2, bladeRootY + shaftLen * 0.25,
      cx - shaftNeckHW,       bladeRootY
    );
    ctx.moveTo(cx + shaftNeckHW, bladeRootY);
    ctx.bezierCurveTo(
      cx + shaftNeckHW * 2.2, bladeRootY + shaftLen * 0.25,
      cx + hw,                yTail - shaftLen * 0.35,
      cx + hw,                yTail + 2
    );
    ctx.stroke();

    // 2. Lateral fin spikes along the shaft
    if (!dead) {
      ctx.fillStyle   = pal.finSpikeCol;
      ctx.strokeStyle = pal.bladeBorder || pal.borderCol;
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

    // 3. Chevrons on shaft
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

    // 4. Central spine line & glowing vertebrae beads
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
      // Pulsing spiritual energy wave running down the spine
      const wave = Math.sin(now * 0.007 - i * 0.6) * 0.5 + 0.5;
      const bw = (3.0 + wave * 0.8) * (1.0 - t * 0.35);
      const bh = bw * 1.35;
      ctx.beginPath();
      ctx.ellipse(cx, vy, bw, bh, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 5. Arrowhead / Crescent Spade Dragon Blade at the tip of the shaft (per sketch)
    const bladeW = Math.min(22, hw * 0.42);
    ctx.fillStyle   = pal.bladeCol || pal.bgBot;
    ctx.strokeStyle = pal.bladeBorder || pal.borderCol;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.bezierCurveTo(
      cx - bladeW * 0.38, tipY + bladeH * 0.45,
      cx - bladeW * 0.85, tipY + bladeH * 0.80,
      cx - bladeW,        tipY + bladeH
    );
    ctx.bezierCurveTo(
      cx - bladeW * 0.65, tipY + bladeH - 5,
      cx - bladeW * 0.25, tipY + bladeH - 3,
      cx,                 bladeRootY
    );
    ctx.bezierCurveTo(
      cx + bladeW * 0.25, tipY + bladeH - 3,
      cx + bladeW * 0.65, tipY + bladeH - 5,
      cx + bladeW,        tipY + bladeH
    );
    ctx.bezierCurveTo(
      cx + bladeW * 0.85, tipY + bladeH * 0.80,
      cx + bladeW * 0.38, tipY + bladeH * 0.45,
      cx,                 tipY
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = pal.spineCol;
    ctx.lineWidth   = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.lineTo(cx, bladeRootY);
    ctx.stroke();

    // 6. CROWN OF 5 DRAGON HEADS (Goryūtenmetsu per user sketch)
    // Adapts sprite, aura, glowing eyes and golden halo directly to combo tier (tier0 to tier5 gold)
    let crownW = Math.round(w * 0.96);
    let crownH = Math.round(crownW * (255 / 198));

    // Dynamic anti-overlap scaling: guarantee the crown never breaches the next incoming note
    let showCrown = true;
    if (availableGap < 9999) {
      const allowedCrownTop = (yTail - availableGap) + 15;
      const nominalCrownTop = bladeRootY - crownH + 28;
      if (nominalCrownTop < allowedCrownTop) {
        const availableCrownH = bladeRootY + 28 - allowedCrownTop;
        if (availableCrownH < 36) {
          showCrown = false;
        } else {
          const cScale = Math.max(0.30, Math.min(1.0, availableCrownH / crownH));
          crownW = Math.round(crownW * cScale);
          crownH = Math.round(crownH * cScale);
        }
      }
    }

    const tremor = (holding && !isMob) ? Math.sin(now * 0.055) * 1.5 : 0;
    const crownX = cx - crownW / 2 + tremor;
    const crownY = bladeRootY - crownH + 28;

    const dissolveAlpha = (holding && tailH < 120) ? Math.max(0, tailH / 120) : 1.0;

    if (showCrown && dissolveAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = dissolveAlpha;

      // Soft spiritual pressure aura behind 5 heads matching combo color
      const crownAura = ctx.createRadialGradient(cx, crownY + crownH * 0.42, 6, cx, crownY + crownH * 0.42, crownW * 0.58);
      crownAura.addColorStop(0,    isGold ? 'rgba(251, 191, 36, 0.45)' : (pal.auraCol || 'rgba(192, 132, 252, 0.35)'));
      crownAura.addColorStop(0.70, isGold ? 'rgba(251, 191, 36, 0.10)' : 'rgba(147, 51, 234, 0.08)');
      crownAura.addColorStop(1,    'rgba(0, 0, 0, 0)');
      ctx.fillStyle = crownAura;
      ctx.beginPath();
      ctx.arc(cx, crownY + crownH * 0.42, crownW * 0.58, 0, Math.PI * 2);
      ctx.fill();

      // Draw combo-adapted multi-tonal sprite
      const headsSprite = this._getDragon5HeadsSprite(tier, dead);
      if (headsSprite && headsSprite.complete && headsSprite.naturalWidth > 0) {
        ctx.drawImage(headsSprite, crownX, crownY, crownW, crownH);
      }

      // Glowing dragon eye accents on the 5 heads matching combo (Zero shadowBlur for 60fps)
      if (!dead) {
        const eyeColor = isGold ? '#fef08a' : (pal.eyeGlow || pal.borderCol);
        const eyeGlowAlpha = Math.sin(now * 0.009) * 0.15 + 0.85;
        ctx.globalAlpha = dissolveAlpha * eyeGlowAlpha;

        // Coordinates for eyes of 5 heads relative to crown box
        const eyePositions = [
          [0.485, 0.22], [0.515, 0.22], // Center head
          [0.29, 0.28],  [0.32, 0.28],  // Mid-left head
          [0.68, 0.28],  [0.71, 0.28],  // Mid-right head
          [0.15, 0.48],  [0.175, 0.48], // Far-left head
          [0.825, 0.48], [0.85, 0.48]   // Far-right head
        ];

        // Pass 1: Soft outer eye aura (batched)
        ctx.fillStyle = isGold ? 'rgba(254, 240, 138, 0.40)' : (pal.auraCol || 'rgba(232, 121, 249, 0.40)');
        ctx.beginPath();
        for (let e = 0; e < eyePositions.length; e++) {
          const ex = eyePositions[e][0], ey = eyePositions[e][1];
          const px = crownX + crownW * ex, py = crownY + crownH * ey;
          ctx.moveTo(px + 2.6, py);
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        }
        ctx.fill();

        // Pass 2: Sharp luminous pupil core (batched)
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        for (let e = 0; e < eyePositions.length; e++) {
          const ex = eyePositions[e][0], ey = eyePositions[e][1];
          const px = crownX + crownW * ex, py = crownY + crownH * ey;
          ctx.moveTo(px + 1.3, py);
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        }
        ctx.fill();

        // Radiant Gold spiritual crown flare at 800+ combo
        if (isGold) {
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.55)';
          ctx.lineWidth   = 1.2;
          ctx.beginPath();
          ctx.moveTo(crownX + crownW * 0.45, crownY + crownH * 0.14);
          ctx.lineTo(crownX + crownW * 0.50, crownY + crownH * 0.06);
          ctx.lineTo(crownX + crownW * 0.55, crownY + crownH * 0.14);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // 6. REISHI DISINTEGRATION & FALLING ASH EFFECT (OPTION 2)
    if (holding) {
      // Spawn floating ash and glowing Reishi embers at yTail
      this._spawnReishiAsh(cx, yTail, hw, pal, now);

      // Fiery animated burning Reishi line along the active yTail horizon
      const flameSteps = 12;
      ctx.strokeStyle = pal.burnCol || '#f0abfc';
      ctx.lineWidth   = 2.4;
      ctx.beginPath();
      for (let s = 0; s <= flameSteps; s++) {
        const fx = cx - hw + (s / flameSteps) * (hw * 2);
        const fy = yTail + Math.sin(now * 0.025 + s * 1.9) * 3.5;
        if (s === 0) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      ctx.stroke();

      // White-hot core highlight line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth   = 1.1;
      ctx.beginPath();
      for (let s = 0; s <= flameSteps; s++) {
        const fx = cx - hw + (s / flameSteps) * (hw * 2);
        const fy = yTail + Math.sin(now * 0.025 + s * 1.9) * 2.0;
        if (s === 0) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      ctx.stroke();
    }

    // Update & draw all active ash and Reishi embers
    this._updateAndDrawReishiAsh(ctx, pal);

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
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
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

      // Dragon Head Silhouette
      ctx.fillStyle = dr.spine;
      ctx.beginPath();
      ctx.arc(hx, hy, dr.bw * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Dragon Eyes
      ctx.fillStyle = '#f0abfc';
      ctx.beginPath();
      ctx.arc(hx - dr.bw * 0.18, hy - 2, 2.0, 0, Math.PI * 2);
      ctx.arc(hx + dr.bw * 0.18, hy - 2, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Aizen Silhouette atop central spire
    const ax = W * 0.50, ay = H * 0.74, asc = isMob ? 0.85 : 1.15;
    const halo = ctx.createRadialGradient(ax, ay - 26 * asc, 2, ax, ay - 26 * asc, 42 * asc);
    halo.addColorStop(0,   'rgba(255, 255, 255, 0.45)');
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

    // Update & draw any active floating Reishi ash/embers across the atmosphere
    const currentCombo = (typeof State !== 'undefined' && State?.combo) || 0;
    this._updateAndDrawReishiAsh(ctx, this._getTierPalette(currentCombo, false, false));

    ctx.restore();
  }
};
