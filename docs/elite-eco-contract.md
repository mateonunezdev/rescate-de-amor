# ELITE ECO contract — Rescate de Amor

GOAL: improve the three highest-impact confirmed experience defects without broad refactors.
SC-1: portrait mobile shows a clear rotate-device gate; landscape fills the viewport and exposes usable touch controls.
SC-2: Level 1 HUD remains readable and transient guidance never covers the playfield center.
SC-3: the menu uses the existing detailed pixel-art world assets and matches the levels' visual language.
SC-4: movement, jump, melee, ranged attack and shield keep working after the UI changes.
SC-5: Level 1 remains reachable and completable; no new console/page errors.
CONSTRAINTS: preserve story, characters, level geometry, combat balance and saved progress.
CONSTRAINTS: no new packages, no subagents, no remote push.
OUT OF SCOPE: rebuilding levels, intro changes, new narrative, new major mechanics.
VERIFY: test-first Brave checks for portrait/landscape, HUD placement and menu asset use.
VERIFY: one affected desktop gameplay pass plus one landscape touch pass.
VERIFY: final desktop/mobile screenshots, Visual Judge, syntax check and scoped git diff review.
