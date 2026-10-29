# RootSound TODO

## RB83 Large native project opening — IMPLEMENTED 2026-10-29

- Fix the reported128MiB rejection for the463,559,570-byte native project.
  Current512MiB file budget is an implementation bound, not a permanent product
  decision. Standard JSON-compatible large-text encoding avoids System.Text.Json's
  separate token limit in storage Read, Inspect, Create/Copy, Save and Rename.
  Strict Unicode/control escaping and final UTF8 size checks remain.
- Stream full-content fingerprints; no equal-size/mtime shortcut. Retain only
  detached envelope metadata, not the giant raw JSON document. Existing locking,
  external-change protection, atomic backup and explicit-saving policy remain.
- Final release `20261029-110855-201-33ecdb`:1109 application checks and135 actual
  native checks pass (61 project,21 timbre,14 MIDI,39 file).129MiB real write/read/
  bridge/reopen and same-size/same-mtime external conflicts covered; JSON semantics,
  invalid Unicode and unknown metadata verified.6 UI assets, launcher and tested
  native DLL hashes match. Build succeeds; one Vite size notice, .NET0 warnings.
- Actual supplied original read-only SHA256/mtime/backup unchanged. Native Read's
  JSON response passes production TS platform/library restoration and full6-track,
  42-sample/42-trigger playback preparation (164.215714s). An isolated full-size copy
  passes scoped draft update without disk writes, explicit save/backup/cold reopen
  and Save As. No visible UI, physical audio or actual COM marshaling tested.
  Large inline-audio projects still incur substantial time/memory; do not claim
  a GUI speed or listening result. Evidence `.test-output/rb83/` and `real/`.

## EXP GPU execution / CPU default — IMPLEMENTED 2026-10-29

- Installed separate, officially verified PyTorch/torchaudio2.7.1+xpu and locked
  Intel dependencies under `.cache/tone-structure-gpu`; actual Arc GPU tensor and
  multi-window Demucs inference pass. CPU packages/weights and other tools kept.
  GPU/Auto/CPU radio choices, asynchronous detection, real device reporting,
  strict-GPU errors and disclosed Auto CPU retries, cancellation cleanup.
- User selects CPU after timings: all entry points/dialog now default CPU and
  default chooser does not initialize GPU. GPU remains an explicit option.
  Partial XPU operator CPU fallback is disclosed; retain float32.30s controlled
  mix: CPU15.69s/GPU21.51s; max stem RMS difference2.04e-8. Not a universal
  speed result or real-music listening acceptance.
- Final release `20261029-095103-643-f6dd4e`:28 final UI/default checks including
  real direct-CPU inference with GPU installed.100 backend checks and2471 shared
  native/21 JS from full run `20261029-094450-786-ec8ae7`; worker/shared DLL
  byte-identical. GPU/CPU numeric agreement, stereo/mono, actual cancellation,
  failure/retry, mode selection and offscreen chooser verified. Final main/shared
  DLLs and worker match tested files;10 assets/launcher hashes checked.
- Evidence `.test-output/tone-structure/20261029-095103-643-f6dd4e/`, plus full
  backend directory and30s benchmark. No user desktop or physical audio device
  used. Final build has only NU1900 audit-feed warnings. Manual reproducible
  `tone-structure/Setup-Gpu.ps1` does not alter global Python or graphics drivers.

## EXP Selectable separation methods — IMPLEMENTED 2026-10-29; listening pending

- Five genuinely different choices in a small dialog: cached Hybrid Demucs,
  HPSS, non-local repetition, stereo Mid/Side, original NMF (2–8 requested layers).
  Describes use/limits and disables unsupported choices. No silent fallback.
  Model lookup covers the actual launcher's module directory as well as experiment
  roots; worker is packaged in the release and its verified local weights load
  with weights_only. No downloads or worker network connections.
- Re-decomposition uses original input and replaces the full current result;
  undo restores exact prior layers/mutes. Refinement can use another principle,
  replacing only its selected parent and inheriting its mute state. Existing
  shared clock, original comparison, source protection and WAV paths remain.
- Release `20261029-090259-774-aa8f82`:80 structure checks,2471 shared native
  assertions and21 JS checks pass. Controlled sustained/attack, repetition/one-off
  and mid/side content checks; long721s reference/tail analysis; actual cached
  model inference in mono16000Hz and multi-window stereo22050Hz, complementary
  reconstruction <=2.98e-8, model cancellation, chooser and undo/refinement.
- Evidence `.test-output/tone-structure/20261029-090259-774-aa8f82/`: metrics,
  offscreen chooser/layout PNGs, full build and release verification. Main/shared
  DLLs, worker,10 UI assets and launcher match tested files; existing Tone entry
  and selected release unchanged, legacy entry absent. NU1900 audit-feed warnings
  only. No user desktop window shown or physical audio device used. These
  controlled checks are not real-music separation or listening acceptance.

## EXP Tone Structure — IMPLEMENTED 2026-10-29; real-music listening pending

- New independent `experiments/music-workflow/音色结构.exe`: shared capture/EQ
  transfers long selections into a structure page. Learned similar/repeating
  spectral templates produce aligned simultaneous layers; complementary residual
  reconstruction avoids duplicating the full input across outputs. Selected-parent
  refinement replaces that parent; eight undo states and16 current layers.
- Shared playback clock and seek ruler, independent active/mute, exclusive original
  comparison, live frequency-versus-dBFS lines with exactly aligned axes, individual
  layer/active-mix WAV export, cancellable bounded-memory disk processing. Retains
  capture state; new analysis replacement prompts; closing cleans owned caches.
- Release `20261029-082851-912-0a8d89`: 41 structure checks pass, including controlled
  component concentration and max sum error2.98e-8, refinement/undo, shared-clock
  playback, cancellation,721s input,40s real capture transfer, hidden WebView2 and
  offscreen layout/paused-seek refresh. These are synthetic checks, not semantic
  instrument-separation accuracy claims. Real music may leak across layers.
- 2471 shared native assertions and21 JS checks reused from full run
  `20261029-082453-646-85f042`; shared DLL byte-identical. Tested main/shared DLLs,
  ten UI assets and launcher verified. Existing Tone Processor release unchanged.
  Build only has NU1900 audit-feed warnings; no code errors.
- Evidence `.test-output/tone-structure/20261029-082851-912-0a8d89/`: verification,
  structure checks/metrics, final/shared build logs and reviewed offscreen PNGs.
  No user desktop window shown or physical audio device used. Musical usefulness,
  leakage and actual listening remain for user evaluation.

## EXP Blue markers — IMPLEMENTED 2026-10-29; real listening pending

- Both unified pages allow blue-marker crossing with stable marker identities
  and ordered selection bounds for editing/saving. Earlier/later numeric fields
  resolve the current spatial boundary. Capture dragging reanchors the looping
  source at the existing device clock, without pause, seek or device restart;
  red/audio continue until a changed edge is reached. Empty ranges cannot play.
- Release `20261029-072844-107-70b070`: 21 JS, 2471 native assertions including
  102 blue-marker assertions, 79 timbre groups and 60 sample-editor groups pass.
  Real PlaybackEngine plus simulated device verifies clock advance and unchanged
  seek/reset/stop counts. Ten assets, tested DLL and sole launcher hashes match;
  removed legacy alias remains absent. NU1900 audit-feed warning remains.
- Evidence `.test-output/tone-processor/20261029-072844-107-70b070/` and
  `.test-output/tone-processor/blue-sample-editor-regression/`. No user window
  shown or physical audio device opened; actual listening/drag feel pending.

## EXP Unified Tone Processor — IMPLEMENTED 2026-10-29; real use pending

- “音色器” opens on timbre polishing. The boxed plus below the sample list
  enters song capture/EQ; export transfers the processed blue selection directly
  into the list and returns. Later captures append references without replacing
  the primary. A back button also returns without adding audio.
- Both pages stay alive through navigation, retaining song/cache, markers,
  view, EQ and trim undo history; captured samples own independent PCM. Keep
  existing 30-second/eight-sample limits and source-file identity protection.
  User confirms retention only during the current open session, not reopening.
  Follow-up: user removes the legacy `音色打磨.exe` entry. Only `音色器.exe`
  remains and builds no longer recreate the old alias; historical build commands
  still forward to the merged tool. The two-launcher verification below is the
  historical merge-release result.
- Release `20261029-070259-090-f46dbd`: 21 JS checks, 2369 native assertions
  (27 new unified-workflow checks) and all 79 prior timbre groups pass. Includes
  hidden WebView2 actual EQ transfer, -12 dB samples, repeated navigation,
  failed/full/canceled transfers, independent snapshots and shutdown cleanup.
  Ten assets, tested DLL and both launcher hashes match; build-script parsing
  and Windows encoding checked. NU1900 audit-feed access warning remains.
- Evidence: `.test-output/tone-processor/20261029-070259-090-f46dbd/` with
  `release-build.log` and `release-verification.json`. No desktop window shown
  or physical sound device opened; actual listening and mouse feel pending.

## EXP Tone Processor — IMPLEMENTED 2026-10-29; listening acceptance pending

- Independent `experiments/music-workflow/tone-processor` and `音色器.exe`:
  multi-format long import, draggable spectrogram markers and zoom, selection
  looping, play/pause and return, trim/undo, unchanged shared Spectral Forge EQ
  editor/DSP, processed frequency overlay, and blue-range-only 24-bit WAV export.
  Inputs remain protected; no timbre/project format added. Import/export folders
  are remembered separately; audio processing is bounded and disk-backed.
- Release `20261029-003347-724-8db1f6`: 21 JS checks and 2342 native assertions
  passed. Actual WAV/MP3/FLAC/M4A decoders, 721-second import/full export, EQ
  sample comparisons, selection/loop/reset/cancellation and hidden WebView2
  worker/bridge validated. Ten UI/shared assets, tested DLL and launcher hashes
  match. Build has the existing NU1900 feed/audit access warning; no code errors.
- Evidence: `.test-output/tone-processor/20261029-003347-724-8db1f6/` including
  `release-build.log`, `release-verification.json`, spectrogram and audio fixtures.
  No user desktop window was shown and no physical audio device was used.
  Actual listening, drag feel and musical acceptance remain for the user.

## RB82 Wheel duration fine adjustment — IMPLEMENTED 2026-10-29; real use pending

- A selected note receives ordinary vertical wheel input over the roll; up
  lengthens/down shortens, about10ms per normalized notch with fractional input.
  Onset/pitch/mix/selection/view/head stay intact; width, console and live callback
  update, undo works, explicit saving remains required. Labels/ruler/modifiers,
  pure horizontal input and family-only selection retain navigation.
- Preserve tiny notes, natural tails and long legacy beat notes; normalize device
  units, limit large deltas, re-read after pending-field flush and protect modal/
  invalid input/failure paths. Five new checks;71 editor targets and1109 full tests pass.
- Release `20261029-000655-082-02a1de`, six UI assets and launcher hashes match.
  TypeScript/desktop pass; .NET zero warnings/errors, one Vite size notice. DLL
  matches RB81:134 prior native results reused, no native rerun. Evidence
  `.test-output/rb82/`; no desktop/device/user-project operations.

## RB81 Explicit saving and disposable drafts — IMPLEMENTED 2026-10-29; real use pending

- Native edits/checkpoints now change working memory only. Formal file bytes,
  modification times, backups and mirrors remain unchanged until explicit save.
  Discard releases the working state without rewriting the original. Dirty opens
  and new creates cannot silently switch projects; explicit CreateCopy saves a copy.
- Phrase Save confirms into the working song; song Save persists the whole file,
  as explicitly confirmed by the user. New work has projectRootId custody but no
  phrase Content/member/library tile until Save. Library metadata stays confirmed.
- Phrase exit offers save/discard/continue, restoring adopted drafts or removing
  unpublished work plus children; history is cleared, failed writes preserve work.
  Save As retires old scratch state; failed cleanup returns to an accessible original.
- Project save/copy/close-save reject unfinished phrase work. Window close flushes
  fields through an awaited handshake, with save/discard/cancel; blocked saves do
  not prevent explicit discard. Confirmed phrase deletion no longer checkpoints disk.
- 1104 full-suite checks pass; final type refinement reruns43 integration checks.
  Custody156, phrase product64, root library/directory37 targets pass. Final release
  `20261028-232852-347-cd9d33` reruns134 native checks:61 project,21 tone,14 MIDI,
  38 storage/audio/project/sample. No native evidence reused. Six UI assets and root
  launcher hashes match; TypeScript/desktop pass, .NET zero warnings/errors and one
  Vite size notice. Evidence `.test-output/rb81/` and draft-project-ownership logs.
  No GUI, sound device or user-project writes; actual window-close UX remains open.

## RB80 Creation overview and phrase console — IMPLEMENTED 2026-10-29; real use pending

