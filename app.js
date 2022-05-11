import * as graphs from "@/Graphs/Graphs.js";
import { default as app } from "@/models/ui.js";
import { RENDERERS } from "@/router.js";
import { debounce } from "@/utils.js";

const labels = {};
const FRIENDLY_NAMES = {
  [graphs.EVENTS.init]: "First render",
  [graphs.EVENTS.render]: "Data change",
  [graphs.EVENTS.zoomPan]: "Zoom/Pan",
};

function init() {
  const renderers = document.querySelector("#renderers");
  labels.channels = document.querySelector("#label-channels");
  labels.period = document.querySelector("#label-period");
  labels.samples = document.querySelector("#label-samples");
  labels.total = document.querySelector("#total-samples");
  labels.lastEvent = document.querySelector("#last-event");
  labels.lastEventDuration = document.querySelector("#last-event-duration");
  labels.chartHeader = document.querySelector("#chart-header");

  labels.chartHeader.innerHTML = graphs.renderer;
  RENDERERS.forEach((renderer) => {
    const link = document.createElement("a");
    link.href = "#" + renderer.toLowerCase();
    link.innerHTML = renderer;
    link.className = "button";
    link.className += renderer === graphs.renderer ? " on" : "";
    renderers.appendChild(link);
  });

  updateTotalSamples();
  graphs.initGraph(app.total.value / app.channels.value, app.samples.value);
  Object.keys(graphs.EVENTS).forEach((event) => {
    graphs.on(graphs.EVENTS[event], onGraphEvent);
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

function onGraphEvent(graphEvent) {
  console.log(
    `Last event was ${graphEvent.type} and took ${graphEvent.duration}`
  );

  labels.lastEvent.innerHTML = FRIENDLY_NAMES[graphEvent.type];
  labels.lastEventDuration.innerHTML = graphEvent.duration.toFixed(2) + "s";
}
if (document.readyState == "complete" || document.readyState == "interactive") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    init();
  });
}
