import test from 'node:test';
import assert from 'node:assert/strict';
import { createFirstCrossingFixture } from '../src/origin/fixtures.js';
import { createOriginSession, dispatchOriginAction } from '../src/origin/engine.js';
import { parseOriginSession, serializeOriginSession } from '../src/origin/storage.js';
import { availableTableActions, recordTableAction, projectTable } from '../src/origin/table.js';

const WHO = 'fixture:human-1';
function crossed() {
  let s=createOriginSession(createFirstCrossingFixture());
  for (const [i,kind] of ['DETECT','OPEN','REQUEST_ADMISSION','CONFIRM','DEPART','ARRIVE','SEAL'].entries()) {
    s=dispatchOriginAction(s,{kind,actorRef:WHO,actionId:`table-pre-${i}`,at:`2026-09-21T14:${String(i).padStart(2,'0')}:00.000Z`}).session;
  }
  return s;
}
const take=(s,kind,index,other={})=>recordTableAction(s,{kind,actorRef:WHO,actionId:`table-${index}`,at:`2026-09-21T15:${String(index).padStart(2,'0')}:00.000Z`,...other}).session;

test('the table is unavailable until a lawful sealed crossing exists',()=>{
  const pre=createOriginSession(createFirstCrossingFixture());
  assert.deepEqual(availableTableActions(pre),[]);
  assert.throws(()=>take(pre,'TAKE_SEAT',0),/CROSSING_REQUIRED/);
});
test('the destination alone owns the first local turn; both worlds retain previous history',()=>{
  const first=crossed();const originalSource=structuredClone(first.source);
  const s=take(first,'TAKE_SEAT',0);
  assert.deepEqual(s.source,originalSource);
  assert.equal(s.party.currentWorldRef,'foreign-room-seed-001');
  assert.equal(s.destination.meal.status,'half-finished');
  assert.equal(s.destination.localEvents.at(-1).kind,'table.seat_taken');
  assert.equal(s.destination.localEvents.at(-1).sourceSystem,'foreign-room-seed-001');
  assert.equal(projectTable(s).posture,'seated');
  assert.deepEqual(availableTableActions(s),['LISTEN']);
});
test('staying at the door offers listening without compelling shared-meal contact',()=>{
  const s=take(crossed(),'STAY_AT_DOOR',0);
  assert.equal(projectTable(s).posture,'door');
  assert.ok(availableTableActions(s).includes('LISTEN'));
  assert.equal(projectTable(s).candidateGate,null);
});
test('a reported world address is not an admitted Gate and cannot be discovered before listening',()=>{
  const initial=crossed();
  assert.throws(()=>take(initial,'INSPECT_ADDRESS',0),/ACTION_NOT_AVAILABLE/);
  const seated=take(initial,'TAKE_SEAT',0);
  const heard=take(seated,'LISTEN',1);
  assert.equal(projectTable(heard).candidateGate,null);
  assert.deepEqual(availableTableActions(heard),['INSPECT_ADDRESS','LET_IT_REST']);
  const inspected=take(heard,'INSPECT_ADDRESS',2);
  const gate=projectTable(inspected).candidateGate;
  assert.equal(gate.status,'DETECTED');
  assert.equal(gate.authorized,false);
  assert.equal(gate.admissionStatus,'UNREQUESTED');
  assert.equal(gate.destinationWorldRef,'full-measure/grace-001');
  assert.ok(gate.unresolvedConditions.includes('grace-owned-entry-policy'));
  assert.ok(gate.nonClaims.includes('not_a_grace_world_invitation'));
  assert.equal(inspected.party.currentWorldRef,'foreign-room-seed-001');
  assert.equal(inspected.worldline.length,1);
  assert.equal(inspected.source.bell.sourceStatus,'unresolved');
});
test('player can hold the reported address without inspecting or opening a Gate',()=>{
  let s=take(crossed(),'STAY_AT_DOOR',0);
  s=take(s,'LISTEN',1);
  s=take(s,'LET_IT_REST',2);
  assert.equal(projectTable(s).status,'HELD');
  assert.equal(projectTable(s).candidateGate,null);
  assert.deepEqual(availableTableActions(s),[]);
});
test('a repeated action ID replays exactly; changed input is a conflict',()=>{
  const initial=crossed();
  const action={kind:'TAKE_SEAT',actorRef:WHO,actionId:'same-table',at:'2026-09-21T15:00:00.000Z'};
  const first=recordTableAction(initial,action).session;
  const repeated=recordTableAction(first,action);
  assert.equal(repeated.duplicate,true);
  assert.deepEqual(repeated.session,first);
  assert.throws(()=>recordTableAction(first,{...action,kind:'STAY_AT_DOOR'}),/ACTION_ID_CONFLICT/);
  assert.throws(()=>recordTableAction(first,{...action,actorRef:'fixture:model-1'}),/ACTION_ID_CONFLICT/);
});
test('source and destination ownership, human actor and temporal ordering are enforced',()=>{
  const initial=crossed();
  assert.throws(()=>take(initial,'TAKE_SEAT',0,{actorRef:'fixture:model-1'}),/ELIGIBLE_HUMAN_REQUIRED/);
  assert.throws(()=>take(initial,'TAKE_SEAT',0,{at:'2026-09-21T13:00:00.000Z'}),/LOCAL_TIME_REVERSAL/);
  assert.throws(()=>take(initial,'TAKE_SEAT',0,{actorRef:'fixture:human-1',extra:true}),/INVALID_ACTION/);
});
test('round-trip persistence derives the same candidate without overwriting the Crossing receipt',()=>{
  let s=take(crossed(),'STAY_AT_DOOR',0);
  s=take(s,'LISTEN',1);
  s=take(s,'INSPECT_ADDRESS',2);
  const beforeReceipt=structuredClone(s.crossingReceipt);
  const restored=parseOriginSession(serializeOriginSession(s));
  assert.deepEqual(restored.crossingReceipt,beforeReceipt);
  assert.deepEqual(projectTable(restored),projectTable(s));
  assert.equal(restored.destination.localEvents.filter(e=>e.kind==='table.address_inspected').length,1);
});
test('an invalid table order or forged local table claim fails on reload',()=>{
  let s=take(crossed(),'TAKE_SEAT',0);s=take(s,'LISTEN',1);s=take(s,'INSPECT_ADDRESS',2);
  const altered=structuredClone(s);
  altered.destination.localEvents=altered.destination.localEvents.filter(e=>e.kind!=='table.listened');
  assert.throws(()=>parseOriginSession(serializeOriginSession(altered)),/TABLE_HISTORY_INVALID|LOCAL_EVENT_INTEGRITY/);
});
