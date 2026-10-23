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

### RB2 · Decide the boundaries required for the first working path — DONE 2026-10-23
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
- Resolution 2026-10-23: the complete basic sound/phrase/song path now
  exchanges public capabilities and common, versioned content. Beat-based
  music and explicit Hz compile into second-based execution plans; saved
  identities/revisions and independent drafts survive recovery. Original
  phrase speed is explicitly confirmed. RB7-RB12 verify this minimal model;
  future departments, portable containers and final technology remain open.

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

### RB4 · Choose Windows host and extend the first creative workflow — DONE 2026-10-23
- What: assess a Windows desktop host, actual file persistence and device
  adapter under existing public contracts; then add phrase and arrangement
  capabilities without importing the legacy model. Set musical time/pitch
  semantics before those features exchange data. Full portable packaging
  and co-creation remain separate acceptance work, not completed by RB3.
- Progress 2026-10-23: a replaceable Windows Forms/WebView2 host now runs
  the single-timbre flow with durable local storage and native sound-file
  dialogs (RB6). Phrase/song semantics, workflow expansion and further
  device capabilities remain open; this does not select the final stack.
- Resolution 2026-10-23: RB7-RB12 complete the first native sound-to-song
  workflow, persistent recovery and ordinary WAV delivery. The current
  host/device adapter is verified and replaceable. Further device inputs,
  native low-latency drivers, co-creation and complete portable packaging
  remain separate future scope in docs/REBUILD_PLAN.md.

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

### RB6 · Verify Windows desktop, local storage and single-sound files — DONE 2026-10-23
- Where: desktop/, scripts/, src/workstation/app/platform/, file contracts,
  sound-file tests and docs/WINDOWS_DESKTOP.md.
- Resolution: added a native Windows window with locally loaded UI, atomic
  disk replacement, previous-version backup, instance locking and external
  edit detection. RootSound.bat builds when needed and opens that window.
  Native file dialogs exchange strict .rssound single-timbre files; import
  creates a new draft and preserves existing content. Browser export remains
  available for explicit transfer. Gesture previews commit on release.
- Verification: 42 application tests and 10 actual disk tests passed;
  native save/open with Chinese paths, audition completion, and full exit/
  reopen recovery were checked. No full song format, installer, phrase/song
  editors, native low-latency driver or automatic browser-data migration.
- User acceptance: the user completed the desktop checks and reported
  success before authorizing the next phrase workflow on 2026-10-23.

### RB7 · Independent editable phrase workflow — DONE 2026-10-23
- What: reference saved timbres from multiple phrase parts; edit note
  positions, durations and physical pitches in beat-relative time; compile
  through public timbre capabilities and execute on the common device clock.
  Keep phrase editing in its own focused workspace with undo/redo, safe
  saving, drafts and reopen recovery. Include unfinished references in
  overwrite warnings. No song editor or portable phrase/song package yet.
- Resolution: independent phrase unit and focused UI now reference saved
  timbres through common public capabilities. Beat-relative events retain
  explicit Hz pitches; the device schedules overlap and tails on one clock.
  Added per-draft session undo/redo and missing/unsupported-content recovery.
  Working drafts are included in overwrite impacts and confirmation checks.
- Verification: 69 application tests and the final desktop build passed
  (zero warnings/errors). Actual desktop checks covered creation, note
  placement, continuous dragging/resizing, naming and saving, a second
  timbre and overlapping audition. Full exit and Continue restored the
  phrase name, two parts and four notes including the changed pitch/length.
  Sound quality and interaction feel still require user evaluation.

### RB8 · Independent song arrangement — DONE 2026-10-23
- Resolution: public song contracts and a focused timeline reference saved
  phrases, preserve source tempos by default (D-2026-10-23-3), and support
  multi-track placement, continuous cross-track movement, copy/paste/repeat,
  level/pan/mute/solo, undo/redo, safe saving and draft recovery.
- Verification: native desktop placed 90/120 BPM phrases with distinct
  durations, moved and repeated clips, changed pan, and restored the saved
  two-track song after full exit. Automated cases cover source timing,
  natural tails, revision conflicts, growth, unsupported data and limits.

### RB9 · Phrase group editing and interaction — DONE 2026-10-23
- Resolution: marquee and modifier selection, bulk movement, internal
  copy/paste/repeat, velocity, zoom and keyboard editing. Musical gestures
  commit once on release; focus and same-draft scroll survive rebuilding.
- Verification: native desktop selected two notes, copied/pasted into an
  extended phrase, moved the pair, and saved six notes under a separate
  identity. Ctrl+A and arrow movement operated on all six after reopening.
  Bulk validation and failed writes leave content and history unchanged.

### RB10 · Ordinary playable audio export — DONE 2026-10-23
- Resolution: sound-runtime renders the same validated graph offline;
  current UI exports 48 kHz, 24-bit stereo WAV with progress/cancellation.
  Native writes validate bytes, preserve previous files, prevent reentry
  and coordinate same-target writes; browser reports download-started only.
- Verification: native WebView rendered and saved an actual 1.55-second
  sound and 8-second song; headers, nonzero PCM and stereo pan differences
  were independently checked. Public content-to-render integration covers
  mixed speeds, tails and shared dependencies. WAV is not an editable song
  package; complete portable project packaging remains open.

### RB11 · Common material catalog — DONE 2026-10-23
- Resolution: classify/search saved sounds, phrases and songs; distinguish
  unfinished drafts; read-only audition, public editor entry, transitive
  saved/draft usage and atomic duplication with a fresh content identity.
- Verification: native search and indirect usage displayed expected
  references; a phrase copy retained its sound dependency and left the
  original song references unchanged. Failed copies cannot partially commit.

### RB12 · Configurable creative entry — DONE 2026-10-23
- Resolution: separate display preferences can disable welcome and select
  a fixed or last workspace. Continue uses the actual previous workspace;
  direct entry uses the configured preference. Music storage is unaffected.
