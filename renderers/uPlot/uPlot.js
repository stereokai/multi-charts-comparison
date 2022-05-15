import GRAPH_EVENTS, { graphEventsFactory } from "@/Graphs/graphEvents.js";
import { channels } from "@/models/state.js";
import { debounce } from "@/utils.js";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

let container,
  uplots = [],
  uPlotSync;
let isZooming = false;
let zoomStart;
let lastEvent = null;
let hasInitialized = false;

function wheelZoomPlugin(opts) {
  let factor = opts.factor || 0.75;

  let xMin, xMax, yMin, yMax, xRange, yRange;

  function clamp(nRange, nMin, nMax, fRange, fMin, fMax) {
    if (nRange > fRange) {
      nMin = fMin;
      nMax = fMax;
    } else if (nMin < fMin) {
      nMin = fMin;
      nMax = fMin + nRange;
    } else if (nMax > fMax) {
      nMax = fMax;
      nMin = fMax - nRange;
    }

    return [nMin, nMax];
  }

  return {
    hooks: {
      ready: (u) => {
        xMin = u.scales.x.min;
        xMax = u.scales.x.max;
        yMin = u.scales.y.min;
        yMax = u.scales.y.max;

        xRange = xMax - xMin;
        yRange = yMax - yMin;

        let over = u.over;
        let rect = over.getBoundingClientRect();

        // wheel drag pan
        over.addEventListener("mousedown", (e) => {
          if (e.button == 1) {
            //	plot.style.cursor = "move";
            e.preventDefault();

            let left0 = e.clientX;
            //	let top0 = e.clientY;

            let scXMin0 = u.scales.x.min;
            let scXMax0 = u.scales.x.max;

            let xUnitsPerPx = u.posToVal(1, "x") - u.posToVal(0, "x");

            function onmove(e) {
              e.preventDefault();

              let left1 = e.clientX;
              //	let top1 = e.clientY;

              let dx = xUnitsPerPx * (left1 - left0);

              u.setScale("x", {
                min: scXMin0 - dx,
                max: scXMax0 - dx,
              });
            }

            function onup(e) {
              document.removeEventListener("mousemove", onmove);
              document.removeEventListener("mouseup", onup);
            }

            document.addEventListener("mousemove", onmove);
            document.addEventListener("mouseup", onup);
          }
        });

        // wheel scroll zoom
        over.addEventListener("wheel", (e) => {
          e.preventDefault();

          if (!isZooming) {
            isZooming = true;
            zoomStart = performance.now();
          }
          let { left, top } = u.cursor;

          let leftPct = left / rect.width;
          let btmPct = 1 - top / rect.height;
          let xVal = u.posToVal(left, "x");
          let yVal = u.posToVal(top, "y");
          let oxRange = u.scales.x.max - u.scales.x.min;
          let oyRange = u.scales.y.max - u.scales.y.min;

          let nxRange = e.deltaY < 0 ? oxRange * factor : oxRange / factor;
          let nxMin = xVal - leftPct * nxRange;
          let nxMax = nxMin + nxRange;
          [nxMin, nxMax] = clamp(nxRange, nxMin, nxMax, xRange, xMin, xMax);

          // let nyRange = e.deltaY < 0 ? oyRange * factor : oyRange / factor;
          // let nyMin = yVal - btmPct * nyRange;
          // let nyMax = nyMin + nyRange;
          // [nyMin, nyMax] = clamp(nyRange, nyMin, nyMax, yRange, yMin, yMax);

          uplots.forEach((u) => {
            u.batch(() => {
              u.setScale("x", {
                min: nxMin,
                max: nxMax,
              });

              // u.setScale("y", {
              //   min: nyMin,
              //   max: nyMax,
              // });

              requestAnimationFrame(reportZoom);
            });
          });
        });
      },
    },
  };
}

const reportZoom = debounce(() => {
  scrollStopped();
  graphEvents.zoomPan({
    duration: (performance.now() - zoomStart) / 1000,
    type: GRAPH_EVENTS.zoomPan,
  });
  zoomStart = performance.now();
}, 20);
const scrollStopped = debounce(() => {
  isZooming = false;
}, 500);

const matchSyncKeys = (own, ext) => own == ext;

export const graphEvents = graphEventsFactory();
export function on(...args) {
  graphEvents.on(...args);
}

export function init(_container) {
  lastEvent = {
    timestamp: performance.now(),
  };

  container = _container;
  uPlotSync = uPlot.sync("key");
  // uplots = channels.map(addChannel);
}

function addChannel(channel, timeSeries) {
  const uplot = new uPlot(
    {
      width: container.clientWidth,
      height: container.clientHeight / channels.length,
      plugins: [wheelZoomPlugin({ factor: 0.75 })],
      // focus: {
      //   alpha: 0.3,
      // },
      ms: 1,
      // axes: [
      //   {},
      //   {
      //     show: false,
      //   },
      // ],
      scales: {
        y: {
          auto: false,
          range: [channel.min, channel.max],
        },
      },
      series: [
        {},
        {
          stroke: "red",
        },
      ],
      hooks: {
        draw: [() => !isZooming && requestAnimationFrame(reportRenderEvent)],
        // setScale: [() => console.log("setScale")],
      },
      // cursor: {
      //   show: true,
      //   x: true,
      //   y: true,
      // },
      axes: [
        { show: false },
        // {
        //   show: false,
        // },
      ],
      legend: {
        show: false,
      },
      cursor: {
        drag: { x: true, y: false },
        sync: {
          key: 0,
        },
      },
      // cursor: {
      //   show: true,
      //   lock: true,
      //   // focus: {
      //   //   prox: 16,
      //   // },
      //   sync: {
      //     key: uPlotSync.key,
      //     setSeries: true,
      //     match: [matchSyncKeys, matchSyncKeys],
      //     // filters: {
      //     //   pub: upDownFilter,
      //     // }
      //   },
      // },
    },
    [timeSeries, channel.data],
    container
  );

  //
  uPlotSync.sub(uplot);
  return uplot;
}

export function update(dataset = [], timeSeries) {
  if (hasInitialized) {
    lastEvent = {
      timestamp: performance.now(),
    };
  }

  const totalChannels = uplots.length;
  dataset.forEach((channel, i) => {
    let uplot = uplots[i];
    let channelIndex = i;

    if (channels.length !== totalChannels) {
      channelIndex = totalChannels + i;
      uplots.push(addChannel(channel, timeSeries));
      uplot = uplots[channelIndex];
    }

    uplot.batch(() => {
      uplot.setData([timeSeries, channel.data]);
      uplot.setScale("y", {
        min: channel.min,
        max: channel.max,
      });
    });
    // uplot.redraw();
  });

  uplots
    .splice(channels.length, uplots.length - channels.length)
    .forEach((uplot) => {
      uPlotSync.unsub(uplot);
      uplot.destroy();
    });
}

export function showLoading() {}
export function hideLoading() {}

const reportRenderEvent = debounce(() => {
  if (isZooming || !lastEvent) {
    return;
  }
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
  // });
}, 100);
window.reportRenderEvent = reportRenderEvent;
