export function getBaseDate(baseDate = new Date()) {
  baseDate.setDate(baseDate.getDate() - 1);
  return baseDate.setHours(22);
}

let _regenerateAllChannels, _transformAllChannels;

export function reverseInjection(regenerateAllChannels, transformAllChannels) {
  _regenerateAllChannels = regenerateAllChannels;
  _transformAllChannels = transformAllChannels;
}

export function regenerateAllChannels(...args) {
  _regenerateAllChannels(...args);
}

export function transformAllChannels(...args) {
  _transformAllChannels(...args);
}
