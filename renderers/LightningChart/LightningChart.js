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

const apiProxi = {
  get: (target, prop, receiver) => {
    if (target[prop] && typeof target[prop] === "function") {
      return target[prop];
    } else {
      throw new Error(`API doesn't exist: ${prop}`);
    }
  },
};
export const api = new Proxy(lightningChart, apiProxi);
