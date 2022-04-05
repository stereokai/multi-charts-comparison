export const defaults = {
  // tooltip: {
  //   trigger: "axis",
  //   position: function (pt) {
  //     return [pt[0], "10%"];
  //   },
  // },
  // title: {
  //   left: "center",
  //   text: "Large Area Chart",
  // },
  toolbox: {
    left: "left",
    top: 5,
    feature: {
      dataZoom: {
        yAxisIndex: "none",
      },
      restore: {},
      saveAsImage: {},
    },
  },
  axisPointer: {
    link: [
      {
        xAxisIndex: "all",
      },
    ],
  },
};