- Verification: disabled welcome, selected the material workspace, exited
  fully and reopened directly there; phrase and song contents remained.
- Combined verification for RB8-RB12: 117 application tests and 17 native
  disk checks pass; type checks and final desktop build pass with no build
  warnings/errors. Real UI checks used an isolated library; the user's
  running program and original library were not replaced. The five-batch
  continuous run is complete. Further scope is recorded in
  docs/REBUILD_PLAN.md.
- Final integration: development watching excludes generated desktop/cache,
  test profiles and legacy files; verified source watching remains active
  and the preview survives a concurrent successful desktop build.
- User acceptance, 2026-10-23: the user reports completing acceptance of
  this run. This does not turn the documented provisional implementation
  choices into permanent product decisions.

### RB13 · Live feedback while editing — DONE 2026-10-23, user acceptance pending
- Resolution: sound-runtime updates the active session on its existing
  device clock. UI sound controls, phrase gestures and song mixing/placement
  preview provisional bodies without saving each input. Release commits once;
  cancellation and failed persistence restore the committed audition plan.
- Verification: runtime and UI coordinator tests cover current/future notes,
  silent transport, stale requests, validation failure and resource cleanup.
  Native desktop audition continued during pan changes, mute/unmute and a
  phrase-note pitch drag; the playhead continued from its current position.
- Current limit: a short crossfade replaces the remaining oscillator graph;
  this is not the final professional engine for continuous parameter changes.

### RB14 · Undo and redo across restarts — DONE 2026-10-23, user acceptance pending
- Resolution: per-draft phrase/song history shares the library's atomic
  write, with 64 steps. Existing libraries work without conversion; history
  starts accumulating for edits made with the new version. Saved content
  identities and overwrite-impact rules remain separate from draft history.
- Verification: failed writes do not advance history; save-as, reopening,
  branching, stale-client protection and malformed history are tested. Native
  full exit/reopen restored undo; undo/redo changed the actual stored track
  mute state and both history stacks in the expected directions.
- Combined verification: 147 application tests pass. Desktop build and native
  disk checks are recorded in docs/REBUILD_PROGRESS.md. These two additions
  have not yet received user acceptance.

### RB15 · Current-occurrence editing and selected joint application — DONE 2026-10-23, user acceptance pending
- Resolution: copies share references. Enter a song clip's phrase and its
  sound; normal Save forks only necessary content and ancestors for that
  usage. Library sound/phrase editing saves a new material by default.
  Right-click joint editing or Apply elsewhere selects concrete locations.
- Nested external changes remain staged until the parent phrase is saved;
  cancellation leaves other works untouched. One durable transaction saves
  contents and reference rewiring, with compound undo/redo across restarts.
  Undo restores this joint operation's selected saved roots as well as the
  draft; it preserves works explicitly saved afterwards and their assets. Stale
  affected works reject the entire operation. An unfinished child must be
  resolved before the parent can be saved.
- Verification: 27 reference-workflow and 34 material tests, included in 189
  passing application tests; 17 native disk checks, type checks and final
  Windows build passed with zero warnings/errors. Isolated desktop tests
  changed only a song's second clip via nested sound editing, saved the song,
  then undid/redid its draft. Joint selection changed first/third clips and
  another song together, retaining the second clip and original materials;
  external works were unchanged while the parent edit remained pending.
- Current limits: before-edit scope selection is session-local and safely
  resets to current-only after restart; confirmed nested pending actions
  persist. Compound undo restores musical state, but not the older fine-grain
  history of child drafts removed by the compound save. External modifications
  can prevent a safe undo instead of being silently overwritten.

### RB16 · Portable complete project snapshot — DONE 2026-10-23, user acceptance pending
- Resolution: `.rsproject` v1 captures the current song draft and all
  transitive saved phrase/sound dependencies, preserving musical precision,
  speeds, mixing and repeated/shared uses. Unrelated works, history and UI
  preferences are excluded. Pending child edits must be finished or cancelled
  before export. Import validates versions, targets and complete acyclic
  dependency closure, then atomically creates fresh identities and a root
  draft without overwriting existing same-name or same-id content.
- Platform: native project dialogs and reliable file replacement/backup;
  browser transfer reports download-started only. Version, UTF-8, size,
  cancellation, stale writes and failure outcomes are explicit. JSON v1,
  32 MiB and 8192 contents are provisional implementation choices.
- Verification: 215 application tests pass, including 26 new project,
  platform and transfer cases. The final desktop build has zero warnings/
  errors; 28 native disk checks pass without opening any UI. Empty-library
  recovery preserves the exact playback plan; restart/edit/save, independent
  repeated import, failures and missing/unsupported dependencies are tested.
  No desktop screen/input tools were used and the user library was untouched.
  Actual dialog/workspace interaction remains for user acceptance under N13.
- Integration: the native library bound is now 128 MiB so valid 32 MiB
  packages can be imported into an empty library. An actual 18 MiB library
  write/read/reopen test covers the former 16 MiB boundary; existing capacity
  failure and preservation guarantees remain in force.
- Scope: includes all currently implemented music models. Sampling, plugins,
  richer processing, project history transfer and final packaging remain
  future scope; this is not the complete workstation.

### RB17 · Offline guided co-creation and fine-edit return — DONE 2026-10-23, user acceptance pending
- Resolution: Start journey opens an independent co-creation workspace.
  Start from a blank idea or saved phrase; audition three local rule-based
  directions, retain one, fine-edit through the existing phrase/sound
  reference workflow, then return and explore from the edited result.
  One action creates a new song referencing the selected phrase, preserving
  the previous song draft. No network, AI, voice recognition or taste
  learning is claimed or required by this first implementation.
- Storage and music: unselected previews stay in memory. Selection commits
  only the chosen sounds, phrase and session together; stale choices and
  storage failures preserve existing work. Original notes, arbitrary Hz and
  timing precision remain intact. The first round may add limited bass and
  accompaniment; subsequent rounds do not keep piling on layers.
