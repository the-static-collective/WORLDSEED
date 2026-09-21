import {createFirstCrossingFixture} from '../src/origin/fixtures.js';
import {createOriginSession,dispatchOriginAction,availableActions} from '../src/origin/engine.js';
import {parseOriginSession,serializeOriginSession} from '../src/origin/storage.js';
import {availableTableActions,recordTableAction,projectTable} from '../src/origin/table.js';
import {requestForeignRoomExit} from '../src/origin/secondGate.js';

const KEY='static-collective:origin-first-crossing-001';
const place=document.querySelector('#place');
const scene=document.querySelector('#scene');
const detail=document.querySelector('#detail');
const actions=document.querySelector('#actions');
const error=document.querySelector('#error');
const inventory=document.querySelector('#inventory');
const stage=document.querySelector('#stage');
const chapter=document.querySelector('#chapter');
const moment=document.querySelector('#moment');
const choicePrompt=document.querySelector('#choicePrompt');
const choiceHint=document.querySelector('#choiceHint');
const keepsakes=document.querySelector('#keepsakes');
const artLabel=document.querySelector('#artLabel');
let session=null;
let counter=0;

// A story label is never an authority decision: only the existing engine can emit events.
const crossingChoices={
 DETECT:'Inspect the screen door',OPEN:'Open the screen door',REQUEST_ADMISSION:'Listen from the other side',
 CONFIRM:'I choose to cross',DEPART:'Step across the threshold',ARRIVE:'Enter the room',
 SEAL:'Keep the crossing receipt',RECOVER:'Try entering again',CANCEL:'Stay on the Porch',
};
const tableChoices={
 TAKE_SEAT:'Take the offered seat',STAY_AT_DOOR:'Stay at the door',LISTEN:'Listen to the room',
 INSPECT_ADDRESS:'Inspect the reported address',LET_IT_REST:'Let the address rest',
};
const beats={
 LATENT:{chapter:'01 / THE KNOCK',moment:'The evening holds its breath.',prompt:'What do you notice?',hint:'The door is ordinary. Your next move is yours.',mood:'porch',art:'THE SCREEN DOOR'},
 DETECTED:{chapter:'02 / THE DOOR',moment:'A small relation catches the light.',prompt:'Do you open it?',hint:'Not every strange thing is an invitation.',mood:'threshold',art:'SOMETHING AT THE DOOR'},
 OFFERED:{chapter:'02 / THE DOOR',moment:'Somewhere else, a room keeps living.',prompt:'Will the other room answer?',hint:'You can listen. The room decides what it will admit.',mood:'between',art:'THE THRESHOLD'},
 ADMITTED_PENDING_CONFIRMATION:{chapter:'02 / THE DOOR',moment:'Only some things can follow.',prompt:'Will you make the crossing?',hint:'The Anchor and Thread can follow; Porch Charge stays behind. No one moves without your choice.',mood:'between',art:'THE THRESHOLD'},
 CONFIRMED:{chapter:'02 / THE DOOR',moment:'You have made your choice.',prompt:'Take the next step.',hint:'Departure and arrival are two different acts.',mood:'between',art:'THE THRESHOLD'},
 DEPARTED:{chapter:'02 / THE DOOR',moment:'The Porch keeps its own history.',prompt:'Where does the next step land?',hint:'The other room already has a story of its own.',mood:'between',art:'BETWEEN ROOMS'},
 FAILED:{chapter:'02 / THE DOOR',moment:'The path did not complete.',prompt:'Try the arrival again?',hint:'Your departure remains recorded; the room has not received you yet.',mood:'between',art:'BETWEEN ROOMS'},
 ARRIVED:{chapter:'03 / THE TABLE',moment:'You are late to something.',prompt:'Remember how you arrived.',hint:'Keep the first Crossing receipt before continuing.',mood:'room',art:'A MEAL ALREADY UNDERWAY'},
 CROSSED:{chapter:'03 / THE TABLE',moment:'You are late to something.',prompt:'Where do you settle?',hint:'Take a seat, or stay at the door.',mood:'room',art:'A MEAL ALREADY UNDERWAY'},
 CANCELLED:{chapter:'01 / THE KNOCK',moment:'The evening continues.',prompt:'You chose to stay.',hint:'Your original world remains here.',mood:'porch',art:'THE SCREEN DOOR'},
 HELD:{chapter:'02 / THE DOOR',moment:'The door remains unresolved.',prompt:'You may leave it there.',hint:'HOLD does not force a verdict.',mood:'threshold',art:'THE SCREEN DOOR'},
 REFUSED:{chapter:'02 / THE DOOR',moment:'This crossing was not admitted.',prompt:'The Porch remains.',hint:'Refusal is not a transport failure.',mood:'threshold',art:'THE SCREEN DOOR'},
};
function addButton(label,fn){
 const button=document.createElement('button');
 button.type='button';button.textContent=label;button.addEventListener('click',fn);
 actions.append(button);
}
function load(){const raw=localStorage.getItem(KEY);return raw?parseOriginSession(raw):createOriginSession(createFirstCrossingFixture());}
function saveAndRender(next){session=next;localStorage.setItem(KEY,serializeOriginSession(session));render();}
function commit(kind){
 try{error.textContent='';const actionId=`screen-${++counter}`;
  saveAndRender(dispatchOriginAction(session,{kind,actorRef:'fixture:human-1',actionId,at:new Date().toISOString()}).session);
 }catch(e){error.textContent=e instanceof Error?e.message:String(e);}
}
function commitTable(kind){
 try{error.textContent='';const actionId=`screen-${++counter}`;
  saveAndRender(recordTableAction(session,{kind,actorRef:'fixture:human-1',actionId,at:new Date().toISOString()}).session);
 }catch(e){error.textContent=e instanceof Error?e.message:String(e);}
}
function commitExit(){
 try{error.textContent='';const actionId=`screen-${++counter}`;
  saveAndRender(requestForeignRoomExit(session,{kind:'REQUEST_EXIT_OFFER',actorRef:'fixture:human-1',actionId,at:new Date().toISOString()}).session);
 }catch(e){error.textContent=e instanceof Error?e.message:String(e);}
}
function render(){
 if(!session)return;
 const state=session.crossingStatus;
 const isRoom=state==='ARRIVED'||state==='CROSSED';
 const beat=beats[state]||beats.HELD;
 let mode=beat.mood;
 chapter.textContent=beat.chapter;moment.textContent=beat.moment;
 choicePrompt.textContent=beat.prompt;choiceHint.textContent=beat.hint;
 artLabel.textContent=beat.art;
 place.textContent=isRoom?'FOREIGN ROOM':'THE PORCH';
 if(state==='LATENT'){
  scene.textContent='The screen door rests in its frame. Three knocks. Somewhere behind the evening: a Bell, source unresolved.';
  detail.textContent='The chair remains where it was set. You can look closer, or let the night keep its secret.';
 }else if(state==='DETECTED'){
  scene.textContent='Something in the screen catches the light. The door leads somewhere, but the Bell has not said where.';
  detail.textContent='A relation at a door is not permission to cross.';
 }else if(state==='OFFERED'){
  scene.textContent='The door opens somewhere else. There is movement beyond it, a room that did not wait for you.';
  detail.textContent='Listen for an answer. The other room still has its own rules.';
 }else if(state==='ADMITTED_PENDING_CONFIRMATION'){
  scene.textContent='The room answers: your Anchor, card reference and unfinished Bell Thread may follow. Porch Charge stays here; the interpretation must wait.';
  detail.textContent='The room has made its decision. Only you can choose whether to cross.';
 }else if(state==='CONFIRMED'){
  scene.textContent='You place your hand on the screen door. Behind you, the chair and the Porch are still there.';
  detail.textContent='The choice is yours, and the departure will leave its own trace.';
 }else if(state==='DEPARTED'){
  scene.textContent='The Porch recedes. The room on the other side is already in the middle of its evening.';
  detail.textContent='The departure is recorded. Arrival has not happened yet.';
 }else if(state==='FAILED'){
  scene.textContent='The arrival falters, but the Porch does not pretend you never left.';
  detail.textContent='Your departure remains on record. The other room has not received you yet.';
 }else if(state==='ARRIVED'||state==='CROSSED'){
  scene.textContent='You are late to something. A half-finished meal sits on the table. Someone was here before the door opened.';
  detail.textContent='You kept the Bell Thread and an Anchor reference. You did not bring the Porch Charge.';
 }else{
  scene.textContent='You stayed on the Porch. The night carries on without an answer from the Bell.';
  detail.textContent='The knock remains part of this world’s story.';
 }
 actions.replaceChildren();
 for(const kind of availableActions(session))addButton(crossingChoices[kind]||kind,()=>commit(kind));
 let table=null;
 if(state==='CROSSED'){
  table=projectTable(session);
  if(table.posture==='seated'){
   scene.textContent='You take the offered seat. The half-finished meal remains theirs; sitting down does not make their story yours.';
   detail.textContent='The room gives you a place to sit, not the right to decide what happens here.';
  }
  if(table.posture==='door'){
   scene.textContent='You stay by the door. Warm light reaches the threshold; you can listen without joining the table.';
   detail.textContent='You are here, but you do not have to enter the conversation.';
  }
  if(table.heardAddress){
   mode='rumor';chapter.textContent='04 / ANOTHER HOUSE';moment.textContent='A name travels across the table.';
   artLabel.textContent='A THREAD FROM ELSEWHERE';
   scene.textContent='Someone mentions another house, and an ordinary Tuesday already in motion. You heard the name. You do not know the whole story.';
   detail.textContent='It is a reported address, not an invitation. The Bell is still unanswered.';
   choicePrompt.textContent='Follow the thread—or let it rest?';
   choiceHint.textContent='A clue can be kept without forcing a door open.';
  }else if(table.posture){
   choicePrompt.textContent='Will you listen?';choiceHint.textContent='The people in this room were already talking before you arrived.';
  }else{
   choicePrompt.textContent='Where do you settle?';choiceHint.textContent='Take a seat, or stay at the door. Both choices keep the story moving.';
  }
  if(table.candidateGate){
   detail.textContent='The name points toward Grace’s existing campaign. A candidate address is not an invitation or admission.';
   choicePrompt.textContent='Ask about the next door?';choiceHint.textContent='FOREIGN ROOM may offer departure; only Grace can decide about entry.';
  }
  if(table.candidateGate&&!session.exitOffer&&table.status!=='HELD')addButton('Request a Foreign Room exit offer',commitExit);
  if(table.status==='HELD'){
   choicePrompt.textContent='The thread can rest here.';
   choiceHint.textContent='HOLD is a complete choice for now.';
   detail.textContent='The address stays unresolved. You have not closed or entered the other world.';
  }
  if(session.exitOffer){
   mode='offer';chapter.textContent='05 / AN OFFER, NOT AN ARRIVAL';moment.textContent='The second doorway waits on its own terms.';
   artLabel.textContent='THE OFFERED THRESHOLD';
   scene.textContent='FOREIGN ROOM offers a way onward. Nothing pulls you through. The other house is still living its own day.';
   detail.textContent='Grace has NOT admitted you. Host consent, your choice, and a new departure and arrival must each be recorded before any second Crossing.';
   choicePrompt.textContent='The offer is yours to hold.';
   choiceHint.textContent='No second crossing has occurred. You can inspect the offer in the Field notebook.';
  }
  for(const kind of availableTableActions(session))addButton(tableChoices[kind]||kind,()=>commitTable(kind));
 }
 stage.className=`stage mood-${mode}`;
 keepsakes.textContent=`BELL · ${session.source.bell.sourceStatus.toUpperCase()}   /   CARD REFERENCE · KEPT   /   CROSSINGS · ${session.worldline.length}`;
 const shown={status:state,partyAnchor:session.party.anchorRef,sourceBellStatus:session.source.bell.sourceStatus,sourceGateRef:session.gate.sourceGateRef,admission:session.admission?.items,departureRef:session.departure?.receiptId,arrivalRef:session.arrival?.receiptId,crossingRef:session.crossingReceipt?.receiptId,table:table&&{status:table.status,posture:table.posture,candidateGate:table.candidateGate},foreignRoomExitOfferRef:session.exitOffer?.receiptId??null,foreignRoomExitStatus:session.exitOffer?.status??null};
 inventory.textContent=JSON.stringify(shown,null,2);
}
try{
 session=load();counter=session.containerEvents.length+session.destination.localEvents.filter(e=>e.kind.startsWith('table.')||e.kind==='gate.exit_offered').length;render();
}catch(e){
 error.textContent=`Saved Origin history could not be validated: ${e instanceof Error?e.message:String(e)}. Your existing record has not been overwritten.`;
 actions.replaceChildren();addButton('Reset this fictional Origin scene',()=>{localStorage.removeItem(KEY);session=createOriginSession(createFirstCrossingFixture());counter=0;error.textContent='';render();});
}
