// ============================================================================
// SANHUA (散华) THEME — VISUAL REBUILD
// High-Budget Cinematic Donghua / Wuthering Waves Glacio Aesthetic:
// 1. Enormous Spectral Crystalline Tree with Faceted 3D Ice Prisms & Micro-Fractures
// 2. Giant Cinematic Celestial Moon & Volumetric Overexposed Light Bloom
// 3. Shattered Mirror World with Large Floating 3D Glass Plates across 3 Parallax Layers
// 4. One Elegant Sweeping Crimson Donghua Energy Ribbon
// 5. T5 Blood Eclipse (800+ Combo) Smooth Transformation
// 6. Fractured-Glass Tap Notes (Pseudo-Voronoi Shards strictly within [w, h])
// 7. Celestial Ice Comet Hold Notes ending in a True Crescent Moon Negative-Space Cutout
// 8. 3-Tier Cinematic Particle System (Micro Snow, Crystal Splinters, Mirror Slabs)
// ============================================================================

import { pixiRenderer } from "../render/PixiRenderer.js";
import { pixiParticleSystem } from "../render/PixiParticleSystem.js";

// ----------------------------------------------------------------------------
// DETERMINISTIC SEEDED PSEUDO-RANDOM NUMBER GENERATOR (Mulberry32)
// ----------------------------------------------------------------------------
function mulberry32(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ----------------------------------------------------------------------------
// GEOMETRY & ENVIRONMENT CACHE
// ----------------------------------------------------------------------------
let _cachedGw = 0;
let _cachedGh = 0;
let _treeSegments = null;
let _treeCanvasNormal = null;
let _treeCanvasT5 = null;
let _moonCanvasNormal = null;
let _moonCanvasT5 = null;
let _bloomCanvasNormal = null;
let _bloomCanvasT5 = null;

// Parallax Glass Plates & Particles
let _glassPlates = null;
let _envParticles = null;

// ----------------------------------------------------------------------------
// FRACTAL CRYSTALLINE SPECTRAL TREE TOPOLOGY GENERATOR (Section 3)
// ----------------------------------------------------------------------------
function generateSpectralTree(gw, gh) {
  const rng = mulberry32(0x8F31C5);
  const segments = [];

  const rootX = gw * 0.58;
  const rootY = gh * 1.01;
  const initLength = gh * 0.23;
  const initWidth = Math.max(16, Math.min(30, gw * 0.046));

  function branch(x, y, angle, length, width, depth, bend) {
    if (depth > 7 || width < 1.0 || length < 4) return;

    const effAngle = angle + bend;
    const x2 = x + Math.cos(effAngle) * length;
    const y2 = y + Math.sin(effAngle) * length;
    const w2 = Math.max(1.2, width * (0.60 + rng() * 0.14));

    // Broken dead-end branches (occasional jagged stump)
    const isBroken = (depth >= 4 && rng() < 0.16);

    // Micro-fractures inside major branch prisms
    const fractures = [];
    if (depth <= 4 && width > 4.5) {
      const numFrac = 1 + Math.floor(rng() * 3);
      for (let f = 0; f < numFrac; f++) {
        const tFrac = 0.2 + rng() * 0.6;
        const fx = x + (x2 - x) * tFrac;
        const fy = y + (y2 - y) * tFrac;
        const fAng = effAngle + (rng() > 0.5 ? 1 : -1) * (0.45 + rng() * 0.55);
        const fLen = width * (0.4 + rng() * 0.7);
        fractures.push({
          x1: fx,
          y1: fy,
          x2: fx + Math.cos(fAng) * fLen,
          y2: fy + Math.sin(fAng) * fLen
        });
      }
    }

    segments.push({
      x1: x, y1: y,
      x2: x2, y2: y2,
      w1: width,
      w2: isBroken ? width * 0.8 : w2,
      depth,
      isBroken,
      fractures
    });

    if (isBroken) return;

    // 2-4 children for major boughs, 2 for higher depths
    let numChildren = 2;
    if (depth <= 2) {
      numChildren = rng() > 0.35 ? 3 : 2;
    } else if (depth === 3 && rng() > 0.65) {
      numChildren = 3;
    }

    const baseSpread = 0.36 + rng() * 0.22;
    for (let c = 0; c < numChildren; c++) {
      let childAngle;
      const childLenMult = 0.68 + rng() * 0.24;
      const childWidthMult = 0.64 + rng() * 0.14;
      const childBend = (rng() - 0.5) * 0.16;

      if (numChildren === 2) {
        const side = (c === 0 ? -1 : 1);
        const spread = baseSpread * (c === 0 ? (0.8 + rng() * 0.4) : (0.9 + rng() * 0.4));
        childAngle = effAngle + side * spread;
        if (childAngle > -0.2) childAngle = -0.2 - rng() * 0.18;
        if (childAngle < -Math.PI + 0.2) childAngle = -Math.PI + 0.2 + rng() * 0.18;
      } else {
        const spread = (c === 1) ? (rng() - 0.5) * 0.18 : (c === 0 ? -baseSpread : baseSpread);
        childAngle = effAngle + spread;
      }

      // Wide crown horizontal antler spread
      if (depth === 2 && c === 0) childAngle -= 0.24;
      else if (depth === 2 && c === numChildren - 1) childAngle += 0.24;

      branch(x2, y2, childAngle, length * childLenMult, width * childWidthMult, depth + 1, childBend);
    }
  }

  branch(rootX, rootY, -Math.PI * 0.54, initLength, initWidth, 0, -0.04);
  return segments;
}

// ----------------------------------------------------------------------------
// FACETED 3D ICE PRISM RENDERING (Section 4 & 5)
// ----------------------------------------------------------------------------
function renderTreePrismsToCanvas(canvas, segments, isT5) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const colShadow = isT5 ? 'rgba(2, 2, 5, 0.95)' : 'rgba(15, 32, 62, 0.45)';
  const colDeepIce = isT5 ? 'rgba(9, 8, 13, 0.90)' : 'rgba(70, 120, 170, 0.38)';
  const colMilky = isT5 ? 'rgba(21, 17, 26, 0.90)' : 'rgba(225, 242, 255, 0.72)';
  const colSpecular = isT5 ? 'rgba(43, 17, 24, 0.90)' : 'rgba(255, 255, 255, 0.90)';
  const colRim = isT5 ? '#ff1744' : 'rgba(255, 255, 255, 0.95)';
  const colFracture = isT5 ? 'rgba(255, 23, 68, 0.75)' : 'rgba(225, 242, 255, 0.45)';

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const dx = seg.x2 - seg.x1;
    const dy = seg.y2 - seg.y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const w1 = seg.w1;
    const w2 = seg.w2;

    // 4 Facet cross-section vertices:
    // Left (Shadow underside) -> MidLeft (Deep Ice) -> Center (Ridge) -> Right (Milky moonlit)
    const p1_L = [seg.x1 - nx * w1 * 0.50, seg.y1 - ny * w1 * 0.50];
    const p2_L = [seg.x2 - nx * w2 * 0.50, seg.y2 - ny * w2 * 0.50];

    const p1_ML = [seg.x1 - nx * w1 * 0.12, seg.y1 - ny * w1 * 0.12];
    const p2_ML = [seg.x2 - nx * w2 * 0.12, seg.y2 - ny * w2 * 0.12];

    const p1_C = [seg.x1 + nx * w1 * 0.16, seg.y1 + ny * w1 * 0.16];
    const p2_C = [seg.x2 + nx * w2 * 0.16, seg.y2 + ny * w2 * 0.16];

    const p1_R = [seg.x1 + nx * w1 * 0.50, seg.y1 + ny * w1 * 0.50];
    const p2_R = [seg.x2 + nx * w2 * 0.50, seg.y2 + ny * w2 * 0.50];

    // Face 1: Shadow / Back Face
    ctx.fillStyle = colShadow;
    ctx.beginPath();
    ctx.moveTo(p1_L[0], p1_L[1]);
    ctx.lineTo(p2_L[0], p2_L[1]);
    ctx.lineTo(p2_ML[0], p2_ML[1]);
    ctx.lineTo(p1_ML[0], p1_ML[1]);
    ctx.closePath();
    ctx.fill();

    // Face 2: Deep Blue Translucent Ice
    ctx.fillStyle = colDeepIce;
    ctx.beginPath();
    ctx.moveTo(p1_ML[0], p1_ML[1]);
    ctx.lineTo(p2_ML[0], p2_ML[1]);
    ctx.lineTo(p2_C[0], p2_C[1]);
    ctx.lineTo(p1_C[0], p1_C[1]);
    ctx.closePath();
    ctx.fill();

    // Face 3: Milky White Main Face (Moonlit body)
    ctx.fillStyle = colMilky;
    ctx.beginPath();
    ctx.moveTo(p1_C[0], p1_C[1]);
    ctx.lineTo(p2_C[0], p2_C[1]);
    ctx.lineTo(p2_R[0], p2_R[1]);
    ctx.lineTo(p1_R[0], p1_R[1]);
    ctx.closePath();
    ctx.fill();

    // Face 4: Hot Specular Ridge
    if (w1 > 3.5) {
      ctx.fillStyle = colSpecular;
      ctx.beginPath();
      ctx.moveTo(p1_C[0] - nx * 0.8, p1_C[1] - ny * 0.8);
      ctx.lineTo(p2_C[0] - nx * 0.6, p2_C[1] - ny * 0.6);
      ctx.lineTo(p2_C[0] + nx * 0.8, p2_C[1] + ny * 0.8);
      ctx.lineTo(p1_C[0] + nx * 1.0, p1_C[1] + ny * 1.0);
      ctx.closePath();
      ctx.fill();
    }

    // Bright Rim Edge (Moonlight catch)
    ctx.strokeStyle = colRim;
    ctx.lineWidth = Math.min(1.4, Math.max(0.6, w2 * 0.22));
    ctx.beginPath();
    ctx.moveTo(p1_R[0], p1_R[1]);
    ctx.lineTo(p2_R[0], p2_R[1]);
    ctx.stroke();

    // Terminal Crystalline Wedges
    if (seg.depth >= 6) {
      const tipX = seg.x2 + (dx / len) * w2 * 1.8;
      const tipY = seg.y2 + (dy / len) * w2 * 1.8;
      ctx.fillStyle = colSpecular;
      ctx.beginPath();
      ctx.moveTo(p2_L[0], p2_L[1]);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(p2_R[0], p2_R[1]);
      ctx.closePath();
      ctx.fill();
    }

    // Micro-Fractures inside branch body (Section 5)
    if (seg.fractures && seg.fractures.length > 0) {
      ctx.strokeStyle = colFracture;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let f = 0; f < seg.fractures.length; f++) {
        const fr = seg.fractures[f];
        ctx.moveTo(fr.x1, fr.y1);
        ctx.lineTo(fr.x2, fr.y2);
      }
      ctx.stroke();
    }
  }
}