- Keep the read-only upper overview and enter unified Creation through its left
  control. Remove right Create tiles and the separate Rhythm interface. Replace
  the lower area with phrase metadata/master volume. Retain the divider limits,
  cancellation, keyboard control and mounted ratio memory; default upper ratio75%.
- Legacy rhythm parts keep their IDs, markers, pitches and timing. Unified preview,
  piano-roll editing, family rebinding, whole-phrase playback/save/undo work for
  every part. Tone removal can address all current-phrase uses in one transaction;
  the song's shared asset and other phrases retain their protections.
- Console volume shares the existing live preview and one-commit history; cancel
  restores both controls, and console gestures do not pan or seek the overview.
- 1082 full-suite checks pass, with90 unified-edit/helper,87 shell/production and13
  preview/split checks. Release `20261028-225000-650-e494a9`, six UI assets/root
  launcher match. TypeScript/desktop build pass; .NET zero warnings/errors, one
  Vite size notice. Native DLL unchanged:130 earlier checks reused, none rerun.
  Evidence `.test-output/rb80/` and `.test-output/rb80-ui-final.log`; no desktop,
  audio device or user-project writes. Visual and gesture acceptance remains open.

## RB79 Gentler row dragging and phrase-library opening — IMPLEMENTED 2026-10-29; real use pending

- Horizontal row movement uses75% of pointer displacement; vertical movement,
  bounds and full-release deletion protection remain. Fractional movement,
  narrow layouts, release reversal and cancellation pass their targeted checks.
- Phrase-library double-click opens the original phrase, including hidden ones,
  cancelling all pending single-click toggles. Single-click visibility toggling
  and drag-delete warnings remain. Failed opening stays retryable; navigation
  avoids stealing focus from the new page. Renaming remains in the phrase header.
- 1070 full-suite checks pass, including128 library/studio checks and11 targeted
  row checks. Production integration opens a hidden phrase with unchanged song
  visibility/source content. Release `20261028-223403-850-2f282b`, six UI assets
  and root launcher match. TypeScript/desktop build pass; .NET zero warnings/errors,
  Vite one size notice. Native DLL unchanged:130 prior checks reused, none rerun.
  Evidence `.test-output/rb79/`; no desktop/audio-device/user-project operations.

## RB78 Diagonal row dragging and coordinated fading — IMPLEMENTED 2026-10-29; real use pending

- Row controls follow both axes continuously. Horizontal travel is bounded from
  zero to one actual control-column width, including the narrow layout. Neighbors
  yield vertically; release animates both axes into place. This replaces the
  original direction lock and fixed140px deletion threshold.
- Trash opacity rises more slowly (squared progress); only the dragged row's
  visible grid band fades with rightward travel. Returning left restores it.
  Only an actual full-right release requests deletion, with the existing populated
  row warning. Cancel/lost capture/Escape/wheel/save/refresh/disposal clear previews
  without committing provisional row movement or interrupting playback.
- 1065 full-suite checks pass, including93 playlist/performance checks. Release
  `20261028-222504-709-90af35`; six UI files and root launcher hashes match.
  TypeScript/desktop build pass; .NET zero warnings/errors, Vite one size notice.
  Native DLL matches RB77: reuse130 previous native checks, none rerun this batch.
  Evidence `.test-output/rb78/`; no desktop, audio device or user-project writes.
  Real gesture smoothness remains for user evaluation.

## RB77 Drag drawing, subdivisions and removal confirmation — IMPLEMENTED 2026-10-28; real use pending

- User clarified that selecting the left total-note family enables drag drawing
  on blank space. The ghost has continuous width; release commits/auditions once.
  Unselected/Alt/middle navigation and existing-note move/resize remain available.
- Per-phrase stepsPerBeat accepts integers2–9, omitted older values mean4. Both
  departments share it; editing the grid never retimes existing notes. Dynamic
  mouse/typing/rest/nudge fields use it and protect incomplete final cells.
- Custom/imported/edited tone removal asks first, including unsaved parameter
  changes. Existing phrase/song library warnings remain. Right-swiping a row
  reveals the red trash; the current140px threshold is an implementation choice.
  Only actual release can delete: empty rows immediately, populated rows after
  confirmation and unchanged-row validation. Cancelling preserves playback/data.
- 1062 full-suite checks pass; release `20261028-113909-491-547a50`, six UI assets
  and launcher match. .NET zero warnings/errors; Vite one bundle-size notice.
  Native DLL matches RB76: reuse130 prior checks, no native rerun this batch.
  Evidence `.test-output/rb77/`; no desktop/device/FPS/listening acceptance or user-project writes.

## RB76 Library organization and contextual navigation — IMPLEMENTED 2026-10-28; real use pending

- New phrases inherit the Arrangement grid BPM displayed at creation, including
  the current tempo segment. Copies retain their own tempo. Unused bundled tones
  can leave the library without reseeding; referenced tones and unfinished edits
  retain their existing protections. Library drag order is song-wide and portable.
- Settings expose keyboard performance only. Retired entry preferences remain
  compatibility data, not hidden startup controls. Label/control-block wheels use
  vertical navigation by default, horizontal with Shift, and zoom with Ctrl;
  main-grid mappings remain unchanged. Overflowing consoles scroll locally while
  range controls keep their own wheel adjustment.
- Tone-library metadata rebases only the corresponding non-musical occurrence
  snapshots; musical conflicts still fail. 1025 full-suite checks pass. Release
  `20261028-105314-011-85d7f3`: .NET zero warnings/errors, Vite one bundle-size notice.
  Six UI assets and launcher match. The native DLL matches RB75: 21 tone checks
  rerun using the new deleted/reordered fixture; 109 other checks reuse RB75 evidence.
  Evidence `.test-output/rb76/`; no desktop/device/FPS/listening acceptance or user-project writes.

## RB75 Tone file import and continuous MIDI phrases — IMPLEMENTED 2026-10-28; real use pending

- Import song-wide tones through the library + tile, remember the picker directory, preserve complete
  `.rssynth`/`.rssound` graphs and independent song scopes; no automatic notes.
  Legacy `.rstimbre` sample archives remain unsupported, without approximation.
  Exact per-note pitch/velocity/gate are prepared in a background worker; cross-note
  glide and global nonlinear mixing differ from the experiment's multi-note engine.
- Recoverable mirrors: `D:/RootSound/timbres/<manifestGUID>/`; self-contained
  `.rootsound` remains authoritative. Current-root/member/valid-draft projection
  excludes foreign/history/stale data. Modified/additional files are preserved;
  project deletion cleans only unchanged managed copies, reporting warnings.
- Current choices: 1024 beats / 256 bars, 50000 notes per phrase; MIDI lanes stay
  contiguous except real tempo/resource boundaries. Actual Vulcanus: 225→17 clips,
  5267 notes / 164.0213 seconds, exact timing and portable edit/undo/save verified.
  Existing songs are not auto-rewritten/resegmented; reimport MIDI for this layout.
  Runtime still bounds 600 seconds, 256 waveform sources and 128 MiB spectral work.
- 1001 full-suite checks pass; subsequent save-field refinement passes 27 affected
  UI checks/type checking. Eleven spectral checks include actual worker evidence.
  Release `20261028-101232-024-28ef6a`: .NET 0 warnings/errors, TypeScript/Vite pass
  with one nonblocking JS bundle-over-500KB notice. Final binary reruns 130 native
  checks (21+57+14+38), without reused binary evidence; 6 UI assets/launcher match.
  Both source hashes remain unchanged. Evidence: `.test-output/timbre-import/`
  `final-full-tests.log`, `final-editor-tests.log`, `desktop-build.log`,
  `release-verification.json`, `spectral-actual.json`, `native/` reports, and
  `.test-output/midi-phrase-length/actual-conversion.json`. No GUI/device/FPS/listening acceptance.

## RB74 Resizable phrase sections — IMPLEMENTED 2026-10-28; real use pending

- The overview divider resizes Melody/Rhythm symmetrically and aligns their left
  controls. On initial opening, exactly one empty section defaults to minimum;
  both populated or both empty defaults to half each. Undefined-tone notes count.
  The 15%–85% bounds, 64px minimum when space permits, equal sharing in very small
  windows, keyboard arrows/Home/End and mounted-memory storage are implementation
  choices, not additional permanent user requirements.
- Same-draft refresh, in-place Save continuation and detailed-editor return retain
  layout; a real new draft recomputes its default. Resize clamps displayed size
  without discarding the desired ratio, and zero height preserves that preference.
  Escape/pointer cancellation restores the starting ratio and both vertical
  offsets; lost capture ends adjustment. Frame-coalesced resizing does not write
  music, prepare audio or interrupt playback. Shared time and independent vertical
  navigation remain intact; layout is not added to the project format.
- Final verification: 970 program checks pass; release
  `20261028-092408-127-7b6e7e`, build 0 warnings / 0 errors. All 5 UI files and
  the root launcher match their hashes. The DLL is byte-identical to RB73;
  existing 14+57+38 native results are reused, not rerun. Nine new targeted checks
  are included in the full suite, including cancellation of ratio and both tops.
  Evidence under `.test-output/phrase-divider/`: `final-full-tests.log`,
  `targeted-tests.log`, `cancel-targeted-tests.log` and `release-verification.json`.
  No real desktop, sound-device or FPS acceptance was performed.

## RB73 two-axis navigation and phrase overview notes — IMPLEMENTED 2026-10-28; real use pending

- Blank dragging pans both axes together in Arrangement, Melody and Rhythm.
  The phrase overview now previews each section's real notes, replacing its old
  blank state: full pitch rows for Melody, section part rows for Rhythm, with
  undefined tones dimmed. Horizontal seconds/zoom are shared; vertical offsets
  and row heights belong to each section. The overview stays read-only and uses
  the existing Create entry for detailed editing.
- Implementation choices: a 4px click/drag threshold, frame-coalesced view updates,
  clipped/reused note nodes and one deterministic phrase-wide eight-color palette.
  Entering/returning from detailed editing and in-place Save retain the current
  navigation in mounted UI memory, not in the project format or across app restarts.
  BPM changes move note onsets while explicit held seconds stay fixed; preview
  snapshots reflect editing, tone replacement, deletion and extension.
- Final verification: 961 program checks pass; release
  `20261028-085938-686-f0e69d`, build 0 warnings / 0 errors. All 5 UI files and
  the root launcher match their hashes. The DLL is byte-identical to RB72;
  existing 14+57+38 native results are reused, not rerun. Seven renderer tests,
  real mountStudio integration, diagonal Arrangement dragging and child-editor
  navigation/click handling are covered. View operations preserve the complete
  draft/token and the same playing session with one visible head. BPM changes
  preserve fixed-second note widths; added/deleted/recolored notes update correctly.
  Evidence under `.test-output/two-axis-navigation/`: `full-tests.log`,
  `desktop-build.log` and `release-verification.json`. No real desktop, sound-device,
  listening or FPS acceptance was performed.

## RB72 Arrangement scrolling performance — IMPLEMENTED 2026-10-28; real use pending

- Pan/zoom uses current song and phrase metadata snapshots. Animation frames
  coalesce consecutive wheel input; visible clip/grid/row nodes are reused.
  Scrolling does not rebuild row controls, the shelf or the inspector. Returning
  rows refresh names, colors, solo/mute and selection, including stale offscreen
  selection. Visible rename inputs retain their nodes; genuinely offscreen
  inputs blur and save before removal.
- The app scans current project membership once, reads authorized phrases in
  one batch and keeps one small metadata cache per library/song/token. Edits,
  undo/redo and song changes refresh it; callers receive independent copies.
  Current-song and history isolation remain strict, with independent ownership
  validation for single-item reads. Actual 225-phrase offline list calls fall
  from about 250 to 7.23 ms cold and 0.0063 ms at the same token; the warm figure
  excludes an additional song.read call. These are call timings, not FPS.
- Final verification: 943 program checks pass (`final-full-tests.log`), release
  `20261028-082554-119-721963`, build 0 warnings / 0 errors. All 5 UI files and
  the root launcher match their hashes. The DLL is byte-identical to RB71;
  its existing 14+57+38 native results are reused, not rerun this time.
  Independent headless measurement on the actual 17-row / 225-clip / 5267-note
  fixture: 30 wheel events before one animation frame reduce phrase-list calls
  150→0, new DOM nodes 3649→0 and row-control rebuilds 30→0, using one frame.
  Arrow-key pan/zoom reads no song/material data. Fixture hash is unchanged.
  Evidence under `.test-output/playlist-performance/`: `before-domain.json`,
  `after-domain.json`, `before-ui.json`, `after-ui.json`, `final-full-tests.log`
  and `release-verification.json`. No desktop, real sound-device or FPS acceptance.

## RB71 full-song MIDI capacity — IMPLEMENTED 2026-10-28; real use pending

