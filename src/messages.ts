import { GAME } from "./game";
import { MessageTitle } from "./res/languages/languages";

export enum Severity {
  Error,
  Info
};

export type Options = {
  severity: Severity,
  dissmissable: boolean,
  timeout: number,
}

const DEFAULT_OPTIONS: Options = {
  severity: Severity.Info,
  dissmissable: true,
  timeout: 3000
}

const messages = document.getElementById('messages');
messages!.innerText = ''

const MESSAGE_TEMPLATE = `
<div class="message">
  <div class="title-bar">
    <span class="title"></span>
    <button class="close-btn">
  </div>
  <div class="description"></div>
</div>
`

export function $msg(_title: MessageTitle, _description?: MessageTitle, _options: Partial<Options> = DEFAULT_OPTIONS): void {
  const title = GAME.getTranslated(_title);
  const description = _description ? GAME.getTranslated(_description) : null;

  const div = document.createElement('div');
  div.innerHTML = MESSAGE_TEMPLATE;
  const msg = div.children[0];

  const titleEl = <HTMLSpanElement>msg.querySelector('.message .title-bar .title')
  const descriptionEl = <HTMLSpanElement>msg.querySelector('.message .description');
  const closeBtnEl = <HTMLButtonElement>msg.querySelector('.message .title-bar .close-btn');

  titleEl.innerText = title;

  if (description) {
    descriptionEl.innerText = description;
  } else {
    descriptionEl.style.display = 'none';
  }
 
  if (!_options.dissmissable) {
    closeBtnEl.style.display = 'none';
  }
}