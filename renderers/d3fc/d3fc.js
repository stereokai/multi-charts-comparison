import { graphEventsFactory } from "@/Graphs/graphEvents.js";
import * as d3 from "d3";
import * as fc from "d3fc";

export const graphEvents = graphEventsFactory();
export function on(...args) {
  graphEvents.on(...args);
}

export function init(container) {}

export function update(dataset, timeSeries) {}

export function buildModel(incomingDataset, timeSeries) {}

export function showLoading() {}
export function hideLoading() {}

const data = fc.randomFinancial()(100);

const xScale = d3
  .scaleTime()
  .domain(fc.extentDate().accessors([(d) => d.date])(data));

const yScale = d3
  .scaleLinear()
  .domain(fc.extentLinear().accessors([(d) => d.high, (d) => d.low])(data));

const candlestick = fc.seriesWebglCandlestick();

const gridline = fc.annotationCanvasGridline();

const lowLine = fc
  .seriesSvgLine()
  .crossValue((d) => d.date)
  .mainValue((d) => d.low);

const chart = fc
  .chartCartesian(xScale, yScale)
  .webglPlotArea(candlestick)
  .canvasPlotArea(gridline)
  .svgPlotArea(lowLine);

d3.select("#chart").datum(data).call(chart);
fc.seriesWebglMulti;
