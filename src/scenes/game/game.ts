import "./game.scss";
import $html from "./game.html?raw";
import { DEFAULT_STATE, GAME } from "../../game";
import { SONGS } from "../../res/audio/songs";
import { IMAGES_CLOWNS } from "../../res/images/clowns";
import { IMAGES_STREET } from "../../res/images/street";
import { MainMenuHTMLElement } from "../main-menu/main-menu";
import { PartyHTMLElement } from "../party/party";

const html = $html
  .replace('!!msg1', GAME.getTranslated('street.run-for-your-life'))
  .replace('!!msg2', GAME.getTranslated('street.clowns-are-bad'));

export class GameHTMLElement extends HTMLElement {
  static SELECTOR = "app-game";
  masha: HTMLImageElement;
  road: HTMLImageElement;
  sorted: HTMLDivElement;
  background: HTMLDivElement;
  explosions: HTMLDivElement;
  redHealth: HTMLDialogElement;
  score: HTMLSpanElement;
  messages: HTMLDivElement;
  life = 1;
  deleted = false;
  start?: DOMHighResTimeStamp;
  previosTimestamp?: DOMHighResTimeStamp;
  onRoads: Array<HTMLElement> = [];
  spawnOnRoad: boolean = true;
  currentScrollSpeed: number;
  lastFlooredScore: number = 0;
  invincible: boolean = false;
  big: boolean = false;
  won: boolean = false;
  endless: boolean = false;

  constructor() {
    super();

    document.body.style.setProperty('--img-street-road', `url(${IMAGES_STREET.road.src})`)
    document.body.style.setProperty('--img-street-marking', `url(${IMAGES_STREET.marking.src})`)
    document.body.style.setProperty('--img-street-explosion', `url(${IMAGES_STREET.explosion.src})`)
    document.body.style.setProperty('--img-street-explosion-frames-count', `${IMAGES_STREET.explosion.frames}`)

    this.innerHTML = html;
    GAME.audio.audioPlayers["background #2"].addEventListener("ended", () =>
      this.selectAnotherSong()
    );

    GAME.audio.fade('background #2', 3000, -1, 1);
    if (GAME.audio.audioPlayers["background #2"].paused || !GAME.audio.audioPlayers['background #2'].src?.length)
      this.selectAnotherSong(true);
    this.startClownTsunami();

    this.masha = this.querySelector("#masha")!;
    this.road = this.querySelector("#road")!;
    this.sorted = this.querySelector("#sorted")!;
    this.background = this.querySelector("#background")!;
    this.explosions = this.querySelector("#explosions")!;
    this.redHealth = this.querySelector('#red-health')!;
    this.score = this.querySelector('#score')!;
    this.messages = this.querySelector('#messages')!;

    this.endless = GAME.savedState.endlessMode;

    this.setLifes(1);

    this.setInvincible(true);
    setTimeout(() => {
      this.setInvincible(false);
    }, 3000)

    const _mousemove = (ev: MouseEvent) => {
      if (this.deleted) {
        document.removeEventListener("mousemove", _mousemove);
        return;
      }

      this.updateMashasPosition(ev);
      this.sortAndDelete();
    };
    document.addEventListener("mousemove", _mousemove);
    this.updateMashasPosition();
    this.startDecorationsSpawn();
    setTimeout(() => {
      this.startBadSpawn();
      this.startGoodSpawn();
    }, 1500)
    GAME.state = { ...DEFAULT_STATE };
    this.currentScrollSpeed = 0;
    this.setCurrentScrollSpeed(0.01);
    window.requestAnimationFrame((ts) => this.step(ts));
    this.style.setProperty('--masha-scale', '1');
  }

  selectAnotherSong(skipTimeout = false) {
    if (this.deleted) return;

    const names = ["zombietsunamioriginal", "zombietsunamitrap", "ztremix"];
    const name = names[Math.floor(Math.random() * names.length)];
    setTimeout(
      () => {
        if (this.deleted) return;
        GAME.audio.audioPlayers["background #2"].src = (<any>SONGS)[
          name
        ] as string;
        GAME.audio.audioPlayers["background #2"].oncanplay = () => {
          GAME.audio.fade("background #2", 3000, 0, 1);
          GAME.audio.audioPlayers["background #2"].oncanplay = null;
        };
      },
      skipTimeout ? 0 : 1500
    );
  }