- Recovery: sessions and compound undo/redo survive restarts. Material already
  used in a song survives co-creation undo; song project export contains the
  music without exploratory session history. Pending nested edits block new
  choices and song adoption until finished or cancelled. Returning to the
  same editing location resumes its draft rather than creating a hidden
  duplicate. Earlier journeys remain accessible in the material catalog;
  co-creation is also a selectable startup workspace.
- Verification: 244 application tests pass, including 29 new generation,
  controller, atomic song creation and editing-return cases. Type checking
  and the full Windows build pass with zero warnings/errors. Reports:
  .test-output/co-creation/tests-final.log and build-final.log. No desktop
  observation/control or user-library access was used. Actual visual quality,
  interaction and musical appeal await user acceptance under N13.
- Limits: three explicit directions and small fixed musical rules are
  provisional. Subsequent rounds currently vary sound expression rather than
  infer a personal preference. Recording/humming, text understanding, AI,
  richer musical development and guided session transfer remain future work.

### RB18 · Audio acquisition, recording and common sample custody — DONE 2026-10-23, user acceptance pending
- Origin: user authorized the proposed first acquisition batch: file import,
  microphone recording, audition and saving before later humming recognition.
- Resolution: independent sampling module/workspace and public file/decode/
  capture ports, material classification and startup entry. Files keep their
  exact original bytes; microphone captures become mono IEEE Float32 WAV on
  the actual capture clock. Sound-runtime auditions PCM through its existing
  global device/session lifecycle, replacing earlier synth/sample playback.
- Storage: completed pending audio stays in memory across workspace changes;
  full exit requires saving first. Explicit Save atomically creates one
  immutable material, without a duplicate acquisition draft/history. Failed
  import or save preserves existing pending content. Replacing unsaved audio
  offers Save and continue, Discard and continue, or Return. Saved audition is
  read-only and does not replace pending content; renamed saves get new ids.
- Cancellation: pending permission, late streams, recorder startup, device
  loss during preparation, interruption and final-block flushing are covered.
  Leaving/cancelling releases the microphone; late decoding cannot start
  audio over a newer workspace. The input processor emits silence. Native
  microphone requests use normal user authorization only for the trusted
  local page; other permissions remain denied.
- Verification: 293 application tests pass (49 added), type checking and the
  final Windows build pass with zero warnings/errors. Final EXE passes all
  36 isolated headless disk/permission checks (8 new). The bundled processor
  is a trusted local asset and matches the VM-tested source by SHA-256.
  Reports: .test-output/sampling/tests.log, build-final.log,
  native-final/file-store-report.json and assets-report.json. No desktop,
  real microphone or user-library access occurred; visual, permission and
  listening experience still require user acceptance.
- Provisional bounds: 16 MiB original file, 120 seconds/64 MiB decoded PCM,
  30-second recordings, 8–192 kHz/1–8 audition channels. Other compressed
  codecs depend on the local environment and are bounded after decoding;
  very long compressed input may temporarily use more memory. Base64 in the
  current JSON library is replaceable, not a final binary asset architecture.
  Sample editing, sampled instruments/project usage, humming, loopback and
  wider capture devices remain future work.

### RB19 · Offline humming to editable melody and co-creation — DONE 2026-10-23, user acceptance pending
- Resolution: the sampling workspace can analyze completed audio, including
  unsaved recordings, as a single unaccompanied melody. An independent module
  estimates physical pitches, note timing, rests, dynamics and periodicity in
  a cancellable background worker. It does not infer BPM/key, quantize pitches
  or separate a mixed song. Results remain temporary until confirmed.
- Adoption: read-only preview compiles through existing public music owners;
  explicit fine-edit/co-create atomically publishes a synth timbre, phrase and
  root draft. Repeat confirmation reuses identities; a failed navigation can
  retry without duplicating the phrase/journey. No raw sample is silently
  saved or made a dependency. Fine editing enters the journey's current
  occurrence and returns there; the result can continue through song and
  portable project export/recovery.
- Protection: a stable audio token survives naming/saving but changes with a
  newly completed source. Changing source, starting acquisition, leaving or
  cancelling terminates analysis; stale results cannot be auditioned/adopted.
  Worker transfers owned copies, not the user's buffers. Progress, errors,
  retries, source races, disposal and atomic-write failures are covered.
- Usability: opening a new phrase draft initially selects the useful pitch
  register and scroll position, so low/high humming is visible for fine edits.
  Musical data is unchanged and subsequent same-draft scrolling is retained.
- Verification: 334 application tests pass (41 added: DSP 16, controller and
  owner factories 14, worker adapter 6, full workflow 1, source identity 1,
  viewport 3). Type checking and the final Windows build pass with zero
  warnings/errors. The actual packaged worker was executed in an isolated
  Node worker bridge with three known tones and progress, verifying the
  trusted local asset reference. Logs: .test-output/humming/tests-final.log,
  build-final.log and bundled-worker-report.json. Native host code was not
  changed; the previous 36 native checks were not rerun in this batch.
- DSP regression: independent review found 55 Hz splitting and 1399–1400 Hz
  octave errors at the working-range edges. Fixed interpolation/boundary
  handling and added endpoint/weak-fundamental regressions. The original
  independent probes now give one correctly timed note with <0.5-cent error.
- Provisional limits: 30 seconds, approximately 55–1400 Hz, minimum notes
  around 60 ms, at most 512 notes. Strongest AC-energy channel is used; it is
  not necessarily the channel containing a melody. Vibrato/glides become
  straight notes or a few segments, not a retained pitch curve. Synthetic
  tests and bundled execution do not establish real-singer accuracy or UI
  quality. No desktop, real microphone or user-library access occurred;
  real voice/interaction acceptance remains pending.

