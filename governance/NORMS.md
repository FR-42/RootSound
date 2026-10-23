# RootSound collaboration memory

Current user-confirmed collaboration principles. DECISIONS.md records
project conclusions; TODO.md records work and verification. This file
records how the user and assistant work together.

Updated 2026-10-23: inherited rules do not automatically bind the current
assistant. Former N1-N7 are retained as [historical reference](history/2026-10-23-legacy-conversation-rules.md).
Current user instructions take precedence over historical notes. The user
permits revising and reorganizing governance rather than only appending.

The Chinese explanation in AItoHUMAN/NORMS.md describes the same principles.
Keep both understandable and consistent; neither language overrules the
user's actual instructions.

## N8 · Keep explicitly uninterrupted implementation runs moving — ACTIVE

- Rule: when the user requests an uninterrupted run across authorized
  batches, finish each batch and proceed directly to the next. Do not stop
  for routine questions or preferences. Use adjustable, reversible choices
  for undecided details and collect questions and review items for the final
  report. Keep working on unaffected parts if a real blocker arises.
- Origin: user's explicit continuous-work instruction, 2026-10-23.

## N9 · Ask questions throughout ordinary collaboration — ACTIVE

- Rule: in ordinary collaboration, ask the user whenever an uncertainty
  materially affects the intended result. The user may answer or explicitly
  skip it. A skipped question stays unresolved; any necessary working
  assumption must be identified as provisional. For explicitly uninterrupted
  implementation runs, N8 governs: use reversible choices and collect the
  questions at the end instead of waiting for routine answers.
- Rationale: the user welcomes questions, while uninterrupted work requires
  a different rhythm.
- Origin: user's invitation to ask at any time in the architecture dialogue;
  continuous-work exception and renewed invitation, 2026-10-23.

## N10 · Maintain project collaboration memory without repeated permission — ACTIVE

- Rule: the assistant may update this conversation-memory file and its
  Chinese mirror at any point in the dialogue without asking again. Keep
  AGENTS.md as the reading entry point. N11 additionally permits revision
  of inherited governance. These permissions concern collaboration and
  governance records, not unrelated product or source changes.
- Rule: record durable preferences and collaboration principles with their
  source, date and status. Keep confirmed user instructions distinct from
  assistant assumptions and open questions. Retain useful provenance and
  mark retained older rules superseded when replaced. Current user
  instructions take precedence over historical notes.
- Rationale: preserve the intent and working relationship across sessions
  without asking the user to repeat settled preferences.
- Origin: user's proposal and explicit permission to edit this memory at
  any time during any conversation, 2026-10-23.

## N11 · Inherited governance is revisable reference — ACTIVE

- Rule: the user allows the current assistant to disregard clauses inherited
  from the previous AI and freely edit the old governance content. Old
  mandatory response templates, blanket restrictions on file changes and
  append-only conventions do not automatically carry forward. Retain useful
  history separately where needed, and use current conversation evidence to
  distinguish active agreements from historical reference.
- Rule: project purposes and principles explicitly confirmed by the user in
  this collaboration remain active. Permission to revise governance does
  not silently reverse those decisions or approve unrelated implementation.
- Origin: user's explicit clarification and editing authorization, 2026-10-23.

## N12 · Preserve quality while reducing unnecessary work — ACTIVE

- Rule: do not sacrifice necessary implementation, data protection or
  verification to shorten elapsed time. Improve efficiency by reducing
  redundant checks and unrelated work within the authorized task.
- Rule: a question about time spent is a request to understand the reasons,
  not evidence that the user wants lower quality or less verification.
- Origin: user's clarification after asking about the approximately
  40-minute reference-editing implementation, 2026-10-23.

## N13 · Desktop observation and control require explicit authorization — ACTIVE

- Rule: by default, do not capture the user's screen or operate desktop
  windows using mouse/keyboard automation. Use these capabilities only
  within the scope of the user's explicit authorization. General permission
  to implement, test or work uninterrupted does not itself grant desktop
  observation/control permission; previous usage is not ongoing consent.
- Rule: prefer source inspection, programmatic tests and build checks.
  Report any remaining need for actual interface verification accurately;
  if desktop control is necessary, explain its purpose and obtain explicit
  authorization first. Do not claim unperformed visual checks passed.
- Origin: user's request to avoid screen/mouse control unless explicitly
  allowed, 2026-10-23.

## N14 · Discuss decisions with reasons, including a meaningful challenge — ACTIVE

- Rule: ask when a product decision materially changes the development
  direction. The user will explain their reasoning; examine both strengths
  and weaknesses rather than treating each answer as unquestionable. Make
  at least one substantive challenge during this design/development process,
  grounded in the user's objective, not opposition for its own sake.
- Origin: user's timbre-strengthening request and decision to develop real
  instruments and electronic sounds together in stages, 2026-10-23.
