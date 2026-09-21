import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runFirstCrossingFixture} from '../src/origin/specimen.js';

test('checked-in expected receipt matches replay exactly',async()=>{
 const fixture=JSON.parse(await readFile(new URL('../examples/origin-first-crossing-001/expected-receipt.json',import.meta.url),'utf8'));
 assert.deepEqual(runFirstCrossingFixture().receipt,fixture);
});
test('crossing hash does not imply donor event certification',()=>{
 const receipt=runFirstCrossingFixture().receipt;
 assert.equal(receipt.inputProvenance,'synthetic-specimen');
 assert.ok(receipt.nonClaims.includes('not_a_live_static_field_receipt'));
 assert.ok(receipt.nonClaims.includes('no_local_authority_transfer'));
 assert.equal(receipt.refusedItemRefs.includes('static-field:charge'),true);
});
