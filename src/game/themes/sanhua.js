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

  // 1. COLOSSAL DOMINANT TRUNK (~5x more massive, 35-42% of screen width)
  // Visually 160-210px apparent width for ~480px gameplay viewport!
  const trunkW = Math.max(150, Math.min(210, Math.round(gw * 0.40)));

  // Control points: P0 -> P1 -> P2 -> P3 -> P4 (sharp elbow) -> P5 -> P6 (massive sideways body)
  const p0 = { x: gw * 0.68, y: gh * 1.05 }; // Deep root
  const p1 = { x: gw * 0.65, y: gh * 0.86 }; // Lower trunk
  const p2 = { x: gw * 0.62, y: gh * 0.68 }; // Mid vertical trunk
  const p3 = { x: gw * 0.55, y: gh * 0.53 }; // Beginning of bend
  const p4 = { x: gw * 0.42, y: gh * 0.45 }; // Dramatic sharp elbow turn (~70 degree hook)
  const p5 = { x: gw * 0.26, y: gh * 0.42 }; // Massive horizontal trunk body continuation
  const p6 = { x: gw * 0.12, y: gh * 0.40 }; // Horizontal trunk terminal node

  // Connected colossal trunk segments:
  segments.push(createTreeSegment(p0, p1, trunkW * 1.05, trunkW * 0.95, 0, [
    { t: 0.35, len: trunkW * 0.30, ang: 0.65 },
    { t: 0.70, len: trunkW * 0.32, ang: -0.55 }
  ]));
  segments.push(createTreeSegment(p1, p2, trunkW * 0.95, trunkW * 0.86, 0, [
    { t: 0.40, len: trunkW * 0.28, ang: 0.70 },
    { t: 0.75, len: trunkW * 0.26, ang: -0.60 }
  ]));
  segments.push(createTreeSegment(p2, p3, trunkW * 0.86, trunkW * 0.78, 0, [
    { t: 0.48, len: trunkW * 0.25, ang: 0.55 }
  ]));
  // The dramatic elbow transition (P2 -> P3 -> P4):
  segments.push(createTreeSegment(p3, p4, trunkW * 0.78, trunkW * 0.70, 0, [
    { t: 0.50, len: trunkW * 0.28, ang: -0.65 }
  ]));
  // The massive sideways trunk body (P4 -> P5 -> P6):
  segments.push(createTreeSegment(p4, p5, trunkW * 0.70, trunkW * 0.60, 0, [
    { t: 0.45, len: trunkW * 0.25, ang: 0.50 }
  ]));
  segments.push(createTreeSegment(p5, p6, trunkW * 0.60, trunkW * 0.50, 0, [
    { t: 0.50, len: trunkW * 0.22, ang: -0.45 }
  ]));

  // Lower trunk root spur off P2:
  const pSpur1 = { x: gw * 0.76, y: gh * 0.64 };
  const pSpur2 = { x: gw * 0.86, y: gh * 0.62 };
  segments.push(createTreeSegment(p2, pSpur1, trunkW * 0.28, trunkW * 0.16, 1));
  segments.push(createTreeSegment(pSpur1, pSpur2, trunkW * 0.16, trunkW * 0.08, 2));
  segments.push(createTreeSegment(pSpur2, { x: gw * 0.92, y: gh * 0.59 }, trunkW * 0.08, 3.5, 3));

  // 2. PRIMARY LIMBS ONLY AFTER THE BEND & FROM TRUNK TERMINAL
  // A. Sweeping Left Boughs from Horizontal Trunk Endpoint (P6):
  const pL1_1 = { x: gw * 0.06, y: gh * 0.28 };
  const pL1_2 = { x: gw * 0.02, y: gh * 0.18 };
  segments.push(createTreeSegment(p6, pL1_1, trunkW * 0.38, trunkW * 0.25, 1, [
    { t: 0.5, len: trunkW * 0.20, ang: -0.6 }
  ]));
  segments.push(createTreeSegment(pL1_1, pL1_2, trunkW * 0.25, trunkW * 0.14, 1));
  segments.push(createTreeSegment(pL1_2, { x: -gw * 0.02, y: gh * 0.10 }, trunkW * 0.14, 3.5, 3));
  segments.push(createTreeSegment(pL1_1, { x: gw * 0.08, y: gh * 0.15 }, trunkW * 0.15, 3.0, 3));

  // Lower left tip from P6:
  const pL2_1 = { x: gw * 0.05, y: gh * 0.50 };
  segments.push(createTreeSegment(p6, pL2_1, trunkW * 0.30, trunkW * 0.18, 1));
  segments.push(createTreeSegment(pL2_1, { x: gw * 0.01, y: gh * 0.62 }, trunkW * 0.18, 3.5, 3));

  // B. High Left Antler Bough from Horizontal Trunk Midpoint (P5):
  const pL3_1 = { x: gw * 0.24, y: gh * 0.26 };
  const pL3_2 = { x: gw * 0.20, y: gh * 0.14 };
  segments.push(createTreeSegment(p5, pL3_1, trunkW * 0.35, trunkW * 0.22, 1));
  segments.push(createTreeSegment(pL3_1, pL3_2, trunkW * 0.22, trunkW * 0.12, 1));
  segments.push(createTreeSegment(pL3_2, { x: gw * 0.26, y: gh * 0.07 }, trunkW * 0.12, 3.0, 3));
  segments.push(createTreeSegment(pL3_2, { x: gw * 0.14, y: gh * 0.07 }, trunkW * 0.12, 3.0, 3));

  // C. High Crown Antlers emerging above the Elbow (P4 & P3):
  // Crown Limb 1 (Center-Left):
  const pC1_1 = { x: gw * 0.43, y: gh * 0.28 };
  const pC1_2 = { x: gw * 0.38, y: gh * 0.14 };
  const pC1_3 = { x: gw * 0.34, y: gh * 0.05 };
  segments.push(createTreeSegment(p4, pC1_1, trunkW * 0.40, trunkW * 0.28, 1));
  segments.push(createTreeSegment(pC1_1, pC1_2, trunkW * 0.28, trunkW * 0.18, 1));
  segments.push(createTreeSegment(pC1_2, pC1_3, trunkW * 0.18, trunkW * 0.10, 1));
  segments.push(createTreeSegment(pC1_3, { x: gw * 0.28, y: gh * 0.02 }, trunkW * 0.10, 3.0, 3));

  // Crown Limb 2 (Center-Right, reaching across moon face):
  const pC2_1 = { x: gw * 0.54, y: gh * 0.32 };
  const pC2_2 = { x: gw * 0.63, y: gh * 0.18 };
  const pC2_3 = { x: gw * 0.60, y: gh * 0.07 };
  segments.push(createTreeSegment(p3, pC2_1, trunkW * 0.38, trunkW * 0.26, 1));
  segments.push(createTreeSegment(pC2_1, pC2_2, trunkW * 0.26, trunkW * 0.16, 1));
  segments.push(createTreeSegment(pC2_2, pC2_3, trunkW * 0.16, trunkW * 0.09, 1));
  segments.push(createTreeSegment(pC2_2, { x: gw * 0.72, y: gh * 0.11 }, trunkW * 0.14, 3.0, 3));
  segments.push(createTreeSegment(pC2_3, { x: gw * 0.55, y: gh * 0.02 }, trunkW * 0.09, 3.0, 3));

  return segments;
}