  startClownTsunami() {
    const clowns = this.querySelector("#clowns");
    const clownTsunamiInterval = setInterval(() => {
      if (this.deleted) {
        clearInterval(clownTsunamiInterval);
        return;
      }
      const src =
        IMAGES_CLOWNS[Math.floor(Math.random() * IMAGES_CLOWNS.length)];
      const animDuration = 1000 + Math.floor(Math.random() * 1000);
      const ANIMATIONS_COUNT = 4;

      const clown = document.createElement("div");
      clown.classList.add(
        "clown",
        `c-${Math.floor(Math.random() * ANIMATIONS_COUNT)}`,
        "pixelated"
      );
      clown.style.animationDuration = `${animDuration}ms`;
      clown.style.right = "100%";
      clown.style.top = `${30 + Math.floor(Math.random() * 40)}%`;

      const img = document.createElement("img");
      img.src = src.src;
      img.style.width = `calc(var(--scale) * ${src.size.width}px)`;
      img.style.filter = `hue-rotate(${Math.floor(Math.random() * 361)}deg)`;
      img.style.transform = `rotate(${Math.floor(Math.random() * 40) - 20}deg)`;
      clown.appendChild(img);
      clowns?.appendChild(clown);
      setTimeout(() => {
        clown.parentElement?.removeChild(clown);
      }, animDuration + 100);
    }, 100);
  }

  updateMashasPosition(ev?: MouseEvent, saveTopPos: boolean = false) {

    if (!this.won) {
      this.masha.style.left = `calc(var(--scale) * ${
        Math.floor((100 * this.life) / 1.5) + 5
      }px)`;
    }

    if (!saveTopPos) {
      if (!ev) {
        this.masha.style.top = `calc(var(--scale) * 100px)`;
      } else {
        const roadRect = this.road.getBoundingClientRect();
        const min = roadRect.top + GAME.savedState.scale * 23;
        const max = roadRect.bottom - GAME.savedState.scale * 25;
        const yPos = Math.max(min, Math.min(max, ev.clientY));
        this.masha.style.top = `${yPos}px`;
      }
    }

    this.sortAndDelete();
  }

  startDecorationsSpawn() {
    const spawn = () => {
      if (this.deleted) return;
      const decoration = document.createElement("img");
      const sides = ["top", "bottom"];
      const side = sides[Math.floor(Math.random() * sides.length)];
      const decorations = Object.keys(IMAGES_STREET.decorations).filter(
        (name) => (<any>IMAGES_STREET).decorations[name].sides.includes(side)
      ) as any[];
      const sprite = (<any>IMAGES_STREET.decorations)[
        decorations[Math.floor(Math.random() * decorations.length)]
      ];
      decoration.src = sprite.src;
      decoration.style.width = `${GAME.savedState.scale * sprite.size.width}px`;
      decoration.style.left = "100%";
      decoration.classList.add("pixelated");
      decoration.style.position = "absolute";
      (<any>decoration).$side = side;
      if (side === "top") {
        decoration.style.top = `calc(var(--scale) * ${
          Math.floor(Math.random() * 35) + 10
        }px)`;
      } else {
        decoration.style.top = `calc(100% - var(--scale) * ${
          Math.floor(Math.random() * 5) + 2
        }px)`;
      }
      this.sorted.appendChild(decoration);

      const delay = Math.min((Math.random() * 500 + 100) / this.currentScrollSpeed, 2000)
      setTimeout(() => spawn(), delay);
      this.sortAndDelete();
    };
    spawn();
  }

  startBadSpawn() {
    const spawn = () => {
      if (this.deleted) return;

      const delay = Math.min((Math.random() * 200 + 200) / (this.currentScrollSpeed || 0.001), 2000);
      setTimeout(() => spawn(), delay);
      if (!this.spawnOnRoad) return;

      const bad = document.createElement("img");
      const bads = Object.keys(IMAGES_STREET.bad);
      const sprite = (<any>IMAGES_STREET.bad)[
        bads[Math.floor(Math.random() * bads.length)]
      ];
      bad.src = sprite.src;
      bad.style.width = `${GAME.savedState.scale * sprite.size.width}px`;
      bad.style.left = "100%";
      bad.classList.add("pixelated", "bad");
      bad.style.position = "absolute";
      bad.style.top = `calc(50% + ${
        GAME.savedState.scale * (Math.floor(Math.random() * 70) - 35)
      }px)`;
      this.sorted.appendChild(bad);
      (<any>bad).$sprite = sprite;
      this.onRoads.push(bad);

      this.sortAndDelete();
    };

    spawn();
  }

