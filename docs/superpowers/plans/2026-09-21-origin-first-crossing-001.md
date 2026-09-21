# ORIGIN-FIRST-CROSSING-001 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Deliver the first playable, deterministic local Crossing: leave STATIC FIELD's Porch after THE FIRST BELL, negotiate destination-local admission, confirm as a human, arrive in a previously living FOREIGN ROOM, and retain one bounded worldline receipt without assimilating either world.

**Architecture:** Add an independent dependency-free Origin subsystem under src/origin; leave WORLDSEED's existing author-notebook domain, storage key, and writer interface unchanged. Source and destination are small, explicitly fictional world adapters with separate append-only local histories; a container coordinator stores only Crossings, party location and manifest references, not world state. Supply a fixture-only command-line specimen and a separate local browser scene, each using the same deterministic action engine. The STATIC FIELD adapter starts from an explicitly synthetic FirstBell fixture, not an invented claim that the still-design-stage STATIC FIELD runtime has emitted a verified live receipt.

**Tech Stack:** Existing WORLDSEED ESM JavaScript, Node >=20, node:test and node:assert; portable synchronous SHA-256 in pure ESM verified against node:crypto in tests so the identical kernel runs in Node and the browser; plain HTML/CSS/browser JS for a standalone offline scene; zero new dependencies, no server, no network requests.

**Spec:** docs/superpowers/specs/2026-09-21-origin-container-001-design.md

## Global Constraints

- ORIGIN owns no world or person; its authority is limited to container-local traversal and receipt links.
- WORLDSEED v0.1 Capture/Link/Source/Contradict/Wander/Export and its localStorage document remain unchanged.
- The first source fixture is explicitly labelled synthetic and its FirstBellPlayReceipt reference is not certified as a live STATIC FIELD receipt.
- STATIC FIELD alone authors Bell, Knock, Gate Offer and Porch departure within the source adapter; FOREIGN ROOM alone authors admission and arrival within its destination adapter.
- Source departure does not erase Porch history; destination admission does not rewrite source history.
- A detected Gate need not have a known destination and never implies admission.
- Source-local OPEN cannot bypass destination admission or human confirmation.
- No crossing may be sealed without both local departure and arrival receipts.
- Admission is per transfer item; local Charge is refused, one interpretation held, an origin place reference transformed, and party Anchor, card reference and Bell Thread admitted.
- Private knowledge, local authority, social rank, capabilities, model grants and world canon do not transfer automatically.
- One particular party survives with the same Anchor; any model-session member remains typed and cannot assert uninterrupted identity.
- Bell source and Knock source remain unresolved through the final receipt; crossing does not prove supernatural cause.
- FOREIGN ROOM existed before arrival with a local clock and a half-finished meal already present; party arrival does not reset it.
- Every accepted action has a unique supplied ID and deterministic timestamp; duplicate IDs replay idempotently only for the identical action and payload.
- The first scene is a story threshold, not a level-select menu, MMO, global inventory, or a production WORLDSEED document.
- Human confirmation is an actual separate input; a model proposal or compatible Gate cannot synthesize it.
- No future HOME/Paula canon is manufactured by the FOREIGN ROOM fixture.

## Review Focus

1. **Unverified live-input substitution:** A claimed live FirstBell receipt or arbitrary JSON must not be accepted as certified source evidence. Task 2 tests fixture-only admission and rejects forged verification labels.
2. **Mixed-admission leakage:** REFUSE/HOLD/WITHHOLD items must not appear in the arrived party's accepted material or destination-local claims. Task 4 tests each category, including a private-memory and a model-grant attempt.
3. **Retry after interrupted arrival:** A source departure followed by a destination error must not produce a successful Crossing or duplicate either local event on retry; status and recovery remain explicit. Task 6 tests this.
4. **Authorization or replay bypass:** Repeated OPEN, duplicate confirmation IDs, model-originated confirmation, out-of-order input, and a changed request reusing one ID must fail closed or replay the exact prior result. Tasks 3, 5 and 6 test these.
5. **World reset / source rewriting:** A reload after Crossing must preserve the pre-arrival meal, source chairs, original Bell uncertainty, and worldline without merging world histories. Tasks 2, 7 and 8 test this.

---

## File map and ownership

src/world.js, src/app.js, index.html, styles.css
  EXISTING WORLDSEED writer-facing surface. Do not modify.

