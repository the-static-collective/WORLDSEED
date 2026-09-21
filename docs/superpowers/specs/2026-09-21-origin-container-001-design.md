# ORIGIN-CONTAINER-001 — Design Constitution

Status: design constitution / review gate  
Date: 2026-09-21  
Repository: the-static-collective/WORLDSEED  
Branch: design/origin-container-001  
Runtime name: ORIGIN  
First executable story: ORIGIN-FIRST-CROSSING-001

> A world may join the story without surrendering its constitution.

## 0. Intent

ORIGIN is the meta-game container for THE CROSSING.

It exists to let distinct worlds participate in one continuing story without turning those worlds into levels owned by a master ontology.

ORIGIN owns no world.
ORIGIN owns no person.
ORIGIN does not rewrite a world's canon.

ORIGIN maintains only the container-local structures required to answer:

- which world the traveling party is presently in;
- what particular party arrived;
- what the party lawfully carried;
- which prior crossings occurred;
- what remains unresolved between worlds;
- which Gates are detectable;
- which world admitted or refused a proposed crossing;
- what receipts connect departure to arrival;
- what meta-story residue has accumulated across otherwise sovereign worlds.

Its central promise is:

> Continuity without absorption.

STATIC FIELD remains STATIC FIELD.
A future HOME / Paula world remains its own world.
Grace / Mercy remains its own character contract.
Upper Room remains its own interpretive space.
Dogram remains mathematics under Dogram's own laws.
PostEmahh'n remains authority for its own cards and ancestry.

ORIGIN composes the crossings among them.

## 1. Why this currently lives in WORLDSEED

WORLDSEED already has the correct constitutional foundation:

> WORLDSEED owns no world. A world belongs to its author. WORLDSEED only helps it become addressable.

ORIGIN extends the same posture from world addressability to world traversal.

WORLDSEED v0.1 remains a writer-facing memory/addressability tool.
ORIGIN is a separate runtime layer.

They must not be silently collapsed.

### Extraction rule

If ORIGIN later receives its own repository:

- this specification may move by reference;
- its source commit remains part of provenance;
- WORLDSEED does not become historical owner of worlds ORIGIN connects;
- ORIGIN does not retroactively absorb WORLDSEED authority.

## 2. Founding laws

### LAW 1 — No world is a level merely because it is traversable

A world may expose a Gate.

That does not make it a sub-map of ORIGIN.

The local world retains its own identity, laws, inhabitants, time model, narrative state, evidence rules, mechanics, admission policy, exit policy, privacy policy, interpretation boundaries, and continuation behavior.

### LAW 2 — Addressability is not authority

ORIGIN may know that a world exists and how to address an adapter for it.

That does not grant permission to mutate that world, adjudicate its canon, speak for its inhabitants, bypass Gate conditions, or convert local interpretation into universal fact.

### LAW 3 — Crossing is a handshake

A crossing is:

SOURCE WORLD
  offers bounded departure
        ↓
TRANSFER BUNDLE
        ↓
DESTINATION WORLD
  evaluates local admission
        ↓
PARTY CONFIRMATION
  where required
        ↓
DEPARTURE
        ↓
ARRIVAL
        ↓
CROSSING RECEIPT

The source cannot force destination admission.
The destination cannot rewrite source history.

### LAW 4 — What crosses retains source scope

A receipt remains a receipt from the system that issued it.

A PostEmahh'n card retains PostEmahh'n lineage.

A STATIC FIELD Resonance relation does not become historical fact merely because another world received it.

A Dogram derivation does not become narrative canon merely because it opened a Gate.

### LAW 5 — The party supplies continuity more strongly than the setting

Worlds may change completely while the party carries identity receipts, relationships, unresolved Threads, physical cards, entrusted objects, remembered knowledge, consequences, promises, and unanswered correspondence.

This is the Doctor-Who-style continuity rule.

### LAW 6 — Arrival is never the beginning of the destination world

The destination existed before the party arrived.

Its inhabitants may have prior history, commitments, relationships, events underway, absences, unresolved problems, private knowledge, and offscreen activity.

A crossing inserts the party into a local story.

This is the Quantum-Leap-style arrival rule.

### LAW 7 — Separate stories may collide without becoming one story

Two protagonists may encounter the same occurrence from different local charts.

