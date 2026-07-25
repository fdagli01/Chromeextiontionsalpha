# Game Design: Bounties, Artifacts, Affinity

Design spec for the next three gamification systems, in build order. Written
against the codebase as of v0.4.0 — every hook named here exists today and is
cited by file so the implementing session doesn't have to rediscover them.
Each phase ships independently; nothing in phase 2 or 3 blocks phase 1.

---

## Phase 1 — Bounty System ("Hedef Avı")

### Concept

The daily briefing currently only rewards *reviewing* (process dispatches,
reach a combo, bank XP — `src/progression/briefing.js`). Bounties add the
missing half: a daily reason to go *hunt words on the open web*, which is the
one thing a browser extension can do that no flashcard app can. One bounty
per day, same for every theme, themed as a field assignment.

### Bounty catalog (v1)

Deterministic pick by date — same trick as `worldEvents.js`, so "which bounty
is it today" needs zero storage and is unit-testable with a fixed date.

| id | Directive (template) | Check | Params by weekday hash |
|---|---|---|---|
| `domain-intel` | "Capture {n} words from a {tld} site — the archive needs local sources." | hostname of `info.pageUrl` ends with `.{tld}` | n=3; tld rotates es/fr/it/pt/ru |
| `letter-hunt` | "Intercept {n} words containing the letter '{letter}'." | `term.toLowerCase().includes(letter)` | n=5; letter from a curated list (a,e,i,o,r,s,t,n,l,c — common enough in all 5 languages to be fair) |
| `long-signal` | "Only substantial intel today: capture {n} words of {len}+ letters." | `term.length >= len` | n=3, len=8 |
| `fresh-front` | "The {themeName} desk is short-staffed. File {n} words under it." | `themeId === target` | n=3; theme rotates by date |

Explicitly **out of scope for v1**: part-of-speech bounties ("find 2 verbs").
No POS data exists on words, and detecting it needs either an API call or a
per-language heuristic table. Revisit only if a `partOfSpeech` field ever
lands on the word model.

### Selection logic

```
dayKey = YYYY-MM-DD
hash   = simple integer hash of dayKey (same style as worldEvents)
bounty = CATALOG[hash % CATALOG.length], params derived from hash too
```

Pure function `getDailyBounty(date) -> {id, directive, target, check(captureCtx)}`
in a new `src/progression/bounties.js`, with `bounties.test.js` covering:
deterministic pick, each check function's accept/reject cases, hostname edge
cases (`www.elpais.es`, `elpais.es`, `elpais.es.evil.com` must fail).

### Progress storage

`chrome.storage.local` key `bountyState`:

```json
{ "date": "2026-07-17", "bountyId": "domain-intel", "count": 2, "claimed": false }
```

- Stale date ⇒ treat as zero (same freshness pattern as `dailyQuestDate`).
- Local, not sync: captures are per-device anyway (IndexedDB archive).

### Wiring (all hooks exist today)

1. `src/background/index.js` — `chrome.contextMenus.onClicked` already
   receives `info.pageUrl` (no new permission needed; **do not** add `tabs`).
   Pass `{ pageUrl: info.pageUrl }` into `captureWord`.
2. In `captureWord`, after the `addWord` succeeds, call
   `recordBountyCapture({ term, themeId, pageUrl })` (new function in
   bounties.js): loads `bountyState`, runs today's `check`, increments,
   persists. On completion fire a second `chrome.notifications.create` —
   "★ CRITICAL INTEL COMPLETE" with the reward line.
