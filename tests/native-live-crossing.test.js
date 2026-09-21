import test from 'node:test';
import assert from 'node:assert/strict';
import {canonical,sha256} from '../src/origin/identity.js';
import {prepareNativeCrossing,confirmNativeCrossing,arriveNativeCrossing,playLiveTable} from '../src/origin/live-crossing.js';
import {projectTable} from '../src/origin/table.js';

const actor={kind:'human',id:'human/local-player'};
const stable=(ns,value)=>`${ns}/${sha256(canonical(value)).slice(0,24)}`;
const receipt=(type,event)=>{const base={receiptType:type,eventId:event.eventId,sourceStatus:event.sourceStatus};return {...base,receiptId:stable('receipt',base)};};
const makeEvent=(history,kind,minute,payload,status='resolved')=>{
 const body={kind,occurredAt:`2026-09-21T22:${String(minute).padStart(2,'0')}:00.000Z`,
  actor,evidenceClass:kind==='RESONANCE_RELATION_TRACED'?'derived':'observed',sourceStatus:status,
  payload,parentEventIds:history.length?[history.at(-1).eventId]:[]};
 const e={eventId:stable('event',body),...body};history.push(e);return e;
};
function nativePlay(withClue=true){
 const history=[];
 const arrival=makeEvent(history,'PORCH_ARRIVAL',0,{regionId:'the-porch'});
 const bell1=makeEvent(history,'BELL_OCCURRENCE',1,{ordinal:1,interpretation:null},'unresolved');
 const bell2=makeEvent(history,'BELL_OCCURRENCE',2,{ordinal:2,interpretation:null},'unresolved');
 let traced;
 if(withClue){
  makeEvent(history,'OPEN_CORNER_NOTICED',3,{relationHint:'lmv/open-corner',retrospectiveBellEvidence:false});
  makeEvent(history,'RESONANCE_ENTERED',4,{from:'surface'});
  traced=makeEvent(history,'RESONANCE_RELATION_TRACED',5,{relationId:'relation/first-bell-open-corner',
   evidenceRefs:['archive/song/open-e-022100','archive/card/lmv-open-corner'],promotedClaim:false},'unresolved');
 }
 makeEvent(history,'KNOCK_OCCURRENCE',6,{repeats:3,interpretation:null},'unresolved');
 const closed=makeEvent(history,'FIRST_BELL_PLAY_CLOSED',7,
  {bellSourceStatus:'unresolved',secretNoticed:withClue,relationTraced:withClue},'unresolved');
 const p={...receipt('FirstBellPlayReceipt',closed),secretNoticed:withClue,relationTraced:withClue};
 p.receiptId=stable('receipt',p);
 const receipts={
  'first-bell-play-receipt.json':p,'porch-arrival-receipt.json':receipt('PorchArrivalReceipt',arrival),
  'bell-1-receipt.json':receipt('BellOccurrenceReceipt#1',bell1),
  'bell-2-receipt.json':receipt('BellOccurrenceReceipt#2',bell2),
 };
 if(traced)receipts['resonance-relation-receipt.json']=receipt('ResonanceRelationReceipt',traced);
 const gateBody={from:'static-field/worldseed-001/the-porch',triggerRefs:traced?[traced.eventId]:[],
  status:'detected',authorized:false,unresolvedConditions:['destination','opening-authority','transfer-policy']};
 const offer=makeEvent(history,'GATE_OPEN_OFFERED',8,{
  gateId:stable('gate',gateBody),sourcePlayReceiptRef:p.receiptId,
  sourceWorldRef:'static-field/worldseed-001',destinationWorldRef:'foreign-room-seed-001',
  scope:'fictional-local-crossing',authorizedDestination:false},'unresolved');
 return {history,receipts,offerReceipt:receipt('SourceGateOfferReceipt',offer)};
}
function full(){
 const donor=nativePlay();const prepared=prepareNativeCrossing(donor);
 const packet=confirmNativeCrossing(prepared,{actorRef:actor.id,at:'2026-09-21T22:09:00.000Z',explicitChoice:true});
 const departedHistory=structuredClone(donor.history);
 const departure=makeEvent(departedHistory,'PORCH_DEPARTED',10,{
  sourceOfferRef:prepared.sourceOfferRef,sourcePlayReceiptRef:prepared.sourcePlayReceiptRef,
  admissionRef:packet.admission.receiptId,confirmationRef:packet.confirmation.receiptId,
  bundleRef:prepared.bundleRef,destinationWorldRef:'foreign-room-seed-001',
  bellSourceStatus:'unresolved',sourceDoesNotAssertArrival:true},'unresolved');
 const departureReceipt=receipt('SourceDepartureReceipt',departure);
 return {donor,prepared,packet,departedHistory,departureReceipt};
}
const arrive=x=>arriveNativeCrossing({offeredHistory:x.donor.history,departedHistory:x.departedHistory,
 receipts:x.donor.receipts,offerReceipt:x.donor.offerReceipt,packet:x.packet,departureReceipt:x.departureReceipt,
 at:'2026-09-21T22:11:00.000Z'});
