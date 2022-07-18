//#if _DEVELOPMENT
//importScripts();
//#endif

const WorkerAPI = {
  [DATA_GENERATOR.generateDataSeries]: (config) => {
    return generateDataSeries(
      config.samples,
      config.dataMin,
      config.dataMax,
      config.smoothing,
      config.displacement,
      config.displacementRatio,
      config.easingType,
      config.start,
      config.end
    );
  },
  [DATA_GENERATOR.generateDataWithExtrapolations]: (config) => {
    const { data, dataMin, dataMax } =
      WorkerAPI[DATA_GENERATOR.generateDataSeries](config);

    return {
      data: WorkerAPI[DATA_GENERATOR.punchHolesInArray]({
        data,
        replaceWith: config.replaceWith,
      }),
      dataMin,
      dataMax,
    };
  },
  [DATA_GENERATOR.setTotalSamples]: (config) => {
    setTotalSamples(config.samples);
  },
  [DATA_GENERATOR.limitArray]: (config) => {
    return limitArray(
      config.data,
      config.dataMin,
      config.dataMax,
      config.limitFactor
    );
  },
  [DATA_GENERATOR.punchHolesInArray]: (config) => {
    return punchHolesInArray(config.data, config.replaceWith);
  },
  [DATA_GENERATOR.generateData]: (options) => {
    const hasTransforms = options.transforms && options.transforms.length;

    if (!hasTransforms) {
      return WorkerAPI[options.config.name](options.config);
    }

    return options.transforms.reduce((data, transformConfig) => {
      return WorkerAPI[transformConfig.name]({ ...transformConfig, data });
    }, WorkerAPI[DATA_GENERATOR.generateDataSeries](options.config));
  },
};

workerpool.worker(WorkerAPI);
