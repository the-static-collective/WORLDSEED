# ORIGIN-CONTAINER-001 — Competing Branch Composition Review

**Date:** 2026-09-21  
**Status:** source-backed research / review note; no donor branch merged; no live adapter claimed.  
**Origin design branch:** design/origin-container-001

## Inspected branch heads

- STATIC FIELD PR #1, feat/static-field-first-bell-001, head 59d6adff7cc48de57340dc5c924bd26646105d41: https://github.com/the-static-collective/static-field/pull/1
- Full Measure GRACE-001 PR #33, feature/grace-001-worldseed, head df1f20702012cd4e14a279e05d1a47a8255a40b9: https://github.com/the-static-collective/full-measure-world-layer/pull/33
- Separate GRACE-MERCY-BROKEN-PROMISE-001 branch feat/grace-mercy-broken-promise-001 is intentionally preserved/unmerged. Do not fold its dual-sheet event store into the Grace campaign without a dedicated adapter review.
- WORLDSEED's existing worldseed-v0.1-first-seed branch mostly carries the author-facing v0.1 already present on main; do not use it as a second Origin runtime source.

## 1. STATIC FIELD — source world owner, not a duplicate fixture author

Observed in branch code:

- src/first-bell/reducer.ts emits append-only PORCH_ARRIVAL, two BELL_OCCURRENCE events, optional OPEN_CORNER_NOTICED and RESONANCE_RELATION_TRACED, one KNOCK_OCCURRENCE and FIRST_BELL_PLAY_CLOSED.
- src/first-bell/receipts.ts already derives FirstBellPlayReceipt with receiptType, eventId, receiptId, sourceStatus, secretNoticed, relationTraced.
- src/cli/first-bell.ts exports history.jsonl and named receipt JSON files; fixtures/first-bell/expected-receipts.json pins deterministic fixture IDs.
- src/world/gates.ts currently derives a detected-but-unopened, unauthorized Gate only after RESONANCE_RELATION_TRACED. Its gateId is derived by stableId and its from path is static-field/worldseed-001/the-porch; it has unresolved destination, opening authority and transfer policy.
- src/world/party.ts derives partyId party/first-bell, point character, arrival-event Anchor and Charge. Its Anchor is not the proposed PostEmahh'n card and its source local Charge is not portable.
- src/server/routes.ts currently exposes GET /api/state, GET /api/history and POST /api/action, but no source-owned OPEN, offer, departure or export-adapter API.

**Composition value:** Origin's source adapter should be a translation of those established events/receipts, not a replacement story. Retain source local IDs and unresolved statuses; introduce a separate adapter-local offer/departure extension only after STATIC FIELD authorizes that contract. A detected Gate is neither an open Gate nor destination admission.

**First-crater rule:** The Origin fixture remains visibly synthetic; it may use structurally compatible sample source IDs, but it must not present a copied CLI specimen as a live player receipt. If a live bridge is later built, it must validate the source's event/receipt lineage, author-declared adapter authority, current local history, and required party consent. Origin cannot simply POST 'OPEN' to the current STATIC FIELD API, because that action is not accepted by its current action union.

**Important seam:** The source Gate currently requires a traced Resonance relation. A valid First Bell playthrough that misses the clue may end without any Gate. Origin must allow that outcome and must not auto-create the missing relation to force story progression.

## 2. GRACE-001 — candidate destination world, not a reskinned FOREIGN ROOM

Observed in branch code:

- specimens/grace-001/session.ts defines full-measure.grace-session.v1, appendEvent and deterministic replaySession with local focus, economy, dream, Upper Room, card, party, flashback, archaeology and delayed-world-response events.
- specimens/grace-001/dayReceipt.ts exports full-measure.grace-day-receipt.v1 with session, replay checksum, unresolved demand and explicit non-claims. Its fnv1a32 checksum is a corruption/replay witness, not a cryptographic signature or external-authority proof.
- specimens/grace-001/meaning.ts defines full-measure.portable-card.v1 with a parent-source card, offeredBy/offeredTo, explicit lineage and non-claims; seedDescendantFromEnvelope preserves ancestry while explicitly not proving physical transfer.
- specimens/grace-001/apertures.ts exposes authored party prompts, flashbacks as later reflection without source rewrite, and a hypothetical Grace house that does not become present-world supply.
- specimens/grace-001/worldseed.json has schema full-measure.grace-worldseed.v0. It is an experimental Full Measure game seed, not a WORLDSEED v0.1 author-document and not a production Origin WorldManifest.

**Composition value:** The Grace campaign can later publish a WorldManifest and local Gate/admission adapter that references its own deterministic session and Day Receipt. Origin can carry a receipt reference, an explicitly offered portable card envelope, a limited party relation and open Thread. Grace's local time/cash/food/transport/attention, party choices, human relationships, player-specific memory and local world events remain under Grace's own rules. A card envelope may be received/declined as a local seed; it is not a PostEmahh'n card by nominal similarity.

**First-crater rule:** Keep FOREIGN ROOM // SEED-001 as a neutral adapter fixture. Do not silently replace it with GRACE-001: that would pre-author Grace's arrival conditions and conflate a mature campaign with a transport test. Grace joins in a second bounded adapter slice only when its author declares WorldManifest, transfer rules, privacy/consent and arrival behavior.

## 3. Three different continuity / replay semantics

- STATIC FIELD receiptId: canonical derived identity over a source event/body, backed by source-local event history.
- GRACE-001 Day Receipt replayChecksum: deterministic replay-corruption witness, explicitly not a signature.
- ORIGIN CrossingReceipt: a bounded container-local link between source Departure and destination Arrival; its hash cannot upgrade either donor's authority.

Never normalize all three into one generic "verified receipt" boolean. Preserve sourceSystem, schema, branch/commit if using a fixture, receipt ref, epistemic scope and locally admitted disposition.

## 4. Changes to the Origin implementation approach

1. In the first-crater source fixture, declare its relation to STATIC FIELD PR #1 as 'compatible synthetic specimen'; do not claim it directly consumes verified live state.
2. Add a donor-parity test for the shape of FirstBellPlayReceipt and unresolved Bell/Knock; include a test that missed-secret state cannot magically produce a detected source Gate.
3. Preserve source Gate ID mapping (origin alias SCREEN-DOOR-001 versus STATIC FIELD's derived gateId). Record both with explicit mapping refs; never replace the source receipt's actual ID with a made-up string.
4. Add an explicit interoperability test that a GRACE-001 Day Receipt and portable-card envelope are not generic Origin manifests and cannot be blindly imported as Transfer Bundles.
5. Make GRACE-001 the first *candidate real destination adapter* following FOREIGN ROOM, not a dependency blocking completion of the fictional first crossing.
6. Make dual-sheet Grace/Mercy composition a separate source-controlled adapter change after both the original Grace campaign branch and the Mercy branch have been reconciled by Full Measure's maintainers.
7. Keep both source branches unmerged; bring in their contracts through read-only, pinned references first. CI reports from the PR are historical claims until exact head status is separately verified.

## First-crossing story impact

STATIC FIELD still ends on the knock.

The player may inspect the screen door if local state supports the relation.

An Origin Gate offer can be proposed only after source-local consent to the extension.

FOREIGN ROOM still says "You are late to something."

The party crosses with one anchored Thread and selected references, not all of either world's data.

**Finding:** There is composition value in both branches, but neither is a replacement for ORIGIN's job. STATIC FIELD gives it an authentic starting history; GRACE-001 gives it a substantially inhabited future destination. ORIGIN supplies the handshake between them.
