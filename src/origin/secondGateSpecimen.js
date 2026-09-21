import {createFirstCrossingFixture} from './fixtures.js';
import {createOriginSession,dispatchOriginAction} from './engine.js';
import {recordTableAction,projectTable} from './table.js';
import {requestForeignRoomExit} from './secondGate.js';

/** Synthetic deterministic source-owned offer; no Grace-world acceptance or arrival. */
export function runForeignRoomExitSpecimen(){
 const actorRef='fixture:human-1';let session=createOriginSession(createFirstCrossingFixture());
 for(const [index,kind] of ['DETECT','OPEN','REQUEST_ADMISSION','CONFIRM','DEPART','ARRIVE','SEAL'].entries()){
  session=dispatchOriginAction(session,{kind,actorRef,actionId:`exit-specimen-cross-${index}`,at:`2026-09-21T14:${String(index).padStart(2,'0')}:00.000Z`}).session;
 }
 for(const [index,kind] of ['STAY_AT_DOOR','LISTEN','INSPECT_ADDRESS'].entries()){
  session=recordTableAction(session,{kind,actorRef,actionId:`exit-specimen-table-${index}`,at:`2026-09-21T15:${String(index).padStart(2,'0')}:00.000Z`}).session;
 }
 const candidateGate=projectTable(session).candidateGate;
 const {session:next,exitOffer}=requestForeignRoomExit(session,{kind:'REQUEST_EXIT_OFFER',actorRef,actionId:'exit-specimen-offer-001',at:'2026-09-21T16:01:00.000Z'});
 return {session:next,candidateGate,exitOffer};
}
