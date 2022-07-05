import * as graphs from "@/Graphs/Graphs.js";
import { default as app } from "@/models/ui.js";
import channelListItem from "@/partials/channel-list-item.hbs?raw";
import { hasAllFeatures, RENDERERS } from "@/router.js";
import { debounce } from "@/utils.js";
import Handlebars from "handlebars";
import { channels } from "./models/state.js";

let channelListItemTemplate;
const labels = {};
const FRIENDLY_NAMES = {
  [graphs.EVENTS.init]: "First render",
  [graphs.EVENTS.render]: "Data change",
  [graphs.EVENTS.zoomPan]: "Zoom/Pan",
};

function init() {
  const renderers = document.querySelector("#renderers");
  const extraFeatures = document.querySelector("#extra-features");
  labels.channels = document.querySelector("#label-channels");
  labels.period = document.querySelector("#label-period");
  labels.samples = document.querySelector("#label-samples");
  labels.total = document.querySelector("#total-samples");
  labels.lastEvent = document.querySelector("#last-event");
  labels.lastEventDuration = document.querySelector("#last-event-duration");
  labels.chartHeader = document.querySelector("#chart-header");

  labels.chartHeader.innerHTML = graphs.renderer;

  if (!hasAllFeatures) {
    extraFeatures.parentElement.removeChild(extraFeatures);
    renderers.classList.add("show");
    buildRenderers(renderers);
  } else {
    renderers.parentElement.removeChild(renderers);
    extraFeatures.classList.add("show");
    buildExtraFeatures(extraFeatures);
  }

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
  hasAllFeatures && buildChannelList();
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
    hasAllFeatures && buildChannelList();
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

function buildRenderers(renderers) {
  RENDERERS.forEach((renderer) => {
    const link = document.createElement("a");
    link.href = "/" + renderer.toLowerCase();
    link.innerHTML = renderer;
    link.className = "button";
    link.className += renderer === graphs.renderer ? " on" : "";
    renderers.appendChild(link);
  });
}

function buildExtraFeatures() {
  channelListItemTemplate = Handlebars.compile(channelListItem);
  const xfToggleGrid = document.querySelector("#xf-toggle-grid");
  xfToggleGrid.checked = app.extraFeatures.toggleGrid;
  xfToggleGrid.addEventListener("change", (event) => {
    graphs.api.toggleGrid(event.target.checked);
  });

  buildChannelList();
}

function buildChannelList() {
  // build unordered list of channels and append to #channels-list
  const channelsList = document.querySelector("#channels-list");

  if (channelsList.childElementCount > app.channels.value) {
    while (channelsList.childElementCount > app.channels.value) {
      channelsList.removeChild(channelsList.lastChild);
    }
    return;
  }

  channelsList.innerHTML = channelListItemTemplate({ channels });

  // // add event listeners to each channel
  // const channelLinks = document.querySelectorAll("#channels-list li");
  // channelLinks.forEach((link) => {
  //   link.addEventListener("click", (event) => {
  //     const channel = event.target.innerHTML;
  //     graphs.api.toggleChannel(channel);
  //   }
  //   );
  // });
}

function initExtraFeatures() {}
