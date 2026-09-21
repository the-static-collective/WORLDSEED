# FOREIGN ROOM / THE WORLD ANSWERS — NATIVE PLAY UX 005

Status: local, opt-in visual scene on a branch stacked above WORLDSEED draft PR #5 → #4 → #3 → #2. It does **not** merge or change the older synthetic `/origin/` browser game or STATIC FIELD's source-authorized runtime.

## Run it

The new `/origin/live.html` is a mobile-responsive Foreign Room. The CSS illustration and story change according to **existing** destination-owned Table actions: take the seat or remain at the door, listen, inspect an address or let it rest. The UI displays only currently legal moves and puts source/crossing receipts behind a disclosure. The reported Grace address remains DETECTED, unopened, unauthorized, and unadmitted. There is no invented second crossing.

The page does **not** manufacture a live arrival. First use the complete source-and-destination local crossing described in `docs/protocol/origin-real-source-crossing-004.md`. In that document's final WORLDSEED `--phase arrive` command, add:

```sh
  --carrier /tmp/breach/play-carrier.json
```

With the WORLDSEED repository root served by a local static HTTP server (for example `python3 -m http.server 8000 --bind 127.0.0.1`), visit `http://127.0.0.1:8000/origin/live.html`, select `play-carrier.json`, then play.

The carrier holds the **native offered and departed source histories**, source receipt files, destination admission and player confirmation, and the destination arrival timestamp. Browser import invokes `arriveNativeCrossing` again against those same inputs and refuses incompatible/edited native histories or mismatched receipts before presenting the scene. Each subsequent Table choice is rederived in order through the destination reducer and checked against its local receipt. `Save this chapter` downloads a portable carrier containing the original source evidence and the new local choices. Open that saved file to resume. Nothing is auto-uploaded or persisted in localStorage.

**Privacy:** A saved carrier contains its source game evidence and chosen timestamps, including local actor IDs and anything explicitly written into the source game events. Keep the file private if that content is private. A content hash proves internal consistency, not a real person's identity, ownership, consent or source trustworthiness. The browser scene's logical timestamps advance past imported fixture timestamps even when the device clock is earlier; they are gameplay ordering, not real-world witness timestamps.

## Intentional limits

- Not a hosted or authenticated multiplayer environment, and not an automatic bridge into Workbench/Full Measure.
- The original `/origin/` browser scene remains a *separate synthetic fixture*; the new `/origin/live.html` consumes the native play carrier only.
- The browser verifies an incoming entire native carrier; it does not accept an isolated `arrived.json` as sufficient proof of source history.
- This is a local visual/story interface with CSS scenery, not a graphical real-browser smoke-test claim; CI covers the native CLI file handoff and carrier replay. Review actual mobile and desktop graphics before promotion.
- Saving and reopening a carrier resumes the local choices, not the running STATIC FIELD web server's persistence.