  startGoodSpawn() {
    const spawn = () => {
      if (this.deleted) return;

      const delay = Math.min((Math.random() * 15000 + 15000) / (this.currentScrollSpeed || 0.001), 30000);
      setTimeout(() => spawn(), delay);
      if (!this.spawnOnRoad) return;

      const good = document.createElement("div");
      const img = document.createElement('img');
      const goods = Object.keys(IMAGES_STREET.good);
      const sprite = (<any>IMAGES_STREET.good)[
        goods[Math.floor(Math.random() * goods.length)]
      ];
      img.src = sprite.src;
      good.style.width = `${GAME.savedState.scale * sprite.size.width}px`;
      good.style.height = `${GAME.savedState.scale * sprite.size.height}px`;
      img.style.width = `${GAME.savedState.scale * sprite.size.width}px`;
      good.style.left = "100%";
      good.classList.add("good");
      img.classList.add("pixelated")
      good.style.position = "absolute";
      good.style.top = `calc(50% + ${
        GAME.savedState.scale * (Math.floor(Math.random() * 70) - 35)
      }px)`;
      this.sorted.appendChild(good);
      (<any>good).$sprite = sprite;
      good.appendChild(img);
      this.onRoads.push(good);

      this.sortAndDelete();
    };

    spawn();
  }

  sortAndDelete() {
    const children = Array.from(this.sorted.children);
    children
      .map(
        (child: any) => ((child.$rect = child.getBoundingClientRect()), child)
      )
      .filter((child) => child.$rect.right < 0)
      .forEach((child) => {
        child.parentElement?.removeChild(child);
        children.splice(children.indexOf(child), 1);
        if (child.classList.contains("bad") || child.classList.contains('good'))
          this.onRoads.splice(this.onRoads.indexOf(child), 1);
      });

    children
      .sort((c1: any, c2: any) => c1.$rect.bottom - c2.$rect.bottom)
      .forEach((child: any, i) => {
        child.style.zIndex = `${
          i + (child.classList.contains("explosion") ? 5000 : 2000)
        }`;
      });
  }

  step(timeStamp: DOMHighResTimeStamp) {
    if (this.previosTimestamp !== undefined) {
      const elapsed = timeStamp - this.previosTimestamp;

      this.setScore(GAME.state.score + 0.05 * elapsed * GAME.state.scrollSpeed);
      GAME.state.scrollSpeed += elapsed * 0.00001

      if (this.currentScrollSpeed < GAME.state.scrollSpeed) {
        const diff =
          (GAME.state.scrollSpeed - this.currentScrollSpeed) * 0.01 * elapsed;
        this.setCurrentScrollSpeed(
          Math.min(this.currentScrollSpeed + diff, GAME.state.scrollSpeed)
        );
      }

      if (this.previosTimestamp !== timeStamp) {
        const pixels = this.currentScrollSpeed * elapsed;

        const bgInitial = (<any>this.background).$translateX ?? 0;
        let bgNew = bgInitial + pixels;
        const roadLength =
          GAME.savedState.scale * IMAGES_STREET.road.size.width * 2;
        while (bgNew > roadLength) bgNew -= roadLength;

        this.background.style.transform = `translateX(-${
          pixels + bgInitial
        }px)`;
        (<any>this.background).$translateX = bgNew;

        let masha: any = null;

        for (const child of Array.from(this.sorted.children) as any[]) {
          if (child.id === "masha") {
            masha = child;
            continue;
          }

          if (child.classList.contains('big-hit')) {
            continue;
          };

          const initial = child.$translateX ?? 0;
          child.style.transform = `translate(-${pixels + initial}px, -100%)`;
          child.$translateX = initial + pixels;
        }

        if (masha && !this.invincible) {
          const mashaDomRect: DOMRect = masha.getBoundingClientRect();
          const mashaRect = {
            left: mashaDomRect.left + GAME.savedState.scale * 10,
            right: mashaDomRect.right - GAME.savedState.scale * 15,
            top: mashaDomRect.bottom + GAME.savedState.scale * 5,
            bottom: mashaDomRect.bottom - GAME.savedState.scale * 5,
          };
  
          for (const onRoad of this.onRoads as any[]) {
            const domRect = onRoad.getBoundingClientRect();
            const rect = {
              left: domRect.left + GAME.savedState.scale * ((<any>onRoad).$sprite.radius.left || 0),
              right: domRect.right - GAME.savedState.scale * ((<any>onRoad).$sprite.radius.right || 0),
              top:
                domRect.bottom -
                GAME.savedState.scale * (<any>onRoad).$sprite.radius.top,
              bottom:
                domRect.bottom +
                GAME.savedState.scale * (<any>onRoad).$sprite.radius.bottom,
            };
  
            if (GameHTMLElement.collides(mashaRect, rect)) {
              if (!this.big) {
                if (onRoad.classList.contains('bad')) {
                  this.onCollideWithBad();
                } else if (onRoad.classList.contains('good')) {
                  this.onCollideWithGood(onRoad)
                }
              } else {
                this.onBigHit(onRoad);
              }
            }
          }
        }
      }
    }

    this.previosTimestamp = timeStamp;
    if (!this.deleted) {
      window.requestAnimationFrame((ts) => this.step(ts));
    }
  }

