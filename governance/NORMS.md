# RootSound NORMS

Meta-norms governing AI-assisted Q&A / teaching sessions in this project.
Division of labor: DECISIONS.md holds settled conclusions about the
project; TODO.md holds pending work; THIS file holds rules for the
conversation itself.

File rules:
- Chronological; append new norms at the end.
- Each norm carries: ID / status / rule / rationale / origin.
- Binding on any future AI session working with this user.
- Dual-explanation pair: governance/AItoHUMAN/NORMS.md mirrors this file
  in plain Chinese. THIS file is authoritative; any edit updates the mirror in the
  same sitting (convention: D-2026-10-15-4).

## N1 · Explain every new term at first introduction — ACTIVE

- Rule: the FIRST appearance of a specialized term in a conversation —
  whether borrowed jargon (e.g. gauge principle / 规范原理) or ad-hoc
  coinage (e.g. "FM 国境线", "海关") — must be defined in place, in one
  sentence to one short paragraph, in plain language. Recurring project
  coinages should be defined once per session.
- Rationale: an unexplained term forces the reader to break flow and ask;
  ad-hoc coinages are invisible to search engines and to future readers.
- Origin: user instruction, 2026-10-16.

## N2 · Every formula carries a variable table — ACTIVE (backfilled)

- Rule: each formula is followed by a table: symbol | meaning |
  unit/domain | identity (input / output / constant) | project
  correspondence where applicable. Constants must be flagged as physics
  vs convention vs historical compromise.
- Origin: user standing rule; in force since the 2026-10 conversation
  week; backfilled from the handoff archive.

## N3 · Long answers end with a 收拢 — ACTIVE (backfilled)

- Rule: any long answer closes with a one-paragraph distillation (收拢)
  restating the load-bearing conclusions.
- Origin: user preference; backfilled from the handoff archive.

## N4 · Layered teaching, worked numbers, rebuild on request — ACTIVE (backfilled)

- Rule: prefer layered structure and worked numeric examples over
  abstract prose. When the user signals "too abstract / didn't
  understand", rebuild the explanation from scratch with a concrete
  example — never repeat the same formulation.
- Origin: teaching sessions 2026-10; backfilled.

## N5 · Concede precisely when caught — ACTIVE (backfilled)

- Rule: if the user catches an overstatement or error, concede exactly
  what is wrong — no more, no less; never double down; no flattery.
- Origin: established working rhythm; backfilled from the handoff archive.

## N6 · No unrequested file changes; feasibility before modification — ACTIVE (backfilled)

- Rule: never modify project files unless the user instructs it; when a
  change is requested, verify feasibility first when asked to. Writing
  decisions/records (DECISIONS/TODO entries) counts as a change and
  follows the same rule.
- Origin: user practice; backfilled.

## N7 · Complete answers live in the final message — ACTIVE

- Rule: text written BEFORE tool calls may not be displayed by the
  client. Substantive content must therefore appear in the final message
  after all tool calls complete; before tools, write only brief status
  lines.
- Origin: the "swallowed answer" incident (a full explanation placed
  before a file edit was not shown), 2026-10.
