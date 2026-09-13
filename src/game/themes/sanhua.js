// ============================================================================
// SANHUA THEME MODULE — Glacio Frost Blade & Sakura (Саньхуа / Морозний Клинок)
// Inspired by Wuthering Waves: Sanhua's Glacio Katana (Hiyuki), Shattered Ice Mirror,
// Miko Attire (White, Crimson Lacquer, Silver), and Encased Flaming Sakura Petals.
// Hold note structure:
//   - Head (нота внизу / рецептор): Katana Scabbard (Ножны)
//   - Body (тело / хвост): Katana Blade emitting rising ice smoke, pink aura & sakura
//   - Tail (конец хвоста / вверху): Katana Hilt (Рукоятка с глазом и гардой-цубой)
// Tap note structure:
//   - Sleek rectangular rhythm tile with crimson lacquer, Glacio cyan border & diamond crest
// ============================================================================

// Preload high-resolution 3D photorealistic sprites for Sanhua hold notes & tap notes
const sanhuaSprites = {
  tapNote:     typeof Image !== 'undefined' ? new Image() : null,
  tapNoteDead: typeof Image !== 'undefined' ? new Image() : null,
  tapNoteT1:   typeof Image !== 'undefined' ? new Image() : null,
  tapNoteT2:   typeof Image !== 'undefined' ? new Image() : null,
  tapNoteT3:   typeof Image !== 'undefined' ? new Image() : null,
  tapNoteT4:   typeof Image !== 'undefined' ? new Image() : null,
  tapNoteT5:   typeof Image !== 'undefined' ? new Image() : null,

  hilt:     typeof Image !== 'undefined' ? new Image() : null,
  hiltDead: typeof Image !== 'undefined' ? new Image() : null,
  hiltT1:   typeof Image !== 'undefined' ? new Image() : null,
  hiltT2:   typeof Image !== 'undefined' ? new Image() : null,
  hiltT3:   typeof Image !== 'undefined' ? new Image() : null,
  hiltT4:   typeof Image !== 'undefined' ? new Image() : null,
  hiltT5:   typeof Image !== 'undefined' ? new Image() : null,

  scabbard:     typeof Image !== 'undefined' ? new Image() : null,
  scabbardDead: typeof Image !== 'undefined' ? new Image() : null,
  scabbardT0:   typeof Image !== 'undefined' ? new Image() : null,
  scabbardT1:   typeof Image !== 'undefined' ? new Image() : null,
  scabbardT2:   typeof Image !== 'undefined' ? new Image() : null,
  scabbardT3:   typeof Image !== 'undefined' ? new Image() : null,
  scabbardT4:   typeof Image !== 'undefined' ? new Image() : null,
  scabbardT5:   typeof Image !== 'undefined' ? new Image() : null,

  blade:     typeof Image !== 'undefined' ? new Image() : null,
  bladeDead: typeof Image !== 'undefined' ? new Image() : null,
  bladeT1:   typeof Image !== 'undefined' ? new Image() : null,
  bladeT2:   typeof Image !== 'undefined' ? new Image() : null,
  bladeT3:   typeof Image !== 'undefined' ? new Image() : null,
  bladeT4:   typeof Image !== 'undefined' ? new Image() : null,
  bladeT5:   typeof Image !== 'undefined' ? new Image() : null
};

const V = 'v=83.0';
const getAssetUrl = (file) => {
  try {
    return new URL(`../../../assets/themes/${file}?${V}`, import.meta.url).href;
  } catch (e) {
    return `./assets/themes/${file}?${V}`;
  }
};

if (sanhuaSprites.tapNote)     sanhuaSprites.tapNote.src     = getAssetUrl('sanhua_tap_note.png');
if (sanhuaSprites.tapNoteDead) sanhuaSprites.tapNoteDead.src = getAssetUrl('sanhua_tap_note_dead.png');
if (sanhuaSprites.tapNoteT1)   sanhuaSprites.tapNoteT1.src   = getAssetUrl('sanhua_tap_note_t1.png');
if (sanhuaSprites.tapNoteT2)   sanhuaSprites.tapNoteT2.src   = getAssetUrl('sanhua_tap_note_t2.png');
if (sanhuaSprites.tapNoteT3)   sanhuaSprites.tapNoteT3.src   = getAssetUrl('sanhua_tap_note_t3.png');
if (sanhuaSprites.tapNoteT4)   sanhuaSprites.tapNoteT4.src   = getAssetUrl('sanhua_tap_note_t4.png');
if (sanhuaSprites.tapNoteT5)   sanhuaSprites.tapNoteT5.src   = getAssetUrl('sanhua_tap_note_t5.png');

if (sanhuaSprites.hilt)        sanhuaSprites.hilt.src        = getAssetUrl('sanhua_hilt_tail.png');
if (sanhuaSprites.hiltDead)    sanhuaSprites.hiltDead.src    = getAssetUrl('sanhua_hilt_tail_dead.png');
if (sanhuaSprites.hiltT1)      sanhuaSprites.hiltT1.src      = getAssetUrl('sanhua_hilt_tail_t1.png');
if (sanhuaSprites.hiltT2)      sanhuaSprites.hiltT2.src      = getAssetUrl('sanhua_hilt_tail_t2.png');
if (sanhuaSprites.hiltT3)      sanhuaSprites.hiltT3.src      = getAssetUrl('sanhua_hilt_tail_t3.png');
if (sanhuaSprites.hiltT4)      sanhuaSprites.hiltT4.src      = getAssetUrl('sanhua_hilt_tail_t4.png');
if (sanhuaSprites.hiltT5)      sanhuaSprites.hiltT5.src      = getAssetUrl('sanhua_hilt_tail_t5.png');

if (sanhuaSprites.scabbard)     sanhuaSprites.scabbard.src     = getAssetUrl('sanhua_scabbard.png');
if (sanhuaSprites.scabbardDead) sanhuaSprites.scabbardDead.src = getAssetUrl('sanhua_scabbard_dead.png');
if (sanhuaSprites.scabbardT0)   sanhuaSprites.scabbardT0.src   = getAssetUrl('sanhua_scabbard_t0.png');
if (sanhuaSprites.scabbardT1)   sanhuaSprites.scabbardT1.src   = getAssetUrl('sanhua_scabbard_t1.png');
if (sanhuaSprites.scabbardT2)   sanhuaSprites.scabbardT2.src   = getAssetUrl('sanhua_scabbard_t2.png');
if (sanhuaSprites.scabbardT3)   sanhuaSprites.scabbardT3.src   = getAssetUrl('sanhua_scabbard_t3.png');
if (sanhuaSprites.scabbardT4)   sanhuaSprites.scabbardT4.src   = getAssetUrl('sanhua_scabbard_t4.png');
if (sanhuaSprites.scabbardT5)   sanhuaSprites.scabbardT5.src   = getAssetUrl('sanhua_scabbard_t5.png');

if (sanhuaSprites.blade)        sanhuaSprites.blade.src        = getAssetUrl('sanhua_blade_seg.png');
if (sanhuaSprites.bladeDead)    sanhuaSprites.bladeDead.src    = getAssetUrl('sanhua_blade_seg_dead.png');
if (sanhuaSprites.bladeT1)      sanhuaSprites.bladeT1.src      = getAssetUrl('sanhua_blade_seg_t1.png');
if (sanhuaSprites.bladeT2)      sanhuaSprites.bladeT2.src      = getAssetUrl('sanhua_blade_seg_t2.png');
if (sanhuaSprites.bladeT3)      sanhuaSprites.bladeT3.src      = getAssetUrl('sanhua_blade_seg_t3.png');
if (sanhuaSprites.bladeT4)      sanhuaSprites.bladeT4.src      = getAssetUrl('sanhua_blade_seg_t4.png');
if (sanhuaSprites.bladeT5)      sanhuaSprites.bladeT5.src      = getAssetUrl('sanhua_blade_seg_t5.png');

// Atmospheric particles cache (snowflakes + falling small sakura petals + ice shards)
let sanhuaPetals = [];
let sanhuaSnowflakes = [];
let sanhuaShards = [];

// ============================================================================
// REALISTIC SAKURA TREE STAMPS & BLOSSOM SPRAY CACHE
// ============================================================================
let _realisticSakuraStamps = null;