### RB20 · Acquired samples become playable timbres throughout the workstation — DONE 2026-10-23, user acceptance pending
- Resolution: sample-instrument timbres reference immutable originals and
  store trim seconds, root Hz, envelope and level. Independent UI supports
  waveform bounds, keyboard/exact values and pitched note auditions. Saved
  voices work in phrases, songs, live edits, WAV and portable projects.
- Ownership: sampling publicly prepares and caches decoded assets by id and
  revision; timbre/phrase/song/co-creation prepare explicitly before sync
  scheduling. Structural editing works cold. Lightweight material metadata
  avoids repeatedly copying original payloads. Preparation preflights the
  128 MiB group, loads sequentially and evicts only outside that group.
- Protection: originals remain exact; ordinary edits fork only the chosen
  occurrence chain. Co-creation preserves shaped sample voices and shares
  their sources instead of silently substituting synths. Project import
  remaps the full closure once; cold reopen prepares without the source
  device/library. Decode clocks, channels and frames must match metadata.
- Execution: live and offline use the same graph. Complete validation,
  owned snapshots, small fingerprints, pooled buffers, current-age seeks,
  one-shot endings, peak bounds and cleanup cover both sample and synth.
  A lifecycle abort prevents a late sample creation from changing another
  visible editor even when navigation did not call a domain open/create.
- Verification: 371 application tests pass (37 added: domain/preparation 13,
  complete workflow/metadata 4, runtime/WAV 16, async live updates 4), type
  checking and final Windows build pass with zero warnings/errors. Packaged
  assets match dist by SHA-256. Reports: .test-output/sample-instruments/
  tests-final.log, build-final.log and assets-report.json. Native host and
  background processors unchanged; historical native/worker checks were not
  rerun. No desktop, real microphone or user-library access. Actual visual,
  listening and gesture quality remain for user acceptance under N13.
- Provisional limits: one-shot resampling changes pitch and speed together;
  no looping, time-preserving pitch shift or automatic root detection. Root
  defaults to 220 Hz, adjustable 20–5000 Hz. PCM preparation/execution each
  cap at 128 MiB; large live sources still incur complete validation cost.
  Source originals remain base64 JSON, original 16 MiB and decoded 64 MiB/
  120 seconds limits continue. Projects carry original encodings: built-in
  PCM WAV works independently, other codecs require target-host support.
  Standalone .rssound remains basic-synth only; full sample editing,
  canonical portable transcoding and binary asset custody remain future work.

### RB21 · Fixed Windows EXE entry with build/open BAT retained — DONE 2026-10-23
- Origin: user delegated the BAT-versus-EXE decision to the assistant.
- Resolution: root RootSound.exe is a small x64 GUI-subsystem launcher,
  directly selecting the completed version from desktop-build.current.
  Ordinary launch invokes no PowerShell, Node.js or compiler. The existing
  BAT still checks/builds source and opens in one step; missing root entry
  triggers rebuilding. Desktop build compiles both programs, atomically
  publishes the root entry and only then changes the version pointer.
- Safety: one managed relative directory, bounded pointer, required files,
  device names and reparse-point checks; direct process start with complete
  Windows quoting preserves Unicode, spaces, quotes and empty arguments.
  User data stays at its existing location. No installer, registry/shortcut
  changes, automatic dependency downloads or portable single-file claim.
- Verification: 44 isolated launcher checks pass, including actual harmless
  child-process argument/cwd roundtrip and 11 deterministic reparse-attribute
  checks. Two optional real-junction checks are explicitly skipped because
  Windows denied link creation; not claimed as passed. Final root EXE is
  verified x64/Windows GUI and starts the actual selected desktop program in
  isolated --test-file-store mode: all 36 native checks pass. Type checking
  and full Windows build pass, zero warnings/errors. No real UI/microphone,
  desktop automation or user-library access. Reports: .test-output/launcher/
  20261023-080541-684-15993f/launcher-report.json, .test-output/exe-entry/
  entry-report.json and build-final.log. Music code unchanged; the previous
  371 application checks were not redundantly rerun.
- Distribution: current EXE needs its selected build files and existing
  .NET desktop/WebView2 runtimes. The small entry uses system .NET Framework;
  source builds compile it offline with Windows csc. Production packaging,
  runtime provisioning and signing remain release work. Generated EXE is
  Git-ignored and reproducible from tracked sources.

### RB22 · Review naming, co-creation rename and note audition — IMPLEMENTED 2026-10-23
- Origin: user's eight-point detail review; implement points 1–3, explain
  points 6/8, keep points 4–7's broader design unchanged for later discussion.
- Resolution: persist song scopes; recursively isolate external phrase,
  timbre and raw-sample identities; repeated unchanged adoption reuses the
  same local entity. Distinct same-kind entities within a song cannot share
  names; kinds and songs have separate namespaces. Retained material also
  reserves names. Automatic forks get suffixes; explicit conflicts retain
  the draft. Production assembly enables all owners' public graph adapters.
- Paths: save/new/Save As, current-occurrence edits, nested/selective edits,
  atomic history, cold restore and project import return the final normalized
  graph. Scoped pickers exclude foreign-owned and already adopted origins.
  Legacy reads do not migrate eagerly; historical undo can restore old
  sharing, while subsequent normal edits reapply isolation. Global catalog
  grouping remains unchanged. Separate raw copies increase library size.
- Co-creation: rename directly on the current-result input, one transaction
  with undo/redo; preserve source, other journeys and existing songs, retain
  invalid/failed input for correction. Enter/blur commits, Escape cancels.
- Audition: left pitch labels and successful new-note creation use selected
  timbre's prepared plan; stale async work cancels. A separate short-voice
  lane retains main playback time and does not write to the music library.
- Verification: 409/409 application tests pass, including 38 new checks:
  project scopes 21, full production-policy sample/co-creation/edit/project
  roundtrip 1, rename 6, note/audio audition 10. New UI remains unobserved;
  no user library, microphone, screen reading or desktop operation used.
