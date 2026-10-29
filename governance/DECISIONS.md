# RootSound DECISIONS

## D-2026-10-29-structure-gpu · Local model GPU execution — EXPERIMENT SCOPE

- User explicitly requests GPU integration after learning the model used CPU.
  This authorizes the required project-local GPU runtime installation, not
  changing unrelated tools, global Python or graphics drivers.
- After the measured comparison, user chooses CPU. Default all model execution
  entry points and the dialog to CPU; do not initialize/probe GPU when opening
  the default CPU chooser. GPU and GPU-priority Auto remain explicit options.
- Implement Intel XPU for this machine's Arc Graphics using a separate locked
  PyTorch/torchaudio2.7.1+xpu environment and verified official Intel dependencies.
  Preserve CPU components and existing model weights. Worker model parameters,
  input and returned tensors are checked on the selected device. Full float32.
- Dialog offers Auto (GPU priority), strict GPU and CPU, for Demucs only. Report
  detected/actual device and CPU operator cooperation. Auto may retry the same
  model on CPU after GPU failure, explicitly reporting why; strict GPU must fail
  without silently computing CPU results. Cancel/close terminates worker and
  discards unfinished files, preserving current session/audio and source files.
- GPU availability is not a speed guarantee. This machine's controlled30s mix
  measured CPU15.69s versus GPU21.51s, with max stem RMS difference2.04e-8.
  Mixed precision was slower and less close to CPU, so retain float32. These
  measurements are workload-specific and do not establish real-music listening
  acceptance. Traditional four algorithms remain CPU.

## D-2026-10-29-structure-methods · Multiple selectable separation principles — EXPERIMENT SCOPE

- User finds the first decomposition unsatisfactory and requests several other
  principles with a small window for choosing a preferred method. This is a
  request to implement alternatives, not acceptance of the original NMF quality.
- Implementation choices: cached local Hybrid Demucs (drums/bass/vocals/other
  residual), median-filter HPSS (sustained/percussive), bounded non-local
  neighbor-median repetition (REPET-SIM inspired), stereo Mid/Side, and original
  NMF with2–8 requested templates. These are distinct mechanisms, not NMF presets.
- Initial/re-decomposition and selected-parent refinement open the method dialog.
  Re-decomposition always uses the original input, replaces current layers and
  saves the previous layers/mutes for undo; refinement only replaces its parent.
  Availability/channel/layer constraints are explicit; no silent method fallback.
- Trained model uses existing local components and verified cached weights, with
  blocked worker network and no auto-install/download. Bounded window processing,
  full duration/rate/channels, complementary reconstruction, cancellation and
  source protection remain. Estimates may leak or misclassify electronic sounds.
  Actual music listening and preference selection remain with the user.

## D-2026-10-29-tone-structure · Simultaneous spectral structure layers — EXPERIMENT SCOPE

- User requests a new tool resembling the unified Tone Processor, replacing its
  polishing page with a total-spectrum view, decomposition and aligned output
  spectra; shared playback, draggable playhead, independent active/mute, finer
  decomposition and undo. Capture/EQ transfers selected long audio into it.
- User clarifies outputs are simultaneous sound layers, not chronological
  sections or deduplicated verses. They must not each duplicate the full input.
  The graph is **frequency versus volume, changing with playback time**. Use a
  separate shared time ruler for seeking.
- Initial implementation choices (extended by selectable methods above): independent “音色结构.exe”; nonnegative learned
  recurring spectral templates and complementary reconstruction, initial up to
  four layers and selected-parent refinement. Replace parent with children,
  all-active sum reconstructs input, original comparison is exclusive. Name
  outputs neutrally rather than claiming exact instrument identity.
- No guarantee of semantic instrument isolation: leakage remains possible.
  Session-only state, explicit per-layer/mix WAV export, at most16 leaves and
  eight decomposition undo states, disk-backed audio and cancellable work are
  implementation choices. New input replaces current analysis after a prompt.

## D-2026-10-29-blue-markers · Free crossing and continuous audition — EXPERIMENT SCOPE

- User requests both blue markers in the unified Tone Processor to cross freely;
  the interval between them is selected, with no fixed left/right identity.
- User explicitly rejects pausing while dragging: red and audio continue without
  pointer-driven seeking, except when the current position meets a moved edge.
  Capture now reanchors the looping source at the existing audio clock. Ordered
  bounds serve playback, trimming, transfers and saving; marker identities stay
  attached to their gestures. Crossing is enabled on both unified pages.
- A coincident pair has no playable interval; it may pause until the same gesture
  opens a valid interval again. This empty-range handling is an implementation
  choice. Other standalone tools retain the old default ordered-edge behavior.

## D-2026-10-29-tone-unified · Merge capture and timbre polishing — EXPERIMENT SCOPE

- Follow-up: user explicitly requests deleting the root `音色打磨.exe`.
  Retain `音色器.exe` as the sole EXE entry and stop recreating the old alias
  during builds. Historical build commands may still forward to this entry.
- User requests one “音色器”, initially showing the existing timbre-polishing UI.
  A boxed plus directly below its left sample list enters the former Tone
  Processor capture/EQ page. That page's export now adds the EQ-processed blue
  selection directly to the list; it keeps the loaded song for further captures.
- User explicitly clarifies retention is **within the current open session**,
  including page navigation, not restoration after closing/reopening.
- Implemented choices: successful export returns to polishing; a back button
  permits navigation without adding audio. First capture is primary; later
  captures append references. Keep both page instances, markers/view/EQ/trim
  history, independent sample snapshots, original-file protection and existing
  30-second/eight-sample limits. Stop current audition when navigating. Legacy
  “音色打磨” launcher/build entry forwards to the merged tool.
- This supersedes the separate capture-page WAV-export workflow in
  D-2026-10-29-tone-processor. Final WAV and `.rstimbre` saving remain in the
  polishing page. Main-workstation scope is unchanged.

## D-2026-10-29-tone-processor · Standalone audio processing tool — EXPERIMENT SCOPE

- User requests a new independent “音色器” under `experiments/music-workflow`:
  top-bar triangle play, square return-to-start,
  multi-format import and WAV export; time-frequency view with draggable red
  playhead and two blue boundaries, horizontal zoom and looping within them.
- Import must support audio longer than 10 minutes. Cut removes audio outside
  the blue range from the working clip and resets the boundaries to that clip.
  Reuse the precision synthesizer's frequency/gain EQ editor unchanged; future
  processing stages may follow. No timbre-file format is required at this stage.
- User explicitly chooses export of **only the blue range, including EQ**.
  Return-to-start pauses at the left blue boundary to keep the red line inside
  the loop. This transport detail, preserving originals, reversible cut history, a flat initial EQ and streamed
  disk-backed processing are implementation choices, not new main-workstation
  requirements. This experiment does not change the main workstation's scope.

## D-2026-10-29-5 · Wheel-adjusting a selected note's held duration — ACTIVE

