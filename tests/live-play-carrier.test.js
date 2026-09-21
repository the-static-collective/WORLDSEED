import test from 'node:test';
import assert from 'node:assert/strict';
import {canonical,sha256} from '../src/origin/identity.js';
import {prepareNativeCrossing,confirmNativeCrossing} from '../src/origin/live-crossing.js';
import {buildLivePlayCarrier,verifyLivePlayCarrier,chooseLivePlay} from '../src/origin/live-play-carrier.js';
const id=(ns,value)=>`${ns}/${sha256(canonical(value)).slice(0,24)}`;
const actor={kind:'human',id:'human/local-player'};
const receipt=(type,event)=>{const base={receiptType:type,eventId:event.eventId,sourceStatus:event.sourceStatus};return {...base,receiptId:id('receipt',base)};};
const add=(history,kind,minute,payload,status='resolved')=>{
 const draft={kind,occurredAt:`2026-09-21T22:${String(minute).padStart(2,'0')}:00.000Z`,actor,evidenceClass:kind==='RESONANCE_RELATION_TRACED'?'derived':'observed',sourceStatus:status,payload,parentEventIds:history.length?[history.at(-1).eventId]:[]};
 const e={eventId:id('event',draft),...draft};history.push(e);return e;
};
function fixture(){
 const offeredHistory=[];
 const arrival=add(offeredHistory,'PORCH_ARRIVAL',0,{regionId:'the-porch'});
 const b1=add(offeredHistory,'BELL_OCCURRENCE',1,{ordinal:1,interpretation:null},'unresolved');
 const b2=add(offeredHistory,'BELL_OCCURRENCE',2,{ordinal:2,interpretation:null},'unresolved');
 add(offeredHistory,'OPEN_CORNER_NOTICED',3,{relationHint:'lmv/open-corner',retrospectiveBellEvidence:false});
 add(offeredHistory,'RESONANCE_ENTERED',4,{from:'surface'});
 const traced=add(offeredHistory,'RESONANCE_RELATION_TRACED',5,{relationId:'relation/first-bell-open-corner',evidenceRefs:['archive/song/open-e-022100','archive/card/lmv-open-corner'],promotedClaim:false},'unresolved');
 add(offeredHistory,'KNOCK_OCCURRENCE',6,{repeats:3,interpretation:null},'unresolved');
 const close=add(offeredHistory,'FIRST_BELL_PLAY_CLOSED',7,{bellSourceStatus:'unresolved',secretNoticed:true,relationTraced:true},'unresolved');
 const first=receipt('FirstBellPlayReceipt',close),play={...first,secretNoticed:true,relationTraced:true};
 play.receiptId=id('receipt',play);
 const receipts={'first-bell-play-receipt.json':play,'porch-arrival-receipt.json':receipt('PorchArrivalReceipt',arrival),'bell-1-receipt.json':receipt('BellOccurrenceReceipt#1',b1),'bell-2-receipt.json':receipt('BellOccurrenceReceipt#2',b2),'resonance-relation-receipt.json':receipt('ResonanceRelationReceipt',traced)};
 const gateBody={from:'static-field/worldseed-001/the-porch',triggerRefs:[traced.eventId],status:'detected',authorized:false,unresolvedConditions:['destination','opening-authority','transfer-policy']};
 const offer=add(offeredHistory,'GATE_OPEN_OFFERED',8,{gateId:id('gate',gateBody),sourcePlayReceiptRef:play.receiptId,sourceWorldRef:'static-field/worldseed-001',destinationWorldRef:'foreign-room-seed-001',scope:'fictional-local-crossing',authorizedDestination:false},'unresolved');
 const offerReceipt=receipt('SourceGateOfferReceipt',offer);
 const prep=prepareNativeCrossing({history:offeredHistory,receipts,offerReceipt});
 const packet=confirmNativeCrossing(prep,{actorRef:actor.id,at:'2026-09-21T22:09:00.000Z',explicitChoice:true});
 const departedHistory=structuredClone(offeredHistory);
 const departure=add(departedHistory,'PORCH_DEPARTED',10,{sourceOfferRef:prep.sourceOfferRef,sourcePlayReceiptRef:prep.sourcePlayReceiptRef,admissionRef:packet.admission.receiptId,confirmationRef:packet.confirmation.receiptId,bundleRef:prep.bundleRef,destinationWorldRef:'foreign-room-seed-001',bellSourceStatus:'unresolved',sourceDoesNotAssertArrival:true},'unresolved');
 return {offeredHistory,departedHistory,receipts,offerReceipt,packet,departureReceipt:receipt('SourceDepartureReceipt',departure),at:'2026-09-21T22:11:00.000Z'};
}
const take=(carrier,kind,minute)=>chooseLivePlay(carrier,kind,`2026-09-21T22:${minute}:00.000Z`);
test('portable carrier re-derives actual native source/departure and destination arrival',()=>{
 const c=buildLivePlayCarrier(fixture()),checked=verifyLivePlayCarrier(JSON.parse(JSON.stringify(c)));
 assert.equal(checked.table.status,'UNSTARTED');assert.deepEqual(checked.table.availableActions,['TAKE_SEAT','STAY_AT_DOOR']);
 assert.equal(checked.session.party.currentWorldRef,'foreign-room-seed-001');
 assert.equal(checked.arrivalReceipt.receiptId.startsWith('sha256:'),true);
});
test('seated route is playable and replayable after save/import',()=>{
 const original=buildLivePlayCarrier(fixture());
 const seated=take(original,'TAKE_SEAT',12);
 const listened=take(seated.carrier,'LISTEN',13);
 const detected=take(listened.carrier,'INSPECT_ADDRESS',14);
 const opened=verifyLivePlayCarrier(JSON.parse(JSON.stringify(detected.carrier)));
 assert.equal(opened.table.status,'CANDIDATE_DETECTED');
 assert.equal(opened.table.candidateGate.status,'DETECTED');assert.equal(opened.table.candidateGate.authorized,false);
 assert.equal(opened.carrier.tableChoices.length,3);
 assert.deepEqual(opened.carrier.inputs,original.inputs);
});
test('door posture and valid HOLD path do not force inspection',()=>{
 const c=buildLivePlayCarrier(fixture());
 const held=take(take(take(c,'STAY_AT_DOOR',12).carrier,'LISTEN',13).carrier,'LET_IT_REST',14);
 assert.equal(held.table.status,'HELD');assert.deepEqual(held.table.availableActions,[]);
 assert.equal(held.table.candidateGate,null);
});
test('saved carrier refuses forged source/departure evidence',()=>{
 const c=buildLivePlayCarrier(fixture()),changed=structuredClone(c);
 changed.inputs.departedHistory.at(-1).payload.admissionRef='sha256:forged';
 assert.throws(()=>verifyLivePlayCarrier(changed),/NATIVE_EVENT_ID_MISMATCH/);
});
test('cannot fake a table choice by editing its receipt or actor',()=>{
 const c=take(buildLivePlayCarrier(fixture()),'TAKE_SEAT',12).carrier;
 const a=structuredClone(c);a.tableChoices[0].receiptRef='sha256:forged';
 assert.throws(()=>verifyLivePlayCarrier(a),/CARRIER_CHOICE_RECEIPT_MISMATCH/);
 const b=structuredClone(c);b.tableChoices[0].action.actorRef='fixture:other';
 assert.throws(()=>verifyLivePlayCarrier(b),/CARRIER_CHOICE_ACTOR_OR_ORDER/);
});
test('cannot silently skip a move or replay one under an old actionId',()=>{
 const c=take(buildLivePlayCarrier(fixture()),'TAKE_SEAT',12).carrier;
 const changed=structuredClone(c);changed.tableChoices[0].action.actionId='native-table-999';
 assert.throws(()=>verifyLivePlayCarrier(changed),/CARRIER_CHOICE_ACTOR_OR_ORDER/);
 assert.throws(()=>chooseLivePlay(c,'TAKE_SEAT','2026-09-21T22:13:00.000Z'),/ACTION_NOT_AVAILABLE/);
});
test('holding survives export and refuses invented subsequent moves',()=>{
 const c=buildLivePlayCarrier(fixture()),held=take(take(take(c,'TAKE_SEAT',12).carrier,'LISTEN',13).carrier,'LET_IT_REST',14);
 const roundtrip=verifyLivePlayCarrier(JSON.parse(JSON.stringify(held.carrier)));
 assert.equal(roundtrip.table.status,'HELD');
 assert.throws(()=>take(held.carrier,'INSPECT_ADDRESS',15),/ACTION_NOT_AVAILABLE/);
});
