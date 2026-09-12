// ============================================================================
// HADO 99 THEME — Hadō #99: Goryūtenmetsu
// Note sprite = dragon head viewed from ABOVE (top-down):
//   wide flat skull at top, two swept-back horns, glowing eyes, narrow snout
//   pointing downward (direction of travel). Gold at 800+ combo.
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
  // DRAGON HEAD — TOP-DOWN VIEW
  //
  //  ╔════════════════════╗  ← top of note (back of head / horns)
  //  ║  ~horn~   ~horn~  ║
  //  ║   [wide flat skull]║
  //  ║     (O)  (O)      ║  ← two glowing eyes
  //  ║       \snout/     ║
  //  ║         V         ║  ← narrow snout tip (direction of travel)
  //  ╚════════════════════╝  ← bottom of note
  //
  //  Note tile is ~3:1 wide:tall, so head is WIDE and SHORT.
  //  At tier >= 800: all violet shifts to gold.
  // ===========================================================================
  _drawDragonHead(ctx, cx, cy, w, h, tier, isDead) {
    const gold = (tier >= 800) && !isDead;

    const C = isDead ? {
      dark:    '#0f172a',
      skull:   '#1e293b',
      plate:   '#334155',
      bright:  '#475569',
      glow:    '#64748b',
      eye:     '#94a3b8',
      aura:    'rgba(71,85,105,0.45)',
      horn:    '#334155',
      outline: '#475569'
    } : gold ? {
      dark:    '#1c0800',
      skull:   '#78350f',
      plate:   '#92400e',
      bright:  '#f59e0b',
      glow:    '#fbbf24',
      eye:     '#ffffff',
      aura:    'rgba(251,191,36,0.60)',
      horn:    '#d97706',
      outline: '#fde68a'
    } : {
      dark:    '#0d0118',
      skull:   '#3b0764',
      plate:   '#581c87',
      bright:  '#c084fc',
      glow:    '#e9d5ff',
      eye:     '#ffffff',
      aura:    'rgba(168,85,247,0.55)',
      horn:    '#9333ea',
      outline: '#a855f7'
    };

    ctx.save();

    // Alias: note is wide (w) and short (h)
    // Top of note = back of dragon head (horns), Bottom = snout tip
    const W2 = w / 2;   // half-width
    const H2 = h / 2;   // half-height (this is SMALL — note is flat)

    // ── 0. OUTER REIATSU AURA ──
    const aG = ctx.createRadialGradient(cx, cy - H2 * 0.15, 1, cx, cy, W2 * 1.0);
    aG.addColorStop(0,   C.aura);
    aG.addColorStop(0.5, gold ? 'rgba(180,83,9,0.18)' : 'rgba(88,28,135,0.18)');
    aG.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = aG;
    ctx.beginPath();
    ctx.ellipse(cx, cy - H2 * 0.1, W2 * 1.1, H2 * 1.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 1. SWEPT-BACK HORNS (at the TOP of the note = rear of skull) ──
    // Horns sweep outward and upward from the rear corners of the skull
    ctx.fillStyle = C.horn;
    ctx.strokeStyle = C.bright;
    ctx.lineWidth = 0.9;
    for (const s of [-1, 1]) {
      const hbx = cx + s * W2 * 0.52;   // horn base x
      const hby = cy - H2 * 0.55;       // horn base y (near top of note)
      ctx.beginPath();
      ctx.moveTo(hbx,              hby);
      ctx.bezierCurveTo(
        hbx + s * W2 * 0.22, hby - H2 * 0.80,   // sweep outward
        hbx + s * W2 * 0.38, hby - H2 * 1.30,   // middle of horn
        hbx + s * W2 * 0.26, hby - H2 * 1.75    // horn tip (points upward)
      );
      ctx.bezierCurveTo(
        hbx + s * W2 * 0.10, hby - H2 * 1.25,
        hbx - s * W2 * 0.04, hby - H2 * 0.70,
        hbx - s * W2 * 0.10, hby
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Bright inner highlight on horn
      ctx.fillStyle = C.bright;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(hbx + s * W2 * 0.03, hby - H2 * 0.05);
      ctx.bezierCurveTo(
        hbx + s * W2 * 0.20, hby - H2 * 0.72,
        hbx + s * W2 * 0.32, hby - H2 * 1.18,
        hbx + s * W2 * 0.22, hby - H2 * 1.60
      );
      ctx.bezierCurveTo(
        hbx + s * W2 * 0.12, hby - H2 * 1.20,
        hbx + s * W2 * 0.02, hby - H2 * 0.65,
        hbx - s * W2 * 0.04, hby - H2 * 0.02
      );
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = C.horn;
    }

    // ── 2. SKULL PLATE — top-down wide teardrop ──
    // Wide across the top (shoulders), narrowing to a snout at the bottom
    const skullG = ctx.createLinearGradient(cx, cy - H2, cx, cy + H2);
    skullG.addColorStop(0,   C.plate);
    skullG.addColorStop(0.5, C.skull);
    skullG.addColorStop(1,   C.dark);
    ctx.fillStyle   = skullG;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth   = 1.4;

    ctx.beginPath();
    // Start at top-center (back of skull)
    ctx.moveTo(cx,            cy - H2 * 0.80);
    // Right shoulder
    ctx.bezierCurveTo(
      cx + W2 * 0.50, cy - H2 * 0.90,
      cx + W2 * 0.90, cy - H2 * 0.60,
      cx + W2 * 0.92, cy - H2 * 0.10   // right widest
    );
    // Right cheek curving inward toward snout
    ctx.bezierCurveTo(
      cx + W2 * 0.90, cy + H2 * 0.30,
      cx + W2 * 0.55, cy + H2 * 0.65,
      cx + W2 * 0.18, cy + H2 * 0.90   // right snout edge
    );
    // Snout tip (pointed, bottom-center)
    ctx.bezierCurveTo(
      cx + W2 * 0.06, cy + H2 * 1.00,
      cx - W2 * 0.06, cy + H2 * 1.00,
      cx - W2 * 0.18, cy + H2 * 0.90
    );
    // Left cheek
    ctx.bezierCurveTo(
      cx - W2 * 0.55, cy + H2 * 0.65,
      cx - W2 * 0.90, cy + H2 * 0.30,
      cx - W2 * 0.92, cy - H2 * 0.10
    );
    // Left shoulder
    ctx.bezierCurveTo(
      cx - W2 * 0.90, cy - H2 * 0.60,
      cx - W2 * 0.50, cy - H2 * 0.90,
      cx,             cy - H2 * 0.80
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // ── 3. SKULL RIDGE DETAIL LINES (top-down plates) ──
    ctx.strokeStyle = C.outline;
    ctx.lineWidth   = 0.9;
    ctx.globalAlpha = 0.65;
    // Central spine line (neck-to-snout)
    ctx.beginPath();
    ctx.moveTo(cx, cy - H2 * 0.55);
    ctx.lineTo(cx, cy + H2 * 0.85);
    ctx.stroke();
    // Lateral ridges (symmetrical)
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + s * W2 * 0.20, cy - H2 * 0.60);
      ctx.bezierCurveTo(cx + s * W2 * 0.38, cy - H2 * 0.10, cx + s * W2 * 0.50, cy + H2 * 0.35, cx + s * W2 * 0.28, cy + H2 * 0.70);
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // ── 4. GLOWING EYES (two dots, symmetrically placed, viewing from above) ──
    const eyeY  = cy - H2 * 0.05;
    const eyeRx = W2 * 0.13;   // eye horizontal radius
    const eyeRy = H2 * 0.28;   // eye vertical radius (taller than wide from top view)
    for (const s of [-1, 1]) {
      const ex = cx + s * W2 * 0.38;

      ctx.save();
      ctx.translate(ex, eyeY);
      ctx.rotate(s * 0.12);

      // Dark socket
      ctx.fillStyle = '#04000c';
      ctx.beginPath();
      ctx.ellipse(0, 0, eyeRx + 1.8, eyeRy + 1.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Radiant glowing iris
      const eG = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(eyeRx, eyeRy));
      eG.addColorStop(0,    '#ffffff');
      eG.addColorStop(0.35, C.eye);
      eG.addColorStop(1,    gold ? '#92400e' : '#581c87');
      ctx.fillStyle = eG;
      ctx.beginPath();
      ctx.ellipse(0, 0, eyeRx, eyeRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slit pupil (vertical — viewed from above)
      ctx.fillStyle = '#04000c';
      ctx.fillRect(-1.1, -eyeRy * 0.85, 2.2, eyeRy * 1.70);

      // Eye glow halo
      if (!isDead) {
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = C.bright;
        ctx.lineWidth   = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, eyeRx + 3.0, eyeRy + 3.0, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      ctx.restore();
    }

    // ── 5. NOSTRIL DOTS on snout ──
    if (!isDead) {
      ctx.fillStyle = C.bright;
      ctx.globalAlpha = 0.75;
      const nY = cy + H2 * 0.60;
      ctx.beginPath(); ctx.arc(cx - W2 * 0.08, nY, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + W2 * 0.08, nY, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // ── 6. CHEEK NECK-FRILLS (side fins, top-down view) ──
    ctx.fillStyle   = C.plate;
    ctx.strokeStyle = C.bright;
    ctx.lineWidth   = 0.9;
    for (const s of [-1, 1]) {
      // Upper frill (near top/rear of skull)
      ctx.beginPath();
      ctx.moveTo(cx + s * W2 * 0.82, cy - H2 * 0.30);
      ctx.bezierCurveTo(
        cx + s * W2 * 1.05, cy - H2 * 0.55,
        cx + s * W2 * 1.12, cy - H2 * 0.12,
        cx + s * W2 * 0.90, cy + H2 * 0.08
      );
      ctx.bezierCurveTo(
        cx + s * W2 * 0.86, cy - H2 * 0.05,
        cx + s * W2 * 0.84, cy - H2 * 0.15,
        cx + s * W2 * 0.82, cy - H2 * 0.30
      );
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // Lower frill (near cheek/jaw area)
      ctx.beginPath();
      ctx.moveTo(cx + s * W2 * 0.75, cy + H2 * 0.25);
      ctx.bezierCurveTo(
        cx + s * W2 * 0.98, cy + H2 * 0.38,
        cx + s * W2 * 1.00, cy + H2 * 0.60,
        cx + s * W2 * 0.72, cy + H2 * 0.58
      );
      ctx.bezierCurveTo(
        cx + s * W2 * 0.70, cy + H2 * 0.44,
        cx + s * W2 * 0.72, cy + H2 * 0.33,
        cx + s * W2 * 0.75, cy + H2 * 0.25
      );
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    }

    // ── 7. REIATSU BREATH from snout tip ──
    if (!isDead) {
      const snoutX = cx, snoutY = cy + H2 * 0.96;
      const bG = ctx.createRadialGradient(snoutX, snoutY, 0.5, snoutX, snoutY, W2 * 0.30);
      bG.addColorStop(0,   '#ffffff');
      bG.addColorStop(0.3, gold ? '#fbbf24' : C.bright);
      bG.addColorStop(0.7, gold ? 'rgba(180,83,9,0.45)' : 'rgba(107,33,168,0.40)');
      bG.addColorStop(1,   'rgba(0,0,0,0)');
      ctx.fillStyle = bG;
      ctx.beginPath();
      ctx.arc(snoutX, snoutY, W2 * 0.27, 0, Math.PI * 2);
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
      bg.addColorStop(0,'rgba(30,10,0,0.40)'); bg.addColorStop(0.20,'#78350f');
      bg.addColorStop(0.70,'#b45309');         bg.addColorStop(1,'#d97706');
    } else {
      bg.addColorStop(0,'rgba(15,3,26,0.40)'); bg.addColorStop(0.20,'#2e0854');
      bg.addColorStop(0.70,'#581c87');         bg.addColorStop(1,'#9333ea');
    }
    ctx.fillStyle = bg; ctx.fillRect(0, 0, tailW, tailH);

    // Top-down serpentine body — overlapping scale rings
    const scaleH = tailH / 18;
    ctx.strokeStyle = gold ? 'rgba(251,191,36,0.28)' : 'rgba(192,132,252,0.24)';
    ctx.fillStyle   = gold ? 'rgba(180,83,9,0.18)'   : 'rgba(88,28,135,0.18)';
    ctx.lineWidth   = 0.9;
    for (let r = 0; r < 18; r++) {
      const y  = r * scaleH;
      const off = (r % 2) * tailW * 0.12;
      for (let c = 0; c < 3; c++) {
        const sx = (c / 2) * tailW + off * (c - 1);
        const rx = tailW * 0.28, ry = scaleH * 0.55;
        ctx.beginPath(); ctx.ellipse(sx, y + ry, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
    }

    // Central spine (viewed from above)
    const sg = ctx.createLinearGradient(0,0,0,tailH);
    sg.addColorStop(0, gold?'rgba(251,191,36,0.35)':'rgba(216,180,254,0.35)');
    sg.addColorStop(0.5, gold?'#fbbf24':'#e9d5ff'); sg.addColorStop(1,'#ffffff');
    ctx.strokeStyle = sg; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,tailH); ctx.stroke();

    ctx.fillStyle = gold?'#fbbf24':'#ffffff';
    for (let i=1; i<12; i++) {
      const ny = (i/12)*tailH;
      ctx.beginPath(); ctx.arc(cx,ny,1.8,0,Math.PI*2); ctx.fill();
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
    ctx.strokeStyle = dead?'#334155':(holding?'#ffffff':'#9333ea');
    ctx.lineWidth   = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx - hw, yTail);
    ctx.bezierCurveTo(cx-hw*0.50,yTail-len*0.45,cx-5*sX,yTail-len*0.80,cx,tipY-2*sX);
    ctx.bezierCurveTo(cx+5*sX,yTail-len*0.80,cx+hw*0.50,yTail-len*0.45,cx+hw,yTail);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    if (!dead) {
      ctx.strokeStyle = holding?'#ffffff':'#c084fc'; ctx.lineWidth=1.8*sX; ctx.lineCap='round';
      for (const s of [-1,1]) {
        ctx.beginPath();
        ctx.moveTo(cx,tipY-2*sX);
        ctx.bezierCurveTo(cx+s*4*sX,tipY-9*sX,cx+s*7*sX,tipY-13*sX,cx+s*3*sX,tipY-18*sX);
        ctx.stroke();
      }
    }
    if (holding && !isMob) {
      const fl=Math.sin(now*0.022)*3;
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(cx,tipY-20*sX); ctx.lineTo(cx+fl,tipY-28*sX); ctx.lineTo(cx-fl*0.5,tipY-34*sX); ctx.stroke();
    }
    ctx.restore();
  },

  // ==========================================================================
  // RECEPTOR
  // ==========================================================================
  drawReceptor(ctx, x, y, w, h, isActive, isLight) {
    ctx.save();
    const cx=x+w/2, cy=y+h/2;
    ctx.strokeStyle=isActive?'#ffffff':'rgba(192,132,252,0.60)'; ctx.lineWidth=isActive?2.2:1.3;
    if (ctx.roundRect) ctx.roundRect(x,y,w,h,8); else ctx.strokeRect(x,y,w,h); ctx.stroke();
    const cl=7, fc=isActive?'#ffffff':'#a855f7'; ctx.fillStyle=fc;
    ctx.fillRect(x,y,cl,2);ctx.fillRect(x,y,2,cl); ctx.fillRect(x+w-cl,y,cl,2);ctx.fillRect(x+w-2,y,2,cl);
    ctx.fillRect(x,y+h-2,cl,2);ctx.fillRect(x,y+h-cl,2,cl); ctx.fillRect(x+w-cl,y+h-2,cl,2);ctx.fillRect(x+w-2,y+h-cl,2,cl);
    if (isActive) {
      const cg=ctx.createRadialGradient(cx,cy,2,cx,cy,w*0.48);
      cg.addColorStop(0,'rgba(255,255,255,0.70)');cg.addColorStop(0.45,'rgba(192,132,252,0.35)');cg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=cg; ctx.fillRect(x,y,w,h);
    }
    ctx.restore();
  },

  // ==========================================================================
  // HIT ANIMATION
  // ==========================================================================
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now) {
    if (p >= 1) return;
    const ease=1-(1-p)*(1-p);
    ctx.save();
    const dist=(w*0.80)*ease;
    ctx.globalAlpha=Math.max(0,0.90-ease*0.90); ctx.lineCap='round'; ctx.lineWidth=3.0;
    for (let i=0;i<5;i++) {
      const angle=(i*2*Math.PI)/5-Math.PI/2;
      const ex=cx+Math.cos(angle)*dist, ey=cy+Math.sin(angle)*dist;
      const mx=cx+Math.cos(angle)*dist*0.55, my=cy+Math.sin(angle)*dist*0.55;
      const wg=ctx.createLinearGradient(cx,cy,ex,ey);
      wg.addColorStop(0,isPerfect?'rgba(255,255,255,0.9)':'rgba(192,132,252,0.9)');
      wg.addColorStop(0.6,isPerfect?'rgba(251,191,36,0.75)':'rgba(147,51,234,0.75)');
      wg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.strokeStyle=wg;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.quadraticCurveTo(mx+Math.cos(angle+Math.PI/2)*8,my+Math.sin(angle+Math.PI/2)*8,ex,ey); ctx.stroke();
    }
    const dr=(w*0.65)*ease;
    ctx.strokeStyle=isPerfect?'#ffd700':'#c084fc'; ctx.lineWidth=isPerfect?2.2:1.4;
    ctx.beginPath(); ctx.moveTo(cx,cy-dr); ctx.lineTo(cx+dr,cy); ctx.lineTo(cx,cy+dr); ctx.lineTo(cx-dr,cy); ctx.closePath(); ctx.stroke();
    if (p < 0.30) { ctx.globalAlpha=(0.30-p)/0.30; ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.arc(cx,cy,Math.max(0,(w*0.28)*(1-p*3.3)),0,Math.PI*2); ctx.fill(); }
    ctx.restore();
  },

  // ==========================================================================
  // PARTICLES
  // ==========================================================================
  drawParticle(ctx, pt, life) {
    if (!pt.active || life <= 0) return;
    ctx.save(); ctx.globalAlpha=Math.max(0,life);
    const mode=(pt.x|0)%3;
    if (mode===0) {
      const sz=3.8*life; ctx.fillStyle=pt.color||'#c084fc';
      ctx.save(); ctx.translate(pt.x,pt.y); ctx.rotate(pt.angle||0);
      ctx.beginPath(); ctx.moveTo(0,-sz*1.4); ctx.lineTo(sz*0.62,0); ctx.lineTo(0,sz*1.4); ctx.lineTo(-sz*0.62,0); ctx.closePath(); ctx.fill();
      ctx.restore();
    } else if (mode===1) {
      ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(pt.x,pt.y,1.7*life,0,Math.PI*2); ctx.fill();
    } else {
      ctx.fillStyle='#e9d5ff'; ctx.fillRect(pt.x-1,pt.y-2.5*life,2,5*life);
    }
    ctx.restore();
  },

  // ==========================================================================
  // ATMOSPHERE
  // ==========================================================================
  _atm: null, _bgGrad: null, _bgKey: '',

  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const W=State.gameWidth, H=State.gameHeight, t=songTime*0.001, isMob=State.isMobile;

    if (!this._atm || this._atm._W!==W || this._atm._H!==H) {
      this._atm = {
        _W:W, _H:H,
        shards: Array.from({length:isMob?16:34},()=>({
          x:Math.random()*W, y:Math.random()*H,
          vy:-0.40-Math.random()*1.0, vx:(Math.random()-0.5)*0.24,
          sz:3+Math.random()*(isMob?7:11), angle:Math.random()*Math.PI*2,
          vRot:(Math.random()-0.5)*0.025, bright:Math.random()>0.55, amber:Math.random()>0.84
        })),
        dragons:[
          {bxR:0.76,byR:0.36,segs:isMob?9:15,bw:isMob?18:30,col:'#2e0548',spine:'#9333ea',sp:0.19,amp:W*0.13,freq:0.0038,ph:0.0},
          {bxR:0.24,byR:0.50,segs:isMob?7:12,bw:isMob?14:24,col:'#1c0332',spine:'#7e22ce',sp:0.16,amp:W*0.11,freq:0.0048,ph:2.4}
        ]
      };
      this._bgGrad=null;
    }
    const atm=this._atm;
    if (!this._bgGrad||this._bgKey!==`${W}x${H}`) {
      this._bgKey=`${W}x${H}`;
      const g=ctx.createRadialGradient(W*0.5,H*0.46,W*0.06,W*0.5,H*0.46,W*0.80);
      g.addColorStop(0,'rgba(88,28,135,0.22)');g.addColorStop(0.55,'rgba(59,7,100,0.10)');g.addColorStop(1,'rgba(0,0,0,0)');
      this._bgGrad=g;
    }

    ctx.save();
    ctx.fillStyle=this._bgGrad; ctx.fillRect(0,0,W,H);

    // Background dragon silhouettes
    for (let d=0;d<atm.dragons.length;d++) {
      const dr=atm.dragons[d], bx=W*dr.bxR, by=H*dr.byR;
      const alpha=0.22+Math.sin(t*1.0+dr.ph)*0.05, stepY=(H*0.70)/dr.segs;
      ctx.globalAlpha=alpha;
      ctx.beginPath();
      let first=true,hx=bx,hy=by;
      for (let s=0;s<=dr.segs;s++) {
        const py=by-(dr.segs*0.5-s)*stepY, px=bx+Math.sin(py*dr.freq+t*dr.sp+dr.ph)*dr.amp;
        if(first){ctx.moveTo(px,py);first=false;}else ctx.lineTo(px,py);
        if(s===0){hx=px;hy=py;}
      }
      ctx.strokeStyle=dr.col;ctx.lineWidth=dr.bw;ctx.lineCap='round';ctx.stroke();
      ctx.strokeStyle=dr.spine;ctx.lineWidth=isMob?2.5:4.5;ctx.stroke();

      // Background dragon head (top-down mini silhouette)
      const hs=isMob?9:15;
      ctx.save(); ctx.translate(hx,hy);
      ctx.fillStyle=dr.col;
      ctx.beginPath();
      ctx.moveTo(0,-hs*0.8);
      ctx.bezierCurveTo(hs*1.2,-hs*0.9, hs*1.5,hs*0.2, hs*0.5,hs*0.9);
      ctx.bezierCurveTo(hs*0.15,hs*1.1, -hs*0.15,hs*1.1, -hs*0.5,hs*0.9);
      ctx.bezierCurveTo(-hs*1.5,hs*0.2, -hs*1.2,-hs*0.9, 0,-hs*0.8);
      ctx.closePath(); ctx.fill();
      // Horns
      ctx.strokeStyle=dr.spine; ctx.lineWidth=isMob?1.4:2.2; ctx.lineCap='round';
      for (const s of [-1,1]) {
        ctx.beginPath();
        ctx.moveTo(s*hs*0.45,-hs*0.65);
        ctx.bezierCurveTo(s*hs*0.75,-hs*1.30, s*hs*1.0,-hs*1.60, s*hs*0.85,-hs*2.0);
        ctx.stroke();
      }
      // Eyes
      const eG=ctx.createRadialGradient(0,-hs*0.08,0.5,0,-hs*0.08,isMob?2.5:4);
      eG.addColorStop(0,'#ffffff');eG.addColorStop(0.5,'#e9d5ff');eG.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=eG; ctx.globalAlpha=Math.min(1.0,alpha*2.5);
      for (const s of [-1,1]) { ctx.beginPath(); ctx.arc(s*hs*0.35,-hs*0.08,isMob?2:3.2,0,Math.PI*2); ctx.fill(); }
      ctx.restore();
    }

    // Aizen silhouette
    ctx.globalAlpha=0.88;
    const ax=W*0.5,ay=H*0.72,asc=isMob?0.78:1.08;
    const halo=ctx.createRadialGradient(ax,ay-26*asc,7,ax,ay-26*asc,42*asc);
    halo.addColorStop(0,'rgba(255,255,255,0.36)');halo.addColorStop(0.4,'rgba(192,132,252,0.20)');halo.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(ax,ay-26*asc,42*asc,0,Math.PI*2); ctx.fill();
    if (!isMob) {
      ctx.strokeStyle='rgba(216,180,254,0.25)'; ctx.lineWidth=1.0;
      for (let r=0;r<8;r++) {
        const ang=r*Math.PI/4+t*0.13,cos=Math.cos(ang),sin=Math.sin(ang),hy2=ay-26*asc;
        ctx.beginPath();ctx.moveTo(ax+cos*16,hy2+sin*16);ctx.lineTo(ax+cos*38,hy2+sin*38);ctx.stroke();
      }
    }
    ctx.fillStyle='#04000d';ctx.strokeStyle='#04000d';
    ctx.beginPath();ctx.arc(ax,ay-50*asc,6*asc,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(ax-7*asc,ay-43*asc);ctx.lineTo(ax+7*asc,ay-43*asc);ctx.lineTo(ax+14*asc,ay);ctx.lineTo(ax-14*asc,ay);ctx.closePath();ctx.fill();
    ctx.lineWidth=3.0*asc;
    ctx.beginPath();ctx.moveTo(ax+6*asc,ay-38*asc);ctx.lineTo(ax+22*asc,ay-50*asc);ctx.stroke();
    ctx.beginPath();ctx.moveTo(ax-6*asc,ay-37*asc);ctx.lineTo(ax-14*asc,ay-28*asc);ctx.stroke();
    ctx.strokeStyle='#ffffff';ctx.lineWidth=1.0*asc;
    ctx.beginPath();ctx.moveTo(ax-14*asc,ay-28*asc);ctx.lineTo(ax-24*asc,ay-14*asc);ctx.stroke();
    ctx.beginPath();ctx.moveTo(ax,ay-42*asc);ctx.lineTo(ax,ay);ctx.stroke();

    // Cliffs
    ctx.globalAlpha=1.0;ctx.fillStyle='#03000a';
    ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,H*0.72);ctx.lineTo(W*0.12,H*0.76);ctx.lineTo(W*0.23,H*0.70);ctx.lineTo(W*0.36,H*0.84);ctx.lineTo(W*0.36,H);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(W,H);ctx.lineTo(W,H*0.70);ctx.lineTo(W*0.86,H*0.74);ctx.lineTo(W*0.76,H*0.68);ctx.lineTo(W*0.62,H*0.83);ctx.lineTo(W*0.62,H);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(W*0.32,H);ctx.lineTo(W*0.40,ay+4);ctx.lineTo(W*0.50,ay);ctx.lineTo(W*0.60,ay+6);ctx.lineTo(W*0.68,H);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#7e22ce';ctx.lineWidth=1.1;ctx.globalAlpha=0.50;
    ctx.beginPath();ctx.moveTo(W*0.05,H*0.76);ctx.lineTo(W*0.12,H*0.84);ctx.lineTo(W*0.18,H*0.92);ctx.moveTo(W*0.92,H*0.74);ctx.lineTo(W*0.84,H*0.81);ctx.lineTo(W*0.78,H*0.89);ctx.stroke();

    // Shards
    for (let i=0;i<atm.shards.length;i++) {
      const sh=atm.shards[i];
      sh.y+=sh.vy*warpMult;sh.x+=sh.vx+Math.sin(t*1.3+sh.y*0.011)*0.20;sh.angle+=sh.vRot;
      if(sh.y<-18){sh.y=H+18;sh.x=Math.random()*W;}
      ctx.save();ctx.translate(sh.x,sh.y);ctx.rotate(sh.angle);
      ctx.globalAlpha=sh.bright?0.68:0.32;
      ctx.fillStyle=sh.amber?'#fbbf24':(sh.bright?'#c084fc':'#4c1d95');
      ctx.strokeStyle=sh.bright?'#e9d5ff':'rgba(147,51,234,0.5)';ctx.lineWidth=0.8;
      const sz=sh.sz;
      ctx.beginPath();ctx.moveTo(0,-sz*1.3);ctx.lineTo(sz*0.55,0);ctx.lineTo(0,sz*1.3);ctx.lineTo(-sz*0.55,0);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.restore();
    }

    // Water
    const wh=H*0.12,wg=ctx.createLinearGradient(0,H-wh,0,H);
    wg.addColorStop(0,'rgba(19,4,36,0)');wg.addColorStop(0.5,'rgba(59,7,100,0.20)');wg.addColorStop(1,'rgba(88,28,135,0.35)');
    ctx.fillStyle=wg;ctx.globalAlpha=1.0;ctx.fillRect(0,H-wh,W,wh);
    if (!isMob) {
      ctx.strokeStyle='rgba(168,85,247,0.28)';ctx.lineWidth=1.0;
      for (let wy=H-wh+8;wy<H;wy+=14) {
        const wo=Math.sin(t*1.8+wy*0.08)*(W*0.06);
        ctx.beginPath();ctx.moveTo(W*0.22+wo,wy);ctx.lineTo(W*0.78+wo,wy);ctx.stroke();
      }
    }
    ctx.restore();
  }
};