ORIGIN may relate those charts.

It may not silently merge them into one omniscient narration.

This is the GTA-IV-style collision rule.

### LAW 8 — Meta-story arrives as residue before exposition

The deeper pattern first appears through recurring particulars, Gate residue, shared ancestry, correspondence, repeated motifs, objects appearing in different worldlines, and local stories touching the same event.

No universal lore lecture is required.

This is the Kingdom-Hearts-II-style meta-story rule.

## 3. Container topology

ORIGIN distinguishes six objects:

WORLD
GATE
PARTY
WORLDLINE
TRANSFER BUNDLE
CROSSING

WORLD is a sovereign playable domain.

GATE is a typed possible relation between contexts.

PARTY is the continuity-bearing group.

WORLDLINE is the append-only sequence of party crossings and cross-world residue.

TRANSFER BUNDLE explicitly declares what proposes to cross and under what scope.

CROSSING is one bounded transition whose source departure and destination arrival both exist.

## 4. World Manifest v0.1

A World Manifest declares:

- worldId
- version
- displayName
- constitutionRef
- adapterKind
- localTimeModel
- continuationModel
- entryPolicyRef
- exitPolicyRef
- transferPolicyRef
- authorityPolicyRef
- memoryPolicyRef
- declaredCapabilities
- knownGateRefs
- nonClaims

A World Manifest does not prove:

- the world is factually real outside its declared story/game scope;
- every local claim is true;
- the adapter has universal authority;
- every party may enter;
- every object may leave;
- local permissions transfer elsewhere.

## 5. Party Contract v0.1

A Party Manifest contains:

- partyId
- memberRefs
- pointCharacterRef when applicable
- anchorRef
- carriedArtifactRefs
- carriedCardRefs
- activeAncestorRefs
- relationshipRefs
- openThreadRefs
- commissionRefs
- sharedKnowledgeRefs
- privateKnowledgeRefs
- currentWorldRef
- priorCrossingRefs
- localCapabilityGrantRefs

### Human and model members remain distinct

A human member carries a participant reference and optional presence receipt.

A model member carries a session reference, role reference, context receipt references, and optional expiry.

A model session does not become human because both are party members.

A human does not inherit model capabilities by proximity.

### Point Character

A local story may designate one Point Character.

That changes narrative aperture.

It does not demote other participants into unreal NPCs.

### Party Anchor

Every Crossing must answer:

> Why is this still one party?

The Anchor may be a shared receipt, PostEmahh'n card, relationship, promise, song, unresolved Commission, person, place, or inherited obligation.

Changing the Anchor is attributable.

## 6. Knowledge and memory

ORIGIN must not produce omniscience.

Initial knowledge classes:

PRIVATE
SHARED
ARCHIVED
RUMOR
MODEL_CONTEXT
ANCESTRAL
LOCAL_ONLY

A knowledge reference preserves:

- knowledgeId
- class
- holderRefs
- sourceRefs
- knownAt
- epistemicState
- transferable

A fact one participant knows does not automatically become shared party memory after Crossing.

A model session's context does not automatically become another session's memory.

Archived reconstructability is not lived memory.

## 7. Transfer Bundle v0.1

Nothing crosses implicitly.

A Transfer Bundle declares:

- bundleId
- partyRef
- memberRefs
- artifactRefs
- knowledgeRefs
- relationshipRefs
- openThreadRefs
- consequenceRefs
- sourceWorldRef
- proposedDestinationRef
- sourceExitReceiptRef when available

Each item declares:

- ref
- sourceSystem
- claimScope
- requestedMode
- destinationDisposition when known

Requested modes are:

CARRY — the particular travels when allowed.

REFERENCE — only address / receipt / source reference travels.

RECONSTITUTE — destination creates a new local particular from admitted source material.

WITHHOLD — item remains outside the destination.

Reconstitution preserves:

> same bytes ≠ same occurrence.

## 8. What normally survives Crossing

Durable by default as reference or established relation:

- identity receipts;
- ancestry;
- established consequences;
- established relationships;
- genuinely learned knowledge;
- unresolved Threads;
- explicitly entrusted cards.

Requires destination admission:

- tools;
- resources;
- inventory;
- local capabilities;
- supernatural mechanics;
- social roles;
- currencies;
- local allies;
- model grants;
- privileges.

