# WORLDSEED v0.1 — First Seed Design

Status: accepted architecture / first executable slice

## Purpose

WORLDSEED is a local-first world-memory tool for writers whose creative worlds are grounded in history, culture, factual reality, and deliberate invention.

The author should experience a soft wiki-like surface. The system may preserve richer graph structure underneath, but the author is never required to learn graph theory, eCODE vocabulary, or a formal ontology before writing.

## Constitutional boundary

> **WORLDSEED owns no world. A world belongs to its author. WORLDSEED only helps it become addressable.**

WORLDSEED must not silently upload, publish, rank, rewrite, canonize, or assimilate an author's material. The repository contains the tool, not anyone's private world.

## v0.1 promise

The first seed supports six verbs:

1. **Capture** — create an addressable world entry.
2. **Link** — declare a typed relation between two entries.
3. **Source** — attach provenance to an entry.
4. **Contradict** — preserve unresolved incompatibility without repairing it.
5. **Wander** — enter one entry and inspect immediately connected material.
6. **Export** — download the complete world as portable JSON.

## Data model

A world document is plain JSON with four top-level collections:

- `nodes`: people, places, events, objects, institutions, cultures, motifs, notes, and other author-named things;
- `edges`: typed relations between nodes;
- `sources`: provenance records attached to nodes;
- metadata describing the world and schema version.

Each node carries an explicit epistemic state. v0.1 states are:

- `historical-fact`
- `sourced-interpretation`
- `fictional-canon`
- `possibility`
- `contradiction`
- `unknown`

These states are author declarations, not machine verdicts.

Relations are open-vocabulary strings such as `born-in`, `witnessed`, `opposed`, `descended-from`, `located-near`, `caused`, `possibly-knew`, `appears-in`, `contradicts`, or `echoes`. WORLDSEED does not ship a universal relation ontology in v0.1.

## Wiki-over-graph rule

Free text may contain `[[Wiki Links]]`. v0.1 extracts these names and preserves them as mention relations while keeping the original prose unchanged. Missing targets may exist as lightweight stubs until the author fills them in.

A stub's first mention establishes its durable address. When the author later captures that named thing directly, WORLDSEED fills the existing stub in place rather than creating a duplicate, so prior links keep pointing to the same world object.

The wiki page is therefore a projection over a graph, not the graph's master ontology.

## Local-first rule

The executable v0.1 has no backend and no network requirement. It stores the active world in browser local storage and can export the entire world as JSON. Refreshing the page must preserve the world in the same browser profile.

No cloud sync, accounts, telemetry, collaboration, or remote AI calls are part of v0.1.

## Contradiction discipline

Contradiction is preserved as information. A contradiction relation must not automatically choose a winner, merge the claims, or rewrite either node.

A contradictory claim may also carry the node epistemic state `contradiction` when the author wants the uncertainty visible at the node level.

## Writer-facing interface

One page contains:

- a prominent capture form headed **“What entered the world?”**;
- a world shelf listing entries;
- relation, source, and contradiction controls using existing entries;
- a focused wander panel showing the selected entry and its immediate incoming/outgoing relations;
- an export control;
- a compact privacy statement explaining that the active world remains in this browser unless exported.

The interface should feel like a field notebook or small archive, not a database administration console.

## Non-goals

v0.1 explicitly does not include:

- AI prose generation or story completion;
- automatic canon decisions;
- global ontology design;
- login/accounts;
- server storage;
- collaboration;
- semantic search;
- graph visualization;
- timeline/map generation;
- eCODE terminology in the writer-facing UI.

## Interoperability

The JSON export is intentionally explicit and boring. Future Free Graph/eCODE adapters may consume it, but WORLDSEED v0.1 has no runtime dependency on Free Graph or any other Static Collective project.

## Acceptance witness

A valid v0.1 witness can:

1. serve the repository as a static site and open it in a modern browser;
2. create two entries with different epistemic states;
3. create a typed relation between them;
4. attach a source to one entry;
5. preserve a contradiction between two entries;
6. refresh and recover the same world locally;
7. wander from one entry to connected material;
8. export a JSON document containing the authored nodes, edges, and sources;
9. do all of the above without a network request from the application.