- User requests fine duration adjustment with the wheel when a single note is
  selected. RB82 applies ordinary vertical wheel input over the piano roll to
  that note; a family-only selection still navigates. Labels, ruler, modifiers
  and horizontal-only input retain navigation.
- Up lengthens and down shortens. Device-unit normalization, about10ms per normal
  notch and a bounded per-event delta are implementation choices. Preserve onset,
  pitch, timbre, mix and selection; keep real held seconds independent of BPM.
  This edits the working draft and does not bypass explicit saving.

## D-2026-10-29-4 · Explicit saving and private working drafts — ACTIVE

- User rejects automatically saving phrases and songs: editing must leave room
  for disposable drafts. Normal edits do not overwrite the formal project file.
  Save buttons and Ctrl+S are deliberate commitments, not decorative checkpoints.
- User clarifies the two levels: phrase Save confirms that phrase into the current
  working project; song Save writes the whole project file. Confirming a phrase
  does not separately write a file or implicitly save unrelated arrangement edits.
- New phrase work remains unpublished until explicitly saved. Leaving changed
  phrase work offers save/discard/continue; discard restores saved musical fields
  or removes a new unpublished draft. Libraries display confirmed metadata only.
- Project exit and window close offer save/discard/cancel for changed work. Project
  Save/Save As must not silently publish another unfinished phrase/tone editor.
  Confirmed phrase removal remains a working project edit until the song is saved.
- RB81 uses in-memory native working snapshots, explicit draft-to-project custody
  and UI flush/close preparation. Existing create/import/copy and deliberate file
  library rename/delete actions remain explicit actions, not automatic edit saves.
  No existing user project is deleted or retroactively rewritten by this change.

## D-2026-10-29-3 · Creation overview and phrase console — ACTIVE

- User replaces the Rhythm area with a phrase console, renames Melody to Creation,
  removes the right-hand Create tile and retains the adjustable divider.
- Clarification: keep the read-only overview; clicking the left Creation control
  enters editing. Do not replace the overview with an always-open piano roll.
- RB80 implementation choices: show phrase metadata and master volume below;
  default to75% overview while retaining symmetric divider bounds. Existing
  rhythm families remain unchanged in storage, visible/editable in unified
  Creation and audible in the whole-phrase preview. No deletion or forced
  rewriting of old music is implied by removing the separate Rhythm interface.
- The exact console fields/default ratio and legacy routing are implementation
  choices, not a separately approved long-term console design or listening result.

## D-2026-10-29-2 · Gentler horizontal dragging and phrase-library opening — ACTIVE

- User requests slower horizontal row-control dragging and double-clicking a
  phrase in the phrase library to enter its composition workspace. This replaces
  that library card's double-click-to-rename behavior; names remain editable in
  the phrase header. Single-click shelf visibility toggling remains available.
- RB79 uses 0.75 times pointer displacement horizontally while retaining the
  vertical rate, bounds, visual fade progress and actual-release deletion guard.
  The exact rate is an implementation choice, not a permanent requirement.
- Opening a library phrase cancels pending single-click actions and uses its
  existing identity, including phrases not currently shown on the song shelf.

## D-2026-10-29 · Free two-axis row-control dragging — ACTIVE

- User requests diagonal row-control dragging, horizontal bounds with the left
  edge fixed at the control column's left edge, slower trash fade-in and progressive
  fading of that row's beat/bar lines as it moves right.
- RB78 removes RB77's direction lock. The right travel limit is currently one
  actual control-column width (144px normally, 116px in the narrow layout); this
  boundary and the squared trash-opacity curve are implementation choices.
  Only a full-right actual release requests deletion; otherwise release reorders
  vertically. Populated rows still require confirmation. Cancelling restores
  display and selection without music writes or playback restarts.
- Grid fading uses a local band on the shared grid layer. It changes display
  only; it does not edit song timing or weaken other rows' grid contrast.

## D-2026-10-28-7 · Draw notes and protect intentional removals — ACTIVE

- User clarification: selecting the left total-note family enables left-drag
  creation in blank piano-roll space; click fixes the origin and drag sets length.
  Removing self-created/imported tones, phrases or songs must show a warning.
- The requested n is cells per beat (2–9), not beats per bar. Expose it in the
  shared phrase header. This supersedes a universally fixed four-cell editor.
- A large rightward row-control drag progressively exposes a red trash block.
  At full strength, releasing removes the row; populated rows require warning.
- RB77 choices: default4 for older phrases, preserve existing note times and held
  seconds when changing n, snap new draw lengths on release while previewing
  continuously, retain explicit navigation gestures and protect partial end cells.
  The original 140px threshold and direction lock are superseded by RB78 above.
  Stale-row rejection and one-commit ghosts are implementation choices, not new
  permanent product constraints.

## D-2026-10-28-6 · Phrase tempo, tone-library organization and contextual wheels — ACTIVE

- New phrases inherit the BPM shown by Arrangement at creation. Bundled tones
  in an empty project can be removed from its tone library. Tone cards can be
  dragged into a new order with neighboring cards yielding their positions.
- Settings currently expose keyboard performance only. Over SPN labels and
  playlist row controls, ordinary wheel navigates vertically, Ctrl zooms
  vertically, Shift navigates horizontally and Ctrl+Shift zooms horizontally.
  An overflowing console supports local horizontal wheel scrolling.
- RB76 choices: inherit the current playhead's grid-tempo segment; retain copy
  tempo and main-grid wheel behavior; persist order per song and remap metadata
  on full import. Remove unused voices without reseeding and protect existing
  music/edits/history. Used-tone trash retains its prior current-section meaning.
  These details do not mandate broader deletion of referenced musical material.

Active rebuild decisions. Complete pre-isolation records are preserved in
legacy/prototype/governance/. Proposed details are not user decisions.
The Chinese explanation in AItoHUMAN/ records the same facts.

Governance may be revised and reorganized under the user's 2026-10-23
authorization (NORMS N11); inherited procedural rules are not automatically
binding. Decisions confirmed in the current collaboration remain active.
Earlier paths in retained decisions describe their original date; the current
archive location is legacy/.

Current ultimate purpose: enable rhythm-game music enthusiasts to get started
quickly and create music they find satisfying. The audience is enthusiasts of
rhythm-game music and adjacent styles. D-2026-10-27-10
supersedes the earlier universal purpose and records the accepted first milestone.

## D-2026-10-22 · Workstation purpose and rebuild authorization — PURPOSE SUPERSEDED; REBUILD AUTHORIZATION ACTIVE

- Historical purpose, superseded by D-2026-10-27-10: zero-friction creation by ordinary people,
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

- Decision, revised by user on 2026-10-25: the welcome surface contains only
  RootSound, “你好，你想创作什么？”, “新的开始” and “打开已有项目”. Remove all
  other welcome controls, explanatory text and decoration. This supersedes
  the earlier separate continuation, direct-entry and welcome-settings controls.
  Existing preferences to disable welcome/select a startup workspace remain;
  this visual revision did not decide the subsequent new-project workflow.
