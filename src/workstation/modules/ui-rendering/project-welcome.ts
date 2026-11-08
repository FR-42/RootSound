export function createProjectWelcome() {
  const page = document.createElement('main'); page.className = 'welcome';
  const wordmark = document.createElement('div'); wordmark.className = 'wordmark'; wordmark.textContent = 'RootSound';
  const invitation = document.createElement('section'); invitation.className = 'invitation';
  const heading = document.createElement('h1'); heading.textContent = '你好，你想创作什么？';
  const actions = document.createElement('div'); actions.className = 'welcome-actions';
  const start = document.createElement('button'); start.type = 'button'; start.className = 'primary'; start.textContent = '开始';
  actions.append(start); invitation.append(heading, actions); page.append(wordmark, invitation);
  return { page, start };
}
