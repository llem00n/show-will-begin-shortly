import { startDialog } from '../../dialog';
import { $durProp } from '../../durations.config';
import { GAME } from '../../game';
import { SONGS } from '../../res/audio/songs';
import { IMAGES_BALLOONS } from '../../res/images/balloons';
import { IMAGES_CLASSROOM } from '../../res/images/classroom';
import { IMAGES_CLOWNS } from '../../res/images/clowns';
import { IMAGES_DUST } from '../../res/images/dust';
import { IMAGES_MASHA } from '../../res/images/masha';
import { GameHTMLElement } from '../game/game';
import $html from './intro-classroom.html?raw';
import './intro-classroom.scss'

const html = $html
  .replace('!!bg', IMAGES_CLASSROOM.bg)
  .replace('!!light', IMAGES_CLASSROOM.light)
  .replace('!!tables1', IMAGES_CLASSROOM.tables1)
  .replace('!!tables2', IMAGES_CLASSROOM.tables2)
  .replace('!!tables3', IMAGES_CLASSROOM.tables3)
  .replace('!!teachersTable', IMAGES_CLASSROOM.teachersTable)
  .replace('!!lisa', IMAGES_CLASSROOM.lisa)
  .replace('!!teacher', IMAGES_CLASSROOM.teacher)

export class IntroClassroomHTMLElement extends HTMLElement {
  static SELECTOR = 'scene-intro'

