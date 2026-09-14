// ============================================================================
// SANHUA (散华) THEME — PIXI.JS v8 WebGL REDESIGN
// High-Performance WebGL/WebGPU Rhythm Theme with Donghua Flowing Energy Hold Notes,
// Pixi Shattered Glass Notes, Crystalline Ice Tree & Giant Celestial Moon,
// Instant T5 Blood-Moon Shift, and High-Density Particle Swarm.
// ============================================================================

import { pixiRenderer } from "../render/PixiRenderer.js";
import { pixiParticleSystem } from "../render/PixiParticleSystem.js";

// Atmospheric particles cache (Canvas 2D fallback when WebGL is uninitialized)
let sanhuaSnowflakes = [];
let sanhuaShards = [];

// Offscreen cached canvases for high-performance Canvas 2D fallback
let _cachedTreeMoonCanvas = null;
let _cachedTreeMoonGw = 0;
let _cachedTreeMoonGh = 0;
let _cachedTreeMoonT5 = false;

// ----------------------------------------------------------------------------
// PIXI.JS WebGL SCENE GRAPH (Background Layer: Giant Moon & Crystalline Ice Tree)
// ----------------------------------------------------------------------------
let _pixiBgContainer = null;
let _pixiMoonGfx = null;
let _pixiMoonHaloGfx = null;
let _pixiTreeGfx = null;
let _pixiTreeGlowGfx = null;
let _pixiLastComboTier = -1;
let _pixiLastGw = 0;
let _pixiLastGh = 0;