src/origin/identity.js
  Browser-compatible deterministic canonical SHA-256 hashes and fixture IDs.

src/origin/contracts.js
  World, Gate, Party, TransferBundle and event validation.

src/origin/fixtures.js
  Explicitly synthetic source/destination/party starting records.

src/origin/world-adapters.js
  Separate STATIC FIELD and FOREIGN ROOM local event stores and functions.

src/origin/admission.js
  Destination-owned per-item admission and transfer projection.

src/origin/engine.js
  Container action state machine, human confirmation, compensation/recovery.

src/origin/receipt.js
  Bounded CrossingReceipt and worldline verification.

src/origin/storage.js
  Origin-only serialize/parse with versioning and no implicit reset.

src/origin/specimen.js
  Deterministic first-crossing script using the same engine (created in Task 9, never imported by earlier tasks).

origin/index.html, origin/app.js, origin/styles.css
  Separate browser scene. No shared WORLDSEED author-storage key.

scripts/origin-first-crossing-001.js
  CLI presentation of the pure specimen result.

tests/origin-identity.test.js
tests/origin-worlds.test.js
tests/origin-gate.test.js
tests/origin-admission.test.js
tests/origin-confirmation.test.js
tests/origin-crossing.test.js
tests/origin-persistence.test.js
tests/origin-scene.test.js
tests/origin-specimen.test.js

examples/origin-first-crossing-001/expected-receipt.json
docs/protocol/origin-first-crossing-001.md

Only the isolated origin/ scene may use the Origin store. It must not mount into the writer notebook's default route. A future external adapter replaces the synthetic source fixture only after a separately designed trust and verification contract.

---

### Task 1: Canonical identity and declared contracts

**Files:** Create src/origin/identity.js, src/origin/contracts.js, tests/origin-identity.test.js. Modify package.json only to add origin-specific scripts; preserve existing npm test.

**Interfaces:** canonical(value) -> string; hashRecord(namespace, value) -> string; validateWorldManifest(world) -> world; validateParty(party) -> party; validateGate(gate) -> gate; validateTransferBundle(bundle) -> bundle.

- [ ] **Step 1: Write the failing canonical and contract tests.**

~~~js
import test from 'node:test';
import assert from 'node:assert/strict';
import { canonical, hashRecord } from '../src/origin/identity.js';
import { validateGate, validateParty } from '../src/origin/contracts.js';

test('canonical hashing ignores object-key order, not array order', () => {
  assert.equal(hashRecord('fixture', { a: 1, b: 2 }),
               hashRecord('fixture', { b: 2, a: 1 }));
  assert.notEqual(hashRecord('fixture', ['a', 'b']),
                  hashRecord('fixture', ['b', 'a']));
  assert.throws(() => canonical({ charge: NaN }), /NON_FINITE/);
});
test('detected gate may have no destination but grants no authorization', () => {
  const gate = validateGate({
    gateId: 'SCREEN-DOOR-001', sourceWorldRef: 'static-field',
    sourceLocationRef: 'porch', destinationWorldRef: null,
    status: 'DETECTED', authorized: false, evidenceRefs: ['fixture:knock'],
    unresolvedConditions: ['destination-address'],
  });
  assert.equal(gate.destinationWorldRef, null);
  assert.throws(() => validateGate({ ...gate, authorized: true }), /DETECTED_NOT_ADMITTED/);
});
test('a model-session participant cannot masquerade as a human', () => {
  assert.throws(() => validateParty({
    partyId: 'party-1', anchorRef: 'card:first-inheritance',
    currentWorldRef: 'static-field',
    members: [{ kind: 'model_session', participantRef: 'human-1' }],
  }), /MODEL_SESSION_FIELDS/);
});
~~~

- [ ] **Step 2: Run RED.** Run node --test tests/origin-identity.test.js. Expected: missing Origin modules.
- [ ] **Step 3: Implement canonical JSON with sorted keys, ordered arrays, finite numbers and synchronous UTF-8 SHA-256 in pure ESM.** Do not import node:crypto in production src/origin code: the same module runs in the browser. Verify standard SHA-256 vectors (empty input and abc) and compare against node:crypto's createHash('sha256') in tests. Reject unsupported values and duplicate/blank record IDs; include namespace in digest input. validateParty requires a non-empty Anchor, at least one human member, unique members and typed model sessionRef/roleRef/contextReceiptRefs. validateGate permits unknown destination but rejects an authorized DETECTED state. validateWorldManifest must retain constitutionRef and policies. validateTransferBundle rejects duplicate item refs and unsupported transfer modes.
- [ ] **Step 4: Run GREEN and existing regression.** Run node --test tests/origin-identity.test.js && npm test. Expected: both pass; no writer-test changes.
- [ ] **Step 5: Commit.** Stage only the files named above; message: feat(origin): define canonical crossing contracts.

