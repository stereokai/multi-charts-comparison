import { getChannelYAxisBounds } from "@/models/state.js";
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
    static CHART_LEFT_PADDING = 100;
    get CHART_LEFT_PADDING() {
      return LightningChartChannelsMixin.CHART_LEFT_PADDING;
    }

    static Y_AXIS_WIDTH = 60;
    get Y_AXIS_WIDTH() {
      return LightningChartChannelsMixin.Y_AXIS_WIDTH;
    }

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
        .setPadding({
          left: LightningChartChannelsMixin.CHART_LEFT_PADDING,
          top: 0,
          bottom: 0,
        })
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

      const yAxisBounds = getChannelYAxisBounds(channel);
      const yAxis = chart
        .getDefaultAxisY()
        .setMouseInteractions(false)
        .setChartInteractions(false)
        .setStrokeStyle(emptyLine)
        .setTitle(channel.name)
        .setInterval(yAxisBounds.min, yAxisBounds.max)
        .setTitleFont(new FontSettings({ size: 12 }))
        .setTitleFillStyle(new SolidFill({ color: ColorHEX("#6e7079") }))
        .setTitleRotation(0)
        .setThickness(LightningChartChannelsMixin.Y_AXIS_WIDTH)
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

      if (!channel.dynamicYAxis) {
        yAxis.setScrollStrategy(undefined);
      }

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
      window.graphs = this.graphs;
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
  };
export default lightningChartChannelsMixin;
