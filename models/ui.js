const uiModel = {
  channels: {
    label: "Channels",
    min: 10,
    max: 25,
    value: 10,
  },
  period: {
    label: "Sleep period (h)",
    min: 8,
    max: 14,
    value: 8,
  },
  samples: {
    label: "Samples per second",
    min: 1,
    max: 100,
    value: 1,
  },
  total: {
    label: "Total samples",
  },
  lastEvent: {
    label: "Last event",
  },
  extraFeatures: {
    toggleGrid: true,
    areaZoom: false,
    montages: [],
  },
};
export default uiModel;