- Replaces the old 2048-note whole-song guard with one shared 50000 sounding-note
  budget for MIDI conversion, song plans, audition and WAV export. Long sequences
  prepare short windows ahead of the device clock and promptly release finished
  nodes. Pause/resume/live replacement and offline batches retain that clock;
  sustained notes span window boundaries. This does not change MIDI instrument
  approximation or restore unsupported controllers.
- Still bounded: 10 minutes, 256 simultaneous waveform sources, at most 4096
  upcoming waveform sources in any 0.35-second interval, 128 rows, 512 clips, and
  512 notes / 64 beats per phrase. Excess resources are rejected, not truncated;
  the 50000 total budget is not unlimited capacity.
- Verification: 935 program checks pass; release `20261028-075611-023-8c2aa1`,
  build 0 warnings / 0 errors. All 5 UI files and the root launcher match their
  hashes. The host DLL is byte-identical to RB70, so its 14+57+38 native checks
  are reused, not rerun. Actual `Vulcanus.mid`: 5267 notes / 164.02 seconds,
  17 rows / 225 clips; every onset and held duration, portable reopening,
  arrangement move/undo/redo and phrase edit/save/cold-open verified; source hash
  unchanged. The 48 kHz plan reaches 152 simultaneous waveform sources. Fake-device
  full-clock simulation schedules all 21068 sources at their original onsets,
  retains at most 264 sources including lookahead and releases all nodes.
  Evidence under `.test-output/midi-capacity/`: `full-tests.log`,
  `actual-conversion.json`, `actual-runtime-validation.json`,
  `actual-windowed-verification.json` and `release-verification.json`.
  No real GUI, sound-device or listening acceptance was performed.

## RB70 MIDI import — IMPLEMENTED 2026-10-28; real use pending

- User-confirmed route: choose `.mid` or `.midi` through the song library's folder
  tile. It creates a new `.rootsound` in the default directory, avoids existing
  display names and actual filenames, then enters Arrangement. The source is read
  only; invalid or unsupported imports do not create a partial song.
- Standard MIDI format 0/1, PPQ timing. Tracks/channels/programs become editable
  lanes and phrases; percussion enters Rhythm. Actual note onsets/durations,
  velocity, start-time volume/expression/pan, tempo changes and sustain-pedal
  lifetimes are converted. Same-tick drum strikes receive an explained 0.12-second
  gate. Replacement instruments use existing local synthesizers, not the source's
  audio, plugins or complete mix. The import notice describes unavailable bends,
  pressure, continuous controller changes and other unsupported information.
- Bounds at RB70 release (the 2048-note guard is superseded by RB71): read at most 10 MiB, then apply the workstation's 2048 sounding
  notes / 10 minutes, 128 lanes, 512 clips and 64 beats per phrase. Format 2,
  SMPTE, malformed files and excess resources are rejected as a whole, not
  truncated. Off-beat tempo changes may restart the visual grid phase while
  actual note seconds remain unchanged. These are current implementation limits,
  not permanent product rules. No real desktop, sound-device or listening
  acceptance is claimed.
- Final verification: 923 program checks pass; release
  `20261028-073219-333-6af978`, build 0 warnings / 0 errors. Against the final host,
  14 native MIDI, 57 project-directory and 38 file/audio/project/sample checks
  pass. All 5 published UI files and the root launcher match their SHA256
  evidence. Reports: `.test-output/midi-import-all-tests.log`,
  `midi-import-final-native/{midi,projects,files}/`, and
  `midi-import-release-verification.json`. No GUI/sound-device run or manual
  native-file-picker acceptance was performed.

## Precise synthesis experiment — BUILT; user audition PENDING 2026-10-28

- Vulcanus pad asset: user confirms the target is the sustained notes/chords below
  the vocal in 0–20 seconds. Delivered `Vulcanus-铺底音色.rssynth`, a C4 WAV and a
  short chord audition to `D:/Sound/temp/tone/`, with a brief text guide. Synthesized
  through the published tool's exact DSP, with no source-song samples. This is a
  first approximation, not an isolated source stem or verified timbre match.
  Cold reopening the patch reproduces the C4 WAV byte-for-byte; PCM24/48k stereo,
  finite samples, headroom and complete tails verified. Existing two target files
  and the source MP3 are unchanged. Evidence and authoring files are under
  `spectral-forge/cases/vulcanus-pad/`. Musical acceptance remains pending.

- Independent tool: `experiments/music-workflow/精细音色生成器.exe`, sources and
  guide in `spectral-forge/`. Four oscillators; separate static frequency/gain,
  dynamic time/pitch and time/volume curves (10 points maximum each); fine numeric and
  curvature editing, undo/redo, live audition, unison/PM, two LFOs and effects.
- Native `.rssynth` open/save/recovery and PCM24 WAV export (44.1/48/96 kHz).
  Output stays in the experiment directory. Nine editable example patches and
  four measured offline WAVs are in `spectral-forge/output/examples-2026-10-28T05-19-15-000Z/`.
- User correction supersedes the 64/32-point implementation: each curve now has
  6 points by default and a maximum of 10. A count slider replaces the density
  button; range is 2–10, with a minimum of 3 when an interior sustain anchor is
  protected. One complete gesture is one undo step and uses its original curve
  as the fitting reference. Endpoints/sustain are preserved; reduction approximates
  important peaks and turns rather than truncating the curve. Legacy files up to
  512 points are fully validated then simplified on import; disk files are only
  rewritten by an explicit save.
- Release `20261028-055644-757-e7928b`: 69 Node + 35 native checks pass; all
  12 UI source/release hashes and launcher hash match. Evidence:
  `.test-output/spectral-forge/{count-slider-build.log,count-slider-release-verification.json}`.
  Build has 0 errors; NU1900 reports unavailable online vulnerability metadata,
  without disabling the audit. No desktop or sound-device operation was performed.
- Implementation limits: static 48-oscillator-unit budget, with effective polyphony
  displayed; 8192-point spectral FIR; 2x oversampling. Extreme settings/retriggers
  can still exceed a realtime block deadline. This is not device latency or
  listening acceptance. Main workstation RB69 and its saved projects are unchanged;
  native `.rssynth` integration was outside that batch; RB75 subsequently adds it
  to the workstation with the limitations recorded above.

## Product direction — purpose and next milestone CONFIRMED 2026-10-27

- User-confirmed final purpose: enable rhythm-game music enthusiasts to get started
  quickly and create music they find satisfying (让音游曲爱好者快速上手做出满意的音乐).
  The audience is enthusiasts of rhythm-game music and adjacent styles. This replaces the old
  universal zero-friction music/any-sound mission. Low learning and operation burden
  remains a design method; reference analysis and musical understanding serve creation.
- User-confirmed next milestone: first make one original excerpt satisfying, then
  extend it into a complete song through the same workflow. The final purpose remains
  complete music; excerpt length, time targets and acceptance benchmarks are undecided.
- User-confirmed first listening reference: `D:\Sound\temp\music\vulcanus.mp3`,
  0–20 seconds, for an original, editable excerpt. This reference window does not set
  the new piece's length or grant additional permission to extract/resell reference
  audio or claim its copyright. It is distinct from the failed `Vulcanus.wav` 25–35
  second experiment; selecting it is not listening acceptance of any generated result.
- Planning proposals, not approved feature requirements: define listening acceptance
  criteria and the first user task from this reference; improve the focused sound palette, rhythm and sound
  variation needed by that task; validate the whole path with real beginner completion
  and listening, then revise the full-song workflow from that evidence.
- Reassess existing module breadth and old plans against the new purpose. This does
  not authorize deletion or unrelated implementation. No single genre, high-BPM rule,
  mandatory AI or complete arbitrary-song reverse engineering has been selected.
- The mission change adds no delivered capability or audio/GUI acceptance. RB67's
  existing 867 program checks and release evidence below remain unchanged.

## Original passage pilot — first draft GENERATED, listening acceptance PENDING 2026-10-27

- User prioritizes the vocals and background melody of the selected reference.
  `experiments/music-workflow/original-pilot/delivery-v1/` contains the editable
  `原始交付/余焰 · 第一稿.rootsound`, full preview `01-余焰-完整试听.wav`, and focused preview
  `02-人声与背景旋律.wav`. The draft has 212 BPM, 16 bars, about 18.84 seconds including
  release, 8 tracks, 356 independent notes, 21 sample instruments and 30 segmented phrases.
- Notes and synthetic sounds are newly authored; the female1 vowel derives from
  VocalSet under CC BY 4.0 with attribution. No reference-song audio is sampled.
  Official API construction/portable roundtrip/cold decoding and matching playback
  after identity remapping pass. Native file opening, 356 MIDI note-on/off pairs,
  and embedded vocal WAV attribution/license retention pass; evidence JSON files
  are retained in that delivery directory.
- Listening WAVs are rendered offline from the compiled official playback plan;
  a uniform +6.81 dB listening gain gives about −16 LUFS without clipping. This
  adjustment is for audition volume, not a hidden change to notes or instruments.
- The musical playback mechanism is unchanged. Vocal transitions are baked into sample audio;
  editing notes does not automatically recompute general legato. No real GUI or
  sound-device audition, user listening acceptance or independent-user completion
  is claimed. Next: collect listening feedback, especially vocals/background melody,
  and revise the same editable draft. Final 356/97 total/background-note counts
  supersede the preparation version's 371/112; do not mix their audit evidence.
  The existing working copy gained a timbre draft; its 73 saved content records
  still match the packaged original. Preserve that working copy. The untouched
  baseline above was extracted from `original-pilot/余焰-第一稿-完整交付.zip`
  (about 41.7 MB), without overwriting or deleting working data.
- A later editing-performance fix is recorded as RB68 below. Actual delivered-project
  checks edit pitch/time/level/pan in one phrase from each of the 8 tracks, preserve
  unrelated notes, and restore exactly through undo/redo. The whole offline suite
  takes about 33.10 seconds including repeated reads/writes; it is not a single
  interaction time or evidence of real UI smoothness. See delivery-v1's
  `实际工程编辑核验.json`. RB67's 867 checks remain historical evidence.
- 2026-10-28: under the user's delivery preference, the untouched original is now
  also at `project/余焰 · 第一稿.rootsound`, recognized directly by the default song
  library. Its SHA256 is `5bec7b2e01026a57dd9088fe0cb11a65c2796edfa1a49e3a5768742850a42aa0`.
  Existing `kkkk`, its backup and experimental working edits were not overwritten.
  This changes delivery location, not the pending listening verdict.

## Rebuild scope — current work, 2026-10-22

### RB69 · Melody piano-roll data and drawing performance — IMPLEMENTED 2026-10-28

- Material structure copy/comparison preserves immutable sample strings instead of
  repeatedly round-tripping the whole library through JSON for small edits. Successful
  canonical sample-payload validation is reused only for the exact immutable string
  and expected byte length; an LRU is bounded by both 128 entries and 64 MiB using
  conservative UTF-16 accounting. Structural and changed-invalid data still validate.
- Parent/child editors share PhraseView; synchronous audition updates reuse the
  current view while asynchronous completion retains live-state guards. A single-note
  drag updates only its active DOM, reads geometry once, and reuses grid nodes.
  Playhead frames perform no content or layout reads. Pitch range, note count and
  editing precision remain intact.
- All 880 checks pass; desktop build has zero warnings/errors. Release:
  `20261028-042505-312-303b5b` matches all 5 UI files and the root launcher. The native
  DLL matches RB68 (`nativeMatchesRB68=true`); reuse its 38+57 native-check evidence,
  without rerunning those checks this batch. The same 17.58 MB original measures, in offline ms:
  open 869.84→171.93; eight reads 12.44→7.66; edit 776.89→48.12; undo 772.20→46.68.
  These are program-path measurements, not screen FPS, audio-device latency or
  listening acceptance. No real GUI or sound-device verification is claimed.
- Evidence under `.test-output/`: `melody-performance-full-tests.log`,
  `melody-performance-desktop-build.log`, `melody-performance-release-verification.json`,
  `material-read-performance/{before,final}.json`, `melody-render-regressions.log` (55),
  `melody-parent-performance-tests.log` (89), `melody-payload-validation-tests.log` (23).

### RB68 · Sample metadata validation performance — IMPLEMENTED 2026-10-27

- Remove full Base64 decode/re-encode from sample metadata validation while retaining
  equivalent canonical character, length, padding and unused-low-bit checks. No cache,
  project-format change or musical-content change is introduced.
- All 871 application checks pass; desktop build has zero warnings/errors. Selected
  release `20261027-104313-571-c14ec7` matches all 5 UI files and the root launcher.
  The current native DLL differs from RB67; fresh checks against this actual DLL pass:
  38 file/audio/project/sample checks and 57 project-directory checks. Keep the factual
  `nativeMatchesPriorRelease=false` result; do not substitute RB67 native evidence.
- Evidence: `.test-output/original-pilot-full-tests.log`, `original-pilot-desktop-build.log`,
  `original-pilot-release-verification.json`, `original-pilot-native-files/file-store-report.json`
  and `original-pilot-native-projects/project-directories-report.json`. No real GUI,
  sound-device listening or user musical acceptance is claimed.