- User follow-up, 2026-10-25: “新的开始” shows the unchanged RootSound brand,
  one song-name field, “为新歌曲起一个名字把~”, and “创建！”. Create a named child
  under installation-root/project/. Bottom “详细设置” shows only this project's
  storage location and bottom “保存”, which returns with the name preserved.
  The default project folder governs future automatic discovery; a custom
  location does not automatically enter that scope. Delete old main-workstation
  projects. Implementation: per-folder materials plus a versioned manifest;
  settings select this creation's parent, not a move/global-default operation.
  Creation/opening temporarily enters the existing song workspace. Startup
  first requires selecting a project rather than applying an unbound old entry
  preference. These last implementation choices remain revisable.
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
- User graph refinement, 2026-10-24: the timbre-lab graph has one draggable
  red playback cursor and two draggable blue selection boundaries. A compact
  control row toggles sample play/pause at the cursor; horizontal zoom is
  adjustable. Both Save Timbre and Export WAV retain only blue-line audio.
  Implementation choice: keep full original/processed context visible and
  crop actual PCM at save/key audition, with rebased/intersected sustain loops.
  Blue boundaries no longer edit sustain; its numeric controls remain separate.
- User keyboard refinement, 2026-10-24: add Piano and Sample modes on the same
  keyboard and expand its pitch range, to compare sampled sounds with known
  pitches. Current choices: continuous 88-key A0–C8 keyboard with octave/center
  navigation and pitch labels; offline synthesized piano reference at A4=440,
  available without a sample. Sample mode keeps selected-sample performance
  settings. Switching does not edit root pitch or saved audio; files continue
  to contain the blue-line sample only. The piano is a reference, not a sampled
  instrument library. Original-pitch listening remains the direct way to match
  a sample against piano notes; transposed sample keys serve a different check.
- Provisional limits: offline, at most eight input clips, each at most 30
  seconds; no semantic AI source-separation model. Shared interference and
  coincident frequencies may remain, and strong processing can damage target
  detail. Synthetic tests are evidence for specific cases, not a guarantee of
  real-song quality. Product-wide architecture and libraries remain unchanged.

## D-2026-10-24-3 · Independent phrase composition from timbre files — ACTIVE

- Origin: user specifies the fourth personal workflow experiment: New Phrase,
  name, create channels, import timbres, edit and save a phrase file. Initial
  workbench is empty; phrase work occupies a large child workspace.
- Decision: each channel can independently choose step sequencer or piano
  roll, without instrument-type restrictions. Steps are directly editable in
  the narrow channel row; piano rows show only a simple overview. Both have a
  large detailed editor and edits apply immediately. Mode changes preserve
  the underlying notes. Imported names default to the source filename, allow
  manual renaming and receive suffixes on collision within the phrase.
- Decision: Save is unavailable while a channel lacks a timbre. First Save
  selects a destination. Starting from an existing phrase loads it directly;
  subsequent Save warns before overwriting it, with Save As alongside.
- Implementation choices: import third-module .rstimbre and embed exact audio
  plus performance settings in a self-contained .rsphrase. Local recovery
  drafts update automatically and are distinct from explicit file export.
  Workspaces use large tabs; detailed editing occupies their main area.
  Notes share one model across both editors; playback reflects current edits.
- Provisional scope: 4/4, 20–300 BPM, 1–16 bars, 32 channels and 10,000 notes;
  512 MiB of embedded sample data and 128 simultaneous playing notes. These
  are experiment limits, not permanent workstation rules. Native file format
  interoperability with the main workstation is not yet implemented. Actual
  interface/listening acceptance remains separate from automated checks.

## D-2026-10-24-4 · Learn and create through reference music — ACTIVE

- User-confirmed purpose: hear music they love, understand its construction,
  and acquire the ability to create work that excites them similarly. Their
  personal references include Meta-Mysteria, Inverted World, Lament Rain and
  Arghena: fast electronic/rhythm-game music. At that time this was a personal
  direction rather than a product-scope restriction; D-2026-10-27-10 now defines
  the product's ultimate purpose around rhythm-game music enthusiasts.
- Origin: the user reports that the recent acquisition→sample→timbre→phrase
  experiments have not yet achieved that purpose. They authorize trying a
  reference-led editable reconstruction with D:/Sound/temp/music/Vulcanus.wav.
  D:/Sound/temp/music/ is their designated song directory; file ownership does
  not by itself establish authorship. This run uses only the specified song.
- Current implementation proposal: prepare a small actual-song case with
  aligned reference/reconstruction audition, individually audible editable
  layers, sound changes and portable saving. Reuse useful existing editors.
  The first case is assistant-prepared, not an arbitrary-song automatic
  transcription service. Keep estimates, sampled material and original stems
  distinguishable. Sound resemblance and educational usefulness require
  listening/user review, separately from software checks.
- Scope: another independent personal experiment; preserve the original song,
  previous tools and main workstation. Case format, excerpt, estimated tempo,
  sound controls, algorithm/model choice and UI remain provisional.

## D-2026-10-24-5 · Independent phrase playlist and song delivery — ACTIVE

- Origin: user requests an FL Studio Playlist-like personal experiment: import
  phrases, list all imported phrases on the left, drag them into a large right
  arrangement window, adjust positions and export an editable song or audio.
- Decision: deliver an independent song-studio module connected to the existing
  .rsphrase workflow. Preserve the prior confirmed default of original phrase
  speed (D-2026-10-23-3); following song tempo is an explicit per-placement choice.
- Implementation choices: multitrack bar/beat grid, repeated/overlapping clips,
  drag/snap/free precision, zoom/scroll, copy/delete, track and clip gain/mute,
  undo/redo, device-clock transport and streamed polyphonic mix with release.
  Self-contained .rssong embeds the imported phrase snapshots and exact sample
  settings/audio. WAV uses the same renderer. Atomic replacement/cancellation,
  close-save prompts and a separate content-addressed recovery cache protect work.
- Provisional limits: 4/4, 20–300 BPM, 64 phrases, 32 tracks, 512 placements,
  100,000 arranged notes, 512 MiB samples and 128 simultaneous voices; at most
  two hours/2048 bars. No FLP compatibility or main-workstation project bridge.
  The reference is the placement workflow, not complete FL Studio functionality.
  Real listening, pointer feel and dialogs remain subject to user acceptance.

## D-2026-10-24-6 · Product independence with licensed open components — ACTIVE

- Origin: user objects that relying on commercial RipX conflicts with project
  originality, then explicitly selects: "产品与核心流程自主，允许使用许可合适的开源库和模型".
- Decision: RootSound owns its product design and core creation workflow;
  appropriately licensed open-source libraries and models may be used. This
  is not a requirement to reinvent every foundational algorithm or model.
- Preserve the existing module-boundary and portable-project principles.
  Evaluate components as replaceable implementations, rather than making a
  closed commercial application's project format or activation a required
  foundation. No RipX integration or commercial dependency was approved.
