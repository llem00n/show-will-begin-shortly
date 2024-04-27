import './main-menu.scss'
import { GAME } from '../../game';
import { SONGS } from '../../res/audio/songs';
import $html from './main-menu.html?raw';
import { GameHTMLElement } from '../game/game';

const html = $html;

export class MainMenuHTMLElement extends HTMLElement {
  static SELECTOR = 'main-menu';

  constructor() {
    super();

    this.innerHTML = html;

    GAME.audio.fade('background #2', 1000, -1, 0);
    GAME.audio.fade('background #3', 1000, -1, 0);
    GAME.audio.set('background #1', SONGS.bloopin);
    GAME.audio.audioPlayers['background #1'].oncanplay = () => {
      GAME.audio.fade('background #1', 1000, 0, 1);
    }
    GAME.audio.audioPlayers['background #1'].onended = () => {
      GAME.audio.audioPlayers['background #1'].currentTime = 0;
      GAME.audio.audioPlayers['background #1'].play
    }

    (this.querySelector('#high-score')! as HTMLSpanElement).innerText = `${GAME.savedState.highestScore}`;

    (this.querySelector('#endless-mode') as HTMLInputElement).disabled = !GAME.savedState.endlessModeAvailable;
    (this.querySelector('#endless-mode') as HTMLInputElement).checked = GAME.savedState.endlessMode;
    (this.querySelector('#endless-mode') as HTMLInputElement).addEventListener('click', e => e.stopPropagation());

    const x = () => {
      document.removeEventListener('click', x);
      GAME.audio.fade('background #1', 500, -1, 0);
      setTimeout(() => {
        GAME.audio.audioPlayers['background #1'].pause()
      }, 500);

      GAME.savedState.endlessMode = (this.querySelector('#endless-mode') as HTMLInputElement).checked;
      GAME.saveState();
      GAME.loadScene(GameHTMLElement);
    }
    document.addEventListener('click', x)
  }
}