### RB67 · Melody total-note families and single tone reassignment — IMPLEMENTED 2026-10-27
- D-2026-10-27-8 replaces Melody's tone shelf with independent total-note families.
  Cards display the contained tone's current name, not a separate family name.
  + opens a single-tone picker; choosing creates a fresh family even when another
  family uses that tone. Tone assets remain shared; family identities stay separate.
- The family console's Change Tone picker replaces only that family's binding,
  preserving part/note IDs, timing, pitch, held seconds, mix and velocity. Undo and
  project transfer retain the grouping; reassignment does not move the playhead.
  Existing parts map directly to families. Undefined families can be reassigned.
- Rhythm keeps its previous multi-select tone shelf/undefined-note behavior;
  phrase-library shelf toggles also remain. Standalone audition and guarded note
  clearing continue. This supersedes only Melody's previous membership toggles.
- Verification:867 program checks; selected release
  `20261027-083933-659-2a904c`. Type check and desktop build pass with zero warnings/errors; all5 UI hashes and the root launcher match. Native assembly matches RB60; no fresh native file checks. Evidence: `.test-output/total-note-verification.json` and matching full-test/build logs. No actual desktop
  observation/control or sound-device acceptance is claimed.

### RB66 · Library toggles, undefined tones and seven local starters — IMPLEMENTED 2026-10-27
- D-2026-10-27-7 keeps tone/phrase libraries open for continuous card selection,
  with a right-arrow return. Phrase toggles only shelf visibility; preserve clips,
  source identity, double-click rename and existing permanent-deletion warnings.
- User clarification: a tone uncheck keeps notes as silent undefined uses, with an
  undefined left-shelf part. Optional `unassigned` defaults to assigned for old data;
  recheck restores the original part/note identities using its retained binding.
- Left-tone double Delete within500ms or double-click console Delete clears all its
  notes in one undo item. Single console click does nothing; individual-note Delete
  is unchanged. Tone-library trash removes current department uses and their notes,
  preserving the song's asset and other uses. Removing the last part leaves a valid
  empty phrase in the new UI. All these musical edits remain undoable.
- Separate shelf/library play buttons audition without selecting or writing;
  undefined shelf audition is disabled. Compact all three types of rectangle cards.
- New songs include independent local synth starting points for piano, flute,
  bass drum, electronic kick, strings, trumpet and guitar. Labels are 钢琴、长笛、
  底鼓、踢、弦乐、小号、吉他; these are synthesis approximations, not sampled instruments.
  Idempotent preparation retains existing names/edits and project isolation.
- Verification:861 program checks; selected desktop release
  `20261027-081458-712-fdbb45`. Type check and desktop build pass with zero warnings/errors; all5 UI hashes and the root launcher match. Native assembly matches RB60; no fresh native file checks. Evidence: `.test-output/tone-library-verification.json` and matching full-test/build logs.
  No actual desktop observation/control or sound-device acceptance is claimed.

### RB65 · Performance settings, view keys and full phrase length — IMPLEMENTED 2026-10-27
- D-2026-10-27-6 adds Settings immediately before Save across module top bars.
  Keyboard performance is persisted, default off; returning from settings refreshes
  the current editor. Existing old preferences load without forcing a file migration.
- Z/X centers the highlighted octave in the piano roll. Arrows pan all three view
  types; Ctrl arrows zoom each axis around the visible center. Navigation neither
  modifies music nor moves the playhead and honors inputs, IME and modal guards.
- Undo/redo of a performance-generated note restores its before/after cursor.
  Ordinary edits leave the cursor alone. Coordinates are session metadata linked
  to musical history, not an additional persisted project-history stream.
- Melody/Rhythm rightmost + adds four beats to their shared length, retaining cell
  width and revealing the new end. Initial16 beats can extend to the present domain
  limit64; + disables there. Overview/preview/save/arrangement/export use the full
  length, preserving old long notes and fixed-second durations. This replaces the
  earlier16-beat viewport limit without silently shortening existing content.
- Verification:842 program checks; selected desktop release
  `20261027-044403-101-07b091`. Type check and desktop build pass with zero warnings/errors; all5 UI hashes and the root launcher match. Native assembly matches RB60; no fresh native file checks. Evidence: `.test-output/performance-navigation-verification.json` and matching full-test/build logs. No actual desktop
  observation/control or sound device used; appearance and listening remain separate.

### RB64 · Immediate note audition, section playback and pitch-row range — IMPLEMENTED 2026-10-27
- D-2026-10-27-5 plays a generated note once: mouse press auditions the temporary
  note immediately, with no second audition on release. Successful keyboard entry
  waits for transport positioning before audition so main playback cannot cancel it.
  Rests, guarded input and key auto-repeat do not sound; stale requests must cancel.
- Melody detail plays only Melody; Rhythm detail plays only Rhythm. Overview plays
  both. Live switching, mix/BPM edits and pause/resume obey the active section;
  an empty section keeps a silent clock. Mask only temporary preview notes, never
  saved content, dependencies, complete phrase compilation or export.
- Replace console Cn–Bn with highlights at the left edges of the active keyboard
  octave's pitch rows. Z/X moves them; auto-selected new notes retain them, manual
  existing-note selection/right blank clears them. Rhythm has no octave highlight.
- Regression:825 program checks pass; type check and desktop build pass with
  zero warnings/errors. Selected release `20261027-042548-805-5294f5` has5 matching UI hashes
  and a matching root launcher. Native assembly matches RB60's tested version;
  native file checks were not repeated. Evidence:
  `.test-output/section-audition-verification.json` and matching full-test/build logs.
  Actual desktop/device, appearance, gestures and listening remain untested.

### RB63 · Musical Backspace undo, auto-selected notes and right-side consoles — IMPLEMENTED 2026-10-27
- D-2026-10-27-4 makes Backspace undo the current musical edit; Delete remains
  explicit deletion. Reuse the domain history rather than adding cursor/view
  history or a special playhead rewind. Input controls retain their native editing.
- New notes are selected and expose their controls. Melody keeps a separate armed
  tone-entry context so automatic selection does not interrupt typing/rests. Undo
  and redo retain a valid tone context; manually picking an existing note or right
  blank clears it. Space is rest while armed, playback otherwise.
- The Melody/Rhythm console belongs below the right editor column, leaving the
  tone shelf full height. Rhythm shelf masking follows the right viewport height.
  Remove padding/minimum-width expansion from short notes; actual held seconds
  determine width, and long notes retain their multiple-cell spans and audio.
- Right blank clears every selection (note/tone/row/shelf source) and closes the
  console without a musical-history write. Note hits and right-drag erasure remain.
- A focused range slider still permits Backspace Undo, while text/number fields
  retain native character editing. Subpixel note geometry follows actual duration
  without a fixed pixel floor, extra padding or an outside selection outline.
- Regression:816 program checks pass; desktop build has zero warnings/errors.
  Selected release `20261027-035835-194-1dec71` has5 matching UI hashes and a
  matching root launcher. Native assembly matches RB60's tested version; native
  file checks were not repeated. Evidence: `.test-output/editor-selection-verification.json`
  and the matching full-test/build logs.
  Checks are headless, with actual appearance, gestures and device listening untested.

### RB62 · Melody keyboard step entry and selection-scoped rests — IMPLEMENTED 2026-10-27
- Historical selection scope: RB63 adds automatic new-note selection while keeping
  an independent valid tone context for continuous entry; other timing rules remain.
- D-2026-10-27-3 maps `c f v g b n j m k , l .` to the12 chromatic tones Cn–Bn
  when Melody has only a tone selected. Z/X lowers/raises n; the current starting
  choice is4 and bounds0–8, still respecting20–5000Hz. An out-of-range tone neither
  writes nor moves the head. Rhythm and note selection do not enter this mode.
- Implementation interpretation: use the strictly next grid line to the right.
  Note onset and new head position are the same coordinate; one key advances only
  once. New notes initially last one cell in seconds, preserving the BPM policy.
  Space inserts a rest by advancing once without an entity or starting transport.
  Other contexts retain Space playback/pause. Tone-only selection persists.
- Input fields, Ctrl/Alt/Meta modifiers, IME composition, open dialogs and key
  auto-repeat do not write. Do not move past the four-bar usable cell boundary.
  Successful writes use normal undo, safe save and portable phrase/project data.
- The editor reads the shared transport's authoritative position, reveals typed
  pitches/times and shows the active octave. Narrow note resize handles occupy
  at most25% of the note width, preserving center dragging at high BPM.
- Regression:797 program checks pass; desktop build has zero warnings/errors.
  Selected release `20261027-033125-605-c05ec9` has5 matching UI hashes and a
  matching root launcher. Native assembly matches RB60's tested version; native
  file checks were not repeated. Evidence: `.test-output/melody-key-entry-verification.json`
  and the matching full-test/build logs.
  Checks remain headless, with no actual desktop/device or user-project operation.

### RB61 · Shelf editing entry, title type labels and wider trash mist — IMPLEMENTED 2026-10-27
- D-2026-10-27-2 adds direct phrase editing on double-clicking a song-shelf card.
  Existing single selection and dragging remain; library double-click rename is
  distinct and unchanged.
- A small independent type label follows the editable name: 乐曲 for arrangement,
  乐句 for phrase overview and both department editors. Melody/Rhythm badges
  remain; type text is display metadata, never part of a saved or copied name.
- Trash has a wider white mist, retaining its icon-only appearance and hit area.
  Implementation choice:148px mist base plus blur around the68px target and34px icon;
  the user requested a broader fade, not these exact measurements.
- Regression:780 program checks pass; desktop build has zero warnings/errors.
  Selected release `20261027-024810-245-5556bb` has5 matching UI hashes and a
  matching root launcher. Native assembly matches RB60's tested version; native
  file checks were not repeated. Evidence: `.test-output/shelf-entry-verification.json`
  and the matching full-test/build logs. Checks remain
  headless; no desktop operation or device playback, and no visual acceptance claim.

### RB60 · Aligned rhythm rows and shared phrase authoring — IMPLEMENTED 2026-10-27
- D-2026-10-27-1 adds Create at Rhythm's right edge. It opens the same phrase's
  step sequencer with the existing header, transport, song tone library and console,
  a Rhythm badge and Back to overview. Save/Save As retains the current section.
- Wide rows represent tones. Shelf cards and timeline rows align one-to-one;
  scrolling and row zoom stay synchronized. The bottom plus uses the same library
  as Melody, with the existing two local synthesized starting voices.
- Creation, continuous drag then cell settlement, edge resize, right-path erase,
  Q/E pan, W/S level, A/D one cell and150ms double-press one beat reuse the melody
  interactions. Four cells per beat and fixed-second note durations remain.
  Tone selection shows its name; note selection exposes tone, level, start, pan,
  seconds and velocity, without pitch controls or a keyboard.
- Optional part.section keeps authored departments separate; omitted old sections
  read as Melody. Tones may be used independently in both departments, while a
  repeated selection reuses a tone's row in the current department. Save, song
  playback and portable files contain both groups. Preview/edit/delete in one
  group preserves the other. Cross-row transfer retains note identity and pitch
  while using the destination tone, with one undoable atomic write.
- Implementation choice, not a user-confirmed root-note design: new rhythm
  notes trigger C4; existing note pitch remains untouched. There is no root-note
  editor in this batch. The old detailed phrase editor stays unmounted.
- Horizontal zoom preserves wide row height; a ruler mask keeps scrolled shelf
  cards aligned. A selected note stays bright during a cross-row preview, and
  keyboard edits commit pending gestures before reading their final position.
- Full regression:775 program checks,58 published native project checks and38
  file checks pass; desktop build has zero warnings/errors. Selected release
  `20261027-021443-992-6e35d7` has5 matching UI hashes and a matching root launcher.
  The native seed contains both groups, shared-tone uses, cross-row transfer and
  fixed-second tempo edits. Evidence: `.test-output/rhythm-workspace-verification.json`,
  full-test/build logs and release-native/release-files directories with that prefix.
  All checks are headless; no actual desktop/audio-device or user-project access
  is claimed. Appearance, gesture feel and listening remain for user review.

### RB59 · New melody editor, local tone library and fixed-second note timing — IMPLEMENTED 2026-10-26
- Historical scope: RB60 now implements the rhythm tools left for later below.
- D-2026-10-26-9 adds a56px Create strip to the overview Melody section and a
  new same-phrase editor. Header, transport and four-bar range are shared; the
  title gains a Melody badge and Back returns to overview. Overview stays blank;
  the old detailed editor remains unmounted, while new note tools are usable.
- The tone shelf plus opens a compact library of all current-song voices,
  seeded with independent synthesized 钢琴/长笛 starting voices. No download or
  acoustic sample is used. Seeding is idempotent across reopen/rename/ID-remapped
  project import, names avoid per-kind collisions, and other songs stay isolated.
  Adding an existing tone returns its existing part; adding a new part is atomic
  and undoable, protecting notes, sample graphs and unfinished customizations.
