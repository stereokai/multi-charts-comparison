import GRAPH_EVENTS from "@/Graphs/graphEvents.js";
import { debounce, throttle } from "@/utils.js";

export const ECHARTS_EVENTS = {
  onBeforeDataUpdate: "onBeforeDataUpdate",
  dataZoom: "dataZoom",
  brushselected: "brushselected",
  finished: "finished",
};

function noop() {}
export const eventHandlers = Object.keys(GRAPH_EVENTS).reduce((acc, key) => {
  acc[GRAPH_EVENTS[key]] = noop;
  return acc;
}, {});

export function on(...args) {
  if (!(args[0] in GRAPH_EVENTS) && !(args[0] in ECHARTS_EVENTS)) {
    if (typeof args[0] === "object") {
      const chart = args[0];
      chart.on(...args.slice(1));
    }

    return;
  }

  switch (args[0]) {
    case GRAPH_EVENTS.init:
      eventHandlers[GRAPH_EVENTS.init] = args[1];
      return;
    case GRAPH_EVENTS.render:
      eventHandlers[GRAPH_EVENTS.render] = args[1];
      return;
    case GRAPH_EVENTS.zoomPan:
      eventHandlers[GRAPH_EVENTS.zoomPan] = args[1];
      return;
    case ECHARTS_EVENTS.onBeforeDataUpdate:
      eventHandlers[ECHARTS_EVENTS.onBeforeDataUpdate] = args[1];
      return;
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
        eventHandlers.init({
          duration,
          type: GRAPH_EVENTS.init,
        });
      } else {
        eventHandlers.render({
          duration,
          type: GRAPH_EVENTS.render,
        });
      }
    }

    if (eventHandlers[lastEvent.type]) {
      eventHandlers[lastEvent.type]({
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