  static collides(
    a: { top: number; bottom: number; left: number; right: number },
    b: { top: number; bottom: number; left: number; right: number }
  ) {
    return (
      ((a.bottom >= b.top && a.bottom <= b.bottom) ||
        (a.top >= b.top && a.bottom <= b.bottom)) &&
      ((a.left >= b.left && a.left <= b.right) ||
        (a.right >= b.left && a.right <= b.right))
    );
  }

  onCollideWithBad() {
    this.destroyAllOnRoads(3000);
    this.setCurrentScrollSpeed(0.0001);
    this.setLifes(Math.max(0, this.life - 0.2))
    this.updateMashasPosition(undefined, true);
    this.setInvincible(true);
    setTimeout(() => {
      this.setInvincible(false);
    }, 3000);
    
    GAME.audio.fade('background #2', 500, -1, 0.5)
    setTimeout(() => {
      GAME.audio.fade('background #2', 1000, -1, 1);
    }, 1000)
  }

  onCollideWithGood(onRoad: any) {
    const sprite = onRoad.$sprite;
    if (sprite === IMAGES_STREET.good.banana) {
      this.onBananaPickUp();
      this.showPickedUpGoodMessage('banana')
      this.setInvincible(true);
      setTimeout(() => {
        this.setInvincible(false);
      }, 4000);
    } else if (sprite === IMAGES_STREET.good.bomb) {
      this.onBombPickUp();
      this.showPickedUpGoodMessage('bomb')
    } else if (sprite === IMAGES_STREET.good.muffinRecipe) {
      this.onMuffinRecipePickUp();
      this.showPickedUpGoodMessage('muffinRecipe')
    }

    this.destroyOnRoad(onRoad);
  }

  spawnExplosion(rect: DOMRect) {
    const explosion = document.createElement("div");
    explosion.classList.add("explosion", "pixelated");
    explosion.style.top = `${Math.floor(rect.bottom)}px`;
    explosion.style.left = `${Math.floor(
      rect.left +
        rect.width / 2 -
        (IMAGES_STREET.explosion.size.width / 2) * GAME.savedState.scale
    )}px`;
    explosion.style.zIndex = "9999";
    this.sorted.appendChild(explosion);

    setTimeout(() => {
      explosion.parentElement?.removeChild(explosion);
    }, 800);
  }

  setCurrentScrollSpeed(speed: number) {
    this.currentScrollSpeed = speed;
  }

