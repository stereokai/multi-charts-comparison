import { getBaseDate } from "@/Graphs/graphCommon";
import GRAPH_EVENTS, { graphEventsFactory } from "@/Graphs/graphEvents.js";
import { channels } from "@/models/state.js";
import { default as app } from "@/models/ui.js";
import {
  AxisTickStrategies,
  ColorCSS,
  ColorHEX,
  emptyLine,
  FontSettings,
  lightningChart,
  SolidFill,
  synchronizeAxisIntervals,
  Themes,
} from "@arction/lcjs";

let graphs = [],
  dashboard;
let minX, maxX;
let axisSyncHandle;
export const baseDate = 0;
const getBottomGraph = () => {
  return graphs[graphs.length - 1];
};

// For events
let lastEvent = null;
let hasInitialized = false;
export const graphEvents = graphEventsFactory();
export function on(...args) {
  graphEvents.on(...args);
}

const updateDashboardRowHeights = () => {
  const axisHeight = getBottomGraph().xAxis.getHeight();
  const rowHeight =
    (dashboard.engine.container.clientHeight - axisHeight) / graphs.length;
  for (let row = 0; row < app.channels.max; row++) {
    if (row < graphs.length) {
      dashboard.setRowHeight(row, Math.round(rowHeight));
    } else {
      dashboard.setRowHeight(row, 0.00001);
    }
  }

  dashboard.setRowHeight(
    getBottomGraph().row,
    Math.round(rowHeight + axisHeight)
  );
};

export function init(container) {
  lastEvent = {
    timestamp: performance.now(),
  };

  dashboard = lightningChart({
    overrideInteractionMouseButtons: {
      chartXYPanMouseButton: 0, // LMB
      chartXYRectangleZoomFitMouseButton: 2, // RMB
    },
  })
    .Dashboard({
      container,
      numberOfColumns: 1,
      numberOfRows: app.channels.max,
      theme: Themes.lightNew,
    })
    .setBackgroundFillStyle(
      new SolidFill({
        color: ColorCSS("white"),
      })
    )
    .setSplitterStyle(emptyLine)
    .setSplitterStyleHighlight(emptyLine);

  graphs = channels.map((channel, i) => {
    return addChannel(dashboard, channel, i);
  });

  registerZoomEvents(container);
}

export function update(dataset = [], timeSeries) {
  if (hasInitialized) {
    lastEvent = {
      timestamp: performance.now(),
    };
  }

  const currGraphsLength = graphs.length;

  dataset.forEach((channelData, i) => {
    let graph = graphs[i];
    let channelIndex = i;

    // Add new channels
    if (channels.length !== currGraphsLength) {
      channelIndex = currGraphsLength + i;
      graphs.push(addChannel(dashboard, channels[channelIndex], channelIndex));
      graph = graphs[channelIndex];
    }

    // Update existing channels
    graph.series.clear();
    graph.series.addArraysXY(timeSeries, channelData.data);
    channels[channelIndex].min = channelData.min;
    channels[channelIndex].max = channelData.max;
  });

  // Remove channels outside of dataset
  graphs
    .splice(channels.length, graphs.length - channels.length)
    .forEach((graph) => {
      graph.chart.dispose();
      for (let key in graph) {
        graph[key] = null;
      }
    });

  if (timeSeries) updateTimeSeries(timeSeries);
  // Synchronize zoom and scroll on all channels
  axisSyncHandle && axisSyncHandle.remove();
  axisSyncHandle = synchronizeAxisIntervals(...graphs.map((ch) => ch.xAxis));
  getBottomGraph().xAxis.setInterval(minX, maxX, false, true);
  requestAnimationFrame(updateDashboardRowHeights);

  reportRenderEvent();

  window.dashboard = dashboard;
  window.graphs = graphs;
}

