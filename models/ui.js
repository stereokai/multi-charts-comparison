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
    toggleZoomBasedData: false,
    toggleGrid: true,
    areaZoom: false,
    montages: [],
    extrapolation: true,
    toggleHotkeys: false,
    events: false,
    hotkeys: [
      { key: "left", label: "Pan left", action: "panLeft" },
      { key: "right", label: "Pan right", action: "panRight" },
    ],
  },
};
export default uiModel;
