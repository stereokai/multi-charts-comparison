import {
  AxisTickStrategies,
  ColorCSS,
  ColorHEX,
  emptyLine,
  FontSettings,
  SolidFill,
} from "@arction/lcjs";

const lightningChartChannelsMixin = (Base) =>
  class LightningChartChannelsMixin extends Base {
    static addChannel(dashboard, channel, channelIndex) {
      const chart = dashboard
        .createChartXY({
          columnIndex: 0,
          rowIndex: channelIndex,
          columnSpan: 1,
          rowSpan: 1,
          disableAnimations: true,
        })
        .setTitle("")
        .setPadding({ left: 100, top: 0, bottom: 0 })
        .setBackgroundStrokeStyle(emptyLine)
        .setMouseInteractionWheelZoom(false)
        .setSeriesBackgroundFillStyle(
          new SolidFill({
            color: ColorCSS("white"),
          })
        );

      const xAxis = chart
        .getDefaultAxisX()
        .setTickStrategy(AxisTickStrategies.Empty, (styler) =>
          console.log(styler)
        )
        .setStrokeStyle(emptyLine);

      const yAxis = chart
        .getDefaultAxisY()
        .setMouseInteractions(false)
        .setChartInteractions(false)
        .setStrokeStyle(emptyLine)
        .setTitle(channel.name)
        .setTitleFont(new FontSettings({ size: 12 }))
        .setTitleFillStyle(new SolidFill({ color: ColorHEX("#6e7079") }))
        .setTitleRotation(0)
        .setThickness(60)
        .setAnimationZoom(undefined)
        .setTickStrategy(AxisTickStrategies.Numeric, (tickStrategy) =>
          tickStrategy
            .setMajorTickStyle((visibleTicks) => {
              return visibleTicks
                .setLabelFillStyle(
                  new SolidFill({ color: ColorHEX("#6e7079") })
                )
                .setLabelFont(new FontSettings({ size: 6 }))
                .setTickStyle(emptyLine);
            })
            .setMinorTickStyle((visibleTicks) =>
              visibleTicks
                .setLabelFont(new FontSettings({ size: 6 }))
                .setTickStyle(emptyLine)
            )
        );

      const series = chart
        .addLineSeries({
          dataPattern: {
            pattern: "ProgressiveX",
            regularProgressiveStep: true,
            allowDataGrouping: true,
          },
          automaticColorIndex: channelIndex,
        })
        .setStrokeStyle((solidLine) => solidLine.setThickness(-1));

      return { chart, series, xAxis, yAxis, row: channelIndex };
    }

    addChannel(channel, channelIndex) {
      return LightningChartChannelsMixin.addChannel(
        this.dashboard,
        channel,
        channelIndex
      );
    }

    initializeChannels(channels) {
      this.graphs = channels.map((channel, i) => {
        return this.addChannel(channel, i);
      });
      this.graphs.forEach((graph) => this.registerZoomEvents(graph));
    }
  };
export default lightningChartChannelsMixin;
