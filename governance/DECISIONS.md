# RootSound decisions in force

Updated 2026-11-18. This is the current decision summary, not an append-only delivery log.
User-confirmed intent, implementation choices and open work are distinguished below.
The Chinese mirror is [AItoHUMAN/DECISIONS.md](AItoHUMAN/DECISIONS.md); neither language overrides the user.
Earlier wording and source IDs are preserved in [the original record](../history/2026-11-05-maintenance/governance/DECISIONS.md).

## Purpose and acceptance — USER CONFIRMED

- RootSound is in early development. Once the user confirms a replacement, remove superseded interfaces, obsolete settings, unused resources and builds from the active project. Native `.rootsound` songs from the first public Release onward must retain backward readability without a later age cutoff. The user clarified on 2026-11-18 that the baseline is the first public Release, not the first GitHub push: `preview261103` ("先导"), commit `58cebb3db902ffc1dddc12d13672792ae7769eb9`, published 2026-11-04 00:23:02 +08:00, https://github.com/FR-42/RootSound/releases/tag/preview261103 . Dedicated compatibility for earlier development versions may be removed when it is not needed by baseline-or-later files. Keep or replace the readers, conversions and sound-data handling needed for supported songs; this does not require retaining the old interface or startup/configuration behavior. General-purpose file formats and framework compatibility are outside this cleanup. Update bundled demo songs to the current format and resources. This supersedes the earlier blanket statement that old songs required no compatibility; it is a policy requirement, not a claim that all historical files have already been verified.
- The current roll, notes, tone cards, console and playback/performance curves are active features to retain, not obsolete compatibility targets.
- On 2026-11-18 the user replaced origin-based naming: defaults consistently use the actual curated instrument name, including MIDI imports, with no numeric suffixes. Independent voices can share that canonical name while preserving identities, MIDI program/drum data, notes and curves. Existing recognized GM default names are normalized on load; custom names remain. The user then removed the former 10-card limit and authorized direct implementation. Hand cards scroll horizontally with the vertical wheel while the pointer is over their region; the fan rotates out of sight beneath the keyboard without side piles. Existing keyboard-library deck piles retain their behavior.

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
- The desktop opens directly to the physical song library. A song opens one editable music score. The former arrangement/phrase overview,
  separate melody/rhythm editors and co-creation route are not current release entry points.
- A vertical piano roll uses horizontal pitch and vertical time. Note groups remain independently editable.
- Keep the interface compact and transport controls centered. Tempo rolls use thin one-line labels;
  clicking opens a panel with BPM, 敲击定位 and grid count. Rolls retain independent tempo/grid settings.
  The first label is fixed. Clicking a roll targets the BPM control to the left of the keyboard. Deleting a roll through its
  context menu extends the preceding roll over the same beats and retains the notes. The first roll remains
  and the setting can be turned off with one roll. The bottom resize edge has a downward fading shadow.
- The BPM panel offers a score-wide time signature, defaulting to 4/4, independent of subdivisions.
  Changing meter preserves note timing.
- On 2026-11-16 the user removed measure labels and separate bar lines from the piano roll design.
  The grid displays beat and subdivision lines. This supersedes the earlier visual rule for bar lines.
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
  with one undo step. Unassigned/different-timbre groups do not merge. On 2026-11-18 the user removed automatic target selection after a merge: retain an existing valid selection, clear selection/entry state referring to the removed source, and do not select or pin another card as a side effect. Suppress the drag's follow-up click; later intentional clicks retain their normal behavior.
- Play to the end of the last occupied bar, then pause and return to the start. Selected-family audition,
  master audition gain and WAV-export gain have separate meanings; do not reintroduce output pumping.
- Historical fixed-second/BPM behavior differs by compatibility model. Do not apply an old global rule:
  preserve explicit held seconds, beat durations and source tempo maps according to current contracts/tests.
  Sources: free-onsets, remove-qweasd, workspace-memory, editable-sounds, group-merge, playback-end, RB139–141.

## Files, library and saving — USER CONFIRMED

- Release installer requirements confirmed on 2026-11-18: prepare Windows and macOS ARM64 packages locally for the user to publish manually. Redesign installation guidance to follow the current application's visual style and simplify the user-facing installer filenames. Both default and custom installation locations must support subsequent upgrades while preserving songs and cleaning obsolete program files. The first Windows default stays off C: (D: preferred); an end user may explicitly choose a custom C: location. This installer permission does not change the worktree-on-C: restriction. The user approved the release Prompt and confirmed switching Windows installers to the same native .NET/WebView2 desktop implementation used by the root project. macOS retains Electron; its Windows-specific pointer/titlebar behavior is not yet adapted or verified on a real Mac.

- The desktop library browses real folders in a single scrolling list. On 2026-11-18 the user replaced delayed single-click opening and double-click renaming: clicking a song or folder should open it immediately, and renaming belongs in the right-click menu. Apply the rename entry to Save As as well, preserving its save-destination semantics. Implemented after Prompt approval: remove the opening timer and double-click rename handler, ignore the second click of a double-click, and preserve right-click rename in Save As. Use the breadcrumb to move between folders. The view draws rows near the viewport and loads durations in the background.
- Open native music, MIDI/RMI, MusicXML/MXL and supported portable projects through one file route.
  Opening MIDI does not automatically create a .rootsound file.
