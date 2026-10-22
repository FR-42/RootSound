# RootSound DECISIONS

Active rebuild decisions. Complete pre-isolation records are preserved in
legacy/prototype/governance/. Append chronologically; update the plain-Chinese
mirror in AItoHUMAN/ in the same change. Proposed details are not user decisions.

The paired-document convention remains active; its original D-2026-10-15-4
record is in legacy/prototype/governance/. Earlier paths in retained decisions
describe their original date; the current archive location is legacy/.

## D-2026-10-22 · Workstation purpose and rebuild authorization — ACTIVE

- Decision: the root purpose is zero-friction creation by ordinary people,
  from an imagined/referenced sound to editable results, covering a single
  sound as well as complete music. Users need not first learn professional
  terminology, complex software operation, or tedious note entry.
- Decision: the existing project may be rebuilt from scratch. Existing
  code, directory structure, data shapes, interface and technology choices
  are history/reference, not constraints on the new architecture. Zero
  runtime dependencies and the old model/audio/ui layout are not inherited
  as hard requirements. No new framework, dependency or deployment choice
  has been selected by this decision.
- Rationale: the prototype's organization and quality conflict with the
  intended product; preserving its implementation must not determine the
  new workstation.
- Discipline: preserve a recoverable complete prototype before destructive
  replacement, including uncommitted and untracked work. Document the new
  architecture first; distinguish confirmed principles, implementation
  proposals and undecided details. No automatic legacy-format compatibility
  commitment, and no claim that the new design is already implemented.

## D-2026-10-22-2 · Hierarchical organization, free peer communication — ACTIVE

- Decision: a supreme coordinating center handles global organization and
  scheduling, with no concrete musical functionality. Parallel modules
  perform distinct tasks and may contain departments and smaller units as
  needed. Concrete musical work is executed only by the lowest-level
  units. A unit without children is itself an executing unit.
- Decision: each peer group follows the communication standard established
  by its common parent. Peers communicate freely under that standard;
  communication needs no parent authorization, mediation or per-exchange
  scheduling. Parent authority over the standard does not create a runtime
  permission gate. No private peer language or dependence on another unit's
  internal implementation. Apply the same rule recursively.
- Decision: module composition may change; functional overlap is permitted.
  Multiple parents for one unit are a special case, deferred until a real
  unavoidable need. The proposed module list remains provisional: sample
  acquisition, timbre creation, phrase writing, song arrangement, final
  processing, UI rendering, guided co-creation, accounts, creative workshop,
  AI creation, and shared material/project management.
- Rationale: explicit boundaries support specialization and replacement
  without forcing creators to coordinate the internal machinery.
- Discipline: do not turn the center into an audio-processing engine or a
  relay for every message/sample. Public endpoint details, cross-level
  boundaries and audio execution ownership remain implementation questions,
  explicitly marked as proposals/open in the design draft.
- Follow-up: D-2026-10-22-6 settles sound runtime's independent background
  module status and main responsibilities. Other public-boundary and
  implementation details remain subject to design and verification.

## D-2026-10-22-3 · Shared custody, referenced drafts and portable complete projects — ACTIVE

- Decision: a common material/project-management part stores creative
  results, optionally organized by owning unit. Work in progress references
  its dependencies there. If a referenced timbre is edited and the user
  attempts to overwrite it, warn about affected projects and consequences;
  offer saving as a new timbre.
- Decision: final processing can export a special complete-project format
  containing all song parameters, timbres and all other required content.
  Its purpose is cross-device continued editing with a compatible RootSound
  installation/runtime. It must not require the originating material library,
  a separate plugin installation, account or network service. The exported
  content is independent of later source-library edits.
- Decision: normal audio export is separate and serves playback/distribution
  without RootSound; it does not preserve the complete original editing
  structure. The format/container/extension is not selected yet.
- Rationale: shareable editable works and convenient shared assets need
  different preservation semantics.
- Discipline: include indirect dependencies and interpretation/processing
  requirements, not only names or file paths. Draft isolation, revision
  conflicts, import identity handling and packaging implementation are
  design proposals requiring validation, not additional user mandates.

## D-2026-10-22-4 · Creative entry, co-creation handoff and optional networking — ACTIVE

