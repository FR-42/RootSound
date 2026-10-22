# RootSound TODO

## Rebuild scope — current work, 2026-10-22

The user authorized designing a fresh architecture and allowed a complete
rebuild. New work follows D-2026-10-22 and its follow-ups. The complete legacy
queue is archived in legacy/prototype/governance/; its priorities do not
automatically apply to the rebuild. Proposed implementation stages are in
docs/REBUILD_PLAN.md, with undecided details in docs/REBUILD_ARCHITECTURE.md.

### RB1 · Record the new architecture baseline — DONE 2026-10-22
- Where: docs/REBUILD_ARCHITECTURE.md, docs/REBUILD_PLAN.md, README.md,
  paired DECISIONS/TODO records and legacy document scope notices.
- Origin: user's purpose, hierarchy, communication, shared-custody,
  portable-project and rebuild decisions in the 2026-10-22 conversation.
- Resolution: authored an explicitly labeled draft and staged plan;
  preserved original README/architecture/roadmap text before adding scope
  notices. No runtime/source rewrite, new dependencies or full code backup.

### RB2 · Decide the boundaries required for the first working path — OPEN
- Where: new architecture draft, sections 4–8 and 12.
- What: settle public capability/cross-level semantics, audio execution
  ownership, minimal content/time/pitch model, and draft/save behavior only
  as needed for a real playable and recoverable path. Expose meaningful
  choices to the user; do not freeze all future departments or online tools.
- Origin: rebuild design; proposed implementation order, not a selected
  technology stack or approval of all draft details.
- Progress 2026-10-22: the user approved sound runtime as an independent
  background peer module, the global boundary for actual sound execution
  and audio rendering (D-2026-10-22-6). docs/REBUILD_FOUNDATION.md records
  its main division of responsibility. Internal units, concrete public
  contracts, content/time/pitch representations and draft/save details
  remain proposals or open choices. The first single-timbre implementation
  now exists as a replaceable experiment; it does not freeze phrase/song
  coordinates or final desktop technology. Windows desktop priority is
  settled by D-2026-10-23.

### RB3 · Verify independent timbre creation, preview, save and reopen — DONE 2026-10-23
- Where: src/workstation/, tests/workstation.*.test.ts, default index.html;
  the legacy interface is now isolated in legacy/prototype/.
  Details in docs/REBUILD_PROGRESS.md.
- Resolution: implemented public contracts and four concrete peer units;
  isolated drafts and saved content; sound lifecycle and failure handling;
  direct contour editing and minimal creative entry; recovery and save-as.
  Verified source snapshot before changing the default entry. No new runtime
  dependencies or final desktop framework. This closes the single-timbre
  verification only, not the full phase-1 phrase/song workflow.

### RB4 · Choose Windows host and extend the first creative workflow — OPEN
- What: assess a Windows desktop host, actual file persistence and device
  adapter under existing public contracts; then add phrase and arrangement
  capabilities without importing the legacy model. Set musical time/pitch
  semantics before those features exchange data. Full portable packaging
  and co-creation remain separate acceptance work, not completed by RB3.

### RB5 · Isolate the legacy project and restart Git — DONE 2026-10-23
- Origin: explicit user request, D-2026-10-23-2.
- Resolution: moved legacy source, styles, model tests, documentation and
  complete governance into legacy/prototype/ with independent configuration
  and launchers. Root build, tests and docs address only the new workstation.
  Preserved verified pre-move work files and full Git metadata as local ZIPs;
  restored and checked old Git objects and HEAD before resetting .git.
  Initialized fresh main with existing author identity, explicit line-ending
  policy and no remotes; legacy archives and generated files are ignored.
  Both projects passed checks, tests, builds and independent dev-entry checks.
