import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runForeignRoomExitSpecimen} from '../src/origin/secondGateSpecimen.js';
import {parseOriginSession,serializeOriginSession} from '../src/origin/storage.js';
test('fixture source offer is byte-for-byte deterministic and fully replay-valid',()=>{
 const a=runForeignRoomExitSpecimen(),b=runForeignRoomExitSpecimen();
 assert.deepEqual(a.candidateGate,b.candidateGate);
 assert.deepEqual(a.exitOffer,b.exitOffer);
 assert.deepEqual(parseOriginSession(serializeOriginSession(a.session)),a.session);
 const expected=JSON.parse(readFileSync(new URL('../examples/origin-foreign-room-exit-003/portable-source-offer.json',import.meta.url),'utf8'));
 assert.deepEqual({candidateGate:a.candidateGate,exitOffer:a.exitOffer},expected);
 assert.equal(a.session.party.currentWorldRef,'foreign-room-seed-001');
 assert.equal(a.session.worldline.length,1);
 assert.equal(a.session.source.bell.sourceStatus,'unresolved');
});
