// Actual native STATIC FIELD event-chain handoff into a FOREIGN ROOM-owned arrival.
// Local, explicit and scoped; content hashes are not identity signatures.
import {canonical,hashRecord,sha256,clone} from './identity.js';
import {inspectFirstBellExport} from './first-bell-import.js';
import {createFirstCrossingFixture} from './fixtures.js';
import {projectTable,recordTableAction} from './table.js';

const SOURCE='static-field/worldseed-001',DEST='foreign-room-seed-001';
const valid=(condition,code)=>{if(!condition)throw new Error(code);};
const stableId=(ns,value)=>`${ns}/${sha256(canonical(value)).slice(0,24)}`;
const receiptFor=(type,event)=>{const base={receiptType:type,eventId:event.eventId,sourceStatus:event.sourceStatus};return {...base,receiptId:stableId('receipt',base)};};
const item=(ref,disposition,scope)=>({ref,disposition,scope});
const eventIdFor=event=>{const {eventId,...draft}=event;return stableId('event',draft);};
function verifyExtended(history){
 valid(Array.isArray(history)&&history.length>=2&&history.length<=258,'NATIVE_HISTORY_INVALID');
 let prior=null,lastTime='';
 for(const e of history){
  valid(e&&typeof e==='object'&&e.eventId===eventIdFor(e),'NATIVE_EVENT_ID_MISMATCH');
  valid(canonical(e.parentEventIds)===canonical(prior?[prior]:[]),'NATIVE_PARENT_CHAIN_INVALID');
  valid(typeof e.occurredAt==='string'&&e.occurredAt>=lastTime,'NATIVE_TIME_INVALID');
  prior=e.eventId;lastTime=e.occurredAt;
 }
}
function verifyForeign(receipt,namespace){
 valid(receipt&&typeof receipt==='object'&&typeof receipt.receiptId==='string','FOREIGN_RECEIPT_REQUIRED');
 const {receiptId,...body}=receipt;
 valid(hashRecord(namespace,body)===receiptId,'FOREIGN_RECEIPT_INTEGRITY');
}
function sourceOffer(history,receipts,offeredReceipt){
 verifyExtended(history);
 const offer=history.at(-1);
 valid(offer.kind==='GATE_OPEN_OFFERED'&&offer.sourceStatus==='unresolved'&&offer.evidenceClass==='observed','NATIVE_OFFER_REQUIRED');
 const prefix=history.slice(0,-1),candidate=inspectFirstBellExport({history:prefix,receipts});
 valid(candidate.gateStatus==='CANDIDATE_UNOPENED','NATIVE_UNTRACED_GATE');
 const actor=prefix.find(e=>e.kind==='PORCH_ARRIVAL')?.actor;
 valid(actor?.kind==='human'&&offer.actor.kind==='human'&&offer.actor.id===actor.id,'NATIVE_PARTY_MISMATCH');
 const expected=receiptFor('SourceGateOfferReceipt',offer);
 valid(canonical(offeredReceipt)===canonical(expected),'NATIVE_OFFER_RECEIPT_MISMATCH');
 valid(offer.payload.sourceWorldRef===SOURCE&&offer.payload.destinationWorldRef===DEST
  &&offer.payload.sourcePlayReceiptRef===candidate.firstBellPlayReceiptRef
  &&offer.payload.scope==='fictional-local-crossing'&&offer.payload.authorizedDestination===false,'NATIVE_OFFER_SCOPE_INVALID');
 const relation=prefix.find(e=>e.kind==='RESONANCE_RELATION_TRACED');
 const gateBody={from:'static-field/worldseed-001/the-porch',triggerRefs:[relation.eventId],status:'detected',authorized:false,unresolvedConditions:['destination','opening-authority','transfer-policy']};
 valid(offer.payload.gateId===stableId('gate',gateBody),'NATIVE_GATE_REF_MISMATCH');
 return {prefix,offer,candidate,actor,offerReceipt:expected};
}
export function prepareNativeCrossing({history,receipts,offerReceipt}){
 const proof=sourceOffer(history,receipts,offerReceipt);
 const arrival=proof.prefix.find(e=>e.kind==='PORCH_ARRIVAL');
 const actorRef=proof.actor.id,anchorRef=arrival.eventId,sourceOfferRef=proof.offerReceipt.receiptId;
 const bundle={
  schemaVersion:'origin.live-bundle.v0.1',sourceWorldRef:SOURCE,destinationWorldRef:DEST,
  sourceOfferRef,sourcePlayReceiptRef:proof.candidate.firstBellPlayReceiptRef,
  actorRef,anchorRef,items:[
   item(`human:${actorRef}`,'ADMIT','scoped-fictional-participant-reference'),
   item(anchorRef,'ADMIT','source-arrival-anchor-reference'),
   item('thread:bell-unresolved','ADMIT','unresolved-thread-only'),
   item('static-field:charge','REFUSE','source-local-capacity'),
   item('static-field:resonance-interpretation','HOLD','interpretation-not-fact'),
   item('private:memory','WITHHOLD','private-knowledge'),
   item('model:local-grant','WITHHOLD','source-local-capability'),
  ],
  nonClaims:['no_physical_card_custody','no_private_memory_transfer','no_model_authority_transfer'],
 };
 const bundleRef=hashRecord('origin-live-bundle-v01',bundle);
 const base={
  receiptType:'LiveDestinationAdmissionReceipt',sourceOfferRef,sourceWorldRef:SOURCE,destinationWorldRef:DEST,
  bundleRef,disposition:'ADMIT_SCOPED',
  admittedItemRefs:bundle.items.filter(i=>i.disposition==='ADMIT').map(i=>i.ref),
  refusedItemRefs:bundle.items.filter(i=>i.disposition==='REFUSE').map(i=>i.ref),
  heldItemRefs:bundle.items.filter(i=>i.disposition==='HOLD').map(i=>i.ref),
  withheldItemRefs:bundle.items.filter(i=>i.disposition==='WITHHOLD').map(i=>i.ref),
  nonClaims:['admission_only_not_an_arrival','no_source_departure','no_resolution_of_bell_or_knock','source_local_charge_not_transferred'],
 };
 const admission={...base,receiptId:hashRecord('origin-live-admission-v01',base)};
 return {schemaVersion:'origin.live-preparation.v0.1',sourceHistoryDigest:hashRecord('origin-live-source-history-v01',history),
  candidateId:proof.candidate.candidateId,sourceOfferRef,sourcePlayReceiptRef:proof.candidate.firstBellPlayReceiptRef,
  sourceWorldRef:SOURCE,destinationWorldRef:DEST,actorRef,anchorRef,bundle,bundleRef,admission,
  status:'AWAITING_EXPLICIT_HUMAN_CONFIRMATION'};
}
export function confirmNativeCrossing(prepared,{actorRef,at,explicitChoice}){
 valid(prepared?.schemaVersion==='origin.live-preparation.v0.1'&&prepared.status==='AWAITING_EXPLICIT_HUMAN_CONFIRMATION','PREPARATION_REQUIRED');
 valid(explicitChoice===true&&actorRef===prepared.actorRef,'HUMAN_CONFIRMATION_REQUIRED');
 valid(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(at)&&Number.isFinite(Date.parse(at)),'CONFIRMATION_TIME_INVALID');
 const base={receiptType:'LivePartyConfirmationReceipt',explicitChoice:true,actorRef,
  sourceOfferRef:prepared.sourceOfferRef,admissionRef:prepared.admission.receiptId,
  bundleRef:prepared.bundleRef,destinationWorldRef:DEST,at};
 return {schemaVersion:'origin.live-packet.v0.1',admission:clone(prepared.admission),
  confirmation:{...base,receiptId:hashRecord('origin-live-confirmation-v01',base)}};
}
export function arriveNativeCrossing({offeredHistory,departedHistory,receipts,offerReceipt,packet,departureReceipt,at}){
 const prep=prepareNativeCrossing({history:offeredHistory,receipts,offerReceipt});
 valid(packet?.schemaVersion==='origin.live-packet.v0.1','CONFIRMATION_PACKET_REQUIRED');
 verifyForeign(packet.admission,'origin-live-admission-v01');
 verifyForeign(packet.confirmation,'origin-live-confirmation-v01');
 valid(canonical(packet.admission)===canonical(prep.admission),'DESTINATION_ADMISSION_MISMATCH');
 valid(packet.confirmation.explicitChoice===true&&packet.confirmation.actorRef===prep.actorRef
  &&packet.confirmation.sourceOfferRef===prep.sourceOfferRef
  &&packet.confirmation.admissionRef===prep.admission.receiptId
  &&packet.confirmation.bundleRef===prep.bundleRef
  &&packet.confirmation.destinationWorldRef===DEST,'HUMAN_CONFIRMATION_REQUIRED');
 verifyExtended(departedHistory);
 valid(departedHistory.length===offeredHistory.length+1
  &&canonical(departedHistory.slice(0,-1))===canonical(offeredHistory),'SOURCE_HISTORY_FORK_OR_REWRITE');
 const departure=departedHistory.at(-1);
 valid(departure.kind==='PORCH_DEPARTED'&&departure.actor.id===prep.actorRef
  &&departure.actor.kind==='human'&&departure.sourceStatus==='unresolved','SOURCE_DEPARTURE_REQUIRED');
 valid(canonical(departureReceipt)===canonical(receiptFor('SourceDepartureReceipt',departure)),'SOURCE_DEPARTURE_RECEIPT_MISMATCH');
 valid(departure.payload.sourceOfferRef===prep.sourceOfferRef
  &&departure.payload.sourcePlayReceiptRef===prep.sourcePlayReceiptRef
  &&departure.payload.admissionRef===prep.admission.receiptId
  &&departure.payload.confirmationRef===packet.confirmation.receiptId
  &&departure.payload.bundleRef===prep.bundleRef
  &&departure.payload.destinationWorldRef===DEST
  &&departure.payload.bellSourceStatus==='unresolved'
  &&departure.payload.sourceDoesNotAssertArrival===true,'SOURCE_DEPARTURE_SCOPE_INVALID');
 valid(departure.occurredAt>=packet.confirmation.at,'DEPARTURE_PRECEDES_CONFIRMATION');
 valid(typeof at==='string'&&at>=departure.occurredAt&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(at),'ARRIVAL_TIME_INVALID');
 // The meal is a declared, destination-owned fictional scene that predates arrival.
 const destination=clone(createFirstCrossingFixture().destination);
 const eventBody={
  id:`${DEST}/live-arrival:${departure.eventId}`,sourceSystem:DEST,kind:'party.arrived',at,
  payload:{sourceDepartureRef:departureReceipt.receiptId,sourceOfferRef:prep.sourceOfferRef,
   admissionRef:prep.admission.receiptId,confirmationRef:packet.confirmation.receiptId,
   anchorRef:prep.anchorRef,actorRef:prep.actorRef,localSceneRef:'meal.half-finished'},
 };
 const localEvent={...eventBody,hash:hashRecord('origin-local-event-v01',eventBody)};
 destination.localEvents.push(localEvent);destination.localClock=at;
 const arrivalBody={receiptType:'LiveForeignRoomArrivalReceipt',sourceDepartureRef:departureReceipt.receiptId,
  localEventRef:localEvent.hash,destinationWorldRef:DEST,admissionRef:prep.admission.receiptId,
  confirmationRef:packet.confirmation.receiptId,actorRef:prep.actorRef,sourceStatus:'fictional-local-arrival'};
 const arrivalReceipt={...arrivalBody,receiptId:hashRecord('origin-live-arrival-v01',arrivalBody)};
 const crossingBody={receiptType:'FirstCrossingReceipt',schemaVersion:'origin.live-crossing.v0.1',
  sourceWorldRef:SOURCE,destinationWorldRef:DEST,sourcePlayReceiptRef:prep.sourcePlayReceiptRef,
  sourceOfferRef:prep.sourceOfferRef,admissionRef:prep.admission.receiptId,confirmationRef:packet.confirmation.receiptId,
  sourceDepartureRef:departureReceipt.receiptId,destinationArrivalRef:arrivalReceipt.receiptId,
  anchorRef:prep.anchorRef,actorRef:prep.actorRef,transferBundleRef:prep.bundleRef,
  unresolvedRefs:['thread:bell-unresolved','source:knock-unresolved'],
  nonClaims:['not_a_real_world_crossing','not_authentication_of_person','no_private_memory_or_local_charge_transfer','does_not_resolve_bell_or_knock']};
 const crossingReceipt={...crossingBody,receiptId:hashRecord('origin-live-crossing-v01',crossingBody)};
 const session={schemaVersion:'origin.live-session.v0.1',crossingStatus:'CROSSED',
  source:{worldId:SOURCE,bell:{sourceStatus:'unresolved'},knock:{sourceStatus:'unresolved'},sourceHistoryDigest:prep.sourceHistoryDigest,sourceDepartureRef:departureReceipt.receiptId},
  destination,party:{partyId:`party/${prep.anchorRef}`,anchorRef:prep.anchorRef,currentWorldRef:DEST,
   members:[{kind:'human',participantRef:prep.actorRef}],carriedCardRefs:[],openThreadRefs:['thread:bell-unresolved'],priorCrossingRefs:[crossingReceipt.receiptId]},
  arrival:arrivalReceipt,crossingReceipt,sourceOfferRef:prep.sourceOfferRef,
  inputProvenance:{kind:'native-source-event-chain',sourceHistoryDigest:hashRecord('origin-live-source-history-v01',departedHistory),
    hasVerifiedHumanIdentity:false}};
 // Exercise existing destination scene rules on the actual arrival.
 const table=projectTable(session);
 valid(canonical(table.availableActions)===canonical(['TAKE_SEAT','STAY_AT_DOOR']),'DESTINATION_TABLE_UNAVAILABLE');
 return {session,arrivalReceipt,crossingReceipt};
}
export function playLiveTable(session,action){return recordTableAction(session,action);}
