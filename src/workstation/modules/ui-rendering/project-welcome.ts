import { libraryIcon } from './library-icon.ts';
import './project-welcome.css';

export function createProjectWelcome() {
  const page = document.createElement('main'); page.className = 'welcome project-welcome';
  const brand = document.createElement('div'); brand.className = 'project-welcome-brand';
  const mark = document.createElement('span'); mark.append(libraryIcon('score')); brand.append(mark);
  const invitation = document.createElement('section'); invitation.className = 'invitation';
  const heading = document.createElement('h1');
  const greeting = document.createElement('span'); greeting.textContent = '你好，';
  const question = document.createElement('span'); question.textContent = '你想创作什么？';
  heading.append(greeting, question);
  const actions = document.createElement('div'); actions.className = 'welcome-actions';
  const start = document.createElement('button'); start.type = 'button'; start.className = 'primary'; start.textContent = '开始';
  actions.append(start);
  const introduction = document.createElement('div'); introduction.className = 'project-welcome-introduction';
  introduction.append(heading, actions);
  const art = document.createElement('div'); art.className = 'project-welcome-art'; art.setAttribute('aria-hidden', 'true');
  const sheet = document.createElement('div'); sheet.className = 'project-welcome-sheet';
  for (const [left, top, height] of [[15, 23, 19], [31, 39, 16], [47, 14, 29], [63, 48, 22], [78, 29, 19]]) {
    const note = document.createElement('i'); note.style.left = `${left}%`; note.style.top = `${top}%`; note.style.height = `${height}%`; sheet.append(note);
  }
  art.append(sheet); invitation.append(introduction, art); page.append(brand, invitation);
  return { page, start };
}
