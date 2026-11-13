# RootSound decisions in force

Updated 2026-11-11. This is the current decision summary, not an append-only delivery log.
User-confirmed intent, implementation choices and open work are distinguished below.
The Chinese mirror is [AItoHUMAN/DECISIONS.md](AItoHUMAN/DECISIONS.md); neither language overrides the user.
Earlier wording and source IDs are preserved in [the original record](../history/2026-11-05-maintenance/governance/DECISIONS.md).

## Purpose and acceptance — USER CONFIRMED

- RootSound is in early development. Once the user confirms a replacement, remove superseded files, assets and builds from the active project. Older song projects do not require backward compatibility or justify keeping superseded resources. Update bundled demo songs to the current format and resources.

- RootSound is a music creation app that helps everyday users get started quickly and get feedback efficiently as they create.
  Reducing the effort needed to learn and use the app helps users start creating sooner. Potential users include elementary and middle school students,
  people aged 40 and over, and complete beginners with no music production experience.
- First make an original passage satisfying, then extend it into a full song through the same workflow.
  The first chosen listening reference is Vulcanus, 0–20 seconds; vocals and background melody matter.
  This is a reference, not permission to claim ownership of that recording or acceptance of old attempts.
- Exact original length, creative assistance method and musical acceptance criteria remain open.
  Passing code checks does not establish listening, usability, market demand or professional realism.
- Windows desktop is the product priority. An offline core and portable complete music projects remain goals.
  Accounts, cloud, online AI and a new architecture rewrite are not implied requirements.
  Sources: D-2026-10-27-10, D-2026-10-23, D-2026-10-22-4.

## Current creative route — USER CONFIRMED

- Public product name is 简乐; repository/technical name remains RootSound.
- Welcome → physical song library → one editable music score. The former arrangement/phrase overview,
  separate melody/rhythm editors and co-creation route are not current release entry points.
- A vertical piano roll uses horizontal pitch and vertical time. Note groups remain independently editable.
- Keep the interface compact and transport controls centered. Tempo rolls use thin one-line labels;
  clicking opens a panel with BPM, 敲击定位 and grid count. Rolls retain independent tempo/grid settings.
  The first label is fixed. Clicking a roll targets the BPM control to the left of the keyboard. Deleting a roll through its
  context menu extends the preceding roll over the same beats and retains the notes. The first roll remains
  and the setting can be turned off with one roll. The bottom resize edge has a downward fading shadow.
- The BPM panel offers a score-wide time signature, defaulting to 4/4, independent of subdivisions.
  Changing meter preserves note timing. Bar lines are heaviest, then beat lines, then subdivision lines.
- Old removal of empty settings is superseded by the explicit learning/advanced-feature settings.
  Old in-editor tutorial steps are superseded by hands-on practice. The website image deck is a separate scope.
  Sources: D-2026-11-02, vertical-roll, D-2026-11-05-roll-label, hands-on-guidance.

## Editing, timing and playback — USER CONFIRMED

- Updated 2026-11-10. When creating or dragging a note, its head lightly snaps to a nearby visible beat
  or subdivision line. Positions farther from a line remain freely editable. Durations and keyboard
  stepping have their own rules.
- Q/W/E/A/S/D editing nudges, including double-A/D movement, were explicitly removed. Ordinary modified
  shortcuts and opt-in chromatic keyboard performance remain separate features.
- Remember per-project viewport, selection, cursor and family note length separately from saved music.
  New notes may reuse a family's chosen held length. Pan/zoom/navigation do not implicitly save music.
- Keep selected/edited notes usable while culling off-screen note DOM. Playback movement must not repeatedly
  read/copy the whole score or force layout. Physical latency/FPS claims require actual measurement.
- Dimmed groups do not react to selection, dragging or eraser sweeps. A populated group removal requires
  confirmation; two deliberate Delete presses may remove the selected group and notes with undo.
- Same-timbre group drag/drop merges preserve overlaps, hidden notes, identity, note mix and MIDI lanes,
  with one undo step. Unassigned/different-timbre groups do not merge.
