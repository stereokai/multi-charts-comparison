import * as echarts from "echarts";
import { on as onEvent } from "./echartsEvents.js";

let chart;

export function init() {
  chart = echarts.init(document.querySelector("#chart"));
}

export function on(...args) {
  onEvent(chart, ...args);
}