- Release and final build evidence: docs/REBUILD_PROGRESS.md. Existing-root
  EXE rebuild exposed a null-string File.Replace publication bug; corrected
  by the shared publication helper, also independent of optional PowerShell
  modules. Its 15 real isolated filesystem checks pass. Full Windows build
  succeeds with zero warnings/errors; selected assets and compiled root
  entry match. No native-host/core-launcher rerun is claimed this turn.
- Follow-up: explain current multi-voice/dim-note semantics and actual
  creation flow. Co-creation-to-song navigation, tool depth and the broad
  visual/information hierarchy await the user's design review; not treated
  as accepted merely because the basic toolchain works.

### RB23 · Continuous full keyboard, public naming and authorized reset — IMPLEMENTED 2026-10-23
- Origin: user rejects register selection, requests no new duplicate timbres,
  permits deleting old projects/drafts, and suggests 音色制作 as the workspace name.
- Resolution: all 96 valid equal-tempered keys E0–D♯8 appear in one vertical
  scroll window; no out-of-register hiding. Preserve exact 20–5000 Hz notes,
  focus the densest melody area or C4 for a new phrase, retain scroll on edits.
  All workspace tabs and startup settings display 音色制作; no synthesis expansion.
- Naming fix: the previous policy left public starts unconstrained; clearing
  old data alone would not fix newly created duplicates. Public same-kind
  identities now reserve names too, including independent new drafts, while
  source drafts count with their saved entity. Explicit rename/conflicting
  named transactions fail safely; automatic creation/forks/imports number.
  Co-creation, humming and sampling production paths return committed names;
  redo cannot reintroduce a name subsequently claimed by another identity.
  Different songs may still share display names, never material identities.
- Data reset: only after the user confirmed closing the running app, acquired
  the existing library lock, verified local backup bytes, and deleted the
  active materials.json and .bak. Backup is local/ignored under .cache/
  user-reset-backups/20261023-093427-317; preferences, runtime and exported
  files remain. Earlier locked attempt changed nothing. This is a one-time
  authorization, not permission to discard later user creations.
- Verification: 419/419 application checks, type checking and complete Windows
  build pass, zero warnings/errors. Nine new public naming cases and one
  full-keyboard mapping case; existing keyboard/viewport cases expanded.
  Production sample/co-creation/humming adoption and history roundtrips pass.
  Selected release .cache/desktop-builds/20261023-093745-326-76396f and all
  assets/root entry match. Logs and reset report: .test-output/piano-names/.
  No UI observation/control, microphone or listening verification performed.
  Native-host/core-launcher code unchanged; their historical checks not rerun.
- Follow-up: global catalog still lists permitted same-name items across songs
  and saved/draft states. Project grouping, broad navigation/visual design,
  richer synthesis and co-creation remain later focused work, not implied done.

### RB24 · Focused editors, entity rail, conditional save and final output — IMPLEMENTED 2026-10-23
- Origin: user's six implementation items, explicitly uninterrupted/locked-screen.
- UI: remove decorative headings and persistent instructions, enlarge basic
  timbre curves, sample waveform, continuous roll and timeline. Keep names,
  parameter labels, errors and save states; move extra operation help behind
  a small help control/tooltips. Shared asset rail respects each editor's
  owning song; a public scratch phrase does not offer foreign private voices.
- Co-creation: do not instantiate its service in production, hide welcome/tab/
  catalog/settings paths, map old startup entries to timbre. Humming adoption
  goes directly to phrase editing. Preserve modules and historical records.
- Save: zero/single-use entities overwrite ID with new revision, multi-use
  occurrences fork only the selected branch, recursively for ancestors.
  Saved/draft same positions count once, shadow edits do not inflate counts,
  dirty ordinary draft additions count. Nested edits remain private until
  outer save. Explicit Save As stays separate. Later upstream saves block
  unsafe undo rather than altering the newer saved work.
- Post-production: independent public service injects whole-song output
  controls; compact arrangement UI provides master 0–100%, fade-in/out
  0–30 seconds, bypass. Shared live/offline final graph includes natural
  tails, retained peak bound and smooth clock-preserving live updates.
  Song/project/history retain settings; underlying phrases/timbres unchanged.
- Entity rail: metadata-only private current materials plus separate public
  starts, double-click editing, versioned identity drag. Timbres create or
  append phrase voices; phrases land at timeline positions. Strict current
  availability/kind checks preserve isolation and reversible owner edits.
- Verification: 447/447 application checks, type check and complete Windows
  build pass, zero warnings/errors; 28 added (save15, post6, audio2, entities5).
  Regression assertions updated for the user-approved single-use identity
  semantics with stronger untouched-material checks. Final release:
  .cache/desktop-builds/20261023-104157-615-aaab69; all selected assets/root
  entry match compiled output. Reports: .test-output/focused-workspaces/.
- Limits/review: no actual interface, listening, screen, device or real-library
  operation this turn. CSS/SVG/sidebar context problems found by source review
  corrected; real layout and drag feel remain for user acceptance. Final
  processing is a minimal first slice; no complete professional mastering
  chain claim. Framework/engine/ranges remain adjustable.

### RB25 · Current-song materials and explicit project-file save — IMPLEMENTED 2026-10-23
- Origin: user requests all current song entities without historical saves,
  and expects song Save/Ctrl+S to choose a project-file location.
- Current catalog/rail: root the query in the current song draft and explicit
  spare members. Collapse saved/working representations by identity before
  search, exclude foreign songs, retained old dependencies and undo-only
  records. Do not merge cross-kind same names. Scope usage transitively
  through working drafts; opening a working rail entry resumes that draft.
- Membership/custody: explicit project duplicates retain local dependencies
  and become members even while unused. Old retention metadata alone does
  not create membership; history remains stored, not deleted. Plain files
  retain v1; files with members use v2. Both validate exact root/member
  closures, import fresh identities and preserve member relations atomically.