3. Reward on completion (applied once, guarded by `claimed`):
   - +40 XP via `awardBonusXp` (exists in `src/xp/xpService.js`)
   - +1 streak shield, respecting the existing cap of 3
     (shield mint logic lives in the streak-insurance code from commit
     `90878ac`; reuse, don't duplicate).
4. Popup surfacing:
   - `DailyBriefingOverlay.jsx` gains a fourth row, visually distinct
     (crest icon ★, "FIELD BOUNTY" label) with live `count/target`.
   - `ReviewScreen` shows a one-time "CRITICAL INTEL COMPLETE" chip
     (reuse `result-chip` styling + `chip-pop-in`) the first time the popup
     opens after completion.
   - Mentor tie-in: on completion, the popup shows the **comboMilestone
     persona** (the rare/mysterious one — Defector, Oracle, Stowaway,
     Sans-Culotte, Miliciana) with a new `bounty` line pool per persona
     (2 lines each, add to `mentors.js` as a 6th moment key).

### Anti-cheese

- The same term captured twice never counts twice (`addWord` already exists;
  count only on a genuinely new insert — captureWord should skip-increment
  when the term already existed in that theme).
- `domain-intel` matches on registrable suffix of the hostname, not substring.

---

## Phase 2 — Artifact Collection ("Kalıntı Müzesi")

### Concept

A completionist meta-layer: fragments of historical objects drop as **proof
of mastery** (never pure RNG), three fragments assemble one artifact, and a
completed artifact reveals a real historical fact. Lives in a "Vault" section.

### Catalog (2 artifacts × 3 fragments per theme, v1)

| Theme | Artifact | Fact hook (1–2 lines, real history) |
|---|---|---|
| russian | **Fialka M-125 cipher disk** | The USSR's actual Enigma-successor cipher machine, classified until the 2000s |
| russian | **Censored Pravda page** | How Soviet photo-retouching erased purged officials from published photos |
| italian | **Legion aquila standard** | Lost-eagle recovery obsession (ties to existing secret content, different angle) |
| italian | **Forum floor mosaic** | Mosaics as propaganda — floors bragged about the owner's trade routes |
| portuguese | **Mariner's astrolabe** | The 2014 Oman shipwreck recovery (deepens the existing secret) |
| portuguese | **Padrão stone crown** | Diogo Cão's pillars still standing on the Namibian coast |
| french | **Declaration print plate** | Print-shop economics of 1789 — pamphlet press runs in the thousands overnight |
| french | **Tricolor cockade** | How cockade colors were a life-or-death fashion statement by 1793 |
| spanish | **Field press type tray** | Militia trench newspapers printed meters from the front line |
| spanish | **Guernica charcoal study** | Picasso's dated preparatory sketches — the mural evolved in under five weeks |

### Drop rules (deterministic, no RNG)

Each rule mints **one specific fragment** the first time it fires, in a fixed
per-theme order (artifact 1 fragments 1→2→3, then artifact 2):

1. **Redemption**: a word that was `struggling` gets recalled correctly —
   3rd distinct redemption mints a fragment. (Hook: `reviewWord` in
   `wordsRepo.js` already clears `struggling` on correct recall; count those
   clears in progress.)
2. **Streak tier**: each new streak tier reached (existing `streakTier` fn in
   `xp/xp.js`) mints a fragment.
3. **Bounty chain**: every 3rd completed bounty mints a fragment (reads
   `bountyState` history — add a lifetime `bountiesCompleted` counter to
   theme progress).

Deterministic = testable = the player can reason about it ("one more
redemption and I get a piece"). A small progress hint line in the Vault says
exactly that.

### Storage

New IndexedDB store `artifacts` (keyPath `[themeId+artifactId]`), added via
the existing `withStore`/connection migration path (precedent: the
factions/crises migration). Record: `{ themeId, artifactId, fragments: 0-3 }`
plus lifetime counters on ThemeProgress (`redemptions`, `bountiesCompleted`).
IndexedDB (not chrome.storage) so `backup.js` export/import covers it —
extend backup schema in the same change.

### UI

- v1: a "VAULT" section inside Settings/Mainframe (below badges): grid of
  artifact cards; incomplete = dark silhouette + `?/3` fragment pips;
  complete = full art placeholder (emoji/SVG v1, generated art later, same
  pipeline as mentor portraits) + the fact revealed + a subtle shine sweep
  animation on first view.
- Fragment-drop moment in ReviewScreen: reuse the badge-toast slot with a
  distinct "🧩 FRAGMENT RECOVERED — {artifact name} {n}/3" chip.

---

## Phase 3 — Affinity System ("Güven Ağı")

### Concept

The 20 mentor personas stop being reactive cardboard and start *remembering*.
Each persona has a visible trust meter; play style feeds different personas.

### Trust model

- Per persona, 0–100, four tiers: **Suspicious** (0–24), **Neutral** (25–49),
  **Warm** (50–74), **Ally** (75+). All start at 10 (Suspicious).
- Storage: new IndexedDB store `affinity` keyed `[themeId+personaId]`
  (same migration as artifacts if built together, separate if not).

### Trust sources (all are existing events — no new tracking needed)

| Event (existing hook) | Persona affected | Δ |
|---|---|---|
| Persona speaks a levelUp/streakUp/comboMilestone line (ReviewScreen mentor moment) | that persona | +2 |
| Persona speaks a miss line | that persona | +1 (they respect honesty — misses still build the relationship, slower) |
| Faction reputation gain (`awardReputation` in factionsRepo) | persona aligned to that faction (add `factionId?` to persona defs) | +2 aligned / −1 rival (floor 0) |
| Crisis won (`CrisisScreen onResolve`) | the theme's comboMilestone (rebel/wildcard) persona | +3 |
| Daily bounty completed | the theme's comboMilestone persona | +2 |

Caps: max +6 trust per persona per day (store `lastTrustDate` + `trustToday`
per record) so grinding one afternoon can't max a relationship.

### Ally rewards (at 75+, once per persona)

1. **Persona word pack**: 5 curated words auto-filed into the archive with
   facts — new `src/progression/allyPacks.js`, exact same insert mechanism as
   `seedWords.js` (which is the proven pattern), but themed to the persona's
   jargon (Cipher Clerk: telegraphy/cipher vocabulary; Priest: liturgical;
   Pamphlétaire: print-trade; etc. — 100 new curated words total, the
   single biggest content-writing task in this phase).
2. **Gossip secret**: one persona-specific anecdote using the existing
   `SecretRevealOverlay` flow, keyed to the persona not a term.

### UI

- v1: trust tier chip inside the existing speech bubble, next to the name
  (e.g. `THE HANDLER · WARY`), plus tier-colored ring on the portrait
  (Suspicious = muted border, Ally = accent glow).
- v2 (not in first cut): a "CAST" screen with all four portraits, bars, and
  backstories — natural future tab, do not build until the loop proves fun.

### Line-pool variation by tier (cheap, high-impact)

Each persona's line pools gain an `ally` variant set (warmer tone). Selection:
if trust tier is Ally, 50% chance to draw from the ally pool. ~40 new lines.

---

## Build order & sizing

| Phase | New files | Touched files | Content writing | Risk |
|---|---|---|---|---|
| 1 Bounty | bounties.js + test | background/index.js, DailyBriefingOverlay, ReviewScreen, mentors.js (+bounty lines) | 10 mentor lines | Low — no schema change, no new permissions |
| 2 Artifacts | artifacts.js + test, VaultSection | connection.js (migration), backup.js, wordsRepo (redemption count), SettingsScreen | 10 artifact facts | Medium — DB migration + backup schema |
| 3 Affinity | affinity.js + test, allyPacks.js | mentors.js (factionId + ally pools), ReviewScreen, factionsRepo, CrisisScreen | ~100 pack words, ~40 ally lines, 20 gossip secrets | High — most content, cross-system state |

Ship 1, watch it, then 2, then 3. Version bumps: 0.5.0 / 0.6.0 / 0.7.0.
