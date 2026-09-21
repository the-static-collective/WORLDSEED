import {canonical, clone, hashRecord} from './identity.js';
import {projectTable} from './table.js';
import {issueForeignRoomExitOffer} from './world-adapters.js';

const ROOM='foreign-room-seed-001';
const GRACE='full-measure/grace-001';
const EXIT_KIND='gate.exit_offered';
const EXIT_ID_PREFIX=`${ROOM}/exit:`;
const CONDITIONS=['grace-owned-entry-policy','grace-local-host-consent','grace-owned-arrival-adapter','separate-human-party-confirmation'];
const NON_CLAIMS=['not_a_grace_world_invitation','not_a_destination_admission','not_a_second_crossing','not_a_live_world_connection','no_automatic_local_authority_transfer'];

function demandSource(session){
 if(session?.crossingStatus!=='CROSSED'||session.party?.currentWorldRef!==ROOM||!session.crossingReceipt?.receiptId||!session.arrival?.receiptId)throw new Error('FIRST_CROSSING_REQUIRED');
 const table=projectTable(session);
 if(table.status==='HELD')throw new Error('GATE_HELD');
 if(!table.candidateGate||table.candidateGate.status!=='DETECTED'||table.candidateGate.authorized!==false||table.candidateGate.admissionStatus!=='UNREQUESTED')throw new Error('CANDIDATE_GATE_REQUIRED');
 return table;
}
function makeTransferBundle(session,gate){
 const manifest=[
  {ref:'human:fixture:human-1',sourceSystem:'static-field/worldseed-001',claimScope:'participant-ref',requestedMode:'reference',evidenceRef:session.crossingReceipt.receiptId},
  {ref:session.party.anchorRef,sourceSystem:'postemahhn',claimScope:'card-reference-not-physical-custody',requestedMode:'reference',evidenceRef:session.crossingReceipt.receiptId},
  {ref:'thread:bell-unresolved',sourceSystem:'static-field/worldseed-001',claimScope:'unresolved-thread-only',requestedMode:'reference',evidenceRef:session.crossingReceipt.receiptId},
  {ref:'foreign-room:reported-origin/porch',sourceSystem:ROOM,claimScope:'destination-local-reported-origin-only',requestedMode:'reference',evidenceRef:session.arrival.receiptId},
 ];
 const bundle={schema:'origin.transfer-preview-request.v0.1',sourceWorldRef:ROOM,proposedDestinationRef:GRACE,partyRef:session.party.partyId,anchorRef:session.party.anchorRef,priorCrossingRef:session.crossingReceipt.receiptId,items:manifest};
 return {bundle,bundleId:hashRecord('origin-second-transfer-bundle-v01',{candidateGateRef:gate.gateId,bundle})};
}
function issuedReceipt(session,action,gate,bundle,localReceipt){
 const body={schema:'origin.foreign-room-exit-offer.v0.1',status:'OFFERED',admitted:false,sourceWorldRef:ROOM,destinationWorldRef:GRACE,
  partyRef:session.party.partyId,anchorRef:session.party.anchorRef,candidateGateRef:gate.gateId,priorCrossingRef:session.crossingReceipt.receiptId,
  sourceLocalReceiptRef:localReceipt.receiptId,sourceLocalEventRef:localReceipt.eventId,transferBundle:bundle.bundle,transferBundleRef:bundle.bundleId,unresolvedConditions:[...CONDITIONS],nonClaims:[...NON_CLAIMS],sourceStatus:'synthetic-foreign-room-local-policy'};
 return {...body,receiptId:hashRecord('origin-foreign-room-exit-offer-v01',body)};
}
export function projectForeignRoomExitOffer(session){
 return session.exitOffer?clone(session.exitOffer):null;
}
export function requestForeignRoomExit(session,action){
 const table=demandSource(session);
 if(!action||typeof action!=='object'||Array.isArray(action)||Object.keys(action).length!==4||!['kind','actorRef','actionId','at'].every(k=>typeof action[k]==='string'&&action[k]))throw new Error('INVALID_EXIT_ACTION');
 if(action.kind!=='REQUEST_EXIT_OFFER')throw new Error('INVALID_EXIT_ACTION');
 const s=clone(session),id=`${EXIT_ID_PREFIX}${action.actionId}`;
 const prior=s.destination.localEvents.filter(e=>e.kind===EXIT_KIND);
 const duplicate=prior.find(e=>e.id===id);
 if(prior.length){
  if(!duplicate||prior.length!==1||duplicate.payload.actorRef!==action.actorRef||duplicate.at!==action.at)throw new Error('ACTION_ID_CONFLICT');
  if(!s.exitOffer||s.exitOffer.sourceLocalReceiptRef!==duplicate.hash)throw new Error('EXIT_HISTORY_INVALID');
  return {session:s,exitOffer:clone(s.exitOffer),duplicate:true};
 }
 if(s.exitOffer)throw new Error('EXIT_HISTORY_INVALID');
 if(!s.party.members.some(m=>m.kind==='human'&&m.participantRef===action.actorRef))throw new Error('ELIGIBLE_HUMAN_REQUIRED');
 if(s.party.anchorRef!=='card:first-inheritance'||!s.party.openThreadRefs.includes('thread:bell-unresolved'))throw new Error('PARTY_CONTINUITY_REQUIRED');
 const gate=table.candidateGate,bundle=makeTransferBundle(s,gate);
 const issue=issueForeignRoomExitOffer(s.destination,action,gate,{partyRef:s.party.partyId,anchorRef:s.party.anchorRef,priorCrossingRef:s.crossingReceipt.receiptId,bundleId:bundle.bundleId});
 s.destination=issue.world;
 s.exitOffer=issuedReceipt(s,action,gate,bundle,issue.receipt);
 return {session:s,exitOffer:clone(s.exitOffer),duplicate:false};
}
/** Verify by replaying the world-local decision from the actual prior room history. */
export function verifyForeignRoomExitHistory(session){
 const events=session.destination?.localEvents?.filter(e=>e.kind===EXIT_KIND)??[];
 if(!events.length){if(session.exitOffer)throw new Error('EXIT_HISTORY_INVALID');return;}
 if(events.length!==1||!session.exitOffer)throw new Error('EXIT_HISTORY_INVALID');
 const e=events[0];
 if(!e.id.startsWith(EXIT_ID_PREFIX)||!e.payload?.actorRef)throw new Error('EXIT_HISTORY_INVALID');
 const before=clone(session);
 before.destination.localEvents=before.destination.localEvents.filter(entry=>entry.kind!==EXIT_KIND);
 before.destination.localClock=before.destination.localEvents.at(-1)?.at??before.destination.meal.startedAt;
 before.exitOffer=null;
 let expected;
 try{expected=requestForeignRoomExit(before,{kind:'REQUEST_EXIT_OFFER',actorRef:e.payload.actorRef,actionId:e.id.slice(EXIT_ID_PREFIX.length),at:e.at});}
 catch{throw new Error('EXIT_HISTORY_INVALID');}
 if(canonical(expected.exitOffer)!==canonical(session.exitOffer)||canonical(expected.session.destination.localEvents)!==canonical(session.destination.localEvents)||expected.session.destination.localClock!==session.destination.localClock)throw new Error('EXIT_HISTORY_INVALID');
}
