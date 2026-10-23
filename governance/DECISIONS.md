# RootSound DECISIONS

Active rebuild decisions. Complete pre-isolation records are preserved in
legacy/prototype/governance/. Proposed details are not user decisions.
The Chinese explanation in AItoHUMAN/ records the same facts.

Governance may be revised and reorganized under the user's 2026-10-23
authorization (NORMS N11); inherited procedural rules are not automatically
binding. Decisions confirmed in the current collaboration remain active.
Earlier paths in retained decisions describe their original date; the current
archive location is legacy/.

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
- Follow-up: D-2026-10-23-5 refines normal editing: isolate the current
  occurrence automatically and expose explicitly chosen joint application.
  Shared overwrite warnings are no longer the normal save flow.
- Implementation follow-up, 2026-10-23: RB16 implements a first portable
  project snapshot for the current song/phrase/basic-synth models. The
  `.rsproject` v1 JSON container, 32 MiB and 8192-record limits are adjustable
  implementation choices, not newly confirmed product constraints. Imports
  use fresh identities and preserve existing works. Future sample/plugin
  portability remains to be designed when those capabilities exist.

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
  active rebuild decisions; conversation norms follow the current NORMS.md
  status, with inherited N1-N7 now historical only. Archive full older
  governance. New main history does not inherit old hooks or remotes.
  Local legacy archives are excluded from new version tracking; they are
  not backed up by a future clone of the new repository.

## D-2026-10-23-3 · Songs preserve each phrase's original speed by default — ACTIVE

- Decision: when placing phrases with different speeds into one song, the
  default is to retain each phrase's own speed. Song timeline positions have
  their own explicit beat/tempo reference; clip widths show the actual
  duration under that reference rather than silently stretching phrases.
- Origin: user response during the uninterrupted implementation run.
- Discipline: source phrase editing, song placement and any explicit
  follow-song-speed option remain distinct. No implicit pitch shifting or
  rewriting of saved phrase timing when arranging or exporting.

## D-2026-10-23-4 · Immediate audible feedback and durable editing history — ACTIVE

- Decision: edits made during playback should be heard immediately. The
  user identifies real-time feedback as an important part of the experience.
  Continue from the current playback position instead of stopping playback
  or making the user restart it after each adjustment.
- Decision: the user delegates whether to implement undo across application
  restarts to the assistant's judgment, and authorizes implementation if it
  can be done reliably. The implementation now persists phrase/song draft
  history atomically with their musical edits; the current 64-step bound is
  an adjustable implementation choice, not a permanent product ruling.
- Discipline: provisional drag/input feedback must not overwrite shared
  saved assets or add an undo step per pointer event. Commit each gesture
  once and restore provisional audio on cancellation/failure. Explicit joint
  editing now follows D-2026-10-23-5. Ordinary undo edits the working draft;
  compound undo restores the joint operation's selected locations. Works
  explicitly saved afterwards do not roll back with the working draft.
- Origin: user's answers to the previous run's three review questions,
  2026-10-23. Independent copying of referenced materials is supported in
  principle; subsequent explanation and the user's revised default are
  recorded in D-2026-10-23-5.

## D-2026-10-23-5 · Isolate ordinary edits and choose joint application — ACTIVE

The later D-2026-10-23-9 refines ordinary saving: copy only when multiple
logical music positions use the entity; a single position overwrites it.

- Decision: copying within a song shares references (cross-song identity
  is now governed by D-2026-10-23-7). Ordinary edits affect only the
  current occurrence; automatically create independent content and rewire
  the necessary ancestor path when saving, without asking the user to
  understand reference counts or choose a copy strategy.
- Decision: expose an explicit advanced action to select additional usage
  positions before editing or when applying the result. Show the concrete
  works/positions, and leave all unselected occurrences unchanged.
- Origin: user's layered-reference proposal followed by explicit approval:
  ordinary edits affect the current occurrence; apply elsewhere when needed.
- Implementation: saved library sounds/phrases default to a new material.
  Nested joint edits stage external changes until their parent phrase is
  saved. Save all forks and reference changes atomically, with compound
  undo/redo and cancellation cleanup. Validate source and affected work
  snapshots rather than overwriting changes made since scope selection.
  These mechanisms implement the approved behavior, not permanent format
  or interface constraints. No complete-project packaging is claimed.

## D-2026-10-23-6 · Stable EXE for daily use, BAT for source builds — ACTIVE

- Origin: the user asks whether BAT still fits and whether to move to EXE,
  explicitly delegating the decision to the assistant.
- Assistant's chosen implementation: a fixed root RootSound.exe directly
  starts the latest completely built desktop version without invoking a
  shell, downloading dependencies or compiling at each ordinary launch.
  RootSound.bat retains one-click build/open and can regenerate the EXE.
- Discipline: build into separate version directories; publish only after
  complete build success, retain the previous selected version on failure,
  and preserve the existing local material-library location. The root entry
  and its selected runtime files form one local installation; the small EXE
  alone is not a portable workstation. Installer, signing and runtime
  distribution remain release-stage work, not implied completed features.

## D-2026-10-23-7 · Song isolation and names within each content kind — ACTIVE

