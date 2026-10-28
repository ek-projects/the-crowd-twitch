import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateCrowdEnding} from '../crowd-ending.mjs';
test('Codex-generated ending: guardian when community trust dominates',()=>{
 const s=evaluateCrowdEnding({trust:91,fear:15,presences:180});
 assert.equal(s.phase,'guardian');assert.match(s.description,/180 presences/);
});
test('predator when crowd becomes a threat',()=>{
 assert.equal(evaluateCrowdEnding({trust:15,fear:91,presences:99}).phase,'predator');
});
test('witness if neither impulse dominates, with strict input bounds',()=>{
 assert.equal(evaluateCrowdEnding({trust:45,fear:47,presences:20}).phase,'witness');
 assert.throws(()=>evaluateCrowdEnding({trust:-1,fear:40,presences:15}),RangeError);
});
