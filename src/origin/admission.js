import {clone,hashRecord,assertUnique} from './identity.js';
export function buildTransferBundle(party,offer){
 if(!offer?.receiptId)throw new Error('GATE_OFFER_REQUIRED');
 const entry=(ref,sourceSystem,claimScope,requestedMode,evidenceRef)=>({ref,sourceSystem,claimScope,requestedMode,evidenceRef});
 const items=[
  entry('human:fixture:human-1','static-field/worldseed-001','participant-ref','reference',party.anchorRef),
  entry(party.anchorRef,'postemahhn','card-reference-not-physical-custody','reference',offer.receiptId),
  entry('thread:bell-unresolved','static-field/worldseed-001','unresolved-thread-only','reference',offer.receiptId),
  entry('static-field:charge','static-field/worldseed-001','source-local-capacity','carry',offer.receiptId),
  entry('static-field:resonance-interpretation','static-field/worldseed-001','interpretation-not-fact','reference',offer.receiptId),
  entry('static-field:porch','static-field/worldseed-001','reported-origin-place','reconstitute',offer.receiptId),
  entry('private:memory','static-field/worldseed-001','private-knowledge-not-consented','withhold',offer.receiptId),
  entry('model:local-grant','static-field/worldseed-001','source-local-model-capability','withhold',offer.receiptId),
 ];
 assertUnique(items,'ref');return {bundleId:hashRecord('origin-transfer-bundle',items),partyRef:party.partyId,sourceWorldRef:'static-field/worldseed-001',proposedDestinationRef:'foreign-room-seed-001',offerRef:offer.receiptId,items};
}
export function evaluateForeignRoomAdmission(destination,offer,bundle){
 if(destination.worldId!=='foreign-room-seed-001'||bundle.proposedDestinationRef!==destination.worldId||bundle.offerRef!==offer.receiptId||bundle.sourceWorldRef!=='static-field/worldseed-001')throw new Error('ADMISSION_SOURCE_MISMATCH');
 if(offer.receiptType!=='gate.offered'||!offer.receiptId)throw new Error('GATE_OFFER_REQUIRED');
 assertUnique(bundle.items,'ref');
 const policies={
  'human:fixture:human-1':'ADMIT','card:first-inheritance':'ADMIT','thread:bell-unresolved':'ADMIT',
  'static-field:charge':'REFUSE','static-field:resonance-interpretation':'HOLD','static-field:porch':'TRANSFORM',
  'private:memory':'WITHHOLD','model:local-grant':'WITHHOLD'
 };
 if(bundle.items.length!==Object.keys(policies).length||bundle.items.some(item=>policies[item.ref]===undefined))throw new Error('UNDECLARED_TRANSFER_ITEM');
 const items=bundle.items.map(item=>({ref:item.ref,sourceSystem:item.sourceSystem,disposition:policies[item.ref],destinationRef:item.ref==='static-field:porch'?'foreign-room:reported-origin/porch':null}));
 if(items.some(x=>(x.ref==='private:memory'||x.ref==='model:local-grant')&&x.disposition!=='WITHHOLD'))throw new Error('PRIVATE_INFORMATION_LEAK');
 const body={receiptType:'DestinationAdmissionReceipt',destinationWorldRef:destination.worldId,offerRef:offer.receiptId,bundleRef:bundle.bundleId,items,sourceStatus:'fictional-local-admission',nonClaims:['not_a_source_world_authority','held_interpretation_not_admitted_as_fact']};
 return {...body,receiptId:hashRecord('origin-admission',body)};
}
export function projectAdmittedTransfer(bundle,admission){
 if(bundle.bundleId!==admission.bundleRef)throw new Error('BUNDLE_MISMATCH');
 const groups={admitted:[],refused:[],held:[],transformed:[],withheld:[]};const seen=new Set();
 for(const result of admission.items){
  const item=bundle.items.find(x=>x.ref===result.ref);
  if(!item||seen.has(result.ref))throw new Error('DUPLICATE_OR_UNDECLARED_DISPOSITION');seen.add(result.ref);
  const group={ADMIT:'admitted',REFUSE:'refused',HOLD:'held',TRANSFORM:'transformed',WITHHOLD:'withheld'}[result.disposition];
  if(!group)throw new Error('UNSUPPORTED_DISPOSITION');groups[group].push(clone({...item,...result}));
 }
 if(seen.size!==bundle.items.length)throw new Error('MISSING_DISPOSITION');
 return groups;
}