- File save: main "保存工程…" and Ctrl+S share one pending-aware action,
  commit the focused field, snapshot before the dialog, and report actual
  success/errors. Cancellation never claims success. Unchanged/empty songs
  also export. Current unfinished material edits block omission, unrelated
  work does not. Local auto-recovery is labeled separately from file saving.
- Verification: 466/466 application checks, type check and full Windows
  build pass, zero warnings/errors. Added 19: current catalog/members/usage/
  empty files 12, unified save/shortcut 5, v2 platform 2. Final native binary
  passes 38 isolated file checks (store11, audio7, project12, sample8), with
  2 project checks added for v2/BOM, backups and bad-version preservation.
  Final .cache/desktop-builds/20261023-111928-099-3eeed0; all selected assets
  and root entry match. Logs: .test-output/project-catalog-save/.
- Limits: no real UI, screen/mouse/keyboard operation, user-library or device
  access. Native file dialogs' actual presentation remains for acceptance;
  this is not visual verification. Launcher core unchanged, no redundant
  launcher suite. Format details and legacy membership inference remain
  implementation choices, not new permanent product restrictions.

### RB26 · One primary timbre save action — IMPLEMENTED 2026-10-23
- Origin: user reports three adjacent save variants in timbre creation are
  confusing. Keep the ordinary action obvious and details optional.
- Basic/sample timbres share one primary Save plus an optional ellipsis.
  Secondary copy/apply-elsewhere choices appear only on request. Preserve
  no-copy-in-context and ordinary reference-save semantics; new sounds with
  no secondary operation have no empty menu. Clarify scope hints as apply
  locations rather than a second save name. Existing sample capabilities
  are preserved without adding a new copy workflow.
- Commit focused input before actions. Main basic save and Ctrl+S use the
  same path; a rejected field rerender cannot continue its stale save.
  Sample field commit failures also stop later save/apply. Native auto
  popovers provide top-layer dismissal/focus behavior; updates close and
  remove old actions. No new dependency or domain policy changes.
- Verification: 466 existing application regressions, type check and full
  Windows build pass, zero warnings/errors. No implementation-mirroring
  layout tests added. Final .cache/desktop-builds/20261023-113010-267-07b4a9,
  selected assets/root launcher match; .test-output/timbre-save-controls/.
  Native host/launcher/workers unchanged; no repeated native checks claimed.
- Limits: source and programmatic verification only, no screen, desktop,
  real-library or device access. Actual menu presentation/keyboard feel
  remain for acceptance. Automatic inclusion of unfinished child edits in
  project saving was not part of this change.

### RB27 · Editable synthesis and sample sustain, shared timbre entry — IMPLEMENTED 2026-10-23
- Origin: user rejects the limited toy-like tone editor, asks focused
  strengthening and reasoned decision questions. User selects equal real-
  instrument/electronic importance, phased delivery with unified entry.
- Entry/UI: replace the old three-recipe screen with a source/shape/color
  editor; keep New visible during occurrence edits. Twelve editable starts
  preview without writes; sample path shares the chooser. Cancelling the
  chooser does not end the old edit; only choosing a new task resolves
  unfinished occurrence edits. Preserve one primary Save, optional actions,
  keyboard audition and long/repeated trials. Advanced tuning/motion unfold
  on demand; noise hides irrelevant tuning. Curve drag uses SVG coordinates
  and holds its time scale during the gesture.
- Content/runtime: new strict synthesizer v1 body, up to four stable sources
  (four oscillator waves plus deterministic noise), individual enabled/level/
  tuning, ADSR, filter/color and pitch transient. Owner compiles common
  plans; live/offline share graph, early-release and age-preserving updates.
  Noise caches per context, filters/resources release with voices. Legacy
  recipes stay exact/read-only on open; v2 .rssound carries new synth bodies,
  v1 reads/exports stay available. Song/project/reference paths retain rules.
- Sample route: optional v2 loop bounds inside the selection, attack then
  repeat through note release, resume loop phase in real time, keep one-shot
  v1 behavior. Trim clamps valid loop bounds; original bytes unchanged.
  Timbre parameters/names/loops now use persistent atomic undo/redo.
- Verification: 483/483 application checks, 17 added (synth10, graph/WAV4,
  sample3), type check and complete Windows build, zero warnings/errors.
  Final .cache/desktop-builds/20261023-122354-177-7d89ba; assets/root entry
  match. .test-output/timbre-strengthening/ holds logs/reports. Existing
  malformed-filter rejection now reflects supported filter validation,
  with unknown-field and no-source-start checks retained.
- Limits: no screen/desktop, real audio device/microphone or real-library
  access. Graph scheduling and independent scalar WAV evaluator are not
  actual WebAudio filter DSP/listening or visual QA. Native host/launcher/
  workers unchanged, no duplicate native suite claimed. Four sources/twelve
  starts are provisional. Realistic sample libraries, note/velocity maps,
  performance articulations, smooth loops, pitch-preserving stretch, more
  synthesis/modulation and effects remain future focused work.

### RB28 · Independent personal workflow experiment: Bluetooth recording — IMPLEMENTED 2026-10-23
- Historical first implementation. Its mixed-output capture and restart
  deletion/disconnection behavior are superseded by RB29 and the user's
  corrected D-2026-10-23-12. The following verification belongs to that build.
- Origin: user requests an independent root subproject and a phone-to-PC
  Bluetooth receiving/recording/export/restart workflow, specified by outcomes.
- Where: experiments/music-workflow/, standalone Windows Forms application,
  source, build/check scripts, paired decision record and user README.
  Main workstation source, launch selection and material library untouched.
- Genuine Windows AudioPlaybackConnection A2DP receiving, paired-phone watcher,
  one-source auto-open or explicit choice, actual Opened state gates Record.
  Optional adapter/radio diagnostics cannot unnecessarily veto native playback.
  First pairing stays in Windows settings, with an in-tool settings link.