// ----------------------------------------------------------------------------
// CINEMATIC CELESTIAL MOON BACKLIGHT (Section 2)
// ----------------------------------------------------------------------------
function renderMoonToCanvas(canvas, gw, gh, isT5) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const moonX = Math.round(gw * 0.58);
  const moonY = Math.round(gh * 0.30);
  const moonR = Math.min(Math.round(Math.min(gw, gh) * 0.42), 260);

  // A. Outer Atmospheric Bloom (2.4x radius)
  const bloomGrad = ctx.createRadialGradient(moonX, moonY, moonR * 0.4, moonX, moonY, moonR * 2.4);
  if (isT5) {
    bloomGrad.addColorStop(0, 'rgba(255, 77, 103, 0.32)');
    bloomGrad.addColorStop(0.35, 'rgba(177, 18, 47, 0.16)');
    bloomGrad.addColorStop(1.0, 'rgba(59, 7, 18, 0)');
  } else {
    bloomGrad.addColorStop(0, 'rgba(185, 216, 244, 0.28)');
    bloomGrad.addColorStop(0.40, 'rgba(120, 175, 230, 0.12)');
    bloomGrad.addColorStop(1.0, 'rgba(80, 125, 180, 0)');
  }
  ctx.fillStyle = bloomGrad;
  ctx.fillRect(0, 0, gw, gh);

  // B. Diffuse Moon Halo (1.4x radius)
  const haloGrad = ctx.createRadialGradient(moonX, moonY, moonR * 0.7, moonX, moonY, moonR * 1.45);
  if (isT5) {
    haloGrad.addColorStop(0, 'rgba(255, 23, 68, 0.45)');
    haloGrad.addColorStop(0.6, 'rgba(180, 15, 45, 0.18)');
    haloGrad.addColorStop(1.0, 'rgba(20, 2, 6, 0)');
  } else {
    haloGrad.addColorStop(0, 'rgba(234, 246, 255, 0.45)');
    haloGrad.addColorStop(0.6, 'rgba(185, 216, 244, 0.20)');
    haloGrad.addColorStop(1.0, 'rgba(80, 125, 180, 0)');
  }
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR * 1.45, 0, Math.PI * 2);
  ctx.fill();

  // C. Celestial Moon Body
  const bodyGrad = ctx.createRadialGradient(
    moonX - moonR * 0.12, moonY - moonR * 0.12, moonR * 0.08,
    moonX, moonY, moonR
  );
  if (isT5) {
    bodyGrad.addColorStop(0, '#fff1f2');
    bodyGrad.addColorStop(0.30, '#ff4d67');
    bodyGrad.addColorStop(0.68, '#b1122f');
    bodyGrad.addColorStop(1.0, 'rgba(59, 7, 18, 0.25)'); // Soft boundary, NO hard stroke!
  } else {
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.38, '#eaf6ff');
    bodyGrad.addColorStop(0.75, '#b9d8f4');
    bodyGrad.addColorStop(1.0, 'rgba(185, 216, 244, 0.20)');
  }
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  // D. Subtle Internal Cloudy / Maria Variation
  const cloudGrad = ctx.createRadialGradient(
    moonX - moonR * 0.32, moonY + moonR * 0.22, moonR * 0.15,
    moonX, moonY, moonR * 0.85
  );
  if (isT5) {
    cloudGrad.addColorStop(0, 'rgba(60, 5, 15, 0.40)');
    cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    cloudGrad.addColorStop(0, 'rgba(70, 110, 160, 0.18)');
    cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }
  ctx.fillStyle = cloudGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR * 0.9, 0, Math.PI * 2);
  ctx.fill();
}

