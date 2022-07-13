import { dataOperation } from "@/dataGenerator/AsyncDataGenerator.js";
import { getBaseDate } from "@/Graphs/graphCommon";
import { app, channels, getChannelYAxisBounds } from "@/models/state.js";
import {
  AxisTickStrategies,
  ColorCSS,
  ColorHEX,
  emptyLine,
  lightningChart,
  SolidFill,
  SolidLine,
  synchronizeAxisIntervals,
  Themes,
  UIDraggingModes,
  UIVisibilityModes,
} from "@arction/lcjs";
import MicroModal from "micromodal";
MicroModal.init();

import * as areaZoom from "./AreaZoom";

const lightningChartDashboardMixin = (Base) =>
  class LightningChartDashboard extends Base {
    static visibleGridStyle = new SolidLine({
      thickness: 1,
      fillStyle: new SolidFill({ color: ColorCSS("#dfdfdf") }),
    });

    static hiddenGridStyle = emptyLine;

    static getNewDashboard(container, numberOfRows) {
      return (
        lightningChart({
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
          // .setSplitterStyle(emptyLine)
          .setSplitterStyle(
            new SolidLine({
              thickness: 2,
              fillStyle: new SolidFill({ color: ColorCSS("black") }),
            })
          )
          .setSplitterStyleHighlight(
            new SolidLine({
              thickness: 2,
              fillStyle: new SolidFill({ color: ColorCSS("black") }),
            })
          )
      );
    }

    get maxVisibleCharts() {
      return super.maxVisibleCharts * 2 + 1; // max channels + pin option per channel + 1 channel group
    }

    get mainGraph() {
      return this.graphGroup || super.mainGraph;
    }

    get dashboardLeftOffset() {
      return this.CHART_LEFT_PADDING + this.Y_AXIS_WIDTH;
    }

    constructor(...args) {
      super(...args);
      this.pinnedGraphs = [];
      this.markers = [];
    }

    newDashboard(container, numberOfRows = this.maxVisibleCharts) {
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

      if (mainGraph.isGroup) {
        visibleGraphs.push(mainGraph.graphIndex);
      }

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
      const axes = this.graphs.map((ch) => ch.xAxis);
      if (this.mainGraph.isGroup) {
        axes.push(this.mainGraph.xAxis);
      }

      this.axisSyncHandle = synchronizeAxisIntervals(...axes);
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
        this.toggleZoomBasedData({
          start: channelIndex,
          end: channelIndex + 1,
        });
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

    addGraphGroup() {
      const graphIndex = Math.floor(this.maxVisibleCharts / 2);
      const graphGroup = this.addChannel(
        { name: "Channel Group" },
        graphIndex,
        null,
        true
      );
      this.graphGroup = graphGroup;

      graphGroup.isGroup = true;
      graphGroup.graphIndex = graphIndex;
      graphGroup.series = {};

      graphGroup.repositionYAxis = function repositionYAxis() {
        const { yAxis } = this;
        yAxis.setInterval(
          ...Object.values(this.series).reduce(
            (minmax, series) => {
              minmax[0] = Math.min(minmax[0], series.__bounds.min);
              minmax[1] = Math.max(minmax[1], series.__bounds.max);
              return minmax;
            },
            [Infinity, -Infinity]
          ),
          false,
          true
        );
      }.bind(graphGroup);
    }

    toggleChannelGrouped(channelIndex, dontRender = false) {
      const channel = channels[channelIndex];
      if (channel.isGrouped) {
        if (!this.mainGraph.isGroup) {
          this.addGraphGroup();
        }

        const { graphs, mainGraph } = this;
        const graph = graphs[channelIndex];

        const series = this.addLineSeries(mainGraph.chart, channelIndex);
        series.__bounds = getChannelYAxisBounds(channel);
        mainGraph.series[channelIndex] = series;

        mainGraph.repositionYAxis();

        series.add(graph.series.kc[0].La);
      } else {
        if (!this.mainGraph.isGroup) {
          return;
        }

        const { mainGraph } = this;
        const series = mainGraph.series[channelIndex];

        if (!series) {
          return;
        }

        series.dispose();
        mainGraph.series[channelIndex] = null;
        delete mainGraph.series[channelIndex];

        if (Object.keys(mainGraph.series).length === 0) {
          mainGraph.chart.dispose();
          for (let key in mainGraph) {
            mainGraph[key] = null;
          }

          this.graphGroup = null;
        } else {
          mainGraph.repositionYAxis();
        }
      }

      if (!dontRender) {
        this.setXAxisStyle();
        this.syncXAxesZoom();
        requestAnimationFrame(() => {
          this.updateDashboardRowHeights();
        });
      }
    }

    newMontage() {
      return channels.map((channel, i) => {
        return {
          channelIndex: i,
          isHidden: channel.isHidden,
          isSticky: channel.isSticky,
          isGrouped: channel.isGrouped,
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

      if (this.mainGraph.isGroup) {
        this.graphGroup.chart.dispose();
        for (let key in this.mainGraph) {
          this.mainGraph[key] = null;
        }
        this.graphGroup = null;
      }

      montage.forEach((channel, channelIndex) => {
        channels[channelIndex].isHidden = channel.isHidden;
        channels[channelIndex].isSticky = channel.isSticky;
        channels[channelIndex].isGrouped = channel.isGrouped;

        this.toggleChannelVisibility(channelIndex, true);
        this.toggleChannelSticky(channelIndex, true, channel.pinnedGraphIndex);
        this.toggleChannelGrouped(channelIndex);
      });

      this.updateDashboardRowHeights();
    }

    panLeft() {
      const { xAxis, series } = this.mainGraph;
      const { minX } = this;
      const { start, end } = xAxis.getInterval();
      const pixelSizeX = series.scale.x.getPixelSize();
      let distance = (start - end) / 4;

      if (start + distance < minX) {
        distance = minX - start;
      }

      xAxis.pan(distance / pixelSizeX);
    }

    panRight() {
      const { xAxis, series } = this.mainGraph;
      const { maxX } = this;
      const { start, end } = xAxis.getInterval();
      const pixelSizeX = series.scale.x.getPixelSize();
      let distance = (end - start) / 4;

      if (end + distance > maxX) {
        distance = maxX - end;
      }

      xAxis.pan(distance / pixelSizeX);
    }

    addEvent(point, channelIndex) {
      if (!app.extraFeatures.events) {
        return;
      }

      const graph = this.graphs[channelIndex];
      const { chart, series } = graph;

      const chartMarker = chart
        .addChartMarkerXY(
          // // UICircle,
          // MarkerBuilders.XY.addStyler((styler) => {})
          //   .setPointMarker(PointMarkers.UICircle)
          //   .addStyler((styler1) => {}),
          undefined,
          chart.getDefaultAxisX(),
          chart.getDefaultAxisY()
        )
        .setPosition({ x: point.x, y: point.y });

      this.markers.push(chartMarker);

      const pointMarker = chartMarker
        .getPointMarker()
        // .setSize({ width: 10, height: 10 })
        .setFillStyle(
          new SolidFill({
            color: ColorHEX("#0075ff"),
          })
        );

      pointMarker.onMouseClick(() => {
        this.markers.forEach((chartMarker) => {
          chartMarker.setResultTableVisibility(UIVisibilityModes.never);
        });
        chartMarker.setResultTableVisibility(UIVisibilityModes.always);
      });

      const rT = chartMarker.getResultTable();
      rT.onMouseClick(() => {
        MicroModal.show("modal-1", {
          onShow: (modal, activeEl, event) => {
            modal.querySelector("textarea").value =
              chartMarker.__content.reduce((all, line) => {
                return all + line.join(" ") + "\n";
              }, "");
          },
          onClose: (modal, activeEl, event) => {
            if (event.target.hasAttribute("ok")) {
              chartMarker.__content = modal
                .querySelector("textarea")
                .value.trim()
                .split("\n")
                .map((part) => [part]);
              chartMarker.setResultTable((table) =>
                table.setContent(chartMarker.__content)
              );
              return;
            }

            if (event.target.hasAttribute("remove")) {
              chartMarker.setResultTableVisibility(UIVisibilityModes.never);
              chartMarker.dispose();
              this.markers.splice(this.markers.indexOf(chartMarker), 1);
              return;
            }
          },
        });
      });

      chartMarker.__content = [
        ["Custom event"],
        ["Number", this.markers.length.toString()],
      ];

      // Style ChartMarker.
      chartMarker
        .setResultTableVisibility(UIVisibilityModes.never)
        .setResultTable((table) => table.setContent(chartMarker.__content))
        .setDraggingMode(UIDraggingModes.notDraggable)
        .setGridStrokeXVisibility(UIVisibilityModes.whenDragged)
        .setGridStrokeYVisibility(UIVisibilityModes.whenDragged)
        .setTickMarkerXVisibility(UIVisibilityModes.whenDragged)
        .setTickMarkerYVisibility(UIVisibilityModes.whenDragged);
    }

    toggleZoomBasedData(subset) {
      const graphs = subset
        ? this.graphs.slice(subset.start, subset.end)
        : this.graphs;

      if (app.extraFeatures.toggleZoomBasedData) {
        dataOperation((queueTask) => {
          graphs.forEach((graph, i) => {
            if (channels[i] && channels[i].isHidden) {
              return;
            }

            graph.fullData = [];
            for (let i = 0; i < graph.series.kc[0].La.length; i++) {
              graph.fullData[i] = graph.series.kc[0].La[i].y;
            }

            graph.fullBoundaries = graph.series.getBoundaries();
            graph.fullInterval = graph.yAxis.getInterval();

            queueTask({
              name: "limitArray",
              data: {
                dataMin: graph.fullBoundaries.min.y,
                dataMax: graph.fullBoundaries.max.y,
                channelData: graph.fullData,
                limitFactor: 0.2,
              },
            });
          });
        }).then((dataset) => {
          let hiddenChannels = 0;
          dataset.forEach((channelData, i) => {
            if (channels[i] && channels[i].isHidden) {
              hiddenChannels++;
            }

            const graph = this.graphs[i + hiddenChannels];
            graph.limitedData = channelData.data;
            graph.limitedDataMin = channelData.dataMin;
            graph.limitedDataMax = channelData.dataMax;
          });

          const initialInterval = this.mainGraph.xAxis.getInterval();
          this.zoomBasedDataHandler.call(
            this,
            initialInterval.start,
            initialInterval.end
          );

          this.zoomBasedDataCB = this.graphs[0].xAxis.onScaleChange(
            this.zoomBasedDataHandler.bind(this)
          );
        });
      } else {
        this.graphs[0].yAxis.offScaleChange(this.zoomBasedDataCB);
        this.zoomBasedDataHandler(0, 0);
        graphs.forEach((graph) => {
          graph.fullData = null;
          graph.fullBoundaries = null;
          graph.fullInterval = null;
          graph.limitedData = null;
          graph.limitedDataMin = null;
          graph.limitedDataMax = null;
        });
      }
    }

    zoomBasedDataHandler(start, end) {
      if (
        !this.isShowingLimitedZoomBasedData &&
        Math.abs(end - start) > this.maxX / 3
      ) {
        const label = document.querySelector("#label-zoom-based-data");
        label.classList.add("highlight-flash");
        setTimeout(() => {
          label.classList.remove("highlight-flash");
        }, 1000);

        this.isShowingLimitedZoomBasedData = true;
        this.graphs.forEach((graph, i) => {
          if (channels[i] && channels[i].isHidden) return;
          graph.series.clear();
          graph.series.addArraysXY(this.timeSeries, graph.limitedData);
          graph.yAxis.setInterval(graph.limitedDataMin, graph.limitedDataMax);
          graph.yAxis.setMouseInteractions(false);
          graph.yAxis.setChartInteractions(false);
        });
        // this.syncXAxesZoom(false);
      } else if (
        this.isShowingLimitedZoomBasedData &&
        Math.abs(end - start) <= this.maxX / 3
      ) {
        const label = document.querySelector("#label-zoom-based-data");
        label.classList.add("highlight-flash");
        setTimeout(() => {
          label.classList.remove("highlight-flash");
        }, 1000);

        this.isShowingLimitedZoomBasedData = false;
        this.graphs.forEach((graph, i) => {
          if (channels[i] && channels[i].isHidden) return;
          graph.series.clear();
          graph.series.addArraysXY(this.timeSeries, graph.fullData);

          graph.yAxis.setInterval(
            graph.fullInterval.start,
            graph.fullInterval.end
          );
          graph.yAxis.setMouseInteractions(false);
          graph.yAxis.setChartInteractions(false);
        });
      }
    }

    afterUpdate() {
      requestAnimationFrame(() => {
        this.toggleZoomBasedData();
      });
      if (super.afterUpdate) {
        super.afterUpdate();
      }
    }
  };

export default lightningChartDashboardMixin;

// export function getLimitedChannelData(channelDataGetter) {
//   return dataOperation((queueTask) => {
//     channels.forEach((channel, i) =>
//       queueTask(getLimitArrayTaskConfig(channel, channelDataGetter(i), 0.2))
//     );
//   });
// }
