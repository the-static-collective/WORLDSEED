import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Porch scene is separate from writer notebook and clearly fictional',async()=>{
 const html=await readFile(new URL('../origin/index.html',import.meta.url),'utf8');
 const app=await readFile(new URL('../origin/app.js',import.meta.url),'utf8');
 assert.match(html,/THE PORCH/);
 assert.match(html,/screen door/i);
 assert.match(html,/FICTIONAL SPECIMEN/);
 assert.doesNotMatch(html,/select universe|level select|choose world/i);
 assert.match(app,/dispatchOriginAction/);
 assert.match(app,/static-collective:origin-first-crossing-001/);
 assert.doesNotMatch(app,/\bfetch\s*\(/);
 assert.doesNotMatch(app,/innerHTML\s*=/);
});
test('scene presents deliberate human confirmation and unknown Bell cause',async()=>{
 const html=await readFile(new URL('../origin/index.html',import.meta.url),'utf8');
 const app=await readFile(new URL('../origin/app.js',import.meta.url),'utf8');
 assert.match(html,/Bell.*unresolved/i);
 assert.match(app,/CONFIRM/);
 assert.match(app,/availableActions/);
 assert.match(app,/FOREIGN ROOM/);
 assert.match(app,/You are late to something/);
});

test('story-first scene offers distinct chapters and a closed optional field notebook',async()=>{
 const html=await readFile(new URL('../origin/index.html',import.meta.url),'utf8');
 const css=await readFile(new URL('../origin/styles.css',import.meta.url),'utf8');
 for(const id of ['stage','chapter','moment','choicePrompt','choiceHint','keepsakes','inventory'])assert.match(html,new RegExp(`id="${id}"`));
 assert.match(html,/<details\s+class="ledger"/);
 assert.doesNotMatch(html,/<details[^>]*\sopen(?:\s|>|=)/);
 assert.match(html,/aria-live="polite"/);
 assert.match(html,/FICTIONAL SPECIMEN/);
 assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
 assert.match(css,/@media\s*\(max-width:\s*700px\)/);
 assert.match(css,/min-height:\s*56px/);
});
