import { libraryIcon } from './library-icon.ts';
import { paintWelcomeLettering } from './project-welcome-lettering.ts';
import './project-welcome.css';

const sheetNotes = [[2, 23, 19], [4, 39, 16], [6, 14, 29], [8, 48, 22], [9, 29, 19]];
const fullPageNotes = [
  [1, 72.9, 12.2, '#85513d', .22], [2, 74.3, 15.8, '#85513d', .96],
  [3, 71.4, 13.3, '#85513d', .42], [4, 72.7, 14.9, '#85513d', .68],
  [18, 39.8, 12.4, '#65447f', .82], [19, 42.5, 15.7, '#65447f', .28], [20, 39.8, 12.6, '#65447f', .9],
  [9, 16.7, 13.5, '#477092', .57], [10, 18.8, 10, '#477092', .14],
  [3, 30.2, 13.5, '#65447f', .36], [18, 76.6, 15.1, '#477092', 1],
] as const;
const libraryOnlyNotes = [
  [8, 107, 10.5, '#477092', .52, '7cqh'],
  [14, 119, 12.4, '#65447f', .75, '18cqh'],
] as const;

function paintRollNote(note: HTMLElement, [column, top, height, color, lift]: readonly [
  column: number, top: number, height: number, color: string, lift: number,
]): void {
  note.className = 'project-welcome-note';
  note.style.setProperty('--welcome-note-column', String((column + (column % 2) * .1) / 24));
  note.style.setProperty('--welcome-note-time', String(top / 100));
  note.style.top = `${top}%`;
  note.style.height = `${height}%`;
  note.style.setProperty('--welcome-note-color', color);
  note.style.setProperty('--note-lift', String(lift));
}

export function createProjectWelcome(showBrand = true, showStart = true, fullPageRoll = false, audition?: (frequencyHz: number) => void) {
  const page = document.createElement('main'); page.className = 'welcome project-welcome';
  if (fullPageRoll) page.classList.add('is-desktop-welcome');
  if (showBrand) {
    const brand = document.createElement('div'); brand.className = 'project-welcome-brand';
    const mark = document.createElement('span'); mark.append(libraryIcon('score')); brand.append(mark);
    page.append(brand);
  }
  const invitation = document.createElement('section'); invitation.className = 'invitation';
  const heading = document.createElement('h1');
  const greeting = document.createElement('span'); greeting.textContent = '你好，';
  const question = document.createElement('span'); question.textContent = '你想创作什么？';
  if (fullPageRoll) {
    const lettering = document.createElement('canvas');
    if (paintWelcomeLettering(lettering)) {
      heading.setAttribute('aria-label', '你好，你想创作什么？');
      lettering.className = 'project-welcome-lettering';
      lettering.setAttribute('aria-hidden', 'true');
      heading.append(lettering);
    } else heading.append(greeting, question);
  } else heading.append(greeting, question);
  const introduction = document.createElement('div'); introduction.className = 'project-welcome-introduction';
  introduction.append(heading);
  const actions = document.createElement('div'); actions.className = 'welcome-actions';
  const start = document.createElement('button'); start.type = 'button'; start.className = 'primary'; start.textContent = '开始';
  actions.append(start); if (showStart) introduction.append(actions);
  const art = document.createElement('div');
  art.className = fullPageRoll ? 'project-welcome-roll' : 'project-welcome-art';
  const sheet = document.createElement('div');
  sheet.className = fullPageRoll ? 'project-welcome-roll-notes' : 'project-welcome-sheet';
  if (fullPageRoll) {
    for (const [index, dimensions] of fullPageNotes.entries()) {
      const note = document.createElement('button');
      note.type = 'button';
      paintRollNote(note, dimensions);
      if (index === 1 || index === 10) {
        note.classList.add('is-library-bridge-note');
        note.style.setProperty('--bridge-height', index === 1 ? '9cqh' : '15cqh');
      }
      note.setAttribute('aria-label', `试听音符 ${index + 1}`);
      const flash = document.createElement('span');
      flash.className = 'project-welcome-note-flash';
      flash.setAttribute('aria-hidden', 'true');
      note.append(flash);
      note.addEventListener('click', () => {
        if (page.inert || page.classList.contains('is-library-open')) return;
        flash.getAnimations?.().forEach(animation => animation.cancel());
        flash.animate?.([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'ease-out' });
        audition?.(440 * 2 ** ((60 + dimensions[0] - 1 - 69) / 12));
      });
      sheet.append(note);
    }
    if (document.documentElement?.classList.contains('windows-desktop-colors')) {
      const edgeWash = document.createElement('div');
      edgeWash.className = 'project-welcome-edge-wash';
      edgeWash.setAttribute('aria-hidden', 'true');
      page.prepend(edgeWash);
      for (const [column, top, height, color, lift, destination] of libraryOnlyNotes) {
        const note = document.createElement('i');
        paintRollNote(note, [column, top, height, color, lift]);
        note.classList.add('is-library-bridge-note', 'is-library-only-note');
        note.style.setProperty('--bridge-height', destination);
        note.setAttribute('aria-hidden', 'true');
        sheet.append(note);
      }
    }
  } else {
    art.setAttribute('aria-hidden', 'true');
    for (const [column, top, height] of sheetNotes) {
      const note = document.createElement('i');
      note.style.setProperty('--welcome-note-column', String(column));
      note.style.top = `${top}%`;
      note.style.height = `${height}%`;
      sheet.append(note);
    }
  }
  art.append(sheet);
  invitation.append(introduction);
  if (fullPageRoll) {
    const playline = document.createElement('div'); playline.className = 'project-welcome-playline';
    const playlineLayer = document.createElement('div'); playlineLayer.className = 'project-welcome-playline-layer';
    playlineLayer.append(playline);
    art.append(playlineLayer);
    page.append(art);
  } else invitation.append(art);
  page.append(invitation);
  return { page, start };
}
