# WORLDSEED v0.1 First Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build the smallest local-first WORLDSEED that lets a writer capture, link, source, contradict, wander, persist, and export a world without learning a formal ontology.

**Architecture:** A dependency-free static browser app sits over a pure JavaScript world-document module. The domain module owns schema creation, node/edge/source mutation, wiki-link extraction, neighborhood lookup, and export. A DOM adapter persists the world in `localStorage` and renders one-page writer controls.

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

- [x] **Step 1: Add Node test runner configuration and CI.**

`package.json` uses ESM and `node --test tests/*.test.js`.

- [x] **Step 2: Write failing domain tests.**

Tests prove: world creation; wiki-link extraction; stub creation for `[[links]]`; typed relation preservation; source attachment; contradiction preservation; immediate-neighborhood lookup; detached export shape.

- [x] **Step 3: Run tests and verify RED.**

Observed RED: `ERR_MODULE_NOT_FOUND` because `src/world.js` did not yet exist.

- [x] **Step 4: Implement the minimal pure domain module.**

`src/world.js` exports the domain interfaces and performs no DOM or storage work.

- [x] **Step 5: Run tests and verify GREEN.**

Observed GREEN in GitHub Actions.

### Task 2: Local Persistence Contract

**Files:**
- Modify: `tests/world.test.js`
- Modify: `src/world.js`

**Interfaces:**
- Produces: `serializeWorld(world): string` and `parseWorld(json): World`.

- [x] **Step 1: Add failing tests for serialization and malformed input.**

A serialized world round-trips without losing nodes, edges, sources, schema version, or world title. Malformed/incompatible JSON returns a fresh world rather than throwing into the UI.

- [x] **Step 2: Run tests and verify RED.**

Observed RED: `src/world.js` did not provide `parseWorld`.

- [x] **Step 3: Implement minimal serialization helpers.**

- [x] **Step 4: Run tests and verify GREEN.**

Observed GREEN in GitHub Actions.

### Task 3: Writer-Facing One-Page Shell

**Files:**
- Create: `tests/interface.test.js`
- Create later in GREEN: `index.html`
- Create later in GREEN: `styles.css`
- Create later in GREEN: `src/app.js`

**Interfaces:**
- Consumes: all Task 1/2 domain functions.
- Produces: one static page with capture, shelf, relation, source, contradiction, wander, export, and privacy surfaces.

- [x] **Step 1: Write failing interface smoke tests.**

The test reads `index.html` and asserts visible copy/control hooks for: `What entered the world?`, `Capture`, `Link`, `Source`, `Contradict`, `Wander`, `Export World`, and the local-only privacy statement. It also checks the browser adapter uses the domain API/localStorage and contains no `fetch()` call.

- [x] **Step 2: Run tests and verify RED.**

Observed RED: `index.html` did not yet exist while prior tests remained green.

- [x] **Step 3: Implement `index.html`, `styles.css`, and `src/app.js`.**

The app loads a world from `localStorage`; saves after every mutation; renders nodes into selectors and shelf; keeps the selected node visible in Wander; downloads export JSON via a Blob URL; and makes no application network request.

- [x] **Step 4: Run all tests and verify GREEN.**

Observed GREEN in GitHub Actions.

### Task 4: Example Witness and Readme Handoff

**Files:**
- Create: `examples/tiny-world.json`
- Modify: `README.md`

**Interfaces:**
- Produces: a fully fictional example world and exact launch/use instructions.

- [x] **Step 1: Create a tiny fictional specimen with two nodes, one relation, one source, and one unresolved contradiction.**

- [x] **Step 2: Update README with local launch instructions, constitutional boundary, v0.1 verbs, and privacy/export behavior.**

- [x] **Step 3: Run tests again.**

Observed PASS in GitHub Actions.

### Task 5: Finish-Gate Regression

During whole-slice review, one boundary bug was found: directly capturing a name that already existed as a `[[Wiki Link]]` stub created a second node rather than inhabiting the original address.

- [x] Add a failing regression proving a stub must retain identity when filled.
- [x] Verify RED: expected `stub-ada-vale`, received duplicate `ada-vale`.
- [x] Repair `captureNode` so first mention establishes the durable address and later direct capture fills it in place.
- [x] Verify regression GREEN and all prior tests still pass.

### Task 6: Review Gate

- [x] **Step 1: Open draft PR #1 from `worldseed-v0.1-first-seed` to `main`.**
- [x] **Step 2: Inspect the complete diff and CI status.**
- [x] **Step 3: Reconcile design/PR receipts with the implemented static-server requirement and regression history.**
- [x] **Step 4: Leave the PR draft and unmerged for human review.**

## Remaining manual witness

A rendered browser smoke on a publicly reachable preview has **not** been claimed. The connected Vercel account has no WORLDSEED project, and the available deployment action is context-free; infrastructure was deliberately left untouched rather than risk deploying the wrong workspace. The runtime also cannot clone GitHub directly for a local browser smoke because outbound DNS is blocked. Source-level interface contracts and CI are verified; visual/browser acceptance remains a human or correctly-scoped preview step.
