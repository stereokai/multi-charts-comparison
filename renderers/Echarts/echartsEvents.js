import GRAPH_EVENTS, { graphEventsFactory } from "@/Graphs/graphEvents.js";
import { debounce, throttle } from "@/utils.js";

export const ECHARTS_EVENTS = {
  onBeforeDataUpdate: "onBeforeDataUpdate",
  dataZoom: "dataZoom",
  brushselected: "brushselected",
  finished: "finished",
};

export const graphEvents = graphEventsFactory();

export function on(...args) {
  if (!(args[0] in GRAPH_EVENTS) && !(args[0] in ECHARTS_EVENTS)) {
    if (typeof args[0] === "object") {
      const chart = args[0];
      chart.on(...args.slice(1));
    }

    return;
  }

  switch (args[0]) {
    case ECHARTS_EVENTS.onBeforeDataUpdate:
      graphEvents[ECHARTS_EVENTS.onBeforeDataUpdate] = args[1];
      return;
    default:
      graphEvents.on(...args);
  }
}

let lastEvent = null;
let hasInitialized = false;

const zoomHandler = throttle(() => {
  lastEvent = {
    type: GRAPH_EVENTS.zoomPan,
    timestamp: performance.now(),
  };
}, 150);

const finishHandler = debounce(() => {
  if (lastEvent) {
    const duration = (performance.now() - lastEvent.timestamp) / 1000;

    if (lastEvent.type === ECHARTS_EVENTS.onBeforeDataUpdate) {
      if (!hasInitialized) {
        hasInitialized = true;
        graphEvents.init({
          duration,
          type: GRAPH_EVENTS.init,
        });
      } else {
        graphEvents.render({
          duration,
          type: GRAPH_EVENTS.render,
        });
      }
    }

    if (graphEvents[lastEvent.type]) {
      graphEvents[lastEvent.type]({
        duration,
        type: lastEvent.type,
      });
    }

    lastEvent = null;
  }
}, 100);

export const ECHARTS_EVENT_HANDLERS = {
  // [ECHARTS_EVENTS.dataZoom]: zoomHandler,
  [ECHARTS_EVENTS.brushselected]: zoomHandler,
  [ECHARTS_EVENTS.finished]: finishHandler,
};

on(ECHARTS_EVENTS.onBeforeDataUpdate, () => {
  lastEvent = {
    type: ECHARTS_EVENTS.onBeforeDataUpdate,
    timestamp: performance.now(),
  };
});
