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
    return {
      data: punchHolesInArray(config.data, config.transform.replaceWith),
    };
  },
  [DATA_GENERATOR.transformData]: (config) => {
    return ({ data, dataMin, dataMax } = config.transforms.reduce(
      (prevTaskResult, transformConfig) => {
        const transform = WorkerAPI[transformConfig.name];
        const result = transform({
          ...prevTaskResult,
          transform: transformConfig.data,
        });

        if (Array.isArray(result)) {
          return {
            ...prevTaskResult,
            data: result,
          };
        }

        return {
          ...prevTaskResult,
          ...result,
        };
      },
      config.channel
    ));
  },
  [DATA_GENERATOR.generateAndTransformData]: (config) => {
    const hasTransforms = config.transforms && config.transforms.length;
    if (!hasTransforms) {
      return WorkerAPI[config.generate.name](config.generate.data);
    }

    return WorkerAPI[DATA_GENERATOR.transformData]({
      channel: WorkerAPI[config.generate.name](config.generate.data),
      transforms: config.transforms,
    });
  },
};

workerpool.worker(WorkerAPI);