- Streaming default-render WASAPI loopback retains actual PCM/float format;
  WAV/RF64, bounded memory, continuous silence/timestamps, precise start/stop
  boundaries and drain, visible output/peak/duration. Disconnect, endpoint loss
  or default-output change ends recording and keeps the partial take. Native
  notification callbacks are nonblocking; failed unregister retains lifetime.
- State commands exclude duplicates, reconcile asynchronous failure and cancel
  stale work. Export uses system save dialog and atomic staging; cancel/failure
  preserves take and prior target. Restart stays visible, cancels/stops/releases,
  deletes this take's own exports with same-handle identity/hash checks, keeps
  externally changed/replaced files, permits retry for busy files and retains
  exportable audio after incomplete reset. Normal close preserves exports.
- Verification: 40 isolated groups (recording14, receiver13, session13), complete
  Windows build with zero warnings/errors. Final selected experiment release:
  bluetooth-recorder/.builds/20261023-152142-642-a6e55a. Unicode stable GUI entry
  matches compiled launcher, selected app hash matches tested assembly; reports
  in .test-output/bluetooth-recorder/. Windows PowerShell UTF-8 script encoding
  and repeated launcher publication were checked; no main-suite repetition.
- Limits: actual UI, phone/driver interoperability and listening await user
  acceptance; no screen/desktop/real Bluetooth/audio device or library access.
  Windows output mix can include other apps, not isolated Bluetooth PCM or a
  lossless copy of the phone's source. No drivers/headset microphone emulation.
  Ordinary runtime needs .NET9 Desktop; experiment is not a standalone installer.

### RB29 · Preserve reset state and isolate phone audio — IMPLEMENTED 2026-10-23
- Current scope: reset preservation remains active. Phone-only capture was
  explicitly withdrawn by the user on 2026-10-24; see RB31.
- Origin: user corrects Restart to preserve exports and Bluetooth connection,
  requires recording only incoming phone audio, and reports silence on the
  next recording after reset. Supersedes RB28's reset and mixed-output path.
- Reset owns only a take: separate session-lifetime connection cancellation,
  no receiver Stop/Dispose/reconnect from reset, including a pending connection.
  Stop/clear only private audio and return Ready when still connected. Remove
  all export-deletion code; exported files are never reopened by reset. Repeated
  takes get new paths, fresh capture clients and fresh cancellation epochs.
- Replace output loopback with the selected phone's explicit A2DP SNK input.
  Native topology -> audio adapter -> PnP lineage establishes remote AudioSource
  UUID110a/BthA2dp, capture/active direction and same phone address or actual PnP
  container. Reject AEP-container conflation, microphones/HFP, other phones,
  conflicting/unknown identity and ambiguous sources. No default input, default
  output, PID heuristic, global loopback fallback or driver installation.
- Resolve waits briefly for the connected source. Recheck same connected phone
  after resolution and native start; stale/cancelled streams stop. Direct shared
  capture uses explicit device ID and NoPersist, keeps native ListenTo playback
  unchanged, and watches only that input's availability. PC output changes do
  not redirect or contaminate the recording. Missing dedicated input fails with
  an explanation rather than recording another source. UI/docs match new rules.
- Validation: 62 isolated groups (recording15, receiver13, session18, source10,
  binding6), full Windows build zero warnings/errors. Experiment release
  20261023-155614-241-423390, entry and tested assembly hashes match. Reports:
  .test-output/bluetooth-phone-only/. Tests cover repeated takes, locked exports,
  pending-connect reset, cancellations, stale source/start, source exclusion and
  loss/failure recovery. No main-workstation changes or redundant suite runs.
- Limits: system inbox INF/SDK documentation and fabricated devices/packets are
  evidence for the implementation, not real phone/driver compatibility or
  listening acceptance. No actual interface, Bluetooth or audio stream was
  opened, no screen control or real library access. Old reset released receiving;
  that unsafe path is removed, but the user's actual post-reset listening still
  needs verification on their phone. Native input availability varies by system.

### RB30 · Repair the selected phone's Windows identity lookup — IMPLEMENTED 2026-10-24
- Historical source path: the user subsequently accepted playback-output
  recording in RB31. Identity diagnostics no longer gate the shipped recorder.
- Origin: user reports “无法核实所选手机的音频来源” on Start Recording.
- Reproduced on this PC with read-only metadata: requesting the nonexistent
  System.Devices.AepService.ParentAepId fails the whole query (0x8002802B).
  The receiver ID also uses the previously unsupported \\?\BTHENUM#…\SNK shape.
- Use canonical AepService.AepId; resolve the exact interface's devnode with
  CM_Get_Device_Interface_PropertyW and read its remote Bluetooth PnP lineage.
  Optional association-query failure cannot discard native identity. Conflicting
  identities fail; microphone/output/other-phone exclusions remain unchanged.
- Add injectable identity-reader checks using a sanitized copy of the real ID
  shape: native/WinRT fallback, canonical AEP relation, conflicts, missing identity,
  cancellation, cycles and strict capture binding. A separate metadata-only
  inspection command reports actual identity and active/inactive capture endpoints.
- Validation: 72 isolated groups passed (15 recording, 13 receiver, 18 session,
  10 source, 10 identity, 6 binding). Full Windows build: zero warnings/errors.
  Selected release 20261023-161125-496-d9bcbc; launcher/selected/tested assembly
  hashes match. Read-only before/after reports and build log are retained under
  .test-output/bluetooth-source-fix/. The fixed reader obtains this PC's actual
  phone address and PnP container; the corrected WinRT query also succeeds.
- Limits: no desktop observation/control, connection changes, playback, recording
  streams or workstation-library access. No active phone input was present in
  this metadata snapshot. Real song capture and reset/listening await user retry;
  successful identity lookup is not represented as full hardware acceptance.

### RB31 · Record PC playback after withdrawing phone-only capture — IMPLEMENTED 2026-10-24
- Origin: user can hear the phone on the PC but still cannot access its separate
  capture input; explicitly cancels the phone-only requirement and accepts other
  PC playback in the recording. Preserve connection/export reset semantics.