function getRealisticSakuraStamps() {
  if (_realisticSakuraStamps) return _realisticSakuraStamps;
  if (typeof document === 'undefined') return null;

  // Single small falling petal (12x12)
  function makeSmallPetalStamp() {
    const c = document.createElement('canvas');
    c.width = 12; c.height = 12;
    const g = c.getContext('2d');

    g.save();
    g.translate(6, 6);
    g.beginPath();
    g.moveTo(0, 4);
    g.bezierCurveTo(-2.5, 2.5, -4, 0, -3.5, -2.5);
    g.quadraticCurveTo(-1, -4.5, 0, -3.5); // notch
    g.quadraticCurveTo(1, -4.5, 3.5, -2.5);
    g.bezierCurveTo(4, 0, 2.5, 2.5, 0, 4);
    g.closePath();

    const grad = g.createLinearGradient(0, 4, 0, -4);
    grad.addColorStop(0, '#e11d48');
    grad.addColorStop(0.35, '#f472b6');
    grad.addColorStop(0.75, '#fbcfe8');
    grad.addColorStop(1, '#ffffff');
    g.fillStyle = grad;
    g.fill();

    g.restore();
    return c;
  }

  // Fluffy blossom cluster stamp (180x180) - Dense, organic texture matching real Sakura photo
  function makeFluffyClusterStamp(seed = 1) {
    const c = document.createElement('canvas');
    c.width = 180; c.height = 180;
    const g = c.getContext('2d');
    const cx = 90, cy = 90;

    // Ambient soft blossom glow
    const aura = g.createRadialGradient(cx, cy, 8, cx, cy, 86);
    aura.addColorStop(0, 'rgba(244, 114, 182, 0.40)');
    aura.addColorStop(0.5, 'rgba(251, 113, 133, 0.16)');
    aura.addColorStop(1, 'transparent');
    g.fillStyle = aura;
    g.beginPath();
    g.arc(cx, cy, 86, 0, Math.PI * 2);
    g.fill();

    let s = seed * 9973;
    function rnd() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    }

    // Soft-diffused base lobes for depth and volume
    const baseLobes = [
      { x: 0, y: 8, r: 42, col: 'rgba(244, 114, 182, 0.70)' },
      { x: -28, y: -8, r: 36, col: 'rgba(251, 113, 133, 0.65)' },
      { x: 26, y: -10, r: 38, col: 'rgba(251, 113, 133, 0.65)' },
      { x: -14, y: 22, r: 34, col: 'rgba(225, 29, 72, 0.60)' },
      { x: 18, y: 20, r: 32, col: 'rgba(225, 29, 72, 0.60)' },
      { x: 0, y: -26, r: 36, col: 'rgba(253, 164, 175, 0.75)' }
    ];
    for (let i = 0; i < baseLobes.length; i++) {
      const bl = baseLobes[i];
      const bgd = g.createRadialGradient(cx + bl.x, cy + bl.y - 4, 3, cx + bl.x, cy + bl.y, bl.r);
      bgd.addColorStop(0, bl.col);
      bgd.addColorStop(0.85, bl.col);
      bgd.addColorStop(1, 'transparent');
      g.fillStyle = bgd;
      g.beginPath();
      g.arc(cx + bl.x, cy + bl.y, bl.r, 0, Math.PI * 2);
      g.fill();
    }

    // Individual textured petals on top
    const numPetals = 160;
    for (let i = 0; i < numPetals; i++) {
      const ang = rnd() * Math.PI * 2;
      const dist = Math.pow(rnd(), 0.7) * 70;
      const px = cx + Math.cos(ang) * dist;
      const py = cy + Math.sin(ang) * dist * 0.85;

      const petalL = 4.5 + rnd() * 5.5;
      const petalW = 2.8 + rnd() * 3.5;
      const rot = rnd() * Math.PI * 2;

      g.save();
      g.translate(px, py);
      g.rotate(rot);

      const isShadow = (py > cy + 12) && (rnd() > 0.4);
      const isHighlight = (py < cy - 8) && (rnd() > 0.4);

      let pCol;
      if (isShadow) {
        pCol = rnd() > 0.5 ? 'rgba(225, 29, 72, 0.65)' : 'rgba(244, 63, 94, 0.70)';
      } else if (isHighlight) {
        pCol = rnd() > 0.5 ? 'rgba(255, 241, 242, 0.85)' : 'rgba(253, 226, 233, 0.88)';
      } else {
        const tone = rnd();
        if (tone < 0.4) pCol = 'rgba(244, 114, 182, 0.82)';
        else if (tone < 0.75) pCol = 'rgba(251, 113, 133, 0.80)';
        else pCol = 'rgba(253, 164, 175, 0.85)';
      }

      g.fillStyle = pCol;
      g.beginPath();
      g.ellipse(0, 0, petalW, petalL, 0, 0, Math.PI * 2);
      g.fill();

      // Delicate stamen center on a few focal blossoms
      if (rnd() > 0.82) {
        g.fillStyle = 'rgba(136, 19, 55, 0.75)';
        g.beginPath();
        g.arc(0, 0, 1.2, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(253, 224, 71, 0.85)';
        g.beginPath();
        g.arc(1.2, -1.0, 0.7, 0, Math.PI * 2);
        g.fill();
      }

      g.restore();
    }

    return c;
  }

  // Small blossom spray for outer weeping twigs (110x110)
  function makeSmallSprayStamp(seed = 2) {
    const c = document.createElement('canvas');
    c.width = 110; c.height = 110;
    const g = c.getContext('2d');
    const cx = 55, cy = 55;

    let s = seed * 7919;
    function rnd() {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    }

    const bgd = g.createRadialGradient(cx, cy - 2, 4, cx, cy, 45);
    bgd.addColorStop(0, 'rgba(244, 114, 182, 0.75)');
    bgd.addColorStop(0.7, 'rgba(251, 113, 133, 0.65)');
    bgd.addColorStop(1, 'transparent');
    g.fillStyle = bgd;
    g.beginPath();
    g.arc(cx, cy, 45, 0, Math.PI * 2);
    g.fill();

    const numPetals = 85;
    for (let i = 0; i < numPetals; i++) {
      const ang = rnd() * Math.PI * 2;
      const dist = Math.pow(rnd(), 0.65) * 44;
      const px = cx + Math.cos(ang) * dist;
      const py = cy + Math.sin(ang) * dist;

      const petalL = 4.0 + rnd() * 4.5;
      const petalW = 2.4 + rnd() * 2.8;
      const rot = rnd() * Math.PI * 2;

      g.save();
      g.translate(px, py);
      g.rotate(rot);

      const tone = rnd();
      let pCol = (tone < 0.4) ? 'rgba(244, 114, 182, 0.85)'
               : (tone < 0.75) ? 'rgba(253, 164, 175, 0.88)'
               : 'rgba(255, 241, 242, 0.90)';

      g.fillStyle = pCol;
      g.beginPath();
      g.ellipse(0, 0, petalW, petalL, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    return c;
  }

  _realisticSakuraStamps = {
    petal: makeSmallPetalStamp(),
    clusterA: makeFluffyClusterStamp(1),
    clusterB: makeFluffyClusterStamp(2),
    clusterC: makeFluffyClusterStamp(3),
    sprayA: makeSmallSprayStamp(4),
    sprayB: makeSmallSprayStamp(5)
  };
  return _realisticSakuraStamps;
}

// Caches for performance optimization
let _flameCanvases = null;

function getFlameCanvases() {
  if (_flameCanvases) return _flameCanvases;
  if (typeof document === 'undefined') return null;

  const size = 64;
  const half = size / 2;

  // 1. T5 Outer Crimson Flame
  const cT5Outer = document.createElement('canvas');
  cT5Outer.width = size; cT5Outer.height = size;
  const gT5O = cT5Outer.getContext('2d');
  const gradT5O = gT5O.createRadialGradient(half, half, 2, half, half, half);
  gradT5O.addColorStop(0,    'rgba(255, 77, 77, 0.85)');
  gradT5O.addColorStop(0.45, 'rgba(255, 23, 68, 0.55)');
  gradT5O.addColorStop(0.8,  'rgba(153, 27, 27, 0.20)');
  gradT5O.addColorStop(1,    'rgba(0, 0, 0, 0)');
  gT5O.fillStyle = gradT5O;
  gT5O.fillRect(0, 0, size, size);

  // 2. T5 Inner Core Flame
  const cT5Core = document.createElement('canvas');
  cT5Core.width = size; cT5Core.height = size;
  const gT5C = cT5Core.getContext('2d');
  const gradT5C = gT5C.createRadialGradient(half, half, 1, half, half, half);
  gradT5C.addColorStop(0,   'rgba(255, 255, 255, 0.90)');
  gradT5C.addColorStop(0.5, 'rgba(255, 77, 77, 0.60)');
  gradT5C.addColorStop(1,   'rgba(220, 38, 38, 0)');
  gT5C.fillStyle = gradT5C;
  gT5C.fillRect(0, 0, size, size);

  // 3. Glacio Cold Ice Outer Flame
  const cIceOuter = document.createElement('canvas');
  cIceOuter.width = size; cIceOuter.height = size;
  const gIceO = cIceOuter.getContext('2d');
  const gradIceO = gIceO.createRadialGradient(half, half, 2, half, half, half);
  gradIceO.addColorStop(0,    'rgba(224, 242, 254, 0.80)');
  gradIceO.addColorStop(0.4,  'rgba(56, 189, 248, 0.50)');
  gradIceO.addColorStop(0.75, 'rgba(14, 165, 233, 0.20)');
  gradIceO.addColorStop(1,    'rgba(2, 132, 199, 0)');
  gIceO.fillStyle = gradIceO;
  gIceO.fillRect(0, 0, size, size);

  // 4. Glacio Cold Ice Core Flame
  const cIceCore = document.createElement('canvas');
  cIceCore.width = size; cIceCore.height = size;
  const gIceC = cIceCore.getContext('2d');
  const gradIceC = gIceC.createRadialGradient(half, half, 1, half, half, half);
  gradIceC.addColorStop(0,   'rgba(255, 255, 255, 0.90)');
  gradIceC.addColorStop(0.5, 'rgba(186, 230, 253, 0.55)');
  gradIceC.addColorStop(1,   'rgba(56, 189, 248, 0)');
  gIceC.fillStyle = gradIceC;
  gIceC.fillRect(0, 0, size, size);

  _flameCanvases = {
    t5Outer: cT5Outer,
    t5Core: cT5Core,
    iceOuter: cIceOuter,
    iceCore: cIceCore
  };
  return _flameCanvases;
}

let _cachedWoodCanvas = null;
let _cachedWoodGw = 0;
let _cachedWoodGh = 0;

function getSakuraWoodCanvas(gw, gh) {
  if (_cachedWoodCanvas && _cachedWoodGw === gw && _cachedWoodGh === gh) {
    return _cachedWoodCanvas;
  }
  if (typeof document === 'undefined') return null;

  const c = document.createElement('canvas');
  c.width = gw;
  c.height = gh;
  const g = c.getContext('2d');

  const rootBase = { x: gw * 0.66, y: gh * 0.98 };
  const trunkMid = { x: gw * 0.65, y: gh * 0.75 };
  const trunkFork = { x: gw * 0.63, y: gh * 0.54 };

  const boughLeftMain = { x: gw * 0.46, y: gh * 0.46 };
  const boughFarLeft = { x: gw * 0.28, y: gh * 0.40 };
  const twigFarLeft1 = { x: gw * 0.15, y: gh * 0.44 };
  const twigFarLeft2 = { x: gw * 0.20, y: gh * 0.32 };
  const twigLeftDrop = { x: gw * 0.18, y: gh * 0.55 };

  const boughHighLeft = { x: gw * 0.38, y: gh * 0.28 };
  const twigHighLeft1 = { x: gw * 0.26, y: gh * 0.20 };
  const twigHighLeft2 = { x: gw * 0.36, y: gh * 0.14 };

  const boughCenterHigh = { x: gw * 0.58, y: gh * 0.34 };
  const twigCenterTop1 = { x: gw * 0.50, y: gh * 0.16 };
  const twigCenterTop2 = { x: gw * 0.62, y: gh * 0.12 };
  const twigCenterTop3 = { x: gw * 0.44, y: gh * 0.08 };

  const boughRightMain = { x: gw * 0.78, y: gh * 0.44 };
  const boughFarRight = { x: gw * 0.88, y: gh * 0.38 };
  const twigRightHigh = { x: gw * 0.76, y: gh * 0.20 };
  const twigRightDrop1 = { x: gw * 0.94, y: gh * 0.42 };
  const twigRightDrop2 = { x: gw * 0.86, y: gh * 0.56 };

  const boughLowerLeft = { x: gw * 0.56, y: gh * 0.62 };
  const twigLowerDrop = { x: gw * 0.45, y: gh * 0.68 };

  function drawWoodSegment(p1, cp, p2, w1, w2) {
    g.save();
    g.beginPath();
    g.moveTo(p1.x, p1.y);
    g.quadraticCurveTo(cp.x, cp.y, p2.x, p2.y);
    g.strokeStyle = '#180f15';
    g.lineWidth = (w1 + w2) * 0.5;
    g.lineCap = 'round';
    g.stroke();

    g.strokeStyle = '#2d1b26';
    g.lineWidth = Math.max(1.2, (w1 + w2) * 0.35);
    g.stroke();

    g.strokeStyle = 'rgba(186, 230, 253, 0.35)';
    g.lineWidth = Math.max(0.7, (w1 + w2) * 0.12);
    g.beginPath();
    g.moveTo(p1.x - (w1 * 0.2), p1.y - (w1 * 0.2));
    g.quadraticCurveTo(cp.x - 1.5, cp.y - 1.5, p2.x - (w2 * 0.2), p2.y - (w2 * 0.2));
    g.stroke();
    g.restore();
  }

  g.save();
  g.strokeStyle = '#150d13';
  g.lineWidth = 14;
  g.beginPath();
  g.moveTo(rootBase.x - 24, rootBase.y);
  g.quadraticCurveTo(rootBase.x - 8, rootBase.y - 14, rootBase.x, rootBase.y - 22);
  g.moveTo(rootBase.x + 26, rootBase.y);
  g.quadraticCurveTo(rootBase.x + 12, rootBase.y - 14, rootBase.x, rootBase.y - 22);
  g.stroke();
  g.restore();

  drawWoodSegment(rootBase, { x: (rootBase.x + trunkMid.x)*0.5 + 4, y: (rootBase.y + trunkMid.y)*0.5 }, trunkMid, 30, 22);
  drawWoodSegment(trunkMid, { x: (trunkMid.x + trunkFork.x)*0.5 - 3, y: (trunkMid.y + trunkFork.y)*0.5 }, trunkFork, 22, 16);

  drawWoodSegment(trunkFork, { x: (trunkFork.x + boughLeftMain.x)*0.5 - 4, y: (trunkFork.y + boughLeftMain.y)*0.5 + 3 }, boughLeftMain, 16, 11);
  drawWoodSegment(boughLeftMain, { x: (boughLeftMain.x + boughFarLeft.x)*0.5 - 4, y: (boughLeftMain.y + boughFarLeft.y)*0.5 + 2 }, boughFarLeft, 11, 7);
  drawWoodSegment(boughFarLeft, { x: (boughFarLeft.x + twigFarLeft1.x)*0.5, y: (boughFarLeft.y + twigFarLeft1.y)*0.5 + 2 }, twigFarLeft1, 6, 2.5);
  drawWoodSegment(boughFarLeft, { x: (boughFarLeft.x + twigLeftDrop.x)*0.5 - 2, y: (boughFarLeft.y + twigLeftDrop.y)*0.5 + 4 }, twigLeftDrop, 5.5, 2.0);
  drawWoodSegment(boughLeftMain, { x: (boughLeftMain.x + boughHighLeft.x)*0.5 + 2, y: (boughLeftMain.y + boughHighLeft.y)*0.5 - 3 }, boughHighLeft, 10, 6);
  drawWoodSegment(boughHighLeft, { x: (boughHighLeft.x + twigHighLeft1.x)*0.5, y: (boughHighLeft.y + twigHighLeft1.y)*0.5 + 2 }, twigHighLeft1, 5.5, 2.2);

  drawWoodSegment(trunkFork, { x: (trunkFork.x + boughCenterHigh.x)*0.5 + 2, y: (trunkFork.y + boughCenterHigh.y)*0.5 - 3 }, boughCenterHigh, 14, 9);
  drawWoodSegment(boughCenterHigh, { x: (boughCenterHigh.x + twigCenterTop1.x)*0.5, y: (boughCenterHigh.y + twigCenterTop1.y)*0.5 + 2 }, twigCenterTop1, 6.5, 2.5);
  drawWoodSegment(boughCenterHigh, { x: (boughCenterHigh.x + twigCenterTop2.x)*0.5, y: (boughCenterHigh.y + twigCenterTop2.y)*0.5 - 2 }, twigCenterTop2, 6, 2.2);

  drawWoodSegment(trunkFork, { x: (trunkFork.x + boughRightMain.x)*0.5 + 4, y: (trunkFork.y + boughRightMain.y)*0.5 + 3 }, boughRightMain, 15, 10);
  drawWoodSegment(boughRightMain, { x: (boughRightMain.x + boughFarRight.x)*0.5 + 3, y: (boughRightMain.y + boughFarRight.y)*0.5 }, boughFarRight, 10, 6.5);
  drawWoodSegment(boughFarRight, { x: (boughFarRight.x + twigRightDrop1.x)*0.5, y: (boughFarRight.y + twigRightDrop1.y)*0.5 + 3 }, twigRightDrop1, 6, 2.5);
  drawWoodSegment(boughFarRight, { x: (boughFarRight.x + twigRightDrop2.x)*0.5 - 2, y: (boughFarRight.y + twigRightDrop2.y)*0.5 + 4 }, twigRightDrop2, 5.5, 2.0);
  drawWoodSegment(boughRightMain, { x: (boughRightMain.x + twigRightHigh.x)*0.5, y: (boughRightMain.y + twigRightHigh.y)*0.5 - 3 }, twigRightHigh, 6.5, 2.5);

  drawWoodSegment(trunkMid, { x: (trunkMid.x + boughLowerLeft.x)*0.5 - 3, y: (trunkMid.y + boughLowerLeft.y)*0.5 + 2 }, boughLowerLeft, 10, 5.5);
  drawWoodSegment(boughLowerLeft, { x: (boughLowerLeft.x + twigLowerDrop.x)*0.5, y: (boughLowerLeft.y + twigLowerDrop.y)*0.5 + 3 }, twigLowerDrop, 5, 2.0);

  _cachedWoodCanvas = c;
  _cachedWoodGw = gw;
  _cachedWoodGh = gh;
  return c;
}

function initAtmosphereParticles(gw, gh, blossomNodes) {
  if (sanhuaPetals.length === 0) {
    for (let i = 0; i < 35; i++) {
      const node = (blossomNodes && blossomNodes.length > 0)
        ? blossomNodes[i % blossomNodes.length]
        : { x: gw * 0.65, y: gh * 0.35 };
      const progress = Math.random();
      const startX = node.x - progress * (gw * 1.25);
      const startY = node.y + progress * (gh * 0.85);

      sanhuaPetals.push({
        x: startX,
        y: startY,
        baseVx: -(2.4 + Math.random() * 2.8),
        baseVy: 0.9 + Math.random() * 1.5,
        rotZ: Math.random() * Math.PI * 2,
        rotSpeedZ: (Math.random() - 0.5) * 0.08,
        flipY: Math.random() * Math.PI * 2,
        flipSpeedY: 0.04 + Math.random() * 0.05,
        tiltX: Math.random() * Math.PI * 2,
        tiltSpeedX: 0.03 + Math.random() * 0.04,
        sz: 3.2 + Math.random() * 4.0, // Small petals: 3px to 7px
        alpha: 0.60 + Math.random() * 0.38,
        seed: Math.random() * 100,
        isFront: Math.random() > 0.45
      });
    }
  }

  if (sanhuaSnowflakes.length === 0) {
    for (let i = 0; i < 30; i++) {
      sanhuaSnowflakes.push({
        x: Math.random() * gw,
        y: Math.random() * gh,
        sz: 1.5 + Math.random() * 3.5,
        speedY: 0.4 + Math.random() * 0.8,
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  if (sanhuaShards.length === 0) {
    for (let i = 0; i < 12; i++) {
      sanhuaShards.push({
        x: Math.random() * gw,
        y: Math.random() * gh,
        sz: 4 + Math.random() * 8,
        aspect: 1.8 + Math.random() * 1.5,
        speedY: 0.2 + Math.random() * 0.5,
        speedX: (Math.random() - 0.5) * 0.2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        alpha: 0.2 + Math.random() * 0.35,
        glint: Math.random() * Math.PI * 2
      });
    }
  }
}

export const SANHUA_THEME = {
  id: 'sanhua',
  nameKey: 'themeSanhua',
  descKey: 'themeSanhuaDesc',
  badgeKey: 'themeSanhuaBadge',
  price: 35,
  unlockedByDefault: false,
  accentColor: '#38bdf8',
  previewBg: 'linear-gradient(135deg, #071326, #0c2340, #1e40af, #020617)',
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

  _getHiltSprite(tierInput, isDead) {
    const tier = this._resolveTierNum(tierInput);
    if (isDead) return sanhuaSprites.hiltDead;
    if (tier >= 800) return sanhuaSprites.hiltT5;
    if (tier >= 400) return sanhuaSprites.hiltT4;
    if (tier >= 200) return sanhuaSprites.hiltT3;
    if (tier >= 100) return sanhuaSprites.hiltT2;
    if (tier >= 50)  return sanhuaSprites.hiltT1;
    return sanhuaSprites.hilt;
  },

  _getScabbardSprite(tierInput, isDead) {
    if (isDead) return sanhuaSprites.scabbardDead;
    const tier = this._resolveTierNum(tierInput);
    if (tier >= 800) return sanhuaSprites.scabbardT5;
    if (tier >= 400) return sanhuaSprites.scabbardT4;
    if (tier >= 200) return sanhuaSprites.scabbardT3;
    if (tier >= 100) return sanhuaSprites.scabbardT2;
    if (tier >= 50)  return sanhuaSprites.scabbardT1;
    return sanhuaSprites.scabbardT0 || sanhuaSprites.scabbard;
  },

  _getBladeSprite(tierInput, isDead) {
    const tier = this._resolveTierNum(tierInput);
    if (isDead) return sanhuaSprites.bladeDead;
    if (tier >= 800) return sanhuaSprites.bladeT5;
    if (tier >= 400) return sanhuaSprites.bladeT4;
    if (tier >= 200) return sanhuaSprites.bladeT3;
    if (tier >= 100) return sanhuaSprites.bladeT2;
    if (tier >= 50)  return sanhuaSprites.bladeT1;
    return sanhuaSprites.blade;
  },

  _getTapSprite(tierInput, isDead) {
    const tier = this._resolveTierNum(tierInput);
    if (isDead) return sanhuaSprites.tapNoteDead;
    if (tier >= 800) return sanhuaSprites.tapNoteT5;
    if (tier >= 400) return sanhuaSprites.tapNoteT4;
    if (tier >= 200) return sanhuaSprites.tapNoteT3;
    if (tier >= 100) return sanhuaSprites.tapNoteT2;
    if (tier >= 50)  return sanhuaSprites.tapNoteT1;
    return sanhuaSprites.tapNote;
  },

  // ==========================================================================
  // 1. TAP NOTE RENDERING — PRESTIGE RECTANGULAR RHYTHM NOTE
  // User Requirement: "обычные ноты сделай как обычно прямоугольными но красивый дизайн им дай"
  // Features:
  // - Standard rectangular rhythm tile spanning the lane
  // - Dark crimson ruby lacquer gradient
  // - Luminous Glacio-cyan outer border with subtle glow
  // - Inner warm gold filigree trim
  // - Top glass specular reflection sheen
  // - Center glowing ruby diamond with sharp 4-pointed white star flare (✦)
  // ==========================================================================
  bakeTapNote(ctx, x, yTop, w, h, isLight, style) {
    const tier = this._resolveTierNum(style);
    const pal = this._getPalette(tier, false);
    const cx = x + w / 2;
    const cy = yTop + h / 2;
    const r = Math.min(6, h * 0.22);

    ctx.save();

    // 1. Draw pre-rendered high-res rectangular sprite if available
    const sprite = this._getTapSprite(tier, false);
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      // Subtle background ice aura
      const glowGrad = ctx.createRadialGradient(cx, cy, w * 0.1, cx, cy, w * 0.65);
      glowGrad.addColorStop(0, pal.laserGlow || 'rgba(56, 189, 248, 0.40)');
      glowGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.10)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(x - 10, yTop - 10, w + 20, h + 20);

      // Draw rectangular sprite
      ctx.drawImage(sprite, Math.round(x + 2), Math.round(yTop + 2), Math.round(w - 4), Math.round(h - 4));

      // Central specular diamond pulse
      ctx.fillStyle = pal.core || '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1.8, w * 0.035), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return true;
    }

    // Procedural Fallback (Pixel-perfect vector canvas rendering):
    // 1. Base Crimson Lacquer Gradient
    const bg = ctx.createLinearGradient(x, yTop, x, yTop + h);
    if (isLight) {
      bg.addColorStop(0, '#fff1f2');
      bg.addColorStop(0.5, '#fecdd3');
      bg.addColorStop(1, '#fda4af');
    } else {
      bg.addColorStop(0, '#b91c1c');
      bg.addColorStop(0.45, '#881337');
      bg.addColorStop(1, '#1e040a');
    }
    ctx.fillStyle = bg;

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x + 2, yTop + 2, w - 4, h - 4, r);
      ctx.fill();
    } else {
      ctx.fillRect(x + 2, yTop + 2, w - 4, h - 4);
    }

    // 2. Glass specular gloss on top half
    const glossH = Math.max(4, Math.round(h * 0.40));
    const glossGrad = ctx.createLinearGradient(x, yTop + 3, x, yTop + 3 + glossH);
    glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
    glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0.04)');
    ctx.fillStyle = glossGrad;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x + 4, yTop + 3, w - 8, glossH, Math.max(2, r - 2));
      ctx.fill();
    } else {
      ctx.fillRect(x + 4, yTop + 3, w - 8, glossH);
    }

    // 3. Inner Gold Trim
    ctx.strokeStyle = pal.goldTrim || 'rgba(245, 158, 11, 0.65)';
    ctx.lineWidth = 1.0;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x + 4, yTop + 4, w - 8, h - 8, Math.max(2, r - 2));
      ctx.stroke();
    } else {
      ctx.strokeRect(x + 4, yTop + 4, w - 8, h - 8);
    }

    // 4. Outer Glacio Ice Border
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 1.6;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x + 2, yTop + 2, w - 4, h - 4, r);
      ctx.stroke();
    } else {
      ctx.strokeRect(x + 2, yTop + 2, w - 4, h - 4);
    }

    // 5. Center Diamond Star Crest (matching Sanhua's Katana)
    const dw = Math.max(7, Math.round(w * 0.09));
    const dh = Math.max(9, Math.round(h * 0.26));
    // Outer black-ruby diamond backing
    ctx.fillStyle = '#20040a';
    ctx.beginPath();
    ctx.moveTo(cx, cy - dh);
    ctx.lineTo(cx + dw, cy);
    ctx.lineTo(cx, cy + dh);
    ctx.lineTo(cx - dw, cy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = pal.crestCol || '#f43f5e';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Inner glowing ruby diamond
    ctx.fillStyle = pal.crestCol || '#e11d48';
    ctx.beginPath();
    ctx.moveTo(cx, cy - dh * 0.68);
    ctx.lineTo(cx + dw * 0.68, cy);
    ctx.lineTo(cx, cy + dh * 0.68);
    ctx.lineTo(cx - dw * 0.68, cy);
    ctx.closePath();
    ctx.fill();

    // 4-pointed specular white cross star
    const starX = Math.max(10, Math.round(w * 0.16));
    const starY = Math.max(5, Math.round(h * 0.16));
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - starX, cy); ctx.lineTo(cx + starX, cy);
    ctx.moveTo(cx, cy - starY); ctx.lineTo(cx, cy + starY);
    ctx.stroke();

    // Central star glint
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return true;
  },

  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    return this.bakeTapNote(ctx, x, yTop, w, h, isLight, comboTier);
  },

  // Leave bakeLongHead blank so that the full Katana Scabbard renders dynamically without clipping
  bakeLongHead(ctx, x, yTop, w, h, isLight, style) {
    return true;
  },

  // ==========================================================================
  // 2. HOLD NOTE HEAD — KATANA SCABBARD (Ножны катаны на рецепторе)
  // User Requirement: "сделай ножны не выше обычной ноты" (scabH <= headH)
  // The blade enters directly into the golden mouth (koiguchi) of the scabbard.
  // ==========================================================================
  drawNeck(ctx, x, junctionY, w, headH, tile, isReleased = false, currentCombo = 0) {
    const dead = isReleased || Boolean(tile && tile.failed);
    const holding = Boolean(tile && tile.holding && tile.hit);
    const liveCombo = (currentCombo !== undefined && currentCombo !== null && currentCombo > 0)
      ? currentCombo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : 0);

    const tier = dead ? 0 : liveCombo;
    const pal = this._getPalette(tier, dead);

    const cx = Math.round(x + w / 2);
    // Slender blade width: proportional to scabbard mouth
    const bladeW = Math.max(14, Math.round(w * 0.20));

    ctx.save();

    const sprite = this._getScabbardSprite(tier, dead);

    // Height strictly constrained to regular note height (scabH <= headH)
    const scabH = Math.round(headH - 2);
    // Scabbard mouth is 50% of scabW; blade steel is 70.4% of bladeW.
    // Setting scabW = bladeW * 1.72 ensures blade steel (0.704*bladeW) < mouth (0.86*bladeW),
    // fitting the blade cleanly and visibly INSIDE the golden mouth of the scabbard!
    const scabW = Math.round(bladeW * 1.72);
    const scabX = Math.round(cx - scabW / 2);
    // Mouth collar sits right at junctionY so blade inserts directly into it
    const scabY = Math.round(junctionY - 1);

    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      // 1. Scabbard mouth aura: Black & Red for T5, Sakura/Glacio for other tiers
      if (!dead) {
        const glowGrad = ctx.createRadialGradient(cx, junctionY, 2, cx, junctionY, bladeW * 1.6);
        const glowRGB = (tier >= 800) ? '255, 23, 68' : ((tier >= 100) ? '244, 63, 94' : '56, 189, 248');
        glowGrad.addColorStop(0, holding ? `rgba(${glowRGB}, 0.75)` : `rgba(${glowRGB}, 0.45)`);
        glowGrad.addColorStop(0.6, `rgba(${glowRGB}, 0.15)`);
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(cx - bladeW * 2.0, junctionY - bladeW * 1.0, bladeW * 4.0, bladeW * 2.0);
      }

      // 2. Draw photorealistic 3D Katana Scabbard (combo tier adapted, strictly <= headH)
      ctx.drawImage(sprite, scabX, scabY, scabW, scabH);

      // 3. Active holding & combo pulse on the scabbard's center ruby diamond
      if (!dead) {
        const crestY = scabY + Math.round(scabH * 0.50);
        const pulse = Math.sin(Date.now() * 0.008) * 0.25 + 0.75;
        const crestR = (holding ? 4.5 : (liveCombo >= 200 ? 3.5 : 2.5)) * pulse;

        // Core glow
        ctx.fillStyle = (liveCombo >= 800) ? '#ff1744' : (liveCombo >= 200 ? '#ff1744' : (pal.core || '#ffffff'));
        ctx.beginPath();
        ctx.arc(cx, crestY, Math.max(2.0, crestR), 0, Math.PI * 2);
        ctx.fill();

        // 4-pointed cross star flare (✦)
        if (holding || liveCombo >= 100) {
          ctx.strokeStyle = (liveCombo >= 800) ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.92)';
          ctx.lineWidth = 1.2;
          const fl = (holding ? 10 : 6) * pulse;
          ctx.beginPath();
          ctx.moveTo(cx - fl, crestY); ctx.lineTo(cx + fl, crestY);
          ctx.moveTo(cx, crestY - fl); ctx.lineTo(cx, crestY + fl);
          ctx.stroke();
        }
      }

      ctx.restore();
      return true;
    }

    // Procedural Fallback:
    const sw = Math.round(bladeW * 1.38);
    const sh = scabH;
    const sx = scabX;

    // Lacquer scabbard body
    const sbg = ctx.createLinearGradient(sx, scabY, sx + sw, scabY);
    sbg.addColorStop(0, dead ? '#1e293b' : '#991b1b');
    sbg.addColorStop(0.4, dead ? '#334155' : '#e11d48');
    sbg.addColorStop(1, dead ? '#0f172a' : '#4c0519');
    ctx.fillStyle = sbg;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(sx, scabY, sw, sh, [2, 2, sw / 2, sw / 2]);
      ctx.fill();
    } else {
      ctx.fillRect(sx, scabY, sw, sh);
    }

    // Golden Koiguchi mouth collar
    ctx.fillStyle = dead ? '#475569' : '#f59e0b';
    ctx.fillRect(sx - 2, scabY, sw + 4, 5);

    ctx.restore();
    return true;
  },

  drawHeadOverlay(ctx, x, yTop, w, h, tile, isLight, now, combo = 0) {
    // Already rendered seamlessly in drawNeck
    return true;
  },

  // ==========================================================================
  // 3. HOLD NOTE TAIL — KATANA HILT (Рукоятка катаны на конце хвоста)
  // User Requirement: "на файле sanhua_hilt_tail_t5.png ты почему то на кронке нарисовал два рога , их там быть не должно"
  // Features:
  // - Clean tsuka handle with blue criss-cross wrapping and gold pommel (NO HORNS!)
  // - Radiant crimson Resonator Eye with white center and cross flare (+)
  // - Elegant circular/oval tsuba collar with soft horizontal pink halo
  // - Zero-gap seamless connection into the blade steel at yTail
  // ==========================================================================
  drawHoldTail(ctx, x, yTail, w, headH, tile, isLight, now, tailH = 0, currentCombo = 0, actualYHeadTop = null, nextTileDist = 9999) {
    const dead = Boolean(tile && tile.failed);
    const holding = Boolean(tile && tile.holding && tile.hit);
    const liveCombo = (currentCombo !== undefined && currentCombo !== null && currentCombo > 0)
      ? currentCombo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : (tile?.style?.tier || 0));

    const tier = dead ? 0 : liveCombo;
    const pal = this._getPalette(tier, dead);

    const cx = Math.round(x + w / 2);
    // Slender blade width: proportional to scabbard mouth
    const bladeW = Math.max(14, Math.round(w * 0.20));

    ctx.save();

    // Safety & Sheathing Docking:
    // The hilt collar must dock against the scabbard mouth (actualYHeadTop) and NEVER fly through it!
    const effectiveCollarY = (actualYHeadTop !== null && actualYHeadTop !== undefined)
      ? Math.min(yTail, actualYHeadTop)
      : yTail;
    const isDocked = (actualYHeadTop !== null && actualYHeadTop !== undefined) && (yTail >= actualYHeadTop - 4);

    // Sizing calibrated so clean hilt collar exactly matches blade steel width at yTail:
    // In clean hilt sprite (180x399), collar bottom is at y=398, width=72, center=89.5
    // In blade sprite (98x435), steel width is 69px (69.0/98.0 = 0.704)
    const bladeSteelW = bladeW * (69.0 / 98.0);
    const hiltScale = bladeSteelW / 72.0;
    const hiltW = Math.round(180 * hiltScale);
    const hiltH = Math.round(399 * hiltScale);
    const hiltX = Math.round(cx - 89.5 * hiltScale);
    const collarYInScaled = 398 * hiltScale;
    // 2px overlap ensures zero seam under any subpixel rasterization
    const hiltY = Math.round(effectiveCollarY - collarYInScaled + 2);

    const sprite = this._getHiltSprite(tier, dead);
    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      // 1. Guard radiant halo aura — color and intensity scales with tier
      if (!dead) {
        const guardGlowY = hiltY + Math.round(335 * hiltScale);
        // Tier-specific guard glow color
        const guardRGB = tier >= 800 ? '255, 23, 68'  :  // vivid crimson-red (Black & Red)
                         tier >= 400 ? '168, 85, 247' :  // electric purple
                         tier >= 200 ? '251, 113, 133' : // coral rose
                         tier >= 100 ? '244, 63, 94'  :  // sakura pink
                         tier >= 50  ? '236, 72, 153' :  // fuchsia
                                       '244, 63, 94';    // default pink
        // Alpha scales with tier: subtle at T0, grows at T4+
        const guardAlphaInner = tier >= 400 ? (holding ? 0.72 : 0.45) :
                                tier >= 200 ? (holding ? 0.62 : 0.38) :
                                             (holding ? 0.55 : 0.28);
        const guardGrad = ctx.createRadialGradient(cx, guardGlowY, bladeW * 0.25, cx, guardGlowY, bladeW * (tier >= 400 ? 2.2 : 1.8));
        guardGrad.addColorStop(0,   `rgba(${guardRGB}, ${guardAlphaInner})`);
        guardGrad.addColorStop(0.7, `rgba(${guardRGB}, 0.06)`);
        guardGrad.addColorStop(1,   'rgba(0, 0, 0, 0)');
        ctx.fillStyle = guardGrad;
        ctx.fillRect(cx - bladeW * 2.2, guardGlowY - bladeW * 1.5, bladeW * 4.4, bladeW * 3.0);

        // Sweeping glowing pink crescent ribbons & floating sakura blossoms curling around the tsuba collar (matching reference image)
        const ribbonY = hiltY + Math.round(330 * hiltScale);
        const ribbonSpread = bladeW * 2.2;
        const ribbonPulse = Math.sin((now || 0) * 0.004) * 0.15 + 0.85;

        // Left curving pink ribbon
        ctx.strokeStyle = (tier >= 800) ? 'rgba(255, 23, 68, 0.70)' : 'rgba(244, 63, 94, 0.70)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx - bladeW * 0.5, ribbonY);
        ctx.quadraticCurveTo(cx - ribbonSpread * 0.65, ribbonY - 7 * ribbonPulse, cx - ribbonSpread, ribbonY - 2);
        ctx.stroke();

        // Right curving pink ribbon
        ctx.beginPath();
        ctx.moveTo(cx + bladeW * 0.5, ribbonY);
        ctx.quadraticCurveTo(cx + ribbonSpread * 0.65, ribbonY - 7 * ribbonPulse, cx + ribbonSpread, ribbonY - 2);
        ctx.stroke();

        // Delicate sakura petal accents at ribbon tips
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(cx - ribbonSpread - 2, ribbonY - 3, 2.2, 0, Math.PI * 2);
        ctx.arc(cx + ribbonSpread + 2, ribbonY - 3, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw photorealistic 3D Katana Hilt (Prismatic, clean without horns)
      ctx.drawImage(sprite, hiltX, hiltY, hiltW, hiltH);

      // 3. Glowing Resonator Eye on the tsuka handle (pulse animation + cross flare)
      // Color and size scale with tier
      if (!dead) {
        const eyeY = hiltY + Math.round(155 * hiltScale);
        const eyePulse = Math.sin((now || 0) * 0.006) * 0.25 + 0.75;
        // Eye radius grows slightly at higher tiers
        const eyeR = Math.max(2.0, bladeW * (tier >= 400 ? 0.17 : 0.14) * eyePulse);
        // Eye color per tier
        const eyeCol = tier >= 800 ? '#ff1744' :
                       tier >= 400 ? '#a855f7' :
                       tier >= 200 ? '#f59e0b' :
                       tier >= 100 ? '#f43f5e' :
                       tier >= 50  ? '#e11d48' : '#ff1744';

        // Radiant eye core
        ctx.fillStyle = eyeCol;
        ctx.beginPath();
        ctx.arc(cx, eyeY, eyeR, 0, Math.PI * 2);
        ctx.fill();

        // White specular hot center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, eyeY, eyeR * 0.45, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal and vertical cross lens flare beams (+)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.lineWidth = 1.2;
        const flareLen = bladeW * (tier >= 400 ? 0.90 : 0.75) * eyePulse;
        ctx.beginPath();
        ctx.moveTo(cx - flareLen, eyeY); ctx.lineTo(cx + flareLen, eyeY);
        ctx.moveTo(cx, eyeY - flareLen * 0.45); ctx.lineTo(cx, eyeY + flareLen * 0.45);
        ctx.stroke();
      }

      // 4. Sheathing Lock / Docking Glint (✦) when hilt collar rests against scabbard mouth
      if (!dead && isDocked) {
        ctx.save();
        const dockY = actualYHeadTop;
        const dockPulse = Math.sin((now || 0) * 0.012) * 0.2 + 0.8;
        const flashW = bladeW * 1.5 * dockPulse;

        // Radiant white contact flash at the junction
        const dockGrad = ctx.createRadialGradient(cx, dockY, 1, cx, dockY, flashW);
        dockGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        dockGrad.addColorStop(0.35, (tier >= 800) ? 'rgba(255, 77, 77, 0.75)' : 'rgba(244, 63, 94, 0.75)');
        dockGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = dockGrad;
        ctx.beginPath();
        ctx.arc(cx, dockY, flashW, 0, Math.PI * 2);
        ctx.fill();

        // Sharp horizontal gleam line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx - flashW * 1.2, dockY);
        ctx.lineTo(cx + flashW * 1.2, dockY);
        ctx.stroke();

        // Subtle expanding shockwave ring
        const ringR = bladeW * (0.8 + ((now || 0) * 0.03 % 1.2));
        const ringAlpha = Math.max(0, 0.6 - (ringR / (bladeW * 2.0)));
        ctx.strokeStyle = (tier >= 800) ? `rgba(255, 23, 68, ${ringAlpha})` : `rgba(56, 189, 248, ${ringAlpha})`;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(cx, dockY, ringR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
      return true;
    }

    // Procedural Fallback:
    const handleW = Math.round(bladeW * 0.55);
    const handleH = Math.round(bladeW * 2.5);
    const handleX = Math.round(cx - handleW / 2);
    const handleY = Math.round(effectiveCollarY - handleH);

    // Blue tsuka handle
    ctx.fillStyle = dead ? '#334155' : '#1e3a8a';
    ctx.fillRect(handleX, handleY, handleW, handleH);

    // Gold pommel
    ctx.fillStyle = dead ? '#64748b' : '#f59e0b';
    ctx.fillRect(handleX - 1, handleY - 4, handleW + 2, 5);

    // Crescent guard
    ctx.strokeStyle = dead ? '#475569' : '#f43f5e';
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(cx, yTail - 4, bladeW * 0.8, Math.PI * 0.8, Math.PI * 0.2, true);
    ctx.stroke();

    ctx.restore();
    return true;
  },

  // ==========================================================================
  // 4. HOLD NOTE BODY — BILLOWING ICE FLAME & SAKURA (Ледяное Пламя в точности как на скрине 3)
  // User Requirement:
  // "так же добавь анимаированны ефект окутывающий клинок леденого пламени в точности как на скрине 3"
  // Features:
  // - Layer 1: Deep Indigo/Violet Mystical Haze Backing (Screen 3 Atmospheric Depth)
  // - Layer 2: Repeating Glacio Crescent Ice Shards/Wings (Screen 3 Wing Ribs)
  // - Layer 3: Volumetric Billowing Ice Flames (Turbulent harmonic cold fire plumes licking flanks)
  // - Layer 4: Katana Blade Steel with glowing hamon & chevron accents (^)
  // - Layer 5: Tumbling 3D Cherry Blossom Sakura Petals rising in convective updraft
  // - Layer 6: Combo Evolution Embers & Sparks (Tiers 100+, 200+, 400+, 800+)
  // ==========================================================================
  drawHoldBody(ctx, x, yTail, w, headH, tile, isLight, now, tailH, currentCombo = 0, actualYHeadTop = null, isReleased = false) {
    const headTopY = (actualYHeadTop !== null && actualYHeadTop !== undefined) ? actualYHeadTop : (yTail + tailH);
    const bodyLen = headTopY - yTail;
    if (bodyLen <= 2) return true;

    const dead = isReleased || Boolean(tile && tile.failed);
    const holding = Boolean(tile && tile.holding && tile.hit);
    const liveCombo = (currentCombo !== undefined && currentCombo !== null && currentCombo > 0)
      ? currentCombo
      : (typeof window !== 'undefined' && window.GameState ? window.GameState.combo : (tile?.style?.tier || 0));

    const tier = dead ? 0 : liveCombo;
    const pal = this._getPalette(tier, dead);

    const cx = Math.round(x + w / 2);
    // Slender blade width: proportional to scabbard mouth and hilt
    const bladeW = Math.max(14, Math.round(w * 0.20));
    const halfW = bladeW / 2;

    ctx.save();

    const isT5 = tier >= 800;

    // ========================================================================
    // LAYER 1: MYSTICAL HAZE BACKING (Screen 3 Backing Atmosphere)
    // Deep dark crimson/black obsidian smoke for T5, royal indigo/violet mist for T0-T4
    // ========================================================================
    if (!dead) {
      const hazeW = bladeW * (4.2 + (tier >= 400 ? 0.8 : tier >= 200 ? 0.4 : 0));
      const hazeGrad = ctx.createLinearGradient(cx - hazeW / 2, 0, cx + hazeW / 2, 0);
      const tierAlphaBase = isT5 ? 0.38 : (tier >= 400 ? 0.32 : tier >= 200 ? 0.26 : tier >= 100 ? 0.20 : 0.14);
      const hazeAlpha = holding ? Math.min(0.55, tierAlphaBase + 0.14) : tierAlphaBase;

      const hazeCol = isT5          ? '180, 10, 30'  : // Black & Red deep crimson smoke
                      (tier >= 400) ? '126, 34, 206' : // Twilight purple
                      (tier >= 200) ? '99, 102, 241' : // Crystal azure-indigo
                      (tier >= 100) ? '79, 70, 229'  : // Glacio deep blue
                                      '56, 56, 180';   // Frost indigo
      hazeGrad.addColorStop(0,    `rgba(${hazeCol}, 0)`);
      hazeGrad.addColorStop(0.25, `rgba(${hazeCol}, ${hazeAlpha * 0.5})`);
      hazeGrad.addColorStop(0.5,  `rgba(${hazeCol}, ${hazeAlpha})`);
      hazeGrad.addColorStop(0.75, `rgba(${hazeCol}, ${hazeAlpha * 0.5})`);
      hazeGrad.addColorStop(1,    `rgba(${hazeCol}, 0)`);
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(Math.round(cx - hazeW / 2), Math.round(yTail), Math.round(hazeW), Math.round(bodyLen));
    }

    // ========================================================================
    // LAYER 2: REPEATING CRESCENT ICE SHARDS / WINGS (Screen 3 Detail)
    // Translucent curved crystalline ribs branching symmetrically behind the flame
    // ========================================================================
    if (!dead && bodyLen > 30) {
      ctx.save();
      const shardStep = 50;
      const shardLen = bladeW * 0.85;
      ctx.lineWidth = 1.1;

      for (let sy = yTail + 35; sy < headTopY - 20; sy += shardStep) {
        const shardGlint = Math.sin((now || 0) * 0.003 + sy * 0.05) * 0.25 + 0.75;
        const shardAlpha = (holding ? 0.45 : 0.28) * shardGlint;
        const shardCol = isT5 ? `rgba(255, 23, 68, ${shardAlpha})` : `rgba(186, 230, 253, ${shardAlpha})`;
        const shardFill = isT5 ? `rgba(185, 28, 28, ${shardAlpha * 0.45})` : `rgba(186, 230, 253, ${shardAlpha * 0.45})`;
        ctx.strokeStyle = shardCol;
        ctx.fillStyle = shardFill;

        // Left crescent wing arc
        ctx.beginPath();
        ctx.moveTo(cx - halfW, sy);
        ctx.quadraticCurveTo(cx - halfW - shardLen * 0.6, sy + 5, cx - halfW - shardLen, sy - 12);
        ctx.quadraticCurveTo(cx - halfW - shardLen * 0.4, sy - 3, cx - halfW, sy - 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right crescent wing arc
        ctx.beginPath();
        ctx.moveTo(cx + halfW, sy);
        ctx.quadraticCurveTo(cx + halfW + shardLen * 0.6, sy + 5, cx + halfW + shardLen, sy - 12);
        ctx.quadraticCurveTo(cx + halfW - shardLen * 0.4, sy - 3, cx + halfW, sy - 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // ========================================================================
    // PREPARE 3D SPIRALING SAKURA PETALS (Лепестки сакуры кружляют по спирали)
    // Petals orbit in a 3D helix around the katana blade steel.
    // They are split into BACK petals (z < 0, drawn before blade) and
    // FRONT petals (z >= 0, drawn after blade) for authentic 3D wrapping!
    // All petals are strictly pink in color.
    // ========================================================================
    const spiralPetals = [];
    if (!dead && bodyLen > 30) {
      const tierPetalBonus = isT5 ? 4 : (tier >= 400 ? 3 : (tier >= 200 ? 2 : 0));
      const numPetals = Math.min(10, Math.max(5, Math.floor(bodyLen / 36)) + tierPetalBonus);
      const pinkCols = ['#f43f5e', '#fb7185', '#fda4af', '#ff69b4', '#ff85a1'];

      for (let p = 0; p < numPetals; p++) {
        const drift = ((now || 0) * 0.040 + p * (bodyLen / numPetals)) % bodyLen;
        const py = headTopY - drift;
        if (py < yTail + 6 || py > headTopY - 6) continue;

        // 3D helical spiral trajectory around the blade:
        const theta = (py * 0.026 + (now || 0) * 0.0035 + p * 1.5);
        const rSpiral = halfW + 6.5 + Math.sin(p * 2.1) * 2.5;
        const px = cx + Math.sin(theta) * rSpiral;
        const z = Math.cos(theta); // -1 (behind) to +1 (in front)
        const col = pinkCols[p % pinkCols.length];

        spiralPetals.push({ px, py, z, theta, col, p });
      }
    }

    // Function to render a single 3D sakura petal
    const drawSpiralPetal = (pet) => {
      const { px, py, z, theta, p } = pet;
      const isFront = z >= 0;
      const pSize = (isFront ? 5.8 : 4.4) + Math.sin(p * 1.3) * 0.6;
      const pAlpha = isFront ? 0.95 : 0.65;
      const flip = Math.sin((now || 0) * 0.0035 + p * 2.0);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(theta * 0.4 + p * 0.8);
      ctx.scale(flip, 1);
      ctx.globalAlpha = pAlpha;
      const stampPetal = getRealisticSakuraStamps()?.petal;
      if (stampPetal) {
        ctx.drawImage(stampPetal, -pSize, -pSize, pSize * 2, pSize * 2);
      }
      ctx.restore();
    };

    // ========================================================================
    // LAYER 3: VOLUMETRIC HELICAL COLD FLAME (Пламя што крутиться вокруг клинка)
    // Twisting counter-phase helical flame plumes winding around the blade cylinder
    // ========================================================================
    const timeOffset = (now || 0) * 0.055;
    const flameStep = 10;
    const flameAlphaBase = isT5 ? 0.45 :
                           (tier >= 400 ? 0.38 : (tier >= 200 ? 0.30 : (tier >= 100 ? 0.25 : 0.18)));
    const baseAlpha = holding ? Math.min(0.58, flameAlphaBase + 0.14) : flameAlphaBase;
    const swell = holding ? 1.25 : 1.0;
    const spiralOrbit = (halfW + 8) * swell;

    // Draw flame plumes function (can be drawn in back or front pass)
    const drawFlamePass = (targetDepth) => {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const flameCanvases = getFlameCanvases();
      if (!flameCanvases) { ctx.restore(); return; }
      const outerCanvas = isT5 ? flameCanvases.t5Outer : flameCanvases.iceOuter;
      const coreCanvas  = isT5 ? flameCanvases.t5Core  : flameCanvases.iceCore;

      ctx.globalAlpha = baseAlpha;

      for (let sy = yTail - 10; sy < headTopY + 10; sy += flameStep) {
        // Strand 1 phase and depth
        const phi1 = (sy * 0.026 - timeOffset * 0.08);
        const z1 = Math.cos(phi1);
        const disp1 = Math.sin(phi1) * spiralOrbit;

        // Strand 2 phase and depth (counter-strand)
        const phi2 = phi1 + Math.PI;
        const z2 = Math.cos(phi2);
        const disp2 = Math.sin(phi2) * spiralOrbit;

        const lobeL = (Math.max(0, Math.sin(sy * 0.045 - timeOffset * 0.07)) * 10 + 8) * swell;
        const rOuter = (14 + lobeL * 0.35) * swell;
        const rInner = (6 + lobeL * 0.20) * swell;

        // Draw Strand 1 if it matches target depth
        if ((targetDepth === 'back' && z1 < 0) || (targetDepth === 'front' && z1 >= 0)) {
          const lx = cx + disp1;
          ctx.drawImage(outerCanvas, lx - rOuter, sy - rOuter, rOuter * 2, rOuter * 2);
          ctx.drawImage(coreCanvas, lx - rInner, sy - rInner, rInner * 2, rInner * 2);
        }

        // Draw Strand 2 if it matches target depth
        if ((targetDepth === 'back' && z2 < 0) || (targetDepth === 'front' && z2 >= 0)) {
          const rx = cx + disp2;
          ctx.drawImage(outerCanvas, rx - rOuter, sy - rOuter, rOuter * 2, rOuter * 2);
          ctx.drawImage(coreCanvas, rx - rInner, sy - rInner, rInner * 2, rInner * 2);
        }
      }
      ctx.restore();
    };

    if (!dead) {
      // 1. Draw BACK flame passes (behind the blade)
      drawFlamePass('back');

      // 2. Draw BACK sakura petals (swirling behind the blade)
      for (const pet of spiralPetals) {
        if (pet.z < 0) drawSpiralPetal(pet);
      }
    }

    // ========================================================================
    // LAYER 4: KATANA BLADE STEEL (Лезвие катаны)
    // Crystalline ice steel with sharp beveled edges & glowing resonant hamon
    // (For T5: Jet-black obsidian steel with blazing blood-red hamon)
    // ========================================================================
    const bladeSprite = this._getBladeSprite(tier, dead);
    if (bladeSprite && bladeSprite.complete && bladeSprite.naturalWidth > 0) {
      // Draw seamless katana blade steel
      ctx.drawImage(bladeSprite, Math.round(cx - halfW), Math.round(yTail), bladeW, Math.round(bodyLen + 4));

      // Overlaid resonant hamon line down the blade center
      ctx.strokeStyle = dead ? '#475569' : (isT5 ? '#ff1744' : (holding ? '#ffffff' : pal.laserCore));
      ctx.lineWidth = Math.max(1.2, bladeW * 0.08);
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();

      // Chevrons (^) repeating down the central channel
      if (!dead) {
        ctx.strokeStyle = isT5 ? 'rgba(255, 23, 68, 0.85)' : (holding ? '#ffffff' : 'rgba(255, 255, 255, 0.75)');
        ctx.lineWidth = 1.0;
        const chevStep = 44;
        const chevSize = bladeW * 0.24;
        for (let cy = yTail + 24; cy < headTopY - 15; cy += chevStep) {
          ctx.beginPath();
          ctx.moveTo(cx - chevSize, cy + chevSize * 0.6);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx + chevSize, cy + chevSize * 0.6);
          ctx.stroke();
        }
      }

      if (holding && !dead) {
        // Vibrant glowing laser beam down the blade when held
        const glowCore = ctx.createLinearGradient(cx - 3, 0, cx + 3, 0);
        const lColor = isT5 ? '255, 23, 68' : '255, 255, 255';
        glowCore.addColorStop(0,   `rgba(${lColor}, 0)`);
        glowCore.addColorStop(0.5, `rgba(${lColor}, 0.95)`);
        glowCore.addColorStop(1,   `rgba(${lColor}, 0)`);
        ctx.fillStyle = glowCore;
        ctx.fillRect(cx - 3, yTail, 6, bodyLen);
      }
    } else {
      // Procedural Blade Fallback:
      const bgrad = ctx.createLinearGradient(cx - halfW, 0, cx + halfW, 0);
      bgrad.addColorStop(0,   dead ? '#1e293b' : (isT5 ? '#0a0a0f' : '#38bdf8'));
      bgrad.addColorStop(0.2, dead ? '#475569' : (isT5 ? '#1f1f28' : '#bae6fd'));
      bgrad.addColorStop(0.5, dead ? '#64748b' : (isT5 ? '#353540' : '#ffffff'));
      bgrad.addColorStop(0.8, dead ? '#475569' : (isT5 ? '#1f1f28' : '#7dd3fc'));
      bgrad.addColorStop(1,   dead ? '#1e293b' : (isT5 ? '#0a0a0f' : '#0284c7'));
      ctx.fillStyle = bgrad;
      ctx.fillRect(Math.round(cx - halfW), Math.round(yTail), bladeW, Math.round(bodyLen + 4));

      // Central hamon
      ctx.strokeStyle = dead ? '#475569' : (isT5 ? '#ff1744' : pal.laserCore);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, yTail);
      ctx.lineTo(cx, headTopY);
      ctx.stroke();
    }

    // ========================================================================
    // LAYER 5: FRONT PASSES (Twisting flame & spiraling sakura in front of blade!)
    // ========================================================================
    if (!dead) {
      // 1. Draw FRONT flame passes (translucent fire twisting across the blade face)
      drawFlamePass('front');

      // 2. Draw FRONT sakura petals (dancing across the front of the blade!)
      for (const pet of spiralPetals) {
        if (pet.z >= 0) drawSpiralPetal(pet);
      }
    }

    // ========================================================================
    // LAYER 6: COMBO EVOLUTION EMBER PARTICLES (Tiers 100+, 200+, 400+, 800+)
    // ========================================================================
    if (!dead && liveCombo >= 100 && bodyLen > 50) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const numEmbers = Math.min(6, Math.floor(liveCombo / 100));
      for (let e = 0; e < numEmbers; e++) {
        const eDrift = ((now || 0) * 0.06 + e * 45) % bodyLen;
        const ey = headTopY - eDrift;
        const ex = cx + Math.sin((now || 0) * 0.004 + e * 2.1) * (halfW + 12);
        const er = 1.4 + Math.sin(now * 0.005 + e) * 0.6;
        ctx.fillStyle = isT5 ? '#ff1744' : ((liveCombo >= 400) ? '#c084fc' : ((liveCombo >= 200) ? '#38bdf8' : '#fda4af'));
        ctx.beginPath();
        ctx.arc(ex, ey, er, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ========================================================================
    // LAYER 6: COMBO EVOLUTION EMBER PARTICLES (Tiers 100+, 200+, 400+, 800+)
    // ========================================================================
    if (!dead && liveCombo >= 100 && bodyLen > 50) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const numEmbers = Math.min(6, Math.floor(liveCombo / 100));
      for (let e = 0; e < numEmbers; e++) {
        const eDrift = ((now || 0) * 0.06 + e * 45) % bodyLen;
        const ey = headTopY - eDrift;
        const ex = cx + Math.sin((now || 0) * 0.004 + e * 2.1) * (halfW + 14);
        const er = 1.5 + Math.sin(now * 0.005 + e) * 0.8;
        ctx.fillStyle = (liveCombo >= 400) ? '#c084fc' : ((liveCombo >= 200) ? '#38bdf8' : '#fda4af');
        ctx.beginPath();
        ctx.arc(ex, ey, er, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();
    return true;
  },

  // ==========================================================================
  // 5. RECEPTOR LINE — SAMURAI TSUBA & GLACIO CRYSTAL NOTCHES
  // ==========================================================================
  drawReceptor(ctx, x, y, w, h, isActive, isLight) {
    ctx.save();

    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(5, h * 0.3);

    // Receptor background
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

    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, w - 2, h - 2, r);
      ctx.fill();
    } else {
      ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
    }

    // Outer Glacio frost border
    ctx.strokeStyle = isActive ? '#ffffff' : (isLight ? 'rgba(56, 189, 248, 0.9)' : 'rgba(56, 189, 248, 0.70)');
    ctx.lineWidth = isActive ? 2.0 : 1.4;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, w - 2, h - 2, r);
      ctx.stroke();
    } else {
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    }

    // Katana guard notch accents (center diamond glint)
    ctx.fillStyle = isActive ? '#f43f5e' : 'rgba(56, 189, 248, 0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy, isActive ? 3.0 : 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return true;
  },

  // ==========================================================================
  // 6. HIT ANIMATION — SHATTERED ICE MIRROR & CRIMSON SAKURA BURST
  // Inspired by Sanhua's Forte Circuit / Resonance Skill & Ultimate
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

    // 1. Expanding Glacio Frost Shockwave Ring
    const ringR = (w * 0.15) + easeOut * (w * 0.58);
    const ringAlpha = Math.max(0, (1.0 - p) * 0.75);
    ctx.lineWidth = Math.max(1, 2.2 * (1.0 - p));
    ctx.strokeStyle = (combo >= 800) ? `rgba(255, 255, 255, ${ringAlpha})` : `rgba(56, 189, 248, ${ringAlpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Shattered Ice Mirror Fracture Shards
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

      // Faceted ice diamond shard
      ctx.fillStyle = `rgba(186, 230, 253, ${alpha * 0.85})`;
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

    // 3. Central Glacio 6-Ray Star Burst (✦)
    const starR = Math.max(4, (w * 0.28) * (1.0 - p * 0.5));
    ctx.strokeStyle = colCore;
    ctx.lineWidth = Math.max(1, 2.0 * (1.0 - p));
    for (let r = 0; r < 6; r++) {
      const rAng = (r * Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(rAng) * starR, Math.sin(rAng) * starR);
      ctx.stroke();
    }

    ctx.restore();

    // 4. Scattering Flaming Sakura Petals
    const numPetals = 6;
    const stampPetal = getRealisticSakuraStamps()?.petal;
    for (let k = 0; k < numPetals; k++) {
      const pAngle = (k * Math.PI * 2 / numPetals) + (k * 0.35);
      const pDist = (w * 0.12) + easeOut * (w * 0.65);
      const px = cx + Math.cos(pAngle) * pDist;
      const py = cy + Math.sin(pAngle) * pDist;
      const pSize = Math.max(2, 6 * (1.0 - p * 0.6));

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(pAngle + p * 3.0);
      ctx.globalAlpha = alpha * 0.90;
      if (stampPetal) {
        ctx.drawImage(stampPetal, -pSize, -pSize, pSize * 2, pSize * 2);
      }
      ctx.restore();
    }

    ctx.restore();
  },

  // ==========================================================================
  // 7. ATMOSPHERE — 6-FOLD GLACIO MANDALA, DRIFTING SNOW & CRIMSON SAKURA PETALS
  // ==========================================================================
  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const gw = (typeof State !== 'undefined' && State && typeof State.gameWidth === 'number' && State.gameWidth > 0)
      ? State.gameWidth
      : (ctx.canvas?.clientWidth || (ctx.canvas ? ctx.canvas.width / (window.devicePixelRatio || 1) : 400));
    const gh = (typeof State !== 'undefined' && State && typeof State.gameHeight === 'number' && State.gameHeight > 0)
      ? State.gameHeight
      : (ctx.canvas?.clientHeight || (ctx.canvas ? ctx.canvas.height / (window.devicePixelRatio || 1) : 700));

    const isLight = document.body.getAttribute('data-theme') === 'light';
    const pulse = State?.bgPulse || 0;
    const now = songTime || 0;
    const combo = State?.combo || 0;
    const pal = this._getPalette(combo);

    initAtmosphereParticles(gw, gh);

    ctx.save();

    // 1. Central Glacio Snowflake Mandala
    const mcx = gw / 2;
    const mcy = gh * 0.38;
    const mandalaR = Math.min(gw * 0.38, 140);
    const breath = Math.sin(now * 0.0016) * 0.04 + pulse * 0.12;
    const mandalaAlpha = (isLight ? 0.14 : 0.22) + breath;

    ctx.save();
    ctx.translate(mcx, mcy);
    ctx.rotate(now * 0.0004);

    ctx.strokeStyle = `rgba(56, 189, 248, ${mandalaAlpha})`;
    ctx.lineWidth = 1.2;

    for (let m = 0; m < 6; m++) {
      const ang = (m * Math.PI / 3);
      ctx.save();
      ctx.rotate(ang);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -mandalaR);
      ctx.stroke();

      const bY1 = -mandalaR * 0.45;
      const bY2 = -mandalaR * 0.75;
      ctx.beginPath();
      ctx.moveTo(0, bY1); ctx.lineTo(-mandalaR * 0.18, bY1 - mandalaR * 0.12);
      ctx.moveTo(0, bY1); ctx.lineTo(mandalaR * 0.18, bY1 - mandalaR * 0.12);

      ctx.moveTo(0, bY2); ctx.lineTo(-mandalaR * 0.14, bY2 - mandalaR * 0.10);
      ctx.moveTo(0, bY2); ctx.lineTo(mandalaR * 0.14, bY2 - mandalaR * 0.10);
      ctx.stroke();

      ctx.fillStyle = `rgba(186, 230, 253, ${mandalaAlpha * 0.7})`;
      ctx.beginPath();
      ctx.moveTo(0, -mandalaR);
      ctx.lineTo(mandalaR * 0.08, -mandalaR * 0.88);
      ctx.lineTo(0, -mandalaR * 0.80);
      ctx.lineTo(-mandalaR * 0.08, -mandalaR * 0.88);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, mandalaR * 0.28, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // 2. Shattered Mirror Fracture Lines
    const crackAlpha = (isLight ? 0.08 : 0.15) + pulse * 0.20;
    ctx.strokeStyle = `rgba(125, 211, 252, ${crackAlpha})`;
    ctx.lineWidth = 1.0;
    const crackAngles = [0.2, 0.8, 1.4, 2.1, 2.7, 3.4, 4.0, 4.7, 5.3, 5.9];
    ctx.beginPath();
    for (let c = 0; c < crackAngles.length; c++) {
      const ang = crackAngles[c];
      const len = mandalaR * (1.1 + ((c * 23) % 5) * 0.2);
      ctx.moveTo(mcx, mcy);
      ctx.lineTo(mcx + Math.cos(ang) * len, mcy + Math.sin(ang) * len);
    }
    ctx.stroke();

    // 3. Realistic Full Sakura Tree & Wind-blown Small Petals (Photo-accurate background)
    this._drawRealisticSakuraTree(ctx, gw, gh, now, speedBoost);

    // 4. Drifting Snowflakes
    for (let i = 0; i < sanhuaSnowflakes.length; i++) {
      const s = sanhuaSnowflakes[i];
      s.y += s.speedY * (1 + (speedBoost || 0) * 0.3);
      s.x += s.speedX + Math.sin(now * 0.002 + s.phase) * 0.4;
      if (s.y > gh + 10) { s.y = -10; s.x = Math.random() * gw; }
      if (s.x < -10) s.x = gw + 10;
      if (s.x > gw + 10) s.x = -10;

      const glint = Math.sin(now * 0.004 + s.phase) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(224, 242, 254, ${s.alpha * glint})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.sz, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Drifting Ice Shards
    for (let i = 0; i < sanhuaShards.length; i++) {
      const sh = sanhuaShards[i];
      sh.y += sh.speedY;
      sh.x += sh.speedX;
      sh.rot += sh.rotSpeed;
      if (sh.y > gh + 15) { sh.y = -15; sh.x = Math.random() * gw; }

      ctx.save();
      ctx.translate(sh.x, sh.y);
      ctx.rotate(sh.rot);

      const glint = Math.sin(now * 0.003 + sh.glint) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(186, 230, 253, ${sh.alpha * glint})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${sh.alpha * 1.2})`;
      ctx.lineWidth = 0.8;

      ctx.beginPath();
      ctx.moveTo(0, -sh.sz);
      ctx.lineTo(sh.sz / sh.aspect, 0);
      ctx.lineTo(0, sh.sz * 0.5);
      ctx.lineTo(-sh.sz / sh.aspect, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
    return true;
  },

  // ==========================================================================
  // 8. REALISTIC FULL SAKURA TREE & DYNAMIC WIND (PHOTO-ACCURATE)
  // ==========================================================================
  _drawRealisticSakuraTree(ctx, gw, gh, now, speedBoost) {
    const stamps = getRealisticSakuraStamps();
    if (!stamps) return;

    const t = now * 0.001;

    // Wind gust dynamics (multi-harmonic breeze peaks and lulls)
    const windGust = Math.sin(t * 0.85) * 0.45 
                   + Math.sin(t * 2.2 + 1.2) * 0.35 
                   + Math.sin(t * 5.1 + 0.5) * 0.15 + 0.95; // 0.35 to 1.9

    // Multi-harmonic swaying of trunk, crown and limbs
    const swayTrunk_x = Math.sin(t * 1.05) * (3.0 * windGust);
    const swayTrunk_y = Math.cos(t * 1.05) * (1.5 * windGust);

    const swayCrown_x = swayTrunk_x + Math.sin(t * 1.6 + 0.8) * (7.5 * windGust);
    const swayCrown_y = swayTrunk_y + Math.cos(t * 1.6 + 0.8) * (4.0 * windGust);

    const swayLeft_x = swayCrown_x + Math.sin(t * 2.5 + 1.3) * (12.0 * windGust);
    const swayLeft_y = swayCrown_y + Math.cos(t * 2.5 + 1.3) * (6.5 * windGust);

    const swayRight_x = swayCrown_x + Math.sin(t * 2.2 + 2.0) * (9.5 * windGust);
    const swayRight_y = swayCrown_y + Math.cos(t * 2.2 + 2.0) * (5.5 * windGust);

    // Tree Skeleton (based on user reference photo)
    const rootBase = { x: gw * 0.66, y: gh * 0.98 };
    const trunkMid = { x: gw * 0.65 + swayTrunk_x * 0.4, y: gh * 0.75 + swayTrunk_y * 0.4 };
    const trunkFork = { x: gw * 0.63 + swayTrunk_x, y: gh * 0.54 + swayTrunk_y };

    // Left main boughs
    const boughLeftMain = { x: gw * 0.46 + swayCrown_x, y: gh * 0.46 + swayCrown_y };
    const boughFarLeft = { x: gw * 0.28 + swayLeft_x, y: gh * 0.40 + swayLeft_y };
    const twigFarLeft1 = { x: gw * 0.15 + swayLeft_x * 1.2, y: gh * 0.44 + swayLeft_y * 1.2 };
    const twigFarLeft2 = { x: gw * 0.20 + swayLeft_x * 1.15, y: gh * 0.32 + swayLeft_y * 1.15 };
    const twigLeftDrop = { x: gw * 0.18 + swayLeft_x * 1.2, y: gh * 0.55 + swayLeft_y * 1.2 };

    const boughHighLeft = { x: gw * 0.38 + swayLeft_x * 0.9, y: gh * 0.28 + swayLeft_y * 0.9 };
    const twigHighLeft1 = { x: gw * 0.26 + swayLeft_x * 1.1, y: gh * 0.20 + swayLeft_y * 1.1 };
    const twigHighLeft2 = { x: gw * 0.36 + swayLeft_x * 1.05, y: gh * 0.14 + swayLeft_y * 1.05 };

    // Center high boughs
    const boughCenterHigh = { x: gw * 0.58 + swayCrown_x, y: gh * 0.34 + swayCrown_y };
    const twigCenterTop1 = { x: gw * 0.50 + swayLeft_x * 0.85, y: gh * 0.16 + swayLeft_y * 0.85 };
    const twigCenterTop2 = { x: gw * 0.62 + swayRight_x * 0.85, y: gh * 0.12 + swayRight_y * 0.85 };
    const twigCenterTop3 = { x: gw * 0.44 + swayLeft_x * 0.95, y: gh * 0.08 + swayLeft_y * 0.95 };

    // Right main boughs
    const boughRightMain = { x: gw * 0.78 + swayCrown_x * 0.9, y: gh * 0.44 + swayCrown_y * 0.9 };
    const boughFarRight = { x: gw * 0.88 + swayRight_x, y: gh * 0.38 + swayRight_y };
    const twigRightHigh = { x: gw * 0.76 + swayRight_x * 1.05, y: gh * 0.20 + swayRight_y * 1.05 };
    const twigRightDrop1 = { x: gw * 0.94 + swayRight_x * 1.15, y: gh * 0.42 + swayRight_y * 1.15 };
    const twigRightDrop2 = { x: gw * 0.86 + swayRight_x * 1.15, y: gh * 0.56 + swayRight_y * 1.15 };

    // Lower trunk accent bough
    const boughLowerLeft = { x: gw * 0.56 + swayTrunk_x * 0.8, y: gh * 0.62 + swayTrunk_y * 0.8 };
    const twigLowerDrop = { x: gw * 0.45 + swayCrown_x * 0.8, y: gh * 0.68 + swayCrown_y * 0.8 };

    // Canopy foliage clusters
    const clusterPuffs = [
      // Background layer
      { pt: boughFarLeft, stamp: stamps.clusterA, s: 1.15, isBack: true },
      { pt: boughHighLeft, stamp: stamps.clusterB, s: 1.25, isBack: true },
      { pt: twigHighLeft1, stamp: stamps.clusterC, s: 1.10, isBack: true },
      { pt: twigCenterTop1, stamp: stamps.clusterA, s: 1.20, isBack: true },
      { pt: twigCenterTop2, stamp: stamps.clusterB, s: 1.25, isBack: true },
      { pt: twigCenterTop3, stamp: stamps.clusterA, s: 1.15, isBack: true },
      { pt: boughFarRight, stamp: stamps.clusterC, s: 1.15, isBack: true },
      { pt: twigRightHigh, stamp: stamps.clusterB, s: 1.20, isBack: true },

      // Mid/Fore layer (dense fluffy canopy)
      { pt: trunkFork, stamp: stamps.clusterA, s: 1.35, isBack: false },
      { pt: boughLeftMain, stamp: stamps.clusterB, s: 1.30, isBack: false },
      { pt: boughCenterHigh, stamp: stamps.clusterC, s: 1.35, isBack: false },
      { pt: boughRightMain, stamp: stamps.clusterA, s: 1.30, isBack: false },

      { pt: { x: (boughLeftMain.x + boughHighLeft.x)*0.5, y: (boughLeftMain.y + boughHighLeft.y)*0.5 - 15 }, stamp: stamps.clusterB, s: 1.25, isBack: false },
      { pt: boughHighLeft, stamp: stamps.clusterA, s: 1.30, isBack: false },
      { pt: twigHighLeft1, stamp: stamps.clusterC, s: 1.20, isBack: false },
      { pt: twigHighLeft2, stamp: stamps.clusterB, s: 1.15, isBack: false },

      { pt: { x: (boughCenterHigh.x + twigCenterTop1.x)*0.5, y: (boughCenterHigh.y + twigCenterTop1.y)*0.5 }, stamp: stamps.clusterA, s: 1.30, isBack: false },
      { pt: twigCenterTop1, stamp: stamps.clusterC, s: 1.25, isBack: false },
      { pt: twigCenterTop2, stamp: stamps.clusterB, s: 1.25, isBack: false },
      { pt: twigCenterTop3, stamp: stamps.clusterA, s: 1.10, isBack: false },

      { pt: boughFarLeft, stamp: stamps.clusterB, s: 1.25, isBack: false },
      { pt: twigFarLeft1, stamp: stamps.sprayA, s: 1.20, isBack: false },
      { pt: twigFarLeft2, stamp: stamps.sprayB, s: 1.15, isBack: false },
      { pt: twigLeftDrop, stamp: stamps.sprayA, s: 1.25, isBack: false },
      { pt: { x: twigLeftDrop.x + 10, y: twigLeftDrop.y + 35 }, stamp: stamps.sprayB, s: 1.10, isBack: false },

      { pt: boughFarRight, stamp: stamps.clusterC, s: 1.25, isBack: false },
      { pt: twigRightHigh, stamp: stamps.clusterA, s: 1.20, isBack: false },
      { pt: twigRightDrop1, stamp: stamps.sprayB, s: 1.25, isBack: false },
      { pt: twigRightDrop2, stamp: stamps.sprayA, s: 1.25, isBack: false },
      { pt: { x: twigRightDrop2.x - 8, y: twigRightDrop2.y + 35 }, stamp: stamps.sprayB, s: 1.10, isBack: false },

      { pt: boughLowerLeft, stamp: stamps.clusterC, s: 1.10, isBack: false },
      { pt: twigLowerDrop, stamp: stamps.sprayA, s: 1.15, isBack: false }
    ];

    const petalSpawnNodes = clusterPuffs.map(cp => cp.pt);
    if (sanhuaPetals.length === 0) {
      initAtmosphereParticles(gw, gh, petalSpawnNodes);
    }

    // 1. Background detaching small petals (behind tree)
    const stampPetal = stamps.petal;
    for (let i = 0; i < sanhuaPetals.length; i++) {
      const p = sanhuaPetals[i];
      if (p.isFront) continue;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotZ || 0);
      ctx.scale(Math.cos(p.flipY || 0), Math.sin(p.tiltX || 0) * 0.4 + 0.6);
      ctx.globalAlpha = (p.alpha || 0.6) * 0.70;
      ctx.drawImage(stampPetal, -p.sz, -p.sz, p.sz * 2, p.sz * 2);
      ctx.restore();
    }

    // 2. Background foliage clouds
    for (let i = 0; i < clusterPuffs.length; i++) {
      const cp = clusterPuffs[i];
      if (!cp.isBack) continue;

      const rustle = Math.sin(t * 2.3 + i * 0.7) * 0.035;
      const scale = cp.s * (1 + rustle);
      const swayRot = (swayLeft_x * 0.012);

      ctx.save();
      ctx.translate(cp.pt.x - 6, cp.pt.y - 6);
      ctx.rotate(swayRot);
      ctx.globalAlpha = 0.88;
      const cw = cp.stamp.width * scale;
      const ch = cp.stamp.height * scale;
      ctx.drawImage(cp.stamp, -cw / 2, -ch / 2, cw, ch);
      ctx.restore();
    }

    // 3. Tree trunk & main branch bones (rendered once via offscreen canvas)
    const woodCanvas = getSakuraWoodCanvas(gw, gh);
    if (woodCanvas) {
      ctx.drawImage(woodCanvas, 0, 0);
    }

    // 4. Foreground dense billowing bloom clouds
    for (let i = 0; i < clusterPuffs.length; i++) {
      const cp = clusterPuffs[i];
      if (cp.isBack) continue;

      const rustle = Math.sin(t * 2.3 + i * 0.8) * 0.035;
      const scale = cp.s * (1 + rustle);
      const swayRot = (swayLeft_x * 0.014);

      ctx.save();
      ctx.translate(cp.pt.x, cp.pt.y);
      ctx.rotate(swayRot);
      const cw = cp.stamp.width * scale;
      const ch = cp.stamp.height * scale;
      ctx.drawImage(cp.stamp, -cw / 2, -ch / 2, cw, ch);
      ctx.restore();
    }

    // 5. Detaching small petals / leaves ("ветер сдувает листья / лепестки")
    for (let i = 0; i < sanhuaPetals.length; i++) {
      const p = sanhuaPetals[i];

      const curVx = ((p.baseVx || -2.5) - windGust * 3.4) * (1 + (speedBoost || 0) * 0.25);
      const curVy = ((p.baseVy || 1.2) + Math.sin(t * 3.6 + (p.seed || 0)) * 0.85) * (1 + (speedBoost || 0) * 0.2);

      p.x += curVx;
      p.y += curVy;
      p.rotZ = (p.rotZ || 0) + (p.rotSpeedZ || 0.03);
      p.flipY = (p.flipY || 0) + (p.flipSpeedY || 0.04);
      p.tiltX = (p.tiltX || 0) + (p.tiltSpeedX || 0.03);

      if (p.x < -25 || p.y > gh + 25) {
        const randNode = petalSpawnNodes[Math.floor(Math.random() * petalSpawnNodes.length)];
        p.x = randNode.x + (Math.random() - 0.5) * 45;
        p.y = randNode.y + (Math.random() - 0.5) * 35;
        p.baseVx = -(2.4 + Math.random() * 2.8);
        p.baseVy = 0.9 + Math.random() * 1.5;
        p.sz = 3.2 + Math.random() * 4.0;
        p.alpha = 0.60 + Math.random() * 0.38;
        p.isFront = Math.random() > 0.45;
      }

      if (!p.isFront) continue;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotZ);
      ctx.scale(Math.cos(p.flipY), Math.sin(p.tiltX) * 0.4 + 0.6);
      ctx.globalAlpha = p.alpha;
      ctx.drawImage(stampPetal, -p.sz, -p.sz, p.sz * 2, p.sz * 2);
      ctx.restore();
    }
  },

  drawParticle(ctx, pt, life) {
    ctx.save();
    ctx.translate(pt.x, pt.y);

    if (pt.type === 'petal') {
      ctx.rotate(pt.rot || 0);
      const sz = pt.size || 5;
      ctx.fillStyle = pt.color || '#f43f5e';
      ctx.globalAlpha = Math.max(0, life);
      ctx.beginPath();
      ctx.moveTo(0, -sz);
      ctx.quadraticCurveTo(sz * 0.8, -sz * 0.4, sz * 0.4, sz * 0.8);
      ctx.quadraticCurveTo(0, sz, -sz * 0.4, sz * 0.8);
      ctx.quadraticCurveTo(-sz * 0.8, -sz * 0.4, 0, -sz);
      ctx.closePath();
      ctx.fill();
    } else {
      const sz = pt.size || 3;
      ctx.fillStyle = pt.color || '#7dd3fc';
      ctx.globalAlpha = Math.max(0, life);
      ctx.beginPath();
      ctx.moveTo(0, -sz);
      ctx.lineTo(sz * 0.6, 0);
      ctx.lineTo(0, sz);
      ctx.lineTo(-sz * 0.6, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
};