### Task 2: Independent worlds and synthetic First Bell input

**Files:** Create src/origin/fixtures.js, src/origin/world-adapters.js, tests/origin-worlds.test.js.

**Interfaces:** createFirstCrossingFixture() -> { party, gate, transferBundle, source, destination, inputProvenance }; inspectSource(source) -> immutable projection; inspectDestination(destination) -> immutable projection; detectScreenDoor(source, party) -> local detection receipt; openScreenDoor(source, gate, action) -> local Gate Offer; departPorch(source, admittedOffer, confirmation) -> local departure receipt; arriveForeignRoom(destination, admission, confirmation) -> local arrival receipt.

- [ ] **Step 1: Write failing world-independence and provenance tests.**

~~~js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createFirstCrossingFixture } from '../src/origin/fixtures.js';
import { inspectSource, inspectDestination, detectScreenDoor }
  from '../src/origin/world-adapters.js';

test('source is visibly synthetic and retains the unresolved Bell', () => {
  const fixture = createFirstCrossingFixture();
  assert.equal(fixture.inputProvenance.kind, 'synthetic-specimen');
  assert.equal(fixture.source.bell.sourceStatus, 'unresolved');
  assert.equal(fixture.source.knock.sourceStatus, 'unresolved');
  assert.match(fixture.source.firstBellPlayReceiptRef, /^fixture:/);
  assert.throws(() => detectScreenDoor(
    { ...fixture.source, inputProvenance: { kind: 'live-verified' } },
    fixture.party
  ), /UNVERIFIED_SOURCE/);
});
test('foreign room was active before arrival and source remains unchanged', () => {
  const fixture = createFirstCrossingFixture();
  const sourceBefore = structuredClone(inspectSource(fixture.source));
  assert.equal(inspectDestination(fixture.destination).meal.status, 'half-finished');
  assert.ok(fixture.destination.localEvents.some(e => e.kind === 'meal.started'));
  assert.deepEqual(inspectSource(fixture.source), sourceBefore);
});
~~~

- [ ] **Step 2: Run RED.** Run node --test tests/origin-worlds.test.js. Expected: missing fixture/adapter modules.
- [ ] **Step 3: Define fixture exactly.** Use worldIds static-field and foreign-room-seed-001, gate SCREEN-DOOR-001, human participant fixture:human-1, partyId fixture:party-1, Anchor card:first-inheritance, explicit synthetic FirstBellPlayReceipt ref fixture:static-field/first-bell-play-001, Bell Thread thread:bell-unresolved, and fixed UTC timestamps. Source history has two distinct Bell occurrences and the knock; destination history starts earlier with meal.started and a later meal.half-finished. No actual STATIC FIELD runtime receipt is claimed.
- [ ] **Step 4: Implement source/destination adapters.** Each adapter accepts and emits only its own namespaced local events; all reads produce detached projections; local events have unique IDs and hashes. detectScreenDoor verifies the fixture tag, play receipt ref, unresolved Bell, carried card, party Anchor and knock. OPEN produces a Gate Offer but no departure. departPorch and arriveForeignRoom require admitted destination result plus separate human confirmation; neither mutates the other world.
- [ ] **Step 5: Run GREEN and commit.** Run node --test tests/origin-worlds.test.js && npm test. Commit: feat(origin): preserve two sovereign local histories.

### Task 3: Gate detection, local OPEN and explicit transfer offer

**Files:** Create tests/origin-gate.test.js; modify src/origin/world-adapters.js and src/origin/fixtures.js.

**Interfaces:** detectScreenDoor(source, party) -> DetectionReceipt; openScreenDoor(source, gate, { actionId, actorRef, verb: 'OPEN', detectionRef }) -> GateOfferReceipt; buildTransferBundle(party, gateOffer, fixture) -> validated bundle. The source adapter owns both detection and offer receipts.