- Play to the end of the last occupied bar, then pause and return to the start. Selected-family audition,
  master audition gain and WAV-export gain have separate meanings; do not reintroduce output pumping.
- Historical fixed-second/BPM behavior differs by compatibility model. Do not apply an old global rule:
  preserve explicit held seconds, beat durations and source tempo maps according to current contracts/tests.
  Sources: free-onsets, remove-qweasd, workspace-memory, editable-sounds, group-merge, playback-end, RB139–141.

## Files, library and saving — USER CONFIRMED

- Browse the real project directory one layer at a time. Keep icons/names and pagination, not old columns,
  separators/counts or recursive-flat discovery. Left/Right and pager buttons wrap; editable inputs keep caret behavior.
- Open native music, MIDI/RMI, MusicXML/MXL and supported portable projects through one file route.
  Opening MIDI does not automatically create a .rootsound file.
- Save opens the library with the choice to write the original .rootsound file or create a .rootsound copy in the displayed folder. Imported MIDI and other external files can only be saved as .rootsound. The library can create folders and rename or delete entries.
- Normal editing stays in a draft until explicit Save. Save conflicts must not silently overwrite externally
  changed files. Write validated content atomically. Do not reinstate automatic .bak creation.
- User confirmation 2026-11-05: conversion may shorten trailing empty time. Preserve all sound events,
  onsets, held durations and audible tails; this does not authorize trimming musical rests between notes.
- Keep user-owned sample data in saved native projects for offline transfer. Keep destructive operations scoped and undoable where specified.
  Sources: music-files, folder-library, library-minimal, library-arrows, no-bak, explicit-saving.

- On 2026-11-10, the user removed RipX (.rip) support from the RootSound development scope.

## Instruments and performance — USER CONFIRMED / CURRENT IMPLEMENTATION

- On 2026-11-10 the user prioritized fewer, higher-quality recorded instruments for the desktop defaults and
  allowed larger assets. The requested palette includes piano, bowed strings, saxophone, bamboo flute,
  xiao, suona, brass, bass, guitar, and acoustic drum-kit pieces. Square and saw leads are outside the default palette.
- Desktop, web and bundled demos use the current recorded sample library. MIDI imports map program and drum numbers to these recordings and retain the source numbers for export.
- Preserve licenses, provenance and user deletions. The current sample runtime applies sustain and sostenuto. MIDI bend, continuous controllers and aftertouch remain in the score for export.
- The UI calls the playhead “播放线”. The setting is “多卷帘” and has no description below it.
- These mechanisms do not establish that the user is satisfied with the sound. See docs/GM_INSTRUMENTS.md
  and docs/MUSIC_FILES.md. Source: full-sf2, sampled-gm, timbre strengthening and MIDI-EXPRESSION.

## Learning — USER CONFIRMED

- Latest user request, 2026-11-06: first launch asks whether to watch guidance. Skip enters the normal
  welcome screen; Watch starts the basic tour. The user rejected the Remotion draft and allows effects
  layered over the real editor. Guidance adds no new music features and requires no user actions to advance.
- No added visible descriptions, subtitles or hints. User clarified that existing application labels and
  the initial Watch/Skip buttons remain. Spotlight, mouse-button colour, motion and keyboard drawings
  communicate the actions. The requested curriculum includes row/time and column/pitch, playhead/transport,
  keyboard audition, timbres/note groups/selection/editing, both scroll and zoom axes, BPM/grid/tap tempo,
  and save/open semantics. File creation must never be required.
- Keyboard audition already uses reference piano without selection and the selected group's timbre with
  selection. Do not add a piano-toggle button: the assistant had misread the user's wording and corrected it.
- Latest feedback, 2026-11-06: user considers the direction promising but still finds the result poor;
  this is not full experience acceptance. Remove the entire guide bottom toolbar to keep one-pass viewing
  simple. No chapter navigation, progress dragging or pause buttons. Preserve the first-use Watch/Skip choice.
