// ============================================================================
// HADO 99 THEME — Hadō #99: Goryūtenmetsu
// Notes baked as front-facing dragon head with clear jaw, horns, snout, eyes.
// Gold at 800+ combo (Hōgyoku transcendence).
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
    bgCenter: '#150328', bgMid: '#0a0115', bgOuter: '#030008',
    bgAura: 'rgba(192, 132, 252, 0.25)',
    strings: ['#f3e8ff', '#d8b4fe', '#c084fc', '#9333ea'],
    stringGlow: 'rgba(192, 132, 252, 0.65)',
    receptorBorder: 'rgba(232, 121, 249, 0.85)',
    particleType: 'reiatsu_dragon'
  },
  comboTiers: [
    { min: 0,   max: 49,       name: 'reikaku_awakening', border: '#9333ea', glow: 'rgba(147,51,234,0.55)',   particleColors: ['#c084fc','#a855f7','#7e22ce'] },
    { min: 50,  max: 99,       name: 'kyoka_suigetsu',    border: '#c084fc', glow: 'rgba(192,132,252,0.65)', particleColors: ['#e9d5ff','#d8b4fe','#c084fc'] },
    { min: 100, max: 199,      name: 'kurohitsugi',       border: '#d946ef', glow: 'rgba(217,70,239,0.70)',  particleColors: ['#f5d0fe','#d946ef','#9333ea'] },
    { min: 200, max: 399,      name: 'las_noches',        border: '#f0abfc', glow: 'rgba(240,171,252,0.80)', particleColors: ['#ffffff','#fdf4ff','#e879f9'] },
    { min: 400, max: 799,      name: 'hogyoku_fusion',    border: '#e879f9', glow: 'rgba(232,121,249,0.85)', particleColors: ['#fdf4ff','#e879f9','#d946ef'] },
    { min: 800, max: Infinity, name: 'goryutenmetsu',     border: '#ffd700', glow: 'rgba(251,191,36,0.95)',  particleColors: ['#ffffff','#ffd700','#fbbf24'] }
  ],

  getTier(combo) {
    const t = this.comboTiers;
    for (let i = t.length - 1; i >= 0; i--) if (combo >= t[i].min) return t[i];
    return t[0];
  },

  // ===========================================================================
  // DRAGON HEAD — Front-facing silhouette inspired by Bleach Goryutenmetsu:
  // Wide flat skull, swept-back horns, open lower jaw with energy breath,
  // two glowing eyes, cheek spikes, flowing mane flames at sides.
  // Gold variant at tier >= 800.
  // ===========================================================================
  _drawDragonHead(ctx, cx, cy, w, h, tier, isDead) {
    const gold = (tier >= 800) && !isDead;

    // Color scheme
    const C = isDead ? {
      dark:'#0f172a', mid:'#1e293b', bright:'#475569', glow:'#64748b',
      eye:'#94a3b8', maw:'rgba(71,85,105,0.6)', flame:'rgba(100,116,139,0.5)', outline:'#334155'
    } : gold ? {
      dark:'#451a03', mid:'#78350f', bright:'#f59e0b', glow:'#fbbf24',
      eye:'#ffffff',  maw:'rgba(253,224,71,0.85)', flame:'rgba(251,191,36,0.65)', outline:'#fde68a'
    } : {
      dark:'#1c0535', mid:'#4c1d95', bright:'#c084fc', glow:'#e9d5ff',
      eye:'#ffffff',  maw:'rgba(216,180,254,0.85)', flame:'rgba(192,132,252,0.65)', outline:'#a855f7'
    };

    ctx.save();

    // Scale factors — note is typically ~90w x 36h
    const W2 = w / 2;   // half-width  ≈ 45
    const H2 = h / 2;   // half-height ≈ 18

    // ── 1. OUTER AURA GLOW ──
    const aG = ctx.createRadialGradient(cx, cy, 2, cx, cy, W2 * 1.2);
    aG.addColorStop(0,   gold ? 'rgba(251,191,36,0.55)' : 'rgba(147,51,234,0.50)');
    aG.addColorStop(0.6, gold ? 'rgba(180,83,9,0.20)'  : 'rgba(88,28,135,0.18)');
    aG.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = aG;
    ctx.beginPath();
    ctx.ellipse(cx, cy, W2 * 1.15, H2 * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 2. SWEPT-BACK HORNS (top corners, swept outward and back) ──
    // Left horn
    ctx.fillStyle = C.bright;
    ctx.beginPath();
    ctx.moveTo(cx - W2 * 0.22, cy - H2 * 0.55);      // horn base left
    ctx.bezierCurveTo(
      cx - W2 * 0.48, cy - H2 * 1.30,                // sweep outward
      cx - W2 * 0.72, cy - H2 * 1.55,                // horn tip
      cx - W2 * 0.80, cy - H2 * 1.70                 // tip point
    );
    ctx.bezierCurveTo(
      cx - W2 * 0.68, cy - H2 * 1.40,
      cx - W2 * 0.38, cy - H2 * 0.90,
      cx - W2 * 0.10, cy - H2 * 0.52
    );
    ctx.closePath();
    ctx.fill();

    // Right horn (mirror)
    ctx.beginPath();
    ctx.moveTo(cx + W2 * 0.22, cy - H2 * 0.55);
    ctx.bezierCurveTo(
      cx + W2 * 0.48, cy - H2 * 1.30,
      cx + W2 * 0.72, cy - H2 * 1.55,
      cx + W2 * 0.80, cy - H2 * 1.70
    );
    ctx.bezierCurveTo(
      cx + W2 * 0.68, cy - H2 * 1.40,
      cx + W2 * 0.38, cy - H2 * 0.90,
      cx + W2 * 0.10, cy - H2 * 0.52
    );
    ctx.closePath();
    ctx.fill();

    // Inner horn highlight
    ctx.fillStyle = C.glow;
    ctx.globalAlpha = 0.50;
    ctx.beginPath();
    ctx.moveTo(cx - W2 * 0.20, cy - H2 * 0.58);
    ctx.bezierCurveTo(cx - W2 * 0.44, cy - H2 * 1.20, cx - W2 * 0.64, cy - H2 * 1.42, cx - W2 * 0.72, cy - H2 * 1.58);
    ctx.bezierCurveTo(cx - W2 * 0.60, cy - H2 * 1.30, cx - W2 * 0.34, cy - H2 * 0.85, cx - W2 * 0.12, cy - H2 * 0.54);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + W2 * 0.20, cy - H2 * 0.58);
    ctx.bezierCurveTo(cx + W2 * 0.44, cy - H2 * 1.20, cx + W2 * 0.64, cy - H2 * 1.42, cx + W2 * 0.72, cy - H2 * 1.58);
    ctx.bezierCurveTo(cx + W2 * 0.60, cy - H2 * 1.30, cx + W2 * 0.34, cy - H2 * 0.85, cx + W2 * 0.12, cy - H2 * 0.54);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // ── 3. SKULL / UPPER CRANIUM ──
    const skullG = ctx.createRadialGradient(cx, cy - H2 * 0.20, 2, cx, cy, W2 * 0.85);
    skullG.addColorStop(0,   C.mid);
    skullG.addColorStop(0.7, C.dark);
    skullG.addColorStop(1,   isDead ? '#060b14' : (gold ? '#1c0800' : '#0d0118'));
    ctx.fillStyle = skullG;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 1.4;

    // Skull shape: wide flat top, narrowing to snout at bottom-center
    ctx.beginPath();
    ctx.moveTo(cx,            cy - H2 * 0.85);         // top center crest
    ctx.bezierCurveTo(
      cx + W2 * 0.55, cy - H2 * 0.90,                  // top right
      cx + W2 * 0.95, cy - H2 * 0.35,                  // right brow
      cx + W2 * 1.00, cy + H2 * 0.05                   // right cheek
    );
    ctx.bezierCurveTo(
      cx + W2 * 0.95, cy + H2 * 0.42,                  // right jaw hinge
      cx + W2 * 0.60, cy + H2 * 0.55,                  // right snout
      cx + W2 * 0.22, cy + H2 * 0.72                   // right lower snout
    );
    ctx.bezierCurveTo(
      cx + W2 * 0.10, cy + H2 * 0.92,
      cx - W2 * 0.10, cy + H2 * 0.92,                  // snout chin
      cx - W2 * 0.22, cy + H2 * 0.72
    );
    ctx.bezierCurveTo(
      cx - W2 * 0.60, cy + H2 * 0.55,
      cx - W2 * 0.95, cy + H2 * 0.42,
      cx - W2 * 1.00, cy + H2 * 0.05
    );
    ctx.bezierCurveTo(
      cx - W2 * 0.95, cy - H2 * 0.35,
      cx - W2 * 0.55, cy - H2 * 0.90,
      cx,             cy - H2 * 0.85
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // ── 4. CHEEK SPIKES (flanking the face) ──
    ctx.fillStyle = C.bright;
    for (const s of [-1, 1]) {
      // Upper cheek spike
      ctx.beginPath();
      ctx.moveTo(cx + s * W2 * 0.90, cy - H2 * 0.18);
      ctx.lineTo(cx + s * W2 * 1.18, cy - H2 * 0.55);
      ctx.lineTo(cx + s * W2 * 0.95, cy + H2 * 0.08);
      ctx.closePath();
      ctx.fill();
      // Lower cheek spike
      ctx.beginPath();
      ctx.moveTo(cx + s * W2 * 0.88, cy + H2 * 0.30);
      ctx.lineTo(cx + s * W2 * 1.14, cy + H2 * 0.55);
      ctx.lineTo(cx + s * W2 * 0.76, cy + H2 * 0.48);
      ctx.closePath();
      ctx.fill();
    }

    // ── 5. MANE FLAMES (flowing from sides of head) ──
    ctx.strokeStyle = C.bright;
    ctx.lineWidth   = 3.5;
    ctx.lineCap     = 'round';
    for (const s of [-1, 1]) {
      // Primary mane flame
      ctx.globalAlpha = 0.80;
      ctx.beginPath();
      ctx.moveTo(cx + s * W2 * 0.95, cy - H2 * 0.10);
      ctx.bezierCurveTo(
        cx + s * W2 * 1.28, cy - H2 * 0.55,
        cx + s * W2 * 1.42, cy - H2 * 1.05,
        cx + s * W2 * 1.30, cy - H2 * 1.45
      );
      ctx.stroke();
      // Secondary mane flame
      ctx.lineWidth = 2.0;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(cx + s * W2 * 0.88, cy - H2 * 0.40);
      ctx.bezierCurveTo(
        cx + s * W2 * 1.18, cy - H2 * 0.95,
        cx + s * W2 * 1.28, cy - H2 * 1.30,
        cx + s * W2 * 1.10, cy - H2 * 1.65
      );
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 1.4;

    // ── 6. OPEN MAW — INNER GLOW (Goryūtenmetsu Reiatsu Breath) ──
    // Lower jaw shadow / dark cavity
    ctx.fillStyle = isDead ? '#060a12' : (gold ? '#1c0800' : '#08001a');
    ctx.beginPath();
    ctx.ellipse(cx, cy + H2 * 0.58, W2 * 0.40, H2 * 0.30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Radiant breath energy inside the maw
    if (!isDead) {
      const mG = ctx.createRadialGradient(cx, cy + H2 * 0.52, 1, cx, cy + H2 * 0.52, W2 * 0.42);
      mG.addColorStop(0,   '#ffffff');
      mG.addColorStop(0.30, C.maw);
      mG.addColorStop(0.75, gold ? 'rgba(180,83,9,0.50)' : 'rgba(107,33,168,0.50)');
      mG.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = mG;
      ctx.beginPath();
      ctx.arc(cx, cy + H2 * 0.52, W2 * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── 7. UPPER TEETH (3 small protrusions at top of maw) ──
    if (!isDead) {
      ctx.fillStyle = C.glow;
      ctx.globalAlpha = 0.90;
      for (let i = -1; i <= 1; i++) {
        const tx = cx + i * W2 * 0.20;
        ctx.beginPath();
        ctx.moveTo(tx - W2 * 0.065, cy + H2 * 0.34);
        ctx.lineTo(tx, cy + H2 * 0.55);
        ctx.lineTo(tx + W2 * 0.065, cy + H2 * 0.34);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    }

    // ── 8. EYES — two glowing slanted predatory eyes ──
    const eyeY = cy - H2 * 0.08;
    const eyeW = W2 * 0.20;
    const eyeH = H2 * 0.28;
    for (const s of [-1, 1]) {
      const ex = cx + s * W2 * 0.42;
      ctx.save();
      ctx.translate(ex, eyeY);
      ctx.rotate(s * 0.20);

      // Dark socket
      ctx.fillStyle = '#04000c';
      ctx.beginPath();
      ctx.ellipse(0, 0, eyeW + 1.5, eyeH + 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Radiant iris
      const eG = ctx.createRadialGradient(0, 0, 0.5, 0, 0, eyeW);
      eG.addColorStop(0,   '#ffffff');
      eG.addColorStop(0.35, C.eye);
      eG.addColorStop(1,   gold ? '#b45309' : '#6b21a8');
      ctx.fillStyle = eG;
      ctx.beginPath();
      ctx.ellipse(0, 0, eyeW, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slit pupil
      ctx.fillStyle = isDead ? '#1e293b' : '#04000c';
      ctx.fillRect(-1.0, -eyeH * 0.92, 2.0, eyeH * 1.84);

      // Eye glow ring
      if (!isDead) {
        ctx.strokeStyle = C.glow;
        ctx.lineWidth = 1.0;
        ctx.globalAlpha = 0.60;
        ctx.beginPath();
        ctx.ellipse(0, 0, eyeW + 2.5, eyeH + 2.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      ctx.restore();

      // Eye flame trail (streaming backward from eye)
      if (!isDead) {
        ctx.strokeStyle = C.bright;
        ctx.lineWidth   = 1.5;
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        ctx.moveTo(ex + s * eyeW, eyeY - eyeH * 0.3);
        ctx.bezierCurveTo(
          ex + s * W2 * 0.32, eyeY - H2 * 0.45,
          ex + s * W2 * 0.48, eyeY - H2 * 0.65,
          ex + s * W2 * 0.38, eyeY - H2 * 0.85
        );
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    }

    // ── 9. BROW RIDGE LINES ──
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 1.0;
    ctx.globalAlpha = 0.70;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + s * W2 * 0.08, cy - H2 * 0.42);
      ctx.quadraticCurveTo(cx + s * W2 * 0.38, cy - H2 * 0.55, cx + s * W2 * 0.62, cy - H2 * 0.35);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

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
      bg.addColorStop(0,   'rgba(30,10,0,0.40)');
      bg.addColorStop(0.20,'#78350f');
      bg.addColorStop(0.70,'#b45309');
      bg.addColorStop(1,   '#d97706');
    } else {
      bg.addColorStop(0,   'rgba(15,3,26,0.40)');
      bg.addColorStop(0.20,'#2e0854');
      bg.addColorStop(0.70,'#581c87');
      bg.addColorStop(1,   '#9333ea');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, tailW, tailH);

    // Flowing energy streaks
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const ox = (i - 2) * tailW * 0.17;
      ctx.strokeStyle = gold
        ? `rgba(251,191,36,${0.15 + i * 0.04})`
        : `rgba(192,132,252,${0.14 + i * 0.04})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx + ox, 0);
      for (let y = 0; y <= tailH; y += 24)
        ctx.lineTo(cx + ox + Math.sin(y * 0.05 + i * 1.2) * 4, y);
      ctx.stroke();
    }

    // Central spine
    const sg = ctx.createLinearGradient(0, 0, 0, tailH);
    sg.addColorStop(0,   gold ? 'rgba(251,191,36,0.30)' : 'rgba(216,180,254,0.30)');
    sg.addColorStop(0.5, gold ? '#fbbf24' : '#e9d5ff');
    sg.addColorStop(1,   '#ffffff');
    ctx.strokeStyle = sg;
    ctx.lineWidth   = 2.0;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, tailH); ctx.stroke();

    ctx.fillStyle = gold ? '#fbbf24' : '#ffffff';
    for (let i = 1; i < 12; i++) {
      const ny = (i / 12) * tailH;
      ctx.beginPath(); ctx.arc(cx, ny, 1.6, 0, Math.PI * 2); ctx.fill();
    }
    return true;
  },

  // ==========================================================================
  // HOLD TAIL (per-frame)
  // ==========================================================================
  drawHoldTail(ctx, x, yTail, w, headH, tile, isLight, now) {
    const isMob  = typeof window !== 'undefined' && (window.innerWidth <= 768 || navigator.maxTouchPoints > 1);
    const cx     = Math.round(x + w / 2);
    const sX     = w / 100;
    const len    = Math.min(34, headH) * sX;
    const tipY   = yTail - len;
    const hw     = Math.max(5, Math.round((w - 18) / 2));
    const holding = tile.holding && tile.hit;
    const dead    = tile.failed;

    ctx.save();
    const tg = ctx.createLinearGradient(cx, yTail, cx, tipY);
    if (dead)         { tg.addColorStop(0,'#1e293b'); tg.addColorStop(1,'#0f172a'); }
    else if (holding) { tg.addColorStop(0,'#c084fc'); tg.addColorStop(0.5,'#d946ef'); tg.addColorStop(1,'#f5d0fe'); }
    else              { tg.addColorStop(0,'#3b0764'); tg.addColorStop(0.6,'#7e22ce'); tg.addColorStop(1,'#c084fc'); }

    ctx.fillStyle   = tg;
    ctx.strokeStyle = dead ? '#334155' : (holding ? '#ffffff' : '#9333ea');
    ctx.lineWidth   = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx - hw, yTail);
    ctx.bezierCurveTo(cx - hw * 0.50, yTail - len * 0.45, cx - 5 * sX, yTail - len * 0.80, cx, tipY - 2 * sX);
    ctx.bezierCurveTo(cx + 5 * sX, yTail - len * 0.80, cx + hw * 0.50, yTail - len * 0.45, cx + hw, yTail);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    if (!dead) {
      ctx.strokeStyle = holding ? '#ffffff' : '#c084fc';
      ctx.lineWidth = 1.8 * sX;
      ctx.lineCap = 'round';
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx, tipY - 2 * sX);
        ctx.bezierCurveTo(cx + s * 4 * sX, tipY - 9 * sX, cx + s * 7 * sX, tipY - 13 * sX, cx + s * 3 * sX, tipY - 18 * sX);
        ctx.stroke();
      }
    }
    if (holding && !isMob) {
      const fl = Math.sin(now * 0.022) * 3;
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, tipY - 20 * sX); ctx.lineTo(cx + fl, tipY - 28 * sX); ctx.lineTo(cx - fl * 0.5, tipY - 34 * sX);
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
    ctx.strokeStyle = isActive ? '#ffffff' : 'rgba(192,132,252,0.60)';
    ctx.lineWidth   = isActive ? 2.2 : 1.3;
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 8); else ctx.strokeRect(x, y, w, h);
    ctx.stroke();
    const cl = 7, fc = isActive ? '#ffffff' : '#a855f7';
    ctx.fillStyle = fc;
    ctx.fillRect(x, y, cl, 2);         ctx.fillRect(x, y, 2, cl);
    ctx.fillRect(x+w-cl, y, cl, 2);    ctx.fillRect(x+w-2, y, 2, cl);
    ctx.fillRect(x, y+h-2, cl, 2);     ctx.fillRect(x, y+h-cl, 2, cl);
    ctx.fillRect(x+w-cl, y+h-2, cl, 2);ctx.fillRect(x+w-2, y+h-cl, 2, cl);
    if (isActive) {
      const cg = ctx.createRadialGradient(cx,cy,2,cx,cy,w*0.48);
      cg.addColorStop(0,'rgba(255,255,255,0.70)'); cg.addColorStop(0.45,'rgba(192,132,252,0.35)'); cg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = cg; ctx.fillRect(x,y,w,h);
    }
    ctx.restore();
  },

  // ==========================================================================
  // HIT ANIMATION
  // ==========================================================================
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now) {
    if (p >= 1) return;
    const ease = 1 - (1-p)*(1-p);
    ctx.save();
    const dist = (w * 0.80) * ease;
    ctx.globalAlpha = Math.max(0, 0.90 - ease * 0.90);
    ctx.lineCap = 'round'; ctx.lineWidth = 3.0;
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const ex = cx + Math.cos(angle) * dist, ey = cy + Math.sin(angle) * dist;
      const wg = ctx.createLinearGradient(cx, cy, ex, ey);
      wg.addColorStop(0, isPerfect ? 'rgba(255,255,255,0.9)' : 'rgba(192,132,252,0.9)');
      wg.addColorStop(0.6, isPerfect ? 'rgba(251,191,36,0.75)' : 'rgba(147,51,234,0.75)');
      wg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = wg;
      ctx.beginPath();
      const mx = cx + Math.cos(angle)*dist*0.55, my = cy + Math.sin(angle)*dist*0.55;
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(mx + Math.cos(angle+Math.PI/2)*8, my + Math.sin(angle+Math.PI/2)*8, ex, ey);
      ctx.stroke();
    }
    const dr = (w * 0.65) * ease;
    ctx.strokeStyle = isPerfect ? '#ffd700' : '#c084fc'; ctx.lineWidth = isPerfect ? 2.2 : 1.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy-dr); ctx.lineTo(cx+dr, cy); ctx.lineTo(cx, cy+dr); ctx.lineTo(cx-dr, cy);
    ctx.closePath(); ctx.stroke();
    if (p < 0.30) {
      ctx.globalAlpha = (0.30-p)/0.30; ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(0,(w*0.28)*(1-p*3.3)), 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  },

  // ==========================================================================
  // PARTICLES
  // ==========================================================================
  drawParticle(ctx, pt, life) {
    if (!pt.active || life <= 0) return;
    ctx.save(); ctx.globalAlpha = Math.max(0, life);
    const mode = (pt.x | 0) % 3;
    if (mode === 0) {
      const sz = 3.8 * life; ctx.fillStyle = pt.color || '#c084fc';
      ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.angle || 0);
      ctx.beginPath(); ctx.moveTo(0,-sz*1.4); ctx.lineTo(sz*0.62,0); ctx.lineTo(0,sz*1.4); ctx.lineTo(-sz*0.62,0); ctx.closePath(); ctx.fill();
      ctx.restore();
    } else if (mode === 1) {
      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(pt.x, pt.y, 1.7*life, 0, Math.PI*2); ctx.fill();
    } else {
      ctx.fillStyle = '#e9d5ff'; ctx.fillRect(pt.x-1, pt.y-2.5*life, 2, 5*life);
    }
    ctx.restore();
  },

  // ==========================================================================
  // ATMOSPHERE
  // ==========================================================================
  _atm: null, _bgGrad: null, _bgKey: '',

  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const W = State.gameWidth, H = State.gameHeight;
    const t = songTime * 0.001, isMob = State.isMobile;

    if (!this._atm || this._atm._W !== W || this._atm._H !== H) {
      this._atm = {
        _W: W, _H: H,
        shards: Array.from({ length: isMob ? 16 : 34 }, () => ({
          x: Math.random()*W, y: Math.random()*H,
          vy: -0.40-Math.random()*1.0, vx: (Math.random()-0.5)*0.24,
          sz: 3+Math.random()*(isMob?7:11), angle: Math.random()*Math.PI*2,
          vRot: (Math.random()-0.5)*0.025, bright: Math.random()>0.55, amber: Math.random()>0.84
        })),
        dragons: [
          { bxR:0.76, byR:0.36, segs:isMob?9:15, bw:isMob?18:30, col:'#2e0548', spine:'#9333ea', sp:0.19, amp:W*0.13, freq:0.0038, ph:0.0 },
          { bxR:0.24, byR:0.50, segs:isMob?7:12, bw:isMob?14:24, col:'#1c0332', spine:'#7e22ce', sp:0.16, amp:W*0.11, freq:0.0048, ph:2.4 }
        ]
      };
      this._bgGrad = null;
    }
    const atm = this._atm;

    if (!this._bgGrad || this._bgKey !== `${W}x${H}`) {
      this._bgKey = `${W}x${H}`;
      const g = ctx.createRadialGradient(W*0.5,H*0.46,W*0.06,W*0.5,H*0.46,W*0.80);
      g.addColorStop(0,'rgba(88,28,135,0.22)'); g.addColorStop(0.55,'rgba(59,7,100,0.10)'); g.addColorStop(1,'rgba(0,0,0,0)');
      this._bgGrad = g;
    }

    ctx.save();
    ctx.fillStyle = this._bgGrad; ctx.fillRect(0,0,W,H);

    // Grand dragon silhouettes
    for (let d = 0; d < atm.dragons.length; d++) {
      const dr = atm.dragons[d], bx = W*dr.bxR, by = H*dr.byR;
      const alpha = 0.22 + Math.sin(t*1.0+dr.ph)*0.05, stepY = (H*0.70)/dr.segs;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      let first = true, hx = bx, hy = by;
      for (let s = 0; s <= dr.segs; s++) {
        const py = by-(dr.segs*0.5-s)*stepY, px = bx+Math.sin(py*dr.freq+t*dr.sp+dr.ph)*dr.amp;
        if (first) { ctx.moveTo(px,py); first=false; } else ctx.lineTo(px,py);
        if (s === 0) { hx=px; hy=py; }
      }
      ctx.strokeStyle = dr.col; ctx.lineWidth = dr.bw; ctx.lineCap = 'round'; ctx.stroke();
      ctx.strokeStyle = dr.spine; ctx.lineWidth = isMob?2.5:4.5; ctx.stroke();

      // Dragon head silhouette in background
      const hs = isMob ? 10 : 17;
      ctx.save();
      ctx.translate(hx, hy);
      ctx.fillStyle = dr.col;
      ctx.beginPath();
      ctx.moveTo(0, -hs*1.0);
      ctx.bezierCurveTo(hs*1.3,-hs*1.0, hs*1.7,hs*0.3, hs*0.7,hs*0.9);
      ctx.bezierCurveTo(hs*0.2,hs*1.3, -hs*0.2,hs*1.3, -hs*0.7,hs*0.9);
      ctx.bezierCurveTo(-hs*1.7,hs*0.3, -hs*1.3,-hs*1.0, 0,-hs*1.0);
      ctx.closePath(); ctx.fill();
      // Horns
      ctx.strokeStyle = dr.spine; ctx.lineWidth = isMob?1.5:2.5; ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(-hs*0.3,-hs*0.8); ctx.bezierCurveTo(-hs*0.7,-hs*1.6,-hs*1.1,-hs*1.8,-hs*1.0,-hs*2.3); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hs*0.3,-hs*0.8); ctx.bezierCurveTo(hs*0.7,-hs*1.6,hs*1.1,-hs*1.8,hs*1.0,-hs*2.3); ctx.stroke();
      // Spirit eye
      const eG = ctx.createRadialGradient(0,-hs*0.05,0.5,0,-hs*0.05,isMob?3:4.5);
      eG.addColorStop(0,'#ffffff'); eG.addColorStop(0.5,'#e9d5ff'); eG.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = eG; ctx.globalAlpha = Math.min(1.0, alpha*2.5);
      ctx.beginPath(); ctx.arc(0,-hs*0.05,isMob?3:4.5,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }

    // Aizen silhouette
    ctx.globalAlpha = 0.88;
    const ax=W*0.5, ay=H*0.72, asc=isMob?0.78:1.08;
    const halo = ctx.createRadialGradient(ax,ay-26*asc,7,ax,ay-26*asc,42*asc);
    halo.addColorStop(0,'rgba(255,255,255,0.36)'); halo.addColorStop(0.4,'rgba(192,132,252,0.20)'); halo.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(ax,ay-26*asc,42*asc,0,Math.PI*2); ctx.fill();
    if (!isMob) {
      ctx.strokeStyle='rgba(216,180,254,0.25)'; ctx.lineWidth=1.0;
      for (let r=0;r<8;r++) {
        const ang=r*Math.PI/4+t*0.13, cos=Math.cos(ang), sin=Math.sin(ang), hy2=ay-26*asc;
        ctx.beginPath(); ctx.moveTo(ax+cos*16,hy2+sin*16); ctx.lineTo(ax+cos*38,hy2+sin*38); ctx.stroke();
      }
    }
    ctx.fillStyle='#04000d'; ctx.strokeStyle='#04000d';
    ctx.beginPath(); ctx.arc(ax,ay-50*asc,6*asc,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(ax-7*asc,ay-43*asc); ctx.lineTo(ax+7*asc,ay-43*asc); ctx.lineTo(ax+14*asc,ay); ctx.lineTo(ax-14*asc,ay); ctx.closePath(); ctx.fill();
    ctx.lineWidth=3.0*asc;
    ctx.beginPath(); ctx.moveTo(ax+6*asc,ay-38*asc); ctx.lineTo(ax+22*asc,ay-50*asc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax-6*asc,ay-37*asc); ctx.lineTo(ax-14*asc,ay-28*asc); ctx.stroke();
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.0*asc;
    ctx.beginPath(); ctx.moveTo(ax-14*asc,ay-28*asc); ctx.lineTo(ax-24*asc,ay-14*asc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ax,ay-42*asc); ctx.lineTo(ax,ay); ctx.stroke();

    // Cliffs
    ctx.globalAlpha=1.0; ctx.fillStyle='#03000a';
    ctx.beginPath(); ctx.moveTo(0,H); ctx.lineTo(0,H*0.72); ctx.lineTo(W*0.12,H*0.76); ctx.lineTo(W*0.23,H*0.70); ctx.lineTo(W*0.36,H*0.84); ctx.lineTo(W*0.36,H); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W,H); ctx.lineTo(W,H*0.70); ctx.lineTo(W*0.86,H*0.74); ctx.lineTo(W*0.76,H*0.68); ctx.lineTo(W*0.62,H*0.83); ctx.lineTo(W*0.62,H); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W*0.32,H); ctx.lineTo(W*0.40,ay+4); ctx.lineTo(W*0.50,ay); ctx.lineTo(W*0.60,ay+6); ctx.lineTo(W*0.68,H); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='#7e22ce'; ctx.lineWidth=1.1; ctx.globalAlpha=0.50;
    ctx.beginPath();
    ctx.moveTo(W*0.05,H*0.76); ctx.lineTo(W*0.12,H*0.84); ctx.lineTo(W*0.18,H*0.92);
    ctx.moveTo(W*0.92,H*0.74); ctx.lineTo(W*0.84,H*0.81); ctx.lineTo(W*0.78,H*0.89);
    ctx.stroke();

    // Shards
    for (let i = 0; i < atm.shards.length; i++) {
      const sh = atm.shards[i];
      sh.y += sh.vy*warpMult; sh.x += sh.vx+Math.sin(t*1.3+sh.y*0.011)*0.20; sh.angle += sh.vRot;
      if (sh.y < -18) { sh.y=H+18; sh.x=Math.random()*W; }
      ctx.save(); ctx.translate(sh.x,sh.y); ctx.rotate(sh.angle);
      ctx.globalAlpha = sh.bright?0.68:0.32;
      ctx.fillStyle   = sh.amber?'#fbbf24':(sh.bright?'#c084fc':'#4c1d95');
      ctx.strokeStyle = sh.bright?'#e9d5ff':'rgba(147,51,234,0.5)'; ctx.lineWidth=0.8;
      const sz=sh.sz;
      ctx.beginPath(); ctx.moveTo(0,-sz*1.3); ctx.lineTo(sz*0.55,0); ctx.lineTo(0,sz*1.3); ctx.lineTo(-sz*0.55,0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // Water
    const wh=H*0.12, wg=ctx.createLinearGradient(0,H-wh,0,H);
    wg.addColorStop(0,'rgba(19,4,36,0)'); wg.addColorStop(0.5,'rgba(59,7,100,0.20)'); wg.addColorStop(1,'rgba(88,28,135,0.35)');
    ctx.fillStyle=wg; ctx.globalAlpha=1.0; ctx.fillRect(0,H-wh,W,wh);
    if (!isMob) {
      ctx.strokeStyle='rgba(168,85,247,0.28)'; ctx.lineWidth=1.0;
      for (let wy=H-wh+8;wy<H;wy+=14) {
        const wo=Math.sin(t*1.8+wy*0.08)*(W*0.06);
        ctx.beginPath(); ctx.moveTo(W*0.22+wo,wy); ctx.lineTo(W*0.78+wo,wy); ctx.stroke();
      }
    }
    ctx.restore();
  }
};
