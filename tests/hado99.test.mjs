import test from 'node:test';
import assert from 'node:assert/strict';
import { HADO99_THEME as theme } from '../src/game/themes/hado99.js';

function context(alpha = 1) {
  const stack = [];
  const paints = [];
  const target = {
    globalAlpha: alpha,
    paints,
    save() { stack.push(this.globalAlpha); },
    restore() { this.globalAlpha = stack.pop(); },
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; },
    fill() { paints.push(this.globalAlpha); },
    stroke() { paints.push(this.globalAlpha); },
    drawImage() { paints.push(this.globalAlpha); }
  };
  return new Proxy(target, { get: (obj, key) => key in obj ? obj[key] : () => {} });
}

test('one smooth opacity covers the final head-length and all release states', () => {
  const active = { hit: true, holding: true };
  assert.equal(theme.getHoldOpacity(active, 0), 0);
  assert.equal(theme.getHoldOpacity(active, 60), 0.5);
  assert.equal(theme.getHoldOpacity(active, 120), 1);
  assert.equal(theme.getHoldOpacity(active, -20), 0);
  assert.equal(theme.getHoldOpacity({ ...active, released: true }, 20), 1);
  assert.equal(theme.getHoldOpacity({ ...active, failed: true }, 20), 1);
  assert.equal(theme.getHoldOpacity({}, 20), 1);
});

test('dragon head, neck, crown and body preserve caller fade without opaque accents', () => {
  const ctx = context(0.23);
  const tile = { hit: true, holding: true, style: { tier: 800 } };
  theme._drawDragonHead(ctx, 60, 400, 90, 130, 800, false);
  theme.drawNeck(ctx, 15, 335, 90, 130, tile, false, 800);
  theme.drawHoldBody(ctx, 15, 100, 90, 130, tile, false, 100, 235, 800, 335);
  theme.drawHoldTail(ctx, 15, 100, 90, 130, tile, false, 100, 235, 800, 335);
  assert.equal(ctx.globalAlpha, 0.23);
  assert.ok(ctx.paints.length > 0);
  assert.ok(ctx.paints.every(alpha => alpha <= 0.23));
});

test('body node storage is reused and bounded for unusually long holds', () => {
  const nodes = theme._bodyNodes;
  const first = nodes[0];
  const ctx = context();
  const tile = { style: { tier: 0 } };
  theme.drawHoldBody(ctx, 0, -100000, 90, 130, tile, false, 100, 100500, 0, 500);
  assert.equal(theme._bodyNodes, nodes);
  assert.equal(nodes[0], first);
  assert.equal(nodes.length, 257);
  assert.ok(ctx.paints.length < 700);
});

test('ash advances once per elapsed frame and expires after a long gap', () => {
  for (const p of theme._ashPool) p.active = false;
  theme._lastAshUpdate = 100;
  const p = theme._ashPool[0];
  Object.assign(p, { active: true, x: 0, y: 0, vx: 1, vy: -1, life: 1 });
  const ctx = context();
  theme.drawPostNotesOverlay(ctx, 100 + 1000 / 60, 0);
  assert.ok(Math.abs(p.x - 1) < 1e-9);
  theme.drawPostNotesOverlay(ctx, 100 + 1000 / 60, 0);
  assert.ok(Math.abs(p.x - 1) < 1e-9);
  theme.drawPostNotesOverlay(ctx, 5000, 0);
  assert.equal(p.active, false);
});

test('tier palette reuse is bounded and zero combo selects base colors', () => {
  assert.equal(theme._getTierPalette(51, false, false), theme._getTierPalette(99, false, false));
  assert.notEqual(theme._getTierPalette(0, false, false), theme._getTierPalette(800, false, false));
});