  constructor() {
    super();

    this.innerHTML = html;
    const outerScene = this.querySelector('.outer-scene')

    setTimeout(() => {
      moveSceneInPlace();
    }, $durProp('CLASSROOM_SLIDE_TIMEOUT'))

    const moveSceneInPlace = () => {
      outerScene!.classList.add('in-place');

      setTimeout(() => {
        makeSceneColored();
      }, $durProp('CLASSROOM_GRAYSCALE_TIMEOUT'))
    }

    const makeSceneColored = () => {
      outerScene?.classList.add('colored');

      setTimeout(() => {
        startClassroomDialog();
      }, $durProp('CLASSROOM_FILTER_CHANGE_TIMEOUT'))
    }

    const startClassroomDialog = () => {
      startDialog([
        {
          author: GAME.getTranslated('dialog.classroom-intro.teacher.name'),
          text: GAME.getTranslated('dialog.classroom-intro.teacher.replica #1'),
          pos: {
            parentElement: this.querySelector('#teacher')!.parentElement!,
            x: 200,
            y: 110,
          }
        },
        {
          author: GAME.getTranslated('dialog.classroom-intro.kira.name'),
          text: GAME.getTranslated('dialog.classroom-intro.kira.replica #1'),
          pos: {
            parentElement: this.querySelector('#lisa')!.parentElement!,
            x: 150,
            y: 80,
          }
        }
      ]).then(() => startClownTsunamiMusic())
    }

    const startClownTsunamiMusic = () => {
      setTimeout(() => {
        GAME.audio.set('background #2', SONGS.zombietsunamioriginal);
        GAME.audio.audioPlayers['background #2'].oncanplay = () => {
          GAME.audio.fade('background #2', 25000, 0, 6)
          GAME.audio.audioPlayers['background #2'].oncanplay = null;
        }

        setTimeout(() => {
          startDialog([
            {
              author: GAME.getTranslated('dialog.classroom-intro.teacher.name'),
              text: GAME.getTranslated('dialog.classroom-intro.teacher.replica #2'),
              pos: {
                parentElement: this.querySelector('#teacher')!.parentElement!,
                x: 200,
                y: 110,
              }
            },
            {
              author: GAME.getTranslated('dialog.classroom-intro.kira.name'),
              text: GAME.getTranslated('dialog.classroom-intro.kira.replica #2'),
              pos: {
                parentElement: this.querySelector('#lisa')!.parentElement!,
                x: 150,
                y: 80,
              }
            },
            {
              author: GAME.getTranslated('dialog.classroom-intro.teacher.name'),
              text: GAME.getTranslated('dialog.classroom-intro.teacher.replica #3'),
              pos: {
                parentElement: this.querySelector('#teacher')!.parentElement!,
                x: 200,
                y: 110,
              }
            },
          ]).then(() => startClownsDialog())
        }, 7000)
      }, 1000)
    }

    const startClownsDialog = () => {
      GAME.audio.fade('background #1', 3000, -1, 0);

      setTimeout(() => {
        outerScene!.querySelector('.inner-inner-scene')!.classList.add('shake');

        startDialog([
          {
            author: GAME.getTranslated('dialog.classroom-intro.???.name'),
            text: GAME.getTranslated('dialog.classroom-intro.???.replica #1'),
            pos: {
              parentElement: this.querySelector('#characters')!,
              x: 10,
              y: 100,
            }
          },
          {
            author: GAME.getTranslated('dialog.classroom-intro.???.name'),
            text: GAME.getTranslated('dialog.classroom-intro.???.replica #2'),
            pos: {
              parentElement: this.querySelector('#characters')!,
              x: 10,
              y: 120,
            }
          },
          {
            author: GAME.getTranslated('dialog.classroom-intro.???.name'),
            text: GAME.getTranslated('dialog.classroom-intro.???.replica #3'),
            pos: {
              parentElement: this.querySelector('#characters')!,
              x: 10,
              y: 90,
            }
          },
          {
            author: GAME.getTranslated('dialog.classroom-intro.???.name'),
            text: GAME.getTranslated('dialog.classroom-intro.???.replica #4'),
            pos: {
              parentElement: this.querySelector('#characters')!,
              x: 10,
              y: 150,
            }
          },
        ]).then(() => startClownTsunami())
      }, 1000)
    }

    const startClownTsunami = () => {
      const parent = this.querySelector('#characters')!;

      const spawnClown = () => {
        const clown = document.createElement('img');
        const src = IMAGES_CLOWNS[Math.floor(Math.random() * IMAGES_CLOWNS.length)];
        const duration = 1 + Math.floor(Math.random() * 2);
        clown.src = src.src;
        clown.classList.add('clown', 'pixelated');
        clown.style.width = `calc(var(--scale) * ${src.size.width}px)`;
        clown.style.left = `-${src.size.width * 5}px`;
        clown.style.transition = `left ${duration}s linear, top ${duration}s `
        clown.style.top = `${Math.floor(Math.random() * 80) + 10}%`;
        clown.style.zIndex = `${Math.floor(Math.random() * 3) + 800}`
        parent.appendChild(clown);

        setTimeout(() => {
          clown.style.left = `calc(100% + ${src.size.width * 5}px)`;
          clown.style.top = `${Math.floor(Math.random() * 80) + 10}%`;
        }, 100)

        setTimeout(() => {
          clown.parentElement!.removeChild(clown);
        }, duration * 1000 + 200)
      }

      const spawnBalloon = () => {
        const balloon = document.createElement('img');
        const src = IMAGES_BALLOONS[Math.floor(Math.random() * IMAGES_BALLOONS.length)];
        const duration = 5 + Math.floor(Math.random() * 4);
        balloon.src = src.src;
        balloon.classList.add('balloon', 'pixelated');
        balloon.style.width = `calc(var(--scale) * ${src.size.width}px)`;
        balloon.style.left = `-${src.size.width * 5}px`;
        balloon.style.transition = `left ${duration}s linear, top ${duration}s `
        balloon.style.top = `${Math.floor(Math.random() * 80) + 10}%`;
        balloon.style.zIndex = `${Math.floor(Math.random() * 3) + 800}`
        parent.appendChild(balloon);

        setTimeout(() => {
          balloon.style.left = `calc(100% + ${src.size.width * 5}px)`;
          balloon.style.top = `${Math.floor(Math.random() * 80) + 10}%`;
        }, 100)

        setTimeout(() => {
          balloon.parentElement!.removeChild(balloon);
        }, duration * 1000 + 200)
      }

      const spawnMasha = () => {
        const masha = document.createElement('div');
        const src = IMAGES_MASHA.running;
        const duration = 2;
        masha.classList.add('masha', 'pixelated', 'masha--running');
        masha.style.left = `-${src.size.width * 5}px`;
        masha.style.transition = `left ${duration}s linear, top ${duration}s `
        masha.style.top = `50%`;
        masha.style.transform = 'translateY(-50%)'
        masha.style.zIndex = `${900}`
        parent.appendChild(masha);

        setTimeout(() => {
          masha.style.left = `calc(100% + ${src.size.width * 5}px)`;
        }, 100)

        setTimeout(() => {
          masha.parentElement!.removeChild(masha);
        }, duration * 1000 + 200)
      }

      const spawnDust = () => {
        const dust = document.createElement('img');
        const src = IMAGES_DUST[Math.floor(Math.random() * IMAGES_DUST.length)];
        const duration = 5 + Math.floor(Math.random() * 4);
        dust.src = src.src;
        dust.classList.add('dust', 'pixelated');
        dust.style.width = `calc(var(--scale) * ${src.size.width}px)`;
        dust.style.left = `-${src.size.width * 5}px`;
        dust.style.transition = `left ${duration}s ease-out, top ${duration}s `
        dust.style.top = `${Math.floor(Math.random() * 100)}%`;
        dust.style.zIndex = `${Math.floor(Math.random() * 3) + 800}`
        parent.appendChild(dust);

        setTimeout(() => {
          dust.style.left = `calc(100% + ${src.size.width * 5}px)`;
          dust.style.top = `${Math.floor(Math.random() * 100)}%`;
        }, 100)

        setTimeout(() => {
          dust.parentElement!.removeChild(dust);
        }, duration * 1000 + 200)
      }

      spawnMasha();
      setTimeout(() => {
        let clownsCounter = 0;
        const clownsInterval = setInterval(() => {
          if (++clownsCounter === 50) clearInterval(clownsInterval);
          spawnClown();
        }, 200);
  
        let balloonsCounter = 0;
        const balloonsInterval = setInterval(() => {
          if (++balloonsCounter === 20) clearInterval(balloonsInterval);
          spawnBalloon();
        }, 500);
  
        let dustCounter = 0;
        const dustInterval = setInterval(() => {
          if (++dustCounter === 20) clearInterval(dustInterval);
          for (let x = 0; x < 3; x++) {
            spawnDust();
          }
        }, 500);
      }, 300);

      

      setTimeout(() => closeScene(), 7000)
    }

    const closeScene = () => {
      this.querySelector('.blanket')?.classList.add('expanded');
      setTimeout(() => {
        GAME.loadScene(GameHTMLElement, { transition: { color: '#fff', fadeInDuration: 2000, fadeOutDuration: 500 } });
      }, $durProp('CLASSROOM_BLANKET_TIMEOUT'))
    }

    GAME.audio.set('background #1', SONGS.ifididntcare);
    GAME.audio.audioPlayers['background #1'].oncanplay = () => {
      GAME.audio.fade('background #1', 8000, 0, 1);
      GAME.audio.audioPlayers['background #1'].oncanplay = null;
    }
  }
}