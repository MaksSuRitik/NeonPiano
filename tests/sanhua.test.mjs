import test from 'node:test';
import assert from 'node:assert/strict';
let canvases = 0;
function context(alpha = 1) {
  const stack = [], draws = [];
  const c = {globalAlpha:alpha,draws,canvas:{clientHeight:800},save(){stack.push(this.globalAlpha)},restore(){this.globalAlpha=stack.pop()},createLinearGradient(){return {addColorStop(){}}},createRadialGradient(){return {addColorStop(){}}},drawImage(...args){draws.push({args,alpha:this.globalAlpha})}};
  return new Proxy(c,{get:(o,k)=>k in o?o[k]:()=>{}});
}
globalThis.document={createElement(){canvases++;return {width:0,height:0,getContext:()=>context()}}};
globalThis.window={GameState:{isMobile:true,combo:800},matchMedia:()=>({matches:false})};
const {SANHUA_THEME:S}=await import('../src/game/themes/sanhua.js');
const tile={holding:true,hit:true};
test('mobile flame draws 14 cached stamps and preserves inherited fade',()=>{
 const c=context(0.2);S.drawNeck(c,0,300,90,44,tile,false,800);
 assert.equal(c.draws.length,14); assert.ok(c.draws.every(d=>d.alpha<=0.2));assert.equal(c.globalAlpha,0.2);
 const allocated=canvases;for(let i=0;i<50;i++)S.drawNeck(context(),0,300,90,44,tile,false,i*20);
 assert.equal(canvases,allocated);
});
test('combo break uses base flame stamp despite previous global combo',()=>{
 const high=context(),low=context();S.drawNeck(high,0,300,90,44,tile,false,800);S.drawNeck(low,0,300,90,44,tile,false,0);
 assert.notEqual(high.draws[0].args[0],low.draws[0].args[0]);
 assert.ok(high.draws[0].args[4]>low.draws[0].args[4]);
});
test('failed and released scabbards emit no flame',()=>{
 for(const released of [false,true]){const c=context();S.drawNeck(c,0,300,90,44,{...tile,failed:true},released,800);assert.equal(c.draws.length,0);}
});