- A continuous full-range SPN keyboard and newly added notes audition the selected
  tone. Four cells per beat, tone-colored notes and strong dimming of other-tone
  actual notes clarify ownership. Drags are continuous, settling on a cell at
  release. Console shows only a selected tone's name or editable note level,
  pitch, start, pan, durationSeconds and velocity. Q/E pan, W/S level, A/D one
  cell; same-direction150ms double-presses total one beat. Unsupported playing
  articulations are not exposed for the two supplied synthesized voices.
- Confirmed BPM policy: starts follow beats/cells; individual seconds lengths,
  pitch and timbre stay fixed. Optional durationSeconds plus the explicit
  preserveNoteDurations tempo option preserve legacy-note duration without
  rewriting all old bodies. This changes phrase-header timing, not arrangement's
  visual BPM or the separate head-rate control. Rhythm tools remain future work.
- Fresh song pickers show only piano/flute instead of untouched autogenerated
  scaffold voices. Their originals remain; notes, renames, saved/unsaved tone
  customization or explicit retention keep a scaffold voice visible. Tone colors
  are unique within the8-part scope; duplicate parts with the same tone stay bright.
- Full regression:758 program checks,58 published native project checks and38
  file checks pass; desktop build has zero warnings/errors. Selected release
  `20261026-144410-284-9236b8` has5 matching UI hashes and a matching root launcher.
  The native seed contains the two voices, fixed-second duration, note mix and
  tempo edits. Evidence: `.test-output/melody-workspace-verification.json`,
  full-test/build logs and release-native/release-files directories with that prefix.
  Verification is headless only; actual GUI, device playback and musical/gesture
  acceptance remain unperformed. No user-project modifications are claimed.

### RB58 · Shared four-bar melody/rhythm phrase workspace — IMPLEMENTED 2026-10-26
- Historical scope: the no-note-authoring shell below is extended by RB59's new
  Melody editor; RB73 subsequently replaces the blank overview with note previews
  and independent vertical views. The legacy detailed editor stays unmounted.
- D-2026-10-26-8 replaces the main phrase route with the song-style header,
  equal Melody/Rhythm halves and left controls, and one shared blank canvas/head.
  No row/column grid, notes, legacy note toolbar or legacy detailed-editor entry
  is shown. Existing detailed source and stored notes remain intact; department
  authoring tools are intentionally future work, not part of this shell delivery.
- Creation uses an available 乐句 n without a dialog and16 stored beats.
  Save/Ctrl+S retains the current phrase in its song library and stays open,
  including empty phrases; Save As opens an automatically named same-song copy.
  Exit returns to arrangement. Existing reference-safe save semantics remain.
- Ruler/head-only seeking and dragging, shared horizontal blank-drag/wheel pan,
  Ctrl+wheel zoom, and strict0–16-beat bounds apply to both halves. There is no
  vertical/Shift scrolling. Transport supports silent phrases, pause/resume,
  stop/reset,0.75/1/1.25 head rates and beat-preserving BPM changes. Header gain
  persists and is honored by phrase audition and full-song output.
- Long old phrases retain their complete saved body/notes and song playback;
  only the first16 beats are viewed/auditioned in this workspace. Preview cropping
  does not mutate stored sounds. Failed/cancelled preparation and navigation
  cancel stale sessions without affecting unrelated playback.
- In-place Save preserves viewport, head and playback state across continuation
  draft replacement. Exit preserves unfinished child tone work; Save As closes
  only clean old sessions, and a cleanup failure still opens the committed copy
  with an accurate retained-edit notice. Five mountStudio integration tests cover
  repeated occurrence saves, copy-on-write, reentry and portable project export.
- Full regression:723 program checks,58 published native project checks and38
  file checks pass; desktop build has zero warnings/errors. Selected release
  `20261026-134329-146-fd63d3` has5 matching UI hashes and a matching root launcher.
  Evidence: `.test-output/phrase-composition-verification.json`, full-test/build
  logs and release-native/release-files directories with the same prefix.
  Verification is headless only; no real desktop interaction, sound-device
  playback or user-project changes are claimed. Actual appearance and feel
  await user review.

### RB57 · Library naming, row mix and direct arrangement controls — IMPLEMENTED 2026-10-26
- D-2026-10-26-7 implements library double-click rename, exclusive row Solo/Mute,
  source-phrase console audition, persistent shelf drag order, immediate console,
  upper-right borderless white-fade trash, ruler-only seeking/blank-view panning,
  and name-only Save As into the default song library.
- Actual placed double-click failure was selection rebuilding the clicked node.
  Retain targets and recognize same-entity stationary releases across redraws;
  small jitter and duplicate native events are covered. Library single-clicks
  wait the Windows double-click interval plus 50 ms (fallback 600 ms), with 450 ms and
  slower configured timing regressions. Name edits retain identity and report
  validation/storage failures without opening or adding the card accidentally.
- Shelf order is non-musical metadata, survives native reopen/Save As and undo,
  and is removed when its phrase is permanently deleted. Audition owns/cancels
  only its own session and stops on navigation/selection/song playback. Muting
  the solo row does not unexpectedly enable the others.
- Library project rename updates the selected real song draft plus file metadata
  through a version-checked storage snapshot, preserving paths/IDs. Legacy rename
  validates staged original bytes before commit, protecting late external edits
  and A/B/A races; ordinary failures roll back, recovery failures preserve files.
- 688 program tests including 54 playlist UI cases pass. Published binary passes
  58 project and 38 file cases; build 0 warnings/errors. Selected release
  20261026-120645-781-4518bd; all 5 published UI hashes match built output.
  Evidence: .test-output/playlist-detail-full-tests.log,
  .test-output/playlist-detail-release-native/project-directories-report.json,
  .test-output/playlist-detail-release-files/file-store-report.json and
  .test-output/playlist-detail-desktop-build.log. No real GUI/audio device or user-project edits;
  visual/listening acceptance remains separate. Legacy .rsproject display-order
  remapping remains outside its narrower exchange scope.
- Documentation writes were previously deferred because approval review timed
  out or disconnected, not because the change was judged unsafe. The user
  explicitly approved updating these records afterward. This documentation-only
  follow-up uses the existing evidence; it does not rerun tests or rebuild.

### RB56 · Compact libraries, release-time console and permanent deletion — IMPLEMENTED 2026-10-26
- D-2026-10-26-6:54px-high rectangular library cards, console reveal on release
  without held-pointer layout shifts, icon-only trash. Song/phrase library drags
  require a small warning before permanent deletion; ordinary hide/erase unchanged.
- Phrase transaction removes all uses/drafts/recovery custody while preserving
  unrelated entities/contexts, and repairs dormant editors. Scoped permanent-write
  bridge atomically advances editable checkpoint, preventing discard resurrection;
  failed writes preserve state/history/token. Warning discloses saving current work.
- Native project deletion validates exact path/ID, locks, links, read-only/unknown
  files and backups. Captured handles recover mid-delete failures. Independent
  review found/fixed reoccupied-path last-copy loss and legacy manifest checkpoint
  guard; injected cases confirm preserving both newer files and original bytes.
- 655 program tests including7 phrase-deletion and56 focused UI cases pass;
  actual published binary passes50 project and38 file cases. Desktop build0warnings/
  errors, selected20261026-092842-234-34bc34;5 published UI hashes match dist.
  Evidence .test-output/library-refinements-verification.json, library-refinements-
  full-tests.log, library-refinements-release-native/ and -release-files/.
  Real project/ remains empty and untouched in this batch. No actual GUI/device;
  visual acceptance remains separate. Normal backup recovery remains available.

### RB55 · Song/phrase libraries, drag trash and single-file projects — IMPLEMENTED 2026-10-26
- D-2026-10-26-5: welcome Start opens Song Library with top New, discovered
  project squares and bottom file picker. Existing naming/settings/Back retained.
  Arrangement + opens per-song Phrase Library; its bottom + creates. Library
  ignores historical custody/public starters; shelf hiding/readding retains IDs.
- Drag trash handles timeline occurrences and shelf-only visibility separately;
  cancellation, failed retention and disposal preserve sources/placements. New/
  direct-save paths inside phrase editing also join this song's library, copying
  public sound dependencies privately and preserving owned sound identities.
- New .rootsound v2 embeds the entire editable library in one direct file under
  default project/. Atomic writes, recovery backup, external-change checks,
  scoped/exclusive ownership and manual-save/discard behavior retained. Catalog
  skips corrupt/duplicate-JSON/backup/link entries; distinct copied paths list.
  Native picker selects files. Legacy folders remain readable/saveable; Save As
  creates the new format. No user songs deleted or converted automatically.
- 637 program tests,37 project-file native cases and38 file regressions pass on
  actual published binary; desktop build0warnings/errors. Rich real-domain seed
  reopens byte-exact with same playback plan, two library phrases, hidden shelf,
  pending notes editor tempo and undo. All5 published UI files match dist hashes.
  Selected20261026-085649-640-e335d0; evidence .test-output/library-verification.json,
  library-full-tests.log, library-release-native/ and library-release-files/.
  No screen/GUI/device use or real user-project edits; actual appearance/gesture
  acceptance remains separate. Legacy .rsproject remains narrower graph exchange.

### RB54 · Shorter beat-step double-tap window — IMPLEMENTED 2026-10-26
- User reports accidental beat jumps during fast nudging. Reduce A/D pairing
  from300ms to150ms (adjustable implementation choice), for clips and rows.
- Fake-clock boundary/held-repeat regression and UI/geometry43 checks pass.
  Build0warnings/errors, selected20261026-075213-850-882c11; evidence
  .test-output/nudge-timing/. Published UI matches build; no actual GUI/device.

### RB53 · Remove automatic placement magnets — IMPLEMENTED 2026-10-26
- Drag, shelf preview/drop and A/D fine movement now use raw coordinates or
  deltas, including near grid lines and clip edges. Removed unused snapping
  helper/state. Explicit beat commands and fine-motion controls remain separate.
- 42 UI/geometry plus21 domain/transport/runtime checks pass; build0warnings/
  0errors, selected20261026-073321-020-02ed93. Evidence .test-output/no-playlist-snap/.
  Published UI matches build; no actual screen/device operations.

### RB52 · Drag the summoned playhead — IMPLEMENTED 2026-10-26
- Blank left-press now begins the same captured head gesture as the ruler:
  summon immediately, continue horizontal dragging, clamp at zero, end on
  release/cancel. Playing seeks retain playback; clips/mix/grid stay unchanged.
- 34 UI plus22 transport/runtime/geometry checks pass; build zero warnings/
  errors, selected20261026-071807-797-57d607. Evidence .test-output/blank-head-drag/.
  No actual screen/device operations; published UI matches the built files.

### RB51 · Selection inspector and project picker — IMPLEMENTED 2026-10-26
- D-2026-10-26-3: neutral light arrangement, widened color target, source/row/
  instance inspector, graphical live gain/pan, name/title double-click editing.
  Source BPM/duration/start are text, source selection highlights all uses and
  disables QWEASD; placed double-click and detailed action open phrase editing.
  Untouched controls do not create edits, one drag commits once, cancel restores.
- Read-only phrase metadata, safe occurrence/source rename, explicit all-use
  shared editing and row additive pan bus preserve default COW, names/scopes,
  unfinished notes, undo and failed-write atomicity. Ambiguous/unselected other
  positions or pending source edits keep safe forks instead of shared overwrite.
- Naming Back never creates a folder. Open menu discovers only valid direct
  default projects, known selection bypasses picker, custom entry invokes it.
  Title is carried through Save/Save+Exit into protected manifest without moving
  directory, changing identity/createdAt or publishing failed metadata updates.
- 609 program checks including40 UI/geometry and12 phrase-inspector cases pass;
  35 native directory/catalog/title plus38 file regressions pass. Build0warnings/
  0errors; selected20261026-070231-062-f93523. Published UI/tested native assembly
  hashes match, evidence .test-output/song-inspector/verification.json and
  project-catalog-native-checks/. No actual GUI/device/user-project operations.
  Actual visual/gesture acceptance remains separate. Start-time read-only and
  hidden unselected console are recorded implementation interpretations.

### RB50 · Clearer playlist and explicit exit to welcome — IMPLEMENTED 2026-10-26
- D-2026-10-26-2 implemented. BPM now truncates all markers at/right of the
  cursor, including explicit same-value resets; Save alone never clears them.
  Name area is smaller, single click selects and native double-click edits.
  Blank click seeks during play/pause without taking over clip/control actions.
- Neutral navy/high-contrast panels and24 vivid full-clip colors/custom colors;
  light/dark label ink meets4.5 contrast in palette/custom-shade checks. Smaller
  move/drop magnets2px/4px, Shift0.1 incremental movement without snapping,
  horizontal zoom up2560px/s. Empty message now ends “吧”.
