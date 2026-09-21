# ORIGIN-COMPOSITION-003 — Native First Bell intake (review-only)

Status: **stacked experimental candidate** on WORLDSEED PR #3 (which is stacked on draft #2). No PR here is merged by this change. No cross-world action is claimed.

## Exact seam

STATIC FIELD `feat/static-field-first-bell-001@59d6adff7cc48de57340dc5c924bd26646105d41` writes a native `history.jsonl` and receipts. WORLDSEED previously began its Origin scene with a separately invented, explicitly synthetic Porch fixture. This composition imports the **native export format as read-only evidence** and issues one deterministic review candidate. The new intake never rewrites the donor events and does not replace WORLDSEED's existing synthetic Origin session.

The local inspector checks every native event's STATIC FIELD canonical ID, complete single-parent chain, chronological order, two unresolved Bells, unresolved Knock, unique closure, open-corner/Resonance ordering, and native arrival/Bell/play/relation receipts against the referenced events. Missing the clue is a legitimate `HOLD_NO_TRACED_RELATION` result, not a failed play.

The output has a stable `candidateId`, the native source digest, source play and Bell refs, `CANDIDATE_UNOPENED` (or a hold), and explicit `NOT_REQUESTED`, `NOT_TRANSFERRED`, and `NOT_RECORDED` statuses. Hashes detect inconsistency; they do **not** authenticate who authored an offline file. The hardcoded donor commit is a declared compatibility pin, not remote attestation. A changed real source requires a reviewed contract update.

## Use in a branch-based workspace

1. Check out STATIC FIELD PR #1's head, install its Node dependencies, then run `npm run demo:first-bell -- --out out/first-bell`. That CLI creates `history.jsonl` and its own JSON receipt files.
2. Check out **this WORLDSEED branch**. With Node 22+, run `npm test`, then `node scripts/compose-first-bell.js --from /path/to/static-field/out/first-bell --out out/composition-candidate.json`.
3. Or serve WORLDSEED's repository root with a local static server and open `/origin/compose.html`. Select `history.jsonl` and the native `*-receipt.json` files together. The desk reads them locally and can save the review candidate. It does not upload them or use localStorage.
4. The nearby `/origin/` Crossing remains a **separate synthetic demo**. Opening it does not import this candidate or resume the donor's party.

## Next executable boundary

To move beyond inspection, STATIC FIELD must own a source-side contract for `OPEN` and `DEPART` anchored in an actual donor history. WORLDSEED must validate an explicit party/Anchor binding, evaluate a destination-owned entry policy, obtain human confirmation, and emit both independent departure and arrival receipts before sealing a Crossing. Until then the candidate is strictly review-only. The Foreign Room table and subsequent Grace candidate remain independent fixture gameplay, not imported personal or world state.

Sources: STATIC FIELD PR #1; WORLDSEED PRs #2 and #3; optional Workbench STATIC-ARG-001 `/arg` is an onboarding doorway, **not** a source of world admission or identity.