- [ ] **Step 1: Write failing Gate-order tests.**

~~~js
test('OPEN only offers a destination; it does not admit or depart', () => {
  const f = createFirstCrossingFixture();
  const detection = detectScreenDoor(f.source, f.party);
  const offer = openScreenDoor(f.source, f.gate, {
    actionId: 'open-1', actorRef: 'fixture:human-1',
    verb: 'OPEN', detectionRef: detection.receiptId,
  });
  assert.equal(offer.status, 'OFFERED');
  assert.equal(f.source.localEvents.some(e => e.kind === 'porch.departed'), false);
  assert.equal(f.destination.localEvents.some(e => e.kind === 'party.arrived'), false);
});
test('no OPEN before detection and no automatic gate authority', () => {
  const f = createFirstCrossingFixture();
  assert.throws(() => openScreenDoor(f.source, f.gate, {
    actionId: 'open-2', actorRef: 'fixture:human-1', verb: 'OPEN',
    detectionRef: 'invented-detection',
  }), /DETECTION_REQUIRED/);
});
~~~

- [ ] **Step 2: Run RED.** Run node --test tests/origin-gate.test.js. Expected: no Gate offer/transfer constructor yet.
- [ ] **Step 3: Implement OPEN state gate.** One detection receipt may allow one Gate Offer; repeated same actionId returns the exact existing result, and reusing an actionId with changed verb/actor rejects. Require an eligible human actor. After local source offers, address the fictional destination foreign-room-seed-001 without assigning cause to the Bell.
- [ ] **Step 4: Build explicit bundle with item IDs and scopes.** Required items: anchor (reference), card (reference), unresolved Bell Thread (reference), local Charge (carry requested), one Resonance interpretation (reference requested), origin-place ref (reconstitute requested), private knowledge (withhold), and a model grant if model fixture enabled (withhold). Every item includes sourceSystem, claimScope, requestedMode and source evidence ref.
- [ ] **Step 5: Run GREEN, regression, commit.** Run node --test tests/origin-gate.test.js && npm test. Commit: feat(origin): offer a bounded screen-door crossing.

### Task 4: Destination-owned admission and transfer projection

**Files:** Create src/origin/admission.js and tests/origin-admission.test.js.

**Interfaces:** evaluateForeignRoomAdmission(destination, offer, bundle) -> DestinationAdmissionReceipt; projectAdmittedTransfer(bundle, admission) -> { admitted, refused, held, transformed, withheld }.

- [ ] **Step 1: Write failing mixed-admission and leakage tests.**

~~~js
test('Foreign Room decides each item without copying the player blob', () => {
  const f = createFirstCrossingFixture();
  const detection = detectScreenDoor(f.source, f.party);
  const offer = openScreenDoor(f.source, f.gate, {
    actionId: 'open-admit', actorRef: 'fixture:human-1',
    verb: 'OPEN', detectionRef: detection.receiptId,
  });
  const bundle = buildTransferBundle(f.party, offer, f);
  const result = evaluateForeignRoomAdmission(f.destination, offer, bundle);
  const items = projectAdmittedTransfer(bundle, result);
  assert.ok(items.admitted.some(x => x.ref === 'thread:bell-unresolved'));
  assert.ok(items.refused.some(x => x.ref === 'static-field:charge'));
  assert.ok(items.held.some(x => x.ref === 'static-field:resonance-interpretation'));
  assert.ok(items.transformed.some(x => x.ref === 'static-field:porch'));
  assert.equal(items.admitted.some(x => x.ref === 'static-field:charge'), false);
  assert.equal(items.admitted.some(x => x.ref === 'private:memory'), false);
  assert.equal(items.admitted.some(x => x.ref === 'model:local-grant'), false);
});
~~~

- [ ] **Step 2: Run RED.** Run node --test tests/origin-admission.test.js. Expected: admission module missing.
- [ ] **Step 3: Implement destination policy with complete item accounting.** Refuse STATIC FIELD Charge; hold interpretation; transform Porch place ref to new destination-local reported-origin ref with new occurrence ID and source link; admit human participant refs, Anchor, card reference and Bell Thread reference; withhold private memory and model-local grant. The destination must explicitly return a disposition for every bundled item. Reject missing or duplicate dispositions, invented items, and attempts to promote held interpretations into local evidence.
- [ ] **Step 4: Verify negative paths.** Add tests that an unknown item, forbidden private item marked admitted, stale offer, or incorrect sourceWorldRef fails before a receipt is issued. The adapter may return overall HELD or REFUSED without changing world state.
- [ ] **Step 5: Run GREEN and commit.** Run node --test tests/origin-admission.test.js && npm test. Commit: feat(origin): admit transfer items under foreign-room law.

