import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { canonical, hashRecord, sha256 } from '../src/origin/identity.js';
import { createFirstCrossingFixture } from '../src/origin/fixtures.js';
import { createOriginSession, dispatchOriginAction, buildCrossingReceipt, availableActions } from '../src/origin/engine.js';
import { serializeOriginSession, parseOriginSession } from '../src/origin/storage.js';
import { runFirstCrossingFixture } from '../src/origin/specimen.js';

const actorRef = 'fixture:human-1';
const at = (n) => `2026-09-21T14:${String(n).padStart(2, '0')}:00.000Z`;
function command(session, kind, n, extra={}) {
 return dispatchOriginAction(session, { kind, actorRef, actionId:`act-${n}`, at:at(n), ...extra }).session;
}
function advance(kinds, fixture=createFirstCrossingFixture()) {
 let s=createOriginSession(fixture);
 kinds.forEach((kind,i)=>{s=command(s,kind,i+1)});
 return s;
}
const stages=['DETECT','OPEN','REQUEST_ADMISSION','CONFIRM','DEPART','ARRIVE','SEAL'];

test('portable sha256 matches node crypto and canonicalization respects array order',()=>{
 assert.equal(sha256('abc'), createHash('sha256').update('abc').digest('hex'));
 assert.equal(sha256(''),createHash('sha256').update('').digest('hex'));
 assert.equal(hashRecord('x',{a:1,b:2}),hashRecord('x',{b:2,a:1}));
 assert.notEqual(hashRecord('x',['a','b']),hashRecord('x',['b','a']));
 assert.throws(()=>canonical({a:NaN}),/NON_FINITE/);
});
test('source and destination are independent fictional histories before crossing',()=>{
 const f=createFirstCrossingFixture();
 assert.equal(f.inputProvenance.kind,'synthetic-specimen');
 assert.equal(f.source.bell.sourceStatus,'unresolved');
 assert.equal(f.source.knock.sourceStatus,'unresolved');
 assert.match(f.source.firstBellPlayReceipt.receiptId,/^fixture:/);
 assert.equal(f.destination.meal.status,'half-finished');
 assert.ok(f.destination.localEvents.some(e=>e.kind==='meal.started'));
 assert.equal(f.source.localEvents.some(e=>e.kind==='porch.departed'),false);
});
test('missed clue cannot produce a detected gate and forged live flag is rejected',()=>{
 const f=createFirstCrossingFixture();
 f.source.gateRelationTraced=false;
 const s=createOriginSession(f);
 assert.throws(()=>command(s,'DETECT',1),/RELATION_NOT_TRACED/);
 const g=createFirstCrossingFixture();g.inputProvenance.kind='live-verified';
 assert.throws(()=>createOriginSession(g),/UNVERIFIED_SOURCE/);
});
test('detected Gate is unauthorized and does not move party or resolve the destination',()=>{
 const s=advance(['DETECT']);
 assert.equal(s.gate.status,'DETECTED');
 assert.equal(s.gate.destinationWorldRef,null);
 assert.equal(s.gate.authorized,false);
 assert.equal(s.party.currentWorldRef,'static-field/worldseed-001');
 assert.equal(s.source.bell.sourceStatus,'unresolved');
});
test('OPEN offers but does not depart or admit',()=>{
 const s=advance(['DETECT','OPEN']);
 assert.equal(s.gate.status,'OFFERED');
 assert.equal(s.party.currentWorldRef,'static-field/worldseed-001');
 assert.equal(s.source.localEvents.some(e=>e.kind==='porch.departed'),false);
 assert.equal(s.destination.localEvents.some(e=>e.kind==='party.arrived'),false);
});
test('OPEN before detection and model confirmation are refused',()=>{
 let s=createOriginSession(createFirstCrossingFixture());
 assert.throws(()=>command(s,'OPEN',1),/DETECTION_REQUIRED/);
 s=advance(['DETECT','OPEN','REQUEST_ADMISSION']);
 assert.throws(()=>dispatchOriginAction(s,{kind:'CONFIRM',actorRef:'fixture:model-session-1',actionId:'model-c',at:at(5)}),/HUMAN_CONFIRMATION_REQUIRED/);
 assert.equal(s.party.currentWorldRef,'static-field/worldseed-001');
});
test('each requested item is dispositioned and source Charge/private knowledge do not enter',()=>{
 const s=advance(['DETECT','OPEN','REQUEST_ADMISSION']);
 const byRef=Object.fromEntries(s.admission.items.map(x=>[x.ref,x.disposition]));
 assert.equal(byRef['thread:bell-unresolved'],'ADMIT');
 assert.equal(byRef['static-field:charge'],'REFUSE');
 assert.equal(byRef['static-field:resonance-interpretation'],'HOLD');
 assert.equal(byRef['static-field:porch'],'TRANSFORM');
 assert.equal(byRef['private:memory'],'WITHHOLD');
 assert.equal(byRef['model:local-grant'],'WITHHOLD');
 assert.equal(s.party.currentWorldRef,'static-field/worldseed-001');
});
test('reused action id is idempotent for same request and rejects changed request',()=>{
 const s=advance(['DETECT']);
 const request={kind:'OPEN',actorRef,actionId:'same-id',at:at(2)};
 const first=dispatchOriginAction(s,request).session;
 const second=dispatchOriginAction(first,request).session;
 assert.deepEqual(second,first);
 assert.throws(()=>dispatchOriginAction(first,{...request,kind:'CONFIRM'}),/ACTION_ID_CONFLICT/);
});
test('before confirmation or arrival no Crossing receipt exists',()=>{
 const s=advance(['DETECT','OPEN','REQUEST_ADMISSION']);
 assert.throws(()=>command(s,'DEPART',4),/CONFIRMATION_REQUIRED/);
 const departed=advance(['DETECT','OPEN','REQUEST_ADMISSION','CONFIRM','DEPART']);
 assert.throws(()=>buildCrossingReceipt(departed),/DESTINATION_ARRIVAL_REQUIRED/);
 assert.equal(departed.party.currentWorldRef,'static-field/worldseed-001');
});
test('successful Crossing keeps source Bell unresolved and destination meal pre-existing',()=>{
 const s=advance(stages);
 assert.equal(s.party.currentWorldRef,'foreign-room-seed-001');
 assert.equal(s.party.anchorRef,'card:first-inheritance');
 assert.equal(s.source.bell.sourceStatus,'unresolved');
 assert.equal(s.source.knock.sourceStatus,'unresolved');
 assert.equal(s.source.localEvents.filter(e=>e.kind==='porch.departed').length,1);
 assert.equal(s.destination.localEvents.filter(e=>e.kind==='party.arrived').length,1);
 assert.ok(s.destination.localEvents.some(e=>e.kind==='meal.started'));
 assert.equal(s.destination.meal.status,'half-finished');
 const receipt=buildCrossingReceipt(s);
 assert.ok(receipt.sourceDepartureReceiptRef);
 assert.ok(receipt.destinationArrivalReceiptRef);
 assert.ok(receipt.unresolvedRefs.includes('thread:bell-unresolved'));
 assert.equal(receipt.admittedItemRefs.includes('static-field:charge'),false);
 assert.equal(receipt.heldItemRefs.includes('static-field:resonance-interpretation'),true);
 assert.equal(s.worldline.length,1);
});
test('failed destination arrival retains departure and explicit recovery issues arrival once',()=>{
 const s=advance(['DETECT','OPEN','REQUEST_ADMISSION','CONFIRM','DEPART']);
 const failed=dispatchOriginAction(s,{kind:'ARRIVE',actorRef,actionId:'failure',at:at(6)},
  { arriveForeignRoom(){throw new Error('fixture:transport-error')} }).session;
 assert.equal(failed.crossingStatus,'FAILED');
 assert.equal(failed.destination.localEvents.some(e=>e.kind==='party.arrived'),false);
 assert.throws(()=>buildCrossingReceipt(failed),/DESTINATION_ARRIVAL_REQUIRED/);
 const recovered=command(failed,'RECOVER',7);
 assert.equal(recovered.source.localEvents.filter(e=>e.kind==='porch.departed').length,1);
 assert.equal(recovered.destination.localEvents.filter(e=>e.kind==='party.arrived').length,1);
 assert.equal(recovered.party.currentWorldRef,'foreign-room-seed-001');
});
test('Origin serializes detached state without silently resetting invalid history',()=>{
 const s=advance(stages);
 const raw=serializeOriginSession(s);
 assert.equal(raw,serializeOriginSession(s));
 const r=parseOriginSession(raw);
 assert.deepEqual(r,s);
 assert.equal(r.source.localEvents.filter(e=>e.kind==='KNOCK_OCCURRENCE').length,1);
 assert.equal(r.destination.localEvents.filter(e=>e.kind==='party.arrived').length,1);
 assert.throws(()=>parseOriginSession('{broken'),/ORIGIN_PARSE_ERROR/);
 assert.throws(()=>parseOriginSession('{"schemaVersion":"99"}'),/ORIGIN_SCHEMA_UNSUPPORTED/);
});
test('deterministic specimen is byte-identical across independent runs',()=>{
 const a=runFirstCrossingFixture(),b=runFirstCrossingFixture();
 assert.deepEqual(a.receipt,b.receipt);
 assert.equal(a.receipt.nonClaims.includes('does_not_resolve_bell_cause'),true);
 assert.equal(a.session.party.currentWorldRef,'foreign-room-seed-001');
});
test('destination independently records transformed reported-origin reference on arrival',()=>{
 const s=advance(stages);
 const reported=s.destination.localEvents.filter(e=>e.kind==='origin.reported');
 assert.equal(reported.length,1);
 assert.equal(reported[0].payload.sourceRef,'static-field:porch');
 assert.equal(reported[0].payload.destinationRef,'foreign-room:reported-origin/porch');
 assert.equal(s.source.localEvents.some(e=>e.kind==='origin.reported'),false);
});
test('reloading rejects tampered local world events and sealed receipt links',()=>{
 const s=advance(stages);
 const altered=structuredClone(s);
 altered.source.localEvents[0].kind='WORLD_AUTHORITY_GRANTED';
 assert.throws(()=>parseOriginSession(serializeOriginSession(altered)),/LOCAL_EVENT_INTEGRITY/);
 const severed=structuredClone(s);
 severed.crossingReceipt.sourceDepartureReceiptRef='fake';
 assert.throws(()=>parseOriginSession(serializeOriginSession(severed)),/ORIGIN_CROSSING_INTEGRITY/);
});