  setLifes(value: number) {
    this.life = value;
    if (this.life <= .3) {
      this.redHealth.classList.add('active')
    } else {
      this.redHealth.classList.remove('active')
    }

    const opposite = (1 - this.life) / 4;
    GAME.audio.fadePlaybackRate('background #2', -1, 1 + opposite, 500);

    if (!this.endless && GAME.state.score >= 5000 && this.life <= .2) {
      this.win();
    }

    if (!this.life) this.die();
  }

  setScore(score: number) {
    GAME.state.score = score;
    this.score.innerText = `${Math.floor(score)}`;
  }

  destroyAllOnRoads(timeout: number) {
    this.spawnOnRoad = false;
    setTimeout(() => {
      this.spawnOnRoad = !this.won;
    }, timeout);

    for (const onRoad of this.onRoads) {
      this.destroyOnRoad(onRoad);
    }
    this.onRoads.length = 0;
  }
  
  destroyOnRoad(onRoad: any) {
    this.spawnExplosion(onRoad.getBoundingClientRect());
    setTimeout(() => {
      onRoad.parentElement?.removeChild(onRoad);
    }, 500);
  }

  setInvincible(val: boolean) {
    this.invincible = val;
    if (this.invincible) {
      this.masha.classList.add('invincible');
    } else {
      this.masha.classList.remove('invincible');
    }
  }

  showPickedUpGoodMessage(goodName: keyof typeof IMAGES_STREET.good) {
    const sprite = IMAGES_STREET.good[goodName];
    const good = document.createElement('div');
    good.classList.add('good');
    good.innerHTML = `
      <div>
        <div class="pic">
          <img class="pixelated" src="${sprite.src}">
        </div>
        <div class="name">
          <p>${GAME.getTranslated(`goods.${goodName}.name`)}</p>
          </div>
        <div class="desc">
          <p>${GAME.getTranslated(`goods.${goodName}.desc`)}</p>
        </div>
        <div class="pts">
          <p>+${sprite.pts}</p>
        </div>
      </div>
    `;
    this.messages.appendChild(good);
    setTimeout(() => {
      good.parentElement?.removeChild(good);
    }, 4000);
  }

  onBananaPickUp() {
    this.setLifes(1);
    this.setScore(GAME.state.score + IMAGES_STREET.good.banana.pts)
  }

  onBombPickUp() {
    this.destroyAllOnRoads(4000);
    this.setScore(GAME.state.score + IMAGES_STREET.good.bomb.pts)
  }

  onMuffinRecipePickUp() {
    this.big = true;
    this.style.setProperty('--masha-scale', '2')
    this.setScore(GAME.state.score + IMAGES_STREET.good.muffinRecipe.pts)

    setTimeout(() => {
      this.big = false;
      this.style.setProperty('--masha-scale', '1')

      this.setInvincible(true);
      setTimeout(() => {
        this.setInvincible(false);
      }, 3000)
    }, 10000)
  }

  die() {
    this.saveScore();
    this.load(MainMenuHTMLElement);
  }

  onBigHit(element: HTMLElement) {
    const _el = element as any;
    _el.$hitBig = true;

    const rect = element.getBoundingClientRect();
    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;
    element.style.transform = '';
    setTimeout(() => {
      element;
    })
    element.classList.add('big-hit');
    this.setScore(GAME.state.score + 10)
    setTimeout(() => {
      const index = this.onRoads.indexOf(element)
      if (index !== -1) {
        this.onRoads.splice(index, 1);
      }

      element.parentElement?.removeChild(element);
    }, 2100)
  }

  load(scene: { SELECTOR: string }) {
    this.deleted = true;
    GAME.loadScene(scene, { transition: { color: 'white', fadeInDuration: 3000, fadeOutDuration: 500 } });
  }

  win() {
    if (this.won) return;

    this.setLifes(1);
    this.won = true;
    this.spawnOnRoad = false;
    this.masha.classList.add('winning');
    setTimeout(() => {
      this.masha.style.left = '150%';
    })

    GAME.savedState.endlessModeAvailable = true;
    GAME.saveState();
    
    setTimeout(() => {
      this.saveScore();
      this.load(PartyHTMLElement)
    }, 10000)
  }

  saveScore() {
    if (GAME.state.score > GAME.savedState.highestScore) {
      GAME.savedState.highestScore = Math.floor(GAME.state.score);
      GAME.saveState();
    }
  }
}