// ----------------------------------------------------------------------------
// VOLUMETRIC LIGHT BLOOM PASS (Section 6)
// ----------------------------------------------------------------------------
function renderBloomToCanvas(canvas, gw, gh, isT5) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const crownX = gw * 0.56;
  const crownY = gh * 0.35;
  const bloomR = gw * 0.48;

  const grad = ctx.createRadialGradient(crownX, crownY, 20, crownX, crownY, bloomR);
  if (isT5) {
    grad.addColorStop(0, 'rgba(255, 30, 70, 0.35)');
    grad.addColorStop(0.4, 'rgba(180, 15, 40, 0.14)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    grad.addColorStop(0, 'rgba(235, 248, 255, 0.30)');
    grad.addColorStop(0.4, 'rgba(180, 220, 255, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, gw, gh);
}

// ----------------------------------------------------------------------------
// SHATTERED MIRROR WORLD — 3D GLASS PLATES (Section 7)
// ----------------------------------------------------------------------------
function initGlassPlates(gw, gh) {
  const rng = mulberry32(0x3B99E1);
  const plates = [];

  // Layer 0: Background (8 plates, dim, slow)
  for (let i = 0; i < 8; i++) {
    plates.push(createShard(rng, gw, gh, 0.25, 35, 65, 0.30));
  }
  // Layer 1: Midground (10 plates, medium)
  for (let i = 0; i < 10; i++) {
    plates.push(createShard(rng, gw, gh, 0.55, 45, 85, 0.50));
  }
  // Layer 2: Foreground (4 large plates, bold)
  for (let i = 0; i < 4; i++) {
    plates.push(createShard(rng, gw, gh, 0.85, 90, 160, 0.68));
  }

  return plates;
}

function createShard(rng, gw, gh, depth, minSz, maxSz, baseAlpha) {
  const numVerts = 4 + Math.floor(rng() * 4); // 4-7 vertex irregular polygon
  const verts = [];
  const baseAngle = rng() * Math.PI * 2;
  for (let v = 0; v < numVerts; v++) {
    const a = baseAngle + (v * Math.PI * 2 / numVerts) + (rng() - 0.5) * 0.4;
    const r = 0.5 + rng() * 0.5;
    verts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }

  return {
    verts,
    x0: rng(),
    y0: rng(),
    size: minSz + rng() * (maxSz - minSz),
    driftX: -(0.012 + rng() * 0.025) * (depth * 1.4),
    driftY: (0.008 + rng() * 0.018) * (depth * 1.2),
    rot: rng() * Math.PI * 2,
    rotSpeed: (rng() - 0.5) * 0.00035,
    depth,
    baseAlpha
  };
}

function drawGlassPlate(ctx, p, now, gw, gh, isT5, alphaMult = 1.0) {
  const t = now || 0;
  const rawX = (p.x0 * gw + p.driftX * t) % (gw + 240);
  const x = rawX < -120 ? rawX + gw + 240 : rawX;
  const rawY = (p.y0 * gh + p.driftY * t) % (gh + 240);
  const y = rawY < -120 ? rawY + gh + 240 : rawY;
  const rot = p.rot + p.rotSpeed * t;
  const sz = p.size;
  const alpha = p.baseAlpha * alphaMult;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);

  // Shard body
  const grad = ctx.createLinearGradient(-sz * 0.5, -sz * 0.5, sz * 0.5, sz * 0.5);
  if (isT5) {
    grad.addColorStop(0, `rgba(40, 8, 15, ${alpha * 0.7})`);
    grad.addColorStop(0.6, `rgba(18, 3, 7, ${alpha * 0.85})`);
    grad.addColorStop(1, `rgba(5, 1, 2, ${alpha * 0.9})`);
  } else {
    grad.addColorStop(0, `rgba(210, 238, 255, ${alpha * 0.6})`);
    grad.addColorStop(0.5, `rgba(100, 165, 220, ${alpha * 0.4})`);
    grad.addColorStop(1, `rgba(10, 28, 55, ${alpha * 0.7})`);
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(p.verts[0][0] * sz, p.verts[0][1] * sz);
  for (let i = 1; i < p.verts.length; i++) {
    ctx.lineTo(p.verts[i][0] * sz, p.verts[i][1] * sz);
  }
  ctx.closePath();
  ctx.fill();

  // Bright moon-facing rim edge
  ctx.strokeStyle = isT5 ? `rgba(255, 40, 80, ${alpha * 0.95})` : `rgba(255, 255, 255, ${alpha * 0.90})`;
  ctx.lineWidth = Math.max(0.8, sz * 0.025);
  ctx.beginPath();
  ctx.moveTo(p.verts[0][0] * sz, p.verts[0][1] * sz);
  ctx.lineTo(p.verts[1][0] * sz, p.verts[1][1] * sz);
  if (p.verts.length > 2) ctx.lineTo(p.verts[2][0] * sz, p.verts[2][1] * sz);
  ctx.stroke();

  // Dark shadow edge
  ctx.strokeStyle = isT5 ? `rgba(10, 1, 3, ${alpha * 0.8})` : `rgba(7, 20, 42, ${alpha * 0.6})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  const last = p.verts.length - 1;
  ctx.moveTo(p.verts[last][0] * sz, p.verts[last][1] * sz);
  ctx.lineTo(p.verts[0][0] * sz, p.verts[0][1] * sz);
  ctx.stroke();

  // Internal highlight plane line
  if (p.verts.length >= 4) {
    ctx.strokeStyle = isT5 ? `rgba(255, 80, 110, ${alpha * 0.5})` : `rgba(255, 255, 255, ${alpha * 0.45})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(p.verts[1][0] * sz * 0.8, p.verts[1][1] * sz * 0.8);
    ctx.lineTo(p.verts[3][0] * sz * 0.8, p.verts[3][1] * sz * 0.8);
    ctx.stroke();
  }

  ctx.restore();
}

// ----------------------------------------------------------------------------
// THE CRIMSON DONGHUA RIBBON (Section 8)
// ----------------------------------------------------------------------------
function drawCrimsonRibbon(ctx, now, gw, gh, isT5) {
  const t = now || 0;
  ctx.save();

  // Elegant S-curve across the scene
  const p0 = [-gw * 0.05, gh * 0.28];
  const p1 = [gw * 0.26, gh * (0.16 + Math.sin(t * 0.00038) * 0.03)];
  const p2 = [gw * 0.66, gh * (0.46 + Math.cos(t * 0.00032) * 0.04)];
  const p3 = [gw * 1.05, gh * 0.38];

  const steps = 24;
  const upperPts = [];
  const lowerPts = [];

  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const inv = 1 - u;

    // Cubic Bezier position
    const bx = inv * inv * inv * p0[0] + 3 * inv * inv * u * p1[0] + 3 * inv * u * u * p2[0] + u * u * u * p3[0];
    const by = inv * inv * inv * p0[1] + 3 * inv * inv * u * p1[1] + 3 * inv * u * u * p2[1] + u * u * u * p3[1];

    // Derivative / Tangent
    const tx = 3 * inv * inv * (p1[0] - p0[0]) + 6 * inv * u * (p2[0] - p1[0]) + 3 * u * u * (p3[0] - p2[0]);
    const ty = 3 * inv * inv * (p1[1] - p0[1]) + 6 * inv * u * (p2[1] - p1[1]) + 3 * u * u * (p3[1] - p2[1]);
    const tLen = Math.hypot(tx, ty) || 1;
    const nx = -ty / tLen;
    const ny = tx / tLen;

    // Organic variable ribbon thickness
    const thickness = Math.max(2.5, Math.sin(u * Math.PI) * (isT5 ? 24 : 18) * (0.85 + 0.35 * Math.sin(u * 3.5)));
    const halfThick = thickness * 0.5;

    upperPts.push([bx + nx * halfThick, by + ny * halfThick]);
    lowerPts.push([bx - nx * halfThick, by - ny * halfThick]);
  }

  // 1. Dark Red Outer Body
  const ribGrad = ctx.createLinearGradient(p0[0], p0[1], p3[0], p3[1]);
  if (isT5) {
    ribGrad.addColorStop(0, '#5b0a18');
    ribGrad.addColorStop(0.35, '#dc2626');
    ribGrad.addColorStop(0.55, '#ff1744');
    ribGrad.addColorStop(0.80, '#ef334f');
    ribGrad.addColorStop(1, '#5b0a18');
  } else {
    ribGrad.addColorStop(0, '#5b0a18');
    ribGrad.addColorStop(0.35, '#b91c2b');
    ribGrad.addColorStop(0.60, '#ef334f');
    ribGrad.addColorStop(0.85, '#ff6075');
    ribGrad.addColorStop(1, '#b91c2b');
  }

  ctx.fillStyle = ribGrad;
  ctx.beginPath();
  ctx.moveTo(upperPts[0][0], upperPts[0][1]);
  for (let i = 1; i < upperPts.length; i++) ctx.lineTo(upperPts[i][0], upperPts[i][1]);
  for (let i = lowerPts.length - 1; i >= 0; i--) ctx.lineTo(lowerPts[i][0], lowerPts[i][1]);
  ctx.closePath();
  ctx.fill();

  // 2. White-Red Hot Crest Edge
  ctx.strokeStyle = isT5 ? '#ffffff' : '#ff8da1';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(upperPts[0][0], upperPts[0][1]);
  for (let i = 1; i < upperPts.length; i++) ctx.lineTo(upperPts[i][0], upperPts[i][1]);
  ctx.stroke();

  // 3. Subtle Additive Bloom
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = isT5 ? 'rgba(255, 23, 68, 0.45)' : 'rgba(239, 51, 79, 0.35)';
  ctx.lineWidth = 6.0;
  ctx.stroke();

  ctx.restore();
}

