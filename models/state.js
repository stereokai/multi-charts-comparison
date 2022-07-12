import { dataOperation } from "@/dataGenerator/AsyncDataGenerator.js";
import { default as app } from "@/models/ui.js";
import { getRandom } from "@/utils.js";
export { default as app } from "@/models/ui.js";

//#DATA_GENERATOR_TASKS

export const channels = [
  {
    name: "PAT",
    start: 0,
    end: 0,
    dataMin: -1000,
    dataMax: 1000,
    yAxisMin: -1000,
    yAxisMax: 1000,
    displacement: 10,
    smoothing: -0.3,
  },
  {
    name: "PAT Amplitude",
    easingType: 0,
    yAxisMin: -1000,
    yAxisMax: 1000,
    dataMin: 500,
    dataMax: 800,
    start: 750,
    end: 750,
    displacement: 100,
    displacementRatio: 0.4,
  },
  {
    name: "Pulse rate (BPM)",
    easingType: 0,
    yAxisMin: 0,
    yAxisMax: 100,
    dataMin: 50,
    dataMax: 80,
    start: 75,
    end: 75,
    displacement: 5,
    displacementRatio: 0.4,
  },
  {
    name: "SaO2 (%)",
    yAxisMin: 80,
    yAxisMax: 100,
    dataMin: 86,
    dataMax: 94,
    start: 90,
    end: 90,
    displacement: 3,
    smoothing: 0.6,
  },
  {
    name: "Resp.Mov",
    yAxisMin: -10000,
    yAxisMax: 10000,
    dataMin: -10000,
    dataMax: 10000,
    start: 0,
    end: 0,
    displacement: 120,
    smoothing: -0.1,
  },
  {
    name: "Actigraph",
    yAxisMin: 1500,
    yAxisMax: 3000,
    dataMin: 1500,
    dataMax: 3000,
    start: 1700,
    end: 1700,
    displacement: 10,
    smoothing: 0.1,
  },
  {
    name: "Snore (dB)",
    yAxisMin: 35,
    yAxisMax: 75,
    dataMin: 40,
    dataMax: 75,
    start: 40,
    end: 40,
    displacement: 80,
    displacementRatio: 0.04,
    smoothing: 0.01,
    easingType: 2,
    samplesPerSecond: 10,
  },
  { name: "Random 8", displacement: 50, smoothing: 0.5, dynamicYAxis: true },
  { name: "Random 9", displacement: 20, smoothing: 0.9, dynamicYAxis: true },
  { name: "Random 10", displacement: 300, smoothing: 1.2, dynamicYAxis: true },
];

// Cool channel;
// dataMax: 73.07131716790869
// dataMin: 4.542635989696553
// displacement: 132.72398235782674
// displacementRatio: 0.5524629214881096
// easingType: 23
// name: "Channel 24"
// smoothing: 1.6453016662864852

// dataMax: 66.42008997331385
// dataMin: 23.33657229332754
// displacement: 291.67474573667045
// displacementRatio: 0.4852704619773478
// easingType: 6
// name: "Channel 7"
// smoothing: 0.3574907065906837

function getTaskConfig(...args) {
  if (!app.extraFeatures.extrapolation) {
    return getDataTaskConfig(...args);
  } else {
    return getPunchedDataTaskConfig(...args);
  }
}

function getRandomChannel(number) {
  return {
    name: "Random " + number,
    displacement: getRandom(30, 400),
    smoothing: getRandom(0.1, 2),
    displacementRatio: getRandom(0.1, 1),
  };
}

export function regenerateAllChannels(samplesPerChannel) {
  return dataOperation((queueTask) => {
    channels.forEach((channel) =>
      queueTask(getTaskConfig(channel, samplesPerChannel))
    );
  });
}

export function addChannels(
  numberOfChannelsToAdd,
  samplesPerChannel,
  shouldGenerateData = true
) {
  if (numberOfChannelsToAdd < 1) {
    throw new Error("Can't add 0 channels");
  }

  return dataOperation((queueTask) => {
    for (let i = 0; i < numberOfChannelsToAdd; i++) {
      const channelNumber = channels.length + 1;
      if (shouldGenerateData) {
        queueTask(
          getTaskConfig(
            channels[channels.push(getRandomChannel(channelNumber)) - 1],
            samplesPerChannel
          )
        );
      } else {
        channels.push(getRandomChannel(channelNumber));
      }
    }
  });
}

export function removeChannels(channelsChange) {
  channels.splice(channels.length + channelsChange, -channelsChange);
}

export function getChannelYAxisBounds(channel) {
  return {
    min:
      typeof channel.yAxisMin === "number" ? channel.yAxisMin : channel.dataMin,
    max:
      typeof channel.yAxisMax === "number" ? channel.yAxisMax : channel.dataMax,
  };
}

export function getLimitedChannelData(channelDataGetter) {
  return dataOperation((queueTask) => {
    channels.forEach((channel, i) =>
      queueTask(getLimitArrayTaskConfig(channel, channelDataGetter(i), 0.2))
    );
  });
}
