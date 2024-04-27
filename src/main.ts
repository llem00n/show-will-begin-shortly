import './style.scss'
import { Scenes } from './scenes/scenes';
import { IntroClassroomHTMLElement } from './scenes/intro-classroom/intro-classroom';
import { $animations, $setCss } from './durations.config';
import { GAME } from './game';
import { GameHTMLElement } from './scenes/game/game';
import { IMAGES_MASHA } from './res/images/masha';
import { MainMenuHTMLElement } from './scenes/main-menu/main-menu';
import { PartyHTMLElement } from './scenes/party/party';
import { TrashHTMLElement } from './scenes/trash/trash';

$animations(true);
$setCss();

const _x = Scenes.Intro_Classroom;
if (_x) {}

function bootstrap() {
  customElements.define(IntroClassroomHTMLElement.SELECTOR, IntroClassroomHTMLElement);
  customElements.define(GameHTMLElement.SELECTOR, GameHTMLElement);
  customElements.define(MainMenuHTMLElement.SELECTOR, MainMenuHTMLElement);
  customElements.define(PartyHTMLElement.SELECTOR, PartyHTMLElement);
  customElements.define(TrashHTMLElement.SELECTOR, TrashHTMLElement);
}
bootstrap();

document.body.style.setProperty('--scale', GAME.savedState.scale.toString());
document.body.style.setProperty('--img-masha-running', `url(${IMAGES_MASHA.running.src})`)
document.body.style.setProperty('--img-masha-running-frames-count', `${IMAGES_MASHA.running.frames}`)

GAME.loadGame();
const x = () => {
  document.removeEventListener('click', x);
}
document.addEventListener('click', x);
GAME.loadScene(TrashHTMLElement);