- Red Exit follows Save As and returns welcome. Attached fields/gestures commit
  before checking dirty state; pending exit freezes background interaction.
  Cancel preserves project; discard restores opening/manual-save snapshot;
  save checkpoints before releasing ownership. Failures retain current project.
  Native known-text dirty status doesn't adopt external data, initial editor
  scaffolding/legacy mode normalization completes before one-shot loader seal,
  and repeated loading cannot mark later edits clean. Old scope writes fail.
- 585 program checks (including35 UI/geometry),28 native project/save/exit and
  38 native file regressions pass. Build zero warnings/errors; selected
  20261026-054615-719-461c4c. Published UI and native assembly hashes match tested
  outputs. Evidence .test-output/playlist-polish/, project-exit-native-checks/.
  No actual GUI/device operations or user-project modifications during tests.
  Real visual/gesture acceptance remains separate. Exit checkpoint is scoped
  to the running project session; this does not redesign crash recovery/window-X.

### RB49 · Row control and fluid playlist editing — IMPLEMENTED 2026-10-26
- D-2026-10-26-1 implemented: zero-clamped viewport, no ruler time labels or
  blank-grid drag, sixty-pixel default rows, pinned naming/color/two-click
  delete controls, continuous row/clip transforms and smooth settled positions.
  Row selection applies mix/position edits in one batch; paired A/D moves one
  displayed BPM beat in total. Naming survives scrolling and adjacent clicks.
- Drag head stopped/playing, clock output, stop/reset and cursor-anchored
  visual BPM sections are connected. Later explicit sections remain; markers,
  colors and order survive undo, reopen, Save As and portable interchange.
  Empty shelf curtain/highlight and flatter phrase tiles are present.
- Reproduced playback blockers fixed at both boundaries: empty reusable phrase
  no longer invokes the independent phrase no-notes guard; explicit silent
  playlist plans now create an execution clock. Audible pause/resume also
  passes integration; no claim that all possible reported GUI causes reproduced.
  Explicit post-end seeks use a provisional bounded30s silent audition tail,
  mapped to a local clock beyond the600s audio-plan limit, without saved extent
  or export changes. Normal end still returns to zero.
- 572 program checks pass, including30 UI/geometry and actual runtime-adapter
  integration with a fake device. Desktop build zero warnings/errors; selected
  20261026-051505-220-f3629d. Published UI hashes match build output; evidence in
  .test-output/playlist-refinement/. No real GUI/audio-device operations; visual
  fluidity and listening quality remain for user experience.

### RB48 · Full-window song playlist — IMPLEMENTED 2026-10-25
- D-2026-10-25-1 implemented: new topbar, phrase-only shelf with atomic empty
  phrase creation, seven-row default, virtual second-coordinate grid and add-row,
  independent grid BPM/offset, anchored zoom/pan, magnetic release, drag/mix keys,
  path erasure/animation, real pause/rate transport and live provisional gestures.
- Save checkpoints the current folder with conflict detection; Save As renames
  only the copied library and creates a separate folder, default name+“ 1”.
  Draft-root explicit members retain shelf assets without implicit song save or
  losing undo. Earlier seven-row/default-name/project-directory behavior remains.
- 536 program checks pass;21 native directory/save plus38 file regressions pass.
  Build zero warnings/errors; selected20261025-152117-199-99190f. Evidence under
  .test-output/playlist-rebuild/, playlist-native-projects/ and native-file-regression/.
  No actual GUI/device operations or visual/listening acceptance. Resume recreates
  synthesis phase with5ms transition while preserving envelope/sample age.

### RB47 · Named songs and independent project folders — IMPLEMENTED 2026-10-25
- User specifies the name/Create page and bottom detailed settings for this
  creation's location. Brand stays fixed, Save returns without creating, and
  default installation/project governs future automatic discovery.
- Each named folder has its own manifest/materials/drafts/history; real domain
  seed, native folder choice/reopen, duplicate/atomic-write/old-page protection.
  Custom parent is per creation, not a default change or move. Post-create song
  workspace is provisional. Unselected desktop sessions stay on the welcome.
- Cleared only the verified retired main-workstation library and backup under
  its lock:17 contents/9 drafts/history; cache/lock/source/experiments and unknown
  external exports retained. Evidence .test-output/new-project-flow/.
- 497 program checks,19 native directory cases (actual TS seed),38 file regressions
  pass. Selected20261025-141758-143-1b823f; build zero warnings/errors. No desktop,
  picker, audio device or actual visual acceptance. Browser cannot create real
  project folders and does not claim it did.

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

### RB33 follow-up · Timbre graph transport and blue-line crop — IMPLEMENTED 2026-10-24
- Origin: user requests a draggable red playback cursor and two blue selection
  boundaries, compact audition/pause controls, horizontal zoom, and Save Timbre
  plus WAV export retaining only the audio between the blue boundaries.
- Use the existing shared Timeline math in the timbre graph. Red position is
  independent of the blue crop; top/bottom handles distinguish overlapping
  markers. Shift drag refines frames, zoom controls/Shift wheel change horizontal
  scale, scrollbar/wheel/middle drag pan; full-view reset preserves audio times.
- Keep complete original/processed sample context and audition. Blue edits do
  not rerun cleanup or erase outside context; GetPatch crops actual processed PCM
  for both output formats and key audition. Intersect/rebase sustain settings,
  disabling unusable loops. Sustain controls remain independent of the blue crop.
- Sample audition toggles play/pause at the red cursor. Initial/dragged seeks
  use playback revision acknowledgements so stale snapshots cannot rewind the
  cursor; dragging to EOF pauses. Original comparison preserves position and
  does not change the processed selection that will be saved.
- Verification: 73 groups passed (host21, processing20, instrument16, workflow6,
  selection10), full Windows build zero warnings/errors. Added cropped stereo
  archive/WAV reopen and exact-frame checks, loop rebasing, graph rendering/hits,
  zoom/precise dragging, delayed seek and actual host save-path checks using
  generated audio/fake playback. Minimum-window compact control bounds checked
  without showing a window. Build selection/hashes and logs are retained in
  .test-output/timbre-selection/verification.json and adjacent logs.
- Limits: no real playback, screen capture, desktop control or user-library
  changes. Offscreen graph inspected; actual listening, pointer feel and system
  save-dialog use remain for user acceptance. Recorder/editor/main app unchanged.

### RB33 keyboard follow-up · Piano/sample modes and wider range — IMPLEMENTED 2026-10-24
- Origin: user cannot confidently identify a sample's pitch and requests piano
  versus sample keyboard modes plus a larger pitch range.
- Continuous A0–C8 88-key keyboard, black/white key geometry, note/frequency
  labels, horizontal navigation, octave jumps and center C4. Default piano mode
  works without imported audio; sample mode requires current nonempty blue crop.
- Add offline synthesized piano reference with exact A4=440 fundamental, struck
  onset, decaying overtones, release and bounded output. It is clearly described
  as a synthesized reference, not a sampled piano library. No downloads/drivers.
- Keep the shared audition lifetime: switching stops old key voices and cancels
  pending renders; sample mode uses the existing cropped instrument renderer.
  Piano never changes root/settings/selection or exported .rstimbre/WAV content.
  Original-pitch sample listening is explained separately from transposed keys.
- Verification: 79 groups (previous73 plus keyboard6), full Windows build with
  zero warnings/errors. Checks cover independent pitch projections, all88 notes,
  range endpoints/black-key ordering/navigation, unshown minimum layout, no-sample
  piano, exact sample rendering, mode cancellation and unchanged saved patches.
  Reports and selected/tested/launcher hashes: .test-output/timbre-keyboard/.
- No real audio playback, desktop observation/control or library changes. Actual
  sound quality and keyboard feel await user acceptance; other module source and
  main workstation are unchanged by this keyboard work.

### RB34 · Independent phrase workbench from timbre files — IMPLEMENTED 2026-10-24
- Origin: user's fourth experiment specifies empty initial workspace, named
  phrases, narrow channel rows, timbre import, free choice of step/piano mode,
  simple previews and large detailed editing. New phrase, resume file, Save
  overwrite warning and Save As are implemented as specified.
- Deliver phrase-studio with stable Chinese 乐句谱写.exe and independent build
  BAT. Import .rstimbre preserving original root/ADSR/gain/loops. Channel names
  default to filenames, suffix conflicts and can be renamed. Empty timbre rows
  block Save; detailed edits immediately update the phrase and local draft.
- Shared notes survive mode changes. Steps toggle inline and expose detailed
  velocity/pitch; piano has continuous MIDI0–127 scrolling, full note-body hit
  areas, smooth fractional drag, edge resize, precision, zoom and undo/redo.
  No ghost notes. File contains exact floating PCM and settings without source
  path dependencies. Atomic saving/cancellation protects existing targets.
- Stream polyphonic stereo at the actual device clock; live edits crossfade
  over a short block, keyboard previews mix independently. Non-loop playback
  waits for natural release, pauses/resumes its tail and then restarts at zero.
  Audio/source state remains intact on errors. Provisional playback cap is128
  simultaneous notes, with an explicit error rather than silent dropping.
- Private recovery index addresses exact owned draft folders. Debounced note
  edits reuse cached timbres and rewrite only small manifests. Recovery is an
  explicit startup action; exports are separate. Close-tab save/discard/cancel
  and app-close flush are implemented; no scanning or cleanup of user files.
- Validation: 71 groups pass (core11, persistence19, audio23, editor12,
  workflow6); full Windows build zero warnings/errors. Release
  20261024-041841-683-d48b63; GUI entry/launcher and selected/tested assembly
  hashes match. Evidence: .test-output/phrase-studio/build-final.log,
  20261024-041832-b4865f/ and verification.json.
- Checks include third-module timbre→phrase→reopen after deleting the generated
  timbre fixture; timing/tuning/ADSR/loop equivalence; save gating/naming/history;
  failure/cancellation during staging and first sample hashing; malformed files;
  real-clock simulation, tail/replay/seek/live changes; bounded sparse rendering;
  mode retention/drag/hits; private recovery and offscreen editor plots. Root
  form/pane constructors remain invisible without public control handles.
- Limits: no real window shown, desktop observation/control, sound-device use
  or main library access. Actual listening, pointer feel and system dialogs are
  pending acceptance. Main workstation and prior module sources were not
  modified by this work. Initial supported meter/length/limits and experiment
  file encoding remain adjustable; no main-workstation file bridge or installer.

### RB35 · Reference-led Vulcanus understanding and editable reconstruction — SOFTWARE IMPLEMENTED; MUSICAL RESULT REJECTED 2026-10-24
- User listening feedback: the25–35s excerpt is musically complete; the
  reference→editable reconstruction→personal variation path may be viable.
  Timbre separation/reconstruction differs substantially from what they hear,
  artistic understanding has not been demonstrated, and pitch has some of the
  intended character but remains far from the original. Software checks do not
  override this failed musical acceptance. Neither212BPM nor exact note/voice
  attribution is confirmed by acceptance of the excerpt boundary.
- Origin: D-2026-10-24-4 and the user's supplied D:/Sound/temp/music/Vulcanus.wav.
- Prepare one actual-song excerpt, an explicitly estimated editable musical
  reconstruction and one focused comparison workbench. Reuse previous editors;
  add a single-clock reference/reconstruction source, solo, sound changes,
  complete case saving, WAV delivery and separate private recovery.
- Preserve source/other songs/prior tools/main app. No arbitrary-song automatic
  reconstruction claim; subjective resemblance and creative usefulness remain
  user acceptance criteria. Record the actual analyzed/estimated/source-derived
  origins and limitations beside the case.
- Delivered reference-studio and Chinese 拆解与改写.exe. Default case uses
  source25.345–34.4016s, estimated212BPM/8bars, 5 layers/129 editable notes.
  Official local Hybrid Demucs assists signal analysis: short model-estimated
  drum samples and synthesized/estimated melody/upper/bass layers. Separate
  sound-observation case has3 complete estimated drum/bass/other clips; its
  single trigger per layer is explicitly not a transcribed score. Toolbar
  switches cases at the same position after handling unsaved edits.
- One output clock, solo, live edits, sound sliders, undo, self-contained
  .rscase, PCM24 WAV and exclusive private recovery are implemented. Baselines
  are preserved for Save As. WAV ignores temporary solo and includes unmuted
  layers. Original/baseline/hard-link overwrite protection is implemented.
- Verification:65 groups pass (archive16/audio22/UI13/layout2/actualCase6/
  observation6), final build zero warnings/errors. Release
  20261024-060011-320-8216fc; evidence .test-output/reference-studio/.
  Source SHA and every excerpt frame match the original. CPU models are only
  used for case preparation, not playback/reopening. Audio stayed local;
  download/cache provenance and formal-script offline cache probe retained.