- Record third-party sources and applicable licence obligations accurately;
  reuse is not described as wholly self-authored code. Code, model weights and
  audio assets have separate permissions. A research-only/noncommercial model
  trial does not authorize shipping those weights with the product.
- Scope: this confirms an independence/reuse boundary, not a specific library,
  licence for RootSound, model quality claim or approval of previous failed
  musical results. Signalsmith Stretch and original-audio editing remain
  assistant proposals requiring implementation and listening validation.

## D-2026-10-25-1 · Song-first project entry and playlist interaction — ACTIVE

- User: all new/opened projects enter arrangement. Replace its RootSound row
  with project name, centered transport/rate/BPM/master volume and Save/Save As.
  Save/Ctrl+S writes the existing project; Save As creates a complete new named
  folder, default original-name plus “ 1” under installation/project/.
- Shelf holds only phrases and a same-sized plus tile. Timeline has seven rows
  by default and a non-droppable plus row without vertical lines. Mixed phrase
  tempos retain original timing. BPM affects grid only; blank drag offsets grid
  (implementation interpretation), wheel pans, Shift vertical pans, Ctrl horizontal
  zooms and Ctrl+Shift vertical zooms. Grid is viewport-rendered and extensible.
- Rates0.75/1/1.25 change cursor advance and future trigger spacing, never note
  hold/release or sample pitch/rate. Pause/resume retains note age. Q/E pan,
  W/S gain, A/D position; double-click edits, right-drag erases instances with
  quick linear white-outline expansion. Keep reusable phrase in the shelf.
- Horizontal edits use releasable magnetic alignment. Preview edits live and
  persist gestures once. Current bounds128 rows and existing musical limits
  remain implementation limits; existing row counts are preserved on reopen.
  Full GUI/listening acceptance is separate from programmatic verification.

## D-2026-10-26-1 · Row controls and cursor-anchored visual tempo — ACTIVE

- User replaces the unbounded-left/drag-phase grid: timeline starts at zero,
  columns have no time labels, blank dragging no longer moves the grid. Larger
  rows have pinned controls: inline name (new default 行n), color, two-click
  deletion, full-row selection and smooth drag reordering.
- Selected clips or rows use Q/E pan, W/S gain, A/D fine position; two quick
  presses of the same A/D move a total of one visual beat, clamped at zero.
  Clip drag visuals remain continuous even when final placement is discrete.
- Playhead is draggable while stopped or playing; a top time box follows it.
  Square stop returns it to zero and pauses. Repair reported continue failure.
  BPM changes apply to the background at/after the cursor; left-hand lines
  remain unchanged and phrase audio timing remains independent.
- Implementation choice: retain later explicit BPM markers when editing an
  earlier section, restart grid lines at each marker, and lock the marker
  time when entering BPM editing so typing during playback creates one section.
  These details are reversible choices, not additional user-confirmed policy.
- Empty phrase shelf covers the playlist with “先创建乐句把” and left arrow,
  highlighting creation. Shelf tiles become flatter rectangles. This supersedes
  D-2026-10-25-1's negative viewport/blank-drag phase interpretation.

## D-2026-10-26-2 · Reset future grid, explicit project exit and clearer controls — ACTIVE

- User clarifies BPM edits must reset ALL grid lines at/right of the playhead,
  removing later tempo changes. This supersedes D-2026-10-26-1's provisional
  preservation of later markers. Earlier lines and musical timing stay intact.
- Red Exit follows Save As. User explicitly chooses returning to welcome,
  rather than closing RootSound. Unsaved work prompts cancel, discard, or save
  and exit. Discard restores the session opening/manual-save checkpoint;
  unsuccessful saving/restoration keeps the project active. Editor loading
  scaffolding is excluded from dirty detection; repeated reload cannot clear it.
- Names use less control space; single click selects, double-click name edits.
  User requests finer clip positions, more vivid colors and higher contrast
  theme, empty message ending “吧”, and clicking blank timeline seeks the head.
- Implementation choices: 24-color palette/custom colors, neutral navy theme,
  readable light/dark text, smaller magnetic tolerance and Shift 0.1 motion
  with no snapping. These remain refinable design choices, not visual acceptance.

## D-2026-10-26-3 · Context console and project discovery — ACTIVE

- User requests ordinary, simple, bright default colors instead of a decorative
  palette. Arrangement uses light gray/white and one muted default clip color;
  explicit user row colors remain. Row color hit area widens.
- Add bottom context console. Instance: source BPM/duration/start-time text,
  name double-click editing, direct phrase editor, graphical gain/pan controls
  supporting drag/wheel. Row: name/color, bus gain and pan offset. Shelf click
  selects all uses but console is metadata-only (name/duration/detailed editor);
  QWEASD disabled. Double-click placed clips edits directly.
- User first allows start-time editing, then explicitly calls it noneditable.
  Assistant announced the latter interpretation; position remains editable by
  timeline drag/keys. This is an interpretation, not a separately confirmed
  user answer. Console hides when nothing is selected to keep working space.
- Shelf metadata edits target the shared source; ordinary occurrence edits
  retain copy-on-write. Whole-source detailed editing selects current-song
  uses; shared identity may be reused only when all logical uses are selected
  and no pending source edit would be hidden; otherwise retain safe forking.
- Project title supports double-click rename; manual Save/Save+Exit updates
  manifest display name without moving its folder (implementation choice).
  New-project naming has Back. Open-existing lists valid direct children of
  default project/, with final custom-folder entry. Outside folders remain
  manually opened; catalog reading does not register or mutate projects.

## D-2026-10-26-4 · No automatic placement attraction — ACTIVE

- User cancels the earlier slight magnetic pause on alignment. Song clip drag,
  shelf placement and A/D nudges now follow actual coordinates/deltas without
  attraction to beat/bar lines or neighboring clip edges. This supersedes all
  earlier arrangement magnetic-alignment implementation choices. Shift fine
  movement and deliberate double-A/D one-beat commands remain distinct controls.

## D-2026-10-26-5 · Song and phrase libraries with complete project files — ACTIVE

- Welcome has only brand, greeting and Start. Start opens Song Library: a top
  New tile, recognizable default-location projects as square tiles, and a bottom
  file-picker tile. New uses the existing naming/settings flow; entering songs
  still opens arrangement. This supersedes the two welcome buttons/dropdown.
- Arrangement shelf + opens Phrase Library, scoped to this song and initially
  empty; library + creates. The library keeps reusable created phrases, excludes
  history, and is independent of which phrases are currently visible on shelf.
- Dragging shows a translucent bottom-right trash target. Timeline trash removes
  the dragged occurrence(s), as right-click removal does. Shelf trash hides only
  the shelf entry, preserving library and placed references; readding reuses ID.
