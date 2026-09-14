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
// ----------------------------------------------------------------------------
// HAND-STRUCTURED SPECTRAL CRYSTALLINE TREE (Sections 1, 2, 3, 4, 5)
// One massive dominant trunk (32–52px) sweeping upward before dividing into
// 4 primary antler limbs, with ~6 secondary branches and ~11 terminal crystal tips TOTAL.
// ----------------------------------------------------------------------------
function createTreeSegment(p1, p2, w1, w2, depth, fractures = null) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const effFractures = [];

  if (fractures) {
    for (let f = 0; f < fractures.length; f++) {
      const fr = fractures[f];
      const fx = p1.x + dx * fr.t;
      const fy = p1.y + dy * fr.t;
      const fAng = Math.atan2(dy, dx) + fr.ang;
      effFractures.push({
        x1: fx,
        y1: fy,
        x2: fx + Math.cos(fAng) * fr.len,
        y2: fy + Math.sin(fAng) * fr.len
      });
    }
  }

  return {
    x1: p1.x, y1: p1.y,
    x2: p2.x, y2: p2.y,
    w1, w2,
    depth,
    fractures: effFractures
  };
}

function generateSpectralTree(gw, gh) {
  const segments = [];

  // 1. MASSIVE DOMINANT TRUNK (Sweeps through lower-middle region)
  // Section 3: 15–28% of screen width at thickest section (30–52px)
  const trunkW = Math.max(30, Math.min(52, Math.round(gw * 0.082)));

  const p0 = { x: gw * 0.63, y: gh * 1.01 };
  const p1 = { x: gw * 0.60, y: gh * 0.82 };
  const p2 = { x: gw * 0.55, y: gh * 0.64 };
  const p3 = { x: gw * 0.49, y: gh * 0.47 }; // Major fork junction

  segments.push(createTreeSegment(p0, p1, trunkW, trunkW * 0.88, 0, [
    { t: 0.35, len: trunkW * 0.55, ang: 0.65 },
    { t: 0.70, len: trunkW * 0.60, ang: -0.55 }
  ]));
  segments.push(createTreeSegment(p1, p2, trunkW * 0.88, trunkW * 0.78, 0, [
    { t: 0.40, len: trunkW * 0.50, ang: 0.70 },
    { t: 0.75, len: trunkW * 0.45, ang: -0.60 }
  ]));
  segments.push(createTreeSegment(p2, p3, trunkW * 0.78, trunkW * 0.66, 0, [
    { t: 0.48, len: trunkW * 0.48, ang: 0.55 }
  ]));

  // Lower trunk spur (adds organic bone/crystal shelf)
  const pSpur1 = { x: gw * 0.44, y: gh * 0.60 };
  const pSpur2 = { x: gw * 0.36, y: gh * 0.65 };
  segments.push(createTreeSegment(p2, pSpur1, trunkW * 0.36, trunkW * 0.22, 1));
  segments.push(createTreeSegment(pSpur1, pSpur2, trunkW * 0.22, trunkW * 0.12, 2));
  segments.push(createTreeSegment(pSpur2, { x: gw * 0.29, y: gh * 0.63 }, trunkW * 0.12, 3.5, 3));
  segments.push(createTreeSegment(pSpur2, { x: gw * 0.32, y: gh * 0.72 }, trunkW * 0.12, 3.0, 3));

  // 2. PRIMARY LIMB 1: Massive sweeping left bough (antler curvature)
  const pL1_1 = { x: gw * 0.38, y: gh * 0.41 };
  const pL1_2 = { x: gw * 0.25, y: gh * 0.36 };
  const pL1_3 = { x: gw * 0.15, y: gh * 0.32 };
  segments.push(createTreeSegment(p3, pL1_1, trunkW * 0.60, trunkW * 0.45, 1, [
    { t: 0.5, len: trunkW * 0.35, ang: -0.6 }
  ]));
  segments.push(createTreeSegment(pL1_1, pL1_2, trunkW * 0.45, trunkW * 0.32, 1));
  segments.push(createTreeSegment(pL1_2, pL1_3, trunkW * 0.32, trunkW * 0.20, 1));

  // Secondary branches on Limb 1:
  const pL1_A1 = { x: gw * 0.23, y: gh * 0.22 };
  segments.push(createTreeSegment(pL1_2, pL1_A1, trunkW * 0.24, trunkW * 0.14, 2));
  segments.push(createTreeSegment(pL1_A1, { x: gw * 0.17, y: gh * 0.15 }, trunkW * 0.14, 3.0, 3));
  segments.push(createTreeSegment(pL1_A1, { x: gw * 0.26, y: gh * 0.13 }, trunkW * 0.14, 3.0, 3));

  // Tips on Limb 1:
  segments.push(createTreeSegment(pL1_3, { x: gw * 0.07, y: gh * 0.28 }, trunkW * 0.20, 4.0, 3));
  segments.push(createTreeSegment(pL1_3, { x: gw * 0.10, y: gh * 0.39 }, trunkW * 0.18, 3.0, 3));

  // 3. PRIMARY LIMB 2: High center-left crown antler
  const pL2_1 = { x: gw * 0.46, y: gh * 0.33 };
  const pL2_2 = { x: gw * 0.40, y: gh * 0.20 };
  const pL2_3 = { x: gw * 0.33, y: gh * 0.09 };
  segments.push(createTreeSegment(p3, pL2_1, trunkW * 0.52, trunkW * 0.38, 1));
  segments.push(createTreeSegment(pL2_1, pL2_2, trunkW * 0.38, trunkW * 0.26, 1));
  segments.push(createTreeSegment(pL2_2, pL2_3, trunkW * 0.26, trunkW * 0.16, 1));

  // Secondary on Limb 2:
  const pL2_B1 = { x: gw * 0.46, y: gh * 0.11 };
  segments.push(createTreeSegment(pL2_2, pL2_B1, trunkW * 0.20, trunkW * 0.12, 2));
  segments.push(createTreeSegment(pL2_B1, { x: gw * 0.49, y: gh * 0.03 }, trunkW * 0.12, 3.0, 3));
  segments.push(createTreeSegment(pL2_3, { x: gw * 0.27, y: gh * 0.04 }, trunkW * 0.16, 3.0, 3));

  // 4. PRIMARY LIMB 3: High center-right crown antler
  const pL3_1 = { x: gw * 0.58, y: gh * 0.33 };
  const pL3_2 = { x: gw * 0.65, y: gh * 0.19 };
  const pL3_3 = { x: gw * 0.61, y: gh * 0.08 };
  segments.push(createTreeSegment(p3, pL3_1, trunkW * 0.50, trunkW * 0.36, 1));
  segments.push(createTreeSegment(pL3_1, pL3_2, trunkW * 0.36, trunkW * 0.24, 1));
  segments.push(createTreeSegment(pL3_2, pL3_3, trunkW * 0.24, trunkW * 0.14, 1));

  // Secondary on Limb 3:
  const pL3_C1 = { x: gw * 0.73, y: gh * 0.12 };
  segments.push(createTreeSegment(pL3_2, pL3_C1, trunkW * 0.20, trunkW * 0.12, 2));
  segments.push(createTreeSegment(pL3_C1, { x: gw * 0.79, y: gh * 0.06 }, trunkW * 0.12, 3.0, 3));
  segments.push(createTreeSegment(pL3_3, { x: gw * 0.57, y: gh * 0.02 }, trunkW * 0.14, 3.0, 3));

  // 5. PRIMARY LIMB 4: Sweeping right bough
  const pL4_1 = { x: gw * 0.66, y: gh * 0.45 };
  const pL4_2 = { x: gw * 0.78, y: gh * 0.41 };
  const pL4_3 = { x: gw * 0.89, y: gh * 0.39 };
  segments.push(createTreeSegment(p3, pL4_1, trunkW * 0.48, trunkW * 0.34, 1));
  segments.push(createTreeSegment(pL4_1, pL4_2, trunkW * 0.34, trunkW * 0.22, 1));
  segments.push(createTreeSegment(pL4_2, pL4_3, trunkW * 0.22, trunkW * 0.14, 1));

  // Secondary on Limb 4:
  const pL4_D1 = { x: gw * 0.84, y: gh * 0.29 };
  segments.push(createTreeSegment(pL4_2, pL4_D1, trunkW * 0.18, trunkW * 0.10, 2));
  segments.push(createTreeSegment(pL4_D1, { x: gw * 0.93, y: gh * 0.23 }, trunkW * 0.10, 3.0, 3));
  segments.push(createTreeSegment(pL4_3, { x: gw * 0.97, y: gh * 0.37 }, trunkW * 0.14, 3.0, 3));
  segments.push(createTreeSegment(pL4_3, { x: gw * 0.94, y: gh * 0.48 }, trunkW * 0.12, 3.0, 3));

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
    if (seg.depth >= 3) {
      const tipX = seg.x2 + (dx / len) * w2 * 2.2;
      const tipY = seg.y2 + (dy / len) * w2 * 2.2;
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
  // ==========================================================================
  // ==========================================================================
  // 1. MINIATURE HIYUKI ENERGY SLASH TAP NOTES
  // A small frozen frame of Hiyuki's energy slash: dominant bright overexposed
  // white energy (70-80%), pale ice-blue translucency (15-20%), and ONE elegant
  // crimson energy vein (8-14%) embedded inside with soft red bloom and specular hotspot.
  // Occupies 94-98% of w. Strictly NO rectangular UI borders, cracks, or mosaics.
  // ==========================================================================
  bakeTapNote(ctx, x, yTop, w, h, isLight, style) {
    const tier = this._resolveTierNum(style);
    const isT5 = tier >= 800;

    ctx.save();

    const padX = Math.max(1, Math.round(w * 0.02));
    const left = x + padX;
    const right = x + w - padX;
    const top = yTop;
    const bot = yTop + h;
    const width = right - left;
    const slashInset = Math.max(3, Math.round(h * 0.22));

    // Subtle flowing slash silhouette: left tapered, middle broad, right swept diagonal
    const createSlashPath = (pCtx, insetL, insetR, extraPad = 0) => {
      pCtx.beginPath();
      pCtx.moveTo(left + insetL - extraPad, top - extraPad);
      pCtx.lineTo(right - insetR * 0.4 + extraPad, top - extraPad);
      pCtx.quadraticCurveTo(right + extraPad, top + h * 0.4, right - insetR + extraPad, bot + extraPad);
      pCtx.lineTo(left + extraPad, bot + extraPad);
      pCtx.quadraticCurveTo(left - extraPad, top + h * 0.6, left + insetL - extraPad, top - extraPad);
      pCtx.closePath();
    };

    // LAYER 1 — OUTER ICE HAZE (soft white/blue energy envelope extending 2px beyond core)
    createSlashPath(ctx, slashInset, slashInset, 2);
    if (isT5) {
      ctx.fillStyle = 'rgba(255, 23, 68, 0.12)';
    } else if (isLight) {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.14)';
    } else {
      ctx.fillStyle = 'rgba(170, 210, 240, 0.14)';
    }
    ctx.fill();

    // LAYER 2 — MAIN HIYUKI WHITE ENERGY (70-80% perceived white / silver / pale ice blue)
    createSlashPath(ctx, slashInset, slashInset, 0);

    const slashGrad = ctx.createLinearGradient(left, top, right, bot);
    if (isLight) {
      slashGrad.addColorStop(0.00, 'rgba(170, 210, 240, 0.12)');
      slashGrad.addColorStop(0.20, 'rgba(225, 242, 255, 0.65)');
      slashGrad.addColorStop(0.46, 'rgba(255, 255, 255, 0.98)');
      slashGrad.addColorStop(0.62, 'rgba(245, 250, 255, 0.88)');
      slashGrad.addColorStop(0.85, 'rgba(224, 242, 254, 0.55)');
      slashGrad.addColorStop(1.00, 'rgba(170, 210, 240, 0.15)');
    } else if (isT5) {
      slashGrad.addColorStop(0.00, 'rgba(25, 3, 8, 0.70)');
      slashGrad.addColorStop(0.20, 'rgba(75, 12, 24, 0.85)');
      slashGrad.addColorStop(0.44, 'rgba(255, 255, 255, 0.98)'); // Luminous white-hot core
      slashGrad.addColorStop(0.58, 'rgba(255, 238, 242, 0.92)');
      slashGrad.addColorStop(0.82, 'rgba(185, 28, 50, 0.65)');
      slashGrad.addColorStop(1.00, 'rgba(30, 4, 10, 0.70)');
    } else {
      slashGrad.addColorStop(0.00, 'rgba(170, 210, 240, 0.10)');
      slashGrad.addColorStop(0.20, 'rgba(225, 242, 255, 0.65)');
      slashGrad.addColorStop(0.46, 'rgba(255, 255, 255, 0.98)'); // Bright overexposed core
      slashGrad.addColorStop(0.62, 'rgba(245, 250, 255, 0.85)');
      slashGrad.addColorStop(0.85, 'rgba(200, 230, 250, 0.50)');
      slashGrad.addColorStop(1.00, 'rgba(170, 210, 240, 0.15)');
    }
    ctx.fillStyle = slashGrad;
    ctx.fill();

    // Clip to slash silhouette to embed vein and specular highlights seamlessly
    ctx.clip();

    // LAYER 3 — CRIMSON ENERGY VEIN (asymmetric at 63% across note width, 8-14% wide)
    const redCenter = left + width * 0.63;
    const veinW = Math.max(2, Math.round(width * 0.10));
    const veinHalf = veinW * 0.5;

    // A: Soft red bloom around the vein (looks embedded inside the white energy)
    const bloomW = veinW * 2.2;
    const redBloom = ctx.createLinearGradient(redCenter - bloomW, top, redCenter + bloomW, bot);
    if (isT5) {
      redBloom.addColorStop(0.0, 'rgba(255, 23, 68, 0.0)');
      redBloom.addColorStop(0.5, 'rgba(255, 23, 68, 0.35)');
      redBloom.addColorStop(1.0, 'rgba(255, 23, 68, 0.0)');
    } else {
      redBloom.addColorStop(0.0, 'rgba(239, 51, 79, 0.0)');
      redBloom.addColorStop(0.5, tier >= 200 ? 'rgba(239, 51, 79, 0.28)' : 'rgba(239, 51, 79, 0.18)');
      redBloom.addColorStop(1.0, 'rgba(239, 51, 79, 0.0)');
    }
    ctx.fillStyle = redBloom;
    ctx.fillRect(redCenter - bloomW, top, bloomW * 2, h);

    // B: Elegant Crimson Energy Ribbon
    const veinGrad = ctx.createLinearGradient(redCenter - veinHalf, top, redCenter + veinHalf, bot);
    if (isT5) {
      veinGrad.addColorStop(0.00, 'rgba(185, 28, 50, 0.70)');
      veinGrad.addColorStop(0.40, '#ff1744');
      veinGrad.addColorStop(1.00, 'rgba(239, 51, 79, 0.90)');
    } else {
      veinGrad.addColorStop(0.00, 'rgba(185, 28, 50, 0.55)');
      veinGrad.addColorStop(0.40, 'rgba(255, 90, 110, 0.95)');
      veinGrad.addColorStop(1.00, 'rgba(239, 51, 79, 0.85)');
    }

    ctx.beginPath();
    ctx.moveTo(redCenter - veinHalf - slashInset * 0.3, top);
    ctx.lineTo(redCenter + veinHalf - slashInset * 0.3, top);
    ctx.lineTo(redCenter + veinHalf + slashInset * 0.3, bot);
    ctx.lineTo(redCenter - veinHalf + slashInset * 0.3, bot);
    ctx.closePath();
    ctx.fillStyle = veinGrad;
    ctx.fill();

    // LAYER 4 — SPECULAR HOTSPOT (narrow overexposed white streak near crimson vein)
    const specX = redCenter - veinHalf - Math.max(1, Math.round(width * 0.03));
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(specX - slashInset * 0.3, top + 1);
    ctx.lineTo(specX + slashInset * 0.3, bot - 1);
    ctx.stroke();

    // Leading edge specular sheen along top slash crest
    ctx.strokeStyle = isT5 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 255, 255, 0.88)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(left + slashInset, top);
    ctx.lineTo(right - slashInset * 0.4, top);
    ctx.stroke();

    ctx.restore();
    return true;
  },

  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    return this.bakeTapNote(ctx, x, yTop, w, h, isLight, comboTier);
  },

  // ==========================================================================
  // 2. FLOWING HIYUKI ENERGY SLASH HOLD NOTES
  // Same energy material as the tap note stretched into a continuous flowing wake:
  // broad white-hot energy body (94-98% of w), pale-blue translucent edges,
  // wandering crimson energy vein (7-13% width) with soft red bloom, specular hotspot,
  // terminating at yTail with a fast diagonal slash blade tip (NO crescent).
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

    // Hold body occupies ~96% of note width
    const tailWidth = Math.max(1, Math.round(width * 0.96));
    const tipHeight = Math.min(Math.round(tailWidth * 0.32) + 4, Math.round(height * 0.50));

    // 1. Energy Ribbon Gradient Strip (Hiyuki Cross-Section)
    const strip = document.createElement('canvas');
    strip.width = tailWidth;
    strip.height = 4;
    const g = strip.getContext('2d');
    const grad = g.createLinearGradient(0, 0, tailWidth, 0);

    if (dead) {
      grad.addColorStop(0.00, 'rgba(30, 41, 59, 0.15)');
      grad.addColorStop(0.25, 'rgba(71, 85, 105, 0.60)');
      grad.addColorStop(0.50, 'rgba(148, 163, 184, 0.90)');
      grad.addColorStop(0.70, 'rgba(71, 85, 105, 0.60)');
      grad.addColorStop(1.00, 'rgba(30, 41, 59, 0.15)');
    } else if (isT5) {
      grad.addColorStop(0.00, 'rgba(25, 3, 8, 0.25)');
      grad.addColorStop(0.18, 'rgba(75, 12, 24, 0.65)');
      grad.addColorStop(0.44, '#ffffff'); // Dominant bright white-hot core
      grad.addColorStop(0.56, 'rgba(255, 238, 242, 0.95)');
      grad.addColorStop(0.64, '#ff1744'); // Crimson incision
      grad.addColorStop(0.74, 'rgba(185, 28, 50, 0.65)');
      grad.addColorStop(0.88, 'rgba(75, 12, 24, 0.45)');
      grad.addColorStop(1.00, 'rgba(25, 3, 8, 0.20)');
    } else if (isLight) {
      grad.addColorStop(0.00, 'rgba(186, 230, 253, 0.12)');
      grad.addColorStop(0.20, 'rgba(225, 242, 255, 0.65)');
      grad.addColorStop(0.46, '#ffffff'); // White core
      grad.addColorStop(0.58, 'rgba(255, 240, 245, 0.90)');
      grad.addColorStop(0.64, 'rgba(244, 63, 94, 0.90)'); // Crimson vein
      grad.addColorStop(0.74, 'rgba(225, 29, 72, 0.35)');
      grad.addColorStop(0.88, 'rgba(224, 242, 254, 0.55)');
      grad.addColorStop(1.00, 'rgba(186, 230, 253, 0.12)');
    } else {
      const redAlpha = tier >= 400 ? 0.95 : tier >= 200 ? 0.88 : tier >= 100 ? 0.80 : 0.70;
      grad.addColorStop(0.00, 'rgba(170, 210, 240, 0.10)');
      grad.addColorStop(0.18, 'rgba(225, 242, 255, 0.65)');
      grad.addColorStop(0.44, '#ffffff'); // Dominant white core (70-80%)
      grad.addColorStop(0.58, 'rgba(255, 245, 248, 0.95)');
      grad.addColorStop(0.64, `rgba(255, 75, 100, ${redAlpha})`); // Crimson streak (8-14%)
      grad.addColorStop(0.72, 'rgba(239, 51, 79, 0.35)'); // Soft red bleed
      grad.addColorStop(0.86, 'rgba(200, 230, 250, 0.50)');
      grad.addColorStop(1.00, 'rgba(170, 210, 240, 0.12)');
    }
    g.fillStyle = grad;
    g.fillRect(0, 0, tailWidth, 4);

    // 2. Fast Diagonal Slash Blade Tip at yTail (NO crescent)
    const tip = document.createElement('canvas');
    tip.width = tailWidth;
    tip.height = tipHeight;
    const c = tip.getContext('2d');

    c.save();
    c.beginPath();
    c.moveTo(0, tipHeight);
    c.quadraticCurveTo(tailWidth * 0.12, tipHeight * 0.40, tailWidth * 0.45, 2);
    c.lineTo(tailWidth * 0.82, 2);
    c.quadraticCurveTo(tailWidth * 0.94, tipHeight * 0.45, tailWidth, tipHeight);
    c.closePath();

    const tipGrad = c.createLinearGradient(0, tipHeight, 0, 0);
    if (dead) {
      tipGrad.addColorStop(0, '#475569');
      tipGrad.addColorStop(1, '#94a3b8');
    } else if (isT5) {
      tipGrad.addColorStop(0, 'rgba(185, 28, 50, 0.85)');
      tipGrad.addColorStop(0.6, '#ffffff');
      tipGrad.addColorStop(1, '#ff1744');
    } else {
      tipGrad.addColorStop(0, 'rgba(200, 230, 250, 0.70)');
      tipGrad.addColorStop(0.55, '#ffffff');
      tipGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
    }
    c.fillStyle = tipGrad;
    c.fill();

    // White-hot leading edge along the crest
    if (!dead) {
      c.strokeStyle = isT5 ? 'rgba(255, 255, 255, 0.95)' : '#ffffff';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(tailWidth * 0.12, tipHeight * 0.40);
      c.quadraticCurveTo(tailWidth * 0.28, tipHeight * 0.10, tailWidth * 0.45, 2);
      c.lineTo(tailWidth * 0.82, 2);
      c.stroke();

      // Tiny crimson flare near corner
      c.fillStyle = isT5 ? '#ff1744' : 'rgba(255, 60, 85, 0.95)';
      c.beginPath();
      c.arc(tailWidth * 0.78, 3, 1.8, 0, Math.PI * 2);
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

    return (cache.entries[key] = {
      strip,
      tip,
      cap: tip, // Backwards compatibility alias
      head,
      bodyW: tailWidth,
      tailWidth, // Backwards compatibility alias
      tipHeight,
      capHeight: tipHeight // Backwards compatibility alias
    });
  },

  bakeLongHead(ctx, x, yTop, w, h, isLight, style) {
    return true;
  },

  // Smooth compression taper over last 8-12px into receptor head
  drawNeck(ctx, x, junctionY, w, headH, tile, isReleased = false, currentCombo = 0) {
    const dead = isReleased || !!(tile?.failed || tile?.released);
    const light = typeof document !== 'undefined' && document.body?.getAttribute('data-theme') === 'light';
    const paint = this._getHoldPaintCache(w, headH, currentCombo, dead, light);

    const taperH = Math.min(10, Math.round(headH * 0.25));
    const isT5 = this._resolveTierNum(currentCombo) >= 800;

    ctx.save();
    ctx.fillStyle = isT5 ? 'rgba(255, 23, 68, 0.22)' : 'rgba(225, 245, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(x + 2, junctionY - taperH);
    ctx.lineTo(x + w - 2, junctionY - taperH);
    ctx.lineTo(x + w * 0.92, junctionY);
    ctx.lineTo(x + w * 0.08, junctionY);
    ctx.closePath();
    ctx.fill();

    // White refraction flash at junction
    ctx.strokeStyle = isT5 ? '#ff4060' : '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.08, junctionY);
    ctx.lineTo(x + w * 0.92, junctionY);
    ctx.stroke();
    ctx.restore();

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
    const tipHeight = Math.min(paint.tipHeight, length);

    // 1. Fast Slash Blade Tip at yTail (NO crescent)
    ctx.drawImage(paint.tip, 0, 0, paint.tailWidth, tipHeight, left, yTail, paint.tailWidth, tipHeight);

    // 2. Full-Width Flowing Hiyuki Energy Body (94-98% of w)
    if (length > tipHeight) {
      const bodyY = yTail + tipHeight;
      const bodyLen = length - tipHeight;
      const isT5 = this._resolveTierNum(currentCombo) >= 800;

      // LAYER A — OUTER MOTION HAZE (105-112% of w, soft white-blue envelope)
      const hazeW = Math.round(paint.bodyW * 1.08);
      const hazeX = Math.round(x + (w - hazeW) / 2);
      ctx.save();
      ctx.fillStyle = isT5 ? 'rgba(255, 23, 68, 0.08)' : (isLight ? 'rgba(186, 230, 253, 0.08)' : 'rgba(170, 210, 240, 0.09)');
      ctx.fillRect(hazeX, bodyY, hazeW, bodyLen);
      ctx.restore();

      // LAYER B — MAIN WHITE ENERGY BODY (Broad 96% energy strip)
      ctx.drawImage(paint.strip, left, bodyY, paint.bodyW, bodyLen);

      // Subtle breathing edges (no harsh outline, 2-5% long smooth drift)
      const timeOffset = (now || 0) * 0.0012;
      const driftLeft = Math.sin(timeOffset + bodyY * 0.002) * (paint.bodyW * 0.025);
      const driftRight = Math.cos(timeOffset + bodyY * 0.002) * (paint.bodyW * 0.025);

      if (!dead) {
        ctx.save();
        // Soft outer edge luminescence
        ctx.strokeStyle = isT5 ? 'rgba(255, 255, 255, 0.40)' : 'rgba(225, 245, 255, 0.50)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(left + driftLeft, bodyY);
        ctx.lineTo(left + driftLeft * 0.6, bottom);
        ctx.moveTo(left + paint.bodyW + driftRight, bodyY);
        ctx.lineTo(left + paint.bodyW + driftRight * 0.6, bottom);
        ctx.stroke();

        // LAYER C — CRIMSON ENERGY STREAK (embedded ribbon, 7-13% width, gentle wander)
        const veinW = Math.max(3, Math.round(paint.bodyW * 0.09));
        const redBaseX = left + paint.bodyW * 0.63;
        const drift0 = Math.sin(timeOffset + bodyY * 0.003) * (paint.bodyW * 0.04);
        const driftMid = Math.cos(timeOffset * 0.8 + (bodyY + bodyLen * 0.5) * 0.003) * (paint.bodyW * 0.05);
        const driftEnd = Math.sin(timeOffset * 1.2 + bottom * 0.003) * (paint.bodyW * 0.03);

        const x0 = redBaseX + drift0;
        const xMid = redBaseX + driftMid;
        const xEnd = redBaseX + driftEnd;

        // A: Soft red diffuse bloom behind vein
        const bloomW = veinW * 2.0;
        ctx.fillStyle = isT5 ? 'rgba(255, 23, 68, 0.22)' : 'rgba(239, 51, 79, 0.18)';
        ctx.beginPath();
        ctx.moveTo(x0 - bloomW * 0.5, bodyY);
        ctx.bezierCurveTo(xMid - bloomW * 0.5, bodyY + bodyLen * 0.45, xEnd - bloomW * 0.5, bodyY + bodyLen * 0.85, xEnd - bloomW * 0.5, bottom);
        ctx.lineTo(xEnd + bloomW * 0.5, bottom);
        ctx.bezierCurveTo(xEnd + bloomW * 0.5, bodyY + bodyLen * 0.85, xMid + bloomW * 0.5, bodyY + bodyLen * 0.45, x0 + bloomW * 0.5, bodyY);
        ctx.closePath();
        ctx.fill();

        // B: Solid crimson energy ribbon
        ctx.fillStyle = isT5 ? '#ff1744' : 'rgba(255, 75, 100, 0.88)';
        ctx.beginPath();
        ctx.moveTo(x0 - veinW * 0.5, bodyY);
        ctx.bezierCurveTo(xMid - veinW * 0.5, bodyY + bodyLen * 0.45, xEnd - veinW * 0.5, bodyY + bodyLen * 0.85, xEnd - veinW * 0.5, bottom);
        ctx.lineTo(xEnd + veinW * 0.5, bottom);
        ctx.bezierCurveTo(xEnd + veinW * 0.5, bodyY + bodyLen * 0.85, xMid + veinW * 0.5, bodyY + bodyLen * 0.45, x0 + veinW * 0.5, bodyY);
        ctx.closePath();
        ctx.fill();

        // LAYER D — HOT SPECULAR CORE (adjacent to crimson vein)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        const specOffset = veinW * 0.65;
        ctx.moveTo(x0 - specOffset, bodyY);
        ctx.bezierCurveTo(xMid - specOffset, bodyY + bodyLen * 0.45, xEnd - specOffset, bodyY + bodyLen * 0.85, xEnd - specOffset, bottom);
        ctx.stroke();

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
