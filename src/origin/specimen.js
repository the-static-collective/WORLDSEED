import { createFirstCrossingFixture } from './fixtures.js';
import { createOriginSession,dispatchOriginAction,buildCrossingReceipt } from './engine.js';
const kinds=['DETECT','OPEN','REQUEST_ADMISSION','CONFIRM','DEPART','ARRIVE','SEAL'];
export function runFirstCrossingFixture(){
 let session=createOriginSession(createFirstCrossingFixture());const actionTrace=[];
 kinds.forEach((kind,i)=>{
  const action={kind,actorRef:'fixture:human-1',actionId:`specimen-${i+1}`,at:`2026-09-21T14:${String(i+1).padStart(2,'0')}:00.000Z`};
  session=dispatchOriginAction(session,action).session;actionTrace.push({actionId:action.actionId,kind,status:session.crossingStatus});
 });
 return {session,receipt:buildCrossingReceipt(session),actionTrace};
}
