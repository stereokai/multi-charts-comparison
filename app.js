import * as graphs from "@/Graphs/Graphs.js";
import { default as app } from "@/models/ui.js";
import { RENDERERS } from "@/router.js";
import { debounce } from "@/utils.js";
import Stats from "stats.js";

const labels = {};
const FRIENDLY_NAMES = {
  [graphs.EVENTS.init]: "First render",
  [graphs.EVENTS.render]: "Data change",
  [graphs.EVENTS.zoomPan]: "Zoom/Pan",
};

function init() {
  const toolbar = document.getElementById("toolbar");
  const renderers = document.querySelector("#renderers");
  labels.channels = document.querySelector("#label-channels");
  labels.period = document.querySelector("#label-period");
  labels.samples = document.querySelector("#label-samples");
  labels.total = document.querySelector("#total-samples");
  labels.lastEvent = document.querySelector("#last-event");
  labels.lastEventDuration = document.querySelector("#last-event-duration");
  labels.chartHeader = document.querySelector("#chart-header");

  var stats = new Stats();
  // stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
  // window.stats = stats;
  // document.body.appendChild(stats.dom);

  labels.chartHeader.innerHTML = graphs.renderer;
  RENDERERS.forEach((renderer) => {
    const link = document.createElement("a");
    link.href = "/" + renderer.toLowerCase();
    link.innerHTML = renderer;
    link.className = "button";
    link.className += renderer === graphs.renderer ? " on" : "";
    renderers.appendChild(link);
  });

  updateTotalSamples();
  Object.keys(graphs.EVENTS).forEach((event) => {
    graphs.on(graphs.EVENTS[event], onGraphEvent);
  });
  graphs.initGraph(
    document.querySelector("#chart"),
    app.total.value / app.channels.value,
    app.samples.value
  );

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

  if (graphEvent.type === graphs.EVENTS.dataOperationStart) {
    labels.chartHeader.classList.add("show-loader");
    return;
  }
  if (graphEvent.type === graphs.EVENTS.dataOperationEnd) {
    labels.chartHeader.classList.remove("show-loader");
    return;
  }

  labels.lastEvent.innerHTML = FRIENDLY_NAMES[graphEvent.type];
  labels.lastEventDuration.innerHTML = graphEvent.duration.toFixed(2) + "s";
  requestAnimationFrame(() => {
    labels.lastEventDuration.parentNode.classList.add("highlight-flash");
    setTimeout(() => {
      labels.lastEventDuration.parentNode.classList.remove("highlight-flash");
    }, 1000);
  });
}
if (document.readyState == "complete" || document.readyState == "interactive") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    init();
  });
}
