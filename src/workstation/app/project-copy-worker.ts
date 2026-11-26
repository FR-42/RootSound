import { createProjectCopyLibrary } from './project-setup.ts';

self.onmessage = ({ data }) => {
  try { self.postMessage({ text: createProjectCopyLibrary(data.text, data.name, data.draftId) }); }
  catch (error) { self.postMessage({ error: error instanceof Error ? error.message : String(error) }); }
};
