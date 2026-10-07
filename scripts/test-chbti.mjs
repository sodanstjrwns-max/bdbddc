import assert from 'node:assert/strict';
import {calculate,TYPES,QUESTIONS,AXES} from '../js/chbti/content.js';
assert.equal(QUESTIONS.length,16);
assert.equal(Object.keys(TYPES).length,16);
const reached=new Set();
for(let mask=0;mask<16;mask++){
 const answers=AXES.flatMap((_,i)=>Array(4).fill((mask>>i&1)?2:0));
 const result=calculate(answers);
 assert.equal(result.code,AXES.map((a,i)=>a.pair[mask>>i&1]).join(''));
 assert.equal(result.balanced.some(Boolean),false);
 assert.ok(result.type.story.length>40&&result.type.watch.length>40);
 reached.add(result.code);
}
assert.equal(reached.size,16,'All sixteen stories must be reachable');
const neutral=calculate(Array(16).fill(1));
assert.equal(neutral.code,'PCSA');
assert.equal(neutral.balanced.every(Boolean),true,'Neutral answers must be called balanced');
for(const invalid of [[],Array(15).fill(0),Array(16).fill(null),Array(16).fill('0'),Array(16).fill(3)])assert.throws(()=>calculate(invalid));
const before=Array(16).fill(0);const copy=[...before];calculate(before);assert.deepEqual(before,copy,'Result calculation must not mutate a saved draft');
console.log('ChBTI: 16 reachable types, balanced answers, invalid/incomplete guards and draft immutability pass.');
