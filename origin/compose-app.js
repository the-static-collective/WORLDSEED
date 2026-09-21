import {inspectFirstBellExport} from '../src/origin/first-bell-import.js';

const el=id=>document.getElementById(id);
let current=null;
el('files').addEventListener('change',()=>{
 const selected=[...el('files').files];
 el('count').textContent=selected.length?`${selected.length} selected file(s)`:'No files chosen.';
 el('inspect').disabled=!selected.length;
 current=null;el('result').hidden=true;el('default-panel').hidden=false;el('save').disabled=true;
 el('error').textContent='';
});
el('inspect').addEventListener('click',async()=>{
 el('error').textContent='';current=null;el('save').disabled=true;
 try{
  const files=[...el('files').files];
  const byName=new Map();
  for(const file of files){
   if(byName.has(file.name))throw new Error('DUPLICATE_EXPORT_FILENAME');
   if(file.size>2000000)throw new Error('EXPORT_TOO_LARGE');
   byName.set(file.name,await file.text());
  }
  if(!byName.has('history.jsonl'))throw new Error('HISTORY_JSONL_REQUIRED');
  const receipts={};
  for(const [name,text] of byName)if(name.endsWith('-receipt.json')){
   try{receipts[name]=JSON.parse(text);}catch{throw new Error(`INVALID_RECEIPT_JSON:${name}`);}
  }
  current=inspectFirstBellExport({history:byName.get('history.jsonl'),receipts});
  el('result').hidden=false;el('default-panel').hidden=true;
  el('outcome').textContent=current.gateStatus==='CANDIDATE_UNOPENED'?'A relation is detectable.':'The Porch holds.';
  el('reason').textContent=current.gateStatus==='CANDIDATE_UNOPENED'
   ?'A reviewable candidate exists. The Gate remains unopened; no destination has admitted this party.'
   :'This play is valid without a traced open-corner relation. No Gate candidate is generated.';
  el('play-ref').textContent=current.firstBellPlayReceiptRef;
  el('save').disabled=false;
 }catch(error){
  el('result').hidden=true;el('default-panel').hidden=false;
  el('error').textContent=`Inspection refused: ${error instanceof Error?error.message:String(error)}`;
 }
});
el('save').addEventListener('click',()=>{
 if(!current)return;
 const blob=new Blob([JSON.stringify(current,null,2)+'\n'],{type:'application/json'});
 const href=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=href;a.download='first-bell-composition-candidate.json';
 document.body.append(a);a.click();a.remove();URL.revokeObjectURL(href);
});
