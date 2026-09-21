#!/usr/bin/env node
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {prepareNativeCrossing,confirmNativeCrossing,arriveNativeCrossing} from '../src/origin/live-crossing.js';

const args=process.argv.slice(2);
const option=name=>{const at=args.indexOf(name);return at>=0?args[at+1]:null;};
const phase=option('--phase'),out=option('--out'),carrierOut=option('--carrier');
const fail=message=>{throw new Error(message)};
const readJson=async path=>JSON.parse(await readFile(resolve(path),'utf8'));
const readSource=async dir=>{
 if(!dir)fail('SOURCE_DIRECTORY_REQUIRED');
 const history=(await readFile(join(dir,'history.jsonl'),'utf8')).trim().split('\n').map(JSON.parse);
 const names=['first-bell-play-receipt.json','porch-arrival-receipt.json','bell-1-receipt.json','bell-2-receipt.json','resonance-relation-receipt.json'];
 const receipts={};
 for(const name of names){try{receipts[name]=await readJson(join(dir,name));}catch(error){if(name!=='resonance-relation-receipt.json')throw error;}}
 return {history,receipts};
};
if(!out||!['prepare','confirm','arrive'].includes(phase))fail('Usage: --phase prepare|confirm|arrive --out FILE [--from SOURCE_DIR] [--prepared FILE] [--packet FILE] [--departed DIR] [--actor HUMAN_ID] [--confirm] [--at ISO]');
let result,carrierInputs=null;
if(phase==='prepare'){
 const {history,receipts}=await readSource(option('--from'));
 const offerReceipt=await readJson(join(option('--from'),'source-offer.json'));
 result=prepareNativeCrossing({history,receipts,offerReceipt});
}else if(phase==='confirm'){
 if(!args.includes('--confirm'))fail('EXPLICIT_CONFIRM_FLAG_REQUIRED');
 const prepared=await readJson(option('--prepared')??fail('PREPARED_FILE_REQUIRED'));
 result=confirmNativeCrossing(prepared,{actorRef:option('--actor'),at:option('--at')??new Date().toISOString(),explicitChoice:true});
}else{
 const source=await readSource(option('--from')),departed=await readSource(option('--departed'));
 const packet=await readJson(option('--packet')??fail('PACKET_FILE_REQUIRED'));
 const offerReceipt=await readJson(join(option('--from'),'source-offer.json'));
 const departureReceipt=await readJson(join(option('--departed'),'source-departure.json'));
 const at=option('--at')??new Date().toISOString();
 const inputs={offeredHistory:source.history,departedHistory:departed.history,receipts:source.receipts,offerReceipt,packet,departureReceipt,at};
 result=arriveNativeCrossing(inputs);
 if(carrierOut)carrierInputs=inputs;
}
await mkdir(dirname(resolve(out)),{recursive:true});
await writeFile(resolve(out),JSON.stringify(result,null,2)+'\n','utf8');
if(carrierOut){
 if(phase!=='arrive'||!carrierInputs)fail('CARRIER_REQUIRES_ARRIVAL');
 const {buildLivePlayCarrier}=await import('../src/origin/live-play-carrier.js');
 const carrier=buildLivePlayCarrier(carrierInputs);
 await mkdir(dirname(resolve(carrierOut)),{recursive:true});
 await writeFile(resolve(carrierOut),JSON.stringify(carrier,null,2)+'\n','utf8');
 console.log(`play carrier: ${carrierOut}`);
}
console.log(`${phase}: ${result.crossingReceipt?.receiptId??result.confirmation?.receiptId??result.admission?.receiptId} -> ${out}`);
