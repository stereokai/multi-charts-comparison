import { graphEventsFactory } from "@/Graphs/graphEvents.js";
import { channels } from "@/models/state.js";
import uPlot from "uplot";

let uplots;

export const graphEvents = graphEventsFactory();
export function on(...args) {
  graphEvents.on(...args);
}

export function init(container) {
  uplots = channels.map(
    (channel) =>
      new uPlot(
        {
          width: container.clientWidth,
          height: container.clientHeight / channels.length,
          ms: 1,
          series: [
            {},
            {
              stroke: "red",
            },
          ],
          cursor: {
            sync: {
              key: 0,
            },
          },
        },
        [],
        container
      )
  );
}

export function update(dataset = [], timeSeries) {
  dataset.forEach((channel, i) => {
    uplots[i].setData([timeSeries, channel.data]);
  });
}

export function showLoading() {}
export function hideLoading() {}
