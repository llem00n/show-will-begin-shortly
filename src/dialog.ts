import { $durProp } from "./durations.config";

export type Replica = {
  author: string;
  text: string;
  actions?: Array<{
    html?: string;
    name: string;
    callback: (name: string) => unknown;
  }>
  pos: { 
    parentElement: Element;
    x: number | 'center';
    y?: number;
    ignoreScale?: boolean;
    bottom?: number;
  },
  ondissmiss?: () => unknown;
}

export async function startDialog(replicas: Replica[]): Promise<void> {
  return new Promise<void>(async (resolve) => {
    if (!replicas.length) resolve();

    let currentReplica = 0;
    let currentReplicaElement: HTMLDivElement | null = null;
  
    const next = async () => {
      document.removeEventListener('click', next);
      if (currentReplicaElement) {
        currentReplicaElement!.classList.add('faded')
        if (replicas[currentReplica]?.ondissmiss) replicas[currentReplica].ondissmiss!();
        setTimeout(() => {
          currentReplicaElement!.parentElement?.removeChild(currentReplicaElement!);
        }, $durProp('DIALOG_FADE_DURATION'));
      }
      currentReplica++;
  
      if (replicas.length > currentReplica) {
        setTimeout(async () => {
          currentReplicaElement = await showReplica(replicas[currentReplica]);
        }, 100)
      }

      if (replicas.length >= currentReplica) {
        setTimeout(() => {
          document.addEventListener('click', next)
        }, 300)
      }
  
      if (replicas.length <= currentReplica) {
        resolve();
      }
    }
  
    currentReplicaElement = await showReplica(replicas[currentReplica]);
    setTimeout(() => {
      document.addEventListener('click', next)
    }, 200)
  })

  
}

async function showReplica(replica: Replica): Promise<HTMLDivElement> {
  const bubble = document.createElement('div');
  bubble.classList.add('faded', 'dialog-bubble');
  setTimeout(() => {
    bubble.classList.remove('faded');
  }, 100)

  if (!replica.pos.ignoreScale) {
    if (replica.pos.x === 'center') {
      bubble.style.left = '50%';
      bubble.style.transform = 'translateX(-50%)'
    } else {
      bubble.style.left = `calc(${replica.pos.x}px * var(--scale))`;
    }

    if (replica.pos.y) {
      bubble.style.top = `calc(${replica.pos.y}px * var(--scale))`;
    } else if (replica.pos.bottom) {
      bubble.style.bottom = `calc(${replica.pos.bottom}px * var(--scale))`;
    }
  } else {
    if (replica.pos.x === 'center') {
      bubble.style.left = '50%';
      bubble.style.transform = 'translateX(-50%)'
    } else {
      bubble.style.left = `${replica.pos.x}px`;
    }

    if (replica.pos.y) {
      bubble.style.top = `${replica.pos.y}px`;
    } else if (replica.pos.bottom) {
      bubble.style.bottom = `${replica.pos.bottom}px`;
    }
  }

  bubble.innerHTML = `
    <div class="text-box">
      <div class="author">${replica.author}</div>
      <div class="text">${replica.text}</div>
    </div>
  `

  replica.pos.parentElement.appendChild(bubble);

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(bubble);
    }, $durProp('DIALOG_FADE_DURATION') + 100)
  })
}