- Save writes the open .rootsound in place and keeps the editor open. Save As and the first save of a new or imported score use the library list to choose a folder, with the current song name filled in. A name collision uses a numbered suffix. The library can create folders and rename or delete entries.
- The details Exit button leaves a clean song immediately. For a dirty song, the first click colors Exit red and Save green. A second click discards the edits and leaves the song, including a rapid double-click. Successful Save and Save As return to song details, restore the button colors, briefly flash all three file buttons white and clear the unsaved star. The native window close action uses its save/discard chooser.
- Library and details renames update real file paths and the active save destination. Editable text fields use colored rectangular fills and color-based focus feedback.
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
- On 2026-11-18 the user approved adding “木吉他”, a steel-string folk/acoustic guitar, alongside the existing nylon-string classical guitar. Use the high-quality FreePats FSS Steel-String Acoustic Guitar recording (2020-05-21), preserve its source, licence and composition exception, and map it to zero-based MIDI program 25. Load recordings on demand; add this voice to existing song libraries without restoring previously deleted defaults. Website and installer publication remain separate tasks.
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

## Desktop pointer interaction

- A quick, predominantly horizontal sweep into the outer 6% triggers the corresponding side. A deliberate outward push at the actual border also qualifies, including when Windows clamps the pointer in a maximized window. The left side toggles tone cards while settings are closed. The right side toggles settings from the roll or tone cards. A left swipe while settings are open stays in settings. View switches show a brief arc and share a fixed 0.5-second cooldown.
- With no song open, the desktop shows the welcome view. A downward sweep at the bottom edge opens the song library. Slowly moving gradients color both views. The roll uses a stationary gradient, and sounding notes brighten along their edges.
- Song details cover the roll and piano. The song title sits above the file actions. Three adjacent playback-rate blocks (0.5x, 0.75x and 1x) sit to the left of volume, followed by grid intensity, pointer sensitivity and the multiple-roll switch. The three slider tracks are thicker and align at both ends. The switch shows one or two overlapping shapes.
- On 2026-11-18 the user revised the Windows desktop colour study. Text fields use a light cyan, lavender and pink gradient with dark text; selected text uses a dark plum gradient with light text. Tone-card backs retain the dark plum gradient. Only the active playback speed has a coloured gradient fill; inactive speeds have transparent backgrounds.
- Touching or crossing the active window's top edge reveals the native caption controls in the welcome view, library and editor. They stay visible over the caption and while the pointer is outside the window, then hide when the pointer returns to non-caption content. Card-back dimensions and stacking are adjusted for visual balance with the piano and ordinary tone cards; proportions follow the visual result rather than a mandatory scaling rule.
- Playback and audition highlights follow the visible white and black key shapes.
- Desktop note bodies fill the complete scheduled start-to-end interval. Do not inset or shorten them to create artificial time gaps, including on short notes. The user subsequently chose a 0.5 px black inner border and a small 1 px corner radius, retaining the top-to-bottom tone gradient. Centre notes within the space between the visible column lines: offset their pitch position by half the actual column-line width, and apply the same correction to the highlight overlay. Selection, hover and playback retain light outlines inside the black rim without a surrounding shadow. Musical timing is unchanged. The earlier large rounded corners and artificial end gaps were rejected because they misrepresented note timing.
- Moving the pointer into the area above the keyboard reveals the hand. Clicking a card pins it above the roll in a short arc while the hand stays open. Unpinning by click or by dropping the card in the editor sends it back in a short arc. The desktop tone library shows cards, stacks and the empty slot left by a spread. The taller keyboard and cards scale with the window.
- Clicking the empty slot gathers the spread back into the pile. Settings temporarily cover the hand and spread, and closing settings restores their prior visibility and deck position. The roll remains editable while the deck is spread. The wheel pages the cards when the pointer is over the deck.
- The user selected the original Flow card back: two fine warm lines on the plum gradient. The later bulged-centre and dot variation was withdrawn. Visible paper edges and staggered layers distinguish the stack. After finding the face-turn animation too slow, the user requested the previous spread/gather animation: 240 ms translation, scale and opacity with 14 ms staggering. Midway toggles continue from the current visual state. Animation frames run through browser composition without repeated layout reads.
- Moving into the roll's outer regions pans the viewport, with increasing speed toward the boundary. Fast pointer travel pauses auto-pan, which resumes when the pointer slows in an eligible area. Middle-click toggles position-driven panning. Mouse or keyboard presses interrupt it until the pointer returns to the central zone.
- The desktop viewport may move above the score start so the first notes can be reached comfortably. The leading margin continues the pitch-column lines without beat or subdivision rows. Zoom and viewport restoration retain this space; note times remain nonnegative.
- A selected tone card solos its own notes. Hovering a highlighted card in the current song's hand temporarily overrides the selected tone; leaving restores the selection, or all tones when none is selected. Closing the hand or deleting a card must clear transient listening focus. Switching changes per-group audio gain with a short smooth transition, retaining the full song clock and current source ages without preparing samples or rebuilding the score.
- The pointer center determines the first ordinary wheel action. Scrolling down in blank space with a tone selected adds a note. A wheel edit stays on the same note at the same pointer position, even after the note shrinks away from the pointer. After deletion, scrolling at that position leaves the note deleted. A wheel scroll that pans the roll continues panning at the same pointer position. Pointer movement lets the next wheel action choose a target again.

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