function setupPixiIceTreeAndMoon(gw, gh, isT5) {
  if (!pixiRenderer || !pixiRenderer.isReady || !pixiRenderer.backgroundLayer) return null;
  const PIXI = pixiRenderer.PIXI;
  if (!PIXI) return null;

  if (!_pixiBgContainer || _pixiLastGw !== gw || _pixiLastGh !== gh) {
    if (_pixiBgContainer) {
      try { _pixiBgContainer.destroy({ children: true }); } catch (_) {}
    }

    _pixiBgContainer = new PIXI.Container();
    _pixiBgContainer.label = 'sanhuaBgContainer';

    // 1. Lunar Halo Graphics (Additive glow)
    _pixiMoonHaloGfx = new PIXI.Graphics();
    _pixiMoonHaloGfx.blendMode = 'add';
    _pixiBgContainer.addChild(_pixiMoonHaloGfx);

    // 2. Celestial Moon Body Graphics
    _pixiMoonGfx = new PIXI.Graphics();
    _pixiBgContainer.addChild(_pixiMoonGfx);

    // 3. Ice Tree Outer Additive Glow
    _pixiTreeGlowGfx = new PIXI.Graphics();
    _pixiTreeGlowGfx.blendMode = 'add';
    _pixiBgContainer.addChild(_pixiTreeGlowGfx);

    // 4. Sharp Crystalline Ice Tree Graphics
    _pixiTreeGfx = new PIXI.Graphics();
    _pixiBgContainer.addChild(_pixiTreeGfx);

    // Insert at bottom of backgroundLayer
    pixiRenderer.backgroundLayer.addChildAt(_pixiBgContainer, 0);

    _pixiLastGw = gw;
    _pixiLastGh = gh;
    _pixiLastComboTier = -1; // Force repaint
  }

  // Repaint geometry when T5 status or resolution changes
  const tierKey = isT5 ? 5 : 0;
  if (_pixiLastComboTier !== tierKey) {
    _pixiLastComboTier = tierKey;

    const moonX = Math.round(gw * 0.68);
    const moonY = Math.round(gh * 0.22);
    const moonR = Math.min(Math.round(gw * 0.35), 160);

    // ------------------------------------------------------------------------
    // MOON: Celestial Silver (T0-T4) vs. Ominous Blood-Red (T5 Blood-Moon Shift)
    // ------------------------------------------------------------------------
    _pixiMoonHaloGfx.clear();
    _pixiMoonGfx.clear();

    const haloColor = isT5 ? 0xff1744 : 0x38bdf8;
    const moonCoreColor = isT5 ? 0xff2a5f : 0xf8fafc;
    const moonDarkColor = isT5 ? 0x881337 : 0x071e3d;

    // Outer concentric radiant halo rings
    _pixiMoonHaloGfx.circle(moonX, moonY, moonR * 1.55);
    _pixiMoonHaloGfx.fill({ color: haloColor, alpha: isT5 ? 0.22 : 0.14 });

    _pixiMoonHaloGfx.circle(moonX, moonY, moonR * 1.25);
    _pixiMoonHaloGfx.fill({ color: haloColor, alpha: isT5 ? 0.32 : 0.20 });

    _pixiMoonHaloGfx.circle(moonX, moonY, moonR * 1.08);
    _pixiMoonHaloGfx.fill({ color: 0xffffff, alpha: isT5 ? 0.40 : 0.25 });

    // Solid celestial moon disc
    _pixiMoonGfx.circle(moonX, moonY, moonR);
    _pixiMoonGfx.fill({ color: moonCoreColor, alpha: 0.96 });

    // Stylized lunar maria crater markings
    _pixiMoonGfx.circle(moonX - moonR * 0.28, moonY - moonR * 0.25, moonR * 0.32);
    _pixiMoonGfx.fill({ color: moonDarkColor, alpha: isT5 ? 0.45 : 0.22 });

    _pixiMoonGfx.circle(moonX + moonR * 0.22, moonY + moonR * 0.30, moonR * 0.40);
    _pixiMoonGfx.fill({ color: moonDarkColor, alpha: isT5 ? 0.50 : 0.25 });

    _pixiMoonGfx.circle(moonX - moonR * 0.35, moonY + moonR * 0.28, moonR * 0.22);
    _pixiMoonGfx.fill({ color: moonDarkColor, alpha: isT5 ? 0.40 : 0.20 });

    // ------------------------------------------------------------------------
    // SHARP CRYSTALLINE ICE TREE: Glacial Cyan vs. Obsidian Blood-Black (T5)
    // ------------------------------------------------------------------------
    _pixiTreeGfx.clear();
    _pixiTreeGlowGfx.clear();

    const colTrunk = isT5 ? 0x180308 : 0x051b2e;
    const colSpire = isT5 ? 0x991b1b : 0x0284c7;
    const colFacet = isT5 ? 0xdc2626 : 0x38bdf8;
    const colSpecular = isT5 ? 0xff1744 : 0xffffff;

    // Tree Skeleton points
    const pRoot = { x: gw * 0.66, y: gh * 0.98 };
    const pMid  = { x: gw * 0.65, y: gh * 0.74 };
    const pFork = { x: gw * 0.62, y: gh * 0.52 };

    const pBoughL = { x: gw * 0.44, y: gh * 0.44 };
    const pFarL   = { x: gw * 0.26, y: gh * 0.38 };
    const pDropL  = { x: gw * 0.18, y: gh * 0.54 };
    const pHighL  = { x: gw * 0.36, y: gh * 0.26 };
    const pTipL1  = { x: gw * 0.22, y: gh * 0.18 };
    const pTipL2  = { x: gw * 0.32, y: gh * 0.12 };

    const pBoughC = { x: gw * 0.58, y: gh * 0.32 };
    const pTipC1  = { x: gw * 0.48, y: gh * 0.14 };
    const pTipC2  = { x: gw * 0.62, y: gh * 0.10 };
    const pTipC3  = { x: gw * 0.42, y: gh * 0.06 };

    const pBoughR = { x: gw * 0.80, y: gh * 0.42 };
    const pFarR   = { x: gw * 0.90, y: gh * 0.36 };
    const pTipR   = { x: gw * 0.78, y: gh * 0.18 };
    const pDropR  = { x: gw * 0.88, y: gh * 0.54 };
    const pLowerL = { x: gw * 0.55, y: gh * 0.62 };
    const pLowerDrop = { x: gw * 0.44, y: gh * 0.68 };

    const drawCrystalSegment = (p1, p2, w1, w2) => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;

      // Outer crystalline facet polygon
      _pixiTreeGfx.poly([
        p1.x - nx * w1 * 0.5, p1.y - ny * w1 * 0.5,
        p2.x - nx * w2 * 0.5, p2.y - ny * w2 * 0.5,
        p2.x + nx * w2 * 0.5, p2.y + ny * w2 * 0.5,
        p1.x + nx * w1 * 0.5, p1.y + ny * w1 * 0.5
      ]);
      _pixiTreeGfx.fill({ color: colTrunk, alpha: 0.95 });
      _pixiTreeGfx.stroke({ width: 1.8, color: colFacet, alpha: 0.85 });

      // Crystalline razor spine / hamon center
      _pixiTreeGfx.moveTo(p1.x, p1.y);
      _pixiTreeGfx.lineTo(p2.x, p2.y);
      _pixiTreeGfx.stroke({ width: Math.max(1.2, w2 * 0.35), color: colSpire, alpha: 0.9 });

      // Specular glint edge
      _pixiTreeGlowGfx.moveTo(p1.x - nx * w1 * 0.4, p1.y - ny * w1 * 0.4);
      _pixiTreeGlowGfx.lineTo(p2.x - nx * w2 * 0.4, p2.y - ny * w2 * 0.4);
      _pixiTreeGlowGfx.stroke({ width: 1.2, color: colSpecular, alpha: 0.75 });
    };

    // Main sharp crystal trunk segments
    drawCrystalSegment(pRoot, pMid, 32, 24);
    drawCrystalSegment(pMid, pFork, 24, 18);

    // Left crystalline boughs & frost spires
    drawCrystalSegment(pFork, pBoughL, 18, 12);
    drawCrystalSegment(pBoughL, pFarL, 12, 7);
    drawCrystalSegment(pFarL, pDropL, 7, 2);
    drawCrystalSegment(pBoughL, pHighL, 11, 6);
    drawCrystalSegment(pHighL, pTipL1, 6, 2);
    drawCrystalSegment(pHighL, pTipL2, 5, 2);

    // Center crown crystal spires
    drawCrystalSegment(pFork, pBoughC, 16, 10);
    drawCrystalSegment(pBoughC, pTipC1, 7, 2.5);
    drawCrystalSegment(pBoughC, pTipC2, 6.5, 2.5);
    drawCrystalSegment(pTipC1, pTipC3, 4, 1.5);

    // Right crystal boughs & drooping ice needles
    drawCrystalSegment(pFork, pBoughR, 17, 11);
    drawCrystalSegment(pBoughR, pFarR, 11, 7);
    drawCrystalSegment(pFarR, pDropR, 7, 2);
    drawCrystalSegment(pBoughR, pTipR, 7, 2);

    // Lower trunk accent crystal
    drawCrystalSegment(pMid, pLowerL, 11, 6);
    drawCrystalSegment(pLowerL, pLowerDrop, 6, 2);

    // Protruding sharp diamond crystal needles at branch junctions
    const crystalNeedles = [
      pMid, pFork, pBoughL, pHighL, pFarL, pBoughC, pTipC1, pBoughR, pFarR, pLowerL
    ];
    for (let i = 0; i < crystalNeedles.length; i++) {
      const pt = crystalNeedles[i];
      const rad = (i % 2 === 0 ? 5 : 3.5);
      _pixiTreeGlowGfx.circle(pt.x, pt.y, rad);
      _pixiTreeGlowGfx.fill({ color: colSpecular, alpha: 0.90 });

      // 4-pointed cross star flare on crystal node
      _pixiTreeGlowGfx.moveTo(pt.x - rad * 2, pt.y);
      _pixiTreeGlowGfx.lineTo(pt.x + rad * 2, pt.y);
      _pixiTreeGlowGfx.moveTo(pt.x, pt.y - rad * 2);
      _pixiTreeGlowGfx.lineTo(pt.x, pt.y + rad * 2);
      _pixiTreeGlowGfx.stroke({ width: 1.0, color: colSpecular, alpha: 0.85 });
    }
  }

  return _pixiBgContainer;
}

