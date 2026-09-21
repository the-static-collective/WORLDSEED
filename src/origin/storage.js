import {clone,hashRecord,assertUnique,canonical} from './identity.js';
import {verifyLocalEvents} from './world-adapters.js';
import {buildCrossingReceipt} from './engine.js';
import {verifyTableHistory} from './table.js';
import {verifyForeignRoomExitHistory} from './secondGate.js';
export function serializeOriginSession(session){return JSON.stringify({schemaVersion:'origin/0.1',session},null,2);}
export function parseOriginSession(raw){
 let envelope;try{envelope=JSON.parse(raw)}catch{throw new Error('ORIGIN_PARSE_ERROR')}
 if(envelope?.schemaVersion!=='origin/0.1')throw new Error('ORIGIN_SCHEMA_UNSUPPORTED');
 const s=envelope.session;if(s?.schemaVersion!=='origin/0.1'||!s.source?.localEvents||!s.destination?.localEvents||!s.party||!Array.isArray(s.containerEvents))throw new Error('ORIGIN_INVALID_SESSION');
 verifyLocalEvents(s.source);verifyLocalEvents(s.destination);assertUnique(s.containerEvents);
 for(const e of s.containerEvents){const {hash,...body}=e;if(e.hash!==hashRecord('origin-event-v01',body))throw new Error('ORIGIN_EVENT_INTEGRITY');}
 if(s.crossingStatus==='CROSSED'){
  const expected=buildCrossingReceipt(s);
  if(canonical(s.crossingReceipt)!==canonical(expected)||s.worldline.at(-1)?.crossingRef!==expected.receiptId||s.source.localEvents.filter(e=>e.kind==='porch.departed').length!==1||s.destination.localEvents.filter(e=>e.kind==='party.arrived').length!==1)throw new Error('ORIGIN_CROSSING_INTEGRITY');
 }
 verifyTableHistory(s);verifyForeignRoomExitHistory(s);
 if(s.crossingStatus==='FAILED'&&s.arrival)throw new Error('ORIGIN_FAILED_ARRIVAL_INTEGRITY');
 return clone(s);
}
export function replayOriginSession(s){return clone({party:s.party,gate:s.gate,worldline:s.worldline,source:s.source,destination:s.destination,crossingStatus:s.crossingStatus});}