### Task 5: Explicit human confirmation and scoped party continuity

**Files:** Create src/origin/engine.js, tests/helpers/origin-sequence.js and tests/origin-confirmation.test.js.

**Interfaces:** createOriginSession(fixture) -> OriginSession; dispatchOriginAction(session, { actionId, actorRef, kind, at }) -> { session, emittedReceipts }. Kinds for this task are DETECT, OPEN, REQUEST_ADMISSION, CONFIRM, CANCEL; later tasks add DEPART, ARRIVE, SEAL. The session owns only container history and copies of separate adapter-local histories.

- [ ] **Step 1: Write failing confirmation tests.** Create tests/helpers/origin-sequence.js with an exported advanceToAdmittedFixture(initialSession) helper: sequentially dispatch DETECT, OPEN and REQUEST_ADMISSION as fixture:human-1 using fixed distinct IDs and UTC timestamps; return the resulting session. Import that helper, createOriginSession and dispatchOriginAction into the test.

~~~js
test('destination admission alone cannot move the party', () => {
  const s = advanceToAdmittedFixture(createOriginSession(createFirstCrossingFixture()));
  assert.equal(s.party.currentWorldRef, 'static-field');
  assert.equal(s.crossingStatus, 'ADMITTED_PENDING_CONFIRMATION');
  assert.equal(s.containerEvents.some(e => e.kind === 'crossing.sealed'), false);
});
test('model session cannot forge human confirmation', () => {
  const s = advanceToAdmittedFixture(createOriginSession(createFirstCrossingFixture()));
  assert.throws(() => dispatchOriginAction(s, {
    actionId: 'confirm-model', actorRef: 'fixture:model-session-1',
    kind: 'CONFIRM', at: '2026-09-21T14:10:00.000Z',
  }), /HUMAN_CONFIRMATION_REQUIRED/);
});
~~~

- [ ] **Step 2: Run RED.** Run node --test tests/origin-confirmation.test.js. Expected: engine missing.
- [ ] **Step 3: Implement coordinator transitions.** The command reducer calls source/destination adapters through explicit methods rather than mutating their state itself. REQUEST_ADMISSION requires a valid offer/bundle; CONFIRM requires an admitted destination result plus a present eligible human party member and matching offer/bundle IDs. CONFIRM appends its own receipt; it does not yet move the party.
- [ ] **Step 4: Add replay/authorization tests.** Reusing a confirmation ID and identical action returns the exact prior result; changing actor/kind/payload for the same ID rejects. CANCEL before departure records CANCELLED; no member, model session, or missing confirmation may cross by relying only on Gate detection.
- [ ] **Step 5: Run GREEN and commit.** Run node --test tests/origin-confirmation.test.js && npm test. Commit: feat(origin): require separate human crossing consent.

### Task 6: Departure, arrival, failures and sealed CrossingReceipt

**Files:** Create src/origin/receipt.js and tests/origin-crossing.test.js; extend src/origin/engine.js, src/origin/world-adapters.js and tests/helpers/origin-sequence.js.

**Interfaces:** dispatchOriginAction adds DEPART, ARRIVE, SEAL and RECOVER; buildCrossingReceipt(session) -> bounded receipt; verifyCrossingReceipt(receipt, session) -> { valid, errors }; projectWorldline(session) -> chronological Crossing refs only.

- [ ] **Step 1: Write failing end-to-end and interruption tests.** Extend tests/helpers/origin-sequence.js with advanceThroughDeparture(initialSession), which calls advanceToAdmittedFixture, then dispatches CONFIRM and DEPART with distinct fixed IDs; also add completeFirstCrossingFixture() which starts from createOriginSession(createFirstCrossingFixture()), dispatches the first five actions then ARRIVE and SEAL, and returns the resulting session. Import those helpers into this test and Task 7's test.

