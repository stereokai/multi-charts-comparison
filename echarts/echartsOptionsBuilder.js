const xAxisConfig = {
  type: "time",
  boundaryGap: false,
  axisLine: { onZero: true },
};
function getXAxis(gridIndex) {
  return {
    gridIndex,
    position: "top",
    show: !gridIndex, // only show first
    ...xAxisConfig,
  };
}

const yAxisConfig = {
  offset: 35,
  type: "value",
  realtimeSort: false,
  boundaryGap: false,
  splitNumber: 0,
  nameRotate: 0,
  nameLocation: "middle",
  nameGap: 0,
  axisLabel: {
    interval: 0,
    showMinLabel: true,
    showMaxLabel: true,
    margin: -25,
    fontSize: 8,
  },
};
function getYAxis(gridIndex, name, options) {
  return {
    gridIndex,
    name,
    ...options,
    ...yAxisConfig,
  };
}

const dataZoomConfig = { realtime: true, start: 0, end: 100 };
function getDataZoomConfig(channels, options) {
  return {
    ...dataZoomConfig,
    ...options,
    xAxisIndex: Object.keys(channels),
  };
}

const gridConfig = {
  left: 130,
  right: 20,
};
function getGridConfig(channels) {
  return channels.map((channel, i) => ({
    ...gridConfig,
    top: 10 + (i * 90) / channels.length + "%",
    height: 70 / channels.length + "%",
  }));
}

const seriesConfig = {
  type: "line",
  symbol: "none",
  sampling: "lttb",
  lineStyle: {
    width: 1,
  },
  // itemStyle: {
  //   color: "rgb(255, 70, 131)",
  // },
  // areaStyle: {
  //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  //     {
  //       offset: 0,
  //       color: "rgb(255, 158, 68)",
  //     },
  //     {
  //       offset: 1,
  //       color: "rgb(255, 70, 131)",
  //     },
  //   ]),
  // }
};
function getSeriesConfig(channel, index) {
  return {
    ...seriesConfig,
    encode: {
      x: "timestamp",
      y: `channel_${index}`,
    },
    xAxisIndex: index,
    yAxisIndex: index,
  };
}

export function buildEchartsOptions(channels, dataset) {
  const options = {
    xAxis: channels.map((channel, i) => getXAxis(i)),
    yAxis: channels.map((channel, i) =>
      getYAxis(i, channel.name, {
        min: channel.min,
        max: channel.max,
        inverse: channel.inverse,
      })
    ),
    dataZoom: [
      getDataZoomConfig(channels, { type: "inside" }),
      getDataZoomConfig(channels, { type: "slider", top: "top" }),
    ],
    grid: getGridConfig(channels),
    series: channels.map((channel, i) => getSeriesConfig(channel, i)),
  };

  if (dataset) {
    options.dataset = {
      source: dataset,
    };
  }

  return options;
}
