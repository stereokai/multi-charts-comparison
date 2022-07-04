import GRAPH_EVENTS, { graphEventsFactory } from "@/Graphs/graphEvents.js";

const lightningChartEventsMixin = (Base) =>
  class LightningChartEvents extends Base {
    constructor(...args) {
      super(...args);

      this.lastEvent = null;
      this.hasInitialized = false;
      this.graphEvents = graphEventsFactory();
    }

    markEvent() {
      this.lastEvent = {
        timestamp: performance.now(),
      };
    }

    registerZoomEvents(graph) {
      graph.chart.onSeriesBackgroundMouseWheel((_, event) => {
        let { deltaY } = event;
        const { xAxis, yAxis } = graph;
        const { start, end } = xAxis.getInterval();

        deltaY = -deltaY;
        const newInterval = this.getNewInterval(start, end, deltaY);
        xAxis.setInterval(newInterval.start, newInterval.end, false, true);
      });
    }

    getNewInterval(start, end, deltaY, zoomRate = 10000) {
      if (zoomRate < 1000) return false; // Limit zoom rate, below 1000 is too slow

      const { minX, maxX } = this;
      const newStart = Math.min(
        maxX,
        Math.max(minX, start + deltaY * zoomRate)
      );
      const newEnd = Math.max(minX, Math.min(maxX, end - deltaY * zoomRate));

      // Prevent zoom-flipping (zooming in over max zoom in turns to zooming out),
      // But try squeezing as much zoom in as possible
      if (newEnd < maxX / 2 || newStart * 2 > maxX)
        return this.getNewInterval(start, end, deltaY, zoomRate / 2);

      return { start: newStart, end: newEnd };
    }

    reportRenderEvent() {
      requestAnimationFrame(() => {
        const duration = (performance.now() - this.lastEvent.timestamp) / 1000;

        if (!this.hasInitialized) {
          this.hasInitialized = true;
          this.graphEvents.init({
            duration,
            type: GRAPH_EVENTS.init,
          });
        } else {
          this.graphEvents.render({
            duration,
            type: GRAPH_EVENTS.render,
          });
        }

        this.lastEvent = null;
      });
    }
  };
export default lightningChartEventsMixin;
