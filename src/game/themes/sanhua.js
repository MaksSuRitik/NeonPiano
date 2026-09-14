// Hiyuki / Sanhua — moonlit crystal, with a blood eclipse at 800 combo.
// Geometry is authored as connected, tapered limbs. Static light and material
// are baked once per viewport; only sparse snow and the eclipse envelope move.

function mulberry32(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const environmentCache = new Map();
const atmosphereStates = new WeakMap();
function polygon(ctx, points, fill) {
  ctx.beginPath();
  points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}

// Each limb starts inside its parent. Shared mitered cross-sections prevent
// detached prism joints, gaps at elbows, and repeated end-cap stripes.
const LIMBS = [
  [[.48,.46,.065],[.34,.49,.040],[.19,.47,.024],[.08,.40,.012],[-.04,.38,0]],
  [[.34,.49,.028],[.27,.59,.016],[.15,.63,0]],
  [[.52,.40,.057],[.39,.27,.038],[.35,.16,.020],[.26,.075,0]],
  [[.39,.27,.026],[.23,.22,.016],[.13,.12,0]],
  [[.35,.16,.018],[.43,.09,.010],[.45,.015,0]],
  [[.63,.65,.080],[.77,.53,.047],[.88,.48,.025],[1.03,.47,0]],
  [[.77,.53,.028],[.79,.43,.015],[.88,.37,0]],
  [[.49,.46,.108],[.53,.32,.074],[.66,.23,.049],[.82,.19,.023],[1.02,.08,0]],
  [[.66,.23,.033],[.67,.13,.018],[.61,.045,0]],
  [[.82,.19,.019],[.92,.25,0]],
  [[.79,1.08,.27],[.71,.87,.225],[.67,.69,.18],[.58,.54,.168],[.46,.42,.135],[.29,.34,.080],[.14,.32,.037],[-.07,.24,0]],
  [[.29,.34,.044],[.20,.23,.026],[.075,.18,0]],
  [[.20,.23,.015],[.19,.105,0]],
];

function limbRails(nodes, w, h) {
  const pts = nodes.map(([x,y,r]) => [x*w,y*h,r*w]);
  return pts.map((p,i) => {
    const a = pts[Math.max(0,i-1)], b = pts[Math.min(pts.length-1,i+1)];
    const dx=b[0]-a[0], dy=b[1]-a[1], len=Math.hypot(dx,dy)||1;
    return {x:p[0], y:p[1], nx:-dy/len, ny:dx/len, r:p[2]*.5};
  });
}
function band(rails, a, b) {
  return [...rails.map(p=>[p.x+p.nx*p.r*a,p.y+p.ny*p.r*a]),
    ...rails.slice().reverse().map(p=>[p.x+p.nx*p.r*b,p.y+p.ny*p.r*b])];
}
function initGlassPlates(gw, gh) {
  const rng = mulberry32(0x3B99E1);
  const plates = [];

  // Layer 0: Background (8 plates, slow, behind moon & tree)
  for (let i = 0; i < 8; i++) {
    plates.push(createShard(rng, gw, gh, 0.25, 35, 65, 0.45));
  }
  // Layer 1: Midground (10 plates, medium, around tree)
  for (let i = 0; i < 10; i++) {
    plates.push(createShard(rng, gw, gh, 0.55, 50, 95, 0.60));
  }
  // Layer 2: Foreground (4 large plates, bold, in front of tree)
  for (let i = 0; i < 4; i++) {
    plates.push(createShard(rng, gw, gh, 0.85, 95, 170, 0.78));
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
  const pad = 140;
  const spanX = gw + pad * 2;
  const spanY = gh + pad * 2;
  const rawX = (((p.x0 * gw + p.driftX * t) % spanX + spanX) % spanX) - pad;
  const rawY = (((p.y0 * gh + p.driftY * t) % spanY + spanY) % spanY) - pad;
  const rot = p.rot + p.rotSpeed * t;
  const sz = p.size;
  const alpha = p.baseAlpha * alphaMult;

  ctx.save();
  ctx.translate(rawX, rawY);
  ctx.rotate(rot);

  // Shard body: translucent broken mirror / glass plate
  const grad = ctx.createLinearGradient(-sz * 0.5, -sz * 0.5, sz * 0.5, sz * 0.5);
  if (isT5) {
    grad.addColorStop(0, `rgba(45, 10, 18, ${alpha * 0.70})`);
    grad.addColorStop(0.6, `rgba(20, 4, 8, ${alpha * 0.85})`);
    grad.addColorStop(1, `rgba(6, 1, 3, ${alpha * 0.90})`);
  } else {
    grad.addColorStop(0, `rgba(225, 242, 255, ${alpha * 0.58})`);  // pale silver reflection
    grad.addColorStop(0.5, `rgba(125, 175, 218, ${alpha * 0.40})`); // subtle cold ice-blue tint
    grad.addColorStop(1, `rgba(12, 26, 48, ${alpha * 0.68})`);      // dark transparent interior
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(p.verts[0][0] * sz, p.verts[0][1] * sz);
  for (let i = 1; i < p.verts.length; i++) {
    ctx.lineTo(p.verts[i][0] * sz, p.verts[i][1] * sz);
  }
  ctx.closePath();
  ctx.fill();

  // Bright moon-facing rim edge (silver in normal, crimson in T5)
  ctx.strokeStyle = isT5 ? `rgba(255, 45, 85, ${alpha * 0.95})` : `rgba(255, 255, 255, ${alpha * 0.92})`;
  ctx.lineWidth = Math.max(1.0, sz * 0.022);
  ctx.beginPath();
  ctx.moveTo(p.verts[0][0] * sz, p.verts[0][1] * sz);
  ctx.lineTo(p.verts[1][0] * sz, p.verts[1][1] * sz);
  if (p.verts.length > 2) ctx.lineTo(p.verts[2][0] * sz, p.verts[2][1] * sz);
  ctx.stroke();

  // Dark shadow edge for 3D glass facet depth
  ctx.strokeStyle = isT5 ? `rgba(12, 2, 4, ${alpha * 0.8})` : `rgba(8, 22, 45, ${alpha * 0.60})`;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  const last = p.verts.length - 1;
  ctx.moveTo(p.verts[last][0] * sz, p.verts[last][1] * sz);
  ctx.lineTo(p.verts[0][0] * sz, p.verts[0][1] * sz);
  ctx.stroke();

  // Internal cleavage highlight plane line
  if (p.verts.length >= 4) {
    ctx.strokeStyle = isT5 ? `rgba(255, 90, 120, ${alpha * 0.55})` : `rgba(255, 255, 255, ${alpha * 0.50})`;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(p.verts[1][0] * sz * 0.8, p.verts[1][1] * sz * 0.8);
    ctx.lineTo(p.verts[3][0] * sz * 0.8, p.verts[3][1] * sz * 0.8);
    ctx.stroke();
  }

  ctx.restore();
}

function bakeEnvironment(w,h,eclipse) {
  const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext('2d');
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,eclipse?'#08060d':'#070d1a');
  sky.addColorStop(.48,eclipse?'#1c0b19':'#152334');
  sky.addColorStop(1,'#040810');
  ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);
  const mx=w*.66,my=h*.235,r=w*.29;
  const halo=ctx.createRadialGradient(mx,my,r*.65,mx,my,r*2.0);
  halo.addColorStop(0,eclipse?'#642334':'rgba(235, 246, 255, 0.35)');
  halo.addColorStop(0.35,eclipse?'#280c16':'rgba(180, 215, 245, 0.14)');
  halo.addColorStop(1,'transparent');
  ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);

  const moon=ctx.createLinearGradient(mx-r*.8,my-r*.8,mx+r*.8,my+r*.8);
  moon.addColorStop(0,eclipse?'#bc5365':'#ffffff');
  moon.addColorStop(0.40,eclipse?'#7c2b42':'#f8fbff');
  moon.addColorStop(0.75,eclipse?'#4a1b2d':'#edf2f7');
  moon.addColorStop(1,eclipse?'#1c0b19':'#dfe7ef');
  ctx.save();ctx.beginPath();ctx.arc(mx,my,r,0,Math.PI*2);ctx.clip();
  ctx.fillStyle=moon;ctx.fillRect(mx-r,my-r,r*2,r*2);

  if(!eclipse) {
    // Subtle, restrained maria variations (soft silver-cool surface plains)
    const mariaRng=mulberry32(6281);
    for(let i=0;i<14;i++) {
      const mxOff=mx+(mariaRng()-.5)*r*1.5;
      const myOff=my+(mariaRng()-.5)*r*1.5;
      const sz=r*(.08+mariaRng()*.20);
      const maria=ctx.createRadialGradient(mxOff,myOff,0,mxOff,myOff,sz);
      maria.addColorStop(0,'rgba(185, 202, 220, 0.055)');
      maria.addColorStop(1,'transparent');
      ctx.fillStyle=maria;ctx.fillRect(mxOff-sz,myOff-sz,sz*2,sz*2);
    }

    // 3D embedded craters with illuminated rims and soft basins
    const craterRng=mulberry32(7391);
    const numCraters=22;
    for(let i=0;i<numCraters;i++) {
      const isMajor=i<5;
      const isMedium=i>=5 && i<12;
      const angle=craterRng()*Math.PI*2;
      const dist=Math.sqrt(craterRng())*r*.84;
      const cx=mx+Math.cos(angle)*dist;
      const cy=my+Math.sin(angle)*dist;
      const cr=isMajor?r*(.065+craterRng()*.035):(isMedium?r*(.035+craterRng()*.020):r*(.016+craterRng()*.015));

      // 1. Soft darker basin depression (shifted slightly away from top-left light source)
      const basin=ctx.createRadialGradient(cx+cr*.15,cy+cr*.15,0,cx,cy,cr);
      basin.addColorStop(0,'rgba(148, 168, 192, 0.22)');
      basin.addColorStop(.65,'rgba(175, 193, 212, 0.12)');
      basin.addColorStop(1,'rgba(215, 228, 240, 0.0)');
      ctx.fillStyle=basin;ctx.beginPath();ctx.arc(cx,cy,cr,0,Math.PI*2);ctx.fill();

      // 2. Bright illuminated rim on top-left (moonlit edge)
      ctx.strokeStyle='rgba(255, 255, 255, 0.90)';
      ctx.lineWidth=Math.max(.7,cr*.14);
      ctx.beginPath();
      ctx.arc(cx,cy,cr,Math.PI*.85,Math.PI*1.85);
      ctx.stroke();

      // 3. Delicate inner shadow on bottom-right
      ctx.strokeStyle='rgba(130, 150, 175, 0.18)';
      ctx.lineWidth=Math.max(.6,cr*.10);
      ctx.beginPath();
      ctx.arc(cx,cy,cr,-Math.PI*.15,Math.PI*.85);
      ctx.stroke();

      // 4. Central peak / highlight in larger craters
      if(isMajor) {
        ctx.fillStyle='rgba(255, 255, 255, 0.80)';
        ctx.beginPath();
        ctx.arc(cx-cr*.08,cy-cr*.08,Math.max(.8,cr*.12),0,Math.PI*2);
        ctx.fill();
      }
    }
  } else {
    // Eclipse dark moon disc
    ctx.fillStyle='#100a15';
    ctx.beginPath();
    ctx.arc(mx-r*.12,my-r*.08,r*.89,0,Math.PI*2);
    ctx.fill();
  }
  ctx.restore();

  // Background sky atmosphere fog and vignette
  const fog=ctx.createLinearGradient(0,h*.45,0,h);
  fog.addColorStop(0,'transparent');fog.addColorStop(.6,'rgba(4,9,18,.38)');fog.addColorStop(1,'rgba(3,7,14,.88)');
  ctx.fillStyle=fog;ctx.fillRect(0,0,w,h);
  const vignette=ctx.createRadialGradient(w*.55,h*.33,w*.12,w*.5,h*.45,h*.74);
  vignette.addColorStop(0,'rgba(3,7,16,.08)');vignette.addColorStop(1,'rgba(2,5,12,.65)');
  ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);

  // Snapshot the background (sky + moon + atmosphere) before clearing to bake tree
  const skyCanvas=document.createElement('canvas');skyCanvas.width=w;skyCanvas.height=h;
  skyCanvas.getContext('2d').drawImage(canvas,0,0);canvas.sky=skyCanvas;
  ctx.clearRect(0,0,w,h);

  LIMBS.forEach((nodes,index)=>{
    const rails=limbRails(nodes,w,h);

    // Base crystal volume: luminous white with soft cool-ice shading
    const shade=ctx.createLinearGradient(w*.35,0,w*.85,h);
    shade.addColorStop(0,eclipse?'#261924':'#ffffff');
    shade.addColorStop(.35,eclipse?'#1a121e':'#f8fbff');
    shade.addColorStop(.70,eclipse?'#130f1a':'#eef7ff');
    shade.addColorStop(1,eclipse?'#060910':'#d9e8f2');
    polygon(ctx,band(rails,-1,1),shade);

    // Moonlit primary facet (bright specular white)
    const light=ctx.createLinearGradient(0,h*.08,0,h*.95);
    light.addColorStop(0,eclipse?'#8e3852':'#ffffff');
    light.addColorStop(.38,eclipse?'#48243a':'#f8fbff');
    light.addColorStop(1,eclipse?'#0f101a':'#eef7ff');
    polygon(ctx,band(rails,.15,.75),light);

    // Cool shadow facet for 3D depth and crystalline refraction (#8fa5b7 / #6d8396)
    const shadow=ctx.createLinearGradient(0,0,w*.5,h);
    shadow.addColorStop(0,eclipse?'#100c16':'#c5d8e5');
    shadow.addColorStop(.45,eclipse?'#0c0e18':'#8fa5b7');
    shadow.addColorStop(1,eclipse?'#060810':'#6d8396');
    polygon(ctx,band(rails,-1,-.45),shadow);

    // Deep crevice accent only on the backmost edge (#405469)
    polygon(ctx,band(rails,-1,-.80),eclipse?'#04050a':'#405469');

    // Irregular internal crystalline fracture facet (bright refraction)
    if(rails.length>3) {
      const p=rails[1], q=rails[rails.length-2], a=rails[0];
      polygon(ctx,[[a.x,a.y],[p.x+p.nx*p.r*.7,p.y+p.ny*p.r*.7],
        [q.x,q.y],[p.x-p.nx*p.r*.3,p.y-p.ny*p.r*.3]],eclipse?'rgba(175,50,80,.16)':'rgba(255,255,255,.45)');
    }

    // Moonlit crystalline crest highlight along the upper ridge
    ctx.beginPath();
    rails.slice(1).forEach((p,i)=>i?ctx.lineTo(p.x+p.nx*p.r*.75,p.y+p.ny*p.r*.75):ctx.moveTo(p.x+p.nx*p.r*.75,p.y+p.ny*p.r*.75));
    ctx.strokeStyle=eclipse?'rgba(235,85,110,.55)':'rgba(255,255,255,.95)';
    ctx.lineWidth=index===10?1.6:.9;ctx.stroke();

    // Additional fine specular sparkle line on the thick trunk (index 10)
    if(index===10) {
      ctx.beginPath();
      rails.slice(1).forEach((p,i)=>i?ctx.lineTo(p.x+p.nx*p.r*.35,p.y+p.ny*p.r*.35):ctx.moveTo(p.x+p.nx*p.r*.35,p.y+p.ny*p.r*.35));
      ctx.strokeStyle=eclipse?'rgba(200,60,85,.35)':'rgba(255,255,255,.65)';
      ctx.lineWidth=0.8;ctx.stroke();
    }
  });

  // Peripheral crystal masses
  const rng=mulberry32(6281);
  for(let i=0;i<7;i++) {
    const x=(i%2 ? .97:.025)*w, y=(.32+i*.105)*h,sz=w*(.025+rng()*.04);
    polygon(ctx,[[x,y-sz],[x+sz*.6,y],[x+sz*.15,y+sz*1.7],[x-sz*.4,y+sz*.3]],eclipse?'#241422':'#d9e8f2');
    polygon(ctx,[[x,y-sz],[x+sz*.6,y],[x+sz*.15,y+sz*1.7]],eclipse?'#422033':'#ffffff');
  }

  // Gentle ground haze only at the very bottom base
  const groundHaze=ctx.createLinearGradient(0,h*.86,0,h);
  groundHaze.addColorStop(0,'transparent');
  groundHaze.addColorStop(1,eclipse?'rgba(12,4,10,.65)':'rgba(3,7,14,.55)');
  ctx.fillStyle=groundHaze;
  ctx.fillRect(0,h*.86,w,h*.14);
  return canvas;
}
function ensureEnvCache(w,h) {
  const key=`${w}:${h}`;
  if(environmentCache.has(key)) return environmentCache.get(key);
  const rng=mulberry32(413);
  const entry={normal:bakeEnvironment(w,h,false),eclipse:bakeEnvironment(w,h,true),
    glass:initGlassPlates(w,h),
    snow:Array.from({length:32},()=>({x:rng()*w,y:rng()*h,s:.5+rng()*1.3,speed:2+rng()*5,alpha:.10+rng()*.2}))};
  if(environmentCache.size>=2) environmentCache.delete(environmentCache.keys().next().value);
  environmentCache.set(key,entry);return entry;
}

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
    const pal = this._getHiyukiNotePalette(tier);
    return { bgTop: pal.bgStops[0][1], bgMid: pal.bgStops[2][1], bgBot: '#070d19',
      border: pal.edge, core: pal.specular, laserGlow: pal.resonanceGlow,
      laserCore: pal.resonance, petalCol: pal.resonance, trackBg: 'rgba(7,13,25,.5)',
      goldTrim: pal.edge, crestCol: pal.resonance };
  },

  // Shared silver → cyan → azure → violet → amethyst → obsidian material.

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
        // Vertical gradient: Dead / Released state (0.56-0.94 smooth longitudinal progression)
        holdVerticalStops: [
          [0.00, 'rgba(30, 41, 59, 0.94)'],  // BOTTOM: near receptor
          [0.25, 'rgba(51, 65, 85, 0.91)'],  // 25% up
          [0.50, 'rgba(71, 85, 105, 0.82)'], // 50% up
          [0.75, 'rgba(100, 116, 139, 0.70)'],// 75% up
          [1.00, 'rgba(71, 85, 105, 0.56)']  // TOP: free end at yTail
        ],
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
        // Vertical gradient: Black -> Dark Red -> Crimson (0.62-0.96 smooth longitudinal progression)
        holdVerticalStops: [
          [0.00, 'rgba(8, 3, 6, 0.96)'],     // BOTTOM: #080306 (near receptor)
          [0.25, 'rgba(38, 8, 18, 0.93)'],   // MID-LOW: #260812 (25%)
          [0.50, 'rgba(103, 18, 37, 0.86)'], // MID: #671225 (50%)
          [0.75, 'rgba(197, 30, 62, 0.75)'], // MID-HIGH: #c51e3e (75%)
          [1.00, 'rgba(143, 20, 46, 0.62)']  // TOP: #8f142e (free end at yTail)
        ],
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
        // Vertical gradient: Amethyst hue progression (0.56-0.94 smooth longitudinal progression)
        holdVerticalStops: [
          [0.00, 'rgba(85, 66, 126, 0.94)'],  // BOTTOM: #55427e (near receptor)
          [0.25, 'rgba(120, 98, 169, 0.91)'], // MID-LOW: #7862a9 (25%)
          [0.50, 'rgba(165, 143, 208, 0.82)'],// MID: #a58fd0 (50%)
          [0.75, 'rgba(209, 194, 234, 0.70)'],// MID-HIGH: #d1c2ea (75%)
          [1.00, 'rgba(170, 150, 210, 0.56)'] // TOP: #aa96d2 (free end at yTail)
        ],
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
        // Vertical gradient: Violet hue progression (0.56-0.94 smooth longitudinal progression)
        holdVerticalStops: [
          [0.00, 'rgba(64, 59, 130, 0.94)'],  // BOTTOM: #403b82 (near receptor)
          [0.25, 'rgba(98, 93, 180, 0.91)'],  // MID-LOW: #625db4 (25%)
          [0.50, 'rgba(136, 131, 213, 0.82)'],// MID: #8883d5 (50%)
          [0.75, 'rgba(182, 177, 235, 0.70)'],// MID-HIGH: #b6b1eb (75%)
          [1.00, 'rgba(142, 136, 214, 0.56)'] // TOP: #8e88d6 (free end at yTail)
        ],
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
        // Vertical gradient: Azure hue progression (0.56-0.94 smooth longitudinal progression)
        holdVerticalStops: [
          [0.00, 'rgba(23, 77, 124, 0.94)'],  // BOTTOM: #174d7c (near receptor)
          [0.25, 'rgba(38, 119, 173, 0.91)'], // MID-LOW: #2677ad (25%)
          [0.50, 'rgba(77, 164, 214, 0.82)'], // MID: #4da4d6 (50%)
          [0.75, 'rgba(145, 207, 236, 0.70)'],// MID-HIGH: #91cfec (75%)
          [1.00, 'rgba(94, 173, 216, 0.56)']  // TOP: #5eadd8 (free end at yTail)
        ],
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
        // Vertical gradient: Cyan hue progression (0.56-0.94 smooth longitudinal progression)
        holdVerticalStops: [
          [0.00, 'rgba(20, 125, 155, 0.94)'], // BOTTOM: #147d9b (near receptor)
          [0.25, 'rgba(40, 181, 210, 0.91)'], // MID-LOW: #28b5d2 (25%)
          [0.50, 'rgba(98, 216, 237, 0.82)'], // MID: #62d8ed (50%)
          [0.75, 'rgba(167, 239, 248, 0.70)'],// MID-HIGH: #a7eff8 (75%)
          [1.00, 'rgba(114, 215, 233, 0.56)'] // TOP: #72d7e9 (free end at yTail)
        ],
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
      // Vertical gradient: Silver hue progression (0.56-0.94 smooth longitudinal progression)
      holdVerticalStops: [
        [0.00, 'rgba(100, 127, 146, 0.94)'], // BOTTOM: #647f92 (near receptor)
        [0.25, 'rgba(168, 194, 210, 0.91)'], // MID-LOW: #a8c2d2 (25%)
        [0.50, 'rgba(215, 229, 237, 0.82)'], // MID: #d7e5ed (50%)
        [0.75, 'rgba(238, 245, 248, 0.70)'], // MID-HIGH: #eef5f8 (75%)
        [1.00, 'rgba(197, 217, 228, 0.56)']  // TOP: #c5d9e4 (free end at yTail)
      ],
    };
  },

  // ==========================================================================
  // 1. FACETED HIYUKI TAP NOTES
  // Compact beveled body with lateral ice fin accents
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
    const left = x + finExt + 1;
    const right = x + w - finExt - 1;
    const top = yTop + 2;
    const bot = yTop + h - 2;

    ctx.save();

    // 1. Beveled Crystal Silhouette (Compact rounded body with lateral ice fin accents)
    const traceSilhouette = (pCtx) => {
      pCtx.beginPath();
      // Top-left corner & top edge
      pCtx.moveTo(left + r, top);
      pCtx.lineTo(right - r, top);
      pCtx.lineTo(right, top + r);
      // Right edge down to right ice fin
      pCtx.lineTo(right, cy - finH);
      pCtx.lineTo(right + finExt, cy);
      pCtx.lineTo(right, cy + finH);
      pCtx.lineTo(right, bot - r);
      pCtx.lineTo(right - r, bot);
      // Bottom edge
      pCtx.lineTo(left + r, bot);
      pCtx.lineTo(left, bot - r);
      // Left edge up to left ice fin
      pCtx.lineTo(left, cy + finH);
      pCtx.lineTo(left - finExt, cy);
      pCtx.lineTo(left, cy - finH);
      pCtx.lineTo(left, top + r);
      pCtx.lineTo(left + r, top);
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
    ctx.lineTo(left + (right - left) * 0.35, top + (bot - top) * 0.22);
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
    ctx.lineTo(right - r - 2, top + 1);
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
    ctx.fillStyle = isObsidian ? 'rgba(255, 23, 68, 0.16)' : 'rgba(72, 13, 35, 0.14)';
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

  // Dense, broad hold material with a smooth receptor-to-free-end gradient.
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

    // A normalized longitudinal texture: constant memory for every hold length.
    const strip = document.createElement('canvas');
    strip.width = tailWidth; strip.height = 512;
    const g = strip.getContext('2d');
    const grad = g.createLinearGradient(0, 512, 0, 0);
    for (const [stop, col] of pal.holdVerticalStops) grad.addColorStop(stop, col);
    g.fillStyle = grad; g.fillRect(0, 0, tailWidth, 512);
    // Broad inner plane and narrow bevels give the body volume without a stripe.
    const cross = g.createLinearGradient(0, 0, tailWidth, 0);
    cross.addColorStop(0, 'rgba(2,6,14,.30)');
    cross.addColorStop(.055, pal.isObsidian ? 'rgba(214,48,78,.32)' : 'rgba(222,238,250,.16)');
    cross.addColorStop(.13, 'rgba(2,6,14,.12)');
    cross.addColorStop(.36, 'rgba(2,6,14,0)');
    cross.addColorStop(.72, pal.isObsidian ? 'rgba(162,35,62,.10)' : 'rgba(220,234,249,.08)');
    cross.addColorStop(.91, 'rgba(2,6,14,.10)');
    cross.addColorStop(.97, pal.isObsidian ? 'rgba(214,48,78,.35)' : 'rgba(222,238,250,.17)');
    cross.addColorStop(1, 'rgba(2,6,14,.24)');
    g.fillStyle=cross;g.fillRect(0,0,tailWidth,512);

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

    return (cache.entries[key] = {
      strip, tip: strip, cap: strip, head, buf: strip,
      bodyW: tailWidth, tailWidth, tipHeight: 0, capHeight: 0, palette: pal
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
    const left = Math.round(x + (w - paint.tailWidth) / 2);
    const bodyW = paint.bodyW;
    const bevel = Math.min(7, length * .18, bodyW * .08);
    ctx.save();
    polygon(ctx, [[left+bevel,yTail],[left+bodyW-bevel,yTail],
      [left+bodyW,yTail+bevel],[left+bodyW,bottom],
      [left,bottom],[left,yTail+bevel]]);
    ctx.clip();
    ctx.drawImage(paint.strip,0,0,bodyW,512,left,yTail,bodyW,length);
    ctx.restore();
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
    const combo = typeof window !== 'undefined' ? window.GameState?.combo || 0 : 0;
    const pal = this._getHiyukiNotePalette(combo, false, isLight);
    ctx.save();
    const edge = isLight ? pal.bgStops.at(-1)[1] : pal.edge;
    polygon(ctx, [[x+6,y+2],[x+w-6,y+2],[x+w-1,y+7],
      [x+w-1,y+h-3],[x+1,y+h-3],[x+1,y+7]],
      isActive ? pal.facetDark : 'rgba(7,12,23,.68)');
    ctx.globalAlpha *= isActive ? .95 : .50;
    ctx.strokeStyle=edge;ctx.lineWidth=1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x+2,y+h-5);ctx.lineTo(x+2,y+7);ctx.lineTo(x+8,y+2);ctx.lineTo(x+19,y+2);
    ctx.moveTo(x+w-19,y+2);ctx.lineTo(x+w-8,y+2);ctx.lineTo(x+w-2,y+7);ctx.lineTo(x+w-2,y+h-5);
    ctx.strokeStyle=isActive?pal.specular:edge;ctx.lineWidth=isActive?2:1.4;ctx.stroke();
    if(isActive) {
      ctx.fillStyle=pal.resonance;ctx.fillRect(x+w*.32,y+h-3,w*.36,2);
    }
    ctx.restore();return true;
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
    const colBlade = pal.border;
    const colCore = isPerfect ? '#ffffff' : (combo >= 800 ? '#ffffff' : pal.laserCore);

    // Expanding Glacio shockwave ring
    const ringR = (w * 0.15) + easeOut * (w * 0.58);

    ctx.lineWidth = Math.max(1, 2.0 * (1.0 - p));
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = pal.border;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.stroke();

    // Shattered ice shards
    const numShards = 5;
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

      ctx.fillStyle = pal.border;
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

  // Environment stays below notes and receptor contrast.
  updateAndDrawAtmosphere(ctx, songTime, warpMult, speedBoost, State) {
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const w = Math.round(State?.gameWidth || ctx.canvas.width / dpr || 400);
    const h = Math.round(State?.gameHeight || ctx.canvas.height / dpr || 700);
    const now = songTime || 0, target = (State?.combo || 0) >= 800 ? 1 : 0;
    const owner = State && typeof State === 'object' ? State : this;
    let state = atmosphereStates.get(owner);
    if (!state || now < state.now) {
      state = {blend:target, now, target, event:-10000};
      atmosphereStates.set(owner,state);
    }
    if (target && !state.target) state.event = now;
    const dt = Math.max(0,Math.min(.1,(now-state.now)/1000));
    state.blend += (target-state.blend)*(1-Math.exp(-dt*3.8));
    state.now=now; state.target=target;
    const env=ensureEnvCache(w,h), blend=state.blend;
    ctx.save();
    const sceneAlpha=ctx.globalAlpha;
    ctx.drawImage(env.normal.sky,0,0);
    if(blend>.001) {ctx.globalAlpha=sceneAlpha*blend;ctx.drawImage(env.eclipse.sky,0,0);}
    ctx.globalAlpha=sceneAlpha;
    // Layer 0: Background mirror shards (behind tree limbs)
    for(let i=0;i<8;i++) drawGlassPlate(ctx,env.glass[i],now,w,h,blend>.5,0.85);

    // Tree limbs (normal and eclipse)
    ctx.globalAlpha=sceneAlpha*(1-blend);ctx.drawImage(env.normal,0,0);
    if(blend>.001) {ctx.globalAlpha=sceneAlpha*blend;ctx.drawImage(env.eclipse,0,0);}
    ctx.globalAlpha=sceneAlpha;

    // Layer 1: Midground mirror shards (around tree)
    for(let i=8;i<18;i++) drawGlassPlate(ctx,env.glass[i],now,w,h,blend>.5,1.0);

    // Layer 2: Foreground mirror shards (bold, in front)
    for(let i=18;i<env.glass.length;i++) drawGlassPlate(ctx,env.glass[i],now,w,h,blend>.5,0.92);
    ctx.restore();
    ctx.save();
    const inheritedAlpha = ctx.globalAlpha;
    // A single, slow wind field; positions derive from time, not frame count.
    for(const p of env.snow) {
      const px=((p.x-now*.001*p.speed*.32)%(w+12)+w+12)%(w+12)-6;
      const py=(p.y+now*.001*p.speed)%(h+12)-6;
      ctx.globalAlpha=inheritedAlpha*p.alpha*(py>h*.73 ? .45 : 1);
      ctx.fillStyle=blend>.5?'#b86b81':'#b3c6d6';
      ctx.fillRect(px,py,p.s*.65,p.s);
    }
    // One restrained eclipse wave, behind gameplay, when the tier is crossed.
    const event=(now-state.event)/1500;
    if(event>=0 && event<1) {
      ctx.globalAlpha=inheritedAlpha*Math.sin(event*Math.PI)*.25;
      ctx.strokeStyle='#c87187';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(w*.66,h*.235,w*(.29+event*.65),0,Math.PI*2);ctx.stroke();
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
