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
  console.log("task", task);
  workQueue.push(workerPool.exec(task.name, [task.data]));
}

function clearQueue(operationId) {
  console.log(
    operationId
      ? `Terminating operation: ${operationId}`
      : "Clearing worker queue"
  );
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
  console.log(`Starting operation ${operationId}`);

  workCallback(queueTask);

  return onOperationEnd().then((results) => {
    if (lastOperation === operationId) {
      console.log(`Operation ${operationId} ended with results`, results);
      return results;
    } else {
      console.log(`Operation ${operationId} ended but was terminated`, results);
      return Promise.reject(
        `Operation ${operationId} ended but was terminated`
      );
    }
  });
}