test('native source offer yields destination-owned scoped admission, not arrival',()=>{
 const donor=nativePlay(),p=prepareNativeCrossing(donor);
 assert.equal(p.admission.disposition,'ADMIT_SCOPED');
 assert.ok(p.admission.admittedItemRefs.includes(p.anchorRef));
 assert.ok(p.admission.refusedItemRefs.includes('static-field:charge'));
 assert.equal(p.status,'AWAITING_EXPLICIT_HUMAN_CONFIRMATION');
 assert.equal(p.sourceOfferRef,donor.offerReceipt.receiptId);
});
test('one live native source departure yields destination arrival and receipted Crossing',()=>{
 const x=full(),out=arrive(x);assert.equal(out.session.crossingStatus,'CROSSED');
 assert.equal(out.session.party.anchorRef,x.prepared.anchorRef);
 assert.equal(out.session.party.currentWorldRef,'foreign-room-seed-001');
 assert.equal(out.crossingReceipt.sourceDepartureRef,x.departureReceipt.receiptId);
 assert.equal(out.crossingReceipt.destinationArrivalRef,out.arrivalReceipt.receiptId);
 assert.equal(out.session.source.bell.sourceStatus,'unresolved');
 assert.deepEqual(projectTable(out.session).availableActions,['TAKE_SEAT','STAY_AT_DOOR']);
});
test('foreign scene can actually continue after native arrival without source history mutation',()=>{
 const x=full(),initial=canonical(x.donor.history),out=arrive(x);
 const seated=playLiveTable(out.session,{kind:'TAKE_SEAT',actorRef:actor.id,actionId:'live-seat',at:'2026-09-21T22:12:00.000Z'});
 assert.equal(projectTable(seated.session).posture,'seated');
 const listened=playLiveTable(seated.session,{kind:'LISTEN',actorRef:actor.id,actionId:'live-listen',at:'2026-09-21T22:13:00.000Z'});
 const inspected=playLiveTable(listened.session,{kind:'INSPECT_ADDRESS',actorRef:actor.id,actionId:'live-inspect',at:'2026-09-21T22:14:00.000Z'});
 assert.equal(projectTable(inspected.session).candidateGate.status,'DETECTED');
 assert.equal(projectTable(inspected.session).candidateGate.authorized,false);
 assert.equal(canonical(x.donor.history),initial);
});
test('no explicit human confirmation means no admission-to-departure route',()=>{
 const donor=nativePlay(),prepared=prepareNativeCrossing(donor);
 assert.throws(()=>confirmNativeCrossing(prepared,{actorRef:actor.id,at:'2026-09-21T22:09:00.000Z',explicitChoice:false}),/HUMAN_CONFIRMATION_REQUIRED/);
 assert.throws(()=>confirmNativeCrossing(prepared,{actorRef:'human/other',at:'2026-09-21T22:09:00.000Z',explicitChoice:true}),/HUMAN_CONFIRMATION_REQUIRED/);
});
test('missed clue refuses native offer rather than declaring a Gate',()=>{
 const donor=nativePlay(false);
 assert.throws(()=>prepareNativeCrossing(donor),/NATIVE_UNTRACED_GATE/);
});
test('foreign admission edits cannot rewrite policy under a valid source departure',()=>{
 const x=full();x.packet.admission.admittedItemRefs.push('private:memory');
 assert.throws(()=>arrive(x),/FOREIGN_RECEIPT_INTEGRITY/);
});
test('source history rewrites after offer cannot be laundered into destination arrival',()=>{
 const x=full();x.departedHistory[1].payload.ordinal=2;
 assert.throws(()=>arrive(x),/NATIVE_EVENT_ID_MISMATCH|SOURCE_HISTORY_FORK_OR_REWRITE/);
});
test('source departure references must equal actual admission and confirmation',()=>{
 const x=full();const d=x.departedHistory.at(-1);
 d.payload.confirmationRef='receipt/imaginary';const {eventId,...body}=d;d.eventId=stable('event',body);
 x.departureReceipt=receipt('SourceDepartureReceipt',d);
 assert.throws(()=>arrive(x),/SOURCE_DEPARTURE_SCOPE_INVALID/);
});
test('arrival cannot happen before actual source departure',()=>{
 const x=full();
 assert.throws(()=>arriveNativeCrossing({offeredHistory:x.donor.history,departedHistory:x.departedHistory,
  receipts:x.donor.receipts,offerReceipt:x.donor.offerReceipt,packet:x.packet,departureReceipt:x.departureReceipt,
  at:'2026-09-21T22:09:00.000Z'}),/ARRIVAL_TIME_INVALID/);
});
