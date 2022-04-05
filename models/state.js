import { getRandom } from "../utils.js";

export const state = [
  {
    name: "PAT",
    min: -1000,
    max: 1000,
    start: 0,
    end: 0,
    displacement: 20,
    smoothing: -0.1,
  },
  {
    name: "PAT Amplitude",
    min: 0,
    max: 1000,
    start: 800,
    end: 800,
    displacement: 120,
    smoothing: 0.7,
  },
  {
    name: "Pulse rate (BPM)",
    min: 0,
    max: 140,
    start: 80,
    end: 80,
    displacement: 10,
    smoothing: 0.7,
  },
  {
    name: "SaO2 (%)",
    min: 0,
    max: 100,
    start: 93,
    end: 93,
    displacement: 5,
    smoothing: 0.3,
  },
  {
    name: "Resp.Mov",
    min: -10000,
    max: 10000,
    start: 0,
    end: 0,
    displacement: 100,
    smoothing: -0.1,
  },
  {
    name: "Actigraph",
    min: 1500,
    max: 3000,
    start: 1700,
    end: 1700,
    displacement: 10,
    smoothing: 0.1,
  },
  {
    name: "Snore (dB)",
    min: 40,
    max: 80,
    start: 40,
    end: 40,
    displacement: 2,
    smoothing: 0.01,
  },
  { name: "Channel 8", displacement: 50, smoothing: 0.5 },
  { name: "Channel 9", displacement: 20, smoothing: 0.9 },
  { name: "Channel 10", displacement: 300, smoothing: 1.2 },
];

export function getRandomChannel(number) {
  return {
    name: "Channel " + number,
    displacement: getRandom(30, 400),
    smoothing: getRandom(0.1, 2),
  };
}
