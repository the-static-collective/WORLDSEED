import test from 'node:test';
import assert from 'node:assert/strict';
import {createFirstCrossingFixture} from '../src/origin/fixtures.js';
import {createOriginSession,dispatchOriginAction} from '../src/origin/engine.js';
import {recordTableAction,projectTable} from '../src/origin/table.js';
import {requestForeignRoomExit,projectForeignRoomExitOffer} from '../src/origin/secondGate.js';
import {parseOriginSession,serializeOriginSession} from '../src/origin/storage.js';
const HUMAN='fixture:human-1';
function at(min){return `2026-09-21T16:${String(min).padStart(2,'0')}:00.000Z`;}
function inspected(){
 let s=createOriginSession(createFirstCrossingFixture());
 for(const [i,kind] of ['DETECT','OPEN','REQUEST_ADMISSION','CONFIRM','DEPART','ARRIVE','SEAL'].entries())s=dispatchOriginAction(s,{kind,actorRef:HUMAN,actionId:`cross-${i}`,at:`2026-09-21T14:${String(i).padStart(2,'0')}:00.000Z`}).session;
 for(const [i,kind] of ['STAY_AT_DOOR','LISTEN','INSPECT_ADDRESS'].entries())s=recordTableAction(s,{kind,actorRef:HUMAN,actionId:`table-${i}`,at:`2026-09-21T15:${String(i).padStart(2,'0')}:00.000Z`}).session;
 return s;
}
function req(s,override={}){return requestForeignRoomExit(s,{kind:'REQUEST_EXIT_OFFER',actorRef:HUMAN,actionId:'exit-1',at:at(1),...override});}
test('a reported address alone cannot issue a source exit offer',()=>{
 let s=createOriginSession(createFirstCrossingFixture());
 assert.throws(()=>req(s),/FIRST_CROSSING_REQUIRED/);
 s=inspected();const noInspection=structuredClone(s);noInspection.destination.localEvents=noInspection.destination.localEvents.filter(e=>e.kind!=='table.address_inspected');
 assert.throws(()=>req(noInspection),/CANDIDATE_GATE_REQUIRED/);
});
test('Foreign Room creates the exit offer locally, without moving party or admitting Grace',()=>{
 const before=inspected(), source=structuredClone(before.source), firstReceipt=structuredClone(before.crossingReceipt);
 const {session:s,exitOffer:offer,duplicate}=req(before);
 assert.equal(duplicate,false);
 assert.deepEqual(s.source,source);assert.deepEqual(s.crossingReceipt,firstReceipt);
 assert.equal(s.party.currentWorldRef,'foreign-room-seed-001');assert.equal(s.worldline.length,1);
 assert.equal(s.destination.localEvents.at(-1).kind,'gate.exit_offered');
 assert.equal(s.destination.localEvents.at(-1).sourceSystem,'foreign-room-seed-001');
 assert.equal(offer.schema,'origin.foreign-room-exit-offer.v0.1');
 assert.equal(offer.status,'OFFERED');assert.equal(offer.admitted,false);
 assert.equal(offer.sourceWorldRef,'foreign-room-seed-001');assert.equal(offer.destinationWorldRef,'full-measure/grace-001');
 assert.equal(offer.candidateGateRef,projectTable(before).candidateGate.gateId);
 assert.equal(offer.priorCrossingRef,before.crossingReceipt.receiptId);
 assert.equal(offer.partyRef,s.party.partyId);
 assert.equal(offer.anchorRef,s.party.anchorRef);
 assert.match(offer.sourceLocalReceiptRef,/^sha256:[a-f0-9]{64}$/);
 assert.ok(offer.nonClaims.includes('not_a_grace_world_invitation'));
 assert.ok(offer.unresolvedConditions.includes('grace-local-host-consent'));
});
test('transfer proposal is scoped to references; refused or withheld items cannot leak',()=>{
 const {exitOffer:offer}=req(inspected());
 const refs=offer.transferBundle.items.map(i=>i.ref);
 assert.deepEqual(refs,['human:fixture:human-1','card:first-inheritance','thread:bell-unresolved','foreign-room:reported-origin/porch']);
 assert.ok(offer.transferBundle.items.every(i=>i.requestedMode==='reference'));
 assert.equal(JSON.stringify(offer).includes('private:memory'),false);
 assert.equal(JSON.stringify(offer).includes('static-field:charge'),false);
 assert.equal(JSON.stringify(offer).includes('model:local-grant'),false);
 assert.equal(offer.transferBundle.partyRef,'fixture:party-1');
});
test('source offer is exactly replay safe; changed actor/time/id is rejected',()=>{
 const before=inspected();const first=req(before);const second=req(first.session);
 assert.equal(second.duplicate,true);assert.deepEqual(second.session,first.session);
 assert.deepEqual(second.exitOffer,first.exitOffer);
 assert.throws(()=>req(first.session,{actorRef:'fixture:model-session-1'}),/ACTION_ID_CONFLICT/);
 assert.throws(()=>req(first.session,{at:at(2)}),/ACTION_ID_CONFLICT/);
 assert.throws(()=>req(before,{actorRef:'fixture:model-session-1'}),/ELIGIBLE_HUMAN_REQUIRED/);
 assert.throws(()=>req(before,{kind:'CONFIRM'}),/INVALID_EXIT_ACTION/);
});
test('source offer does not open a second Gate or allow human to self-admit',()=>{
 const s=req(inspected()).session;
 assert.equal(projectForeignRoomExitOffer(s).status,'OFFERED');
 assert.deepEqual(projectForeignRoomExitOffer(s).unresolvedConditions,s.exitOffer.unresolvedConditions);
 assert.equal(s.exitOffer.admitted,false);
 assert.ok(!('departureReceiptRef' in s.exitOffer));
 assert.ok(!('arrivalReceiptRef' in s.exitOffer));
});
test('saved source offer replays; tampering with body, history, or origin is rejected',()=>{
 const s=req(inspected()).session;
 const restored=parseOriginSession(serializeOriginSession(s));
 assert.deepEqual(restored,s);
 const noExit=structuredClone(s);noExit.destination.localEvents=noExit.destination.localEvents.filter(e=>e.kind!=='gate.exit_offered');
 assert.throws(()=>parseOriginSession(serializeOriginSession(noExit)),/EXIT_HISTORY_INVALID/);
 const forged=structuredClone(s);forged.exitOffer.admitted=true;
 assert.throws(()=>parseOriginSession(serializeOriginSession(forged)),/EXIT_HISTORY_INVALID/);
 const wrong=structuredClone(s);wrong.exitOffer.partyRef='intruder';
 assert.throws(()=>parseOriginSession(serializeOriginSession(wrong)),/EXIT_HISTORY_INVALID/);
});
test('a held reported address is not a source departure offer',()=>{
 let s=inspected();s=recordTableAction(s,{kind:'LET_IT_REST',actorRef:HUMAN,actionId:'hold-1',at:at(0)}).session;
 assert.throws(()=>req(s),/GATE_HELD/);
});