- New songs use one self-contained project file directly under default project/,
  replacing per-song folder creation. Implementation choice: .rootsound v2
  RootSoundWorkspace envelope, embedding full material-library snapshot including
  audio, drafts and undo. Prior folder projects remain readable/saveable; Save As
  writes the new format. Preserve existing files, no automatic destructive migration.
- .rsproject remains the narrower legacy graph-exchange format. File names stay
  at their original path when display titles change; Save As chooses a new file.

## D-2026-10-26-6 · Compact library cards and confirmed permanent deletion — ACTIVE

Console timing and trash placement below are superseded by D-2026-10-26-7;
the deletion rules remain active.

- User clarifies that library boxes mean rectangles, not squares. Both song and
  phrase libraries use compact rectangular cards, superseding RB55's square UI.
- Selection console reveals after pointer release; held selections/drags hide
  contents without changing the existing footprint. Its own sliders remain live.
- Bottom-right trash displays the icon alone, with no visible label or tooltip;
  accessible labels remain. Library entities also support dragging to this target.
- Library trash asks for confirmation before permanent deletion. Song deletion
  removes its project file and backup (or recognized legacy project files), and
  rejects active/locked/replaced/linked/unknown-content targets. Shelf hiding and
  timeline occurrence removal retain their previous narrower meanings.
- Phrase deletion removes source/drafts, all current-song placements and related
  recovery history, while retaining independent tones/samples and other songs.
  Implementation interpretation: no normal Undo or Exit-discard resurrection.
  The warning discloses all placements/history and saving the current project.
  A successful permanent storage write atomically checkpoints editable state;
  failure changes neither library/token/history nor checkpoint. Title metadata
  still follows normal manual Save. Ordinary filesystem backups remain for
  deliberate manual recovery; secure disk erasure was not requested.

## D-2026-10-26-7 · Direct library naming and arrangement interaction — ACTIVE

- Both song and phrase libraries support double-click inline rename. Single-click
  opening/adding must not preempt renaming. Implementation choice: use the Windows
  double-click interval plus 50 ms; when unavailable, wait 600 ms. Song-library
  rename updates both the project display name and the actual selected song draft.
- Row controls provide Solo and Mute icons. Solo immediately isolates this row
  and unmutes it; a zero row gain becomes 100% (implementation interpretation of
  making it audible). Other rows retain their own levels/mute settings. Muting a
  solo row keeps the other rows quiet; cancelling solo restores their normal mix.
- Double-clicking any placed phrase opens that occurrence in phrase editing.
  Repair the earlier ineffective callback: retain the clicked node and recognize
  consecutive stationary clicks of the same entity across redraws and small jitter,
  without opening twice when the native double-click event also arrives.
- Only the top ruler/head handle summons and drags the playhead. Dragging other
  blank playlist space pans the view, horizontally by default and vertically with
  Shift; it does not seek. This supersedes the prior blank-space seek behavior.
- Shelf phrases can be reordered by dragging, with neighboring cards smoothly
  moving aside. Keep the order in the song; hiding/readding, renaming, undo,
  reopening and native Save As retain the same phrase identities.
- The console appears immediately on selection, replacing D-2026-10-26-6's
  release-time reveal. Add an audition icon to phrase/occurrence consoles.
  Implementation choice: audition the source phrase, with stop/loading cancellation
  and cleanup on selection change, navigation or song playback; row consoles have
  no phrase audition.
- Put the icon-only trash in the playlist's upper-right corner, without a box
  outline, using a surrounding white fade. Library dialogs use an upper-right
  target too. Existing hide/instance/permanent-delete scopes remain unchanged.
- Save As asks only for a name, defaulting to the original name plus " 1", and
  creates the independent copy in the default song-library directory. Creation's
  separate location settings remain available; Save As no longer asks for a path.
- Storage interpretation: library rename preserves file paths/IDs and uses the
  application's domain transform plus a version-checked native snapshot commit.
  Legacy two-file commits validate staged originals against that snapshot before
  replacing anything, including late external edits and A/B/A changes.
- Native .rootsound snapshots preserve shelf metadata exactly. The older, narrower
  .rsproject graph exchange still does not remap display-order metadata on import;
  it is not the complete-workspace transport. Programmatic checks do not constitute
  acceptance of real appearance, gesture feel or listening quality.

## D-2026-10-26-8 · Four-bar melody/rhythm phrase workspace — ACTIVE

Length update: D-2026-10-27-6 replaces the fixed four-bar cap with a shared,
bar-extendable phrase length. Four bars remains the initial length only.
The blank/no-authoring description below records the RB58 shell. D-2026-10-26-9
adds a new Melody editor while keeping the overview blank and the old editor unmounted.
Later updates: D-2026-10-28-3 adds overview notes and linked navigation;
D-2026-10-28-4 replaces fixed equal heights with an adjustable divider.

- User replaces the main phrase-writing interface with a song-style top bar,
  showing the phrase name at left. Creation skips a naming dialog and chooses
  an available 乐句 n; Save retains the phrase in this song's Phrase Library.
- The remaining space is two equal, full-width rectangles: Melody above Rhythm,
  separated by a horizontal line. Equal-width left controls carry their names;
  the right canvas is shared, with no row lines, column lines or displayed notes.
  The narrow strip above Melody holds the one shared playhead label.
- Only that strip or the head label seeks/drags the head, including during
  playback. Blank dragging and wheel pan horizontally; Ctrl+wheel zooms
  horizontally. There is no vertical scrolling or Shift-specific vertical mode.
  The window spans four bars rather than the arrangement's extensible timeline.
- Implementation choices: four bars means16 beats; new phrases have that stored
  length. Save/Ctrl+S remains in the workspace, Save As automatically names and
  opens an independent same-song copy, and Exit returns to arrangement. Header
  gain is persisted in the phrase; omitted gain in older content means unity.
- Audition ends and resets at16 beats, with speed choices0.75/1/1.25; ordinary
  notes retain their sound clocks. BPM changes preserve the head's beat position.
  Only preview boundary tails are bounded; older long phrase bodies/notes and
  full-song playback/export remain intact, without destructive shortening.
- Existing detailed-editor source and note data remain, but the new main route
  does not offer its old controls or an entry into it. Melody/Rhythm creative
  tools are further work; the blank workspace is the explicitly requested shell,
  not a claim that new note-authoring tools have been implemented. No actual
  desktop or sound verification is implied by programmatic checks.

## D-2026-10-26-9 · Melody creation, four cells per beat and fixed-second notes — ACTIVE

Library update: D-2026-10-27-7 expands new-song starters from two to seven and
replaces add-and-close with continuous library selection, undefined silent tone
uses and explicit audition/removal controls. Other timing/editor rules remain.

- User confirms four cells per beat as the common timing division for piano roll
  and future step sequencing. Note starts use beats/cells and follow phrase BPM.
  On changing BPM, each note keeps its original seconds duration; only starts
  change. Pitch and timbre remain unchanged. This is distinct from arrangement's
  background-only BPM and from the independent playback-head speed control.