Never automatically transfers:

- local authority;
- local rank;
- legal authority;
- ownership claims;
- expertise;
- theological authority;
- administrative permissions;
- local canon;
- interpretation presented as fact.

## 9. Gate Contract v0.1

A Gate declares:

- gateId
- sourceWorldRef
- sourceLocationRef
- optional destinationWorldRef
- optional destinationAddressRef
- triggerRefs
- requiredPartyStateRefs
- requiredCardRefs
- requiredReceiptRefs
- requiredRelationshipRefs
- transferPolicyRef
- timeBehavior
- returnPolicy
- status
- evidenceRefs
- unresolvedConditions

Gate states:

LATENT
DETECTED
OFFERED
ADMITTED
HELD
REFUSED
CROSSED
CLOSED

A detected Gate may have an unknown destination.

A Gate may be meaningful without being open.

A Gate may remain HOLD indefinitely.

## 10. Crossing handshake

### Stage 1 — DETECT

A source world recognizes Gate residue according to local laws.

ORIGIN records only that the source reports a Gate candidate.

### Stage 2 — OFFER

The source produces:

- Gate Offer
- Transfer Bundle
- proposed destination address
- source-local evidence

### Stage 3 — DESTINATION ADMISSION

The destination evaluates each transfer item as:

ADMIT
REFUSE
HOLD
TRANSFORM

TRANSFORM means destination accepts a bounded local projection or reconstitution rather than the source particular.

### Stage 4 — PARTY CONFIRMATION

If a human party is crossing, an eligible human explicitly confirms when the local contract requires it.

A model finding a compatible Gate cannot silently teleport the party.

### Stage 5 — DEPARTURE

The source closes a local departure occurrence.

Departure does not delete the party from source history.

### Stage 6 — ARRIVAL

The destination creates its own local arrival occurrence.

The destination owns local meaning of that arrival.

### Stage 7 — CROSSING RECEIPT

Only after both local receipts exist does ORIGIN create a CrossingReceipt containing:

- crossingId
- partyRef
- gateRef
- sourceWorldRef
- sourceDepartureReceiptRef
- destinationWorldRef
- destinationArrivalReceiptRef
- transferBundleRef
- admittedItemRefs
- refusedItemRefs
- heldItemRefs
- transformedItemRefs
- priorCrossingRef when applicable
- unresolvedRefs
- nonClaims

A CrossingReceipt does not prove:

- universal truth of source interpretation;
- destination endorsement of every source claim;
- carried ownership;
- authorship;
- local authority transfer;
- uninterrupted model identity;
- supernatural explanation;
- canon compatibility beyond explicit admission.

## 11. Worldline

ORIGIN maintains a party worldline such as:

CROSSING 0
  STATIC FIELD origin

CROSSING 1
  STATIC FIELD → FOREIGN ROOM

CROSSING 2
  FOREIGN ROOM → another world

COLLISION
  another protagonist touches CROSSING 1 later

The Worldline stores Crossing references, party continuity references, Anchor changes, unresolved meta-story residues, cross-world correspondence, and collisions among previously independent local charts.

It does not store the full internal history of each world.

## 12. Time

ORIGIN preserves at least:

NOW / PULSE — synchronous present activity.

MAIL / THREAD — asynchronous correspondence returning into later present.

HEIR / LINEAGE — immutable ancestry/history.

Worlds may add local clocks.

Crossing never permits retrocausality.

A Thread from World A returning while the party is in World B becomes a new arrival in the current context.

It does not rewrite earlier departure.

## 13. Model-session continuity

A model companion may carry:

- role reference;
- supplied context receipts;
- bounded capability grants;
- unresolved gaps.

A model session may not claim uninterrupted personal memory across invocations.

Reconstitution is:

prior session
  ↓
verified context deck / receipts
  ↓
new invocation
  ↓
new session occurrence

Continuity is lineage.

## 14. Coderooms

A Coderoom may exist inside one world, as a Gate threshold, or as bounded cross-world orchestration.

A Coderoom declares:

- room identity
- local world
- active humans
- active model sessions
- presented physical cards
- current grants
- allowed tools
- unresolved Threads
- expiry conditions

A Coderoom cannot grant capabilities the source system did not expose or destination did not admit.

