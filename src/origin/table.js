import {clone,hashRecord} from './identity.js';
import {recordForeignRoomTableEvent} from './world-adapters.js';

const DEST='foreign-room-seed-001';
const SOURCE_ADDRESS={
 worldId:'full-measure/grace-001',
 sourceSystem:'the-static-collective/full-measure-world-layer',
 sourceBranch:'feature/grace-001-worldseed',
 sourceCommit:'df1f20702012cd4e14a279e05d1a47a8255a40b9',
 sourceSchema:'full-measure.grace-worldseed.v0',
 sourcePath:'specimens/grace-001/worldseed.json',
 claimScope:'developer-source-pointer-only',
};
const KINDS={TAKE_SEAT:'table.seat_taken',STAY_AT_DOOR:'table.door_held',LISTEN:'table.listened',INSPECT_ADDRESS:'table.address_inspected',LET_IT_REST:'table.address_held'};
const ROOM_ONLY=['table.seat_taken','table.door_held','table.listened','table.address_inspected','table.address_held'];
const tableEvents=s=>s.destination?.localEvents?.filter(e=>ROOM_ONLY.includes(e.kind))??[];
const required=s=>{
 if(s?.crossingStatus!=='CROSSED'||s.party?.currentWorldRef!==DEST||!s.crossingReceipt?.receiptId||!s.arrival?.receiptId||!s.destination?.localEvents?.some(e=>e.kind==='meal.half-finished'))throw new Error('CROSSING_REQUIRED');
};
function derive(s){
 const events=tableEvents(s),first=events[0],heard=events.find(e=>e.kind==='table.listened'),inspected=events.find(e=>e.kind==='table.address_inspected'),held=events.find(e=>e.kind==='table.address_held');
 const posture=first?.kind==='table.seat_taken'?'seated':first?.kind==='table.door_held'?'door':null;
 return {events,posture,heard,inspected,held};
}
export function availableTableActions(s){
 if(s?.crossingStatus!=='CROSSED'||s.party?.currentWorldRef!==DEST||!s.crossingReceipt?.receiptId)return [];
 const p=derive(s);
 if(p.held)return [];
 if(!p.posture)return ['TAKE_SEAT','STAY_AT_DOOR'];
 if(!p.heard)return ['LISTEN'];
 if(!p.inspected)return ['INSPECT_ADDRESS','LET_IT_REST'];
 return ['LET_IT_REST'];
}
export function projectTable(s){
 required(s);
 const p=derive(s);
 const candidateGate=p.inspected?{
   gateId:hashRecord('origin-candidate-gate-v02',{priorCrossingRef:s.crossingReceipt.receiptId,reportedEventRef:p.inspected.hash,destinationWorldRef:SOURCE_ADDRESS.worldId}),
   sourceWorldRef:DEST,
   destinationWorldRef:SOURCE_ADDRESS.worldId,
   status:'DETECTED',authorized:false,admissionStatus:'UNREQUESTED',
   reportedLocalEventRef:p.inspected.hash,
   priorCrossingRef:s.crossingReceipt.receiptId,
   sourceAddress:clone(SOURCE_ADDRESS),
   unresolvedConditions:['grace-owned-world-manifest','grace-owned-entry-policy','foreign-room-exit-policy','party-confirmation'],
   nonClaims:['not_a_grace_world_invitation','not_a_destination_admission','not_a_live_world_connection','no_authority_transfer','reported_address_not_source_verified'],
 }:null;
 return {posture:p.posture,heardAddress:Boolean(p.heard),status:p.held?'HELD':p.inspected?'CANDIDATE_DETECTED':p.heard?'ADDRESS_REPORTED':p.posture?'LISTENING_AVAILABLE':'UNSTARTED',candidateGate,localEventRefs:p.events.map(e=>e.hash),availableActions:availableTableActions(s)};
}
export function recordTableAction(session,action){
 required(session);
 if(!action||typeof action!=='object'||Object.keys(action).length!==4||!['kind','actorRef','actionId','at'].every(k=>typeof action[k]==='string'&&action[k]))throw new Error('INVALID_ACTION');
 if(!Object.hasOwn(KINDS,action.kind))throw new Error('INVALID_TABLE_ACTION');
 const s=clone(session);
 const eventId=`${DEST}/table:${action.actionId}`;
 const seen=s.destination.localEvents.find(e=>e.id===eventId);
 if(seen){
   if(seen.kind!==KINDS[action.kind]||seen.payload.actorRef!==action.actorRef||seen.at!==action.at)throw new Error('ACTION_ID_CONFLICT');
   return {session:s,localReceipt:{receiptId:seen.hash,eventId:seen.id},candidateGate:projectTable(s).candidateGate,duplicate:true};
 }
 if(!s.party.members.some(m=>m.kind==='human'&&m.participantRef===action.actorRef))throw new Error('ELIGIBLE_HUMAN_REQUIRED');
 if(!availableTableActions(s).includes(action.kind))throw new Error('ACTION_NOT_AVAILABLE');
 const payload={
   TAKE_SEAT:{sceneRef:'meal.half-finished',consentScope:'accept-the-seat-only'},
   STAY_AT_DOOR:{sceneRef:'meal.half-finished',consentScope:'listen-without-joining'},
   LISTEN:{report:'A person at the table mentions another house and an ordinary Tuesday.',sourceStatus:'fictional-local-report',sourceAddressRef:'full-measure/grace-001',notAnInvitation:true},
   INSPECT_ADDRESS:{address:clone(SOURCE_ADDRESS),scope:'reported-world-address-only',noAdmission:true},
   LET_IT_REST:{disposition:'HOLD',nonClaims:['holding_does_not_close_the_other_world']},
 }[action.kind];
 const result=recordForeignRoomTableEvent(s.destination,action,KINDS[action.kind],payload);
 s.destination=result.world;
 return {session:s,localReceipt:result.receipt,candidateGate:projectTable(s).candidateGate,duplicate:false};
}
export function verifyTableHistory(s){
 const events=tableEvents(s);
 if(!events.length)return;
 required(s);
 let p=clone(s);p.destination.localEvents=p.destination.localEvents.filter(e=>!ROOM_ONLY.includes(e.kind));
 p.destination.localClock=p.destination.localEvents.at(-1)?.at??p.destination.meal.startedAt;
 for(const e of events){
   const kind=Object.keys(KINDS).find(k=>KINDS[k]===e.kind);
   const prefix=`${DEST}/table:`;
   if(!kind||!e.id.startsWith(prefix)||!s.party.members.some(m=>m.kind==='human'&&m.participantRef===e.payload?.actorRef))throw new Error('TABLE_HISTORY_INVALID');
   let expected;
   try {expected=recordTableAction(p,{kind,actorRef:e.payload.actorRef,actionId:e.id.slice(prefix.length),at:e.at}).session.destination.localEvents.at(-1)}
   catch {throw new Error('TABLE_HISTORY_INVALID')}
   if(expected.hash!==e.hash)throw new Error('TABLE_HISTORY_INVALID');
   p.destination.localEvents.push(clone(e));p.destination.localClock=e.at;
 }
}