// ----------------------------------------------------------------------------
// 3-FAMILY PARTICLE SYSTEM (Section 16: No circular ctx.arc!)
// ----------------------------------------------------------------------------
function initEnvParticles(gw, gh) {
  const rng = mulberry32(0x91F5AA);
  const list = [];

  // A. Micro Snow / Ice Dust (45 particles, tiny 4-point cross flecks)
  for (let i = 0; i < 45; i++) {
    list.push({
      family: 'snow',
      x: rng() * (gw + 100) - 50,
      y: rng() * gh,
      sz: 1.2 + rng() * 2.2,
      vy: 1.0 + rng() * 1.5,
      vx: -(1.2 + rng() * 1.8),
      alpha: 0.25 + rng() * 0.35,
      rot: rng() * Math.PI,
      vrot: (rng() - 0.5) * 0.02
    });
  }

  // B. Crystal Splinters (18 particles, narrow rotating shards)
  for (let i = 0; i < 18; i++) {
    list.push({
      family: 'splinter',
      x: rng() * (gw + 100) - 50,
      y: rng() * gh,
      sz: 4.0 + rng() * 7.0,
      vy: 1.4 + rng() * 1.8,
      vx: -(1.5 + rng() * 2.2),
      alpha: 0.40 + rng() * 0.45,
      rot: rng() * Math.PI * 2,
      vrot: (rng() - 0.5) * 0.04
    });
  }

  // C. Large Mirror Fragments (4 rare particles, 16-32px)
  for (let i = 0; i < 4; i++) {
    list.push({
      family: 'mirror',
      x: rng() * (gw + 120) - 60,
      y: rng() * gh,
      sz: 16.0 + rng() * 16.0,
      vy: 0.6 + rng() * 1.0,
      vx: -(0.8 + rng() * 1.2),
      alpha: 0.35 + rng() * 0.35,
      rot: rng() * Math.PI * 2,
      vrot: (rng() - 0.5) * 0.012
    });
  }

  return list;
}

