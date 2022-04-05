import * as graphs from "./Graphs.js";
import { default as app } from "./toolbarConfiguration.js";
import { debounce, throttle } from "./utils.js";

const ECHARTS_EVENTS = {
  init: "init",
  onBeforeDataUpdate: "onBeforeDataUpdate",
  dataZoom: "dataZoom",
  brushselected: "brushselected",
  finished: "finished",
};

const zoomHandler = throttle(() => {
  lastEvent = {
    type: ECHARTS_EVENTS.dataZoom,
    timestamp: performance.now(),
  };
}, 150);
const finishHandler = debounce(() => {
  if (lastEvent) {
    const duration =
      ((performance.now() - lastEvent.timestamp) / 1000).toFixed(2) + "s";
    let eventName;

    if (
      lastEvent.type === ECHARTS_EVENTS.onBeforeDataUpdate &&
      !hasInitialized
    ) {
      eventName = FRIENDLY_NAMES[ECHARTS_EVENTS.init];
      hasInitialized = true;
    } else {
      eventName = FRIENDLY_NAMES[lastEvent.type];
    }

    console.log(`Last event was ${lastEvent.type} and took ${duration}`);
    labels.lastEvent.innerHTML = eventName;
    labels.lastEventDuration.innerHTML = duration;

    lastEvent = null;
  }
}, 100);

const ECHARTS_EVENT_HANDLERS = {
  [ECHARTS_EVENTS.dataZoom]: zoomHandler,
  [ECHARTS_EVENTS.brushselected]: zoomHandler,
  [ECHARTS_EVENTS.finished]: finishHandler,
};

const FRIENDLY_NAMES = {
  [ECHARTS_EVENTS.init]: "First render",
  [ECHARTS_EVENTS.onBeforeDataUpdate]: "Data change",
  [ECHARTS_EVENTS.dataZoom]: "Zoom/Slide",
};

let lastEvent = null;

let hasInitialized = false;

const labels = {};
function init() {
  labels.channels = document.querySelector("#label-channels");
  labels.period = document.querySelector("#label-period");
  labels.samples = document.querySelector("#label-samples");
  labels.total = document.querySelector("#total-samples");
  labels.lastEvent = document.querySelector("#last-event");
  labels.lastEventDuration = document.querySelector("#last-event-duration");

  updateTotalSamples();
  graphs.initEcharts(app.total.value / app.channels.value, app.samples.value);

  graphs.on(ECHARTS_EVENTS.onBeforeDataUpdate, (channels) => {
    lastEvent = {
      type: ECHARTS_EVENTS.onBeforeDataUpdate,
      timestamp: performance.now(),
    };
  });
  graphs.on(ECHARTS_EVENTS.brushselected, () => {
    ECHARTS_EVENT_HANDLERS[ECHARTS_EVENTS.brushselected]();
  });
  graphs.on(ECHARTS_EVENTS.finished, () => {
    ECHARTS_EVENT_HANDLERS[ECHARTS_EVENTS.finished]();
  });

  const rangeChannels = document.querySelector("#range-channels");
  const rangePeriod = document.querySelector("#range-period");
  const rangeSamples = document.querySelector("#range-samples");

  rangeChannels.addEventListener("input", onSliderChange);
  rangePeriod.addEventListener("input", onSliderChange);
  rangeSamples.addEventListener("input", onSliderChange);
}

function buildLabelText(label, value) {
  return ` ${label}: ${value}`;
}

function updateControlLabel(name, value) {
  const label = labels[name];
  label.innerHTML = buildLabelText(app[name].label, value);
}

function updateTotalSamples() {
  app.total.value =
    app.channels.value * app.period.value * 3600 * app.samples.value;
  labels.total.innerHTML = Number(app.total.value).toLocaleString();
}

const updateGraphSettings = debounce(() => {
  graphs.onSettingChange(
    app.channels.value,
    app.samples.value,
    app.total.value
  );
}, 150);

function onSliderChange(event) {
  const { value } = event.target;
  const { name } = event.target;
  updateControlLabel(name, value);
  app[name].value = value;
  updateTotalSamples();
  updateGraphSettings();
}

document.addEventListener("DOMContentLoaded", () => init());