- A56px-wide Create strip at the overview Melody section's right opens this
  phrase's new Melody editor. Keep the header and transport; show the phrase
  name plus Melody badge and provide Back to overview. The blank overview and
  retained legacy detailed-editor source are not the new note-authoring UI.
- A tone shelf plus opens the compact, song-isolated Tone Library. It contains
  current-song voices, initially including 钢琴 and 长笛, with unique per-kind
  names. These are local synthesized starting voices, not acoustic samples;
  repeated entry retains their identities, user changes and names. Reusing a
  tone selects its existing part rather than creating duplicate parts. Preserve
  existing/customized data when replacing an untouched empty generated default.
- The continuous full-range SPN keyboard auditions the selected tone; adding
  a note auditions it too. Notes are colored by tone; actual notes of other
  tones are strongly dimmed references, not empty ghost notes, and still play.
  Continuous dragging follows the pointer before release settles onto the grid.
- Each note owns level, pitch, start, pan, seconds duration and velocity.
  Tone selection shows only its name in the console; note selection exposes
  editable note attributes. Q/E adjusts pan, W/S level and A/D one cell; two
  same-direction presses within150ms move one beat in total. Do not present
  unsupported pizzicato/bowing controls for the two supplied starting voices.
- Compatibility implementation: optional durationSeconds stores physical length;
  header setTempo(value,{preserveNoteDurations:true}) materializes old notes'
  original duration before retiming starts. Old bodies remain readable without
  forced global migration. Rhythm authoring tools remain future work. Final
  regression/build evidence and actual GUI/listening acceptance are separate.

## D-2026-10-27-1 · Tone-row rhythm creation with shared editing controls — ACTIVE

Playback scope update: D-2026-10-27-5 isolates each detail editor's audition;
the shared/full playback below now means overview, arrangement and complete output.

- User adds a Create strip at the overview Rhythm section's right. It opens this
  phrase's Rhythm editor, inheriting the phrase header and Melody's tone shelf,
  tone library and console. Save and transport belong to the same phrase.
- Rhythm is a roll-like step sequencer with wide rows. A row means a tone rather
  than a pitch, and its left tone block aligns one-to-one with the right row,
  like arrangement controls. Keep vertical movement/row sizing aligned.
- Note placement, dragging, right-click cancellation and the existing QWEASD
  controls work like Melody. The console follows the same selection model but
  omits pitch. Keep four cells per beat and the confirmed BPM rule: onsets follow
  musical cells, while held seconds, physical pitch and timbre stay unchanged.
- Implementation interpretation: optional per-part department metadata separates
  Melody and Rhythm authoring; old omitted metadata means Melody. Both groups
  remain in the same phrase, save/export and play together, and use one song's
  tone library. Reusing a tone deduplicates within a department, not across both.
- Cross-row note drag uses the destination tone while preserving note identity,
  pitch and other note parameters. New rhythm notes provisionally trigger C4;
  this is an implementation starting point, not a user-approved root-note policy.
  No pitch/root-note control is shown in Rhythm, and opening old data never
  rewrites its pitch. Actual appearance/gesture/listening acceptance remains
  separate from code checks.

## D-2026-10-27-2 · Direct shelf editing, object labels and broader trash fade — ACTIVE

- Double-clicking a phrase card in arrangement's left shelf opens its phrase
  authoring interface. Single selection and drag behavior continue. This does
  not repurpose double-click rename inside the song or phrase library dialogs.
- Add a small type label after the header name: 乐曲 in song arrangement, 乐句
  in phrase overview and both Melody/Rhythm editors. Keep department labels.
  Implementation interpretation: the type is a separate display element so
  inline renaming and saved names do not acquire an automatic suffix.
- Widen the white mist around the icon-only trash. Preserve existing deletion
  scopes; the request does not authorize broader deletion or a larger hit target.
  Halo size, icon size and target dimensions are implementation choices, not
  user-prescribed measurements. Headless verification remains distinct from
  actual appearance and gesture acceptance.

## D-2026-10-27-3 · Chromatic keyboard step entry in Melody — ACTIVE

Activation/length update: D-2026-10-27-6 makes performance an opt-in preference,
off by default, and uses the actual extendable phrase boundary instead of16 beats.
Selection-context update: D-2026-10-27-4 permits continuous entry after automatic
new-note selection; other mappings, boundaries and timing policies below remain.

- In Melody, select a tone and use `c f v g b n j m k , l .` for Cn, C♯n, Dn,
  D♯n, En, Fn, F♯n, Gn, G♯n, An, A♯n, Bn. Z/X moves one octave down/up; Space
  enters a rest. This mode applies only to tone-only selection, not note selection
  or Rhythm. Elsewhere Space keeps the existing play/pause behavior.
- Implementation interpretation: the next cell is the strictly next grid line
  right of the current head. A note begins there, and the head moves there once,
  never a second cell for the same key. A rest advances once without a note or
  starting transport. New notes initially hold one cell's seconds; the confirmed
  fixed-second duration policy still applies to later BPM edits.
- Current implementation choices: octave4 initially, n clamped to0–8 while the
  20–5000Hz note range still applies, and tone selection retained for continuous
  entry. Unsupported edge pitches do not write or advance. Do not treat these
  bounds as a permanent product limit or as user acceptance of the feel.
- Preserve text/input controls, modifier shortcuts, IME composition and dialogs;
  held-key auto-repeat must not flood notes. Stop at the usable four-bar boundary.
  Successful entry follows existing undo/save/project protocols; program checks
  remain distinct from real keyboard and audio-device acceptance.

## D-2026-10-27-4 · Undo, new-note focus and compact editor selection — ACTIVE

Cursor update: D-2026-10-27-6 restores the cursor when undoing/redoing a
performance-generated note; ordinary edits still do not move it. This is
session-associated cursor metadata, not a new persisted cursor-history stream.

- Backspace undoes the last edit; Delete remains explicit deletion. Implementation
  scope: use current musical-domain history, without newly persisted cursor/view
  history or a special head rewind. Text/value input retains native Backspace.
- New notes become selected. Preserve continuous Melody typing with an independent
  armed tone context: automatically selecting a new note must not end step entry.
  Undo/redo keeps that context if its tone remains valid; manual existing-note
  selection or right blank ends it. Space rests while armed and plays otherwise.
- Put Melody/Rhythm consoles only beneath the right editor, not below the left
  tone shelf. The left shelf keeps the editor's full available height.
- Note rectangles fit their actual occupied duration without padding or a minimum
  width stretching short notes. This does not limit long notes to one cell or
  shorten held audio; existing beat-onset/fixed-second timing remains.
- Right blank clears all selection and its console, including notes, tones, rows
  and shelf phrase sources. It makes no musical edit. Right-clicking notes and
  right-dragging their hitboxes still erases them. Program checks remain separate
  from actual visual, gesture and listening acceptance.

## D-2026-10-27-5 · Generated-note audition, section playback and octave row edges — ACTIVE