- Replace direct phone-input capture with default multimedia render endpoint
  WASAPI shared loopback. No microphone, phone identity lookup, dedicated input
  or driver prerequisite. Keep native playback; never stop/reopen Bluetooth or
  add a second render stream on take reset. UI names the actual playback output
  and states that apps/notifications on that output will also be captured.
- Follow default-output notifications, verify selection again after registering
  to close the initial-selection race, stop and retain partial audio on output
  switch/loss or phone disconnect. A fresh take resolves the current default.
- Move retired phone-only metadata code to tests/PhoneAudioDiagnostics; it is
  retained for diagnostics and historical checks, excluded from the shipped app.
- Validation: 73 isolated groups passed (15 recording, 13 receiver, 18 session,
  7 connected-capture, 20 retained metadata checks); full Windows build has zero
  warnings/errors. Selected release 20261023-162110-909-95238c; launcher and
  selected/tested assembly hashes match. Reports in
  .test-output/bluetooth-output-recording/.
- Separate native compatibility probe successfully initializes the real default
  speaker output and obtains its capture interface: 48 kHz, stereo. Probe never
  calls Start, reads packets, plays audio, opens a microphone, changes connections
  or observes/controls desktop windows. Real song content and repeated-take
  listening still await user verification. Main workstation/library unchanged.

### RB32 · Independent spectrum selection and sample editor — IMPLEMENTED 2026-10-24
- Origin: user's second personal music-workflow experiment. Independent native
  Windows tool under experiments/music-workflow/sample-editor, with stable
  Chinese EXE entry and a separate build/open BAT. No workstation-library use.
- Import common music through the system picker; stream into a private float
  cache, retaining the existing file on cancellation/unsupported input. Display
  a genuine logarithmic time-frequency spectrum or waveform, with red playhead
  and two blue sample boundaries. Background analysis is cancellable and bounded
  in memory. Full-file timeline, fine Shift dragging, keyboard sample precision,
  cursor-anchored Shift-wheel zoom, pan and fit are implemented.
- Play/pause uses the actual output clock; dragging a playing red line resumes
  from its new position on release. Seek acknowledgements prevent stale visual
  jumps. Fine audition rate is 0.750–1.250 with 0.001 steps, changing pitch too.
  Export the blue interval at original speed as 24-bit WAV/RF64, preserving rate
  and channels, through a system save dialog. Atomic staging protects existing
  destinations on cancellation/failure; imported-source identity is protected.
- Validation: 60 isolated groups pass (audio19, playback16, analysis11,
  timeline8, graph6); full Windows build has zero warnings/errors. Includes
  generated MP3 decoding via Windows, precise selection/export, cancellation,
  format failures, queued playback clocks, slow reads, seek acknowledgements,
  spectrum frequency/time mapping, extreme zoom and overlapping blue handles.
  Selected release 20261023-163051-419-317256; stable launcher and selected/tested
  assembly hashes match. Evidence: .test-output/sample-editor/.
- Limits: program-drawn offscreen graphs were inspected, without creating an
  app window. No desktop observation/control, real output playback or library
  access. Actual listening, pointer interaction and system dialogs still await
  user acceptance. Codecs depend on Windows; no saved selection project or
  installer. Speed/export semantics are provisional experiment choices.

### RB33 · Polish acquired samples into playable timbres — IMPLEMENTED 2026-10-24
- Origin: third personal workflow experiment. Independent timbre-lab tool and
  Chinese 音色打磨.exe entry; primary sample plus up to seven same-timbre
  references. Existing recorder/editor and workstation libraries unchanged.
- Implemented spectral noise reduction, harmonic/transient suppression,
  frequency filters, pitch estimation/manual root and pitch-aligned common
  spectral masking. Only the primary waveform is processed; source arrays
  remain unchanged. Preserve original comparison, cancellable background work,
  bounded short-window processing and latest-result revision checks.
- Add trim/silence margins, ADSR/gain, key audition at different pitches,
  automatic/manual sustain loops and crossfade. Automatic crossfades follow
  whole pitch periods to avoid cancellation dips. Central audition session
  serializes cleanup, rejects stale replacements and cancelled late renders.
- WAV24 exports cleaned original-pitch audio with rate/channels; .rstimbre
  preserves float audio and performance settings, with strict ZIP/schema/hash
  validation and reimport. Atomic exports protect existing files on failure or
  cancellation; original path and file identity cannot be overwritten. The
  archive does not retain original references/cleaning steps, and is not yet
  understood by the main workstation. WAV remains the transfer path.
- Validation: 63 isolated groups pass (host21, processing20, instrument16,
  workflow6). Final Windows build has zero warnings/errors. Selected release
  20261023-172052-042-ffbe3c; stable launcher and selected/tested assembly hashes
  match. Reports: .test-output/timbre-lab/, including final 63-group run in
  20261023-171925-96972a, build-final.log, build-clean.log and verification.json.
  Initial sandbox restore audit warning was resolved by restoring Microsoft
  source metadata with network access, not by disabling audit.
- Signal tests jointly check target retention and interference reduction,
  including different pitches/rates, limited reference bandwidth, percussion,
  antiphase stereo, antialias pitch detection, STFT boundaries and loop energy.
  End-to-end processing/render/archive/reopen/WAV reimport, cancellation and
  fake-device playback races pass. Constructor/minimum-size layout remain
  invisible without Form/public child handles; offscreen graph inspected.
- Limits: no actual window shown, screen observation/control, real audio
  playback or main-library access. Actual songs, listening, pointer feel and
  system dialogs await user acceptance. Shared interference/coincident bins
  are not guaranteed recoverable; strong settings can damage detail. Offline
  heuristic cleaning is not semantic AI source separation. Provisional caps:
  30 seconds per input, 8 total clips, 16M floats per clip/64M combined.
