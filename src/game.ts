import { LOCAL_STORAGE_SAVE_ITEM_NAME } from "./config";
import { equalize } from "./equalizer";

import {
  LanguagePackName,
  MessageTitle,
  LANGUAGE_PACKS,
} from "./res/languages/languages";

interface SavedState {
  $v: number;
  language: LanguagePackName;
  scale: number;
  highestScore: number;
  endlessModeAvailable: boolean;
  endlessMode: boolean;
}

const SAVED_DEFAULT_STATE: SavedState = {
  $v: 0,
  language: "uk",
  scale: 5,
  highestScore: 0,
  endlessModeAvailable: false,
  endlessMode: false,
};

interface State {
  scrollSpeed: number;
  score: number;
}

export const DEFAULT_STATE: State = {
  scrollSpeed: 0.8,
  score: 0,
  
};

const _AudioPlayers = [
  "background #1",
  "background #2",
  "background #3",
  "sfx #1",
] as const;
export type AudioPlayer = (typeof _AudioPlayers)[number];

class Audio {
  audioPlayers: Record<AudioPlayer, HTMLAudioElement>;

  constructor() {
    const audios = document.getElementById("audio");
    this.audioPlayers = Object.fromEntries(
      _AudioPlayers.map((player) => {
        const el = document.createElement("audio");
        audios!.appendChild(el);
        return [player, el];
      })
    ) as any;
  }

  set(player: AudioPlayer, src: string) {
    this.audioPlayers[player].src = src;
  }

  fade(player: AudioPlayer, duration: number = 300, start = -1, finish = -1) {
    const audio = this.audioPlayers[player];
    const _audio: any = audio;

    if (start == -1) start = audio.volume;
    if (finish == -1) finish = audio.volume;

    start = Math.min(1, Math.max(0, start));
    finish = Math.min(1, Math.max(0, finish));

    if (_audio.$interval) {
      clearInterval(_audio.$interval);
      delete _audio.$interval;
    }

    _audio.volume = start;
    _audio.$interval = setInterval(() => {
      if (
        ((start <= finish && audio.volume >= finish) ||
          (start >= finish && audio.volume <= finish)) &&
        _audio.$interval
      ) {
        clearInterval(_audio.$interval);
        delete _audio.$interval;
        return;
      }
      audio.volume = Math.max(
        0,
        Math.min(1, audio.volume + (start < finish ? 1 : -1) * 0.01)
      );
    }, duration / 100);

    audio.play();
  }

  pause(player: AudioPlayer) {
    this.audioPlayers[player].pause();
  }

  play(player: AudioPlayer) {
    this.audioPlayers[player].play();
  }

  rewind(player: AudioPlayer, to: number) {
    this.audioPlayers[player].currentTime = to;
  }

  fadePlaybackRate(
    player: AudioPlayer,
    start = -1,
    finish = -1,
    duration = 1000
  ) {
    const audio = this.audioPlayers[player];
    const _audio: any = audio;

    if (start == -1) start = audio.playbackRate;
    if (finish == -1) finish = audio.playbackRate;

    start = Math.max(0.5, Math.min(4, start));
    finish = Math.max(0.5, Math.min(4, finish));

    if (_audio.$playbackInterval) {
      clearInterval(_audio.$playbackInterval);
      delete _audio.$playbackInterval;
    }

    _audio.playbackRate = start;
    _audio.$playbackInterval = setInterval(() => {
      if (
        ((start <= finish && audio.playbackRate >= finish) ||
          (start >= finish && audio.playbackRate <= finish)) &&
        _audio.$playbackInterval
      ) {
        clearInterval(_audio.$playbackInterval);
        delete _audio.$playbackInterval;
        return;
      }
      audio.playbackRate = Math.max(
        0.5,
        Math.min(4, audio.playbackRate + (start < finish ? 0.01 : -0.01))
      );
    }, duration / 100);

    audio.play();
  }

  getEqualizer(player: AudioPlayer): ReturnType<typeof equalize> {
    const _audio = this.audioPlayers[player] as any;
    if (!_audio.$eq) {
      _audio.$eq = equalize(_audio);
    }

    return _audio.$eq;
  }
}

class Game {
  savedState: SavedState = { ...SAVED_DEFAULT_STATE };
  state: State = { ...DEFAULT_STATE };
  audio: Audio = new Audio();

  canLoadGame(): boolean {
    return localStorage.getItem(LOCAL_STORAGE_SAVE_ITEM_NAME) != null;
  }

  saveState(): void {
    localStorage.setItem(
      LOCAL_STORAGE_SAVE_ITEM_NAME,
      JSON.stringify(this.savedState)
    );
  }

  newGame(): void {
    this.savedState = SAVED_DEFAULT_STATE;
    localStorage.setItem(
      LOCAL_STORAGE_SAVE_ITEM_NAME,
      JSON.stringify(this.savedState)
    );
  }

  loadGame() {
    const loaded = localStorage.getItem(LOCAL_STORAGE_SAVE_ITEM_NAME)!;
    if (!loaded) {
      this.newGame();
      return;
    }

    const json = JSON.parse(loaded);
    if (!isSavedStateValid(json)) {
      this.newGame();
    }

    this.savedState = json;
    return true;
  }

  getTranslated(msg: MessageTitle): string {
    return (
      LANGUAGE_PACKS[this.savedState.language][msg] || LANGUAGE_PACKS["uk"][msg]
    );
  }

  loadScene(
    scene: { SELECTOR: string },
    options?: {
      transition?: {
        color: string;
        fadeInDuration: number;
        fadeOutDuration: number;
      };
    }
  ) {
    const app = document.querySelector("#app")!;
    if (options?.transition) {
      const overlay = document.querySelector(
        "#scene-overlay"
      )! as HTMLDivElement;
      overlay.style.opacity = "0";
      overlay.style.backgroundColor = options.transition.color;
      overlay.style.transition = `opacity ${options.transition.fadeInDuration}ms`;
      overlay.style.zIndex = "9999";
      setTimeout(() => {
        overlay.style.opacity = "1";
      });

      setTimeout(() => {
        app.innerHTML = `<${scene.SELECTOR}></${scene.SELECTOR}>`;

        overlay.style.transition = `opacity ${options.transition?.fadeOutDuration}ms`;
        overlay.style.opacity = "0";
        setTimeout(() => {
          overlay.style.zIndex = "-1";
        }, options.transition?.fadeOutDuration);
      }, options.transition.fadeInDuration + 100);
    } else {
      app.innerHTML = `<${scene.SELECTOR}></${scene.SELECTOR}>`;
    }
  }
}

export const GAME = new Game();

function isSavedStateValid(state: any) {
  return typeof state?.$v === typeof SAVED_DEFAULT_STATE?.$v;
}
