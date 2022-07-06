import { channels } from "@/models/state.js";
import { default as app } from "@/models/ui.js";

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
    this.initializeChannels(channels);

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

  update(dataset = [], timeSeries) {
    if (this.hasInitialized) {
      this.markEvent();
    }

    if (timeSeries) {
      this.timeSeries = timeSeries;
    }

    const { graphs } = this;
    const currGraphsLength = graphs.length;
    this.hasChannelsChanged = false;

    dataset.forEach((channelData, i) => {
      let graph = graphs[i];
      let channelIndex = i;

      // Add new channels
      if (channels.length !== currGraphsLength) {
        this.hasChannelsChanged = true;
        channelIndex = currGraphsLength + i;
        graphs.push(this.addChannel(channels[channelIndex], channelIndex));
        graph = graphs[channelIndex];
        this.registerZoomEvents(graph);
      }

      // Update existing channels
      graph.series.clear();
      graph.series.addArraysXY(timeSeries, channelData.data);
    });

    // Remove channels outside of dataset
    graphs
      .splice(channels.length, graphs.length - channels.length)
      .forEach((graph) => {
        this.hasChannelsChanged = true;
        graph.chart.dispose();
        for (let key in graph) {
          graph[key] = null;
        }
      });

    this.afterUpdate();
  }

  afterUpdate() {
    if (!this.hasInitialized || this.hasChannelsChanged) {
      this.setXAxisStyle();
      this.syncXAxesZoom();
    }
    requestAnimationFrame(() => {
      if (!this.hasInitialized || this.hasChannelsChanged) {
        // Synchronize zoom and scroll on all channels
        this.updateDashboardRowHeights();
      }
      this.resetView();
      this.reportRenderEvent();
    });
  }
}