- On 2026-11-07 the user narrowed the basic lesson to roll coordinates, individual and group selection,
  and mouse gestures. Show panning without a selection, clicking or dragging to create within the active group,
  moving along both axes, resizing from the bottom, and right-clicking blank space to clear selection.
  Present these actions on the same example score without captions or playback controls.
- The user then separated note and group selection in the vertical roll. Only group selection dims
  other groups and enables blank-space writing. Dimmed notes cannot be moved or resized. Blank drags pan with a single note selected or
  with no selection. A bright note can be moved or resized directly from any state.
  Right-clicking a note or sweeping with the right button erases notes in the selected group, or in any
  group when no group is selected. Dimmed notes behave like blank space. A right click on blank space
  clears selection.
- Without the optional workbench, only groups are selected in the vertical roll; clicking or dragging notes keeps that selection.
- On 2026-11-10 the user enabled individual-note selection behind a default-off Workbench setting.
  Group selection opens timbre replacement, removal, volume and pan; note selection opens volume, pan and sounding time.
  Sounding time is provisionally implemented as held duration in seconds.
- Advanced tools are opt-in, initially including multiple tempo rolls. Opening work requiring disabled tools
  must explain that requirement. An enable-and-open convenience is an implementation choice, not silent consent.
  Source: hands-on-guidance.

## Public website — USER CONFIRMED

- Keep the 简乐 public name and the existing repository/release identifiers. Website layout and in-editor
  learning have separate scopes: preserve the image-first deck above the editable online score.
- The image deck uses brief text, left/right navigation and fluid transitions, without automatic page rotation.
  Six pages and their current generation tools are implementation state, not a fixed permanent page count.
- The user's supplied 40-note piano score at 148 BPM is the fixed public example. Each visit starts with a
  fresh editable copy; visitor edits must not overwrite the public example or imply cloud autosave.
- Retain GitHub, Windows and Mac download entry points. Local source/build changes do not publish remotely.
  Sources: D-2026-11-04-chinese-name, guide-deck and website-example. See docs/WEBSITE.md.

## Architecture and ownership — USER CONFIRMED PRINCIPLES

- Keep replaceable task modules, shared explicit contracts and free peer communication under common standards.
  The coordinating center does not execute musical DSP or relay every peer exchange.
- Sound runtime is the independent shared execution boundary for live audition, playback and offline rendering;
  creators retain musical meaning/editing ownership. Do not require opening a sound-runtime screen to audition.
- Keep ordinary edits isolated; offer explicitly chosen joint changes rather than globally overwriting shared assets.
- Public interfaces, module subdivision, containers, technologies and precise numeric budgets are engineering
  choices unless explicitly decided by the user. The current code layout is documented in docs/ARCHITECTURE.md.
  Sources: D-2026-10-22-2/-3/-6, D-2026-10-23-5 and product-independence.

## Engineering choices, not user promises

Current limits are 1–1000 BPM, MIDI pitches 0–127, 1024 beats, 128 groups and the shared 50000-event budget;
web has smaller limits. MIDI encoding cannot represent the entire native tempo range. The implementation
must reject unsupported encoding rather than truncate. Verify constants and docs/MUSIC_FILES.md when changing them.
View thresholds, frame scheduling, data structures, file encodings and framework choices are revisable.
Current check/build evidence and remaining validation are in docs/CURRENT_STATE.md and docs/TESTING.md.

## Experiments and historical scopes

The local music-workflow, reference/sampling/timbre/structure experiments preserve their own user-scoped
instructions and results. They are not shipped editor routes. Their prototype choices and past rejected
musical results must not become current product acceptance or a fresh mandate to process user recordings.
See docs/EXPERIMENTS.md and the archived original decisions before resuming one of those tasks.

## Collaboration and changes to this file

Collaboration rules live in NORMS.md. Do not duplicate them as product decisions.
The user explicitly requested this documentation overhaul on 2026-11-05: archive superseded records and
update current ones. It does not authorize discarding user-confirmed purpose/principles or user music.
Changes to important product direction still require discussion. Historical proposals do not become decisions
merely because they were implemented, tested, delivered, or retained in an archive.
