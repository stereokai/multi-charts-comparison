const code = `import { channels } from "@/models/state.js";
import { throttle } from "@/utils.js";
import * as echarts from "echarts";
import { defaults } from "./echartsDefaults";
import { ECHARTS_EVENT_HANDLERS, graphEvents, on } from "./echartsEvents.js";
import { buildEchartsOptions } from "./echartsOptionsBuilder.js";

tom(() => {})

const x = () => {};
let chart;

export { graphEvents, on } from "./echartsEvents.js";

let hasInitialized = false;

tom(function () {

})

function tom () {

}

export function init(container) {
  graphEvents.onBeforeDataUpdate();
  chart = echarts.init(container);

  Object.entries(ECHARTS_EVENT_HANDLERS).forEach(([event, handler]) => {
    on(chart, event, handler);
  });

  window.addEventListener(
    "resize",
    throttle(() => {
      chart.resize();
    }, 150)
  );
}

export function update(dataset, timeSeries) {
  if (hasInitialized) {
    graphEvents.onBeforeDataUpdate();
  } else {
    hasInitialized = true;
  }

  if (dataset) {
    dataset = buildModel(dataset, timeSeries);
  }

  const settings = buildEchartsOptions(channels, dataset);
  chart.setOption(Object.assign(defaults, settings), {
    replaceMerge: ["series", "yAxis", "xAxis", "grid"],
  });
}

export function buildModel(incomingDataset, timeSeries) {
  const outgoingDataset = {};

  for (let i = 0; i < incomingDataset.length; i++) {
    const channelIndex = channels.length - incomingDataset.length + i;
    const channel = incomingDataset[i];

    outgoingDataset[\`channel_\${channelIndex}\`] = channel.data;
  }

  if (incomingDataset.length === channels.length) {
    outgoingDataset.timestamp = timeSeries;
  }

  return outgoingDataset;
}

export function showLoading() {
  chart.showLoading();
}
export function hideLoading() {
  chart.hideLoading();
}


`;

import * as recast from "recast";

const res = recast.print(
  recast.visit(recast.parse(code), {
    visitFunction: function (path) {
      let name, type, start;

      if (path.value.loc) {
        start = path.value.loc.start.line;
      } else if (path.parentPath.value.type === "ExportNamedDeclaration") {
        start = path.parentPath.value.loc.start.line;
      }

      if (path.value.id && path.value.id.type === "Identifier") {
        name = path.value.id.name;
      }

      type = path.value.type;

      path.value.body.body.unshift(getConsoleLog(name, type, start));
      this.traverse(path);
    },
  }),
  {
    sourceMapName: "source-map",
  }
);

debugger;

function getConsoleLog(name, type, start) {
  const b = recast.types.builders;
  const CONSOLE = "console",
    LOG = "log";

  return b.expressionStatement(
    b.callExpression(
      b.memberExpression(b.identifier(CONSOLE), b.identifier(LOG), false),
      [
        b.literal(
          `Executing ${type}${name ? ` ${name}` : ""}${
            start ? ` at line ${start}` : ""
          }`
        ),
      ]
    )
  );
}

// console.log(count);

// path.value.type === "ArrowFunctionExpression";

// path.value.type === "FunctionExpression" && path.value.id === null;
// path.value.loc.start.line;

// path.value.type === "FunctionDeclaration" &&
//   path.value.id.type === "Identifier";
// path.value.loc.start.line;

// path.value.type === "FunctionDeclaration" && path.value.loc === null;
// path.parentPath.value.type === "ExportNamedDeclaration";
// path.parentPath.value.loc.start.line;

// path.value.id.type === "Identifier";
// path.value.id.name;
