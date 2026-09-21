import {clone,hashRecord,assertUnique} from './identity.js';
import {detectScreenDoor,openScreenDoor,departPorch,arriveForeignRoom,verifyLocalEvents} from './world-adapters.js';
import {buildTransferBundle,evaluateForeignRoomAdmission,projectAdmittedTransfer} from './admission.js';
const SOURCE='static-field/worldseed-001',DEST='foreign-room-seed-001';
const STEP={LATENT:['DETECT','CANCEL'],DETECTED:['OPEN','CANCEL'],OFFERED:['REQUEST_ADMISSION','CANCEL'],ADMITTED_PENDING_CONFIRMATION:['CONFIRM','CANCEL'],CONFIRMED:['DEPART','CANCEL'],DEPARTED:['ARRIVE'],FAILED:['RECOVER'],ARRIVED:['SEAL'],CROSSED:[],CANCELLED:[],HELD:[],REFUSED:[]};
function event(kind,action,payload){const body={id:`origin/${action.actionId}`,kind,actorRef:action.actorRef,at:action.at,payload:clone(payload)};return {...body,hash:hashRecord('origin-event-v01',body)};}
function receipt(receiptType,body){const base={receiptType,...clone(body)};return {...base,receiptId:hashRecord('origin-receipt-v01',base)};}
export function createOriginSession(f){
 if(f.inputProvenance?.kind!=='synthetic-specimen'||f.source?.inputProvenance?.kind!=='synthetic-specimen'||f.source.firstBellPlayReceipt?.receiptId!=='fixture:static-field/first-bell-play-001')throw new Error('UNVERIFIED_SOURCE');
 if(f.source.worldId!==SOURCE||f.destination.worldId!==DEST||f.party.currentWorldRef!==SOURCE)throw new Error('WORLD_MISMATCH');
 if(f.gate.status!=='LATENT'||f.gate.authorized)throw new Error('GATE_NOT_LATENT');
 verifyLocalEvents(f.source);verifyLocalEvents(f.destination);
 if(!f.party.members.some(m=>m.kind==='human'&&m.participantRef==='fixture:human-1')||!f.party.anchorRef)throw new Error('PARTY_REQUIRED');
 return {...clone(f),schemaVersion:'origin/0.1',crossingStatus:'LATENT',containerEvents:[],worldline:[],detection:null,offer:null,transferBundle:null,admission:null,confirmation:null,departure:null,arrival:null,crossingReceipt:null};
}
export function availableActions(s){return STEP[s.crossingStatus]||[];}
export function dispatchOriginAction(session,action,adapters={}){
 const s=clone(session);
 if(!action||!['kind','actorRef','actionId','at'].every(k=>typeof action[k]==='string'&&action[k]))throw new Error('INVALID_ACTION');
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(action.at))throw new Error('INVALID_TIMESTAMP');
 const seen=s.containerEvents.find(e=>e.id===`origin/${action.actionId}`);
 if(seen){const {kind,actorRef,actionId,at}=action;if(seen.kind!==kind||seen.actorRef!==actorRef||seen.at!==at||Object.keys(action).length!==4)throw new Error('ACTION_ID_CONFLICT');return {session:s,emittedReceipts:[],duplicate:true};}
 if(!availableActions(s).includes(action.kind)){
  if(action.kind==='OPEN')throw new Error('DETECTION_REQUIRED');
  if(action.kind==='DEPART')throw new Error('CONFIRMATION_REQUIRED');
  if(action.kind==='ARRIVE')throw new Error('SOURCE_DEPARTURE_REQUIRED');
  throw new Error('ACTION_NOT_AVAILABLE');
 }
 const eligible=s.party.members.some(m=>m.kind==='human'&&m.participantRef===action.actorRef);
 if(!eligible)throw new Error(action.kind==='CONFIRM'?'HUMAN_CONFIRMATION_REQUIRED':'ELIGIBLE_HUMAN_REQUIRED');
 const out=[];
 switch(action.kind){
  case 'DETECT':{
   const d=detectScreenDoor(s.source,s.party,action);s.source=d.world;s.detection=receipt('ScreenDoorGateDetectionReceipt',{sourceDetectionRef:d.receipt.receiptId,sourceGateRef:s.gate.sourceGateRef,evidenceRefs:[s.source.firstBellPlayReceipt.receiptId],sourceStatus:'unresolved'});s.gate.status='DETECTED';s.crossingStatus='DETECTED';out.push(s.detection);break;
  }
  case 'OPEN':{
   const o=openScreenDoor(s.source,s.gate,{...action,verb:'OPEN',detectionRef:s.detection.sourceDetectionRef});s.source=o.world;s.offer=receipt('GateOfferReceipt',{sourceOfferRef:o.receipt.receiptId,sourceGateRef:s.gate.sourceGateRef,sourceWorldRef:SOURCE,destinationWorldRef:DEST,detectionRef:s.detection.receiptId});s.transferBundle=buildTransferBundle(s.party,{...o.receipt,receiptType:'gate.offered'});s.gate.status='OFFERED';s.gate.destinationWorldRef=DEST;s.crossingStatus='OFFERED';out.push(s.offer);break;
  }
  case 'REQUEST_ADMISSION':{
   const sourceOffer={receiptType:'gate.offered',receiptId:s.offer.sourceOfferRef};s.admission=evaluateForeignRoomAdmission(s.destination,sourceOffer,s.transferBundle);s.crossingStatus='ADMITTED_PENDING_CONFIRMATION';out.push(s.admission);break;
  }
  case 'CONFIRM':{
   s.confirmation=receipt('PartyConfirmationReceipt',{actorRef:action.actorRef,partyRef:s.party.partyId,gateRef:s.gate.gateId,bundleRef:s.transferBundle.bundleId,admissionRef:s.admission.receiptId,at:action.at,sourceStatus:'human-fixture-input'});s.crossingStatus='CONFIRMED';out.push(s.confirmation);break;
  }
  case 'DEPART':{
   const d=departPorch(s.source,s.admission,s.confirmation,action);s.source=d.world;s.departure=receipt('PorchDepartureReceipt',{localReceiptRef:d.receipt.receiptId,sourceWorldRef:SOURCE,partyRef:s.party.partyId,sourceStatus:'fixture-departure'});s.crossingStatus='DEPARTED';out.push(s.departure);break;
  }
  case 'ARRIVE':
  case 'RECOVER':{
   try {
    if(!s.departure||!s.confirmation||!s.admission)throw new Error('SOURCE_DEPARTURE_REQUIRED');
    const fn=adapters.arriveForeignRoom||arriveForeignRoom;
    const a=fn(s.destination,s.admission,s.confirmation,s.departure,action);s.destination=a.world;
    s.arrival=receipt('ForeignRoomArrivalReceipt',{localReceiptRef:a.receipt.receiptId,destinationWorldRef:DEST,partyRef:s.party.partyId,existingMealRef:'fr-002',sourceStatus:'fixture-arrival'});
    s.party.currentWorldRef=DEST;s.crossingStatus='ARRIVED';out.push(s.arrival);
   }catch(error){s.crossingStatus='FAILED';s.lastFailure={code:'DESTINATION_ARRIVAL_FAILED',reason:error instanceof Error?error.message:String(error),departureRef:s.departure?.receiptId};}
   break;
  }
  case 'SEAL':{
   s.crossingReceipt=buildCrossingReceipt(s);s.crossingStatus='CROSSED';s.gate.status='CROSSED';s.party.priorCrossingRefs.push(s.crossingReceipt.receiptId);s.worldline.push({crossingRef:s.crossingReceipt.receiptId,from:SOURCE,to:DEST,partyRef:s.party.partyId});out.push(s.crossingReceipt);break;
  }
  case 'CANCEL':s.crossingStatus='CANCELLED';break;
 }
 s.containerEvents.push(event(action.kind,action,{receiptRefs:out.map(r=>r.receiptId),status:s.crossingStatus}));
 return {session:s,emittedReceipts:out,duplicate:false};
}
export function buildCrossingReceipt(s){
 if(!s.departure?.receiptId)throw new Error('SOURCE_DEPARTURE_REQUIRED');
 if(!s.arrival?.receiptId)throw new Error('DESTINATION_ARRIVAL_REQUIRED');
 if(!s.confirmation?.receiptId||!s.admission?.receiptId)throw new Error('CONFIRMATION_REQUIRED');
 if(s.party.currentWorldRef!==DEST)throw new Error('PARTY_NOT_ARRIVED');
 const t=projectAdmittedTransfer(s.transferBundle,s.admission);
 const ref=a=>a.map(x=>x.ref);
 return receipt('FirstCrossingReceipt',{
  schema:'origin.crossing.v0.1',crossingId:'crossing:screen-door-001',partyRef:s.party.partyId,anchorRef:s.party.anchorRef,gateRef:s.gate.gateId,sourceGateRef:s.gate.sourceGateRef,sourceWorldRef:SOURCE,destinationWorldRef:DEST,
  sourcePlayReceiptRef:s.source.firstBellPlayReceipt.receiptId,gateDetectionReceiptRef:s.detection.receiptId,gateOfferReceiptRef:s.offer.receiptId,destinationAdmissionReceiptRef:s.admission.receiptId,partyConfirmationReceiptRef:s.confirmation.receiptId,sourceDepartureReceiptRef:s.departure.receiptId,destinationArrivalReceiptRef:s.arrival.receiptId,transferBundleRef:s.transferBundle.bundleId,
  admittedItemRefs:ref(t.admitted),refusedItemRefs:ref(t.refused),heldItemRefs:ref(t.held),transformedItemRefs:ref(t.transformed),withheldItemRefs:ref(t.withheld),unresolvedRefs:['thread:bell-unresolved','source:knock-unresolved'],inputProvenance:s.inputProvenance.kind,
  nonClaims:['does_not_resolve_bell_cause','does_not_prove_supernatural_cause','no_local_authority_transfer','not_a_live_static_field_receipt','not_a_real_world_or_person_judgment']
 });
}
