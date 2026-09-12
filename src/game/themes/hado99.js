// ============================================================================
// HADO 99 THEME MODULE — Sōsuke Aizen & Hadō #99: Goryūtenmetsu (破道の九十九 五龍転滅)
// Notes = Top-down dragon head matching user sketch (segmented horns, crown scales, snout)
// At 800+ combo turns into radiant Hōgyoku gold.
// ============================================================================

// Preload dragon head sprites
const dragonSprites = {
  violet: typeof Image !== 'undefined' ? new Image() : null,
  gold:   typeof Image !== 'undefined' ? new Image() : null,
  dead:   typeof Image !== 'undefined' ? new Image() : null
};
if (dragonSprites.violet) dragonSprites.violet.src = './assets/themes/hado99_dragon_violet.png?v=71.2';
if (dragonSprites.gold)   dragonSprites.gold.src   = './assets/themes/hado99_dragon_gold.png?v=71.2';
if (dragonSprites.dead)   dragonSprites.dead.src   = './assets/themes/hado99_dragon_dead.png?v=71.2';

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

  // ==========================================================================
  // DRAGON HEAD RENDERER (TOP-DOWN AERIAL VIEW per user sketch)
  // Segmented horns, crown scale collar, side quills, snout (no eyes).
  // ==========================================================================
  _drawDragonHead(ctx, cx, cy, w, h, tier, isDead) {
    const gold = (tier >= 800) && !isDead;
    const sprite = isDead ? dragonSprites.dead : (gold ? dragonSprites.gold : dragonSprites.violet);

    ctx.save();

    // 1. Soft Reiatsu Aura behind head
    const auraG = ctx.createRadialGradient(cx, cy, w * 0.1, cx, cy, w * 0.65);
    auraG.addColorStop(0,   gold ? 'rgba(251, 191, 36, 0.45)' : 'rgba(168, 85, 247, 0.40)');
    auraG.addColorStop(0.6, gold ? 'rgba(180, 83, 9, 0.15)'  : 'rgba(88, 28, 135, 0.15)');
    auraG.addColorStop(1,   'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraG;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.58, h * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw preloaded dragon head sprite if ready
    let drawnFromSprite = false;
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      // Natural aspect ratio: 246w / 371h ≈ 0.663
      const targetH = h * 0.94;
      const targetW = targetH * (246 / 371);
      const drawW   = Math.min(w * 0.96, targetW);
      const drawH   = drawW / (246 / 371);
      const drawX   = cx - drawW / 2;
      const drawY   = cy - drawH / 2;

      ctx.drawImage(sprite, drawX, drawY, drawW, drawH);
      drawnFromSprite = true;
    }

    // Fallback vector drawing if sprite is not yet loaded
    if (!drawnFromSprite) {
      const C = isDead ? {
        base: '#1e293b', plate: '#334155', line: '#94a3b8', glow: '#64748b'
      } : gold ? {
        base: '#78350f', plate: '#d97706', line: '#fef08a', glow: '#fbbf24'
      } : {
        base: '#3b0764', plate: '#7e22ce', line: '#f5d0fe', glow: '#c084fc'
      };

      const scale = Math.min(w / 246, h / 371) * 0.92;
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);

      // Crown scales
      ctx.fillStyle = C.plate;
      ctx.strokeStyle = C.line;
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
      ctx.fillStyle = C.base;
      ctx.beginPath();
      ctx.moveTo(-30, 20); ctx.lineTo(30, 20);
      ctx.lineTo(20, 120); ctx.lineTo(16, 145);
      ctx.lineTo(-16, 145); ctx.lineTo(-20, 120);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Snout nostrils & bridge
      ctx.strokeStyle = C.glow;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-10, 132); ctx.lineTo(-5, 140);
      ctx.moveTo(10, 132); ctx.lineTo(5, 140);
      ctx.moveTo(0, 80); ctx.lineTo(0, 120);
      ctx.stroke();

      // Segmented Horns (left and right)
      for (const side of [-1, 1]) {
        for (let s = 0; s < 7; s++) {
          const t = s / 7;
          const y0 = 20 - t * 180;
          const x0 = side * (32 + Math.sin(t * 2.2) * 55);
          ctx.beginPath();
          ctx.ellipse(x0, y0, 14 * (1 - t * 0.7), 12, side * 0.25, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
        }
        // Temporal quill
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
      bG.addColorStop(0.3, gold ? '#fbbf24' : '#c084fc');
      bG.addColorStop(0.7, gold ? 'rgba(245, 158, 11, 0.40)' : 'rgba(147, 51, 234, 0.35)');
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

  bakeLongTail(ctx, tailW, tailH, isLight, style) {
    const tier = style?.tier || 0;
    const gold = (tier >= 800);
    const cx   = tailW / 2;

    const bg = ctx.createLinearGradient(0, 0, 0, tailH);
    if (gold) {
      bg.addColorStop(0,   'rgba(40, 15, 0, 0.45)');
      bg.addColorStop(0.2, '#78350f');
      bg.addColorStop(0.7, '#b45309');
      bg.addColorStop(1,   '#d97706');
    } else {
      bg.addColorStop(0,   'rgba(15, 3, 26, 0.45)');
      bg.addColorStop(0.2, '#2e0854');
      bg.addColorStop(0.7, '#581c87');
      bg.addColorStop(1,   '#9333ea');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, tailW, tailH);

    // Left and right border strokes (continuous with tail curves)
    ctx.strokeStyle = gold ? 'rgba(251, 191, 36, 0.55)' : 'rgba(192, 132, 252, 0.45)';
    ctx.lineWidth   = 1.6;
    ctx.beginPath();
    ctx.moveTo(1, 0); ctx.lineTo(1, tailH);
    ctx.moveTo(tailW - 1, 0); ctx.lineTo(tailW - 1, tailH);
    ctx.stroke();

    // Seamless V-shaped chevron armor scales pointing down towards the head
    const rowCount = Math.round(tailH / 22);
    ctx.strokeStyle = gold ? 'rgba(251, 191, 36, 0.32)' : 'rgba(192, 132, 252, 0.28)';
    ctx.lineWidth   = 1.5;
    for (let r = 0; r < rowCount; r++) {
      const y = r * 22 + 10;
      ctx.beginPath();
      ctx.moveTo(cx - tailW * 0.42, y - 5);
      ctx.lineTo(cx, y + 7);
      ctx.lineTo(cx + tailW * 0.42, y - 5);
      ctx.stroke();
    }

    // Central luminous spinal cord
    const sg = ctx.createLinearGradient(0, 0, 0, tailH);
    sg.addColorStop(0,   gold ? 'rgba(251, 191, 36, 0.40)' : 'rgba(216, 180, 254, 0.40)');
    sg.addColorStop(0.5, gold ? '#fbbf24' : '#e9d5ff');
    sg.addColorStop(1,   '#ffffff');
    ctx.strokeStyle = sg;
    ctx.lineWidth   = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, tailH);
    ctx.stroke();

    // Dorsal vertebrae nodes
    ctx.fillStyle = gold ? '#fbbf24' : '#ffffff';
    for (let i = 1; i < 14; i++) {
      const ny = (i / 14) * tailH;
      ctx.beginPath();
      ctx.arc(cx, ny, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    return true;
  },

  // ==========================================================================
  // HOLD TAIL (Seamless natural continuation of the dragon body)
  // Perfectly merges at yTail with body width, tapering into a dragon fin tip.
  // ==========================================================================
  drawHoldTail(ctx, x, yTail, w, headH, tile, isLight, now) {
    const isMob   = typeof window !== 'undefined' && (window.innerWidth <= 768 || navigator.maxTouchPoints > 1);
    const bodyW   = Math.max(10, Math.round(w - 16));
    const bodyX   = Math.round(x + 8);
    const cx      = bodyX + bodyW / 2;
    const hw      = bodyW / 2;
    const tailLen = Math.min(95, Math.round(headH * 0.55));
    const tipY    = yTail - tailLen;

    const holding = tile.holding && tile.hit;
    const dead    = tile.failed;
    // Check if gold tier (800+ combo)
    const isGold  = (tile?.style?.tier >= 800 || (typeof State !== 'undefined' && State?.combo >= 800)) && !dead;

    ctx.save();

    // Color palette for tail
    let bgTop, bgBot, borderCol, chevronCol, spineCol, finCol;
    if (dead) {
      bgTop = '#0f172a'; bgBot = '#1e293b';
      borderCol = '#334155'; chevronCol = 'rgba(100, 116, 139, 0.4)';
      spineCol = '#64748b'; finCol = '#334155';
    } else if (isGold) {
      bgTop = '#78350f'; bgBot = '#b45309';
      borderCol = '#fbbf24'; chevronCol = 'rgba(253, 224, 71, 0.55)';
      spineCol = '#ffffff'; finCol = '#fbbf24';
    } else if (holding) {
      bgTop = '#581c87'; bgBot = '#9333ea';
      borderCol = '#f0abfc'; chevronCol = 'rgba(245, 208, 254, 0.65)';
      spineCol = '#ffffff'; finCol = '#d946ef';
    } else {
      bgTop = '#2e0854'; bgBot = '#4c1d95';
      borderCol = 'rgba(192, 132, 252, 0.70)'; chevronCol = 'rgba(192, 132, 252, 0.35)';
      spineCol = '#e9d5ff'; finCol = '#7e22ce';
    }

    // 1. Tapering dragon tail body (cubic bezier with vertical tangent at body connection)
    const tg = ctx.createLinearGradient(cx, tipY, cx, yTail + 2);
    tg.addColorStop(0, bgTop);
    tg.addColorStop(1, bgBot);
    ctx.fillStyle = tg;

    // Build left and right curves
    // At yTail + 2: width is exactly bodyW (cx ± hw), vertical slope matches body sides
    ctx.beginPath();
    ctx.moveTo(cx - hw, yTail + 2);
    ctx.bezierCurveTo(
      cx - hw,         yTail - tailLen * 0.32,
      cx - hw * 0.28,  tipY + tailLen * 0.22,
      cx,              tipY
    );
    ctx.bezierCurveTo(
      cx + hw * 0.28,  tipY + tailLen * 0.22,
      cx + hw,         yTail - tailLen * 0.32,
      cx + hw,         yTail + 2
    );
    ctx.closePath();
    ctx.fill();

    // Stroke ONLY left and right outer curves (NO stroke across the base seam!)
    ctx.strokeStyle = borderCol;
    ctx.lineWidth   = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - hw, yTail + 2);
    ctx.bezierCurveTo(
      cx - hw,         yTail - tailLen * 0.32,
      cx - hw * 0.28,  tipY + tailLen * 0.22,
      cx,              tipY
    );
    ctx.moveTo(cx, tipY);
    ctx.bezierCurveTo(
      cx + hw * 0.28,  tipY + tailLen * 0.22,
      cx + hw,         yTail - tailLen * 0.32,
      cx + hw,         yTail + 2
    );
    ctx.stroke();

    // 2. Tapering chevron armor scales (seamless continuation of body scales)
    ctx.strokeStyle = chevronCol;
    ctx.lineWidth   = 1.4;
    const chevrons  = 4;
    for (let i = 1; i <= chevrons; i++) {
      const t = i / (chevrons + 1);
      const cyT = yTail - t * tailLen * 0.80;
      const curHW = hw * Math.pow(1.0 - t, 1.25);
      ctx.beginPath();
      ctx.moveTo(cx - curHW + 2, cyT - 3);
      ctx.lineTo(cx, cyT + 5);
      ctx.lineTo(cx + curHW - 2, cyT - 3);
      ctx.stroke();
    }

    // 3. Continuous spinal cord running straight to the tip
    ctx.strokeStyle = spineCol;
    ctx.lineWidth   = holding ? 2.6 : 2.0;
    ctx.beginPath();
    ctx.moveTo(cx, yTail + 4);
    ctx.lineTo(cx, tipY);
    ctx.stroke();

    // 4. Elegant dragon tail fin (flame blades at the tip)
    if (!dead) {
      // Side flame blades
      ctx.fillStyle   = finCol;
      ctx.strokeStyle = isGold ? '#ffffff' : (holding ? '#ffffff' : '#e9d5ff');
      ctx.lineWidth   = 1.0;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx, tipY + 8);
        ctx.bezierCurveTo(cx + s * 14, tipY - 4, cx + s * 22, tipY - 14, cx + s * 18, tipY - 26);
        ctx.bezierCurveTo(cx + s * 10, tipY - 16, cx + s * 4, tipY - 10, cx, tipY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Center plume blade
      ctx.fillStyle = isGold ? '#ffffff' : (holding ? '#ffffff' : '#f5d0fe');
      ctx.beginPath();
      ctx.moveTo(cx - 3, tipY + 4);
      ctx.lineTo(cx, tipY - 30);
      ctx.lineTo(cx + 3, tipY + 4);
      ctx.closePath();
      ctx.fill();
    }

    // 5. Spiritual lightning arcs when holding
    if (holding && !isMob) {
      const fl = Math.sin(now * 0.022) * 3.5;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth   = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, tipY - 18);
      ctx.lineTo(cx + fl, tipY - 26);
      ctx.lineTo(cx - fl * 0.6, tipY - 36);
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

      // Background dragon head (top-down silhouette)
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

      // Horns
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
