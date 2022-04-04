import * as echarts from "echarts";
import workerpool from "workerpool";
import {
  defaultChannels as channels,
  getRandomChannel,
} from "./channelsConfiguration.js";
import { defaults } from "./echartsDefaults";
import { buildEchartsOptions } from "./echartsOptionsBuilder.js";
import { throttle } from "./utils.js";

const workerPool = workerpool.pool(
  new URL("./dataGenerator/CompiledWorker.js", import.meta.url).href,
  {
    maxWorkers: workerpool.cpus - 2,
  }
);

let chart;
let prevSamplesPerChannel = 0;
let lastOperation = newOperationId();
const rejecters = {};
let onBeforeDataUpdate = () => {};

const workQueue = [];

function newOperationId() {
  return Date.now();
}

function queueTask(task, data) {
  workQueue.push(workerPool.exec(task, [data]));
}

function generateChannelData(channel, samples = prevSamplesPerChannel) {
  queueTask("generateDataSeries", {
    channel,
    samples,
  });
}

function clearQueue(operationId) {
  console.log("Terminating operation", operationId);
  rejecters[operationId] &&
    rejecters[operationId](`Operation ${operationId} terminated`);
  workerPool.terminate(true);
  workQueue.length = 0;
}

function newOperation(operationId) {
  clearQueue();
  lastOperation = operationId;
  return () => {
    return new Promise((resolve, reject) => {
      rejecters[operationId] = reject;
      Promise.all(workQueue).then((results) => resolve(results));
    });
  };
}

function dataOperation(queueWork) {
  const operationId = newOperationId();
  const onOperationEnd = newOperation(operationId);
  console.log(`Starting operation ${operationId}`);
  queueWork();

  return onOperationEnd().then((results) => {
    if (lastOperation === operationId) {
      console.log(`Operation ${operationId} ended with results`, results);
      return results;
    } else {
      console.log(`Operation ${operationId} ended but was terminated`, results);
      return Promise.reject(
        `Operation ${operationId} ended but was terminated`
      );
    }
  });
}
function updateEcharts() {
  onBeforeDataUpdate(channels);
  const settings = buildEchartsOptions(channels);
  chart.setOption(Object.assign(defaults, settings), true);
}

function regenerateAllChannels(samplesPerChannel = null) {
  return dataOperation(() => {
    for (let i = 0; i < channels.length; i++) {
      delete channels[i].data;
      generateChannelData(channels[i], samplesPerChannel);
    }
  });
}

function setDataToChannels(channels, data) {
  for (let i = 0; i < data.length; i++) {
    channels[channels.length - data.length + i].data = data[i];
  }
}

function onDataGenerated(dataOperation) {
  chart.showLoading();
  dataOperation
    .then((data) => {
      setDataToChannels(channels, data);
      updateEcharts();
    })
    .catch((err) => {
      console.log("Operation error", err);
    })
    .finally(() => {
      chart.hideLoading();
    });
}

export function initEcharts(samplesPerChannel) {
  prevSamplesPerChannel = samplesPerChannel;
  chart = echarts.init(document.querySelector("#chart"));

  window.addEventListener(
    "resize",
    throttle(() => {
      chart.resize();
    }, 150)
  );

  onDataGenerated(regenerateAllChannels(samplesPerChannel));
}

export function on(...args) {
  if (args[0] === "onBeforeDataUpdate") {
    onBeforeDataUpdate = args[1];
    return;
  }

  chart.on(...args);
}

function addChannels(numberOfChannelsToAdd, shouldGenerateData = true) {
  if (numberOfChannelsToAdd < 1) {
    throw new Error("Can't add 0 channels");
  }

  return dataOperation(() => {
    for (let i = 0; i < numberOfChannelsToAdd; i++) {
      const channelNumber = channels.length + i + 1;
      if (shouldGenerateData) {
        generateChannelData(
          channels[channels.push(getRandomChannel(channelNumber)) - 1]
        );
      } else {
        channels.push(getRandomChannel(channelNumber));
      }
    }
  });
}

export function onSettingChange(numberOfChannels, totalSamples) {
  const samplesPerChannel = Math.floor(totalSamples / numberOfChannels);
  const channelsChange = numberOfChannels - channels.length;
  let operation;

  // Channels removed
  if (channelsChange < 0) {
    channels.splice(channels.length + channelsChange, -channelsChange);
    updateEcharts();
    return;
  }

  // No. of samples per channel changed
  if (samplesPerChannel !== prevSamplesPerChannel) {
    prevSamplesPerChannel = samplesPerChannel;
    operation = regenerateAllChannels(samplesPerChannel);
  }

  // Channels added
  if (channelsChange > 0) {
    operation = addChannels(channelsChange);
  }

  onDataGenerated(operation);
}
