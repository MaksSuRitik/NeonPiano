import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeResultMetadata as normalize, difficultyFromSpeed, resultModeLabel } from '../src/game/resultMetadata.js';

test('Hard never implies Hardcore; all speed difficulties support either modifier', () => {
  assert.equal(normalize({difficulty:'hard'}).isHardcore, false);
  for (const speed of [1,1.2,1.4]) for (const isHardcore of [false,true]) {
    const difficulty=difficultyFromSpeed(speed);
    const result=normalize({difficulty,isHardcore});
    assert.equal(result.difficulty,difficulty);
    assert.equal(result.isHardcore,isHardcore);
    assert.ok(!result.completedDifficulties.includes('hardcore'));
  }
});
test('legacy Hardcore preserves evidence without inventing a base difficulty', () => {
  const raw={difficulty:'hardcore',score:200,theme:'sanhua',completedDifficulties:['normal','hardcore']};
  const result=normalize(raw);
  assert.equal(result.difficulty,'');
  assert.equal(result.legacyDifficulty,'hardcore');
  assert.equal(result.isHardcore,true);
  assert.equal(result.theme,'sanhua');
  assert.deepEqual(result.completedDifficulties,['normal']);
  assert.deepEqual(normalize(result),result);
  assert.equal(normalize({...raw,speed:1.2}).difficulty,'normal');
  assert.equal(raw.difficulty,'hardcore');
});
test('old Hardcore victory survives a newer ordinary best result', () => {
  const result=normalize({difficulty:'hard',isHardcore:false,completedDifficulties:['easy','hardcore']});
  assert.equal(result.isHardcore,false);
  assert.equal(result.hardcoreCompleted,true);
  assert.equal(resultModeLabel(result,k=>k),'diffHard');
  assert.equal(resultModeLabel({...result,isHardcore:true},k=>k),'diffHard • modHardcore');
});
