const GRAPH_EVENTS = {
  init: "init",
  render: "render",
  zoomPan: "zoomPan",
  dataOperationStart: "dataOperationStart",
  dataOperationEnd: "dataOperationEnd",
};
export default GRAPH_EVENTS;

function noop() {}
export function graphEventsFactory() {
  const graphEvents = Object.keys(GRAPH_EVENTS).reduce((acc, key) => {
    acc[GRAPH_EVENTS[key]] = noop;
    return acc;
  }, {});

  const on = (...args) => {
    if (args[0] in GRAPH_EVENTS) {
      graphEvents[args[0]] = args[1];
    }
  };

  graphEvents.on = on;
  graphEvents.dataOperationStarted = () => {
    graphEvents.dataOperationStart({
      type: GRAPH_EVENTS.dataOperationStart,
    });
  };
  graphEvents.dataOperationEnded = () => {
    graphEvents.dataOperationEnd({
      type: GRAPH_EVENTS.dataOperationEnd,
    });
  };

  return graphEvents;
}
