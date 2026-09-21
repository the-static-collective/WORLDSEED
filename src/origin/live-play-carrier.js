// Portable local play carrier: rederive the destination from source-owned evidence
// on *every* import. A card/story does not grant entry or rewrite donor history.
import {canonical,clone} from './identity.js';
import {arriveNativeCrossing} from './live-crossing.js';
import {recordTableAction,projectTable} from './table.js';

const requireState=(value,code)=>{if(!value)throw new Error(code);};
const possible=new Set(['TAKE_SEAT','STAY_AT_DOOR','LISTEN','INSPECT_ADDRESS','LET_IT_REST']);
const equal=(a,b)=>canonical(a)===canonical(b);

export function buildLivePlayCarrier(inputs){
 const initial=arriveNativeCrossing(clone(inputs));
 return {
  schemaVersion:'origin.live-play-carrier.v0.1',kind:'native-crossing-local-story',
  inputs:clone(inputs),firstCrossingReceiptRef:initial.crossingReceipt.receiptId,
  tableChoices:[],
  limits:['local_browser_story','evidence_carries_source_event_content','no_person_identity_authentication','not_a_second_crossing'],
 };
}

export function verifyLivePlayCarrier(raw){
 const carrier=clone(raw);
 requireState(carrier?.schemaVersion==='origin.live-play-carrier.v0.1'
  &&carrier.kind==='native-crossing-local-story','CARRIER_SCHEMA_INVALID');
 requireState(Array.isArray(carrier.tableChoices)&&carrier.tableChoices.length<=12,'CARRIER_CHOICES_INVALID');
 const initial=arriveNativeCrossing(carrier.inputs);
 requireState(carrier.firstCrossingReceiptRef===initial.crossingReceipt.receiptId,'CARRIER_CROSSING_REF_INVALID');
 let session=initial.session;
 for(const [i,choice] of carrier.tableChoices.entries()){
  requireState(choice&&typeof choice==='object'&&Object.keys(choice).sort().join(',')==='action,receiptRef','CARRIER_CHOICE_SHAPE');
  const action=choice.action;
  requireState(action&&typeof action==='object'&&Object.keys(action).sort().join(',')==='actionId,actorRef,at,kind','CARRIER_ACTION_SHAPE');
  requireState(possible.has(action.kind)&&action.actorRef===session.party.members[0].participantRef
   &&action.actionId===`native-table-${i+1}`,'CARRIER_CHOICE_ACTOR_OR_ORDER');
  const moved=recordTableAction(session,action);
  requireState(!moved.duplicate&&choice.receiptRef===moved.localReceipt.receiptId,'CARRIER_CHOICE_RECEIPT_MISMATCH');
  session=moved.session;
 }
 return {carrier,session,table:projectTable(session),
  crossingReceipt:initial.crossingReceipt,arrivalReceipt:initial.arrivalReceipt};
}

export function chooseLivePlay(carrier,kind,at){
 const verified=verifyLivePlayCarrier(carrier);
 requireState(possible.has(kind),'UNKNOWN_TABLE_ACTION');
 requireState(typeof at==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(at)
  &&Number.isFinite(Date.parse(at)),'CHOICE_TIME_INVALID');
 const action={kind,actorRef:verified.session.party.members[0].participantRef,
  actionId:`native-table-${verified.carrier.tableChoices.length+1}`,at};
 const next=recordTableAction(verified.session,action);
 const moved=clone(carrier);
 moved.tableChoices.push({action,receiptRef:next.localReceipt.receiptId});
 return verifyLivePlayCarrier(moved);
}
