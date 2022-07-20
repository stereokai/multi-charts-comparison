import { app, channels } from "@/models/state.js";

export default class LightningChartImpl {
  get minX() {
    return this.timeSeries[0];
  }

  get maxX() {
    return this.timeSeries[this.timeSeries.length - 1];
  }

  get mainGraph() {
    return this.graphs[this.graphs.length - 1];
  }

  get maxVisibleCharts() {
    return app.channels.max;
  }

  constructor() {
    this.graphs = [];
  }

  init(container) {
    this.markEvent();

    this.newDashboard(container);

    // Prevent native wheel zoom (interferes with max zoom limitation)
    container.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
      },
      {
        passive: false,
      }
    );
  }

  update(dataset = [], timeSeries, channelFilter) {
    if (this.hasInitialized) {
      this.markEvent();
    }

    if (timeSeries) {
      this.timeSeries = timeSeries;
    }

    const { graphs } = this;
    const currGraphsLength = graphs.length;

    let filteredChannels = 0,
      i = 0,
      j = 0;
    while (i < channels.length && j < dataset.length) {
      let channelIndex = filteredChannels + j;
      i++;
      if (channelFilter && !channelFilter(channels[channelIndex])) {
        filteredChannels++;
        continue;
      }

      let graph = graphs[channelIndex];
      const channelData = dataset[j];
      j++;

      // Add new channels
      if (channels.length !== currGraphsLength) {
        channelIndex = currGraphsLength + channelIndex;
        graphs.push(this.addChannel(channels[channelIndex], channelIndex));
        graph = graphs[channelIndex];
        this.registerZoomEvents(graph);
      }

      // Update existing channels
      graph.series.clear();

      if (channelData.data.length !== timeSeries.length) {
        console.error(
          "Data length mismatch",
          channelData.data.length,
          timeSeries.length
        );
        return;
      }
      graph.series.addArraysXY(timeSeries, channelData.data);
    }

    // Remove channels outside of dataset
    graphs
      .splice(channels.length, graphs.length - channels.length)
      .forEach((graph) => {
        graph.chart.dispose();
        for (let key in graph) {
          graph[key] = null;
        }
      });

    this.afterUpdate(graphs.length !== currGraphsLength);
  }

  afterUpdate(hasChannelsChanged) {
    requestAnimationFrame(() => {
      this.reportRenderEvent();
    });

    if (super.afterUpdate) {
      super.afterUpdate(hasChannelsChanged);
    }
  }
}
