import { createFirstCrossingFixture } from '../src/origin/fixtures.js';
import { createOriginSession, dispatchOriginAction, availableActions } from '../src/origin/engine.js';
import { parseOriginSession, serializeOriginSession } from '../src/origin/storage.js';
const KEY='static-collective:origin-first-crossing-001';
const place=document.querySelector('#place'),scene=document.querySelector('#scene'),detail=document.querySelector('#detail'),actions=document.querySelector('#actions'),error=document.querySelector('#error'),inventory=document.querySelector('#inventory');
let session=null;let counter=0;
const descriptions={DETECT:'Inspect the screen door',OPEN:'Open the screen door',REQUEST_ADMISSION:'Listen from the other side',CONFIRM:'I choose to cross',DEPART:'Step across the threshold',ARRIVE:'Enter the room',SEAL:'Keep the crossing receipt',RECOVER:'Try entering again',CANCEL:'Stay on the Porch'};
function addButton(label,fn){const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',fn);actions.append(button);}
function load(){const raw=localStorage.getItem(KEY);if(!raw)return createOriginSession(createFirstCrossingFixture());return parseOriginSession(raw);}
function commit(kind){try{error.textContent='';const actionId=`screen-${++counter}`;const result=dispatchOriginAction(session,{kind,actorRef:'fixture:human-1',actionId,at:new Date().toISOString()});session=result.session;localStorage.setItem(KEY,serializeOriginSession(session));render();}catch(e){error.textContent=e instanceof Error?e.message:String(e);}}
function render(){
 if(!session)return;const state=session.crossingStatus;
 place.textContent=state==='ARRIVED'||state==='CROSSED'?'FOREIGN ROOM':'THE PORCH';
 if(state==='ARRIVED'||state==='CROSSED'){
  scene.textContent='You are late to something. A half-finished meal is on the table; the room was already living before you arrived.';
  detail.textContent='The old Bell remains unresolved. You carried a Thread, a card reference and an Anchor—not the Porch Charge.';
 }else if(state==='LATENT'){
  scene.textContent='The screen door rests in its frame. Three knocks. Somewhere behind the evening: a Bell, source unresolved.';
  detail.textContent='The chair remains where it was set. Inspect the threshold if you choose.';
 }else if(state==='DETECTED'){
  scene.textContent='There is a relation at the door. Where it reaches is not yet known.';
  detail.textContent='A detectable Gate is not permission to cross.';
 }else if(state==='OFFERED'){
  scene.textContent='The door opens somewhere else. A foreign room may decide what enters.';
  detail.textContent='The source offers a crossing. The destination has not admitted the party yet.';
 }else if(state==='ADMITTED_PENDING_CONFIRMATION'){
  scene.textContent='The room will admit your Anchor, card reference and unresolved Thread. Charge cannot travel; the interpretation is held.';
  detail.textContent='No one is moved until a human confirms.';
 }else if(state==='CONFIRMED'||state==='DEPARTED'||state==='FAILED'){
  scene.textContent=state==='FAILED'?'The arrival failed. The Porch departure remains on record.':'The threshold holds a departure and an arrival that must each have their own receipt.';
  detail.textContent=`Your party is currently in ${session.party.currentWorldRef}. The Bell is still unresolved.`;
 }else{
  scene.textContent='You stayed on the Porch. The world continues.';
  detail.textContent='The knock remains a local occurrence.';
 }
 actions.replaceChildren();for(const kind of availableActions(session))addButton(descriptions[kind]||kind,()=>commit(kind));
 if(state==='CROSSED')detail.textContent+=' The crossing is receipted; the Porch and the foreign room remain distinct.';
 const shown={status:state,partyAnchor:session.party.anchorRef,sourceBellStatus:session.source.bell.sourceStatus,sourceGateRef:session.gate.sourceGateRef,admission:session.admission?.items,departureRef:session.departure?.receiptId,arrivalRef:session.arrival?.receiptId,crossingRef:session.crossingReceipt?.receiptId};
 inventory.textContent=JSON.stringify(shown,null,2);
}
try{session=load();counter=session.containerEvents.length;render();}
catch(e){error.textContent=`Saved Origin history could not be validated: ${e instanceof Error?e.message:String(e)}. Your existing record has not been overwritten.`;actions.replaceChildren();addButton('Reset this fictional Origin scene',()=>{localStorage.removeItem(KEY);session=createOriginSession(createFirstCrossingFixture());counter=0;error.textContent='';render()});}
