import { apiProxi } from "@/utils.js";
import lightningChartChannelsMixin from "./lightningChartChannelsMixin.js";
import lightningChartDashboardMixin from "./lightningChartDashboardMixin.js";
import lightningChartEventsMixin from "./lightningChartEventsMixin.js";
import LightningChartImpl from "./lightningChartImpl.js";
class LightningChart extends lightningChartDashboardMixin(
  lightningChartChannelsMixin(lightningChartEventsMixin(LightningChartImpl))
) {}

const lightningChart = new LightningChart();

export const baseDate = 0;
export const graphEvents = lightningChart.graphEvents;

export function init(...args) {
  lightningChart.init(...args);
}

export function update(...args) {
  lightningChart.update(...args);
}

export function showLoading() {}
export function hideLoading() {}

export const api = new Proxy(lightningChart, apiProxi);
