// Read-only, receipt-checked STATIC FIELD source handoff.
// Native hashes witness content, not authorship or cross-world permission.
import {canonical,sha256,clone,hashRecord} from './identity.js';

const SOURCE='static-field/worldseed-001';
const EXPECTED_PIN={repository:'the-static-collective/static-field',branch:'feat/static-field-first-bell-001',commit:'59d6adff7cc48de57340dc5c924bd26646105d41'};
const id=(ns,value)=>`${ns}/${sha256(canonical(value)).slice(0,24)}`;
const fail=code=>{throw new Error(code);};
const assert=(condition,code)=>{if(!condition)fail(code);};
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const ordinal=(history,kind)=>history.filter(e=>e.kind===kind);
const receiptFor=(receiptType,event)=>{
 const base={receiptType,eventId:event.eventId,sourceStatus:event.sourceStatus};
 return {receiptId:id('receipt',base),...base};
};
const playReceiptFor=(event)=>{
 const basic=receiptFor('FirstBellPlayReceipt',event);
 const body={...basic,secretNoticed:event.payload.secretNoticed,relationTraced:event.payload.relationTraced};
 return {...body,receiptId:id('receipt',body)};
};
function parseHistory(raw){
 if(typeof raw==='string'){
  assert(raw.length<=2000000,'EXPORT_TOO_LARGE');
  const lines=raw.trim().split('\n').filter(Boolean);
  assert(lines.length>=1&&lines.length<=256,'EXPORT_EVENT_COUNT');
  try{return lines.map(line=>JSON.parse(line));}catch{fail('EXPORT_JSONL_INVALID');}
 }
 assert(Array.isArray(raw)&&raw.length>=1&&raw.length<=256,'EXPORT_EVENT_COUNT');
 return clone(raw);
}
function validateEvents(history){
 let prev=null,lastTime='';const ids=new Set();
 for(const event of history){
  assert(isObject(event)&&isObject(event.actor)&&isObject(event.payload)&&Array.isArray(event.parentEventIds),'NATIVE_EVENT_SHAPE');
  const {eventId,...draft}=event;
  assert(typeof event.kind==='string'&&typeof event.actor.id==='string'&&['human','model'].includes(event.actor.kind),'NATIVE_EVENT_SHAPE');
  assert(typeof event.occurredAt==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(event.occurredAt)&&Number.isFinite(Date.parse(event.occurredAt)),'NATIVE_EVENT_TIME');
  assert(event.occurredAt>=lastTime,'NATIVE_EVENT_TIME_REVERSAL');
  assert(['resolved','unresolved','contested'].includes(event.sourceStatus)&&['observed','reported','derived','unresolved'].includes(event.evidenceClass),'NATIVE_EVENT_SHAPE');
  assert(event.eventId===id('event',draft),'NATIVE_EVENT_ID_MISMATCH');
  assert(canonical(event.parentEventIds)===canonical(prev?[prev]:[]),'NATIVE_PARENT_CHAIN_INVALID');
  assert(!ids.has(eventId),'NATIVE_DUPLICATE_EVENT');
  ids.add(eventId);prev=eventId;lastTime=event.occurredAt;
 }
}
function single(history,kind){const matching=ordinal(history,kind);assert(matching.length===1,`NATIVE_${kind}_COUNT`);return matching[0];}
function validateStory(history){
 const arrival=single(history,'PORCH_ARRIVAL');
 assert(arrival.payload.regionId==='the-porch'&&arrival.actor.kind==='human','NATIVE_ARRIVAL_INVALID');
 const bells=ordinal(history,'BELL_OCCURRENCE');
 assert(bells.length===2&&bells.every((e,i)=>e.payload.ordinal===i+1&&e.payload.interpretation===null&&e.sourceStatus==='unresolved'),'NATIVE_BELL_INVALID');
 const knock=single(history,'KNOCK_OCCURRENCE');
 assert(knock.payload.repeats===3&&knock.payload.interpretation===null&&knock.sourceStatus==='unresolved','NATIVE_KNOCK_INVALID');
 const close=single(history,'FIRST_BELL_PLAY_CLOSED');
 assert(history.at(-1).eventId===close.eventId&&close.sourceStatus==='unresolved'&&close.payload.bellSourceStatus==='unresolved','NATIVE_CLOSURE_INVALID');
 const at=event=>history.indexOf(event);
 assert(at(arrival)<at(bells[0])&&at(bells[0])<at(bells[1])&&at(bells[1])<at(knock)&&at(knock)<at(close),'NATIVE_STORY_ORDER_INVALID');
 const noticed=ordinal(history,'OPEN_CORNER_NOTICED'),entered=ordinal(history,'RESONANCE_ENTERED'),traced=ordinal(history,'RESONANCE_RELATION_TRACED');
 assert(noticed.length<=1&&entered.length<=1&&traced.length<=1,'NATIVE_RELATION_COUNT');
 if(noticed.length)assert(at(bells[1])<at(noticed[0])&&at(noticed[0])<at(close)&&noticed[0].payload.retrospectiveBellEvidence===false,'NATIVE_CLUE_INVALID');
 if(entered.length)assert(noticed.length===1&&at(noticed[0])<at(entered[0])&&at(entered[0])<at(close),'NATIVE_RESONANCE_INVALID');
 if(traced.length)assert(entered.length===1&&at(entered[0])<at(traced[0])&&at(traced[0])<at(close)&&traced[0].payload.promotedClaim===false&&traced[0].sourceStatus==='unresolved','NATIVE_RELATION_INVALID');
 assert(close.payload.secretNoticed===Boolean(noticed.length)&&close.payload.relationTraced===Boolean(traced.length),'NATIVE_CLOSURE_FLAGS_INVALID');
 return {arrival,bells,knock,close,noticed:noticed[0]??null,traced:traced[0]??null};
}
function validateReceipts(receipts,story){
 assert(isObject(receipts),'NATIVE_RECEIPTS_REQUIRED');
 const expectations={
  'first-bell-play-receipt.json':playReceiptFor(story.close),
  'bell-1-receipt.json':receiptFor('BellOccurrenceReceipt#1',story.bells[0]),
  'bell-2-receipt.json':receiptFor('BellOccurrenceReceipt#2',story.bells[1]),
  'porch-arrival-receipt.json':receiptFor('PorchArrivalReceipt',story.arrival),
 };
 if(story.traced)expectations['resonance-relation-receipt.json']=receiptFor('ResonanceRelationReceipt',story.traced);
 for(const [name,expected] of Object.entries(expectations))assert(canonical(receipts[name])===canonical(expected),`NATIVE_RECEIPT_MISMATCH:${name}`);
 if(!story.traced)assert(!receipts['resonance-relation-receipt.json'],'NATIVE_UNEARNED_RELATION_RECEIPT');
 return expectations;
}
export function inspectFirstBellExport({history:inputHistory,receipts,sourcePin=EXPECTED_PIN}){
 assert(canonical(sourcePin)===canonical(EXPECTED_PIN),'UNSUPPORTED_DONOR_PIN');
 const history=parseHistory(inputHistory);
 validateEvents(history);
 const story=validateStory(history);
 const nativeReceipts=validateReceipts(receipts,story);
 const eligible=Boolean(story.noticed&&story.traced);
 const sourceDigest=`sha256:${sha256(canonical(history))}`;
 const base={
  schemaVersion:'origin.static-field-composition.v0.1',kind:'read-only-crossing-candidate',
  sourceWorldRef:SOURCE,sourcePin:clone(EXPECTED_PIN),sourceDigest,
  verifiedNativeEventCount:history.length,firstBellPlayReceiptRef:nativeReceipts['first-bell-play-receipt.json'].receiptId,
  bellEventRefs:story.bells.map(e=>e.eventId),knockEventRef:story.knock.eventId,
  sourceBellStatus:'unresolved',sourceKnockStatus:'unresolved',
  gateId:'SCREEN-DOOR-001',gateStatus:eligible?'CANDIDATE_UNOPENED':'HOLD_NO_TRACED_RELATION',
  reviewStatus:'PENDING_HUMAN_REVIEW',worldseedAdmissionStatus:'NOT_REQUESTED',
  partyStatus:'NOT_TRANSFERRED',sourceDepartureStatus:'NOT_RECORDED',
  nonClaims:['hashes_do_not_authenticate_author','donor_pin_is_a_declared_contract_not_a_network_attestation','not_an_open_gate','not_a_worldseed_admission','not_a_crossing','no_live_party_identity_or_permission_transfer','bell_and_knock_causes_unresolved'],
 };
 return {...base,candidateId:hashRecord('origin-static-field-composition-v01',base)};
}
export {EXPECTED_PIN};
