import type { ReferenceContext, ReferenceEditingPort, ReferenceSession } from '../../contracts/references.ts';

/** Returning through workspace tabs must resume an unfinished occurrence edit. */
export function beginOrResumeReferenceEdit(references: Pick<ReferenceEditingPort, 'sessions' | 'begin'>,
  context: ReferenceContext): ReferenceSession {
  return references.sessions().find(session => session.context?.root.type === context.root.type
    && session.context.root.id === context.root.id && session.context.path.length === context.path.length
    && session.context.path.every((slot, index) => slot === context.path[index])) ?? references.begin(context);
}

/** Include nested sound edits when deciding whether a root can be replaced. */
export function pendingReferenceEdits(references: Pick<ReferenceEditingPort, 'sessions'> | undefined,
  rootDraftId: string): ReferenceSession[] {
  const sessions = references?.sessions() ?? [];
  const byId = new Map(sessions.map(session => [session.draftId, session]));
  return sessions.filter(session => {
    let context = session.context; const seen = new Set<string>();
    while (context?.root.type === 'draft') {
      if (context.root.id === rootDraftId) return true;
      if (seen.has(context.root.id)) throw new Error('编辑位置之间的关联无效，原有内容已保留。');
      seen.add(context.root.id); context = byId.get(context.root.id)?.context;
    }
    return false;
  });
}