- Final5-layer renderer:182 cold-cache50ms windows, median1.61ms/max6.50ms,
  sweep/echo max4.87ms. Bounded reusable voice/dry caches invalidate edits and
  preserve byte-exact output checks. No real sound-device/screen/desktop use.
- Limits: hidden native handles only for offscreen layout; listening/pointer
  feel remain pending. Not original stems, accurate transcription or author
  parameter recovery. Middle frequencies are strong; octave/bass assignments
  need auditory correction. Main workstation and prior tool sources unchanged.

### RB37 · Targeted timbre trial on phone recording — USER SELECTED RESULT 07, 2026-10-24
- Origin: user specifies D:/Sound/temp/music/手机录音-20261023-233819.wav and
  identifies the leading-melody timbre at45–53s. Process44–54s context, deliver8s.
- Actually ran official MuS3D SEG + query BS-Locoformer locally: track5 outputs,
  stem3 outputs, plus1 genuine audio-exemplar query using a noisy HDEMUCS other
  estimate. HDEMUCS is only a baseline; the guided reference is not a clean timbre.
- Delivery: reference-studio/cases/phone-recording-20261023-233819/试听/ contains
  original, guided candidate/remainder,24.5s comparison, blind and low-frequency
  candidates, and baseline. Source unchanged; no audio upload, device playback,
  screen observation/control, app source or default-case change.
- Independent raw/preview checks pass: exact crop/resampling, finite FLOAT raw,
  unclipped PCM24 previews, quantization within0.5LSB and candidate+remainder
  within1LSB of original. Model labels remain guesses; independent queries can
  overlap. These checks do not establish correct musical/timbre extraction.
- User listening feedback: both A and B are good; A is cleaner, B retains more
  of the wanted timbre. A is the noisy-reference-guided estimate; B is blind
  stem-level other_keys. This is positive evidence for these specific excerpts,
  not approval of perfect isolation, playable instruments or arbitrary-song use.
- Later feedback: A's remainder contains much of the wanted timbre, especially
  high frequencies; its apparent cleanliness is not a sufficient success criterion.
- User then explicitly calls 07-普通分轨基线.wav "很完美". Select that exact
  HDEMUCS other estimate as this excerpt's accepted result; retain its bytes.
  Stop the proposed high-frequency restoration before producing extra variants.
  This supersedes the assistant's tentative B-first refinement direction.
- Acceptance covers this8s audio result, not a playable instrument, exact original
  stem, author parameters or an arbitrary-song guarantee. Other candidates remain.
- Helpers: analysis/{phone_trial,mus3d_trial}; weights/dependencies stay in the
  workspace cache. This remains an experiment, not an architecture change.

### RB38 · Playable timbre from selected result07 — TIMBRE FAILED IN RECONSTRUCTION 2026-10-24
- Origin: user requests using the selected material as the starting point for
  timbre creation. Preserve07 byte-exact; no further separation-model trials.
- Deliver case/音色/手机旋律-短音.rstimbre, actual-engine keyboard previews,
  an editable portable .rsphrase, adapted sample and untouched reference crop.
  Select07-relative0.340–0.620s, original45.340–45.620s, estimated G-sharp5.
- Only attenuate low-frequency accompaniment with a documented350Hz highpass
  over full context before cropping; no high cut, resynthesis or replacement.
  Preserve raw crop separately. Far transposition changes sample duration.
- Native archive import/export exact; four pitches, long hold, and actual phrase
  archive/reopen/render checks pass (6). Quantization within0.5LSB, source hash
  unchanged. No real audio-device, screen/desktop or application source changes.
- Stable-region loop search did not find a reliable seam; keep loop disabled.
  This0.28s one-shot is for short notes; long held notes naturally end. Residual
  accompaniment/reverb can remain. User approval of07 does not approve the derived
  instrument; fidelity and usefulness remain listening judgements.
- Reproduction: analysis/phone_instrument; evidence in case/instrument and
  case/音色/instrument-delivery.json. No main-workstation architecture change.
- Later user feedback: keyboard sounds are sharper than expected. This is a
  listening observation, not acceptance of derived-timbre fidelity. Explain
  preview pitch range, low-accompaniment reduction and short-note articulation;
  do not silently transpose the entire reconstruction or alter the accepted07.
- After rejecting RB39, user explicitly confirms both melody/rhythm and
  timbre/articulation are severely wrong. The derived one-shot is not a reliable
  accepted foundation. Source07 acceptance remains distinct and active.
- Native audit:13440frames at48kHz, no loop. MIDI92 transposition from80
  halves0.28s to0.14s despite0.291s requested note length;89 lasts0.1665s.
  Both renderers change attack/body/tail speed together. Current format has one
  audio buffer, no multisample key zones. Longer MIDI or release cannot restore
  missing audio. These explain concrete limitations, not all musical errors.

### RB39 · Editable45–53s lead using the derived timbre — MUSICAL RESULT REJECTED 2026-10-24
- User listening verdict: "不行。简直是灾难". The33-note reconstruction failed
  the requested musical result. Preserve it as a failed experiment, not a usable
  or accepted melody. This does not revoke the separate acceptance of source07.
  User then explicitly confirms both melody/rhythm and timbre/articulation are
  severely wrong. Precise note-level errors remain undiagnosed; no assumption
  that this only needs timbre softening or a few note corrections.
- Origin: user asks to try reconstructing this excerpt's main melody with the
  existing timbre as a phrase editable in PhraseStudio. Deliver case/乐句/:
  native .rsphrase with33 notes,193estimatedBPM,7bars, one PianoRoll channel;
  8s actual-engine preview and07/reference-to-reconstruction comparison.
- Native phrase save/reopen/render pass; unchanged input patch samples/settings
  are embedded. Independent ZIP/sample/note/timing check passes; maximum start/end
  tick-conversion error0.057ms. This is storage precision, not pitch/onset accuracy.
  Source07 and .rstimbre hashes unchanged; no UI, audio device or model rerun.
- Analyze stereo harmonic shape, fresh attacks, measured-sample fit, existingA/B
  candidates and existing44–54s context. Assistant inferred root80 instead of
  lower accompaniment68; this has no user-confirmed note-level ground truth.
  Focused spectral review was used to choose among third-harmonic aliases:
  prefer92at2.833s,89at3.455s; keep73at4.077s because its fundamental attacks.
  Add87at7.885s and84at7.963s from existing context. Alternatives/confidence
  remain in melody/transcription-review.json; no claim of exact original score.
- Limits: only lead is written; accompaniment/reverb can confuse remaining notes.
  Note lengths/dynamics are estimates. Original0.28s one-shot cannot sustain all
  high/long notes; transposition changes timbre/duration.7wholebars have0.705s
  blank after8s. Audition copies get2ms edge fades to avoid crop clicks; editable
  phrase keeps actual native release. User has now rejected the musical result.
- Method audit: multiple methods shared harmonic-spectrum assumptions; agreement
  was not independent musical verification. Heuristic confidence labels did not
  establish correct voice selection, pitches or phrasing. No actual listening
  validation supported the assembled full excerpt. Short sample limitations do
  not sufficiently explain or excuse the overall failure. Recheck method before
  producing another full-length reconstruction; retain feedback separately.
- Helpers: analysis/phone_melody; actual-native and independent delivery evidence
  in case/melody and case/乐句/phrase-delivery.json. App source unchanged.

### RB40 · Post-rejection learned-model diagnosis — TESTED, RECONSTRUCTION STILL UNRESOLVED 2026-10-24
- User clarifies both the musical notes/rhythm and timbre/articulation are severely
  wrong. Preserve07 and prior rejected results; no new complete phrase generated.
- Actually ran official Spotify BasicPitch ONNX, pinned fa5997af0a8210982619003269994a1be25eddf3,
  on07/A/B locally with default decoder:67/42/123 polyphonic events. Outputs do
  not establish the target lead. Isolated ONNX Runtime1.31.0/cache, no global
  dependency/app changes. All official file hashes and source commit retained.
- Actually built pinned muscriptor.cpp CPU backend with existing VS2022 and
  bundled CMake/Ninja (/Z7 bypasses local PDB-manager mismatch); no new toolchain.
  Public author GGUF small103M/209MB verified against pinned SHA256SUMS. Licence
  retained: CC BY-NC4.0 for this personal experiment, not a product model decision.
- Same first5s of07: automatic took31.35s,182 notes,46 starting before1.3s;
  labelled acoustic_guitar/string_ensemble. Exactly one synth_lead-conditioned
  check took26.45s,66 notes,15 before1.3s, still sustained bass/harmony and up to
  seven simultaneous notes. Forced instrument labels do not prove voice selection.
  No condition/threshold tuned to reproduce the earlier rejected guesses.
- Neither model output is a confirmed main melody. Do not force a monophonic
  path and call it restoration. Short listening checkpoint not yet produced
  because note selection lacks a reliable basis. Native neutral-piano helper
  built0errors/0warnings but not used to manufacture a new claim/result.
- No uploaded audio, UI/device playback or original changes. Sources/helpers
  in analysis/phone_melody, raw diagnostic outputs case/melody/{neural-basicpitch,
  muscriptor-short}. This investigation does not fulfill the reconstruction goal.

### RB41 · Independence/reuse boundary and next audio experiment — BOUNDARY CONFIRMED, EXPERIMENT PROPOSED 2026-10-24
- D-2026-10-24-6: product/core workflow autonomous; suitable open-source code and
  models allowed. RipX as a required commercial dependency is not approved.
- Assistant proposal: reuse existing original-audio editing and preserve07;
  first validate independent pitch/time adjustment and source comparison using
  a replaceable, appropriately licensed component. Signalsmith Stretch/MIT is
  one researched candidate, not installed/selected or listening-validated.
- The proposed checkpoint is small edits to accepted audio, not another guessed
  MIDI reconstruction. Such DSP does not solve separation, target-lead identity
  or an arbitrary playable instrument. Those remain unresolved separate work.
- Code, weights and audio permissions stay distinct. Noncommercial MuScriptor
  experimental weights remain separate from product dependency decisions.
- Follow-up: user authorizes the staged listening experiment; implementation
  and the still-unconfirmed musical result are recorded in RB42 below.

### RB42 · Original-audio observation and one-variable melody check — DELIVERED, LISTENING PENDING 2026-10-24
- User asks to try the observation→short candidate→reference comparison workflow.
  Preserve accepted07, source recording and all previously rejected artifacts.
- Deliver case/观察与核对/听清这一小段.html: self-contained offline reference,
  accepted07 and two neutral-piano hypotheses; shared source-song cursor,
  loop/seek, pitch-preserving0.6 or original speed. Original/07 cover8s;
  candidates cover45.00–46.08s only, excluding a second ambiguity after1.12s.
- A/B share four attacks, lengths and velocities, differing only in second
  MIDI77/80. A repeats F5 to keep articulation identical to B. Measured partial
  growth supports checking the .35s change but does not prove target ownership.
  First .16s model timestamp is not used as an acoustic ground truth. All notes
  remain unconfirmed hypotheses, not recovered original MIDI. Piano is only a
  contour/pitch reference; the rejected short instrument is not used or repaired.
- New isolated Signalsmith Stretch1.3.2/MIT helper with MIT Linear0.6.6 dependency,
  pinned commits/hashes and retained licenses. Finite exact() path handles start
  seek and tail flush; linked stereo, unity bypass and synthetic tone/duration
  checks pass. No model rerun, commercial dependency or main-app change.
- Independent delivery checks:13 hashes; eight embedded/file WAVs match with
  exact48kHz/24bit/stereo frames, no clipping and common A/B gain. Second-note
  reference peaks stay about698/831Hz at both speeds.14 actual transport-source
  tests pass, including late decode/clock resume cancellation. These validate
  comparison mechanics only, not recognition accuracy or musical similarity.
- Standalone comparisons play07slow→.35s pause→A or B,3.95s each. Original copies
  get2ms audition-edge fades; accepted07/source hashes remain unchanged. Sources
  in reference-studio/analysis/{listening_pilot,stretch_pilot}; case delivery and
  analysis/verification.json retain evidence. No audio upload, desktop/UI use
  or real-device playback. Actual browser decoding and listening await user use.
- Listening follow-up: user replies "b" to "A closer, B closer, or neither".
  Record local preference for B only, with candidate/comparison hashes in case
  listening-feedback.json. This does not verify every note, timing, timbre or8s.

### RB43 · Follow preferred opening with a second bounded check — BOTH ENDINGS REJECTED 2026-10-24
- Continue the authorized staged trial after the user prefers opening B. Retain
  first three events exactly, fourth pitch/start/velocity with tail extended
  beyond the earlier crop; later shared context remains unconfirmed.
- New case/观察与核对/第二轮 covers45.00–46.57s. Seven common attacks and lengths;
  only fifth pitch at relative1.123s differs: A=Bb4/MIDI70, B=F5/MIDI77. Labels
  deliberately do not make B always mean the changed pitch or preferred answer.