## 15. PostEmahh'n crossing

PostEmahh'n cards are strong Crossing particulars because they separate card identity, ancestry, physical embodiment, capability, composition, and receipt lineage.

ORIGIN may carry a card reference or physical-presentation receipt.

It may not rewrite card ancestry, claim model physical possession, infer legal ownership, change generation, or convert popularity into authority.

A destination may assign new local meaning to a card without changing ancestry.

## 16. Story presentation law

ORIGIN should initially be almost invisible.

The experience should feel like:

world
world
weird residue
world
Gate
Crossing
different world

Not:

ORIGIN MULTIVERSE MENU
select universe
equip dimensional key

No hub is required.

A hub may later exist as a world.

It is not architecturally mandatory.

## 17. THE FIRST CROSSING

THE FIRST CROSSING begins at the exact unresolved edge of STATIC FIELD's first story.

Source:

WORLD:
STATIC FIELD

REGION:
THE PORCH

LOCAL STORY:
THE FIRST BELL

ENDING OCCURRENCE:
knock knock knock

The Bell source remains unresolved.

Crossing must not solve it merely to progress.

### The knock

Initially the knock is only a STATIC FIELD occurrence:

occurrence:
  knock_at_screen_door

source:
  unresolved

interpretation:
  none

status:
  open

No one says portal.
No one says multiverse.

### Threshold inspection

The screen door gains a Resonance relation only when source-local conditions are met.

The first deterministic fixture may require:

- completed FirstBellPlayReceipt;
- Bell relation still unresolved;
- one carried PostEmahh'n reference;
- intact party Anchor.

STATIC FIELD reports:

> A relation is present at the door.

ORIGIN records a detected Gate candidate.

### Gate identity

First Gate:

SCREEN-DOOR-001

source:
  STATIC FIELD / THE PORCH

destination:
  unresolved initially

status:
  DETECTED

Investigation may resolve an address, not a universal explanation.

### Opening the door

The player chooses the ordinary STATIC FIELD verb:

> OPEN

OPEN remains a local action.

If Gate conditions are satisfied, STATIC FIELD produces a Gate Offer.

The UI may say:

> THE DOOR OPENS SOMEWHERE ELSE.

It should not say:

> Multiverse confirmed.

## 18. First destination fixture

The first implementation uses a deliberately minimal sovereign destination:

# FOREIGN ROOM // SEED-001

This is not yet Paula's full world.

It exists only to prove that the party can enter a place with genuinely different local laws.

Its tiny constitution:

1. the Room existed before arrival;
2. one local occurrence is already underway;
3. the arriving party has incomplete context;
4. the Room does not recognize STATIC FIELD Resonance as local evidence automatically;
5. one carried object is admitted only by reference;
6. one carried capability is refused;
7. one unresolved Thread survives Crossing;
8. local time advanced before the party arrived.

FOREIGN ROOM may later become a threshold into a properly authored HOME / Paula world.

ORIGIN must not pre-author HOME here.

## 19. Mixed admission

The first Crossing should demonstrate:

ADMIT:
- human participant refs
- party Anchor
- unresolved Bell Thread
- PostEmahh'n card reference

REFUSE:
- STATIC FIELD local Charge value

HOLD:
- one Resonance interpretation

TRANSFORM:
- STATIC FIELD location reference
- becomes destination-local reported-origin reference

This proves Crossing is not copying the whole player state blob.

## 20. Departure and arrival

STATIC FIELD emits:

PorchDepartureReceipt

The Porch continues to exist.

The chairs stay where they were unless a local act changed them.

The knock remains part of STATIC FIELD history.

FOREIGN ROOM emits:

ForeignRoomArrivalReceipt

The arrival should immediately establish:

> You are late to something.

Not:

> Welcome, chosen hero.

The local story is already underway.

After both local receipts exist, ORIGIN may emit:

FirstCrossingReceipt

It binds source departure, destination arrival, Gate, party, Transfer Bundle, admitted/refused/held/transformed items, unresolved Bell Thread, and current Anchor.

## 21. First scene after arrival

The party encounters one local particular showing the destination did not wait for them.

The first fixture should choose one:

- a half-finished meal;
- an argument that already happened;
- a letter already opened;
- a repair already attempted;
- somebody expected the party for reasons they do not understand.