// ----------------------------------------------------------------------------
// CANVAS 2D FALLBACK FOR ICE TREE & MOON (Zero crashes when WebGL is unmounted)
// ----------------------------------------------------------------------------
function drawCanvasIceTreeAndMoon(ctx, gw, gh, now, isT5) {
  if (_cachedTreeMoonCanvas && _cachedTreeMoonGw === gw && _cachedTreeMoonGh === gh && _cachedTreeMoonT5 === isT5) {
    ctx.drawImage(_cachedTreeMoonCanvas, 0, 0);
    return;
  }
  if (typeof document === 'undefined') return;

  const c = document.createElement('canvas');
  c.width = gw;
  c.height = gh;
  const g = c.getContext('2d');
  if (!g) return;

  const moonX = Math.round(gw * 0.68);
  const moonY = Math.round(gh * 0.22);
  const moonR = Math.min(Math.round(gw * 0.35), 160);

  // 1. Giant Celestial Moon
  const haloGrad = g.createRadialGradient(moonX, moonY, moonR * 0.8, moonX, moonY, moonR * 1.6);
  if (isT5) {
    haloGrad.addColorStop(0, 'rgba(255, 23, 68, 0.45)');
    haloGrad.addColorStop(0.5, 'rgba(225, 29, 72, 0.20)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    haloGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.15)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }
  g.fillStyle = haloGrad;
  g.beginPath();
  g.arc(moonX, moonY, moonR * 1.6, 0, Math.PI * 2);
  g.fill();

  // Solid Moon Disc
  g.fillStyle = isT5 ? '#ff2a5f' : '#f8fafc';
  g.beginPath();
  g.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  g.fill();

  // Lunar Maria Craters
  g.fillStyle = isT5 ? 'rgba(69, 10, 10, 0.48)' : 'rgba(7, 30, 61, 0.25)';
  g.beginPath();
  g.arc(moonX - moonR * 0.28, moonY - moonR * 0.25, moonR * 0.32, 0, Math.PI * 2);
  g.arc(moonX + moonR * 0.22, moonY + moonR * 0.30, moonR * 0.40, 0, Math.PI * 2);
  g.arc(moonX - moonR * 0.35, moonY + moonR * 0.28, moonR * 0.22, 0, Math.PI * 2);
  g.fill();

  // 2. Sharp Crystalline Ice Tree
  const colTrunk = isT5 ? '#180308' : '#051b2e';
  const colSpire = isT5 ? '#991b1b' : '#0284c7';
  const colFacet = isT5 ? '#dc2626' : '#38bdf8';
  const colGlint = isT5 ? '#ff1744' : '#ffffff';

  const pRoot = { x: gw * 0.66, y: gh * 0.98 };
  const pMid  = { x: gw * 0.65, y: gh * 0.74 };
  const pFork = { x: gw * 0.62, y: gh * 0.52 };
  const pBoughL = { x: gw * 0.44, y: gh * 0.44 };
  const pFarL   = { x: gw * 0.26, y: gh * 0.38 };
  const pDropL  = { x: gw * 0.18, y: gh * 0.54 };
  const pHighL  = { x: gw * 0.36, y: gh * 0.26 };
  const pTipL1  = { x: gw * 0.22, y: gh * 0.18 };
  const pTipL2  = { x: gw * 0.32, y: gh * 0.12 };
  const pBoughC = { x: gw * 0.58, y: gh * 0.32 };
  const pTipC1  = { x: gw * 0.48, y: gh * 0.14 };
  const pTipC2  = { x: gw * 0.62, y: gh * 0.10 };
  const pTipC3  = { x: gw * 0.42, y: gh * 0.06 };
  const pBoughR = { x: gw * 0.80, y: gh * 0.42 };
  const pFarR   = { x: gw * 0.90, y: gh * 0.36 };
  const pTipR   = { x: gw * 0.78, y: gh * 0.18 };
  const pDropR  = { x: gw * 0.88, y: gh * 0.54 };
  const pLowerL = { x: gw * 0.55, y: gh * 0.62 };
  const pLowerDrop = { x: gw * 0.44, y: gh * 0.68 };

  const drawSegment = (p1, p2, w1, w2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    g.fillStyle = colTrunk;
    g.strokeStyle = colFacet;
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(p1.x - nx * w1 * 0.5, p1.y - ny * w1 * 0.5);
    g.lineTo(p2.x - nx * w2 * 0.5, p2.y - ny * w2 * 0.5);
    g.lineTo(p2.x + nx * w2 * 0.5, p2.y + ny * w2 * 0.5);
    g.lineTo(p1.x + nx * w1 * 0.5, p1.y + ny * w1 * 0.5);
    g.closePath();
    g.fill();
    g.stroke();

    // Central ice spine
    g.strokeStyle = colSpire;
    g.lineWidth = Math.max(1.2, w2 * 0.35);
    g.beginPath();
    g.moveTo(p1.x, p1.y);
    g.lineTo(p2.x, p2.y);
    g.stroke();

    // Specular edge
    g.strokeStyle = colGlint;
    g.lineWidth = 1.0;
    g.beginPath();
    g.moveTo(p1.x - nx * w1 * 0.4, p1.y - ny * w1 * 0.4);
    g.lineTo(p2.x - nx * w2 * 0.4, p2.y - ny * w2 * 0.4);
    g.stroke();
  };

  drawSegment(pRoot, pMid, 32, 24);
  drawSegment(pMid, pFork, 24, 18);
  drawSegment(pFork, pBoughL, 18, 12);
  drawSegment(pBoughL, pFarL, 12, 7);
  drawSegment(pFarL, pDropL, 7, 2);
  drawSegment(pBoughL, pHighL, 11, 6);
  drawSegment(pHighL, pTipL1, 6, 2);
  drawSegment(pHighL, pTipL2, 5, 2);
  drawSegment(pFork, pBoughC, 16, 10);
  drawSegment(pBoughC, pTipC1, 7, 2.5);
  drawSegment(pBoughC, pTipC2, 6.5, 2.5);
  drawSegment(pTipC1, pTipC3, 4, 1.5);
  drawSegment(pFork, pBoughR, 17, 11);
  drawSegment(pBoughR, pFarR, 11, 7);
  drawSegment(pFarR, pDropR, 7, 2);
  drawSegment(pBoughR, pTipR, 7, 2);
  drawSegment(pMid, pLowerL, 11, 6);
  drawSegment(pLowerL, pLowerDrop, 6, 2);

  // Crystal stars
  const needles = [pMid, pFork, pBoughL, pHighL, pFarL, pBoughC, pTipC1, pBoughR, pFarR, pLowerL];
  g.fillStyle = colGlint;
  g.strokeStyle = colGlint;
  g.lineWidth = 1.0;
  for (let i = 0; i < needles.length; i++) {
    const pt = needles[i];
    const rad = (i % 2 === 0 ? 4 : 2.5);
    g.beginPath();
    g.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(pt.x - rad * 2, pt.y); g.lineTo(pt.x + rad * 2, pt.y);
    g.moveTo(pt.x, pt.y - rad * 2); g.lineTo(pt.x, pt.y + rad * 2);
    g.stroke();
  }

  _cachedTreeMoonCanvas = c;
  _cachedTreeMoonGw = gw;
  _cachedTreeMoonGh = gh;
  _cachedTreeMoonT5 = isT5;

  ctx.drawImage(c, 0, 0);
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

  // ==========================================================================
  // 1. PIXI SHATTERED GLASS NOTES (Fractured Ice / Glass Shards)
  // Renders faceted shards with refraction blend modes (ADD/SCREEN),
  // dynamic comboTier palette tint & glow, strictly respecting [w, h] bounds.
  // ==========================================================================
  bakeTapNote(ctx, x, yTop, w, h, isLight, style) {
    const tier = this._resolveTierNum(style);
    const pal = this._getPalette(tier, false);
    const r = Math.min(5, Math.max(2, Math.round(h * 0.16)));

    ctx.save();

    // Base background gradient
    const bg = ctx.createLinearGradient(x, yTop, x, yTop + h);
    if (isLight) {
      bg.addColorStop(0, '#fdf2f8');
      bg.addColorStop(0.5, '#fce7f3');
      bg.addColorStop(1, '#fbcfe8');
    } else {
      bg.addColorStop(0, pal.bgTop || '#07253d');
      bg.addColorStop(0.5, pal.bgMid || '#041524');
      bg.addColorStop(1, pal.bgBot || '#020a12');
    }

    // Clip to exact note bounds (standard note sizing without arbitrary reductions)
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, yTop, w, h, r);
    else ctx.rect(x, yTop, w, h);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.clip();

    // ------------------------------------------------------------------------
    // FRACTURED SHARD FACETS
    // ------------------------------------------------------------------------
    const V = [
      [0.00, 0.00], [0.24, 0.00], [0.54, 0.00], [0.80, 0.00],
      [1.00, 0.00], [1.00, 0.44], [1.00, 0.76], [1.00, 1.00],
      [0.76, 1.00], [0.50, 1.00], [0.22, 1.00], [0.00, 1.00],
      [0.00, 0.66], [0.00, 0.32],
      // Cleavage nodes
      [0.34, 0.38], [0.62, 0.32], [0.48, 0.66], [0.78, 0.58]
    ];
    const pt = (idx) => [x + V[idx][0] * w, yTop + V[idx][1] * h];

    const shards = [
      { pts: [0, 1, 14, 13],         tone: 0.28, sheen: true  },
      { pts: [1, 2, 15, 14],         tone: 0.16, sheen: true  },
      { pts: [2, 3, 4, 5, 15],       tone: 0.22, sheen: true  },
      { pts: [13, 14, 16, 12],       tone: 0.08, sheen: false },
      { pts: [12, 16, 10, 11],       tone: 0.05, sheen: false },
      { pts: [14, 15, 17, 16],       tone: 0.35, sheen: true  },
      { pts: [15, 5, 6, 17],         tone: 0.18, sheen: false },
      { pts: [16, 17, 6, 7, 8],      tone: 0.10, sheen: false },
      { pts: [10, 16, 8, 9],         tone: 0.14, sheen: false }
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

      // Dynamic refraction gradient per comboTier
      if (isLight) {
        ctx.fillStyle = sh.sheen ? 'rgba(255, 255, 255, 0.55)' : `rgba(244, 114, 182, ${0.12 + sh.tone * 0.3})`;
      } else if (tier >= 800) {
        ctx.fillStyle = sh.sheen ? 'rgba(255, 23, 68, 0.30)' : (sh.tone > 0.15 ? 'rgba(185, 28, 28, 0.24)' : 'rgba(15, 2, 5, 0.55)');
      } else if (tier >= 400) {
        ctx.fillStyle = sh.sheen ? 'rgba(232, 121, 249, 0.30)' : (sh.tone > 0.15 ? 'rgba(168, 85, 247, 0.22)' : 'rgba(15, 12, 40, 0.55)');
      } else if (tier >= 200) {
        ctx.fillStyle = sh.sheen ? 'rgba(0, 245, 255, 0.28)' : (sh.tone > 0.15 ? 'rgba(245, 158, 11, 0.20)' : 'rgba(8, 28, 55, 0.50)');
      } else if (tier >= 100) {
        ctx.fillStyle = sh.sheen ? 'rgba(253, 164, 175, 0.28)' : (sh.tone > 0.15 ? 'rgba(56, 189, 248, 0.22)' : 'rgba(7, 24, 45, 0.50)');
      } else {
        ctx.fillStyle = sh.sheen ? 'rgba(186, 230, 253, 0.30)' : (sh.tone > 0.15 ? 'rgba(56, 189, 248, 0.20)' : 'rgba(5, 20, 36, 0.50)');
      }
      ctx.fill();

      if (sh.sheen) {
        ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.38)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Razor-sharp cleavage lines
    ctx.strokeStyle = pal.border || '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const cleavageLines = [
      [14, 1], [14, 13], [14, 15], [14, 16],
      [15, 2], [15, 5], [15, 17],
      [16, 12], [16, 10], [16, 8], [16, 17],
      [17, 6]
    ];
    for (let k = 0; k < cleavageLines.length; k++) {
      const pA = pt(cleavageLines[k][0]);
      const pB = pt(cleavageLines[k][1]);
      ctx.moveTo(pA[0], pA[1]);
      ctx.lineTo(pB[0], pB[1]);
    }
    ctx.stroke();

    // Refractive dispersion glow
    ctx.strokeStyle = pal.laserGlow || 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    // Central star spark at primary fracture node
    const pCenter = pt(14);
    const pCenter2 = pt(15);
    ctx.fillStyle = pal.core || '#ffffff';
    ctx.beginPath();
    ctx.arc(pCenter[0], pCenter[1], 1.8, 0, Math.PI * 2);
    ctx.arc(pCenter2[0], pCenter2[1], 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Micro 4-point glass glint cross
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.90)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(pCenter[0] - 5, pCenter[1]); ctx.lineTo(pCenter[0] + 5, pCenter[1]);
    ctx.moveTo(pCenter[0], pCenter[1] - 5); ctx.lineTo(pCenter[0], pCenter[1] + 5);
    ctx.stroke();

    // Top glass bevel gloss sheen
    const glossH = Math.max(4, Math.round(h * 0.38));
    const gloss = ctx.createLinearGradient(x, yTop, x, yTop + glossH);
    gloss.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
    gloss.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
    ctx.fillStyle = gloss;
    ctx.fillRect(x, yTop, w, glossH);

    ctx.restore();

    // Outer perimeter border
    ctx.save();
    ctx.strokeStyle = pal.border || '#38bdf8';
    ctx.lineWidth = tier >= 800 ? 1.8 : 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, yTop, w, h, r);
    else ctx.rect(x, yTop, w, h);
    ctx.stroke();

    if (tier >= 100) {
      ctx.strokeStyle = pal.laserGlow || 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2.8;
      ctx.globalAlpha = 0.45;
      ctx.stroke();
    }
    ctx.restore();

    return true;
  },

  drawNoteDetails(ctx, x, yTop, w, h, isLight, comboTier) {
    return this.bakeTapNote(ctx, x, yTop, w, h, isLight, comboTier);
  },

  // ==========================================================================
  // 2. DONGHUA FLOWING ENERGY HOLD NOTES
  // Replaces sword logic with a flowing spiritual energy tail (white-to-blue gradient)
  // that terminates in a sharp "crescent moon" negative-space cutout at the top.
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
    const cutoutDepth = Math.min(Math.round(tailWidth * 0.36), Math.round(height * 0.45));
    const capHeight = cutoutDepth + 6;

    // 1. Energy Ribbon Gradient Strip (Smooth white-to-blue gradient, or obsidian-blood for T5)
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
      // T5 Blood-Moon: Obsidian black to blazing blood-red core
      grad.addColorStop(0, '#180308');
      grad.addColorStop(0.2, '#7f1d1d');
      grad.addColorStop(0.4, '#dc2626');
      grad.addColorStop(0.5, '#ffffff'); // pure white-hot qi center
      grad.addColorStop(0.6, '#dc2626');
      grad.addColorStop(0.8, '#7f1d1d');
      grad.addColorStop(1, '#180308');
    } else {
      // Donghua Celestial Flow: Deep sapphire blue to pure luminous white center
      grad.addColorStop(0, '#0369a1');
      grad.addColorStop(0.22, '#0284c7');
      grad.addColorStop(0.40, '#38bdf8');
      grad.addColorStop(0.50, '#ffffff'); // pure white-hot energy core
      grad.addColorStop(0.60, '#38bdf8');
      grad.addColorStop(0.78, '#0284c7');
      grad.addColorStop(1, '#0369a1');
    }
    g.fillStyle = grad;
    g.fillRect(0, 0, tailWidth, 4);

    // 2. Crescent Moon Negative-Space Cutout Cap (Ends in a sharp crescent moon at top)
    const cap = document.createElement('canvas');
    cap.width = tailWidth;
    cap.height = capHeight;
    const c = cap.getContext('2d');

    // Create the crescent moon negative space cutout:
    // Left & Right horns reach to y=0, center curves downward carving negative space!
    const half = tailWidth / 2;
    const radius = (half * half + cutoutDepth * cutoutDepth) / (2 * cutoutDepth);
    const centerY = cutoutDepth - radius;

    c.save();
    c.beginPath();
    c.moveTo(0, 0);
    // Inverted lunar arc creating the crescent negative space cutout
    c.arc(half, centerY, radius, Math.atan2(-centerY, -half), Math.atan2(-centerY, half), true);
    c.lineTo(tailWidth, capHeight);
    c.lineTo(0, capHeight);
    c.closePath();
    c.clip();

    // Fill with the energy gradient strip
    c.drawImage(strip, 0, 0, tailWidth, capHeight);

    // Radiant lunar crest glints at crescent horn tips
    if (!dead) {
      c.fillStyle = isT5 ? '#ff1744' : '#ffffff';
      c.beginPath();
      c.arc(1.5, 1.5, 1.8, 0, Math.PI * 2);
      c.arc(tailWidth - 1.5, 1.5, 1.8, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();

    // 3. Receptor Crescent Lotus Head
    const head = document.createElement('canvas');
    head.width = width;
    head.height = height;
    const n = head.getContext('2d');
    this.bakeTapNote(n, 0, 0, width, height, isLight, tier);
    if (dead) {
      n.globalCompositeOperation = 'source-atop';
      n.fillStyle = 'rgba(30,41,59,0.85)';
      n.fillRect(0, 0, width, height);
    }

    return cache.entries[key] = { strip, cap, head, tailWidth, capHeight };
  },

  bakeLongHead(ctx, x, yTop, w, h, isLight, style) {
    return true;
  },

  drawNeck(ctx, x, junctionY, w, headH, tile, isReleased = false, currentCombo = 0) {
    const dead = isReleased || !!(tile?.failed || tile?.released);
    const light = typeof document !== 'undefined' && document.body?.getAttribute('data-theme') === 'light';
    const paint = this._getHoldPaintCache(w, headH, currentCombo, dead, light);
    ctx.drawImage(paint.head, Math.round(x), Math.round(junctionY), w, headH);
    return true;
  },

  drawHeadOverlay() {},

  drawHoldBody(ctx, x, yTail, w, headH, tile, isLight, now, tailH,
    currentCombo = 0, actualYHeadTop = null, isReleased = false) {
    const bottom = actualYHeadTop ?? (yTail + tailH);
    const length = bottom - yTail;
    if (!(length > 0)) return true;

    const dead = isReleased || !!(tile?.failed || tile?.released);
    const paint = this._getHoldPaintCache(w, headH, currentCombo, dead, isLight);
    const left = Math.round(x + (w - paint.tailWidth) / 2);
    const capHeight = Math.min(paint.capHeight, length);

    // 1. Crescent moon cutout cap at top of tail
    ctx.drawImage(paint.cap, 0, 0, paint.tailWidth, capHeight, left, yTail, paint.tailWidth, capHeight);

    // 2. Flowing energy tail body
    if (length > paint.capHeight) {
      ctx.drawImage(paint.strip, left, yTail + paint.capHeight, paint.tailWidth, length - paint.capHeight + 1);

      // Subtle flowing energy wave filaments
      if (!dead && length > 50) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const tier = this._resolveTierNum(currentCombo);
        ctx.strokeStyle = tier >= 800 ? 'rgba(255, 23, 68, 0.75)' : 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        const cx = left + paint.tailWidth / 2;
        const step = 32;
        for (let y = yTail + paint.capHeight + 8; y < bottom - 10; y += step) {
          const wave = Math.sin((y + (now || 0) * 0.12) * 0.05) * (paint.tailWidth * 0.22);
          ctx.moveTo(cx + wave, y);
          ctx.lineTo(cx - wave, y + step * 0.5);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    return true;
  },

  drawHoldTail(ctx, x, yTail, w, headH, tile, isLight, now, tailH = 0,
    currentCombo = 0, actualYHeadTop = null, nextTileDist = 9999) {
    // Crescent moon negative space is rendered at yTail in drawHoldBody
    return true;
  },

  // ==========================================================================
  // 3. RECEPTOR LINE — CELESTIAL GLACIO RECEPTORS
  // ==========================================================================
  drawReceptor(ctx, x, y, w, h, isActive, isLight) {
    ctx.save();
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(5, h * 0.3);

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

    ctx.strokeStyle = isActive ? '#ffffff' : (isLight ? 'rgba(56, 189, 248, 0.9)' : 'rgba(56, 189, 248, 0.70)');
    ctx.lineWidth = isActive ? 2.0 : 1.4;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, w - 2, h - 2, r);
      ctx.stroke();
    } else {
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    }

    ctx.fillStyle = isActive ? '#f43f5e' : 'rgba(56, 189, 248, 0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy, isActive ? 3.0 : 1.8, 0, Math.PI * 2);
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

    // Expanding Glacio Shockwave Ring
    const ringR = (w * 0.15) + easeOut * (w * 0.58);
    const ringAlpha = Math.max(0, (1.0 - p) * 0.75);
    ctx.lineWidth = Math.max(1, 2.2 * (1.0 - p));
    ctx.strokeStyle = (combo >= 800) ? `rgba(255, 23, 68, ${ringAlpha})` : `rgba(56, 189, 248, ${ringAlpha})`;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.stroke();

    // Shattered Ice Shards
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

    // Central 6-Ray Glacio Star
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
    ctx.restore();
  },

  // ==========================================================================
  // 5. ATMOSPHERE — WEBGL ICE TREE, CELESTIAL MOON & HIGH-DENSITY PARTICLE SWARM
  // ==========================================================================
  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    const gw = State?.gameWidth > 0 ? State.gameWidth : (ctx.canvas?.clientWidth || ctx.canvas?.width / dpr || 400);
    const gh = State?.gameHeight > 0 ? State.gameHeight : (ctx.canvas?.clientHeight || ctx.canvas?.height / dpr || 700);
    const combo = State?.combo || 0;
    const isT5 = combo >= 800;

    // 1. WebGL Scene Graph Execution (Pixi backgroundLayer)
    if (pixiRenderer && pixiRenderer.isReady && pixiRenderer.backgroundLayer) {
      setupPixiIceTreeAndMoon(gw, gh, isT5);
      // When Pixi is active, the Ice Tree & Moon render on the GPU stage!
    } else {
      // 2. Canvas 2D Fallback (Ensures zero crashes during headless tests or WebGL loss)
      drawCanvasIceTreeAndMoon(ctx, gw, gh, songTime || 0, isT5);
    }

    // Atmospheric snowflake swarm fallback on 2D context if Pixi is not rendering
    if (!pixiRenderer || !pixiRenderer.isReady || !pixiRenderer.areParticlesHandled) {
      if (sanhuaSnowflakes.length === 0) {
        for (let i = 0; i < 90; i++) {
          sanhuaSnowflakes.push({
            x: Math.random() * gw,
            y: Math.random() * gh,
            sz: 1.5 + Math.random() * 3.5,
            speedY: 1.2 + Math.random() * 2.2,
            speedX: -(1.5 + Math.random() * 2.0),
            alpha: 0.35 + Math.random() * 0.45
          });
        }
      }
      ctx.save();
      const col = isT5 ? '#ff1744' : '#bae6fd';
      ctx.fillStyle = col;
      for (let i = 0; i < sanhuaSnowflakes.length; i++) {
        const p = sanhuaSnowflakes[i];
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y > gh + 10 || p.x < -10) {
          p.y = -10;
          p.x = Math.random() * (gw + 50);
        }
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

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
    ctx.lineTo(sz * 0.6, 0);
    ctx.lineTo(0, sz);
    ctx.lineTo(-sz * 0.6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
};
