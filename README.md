# WORLDSEED

> **WORLDSEED owns no world. A world belongs to its author. WORLDSEED only helps it become addressable.**

WORLDSEED is a local-first, writer-facing world-memory tool for capturing people, places, events, sources, contradictions, motifs, and relationships without requiring the author to learn a formal ontology.

It is meant to feel more like a field notebook or small personal wiki than a database. The graph stays underneath. The author stays in charge.

## First Seed — v0.1

The first executable slice has six verbs:

- **Capture** — write an entry in ordinary language. `[[Wiki Links]]` quietly create addressable connections and lightweight stubs.
- **Link** — declare an open-vocabulary relationship between two entries.
- **Source** — attach provenance without changing the claim it supports.
- **Contradict** — preserve two incompatible entries without choosing a winner.
- **Wander** — enter one thing and inspect its immediate relationships and sources.
- **Export** — download the complete world as plain JSON.

Each entry carries an author-declared epistemic state: historical fact, sourced interpretation, fictional canon, possibility, contradiction, or unknown. These are labels supplied by the writer, not machine verdicts.

## Run it locally

WORLDSEED has no build step and no dependencies. Because the browser app uses JavaScript modules, serve the repository as a small static site rather than opening `index.html` directly.

With Python installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

Your active world is stored in that browser's `localStorage`. WORLDSEED v0.1 has no backend, login, cloud sync, telemetry, or remote AI calls.

**Export your world before clearing browser data or moving to another computer.** The export is a portable `.worldseed.json` file containing the complete world document.

## Privacy and ownership

The software repository is public. An author's world is not.

Author-created worlds should remain private/local by default and should not be committed to this repository. WORLDSEED does not claim artistic, factual, or constitutional authority over material entered into it.

## Tiny witness

`examples/tiny-world.json` is a deliberately fictional specimen showing two incompatible claims, a typed relation, a source record, and an unresolved contradiction. It exists only to demonstrate the portable format.

## Development

Run the dependency-free test suite with:

```bash
npm test
```

Design: `docs/design.md`

Implementation plan: `docs/superpowers/plans/2026-08-24-first-seed.md`

## Not in v0.1

No AI co-authoring, automatic canon decisions, global ontology, accounts, collaboration server, semantic search, graph visualization, timeline generation, or map generation. Those may be explored later only if they preserve the author-first boundary.

## ORIGIN-FIRST-CROSSING-001 — separate fictional specimen

ORIGIN is a separate, local-first crossing experiment under `origin/` and `src/origin/`. Its source input is a **synthetic** First Bell fixture compatible with the STATIC FIELD PR #1 receipt shape; it does not read or certify a live STATIC FIELD player's history. FOREIGN ROOM is a neutral destination fixture, not Grace/HOME.

Run `npm test` and `npm run demo:origin`. To play the separate browser scene, serve this repository root with `python3 -m http.server 8000 --bind 127.0.0.1` and open `http://127.0.0.1:8000/origin/`. The Origin scene uses its own localStorage key and does not change this writer-facing notebook or its world documents.

The fixture proves Gate detection, locally chosen OPEN, destination-owned mixed admission, explicit human confirmation, separate source departure/destination arrival, bounded receipt, failed-arrival recovery, and unresolved Bell continuity. Live donor adapters require separately reviewed authority and consent. See `docs/protocol/origin-first-crossing-001.md`.
