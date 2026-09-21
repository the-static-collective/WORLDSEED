#!/usr/bin/env node
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {inspectFirstBellExport} from '../src/origin/first-bell-import.js';
const args=process.argv.slice(2),option=(name)=>{const n=args.indexOf(name);return n>=0?args[n+1]:null;};
const dir=option('--from'),out=option('--out');
if(!dir||!out){console.error('Usage: node scripts/compose-first-bell.js --from <STATIC FIELD CLI export directory> --out <candidate.json>');process.exitCode=2;}
else{
 try{
  const names=['first-bell-play-receipt.json','porch-arrival-receipt.json','bell-1-receipt.json','bell-2-receipt.json','resonance-relation-receipt.json'];
  const receipts={};
  for(const name of names){try{receipts[name]=JSON.parse(await readFile(join(dir,name),'utf8'));}catch(err){if(name!=='resonance-relation-receipt.json')throw err;}}
  const history=await readFile(join(dir,'history.jsonl'),'utf8');
  const candidate=inspectFirstBellExport({history,receipts});
  await mkdir(dirname(resolve(out)),{recursive:true});
  await writeFile(out,JSON.stringify(candidate,null,2)+'\n','utf8');
  console.log(`${candidate.gateStatus}: ${candidate.candidateId} -> ${out}`);
 }catch(err){console.error(`Composition refused: ${err instanceof Error?err.message:String(err)}`);process.exitCode=1;}
}
