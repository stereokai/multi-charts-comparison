import { renderer } from "@/router.js";
export { renderer };

const chart = await import(`@/renderers/${renderer}/${renderer}.js`);

export function on(...args) {
  chart.on(...args);
}

export function initGraph() {
  chart.init();
}
