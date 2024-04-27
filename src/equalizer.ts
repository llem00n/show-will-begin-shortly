window.AudioContext = window.AudioContext || (<any>window).webkitAudioContext;

const context = new AudioContext();

const createFilter = function (frequency: number) {
  var filter = context.createBiquadFilter();
     
  filter.type = 'peaking';
  filter.frequency.value = frequency;
  filter.Q.value = 1;
  filter.gain.value = 0;

  return filter;
};

const createFilters = function () {
  const frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000],
    filters = frequencies.map(createFilter);

  filters.reduce(function (prev, curr) {
    prev.connect(curr);
    return curr;
  });

  return filters;
};

export const equalize = function (audio: HTMLAudioElement) {
  const source = context.createMediaElementSource(audio),
    filters = createFilters();

  source.connect(filters[0]);
  filters[filters.length - 1].connect(context.destination);

  return filters;
};