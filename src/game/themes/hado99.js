// ============================================================================
// HADO 99 THEME MODULE — Sōsuke Aizen & Hadō #99: Goryūtenmetsu (破道の九十九 五龍転滅)
// Aesthetic: Flowing violet Reiatsu flame-spirits — smooth, luminous, no hard edges.
// At 800+ combo all dragon elements turn golden (Hōgyoku transcendence).
// Performance: sprite pre-baking, zero-allocation atmosphere, mobile-adaptive.
// ============================================================================

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
  // DRAGON HEAD — Violet Reiatsu flame-spirit (pre-baked into SpriteCache)
  // Inspired by Bleach canon: smooth flowing flame, glowing inner core,
  // NO hard geometric teeth/horns — pure spiritual energy silhouette.
  // At tier >= 800: all colors shift to gold (Hōgyoku transcendence).
  // ==========================================================================
  _drawDragonHead(ctx, cx, cy, w, h, tier, isDead) {
    const gold = (tier >= 800) && !isDead;

    // Color palette
    let outerFlame, innerFlame, coreCol, eyeCol, trailCol;
    if (isDead) {
      outerFlame = '#1e293b'; innerFlame = '#334155'; coreCol = '#475569'; eyeCol = '#64748b'; trailCol = 'rgba(71,85,105,0.4)';
    } else if (gold) {
      outerFlame = '#92400e'; innerFlame = '#d97706'; coreCol = '#fbbf24'; eyeCol = '#ffffff'; trailCol = 'rgba(251,191,36,0.55)';
    } else {
      outerFlame = '#3b0764'; innerFlame = '#7e22ce'; coreCol = '#d8b4fe'; eyeCol = '#ffffff'; trailCol = 'rgba(168,85,247,0.50)';
    }

    ctx.save();

    // ── Outer aura / spirit glow (radial, soft) ──
    const aG = ctx.createRadialGradient(cx, cy, w * 0.05, cx, cy, w * 0.60);
    aG.addColorStop(0,   trailCol);
    aG.addColorStop(0.6, gold ? 'rgba(180,83,9,0.18)' : 'rgba(88,28,135,0.18)');
    aG.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = aG;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.56, h * 0.68, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Main flame dragon head silhouette ──
    // Shape: wide flowing flame that tapers to left/right like a snarling maw,
    // with a crown of flame wisps arching upward — no hard lines.
    const sX = w / 100;
    const sY = h / 40;

    // Outer dark body
    ctx.fillStyle = outerFlame;
    ctx.beginPath();
    ctx.moveTo(cx,            cy - 16 * sY);  // top flame crest
    ctx.bezierCurveTo(cx + 22 * sX, cy - 18 * sY, cx + 44 * sX, cy -  8 * sY, cx + 46 * sX, cy +  4 * sY); // right sweep
    ctx.bezierCurveTo(cx + 42 * sX, cy + 14 * sY, cx + 28 * sX, cy + 16 * sY, cx + 16 * sX, cy + 14 * sY); // right lower jaw
    ctx.bezierCurveTo(cx +  8 * sX, cy + 18 * sY, cx -  8 * sX, cy + 18 * sY, cx - 16 * sX, cy + 14 * sY); // chin
    ctx.bezierCurveTo(cx - 28 * sX, cy + 16 * sY, cx - 42 * sX, cy + 14 * sY, cx - 46 * sX, cy +  4 * sY); // left lower jaw
    ctx.bezierCurveTo(cx - 44 * sX, cy -  8 * sY, cx - 22 * sX, cy - 18 * sY, cx,            cy - 16 * sY); // left sweep back to top
    ctx.closePath();
    ctx.fill();

    // Inner bright flame body (slightly smaller, luminous)
    const iG = ctx.createRadialGradient(cx, cy - 4 * sY, 2, cx, cy, 28 * sX);
    iG.addColorStop(0,   gold ? '#fbbf24' : '#e9d5ff');
    iG.addColorStop(0.45, gold ? '#d97706' : '#a855f7');
    iG.addColorStop(1,   gold ? '#92400e' : '#4c1d95');
    ctx.fillStyle = iG;
    ctx.beginPath();
    ctx.moveTo(cx,            cy - 11 * sY);
    ctx.bezierCurveTo(cx + 16 * sX, cy - 13 * sY, cx + 34 * sX, cy -  5 * sY, cx + 36 * sX, cy +  3 * sY);
    ctx.bezierCurveTo(cx + 32 * sX, cy + 10 * sY, cx + 20 * sX, cy + 12 * sY, cx + 10 * sX, cy + 10 * sY);
    ctx.bezierCurveTo(cx +  4 * sX, cy + 14 * sY, cx -  4 * sX, cy + 14 * sY, cx - 10 * sX, cy + 10 * sY);
    ctx.bezierCurveTo(cx - 20 * sX, cy + 12 * sY, cx - 32 * sX, cy + 10 * sY, cx - 36 * sX, cy +  3 * sY);
    ctx.bezierCurveTo(cx - 34 * sX, cy -  5 * sY, cx - 16 * sX, cy - 13 * sY, cx,            cy - 11 * sY);
    ctx.closePath();
    ctx.fill();

    // ── Flame wisps / crown — arcing upward like Reiatsu tendrils ──
    ctx.strokeStyle = gold ? '#fbbf24' : '#c084fc';
    ctx.lineWidth   = 3.5 * sX;
    ctx.lineCap     = 'round';

    // Central crest wisp
    ctx.beginPath();
    ctx.moveTo(cx, cy - 11 * sY);
    ctx.bezierCurveTo(cx + 6 * sX, cy - 22 * sY, cx + 14 * sX, cy - 26 * sY, cx + 8 * sX, cy - 32 * sY);
    ctx.stroke();

    // Left crest wisp
    ctx.lineWidth = 2.5 * sX;
    ctx.beginPath();
    ctx.moveTo(cx - 14 * sX, cy - 10 * sY);
    ctx.bezierCurveTo(cx - 22 * sX, cy - 20 * sY, cx - 28 * sX, cy - 22 * sY, cx - 24 * sX, cy - 28 * sY);
    ctx.stroke();

    // Right crest wisp
    ctx.beginPath();
    ctx.moveTo(cx + 14 * sX, cy - 10 * sY);
    ctx.bezierCurveTo(cx + 22 * sX, cy - 20 * sY, cx + 28 * sX, cy - 22 * sY, cx + 24 * sX, cy - 28 * sY);
    ctx.stroke();

    // Rear trailing wisps (body flame trails)
    ctx.lineWidth = 2.0 * sX;
    ctx.strokeStyle = gold ? 'rgba(251,191,36,0.65)' : 'rgba(192,132,252,0.65)';
    ctx.beginPath();
    ctx.moveTo(cx - 36 * sX, cy + 3 * sY);
    ctx.bezierCurveTo(cx - 46 * sX, cy - 2 * sY, cx - 50 * sX, cy - 8 * sY, cx - 44 * sX, cy - 14 * sY);
    ctx.moveTo(cx + 36 * sX, cy + 3 * sY);
    ctx.bezierCurveTo(cx + 46 * sX, cy - 2 * sY, cx + 50 * sX, cy - 8 * sY, cx + 44 * sX, cy - 14 * sY);
    ctx.stroke();

    // ── Glowing Eye (single central spirit eye) ──
    const eyeR = 4.0 * sX;
    const eG = ctx.createRadialGradient(cx, cy - 2 * sY, 0.5, cx, cy - 2 * sY, eyeR);
    eG.addColorStop(0,   '#ffffff');
    eG.addColorStop(0.4, gold ? '#fbbf24' : '#e9d5ff');
    eG.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = eG;
    ctx.beginPath();
    ctx.arc(cx, cy - 2 * sY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    // ── Bright core center (inner singularity) ──
    ctx.fillStyle = coreCol;
    ctx.beginPath();
    ctx.arc(cx, cy - 1 * sY, 2.5 * sX, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  // ==========================================================================
  // SPRITE BAKING HOOKS (called once at game start by SpriteCache)
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

    // Gradient body
    const bg = ctx.createLinearGradient(0, 0, 0, tailH);
    if (gold) {
      bg.addColorStop(0.00, 'rgba(30, 10, 0, 0.45)');
      bg.addColorStop(0.20, '#78350f');
      bg.addColorStop(0.70, '#b45309');
      bg.addColorStop(1.00, '#d97706');
    } else {
      bg.addColorStop(0.00, 'rgba(15, 3, 26, 0.40)');
      bg.addColorStop(0.20, '#2e0854');
      bg.addColorStop(0.70, '#581c87');
      bg.addColorStop(1.00, '#9333ea');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, tailW, tailH);

    // Flowing Reiatsu flame streaks along body (instead of hard scales)
    const streakCol = gold ? 'rgba(251,191,36,0.30)' : 'rgba(192,132,252,0.28)';
    ctx.strokeStyle = streakCol;
    ctx.lineWidth   = 2.0;
    ctx.lineCap     = 'round';
    for (let i = 0; i < 5; i++) {
      const ox = (i - 2) * (tailW * 0.18);
      ctx.beginPath();
      ctx.moveTo(cx + ox, 0);
      for (let y = 0; y < tailH; y += 28) {
        ctx.lineTo(cx + ox + Math.sin(y * 0.05 + i) * 5, y);
      }
      ctx.stroke();
    }

    // Central luminous spine
    const sg = ctx.createLinearGradient(0, 0, 0, tailH);
    sg.addColorStop(0,   gold ? 'rgba(251,191,36,0.35)' : 'rgba(216,180,254,0.35)');
    sg.addColorStop(0.5, gold ? '#fbbf24' : '#e9d5ff');
    sg.addColorStop(1,   '#ffffff');
    ctx.strokeStyle = sg;
    ctx.lineWidth   = 2.0;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, tailH);
    ctx.stroke();

    // Spine nodes
    ctx.fillStyle   = gold ? '#fbbf24' : '#ffffff';
    for (let i = 1; i < 13; i++) {
      const ny = (i / 13) * tailH;
      ctx.beginPath();
      ctx.arc(cx, ny, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    return true;
  },

  // ==========================================================================
  // HOLD NOTE TAIL (per-frame, kept minimal)
  // ==========================================================================
  drawHoldTail(ctx, x, yTail, w, headH, tile, isLight, now) {
    const isMob  = typeof window !== 'undefined' && (window.innerWidth <= 768 || navigator.maxTouchPoints > 1);
    const cx     = Math.round(x + w / 2);
    const sX     = w / 100;
    const len    = Math.min(36, headH * 1.1) * sX;
    const tipY   = yTail - len;
    const hw     = Math.max(5, Math.round((w - 18) / 2));
    const holding = tile.holding && tile.hit;
    const dead    = tile.failed;

    // Detect gold tier (combo >= 800): stored in tile theme state isn't available,
    // so we use the holding color brightening as a proxy
    ctx.save();

    const tg = ctx.createLinearGradient(cx, yTail, cx, tipY);
    if (dead) {
      tg.addColorStop(0, '#1e293b'); tg.addColorStop(1, '#0f172a');
    } else if (holding) {
      tg.addColorStop(0, '#c084fc'); tg.addColorStop(0.55, '#d946ef'); tg.addColorStop(1, '#f5d0fe');
    } else {
      tg.addColorStop(0, '#3b0764'); tg.addColorStop(0.6, '#7e22ce');  tg.addColorStop(1, '#c084fc');
    }

    ctx.fillStyle   = tg;
    ctx.strokeStyle = dead ? '#334155' : (holding ? '#ffffff' : '#9333ea');
    ctx.lineWidth   = 1.0;

    // Smooth tapered flame tail shape (no hard angles)
    ctx.beginPath();
    ctx.moveTo(cx - hw, yTail);
    ctx.bezierCurveTo(cx - hw * 0.55, yTail - len * 0.45, cx - 6 * sX, yTail - len * 0.78, cx, tipY - 3 * sX);
    ctx.bezierCurveTo(cx + 6 * sX, yTail - len * 0.78, cx + hw * 0.55, yTail - len * 0.45, cx + hw, yTail);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Flame wisp at tip
    if (!dead) {
      ctx.strokeStyle = holding ? '#ffffff' : '#c084fc';
      ctx.lineWidth   = 2.0 * sX;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, tipY - 3 * sX);
      ctx.bezierCurveTo(cx + 4 * sX, tipY - 10 * sX, cx + 8 * sX, tipY - 14 * sX, cx + 3 * sX, tipY - 20 * sX);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, tipY - 3 * sX);
      ctx.bezierCurveTo(cx - 4 * sX, tipY - 10 * sX, cx - 8 * sX, tipY - 14 * sX, cx - 3 * sX, tipY - 20 * sX);
      ctx.stroke();
    }

    // Holding lightning flash (cheap)
    if (holding && !isMob) {
      const fl = Math.sin(now * 0.022) * 3;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth   = 1.3;
      ctx.beginPath();
      ctx.moveTo(cx, tipY - 22 * sX);
      ctx.lineTo(cx + fl, tipY - 30 * sX);
      ctx.lineTo(cx - fl * 0.5, tipY - 36 * sX);
      ctx.stroke();
    }

    ctx.restore();
  },

  // ==========================================================================
  // RECEPTOR
  // ==========================================================================
  drawReceptor(ctx, x, y, w, h, isActive, isLight) {
    ctx.save();
    const cx = x + w / 2;
    const cy = y + h / 2;

    ctx.strokeStyle = isActive ? '#ffffff' : 'rgba(192, 132, 252, 0.60)';
    ctx.lineWidth   = isActive ? 2.2 : 1.3;
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 8);
    else ctx.strokeRect(x, y, w, h);
    ctx.stroke();

    // Corner flame claw marks
    const cl = 7;
    ctx.fillStyle = isActive ? '#ffffff' : '#a855f7';
    ctx.fillRect(x,         y,         cl, 2); ctx.fillRect(x,         y,         2, cl);
    ctx.fillRect(x + w - cl, y,         cl, 2); ctx.fillRect(x + w - 2,  y,         2, cl);
    ctx.fillRect(x,         y + h - 2, cl, 2); ctx.fillRect(x,         y + h - cl, 2, cl);
    ctx.fillRect(x + w - cl, y + h - 2, cl, 2); ctx.fillRect(x + w - 2,  y + h - cl, 2, cl);

    if (isActive) {
      const cg = ctx.createRadialGradient(cx, cy, 2, cx, cy, w * 0.48);
      cg.addColorStop(0,   'rgba(255,255,255,0.70)');
      cg.addColorStop(0.45,'rgba(192,132,252,0.35)');
      cg.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = cg;
      ctx.fillRect(x, y, w, h);
    }

    ctx.restore();
  },

  // ==========================================================================
  // HIT ANIMATION
  // ==========================================================================
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now) {
    if (p >= 1) return;
    const ease  = 1 - (1 - p) * (1 - p);
    ctx.save();

    // 5 outward flame bursts (no hard shape — just stroke wisps)
    const dist  = (w * 0.80) * ease;
    const alpha = Math.max(0, 0.90 - ease * 0.90);
    ctx.globalAlpha = alpha;
    ctx.lineCap     = 'round';
    ctx.lineWidth   = 3.0;

    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const mx = cx + Math.cos(angle) * dist * 0.55;
      const my = cy + Math.sin(angle) * dist * 0.55;
      const ex = cx + Math.cos(angle) * dist;
      const ey = cy + Math.sin(angle) * dist;

      const wg = ctx.createLinearGradient(cx, cy, ex, ey);
      wg.addColorStop(0,   isPerfect ? 'rgba(255,255,255,0.9)' : 'rgba(192,132,252,0.9)');
      wg.addColorStop(0.55, isPerfect ? 'rgba(251,191,36,0.75)' : 'rgba(147,51,234,0.75)');
      wg.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.strokeStyle = wg;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(mx + Math.cos(angle + Math.PI / 2) * 8, my + Math.sin(angle + Math.PI / 2) * 8, ex, ey);
      ctx.stroke();
    }

    // Diamond shockwave ring
    const dr = (w * 0.65) * ease;
    ctx.strokeStyle = isPerfect ? '#ffd700' : '#c084fc';
    ctx.lineWidth   = isPerfect ? 2.2 : 1.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy - dr); ctx.lineTo(cx + dr, cy);
    ctx.lineTo(cx, cy + dr); ctx.lineTo(cx - dr, cy);
    ctx.closePath();
    ctx.stroke();

    // Center flash
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
      // Reiatsu rhombus diamond
      const sz = 3.8 * life;
      ctx.fillStyle = pt.color || '#c084fc';
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.angle || 0);
      ctx.beginPath();
      ctx.moveTo(0, -sz * 1.4); ctx.lineTo(sz * 0.62, 0);
      ctx.lineTo(0,  sz * 1.4); ctx.lineTo(-sz * 0.62, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (mode === 1) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 1.7 * life, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#e9d5ff';
      ctx.fillRect(pt.x - 1, pt.y - 2.5 * life, 2, 5 * life);
    }
    ctx.restore();
  },

  // ==========================================================================
  // ATMOSPHERE — Bleach Hado 99 Background (zero-allocation, mobile-adaptive)
  // ==========================================================================
  _atm: null,
  _bgGrad: null,
  _bgKey: '',

  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const W   = State.gameWidth;
    const H   = State.gameHeight;
    const t   = songTime * 0.001;
    const isMob = State.isMobile;

    // ── Init state ──
    if (!this._atm || this._atm._W !== W || this._atm._H !== H) {
      const shardN = isMob ? 16 : 34;
      this._atm = {
        _W: W, _H: H,
        shards: Array.from({ length: shardN }, () => ({
          x:      Math.random() * W,
          y:      Math.random() * H,
          vy:    -0.40 - Math.random() * 1.0,
          vx:    (Math.random() - 0.5) * 0.24,
          sz:     3 + Math.random() * (isMob ? 7 : 11),
          angle:  Math.random() * Math.PI * 2,
          vRot:  (Math.random() - 0.5) * 0.025,
          bright: Math.random() > 0.55,
          amber:  Math.random() > 0.84
        })),
        // Two colossal grand dragon spirits — smooth flame silhouettes
        dragons: [
          { bxR: 0.76, byR: 0.36, segs: isMob ? 9  : 15, bw: isMob ? 18 : 30, col: '#2e0548', spine: '#9333ea', sp: 0.19, amp: W * 0.13, freq: 0.0038, ph: 0.0 },
          { bxR: 0.24, byR: 0.50, segs: isMob ? 7  : 12, bw: isMob ? 14 : 24, col: '#1c0332', spine: '#7e22ce', sp: 0.16, amp: W * 0.11, freq: 0.0048, ph: 2.4 }
        ]
      };
      this._bgGrad = null;
    }
    const atm = this._atm;

    // Cache ambient mist gradient
    const bgKey = `${W}x${H}`;
    if (!this._bgGrad || this._bgKey !== bgKey) {
      this._bgKey = bgKey;
      const g = ctx.createRadialGradient(W * 0.5, H * 0.46, W * 0.06, W * 0.5, H * 0.46, W * 0.80);
      g.addColorStop(0,   'rgba(88, 28, 135, 0.22)');
      g.addColorStop(0.55,'rgba(59,  7, 100, 0.10)');
      g.addColorStop(1,   'rgba(0,  0,   0,  0)');
      this._bgGrad = g;
    }

    ctx.save();

    // ── L1: Ambient Reiatsu mist ──
    ctx.fillStyle = this._bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ── L2: Grand Dragon Spirits (thick flowing flame silhouettes) ──
    for (let d = 0; d < atm.dragons.length; d++) {
      const dr    = atm.dragons[d];
      const bx    = W * dr.bxR;
      const by    = H * dr.byR;
      const alpha = 0.22 + Math.sin(t * 1.0 + dr.ph) * 0.05;
      const stepY = (H * 0.70) / dr.segs;

      ctx.globalAlpha = alpha;

      // Body ribbon
      ctx.beginPath();
      let first = true, hx = bx, hy = by;
      for (let s = 0; s <= dr.segs; s++) {
        const py = by - (dr.segs * 0.5 - s) * stepY;
        const px = bx + Math.sin(py * dr.freq + t * dr.sp + dr.ph) * dr.amp;
        if (first) { ctx.moveTo(px, py); first = false; }
        else        ctx.lineTo(px, py);
        if (s === 0) { hx = px; hy = py; }
      }
      ctx.strokeStyle = dr.col;
      ctx.lineWidth   = dr.bw;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Luminous spine streak
      ctx.strokeStyle = dr.spine;
      ctx.lineWidth   = isMob ? 2.5 : 4.5;
      ctx.stroke();

      // ── Dragon head: smooth flowing flame shape (violet spirit, no teeth) ──
      const hs = isMob ? 12 : 20;
      ctx.save();
      ctx.translate(hx, hy);

      // Outer dark body blob
      ctx.fillStyle = dr.col;
      ctx.beginPath();
      ctx.moveTo(0, -hs * 1.1);
      ctx.bezierCurveTo( hs * 1.4, -hs * 1.1,  hs * 1.8,  hs * 0.3,  hs * 0.8, hs * 1.0);
      ctx.bezierCurveTo( hs * 0.3,  hs * 1.4, -hs * 0.3,  hs * 1.4, -hs * 0.8, hs * 1.0);
      ctx.bezierCurveTo(-hs * 1.8,  hs * 0.3, -hs * 1.4, -hs * 1.1,  0, -hs * 1.1);
      ctx.closePath();
      ctx.fill();

      // Inner flame glow
      const hG = ctx.createRadialGradient(0, -hs * 0.2, 1, 0, 0, hs * 1.3);
      hG.addColorStop(0,   '#e9d5ff');
      hG.addColorStop(0.45, dr.spine);
      hG.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = hG;
      ctx.beginPath();
      ctx.arc(0, 0, hs * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Flame crown wisps
      ctx.strokeStyle = dr.spine;
      ctx.lineWidth   = isMob ? 1.8 : 3.0;
      ctx.lineCap     = 'round';
      // Central wisp
      ctx.beginPath();
      ctx.moveTo(0, -hs * 0.9);
      ctx.bezierCurveTo(hs * 0.4, -hs * 1.8, hs * 0.8, -hs * 2.2, hs * 0.3, -hs * 2.8);
      ctx.stroke();
      // Left wisp
      ctx.lineWidth = isMob ? 1.2 : 2.0;
      ctx.beginPath();
      ctx.moveTo(-hs * 0.6, -hs * 0.8);
      ctx.bezierCurveTo(-hs * 1.2, -hs * 1.6, -hs * 1.5, -hs * 1.9, -hs * 1.1, -hs * 2.4);
      ctx.stroke();
      // Right wisp
      ctx.beginPath();
      ctx.moveTo(hs * 0.6, -hs * 0.8);
      ctx.bezierCurveTo(hs * 1.2, -hs * 1.6, hs * 1.5, -hs * 1.9, hs * 1.1, -hs * 2.4);
      ctx.stroke();

      // Spirit eye glow
      const eG = ctx.createRadialGradient(0, -hs * 0.1, 0.5, 0, -hs * 0.1, isMob ? 3 : 5);
      eG.addColorStop(0, '#ffffff');
      eG.addColorStop(0.5, '#e9d5ff');
      eG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = eG;
      ctx.beginPath();
      ctx.arc(0, -hs * 0.1, isMob ? 3 : 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // ── L3: Sōsuke Aizen Silhouette + Halo ──
    ctx.globalAlpha = 0.88;
    const ax  = W * 0.5;
    const ay  = H * 0.72;
    const asc = isMob ? 0.78 : 1.08;
    const haloR = 42 * asc;

    // Halo glow
    const halo = ctx.createRadialGradient(ax, ay - 26 * asc, haloR * 0.16, ax, ay - 26 * asc, haloR);
    halo.addColorStop(0, 'rgba(255,255,255,0.38)');
    halo.addColorStop(0.4,'rgba(192,132,252,0.22)');
    halo.addColorStop(1,  'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(ax, ay - 26 * asc, haloR, 0, Math.PI * 2);
    ctx.fill();

    // Halo rays
    if (!isMob) {
      ctx.strokeStyle = 'rgba(216,180,254,0.28)';
      ctx.lineWidth   = 1.0;
      for (let r = 0; r < 8; r++) {
        const ang = r * Math.PI / 4 + t * 0.13;
        const cos = Math.cos(ang), sin = Math.sin(ang);
        const hy2  = ay - 26 * asc;
        ctx.beginPath();
        ctx.moveTo(ax + cos * haloR * 0.38, hy2 + sin * haloR * 0.38);
        ctx.lineTo(ax + cos * haloR * 0.90, hy2 + sin * haloR * 0.90);
        ctx.stroke();
      }
    }

    // Aizen silhouette
    ctx.fillStyle   = '#04000d';
    ctx.strokeStyle = '#04000d';
    ctx.beginPath(); ctx.arc(ax, ay - 50 * asc, 6 * asc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(ax - 7 * asc,  ay - 43 * asc);
    ctx.lineTo(ax + 7 * asc,  ay - 43 * asc);
    ctx.lineTo(ax + 14 * asc, ay);
    ctx.lineTo(ax - 14 * asc, ay);
    ctx.closePath(); ctx.fill();
    ctx.lineWidth = 3.0 * asc;
    ctx.beginPath(); ctx.moveTo(ax + 6 * asc, ay - 38 * asc); ctx.lineTo(ax + 22 * asc, ay - 50 * asc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax - 6 * asc, ay - 37 * asc); ctx.lineTo(ax - 14 * asc, ay - 28 * asc); ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.0 * asc;
    ctx.beginPath(); ctx.moveTo(ax - 14 * asc, ay - 28 * asc); ctx.lineTo(ax - 24 * asc, ay - 14 * asc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax, ay - 42 * asc); ctx.lineTo(ax, ay); ctx.stroke();

    // ── L4: Dark Obsidian Cliffs ──
    ctx.globalAlpha = 1.0;
    ctx.fillStyle   = '#03000a';

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

    // Reiatsu fracture glows
    ctx.strokeStyle = '#7e22ce'; ctx.lineWidth = 1.1; ctx.globalAlpha = 0.50;
    ctx.beginPath();
    ctx.moveTo(W * 0.05, H * 0.76); ctx.lineTo(W * 0.12, H * 0.84); ctx.lineTo(W * 0.18, H * 0.92);
    ctx.moveTo(W * 0.92, H * 0.74); ctx.lineTo(W * 0.84, H * 0.81); ctx.lineTo(W * 0.78, H * 0.89);
    ctx.stroke();

    // ── L5: Floating Diamond Reiatsu Shards ──
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
      ctx.strokeStyle = sh.bright ? '#e9d5ff' : 'rgba(147,51,234,0.5)';
      ctx.lineWidth   = 0.8;
      const sz = sh.sz;
      ctx.beginPath();
      ctx.moveTo(0, -sz * 1.3); ctx.lineTo(sz * 0.55, 0);
      ctx.lineTo(0,  sz * 1.3); ctx.lineTo(-sz * 0.55, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // ── L6: Reflective dark waters ──
    const wh = H * 0.12;
    const wg = ctx.createLinearGradient(0, H - wh, 0, H);
    wg.addColorStop(0, 'rgba(19,4,36,0)');
    wg.addColorStop(0.5,'rgba(59,7,100,0.20)');
    wg.addColorStop(1, 'rgba(88,28,135,0.35)');
    ctx.fillStyle = wg;
    ctx.globalAlpha = 1.0;
    ctx.fillRect(0, H - wh, W, wh);

    if (!isMob) {
      ctx.strokeStyle = 'rgba(168,85,247,0.28)';
      ctx.lineWidth   = 1.0;
      for (let wy = H - wh + 8; wy < H; wy += 14) {
        const wo = Math.sin(t * 1.8 + wy * 0.08) * (W * 0.06);
        ctx.beginPath(); ctx.moveTo(W * 0.22 + wo, wy); ctx.lineTo(W * 0.78 + wo, wy); ctx.stroke();
      }
    }

    ctx.restore();
  }
};
