export const options = {
  scrollZoom: true,
  responsive: true,
};

export const layout = {
  margin: {
    t: 50,
    b: 0,
    l: 50,
    r: 0,
  },
  grid: {
    // rows: channels.length,
    columns: 1,
  },
  xaxis: {
    rangeslider: {},
  },
  yaxis: {
    fixedrange: true,
    tickfont: {
      size: 8,
    },
  },
  showlegend: false,
  annotations: false,
};

export const trace = {
  type: "scattergl",
  mode: "lines",
  hoverinfo: "none",
  line: {
    shape: "spline",
    smoothing: 0,
    width: 1,
    simplify: false,
  },
};