- A generated note sounds once. Implementation timing: mouse press auditions the
  temporary note immediately, release commits without replay; successful keyboard
  entry auditions after transport positioning settles. Rests, guarded inputs and
  held-key repeat do not audition. Pending work must not sound after its selection
  scope changes or its editor closes. Existing note timing and duration rules remain.
- Melody detail plays only its Melody notes; Rhythm detail plays only its Rhythm
  notes. Overview plays both. Implementation interpretation: live view switching,
  mix/BPM edits and pause/resume preserve that scope; an empty section runs silently.
  The filter belongs to a temporary sound plan, never saved phrase data. Complete
  phrase compilation, arrangement and export continue to include both sections.
- Remove Cn–Bn from the console. Indicate the active keyboard-entry octave by
  highlighting the corresponding pitch rows' left edges; Z/X moves that range.
  Implementation interpretation: use the existing armed tone context, preserving
  highlights when a new note is automatically selected, clearing on manual existing
  note selection/right blank, and showing no octave range in Rhythm. Edge pitches
  still obey the existing supported range. No extra text or controls are required.
- These implementation choices and program checks are not actual appearance,
  keyboard/gesture or sound-device acceptance.

## D-2026-10-27-6 · Opt-in keyboard performance, view navigation and bar extension — ACTIVE

- Put Settings immediately before Save in module top bars. Keyboard performance
  (`c f v g b n j m k , l .`, with the existing octave/rest keys) is a persisted
  setting, disabled by default. Closing settings refreshes the editor. Existing
  text/value input, IME, dialogs and unrelated shortcuts remain protected.
- Z/X changes the active octave and vertically centers its highlighted pitch-row
  range in the visible piano roll, constrained by the supported pitch boundaries.
- Arrows pan the piano roll, rhythm step view and song playlist. Ctrl+Up/Down
  zooms vertically; Ctrl+Left/Right zooms horizontally. Implementation choices:
  center-anchored zoom, Right/Up enlarge and Left/Down reduce,64px horizontal
  pan and one current row vertical pan. Navigation alone changes no music/history.
- Undoing a performance-generated note restores the playhead to before that
  entry; redo restores its after-entry location. Ordinary edits do not move the
  head. Implementation: associate these coordinates with the editor session's
  musical undo/redo state; do not persist a separate cursor history in the project.
- A rightmost + column in Melody and Rhythm extends their shared phrase by one
  bar (four beats). Start with four bars; use the full length for overview,
  preview, saving, arrangement and export. Preserve existing music and fixed-second
  durations. Implementation choices: retain cell width and reveal the new end;
  the then-current domain ceiling was64 beats/16 bars, where + became disabled.
  RB75 supersedes that implementation limit; it was never a permanent product decision.
- These replace the earlier fixed16-beat viewport, always-active keyboard entry
  and blanket no-cursor-rewind policies only within the scopes above. Actual
  desktop interaction and listening acceptance remain separate from code checks.

## D-2026-10-27-7 · Persistent library selection, undefined tones and bundled voices — ACTIVE

Melody membership toggles below are superseded by D-2026-10-27-8; Rhythm and
phrase-library selection retain these policies. Historical verification keeps its scope.

- Tone and phrase libraries remain open while cards toggle selection; their upper
  right return control is a right arrow. Phrase selection controls shelf visibility
  only: hiding a source never removes its placed instances or its saved identity.
  Preserve inline double-click rename and existing guarded permanent deletion.
- User clarification replaces the initial assistant idea of merely hiding a tone:
  unchecking retains its notes but leaves their tone undefined and silent. Undefined
  parts remain visible in the left shelf. Implementation: an optional `unassigned`
  flag defaults to assigned for older data; retain the original binding so rechecking
  restores the same parts/notes. Its library card is unselected while undefined;
  project saving and transfer preserve the undefined state and notes.
- A selected left tone clears all its notes only after two Delete presses. The
  implementation currently uses a500ms interval. Its console Delete button requires a double-click; a single click
  does nothing. Clear the notes in one undoable edit while retaining the tone part.
  Delete on a selected individual note retains its existing individual-note meaning.
- Tone library cards can be dragged to an icon-only trash. Implementation scope:
  remove matching parts and their notes only in the current phrase department, with
  undo available. Keep the song's tone asset, other department and other phrases.
  This is distinct from unchecking a tone, which keeps undefined notes.
- A separate play button beside shelf and library tone cards auditions the tone
  without changing selection, library membership or musical content. Undefined
  shelf tones have no playable voice and their audition control is disabled.
- New songs own seven independent bundled local synthesis starting points: 钢琴,
  长笛, 底鼓, 踢, 弦乐, 小号 and 吉他. The two drum labels represent different sound
  flavors. These are synthesized approximations, not recorded instruments; preserve
  project isolation, edited names and sound data, and idempotent preparation.
- Make tone, phrase and song cards smaller while retaining their rectangular form.
  Support an empty phrase even after its last part is removed in the new phrase UI.
  These rules supersede the former add-and-close libraries and two-starter palette
  within this scope; historical verification is not reinterpreted as current proof.
  Program checks remain separate from actual interface and listening acceptance.

## D-2026-10-27-8 · Melody total-note families and a single-tone picker — ACTIVE

- Melody's left sidebar is a note-family shelf. The user's term is 总音符: each
  box controls one independent family of roll notes. Display only its contained
  tone's name, not a separately exposed family name.
- + still opens the current song's tone library, but this Melody context chooses
  one tone rather than toggling membership. Implementation: choosing creates a
  new family and returns; cancelling creates no empty family or reassignment.
  Other families are dimmed independently, including those sharing its tone;
  note colors remain tone-based. Multiple families may share the same tone; identical
  visible tone labels do not mean duplicate tone entities or merged note families.
- A selected total-note console offers 更换音色. Its single-tone picker changes
  only this family's tone for all its notes. Preserve family and note identities,
  onset, physical pitch, held seconds, level, pan and velocity; do not alter other
  families, Rhythm, other phrases or the tone asset itself. Keep undo/save/transfer.
- Implementation scope: existing phrase parts map directly to these families,
  without forced file migration. Existing undefined families remain silent until
  assigned a tone; choosing a replacement defines that family again. Keep the
  shared playhead position when changing its tone.
- This request targets Melody. Rhythm retains its tone shelf and multi-select
  library behavior; phrase-library shelf selection also continues. Existing
  standalone audition and guarded clearing of a family's notes remain available.
  Actual interface/gesture and listening acceptance remain separate from checks.

## D-2026-10-27-9 · Focus the audience on electronic and rhythm-game music beginners — UPDATED BY D-2026-10-27-10

- User narrows RootSound's current intended audience from all beginning music
  creators to beginners interested in electronic music and rhythm-game music.
  This is the user decision; it is not evidence of market size or willingness to pay.
- The purpose of reducing the friction between musical ideas and editable work
  continues within that audience. Existing Windows-first and offline-first decisions
  remain applicable. This does not authorize unrelated implementation or deletion.
