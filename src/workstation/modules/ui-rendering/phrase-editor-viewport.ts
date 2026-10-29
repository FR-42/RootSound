/** UI navigation only; horizontal time is shared, vertical rows belong to a section. */
export type PhraseEditorViewport = {
  leftSeconds: number;
  /** The visible time span is 8 / zoom seconds, matching the detailed editors. */
  zoom: number;
  top: number;
  rowHeight: number;
};
