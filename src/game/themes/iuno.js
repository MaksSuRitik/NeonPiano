// ==========================================
// IUNO THEME MODULE — Lunar Oracle (Wuthering Waves · 5★ Aero Resonator)
// High Priestess of Tetragon Temple in Septimont
// Aesthetic: antique white & divine gold, midnight-blue field,
//            lunar-azure twin-tails, crescent moon motifs, Aero wind currents
// ==========================================

export const IUNO_THEME = {
  id: 'iuno',
  nameKey: 'themeIuno',
  descKey: 'themeIunoDesc',
  badgeKey: 'themeIunoBadge',
  price: 12,
  unlockedByDefault: false,
  accentColor: '#fbbf24',
  previewBg: 'linear-gradient(135deg, #0b132b, #1a2a4a, #0f2040)',
  colors: {
    bgCenter: '#0b132b',
    bgMid: '#081020',
    bgOuter: '#030810',
    bgAura: 'rgba(56, 189, 248, 0.15)',
    strings: ['#e0f2fe', '#7dd3fc', '#38bdf8', '#2dd4bf'],
    stringGlow: 'rgba(56, 189, 248, 0.55)',
    receptorBorder: 'rgba(251, 191, 36, 0.65)',
    particleType: 'lunar'
  },
  comboTiers: [
    { min: 0,   max: 49,       name: 'oracle_whisper',  border: 'rgba(251, 191, 36, 0.50)', glow: 'rgba(56, 189, 248, 0.30)', particleColors: ['#7dd3fc', '#e0f2fe', '#fbbf24'] },
    { min: 50,  max: 99,       name: 'crescent_song',   border: 'rgba(56, 189, 248, 0.65)',  glow: 'rgba(251, 191, 36, 0.40)', particleColors: ['#38bdf8', '#fbbf24', '#fff1f2'] },
    { min: 100, max: 199,      name: 'temple_wind',     border: 'rgba(45, 212, 191, 0.75)',  glow: 'rgba(56, 189, 248, 0.55)', particleColors: ['#2dd4bf', '#7dd3fc', '#fde68a'] },
    { min: 200, max: 399,      name: 'lunar_veil',      border: 'rgba(251, 191, 36, 0.85)',  glow: 'rgba(45, 212, 191, 0.65)', particleColors: ['#fbbf24', '#2dd4bf', '#ffffff'] },
    { min: 400, max: 799,      name: 'aero_resonance',  border: 'rgba(56, 189, 248, 0.95)',  glow: 'rgba(251, 191, 36, 0.80)', particleColors: ['#38bdf8', '#fbbf24', '#e0f2fe'] },
    { min: 800, max: Infinity, name: 'eclipse_divinity', border: 'rgba(255, 215, 0, 0.97)',  glow: 'rgba(56, 189, 248, 0.95)', particleColors: ['#ffd700', '#38bdf8', '#ffffff'] }
  ],

  getTier(combo) {
    const tiers = this.comboTiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (combo >= tiers[i].min) return tiers[i];
    }
    return tiers[0];
  },

  // ============================================================
  // drawNoteDetails — antique gold filigree with crescent moon
  // ============================================================
  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    const cx = x + w / 2;
    const cy = yTop + h / 2;
    const gold = '#fbbf24';
    const azure = '#38bdf8';
    const r = Math.min(w, h) * 0.26;

    ctx.save();

    const isMob = (typeof window !== 'undefined' && (window.innerWidth <= 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1)));

    // Top & bottom gold filigree lines (antique border)
    ctx.strokeStyle = gold;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(x + 6, yTop + 4);
    ctx.lineTo(x + w - 6, yTop + 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 6, yTop + h - 4);
    ctx.lineTo(x + w - 6, yTop + h - 4);
    ctx.stroke();

    // Crescent moon center jewel — azure glow fill
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = azure;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Crescent outer arc
    ctx.globalAlpha = 0.80;
    ctx.strokeStyle = gold;
    ctx.lineWidth = 1.5;
    if (!isMob) {
      ctx.shadowColor = gold;
      ctx.shadowBlur = 8;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();

    // Inner crescent cut arc
    ctx.beginPath();
    ctx.arc(cx + r * 0.45, cy, r * 0.72, Math.PI * 0.55, -Math.PI * 0.55, true);
    ctx.stroke();

    // Small star dots at crescent tips
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#fde68a';
    if (!isMob) {
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 5;
    }
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.98, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.98, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  // ============================================================
  // drawHitAnimation — Lunar Eclipse Resonance Burst
  // ============================================================
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now) {
    if (p >= 1) return;
    const ease = 1 - (1 - p) * (1 - p); // ease-out quad
    const gold = '#fbbf24';
    const azure = '#38bdf8';
    const teal = '#2dd4bf';
    const isMob = (typeof window !== 'undefined' && (window.innerWidth <= 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1)));

    ctx.save();

    // 1. Expanding eclipse halo ring
    const haloR = (w * 0.7) * ease;
    const haloAlpha = Math.max(0, 0.85 - ease * 0.85);
    ctx.globalAlpha = haloAlpha;
    ctx.strokeStyle = isPerfect ? gold : azure;
    ctx.lineWidth = isPerfect ? 3 : 2;
    if (!isMob) {
      ctx.shadowColor = isPerfect ? gold : azure;
      ctx.shadowBlur = isPerfect ? 18 : 10;
    }
    ctx.beginPath();
    ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary Aero ring
    if (p < 0.7) {
      const ring2R = haloR * 0.6;
      ctx.globalAlpha = haloAlpha * 0.6;
      ctx.strokeStyle = teal;
      ctx.lineWidth = 1.5;
      if (!isMob) {
        ctx.shadowColor = teal;
        ctx.shadowBlur = 8;
      }
      ctx.beginPath();
      ctx.arc(cx, cy, ring2R, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Crescent moon burst
    if (p < 0.55) {
      const crescentScale = 1.0 - p * 1.8;
      const cr = w * 0.22 * Math.max(0, crescentScale);
      if (cr > 2) {
        ctx.globalAlpha = Math.max(0, 0.9 - p * 1.6);
        ctx.strokeStyle = gold;
        ctx.lineWidth = 2.5;
        if (!isMob) {
          ctx.shadowColor = gold;
          ctx.shadowBlur = 14;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, cr, -Math.PI * 0.7, Math.PI * 0.7);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx + cr * 0.45, cy, cr * 0.7, Math.PI * 0.55, -Math.PI * 0.55, true);
        ctx.stroke();
      }
    }

    // 3. Winged laurel wreath arcs (expanding)
    const arcSpread = (w * 0.9) * ease;
    const arcAlpha = Math.max(0, 0.75 - ease * 0.75);
    ctx.globalAlpha = arcAlpha;
    ctx.strokeStyle = gold;
    ctx.lineWidth = 1.8;
    if (!isMob) {
      ctx.shadowColor = gold;
      ctx.shadowBlur = 10;
    }
    ctx.beginPath();
    ctx.arc(cx - arcSpread * 0.5, cy, arcSpread * 0.4, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + arcSpread * 0.5, cy, arcSpread * 0.4, -Math.PI * 0.9, -Math.PI * 0.1);
    ctx.stroke();

    // 4. Aero diagonal wind rays (perfect only)
    if (isPerfect && p < 0.6) {
      const rayLen = (w * 0.55) * ease;
      const rayAlpha = Math.max(0, 0.8 - ease);
      ctx.globalAlpha = rayAlpha;
      ctx.strokeStyle = azure;
      ctx.lineWidth = 1.5;
      if (!isMob) {
        ctx.shadowColor = azure;
        ctx.shadowBlur = 8;
      }
      const angles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
      for (const a of angles) {
        const startR = w * 0.15;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * startR, cy + Math.sin(a) * startR);
        ctx.lineTo(cx + Math.cos(a) * (startR + rayLen), cy + Math.sin(a) * (startR + rayLen));
        ctx.stroke();
      }
    }

    // 5. Central flash (white-gold radial burst)
    if (p < 0.35) {
      const flashR = (w * 0.18) * (1 - p * 2.8);
      if (flashR > 0) {
        const flashAlpha = Math.max(0, 0.9 - p * 2.5);
        ctx.globalAlpha = flashAlpha;
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, flashR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  // ============================================================
  // drawParticle — lunar sparkles: golden diamonds & azure wind wisps
  // Optimized: no shadowBlur on mobile to save GPU fill-rate budget.
  // ============================================================
  drawParticle(ctx, pt, life) {
    if (!pt.active || life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, life);
    ctx.fillStyle = pt.color;
    // shadowBlur only on desktop — very expensive on mobile GPU
    if (!pt._mobile) {
      ctx.shadowColor = pt.color;
      ctx.shadowBlur = 4;
    }

    if ((pt.x | 0) % 3 < 2) {
      // 4-point diamond sparkle
      const size = 3.5 * life;
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.angle || 0);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.35, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.35, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-size * 1.2, -0.8, size * 2.4, 1.6);
      ctx.fillRect(-0.8, -size * 1.2, 1.6, size * 2.4);
      ctx.restore();
    } else {
      // Azure wind wisp — simple rect on mobile instead of scale+arc
      if (pt._mobile) {
        const s = 2 * life;
        ctx.fillRect(pt.x - s * 2, pt.y - s * 0.4, s * 4, s * 0.8);
      } else {
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.angle || 0);
        ctx.scale(1, 0.35);
        ctx.beginPath();
        ctx.arc(0, 0, 3 * life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  },

  // ============================================================
  // updateAndDrawAtmosphere — Aero wind currents + lunar eclipse halo
  // Mobile-adaptive: all expensive ops (shadowBlur, ellipse, radial gradient)
  // are skipped or simplified on mobile to stay within 60fps budget.
  // Zero-allocation: persistent _atm pool initialised once.
  // ============================================================
  _atm: null,
  _frameCount: 0,

  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const W = State.gameWidth;
    const H = State.gameHeight;
    const t = songTime * 0.001;
    const isMobile = State.isMobile;
    this._frameCount = (this._frameCount + 1) | 0;

    // Count for mobile: fewer elements, larger step sizes
    const streamCount  = isMobile ? 5  : 8;
    const leafCount    = isMobile ? 8  : 18;
    const moteCount    = isMobile ? 15 : 40;
    const streamStep   = isMobile ? 14 : 6;   // px between wave points
    const ribbonCount  = isMobile ? 0  : 5;   // skip ribbons on mobile

    // Initialise persistent atmosphere pool exactly once (or on resize)
    if (!this._atm || this._atm._W !== W || this._atm._H !== H) {
      this._atm = {
        _W: W, _H: H,
        streams: Array.from({ length: streamCount }, (_, i) => ({
          y: H * (0.06 + i * (0.85 / streamCount)),
          speed: 0.28 + (i % 3) * 0.14,
          amp: 9 + (i % 4) * 6,
          phase: i * 1.1,
          alpha: 0.04 + (i % 4) * 0.018
        })),
        leaves: Array.from({ length: leafCount }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.12 - Math.random() * 0.22,
          rot: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.022,
          size: 3 + Math.random() * 4,
          alpha: 0.3 + Math.random() * 0.38,
          phase: Math.random() * Math.PI * 2
        })),
        ribbons: ribbonCount > 0 ? Array.from({ length: ribbonCount }, (_, i) => ({
          x: W * (0.1 + i * 0.2),
          baseY: H * (0.2 + i * 0.15),
          phase: i * 1.3,
          speed: 0.18 + i * 0.06,
          alpha: 0.06 + i * 0.01
        })) : [],
        motes: Array.from({ length: moteCount }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.8 + Math.random() * 1.4,
          phase: Math.random() * Math.PI * 2,
          alpha: 0.2 + Math.random() * 0.45,
          isGold: Math.random() > 0.5
        }))
      };
    }
    const atm = this._atm;

    ctx.save();

    // ── 1. Lunar eclipse top halo — кешуємо градієнт один раз для усунення важких алокацій ──
    const lunaAlpha = 0.09 + 0.03 * Math.sin(t * 0.7);
    if (!this._lunaGrad || this._lunaW !== W || this._lunaH !== H || this._lunaIsMobile !== isMobile) {
      this._lunaW = W;
      this._lunaH = H;
      this._lunaIsMobile = isMobile;
      if (isMobile) {
        const linGrad = ctx.createLinearGradient(0, 0, 0, H * 0.36);
        linGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
        linGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this._lunaGrad = linGrad;
      } else {
        const lunaGrad = ctx.createRadialGradient(W * 0.5, H * 0.10, 0, W * 0.5, H * 0.10, W * 0.38);
        lunaGrad.addColorStop(0, 'rgba(56, 189, 248, 1.0)');
        lunaGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.35)');
        lunaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this._lunaGrad = lunaGrad;
      }
    }
    ctx.globalAlpha = lunaAlpha;
    ctx.fillStyle = this._lunaGrad;
    ctx.fillRect(0, 0, W, isMobile ? H * 0.36 : H * 0.5);

    // ── 2. Aero wind stream ribbons — lightweight paths, zero shadowBlur ──
    ctx.lineWidth = 1.4;
    ctx.shadowBlur = 0;
    for (const s of atm.streams) {
      ctx.globalAlpha = s.alpha * (1 + 0.3 * Math.sin(t * 0.9 + s.phase));
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      let first = true;
      for (let px = 0; px <= W; px += streamStep) {
        const waveY = s.y + Math.sin((px / W * 4 + t * s.speed + s.phase) * Math.PI) * s.amp;
        if (first) { ctx.moveTo(px, waveY); first = false; }
        else ctx.lineTo(px, waveY);
      }
      ctx.stroke();
    }

    // ── 3. Silk ribbon strands — desktop only ──
    if (!isMobile) {
      ctx.lineWidth = 1.0;
      for (const rb of atm.ribbons) {
        const dy = Math.sin(t * rb.speed + rb.phase) * H * 0.06;
        ctx.globalAlpha = rb.alpha;
        ctx.strokeStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.moveTo(rb.x - W * 0.12, rb.baseY + dy - 15);
        ctx.quadraticCurveTo(
          rb.x, rb.baseY + dy + Math.sin(t * 0.6 + rb.phase) * 30,
          rb.x + W * 0.12, rb.baseY + dy + 15
        );
        ctx.stroke();
      }
    }

    // ── 4. Floating laurel leaf motes ──
    for (const lf of atm.leaves) {
      lf.x += lf.vx + 0.15 * Math.sin(t * 0.5 + lf.phase);
      lf.y += lf.vy;
      lf.rot += lf.spin;
      if (lf.y < -20) { lf.y = H + 10; lf.x = Math.random() * W; }
      if (lf.x < -10) lf.x = W + 10;
      if (lf.x > W + 10) lf.x = -10;

      const leafAlpha = lf.alpha * Math.abs(Math.sin(t * 0.4 + lf.phase));
      if (leafAlpha < 0.04) continue;

      ctx.globalAlpha = leafAlpha;
      if (isMobile) {
        ctx.fillStyle = '#fbbf24';
        const s = lf.size * 0.6;
        ctx.fillRect(lf.x - s * 0.5, lf.y - s, s, s * 2);
      } else {
        ctx.save();
        ctx.translate(lf.x, lf.y);
        ctx.rotate(lf.rot);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.ellipse(0, 0, lf.size * 0.5, lf.size, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -lf.size);
        ctx.lineTo(0, lf.size);
        ctx.stroke();
        ctx.restore();
      }
    }

    // ── 5. Star mote glimmer — пакетне малювання (batching) золотих та блакитних зірок ──
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    for (const m of atm.motes) {
      if (!m.isGold) continue;
      const a = m.alpha * (0.5 + 0.5 * Math.sin(t * 1.2 + m.phase));
      if (a < 0.05) continue;
      ctx.moveTo(m.x + m.r, m.y);
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.fillStyle = '#7dd3fc';
    ctx.beginPath();
    for (const m of atm.motes) {
      if (m.isGold) continue;
      const a = m.alpha * (0.5 + 0.5 * Math.sin(t * 1.2 + m.phase));
      if (a < 0.05) continue;
      ctx.moveTo(m.x + m.r, m.y);
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.restore();
  }
};
