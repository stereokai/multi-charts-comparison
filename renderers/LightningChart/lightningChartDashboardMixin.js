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

import * as areaZoom from "./AreaZoom";

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
      areaZoom.init(container);
    }

    updateDashboardRowHeights() {
      const { dashboard, graphs, pinnedGraphs, mainGraph, maxVisibleCharts } =
        this;

      const visibleGraphs = graphs
        .map((g, i) => i)
        .filter((i) => !channels[i].isHidden);

      const visiblePinnedGraphs = pinnedGraphs.map((g) => g.pinnedIndex);

      const allVisibleGraphs = visibleGraphs.concat(visiblePinnedGraphs);

      const axisHeight = mainGraph.xAxis.getHeight();
      const rowHeight =
        (dashboard.engine.container.clientHeight - axisHeight) /
        allVisibleGraphs.length;

      for (let row = 0; row < maxVisibleCharts; row++) {
        if (allVisibleGraphs.includes(row)) {
          dashboard.setRowHeight(row, Math.round(rowHeight));
        } else {
          dashboard.setRowHeight(row, 0.00001);
        }
      }

      dashboard.setRowHeight(mainGraph.row, Math.round(rowHeight + axisHeight));
      window.dashboard = dashboard;
      areaZoom.setHeight(visibleGraphs.length * rowHeight);
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

    toggleChannelVisibility(channelIndex, dontRender = false) {
      const graph = this.graphs[channelIndex];
      const isHidden = channels[channelIndex].isHidden;

      if (isHidden) {
        graph.series.dispose();
        graph.yAxis.dispose();
      } else {
        graph.series.restore();
        graph.yAxis.restore();
      }

      if (!dontRender) {
        this.updateDashboardRowHeights();
      }
    }

    toggleChannelSticky(
      channelIndex,
      dontRender = false,
      pinnedGraphIndex = NaN
    ) {
      const { pinnedGraphs, graphs } = this;

      const graph = graphs[channelIndex];
      const channel = channels[channelIndex];

      if (channel.isSticky) {
        const pinnedIndex = !isNaN(pinnedGraphIndex)
          ? pinnedGraphIndex
          : (pinnedGraphs.length &&
              pinnedGraphs[pinnedGraphs.length - 1].pinnedIndex - 1) ||
            this.maxVisibleCharts - 1;

        const pinnedGraph = this.addChannel(
          channel,
          pinnedIndex,
          channelIndex // Use same color as the channel
        );

        pinnedGraph.pinnedIndex = pinnedIndex;
        pinnedGraphs.push(pinnedGraph);
        pinnedGraph.series.add(graph.series.kc[0].La);
        channel.pinnedGraph = pinnedGraph;
      } else {
        if (!channel.pinnedGraph) {
          return;
        }

        const pinnedGraph = channel.pinnedGraph;
        channel.pinnedGraph = null;
        pinnedGraphs
          .splice(pinnedGraphs.indexOf(pinnedGraph), 1)
          .forEach((graph) => {
            graph.chart.dispose();
            for (let key in graph) {
              graph[key] = null;
            }
          });
      }

      if (!dontRender) {
        this.updateDashboardRowHeights();
      }
    }

    newMontage() {
      return channels.map((channel, i) => {
        return {
          channelIndex: i,
          isHidden: channel.isHidden,
          isSticky: channel.isSticky,
          pinnedGraphIndex:
            channel.pinnedGraph && channel.pinnedGraph.pinnedIndex,
        };
      });
    }

    loadMontage(montage) {
      this.pinnedGraphs.splice(0).forEach((graph) => {
        graph.chart.dispose();
        for (let key in graph) {
          graph[key] = null;
        }
      });

      montage.forEach((channel, channelIndex) => {
        channels[channelIndex].isHidden = channel.isHidden;
        channels[channelIndex].isSticky = channel.isSticky;

        this.toggleChannelVisibility(channelIndex, true);
        this.toggleChannelSticky(channelIndex, true, channel.pinnedGraphIndex);
      });

      this.updateDashboardRowHeights();
    }
  };
export default lightningChartDashboardMixin;