- Origin: user's explicit clarification during the detail-review task.
- Decision: different songs' materials must be completely isolated.
  They may use the same names. Within one song, different entities of the
  same kind cannot share a name; a phrase and a timbre may share a name.
  Repeated references to the same entity do not create a naming conflict.
- Scope: common material/project custody remains active; it does not imply
  shared mutable identities between songs. The within-song layered-reference,
  current-occurrence and selective-application rules in D-2026-10-23-5 remain.
  This decision supersedes older cross-song shared-material implications.
- Current implementation: song roots define persistent scopes; recursively
  adopt external material into independent identities, including raw samples,
  and reuse unchanged adopted sources inside the same song. Save As creates
  a new song scope. Explicit renames reject same-kind conflicts; automatic
  forks add numeric suffixes. Case/Unicode comparison and suffix spelling are
  implementation choices. Retained song material reserves its name even
  when absent from the current arrangement.
- Migration: preserve old libraries on read; isolate affected legacy graphs
  on normal edits. Historical undo can restore historical sharing; a later
  edit isolates it again. Do not claim an eager migration of all old projects.

## D-2026-10-23-8 · Continuous piano roll and timbre-workspace naming — ACTIVE

- Origin: user requests one piano-roll window with every pitch, suggests
  renaming the sound-making workspace, and reports remaining duplicate names.
- Decision: do not divide the piano roll into selectable registers; use one
  continuous scrollable keyboard. The current 96 equal-tempered keys within
  20–5000 Hz are an engine limit, not a permanent musical range decision.
  Keep exact stored/custom pitches and focus the viewport without hiding notes.
- Decision: display the workspace name as 音色制作 (timbre creation).
  The three existing characters are fixed synthesis recipes with limited
  controls; do not describe them as a complete instrument library/synthesizer.
- Naming implementation: additionally enforce same-kind uniqueness among
  unassigned public materials, with a saved item and its working draft counted
  as one identity. Explicit names conflict rather than silently changing;
  automatic creation/import/forks use numeric suffixes. Different songs may
  still use the same names, as specified by D-2026-10-23-7.
- One-time authorization: the user permits clearing all current projects,
  including editing drafts, and then confirms closing RootSound. Active
  desktop material files were cleared after exclusive-lock and verified
  local backup checks. This grants no standing permission to delete future
  creations. Records and limits are in RB23 and REBUILD_PROGRESS.md.

## D-2026-10-23-9 · Focus core editors, conditional saving and final output — ACTIVE

- Origin: user's explicit continuous-work, locked-screen implementation request.
- Decision: concise interfaces, few explanatory words, primary screen area
  devoted to timbre and phrase editing. Temporarily hide and defer co-creation
  after preserving its existing foundation; it is not the current priority.
- Decision: if an entity has several references, editing/saving occurrence a
  creates a new entity for a; if one reference uses it, overwrite it. Apply
  the same rule to ancestors instead of always copying every saved path.
  Same song's saved/editing representations of a position count once; actual
  new draft uses still need protection. Explicit Save As and chosen joint
  application remain distinct. This refines D-2026-10-23-5, not song isolation.
- Decision: implement final processing, initially in arrangement if small;
  try a song entity rail listing timbres/phrases and dragging them to the
  appropriate editors. These changes are authorized for implementation.
- Current choices: zero-use library entities may also overwrite; ambiguous
  multi-use library edits create a separate item without rewiring unknown
  occurrences. Nested changes stage privately until outer save. Unsafe old
  overwrite undo after later upstream save is rejected. These protection
  details remain adjustable implementation choices.
- First final processing: master attenuation, whole-song fade-in/out and
  bypass, shared live/offline graph with the existing peak bound; settings
  travel with song history/project files. Exact ranges are provisional.
- Entity context: follow the edited document's song scope, list public starts
  separately, validate dragged identities through owner APIs. Do not weaken
  song isolation merely to accept a visible item from another document.
- Discipline: uninterrupted work follows N8; locked-screen work follows N13.
  No desktop observation/control or real-library changes are implied.

## D-2026-10-23-10 · Current project materials and explicit file saving — ACTIVE

- Origin: user reports same-kind/name confusion and an unresponsive song save.
- Decision: material management lists all current entities in the open song
  project, excluding historical saves. Custody of old snapshots and undo
  records does not make those entities current project members. Repeated
  references to one identity have one entry; distinct kinds remain distinct.
- Decision: the main song save button and Ctrl+S select a location and save
  the editable song project file. Automatic local draft recovery is separate
  and must not be presented as a successful user-requested file save.
- Implementation choice: explicit spare copies remain members even when not
  placed in the song, and travel with its file. Existing retention metadata
  alone cannot reliably identify legacy spare copies, so it is not used to
  resurrect old material as current membership. No stored history is deleted.
- Implementation choice: portable files without additional members retain
  format v1; files declaring spare members use v2, with strict validation of
  the root/member dependency closures. Both versions open in this build.
  The encoding remains provisional. Pending current material edits must be
  completed or cancelled before file saving rather than silently omitted.

## D-2026-10-23-11 · Strengthen timbre creation, with both sound routes — ACTIVE

