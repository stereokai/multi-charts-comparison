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
    static addChannel(
      dashboard,
      channel,
      channelIndex,
      colorIndex,
      dontCreateSeries = false
    ) {
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
        .setMouseInteractions(false)
        .setMouseInteractionPan(true)
        .setSeriesBackgroundFillStyle(
          new SolidFill({
            color: ColorCSS("white"),
          })
        );

      const xAxis = chart
        .getDefaultAxisX()
        .setMouseInteractions(false)
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

      let series;
      if (!dontCreateSeries) {
        series = LightningChartChannelsMixin.addLineSeries(
          chart,
          typeof colorIndex === "number" ? colorIndex : channelIndex
        );
      }

      return { chart, series, xAxis, yAxis, row: channelIndex };
    }

    static addLineSeries(chart, colorIndex = 0) {
      return chart
        .addLineSeries({
          dataPattern: {
            pattern: "ProgressiveX",
            regularProgressiveStep: true,
            allowDataGrouping: true,
          },
          automaticColorIndex: colorIndex,
        })
        .setStrokeStyle((solidLine) => solidLine.setThickness(-1));
    }

    addChannel(channel, channelIndex, colorIndex, dontCreateSeries) {
      return LightningChartChannelsMixin.addChannel(
        this.dashboard,
        channel,
        channelIndex,
        colorIndex,
        dontCreateSeries
      );
    }

    addLineSeries(chart, colorIndex) {
      return LightningChartChannelsMixin.addLineSeries(chart, colorIndex);
    }

    initializeChannels(channels) {
      this.graphs.splice(
        0,
        0,
        ...channels.map((channel, i) => {
          return this.addChannel(channel, i);
        })
      );
      this.graphs.forEach((graph) => this.registerZoomEvents(graph));
    }
  };
export default lightningChartChannelsMixin;
