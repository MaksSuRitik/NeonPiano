import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const auth=readFileSync(new URL('../src/services/auth.js',import.meta.url),'utf8');
const getter=auth.slice(auth.indexOf('export function getCurrentUser()'),auth.indexOf('/**\n * Saves user session')).replace('export ','');
function storage(value){return {getItem:()=>value};}
test('existing session restores from either storage and rejects malformed or guest data',()=>{
  const load=new Function('sessionStorage','localStorage','SESSION_KEY',getter+'\nreturn getCurrentUser();');
  const account=JSON.stringify({id:'registered-id',username:'Player'});
  assert.equal(load(storage(account),storage(null),'key').id,'registered-id');
  assert.equal(load(storage(null),storage(account),'key').id,'registered-id');
  for(const raw of [null,'{}','{"playerId":"guest"}','{"id":"","username":"P"}']) assert.equal(load(storage(raw),storage(null),'key'),null);
});
const core=readFileSync(new URL('../src/danceCore.js',import.meta.url),'utf8');
const guard=core.slice(core.indexOf('    function requirePlayerAccount()'),core.indexOf('    async function startGame'));
const start=core.slice(core.indexOf('    async function startGame'),core.indexOf('    async function playMusic'));
test('direct core start blocks a guest before resetting state or loading audio',async()=>{
  let opened=0, notices=0;
  const State={isPreviewMode:true};
  const run=new Function('getCurrentUser','document','alert','getText','State','songsDB',guard+start+'\nreturn startGame;')(
    ()=>null,{getElementById:()=>({click(){opened++;}})},()=>notices++,k=>k,State,[]);
  await run(0);
  assert.equal(opened,1);assert.equal(notices,1);assert.equal(State.isPreviewMode,false);
});
test('authenticated direct start reaches normal song validation',async()=>{
  let message='';
  const run=new Function('getCurrentUser','alert','getText','songsDB',guard+start+'\nreturn startGame;')(
    ()=>({id:'registered'}),text=>message=text,k=>k,[]);
  await run(0);assert.equal(message,'errorMissingAudio');
});
test('legacy engines reject guest starts and resumes',()=>{
  for(const file of ['pianoGame','danceGame']){
    const source=readFileSync(new URL('../src/game/'+file+'.js',import.meta.url),'utf8');
    for(const method of ['start','resume']){
      const body=source.split('  '+method+'() {')[1].split('\n  }')[0];
      const run=new Function('getCurrentUser',body);
      const game={audioBuffer:{}};
      run.call(game,()=>null);
      assert.equal(game.isRunning,undefined);assert.equal(game.isPlaying,undefined);
    }
  }
});