function updateAndDrawParticles(ctx, particles, gw, gh, isT5) {
  ctx.save();
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vrot;

    if (p.y > gh + 20 || p.x < -40) {
      p.y = -20;
      p.x = Math.random() * (gw + 60);
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;

    if (p.family === 'snow') {
      // 4-Point cross fleck (no arc!)
      const s = p.sz;
      ctx.fillStyle = isT5 ? '#ff1744' : '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.4, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.4, 0);
      ctx.closePath();
      ctx.fill();
    } else if (p.family === 'splinter') {
      // Elongated asymmetric triangle splinter
      const len = p.sz;
      const w = Math.max(1.2, p.sz * 0.3);
      ctx.fillStyle = isT5 ? '#dc2626' : 'rgba(215, 240, 255, 0.85)';
      ctx.beginPath();
      ctx.moveTo(0, -len * 0.7);
      ctx.lineTo(w, len * 0.3);
      ctx.lineTo(0, len * 0.6);
      ctx.lineTo(-w * 0.6, 0);
      ctx.closePath();
      ctx.fill();

      // Glint edge
      ctx.strokeStyle = isT5 ? '#ff6075' : '#ffffff';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    } else {
      // Large mirror fragment
      const s = p.sz;
      ctx.fillStyle = isT5 ? 'rgba(35, 6, 12, 0.75)' : 'rgba(180, 220, 250, 0.45)';
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, -s * 0.5);
      ctx.lineTo(s * 0.5, -s * 0.3);
      ctx.lineTo(s * 0.3, s * 0.5);
      ctx.lineTo(-s * 0.5, s * 0.2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = isT5 ? '#ff1744' : 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.0;
      ctx.stroke();
    }

    ctx.restore();
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// CHECK AND REBUILD STATIC ENVIRONMENT CANVAS CACHES
// ----------------------------------------------------------------------------
function ensureEnvCache(gw, gh) {
  if (_cachedGw === gw && _cachedGh === gh && _treeCanvasNormal && _treeCanvasT5) return;

  _cachedGw = gw;
  _cachedGh = gh;

  _treeSegments = generateSpectralTree(gw, gh);

  _treeCanvasNormal = document.createElement('canvas');
  _treeCanvasNormal.width = gw;
  _treeCanvasNormal.height = gh;
  renderTreePrismsToCanvas(_treeCanvasNormal, _treeSegments, false);

  _treeCanvasT5 = document.createElement('canvas');
  _treeCanvasT5.width = gw;
  _treeCanvasT5.height = gh;
  renderTreePrismsToCanvas(_treeCanvasT5, _treeSegments, true);

  _moonCanvasNormal = document.createElement('canvas');
  _moonCanvasNormal.width = gw;
  _moonCanvasNormal.height = gh;
  renderMoonToCanvas(_moonCanvasNormal, gw, gh, false);

  _moonCanvasT5 = document.createElement('canvas');
  _moonCanvasT5.width = gw;
  _moonCanvasT5.height = gh;
  renderMoonToCanvas(_moonCanvasT5, gw, gh, true);

  _bloomCanvasNormal = document.createElement('canvas');
  _bloomCanvasNormal.width = gw;
  _bloomCanvasNormal.height = gh;
  renderBloomToCanvas(_bloomCanvasNormal, gw, gh, false);

  _bloomCanvasT5 = document.createElement('canvas');
  _bloomCanvasT5.width = gw;
  _bloomCanvasT5.height = gh;
  renderBloomToCanvas(_bloomCanvasT5, gw, gh, true);

  _glassPlates = initGlassPlates(gw, gh);
  _envParticles = initEnvParticles(gw, gh);
}

// ============================================================================
// SANHUA THEME DEFINITION
// ============================================================================
export const SANHUA_THEME = {
  id: 'sanhua',
  nameKey: 'themeSanhua',
  descKey: 'themeSanhuaDesc',
  badgeKey: 'themeSanhuaBadge',
  price: 35,
  unlockedByDefault: false,
  accentColor: '#38bdf8',
  previewBg: 'linear-gradient(135deg, #030712, #071426, #1b315b, #02050c)',
  colors: {
    bgCenter: '#08172e',
    bgMid: '#040b17',
    bgOuter: '#02050c',
    bgAura: 'rgba(56, 189, 248, 0.24)',
    strings: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8'],
    stringGlow: 'rgba(56, 189, 248, 0.70)',
    receptorBorder: 'rgba(56, 189, 248, 0.80)',
    particleType: 'petal'
  },
  comboTiers: [
    { min: 0,   max: 49,       name: 'frost_blade',       border: 'rgba(56, 189, 248, 0.70)', glow: 'rgba(56, 189, 248, 0.45)', particleColors: ['#38bdf8', '#bae6fd', '#ffffff'] },
    { min: 50,  max: 99,       name: 'biting_frost',      border: 'rgba(14, 165, 233, 0.85)', glow: 'rgba(14, 165, 233, 0.60)', particleColors: ['#0ea5e9', '#38bdf8', '#fda4af'] },
    { min: 100, max: 199,      name: 'sakura_flutter',    border: 'rgba(244, 63, 94, 0.90)',  glow: 'rgba(56, 189, 248, 0.70)', particleColors: ['#f43f5e', '#38bdf8', '#fff1f2'] },
    { min: 200, max: 399,      name: 'crystal_surge',     border: 'rgba(0, 245, 255, 0.95)',  glow: 'rgba(244, 63, 94, 0.80)', particleColors: ['#00f5ff', '#ff2a5f', '#ffffff'] },
    { min: 400, max: 799,      name: 'glacial_fracture',  border: 'rgba(112, 0, 255, 0.98)',  glow: 'rgba(0, 229, 255, 0.90)', particleColors: ['#7000ff', '#00e5ff', '#ffffff'] },
    { min: 800, max: Infinity, name: 'subzero_domain',    border: '#ff1744',                  glow: 'rgba(255, 23, 68, 0.95)', particleColors: ['#ff1744', '#dc2626', '#18181b', '#000000'] }
  ],

  _t5Blend: 0,
  _lastNow: 0,
  _holdPaintCache: null,

  getTier(combo) {
    const tiers = this.comboTiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (combo >= tiers[i].min) return tiers[i];
    }
    return tiers[0];
  },

  _resolveTierNum(tier) {
    if (typeof tier === 'number') return tier;
    if (tier && typeof tier === 'object') {
      if (typeof tier.min === 'number') return tier.min;
      if (typeof tier.tier === 'number') return tier.tier;
      if (typeof tier.name === 'string') tier = tier.name;
    }
    if (typeof tier === 'string') {
      const s = tier.toLowerCase();
      if (s === 'subzero_domain' || s === 'absolute_zero' || s === 'legendary') return 800;
      if (s === 'glacial_fracture' || s === 'cosmic') return 400;
      if (s === 'crystal_surge' || s === 'gold') return 200;
      if (s === 'sakura_flutter' || s === 'electric') return 100;
      if (s === 'biting_frost') return 50;
      if (s === 'frost_blade' || s === 'steel') return 0;
    }
    return 0;
  },

  getStringColors(combo = 0) {
    const tier = this._resolveTierNum(combo);
    if (tier >= 800) return ['#ff1744', '#dc2626', '#7f1d1d', '#18181b'];
    if (tier >= 400) return ['#f0fdfa', '#7dd3fc', '#38bdf8', '#a855f7'];
    if (tier >= 200) return ['#ffffff', '#bae6fd', '#38bdf8', '#f43f5e'];
    if (tier >= 100) return ['#f0f9ff', '#7dd3fc', '#38bdf8', '#fda4af'];
    if (tier >= 50)  return ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8'];
    return ['#bae6fd', '#7dd3fc', '#38bdf8', '#0284c7'];
  },

  _getPalette(tierInput, isDead = false) {
    if (isDead) {
      return {
        bgTop: '#1e293b', bgMid: '#0f172a', bgBot: '#050811',
        border: '#475569', core: '#94a3b8', laserGlow: 'rgba(71, 85, 105, 0.3)',
        laserCore: '#64748b', petalCol: '#64748b', trackBg: 'rgba(15, 23, 42, 0.40)',
        goldTrim: '#64748b', crestCol: '#64748b'
      };
    }
    const tier = this._resolveTierNum(tierInput);

    if (tier >= 800) {
      return {
        bgTop: '#180308', bgMid: '#0d0104', bgBot: '#050002',
        border: '#ff1744', core: '#ff1744', laserGlow: 'rgba(255, 23, 68, 0.95)',
        laserCore: '#ff1744', petalCol: '#f43f5e', trackBg: 'rgba(24, 2, 6, 0.55)',
        goldTrim: '#991b1b', crestCol: '#ff1744'
      };
    }
    if (tier >= 400) {
      return {
        bgTop: '#1e1b4b', bgMid: '#0d1527', bgBot: '#020617',
        border: '#a855f7', core: '#ffffff', laserGlow: 'rgba(0, 229, 255, 0.90)',
        laserCore: '#f43f5e', petalCol: '#ec4899', trackBg: 'rgba(20, 16, 48, 0.45)',
        goldTrim: '#fbbf24', crestCol: '#f43f5e'
      };
    }
    if (tier >= 200) {
      return {
        bgTop: '#0c4a6e', bgMid: '#072740', bgBot: '#03101c',
        border: '#00f5ff', core: '#ffffff', laserGlow: 'rgba(0, 245, 255, 0.85)',
        laserCore: '#ff2a5f', petalCol: '#f43f5e', trackBg: 'rgba(8, 36, 64, 0.45)',
        goldTrim: '#f59e0b', crestCol: '#e11d48'
      };
    }
    if (tier >= 100) {
      return {
        bgTop: '#0e3952', bgMid: '#071f30', bgBot: '#020a12',
        border: '#38bdf8', core: '#ffffff', laserGlow: 'rgba(56, 189, 248, 0.80)',
        laserCore: '#f43f5e', petalCol: '#fda4af', trackBg: 'rgba(10, 30, 50, 0.45)',
        goldTrim: '#f59e0b', crestCol: '#e11d48'
      };
    }
    if (tier >= 50) {
      return {
        bgTop: '#072e4a', bgMid: '#051b2e', bgBot: '#020a14',
        border: '#0ea5e9', core: '#e0f2fe', laserGlow: 'rgba(14, 165, 233, 0.70)',
        laserCore: '#e11d48', petalCol: '#fb7185', trackBg: 'rgba(6, 25, 45, 0.45)',
        goldTrim: '#f59e0b', crestCol: '#e11d48'
      };
    }

    return {
      bgTop: '#07253d', bgMid: '#041524', bgBot: '#020a12',
      border: '#38bdf8', core: '#ffffff', laserGlow: 'rgba(56, 189, 248, 0.65)',
      laserCore: '#e11d48', petalCol: '#f43f5e', trackBg: 'rgba(4, 20, 36, 0.45)',
      goldTrim: '#f59e0b', crestCol: '#e11d48'
    };
  },

  // ==========================================================================
  // 1. FRACTURED-GLASS TAP NOTES (Section 14 & 15)
  // Strictly respects [x, yTop, w, h] bounds without arbitrary reductions.
  // Procedural pseudo-Voronoi fracture pattern with orientation-dependent lighting.
  // Returns true to guarantee on-screen display.
  // ==========================================================================
  bakeTapNote(ctx, x, yTop, w, h, isLight, style) {
    const tier = this._resolveTierNum(style);
    const pal = this._getPalette(tier, false);
    const isT5 = tier >= 800;

    ctx.save();

    // Base background gradient fill
    const bg = ctx.createLinearGradient(x, yTop, x + w, yTop + h);
    if (isLight) {
      bg.addColorStop(0, '#fdf2f8');
      bg.addColorStop(0.5, '#fce7f3');
      bg.addColorStop(1, '#fbcfe8');
    } else if (isT5) {
      bg.addColorStop(0, '#1c0307');
      bg.addColorStop(0.5, '#0d0104');
      bg.addColorStop(1, '#050002');
    } else {
      bg.addColorStop(0, pal.bgTop || '#07253d');
      bg.addColorStop(0.5, pal.bgMid || '#041524');
      bg.addColorStop(1, pal.bgBot || '#020a12');
    }

    // Clip strictly to note rectangle
    ctx.beginPath();
    ctx.rect(x, yTop, w, h);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.clip();

    // ------------------------------------------------------------------------
    // FRACTURE CLEAVAGE GEOMETRY (11 Asymmetric Shards)
    // ------------------------------------------------------------------------
    const V = [
      [0.00, 0.00], [0.24, 0.00], [0.52, 0.00], [0.80, 0.00], [1.00, 0.00],
      [1.00, 0.42], [1.00, 0.74], [1.00, 1.00],
      [0.76, 1.00], [0.50, 1.00], [0.22, 1.00], [0.00, 1.00],
      [0.00, 0.65], [0.00, 0.30],
      // Interior pseudo-Voronoi nodes
      [0.32, 0.36], [0.66, 0.30], [0.46, 0.66], [0.78, 0.60]
    ];
    const pt = (idx) => [x + V[idx][0] * w, yTop + V[idx][1] * h];

    const shards = [
      { pts: [0, 1, 14, 13],    specular: true,  lightTier: 0.85 },
      { pts: [1, 2, 15, 14],    specular: true,  lightTier: 0.70 },
      { pts: [2, 3, 4, 5, 15],  specular: true,  lightTier: 0.65 },
      { pts: [13, 14, 16, 12],  specular: false, lightTier: 0.35 },
      { pts: [12, 16, 10, 11],  specular: false, lightTier: 0.20 },
      { pts: [14, 15, 17, 16],  specular: true,  lightTier: 0.90 },
      { pts: [15, 5, 6, 17],    specular: false, lightTier: 0.40 },
      { pts: [16, 17, 6, 7, 8], specular: false, lightTier: 0.25 },
      { pts: [10, 16, 8, 9],    specular: false, lightTier: 0.30 }
    ];

    for (let i = 0; i < shards.length; i++) {
      const sh = shards[i];
      const p0 = pt(sh.pts[0]);
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      for (let j = 1; j < sh.pts.length; j++) {
        const pj = pt(sh.pts[j]);
        ctx.lineTo(pj[0], pj[1]);
      }
      ctx.closePath();

      // Shard surface refraction gradient based on orientation
      if (isLight) {
        ctx.fillStyle = sh.specular ? 'rgba(255, 255, 255, 0.60)' : `rgba(244, 114, 182, ${0.15 + sh.lightTier * 0.25})`;
      } else if (isT5) {
        // T5 Obsidian Crystal Faces
        if (sh.specular) {
          ctx.fillStyle = 'rgba(43, 17, 24, 0.85)';
        } else {
          ctx.fillStyle = sh.lightTier > 0.30 ? 'rgba(21, 17, 26, 0.85)' : 'rgba(5, 5, 9, 0.90)';
        }
      } else {
        // Celestial Ice Glass Faces
        if (sh.specular) {
          ctx.fillStyle = 'rgba(230, 246, 255, 0.55)';
        } else {
          ctx.fillStyle = sh.lightTier > 0.30 ? 'rgba(118, 199, 239, 0.25)' : 'rgba(47, 128, 183, 0.20)';
        }
      }
      ctx.fill();

      // Specular sheen highlight along light-facing boundaries
      if (sh.specular) {
        ctx.strokeStyle = isT5 ? 'rgba(255, 60, 90, 0.65)' : 'rgba(255, 255, 255, 0.60)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Razor-sharp fracture lines
    ctx.strokeStyle = isT5 ? '#ff1744' : (pal.border || '#38bdf8');
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    const fractureLines = [
      [14, 1], [14, 13], [14, 15], [14, 16],
      [15, 2], [15, 5], [15, 17],
      [16, 12], [16, 10], [16, 8], [16, 17],
      [17, 6]
    ];
    for (let k = 0; k < fractureLines.length; k++) {
      const pA = pt(fractureLines[k][0]);
      const pB = pt(fractureLines[k][1]);
      ctx.moveTo(pA[0], pA[1]);
      ctx.lineTo(pB[0], pB[1]);
    }
    ctx.stroke();

    // Primary fracture node star glints
    const pCenter1 = pt(14);
    const pCenter2 = pt(15);
    ctx.fillStyle = isT5 ? '#fff5f5' : '#ffffff';
    ctx.beginPath();
    ctx.arc(pCenter1[0], pCenter1[1], 1.6, 0, Math.PI * 2);
    ctx.arc(pCenter2[0], pCenter2[1], 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Micro 4-point cross glint
    ctx.strokeStyle = isT5 ? '#ff1744' : 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(pCenter1[0] - 4, pCenter1[1]); ctx.lineTo(pCenter1[0] + 4, pCenter1[1]);
    ctx.moveTo(pCenter1[0], pCenter1[1] - 4); ctx.lineTo(pCenter1[0], pCenter1[1] + 4);
    ctx.stroke();

    // Top glass bevel sheen
    const glossH = Math.max(3, Math.round(h * 0.32));
    const gloss = ctx.createLinearGradient(x, yTop, x, yTop + glossH);
    gloss.addColorStop(0, isT5 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.35)');
    gloss.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = gloss;
    ctx.fillRect(x, yTop, w, glossH);

    ctx.restore();

    // Outer perimeter sharp border
    ctx.save();
    ctx.strokeStyle = isT5 ? '#ff1744' : (pal.border || '#38bdf8');
    ctx.lineWidth = isT5 ? 1.8 : 1.4;
    ctx.strokeRect(x + 0.5, yTop + 0.5, w - 1, h - 1);
    ctx.restore();

    return true;
  },

  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    return this.bakeTapNote(ctx, x, yTop, w, h, isLight, comboTier);
  },

  // ==========================================================================
  // 2. CELESTIAL ICE COMET HOLD NOTES — NO KATANA (Sections 10, 11, 12, 13)
  // Replaces sword logic with a flowing spirit energy veil ending in a razor-sharp
  // true crescent moon negative-space cutout at yTail.
  // ==========================================================================
  _getHoldPaintCache(w, h, comboTier, dead = false, isLight = false) {
    const width = Math.max(1, Math.round(w));
    const height = Math.max(1, Math.round(h));
    const tier = this._resolveTierNum(comboTier);
    const isT5 = tier >= 800;
    const index = dead ? 6 : isT5 ? 5 : tier >= 400 ? 4 : tier >= 200 ? 3 : tier >= 100 ? 2 : tier >= 50 ? 1 : 0;

    let cache = this._holdPaintCache;
    if (!cache || cache.width !== width || cache.height !== height) {
      cache = this._holdPaintCache = { width, height, entries: new Array(14) };
    }
    const key = index + (isLight ? 7 : 0);
    if (cache.entries[key]) return cache.entries[key];

    const tailWidth = Math.max(1, Math.round(width * 0.76));
    const capHeight = Math.min(Math.round(tailWidth * 0.40) + 6, Math.round(height * 0.55));

    // 1. Energy Ribbon Gradient Strip
    const strip = document.createElement('canvas');
    strip.width = tailWidth;
    strip.height = 4;
    const g = strip.getContext('2d');
    const grad = g.createLinearGradient(0, 0, tailWidth, 0);

    if (dead) {
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.3, '#475569');
      grad.addColorStop(0.5, '#94a3b8');
      grad.addColorStop(0.7, '#475569');
      grad.addColorStop(1, '#1e293b');
    } else if (isT5) {
      grad.addColorStop(0, '#180308');
      grad.addColorStop(0.25, '#7f1d1d');
      grad.addColorStop(0.42, '#dc2626');
      grad.addColorStop(0.50, '#ffffff'); // pure white-hot qi center
      grad.addColorStop(0.58, '#dc2626');
      grad.addColorStop(0.75, '#7f1d1d');
      grad.addColorStop(1, '#180308');
    } else {
      grad.addColorStop(0, '#0369a1');
      grad.addColorStop(0.24, '#0284c7');
      grad.addColorStop(0.42, '#38bdf8');
      grad.addColorStop(0.50, '#ffffff'); // pure white-hot energy core
      grad.addColorStop(0.58, '#38bdf8');
      grad.addColorStop(0.76, '#0284c7');
      grad.addColorStop(1, '#0369a1');
    }
    g.fillStyle = grad;
    g.fillRect(0, 0, tailWidth, 4);

    // 2. Crescent Moon Negative-Space Cutout Cap (Section 12: destination-out)
    const cap = document.createElement('canvas');
    cap.width = tailWidth;
    cap.height = capHeight;
    const c = cap.getContext('2d');

    const half = tailWidth / 2;
    const tipLeft = [3, 2];
    const tipRight = [tailWidth - 3, 2];
    const outerCrestY = capHeight - 3;
    const innerCrestY = capHeight - 11;

    c.save();
    // Step 1: Draw thin curved lunar blade shape
    const bladeGrad = c.createLinearGradient(0, 0, 0, capHeight);
    if (dead) {
      bladeGrad.addColorStop(0, '#64748b');
      bladeGrad.addColorStop(1, '#334155');
    } else if (isT5) {
      bladeGrad.addColorStop(0, '#ffffff');
      bladeGrad.addColorStop(0.35, '#ff1744');
      bladeGrad.addColorStop(1, '#7f1d1d');
    } else {
      bladeGrad.addColorStop(0, '#ffffff');
      bladeGrad.addColorStop(0.35, '#e0f2fe');
      bladeGrad.addColorStop(0.70, '#38bdf8');
      bladeGrad.addColorStop(1, '#0284c7');
    }

    c.fillStyle = bladeGrad;
    c.beginPath();
    c.moveTo(tipLeft[0], tipLeft[1]);
    // Outer convex curve: swoops down from tips to outer crest
    c.quadraticCurveTo(half * 0.35, outerCrestY * 0.95, half, outerCrestY);
    c.quadraticCurveTo(tailWidth - half * 0.35, outerCrestY * 0.95, tipRight[0], tipRight[1]);
    // Stem joining the energy veil at bottom center
    c.lineTo(half + 8, capHeight);
    c.lineTo(half - 8, capHeight);
    c.closePath();
    c.fill();

    // Step 2: destination-out to subtract inner hollow space, carving an exquisite crescent!
    c.globalCompositeOperation = 'destination-out';
    c.beginPath();
    c.moveTo(tipLeft[0], tipLeft[1]);
    // Inner concave curve carving out the negative space:
    c.quadraticCurveTo(half, innerCrestY, tipRight[0], tipRight[1]);
    c.lineTo(tailWidth + 4, -4);
    c.lineTo(-4, -4);
    c.closePath();
    c.fill();

    // Step 3: Restore source-over
    c.globalCompositeOperation = 'source-over';

    // Step 4: Rim glow and razor-sharp crescent horn glints
    if (!dead) {
      c.strokeStyle = isT5 ? 'rgba(255, 23, 68, 0.95)' : 'rgba(56, 189, 248, 0.95)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(tipLeft[0], tipLeft[1]);
      c.quadraticCurveTo(half, innerCrestY, tipRight[0], tipRight[1]);
      c.stroke();

      c.strokeStyle = isT5 ? '#ff3b56' : '#ffffff';
      c.lineWidth = 1.0;
      c.beginPath();
      c.moveTo(tipLeft[0], tipLeft[1]);
      c.quadraticCurveTo(half * 0.35, outerCrestY * 0.95, half, outerCrestY);
      c.quadraticCurveTo(tailWidth - half * 0.35, outerCrestY * 0.95, tipRight[0], tipRight[1]);
      c.stroke();

      // Radiant sharp horn glints
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(tipLeft[0], tipLeft[1], 1.6, 0, Math.PI * 2);
      c.arc(tipRight[0], tipRight[1], 1.6, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    // 3. Receptor Head
    const head = document.createElement('canvas');
    head.width = width;
    head.height = height;
    const n = head.getContext('2d');
    this.bakeTapNote(n, 0, 0, width, height, isLight, tier);
    if (dead) {
      n.globalCompositeOperation = 'source-atop';
      n.fillStyle = 'rgba(30, 41, 59, 0.85)';
      n.fillRect(0, 0, width, height);
    }

    return (cache.entries[key] = { strip, cap, head, tailWidth, capHeight });
  },

  bakeLongHead(ctx, x, yTop, w, h, isLight, style) {
    return true;
  },

  // Section 13: Energy convergence point, NOT scabbard
  drawNeck(ctx, x, junctionY, w, headH, tile, isReleased = false, currentCombo = 0) {
    const dead = isReleased || !!(tile?.failed || tile?.released);
    const light = typeof document !== 'undefined' && document.body?.getAttribute('data-theme') === 'light';
    const paint = this._getHoldPaintCache(w, headH, currentCombo, dead, light);
    ctx.drawImage(paint.head, Math.round(x), Math.round(junctionY), w, headH);
    return true;
  },

  drawHeadOverlay() {
    return true;
  },

  drawHoldBody(ctx, x, yTail, w, headH, tile, isLight, now, tailH,
    currentCombo = 0, actualYHeadTop = null, isReleased = false) {
    const bottom = actualYHeadTop ?? (yTail + tailH);
    const length = bottom - yTail;
    if (!(length > 0)) return true;

    const dead = isReleased || !!(tile?.failed || tile?.released);
    const paint = this._getHoldPaintCache(w, headH, currentCombo, dead, isLight);
    const left = Math.round(x + (w - paint.tailWidth) / 2);
    const capHeight = Math.min(paint.capHeight, length);

    // 1. Crescent moon cutout cap at top of tail (at yTail)
    ctx.drawImage(paint.cap, 0, 0, paint.tailWidth, capHeight, left, yTail, paint.tailWidth, capHeight);

    // 2. Flowing energy tail body (Section 11: 18-35% of note width)
    if (length > paint.capHeight) {
      const streamW = Math.max(8, Math.round(w * 0.28));
      const streamX = Math.round(x + (w - streamW) / 2);

      ctx.drawImage(paint.strip, streamX, yTail + paint.capHeight, streamW, length - paint.capHeight + 1);

      // Low-alpha spiritual qi aura and harmonic filaments
      if (!dead) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const isT5 = this._resolveTierNum(currentCombo) >= 800;
        const auraW = Math.round(streamW * 1.8);
        const auraLeft = Math.round(x + (w - auraW) / 2);

        ctx.fillStyle = isT5 ? 'rgba(255, 23, 68, 0.14)' : 'rgba(56, 189, 248, 0.14)';
        ctx.fillRect(auraLeft, yTail + paint.capHeight, auraW, length - paint.capHeight);

        // Harmonic filaments curving along the stream
        if (length > 35) {
          ctx.strokeStyle = isT5 ? 'rgba(255, 120, 140, 0.70)' : 'rgba(255, 255, 255, 0.75)';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          const cx = streamX + streamW / 2;
          const step = 26;
          for (let y = yTail + paint.capHeight + 4; y < bottom - 8; y += step) {
            const wave = Math.sin((y + (now || 0) * 0.15) * 0.05) * (streamW * 0.24);
            ctx.moveTo(cx + wave, y);
            ctx.lineTo(cx - wave, y + step * 0.5);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    return true;
  },

  drawHoldTail(ctx, x, yTail, w, headH, tile, isLight, now, tailH = 0,
    currentCombo = 0, actualYHeadTop = null, nextTileDist = 9999) {
    return true;
  },

  // ==========================================================================
  // 3. RECEPTOR LINE — CELESTIAL GLACIO RECEPTORS
  // ==========================================================================
  drawReceptor(ctx, x, y, w, h, isActive, isLight) {
    ctx.save();
    const cx = x + w / 2;
    const cy = y + h / 2;

    const bg = ctx.createLinearGradient(x, y, x, y + h);
    if (isActive) {
      bg.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      bg.addColorStop(0.5, 'rgba(14, 165, 233, 0.30)');
      bg.addColorStop(1, 'rgba(2, 132, 199, 0.15)');
    } else {
      bg.addColorStop(0, 'rgba(7, 23, 46, 0.40)');
      bg.addColorStop(0.5, 'rgba(4, 15, 30, 0.50)');
      bg.addColorStop(1, 'rgba(2, 6, 15, 0.60)');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

    ctx.strokeStyle = isActive ? '#ffffff' : (isLight ? 'rgba(56, 189, 248, 0.9)' : 'rgba(56, 189, 248, 0.70)');
    ctx.lineWidth = isActive ? 1.8 : 1.2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    ctx.fillStyle = isActive ? '#f43f5e' : 'rgba(56, 189, 248, 0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy, isActive ? 2.8 : 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return true;
  },

  // ==========================================================================
  // 4. HIT ANIMATION — SHATTERED ICE MIRROR BURST
  // ==========================================================================
  drawHitAnimation(ctx, cx, cy, w, h, p, isPerfect, isLight, now, combo = 0) {
    const easeOut = 1 - Math.pow(1 - p, 3);
    const alpha = Math.max(0, 1.0 - Math.pow(p, 1.3));
    if (alpha <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const pal = this._getPalette(combo);
    const colBlade = isPerfect ? (combo >= 800 ? '#ffffff' : '#7dd3fc') : pal.border;
    const colCore = isPerfect ? '#ffffff' : (combo >= 800 ? '#ffffff' : pal.laserCore);

    // Expanding Glacio shockwave ring
    const ringR = (w * 0.15) + easeOut * (w * 0.58);
    const ringAlpha = Math.max(0, (1.0 - p) * 0.75);
    ctx.lineWidth = Math.max(1, 2.0 * (1.0 - p));
    ctx.strokeStyle = (combo >= 800) ? `rgba(255, 23, 68, ${ringAlpha})` : `rgba(56, 189, 248, ${ringAlpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.stroke();

    // Shattered ice shards
    const numShards = 8;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(p * 0.25);

    for (let s = 0; s < numShards; s++) {
      const angle = (s * Math.PI * 2 / numShards) + (s * 0.15);
      const sDist = (w * 0.18) + easeOut * (w * 0.52);
      const sx = Math.cos(angle) * sDist;
      const sy = Math.sin(angle) * sDist;
      const shardLen = Math.max(4, 14 * (1.0 - p * 0.6));
      const shardW = Math.max(1.5, 4 * (1.0 - p * 0.7));

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle + Math.PI / 2);

      ctx.fillStyle = (combo >= 800) ? `rgba(255, 23, 68, ${alpha * 0.85})` : `rgba(186, 230, 253, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.moveTo(0, -shardLen);
      ctx.lineTo(shardW, 0);
      ctx.lineTo(0, shardLen * 0.4);
      ctx.lineTo(-shardW, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = colBlade;
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.restore();
    }

    // Central 6-ray star
    const starR = Math.max(4, (w * 0.28) * (1.0 - p * 0.5));
    ctx.strokeStyle = colCore;
    ctx.lineWidth = Math.max(1, 1.8 * (1.0 - p));
    for (let r = 0; r < 6; r++) {
      const rAng = (r * Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(rAng) * starR, Math.sin(rAng) * starR);
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  },

  // ==========================================================================
  // 5. ATMOSPHERE — HIGH-BUDGET CINEMATIC REBUILD
  // Visual Hierarchy:
  // 1. Giant Luminous Spectral Tree
  // 2. Moon / White Celestial Backlight
  // 3. Large Floating Glass Plates across 3 Parallax Layers
  // 4. Dark Atmospheric Depth and Fog
  // 5. Crimson Donghua Energy Ribbon
  // 6. Gameplay Lanes and Notes
  // 7. Tiny 3-Family Particles (Micro-Snow, Splinters, Mirror Fragments)
  // ==========================================================================
  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    const gw = State?.gameWidth > 0 ? State.gameWidth : (ctx.canvas?.clientWidth || ctx.canvas?.width / dpr || 400);
    const gh = State?.gameHeight > 0 ? State.gameHeight : (ctx.canvas?.clientHeight || ctx.canvas?.height / dpr || 700);
    const combo = State?.combo || 0;
    const now = songTime || 0;

    // Smooth T5 Blood Eclipse Transition (Section 9: ~0.8s damping)
    const targetT5 = combo >= 800 ? 1.0 : 0.0;
    const stateObj = (State && typeof State === 'object') ? State : this;
    if (typeof stateObj._t5Blend !== 'number') {
      stateObj._t5Blend = targetT5;
      stateObj._lastNow = now;
    } else {
      const dt = Math.min(0.1, Math.max(0.001, (now - (stateObj._lastNow || now)) * 0.001));
      stateObj._lastNow = now;
      stateObj._t5Blend += (targetT5 - stateObj._t5Blend) * (1.0 - Math.exp(-3.2 * dt));
    }
    const t5b = Math.max(0, Math.min(1, stateObj._t5Blend));
    this._t5Blend = t5b;
    const isT5 = t5b > 0.5;

    // Ensure pre-rendered fractal tree, celestial moon, and glass plates are cached
    ensureEnvCache(gw, gh);

    ctx.save();

    // ------------------------------------------------------------------------
    // LAYER 1: Deep Navy / Indigo Atmospheric Sky (or Wine-Red at T5)
    // ------------------------------------------------------------------------
    const skyGrad = ctx.createLinearGradient(gw * 0.5, 0, gw * 0.5, gh);
    if (t5b > 0.01) {
      // T5 Blood Eclipse Sky
      skyGrad.addColorStop(0, '#050002');
      skyGrad.addColorStop(0.4, '#140306');
      skyGrad.addColorStop(1.0, '#22050b');
    } else {
      // Normal Deep Navy Sky
      skyGrad.addColorStop(0, '#030712');
      skyGrad.addColorStop(0.4, '#071426');
      skyGrad.addColorStop(1.0, '#101a35');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, gw, gh);

    // ------------------------------------------------------------------------
    // LAYER 2: Background Mirror Shards (Parallax Layer 0: behind moon & tree)
    // ------------------------------------------------------------------------
    if (_glassPlates) {
      for (let i = 0; i < 8; i++) {
        drawGlassPlate(ctx, _glassPlates[i], now, gw, gh, isT5, 1.0);
      }
    }

    // ------------------------------------------------------------------------
    // LAYER 3: Cinematic Celestial Moon (Backlight, partially occluded by tree)
    // ------------------------------------------------------------------------
    if (_moonCanvasNormal && _moonCanvasT5) {
      if (t5b < 0.99) {
        ctx.globalAlpha = 1.0 - t5b;
        ctx.drawImage(_moonCanvasNormal, 0, 0);
      }
      if (t5b > 0.01) {
        ctx.globalAlpha = t5b;
        ctx.drawImage(_moonCanvasT5, 0, 0);
      }
      ctx.globalAlpha = 1.0;
    }

    // ------------------------------------------------------------------------
    // LAYER 4: Giant Luminous Spectral Tree (Faceted 3D Ice Prisms)
    // ------------------------------------------------------------------------
    if (_treeCanvasNormal && _treeCanvasT5) {
      if (t5b < 0.99) {
        ctx.globalAlpha = 1.0 - t5b;
        ctx.drawImage(_treeCanvasNormal, 0, 0);
      }
      if (t5b > 0.01) {
        ctx.globalAlpha = t5b;
        ctx.drawImage(_treeCanvasT5, 0, 0);
      }
      ctx.globalAlpha = 1.0;
    }

    // ------------------------------------------------------------------------
    // LAYER 5: Overexposed Volumetric Light Bloom (Screen blending)
    // ------------------------------------------------------------------------
    if (_bloomCanvasNormal && _bloomCanvasT5) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      if (t5b < 0.99) {
        ctx.globalAlpha = (1.0 - t5b) * 0.90;
        ctx.drawImage(_bloomCanvasNormal, 0, 0);
      }
      if (t5b > 0.01) {
        ctx.globalAlpha = t5b * 0.95;
        ctx.drawImage(_bloomCanvasT5, 0, 0);
      }
      ctx.restore();
    }

    // ------------------------------------------------------------------------
    // LAYER 6: Midground Mirror Shards (Parallax Layer 1: around tree)
    // ------------------------------------------------------------------------
    if (_glassPlates) {
      for (let i = 8; i < 18; i++) {
        drawGlassPlate(ctx, _glassPlates[i], now, gw, gh, isT5, 1.0);
      }
    }

    // ------------------------------------------------------------------------
    // LAYER 7: The Crimson Donghua Energy Ribbon (Sweeping S-Curve)
    // ------------------------------------------------------------------------
    drawCrimsonRibbon(ctx, now, gw, gh, isT5);

    // ------------------------------------------------------------------------
    // LAYER 8: Foreground Huge Mirror Plates (Parallax Layer 2: in front)
    // ------------------------------------------------------------------------
    if (_glassPlates) {
      for (let i = 18; i < _glassPlates.length; i++) {
        drawGlassPlate(ctx, _glassPlates[i], now, gw, gh, isT5, 0.85);
      }
    }

    // ------------------------------------------------------------------------
    // LAYER 9: 3-Family Cinematic Particle System (Micro-Snow, Splinters, Mirror)
    // ------------------------------------------------------------------------
    if (_envParticles) {
      updateAndDrawParticles(ctx, _envParticles, gw, gh, isT5);
    }

    ctx.restore();
    return true;
  },

  drawParticle(ctx, pt, life) {
    ctx.save();
    ctx.translate(pt.x, pt.y);
    const sz = pt.size || 3;
    ctx.fillStyle = pt.color || '#7dd3fc';
    ctx.globalAlpha = Math.max(0, life);
    ctx.beginPath();
    ctx.moveTo(0, -sz);
    ctx.lineTo(sz * 0.5, 0);
    ctx.lineTo(0, sz);
    ctx.lineTo(-sz * 0.5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
};