- Decision: the default welcome surface is friendly, minimal and suggestive,
  with no distracting implementation/professional detail. A primary start
  action guides curious users; a quiet skip/direct-entry path serves users
  with intent or expertise. Offer continuation when a project exists. Users
  can disable the welcome and choose their startup module/window.
- Decision: guided conversation serves coarse generation and exploration.
  Faithfully record an input melody and offer a small number of playable
  enhancements (typically 3–4 or a suitable slider), using everyday or
  expert descriptions. Multi-round choices refine direction. Fine editing
  hands the material to other modules, and the edited result can return to
  the conversation. Results must support continued musical editing.
- Decision: most basic functions should work offline. Networking may add
  AI, accounts, cloud upload/sync, shared samples, publication and discussion.
  Personal continuity includes aesthetic preferences, creative habits,
  frequently used materials and interaction preferences. Local AI, cloud
  providers and account details remain undecided.
- Rationale: expressive tools must capture ideas before interaction cost
  extinguishes them; guidance and professional depth need flexible entry.
- Discipline: do not make conversation, accounts, networking or the entire
  song-production chain mandatory for every task. Keep presentation quality,
  direct graphical editing and responsive interaction in acceptance criteria.

## D-2026-10-22-5 · Rebuild documentation baseline — ACTIVE

- Decision: after approving a fresh architecture direction, the user asked
  to continue the architecture draft. docs/REBUILD_ARCHITECTURE.md records
  confirmed principles separately from proposed implementation and open
  decisions; docs/REBUILD_PLAN.md proposes staged verification.
- Rationale: future work needs a readable baseline that does not silently
  restore legacy constraints or promote assistant proposals to user rulings.
- Discipline: legacy README/architecture/roadmap snapshots are preserved in
  docs/history/2026-10-22-prototype/. These are documentation snapshots only,
  not a complete code backup. Prototype code remains in place. This entry
  does not ratify every proposed detail or claim any rebuild implementation.

## D-2026-10-22-6 · Background sound runtime and global audio boundary — ACTIVE

- Decision: the user explicitly approved sound runtime as an independent
  parallel module and its main division of responsibility from creative
  modules. Like UI rendering, it is a background module: the "global sound
  customs", meaning the common public runtime boundary for all actual
  audition/playback, timed sound execution, device output and offline audio
  rendering. Using an audition does not require opening a runtime workspace.
- Decision: creative modules retain content meaning, creative choices and
  editing; processing methods have explicit implementation ownership.
  Concrete execution remains with lowest-level units, and the supreme
  coordinating center has no musical processing responsibility.
- Rationale: a timbre, phrase or song can sound independently while sharing
  coherent playback and output management.
- Discipline: this boundary governs sound execution, not permission for peer
  communication. Peers still communicate freely under their common standard;
  unrelated exchanges need no runtime approval or relay. This is not the
  legacy prototype's narrower pitch-conversion "customs". The decision does
  not freeze internal departments, algorithm ownership details, contracts,
  time/pitch encodings, technologies or every other foundation proposal.

## D-2026-10-23 · Windows desktop is the product priority — ACTIVE

- Decision: when asked which usage form the new workstation should
  prioritize, the user explicitly selected Windows desktop software.
- Rationale: target-platform work must follow the user's choice rather
  than silently inheriting the browser prototype as the final product.
- Discipline: this selects a product priority, not a desktop framework,
  audio driver, installer, cloud service or engineering-file encoding.
  The existing browser host may validate replaceable core contracts;
  clearly label it as verification and do not claim a desktop deliverable.

## D-2026-10-23-2 · Isolate the legacy project and restart Git history — ACTIVE

- Decision: the user requested moving all legacy project files, including
  code and documentation, into a subdirectory, deleting the active .git
  directory and configuring a new Git repository.
- Rationale: the fresh architecture should have a clear working tree and
  history, while old implementation material remains identifiable.
- Discipline: preserve and verify complete pre-move working files and old
  Git metadata before resetting the active repository. Keep the old program
  independently runnable under legacy/prototype/. The root application,
  tests, build and documentation address the new workstation. Preserve
  effective conversation norms and active rebuild decisions; archive full
  older governance. New main history does not inherit old hooks or remotes.
  Local legacy archives are excluded from new version tracking; they are
  not backed up by a future clone of the new repository.
