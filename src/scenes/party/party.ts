import './party.scss'
import $html from './party.html?raw';
import { IMAGES_PARTY } from '../../res/images/party';
import { GAME } from '../../game';
import { SONGS } from '../../res/audio/songs';
import { MainMenuHTMLElement } from '../main-menu/main-menu';

const html = $html
  .replace('!!pizza', IMAGES_PARTY.pizza.src);

export class PartyHTMLElement extends HTMLElement {
  static SELECTOR = 'birthday-party'

  text: HTMLDivElement;

  constructor() {
    super();

    this.style.setProperty('--img-party-space-bg', `url(${IMAGES_PARTY.sky.src})`);
    this.style.setProperty('--img-party-space-bg-width', `${GAME.savedState.scale * IMAGES_PARTY.sky.size.width}px`);
    this.style.setProperty('--img-party-space-bg-height', `${GAME.savedState.scale * IMAGES_PARTY.sky.size.height}px`);

    this.innerHTML = html;

    this.text = this.querySelector('.inner-scene .space .text')!;

    GAME.audio.fade('background #1', 500, -1, 0);
    GAME.audio.fade('background #2', 500, -1, 0);

    setTimeout(() => {
      GAME.audio.set('background #3', SONGS.lugi);
      GAME.audio.audioPlayers['background #3'].oncanplay = () => {
        GAME.audio.fade('background #3', 10000, 0, .7)
      }
      this.querySelector('.inner-scene')?.classList.add('space')
      this.querySelector('.inner-scene .space')?.classList.add('active')
      setTimeout(() => {
        this.querySelector('.inner-scene .space .text')?.classList.add('active');
        setTimeout(() => {
          this.startSpinningText();
          setTimeout(() => {
            GAME.loadScene(MainMenuHTMLElement, { transition: { color: 'white', fadeInDuration: 5000, fadeOutDuration: 500 } });
          }, 90000);
        }, 3000)
      }, 5000)
    }, 7000)
  }

  startSpinningText() {
    const length = this.text.children.length - 1;
    let counter = 0;
    const x = () => {
      if (counter < length) {
        setTimeout(() => {
          this.text.style.left = `-${100 * (++counter)}vw`;
          x();
        }, 7000)
      }
    }
    x();
  }
}