- Exact substyles, the first successful user task, release priorities and commercial
  offers remain undecided. Suggestions such as starting with short editable examples
  are assistant proposals, not accepted requirements or promised capabilities.

## D-2026-10-27-10 · Rhythm-game music creation is the final purpose — ACTIVE

- User's latest exact wording of the product's final purpose is: 让音游曲爱好者快速上手做出满意的音乐
  (enable rhythm-game music enthusiasts to get started quickly and create
  music they find satisfying). The audience is 音游曲及周边曲风爱好者
  (enthusiasts of rhythm-game music and adjacent styles). This replaces the earlier universal
  all-people/any-sound goal, not merely the marketing audience. Low learning and
  operation friction remains a design principle serving this outcome.
- User's rationale: generic beginner music tools do not offer sufficient competitive
  distinction, RootSound currently has no irreplaceable core capability, and the user
  is a music-production beginner whose tastes do not strongly favor mainstream pop.
  Focusing on familiar musical interests is their chosen response. These are the
  user's stated judgments and circumstances, not validated market size, demand or
  willingness-to-pay findings. Questions about niche size and the difficulty of
  helping beginners create complex music remain open; they do not approve features.
- User confirms the next milestone: first make an original passage satisfying,
  then extend to a full song through the same workflow. A short passage is a
  milestone, not a replacement for the complete-song final purpose.
- User chooses `D:/Sound/temp/music/vulcanus.mp3`, 0–20 seconds, as the first
  listening reference. The reference window does not prescribe output duration
  or authorize claiming copyright in that recording. Earlier Vulcanus experiments
  and their failed listening acceptance remain historical evidence, not approval.
- User explicitly identifies the vocals and background melody as the important
  features of this first reference. Prioritize their musical result in this
  experiment; this is not listening acceptance of the generated draft.
- Specific musical acceptance criteria, the original passage's length, style
  scope, completion-time targets and exact assistance model remain to be agreed.
  Do not equate all rhythm-game music with one genre, a high BPM or one preset.
- Existing architecture, Windows/offline decisions, data protection and ownership
  boundaries continue unless separately revised. This purpose change does not
  authorize code deletion, a new full rebuild or arbitrary-song reverse-engineering
  claims. Proposed priorities must be evaluated against musical results and user
  ability to make intentional changes; program checks are not listening acceptance.

## D-2026-10-28 · Detailed synthesis experiment with three independent curves — ACTIVE EXPERIMENT SCOPE

- User requests a standalone experiment in the experiment directory, with oscillators,
  a detailed multi-point spectrum curve, a multi-point volume envelope and further
  precise sound-design controls. This does not approve replacing the main workstation.
- User clarifies two different frequency-related curves: a static frequency-to-gain
  curve, and a dynamic time-to-fundamental-pitch curve. Keep these independent of the
  time-to-volume envelope rather than treating all three as one control.
- User later caps each curve at 10 control points and requests a slider to adjust
  their number. This supersedes the assistant's dense 64/32-point default and
  512-point editing capacity for this experiment. The default of 6 and a minimum
  of 3 when protecting an interior sustain point are implementation choices.
- Relative semitone pitch coordinates, sustain/release semantics, component counts,
  synthesis algorithms and the `.rssynth` format are implementation choices for
  this experiment, not new user-confirmed product requirements or listening approval.

## D-2026-10-28-2 · Import MIDI through the song library folder tile — ACTIVE

- User explicitly approves selecting a `.mid` or `.midi` file from the song
  library's existing folder tile and importing it as an editable project. This
  applies to the main workstation, not only an independent experiment.
- Adopted behavior: create a separate RootSound song, enter Arrangement and save
  it in the default project directory, preserving the original MIDI. Imported
  notes and phrases must remain editable; instrument matching provides initial
  replacement sounds rather than claiming recovery of original audio/plugins.
- Current supported formats, resource bounds, automatic naming, zero-gate drum
  handling and how unsupported controls are disclosed are implementation choices.
  Do not turn a current format/size limit or approximate instrument mapping into
  a permanent product decision, or equate program checks with listening acceptance.

## D-2026-10-28-3 · Two-axis dragging and linked phrase previews — ACTIVE

- User requests dragging blank workspace space to pan horizontally and vertically
  at the same time. Apply this navigation to Arrangement, Melody and Rhythm.
- The phrase overview must show each department's own notes instead of remaining
  blank. Melody and Rhythm share horizontal position and zoom, while their
  vertical navigation remains independent.
- Implementation choices for RB73: retain a read-only overview with Create entries;
  use a 4px click/drag threshold, shared seconds coordinates, independent vertical
  offsets/heights and a deterministic phrase-wide tone palette. The navigation
  state is UI memory for the currently mounted phrase, not a new saved project
  format or a promise to restore the view after restart. These details are not
  additional user-mandated permanent constraints or actual gesture/listening approval.

## D-2026-10-28-4 · Adjustable Melody/Rhythm overview heights — ACTIVE

- User requests a draggable divider with symmetric height adjustment. When only
  one section has no notes to preview, that empty section should default to its
  minimum height. This supersedes the earlier fixed equal-height arrangement.
- RB74 implementation choices: 15%–85% symmetric bounds, at least 64px per
  section where possible and equal sharing in very small windows; both populated
  or both empty defaults to equal heights. Undefined-tone notes count as content.
  Keyboard adjustment, complete gesture cancellation and current-mount memory
  are implementation choices, not new permanent product requirements.
- The layout remains UI state: in-place Save and detailed-editor return retain
  it, while a real newly opened draft chooses its default. No new project-format
  or cross-restart layout-persistence promise, and no actual gesture/FPS acceptance.

## D-2026-10-28-5 · Import project-owned tones and permit longer phrases — ACTIVE

- User requests a + tile in the tone library to select an external tone file,
  remembering the last picker directory. Imported tones are available to all
  phrases in that song and isolated from other songs. Store local copies in a
  fixed directory organized by song; never depend on the external source file.
- User identifies short MIDI phrases and asks to increase the phrase ceiling.
  RB75 removes fixed four-bar MIDI slicing. The 1024-beat / 50000-note ceiling,
  tempo/resource-based splitting and preservation of leading/trailing rests are
  implementation choices, not new permanent product limits. Existing edited
  projects are preserved; reimport MIDI to use the new segmentation.
- Current implementation accepts .rssynth and .rssound. .rstimbre is an earlier
  sample-instrument archive and remains unsupported rather than approximated.
  Mirrors live in timbres/<manifest-id>/; the self-contained .rootsound remains
  authoritative. Mirrors exclude history, foreign songs and stale drafts and
  can be regenerated when reopening or transferring a project.
- Spectral parameters are preserved and independently gated notes use the same
  synthesis engine in a background worker. Cross-note monophonic glide, shared
  effect state and voice stealing are not reproduced. Neither program checks
  nor exact single-note output constitutes multi-note listening acceptance.
