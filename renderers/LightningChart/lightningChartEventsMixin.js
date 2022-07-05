import GRAPH_EVENTS, { graphEventsFactory } from "@/Graphs/graphEvents.js";
import { hide, move, setPosition } from "./AreaZoom/AreaZoom.js";

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
      if (/*newEnd < maxX / 2 || */ newStart * 2 > maxX)
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

    toggleAreaZoom(shouldTurnOn) {
      if (shouldTurnOn) {
        this.graphs.forEach((graph) => {
          const { chart } = graph;
          chart.setMouseInteractionPan(false);

          graph.chartEvents = {
            offSeriesBackgroundMouseDragStart:
              chart.onSeriesBackgroundMouseDragStart(
                (series, pointerEvent, button) => {
                  if (button !== 0) return;
                  setPosition(pointerEvent.offsetX);
                }
              ),
            offSeriesBackgroundMouseDrag: chart.onSeriesBackgroundMouseDrag(
              (chart, pointerEvent, button) => {
                if (button !== 0) return;
                move(pointerEvent.offsetX);
              }
            ),
            offSeriesBackgroundMouseDragStop:
              chart.onSeriesBackgroundMouseDragStop(
                (chart, pointerEvent, button) => {
                  if (button !== 0) return;
                  const result = hide();
                  const pixelSizeX = chart
                    .getSeries()[0]
                    .scale.x.getPixelSize();

                  const int = this.mainGraph.xAxis.getInterval();
                  const startPixels = int.start / pixelSizeX - 160; // 160 left padding

                  this.mainGraph.xAxis.setInterval(
                    (startPixels + result.x) * pixelSizeX,
                    (startPixels + result.x + result.width) * pixelSizeX,
                    false,
                    true
                  );
                }
              ),
          };
        });
      } else {
        this.graphs.forEach((graph) => {
          const { chart } = graph;

          for (const [off, token] of Object.entries(graph.chartEvents)) {
            chart[off](token);
            graph.chartEvents[off] = null;
          }

          chart.setMouseInteractionPan(true);
        });
      }
    }
  };
export default lightningChartEventsMixin;
