import * as graphs from "@/Graphs/Graphs.js";
import channelListItem from "@/partials/channel-list-item.hbs?raw";
import montageListItem from "@/partials/montage-list-item.hbs?raw";
import { hasAllFeatures, RENDERERS } from "@/router.js";
import { debounce } from "@/utils.js";
import Handlebars from "handlebars";
import hotkeys from "hotkeys-js";
import { app, channels } from "./models/state.js";

Handlebars.registerHelper("inc", (value) => parseInt(value) + 1);
Handlebars.registerHelper("ifeq", function (a, b, options) {
  if (a == b) {
    return options.fn(this);
  }
  return options.inverse(this);
});

let channelListItemTemplate;
let montageListItemTemplate;
let channelList;
let montageList;
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

  if (!channels.length) {
    updateGraphSettingsNow();
  }

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

function updateGraphSettingsNow() {
  graphs.onSettingChange(
    app.channels.value,
    app.samples.value,
    app.total.value
  );
}

const updateGraphSettings = debounce(updateGraphSettingsNow, 150);

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
  //#if _DEVELOPMENT
  console.log(
    `Last event was ${graphEvent.type}` +
      (graphEvent.duration
        ? ` which took ${graphEvent.duration.toFixed(2)}s`
        : "")
  );
  //#endif

  if (graphEvent.type === graphs.EVENTS.dataOperationStart) {
    labels.chartHeader.classList.add("show-loader");
    return;
  }
  if (graphEvent.type === graphs.EVENTS.dataOperationEnd) {
    labels.chartHeader.classList.remove("show-loader");
    hasAllFeatures && buildChannelList();
    return;
  }
  if (graphEvent.type === graphs.EVENTS.init) {
    if (app.channels.value > channels.length) {
      updateGraphSettingsNow();
    }
    // return;
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
    link.href = "#" + renderer.toLowerCase();
    link.innerHTML = renderer;
    link.className = "button";
    link.className += renderer === graphs.renderer ? " on" : "";
    renderers.appendChild(link);
  });
}

function buildExtraFeatures() {
  channelListItemTemplate = Handlebars.compile(channelListItem);
  montageListItemTemplate = Handlebars.compile(montageListItem);

  const xfToggleZoomBasedData = document.querySelector(
    "#xf-toggle-zoom-based-data"
  );
  xfToggleZoomBasedData.checked = app.extraFeatures.toggleZoomBasedData;
  xfToggleZoomBasedData.addEventListener("change", (event) => {
    app.extraFeatures.toggleZoomBasedData = event.target.checked;
    graphs.api.toggleZoomBasedData();
    event.target.blur();
  });

  const xfToggleGrid = document.querySelector("#xf-toggle-grid");
  xfToggleGrid.checked = app.extraFeatures.toggleGrid;
  xfToggleGrid.addEventListener("change", (event) => {
    graphs.api.toggleGrid(event.target.checked);
    event.target.blur();
  });

  const xfAreaZoom = document.querySelector("#xf-area-zoom");
  xfAreaZoom.checked = app.extraFeatures.areaZoom;
  xfAreaZoom.addEventListener("change", (event) => {
    graphs.api.toggleAreaZoom(event.target.checked);
    event.target.blur();
  });

  const xfExtrapolation = document.querySelector("#xf-extrapolation");
  xfExtrapolation.checked = app.extraFeatures.extrapolation;
  xfExtrapolation.addEventListener("change", (event) => {
    app.extraFeatures.extrapolation = event.target.checked;
    graphs.transformAllChannels();
    event.target.blur();
  });

  const xfToggleEvents = document.querySelector("#xf-toggle-events");
  xfToggleEvents.checked = app.extraFeatures.events;
  xfToggleEvents.addEventListener("change", (event) => {
    app.extraFeatures.events = event.target.checked;
    // graphs.api.toggleEvents();
    event.target.blur();
  });

  const xfToggleHotkeys = document.querySelector("#xf-toggle-hotkeys");
  xfToggleHotkeys.checked = app.extraFeatures.toggleHotkeys;
  xfToggleHotkeys.addEventListener("change", (event) => {
    app.extraFeatures.toggleHotkeys = event.target.checked;
    if (app.extraFeatures.toggleHotkeys) {
      registerHotkeys();
    } else {
      unregisterHotkeys();
    }
    event.target.blur();
  });

  const xfSaveMontage = document.querySelector("#xf-save-montage");
  xfSaveMontage.addEventListener("click", (event) => {
    setCurrentMontage(
      app.extraFeatures.montages.push(graphs.api.newMontage()) - 1
    );
  });

  channelList = document.querySelector("#channels-list");
  montageList = document.querySelector("#montages-list");

  channelList.addEventListener("click", (e) => {
    if (e.target.tagName !== "INPUT") {
      return;
    }

    const target = e.path.find((el) => el.classList.contains("target"));

    const channelIndex = target.getAttribute("channel-index") | 0;

    if (target.classList.contains("toggle-channel")) {
      channels[channelIndex].isHidden = !channels[channelIndex].isHidden;
      graphs.api.toggleChannelVisibility(channelIndex);
      unloadMontage();
      return;
    }

    if (target.classList.contains("pin-channel")) {
      channels[channelIndex].isSticky = !channels[channelIndex].isSticky;
      graphs.api.toggleChannelSticky(channelIndex);
      unloadMontage();
      return;
    }

    if (target.classList.contains("group-channel")) {
      channels[channelIndex].isGrouped = !channels[channelIndex].isGrouped;
      graphs.api.toggleChannelGrouped(channelIndex);
      unloadMontage();
      return;
    }
  });

  montageList.addEventListener("click", (e) => {
    if (
      e.path.find((el) => el.classList && el.classList.contains("close-button"))
    ) {
      const montageIndex = e.target.parentNode.getAttribute("montage");
      app.extraFeatures.montages.splice(montageIndex | 0, 1);
      buildMontageList();
      return;
    }

    let montageIndex = e.target.getAttribute("montage");
    if (montageIndex) {
      const montage = app.extraFeatures.montages[montageIndex | 0];
      montage && graphs.api.loadMontage(montage);
      setCurrentMontage(montageIndex);
      return;
    }
  });

  buildChannelList();
}

function buildChannelList() {
  if (channelList.childElementCount > app.channels.value) {
    while (channelList.childElementCount > app.channels.value) {
      channelList.removeChild(channelList.lastChild);
    }
    return;
  }

  channelList.innerHTML = channelListItemTemplate({ channels });
}

function buildMontageList() {
  montageList.innerHTML = montageListItemTemplate({
    montages: app.extraFeatures.montages,
    currentMontage: app.extraFeatures.currentMontage,
  });
}

function setCurrentMontage(montageIndex) {
  app.extraFeatures.currentMontage = montageIndex;
  buildMontageList();
  buildChannelList();
}

function unloadMontage() {
  app.extraFeatures.currentMontage = null;
  buildMontageList();
}

function registerHotkeys() {
  if (app.extraFeatures.hotkeys) {
    app.extraFeatures.hotkeys.forEach((hotkey) => {
      hotkeys(hotkey.key, (event, handler) => {
        // Prevent the default refresh event under WINDOWS system
        event.preventDefault();
        graphs.api[hotkey.action]();
      });
    });
  }
}

function unregisterHotkeys() {
  if (app.extraFeatures.hotkeys) {
    app.extraFeatures.hotkeys.forEach((hotkey) => hotkeys.unbind(hotkey.key));
  }
}
