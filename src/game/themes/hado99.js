// ============================================================================
// HADO 99 THEME MODULE — Sōsuke Aizen & Hadō #99: Goryūtenmetsu (破道の九十九 五龍転滅)
// Ultimate Legendary Theme (100 Coins)
// Aesthetic: Obsidian Shinigami kimono & immaculate Arrancar white robe contrast,
//            5 colossal swirling dragons of pure violet Reiatsu erupting from
//            shattered earth, glowing amber Hōgyoku eyes, and transcendent serenity.
// Performance: Zero-allocation game loop, persistent atmosphere pools, adaptive mobile mode.
// ============================================================================

export const HADO99_THEME = {
  id: 'hado99',
  nameKey: 'themeHado99',
  descKey: 'themeHado99Desc',
  badgeKey: 'themeHado99Badge',
  price: 100,
  unlockedByDefault: false,
  accentColor: '#a855f7',
  previewBg: 'linear-gradient(135deg, #090214, #1b0633, #380b5c, #06010a)',
  colors: {
    bgCenter: '#130424',
    bgMid: '#0a0214',
    bgOuter: '#030008',
    bgAura: 'rgba(168, 85, 247, 0.22)',
    strings: ['#e9d5ff', '#c084fc', '#a855f7', '#7e22ce'],
    stringGlow: 'rgba(168, 85, 247, 0.60)',
    receptorBorder: 'rgba(216, 180, 254, 0.70)',
    particleType: 'reiatsu_dragon'
  },
  comboTiers: [
    { min: 0,   max: 49,       name: 'reikaku_awakening', border: 'rgba(168, 85, 247, 0.55)', glow: 'rgba(126, 34, 206, 0.40)', particleColors: ['#c084fc', '#a855f7', '#7e22ce'] },
    { min: 50,  max: 99,       name: 'kyoka_suigetsu',    border: 'rgba(192, 132, 252, 0.70)', glow: 'rgba(168, 85, 247, 0.55)', particleColors: ['#d8b4fe', '#c084fc', '#f3e8ff'] },
    { min: 100, max: 199,      name: 'kurohitsugi',       border: 'rgba(147, 51, 234, 0.82)', glow: 'rgba(88, 28, 135, 0.70)',  particleColors: ['#9333ea', '#7e22ce', '#3b0764'] },
    { min: 200, max: 399,      name: 'las_noches',        border: 'rgba(243, 232, 255, 0.90)', glow: 'rgba(168, 85, 247, 0.75)', particleColors: ['#ffffff', '#e9d5ff', '#a855f7'] },
    { min: 400, max: 799,      name: 'hogyoku_fusion',    border: 'rgba(245, 158, 11, 0.95)', glow: 'rgba(168, 85, 247, 0.85)', particleColors: ['#fbbf24', '#f59e0b', '#c084fc'] },
    { min: 800, max: Infinity, name: 'goryutenmetsu',     border: 'rgba(251, 191, 36, 0.98)', glow: 'rgba(234, 179, 8, 0.92)',   particleColors: ['#ffd700', '#fbbf24', '#ffffff'] }
  ],

  getTier(combo) {
    const tiers = this.comboTiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (combo >= tiers[i].min) return tiers[i];
    }
    return tiers[0];
  },

  // ============================================================
  // drawNoteDetails — High Hadō Hexagonal Seal with Amber Hōgyoku
  // ============================================================
  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    const cx = x + w / 2;
    const cy = yTop + h / 2;
    const violet = '#c084fc';
    const deepViolet = '#7e22ce';
    const platinum = '#f8fafc';
    const amber = '#fbbf24';
    const r = Math.min(w, h) * 0.28;

    ctx.save();
    const isMob = (typeof window !== 'undefined' && (window.innerWidth <= 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1)));

    // 1. Outer Hexagonal Kido Spell Seal
    ctx.strokeStyle = violet;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.65;
    if (!isMob) {
      ctx.shadowColor = violet;
      ctx.shadowBlur = 6;
    }
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = cx + r * 1.15 * Math.cos(angle);
      const hy = cy + r * 1.15 * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();

    // 2. Translucent Obsidian-Spiritual Fill
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = deepViolet;
    ctx.fill();

    // 3. Central Inner Concentric Rune Ring
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = platinum;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Central Amber Hōgyoku Core (Aizen's Sovereign Eye)
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = amber;
    if (!isMob) {
      ctx.shadowColor = amber;
      ctx.shadowBlur = 8;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Quad Spiritual Needle Accents (Arrancar Spear Crest)
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = amber;
    ctx.lineWidth = 1.0;
    const sLen = r * 0.95;
    ctx.beginPath();
    ctx.moveTo(cx - sLen, cy); ctx.lineTo(cx + sLen, cy);
    ctx.moveTo(cx, cy - sLen); ctx.lineTo(cx, cy + sLen);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  // ============================================================
  // drawHitAnimation — Hadō 99 Spatial Rift & 5 Dragon Fang Burst
  // ============================================================
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now) {
    if (p >= 1) return;
    const ease = 1 - (1 - p) * (1 - p); // ease-out quad
    const violet = '#c084fc';
    const deepViolet = '#9333ea';
    const amber = '#fbbf24';
    const platinum = '#ffffff';
    const isMob = (typeof window !== 'undefined' && (window.innerWidth <= 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1)));

    ctx.save();

    // 1. Hexagonal Spatial Shockwave
    const hexR = (w * 0.75) * ease;
    const hexAlpha = Math.max(0, 0.9 - ease * 0.9);
    ctx.globalAlpha = hexAlpha;
    ctx.strokeStyle = isPerfect ? amber : violet;
    ctx.lineWidth = isPerfect ? 3 : 2;
    if (!isMob) {
      ctx.shadowColor = isPerfect ? amber : deepViolet;
      ctx.shadowBlur = isPerfect ? 18 : 10;
    }
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const x = cx + hexR * Math.cos(a);
      const y = cy + hexR * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // 2. Five Goryū Dragon Fangs (72 degrees apart)
    const fangLen = (w * 0.65) * ease;
    const fangAlpha = Math.max(0, 0.85 - ease * 0.85);
    ctx.globalAlpha = fangAlpha;
    ctx.strokeStyle = isPerfect ? platinum : violet;
    ctx.lineWidth = 2.2;
    if (!isMob) {
      ctx.shadowColor = deepViolet;
      ctx.shadowBlur = 12;
    }
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const startR = w * 0.12;
      const sx = cx + Math.cos(angle) * startR;
      const sy = cy + Math.sin(angle) * startR;
      const ex = cx + Math.cos(angle) * (startR + fangLen);
      const ey = cy + Math.sin(angle) * (startR + fangLen);

      // Curved dragon claw arc
      const perp = angle + Math.PI / 2;
      const bend = Math.sin(p * Math.PI) * 12;
      const mx = (sx + ex) * 0.5 + Math.cos(perp) * bend;
      const my = (sy + ey) * 0.5 + Math.sin(perp) * bend;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(mx, my, ex, ey);
      ctx.stroke();
    }

    // 3. Central Reiatsu Singularity Core
    if (p < 0.4) {
      const coreR = (w * 0.22) * (1 - p * 2.5);
      if (coreR > 0) {
        ctx.globalAlpha = Math.max(0, 0.95 - p * 2.4);
        ctx.fillStyle = isPerfect ? '#ffffff' : amber;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  // ============================================================
  // drawParticle — Reiatsu Dragon Embers & Hadō Spell Diamonds
  // Optimized: zero shadowBlur on mobile.
  // ============================================================
  drawParticle(ctx, pt, life) {
    if (!pt.active || life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, life);
    ctx.fillStyle = pt.color;

    if (!pt._mobile) {
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 5;
    }

    const mode = (pt.x | 0) % 3;
    if (mode === 0) {
      // Dragon Reiatsu Diamond
      const sz = 3.8 * life;
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.angle || 0);
      ctx.beginPath();
      ctx.moveTo(0, -sz * 1.3);
      ctx.lineTo(sz * 0.4, 0);
      ctx.lineTo(0, sz * 1.3);
      ctx.lineTo(-sz * 0.4, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (mode === 1) {
      // Golden Amber Ember
      const r = (pt._mobile ? 1.6 : 2.2) * life;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Fast ascending Reiatsu spark
      const h = 5 * life;
      const w = pt._mobile ? 1.5 : 2;
      ctx.fillRect(pt.x - w * 0.5, pt.y - h * 0.5, w, h);
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  // ============================================================
  // updateAndDrawAtmosphere — 5 Goryūtenmetsu Dragons of Reiatsu
  // Zero-Allocation architecture: persistent _atm pool created once.
  // 5 colossal dragons surge from shattered bottom fissures into the heavens.
  // ============================================================
  _atm: null,
  _riftGrad: null,
  _riftW: 0,
  _riftH: 0,
  _riftMobile: false,

  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const W = State.gameWidth;
    const H = State.gameHeight;
    const t = songTime * 0.001;
    const isMobile = State.isMobile;

    // Mobile vs Desktop tuning
    const emberCount = isMobile ? 18 : 45;
    const yStep = isMobile ? 22 : 12; // vertical resolution for dragon spine
    const riftCrackCount = 7;

    // Initialize persistent pools once
    if (!this._atm || this._atm._W !== W || this._atm._H !== H) {
      this._atm = {
        _W: W, _H: H,
        // The 5 Legendary Goryū Dragons of Hadō 99
        dragons: [
          // Dragon 1: Far Left (Winding flanker)
          { baseXMult: 0.10, width: 9,  speed: 0.45, freq: 0.007, amp: 26, phase: 0.0, color: '#7e22ce', spineColor: '#c084fc', headScale: 1.0 },
          // Dragon 2: Mid Left (Aggressive serpent)
          { baseXMult: 0.30, width: 12, speed: 0.58, freq: 0.009, amp: 34, phase: 1.8, color: '#9333ea', spineColor: '#e9d5ff', headScale: 1.15 },
          // Dragon 3: Center (Colossal Imperial Master Dragon)
          { baseXMult: 0.50, width: 17, speed: 0.70, freq: 0.006, amp: 46, phase: 3.4, color: '#a855f7', spineColor: '#ffffff', headScale: 1.45 },
          // Dragon 4: Mid Right (Counter-weaving dragon)
          { baseXMult: 0.70, width: 12, speed: 0.55, freq: 0.008, amp: 32, phase: 4.9, color: '#9333ea', spineColor: '#e9d5ff', headScale: 1.15 },
          // Dragon 5: Far Right (Right guardian flanker)
          { baseXMult: 0.90, width: 9,  speed: 0.48, freq: 0.007, amp: 24, phase: 2.3, color: '#7e22ce', spineColor: '#c084fc', headScale: 1.0 }
        ],
        // Floating Reiatsu Embers drifting upward
        embers: Array.from({ length: emberCount }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          vy: -0.8 - Math.random() * 1.4,
          vx: (Math.random() - 0.5) * 0.4,
          r: 1.0 + Math.random() * 1.8,
          phase: Math.random() * Math.PI * 2,
          isAmber: Math.random() > 0.65
        })),
        // Ground fissures (Reiatsu rifts)
        cracks: Array.from({ length: riftCrackCount }, (_, i) => ({
          x1: W * (0.05 + i * (0.90 / riftCrackCount)),
          x2: W * (0.05 + i * (0.90 / riftCrackCount) + (Math.sin(i) * 0.08)),
          y1: H,
          y2: H - (25 + (i % 3) * 20),
          alpha: 0.4 + (i % 3) * 0.2
        }))
      };
    }
    const atm = this._atm;

    ctx.save();

    // ── 1. Cached Ground Fissure Gradient (Dimensional Rupture at bottom) ──
    if (!this._riftGrad || this._riftW !== W || this._riftH !== H || this._riftMobile !== isMobile) {
      this._riftW = W;
      this._riftH = H;
      this._riftMobile = isMobile;
      const riftH = H * 0.28;
      const grad = ctx.createLinearGradient(0, H, 0, H - riftH);
      grad.addColorStop(0, 'rgba(126, 34, 206, 0.45)');
      grad.addColorStop(0.35, 'rgba(168, 85, 247, 0.18)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this._riftGrad = grad;
    }
    ctx.fillStyle = this._riftGrad;
    ctx.fillRect(0, H - H * 0.28, W, H * 0.28);

    // ── 2. Draw 5 Colossal Swirling Reiatsu Dragons ──
    // Zero-allocation loop: direct calculations on existing objects
    for (let dIdx = 0; dIdx < atm.dragons.length; dIdx++) {
      const d = atm.dragons[dIdx];
      const baseX = W * d.baseXMult;
      const headY = H * 0.06; // Dragon head emerges near top
      const tailY = H;

      // Pulse alpha with spiritual pressure breathing
      const breathe = Math.sin(t * 1.8 + d.phase);
      const dragonAlpha = (dIdx === 2 ? 0.38 : 0.28) + 0.08 * breathe;
      ctx.globalAlpha = dragonAlpha;

      // (A) Dragon Serpent Body (Ribbon Stroke)
      ctx.lineWidth = d.width * (isMobile ? 0.8 : 1.0);
      ctx.strokeStyle = d.color;
      ctx.beginPath();
      let first = true;
      for (let y = tailY; y >= headY; y -= yStep) {
        // Multi-frequency sinusoidal wave for organic serpentine coiling
        const wave = Math.sin(y * d.freq - t * d.speed * 2.5 + d.phase) * d.amp
                   + Math.cos(y * d.freq * 2.1 + t * 1.2) * (d.amp * 0.28);
        const x = baseX + wave;
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // (B) Dorsal Spine Energy Fins (Central luminous spine)
      ctx.lineWidth = isMobile ? 1.5 : 2.2;
      ctx.strokeStyle = d.spineColor;
      ctx.globalAlpha = dragonAlpha * 0.85;
      ctx.beginPath();
      first = true;
      for (let y = tailY; y >= headY; y -= yStep) {
        const wave = Math.sin(y * d.freq - t * d.speed * 2.5 + d.phase) * d.amp
                   + Math.cos(y * d.freq * 2.1 + t * 1.2) * (d.amp * 0.28);
        const x = baseX + wave;
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // (C) Dragon Head Silhouette & Amber Eye at top
      const headWave = Math.sin(headY * d.freq - t * d.speed * 2.5 + d.phase) * d.amp
                     + Math.cos(headY * d.freq * 2.1 + t * 1.2) * (d.amp * 0.28);
      const hx = baseX + headWave;
      const hs = (isMobile ? 8 : 12) * d.headScale;

      ctx.save();
      ctx.translate(hx, headY);
      ctx.globalAlpha = Math.min(1.0, dragonAlpha * 1.6);

      // Dragon Head Jaw / Crown
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.moveTo(0, -hs);              // Horn tip
      ctx.lineTo(hs * 0.5, hs * 0.2);   // Right jaw
      ctx.lineTo(0, hs * 0.8);          // Snout
      ctx.lineTo(-hs * 0.5, hs * 0.2);  // Left jaw
      ctx.closePath();
      ctx.fill();

      // Dragon Amber Eye of Aizen
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, isMobile ? 1.8 : 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // ── 3. Bottom Dimensional Fissure Cracks ──
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#c084fc';
    for (const c of atm.cracks) {
      ctx.globalAlpha = c.alpha * (0.7 + 0.3 * Math.sin(t * 2.5 + c.x1));
      ctx.beginPath();
      ctx.moveTo(c.x1, c.y1);
      ctx.lineTo(c.x2, c.y2);
      ctx.stroke();
    }

    // ── 4. Ascending Spiritual Pressure Embers (Zero allocation update & batch render) ──
    // Violet Embers Batch
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    for (let i = 0; i < atm.embers.length; i++) {
      const eb = atm.embers[i];
      if (eb.isAmber) continue;
      eb.y += eb.vy * warpMult;
      eb.x += eb.vx + 0.25 * Math.sin(t * 1.5 + eb.phase);
      if (eb.y < -10) {
        eb.y = H + 10;
        eb.x = Math.random() * W;
      }
      ctx.moveTo(eb.x + eb.r, eb.y);
      ctx.arc(eb.x, eb.y, eb.r, 0, Math.PI * 2);
    }
    ctx.globalAlpha = 0.45;
    ctx.fill();

    // Amber Embers Batch (Hōgyoku sparks)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    for (let i = 0; i < atm.embers.length; i++) {
      const eb = atm.embers[i];
      if (!eb.isAmber) continue;
      eb.y += eb.vy * 1.15 * warpMult;
      eb.x += eb.vx + 0.25 * Math.cos(t * 1.5 + eb.phase);
      if (eb.y < -10) {
        eb.y = H + 10;
        eb.x = Math.random() * W;
      }
      ctx.moveTo(eb.x + eb.r, eb.y);
      ctx.arc(eb.x, eb.y, eb.r, 0, Math.PI * 2);
    }
    ctx.globalAlpha = 0.65;
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.restore();
  }
};
