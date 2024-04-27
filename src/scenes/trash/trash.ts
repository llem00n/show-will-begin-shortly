import './trash.scss'
import $html from './trash.html?raw';
import { IMAGES_PARTY } from '../../res/images/party';
import { GAME } from '../../game';
import { IntroClassroomHTMLElement } from '../intro-classroom/intro-classroom';

const html = $html
  .replace('!!gorilla', IMAGES_PARTY.gorilla.src);

export class TrashHTMLElement extends HTMLElement {
  static SELECTOR = 'app-trash';

  constructor() {
    super();

    this.innerHTML = html;

    this.querySelector('button')!.onclick = () => {
      document.body.requestFullscreen();
      GAME.loadScene(IntroClassroomHTMLElement, { transition: { color: '#111', fadeInDuration: 3000, fadeOutDuration: 0 } });
    }
  }
}