function updateTimeSeries(timeSeries) {
  graphs.forEach((graph, i) => {
    graph.xAxis.setTickStrategy(AxisTickStrategies.Empty);
  });
  getBottomGraph().xAxis.setTickStrategy(AxisTickStrategies.DateTime, (ticks) =>
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

  if (timeSeries) {
    minX = timeSeries[0];
    maxX = timeSeries[timeSeries.length - 1];
  }
}

function addChannel(dashboard, channel, channelIndex) {
  const chart = dashboard
    .createChartXY({
      columnIndex: 0,
      rowIndex: channelIndex,
      columnSpan: 1,
      rowSpan: 1,
      disableAnimations: true,
    })
    .setTitle("")
    .setPadding({ left: 100, top: 0, bottom: 0 })
    .setBackgroundStrokeStyle(emptyLine)
    .setMouseInteractionWheelZoom(false)
    .setSeriesBackgroundFillStyle(
      new SolidFill({
        color: ColorCSS("white"),
      })
    );

  const xAxis = chart
    .getDefaultAxisX()
    .setTickStrategy(AxisTickStrategies.Empty, (styler) => console.log(styler))
    .setStrokeStyle(emptyLine);

  const yAxis = chart
    .getDefaultAxisY()
    .setMouseInteractions(false)
    .setChartInteractions(false)
    .setStrokeStyle(emptyLine)
    .setTitle(channel.name)
    .setTitleFont(new FontSettings({ size: 12 }))
    .setTitleFillStyle(new SolidFill({ color: ColorHEX("#6e7079") }))
    .setTitleRotation(0)
    .setThickness(60)
    .setAnimationZoom(undefined)
    .setTickStrategy(AxisTickStrategies.Numeric, (tickStrategy) =>
      tickStrategy
        .setMajorTickStyle((visibleTicks) => {
          return visibleTicks
            .setLabelFillStyle(new SolidFill({ color: ColorHEX("#6e7079") }))
            .setLabelFont(new FontSettings({ size: 6 }))
            .setTickStyle(emptyLine);
        })
        .setMinorTickStyle((visibleTicks) =>
          visibleTicks
            .setLabelFont(new FontSettings({ size: 6 }))
            .setTickStyle(emptyLine)
        )
    );

  const series = chart
    .addLineSeries({
      dataPattern: {
        pattern: "ProgressiveX",
        regularProgressiveStep: true,
        allowDataGrouping: true,
      },
      automaticColorIndex: channelIndex,
    })
    .setStrokeStyle((solidLine) => solidLine.setThickness(-1));

  return { chart, series, xAxis, yAxis, row: channelIndex };
}

function registerZoomEvents(container) {
  // graphs[0].xAxis.onScaleChange((start, end) => {
  //   // Prevent zomming out more than full graph width
  //   if (start < minX || end > maxX) {
  //     requestAnimationFrame(() => {
  //       graphs.forEach((graph) =>
  //         graph.chart.setMouseInteractionWheelZoom(false)
  //       );
  //       getBottomGraph().xAxis.setInterval(minX, maxX, false, true);
  //       setTimeout(() => {
  //         graphs.forEach((graph) =>
  //           graph.chart.setMouseInteractionWheelZoom(true)
  //         );
  //       }, 1000);
  //     });
  //   }

  graphs.forEach((graph) => {
    graph.chart.onSeriesBackgroundMouseWheel((_, event) => {
      const { deltaY } = event;
      const { xAxis, yAxis } = graph;
      const { start, end } = xAxis.getInterval();
      console.log(deltaY);
      xAxis.setInterval(
        start + deltaY * 10000,
        end - deltaY * 10000,
        false,
        true
      );
    });
    // Prevent Y axis zoom (Keep full scale of Y axis at all times)
    // graphs.forEach((graph, i) => {
    //   graph.yAxis.setInterval(channels[i].min, channels[i].max);
    // });
  });

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

function reportRenderEvent() {
  requestAnimationFrame(() => {
    const duration = (performance.now() - lastEvent.timestamp) / 1000;
    if (!hasInitialized) {
      hasInitialized = true;
      graphEvents.init({
        duration,
        type: GRAPH_EVENTS.init,
      });
    } else {
      graphEvents.render({
        duration,
        type: GRAPH_EVENTS.render,
      });
    }
    lastEvent = null;
  });
}

export function showLoading() {}
export function hideLoading() {}