// ----------------------------------------------------------------------------
// FACETED 3D ICE PRISM RENDERING (Section 4 & 5)
// ----------------------------------------------------------------------------
function renderTreePrismsToCanvas(canvas, segments, isT5) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Normal: dominant #ffffff, #eef8ff, #d8edf8; shadow faces #7597b5, #465d7a; deep internal #18283f
  // T5 800+: black obsidian crystal #020203, #070609, #100b0f, #1d0b10 with crimson fractures #ff1744, #ef233c, #ff596e
  const colShadow = isT5 ? '#020203' : '#18283f';
  const colDeepIce = isT5 ? 'rgba(16, 11, 15, 0.95)' : '#465d7a';
  const colMidIce = isT5 ? 'rgba(29, 11, 16, 0.90)' : '#7597b5';
  const colMilky = isT5 ? 'rgba(38, 14, 21, 0.88)' : '#d8edf8';
  const colLight = isT5 ? 'rgba(55, 16, 26, 0.85)' : '#eef8ff';
  const colSpecular = isT5 ? '#ff596e' : '#ffffff';
  const colRim = isT5 ? '#ff1744' : '#ffffff';
  const colFracture = isT5 ? '#ef233c' : 'rgba(255, 255, 255, 0.85)';

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const dx = seg.x2 - seg.x1;
    const dy = seg.y2 - seg.y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const w1 = seg.w1;
    const w2 = seg.w2;

    // 5 Facet cross-section vertices:
    const p1_L = [seg.x1 - nx * w1 * 0.50, seg.y1 - ny * w1 * 0.50];
    const p2_L = [seg.x2 - nx * w2 * 0.50, seg.y2 - ny * w2 * 0.50];

    const p1_ML = [seg.x1 - nx * w1 * 0.18, seg.y1 - ny * w1 * 0.18];
    const p2_ML = [seg.x2 - nx * w2 * 0.18, seg.y2 - ny * w2 * 0.18];

    const p1_C = [seg.x1 + nx * w1 * 0.12, seg.y1 + ny * w1 * 0.12];
    const p2_C = [seg.x2 + nx * w2 * 0.12, seg.y2 + ny * w2 * 0.12];

    const p1_MR = [seg.x1 + nx * w1 * 0.35, seg.y1 + ny * w1 * 0.35];
    const p2_MR = [seg.x2 + nx * w2 * 0.35, seg.y2 + ny * w2 * 0.35];

    const p1_R = [seg.x1 + nx * w1 * 0.50, seg.y1 + ny * w1 * 0.50];
    const p2_R = [seg.x2 + nx * w2 * 0.50, seg.y2 + ny * w2 * 0.50];

    // Face 1: Shadow / Underside
    ctx.fillStyle = colShadow;
    ctx.beginPath();
    ctx.moveTo(p1_L[0], p1_L[1]);
    ctx.lineTo(p2_L[0], p2_L[1]);
    ctx.lineTo(p2_ML[0], p2_ML[1]);
    ctx.lineTo(p1_ML[0], p1_ML[1]);
    ctx.closePath();
    ctx.fill();

    // Face 2: Deep Blue / Internal Obsidian Ice
    ctx.fillStyle = colDeepIce;
    ctx.beginPath();
    ctx.moveTo(p1_ML[0], p1_ML[1]);
    ctx.lineTo(p2_ML[0], p2_ML[1]);
    ctx.lineTo(p2_C[0], p2_C[1]);
    ctx.lineTo(p1_C[0], p1_C[1]);
    ctx.closePath();
    ctx.fill();

    // Face 3: Milky Moonlit / Mid Obsidian Face
    ctx.fillStyle = colMilky;
    ctx.beginPath();
    ctx.moveTo(p1_C[0], p1_C[1]);
    ctx.lineTo(p2_C[0], p2_C[1]);
    ctx.lineTo(p2_MR[0], p2_MR[1]);
    ctx.lineTo(p1_MR[0], p1_MR[1]);
    ctx.closePath();
    ctx.fill();

    // Face 4: Top Lit Face (Near-overexposure to white)
    ctx.fillStyle = colLight;
    ctx.beginPath();
    ctx.moveTo(p1_MR[0], p1_MR[1]);
    ctx.lineTo(p2_MR[0], p2_MR[1]);
    ctx.lineTo(p2_R[0], p2_R[1]);
    ctx.lineTo(p1_R[0], p1_R[1]);
    ctx.closePath();
    ctx.fill();

    // Hot Specular Ridge along ridge line
    if (w1 > 6) {
      ctx.fillStyle = colSpecular;
      ctx.beginPath();
      ctx.moveTo(p1_C[0] - nx * 1.5, p1_C[1] - ny * 1.5);
      ctx.lineTo(p2_C[0] - nx * 1.2, p2_C[1] - ny * 1.2);
      ctx.lineTo(p2_C[0] + nx * 1.5, p2_C[1] + ny * 1.5);
      ctx.lineTo(p1_C[0] + nx * 1.8, p1_C[1] + ny * 1.8);
      ctx.closePath();
      ctx.fill();
    }

    // Bright Rim Edge (Moonlight catch, NO lots of cyan outlines!)
    ctx.strokeStyle = colRim;
    ctx.lineWidth = Math.min(2.0, Math.max(0.8, w2 * 0.05));
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

    // Micro-Fractures inside branch body
    if (seg.fractures && seg.fractures.length > 0) {
      ctx.strokeStyle = colFracture;
      ctx.lineWidth = isT5 ? 1.4 : 1.0;
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
  // SHARED HIYUKI NOTE PALETTE (Combo-Based Color Evolution for Tap + Hold)
  // Guarantees Tap and Hold notes share the same material and evolve together.
  // T0: Frost Blade (0-49) — White 70%, Blue 25%, Red 5%
  // T1: Biting Frost (50-99) — Saturated cold blue + clearer red
  // T2: Sakura Flutter (100-199) — White ice with soft crimson/pink resonance
  // T3: Crystal Surge (200-399) — Bright white/cyan with intense crimson incision
  // T4: Glacial Fracture (400-799) — Luxurious white/ice-blue/pale-violet crystalline
  // T5: Obsidian Hiyuki (800+) — Polished black obsidian + vivid burning crimson
  // ==========================================================================
  _getHiyukiNotePalette(comboOrTier, dead = false, isLight = false) {
    const tier = this._resolveTierNum(comboOrTier);
    const isT5 = tier >= 800;

    if (dead) {
      return {
        tierIndex: -1,
        isObsidian: false,
        bgStops: [
          [0.00, '#475569'],
          [0.40, '#334155'],
          [0.75, '#1e293b'],
          [1.00, '#0f172a']
        ],
        edge: '#64748b',
        facetLight: 'rgba(148, 163, 184, 0.25)',
        facetDark: 'rgba(15, 23, 42, 0.40)',
        resonance: '#94a3b8',
        resonanceGlow: 'rgba(148, 163, 184, 0.15)',
        specular: 'rgba(203, 213, 225, 0.40)',
        finTip: '#64748b',
        holdStops: [
          [0.00, 'rgba(30, 41, 59, 0.15)'],
          [0.25, 'rgba(71, 85, 105, 0.60)'],
          [0.50, 'rgba(148, 163, 184, 0.90)'],
          [0.70, 'rgba(71, 85, 105, 0.60)'],
          [1.00, 'rgba(30, 41, 59, 0.15)']
        ],
        holdHaze: 'rgba(71, 85, 105, 0.08)',
        holdVein: '#64748b',
        holdVeinBloom: 'rgba(71, 85, 105, 0.15)',
        holdTipGrad: ['#475569', '#94a3b8'],
        holdTipEdge: 'rgba(148, 163, 184, 0.50)',
        holdTipFlare: '#94a3b8'
      };
    }

    if (isT5) {
      // T5: 800+ MAX COMBO — BLACK + RED / OBSIDIAN HIYUKI
      // Obsidian Black body 65-75%, Vivid Crimson 20-30%, White specular 5-10%
      return {
        tierIndex: 5,
        isObsidian: true,
        bgStops: [
          [0.00, '#280d14'],
          [0.25, '#1a0d12'],
          [0.50, '#100b0f'],
          [0.75, '#070609'],
          [1.00, '#020203']
        ],
        edge: '#ff1744',
        facetLight: 'rgba(255, 64, 93, 0.22)',
        facetDark: 'rgba(5, 2, 4, 0.70)',
        resonance: '#ff1744',
        resonanceGlow: 'rgba(255, 23, 68, 0.45)',
        specular: '#ffffff',
        finTip: '#ff405d',
        // Hold Note: Dark translucent obsidian-red energy sheet
        holdStops: [
          [0.00, 'rgba(2, 2, 3, 0.85)'],
          [0.18, 'rgba(28, 6, 12, 0.80)'],
          [0.44, '#ffffff'], // Luminous white-hot core
          [0.56, 'rgba(255, 238, 242, 0.95)'],
          [0.64, '#ff1744'], // Vivid crimson vein
          [0.76, 'rgba(239, 35, 60, 0.85)'],
          [0.88, 'rgba(28, 6, 12, 0.80)'],
          [1.00, 'rgba(2, 2, 3, 0.85)']
        ],
        holdHaze: 'rgba(255, 23, 68, 0.12)', // Dark red/crimson haze (NOT blue)
        holdVein: '#ff1744',
        holdVeinBloom: 'rgba(255, 23, 68, 0.35)',
        holdTipGrad: ['#070609', '#1a0d12', '#ff1744', '#ffffff'],
        holdTipEdge: 'rgba(255, 255, 255, 0.95)',
        holdTipFlare: '#ff1744'
      };
    }

    if (tier >= 400) {
      // T4: 400–799 — GLACIAL FRACTURE
      // Luxurious crystalline white, ice blue, pale violet-blue with crimson accents
      return {
        tierIndex: 4,
        isObsidian: false,
        bgStops: [
          [0.00, '#ffffff'],
          [0.22, '#e8e7ff'],
          [0.50, '#b6c8ff'],
          [0.78, '#7c8cf8'],
          [1.00, '#3344a5']
        ],
        edge: '#a5b4fc',
        facetLight: 'rgba(255, 255, 255, 0.65)',
        facetDark: 'rgba(51, 68, 165, 0.30)',
        resonance: '#ff3158',
        resonanceGlow: 'rgba(255, 49, 88, 0.32)',
        specular: '#ffffff',
        finTip: '#c7d2fe',
        holdStops: [
          [0.00, 'rgba(165, 180, 252, 0.15)'],
          [0.18, 'rgba(232, 231, 255, 0.68)'],
          [0.44, '#ffffff'], // Strong white overexposure
          [0.58, 'rgba(255, 245, 248, 0.95)'],
          [0.64, '#ff3158'], // Strong crimson streak
          [0.72, 'rgba(255, 49, 88, 0.38)'],
          [0.86, 'rgba(182, 200, 255, 0.55)'],
          [1.00, 'rgba(124, 140, 248, 0.18)']
        ],
        holdHaze: 'rgba(182, 200, 255, 0.12)', // Slight violet-blue atmospheric tint
        holdVein: '#ff3158',
        holdVeinBloom: 'rgba(255, 49, 88, 0.26)',
        holdTipGrad: ['rgba(182, 200, 255, 0.70)', '#ffffff'],
        holdTipEdge: '#ffffff',
        holdTipFlare: '#ff3158'
      };
    }

    if (tier >= 200) {
      // T3: 200–399 — CRYSTAL SURGE
      // Bright white, strong cyan, small intense crimson incision
      return {
        tierIndex: 3,
        isObsidian: false,
        bgStops: [
          [0.00, '#ffffff'],
          [0.24, '#d9fbff'],
          [0.55, '#67e8f9'],
          [0.82, '#0891b2'],
          [1.00, '#0e4a6a']
        ],
        edge: '#38bdf8',
        facetLight: 'rgba(255, 255, 255, 0.70)',
        facetDark: 'rgba(8, 145, 178, 0.35)',
        resonance: '#ff2a5f',
        resonanceGlow: 'rgba(255, 42, 95, 0.35)',
        specular: '#ffffff',
        finTip: '#67e8f9',
        holdStops: [
          [0.00, 'rgba(103, 232, 249, 0.14)'],
          [0.18, 'rgba(217, 251, 255, 0.72)'],
          [0.44, '#ffffff'], // Very bright white core
          [0.58, 'rgba(255, 245, 248, 0.95)'],
          [0.64, '#ff2a5f'], // Clear red Hiyuki streak
          [0.72, 'rgba(255, 42, 95, 0.35)'],
          [0.86, 'rgba(103, 232, 249, 0.55)'],
          [1.00, 'rgba(8, 145, 178, 0.15)']
        ],
        holdHaze: 'rgba(103, 232, 249, 0.12)', // Strong icy aura
        holdVein: '#ff2a5f',
        holdVeinBloom: 'rgba(255, 42, 95, 0.24)',
        holdTipGrad: ['rgba(103, 232, 249, 0.75)', '#ffffff'],
        holdTipEdge: '#ffffff',
        holdTipFlare: '#ff2a5f'
      };
    }

    if (tier >= 100) {
      // T2: 100–199 — SAKURA FLUTTER
      // White ice remains dominant. Soft sakura pink / crimson refraction
      return {
        tierIndex: 2,
        isObsidian: false,
        bgStops: [
          [0.00, '#ffffff'],
          [0.26, '#dff4ff'],
          [0.54, '#7dd3fc'],
          [0.82, '#fda4af'],
          [1.00, '#f43f5e']
        ],
        edge: '#7dd3fc',
        facetLight: 'rgba(255, 255, 255, 0.65)',
        facetDark: 'rgba(244, 63, 94, 0.25)',
        resonance: '#f43f5e',
        resonanceGlow: 'rgba(244, 63, 94, 0.28)',
        specular: '#ffffff',
        finTip: '#fda4af',
        holdStops: [
          [0.00, 'rgba(125, 211, 252, 0.12)'],
          [0.18, 'rgba(223, 244, 255, 0.65)'],
          [0.44, '#ffffff'], // White core
          [0.58, 'rgba(255, 242, 246, 0.95)'],
          [0.64, '#f43f5e'], // Increased crimson visibility, body NOT pink
          [0.72, 'rgba(244, 63, 94, 0.32)'],
          [0.86, 'rgba(125, 211, 252, 0.50)'],
          [1.00, 'rgba(56, 189, 248, 0.12)']
        ],
        holdHaze: 'rgba(170, 210, 240, 0.10)',
        holdVein: '#f43f5e',
        holdVeinBloom: 'rgba(244, 63, 94, 0.20)',
        holdTipGrad: ['rgba(125, 211, 252, 0.70)', '#ffffff'],
        holdTipEdge: '#ffffff',
        holdTipFlare: '#f43f5e'
      };
    }

    if (tier >= 50) {
      // T1: 50–99 — BITING FROST
      // Saturated cold blue + clearer red
      return {
        tierIndex: 1,
        isObsidian: false,
        bgStops: [
          [0.00, '#ffffff'],
          [0.25, '#c7ecff'],
          [0.56, '#59b9ea'],
          [0.84, '#075985'],
          [1.00, '#043450']
        ],
        edge: '#0ea5e9',
        facetLight: 'rgba(255, 255, 255, 0.60)',
        facetDark: 'rgba(7, 89, 133, 0.35)',
        resonance: '#e11d48',
        resonanceGlow: 'rgba(225, 29, 72, 0.22)',
        specular: '#ffffff',
        finTip: '#59b9ea',
        holdStops: [
          [0.00, 'rgba(89, 185, 234, 0.12)'],
          [0.18, 'rgba(199, 236, 255, 0.65)'],
          [0.44, '#ffffff'], // Brighter white center
          [0.58, 'rgba(255, 245, 248, 0.95)'],
          [0.64, '#e11d48'], // Red streak slightly more visible
          [0.72, 'rgba(225, 29, 72, 0.28)'],
          [0.86, 'rgba(89, 185, 234, 0.50)'],
          [1.00, 'rgba(7, 89, 133, 0.12)']
        ],
        holdHaze: 'rgba(89, 185, 234, 0.10)',
        holdVein: '#e11d48',
        holdVeinBloom: 'rgba(225, 29, 72, 0.18)',
        holdTipGrad: ['rgba(199, 236, 255, 0.70)', '#ffffff'],
        holdTipEdge: '#ffffff',
        holdTipFlare: '#e11d48'
      };
    }

    // T0: 0–49 — FROST BLADE
    // Clean cold Hiyuki ice: White 70%, Blue 25%, Red 5%
    return {
      tierIndex: 0,
      isObsidian: false,
      bgStops: [
        [0.00, '#f7fcff'],
        [0.26, '#d8efff'],
        [0.58, '#8fc9eb'],
        [0.84, '#17334b'],
        [1.00, '#0c1d2c']
      ],
      edge: '#38bdf8',
      facetLight: 'rgba(255, 255, 255, 0.55)',
      facetDark: 'rgba(23, 51, 75, 0.35)',
      resonance: '#be123c',
      resonanceGlow: 'rgba(190, 18, 60, 0.15)',
      specular: '#ffffff',
      finTip: '#8fc9eb',
      holdStops: [
        [0.00, 'rgba(143, 201, 235, 0.10)'],
        [0.18, 'rgba(216, 239, 255, 0.65)'],
        [0.44, '#ffffff'], // Dominant white 70%
        [0.58, 'rgba(255, 245, 248, 0.95)'],
        [0.64, 'rgba(190, 18, 60, 0.60)'], // Subtle crimson 5%
        [0.72, 'rgba(190, 18, 60, 0.20)'],
        [0.86, 'rgba(143, 201, 235, 0.45)'],
        [1.00, 'rgba(23, 51, 75, 0.10)']
      ],
      holdHaze: 'rgba(143, 201, 235, 0.08)',
      holdVein: 'rgba(190, 18, 60, 0.70)',
      holdVeinBloom: 'rgba(190, 18, 60, 0.12)',
      holdTipGrad: ['rgba(216, 239, 255, 0.70)', '#ffffff'],
      holdTipEdge: '#ffffff',
      holdTipFlare: 'rgba(190, 18, 60, 0.75)'
    };
  },

  // ==========================================================================
  // 1. PHROLOVA-STYLE HIYUKI ENERGY TAP NOTES
  // Compact rounded body with lateral ice fin accents (matching Phrolova's proportions)
  // styled with Hiyuki multi-facet translucent frozen ice and combo-evolving colors.
  // ==========================================================================
  bakeTapNote(ctx, x, yTop, w, h, isLight, style) {
    const tier = this._resolveTierNum(style);
    const pal = this._getHiyukiNotePalette(tier, false, isLight);

    const cx = x + w / 2;
    const cy = yTop + h / 2;
    const r = Math.min(8, h * 0.22);
    const finH = Math.max(3, h * 0.22);
    const finExt = Math.max(3, Math.min(5, w * 0.045));
    const left = x + 2;
    const right = x + w - 2;
    const top = yTop + 2;
    const bot = yTop + h - 2;

    ctx.save();

    // 1. Phrolova-Style Silhouette Path (Compact rounded body with lateral ice fin accents)
    const traceSilhouette = (pCtx) => {
      pCtx.beginPath();
      // Top-left corner & top edge
      pCtx.moveTo(left + r, top);
      pCtx.lineTo(right - r, top);
      pCtx.quadraticCurveTo(right, top, right, top + r);
      // Right edge down to right ice fin
      pCtx.lineTo(right, cy - finH);
      pCtx.lineTo(right + finExt, cy);
      pCtx.lineTo(right, cy + finH);
      pCtx.lineTo(right, bot - r);
      pCtx.quadraticCurveTo(right, bot, right - r, bot);
      // Bottom edge
      pCtx.lineTo(left + r, bot);
      pCtx.quadraticCurveTo(left, bot, left, bot - r);
      // Left edge up to left ice fin
      pCtx.lineTo(left, cy + finH);
      pCtx.lineTo(left - finExt, cy);
      pCtx.lineTo(left, cy - finH);
      pCtx.lineTo(left, top + r);
      pCtx.quadraticCurveTo(left, top, left + r, top);
      pCtx.closePath();
    };

    // Base fill: rich multi-stop gradient from shared Hiyuki palette
    const bg = ctx.createLinearGradient(left, top, right, bot);
    for (const [stop, col] of pal.bgStops) {
      bg.addColorStop(stop, col);
    }
    traceSilhouette(ctx);
    ctx.fillStyle = bg;
    ctx.fill();

    // Clip to silhouette for internal facet lighting & resonance
    ctx.save();
    traceSilhouette(ctx);
    ctx.clip();

    // 2. Facet / Glass Lighting (2-4 internal facet planes)
    // A: Upper bright diagonal reflection plane
    ctx.fillStyle = pal.facetLight;
    ctx.beginPath();
    ctx.moveTo(left + r, top);
    ctx.lineTo(right - r, top);
    ctx.lineTo(left + (right - left) * 0.48, cy + 2);
    ctx.closePath();
    ctx.fill();

    // B: Lower darker depth facet
    ctx.fillStyle = pal.facetDark;
    ctx.beginPath();
    ctx.moveTo(left + (right - left) * 0.22, bot);
    ctx.lineTo(right - r, bot);
    ctx.lineTo(right, cy);
    ctx.closePath();
    ctx.fill();

    // C: Thin white specular streak across the upper reflection ridge
    ctx.strokeStyle = pal.specular;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(left + r + 2, top + 1);
    ctx.lineTo(left + (right - left) * 0.48, cy + 1);
    ctx.stroke();

    // D: Center subtle Hiyuki resonance slit / crystal glint
    const slitH = Math.max(5, Math.min(10, h * 0.38));
    const slitX = cx + (pal.isObsidian ? 0 : (right - left) * 0.05);

    // Soft resonance glow
    ctx.fillStyle = pal.resonanceGlow;
    ctx.beginPath();
    ctx.ellipse(slitX, cy, Math.max(3, w * 0.05), slitH * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Resonance crystalline incision line
    ctx.strokeStyle = pal.resonance;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(slitX, cy - slitH);
    ctx.lineTo(slitX, cy + slitH);
    ctx.stroke();

    // Specular micro glint at center
    ctx.fillStyle = pal.specular;
    ctx.beginPath();
    ctx.arc(slitX, cy, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Undo clip

    // 3. Side Ice Fins Highlights
    ctx.fillStyle = pal.finTip;
    // Left tip accent
    ctx.beginPath();
    ctx.moveTo(left - finExt, cy);
    ctx.lineTo(left, cy - finH * 0.6);
    ctx.lineTo(left, cy + finH * 0.6);
    ctx.closePath();
    ctx.fill();
    // Right tip accent
    ctx.beginPath();
    ctx.moveTo(right + finExt, cy);
    ctx.lineTo(right, cy - finH * 0.6);
    ctx.lineTo(right, cy + finH * 0.6);
    ctx.closePath();
    ctx.fill();

    // 4. Outer Crystal Perimeter Border
    ctx.strokeStyle = pal.edge;
    ctx.lineWidth = pal.isObsidian ? 1.6 : 1.2;
    traceSilhouette(ctx);
    ctx.stroke();

    ctx.restore();
    return true;
  },

  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    return this.bakeTapNote(ctx, x, yTop, w, h, isLight, comboTier);
  },

  // ==========================================================================
  // 2. FLOWING HIYUKI ENERGY SLASH HOLD NOTES
  // EXACT CURRENT SHAPE AND GEOMETRY PRESERVED.
  // Full-width flowing energy body (94-98% of w), fast diagonal blade slash tip,
  // gently wandering crimson energy ribbon, specular hotspot, and combo-adaptive colors.
  // ==========================================================================
  _getHoldPaintCache(w, h, comboTier, dead = false, isLight = false) {
    const width = Math.max(1, Math.round(w));
    const height = Math.max(1, Math.round(h));
    const tier = this._resolveTierNum(comboTier);
    const pal = this._getHiyukiNotePalette(tier, dead, isLight);

    let cache = this._holdPaintCache;
    if (!cache || cache.width !== width || cache.height !== height) {
      cache = this._holdPaintCache = { width, height, entries: new Array(28) };
    }
    const key = (dead ? 12 : pal.tierIndex * 2) + (isLight ? 1 : 0);
    if (cache.entries[key]) return cache.entries[key];

    // Hold body occupies ~96% of note width
    const tailWidth = Math.max(1, Math.round(width * 0.96));
    const tipHeight = Math.min(Math.round(tailWidth * 0.32) + 4, Math.round(height * 0.50));

    // 1. Energy Ribbon Gradient Strip (Hiyuki Cross-Section from shared palette)
    const strip = document.createElement('canvas');
    strip.width = tailWidth;
    strip.height = 4;
    const g = strip.getContext('2d');
    const grad = g.createLinearGradient(0, 0, tailWidth, 0);

    for (const [stop, col] of pal.holdStops) {
      grad.addColorStop(stop, col);
    }
    g.fillStyle = grad;
    g.fillRect(0, 0, tailWidth, 4);

    // 2. Fast Diagonal Slash Blade Tip at yTail (PRESERVED EXACT GEOMETRY)
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
    const tg = pal.holdTipGrad;
    for (let i = 0; i < tg.length; i++) {
      tipGrad.addColorStop(i / (tg.length - 1), tg[i]);
    }
    c.fillStyle = tipGrad;
    c.fill();

    // White-hot / combo-colored leading edge along the crest
    if (!dead) {
      c.strokeStyle = pal.holdTipEdge;
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(tailWidth * 0.12, tipHeight * 0.40);
      c.quadraticCurveTo(tailWidth * 0.28, tipHeight * 0.10, tailWidth * 0.45, 2);
      c.lineTo(tailWidth * 0.82, 2);
      c.stroke();

      // Crimson flare near corner
      c.fillStyle = pal.holdTipFlare;
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
      capHeight: tipHeight, // Backwards compatibility alias
      palette: pal
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
    const pal = paint.palette || this._getHiyukiNotePalette(currentCombo, dead, light);

    const taperH = Math.min(10, Math.round(headH * 0.25));

    ctx.save();
    ctx.fillStyle = pal.isObsidian ? 'rgba(255, 23, 68, 0.25)' : 'rgba(225, 245, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(x + 2, junctionY - taperH);
    ctx.lineTo(x + w - 2, junctionY - taperH);
    ctx.lineTo(x + w * 0.92, junctionY);
    ctx.lineTo(x + w * 0.08, junctionY);
    ctx.closePath();
    ctx.fill();

    // White / crimson refraction flash at junction
    ctx.strokeStyle = pal.isObsidian ? '#ff1744' : '#ffffff';
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
    const pal = paint.palette || this._getHiyukiNotePalette(currentCombo, dead, isLight);
    const left = Math.round(x + (w - paint.tailWidth) / 2);
    const tipHeight = Math.min(paint.tipHeight, length);

    // 1. Fast Slash Blade Tip at yTail (PRESERVED EXACT GEOMETRY)
    ctx.drawImage(paint.tip, 0, 0, paint.tailWidth, tipHeight, left, yTail, paint.tailWidth, tipHeight);

    // 2. Full-Width Flowing Hiyuki Energy Body (PRESERVED EXACT GEOMETRY)
    if (length > tipHeight) {
      const bodyY = yTail + tipHeight;
      const bodyLen = length - tipHeight;

      // LAYER A — OUTER MOTION HAZE (palette-driven haze color: red in T5, icy in T0-T4)
      const hazeW = Math.round(paint.bodyW * 1.08);
      const hazeX = Math.round(x + (w - hazeW) / 2);
      ctx.save();
      ctx.fillStyle = pal.holdHaze;
      ctx.fillRect(hazeX, bodyY, hazeW, bodyLen);
      ctx.restore();

      // LAYER B — MAIN WHITE / OBSIDIAN ENERGY BODY (Broad 96% energy strip)
      ctx.drawImage(paint.strip, left, bodyY, paint.bodyW, bodyLen);

      // Subtle breathing edges (no harsh outline, 2-5% long smooth drift)
      const timeOffset = (now || 0) * 0.0012;
      const driftLeft = Math.sin(timeOffset + bodyY * 0.002) * (paint.bodyW * 0.025);
      const driftRight = Math.cos(timeOffset + bodyY * 0.002) * (paint.bodyW * 0.025);

      if (!dead) {
        ctx.save();
        // Soft outer edge luminescence
        ctx.strokeStyle = pal.isObsidian ? 'rgba(255, 23, 68, 0.45)' : 'rgba(225, 245, 255, 0.50)';
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

        // A: Soft red diffuse bloom behind vein (palette-driven)
        const bloomW = veinW * 2.0;
        ctx.fillStyle = pal.holdVeinBloom;
        ctx.beginPath();
        ctx.moveTo(x0 - bloomW * 0.5, bodyY);
        ctx.bezierCurveTo(xMid - bloomW * 0.5, bodyY + bodyLen * 0.45, xEnd - bloomW * 0.5, bodyY + bodyLen * 0.85, xEnd - bloomW * 0.5, bottom);
        ctx.lineTo(xEnd + bloomW * 0.5, bottom);
        ctx.bezierCurveTo(xEnd + bloomW * 0.5, bodyY + bodyLen * 0.85, xMid + bloomW * 0.5, bodyY + bodyLen * 0.45, x0 + bloomW * 0.5, bodyY);
        ctx.closePath();
        ctx.fill();

        // B: Solid crimson energy ribbon (palette-driven)
        ctx.fillStyle = pal.holdVein;
        ctx.beginPath();
        ctx.moveTo(x0 - veinW * 0.5, bodyY);
        ctx.bezierCurveTo(xMid - veinW * 0.5, bodyY + bodyLen * 0.45, xEnd - veinW * 0.5, bodyY + bodyLen * 0.85, xEnd - veinW * 0.5, bottom);
        ctx.lineTo(xEnd + veinW * 0.5, bottom);
        ctx.bezierCurveTo(xEnd + veinW * 0.5, bodyY + bodyLen * 0.85, xMid + veinW * 0.5, bodyY + bodyLen * 0.45, x0 + veinW * 0.5, bodyY);
        ctx.closePath();
        ctx.fill();

        // LAYER D — HOT SPECULAR CORE (adjacent to crimson vein)
        ctx.strokeStyle = pal.specular;
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
