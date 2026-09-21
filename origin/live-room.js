import {verifyLivePlayCarrier,chooseLivePlay} from '../src/origin/live-play-carrier.js';

const $=id=>document.getElementById(id);
let current=null;
const descriptions={
 TAKE_SEAT:{title:'Take the offered seat',subtitle:'Join the table. Nothing else is promised.',secondary:false},
 STAY_AT_DOOR:{title:'Stay near the door',subtitle:'Listen without joining the meal.',secondary:true},
 LISTEN:{title:'Listen to the room',subtitle:'There is more here than the sound of the Bell.',secondary:false},
 INSPECT_ADDRESS:{title:'Look at the reported address',subtitle:'Notice a possible relation. Do not enter another world.',secondary:false},
 LET_IT_REST:{title:'Let the address rest',subtitle:'Keep the question open. Holding is a real choice.',secondary:true},
};
const texts={
 arrived:{moment:'01 / SOMEWHERE ELSE',title:'You arrive in the middle of something.',copy:'A half-finished meal sits on the table. No one has set the world on pause for you. There is a chair nearby, and room to remain by the door.',note:'THE MEAL STARTED BEFORE YOU ARRIVED',chapter:'01 / ARRIVAL'},
 seated:{moment:'02 / AN OFFERED PLACE',title:'A chair is yours, if only for a while.',copy:'You sit. A cup rests beside a half-finished plate. The meal belongs to this room; the choice to stay belongs to you.',note:'A PLACE AT THE TABLE',chapter:'02 / THE TABLE'},
 door:{moment:'02 / A LITTLE DISTANCE',title:'You stay where the doorway lets in air.',copy:'You can hear the room without becoming part of its meal. Nobody makes you take the chair.',note:'STILL AT THE DOOR',chapter:'02 / THE DOOR'},
 listening:{moment:'03 / AN ORDINARY TUESDAY',title:'Someone mentions another house.',copy:'It sounds like an ordinary Tuesday already in motion somewhere else. A reported address is not a summons, an invitation, or a way through.',note:'A REPORT, NOT AN INVITATION',chapter:'03 / THE THREAD'},
 detected:{moment:'04 / AN UNOPENED POSSIBILITY',title:'An address comes into view.',copy:'There is a candidate relation to another fictional world. That world has not invited you, admitted a party, or opened its door. You can hold the address without crossing.',note:'GATE DETECTED · NOT OPEN',chapter:'04 / THE ADDRESS'},
 held:{moment:'04 / NO NEED TO RUSH',title:'You let the question rest.',copy:'The other world continues. So does this one. You have kept your first Crossing, the unresolved Bell, and the choice not to pursue another door.',note:'THE THREAD CAN WAIT',chapter:'04 / HELD'},
};
function sceneStage(table){
 if(table.status==='HELD')return 'held';
 if(table.candidateGate)return 'detected';
 if(table.heardAddress)return 'listening';
 return table.posture==='seated'?'seated':table.posture==='door'?'door':'arrived';
}
function showError(err){$('error').textContent=err instanceof Error?err.message:String(err);}
function render(){
 if(!current)return;
 const {carrier,session,table,crossingReceipt,arrivalReceipt}=current;
 const stage=sceneStage(table),words=texts[stage];
 $('entry').hidden=true;$('game').hidden=false;$('chronicle').hidden=false;
 $('illustration').dataset.stage=stage;
 $('location').textContent='FOREIGN ROOM';$('scene-status').textContent=words.chapter;
 $('scene-note').textContent=words.note;$('moment').textContent=words.moment;
 $('world-title').textContent=words.title;$('scene-copy').textContent=words.copy;
 $('short-receipt').textContent=crossingReceipt.receiptId.slice(0,27)+'…';
 $('crossing-id').textContent=crossingReceipt.receiptId;
 $('arrival-id').textContent=arrivalReceipt.receiptId;
 $('anchor-id').textContent=session.party.anchorRef;
 $('gate-status').textContent=table.candidateGate?'Detected · unopened · unauthorized':'Not admitted';
 $('progress-meal').classList.toggle('active',Boolean(table.posture));
 $('progress-thread').classList.toggle('active',table.heardAddress||table.status==='HELD');
 $('choice-heading').textContent=table.availableActions.length?'WHAT DO YOU DO?':'YOUR CHAPTER IS HELD';
 $('afterword').textContent=table.availableActions.length?'Your choice becomes a local Foreign Room occurrence, not an edit to the Porch.':
 'No additional action is required. Save this chapter whenever you like.';
 const actions=$('choices');actions.replaceChildren();
 for(const kind of table.availableActions){
  const d=descriptions[kind];const button=document.createElement('button');button.type='button';
  if(d.secondary)button.classList.add('secondary');
  const inside=document.createElement('div'),heading=document.createElement('strong'),hint=document.createElement('span');
  heading.textContent=d.title;hint.textContent=d.subtitle;inside.append(heading,hint);button.append(inside);
  button.addEventListener('click',()=>commit(kind));actions.append(button);
 }
 const chronicle=$('chapter-events');chronicle.replaceChildren();
 const birth=document.createElement('li');birth.textContent='Arrived in the Foreign Room';
 const receipt=document.createElement('span');receipt.textContent='First Crossing receipted';
 birth.append(receipt);chronicle.append(birth);
 for(const choice of carrier.tableChoices){
  const line=document.createElement('li');line.textContent=descriptions[choice.action.kind].title;
  const snippet=document.createElement('span');snippet.textContent=choice.receiptRef.slice(0,25)+'…';
  line.append(snippet);chronicle.append(line);
 }
}
function commit(kind){
 if(!current)return;
 $('error').textContent='';
 try{
  // Fictional scene time must advance even if the imported CLI specimen is dated
  // after this device's clock; this is a game-local clock, not a real-world witness.
  const last=Date.parse(current.session.destination.localClock);
  const at=new Date(Math.max(Date.now(),last+1000)).toISOString();
  const next=chooseLivePlay(current.carrier,kind,at);
  current=next;render();
 }catch(e){showError(e);}
}
$('file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 $('error').textContent='';
 try{
  if(file.size>4_000_000)throw new Error('The selected story is larger than the local 4 MB limit.');
  const parsed=JSON.parse(await file.text());
  const checked=verifyLivePlayCarrier(parsed);
  current=checked;render();
 }catch(err){showError(err);}finally{e.target.value='';}
});
$('save').addEventListener('click',()=>{
 if(!current)return;
 $('error').textContent='';
 try{
  verifyLivePlayCarrier(current.carrier);
  const blob=new Blob([JSON.stringify(current.carrier,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='foreign-room-chapter.json';
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }catch(err){showError(err);}
});
