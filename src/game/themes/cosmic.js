// ==========================================
// COSMIC GALAXY THEME MODULE (Deep Space Nebula & Planetary Orbits)
// ==========================================

export const COSMIC_THEME = {
  id: 'cosmic',
  nameKey: 'themeCosmic',
  descKey: 'themeCosmicDesc',
  badgeKey: 'themeCosmicBadge',
  price: 20,
  unlockedByDefault: false,
  accentColor: '#818cf8',
  previewBg: 'linear-gradient(135deg, #07192f, #1e1b4b, #312e81)',
  colors: {
    bgCenter: '#0d2242',
    bgMid: '#09152b',
    bgOuter: '#020712',
    bgAura: 'rgba(99, 102, 241, 0.18)',
    strings: ['#e0e7ff', '#a5b4fc', '#818cf8', '#6366f1'],
    stringGlow: 'rgba(99, 102, 241, 0.5)',
    receptorBorder: 'rgba(99, 102, 241, 0.5)',
    particleType: 'starburst'
  },
  comboTiers: [
    { min: 0, max: 49, name: 'deep_nebula', border: 'rgba(99, 102, 241, 0.55)', glow: 'rgba(79, 70, 229, 0.4)', particleColors: ['#818cf8', '#a5b4fc', '#e0e7ff'] },
    { min: 50, max: 99, name: 'andromeda_blue', border: 'rgba(56, 189, 248, 0.75)', glow: 'rgba(14, 165, 233, 0.6)', particleColors: ['#38bdf8', '#7dd3fc', '#ffffff'] },
    { min: 100, max: 199, name: 'solar_flare', border: 'rgba(245, 158, 11, 0.85)', glow: 'rgba(217, 119, 6, 0.7)', particleColors: ['#f59e0b', '#fde047', '#ffffff'] },
    { min: 200, max: 399, name: 'supernova_pink', border: 'rgba(236, 72, 153, 0.9)', glow: 'rgba(190, 24, 93, 0.75)', particleColors: ['#ec4899', '#fbcfe8', '#ffffff'] },
    { min: 400, max: 799, name: 'hyper_cosmic', border: 'rgba(99, 102, 241, 0.95)', glow: 'rgba(67, 56, 202, 0.85)', particleColors: ['#6366f1', '#c7d2fe', '#ffffff'] },
    { min: 800, max: Infinity, name: 'singularity_stardust', border: 'rgba(34, 211, 238, 0.95)', glow: 'rgba(99, 102, 241, 0.9)', particleColors: ['#22d3ee', '#818cf8', '#ffffff'] }
  ],

  getTier(combo) {
    const tiers = this.comboTiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (combo >= tiers[i].min) return tiers[i];
    }
    return tiers[0];
  },

  /**
   * Custom note decoration for Cosmic theme:
   * Celestial astral orb with pulsing orbit rings and planetary starlight core.
   */
  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    ctx.save();
    const cx = x + w / 2;
    const cy = yTop + h / 2;

    // Outer elliptical orbit ring
    ctx.strokeStyle = isLight ? 'rgba(79, 70, 229, 0.7)' : (comboTier?.border || '#a5b4fc');
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.max(14, w * 0.36), Math.max(5, h * 0.32), -0.25, 0, Math.PI * 2);
    ctx.stroke();

    // Central astral starlight orb
    const orbGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, 5);
    orbGrad.addColorStop(0, '#ffffff');
    orbGrad.addColorStop(0.5, isLight ? '#6366f1' : '#818cf8');
    orbGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();

    // Small orbiting satellite node
    const orbitAngle = Date.now() * 0.003;
    const satX = cx + Math.cos(orbitAngle) * (w * 0.34);
    const satY = cy + Math.sin(orbitAngle) * (h * 0.28);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(satX, satY, 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  /**
   * Custom receptor for Cosmic theme:
   * Planetary orbital ring receptor with satellite nodes.
   */
  drawReceptor(ctx, x, y, w, h, isActive, isLight) {
    ctx.save();
    const radius = 10;
    const col = isActive 
      ? (isLight ? '#4f46e5' : '#818cf8') 
      : (isLight ? 'rgba(79, 70, 229, 0.35)' : 'rgba(99, 102, 241, 0.3)');

    ctx.strokeStyle = col;
    ctx.lineWidth = isActive ? 2.2 : 1.2;
    const isMob = (typeof window !== 'undefined' && (window.innerWidth <= 768 || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1)));
    if (isActive && !isLight && !isMob) {
      ctx.shadowColor = '#6366f1';
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

    // Orbit ring satellite dots on left & right edge
    ctx.fillStyle = isActive ? '#ffffff' : col;
    ctx.beginPath();
    ctx.arc(x + 4, y + h / 2, 2.2, 0, Math.PI * 2);
    ctx.arc(x + w - 4, y + h / 2, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  },

  /**
   * Unique Note Tap Hit Animation for Cosmic Theme:
   * Supernova Planetary Singularity:
   * Miniature starlight singularity core that bursts into twin tilted 3D elliptical
   * planetary rings with rotating 4-pointed celestial starburst spikes and orbital stardust.
   */
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now) {
    const easeOut = 1 - Math.pow(1 - p, 3);
    const alpha = Math.max(0, 1.0 - Math.pow(p, 1.3));
    if (alpha <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const colIndigo = isPerfect ? 'rgba(129, 140, 248,' : 'rgba(99, 102, 241,';
    const colCyan = isPerfect ? 'rgba(56, 189, 248,' : 'rgba(14, 165, 233,';
    const colWhite = isPerfect ? 'rgba(255, 255, 255,' : 'rgba(224, 231, 255,';

    // 1. Twin Tilted Planetary Orbit Rings (expanding in 3D perspective)
    const ringMajor = (w * 0.22) + easeOut * (w * 0.46);
    const ringMinor = ringMajor * 0.42;
    const ringTilt1 = -0.32;
    const ringTilt2 = 0.38;

    ctx.lineWidth = Math.max(1, 2.2 * (1.0 - p));
    ctx.strokeStyle = `${colIndigo} ${alpha * 0.85})`;

    // Primary planetary ring
    ctx.beginPath();
    ctx.ellipse(cx, cy, ringMajor, ringMinor, ringTilt1, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary equatorial ring
    if (p < 0.8) {
      const ring2Alpha = (1.0 - p / 0.8) * 0.65;
      ctx.lineWidth = Math.max(0.8, 1.5 * (1.0 - p));
      ctx.strokeStyle = `${colCyan} ${ring2Alpha})`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, ringMajor * 0.82, ringMinor * 0.9, ringTilt2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Rotating 4-Point Celestial Starburst Lens Flare
    if (p < 0.65) {
      const starP = p / 0.65;
      const rayLen = (w * 0.25) + Math.pow(starP, 0.6) * (w * 0.38);
      const starAlpha = (1.0 - starP) * 0.9;
      const starRot = (now * 0.002) + starP * 0.5;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(starRot);

      // 4-pointed radiant flare spikes
      ctx.lineWidth = Math.max(0.8, 2.5 * (1.0 - starP));
      ctx.strokeStyle = `${colWhite} ${starAlpha})`;
      ctx.beginPath();
      ctx.moveTo(-rayLen, 0); ctx.lineTo(rayLen, 0);
      ctx.moveTo(0, -rayLen); ctx.lineTo(0, rayLen);
      ctx.stroke();

      // Soft diagonal secondary rays
      ctx.lineWidth = Math.max(0.6, 1.2 * (1.0 - starP));
      ctx.strokeStyle = `${colCyan} ${starAlpha * 0.6})`;
      const diagLen = rayLen * 0.55;
      ctx.beginPath();
      ctx.moveTo(-diagLen, -diagLen); ctx.lineTo(diagLen, diagLen);
      ctx.moveTo(-diagLen, diagLen); ctx.lineTo(diagLen, -diagLen);
      ctx.stroke();

      ctx.restore();
    }

    // 3. Orbiting Planetary Nodes (Stardust nodes along the orbit)
    if (p < 0.6) {
      const nodeAlpha = (1.0 - p / 0.6);
      const nodeAng1 = (now * 0.004);
      const nodeAng2 = nodeAng1 + Math.PI;

      const cos1 = Math.cos(nodeAng1); const sin1 = Math.sin(nodeAng1);
      const nx1 = cx + (cos1 * ringMajor * Math.cos(ringTilt1) - sin1 * ringMinor * Math.sin(ringTilt1));
      const ny1 = cy + (cos1 * ringMajor * Math.sin(ringTilt1) + sin1 * ringMinor * Math.cos(ringTilt1));

      const cos2 = Math.cos(nodeAng2); const sin2 = Math.sin(nodeAng2);
      const nx2 = cx + (cos2 * ringMajor * Math.cos(ringTilt1) - sin2 * ringMinor * Math.sin(ringTilt1));
      const ny2 = cy + (cos2 * ringMajor * Math.sin(ringTilt1) + sin2 * ringMinor * Math.cos(ringTilt1));

      ctx.fillStyle = `${colWhite} ${nodeAlpha})`;
      ctx.beginPath();
      ctx.arc(nx1, ny1, 2.2, 0, Math.PI * 2);
      ctx.arc(nx2, ny2, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Central Singularity Core
    if (p < 0.4) {
      const coreR = Math.max(2, 7 * (1.0 - p / 0.4));
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  /**
   * Unique Atmosphere for Cosmic Theme:
   * Deep Interstellar Void & Constellations:
   * Absolutely NO falling elements!
   * Multi-layered parallax starfield with twinkling stars drifting in space
   * + 7 celestial star nodes connected by delicate glowing constellation lines forming an astral glyph.
   */
  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const gw = State.gameWidth || 400;
    const gh = State.gameHeight || 700;
    const isLight = document.body.getAttribute('data-theme') === 'light';

    // Initialize cosmic constellation & drifting stars
    if (!State.themeCosmicStars || State.currentAtmosphereTheme !== 'cosmic') {
      State.currentAtmosphereTheme = 'cosmic';
      State.themeCosmicStars = [];

      // 1. Drifting deep space starfield (omnidirectional slow drift, twinkling)
      for (let i = 0; i < 30; i++) {
        State.themeCosmicStars.push({
          x: Math.random() * gw,
          y: Math.random() * gh,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          size: Math.random() * 2.2 + 1.0,
          twinkleSpeed: Math.random() * 0.004 + 0.002,
          twinklePhase: Math.random() * Math.PI * 2,
          baseAlpha: Math.random() * 0.4 + 0.25
        });
      }

      // 2. Astral Constellation Nodes (7 stars connected by lines in background)
      State.themeConstellation = [
        { nx: 0.25, ny: 0.25, conn: [1, 2] },
        { nx: 0.45, ny: 0.18, conn: [2, 3] },
        { nx: 0.38, ny: 0.38, conn: [4] },
        { nx: 0.72, ny: 0.22, conn: [5] },
        { nx: 0.55, ny: 0.50, conn: [5, 6] },
        { nx: 0.80, ny: 0.42, conn: [6] },
        { nx: 0.65, ny: 0.65, conn: [] }
      ];
    }

    ctx.save();

    // 1. Shimmering Astral Constellation (Lines & Star Nodes)
    const constel = State.themeConstellation;
    const rotSpeed = songTime * 0.0002;
    const ccx = gw * 0.52;
    const ccy = gh * 0.36;
    const cRadius = Math.min(gw, gh) * 0.42;

    if (!State._computedNodes || State._computedNodes.length !== constel.length) {
      State._computedNodes = constel.map(node => ({ x: 0, y: 0, conn: node.conn }));
    }
    const computedNodes = State._computedNodes;
    const cosR = Math.cos(rotSpeed);
    const sinR = Math.sin(rotSpeed);
    for (let i = 0; i < constel.length; i++) {
      const node = constel[i];
      const dx = (node.nx - 0.5) * cRadius;
      const dy = (node.ny - 0.35) * cRadius;
      computedNodes[i].x = ccx + (dx * cosR - dy * sinR);
      computedNodes[i].y = ccy + (dx * sinR + dy * cosR);
      computedNodes[i].conn = node.conn;
    }

    const constelAlpha = isLight ? 0.12 : 0.18;
    ctx.strokeStyle = isLight ? `rgba(79, 70, 229, ${constelAlpha})` : `rgba(129, 140, 248, ${constelAlpha})`;
    ctx.lineWidth = 1;

    // Draw constellation connecting lines
    ctx.beginPath();
    for (let i = 0; i < computedNodes.length; i++) {
      const src = computedNodes[i];
      for (const targetIdx of src.conn) {
        if (targetIdx < computedNodes.length) {
          const dst = computedNodes[targetIdx];
          ctx.moveTo(src.x, src.y);
          ctx.lineTo(dst.x, dst.y);
        }
      }
    }
    ctx.stroke();

    // Draw constellation star nodes
    for (let i = 0; i < computedNodes.length; i++) {
      const node = computedNodes[i];
      const twinkle = Math.sin(songTime * 0.003 + i) * 0.3 + 0.7;
      ctx.fillStyle = isLight ? '#4f46e5' : '#e0e7ff';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2.2 * twinkle, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Multi-Depth Parallax Stars (drifting gently omnidirectionally, NO falling)
    const stars = State.themeCosmicStars;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.x += s.vx * warpMult * speedBoost;
      s.y += s.vy * warpMult * speedBoost;

      // Wrap around screen bounds
      if (s.x < 0) s.x = gw;
      if (s.x > gw) s.x = 0;
      if (s.y < 0) s.y = gh;
      if (s.y > gh) s.y = 0;

      const twinkle = Math.sin(songTime * s.twinkleSpeed + s.twinklePhase) * 0.35 + 0.65;
      const alpha = s.baseAlpha * twinkle;

      ctx.fillStyle = isLight ? `rgba(79, 70, 229, ${alpha})` : `rgba(224, 231, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  /**
   * Custom Particle renderer for Cosmic Theme:
   * 4-pointed radiant starburst crystals and glowing stardust orbs.
   */
  drawParticle(ctx, pt, life) {
    const rOuter = Math.max(2, (pt.size || 5) * life + 1);
    const rInner = rOuter * 0.3;
    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.beginPath();
    for (let a = 0; a < 4; a++) {
      const ang = pt.angle + (a * Math.PI / 2);
      const angMid = ang + Math.PI / 4;
      ctx.lineTo(Math.cos(ang) * rOuter, Math.sin(ang) * rOuter);
      ctx.lineTo(Math.cos(angMid) * rInner, Math.sin(angMid) * rInner);
    }
    ctx.closePath();
    ctx.fill();

    // Center star twinkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.6, rOuter * 0.22), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};
