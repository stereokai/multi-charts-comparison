import { getBaseDate } from "@/Graphs/graphCommon";
import { channels } from "@/models/state.js";
import {
  AxisTickStrategies,
  ColorCSS,
  emptyLine,
  lightningChart,
  SolidFill,
  SolidLine,
  synchronizeAxisIntervals,
  Themes,
} from "@arction/lcjs";

const lightningChartDashboardMixin = (Base) =>
  class LightningChartDashboard extends Base {
    static visibleGridStyle = new SolidLine({
      thickness: 1,
      fillStyle: new SolidFill({ color: ColorCSS("#dfdfdf") }),
    });

    static hiddenGridStyle = emptyLine;

    static getNewDashboard(container, numberOfRows) {
      return lightningChart({
        overrideInteractionMouseButtons: {
          chartXYPanMouseButton: 0, // LMB
          chartXYRectangleZoomFitMouseButton: 2, // RMB
        },
      })
        .Dashboard({
          container,
          numberOfColumns: 1,
          numberOfRows,
          theme: Themes.lightNew,
        })
        .setBackgroundFillStyle(
          new SolidFill({
            color: ColorCSS("white"),
          })
        )
        .setSplitterStyle(emptyLine)
        .setSplitterStyleHighlight(emptyLine);
    }

    newDashboard(container, numberOfRows) {
      this.dashboard = LightningChartDashboard.getNewDashboard(
        container,
        numberOfRows
      );
    }

    updateDashboardRowHeights() {
      const { dashboard, graphs, mainGraph, maxVisibleCharts } = this;
      const axisHeight = mainGraph.xAxis.getHeight();
      const rowHeight =
        (dashboard.engine.container.clientHeight - axisHeight) /
        graphs.filter((g, i) => !channels[i].isHidden).length;
      for (let row = 0; row < maxVisibleCharts; row++) {
        if (row < graphs.length && !channels[row].isHidden) {
          dashboard.setRowHeight(row, Math.round(rowHeight));
        } else {
          dashboard.setRowHeight(row, 0.00001);
        }
      }

      dashboard.setRowHeight(mainGraph.row, Math.round(rowHeight + axisHeight));
    }

    setXAxisStyle() {
      this.graphs.forEach((graph, i) => {
        graph.xAxis.setTickStrategy(AxisTickStrategies.Empty);
      });

      this.mainGraph.xAxis.setTickStrategy(
        AxisTickStrategies.DateTime,
        (ticks) =>
          ticks
            .setDateOrigin(new Date(getBaseDate()))
            // .setGreatTickStyle((great) => {
            //   return great.setLabelAlignment(0).setTickStyle(emptyLine);
            // })
            .setMajorTickStyle((major) =>
              major.setGridStrokeStyle(emptyLine).setTickStyle(emptyLine)
            )
            .setMinorTickStyle((minor) =>
              minor.setGridStrokeStyle(emptyLine).setTickStyle(emptyLine)
            )
      );
    }

    syncXAxesZoom() {
      this.axisSyncHandle && this.axisSyncHandle.remove();
      this.axisSyncHandle = synchronizeAxisIntervals(
        ...this.graphs.map((ch) => ch.xAxis)
      );
    }

    resetView() {
      const { mainGraph, minX, maxX } = this;
      mainGraph.xAxis.setInterval(minX, maxX, false, true);
    }

    toggleGrid(shouldShowGrids) {
      this.graphs.forEach((graph) => {
        const tickStrategy = graph.yAxis.getTickStrategy();
        graph.yAxis.setTickStrategy(tickStrategy, (tickStrategy) =>
          tickStrategy.setMajorTickStyle((major) =>
            major.setGridStrokeStyle(
              shouldShowGrids
                ? LightningChartDashboard.visibleGridStyle
                : LightningChartDashboard.hiddenGridStyle
            )
          )
        );
      });
    }

    toggleChannelVisibility(channelIndex) {
      const graph = this.graphs[channelIndex];
      const isHidden = channels[channelIndex].isHidden;

      if (isHidden) {
        graph.series.dispose();
        graph.yAxis.dispose();
      } else {
        graph.series.restore();
        graph.yAxis.restore();
      }

      this.updateDashboardRowHeights();
    }
  };
export default lightningChartDashboardMixin;
