import {clone,hashRecord,assertUnique} from './identity.js';
function localEvent(worldId,kind,actionId,at,payload){
 const body={id:`${worldId}/${actionId}`,sourceSystem:worldId,kind,at,payload:clone(payload)};
 return {...body,hash:hashRecord('origin-local-event-v01',body)};
}
function appendLocal(world,kind,actionId,at,payload){
 const next=clone(world);if(next.localEvents.some(e=>e.id===`${world.worldId}/${actionId}`))throw new Error('DUPLICATE_LOCAL_EVENT');
 next.localEvents.push(localEvent(world.worldId,kind,actionId,at,payload));assertUnique(next.localEvents);
 return {world:next,receipt:{receiptType:kind,receiptId:next.localEvents.at(-1).hash,eventId:next.localEvents.at(-1).id,sourceWorldRef:world.worldId,sourceStatus:'unresolved'}};
}
export function detectScreenDoor(source,party,action){
 if(source.inputProvenance?.kind!=='synthetic-specimen'||source.firstBellPlayReceipt?.receiptId!=='fixture:static-field/first-bell-play-001')throw new Error('UNVERIFIED_SOURCE');
 if(source.firstBellPlayReceipt.receiptType!=='FirstBellPlayReceipt'||!source.firstBellPlayReceipt.relationTraced||!source.gateRelationTraced)throw new Error('RELATION_NOT_TRACED');
 if(source.bell.sourceStatus!=='unresolved'||source.knock.sourceStatus!=='unresolved')throw new Error('BELL_SOURCE_CHANGED');
 if(source.localEvents.filter(e=>e.kind==='BELL_OCCURRENCE').length!==2||!source.localEvents.some(e=>e.kind==='KNOCK_OCCURRENCE'))throw new Error('SOURCE_HISTORY_INCOMPLETE');
 if(!party.anchorRef||!party.carriedCardRefs.includes(party.anchorRef))throw new Error('PARTY_ANCHOR_REQUIRED');
 return appendLocal(source,'gate.detected',action.actionId,action.at,{gateId:'SCREEN-DOOR-001',firstBellReceiptRef:source.firstBellPlayReceipt.receiptId,sourceGateRef:'fixture:derived-static-field-gate'});
}
export function openScreenDoor(source,gate,action){
 if(gate.status!=='DETECTED'||!action.detectionRef||!source.localEvents.some(e=>e.kind==='gate.detected'&&e.hash===action.detectionRef))throw new Error('DETECTION_REQUIRED');
 if(action.verb!=='OPEN')throw new Error('LOCAL_OPEN_REQUIRED');
 return appendLocal(source,'gate.offered',action.actionId,action.at,{gateId:gate.gateId,destinationWorldRef:'foreign-room-seed-001',detectionRef:action.detectionRef});
}
export function departPorch(source,admission,confirmation,action){
 if(!admission?.receiptId||!confirmation?.receiptId)throw new Error('CONFIRMATION_REQUIRED');
 return appendLocal(source,'porch.departed',action.actionId,action.at,{admissionRef:admission.receiptId,confirmationRef:confirmation.receiptId,chairsPreserved:true,bellSourceStatus:'unresolved'});
}
export function arriveForeignRoom(destination,admission,confirmation,departure,action){
 if(!admission?.receiptId||!confirmation?.receiptId||!departure?.receiptId)throw new Error('DESTINATION_ARRIVAL_REQUIRED');
 if(destination.localEvents.filter(e=>e.kind==='party.arrived').length)throw new Error('DUPLICATE_ARRIVAL');
 const result=appendLocal(destination,'party.arrived',action.actionId,action.at,{admissionRef:admission.receiptId,departureRef:departure.receiptId,confirmationRef:confirmation.receiptId,localSceneRef:'meal.half-finished'});
 const projection=appendLocal(result.world,'origin.reported',`${action.actionId}:reported-origin`,action.at,{sourceRef:'static-field:porch',destinationRef:'foreign-room:reported-origin/porch',evidenceClass:'reported-origin',sourceAuthority:'none'});
 projection.world.localClock=action.at;
 return {world:projection.world,receipt:result.receipt};
}
export function verifyLocalEvents(world){
 assertUnique(world.localEvents);
 for(const e of world.localEvents){const {hash,...body}=e;if(e.sourceSystem!==world.worldId||hash!==hashRecord('origin-local-event-v01',body))throw new Error('LOCAL_EVENT_INTEGRITY');}
}
