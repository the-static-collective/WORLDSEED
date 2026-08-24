# WORLDSEED v0.1 First Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the smallest local-first WORLDSEED that lets a writer capture, link, source, contradict, wander, persist, and export a world without learning a formal ontology.

**Architecture:** A dependency-free static browser app sits over a pure JavaScript world-document module. The domain module owns schema creation, node/edge/source mutation, wiki-link extraction, neighborhood lookup, and export. A thin DOM layer persists the world in `localStorage` and renders one-page writer controls.

**Tech Stack:** HTML5, CSS, ECMAScript modules, browser `localStorage`, Node.js built-in test runner, GitHub Actions.

**Spec:** `docs/design.md`

## Global Constraints

- WORLDSEED owns no world; the author owns authored world data.
- No backend, remote AI calls, telemetry, accounts, or network dependency in v0.1.
- Writer-facing UI must not require eCODE or graph vocabulary.
- Epistemic states are author declarations, never machine verdicts.
- Contradictions remain unresolved unless the author changes them.
- Relation types remain open-vocabulary strings.
- Export must contain the complete authored world as plain JSON.

---

### Task 1: Domain Contract and Red Test

**Files:**
- Create: `package.json`
- Create: `.github/workflows/test.yml`
- Create: `tests/world.test.js`
- Create later in GREEN: `src/world.js`

**Interfaces:**
- Produces: `createWorld`, `captureNode`, `addRelation`, `addSource`, `addContradiction`, `getNeighborhood`, `extractWikiLinks`, `exportWorld`.

- [ ] **Step 1: Add Node test runner configuration and CI.**

`package.json` uses ESM and `node --test tests/*.test.js`.

- [ ] **Step 2: Write failing domain tests.**

Tests must prove: world creation; wiki-link extraction; stub creation for `[[links]]`; typed relation preservation; source attachment; contradiction preservation; immediate-neighborhood lookup; deterministic JSON round-trip shape.

- [ ] **Step 3: Run tests and verify RED.**

Run: `npm test`

Expected: FAIL because `src/world.js` does not yet exist.

- [ ] **Step 4: Implement the minimal pure domain module.**

`src/world.js` must export the interfaces above and perform no DOM or storage work.

- [ ] **Step 5: Run tests and verify GREEN.**

Run: `npm test`

Expected: all domain tests PASS with no warnings.

### Task 2: Local Persistence Contract

**Files:**
- Modify: `tests/world.test.js`
- Modify: `src/world.js`

**Interfaces:**
- Produces: `serializeWorld(world): string` and `parseWorld(json): World`.

- [ ] **Step 1: Add failing tests for serialization and malformed input.**

A serialized world must round-trip without losing nodes, edges, sources, schema version, or world title. Malformed JSON must return a fresh world rather than throw into the UI.

- [ ] **Step 2: Run tests and verify RED.**

Expected: FAIL because the serialization helpers do not exist.

- [ ] **Step 3: Implement minimal serialization helpers.**

- [ ] **Step 4: Run tests and verify GREEN.**

### Task 3: Writer-Facing One-Page Shell

**Files:**
- Create: `tests/interface.test.js`
- Create later in GREEN: `index.html`
- Create later in GREEN: `styles.css`
- Create later in GREEN: `src/app.js`

**Interfaces:**
- Consumes: all Task 1/2 domain functions.
- Produces: one static page with capture, shelf, relation, source, contradiction, wander, export, and privacy surfaces.

- [ ] **Step 1: Write failing interface smoke tests.**

The test reads `index.html` and asserts visible copy/control hooks for: `What entered the world?`, `Capture`, `Link`, `Source`, `Contradict`, `Wander`, `Export World`, and the local-only privacy statement.

- [ ] **Step 2: Run tests and verify RED.**

Expected: FAIL because `index.html` does not yet exist.

- [ ] **Step 3: Implement `index.html`, `styles.css`, and thin `src/app.js`.**

The app must: load a world from `localStorage`; save after every mutation; render all existing nodes into selectors and shelf; keep the selected node visible in Wander; download export JSON via a Blob URL; never make a network request.

- [ ] **Step 4: Run all tests and verify GREEN.**

Run: `npm test`

Expected: all tests PASS.

### Task 4: Example Witness and Readme Handoff

**Files:**
- Create: `examples/tiny-world.json`
- Modify: `README.md`

**Interfaces:**
- Produces: a fully fictional example world and exact launch/use instructions.

- [ ] **Step 1: Create a tiny fictional specimen with two nodes, one relation, one source, and one unresolved contradiction.**

- [ ] **Step 2: Update README with local launch instructions (`python -m http.server` or equivalent static server), constitutional boundary, v0.1 verbs, and privacy/export behavior.**

- [ ] **Step 3: Run `npm test` again.**

Expected: PASS.

### Task 5: Review Gate

**Files:** none

- [ ] **Step 1: Open a draft pull request from `worldseed-v0.1-first-seed` to `main`.**

- [ ] **Step 2: Inspect the complete diff and CI status.**

- [ ] **Step 3: Leave the PR draft and unmerged for human review.**