- Origin: user finds timbre creation missing a visible New action and far
  too limited for the workstation purpose. User asks to focus development
  here, allows decision questions and explicitly welcomes reasoned challenge.
- Decision: real instruments and electronic sounds have equal product
  importance; staged delivery is acceptable, with unified entry/structure
  from the start. Adding presets alone is not creative freedom.
- Current implementation choice: share timbre identity, references, save and
  audition; adapt editing tools to synthesis versus original samples. First
  slice adds editable synthesis sources/envelopes/filter/pitch, starting
  points and undo, alongside sample sustain loops. Four sources and twelve
  starts are provisional, not permanent product limits. Existing sounds
  open faithfully without automatic conversion writes.
- Remaining: expressive real instruments require sample mappings, playing
  behavior and suitable licensed sources. Electronic starts and simple
  sample loops do not imply that a realistic instrument library is done.

## D-2026-10-23-12 · Personal music-workflow experiment — ACTIVE

- Origin: user requests an independent root subdirectory to personally run the
  whole music-making process, describing outcomes rather than implementation.
- Decision: keep an independent experiment under experiments/music-workflow.
  Its first tool receives a phone's Bluetooth music, enables recording only on
  an actual audio connection, stops, and exports through a system save dialog.
- User correction: Restart clears only the current take. It must preserve the
  Bluetooth connection, system playback and every already exported file. An
  in-flight connection also belongs to the session, not to a take's reset.
- User revision, 2026-10-24: after phone playback worked but its independent
  capture input remained unavailable, the user explicitly withdrew phone-only
  recording and accepted the PC playback mix, keeping other PC sounds quiet.
  The prior phone-only requirement is superseded; reset still preserves the
  connection, playback and exported files. Normal close preserves exports.
- Current implementation: shared WASAPI loopback on the default multimedia
  playback output. Includes phone playback and other apps/notifications on that
  output; never opens a microphone. No independent phone-input prerequisite.
  Output switch/loss or phone disconnect stops and retains the take. Keep
  native playback, with no extra rendering or system-setting changes.
- Files: stream WAV into a private per-take folder, export atomically through
  the save dialog, and delete only private temporary recording/staging files.
  Export paths are not retained as deletion authority. No unrelated files or
  main workstation library are scanned/deleted. Experiments do not automatically
  revise the workstation's permanent architecture.
- Historical identity fix, 2026-10-24: local read-only metadata reproduced an invalid
  WinRT property name aborting identity reads and a missing device-interface
  prefix in address parsing. Use the canonical AepService.AepId property and
  resolve the selected interface's native devnode independently of optional
  association metadata. This repairs identity acquisition without relaxing the
  then-active phone-only rule. That source path now lives in test diagnostics,
  not the shipped app. Actual song capture/listening awaits user verification.

## D-2026-10-24 · Independent spectrum selection and sample export — ACTIVE

- Origin: user requests the second personal workflow module: import a music
  file through the system picker, inspect a horizontal sound graph, play/pause
  at a draggable red line and export between two draggable blue boundaries.
  Shift dragging refines movement; Shift plus wheel changes horizontal zoom.
- Decision: deliver this as another independent experiment, alongside Bluetooth
  recording, without changing main-workstation architecture or library data.
- Current implementation choices: show a real time-frequency spectrum with a
  waveform toggle; playback follows the device clock. Fine audition speed is
  0.750–1.250 in 0.001 steps and changes pitch with speed. Export the selected
  original-speed audio as 24-bit WAV, preserving source rate/channels, through
  the system save dialog. The imported original is protected from overwrite.
  These bounds and audition/export choices remain adjustable, not permanent
  workstation decisions. Implementation is complete; user acceptance pending.

## D-2026-10-24-2 · Polish acquired samples into playable timbres — ACTIVE

- Origin: user requests the third independent personal workflow module. The
  recorder obtains a song and the editor selects a short sample; this tool
  must help turn that imperfect sample into a usable arrangement timbre.
  The assistant chooses implementation details and may research methods.
- User proposal: compare several examples of the same timbre so varying
  interference can be reduced. This is a desired experiment, not a claim
  that arbitrary overlapping instruments are uniquely recoverable.
- Current implementation: offline spectral noise reduction, harmonic/transient
  suppression, frequency filtering and pitch-normalized multi-reference soft
  masking of the primary sample. Never average reference waveforms into the
  output or replace the imported original. Root estimation is adjustable;
  uncertain or unusable references are reported. Keep original comparison.
- Playable shaping: root pitch, ADSR, gain, sustain loops and key audition.
  Export cleaned native-pitch WAV; save float audio plus performance settings
  in an independent .rstimbre experiment file, reopenable in this tool.
  It is not yet a workstation-standard instrument file. References and the
  cleaning process are not included in that rendered-instrument snapshot.
- Provisional limits: offline, at most eight input clips, each at most 30
  seconds; no semantic AI source-separation model. Shared interference and
  coincident frequencies may remain, and strong processing can damage target
  detail. Synthetic tests are evidence for specific cases, not a guarantee of
  real-song quality. Product-wide architecture and libraries remain unchanged.