~~~js
test('crossing requires both local receipts and preserves Bell uncertainty', () => {
  const s = advanceThroughDeparture(createOriginSession(createFirstCrossingFixture()));
  assert.throws(() => buildCrossingReceipt(s), /DESTINATION_ARRIVAL_REQUIRED/);
  const arrived = dispatchOriginAction(s, {
    actionId: 'arrive-1', actorRef: 'fixture:human-1',
    kind: 'ARRIVE', at: '2026-09-21T14:12:00.000Z',
  }).session;
  const receipt = buildCrossingReceipt(arrived);
  assert.ok(receipt.sourceDepartureReceiptRef);
  assert.ok(receipt.destinationArrivalReceiptRef);
  assert.ok(receipt.unresolvedRefs.includes('thread:bell-unresolved'));
  assert.equal(arrived.source.bell.sourceStatus, 'unresolved');
  assert.equal(arrived.party.anchorRef, s.party.anchorRef);
});
test('interrupted arrival has no success receipt and retry does not duplicate departure', () => {
  const s = advanceThroughDeparture(createOriginSession(createFirstCrossingFixture()));
  const interrupted = dispatchOriginAction(s, {
    actionId: 'arrive-fail', actorRef: 'fixture:human-1',
    kind: 'ARRIVE', at: '2026-09-21T14:12:00.000Z',
  }, { arriveForeignRoom: () => { throw new Error('fixture:transport-error'); } }).session;
  assert.equal(interrupted.crossingStatus, 'FAILED');
  assert.equal(interrupted.containerEvents.some(e => e.kind === 'crossing.sealed'), false);
  const recovered = dispatchOriginAction(interrupted, {
    actionId: 'recover-1', actorRef: 'fixture:human-1',
    kind: 'RECOVER', at: '2026-09-21T14:13:00.000Z',
  }).session;
  assert.equal(recovered.source.localEvents.filter(e => e.kind === 'porch.departed').length, 1);
  assert.equal(recovered.destination.localEvents.filter(e => e.kind === 'party.arrived').length, 1);
});
~~~

