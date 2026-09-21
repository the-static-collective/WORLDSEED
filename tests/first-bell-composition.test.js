import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {canonical,sha256} from '../src/origin/identity.js';
import {inspectFirstBellExport} from '../src/origin/first-bell-import.js';
const id=(namespace,value)=>`${namespace}/${sha256(canonical(value)).slice(0,24)}`;
function event(history,kind,at,payload,status='resolved'){
 const draft={kind,occurredAt:`2026-09-21T22:${String(at).padStart(2,'0')}:00.000Z`,actor:{kind:'human',id:'human/specimen'},evidenceClass:kind==='RESONANCE_RELATION_TRACED'?'derived':'observed',sourceStatus:status,payload,parentEventIds:history.length?[history.at(-1).eventId]:[]};
 history.push({eventId:id('event',draft),...draft});
}
function eventReceipt(type,event){const base={receiptType:type,eventId:event.eventId,sourceStatus:event.sourceStatus};return {receiptId:id('receipt',base),...base};}
function specimen(withClue=true){
 const history=[];
 event(history,'PORCH_ARRIVAL',0,{regionId:'the-porch'});
 event(history,'OBJECT_PREPARED',1,{objectId:'chair-a',verb:'set-out'});
 event(history,'OBJECT_PREPARED',2,{objectId:'extension-cord',verb:'route'});
 event(history,'OBJECT_PREPARED',3,{objectId:'dog-water-bowl',verb:'tend'});
 event(history,'DOOR_CHECKED',4,{objectId:'screen-door'});
 event(history,'BELL_OCCURRENCE',5,{ordinal:1,interpretation:null},'unresolved');
 event(history,'PREPARATION_CONTINUED',6,{objective:'GET_THE_ROOM_READY'});
 event(history,'BELL_OCCURRENCE',7,{ordinal:2,interpretation:null},'unresolved');
 if(withClue){
  event(history,'OPEN_CORNER_NOTICED',8,{relationHint:'lmv/open-corner',retrospectiveBellEvidence:false});
  event(history,'RESONANCE_ENTERED',9,{from:'surface'});
  event(history,'RESONANCE_RELATION_TRACED',10,{relationId:'relation/first-bell-open-corner',evidenceRefs:['archive/song/open-e-022100','archive/card/lmv-open-corner'],promotedClaim:false},'unresolved');
 }
 event(history,'KNOCK_OCCURRENCE',withClue?11:8,{repeats:3,interpretation:null},'unresolved');
 event(history,'FIRST_BELL_PLAY_CLOSED',withClue?12:9,{bellSourceStatus:'unresolved',secretNoticed:withClue,relationTraced:withClue},'unresolved');
 const byKind=kind=>history.find(e=>e.kind===kind),bells=history.filter(e=>e.kind==='BELL_OCCURRENCE');
 const base=eventReceipt('FirstBellPlayReceipt',byKind('FIRST_BELL_PLAY_CLOSED'));
 const play={...base,secretNoticed:withClue,relationTraced:withClue};play.receiptId=id('receipt',play);
 const receipts={'first-bell-play-receipt.json':play,'porch-arrival-receipt.json':eventReceipt('PorchArrivalReceipt',byKind('PORCH_ARRIVAL')),'bell-1-receipt.json':eventReceipt('BellOccurrenceReceipt#1',bells[0]),'bell-2-receipt.json':eventReceipt('BellOccurrenceReceipt#2',bells[1])};
 if(withClue)receipts['resonance-relation-receipt.json']=eventReceipt('ResonanceRelationReceipt',byKind('RESONANCE_RELATION_TRACED'));
 return {history,receipts};
}
function check(exportData){return inspectFirstBellExport({history:exportData.history.map(canonical).join('\n')+'\n',receipts:exportData.receipts});}
const tamper=(original,change)=>{const data=structuredClone(original);change(data);return data;};
const reject=(data,code)=>assert.throws(()=>check(data),new RegExp(code));
test('native specimen matches independently published STATIC FIELD receipt IDs',()=>{
 const actual=specimen();
 assert.equal(actual.receipts['first-bell-play-receipt.json'].receiptId,'receipt/2066f924cb8606017a7d52ab');
 assert.equal(actual.receipts['bell-1-receipt.json'].receiptId,'receipt/b3e0973c6d346d354bfc7ec8');
 assert.equal(actual.receipts['bell-2-receipt.json'].receiptId,'receipt/20bbb5674cbd74f6269e1430');
});
test('valid actual-schema donor export generates stable review-only candidate',()=>{
 const donor=specimen(),a=check(donor),b=check(donor);
 assert.deepEqual(a,b);assert.equal(a.gateStatus,'CANDIDATE_UNOPENED');
 assert.equal(a.partyStatus,'NOT_TRANSFERRED');assert.equal(a.worldseedAdmissionStatus,'NOT_REQUESTED');
 assert.equal(a.sourceBellStatus,'unresolved');assert.equal(a.sourceDepartureStatus,'NOT_RECORDED');
});
test('no clue remains valid but is held without a detectable candidate',()=>{
 const candidate=check(specimen(false));assert.equal(candidate.gateStatus,'HOLD_NO_TRACED_RELATION');
});
test('cannot smuggle a forged play receipt',()=>reject(tamper(specimen(),d=>{d.receipts['first-bell-play-receipt.json'].relationTraced=false;}),'NATIVE_RECEIPT_MISMATCH'));
test('cannot forge an event kind without native ID mismatch',()=>reject(tamper(specimen(),d=>{d.history[5].kind='CLAIM_BELL_EXPLAINED';}),'NATIVE_EVENT_ID_MISMATCH'));
test('cannot reorder native events and keep original parent links',()=>reject(tamper(specimen(),d=>{[d.history[5],d.history[6]]=[d.history[6],d.history[5]];}),'NATIVE_EVENT_TIME_REVERSAL|NATIVE_PARENT_CHAIN_INVALID'));
test('cannot launder native Bell source status with a recomputed hash',()=>reject(tamper(specimen(),d=>{const e=d.history[5];e.sourceStatus='resolved';const {eventId,...draft}=e;e.eventId=id('event',draft);d.history[6].parentEventIds=[e.eventId];}),'NATIVE_BELL_INVALID|NATIVE_EVENT_ID_MISMATCH'));
test('cannot counterfeit an observation as a traced relation',()=>reject(tamper(specimen(),d=>{const e=d.history.find(x=>x.kind==='RESONANCE_RELATION_TRACED');e.payload.promotedClaim=true;}),'NATIVE_EVENT_ID_MISMATCH'));
test('cannot declare relation traced when missed in closure',()=>reject(tamper(specimen(false),d=>{const e=d.history.at(-1);e.payload.relationTraced=true;const {eventId,...draft}=e;e.eventId=id('event',draft);const b=eventReceipt('FirstBellPlayReceipt',e);const p={...b,secretNoticed:false,relationTraced:true};p.receiptId=id('receipt',p);d.receipts['first-bell-play-receipt.json']=p;}),'NATIVE_CLOSURE_FLAGS_INVALID'));
test('cannot silently add a post-closure event',()=>reject(tamper(specimen(),d=>event(d.history,'CAPACITY_PRACTICE',13,{verb:'PRAY'})),'NATIVE_CLOSURE_INVALID'));
test('wrong donor pin refused, regardless of valid hashes',()=>assert.throws(()=>inspectFirstBellExport({...specimen(),sourcePin:{repository:'somewhere/else',branch:'main',commit:'unverified'}}),/UNSUPPORTED_DONOR_PIN/));
test('CLI creates candidate from exported native files without mutating them',async()=>{
 const root=await mkdtemp(join(tmpdir(),'field-composition-'));try{
 const original=specimen(),dir=join(root,'source'),out=join(root,'out','candidate.json');await mkdir(dir);
 await writeFile(join(dir,'history.jsonl'),original.history.map(canonical).join('\n')+'\n');
 for(const [name,value] of Object.entries(original.receipts))await writeFile(join(dir,name),JSON.stringify(value));
 execFileSync(process.execPath,['scripts/compose-first-bell.js','--from',dir,'--out',out],{cwd:new URL('../',import.meta.url).pathname});
 const candidate=JSON.parse(await readFile(out,'utf8'));assert.equal(candidate.gateStatus,'CANDIDATE_UNOPENED');
 assert.equal((await readFile(join(dir,'history.jsonl'),'utf8')).split('\n').length,original.history.length+1);
 }finally{await rm(root,{recursive:true,force:true});}
});
