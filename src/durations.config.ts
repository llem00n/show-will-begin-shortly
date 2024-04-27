const $P = {
  CLASSROOM_SLIDE_TIMEOUT: 5000,
  CLASSROOM_GRAYSCALE_TIMEOUT: 10000,
  CLASSROOM_FILTER_CHANGE_TIMEOUT: 3000,
  CLASSROOM_BLANKET_TIMEOUT: 7000,
  DIALOG_FADE_DURATION: 500,
};

const $cssP = {
  CLASSROOM_SLIDE_DURATION: "7s",
  CLASSROOM_FILTER_CHANGE_DURATION: "3s",
  DIALOG_FADE_DURATION: ".5s",
  CLASSROOM_BLANKET_EXPAND_DURATION: '5s'
};

const cssProps = (zero?: boolean): Record<string, string> => ({
  "--classroom-slide-duration": zero ? "0s" : $cssP.CLASSROOM_SLIDE_DURATION,
  "--classroom-filter-change-duration": zero
    ? "0s"
    : $cssP.CLASSROOM_FILTER_CHANGE_DURATION,
  "--dialog-fade-duration": zero ? "0s" : $cssP.DIALOG_FADE_DURATION,
  "--classroom-blanket-expand-duration": zero ? "0s" : $cssP.CLASSROOM_BLANKET_EXPAND_DURATION,
});

let animationsDisabled = false;

export function $animations(val: boolean) {
  animationsDisabled = !val;
}

export function $setCss() {
  const style = document.body.style;
  const props = cssProps(animationsDisabled);
  Object.keys(props).forEach((prop) => {
    style.setProperty(prop, props[prop]);
  });
}

export function $durProp(name: keyof typeof $P) {
  return animationsDisabled ? 0 : $P[name];
}