- [ ] **Step 2: Run RED.** Run node --test tests/origin-crossing.test.js. Expected: Crossing receipt/recovery missing.
- [ ] **Step 3: Implement staged crossing.** DEPART requires confirmed admission; records source-local departure once. ARRIVE requires source departure and destination admission; records destination-local arrival once and updates party world location only after destination receipt exists. SEAL requires both receipts and the exact transfer manifest. The container stores refs/status, not full source/destination history as authoritative facts.
- [ ] **Step 4: Implement explicit incomplete outcomes.** Destination refusal -> REFUSED without source departure; unresolved admission -> HELD; an ARRIVE exception from optional injected { arriveForeignRoom } adapter -> FAILED with departure ref retained (the fixture's error is a recorded failure, not thrown past the coordinator). The production default uses the destination-local arriveForeignRoom function; the injection exists only for deterministic failure testing. RECOVER may retry arrival only against the identical admitted bundle, destination and confirmation; it must not backdate, erase or reissue departure. CANCEL is invalid after departure. PARTIAL must list exact members/items that crossed.
- [ ] **Step 5: Seal bounded receipt and worldline.** Include all eight named receipt categories, per-item ADMIT/REFUSE/HOLD/TRANSFORM, unchanged party Anchor, prior crossing ref, evidence scope and non-claims. Hash canonical receipt body. verifyCrossingReceipt rejects missing/mismatched local receipt refs, absent confirmation, duplicate item disposition, or changed party ID. No unspecified semantic proof is claimed by hash validity.
- [ ] **Step 6: Run GREEN/regression and commit.** Run node --test tests/origin-crossing.test.js && npm test. Commit: feat(origin): seal first sovereign crossing and recovery.

### Task 7: Origin-only persistence and worldline replay

**Files:** Create src/origin/storage.js and tests/origin-persistence.test.js.

**Interfaces:** serializeOriginSession(session) -> JSON string; parseOriginSession(json) -> validated session or throws; replayOriginSession(session) -> detached source, destination, party, container projections.

- [ ] **Step 1: Write failing round-trip and corrupt-data tests.** Import completeFirstCrossingFixture from tests/helpers/origin-sequence.js, plus the new storage exports. This uses the Task 6 helper, not the Task 9 specimen runner.

~~~js
test('reload preserves worlds separately and does not replay the knock', () => {
  const complete = completeFirstCrossingFixture();
  const restored = parseOriginSession(serializeOriginSession(complete));
  assert.deepEqual(replayOriginSession(restored), replayOriginSession(complete));
  assert.equal(restored.source.localEvents.filter(e => e.kind === 'knock.heard').length, 1);
  assert.equal(restored.destination.localEvents.filter(e => e.kind === 'meal.started').length, 1);
  assert.equal(restored.destination.localEvents.filter(e => e.kind === 'party.arrived').length, 1);
});
test('corrupt Origin history fails visibly and never resets the writer world', () => {
  assert.throws(() => parseOriginSession('{"schemaVersion":"99"}'), /ORIGIN_SCHEMA_UNSUPPORTED/);
  assert.throws(() => parseOriginSession('{broken'), /ORIGIN_PARSE_ERROR/);
});
~~~

- [ ] **Step 2: Run RED.** Run node --test tests/origin-persistence.test.js. Expected: storage module missing.
- [ ] **Step 3: Implement versioned detached serialization.** Use origin/0.1 schema with separate source/destination local histories, container history and minimal party projection. Import/reuse the portable hashRecord implementation from Task 1; never import node:crypto into browser-reachable production code. Validate unique IDs, valid references, event hashes, completed crossing receipt linkage and per-item transfer dispositions before returning restored state. On malformed data throw explicit errors; do not silently create a fresh world.
- [ ] **Step 4: Add immutability/replay tests.** Mutating an exported session object cannot mutate original; same session serialized twice is byte-identical; no replay creates fresh Bell, Knock, meal or arrival; no WORLDSEED createWorld/parseWorld or writer localStorage key is used.
- [ ] **Step 5: Run GREEN and commit.** Run node --test tests/origin-persistence.test.js && npm test. Commit: feat(origin): resume a crossing without rewriting worlds.

### Task 8: Minimal playable screen-door scene

**Files:** Create origin/index.html, origin/app.js, origin/styles.css and tests/origin-scene.test.js.

**Interfaces:** Browser imports createFirstCrossingFixture(), createOriginSession(), dispatchOriginAction(), serializeOriginSession(), parseOriginSession(); uses storage key static-collective:origin-first-crossing-001, distinct from WORLDSEED writer key.

- [ ] **Step 1: Write failing isolated-scene test.**

~~~js
test('first-crossing scene is a Porch threshold, not a world selector', async () => {
  const html = await readFile(new URL('../origin/index.html', import.meta.url), 'utf8');
  const app = await readFile(new URL('../origin/app.js', import.meta.url), 'utf8');
  assert.match(html, /THE PORCH/);
  assert.match(html, /screen door/i);
  assert.match(html, /FICTIONAL SPECIMEN/);
  assert.doesNotMatch(html, /select universe|level select|choose world/i);
  assert.match(app, /dispatchOriginAction/);
  assert.doesNotMatch(app, /\bfetch\s*\(/);
  assert.match(app, /static-collective:origin-first-crossing-001/);
});
~~~

- [ ] **Step 2: Run RED.** Run node --test tests/origin-scene.test.js. Expected: missing Origin scene.
- [ ] **Step 3: Build a separate local scene.** Start at a plain Porch with repaired screen door, the knock, unresolved Bell note and small party rail. Expose only actions currently allowed by the engine: inspect threshold / OPEN / review proposed bundle / see mixed admission / confirm crossing / depart / enter / inspect arrival. Render FOREIGN ROOM with its previously half-finished meal and the line "You are late to something." Provide small visible fixture and non-claims labels without a lore dump or global world menu.
- [ ] **Step 4: Wire the same engine without browser authority.** UI may dispatch named actions and render state; it may not fabricate receipts, permit an unavailable transition, or decide destination admission. Persist only Origin-owned state under the dedicated key; malformed saved state displays a recoverable error with explicit reset choice, not a silent reset.
- [ ] **Step 5: Run GREEN and writer-regression tests.** Run node --test tests/origin-scene.test.js tests/interface.test.js && npm test. Commit: feat(origin): inhabit the first screen-door crossing.

### Task 9: Deterministic specimen, documentation and constitutional audit

**Files:** Create src/origin/specimen.js, scripts/origin-first-crossing-001.js, tests/origin-specimen.test.js, examples/origin-first-crossing-001/expected-receipt.json, docs/protocol/origin-first-crossing-001.md. Modify package.json to add demo:origin script and README.md to link the separate fixture scene.

**Interfaces:** runFirstCrossingFixture() -> { session, receipt, actionTrace }; CLI calls it with no duplicate story rules.

- [ ] **Step 1: Write failing deterministic acceptance test.**

~~~js
test('two independent First Crossing runs match and preserve mixed admission', () => {
  const a = runFirstCrossingFixture();
  const b = runFirstCrossingFixture();
  assert.deepEqual(a.receipt, b.receipt);
  assert.equal(a.session.party.currentWorldRef, 'foreign-room-seed-001');
  assert.equal(a.session.source.bell.sourceStatus, 'unresolved');
  assert.equal(a.session.destination.meal.status, 'half-finished');
  assert.equal(a.receipt.admittedItemRefs.includes('static-field:charge'), false);
  assert.ok(a.receipt.heldItemRefs.includes('static-field:resonance-interpretation'));
  assert.ok(a.receipt.nonClaims.includes('does_not_resolve_bell_cause'));
});
~~~

- [ ] **Step 2: Run RED.** Run node --test tests/origin-specimen.test.js. Expected: specimen runner missing.
- [ ] **Step 3: Implement fixed action trace and CLI.** Use one fixed human actor, fixed action IDs, fixed UTC timestamps; call the same coordinator for DETECT, OPEN, REQUEST_ADMISSION, CONFIRM, DEPART, ARRIVE and SEAL. Export exactly the receipt and action trace; the CLI only prints statuses/refs/hash. Add demo:origin = node scripts/origin-first-crossing-001.js. Do not assert an actual STATIC FIELD runtime artifact was integrated.
- [ ] **Step 4: Freeze expected receipt and write protocol.** Compare the full generated receipt to the checked-in JSON fixture, including fixture provenance, local departure/arrival refs and non-claims. Document how to run npm test, npm run demo:origin and serve origin/index.html locally; explain real adapter verification is deferred and why FOREIGN ROOM is not Paula/HOME.
- [ ] **Step 5: Run whole-repository tests and repeatability check.** Run npm test, then npm run demo:origin twice into separate files and compare byte-for-byte. Ensure existing WORLDSEED tests remain green. Scan src/origin and origin for network calls, implicit canon/authority promotion, Date.now/Math.random in deterministic paths, copied private memory, and world-select menu labels.
- [ ] **Step 6: Review all twenty spec invariants and commit fixes.** A fresh review must inspect the source/destination history boundary, receipt structure, failed-arrival recovery and fixture provenance. Commit: feat(origin): close ORIGIN-FIRST-CROSSING-001. Do not claim a live STATIC FIELD integration or a production cross-world authority plane.

## Self-review / intentional exclusions

**Spec coverage in the first crater:** World/Gate/Party/Worldline/TransferBundle/Crossing are distinguishable; one synthetic STATIC FIELD source and one independently advancing FOREIGN ROOM; the detected Gate, locally chosen OPEN, destination-specific mixed admission, separate human confirmation, local departure/arrival, scoped CrossingReceipt, persistence, failure recovery and story-first UI are executable.

**Deferred as explicit future work:** a live STATIC FIELD adapter and verified FirstBell receipt; a separately authored HOME world; multi-party networking; generic Coderooms; a PostEmahh'n capability adapter; arbitrary world return simulation; multi-world collision scenes; long-running offscreen world simulation; multi-clock runtime beyond typed refs; real consent/authentication services. Their contracts are not silently claimed by the synthetic proof.

**Type/name audit:** the only container action kind union is DETECT, OPEN, REQUEST_ADMISSION, CONFIRM, CANCEL, DEPART, ARRIVE, SEAL, RECOVER. Each adapter returns namespaced local receipts. Worldline contains crossing refs, never a copy of world histories. The synthetic source tag must accompany any fixture receipt throughout the pipeline.

**Review-focus audit:** Task 2 rejects forged live input; Task 4 checks item leakage; Task 6 checks interruption/retry; Tasks 3 and 5 check Gate/confirmation replay; Tasks 2, 7 and 8 check persistence and independent world continuity.

**Execution recommendation:** Native execution with test-first gates unless a real independent subagent interface becomes available. The nine tasks depend sequentially on the same small event contract; preserve the design branch until review and do not merge merely because the deterministic fixture passes.