No lore dump.

## 22. First-crossing receipts

The initial crater emits or references:

1. FirstBellPlayReceipt
2. ScreenDoorGateDetectionReceipt
3. GateOfferReceipt
4. DestinationAdmissionReceipt
5. PartyConfirmationReceipt
6. PorchDepartureReceipt
7. ForeignRoomArrivalReceipt
8. FirstCrossingReceipt

Their distinctions must survive.

## 23. Crossing dispositions

CROSSED — source departure and destination arrival both exist.

REFUSED — destination explicitly refuses admission.

HELD — Crossing remains unresolved pending evidence, capacity, witness, permission, or time.

PARTIAL — some members/items cross while others remain or are withheld. It must state exactly who/what crossed.

FAILED — transport or execution failed before lawful arrival. Failure is not refusal.

CANCELLED — an eligible participant withdraws before completion.

## 24. ORIGIN Dungeon Master posture

The ORIGIN-level Dungeon Master may:

- notice compatible Gate conditions;
- surface crossing opportunities;
- prepare Transfer Bundles;
- ask for missing information;
- preserve unresolved crossings;
- orchestrate adapters;
- generate narrative framing from established state.

It may not:

- force admission;
- fabricate destination authority;
- manufacture human confirmation;
- silently alter carried items;
- decide a world means something it did not declare;
- rewrite local receipts for dramatic pacing.

## 25. Meta-story residue

ORIGIN may track residue across worlds:

- same symbol in two worlds;
- one card opening unrelated Gates;
- Bell relation appearing elsewhere;
- two protagonists touching one event;
- one Thread returning across worlds;
- an object whose ancestry points outside a world.

Residue may create a candidate relation.

It must not automatically create a universal explanation.

## 26. Collision episodes

Later ORIGIN supports:

WORLDLINE A
      \
       EVENT X
      /
WORLDLINE B

Each worldline retains its local chart.

Collision creates a relation among charts.

It does not rewrite either playthrough.

## 27. Quantum-Leap-style entry

A future destination may designate a Point Character already in-world.

The traveling party arrives with incomplete information around that person's situation.

ORIGIN does not treat that person's prior life as beginning at arrival.

The local world owns their history, relationships, agency, privacy, and what the party is allowed to know.

## 28. Doctor-Who-style returns

Returning to a prior world creates a new arrival.

The world may have advanced.

A return is:

WORLD at later local state
  +
RETURNING PARTY
  +
prior relationship receipts
  =
new local occurrence

The party may discover that people changed, things resolved offscreen, cards became folklore, an inhabitant left, correspondence arrived, or the party was remembered incorrectly.

## 29. Kingdom-Hearts-II-style deep pattern

The long-form meta-story need not require a predetermined villain.

Its first major hypothesis remains:

> The worlds may be learning how to compose.

Possible fictional positions include:

- open every Gate;
- close every Gate;
- protect local worlds from assimilation;
- monopolize Gate access;
- allow knowledge but not authority;
- preserve cross-world commons;
- distrust all crossings;
- build lawful translation among worlds.

ORIGIN does not decide which position is correct.

It makes consequences playable.

## 30. Integration seams

STATIC FIELD owns Surface/Resonance, THE PORCH, Bell/Knock occurrences, local Gate detection, and source departure semantics.

WORLDSEED owns writer-facing world addressability, portable world-memory documents, epistemic labels, and contradiction preservation.

Full Measure owns participation, factual measures, witnessed contribution, local world encounters, Human Terminal, and existing bounded crossing lessons.

Grace / Mercy owns same-character dual-sheet posture, rupture/discernment, Y/HOLD/REFUSE, and bounded Mercy receipts.

PostEmahh'n owns card identity, physical embodiment, ancestry, composition, NOW/MAIL/HEIR, and bounded capability delegation.

Upper Room may later join with its own text/witness/interpretation laws.

Dogram may compute structural compatibility or route constraints but does not decide narrative meaning.

## 31. Paula / HOME future seam

ORIGIN must be able to receive a properly authored HOME world later.

Possible HOME features already anticipated by the container:

- single-parent life as playable structure;
- choose-your-own-story;
- flashbacks;
- dream/fantasy worlds;
- supernatural/spiritual quests;
- utopias;
- care;
- interrupted plans;
- lions / Africa dream threads;
- rebuilding;
- party play;
- Grace / Mercy posture.

ORIGIN does not define those here.

HOME should join by publishing its own World Manifest and Gate policies.

The architecture passes when Paula's world can enter without being rewritten into STATIC FIELD with different wallpaper.

## 32. Privacy

Cross-world continuity can become sensitive quickly.

World adapters should default to minimum disclosure.

A Transfer Bundle carries only what destination needs.

Possible strategies:

- pseudonymous participant refs;
- reference-only transfer;
- withheld private memory;
- destination-local derived summaries;
- explicit consent for sensitive material;
- expiring model-context grants.

A Gate is not consent to disclose everything the party carries.

## 33. Safety

ORIGIN is a game/story/runtime system.

It must not turn fictional traversal into claims of literal supernatural portals, prophecy, legal authority, medical authority, emergency authority, or private geolocation entitlement.

A real-world place may inspire or participate in a world.

The game preserves the difference among physical location, game region, memory, dream, fiction, reported event, and verified occurrence.

## 34. Non-goals for v0.1

Do not build yet:

- MMO world servers;
- universal accounts;
- universal inventory;
- global currency;
- world marketplace;
- cross-world combat balancing;
- automatic world generation;
- omniscient narrator;
- AI memory continuity claims;
- automatic canon reconciliation;
- every Static Collective repository as a world;
- geolocation-based automatic Gate opening;
- franchise-style hub menu;
- Paula's entire world;
- literal supernatural claims;
- generalized legal permissions;
- permanent cross-world authority.

The first crater proves one Crossing done correctly.

## 35. Required invariants

The implementation is wrong if:

1. ORIGIN becomes owner of a world.
2. One world's canon automatically becomes another world's canon.
3. A source can force destination admission.
4. A destination can rewrite source history.
5. The whole player state blob copies across worlds.
6. Local authority transfers automatically.
7. Private knowledge becomes shared memory automatically.
8. A model gains uninterrupted identity by Crossing.
9. A detected Gate is treated as authorized.
10. A Gate requires a known destination immediately.
11. A Crossing completes without both departure and arrival.
12. Refusal and failure collapse.
13. Partial Crossing fails to state who/what crossed.
14. STATIC FIELD's unresolved Bell is magically solved by Crossing.
15. The player sees a level-select menu before story earns the container.
16. FOREIGN ROOM waits inertly for the party.
17. Returning to a world resets it.
18. Meta-story residue becomes universal explanation automatically.
19. PostEmahh'n ancestry is rewritten.
20. WORLDSEED's author-first boundary is weakened.

## 36. ORIGIN-CONTAINER-001 implementation crater

After approval and planning, the first executable crater is:

> ORIGIN-FIRST-CROSSING-001

It proves:

STATIC FIELD / THE PORCH
  ↓
existing FirstBellPlayReceipt
  ↓
KNOCK remains unresolved
  ↓
SCREEN DOOR relation detected
  ↓
Gate candidate
  ↓
OPEN
  ↓
Gate Offer
  ↓
explicit Transfer Bundle
  ↓
FOREIGN ROOM admission
  ↓
mixed ADMIT / REFUSE / HOLD / TRANSFORM
  ↓
human confirmation
  ↓
PorchDepartureReceipt
  ↓
ForeignRoomArrivalReceipt
  ↓
FirstCrossingReceipt
  ↓
same party / same Anchor
  ↓
different local laws
  ↓
one local event already underway

Acceptance requires:

- Bell source remains unresolved;
- STATIC FIELD retains prior state;
- FOREIGN ROOM has state independent of arrival;
- one item is refused;
- one item is held;
- one item is transformed;
- one unresolved Thread crosses;
- party Anchor survives;
- model lineage, if present, remains bounded;
- final Crossing receipt references both local receipts;
- no local authority crosses automatically;
- deterministic fixture replay matches.

## 37. Constitutional inscription

> No world is a level because we can reach it.  
> No door is ours because we can see it.  
> Departure does not erase the place behind us.  
> Arrival does not begin the place ahead.  
> Carry the receipt.  
> Leave the authority where it belongs.  
> Cross without swallowing.  
> Come back and find that the world kept living.
