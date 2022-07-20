import { getChannelYAxisBounds } from "@/models/state.js";
import {
  AutoCursorModes,
  AxisTickStrategies,
  ColorCSS,
  ColorHEX,
  emptyLine,
  FontSettings,
  SolidFill,
  SolidLine,
  UIVisibilityModes,
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

    static CHART_GAP = 10;
    get CHART_GAP() {
      return LightningChartChannelsMixin.CHART_GAP;
    }

    static SERIES_DEFAULT_FILL_STYLE = new SolidFill({
      color: ColorCSS("white"),
    });
    get SERIES_DEFAULT_FILL_STYLE() {
      return LightningChartChannelsMixin.SERIES_DEFAULT_FILL_STYLE;
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
          top: LightningChartChannelsMixin.CHART_GAP / 2,
          bottom: LightningChartChannelsMixin.CHART_GAP / 2,
        })
        .setBackgroundStrokeStyle(emptyLine)
        .setMouseInteractions(false)
        .setMouseInteractionPan(true)
        .setMouseInteractionRectangleFit(false)
        .setZoomingRectangleStrokeStyle(
          new SolidLine({
            thickness: 2,
            fillStyle: new SolidFill({ color: ColorCSS("red") }),
          })
        )
        .setFittingRectangleStrokeStyle(
          new SolidLine({
            thickness: 2,
            fillStyle: new SolidFill({ color: ColorCSS("blue") }),
          })
        )
        .setBackgroundFillStyle(
          new SolidFill({
            color: ColorHEX("#f0f0f0"),
          })
        )
        .setSeriesBackgroundFillStyle(
          LightningChartChannelsMixin.SERIES_DEFAULT_FILL_STYLE
        );

      const xAxis = chart
        .getDefaultAxisX()
        .setMouseInteractions(false)
        .setTickStrategy(AxisTickStrategies.Empty, (styler) => false)
        .setStrokeStyle(emptyLine);

      const yAxisBounds = getChannelYAxisBounds(channel);
      const yAxis = chart
        .getDefaultAxisY()
        .setMouseInteractions(false)
        .setChartInteractions(false)
        .setStrokeStyle(emptyLine)
        .setTitle(channel.name)
        // .setInterval(yAxisBounds.min, yAxisBounds.max)
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

      chart.setAutoCursorMode(AutoCursorModes.disabled);

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
      const graph = LightningChartChannelsMixin.addChannel(
        this.dashboard,
        channel,
        channelIndex,
        colorIndex,
        dontCreateSeries
      );

      const { chart, series, xAxis, yAxis, row } = graph;

      //attaching an on click event to the seires
      chart.onSeriesBackgroundMouseClick((chart, event) => {
        if (event.metaKey) {
          try {
            //fetching the data point and other parameters. The location parameter gives the data point
            const res = series.solveNearestFromScreen(
              chart.engine.clientLocation2Engine(event.clientX, event.clientY)
            );
            const x = parseFloat(res.resultTableContent[1][1]);
            const y = parseFloat(res.resultTableContent[2][1]);
            this.addEvent({ x, y }, channelIndex);
          } catch (e) {
            //#if _DEVELOPMENT
            console.log(`Could not add event marker, ${e}`);
            //#endif
          }
        }
        this.markers.forEach((chartMarker) => {
          chartMarker.setResultTableVisibility(UIVisibilityModes.never);
        });
      });

      return graph;
    }

    addLineSeries(chart, colorIndex) {
      return LightningChartChannelsMixin.addLineSeries(chart, colorIndex);
    }

    getChannelData(channelIndex) {
      const channelData = [];
      const graph = this.graphs[channelIndex];

      try {
        const originalData = graph.series.kc[0].La;
        const originalDataLength = originalData.length;
      } catch (e) {
        //#if _DEVELOPMENT
        console.error(`Could not get channel ${channelIndex} data, ${e}`);
        //#endif
        return [];
      }
      for (let i = 0; i < graph.series.kc[0].La.length; i++) {
        channelData[i] = graph.series.kc[0].La[i].y;
      }
      return channelData;
    }
  };
export default lightningChartChannelsMixin;
