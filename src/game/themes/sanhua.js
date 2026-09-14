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

function getTrunkSurfacePoint(pStart, pEnd, wStart, wEnd, t, side, overlapIntoTrunk = 10) {
  const cx = pStart.x + (pEnd.x - pStart.x) * t;
  const cy = pStart.y + (pEnd.y - pStart.y) * t;
  const dx = pEnd.x - pStart.x;
  const dy = pEnd.y - pStart.y;
  const len = Math.hypot(dx, dy) || 1;
  const tx = dx / len;
  const ty = dy / len;
  // Perpendicular normal (-ty, tx)
  const nx = -ty;
  const ny = tx;
  const radius = (wStart + (wEnd - wStart) * t) * 0.48;
  const effR = Math.max(0, radius - overlapIntoTrunk);
  return {
    x: cx + nx * effR * side,
    y: cy + ny * effR * side
  };
}

function generateSpectralTree(gw, gh) {
  const segments = [];

  // 1. COLOSSAL DOMINANT TRUNK (35-45% of screen width, 150-210px)
  // Preserved exact colossal thickness and dramatic elbow trajectory
  const trunkW = Math.max(150, Math.min(210, Math.round(gw * 0.40)));

  // Control points: P0 -> P1 -> P2 -> P3 -> P4 (sharp elbow) -> P5 -> P6 (massive sideways body)
  const p0 = { x: gw * 0.68, y: gh * 1.05 }; // Deep root
  const p1 = { x: gw * 0.65, y: gh * 0.86 }; // Lower trunk
  const p2 = { x: gw * 0.62, y: gh * 0.68 }; // Mid vertical trunk
  const p3 = { x: gw * 0.55, y: gh * 0.53 }; // Beginning of bend
  const p4 = { x: gw * 0.42, y: gh * 0.45 }; // Dramatic sharp elbow turn (~70 degree hook)
  const p5 = { x: gw * 0.26, y: gh * 0.42 }; // Massive horizontal trunk body continuation
  const p6 = { x: gw * 0.12, y: gh * 0.40 }; // Horizontal trunk terminal node

  const w0 = trunkW * 1.05;
  const w1 = trunkW * 0.95;
  const w2 = trunkW * 0.86;
  const w3 = trunkW * 0.78;
  const w4 = trunkW * 0.70;
  const w5 = trunkW * 0.60;
  const w6 = trunkW * 0.50;

  // Connected colossal trunk segments (depth = 0):
  segments.push(createTreeSegment(p0, p1, w0, w1, 0, [
    { t: 0.35, len: trunkW * 0.30, ang: 0.65 },
    { t: 0.70, len: trunkW * 0.32, ang: -0.55 }
  ]));
  segments.push(createTreeSegment(p1, p2, w1, w2, 0, [
    { t: 0.40, len: trunkW * 0.28, ang: 0.70 },
    { t: 0.75, len: trunkW * 0.26, ang: -0.60 }
  ]));
  segments.push(createTreeSegment(p2, p3, w2, w3, 0, [
    { t: 0.48, len: trunkW * 0.25, ang: 0.55 }
  ]));
  // The dramatic elbow transition (P2 -> P3 -> P4):
  segments.push(createTreeSegment(p3, p4, w3, w4, 0, [
    { t: 0.50, len: trunkW * 0.28, ang: -0.65 }
  ]));
  // The massive sideways trunk body (P4 -> P5 -> P6):
  segments.push(createTreeSegment(p4, p5, w4, w5, 0, [
    { t: 0.45, len: trunkW * 0.25, ang: 0.50 }
  ]));
  segments.push(createTreeSegment(p5, p6, w5, w6, 0, [
    { t: 0.50, len: trunkW * 0.22, ang: -0.45 }
  ]));

  // Lower trunk root spur off P1->P2 outer surface
  const rootSpur = getTrunkSurfacePoint(p1, p2, w1, w2, 0.85, +1, 10);
  const pSpur1 = { x: gw * 0.76, y: gh * 0.64 };
  const pSpur2 = { x: gw * 0.86, y: gh * 0.62 };
  segments.push(createTreeSegment(rootSpur, pSpur1, trunkW * 0.26, trunkW * 0.16, 1));
  segments.push(createTreeSegment(pSpur1, pSpur2, trunkW * 0.16, trunkW * 0.08, 2));
  segments.push(createTreeSegment(pSpur2, { x: gw * 0.93, y: gh * 0.59 }, trunkW * 0.08, 3.5, 3));

  // 2. PRIMARY LIMBS GROWING FROM TRUNK SURFACE WITH DIRECTIONAL DIVERSITY

  // PRIMARY BRANCH A: Sweeps diagonally upper-left from upper surface of horizontal trunk
  const rootA = getTrunkSurfacePoint(p4, p5, w4, w5, 0.60, +1, 10);
  const pA1 = { x: gw * 0.22, y: gh * 0.28 };
  const pA2 = { x: gw * 0.12, y: gh * 0.18 };
  const pA3 = { x: gw * 0.03, y: gh * 0.11 };
  segments.push(createTreeSegment(rootA, pA1, trunkW * 0.32, trunkW * 0.22, 1, [
    { t: 0.5, len: trunkW * 0.16, ang: -0.5 }
  ]));
  segments.push(createTreeSegment(pA1, pA2, trunkW * 0.22, trunkW * 0.13, 1));
  segments.push(createTreeSegment(pA2, pA3, trunkW * 0.13, 3.5, 3));

  // Secondary fork off A1 curving upward
  const pA_sub = { x: gw * 0.23, y: gh * 0.16 };
  segments.push(createTreeSegment(pA1, pA_sub, trunkW * 0.16, trunkW * 0.09, 2));
  segments.push(createTreeSegment(pA_sub, { x: gw * 0.25, y: gh * 0.08 }, trunkW * 0.09, 3.0, 3));

  // PRIMARY BRANCH B: Continues mostly horizontally from Terminal P6 across left screen
  const rootB = { x: p6.x + 8, y: p6.y }; // 8px overlap into terminal node
  const pB1 = { x: gw * 0.03, y: gh * 0.39 };  // endY ≈ startY (horizontal spread)
  const pB2 = { x: -gw * 0.04, y: gh * 0.42 }; // endY > startY (slight downward dip)
  const pB3 = { x: -gw * 0.09, y: gh * 0.35 }; // curls up at outer edge
  segments.push(createTreeSegment(rootB, pB1, trunkW * 0.36, trunkW * 0.24, 1));
  segments.push(createTreeSegment(pB1, pB2, trunkW * 0.24, trunkW * 0.14, 1));
  segments.push(createTreeSegment(pB2, pB3, trunkW * 0.14, 3.5, 3));

  // Secondary antler fork off B1 heading downward-left
  const pB_sub = { x: -gw * 0.01, y: gh * 0.50 }; // endY > startY
  segments.push(createTreeSegment(pB1, pB_sub, trunkW * 0.18, trunkW * 0.10, 2));
  segments.push(createTreeSegment(pB_sub, { x: -gw * 0.03, y: gh * 0.60 }, trunkW * 0.10, 3.0, 3));

  // PRIMARY BRANCH C: Curves upper-right across sky and moon
  const rootC = getTrunkSurfacePoint(p3, p4, w3, w4, 0.40, +1, 10);
  const pC1 = { x: gw * 0.57, y: gh * 0.30 };
  const pC2 = { x: gw * 0.66, y: gh * 0.21 };
  const pC3 = { x: gw * 0.74, y: gh * 0.15 };
  segments.push(createTreeSegment(rootC, pC1, trunkW * 0.36, trunkW * 0.25, 1, [
    { t: 0.5, len: trunkW * 0.18, ang: 0.5 }
  ]));
  segments.push(createTreeSegment(pC1, pC2, trunkW * 0.25, trunkW * 0.15, 1));
  segments.push(createTreeSegment(pC2, pC3, trunkW * 0.15, 3.5, 3));

  // Secondary branch C-sub1 (curving high above moon)
  const pC_sub1 = { x: gw * 0.60, y: gh * 0.16 };
  segments.push(createTreeSegment(pC1, pC_sub1, trunkW * 0.20, trunkW * 0.11, 2));
  segments.push(createTreeSegment(pC_sub1, { x: gw * 0.58, y: gh * 0.06 }, trunkW * 0.11, 3.0, 3));

  // Secondary tip C-sub2 (sideways reach with slight dip)
  segments.push(createTreeSegment(pC2, { x: gw * 0.75, y: gh * 0.25 }, trunkW * 0.12, 3.0, 3)); // endY > startY

  // PRIMARY BRANCH D: Moves slightly downward/sideways before curling upward
  const rootD = getTrunkSurfacePoint(p4, p5, w4, w5, 0.55, -1, 10);
  const pD1 = { x: gw * 0.24, y: gh * 0.55 }; // endY > startY (temporarily descends)
  const pD2 = { x: gw * 0.16, y: gh * 0.55 }; // endY ≈ startY (horizontal travel)
  const pD3 = { x: gw * 0.10, y: gh * 0.49 }; // curls upward
  segments.push(createTreeSegment(rootD, pD1, trunkW * 0.28, trunkW * 0.19, 1));
  segments.push(createTreeSegment(pD1, pD2, trunkW * 0.19, trunkW * 0.12, 1));
  segments.push(createTreeSegment(pD2, pD3, trunkW * 0.12, 3.5, 3));

  // Secondary branch D-sub descending further downward
  segments.push(createTreeSegment(pD1, { x: gw * 0.21, y: gh * 0.65 }, trunkW * 0.13, 3.0, 3)); // endY > startY

  // PRIMARY BRANCH E: Crown limb sweeping upward/backward near elbow
  const rootE = getTrunkSurfacePoint(p4, p5, w4, w5, 0.10, +1, 10);
  const pE1 = { x: gw * 0.39, y: gh * 0.27 };
  const pE2 = { x: gw * 0.34, y: gh * 0.16 };
  const pE3 = { x: gw * 0.30, y: gh * 0.06 };
  segments.push(createTreeSegment(rootE, pE1, trunkW * 0.28, trunkW * 0.18, 1));
  segments.push(createTreeSegment(pE1, pE2, trunkW * 0.18, trunkW * 0.10, 1));
  segments.push(createTreeSegment(pE2, pE3, trunkW * 0.10, 3.5, 3));

  // Secondary tip E-sub reaching rightward
  segments.push(createTreeSegment(pE1, { x: gw * 0.44, y: gh * 0.19 }, trunkW * 0.13, 3.0, 3));

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

  const drawSegment = (seg) => {
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

    // Bright Rim Edge (Moonlight catch)
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
  };

  // Render Order:
  // 1. Distant secondary branches and tips (depth >= 2)
  // 2. Primary limbs (depth === 1)
  // 3. MAIN COLOSSAL TRUNK (depth === 0)
  // Rendering the main trunk over primary limb bases naturally occludes their insertion!
  const distant = segments.filter(s => s.depth >= 2);
  const primary = segments.filter(s => s.depth === 1);
  const trunk = segments.filter(s => s.depth === 0);

  for (let i = 0; i < distant.length; i++) drawSegment(distant[i]);
  for (let i = 0; i < primary.length; i++) drawSegment(primary[i]);
  for (let i = 0; i < trunk.length; i++) drawSegment(trunk[i]);
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
    strings: ['#eef5f8', '#d8e5eb', '#b8ccd5', '#91aab5'], // Default T0 silver
    stringGlow: 'rgba(170, 203, 221, 0.45)',
    receptorBorder: 'rgba(220, 236, 245, 0.80)',
    particleType: 'petal'
  },
  comboTiers: [
    { min: 0,   max: 49,       name: 'frost_blade',       border: 'rgba(220, 236, 245, 0.75)', glow: 'rgba(180, 210, 225, 0.40)', particleColors: ['#dcecf5', '#9cb9cb', '#ffffff'] },
    { min: 50,  max: 99,       name: 'biting_frost',      border: 'rgba(69, 204, 232, 0.85)',  glow: 'rgba(69, 204, 232, 0.50)',  particleColors: ['#45cce8', '#8de9f7', '#d5f8ff'] },
    { min: 100, max: 199,      name: 'sakura_flutter',    border: 'rgba(67, 143, 200, 0.88)',  glow: 'rgba(67, 143, 200, 0.55)',  particleColors: ['#438fc8', '#83c8ed', '#ccecff'] },
    { min: 200, max: 399,      name: 'crystal_surge',     border: 'rgba(119, 114, 207, 0.90)', glow: 'rgba(119, 114, 207, 0.55)', particleColors: ['#7772cf', '#aaa4ec', '#e1ddff'] },
    { min: 400, max: 799,      name: 'glacial_fracture',  border: 'rgba(161, 139, 211, 0.92)', glow: 'rgba(161, 139, 211, 0.58)', particleColors: ['#a18bd3', '#cdbef0', '#eee7ff'] },
    { min: 800, max: Infinity, name: 'subzero_domain',    border: '#ff1744',                  glow: 'rgba(255, 23, 68, 0.95)',  particleColors: ['#ff1744', '#dc2626', '#18181b', '#000000'] }
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
    if (tier >= 800) return ['#ff536c', '#e62648', '#a5122c', '#540817']; // T5: Crimson / Dark Red
    if (tier >= 400) return ['#eee7ff', '#cdbef0', '#a18bd3', '#7159a6']; // T4: Lilac / Amethyst
    if (tier >= 200) return ['#e1ddff', '#aaa4ec', '#7772cf', '#4e4999']; // T3: Violet
    if (tier >= 100) return ['#ccecff', '#83c8ed', '#438fc8', '#205c91']; // T2: Azure / Blue
    if (tier >= 50)  return ['#d5f8ff', '#8de9f7', '#45cce8', '#1596b5']; // T1: Cyan
    return ['#eef5f8', '#d8e5eb', '#b8ccd5', '#91aab5'];                  // T0: Silver / White
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
        holdVerticalStops: [
          [0.00, 'rgba(30, 41, 59, 0.85)'],
          [0.25, 'rgba(51, 65, 85, 0.88)'],
          [0.50, 'rgba(71, 85, 105, 0.90)'],
          [0.75, 'rgba(100, 116, 139, 0.90)'],
          [1.00, 'rgba(71, 85, 105, 0.82)']
        ],
        holdStops: [
          [0.00, '#1e293b'],
          [0.50, '#475569'],
          [1.00, '#334155']
        ],
        sheenCol: null,
        holdHaze: 'rgba(51, 65, 85, 0.10)',
        holdVein: null,
        holdVeinBloom: null
      };
    }

    if (isT5) {
      // T5: 800+ MAX COMBO — OBSIDIAN BLOOD
      // Polished black obsidian + vivid burning crimson (ZERO BLUE)
      return {
        tierIndex: 5,
        isObsidian: true,
        bgStops: [
          [0.00, '#1b0a10'],
          [0.25, '#10090d'],
          [0.50, '#070609'],
          [0.75, '#020203'],
          [1.00, '#000000']
        ],
        edge: '#ff1744',
        facetLight: 'rgba(255, 23, 68, 0.30)',
        facetDark: 'rgba(2, 2, 3, 0.75)',
        resonance: '#ff1744',
        resonanceGlow: 'rgba(255, 23, 68, 0.45)',
        specular: '#ffffff',
        finTip: '#e61e3c',
        // Vertical gradient: Black -> Dark Red -> Crimson (0.85-0.95 opacity throughout)
        holdVerticalStops: [
          [0.00, 'rgba(8, 3, 6, 0.94)'],     // BOTTOM: #080306
          [0.25, 'rgba(38, 8, 18, 0.90)'],   // MID-LOW: #260812
          [0.50, 'rgba(103, 18, 37, 0.92)'], // MID: #671225
          [0.75, 'rgba(197, 30, 62, 0.95)'], // MID-HIGH: #c51e3e
          [1.00, 'rgba(143, 20, 46, 0.85)']  // TOP: #8f142e
        ],
        holdStops: [
          [0.00, '#080306'],
          [0.50, '#c51e3e'],
          [1.00, '#260812']
        ],
        sheenCol: 'rgba(255, 35, 75, 0.10)',
        holdHaze: 'rgba(197, 30, 62, 0.14)',
        holdVein: null,
        holdVeinBloom: null
      };
    }

    if (tier >= 400) {
      // T4: 400–799 — LUNAR AMETHYST / PRESTIGE ICE
      // Silver-lilac / pale violet crystal (#faf7ff, #ddd5f6, #a998d8, #66549e). NO RED.
      return {
        tierIndex: 4,
        isObsidian: false,
        bgStops: [
          [0.00, '#faf7ff'],
          [0.24, '#ddd5f6'],
          [0.55, '#a998d8'],
          [0.82, '#806cb8'],
          [1.00, '#66549e']
        ],
        edge: '#a998d8',
        facetLight: 'rgba(250, 247, 255, 0.65)',
        facetDark: 'rgba(102, 84, 158, 0.38)',
        resonance: '#a998d8',
        resonanceGlow: 'rgba(169, 152, 216, 0.32)',
        specular: '#ffffff',
        finTip: '#ddd5f6',
        // Vertical gradient: Amethyst hue progression (0.82-0.94 opacity throughout)
        holdVerticalStops: [
          [0.00, 'rgba(85, 66, 126, 0.85)'],  // BOTTOM: #55427e
          [0.25, 'rgba(120, 98, 169, 0.88)'], // MID-LOW: #7862a9
          [0.50, 'rgba(165, 143, 208, 0.94)'],// MID: #a58fd0
          [0.75, 'rgba(209, 194, 234, 0.92)'],// MID-HIGH: #d1c2ea
          [1.00, 'rgba(170, 150, 210, 0.82)'] // TOP: #aa96d2
        ],
        holdStops: [
          [0.00, '#55427e'],
          [0.50, '#d1c2ea'],
          [1.00, '#7862a9']
        ],
        sheenCol: 'rgba(209, 194, 234, 0.08)',
        holdHaze: 'rgba(120, 98, 169, 0.12)',
        holdVein: null,
        holdVeinBloom: null
      };
    }

    if (tier >= 200) {
      // T3: 200–399 — FROST VIOLET
      // Cold blue-violet (#f1f0ff, #c5c7f6, #8589d9, #4d4f9e). NO RED.
      return {
        tierIndex: 3,
        isObsidian: false,
        bgStops: [
          [0.00, '#f1f0ff'],
          [0.24, '#c5c7f6'],
          [0.55, '#8589d9'],
          [0.82, '#6163b7'],
          [1.00, '#4d4f9e']
        ],
        edge: '#8589d9',
        facetLight: 'rgba(241, 240, 255, 0.65)',
        facetDark: 'rgba(77, 79, 158, 0.38)',
        resonance: '#8589d9',
        resonanceGlow: 'rgba(133, 137, 217, 0.32)',
        specular: '#ffffff',
        finTip: '#c5c7f6',
        // Vertical gradient: Violet hue progression (0.82-0.94 opacity throughout)
        holdVerticalStops: [
          [0.00, 'rgba(64, 59, 130, 0.85)'],  // BOTTOM: #403b82
          [0.25, 'rgba(98, 93, 180, 0.88)'],  // MID-LOW: #625db4
          [0.50, 'rgba(136, 131, 213, 0.94)'],// MID: #8883d5
          [0.75, 'rgba(182, 177, 235, 0.92)'],// MID-HIGH: #b6b1eb
          [1.00, 'rgba(142, 136, 214, 0.82)'] // TOP: #8e88d6
        ],
        holdStops: [
          [0.00, '#403b82'],
          [0.50, '#b6b1eb'],
          [1.00, '#625db4']
        ],
        sheenCol: 'rgba(182, 177, 235, 0.08)',
        holdHaze: 'rgba(98, 93, 180, 0.12)',
        holdVein: null,
        holdVeinBloom: null
      };
    }

    if (tier >= 100) {
      // T2: 100–199 — DEEP AZURE
      // Richer blue (#e9f7ff, #9ed4f4, #438ec5, #175385). NO RED.
      return {
        tierIndex: 2,
        isObsidian: false,
        bgStops: [
          [0.00, '#e9f7ff'],
          [0.24, '#9ed4f4'],
          [0.55, '#438ec5'],
          [0.82, '#25699e'],
          [1.00, '#175385']
        ],
        edge: '#438ec5',
        facetLight: 'rgba(233, 247, 255, 0.65)',
        facetDark: 'rgba(23, 83, 133, 0.40)',
        resonance: '#438ec5',
        resonanceGlow: 'rgba(67, 142, 197, 0.32)',
        specular: '#ffffff',
        finTip: '#9ed4f4',
        // Vertical gradient: Azure hue progression (0.82-0.94 opacity throughout)
        holdVerticalStops: [
          [0.00, 'rgba(23, 77, 124, 0.85)'],  // BOTTOM: #174d7c
          [0.25, 'rgba(38, 119, 173, 0.88)'], // MID-LOW: #2677ad
          [0.50, 'rgba(77, 164, 214, 0.94)'], // MID: #4da4d6
          [0.75, 'rgba(145, 207, 236, 0.92)'],// MID-HIGH: #91cfec
          [1.00, 'rgba(94, 173, 216, 0.82)']  // TOP: #5eadd8
        ],
        holdStops: [
          [0.00, '#174d7c'],
          [0.50, '#91cfec'],
          [1.00, '#2677ad']
        ],
        sheenCol: 'rgba(145, 207, 236, 0.08)',
        holdHaze: 'rgba(38, 119, 173, 0.12)',
        holdVein: null,
        holdVeinBloom: null
      };
    }

    if (tier >= 50) {
      // T1: 50–99 — GLACIAL CYAN
      // Cold cyan (#effcff, #bdefff, #60c7e8, #197ca5). NO RED.
      return {
        tierIndex: 1,
        isObsidian: false,
        bgStops: [
          [0.00, '#effcff'],
          [0.24, '#bdefff'],
          [0.55, '#60c7e8'],
          [0.82, '#2898c4'],
          [1.00, '#197ca5']
        ],
        edge: '#60c7e8',
        facetLight: 'rgba(239, 252, 255, 0.70)',
        facetDark: 'rgba(25, 124, 165, 0.40)',
        resonance: '#60c7e8',
        resonanceGlow: 'rgba(96, 199, 232, 0.30)',
        specular: '#ffffff',
        finTip: '#bdefff',
        // Vertical gradient: Cyan hue progression (0.82-0.94 opacity throughout)
        holdVerticalStops: [
          [0.00, 'rgba(20, 125, 155, 0.85)'], // BOTTOM: #147d9b
          [0.25, 'rgba(40, 181, 210, 0.88)'], // MID-LOW: #28b5d2
          [0.50, 'rgba(98, 216, 237, 0.94)'], // MID: #62d8ed
          [0.75, 'rgba(167, 239, 248, 0.92)'],// MID-HIGH: #a7eff8
          [1.00, 'rgba(114, 215, 233, 0.82)'] // TOP: #72d7e9
        ],
        holdStops: [
          [0.00, '#147d9b'],
          [0.50, '#a7eff8'],
          [1.00, '#28b5d2']
        ],
        sheenCol: 'rgba(167, 239, 248, 0.08)',
        holdHaze: 'rgba(40, 181, 210, 0.12)',
        holdVein: null,
        holdVeinBloom: null
      };
    }

    // T0: 0–49 — FROZEN SILVER
    // Silver-white / pale ice with pale cyan depth (#f7fbff, #dcecf5, #aacbdd, #668ca5). NO RED.
    return {
      tierIndex: 0,
      isObsidian: false,
      bgStops: [
        [0.00, '#ffffff'],
        [0.25, '#f7fbff'],
        [0.55, '#dcecf5'],
        [0.80, '#aacbdd'],
        [1.00, '#668ca5']
      ],
      edge: '#aacbdd',
      facetLight: 'rgba(255, 255, 255, 0.65)',
      facetDark: 'rgba(102, 140, 165, 0.35)',
      resonance: '#aacbdd',
      resonanceGlow: 'rgba(220, 236, 245, 0.25)',
      specular: '#ffffff',
      finTip: '#dcecf5',
      // Vertical gradient: Silver hue progression (0.82-0.94 opacity throughout)
      holdVerticalStops: [
        [0.00, 'rgba(100, 127, 146, 0.85)'], // BOTTOM: #647f92
        [0.25, 'rgba(168, 194, 210, 0.88)'], // MID-LOW: #a8c2d2
        [0.50, 'rgba(215, 229, 237, 0.94)'], // MID: #d7e5ed
        [0.75, 'rgba(238, 245, 248, 0.92)'], // MID-HIGH: #eef5f8
        [1.00, 'rgba(197, 217, 228, 0.82)']  // TOP: #c5d9e4
      ],
      holdStops: [
        [0.00, '#647f92'],
        [0.50, '#eef5f8'],
        [1.00, '#a8c2d2']
      ],
      sheenCol: 'rgba(238, 245, 248, 0.08)',
      holdHaze: 'rgba(168, 194, 210, 0.12)',
      holdVein: null,
      holdVeinBloom: null
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

    // D: Faceted Ruby Resonance Crystal (Fixed crimson accent across T0-T5)
    const isObsidian = pal.isObsidian;
    const crystalW = Math.max(7, Math.min(12, Math.round(w * 0.105)));
    const crystalH = Math.max(14, Math.min(22, Math.round(h * 0.42)));
    const cw = crystalW * 0.5;
    const ch = crystalH * 0.5;
    const iw = cw * 0.42;
    const ih = ch * 0.42;

    // Restrained soft red glow around crystal
    ctx.fillStyle = isObsidian ? 'rgba(255, 23, 68, 0.35)' : 'rgba(220, 20, 60, 0.28)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, cw * 2.2, ch * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Base deep ruby foundation
    ctx.fillStyle = isObsidian ? '#3a0008' : '#4a0612';
    ctx.beginPath();
    ctx.moveTo(cx, cy - ch);
    ctx.lineTo(cx + cw, cy);
    ctx.lineTo(cx, cy + ch);
    ctx.lineTo(cx - cw, cy);
    ctx.closePath();
    ctx.fill();

    // Left facet: dark ruby
    ctx.fillStyle = isObsidian ? '#7f1022' : '#7f1022';
    ctx.beginPath();
    ctx.moveTo(cx, cy - ch);
    ctx.lineTo(cx - cw, cy);
    ctx.lineTo(cx, cy + ch);
    ctx.lineTo(cx - iw, cy);
    ctx.closePath();
    ctx.fill();

    // Right facet: medium ruby
    ctx.fillStyle = isObsidian ? '#b5122d' : '#c51f3d';
    ctx.beginPath();
    ctx.moveTo(cx, cy - ch);
    ctx.lineTo(cx + cw, cy);
    ctx.lineTo(cx, cy + ch);
    ctx.lineTo(cx + iw, cy);
    ctx.closePath();
    ctx.fill();

    // Center table face: bright crimson
    ctx.fillStyle = isObsidian ? '#ff1744' : '#ff3658';
    ctx.beginPath();
    ctx.moveTo(cx, cy - ih);
    ctx.lineTo(cx + iw, cy);
    ctx.lineTo(cx, cy + ih);
    ctx.lineTo(cx - iw, cy);
    ctx.closePath();
    ctx.fill();

    // Specular micro reflection / glint
    ctx.fillStyle = isObsidian ? '#ffffff' : '#ff8a9b';
    ctx.beginPath();
    ctx.moveTo(cx - iw * 0.4, cy - ih * 0.5);
    ctx.lineTo(cx + iw * 0.2, cy - ih * 0.2);
    ctx.lineTo(cx - iw * 0.1, cy);
    ctx.closePath();
    ctx.fill();

    // Crisp crystal perimeter stroke
    ctx.strokeStyle = isObsidian ? 'rgba(255, 154, 170, 0.75)' : 'rgba(255, 80, 110, 0.65)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(cx, cy - ch);
    ctx.lineTo(cx + cw, cy);
    ctx.lineTo(cx, cy + ch);
    ctx.lineTo(cx - cw, cy);
    ctx.closePath();
    ctx.stroke();

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

    // 2. Receptor Head
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

    // 3. Offscreen Hold Buffer Canvas (prevents destination-in on main canvas ctx)
    const buf = document.createElement('canvas');
    buf.width = tailWidth;
    buf.height = 1000;

    return (cache.entries[key] = {
      strip,
      tip: strip, // Backwards compatibility alias (no separate tip canvas)
      cap: strip, // Backwards compatibility alias
      head,
      buf,
      bodyW: tailWidth,
      tailWidth,  // Backwards compatibility alias
      tipHeight: 0,
      capHeight: 0,
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
    ctx.strokeStyle = pal.isObsidian ? '#ff1744' : (pal.edge || '#ffffff');
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

    const bodyY = yTail;
    const bodyLen = length;
    const bodyW = paint.bodyW;

    // Ensure offscreen buffer canvas is tall enough for bodyLen
    const buf = paint.buf;
    const targetH = Math.max(1000, Math.ceil(bodyLen));
    if (buf.height < targetH) {
      buf.height = targetH;
    }
    const bCtx = buf.getContext('2d');
    bCtx.clearRect(0, 0, bodyW, Math.ceil(bodyLen));

    // 1. Base Energy Body: Vertical Color Gradient (Bottom bodyLen -> Top 0)
    // Darker/richer base near receptor (alpha 0.85-0.95), luminous middle (0.88-0.95),
    // softly defined top end (0.78-0.82) - NEVER faded to near invisibility.
    const vGrad = bCtx.createLinearGradient(0, bodyLen, 0, 0);
    for (const [stop, col] of pal.holdVerticalStops) {
      vGrad.addColorStop(stop, col);
    }
    bCtx.fillStyle = vGrad;
    bCtx.fillRect(0, 0, bodyW, bodyLen);

    // 2. Subtle Horizontal Edge Shading (Solid cross-section, ~10% darker left, ~5% lighter right)
    const hShade = bCtx.createLinearGradient(0, 0, bodyW, 0);
    hShade.addColorStop(0.00, 'rgba(0, 0, 0, 0.12)');
    hShade.addColorStop(0.12, 'rgba(0, 0, 0, 0.00)');
    hShade.addColorStop(0.88, 'rgba(255, 255, 255, 0.00)');
    hShade.addColorStop(1.00, 'rgba(255, 255, 255, 0.06)');
    bCtx.fillStyle = hShade;
    bCtx.fillRect(0, 0, bodyW, bodyLen);

    // 3. Subtle Longitudinal Surface Sheen (Low opacity 0.08-0.10 active specular drift)
    if (pal.sheenCol && !dead) {
      const timeOffset = (now || 0) * 0.0008;
      const sheenW = Math.max(4, Math.round(bodyW * 0.28));
      const sheenBaseX = bodyW * 0.50;
      const drift0 = Math.sin(timeOffset * 0.6 + bodyY * 0.001) * (bodyW * 0.04);
      const driftMid = Math.cos(timeOffset * 0.5 + (bodyY + bodyLen * 0.5) * 0.001) * (bodyW * 0.04);
      const driftEnd = Math.sin(timeOffset * 0.7 + bottom * 0.001) * (bodyW * 0.03);

      const sx0 = sheenBaseX + drift0;
      const sxMid = sheenBaseX + driftMid;
      const sxEnd = sheenBaseX + driftEnd;

      bCtx.save();
      bCtx.fillStyle = pal.sheenCol;
      bCtx.beginPath();
      bCtx.moveTo(sx0 - sheenW * 0.5, 0);
      bCtx.bezierCurveTo(sxMid - sheenW * 0.5, bodyLen * 0.45, sxEnd - sheenW * 0.5, bodyLen * 0.85, sxEnd - sheenW * 0.5, bodyLen);
      bCtx.lineTo(sxEnd + sheenW * 0.5, bodyLen);
      bCtx.bezierCurveTo(sxEnd + sheenW * 0.5, bodyLen * 0.85, sxMid + sheenW * 0.5, bodyLen * 0.45, sx0 + sheenW * 0.5, 0);
      bCtx.closePath();
      bCtx.fill();
      bCtx.restore();
    }

    // 4. Outer Soft Haze (Subtle 0.10-0.14 glow outside the body)
    if (pal.holdHaze && !dead) {
      const hazePad = Math.max(2, Math.round(bodyW * 0.04));
      const hazeX = left - hazePad;
      const hazeW = bodyW + hazePad * 2;
      ctx.save();
      const hGlow = ctx.createLinearGradient(hazeX, 0, hazeX + hazeW, 0);
      hGlow.addColorStop(0.00, 'rgba(0, 0, 0, 0)');
      hGlow.addColorStop(0.35, pal.holdHaze);
      hGlow.addColorStop(0.65, pal.holdHaze);
      hGlow.addColorStop(1.00, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = hGlow;
      ctx.fillRect(hazeX, bodyY, hazeW, bodyLen);
      ctx.restore();
    }

    // 5. Composited Solid Energy Body Blit
    ctx.drawImage(buf, 0, 0, bodyW, bodyLen, left, bodyY, bodyW, bodyLen);

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

    const combo = (typeof window !== 'undefined' && (window.GameState?.combo ?? window.State?.combo)) || 0;
    const pal = this._getHiyukiNotePalette(combo, false, isLight);

    const bg = ctx.createLinearGradient(x, y, x, y + h);
    if (pal.isObsidian) {
      if (isActive) {
        bg.addColorStop(0, 'rgba(255, 23, 68, 0.45)');
        bg.addColorStop(0.5, 'rgba(181, 18, 45, 0.30)');
        bg.addColorStop(1, 'rgba(30, 2, 8, 0.20)');
      } else {
        bg.addColorStop(0, 'rgba(25, 4, 9, 0.50)');
        bg.addColorStop(0.5, 'rgba(14, 2, 5, 0.60)');
        bg.addColorStop(1, 'rgba(4, 1, 2, 0.70)');
      }
    } else {
      if (isActive) {
        bg.addColorStop(0, pal.facetLight);
        bg.addColorStop(0.5, pal.facetDark);
        bg.addColorStop(1, 'rgba(6, 14, 26, 0.30)');
      } else {
        bg.addColorStop(0, pal.facetDark);
        bg.addColorStop(0.5, 'rgba(6, 14, 26, 0.55)');
        bg.addColorStop(1, 'rgba(2, 6, 15, 0.65)');
      }
    }
    ctx.fillStyle = bg;
    ctx.fillRect(x + 1, y + 1, w - 2, h - 2);

    // Border: tier-coherent edge color
    ctx.strokeStyle = isActive ? (pal.isObsidian ? '#ff1744' : (pal.specular || '#ffffff')) : (pal.edge || '#edf4f8');
    ctx.lineWidth = isActive ? 1.8 : 1.1;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

    // Center glint: matches tier family (NO unrelated red dot in normal tiers)
    ctx.fillStyle = isActive ? (pal.isObsidian ? '#ff5277' : (pal.specular || '#ffffff')) : (pal.resonance || '#edf4f8');
    ctx.beginPath();
    ctx.arc(cx, cy, isActive ? 2.4 : 1.4, 0, Math.PI * 2);
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