- Local partial growth at466/1398Hz supports investigating Bb4, but a new lower
  accompaniment voice can overlap the continuing target. Octave hypotheses and
  model/old-FFT disagreement remain explicit in continuation-review.json.
- Reuse exact previously generated07 slow reference, actual native piano and
  the existing isolated stretcher. Two5.583s checks each play07slow→.35s→candidate.
  Common gain unchanged; exact frames, no clipping, silent gap, emitted466/698Hz
  reference notes and five output hashes verified. First13 outputs and07 hashes
  unchanged; no main-app, model, network, browser or real-device operation.
- No repeated first-round UI/test batch and no new HTML build. Source helper
  build_continuation.py reuses first-round audio helpers. User's B preference
  remains comparative evidence; this extension is not accepted original MIDI.
- User feedback: both endings unlike the target; user asks whether two timbres
  caused voice confusion. Exact rejected boundary is unspecified, so this is
  not a confirmed verdict about the isolated fifth pitch. Preserve first-round
  B preference and record both-ending rejection in listening-feedback.json.
- Read-only review supports overlapping pitch components near1.12s and later
  changes while lower content continues. It does not establish two instruments:
  same-instrument polyphony, tails or layered timbres remain viable. Investigate
  target-voice grouping before extending serial one-note comparisons again.

### RB44 · Tentative separation of overlapping original-audio voices — MUSICAL GROUPING REJECTED 2026-10-24
- User asks to attempt separating the suspected different voices. Do not keep
  forcing a single MIDI line or assume that exactly two instruments are proven.
- Audit finds strong Side/anti-phase content near698Hz and strongly Mid content
  elsewhere in both07 and raw mix. Some previous mono averaging loses this
  information. This supports retaining stereo, not identifying instruments.
  No clean solo reference or stable pair of instrument pan positions is known.
- Actually run two cached official PaSST/PCA→BS-Locoformer queries using mixed
  Mid/Side examples:44.3s, embedding cosine.9275, waveform correlation.99255.
  This model check fails to distinguish the voices; do not present near-duplicate
  outputs as successful separation. No weights/packages downloaded.
- Ordinary NMF grouped low/background material; not selected. Joint Mid/Side
  KL-NMF48 atoms with shared temporal activations plus spectral/spatial/envelope
  grouping produces two tentative layers and an uncertain remainder.240-iteration
  cap reached without convergence; notes/sections may still be grouped as voices.
- Deliver case/声部分离试验/试听: reference, A, B, uncertain material and a2.4s
  sequential comparison; main files8s48k24bit stereo, shared gain2 and2ms fades.
  Original complex audio is used, no MIDI/synthesis. Optional Mid/Side monitors
  are explicitly spatial aids; the focused Side audition changes stereo image.
- Raw float additive error9.31e-9; delivered PCM24 additive error1.20e-7. Frame,
  finite/peak/quantization/source and18 earlier output hashes checked. Signal
  preservation is not musical acceptance.07/source/old experiments unchanged;
  no main app, UI, audio device or upload. Sources reference-studio/analysis/
  voice_split, evidence in audit/model/factorization and audition manifests.

### RB45 · Targeted bass/accompaniment extraction from07 — PARTIAL RESEMBLANCE, ROUGH/IMPRECISE 2026-10-24
- User hears all RB44 audition files and rejects their voice grouping. Explicit
  new target: obvious accompaniment/bass in07. Feedback recorded separately;
  accepted07 and previous opening-B preference remain scoped as before.
- Audit: low harmonic families around46→44→39→44Hz missing-root hypotheses;
  strong upper bass matches old MuS3D stem03/track05 better than HD bass/track04.
  Actual HD rerun on07 other context barely extracts bass; not selected. One
  real bass-reference query gets a conservative low layer but misses upper bass.
- Selected stereo harmonic-family masks use old stem03 identity/envelopes and
 07's own complex audio, no guide samples/MIDI/synthesis. One correction widens
  first12 partial skirts (up to~555Hz);600Hz+ rules unchanged. Initial and selected
  wide-low-partials variants retained. Shared upper partials remain uncertain.
- Deliver case/低音分离试验/试听: bass, remaining audio,07 reference and comparison;
 48k24bit stereo, gain2 shared,2ms fades. Band-power ratios78.6%/43.5%/1.95%/.224%
  are diagnostics, not true-instrument removal percentages. Musical target and
  melody preservation await listening. Raw/PCM additive errors7.45e-9/1.20e-7;
  frames/peaks/quantization/gaps/source and27 prior files verified unchanged.
- Source analysis/bass_split; raw/method reports retained. No new downloads,
  upload, main-app change, UI or device. This does not establish a clean lead.
- User hears some resemblance but says imprecise, rough and cut-out sounding;
  proposes musical regularity as a clue. No precise-extraction acceptance or
  confirmed roughness cause. Record feedback in case/低音分离试验/listening-feedback.json.
- Read-only audit: pitch continuity and short mask smoothing already exist;
  partial gains remain independent, regions fit separately, same-pitch attacks
  are not modeled as events. Approx171ms windows and6ms mask smoothing cannot
  enforce coherent whole-note envelopes or remove mixture-phase interference.
- Proposed, not implemented: jointly fit note events, shared but evolving timbre,
  continuous pitch/envelopes and competing residual voices, using repetition
  as a soft cue. Preserve intentional distortion/glide/modulation; do not force
  a mechanically regular waveform or substitute a new synth as extraction.

### RB46 · Local repeating waveform estimate — EXPLORATORY, NOT VALIDATED SEPARATION 2026-10-24
- User proposes exploiting recurring waveform patterns and permits a pattern
  estimate instead of timbre extraction; then notes melody may never repeat.
  Local waveform periodicity and repeated note/phrase structure are distinct.
- One bounded stereo cycle-folding trial from accepted07, not another frequency
  mask: eight training cycles near relative0.68s, four following held-out cycles,
  external0.08–0.28s window. Reference46.171953Hz remains octave-ambiguous.
- Deliver case/周期模式试验:1024x2 waveform JSON/NPZ, short source/replay,1.5s
  replay and diagnostics; 试听 contains a PCM24 audition. These are estimated
  pattern replays, not unchanged separated audio or recovered original presets.
- Frozen held-out correlation.621 explains only6.3%energy at fixed gain; external
  correlation.417 after one diagnostic phase correction is weak. Training-half
  correlation.899 shares fitted alignment and is not independent validation.
  Shared harmonics, evolving envelopes/modulation and residual voices remain.
- Source hash unchanged, table/NPZ/replay verified; no clipping/NaN, PCM error
  below6e-8. Boundary interpolation may share one sample. Technical checks do
  not validate instrument purity or listening quality. No new MIDI/full remake,
  model downloads, main-app, desktop, device or upload operations.
- Source/reproduction: analysis/periodic_pattern. User has not yet evaluated
  this pattern; do not infer a listening verdict from these diagnostics.

### RB36 · Independent playlist from phrase files — IMPLEMENTED 2026-10-24
- Origin: D-2026-10-24-5. Deliver song-studio, Chinese 歌曲编排.exe and build BAT
  inside experiments/music-workflow. Import one/many .rsphrase snapshots into a
  left library; place/reuse/move/overlap on a large multitrack timeline. Grid and
  precision, zoom, scrolling, exact bar/beat edits, copy/delete, gains/mute and
  undo/redo are available. Original phrase speed is default; follow-song is opt-in.
- Reuse the validated phrase format and instrument voice without changing prior
  module sources. Portable .rssong embeds all imported phrases and deduplicated
  samples/settings. Export 48kHz/24-bit stereo WAV through the save dialog, with
  silence gaps and natural release, identical to the playback mixer. Bounded
  streaming avoids allocating the full song, including sparse long arrangements.
- Atomic stage/replace, cancellation/failure preservation, save/discard/cancel
  on departure, external-file change detection and debounced private recovery
  are implemented. Recovery caches unchanged sample assets and updates metadata;
  no scanning/deleting user files, prior module data or workstation libraries.
- Verification: 30 isolated groups cover fourth-module file→arrange→self-contained
  reopen after deleting the generated phrase→WAV, exact samples/settings/audio,
  malformed ZIP/manifest/PCM, failed stages/cancellation, timing/tempo/tuning,
  overlap/mute/limits, device-clock pause/seek/live edit/release/replay/failure,
  future empty cursor, zoom/drop geometry, simulated pointer commit and unshown
  minimum-layout construction/render. Logs/reports: .test-output/song-studio/.
- No actual application window, real audio playback, screen observation/control
  or main-library access. Listening, dialogs and physical pointer feel await user
  acceptance. Main workstation and earlier module source files are unchanged by
  this module. Limits/file format remain experimental and lack FLP compatibility.
- Release 20261024-055149-477-aac8c9 is selected. Entry/launcher and selected/tested
  assembly SHA256 pairs match; verification.json and build-final.log retain proof.
  Build: zero errors, one NU1900 warning because the package audit feed could not
  be reached. Restore/build succeeded with locked dependencies; no audit success
  is claimed. The UTF-8-BOM build script preserves the Chinese Windows entry name.

### 2026-10-28 · Vulcanus kick synthesis delivery — DELIVERED, LISTENING PENDING
- User requests two kicks from vulcanus.mp3 0–20s using the detailed synthesis
  experiment; clarifies dense hits at3–10s and fewer clear hits after10s.
- This environment cannot receive audio input. Compare mixture onset/body/glide
  evidence and author two provisional native designs: shorter/higher A and
  deeper/longer B. Do not claim verified kick identities, number or sonic match.
- Use selected SpectralForge release20261028-055644-757-e7928b unmodified, curves
 10 points each, four native oscillator layers, no source sample or external FX.
  Deliver2 editable patches,2 single-hit PCM24/48k stereo WAVs, an A/B audition
  and notes to D:/Sound/temp/tone. The audition rhythm is not a transcription.
- Cold patch reload→WAV is byte-exact; key holding self-decays. Peaks0.70, no
  clipping/truncation/nonfinite samples, PCM error1.20e-7,99%energy at145/220ms.
  Reference and all6 prior target files unchanged. Proof: spectral-forge/cases/
  vulcanus-kicks/delivery-final/{generation-verification,delivery-verification,
  audio-measurements}.json and delivery-copy-verification.json. No GUI, device
  or main-workstation change. Musical listening acceptance remains unperformed.

### 2026-10-28 · SpectralForge remembers the open folder — IMPLEMENTED
- User requests Open to start in the previous folder rather than fixed output.
  Store the last file pick's parent separately from recovery, preserve it across
  restarts/build updates, and use output only initially or when unavailable.
  Cancelled selection does not replace the remembered folder. Preference read/
  write failure remains optional and does not block opening the selected sound.
-44 native checks pass, including new restart/Unicode/latest-choice/fallback/
  corrupt/relative/locked-state/recovery-cleanup cases. Selected release
  20261028-085914-279-8eb9f2 has12 UI assets byte-identical to the prior69-check
  release; those unchanged Node tests were not rerun. Entry/launcher hashes match.
  Build0errors,1NU1900 audit feed warning. Evidence: .test-output/spectral-forge/
  open-directory-build.log, open-directory-20261028-085810/host-report.json and
  open-directory-release-verification.json. No desktop or audio-device operation.

### 2026-10-29 · SpectralForge output overlays in all three graphs — IMPLEMENTED
- User explicitly chooses actual spectrum, amplitude evolution and measured main
  pitch in their respective graph editors. Add read-only magenta output paths
  behind editable curves, with matching zoom/pan/sustain/release coordinates.
  Stop retains the current capture; new notes/patch edits reset it. Analysis never
  changes the patch, control-point count, history or export.
- Implementation: combined-channel8192 FFT, bounded peak history, confidence-
  gated periodicity measurement with high-frequency alias protection and explicit
  keyboard-relative pitch units. Known multi-key attacks stay pitch-empty through
  release; noise/silence/short/unstable windows are blank. Refresh at most20Hz;
  reuse plot nodes. No multi-instrument pitch or instantaneous measurement claim.
-84 Node checks pass: analytic tones32.7–10000Hz, harmonics/noise/DC/silence,
  native synthesized transposition, lifecycle/history bounds, real-controller
  measured overlays/tab switching/save isolation, geometry/zoom/read-only DOM,
  and same-pitch key clock regression. Release20261028-224430-525-f64420 has13
  UI files matching source and entry/launcher hashes matching. Host DLL is byte-
  identical to the previous44-native-check release (not rerun); synthesis DSP
  unchanged. Build0errors,1NU1900 audit metadata warning.
- Evidence: .test-output/spectral-forge/analysis-overlays-tests.log,
  analysis-overlays-build.log and analysis-overlays-release-verification.json,
  plus controller HTML/SVG coordinate snapshots rasterized via Pillow. Headless
  browser failed, so these are not real browser/app screenshots. No desktop
  observation/control or real audio-device use.
