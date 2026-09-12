// ============================================================================
// HADO 99 THEME MODULE — Sōsuke Aizen & Hadō #99: Goryūtenmetsu (破道の九十九 五龍転滅)
// Ultimate Legendary Theme (100 Coins)
// Optimized: sprite pre-baking, zero-allocation atmosphere loop, mobile-adaptive.
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
    { min: 0,   max: 49,       name: 'reikaku_awakening', border: '#c084fc', glow: 'rgba(168, 85, 247, 0.60)', particleColors: ['#c084fc', '#a855f7', '#7e22ce'] },
    { min: 50,  max: 99,       name: 'kyoka_suigetsu',    border: '#d8b4fe', glow: 'rgba(192, 132, 252, 0.70)', particleColors: ['#e9d5ff', '#d8b4fe', '#c084fc'] },
    { min: 100, max: 199,      name: 'kurohitsugi',       border: '#f0abfc', glow: 'rgba(217, 70, 239, 0.75)', particleColors: ['#f5d0fe', '#d946ef', '#9333ea'] },
    { min: 200, max: 399,      name: 'las_noches',        border: '#ffffff', glow: 'rgba(232, 121, 249, 0.85)', particleColors: ['#ffffff', '#fdf4ff', '#e879f9'] },
    { min: 400, max: 799,      name: 'hogyoku_fusion',    border: '#fbbf24', glow: 'rgba(245, 158, 11, 0.90)', particleColors: ['#fef08a', '#fbbf24', '#d946ef'] },
    { min: 800, max: Infinity, name: 'goryutenmetsu',     border: '#ffd700', glow: 'rgba(251, 191, 36, 0.95)', particleColors: ['#ffffff', '#ffd700', '#f472b6'] }
  ],

  getTier(combo) {
    const tiers = this.comboTiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (combo >= tiers[i].min) return tiers[i];
    }
    return tiers[0];
  },

  // ==========================================================================
  // INTERNAL HELPERS — Pre-computed helper for dragon head (avoids per-frame calc)
  // ==========================================================================
  _getMawColor(tier, isDead) {
    if (isDead)    return { horn1: '#334155', horn2: '#64748b', hornTip: '#94a3b8', skull: '#0f172a', plate: '#1e293b', plateLine: '#475569', eyeG: '#64748b', fang: '#94a3b8', maw: '#475569', aura: null };
    if (tier >= 800) return { horn1: '#a855f7', horn2: '#f472b6', hornTip: '#ffd700', skull: '#3b0764', plate: '#6b21a8', plateLine: '#ffd700', eyeG: '#ffffff', fang: '#ffffff', maw: '#ffffff', aura: 'rgba(251, 191, 36, 0.55)' };
    if (tier >= 400) return { horn1: '#9333ea', horn2: '#fbbf24', hornTip: '#ffffff', skull: '#270845', plate: '#581c87', plateLine: '#f59e0b', eyeG: '#fbbf24', fang: '#fef08a', maw: '#fbbf24', aura: 'rgba(245, 158, 11, 0.45)' };
    if (tier >= 200) return { horn1: '#9333ea', horn2: '#e879f9', hornTip: '#ffffff', skull: '#24063d', plate: '#581c87', plateLine: '#f0abfc', eyeG: '#ffffff', fang: '#ffffff', maw: '#fdf4ff', aura: 'rgba(232, 121, 249, 0.45)' };
                     return { horn1: '#7e22ce', horn2: '#d946ef', hornTip: '#ffffff', skull: '#1c0533', plate: '#3b0764', plateLine: '#a855f7', eyeG: '#fbbf24', fang: '#ffffff', maw: '#f0abfc', aura: 'rgba(192, 132, 252, 0.40)' };
  },

  // ==========================================================================
  // DRAGON HEAD RENDERER — Called during sprite BAKING (not every frame)
  // ==========================================================================
  _drawDragonHead(ctx, cx, cy, w, h, tier, isDead) {
    const sX = w / 96;
    const sY = h / 38;
    const p  = this._getMawColor(tier, isDead);

    ctx.save();

    // (A) Soft Reiatsu aura halo behind head (only on non-dead, non-mobile)
    if (p.aura) {
      const auraGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, w * 0.60);
      auraGrad.addColorStop(0, p.aura);
      auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.58, h * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // (B) Primary Sweeping Horns
    for (const side of [-1, 1]) {
      const hg = ctx.createLinearGradient(cx + side * 12 * sX, cy - 4 * sY, cx + side * 45 * sX, cy - 20 * sY);
      hg.addColorStop(0, p.horn1);
      hg.addColorStop(0.6, p.horn2);
      hg.addColorStop(1, p.hornTip);
      ctx.fillStyle = hg;
      ctx.strokeStyle = p.hornTip;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(cx + side * 10 * sX, cy - 4 * sY);
      ctx.bezierCurveTo(cx + side * 24 * sX, cy - 10 * sY, cx + side * 38 * sX, cy - 14 * sY, cx + side * 45 * sX, cy - 19 * sY);
      ctx.bezierCurveTo(cx + side * 37 * sX, cy - 8 * sY, cx + side * 26 * sX, cy - 5 * sY, cx + side * 14 * sX, cy - 1 * sY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Secondary inner spike
      ctx.fillStyle = p.horn2;
      ctx.beginPath();
      ctx.moveTo(cx + side * 6 * sX, cy - 8 * sY);
      ctx.lineTo(cx + side * 18 * sX, cy - 17 * sY);
      ctx.lineTo(cx + side * 9 * sX, cy - 7 * sY);
      ctx.closePath();
      ctx.fill();
    }

    // (C) Dragon Skull / Cranium armored plates
    const sg = ctx.createRadialGradient(cx, cy - 2 * sY, 3 * sX, cx, cy + 4 * sY, 32 * sX);
    sg.addColorStop(0, p.plate);
    sg.addColorStop(0.8, p.skull);
    sg.addColorStop(1, '#0b0117');
    ctx.fillStyle = sg;
    ctx.strokeStyle = p.plateLine;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx,            cy - 14 * sY);
    ctx.lineTo(cx + 12 * sX, cy -  9 * sY);
    ctx.lineTo(cx + 24 * sX, cy -  3 * sY);
    ctx.lineTo(cx + 34 * sX, cy +  2 * sY);
    ctx.lineTo(cx + 22 * sX, cy +  4 * sY);
    ctx.lineTo(cx + 30 * sX, cy +  8 * sY);
    ctx.lineTo(cx + 18 * sX, cy +  9 * sY);
    ctx.lineTo(cx +  8 * sX, cy + 13 * sY);
    ctx.lineTo(cx,            cy + 14 * sY);
    ctx.lineTo(cx -  8 * sX, cy + 13 * sY);
    ctx.lineTo(cx - 18 * sX, cy +  9 * sY);
    ctx.lineTo(cx - 30 * sX, cy +  8 * sY);
    ctx.lineTo(cx - 22 * sX, cy +  4 * sY);
    ctx.lineTo(cx - 34 * sX, cy +  2 * sY);
    ctx.lineTo(cx - 24 * sX, cy -  3 * sY);
    ctx.lineTo(cx - 12 * sX, cy -  9 * sY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Central forehead ridge
    ctx.beginPath();
    ctx.moveTo(cx, cy - 13 * sY);
    ctx.lineTo(cx, cy +  8 * sY);
    ctx.stroke();
    // Brow arcs
    ctx.beginPath();
    ctx.moveTo(cx - 2 * sX, cy - 6 * sY); ctx.quadraticCurveTo(cx - 10 * sX, cy - 8 * sY, cx - 18 * sX, cy - 4 * sY);
    ctx.moveTo(cx + 2 * sX, cy - 6 * sY); ctx.quadraticCurveTo(cx + 10 * sX, cy - 8 * sY, cx + 18 * sX, cy - 4 * sY);
    ctx.stroke();

    // (D) Maw opening & Reiatsu breath
    const mawY  = cy + 4 * sY;
    const mawHh = 9 * sY;
    const mawW  = 16 * sX;
    ctx.fillStyle = '#0a0014';
    ctx.beginPath();
    ctx.ellipse(cx, mawY + mawHh * 0.35, mawW, mawHh * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!isDead) {
      const bg = ctx.createRadialGradient(cx, mawY + mawHh * 0.3, 1, cx, mawY + mawHh * 0.3, mawW * 1.0);
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(0.35, p.maw);
      bg.addColorStop(0.75, 'rgba(168, 85, 247, 0.6)');
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(cx, mawY + mawHh * 0.3, mawW * 0.85, 0, Math.PI * 2);
      ctx.fill();
    }

    // (E) Crystalline fangs
    ctx.fillStyle = p.fang;
    ctx.strokeStyle = isDead ? '#64748b' : '#c084fc';
    ctx.lineWidth = 0.7;
    for (const side of [-1, 1]) {
      // Large canine
      ctx.beginPath();
      ctx.moveTo(cx + side * 13 * sX, mawY - sY);
      ctx.lineTo(cx + side * 10 * sX, mawY + 7 * sY);
      ctx.lineTo(cx + side *  8 * sX, mawY - sY);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Small incisors
      ctx.beginPath();
      ctx.moveTo(cx + side * 5 * sX, mawY);
      ctx.lineTo(cx + side * 3 * sX, mawY + 4 * sY);
      ctx.lineTo(cx + side * 1 * sX, mawY);
      ctx.closePath();
      ctx.fill();
      // Lower fang
      ctx.beginPath();
      ctx.moveTo(cx + side * 9 * sX, mawY + mawHh);
      ctx.lineTo(cx + side * 7 * sX, mawY + mawHh - 5 * sY);
      ctx.lineTo(cx + side * 5 * sX, mawY + mawHh);
      ctx.closePath();
      ctx.fill();
    }
    // Lower jaw chin plate
    ctx.fillStyle = p.skull;
    ctx.strokeStyle = p.plateLine;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx - 12 * sX, mawY + mawHh - 2 * sY);
    ctx.lineTo(cx,            mawY + mawHh + 4 * sY);
    ctx.lineTo(cx + 12 * sX, mawY + mawHh - 2 * sY);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    // (F) Dragon Eyes — predatory slit pupils
    const eyeY = cy - 2 * sY;
    const eyeW = 7 * sX;
    const eyeH = 3.5 * sY;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(cx + side * 14 * sX, eyeY);
      ctx.rotate(side * 0.18);
      // Socket
      ctx.fillStyle = '#06000c';
      ctx.beginPath();
      ctx.ellipse(0, 0, eyeW + 1, eyeH + 1, 0, 0, Math.PI * 2);
      ctx.fill();
      // Iris
      ctx.fillStyle = p.eyeG;
      ctx.beginPath();
      ctx.ellipse(0, 0, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();
      // Vertical slit pupil
      ctx.fillStyle = '#1e0533';
      ctx.fillRect(-0.8, -eyeH * 0.9, 1.6, eyeH * 1.8);
      ctx.restore();
    }

    // (G) Dragon Barbel Whiskers
    ctx.strokeStyle = isDead ? '#64748b' : '#f0abfc';
    ctx.lineWidth = 1.1;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * 6 * sX, cy + 9 * sY);
      ctx.bezierCurveTo(cx + side * 18 * sX, cy + 14 * sY, cx + side * 28 * sX, cy + 12 * sY, cx + side * 38 * sX, cy + 18 * sY);
      ctx.stroke();
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
    const cx = tailW / 2;

    // 1. Base body gradient
    const bodyGrad = ctx.createLinearGradient(0, 0, 0, tailH);
    bodyGrad.addColorStop(0.00, 'rgba(15, 3, 26, 0.40)');
    bodyGrad.addColorStop(0.15, '#2e0854');
    bodyGrad.addColorStop(0.70, '#581c87');
    bodyGrad.addColorStop(1.00, '#9333ea');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(0, 0, tailW, tailH);

    // 2. Scale rows (pre-baked: no per-frame cost)
    const scaleRows = 20;
    const rowH = tailH / scaleRows;
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.25)';
    ctx.fillStyle   = 'rgba(147, 51, 234, 0.20)';
    ctx.lineWidth   = 0.9;
    for (let r = 0; r < scaleRows; r++) {
      const y    = r * rowH;
      const off  = (r % 2 === 1) ? tailW * 0.2 : 0;
      const cols = 3;
      const colW = tailW / cols;
      for (let c = 0; c < cols; c++) {
        const scx = c * colW + colW / 2 + off * (c - 1);
        ctx.beginPath();
        ctx.arc(scx, y + rowH * 0.85, colW * 0.45, Math.PI, 0, false);
        ctx.fill();
        ctx.stroke();
      }
    }

    // 3. Spinal cord glow strip
    const spineGrad = ctx.createLinearGradient(0, 0, 0, tailH);
    spineGrad.addColorStop(0.0, 'rgba(216, 180, 254, 0.30)');
    spineGrad.addColorStop(0.5, '#e9d5ff');
    spineGrad.addColorStop(1.0, '#ffffff');
    ctx.strokeStyle = spineGrad;
    ctx.lineWidth   = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, tailH);
    ctx.stroke();

    // 4. Vertebrae nodes & dorsal spikes
    ctx.fillStyle   = (tier >= 800) ? '#ffd700' : '#ffffff';
    ctx.strokeStyle = '#d946ef';
    ctx.lineWidth   = 0.9;
    const nodeCount = 12;
    for (let i = 1; i < nodeCount; i++) {
      const ny = (i / nodeCount) * tailH;
      ctx.beginPath(); ctx.arc(cx, ny, 2.0, 0, Math.PI * 2); ctx.fill();
      const span = Math.min(6, tailW * 0.4);
      ctx.beginPath();
      ctx.moveTo(cx - span, ny); ctx.lineTo(cx, ny - 3); ctx.lineTo(cx + span, ny);
      ctx.stroke();
    }

    // 5. Lightning ribbon (single pass)
    ctx.strokeStyle = (tier >= 400) ? 'rgba(254, 240, 138, 0.40)' : 'rgba(240, 171, 252, 0.35)';
    ctx.lineWidth   = 1.1;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    for (let y = 0; y < tailH; y += 24) {
      ctx.lineTo(cx + Math.sin(y * 0.08) * (tailW * 0.26), y);
    }
    ctx.stroke();

    return true;
  },

  // ==========================================================================
  // HOLD NOTE TAIL (Rendered per-frame at yTail — kept minimal for perf)
  // ==========================================================================
  drawHoldTail(ctx, x, yTail, w, headH, tile, isLight, now) {
    const isMob = typeof window !== 'undefined' && (window.innerWidth <= 768 || navigator.maxTouchPoints > 1);
    const cx  = Math.round(x + w / 2);
    const sX  = w / 96;
    const len = Math.min(38, headH * 1.2) * sX;
    const tipY = yTail - len;
    const hw  = Math.max(5, Math.round((w - 18) / 2));
    const holding = tile.holding && tile.hit;
    const dead    = tile.failed;

    ctx.save();

    // Tail body
    const tg = ctx.createLinearGradient(cx, yTail, cx, tipY);
    if (dead) {
      tg.addColorStop(0, '#1e293b'); tg.addColorStop(1, '#0f172a');
    } else if (holding) {
      tg.addColorStop(0, '#c084fc'); tg.addColorStop(0.5, '#d946ef'); tg.addColorStop(1, '#ffffff');
    } else {
      tg.addColorStop(0, '#3b0764'); tg.addColorStop(0.6, '#7e22ce'); tg.addColorStop(1, '#c084fc');
    }

    ctx.fillStyle   = tg;
    ctx.strokeStyle = dead ? '#334155' : (holding ? '#ffffff' : '#d8b4fe');
    ctx.lineWidth   = 1.1;
    ctx.beginPath();
    ctx.moveTo(cx - hw, yTail);
    ctx.quadraticCurveTo(cx - hw * 0.45, yTail - len * 0.6, cx - 2 * sX, tipY);
    ctx.lineTo(cx, tipY - 4 * sX);
    ctx.lineTo(cx + 2 * sX, tipY);
    ctx.quadraticCurveTo(cx + hw * 0.45, yTail - len * 0.6, cx + hw, yTail);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Blade fins at tip
    if (!dead) {
      const fc = dead ? '#334155' : (holding ? '#ffd700' : '#a855f7');
      ctx.fillStyle   = fc;
      ctx.strokeStyle = holding ? '#ffffff' : '#f5d0fe';
      ctx.lineWidth   = 1.0;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx + side * 2 * sX, tipY + 4 * sX);
        ctx.quadraticCurveTo(cx + side * 16 * sX, tipY - 2 * sX, cx + side * 18 * sX, tipY - 12 * sX);
        ctx.quadraticCurveTo(cx + side * 8 * sX, tipY - 7 * sX, cx + side * sX, tipY - 2 * sX);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      }
    }

    // Segment plates (3)
    ctx.strokeStyle = holding ? '#ffffff' : 'rgba(255,255,255,0.40)';
    ctx.lineWidth = 0.9;
    for (let i = 1; i <= 3; i++) {
      const sy2 = yTail - (len * i * 0.22);
      const sp  = hw * (1 - i * 0.22);
      ctx.beginPath();
      ctx.moveTo(cx - sp, sy2); ctx.lineTo(cx, sy2 - 2 * sX); ctx.lineTo(cx + sp, sy2);
      ctx.stroke();
    }

    // Lightning burst when holding (cheap, no shadow)
    if (holding && !isMob) {
      const flicker = Math.sin(now * 0.022) * 4;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, tipY - 14 * sX);
      ctx.lineTo(cx + flicker, tipY - 22 * sX);
      ctx.lineTo(cx - flicker, tipY - 28 * sX);
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

    ctx.strokeStyle = isActive ? '#ffffff' : 'rgba(192, 132, 252, 0.65)';
    ctx.lineWidth   = isActive ? 2.4 : 1.4;
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 8);
    else ctx.strokeRect(x, y, w, h);
    ctx.stroke();

    // Corner dragon claw marks
    const cl = 8;
    ctx.fillStyle = isActive ? '#ffffff' : '#c084fc';
    ctx.fillRect(x, y, cl, 2);            ctx.fillRect(x, y, 2, cl);
    ctx.fillRect(x + w - cl, y, cl, 2);   ctx.fillRect(x + w - 2, y, 2, cl);
    ctx.fillRect(x, y + h - 2, cl, 2);    ctx.fillRect(x, y + h - cl, 2, cl);
    ctx.fillRect(x + w - cl, y + h - 2, cl, 2); ctx.fillRect(x + w - 2, y + h - cl, 2, cl);

    if (isActive) {
      const cg = ctx.createRadialGradient(cx, cy, 2, cx, cy, w * 0.5);
      cg.addColorStop(0, 'rgba(255,255,255,0.75)');
      cg.addColorStop(0.45, 'rgba(217, 70, 239, 0.38)');
      cg.addColorStop(1, 'rgba(0,0,0,0)');
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
    const ease = 1 - (1 - p) * (1 - p);
    ctx.save();

    // 5 Dragon Fangs radiating outward
    const dist  = (w * 0.82) * ease;
    const alpha = Math.max(0, 0.95 - ease * 0.95);
    ctx.globalAlpha = alpha;
    ctx.fillStyle   = isPerfect ? '#ffffff' : '#d946ef';
    ctx.strokeStyle = isPerfect ? '#fbbf24' : '#c084fc';
    ctx.lineWidth   = 1.6;
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const fx = cx + Math.cos(angle) * dist;
      const fy = cy + Math.sin(angle) * dist;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(angle + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -9 * ease);
      ctx.lineTo(4, 5);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // Diamond spatial shockwave
    const dr = (w * 0.68) * ease;
    ctx.strokeStyle = isPerfect ? '#ffd700' : '#c084fc';
    ctx.lineWidth = isPerfect ? 2.4 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - dr);
    ctx.lineTo(cx + dr, cy);
    ctx.lineTo(cx, cy + dr);
    ctx.lineTo(cx - dr, cy);
    ctx.closePath();
    ctx.stroke();

    // Center flash
    if (p < 0.32) {
      ctx.fillStyle = '#ffffff';
      const fr = Math.max(0, (w * 0.32) * (1 - p * 3.1));
      ctx.beginPath(); ctx.arc(cx, cy, fr, 0, Math.PI * 2); ctx.fill();
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
      // Reiatsu diamond shard
      const sz = 4.0 * life;
      ctx.fillStyle = pt.color || '#c084fc';
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.angle || 0);
      ctx.beginPath();
      ctx.moveTo(0, -sz * 1.4);
      ctx.lineTo(sz * 0.65, 0);
      ctx.lineTo(0, sz * 1.4);
      ctx.lineTo(-sz * 0.65, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (mode === 1) {
      // Amber Hōgyoku ember
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.8 * life, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Vertical Reiatsu spark
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pt.x - 1, pt.y - 3 * life, 2, 6 * life);
    }
    ctx.restore();
  },

  // ==========================================================================
  // ATMOSPHERE — Bleach Hado 99 Background
  // Zero-allocation loop, single-frame canvas geometry, mobile-adaptive.
  // ==========================================================================
  _atm: null,
  _bgGrad: null,
  _bgKey: '',

  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const W  = State.gameWidth;
    const H  = State.gameHeight;
    const t  = songTime * 0.001;
    const isMob = State.isMobile;

    // ── Init zero-allocation state ──
    if (!this._atm || this._atm._W !== W || this._atm._H !== H) {
      const shardN = isMob ? 18 : 38;
      this._atm = {
        _W: W, _H: H,
        shards: Array.from({ length: shardN }, () => ({
          x:      Math.random() * W,
          y:      Math.random() * H,
          vy:    -0.45 - Math.random() * 1.1,
          vx:    (Math.random() - 0.5) * 0.28,
          sz:     4 + Math.random() * (isMob ? 7 : 12),
          angle:  Math.random() * Math.PI * 2,
          vRot:  (Math.random() - 0.5) * 0.028,
          bright: Math.random() > 0.58,
          amber:  Math.random() > 0.82
        })),
        // Grand dragon silhouettes in the distant sky (not thin lines)
        dragons: [
          { bxR: 0.78, byR: 0.38, len: isMob ? 10 : 16, bw: isMob ? 20 : 34, col: '#3b0764', spine: '#c084fc', sp: 0.20, amp: W * 0.14, freq: 0.004, ph: 0.0  },
          { bxR: 0.22, byR: 0.52, len: isMob ? 8  : 13, bw: isMob ? 16 : 28, col: '#27043f', spine: '#a855f7', sp: 0.17, amp: W * 0.12, freq: 0.005, ph: 2.5  }
        ]
      };
      this._bgGrad = null; // invalidate cached gradient
    }
    const atm = this._atm;

    // ── Cache ambient radial gradient (rebake only on resize) ──
    const bgKey = `${W}x${H}`;
    if (!this._bgGrad || this._bgKey !== bgKey) {
      this._bgKey  = bgKey;
      const g = ctx.createRadialGradient(W * 0.5, H * 0.48, W * 0.08, W * 0.5, H * 0.48, W * 0.82);
      g.addColorStop(0.00, 'rgba(88,  28, 135, 0.20)');
      g.addColorStop(0.55, 'rgba(59,   7, 100, 0.10)');
      g.addColorStop(1.00, 'rgba(0,    0,   0, 0)');
      this._bgGrad = g;
    }

    ctx.save();

    // ── LAYER 1: Ambient Reiatsu nebula mist ──
    ctx.fillStyle = this._bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ── LAYER 2: Grand Distant Dragon Silhouettes ──
    for (let d = 0; d < atm.dragons.length; d++) {
      const dr   = atm.dragons[d];
      const bx   = W * dr.bxR;
      const by   = H * dr.byR;
      const alpha = 0.20 + Math.sin(t * 1.1 + dr.ph) * 0.05;
      ctx.globalAlpha = alpha;

      const stepY = (H * 0.72) / dr.len;
      ctx.beginPath();
      let first = true;
      let hx = bx, hy = by;
      for (let s = 0; s <= dr.len; s++) {
        const py = by - (dr.len * 0.5 - s) * stepY;
        const px = bx + Math.sin(py * dr.freq + t * dr.sp + dr.ph) * dr.amp;
        if (first) { ctx.moveTo(px, py); first = false; }
        else        ctx.lineTo(px, py);
        if (s === 0) { hx = px; hy = py; }
      }
      ctx.strokeStyle = dr.col;
      ctx.lineWidth   = dr.bw;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Luminous spine
      ctx.strokeStyle = dr.spine;
      ctx.lineWidth   = isMob ? 2 : 4;
      ctx.stroke();

      // Dragon head silhouette at tip
      ctx.fillStyle = dr.col;
      const hs = isMob ? 10 : 16;
      ctx.beginPath();
      ctx.moveTo(hx,       hy - hs);
      ctx.lineTo(hx + hs * 0.6, hy + hs * 0.4);
      ctx.lineTo(hx,       hy + hs * 0.9);
      ctx.lineTo(hx - hs * 0.6, hy + hs * 0.4);
      ctx.closePath();
      ctx.fill();

      // Horns
      ctx.strokeStyle = dr.spine;
      ctx.lineWidth = isMob ? 1.5 : 2.5;
      ctx.beginPath();
      ctx.moveTo(hx - hs * 0.3, hy - hs * 0.3);
      ctx.lineTo(hx - hs * 1.5, hy - hs * 1.5);
      ctx.moveTo(hx + hs * 0.3, hy - hs * 0.3);
      ctx.lineTo(hx + hs * 1.5, hy - hs * 1.5);
      ctx.stroke();

      // Amber eye
      ctx.fillStyle = '#fbbf24';
      ctx.globalAlpha = Math.min(1.0, alpha * 2.2);
      ctx.beginPath();
      ctx.arc(hx, hy - 1, isMob ? 2 : 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── LAYER 3: Sōsuke Aizen Figure with Transcendent Halo ──
    ctx.globalAlpha = 0.90;
    const ax   = W * 0.5;
    const ay   = H * 0.72;
    const asc  = isMob ? 0.80 : 1.10;

    // Halo glow
    const haloR = 44 * asc;
    const halo  = ctx.createRadialGradient(ax, ay - 28 * asc, haloR * 0.18, ax, ay - 28 * asc, haloR);
    halo.addColorStop(0, 'rgba(255, 255, 255, 0.40)');
    halo.addColorStop(0.4, 'rgba(217, 70, 239, 0.28)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(ax, ay - 28 * asc, haloR, 0, Math.PI * 2);
    ctx.fill();

    // Halo rays (cheap lines, 8 rays)
    if (!isMob) {
      ctx.strokeStyle = 'rgba(240, 171, 252, 0.32)';
      ctx.lineWidth = 1.0;
      for (let r = 0; r < 8; r++) {
        const ang = (r * Math.PI / 4) + t * 0.14;
        const rx = ax + Math.cos(ang);
        const ry = (ay - 28 * asc) + Math.sin(ang);
        ctx.beginPath();
        ctx.moveTo(rx + Math.cos(ang) * haloR * 0.38, ry + Math.sin(ang) * haloR * 0.38);
        ctx.lineTo(rx + Math.cos(ang) * haloR * 0.90, ry + Math.sin(ang) * haloR * 0.90);
        ctx.stroke();
      }
    }

    // Aizen silhouette
    ctx.fillStyle = '#04000d';
    // Head
    ctx.beginPath();
    ctx.arc(ax, ay - 50 * asc, 6 * asc, 0, Math.PI * 2);
    ctx.fill();
    // Torso / Robe
    ctx.beginPath();
    ctx.moveTo(ax - 7 * asc,  ay - 43 * asc);
    ctx.lineTo(ax + 7 * asc,  ay - 43 * asc);
    ctx.lineTo(ax + 14 * asc, ay);
    ctx.lineTo(ax - 14 * asc, ay);
    ctx.closePath();
    ctx.fill();
    // Right commanding arm
    ctx.strokeStyle = '#04000d';
    ctx.lineWidth = 3.0 * asc;
    ctx.beginPath();
    ctx.moveTo(ax + 6 * asc, ay - 38 * asc);
    ctx.lineTo(ax + 22 * asc, ay - 50 * asc);
    ctx.stroke();
    // Left arm + Kyōka Suigetsu blade
    ctx.beginPath();
    ctx.moveTo(ax - 6 * asc, ay - 37 * asc);
    ctx.lineTo(ax - 14 * asc, ay - 28 * asc);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.1 * asc;
    ctx.beginPath();
    ctx.moveTo(ax - 14 * asc, ay - 28 * asc);
    ctx.lineTo(ax - 24 * asc, ay - 14 * asc);
    ctx.stroke();
    // Robe white center stripe
    ctx.beginPath();
    ctx.moveTo(ax, ay - 42 * asc);
    ctx.lineTo(ax, ay);
    ctx.stroke();

    // ── LAYER 4: Dark Obsidian Cliffs ──
    ctx.globalAlpha = 1.0;
    ctx.fillStyle   = '#03000a';

    // Left cliff
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0,          H * 0.72);
    ctx.lineTo(W * 0.12,   H * 0.76);
    ctx.lineTo(W * 0.23,   H * 0.70);
    ctx.lineTo(W * 0.36,   H * 0.84);
    ctx.lineTo(W * 0.36,   H);
    ctx.closePath();
    ctx.fill();

    // Right cliff
    ctx.beginPath();
    ctx.moveTo(W, H);
    ctx.lineTo(W,          H * 0.70);
    ctx.lineTo(W * 0.86,   H * 0.74);
    ctx.lineTo(W * 0.76,   H * 0.68);
    ctx.lineTo(W * 0.62,   H * 0.83);
    ctx.lineTo(W * 0.62,   H);
    ctx.closePath();
    ctx.fill();

    // Aizen pedestal
    ctx.beginPath();
    ctx.moveTo(W * 0.32, H);
    ctx.lineTo(W * 0.40, ay + 4);
    ctx.lineTo(W * 0.50, ay);
    ctx.lineTo(W * 0.60, ay + 6);
    ctx.lineTo(W * 0.68, H);
    ctx.closePath();
    ctx.fill();

    // Glowing Reiatsu cliff fractures
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(W * 0.05, H * 0.76);
    ctx.lineTo(W * 0.12, H * 0.84);
    ctx.lineTo(W * 0.18, H * 0.92);
    ctx.moveTo(W * 0.92, H * 0.74);
    ctx.lineTo(W * 0.84, H * 0.81);
    ctx.lineTo(W * 0.78, H * 0.89);
    ctx.stroke();

    // ── LAYER 5: Floating Diamond Reiatsu Shards ──
    // Batched by color for minimal state changes
    // Pass 1: violet/magenta shards
    ctx.fillStyle = '#d946ef';
    ctx.beginPath();
    for (let i = 0; i < atm.shards.length; i++) {
      const sh = atm.shards[i];
      if (sh.amber) continue;
      sh.y += sh.vy * warpMult;
      sh.x += sh.vx + Math.sin(t * 1.3 + sh.y * 0.012) * 0.22;
      sh.angle += sh.vRot;
      if (sh.y < -20) { sh.y = H + 20; sh.x = Math.random() * W; }
      // Draw rhombus without per-shard ctx.save/restore: use cheap transform hack
    }
    // Can't easily batch rotated quads; draw individually but skip shadow
    for (let i = 0; i < atm.shards.length; i++) {
      const sh = atm.shards[i];
      ctx.save();
      ctx.translate(sh.x, sh.y);
      ctx.rotate(sh.angle);
      ctx.globalAlpha = sh.bright ? 0.72 : 0.35;
      ctx.fillStyle   = sh.amber ? '#fbbf24' : (sh.bright ? '#c084fc' : '#581c87');
      ctx.strokeStyle = sh.bright ? '#ffffff' : 'rgba(192,132,252,0.5)';
      ctx.lineWidth   = 0.9;
      const sz = sh.sz;
      ctx.beginPath();
      ctx.moveTo(0, -sz * 1.3);
      ctx.lineTo(sz * 0.58, 0);
      ctx.lineTo(0,  sz * 1.3);
      ctx.lineTo(-sz * 0.58, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // ── LAYER 6: Reflective Dark Waters at bottom ──
    const wh   = H * 0.13;
    const wg   = ctx.createLinearGradient(0, H - wh, 0, H);
    wg.addColorStop(0,   'rgba(19, 4, 36, 0.0)');
    wg.addColorStop(0.5, 'rgba(88, 28, 135, 0.22)');
    wg.addColorStop(1,   'rgba(147, 51, 234, 0.38)');
    ctx.fillStyle = wg;
    ctx.globalAlpha = 1.0;
    ctx.fillRect(0, H - wh, W, wh);

    if (!isMob) {
      ctx.strokeStyle = 'rgba(216, 180, 254, 0.30)';
      ctx.lineWidth   = 1.1;
      for (let wy = H - wh + 8; wy < H; wy += 14) {
        const wo = Math.sin(t * 1.8 + wy * 0.08) * (W * 0.07);
        ctx.beginPath();
        ctx.moveTo(W * 0.22 + wo, wy);
        ctx.lineTo(W * 0.78 + wo, wy);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
};
