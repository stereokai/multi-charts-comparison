let lastOperation = newOperationId();
const rejecters = {};
const workQueue = [];
import workerpool from "workerpool";
const workerPool = workerpool.pool(
  new URL("./CompiledWorker.js", import.meta.url).href,
  {
    maxWorkers: 3,
  }
);

function newOperationId() {
  return Date.now();
}

function queueTask(task) {
  workQueue.push(workerPool.exec(task.name, [task.data]));
}

function clearQueue(operationId) {
  //#if _DEVELOPMENT
  console.log(
    operationId
      ? `Terminating operation: ${operationId}`
      : "Clearing worker queue"
  );
  //#endif

  rejecters[operationId] &&
    rejecters[operationId](`Operation ${operationId} terminated`);
  workerPool.terminate(true);
  workQueue.length = 0;
}

function newOperation(operationId) {
  clearQueue();
  lastOperation = operationId;
  return () => {
    return new Promise((resolve, reject) => {
      rejecters[operationId] = reject;
      Promise.all(workQueue)
        .then((results) => resolve(results))
        .catch(() => {});
    });
  };
}

export function dataOperation(workCallback) {
  const operationId = newOperationId();
  const onOperationEnd = newOperation(operationId);

  //#if _DEVELOPMENT
  console.log(`Starting operation ${operationId}`);
  //#endif

  workCallback(queueTask);

  return onOperationEnd().then((results) => {
    if (lastOperation === operationId) {
      //#if _DEVELOPMENT
      console.log(`Operation ${operationId} ended with results`, results);
      //#endif
      return results;
    } else {
      //#if _DEVELOPMENT
      console.log(`Operation ${operationId} ended but was terminated`, results);
      //#endif
      return Promise.reject(
        `Operation ${operationId} ended but was terminated`
      );
    }
  });
}
