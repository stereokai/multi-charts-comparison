/**
 * workerpool.js
 * https://github.com/josdejong/workerpool
 *
 * Offload tasks to a pool of workers on node.js and in the browser.
 *
 * @version 6.2.1
 * @date    2022-04-11
 *
 * @license
 * Copyright (C) 2014-2022 Jos de Jong <wjosdejong@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

(function webpackUniversalModuleDefinition(root, factory) {
  console.log(
    "Executing FunctionExpression webpackUniversalModuleDefinition from file CompiledWorker.js at line 26"
  );

  if (typeof exports === "object" && typeof module === "object")
    module.exports = factory();
  else if (typeof define === "function" && define.amd)
    define("workerpool", [], factory);
  else if (typeof exports === "object") exports["workerpool"] = factory();
  else root["workerpool"] = factory();
})(typeof self !== "undefined" ? self : this, function () {
  console.log(
    "Executing FunctionExpression from file CompiledWorker.js at line 35"
  );
  return /******/ (function () {
    console.log(
      "Executing FunctionExpression from file CompiledWorker.js at line 36"
    );
    // webpackBootstrap
    /******/ var __webpack_modules__ = {
      /***/ 345: /***/ function (
        module,
        __unused_webpack_exports,
        __webpack_require__
      ) {
        console.log(
          "Executing FunctionExpression from file CompiledWorker.js at line 40"
        );

        var Promise = __webpack_require__(219);

        var WorkerHandler = __webpack_require__(751);

        var environment = __webpack_require__(828);

        var DebugPortAllocator = __webpack_require__(833);

        var DEBUG_PORT_ALLOCATOR = new DebugPortAllocator();
        /**
         * A pool to manage workers
         * @param {String} [script]   Optional worker script
         * @param {WorkerPoolOptions} [options]  See docs
         * @constructor
         */

        function Pool(script, options) {
          console.log(
            "Executing FunctionDeclaration Pool from file CompiledWorker.js at line 58"
          );

          if (typeof script === "string") {
            this.script = script || null;
          } else {
            this.script = null;
            options = script;
          }

          this.workers = []; // queue with all workers

          this.tasks = []; // queue with tasks awaiting execution

          options = options || {};
          this.forkArgs = Object.freeze(options.forkArgs || []);
          this.forkOpts = Object.freeze(options.forkOpts || {});
          this.debugPortStart = options.debugPortStart || 43210;
          this.nodeWorker = options.nodeWorker;
          this.workerType = options.workerType || options.nodeWorker || "auto";
          this.maxQueueSize = options.maxQueueSize || Infinity;

          this.onCreateWorker =
            options.onCreateWorker ||
            function () {
              console.log(
                "Executing FunctionExpression from file CompiledWorker.js at line 78"
              );
              return null;
            };

          this.onTerminateWorker =
            options.onTerminateWorker ||
            function () {
              console.log(
                "Executing FunctionExpression from file CompiledWorker.js at line 82"
              );
              return null;
            }; // configuration

          if (options && "maxWorkers" in options) {
            validateMaxWorkers(options.maxWorkers);
            this.maxWorkers = options.maxWorkers;
          } else {
            this.maxWorkers = Math.max((environment.cpus || 4) - 1, 1);
          }

          if (options && "minWorkers" in options) {
            if (options.minWorkers === "max") {
              this.minWorkers = this.maxWorkers;
            } else {
              validateMinWorkers(options.minWorkers);
              this.minWorkers = options.minWorkers;
              this.maxWorkers = Math.max(this.minWorkers, this.maxWorkers); // in case minWorkers is higher than maxWorkers
            }

            this._ensureMinWorkers();
          }

          this._boundNext = this._next.bind(this);

          if (this.workerType === "thread") {
            WorkerHandler.ensureWorkerThreads();
          }
        }
        /**
         * Execute a function on a worker.
         *
         * Example usage:
         *
         *   var pool = new Pool()
         *
         *   // call a function available on the worker
         *   pool.exec('fibonacci', [6])
         *
         *   // offload a function
         *   function add(a, b) {
         *     return a + b
         *   };
         *   pool.exec(add, [2, 4])
         *       .then(function (result) {
         *         console.log(result); // outputs 6
         *       })
         *       .catch(function(error) {
         *         console.log(error);
         *       });
         *
         * @param {String | Function} method  Function name or function.
         *                                    If `method` is a string, the corresponding
         *                                    method on the worker will be executed
         *                                    If `method` is a Function, the function
         *                                    will be stringified and executed via the
         *                                    workers built-in function `run(fn, args)`.
         * @param {Array} [params]  Function arguments applied when calling the function
         * @param {ExecOptions} [options]  Options object
         * @return {Promise.<*, Error>} result
         */

        Pool.prototype.exec = function (method, params, options) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 146"
          );
          // validate type of arguments
          if (params && !Array.isArray(params)) {
            throw new TypeError('Array expected as argument "params"');
          }

          if (typeof method === "string") {
            var resolver = Promise.defer();

            if (this.tasks.length >= this.maxQueueSize) {
              throw new Error(
                "Max queue size of " + this.maxQueueSize + " reached"
              );
            } // add a new task to the queue

            var tasks = this.tasks;
            var task = {
              method: method,
              params: params,
              resolver: resolver,
              timeout: null,
              options: options,
            };
            tasks.push(task); // replace the timeout method of the Promise with our own,
            // which starts the timer as soon as the task is actually started

            var originalTimeout = resolver.promise.timeout;

            resolver.promise.timeout = function timeout(delay) {
              console.log(
                "Executing FunctionExpression timeout from file CompiledWorker.js at line 173"
              );

              if (tasks.indexOf(task) !== -1) {
                // task is still queued -> start the timer later on
                task.timeout = delay;
                return resolver.promise;
              } else {
                // task is already being executed -> start timer immediately
                return originalTimeout.call(resolver.promise, delay);
              }
            }; // trigger task execution

            this._next();

            return resolver.promise;
          } else if (typeof method === "function") {
            // send stringified function and function arguments to worker
            return this.exec("run", [String(method), params]);
          } else {
            throw new TypeError(
              'Function or string expected as argument "method"'
            );
          }
        };
        /**
         * Create a proxy for current worker. Returns an object containing all
         * methods available on the worker. The methods always return a promise.
         *
         * @return {Promise.<Object, Error>} proxy
         */

        Pool.prototype.proxy = function () {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 203"
          );
          if (arguments.length > 0) {
            throw new Error("No arguments expected");
          }

          var pool = this;
          return this.exec("methods").then(function (methods) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 209"
            );
            var proxy = {};
            methods.forEach(function (method) {
              console.log(
                "Executing FunctionExpression from file CompiledWorker.js at line 211"
              );
              proxy[method] = function () {
                console.log(
                  "Executing FunctionExpression from file CompiledWorker.js at line 212"
                );
                return pool.exec(method, Array.prototype.slice.call(arguments));
              };
            });
            return proxy;
          });
        };
        /**
         * Creates new array with the results of calling a provided callback function
         * on every element in this array.
         * @param {Array} array
         * @param {function} callback  Function taking two arguments:
         *                             `callback(currentValue, index)`
         * @return {Promise.<Array>} Returns a promise which resolves  with an Array
         *                           containing the results of the callback function
         *                           executed for each of the array elements.
         */

        /* TODO: implement map
        Pool.prototype.map = function (array, callback) {
        };
        */

        /**
         * Grab the first task from the queue, find a free worker, and assign the
         * worker to the task.
         * @protected
         */

        Pool.prototype._next = function () {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 242"
          );
          if (this.tasks.length > 0) {
            // there are tasks in the queue
            // find an available worker
            var worker = this._getWorker();

            if (worker) {
              // get the first task from the queue
              var me = this;
              var task = this.tasks.shift(); // check if the task is still pending (and not cancelled -> promise rejected)

              if (task.resolver.promise.pending) {
                // send the request to the worker
                var promise = worker
                  .exec(task.method, task.params, task.resolver, task.options)
                  .then(me._boundNext)
                  ["catch"](function () {
                    console.log(
                      "Executing FunctionExpression from file CompiledWorker.js at line 255"
                    );
                    // if the worker crashed and terminated, remove it from the pool
                    if (worker.terminated) {
                      return me._removeWorker(worker);
                    }
                  })
                  .then(function () {
                    console.log(
                      "Executing FunctionExpression from file CompiledWorker.js at line 260"
                    );
                    me._next(); // trigger next task in the queue
                  }); // start queued timer now

                if (typeof task.timeout === "number") {
                  promise.timeout(task.timeout);
                }
              } else {
                // The task taken was already complete (either rejected or resolved), so just trigger next task in the queue
                me._next();
              }
            }
          }
        };
        /**
         * Get an available worker. If no worker is available and the maximum number
         * of workers isn't yet reached, a new worker will be created and returned.
         * If no worker is available and the maximum number of workers is reached,
         * null will be returned.
         *
         * @return {WorkerHandler | null} worker
         * @private
         */

        Pool.prototype._getWorker = function () {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 286"
          );
          // find a non-busy worker
          var workers = this.workers;

          for (var i = 0; i < workers.length; i++) {
            var worker = workers[i];

            if (worker.busy() === false) {
              return worker;
            }
          }

          if (workers.length < this.maxWorkers) {
            // create a new worker
            worker = this._createWorkerHandler();
            workers.push(worker);
            return worker;
          }

          return null;
        };
        /**
         * Remove a worker from the pool.
         * Attempts to terminate worker if not already terminated, and ensures the minimum
         * pool size is met.
         * @param {WorkerHandler} worker
         * @return {Promise<WorkerHandler>}
         * @protected
         */

        Pool.prototype._removeWorker = function (worker) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 317"
          );
          var me = this;
          DEBUG_PORT_ALLOCATOR.releasePort(worker.debugPort); // _removeWorker will call this, but we need it to be removed synchronously

          this._removeWorkerFromList(worker); // If minWorkers set, spin up new workers to replace the crashed ones

          this._ensureMinWorkers(); // terminate the worker (if not already terminated)

          return new Promise(function (resolve, reject) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 327"
            );
            worker.terminate(false, function (err) {
              console.log(
                "Executing FunctionExpression from file CompiledWorker.js at line 328"
              );
              me.onTerminateWorker({
                forkArgs: worker.forkArgs,
                forkOpts: worker.forkOpts,
                script: worker.script,
              });

              if (err) {
                reject(err);
              } else {
                resolve(worker);
              }
            });
          });
        };
        /**
         * Remove a worker from the pool list.
         * @param {WorkerHandler} worker
         * @protected
         */

        Pool.prototype._removeWorkerFromList = function (worker) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 350"
          );
          // remove from the list with workers
          var index = this.workers.indexOf(worker);

          if (index !== -1) {
            this.workers.splice(index, 1);
          }
        };
        /**
         * Close all active workers. Tasks currently being executed will be finished first.
         * @param {boolean} [force=false]   If false (default), the workers are terminated
         *                                  after finishing all tasks currently in
         *                                  progress. If true, the workers will be
         *                                  terminated immediately.
         * @param {number} [timeout]        If provided and non-zero, worker termination promise will be rejected
         *                                  after timeout if worker process has not been terminated.
         * @return {Promise.<void, Error>}
         */

        Pool.prototype.terminate = function (force, timeout) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 370"
          );
          var me = this; // cancel any pending tasks

          this.tasks.forEach(function (task) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 373"
            );
            task.resolver.reject(new Error("Pool terminated"));
          });
          this.tasks.length = 0;

          var f = function f(worker) {
            console.log(
              "Executing FunctionExpression f from file CompiledWorker.js at line 378"
            );
            this._removeWorkerFromList(worker);
          };

          var removeWorker = f.bind(this);
          var promises = [];
          var workers = this.workers.slice();
          workers.forEach(function (worker) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 385"
            );
            var termPromise = worker
              .terminateAndNotify(force, timeout)
              .then(removeWorker)
              .always(function () {
                console.log(
                  "Executing FunctionExpression from file CompiledWorker.js at line 386"
                );
                me.onTerminateWorker({
                  forkArgs: worker.forkArgs,
                  forkOpts: worker.forkOpts,
                  script: worker.script,
                });
              });
            promises.push(termPromise);
          });
          return Promise.all(promises);
        };
        /**
         * Retrieve statistics on tasks and workers.
         * @return {{totalWorkers: number, busyWorkers: number, idleWorkers: number, pendingTasks: number, activeTasks: number}} Returns an object with statistics
         */

        Pool.prototype.stats = function () {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 403"
          );
          var totalWorkers = this.workers.length;
          var busyWorkers = this.workers.filter(function (worker) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 405"
            );
            return worker.busy();
          }).length;
          return {
            totalWorkers: totalWorkers,
            busyWorkers: busyWorkers,
            idleWorkers: totalWorkers - busyWorkers,
            pendingTasks: this.tasks.length,
            activeTasks: busyWorkers,
          };
        };
        /**
         * Ensures that a minimum of minWorkers is up and running
         * @protected
         */

        Pool.prototype._ensureMinWorkers = function () {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 422"
          );
          if (this.minWorkers) {
            for (var i = this.workers.length; i < this.minWorkers; i++) {
              this.workers.push(this._createWorkerHandler());
            }
          }
        };
        /**
         * Helper function to create a new WorkerHandler and pass all options.
         * @return {WorkerHandler}
         * @private
         */

        Pool.prototype._createWorkerHandler = function () {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 436"
          );
          var overridenParams =
            this.onCreateWorker({
              forkArgs: this.forkArgs,
              forkOpts: this.forkOpts,
              script: this.script,
            }) || {};
          return new WorkerHandler(overridenParams.script || this.script, {
            forkArgs: overridenParams.forkArgs || this.forkArgs,
            forkOpts: overridenParams.forkOpts || this.forkOpts,
            debugPort: DEBUG_PORT_ALLOCATOR.nextAvailableStartingAt(
              this.debugPortStart
            ),
            workerType: this.workerType,
          });
        };
        /**
         * Ensure that the maxWorkers option is an integer >= 1
         * @param {*} maxWorkers
         * @returns {boolean} returns true maxWorkers has a valid value
         */

        function validateMaxWorkers(maxWorkers) {
          console.log(
            "Executing FunctionDeclaration validateMaxWorkers from file CompiledWorker.js at line 456"
          );

          if (
            !isNumber(maxWorkers) ||
            !isInteger(maxWorkers) ||
            maxWorkers < 1
          ) {
            throw new TypeError(
              "Option maxWorkers must be an integer number >= 1"
            );
          }
        }
        /**
         * Ensure that the minWorkers option is an integer >= 0
         * @param {*} minWorkers
         * @returns {boolean} returns true when minWorkers has a valid value
         */

        function validateMinWorkers(minWorkers) {
          console.log(
            "Executing FunctionDeclaration validateMinWorkers from file CompiledWorker.js at line 468"
          );

          if (
            !isNumber(minWorkers) ||
            !isInteger(minWorkers) ||
            minWorkers < 0
          ) {
            throw new TypeError(
              "Option minWorkers must be an integer number >= 0"
            );
          }
        }
        /**
         * Test whether a variable is a number
         * @param {*} value
         * @returns {boolean} returns true when value is a number
         */

        function isNumber(value) {
          console.log(
            "Executing FunctionDeclaration isNumber from file CompiledWorker.js at line 480"
          );

          return typeof value === "number";
        }
        /**
         * Test whether a number is an integer
         * @param {number} value
         * @returns {boolean} Returns true if value is an integer
         */

        function isInteger(value) {
          console.log(
            "Executing FunctionDeclaration isInteger from file CompiledWorker.js at line 490"
          );

          return Math.round(value) == value;
        }

        module.exports = Pool;

        /***/
      },

      /***/ 219: /***/ function (module) {
        console.log(
          "Executing FunctionExpression from file CompiledWorker.js at line 499"
        );

        ("use strict");

        /**
         * Promise
         *
         * Inspired by https://gist.github.com/RubaXa/8501359 from RubaXa <trash@rubaxa.org>
         *
         * @param {Function} handler   Called as handler(resolve: Function, reject: Function)
         * @param {Promise} [parent]   Parent promise for propagation of cancel and timeout
         */

        function Promise(handler, parent) {
          console.log(
            "Executing FunctionDeclaration Promise from file CompiledWorker.js at line 512"
          );

          var me = this;

          if (!(this instanceof Promise)) {
            throw new SyntaxError(
              "Constructor must be called with the new operator"
            );
          }

          if (typeof handler !== "function") {
            throw new SyntaxError(
              "Function parameter handler(resolve, reject) missing"
            );
          }

          var _onSuccess = [];
          var _onFail = []; // status

          this.resolved = false;
          this.rejected = false;
          this.pending = true;
          /**
           * Process onSuccess and onFail callbacks: add them to the queue.
           * Once the promise is resolve, the function _promise is replace.
           * @param {Function} onSuccess
           * @param {Function} onFail
           * @private
           */

          var _process = function _process(onSuccess, onFail) {
            console.log(
              "Executing FunctionExpression _process from file CompiledWorker.js at line 537"
            );

            _onSuccess.push(onSuccess);

            _onFail.push(onFail);
          };
          /**
           * Add an onSuccess callback and optionally an onFail callback to the Promise
           * @param {Function} onSuccess
           * @param {Function} [onFail]
           * @returns {Promise} promise
           */

          this.then = function (onSuccess, onFail) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 550"
            );
            return new Promise(function (resolve, reject) {
              console.log(
                "Executing FunctionExpression from file CompiledWorker.js at line 551"
              );
              var s = onSuccess ? _then(onSuccess, resolve, reject) : resolve;
              var f = onFail ? _then(onFail, resolve, reject) : reject;

              _process(s, f);
            }, me);
          };
          /**
           * Resolve the promise
           * @param {*} result
           * @type {Function}
           */

          var _resolve2 = function _resolve(result) {
            console.log(
              "Executing FunctionExpression _resolve from file CompiledWorker.js at line 565"
            );

            // update status
            me.resolved = true;
            me.rejected = false;
            me.pending = false;

            _onSuccess.forEach(function (fn) {
              console.log(
                "Executing FunctionExpression from file CompiledWorker.js at line 571"
              );
              fn(result);
            });

            _process = function _process(onSuccess, onFail) {
              console.log(
                "Executing FunctionExpression _process from file CompiledWorker.js at line 575"
              );

              onSuccess(result);
            };

            _resolve2 = _reject2 = function _reject() {
              console.log(
                "Executing FunctionExpression _reject from file CompiledWorker.js at line 579"
              );
            };

            return me;
          };
          /**
           * Reject the promise
           * @param {Error} error
           * @type {Function}
           */

          var _reject2 = function _reject(error) {
            console.log(
              "Executing FunctionExpression _reject from file CompiledWorker.js at line 590"
            );

            // update status
            me.resolved = false;
            me.rejected = true;
            me.pending = false;

            _onFail.forEach(function (fn) {
              console.log(
                "Executing FunctionExpression from file CompiledWorker.js at line 596"
              );
              fn(error);
            });

            _process = function _process(onSuccess, onFail) {
              console.log(
                "Executing FunctionExpression _process from file CompiledWorker.js at line 600"
              );

              onFail(error);
            };

            _resolve2 = _reject2 = function _reject() {
              console.log(
                "Executing FunctionExpression _reject from file CompiledWorker.js at line 604"
              );
            };

            return me;
          };
          /**
           * Cancel te promise. This will reject the promise with a CancellationError
           * @returns {Promise} self
           */

          this.cancel = function () {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 614"
            );
            if (parent) {
              parent.cancel();
            } else {
              _reject2(new CancellationError());
            }

            return me;
          };
          /**
           * Set a timeout for the promise. If the promise is not resolved within
           * the time, the promise will be cancelled and a TimeoutError is thrown.
           * If the promise is resolved in time, the timeout is removed.
           * @param {number} delay     Delay in milliseconds
           * @returns {Promise} self
           */

          this.timeout = function (delay) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 632"
            );
            if (parent) {
              parent.timeout(delay);
            } else {
              var timer = setTimeout(function () {
                console.log(
                  "Executing FunctionExpression from file CompiledWorker.js at line 636"
                );
                _reject2(
                  new TimeoutError("Promise timed out after " + delay + " ms")
                );
              }, delay);
              me.always(function () {
                console.log(
                  "Executing FunctionExpression from file CompiledWorker.js at line 639"
                );
                clearTimeout(timer);
              });
            }

            return me;
          }; // attach handler passing the resolve and reject functions

          handler(
            function (result) {
              console.log(
                "Executing FunctionExpression from file CompiledWorker.js at line 648"
              );
              _resolve2(result);
            },
            function (error) {
              console.log(
                "Executing FunctionExpression from file CompiledWorker.js at line 650"
              );
              _reject2(error);
            }
          );
        }
        /**
         * Execute given callback, then call resolve/reject based on the returned result
         * @param {Function} callback
         * @param {Function} resolve
         * @param {Function} reject
         * @returns {Function}
         * @private
         */

        function _then(callback, resolve, reject) {
          console.log(
            "Executing FunctionDeclaration _then from file CompiledWorker.js at line 664"
          );

          return function (result) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 665"
            );
            try {
              var res = callback(result);

              if (
                res &&
                typeof res.then === "function" &&
                typeof res["catch"] === "function"
              ) {
                // method returned a promise
                res.then(resolve, reject);
              } else {
                resolve(res);
              }
            } catch (error) {
              reject(error);
            }
          };
        }
        /**
         * Add an onFail callback to the Promise
         * @param {Function} onFail
         * @returns {Promise} promise
         */

        Promise.prototype["catch"] = function (onFail) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 687"
          );
          return this.then(null, onFail);
        }; // TODO: add support for Promise.catch(Error, callback)
        // TODO: add support for Promise.catch(Error, Error, callback)

        /**
         * Execute given callback when the promise either resolves or rejects.
         * @param {Function} fn
         * @returns {Promise} promise
         */

        Promise.prototype.always = function (fn) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 699"
          );
          return this.then(fn, fn);
        };
        /**
         * Create a promise which resolves when all provided promises are resolved,
         * and fails when any of the promises resolves.
         * @param {Promise[]} promises
         * @returns {Promise} promise
         */

        Promise.all = function (promises) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 710"
          );
          return new Promise(function (resolve, reject) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 711"
            );
            var remaining = promises.length,
              results = [];

            if (remaining) {
              promises.forEach(function (p, i) {
                console.log(
                  "Executing FunctionExpression from file CompiledWorker.js at line 716"
                );
                p.then(
                  function (result) {
                    console.log(
                      "Executing FunctionExpression from file CompiledWorker.js at line 717"
                    );
                    results[i] = result;
                    remaining--;

                    if (remaining == 0) {
                      resolve(results);
                    }
                  },
                  function (error) {
                    console.log(
                      "Executing FunctionExpression from file CompiledWorker.js at line 724"
                    );
                    remaining = 0;
                    reject(error);
                  }
                );
              });
            } else {
              resolve(results);
            }
          });
        };
        /**
         * Create a promise resolver
         * @returns {{promise: Promise, resolve: Function, reject: Function}} resolver
         */

        Promise.defer = function () {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 740"
          );
          var resolver = {};
          resolver.promise = new Promise(function (resolve, reject) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 742"
            );
            resolver.resolve = resolve;
            resolver.reject = reject;
          });
          return resolver;
        };
        /**
         * Create a cancellation error
         * @param {String} [message]
         * @extends Error
         */

        function CancellationError(message) {
          console.log(
            "Executing FunctionDeclaration CancellationError from file CompiledWorker.js at line 755"
          );

          this.message = message || "promise cancelled";
          this.stack = new Error().stack;
        }

        CancellationError.prototype = new Error();
        CancellationError.prototype.constructor = Error;
        CancellationError.prototype.name = "CancellationError";
        Promise.CancellationError = CancellationError;
        /**
         * Create a timeout error
         * @param {String} [message]
         * @extends Error
         */

        function TimeoutError(message) {
          console.log(
            "Executing FunctionDeclaration TimeoutError from file CompiledWorker.js at line 770"
          );

          this.message = message || "timeout exceeded";
          this.stack = new Error().stack;
        }

        TimeoutError.prototype = new Error();
        TimeoutError.prototype.constructor = Error;
        TimeoutError.prototype.name = "TimeoutError";
        Promise.TimeoutError = TimeoutError;
        module.exports = Promise;

        /***/
      },

      /***/ 751: /***/ function (
        module,
        __unused_webpack_exports,
        __webpack_require__
      ) {
        console.log(
          "Executing FunctionExpression from file CompiledWorker.js at line 784"
        );

        ("use strict");

        function _createForOfIteratorHelper(o, allowArrayLike) {
          console.log(
            "Executing FunctionDeclaration _createForOfIteratorHelper from file CompiledWorker.js at line 789"
          );

          var it =
            (typeof Symbol !== "undefined" && o[Symbol.iterator]) ||
            o["@@iterator"];
          if (!it) {
            if (
              Array.isArray(o) ||
              (it = _unsupportedIterableToArray(o)) ||
              (allowArrayLike && o && typeof o.length === "number")
            ) {
              if (it) o = it;
              var i = 0;
              var F = function F() {
                console.log(
                  "Executing FunctionExpression F from file CompiledWorker.js at line 789"
                );
              };
              return {
                s: F,
                n: function n() {
                  console.log(
                    "Executing FunctionExpression n from file CompiledWorker.js at line 789"
                  );
                  if (i >= o.length) return { done: true };
                  return { done: false, value: o[i++] };
                },
                e: function e(_e) {
                  console.log(
                    "Executing FunctionExpression e from file CompiledWorker.js at line 789"
                  );
                  throw _e;
                },
                f: F,
              };
            }
            throw new TypeError(
              "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."
            );
          }
          var normalCompletion = true,
            didErr = false,
            err;
          return {
            s: function s() {
              console.log(
                "Executing FunctionExpression s from file CompiledWorker.js at line 789"
              );
              it = it.call(o);
            },
            n: function n() {
              console.log(
                "Executing FunctionExpression n from file CompiledWorker.js at line 789"
              );
              var step = it.next();
              normalCompletion = step.done;
              return step;
            },
            e: function e(_e2) {
              console.log(
                "Executing FunctionExpression e from file CompiledWorker.js at line 789"
              );
              didErr = true;
              err = _e2;
            },
            f: function f() {
              console.log(
                "Executing FunctionExpression f from file CompiledWorker.js at line 789"
              );
              try {
                if (!normalCompletion && it["return"] != null) it["return"]();
              } finally {
                if (didErr) throw err;
              }
            },
          };
        }

        function _unsupportedIterableToArray(o, minLen) {
          console.log(
            "Executing FunctionDeclaration _unsupportedIterableToArray from file CompiledWorker.js at line 791"
          );

          if (!o) return;
          if (typeof o === "string") return _arrayLikeToArray(o, minLen);
          var n = Object.prototype.toString.call(o).slice(8, -1);
          if (n === "Object" && o.constructor) n = o.constructor.name;
          if (n === "Map" || n === "Set") return Array.from(o);
          if (
            n === "Arguments" ||
            /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
          )
            return _arrayLikeToArray(o, minLen);
        }

        function _arrayLikeToArray(arr, len) {
          console.log(
            "Executing FunctionDeclaration _arrayLikeToArray from file CompiledWorker.js at line 793"
          );

          if (len == null || len > arr.length) len = arr.length;
          for (var i = 0, arr2 = new Array(len); i < len; i++) {
            arr2[i] = arr[i];
          }
          return arr2;
        }

        function _typeof(obj) {
          console.log(
            "Executing FunctionDeclaration _typeof from file CompiledWorker.js at line 795"
          );

          ("@babel/helpers - typeof");
          return (
            (_typeof =
              "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                ? function (obj) {
                    console.log(
                      "Executing FunctionExpression from file CompiledWorker.js at line 795"
                    );
                    return typeof obj;
                  }
                : function (obj) {
                    console.log(
                      "Executing FunctionExpression from file CompiledWorker.js at line 795"
                    );
                    return obj &&
                      "function" == typeof Symbol &&
                      obj.constructor === Symbol &&
                      obj !== Symbol.prototype
                      ? "symbol"
                      : typeof obj;
                  }),
            _typeof(obj)
          );
        }

        var Promise = __webpack_require__(219);

        var environment = __webpack_require__(828);

        var requireFoolWebpack = __webpack_require__(397);
        /**
         * Special message sent by parent which causes a child process worker to terminate itself.
         * Not a "message object"; this string is the entire message.
         */

        var TERMINATE_METHOD_ID = "__workerpool-terminate__";
        /**
         * If sending `TERMINATE_METHOD_ID` does not cause the child process to exit in this many milliseconds,
         * force-kill the child process.
         */

        var CHILD_PROCESS_EXIT_TIMEOUT = 1000;

        function ensureWorkerThreads() {
          console.log(
            "Executing FunctionDeclaration ensureWorkerThreads from file CompiledWorker.js at line 816"
          );

          var WorkerThreads = tryRequireWorkerThreads();

          if (!WorkerThreads) {
            throw new Error(
              "WorkerPool: workerType = 'thread' is not supported, Node >= 11.7.0 required"
            );
          }

          return WorkerThreads;
        } // check whether Worker is supported by the browser

        function ensureWebWorker() {
          console.log(
            "Executing FunctionDeclaration ensureWebWorker from file CompiledWorker.js at line 827"
          );

          // Workaround for a bug in PhantomJS (Or QtWebkit): https://github.com/ariya/phantomjs/issues/14534
          if (
            typeof Worker !== "function" &&
            ((typeof Worker === "undefined" ? "undefined" : _typeof(Worker)) !==
              "object" ||
              typeof Worker.prototype.constructor !== "function")
          ) {
            throw new Error("WorkerPool: Web Workers not supported");
          }
        }

        function tryRequireWorkerThreads() {
          console.log(
            "Executing FunctionDeclaration tryRequireWorkerThreads from file CompiledWorker.js at line 834"
          );

          try {
            return requireFoolWebpack("worker_threads");
          } catch (error) {
            if (
              _typeof(error) === "object" &&
              error !== null &&
              error.code === "MODULE_NOT_FOUND"
            ) {
              // no worker_threads available (old version of node.js)
              return null;
            } else {
              throw error;
            }
          }
        } // get the default worker script

        function getDefaultWorker() {
          console.log(
            "Executing FunctionDeclaration getDefaultWorker from file CompiledWorker.js at line 848"
          );

          if (environment.platform === "browser") {
            // test whether the browser supports all features that we need
            if (typeof Blob === "undefined") {
              throw new Error("Blob not supported by the browser");
            }

            if (
              !window.URL ||
              typeof window.URL.createObjectURL !== "function"
            ) {
              throw new Error(
                "URL.createObjectURL not supported by the browser"
              );
            } // use embedded worker.js

            var blob = new Blob([__webpack_require__(670)], {
              type: "text/javascript",
            });
            return window.URL.createObjectURL(blob);
          } else {
            // use external worker.js in current directory
            return __dirname + "/worker.js";
          }
        }

        function setupWorker(script, options) {
          console.log(
            "Executing FunctionDeclaration setupWorker from file CompiledWorker.js at line 870"
          );

          if (options.workerType === "web") {
            // browser only
            ensureWebWorker();
            return setupBrowserWorker(script, Worker);
          } else if (options.workerType === "thread") {
            // node.js only
            WorkerThreads = ensureWorkerThreads();
            return setupWorkerThreadWorker(script, WorkerThreads);
          } else if (options.workerType === "process" || !options.workerType) {
            // node.js only
            return setupProcessWorker(
              script,
              resolveForkOptions(options),
              requireFoolWebpack("child_process")
            );
          } else {
            // options.workerType === 'auto' or undefined
            if (environment.platform === "browser") {
              ensureWebWorker();
              return setupBrowserWorker(script, Worker);
            } else {
              // environment.platform === 'node'
              var WorkerThreads = tryRequireWorkerThreads();

              if (WorkerThreads) {
                return setupWorkerThreadWorker(script, WorkerThreads);
              } else {
                return setupProcessWorker(
                  script,
                  resolveForkOptions(options),
                  requireFoolWebpack("child_process")
                );
              }
            }
          }
        }

        function setupBrowserWorker(script, Worker) {
          console.log(
            "Executing FunctionDeclaration setupBrowserWorker from file CompiledWorker.js at line 900"
          );

          // create the web worker
          var worker = new Worker(script);
          worker.isBrowserWorker = true; // add node.js API to the web worker

          worker.on = function (event, callback) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 905"
            );
            this.addEventListener(event, function (message) {
              console.log(
                "Executing FunctionExpression from file CompiledWorker.js at line 906"
              );
              callback(message.data);
            });
          };

          worker.send = function (message) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 911"
            );
            this.postMessage(message);
          };

          return worker;
        }

        function setupWorkerThreadWorker(script, WorkerThreads) {
          console.log(
            "Executing FunctionDeclaration setupWorkerThreadWorker from file CompiledWorker.js at line 918"
          );

          var worker = new WorkerThreads.Worker(script, {
            stdout: false,
            // automatically pipe worker.STDOUT to process.STDOUT
            stderr: false, // automatically pipe worker.STDERR to process.STDERR
          });
          worker.isWorkerThread = true; // make the worker mimic a child_process

          worker.send = function (message) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 927"
            );
            this.postMessage(message);
          };

          worker.kill = function () {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 931"
            );
            this.terminate();
            return true;
          };

          worker.disconnect = function () {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 936"
            );
            this.terminate();
          };

          return worker;
        }

        function setupProcessWorker(script, options, child_process) {
          console.log(
            "Executing FunctionDeclaration setupProcessWorker from file CompiledWorker.js at line 943"
          );

          // no WorkerThreads, fallback to sub-process based workers
          var worker = child_process.fork(
            script,
            options.forkArgs,
            options.forkOpts
          );
          worker.isChildProcess = true;
          return worker;
        } // add debug flags to child processes if the node inspector is active

        function resolveForkOptions(opts) {
          console.log(
            "Executing FunctionDeclaration resolveForkOptions from file CompiledWorker.js at line 951"
          );

          opts = opts || {};
          var processExecArgv = process.execArgv.join(" ");
          var inspectorActive = processExecArgv.indexOf("--inspect") !== -1;
          var debugBrk = processExecArgv.indexOf("--debug-brk") !== -1;
          var execArgv = [];

          if (inspectorActive) {
            execArgv.push("--inspect=" + opts.debugPort);

            if (debugBrk) {
              execArgv.push("--debug-brk");
            }
          }

          process.execArgv.forEach(function (arg) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 966"
            );
            if (arg.indexOf("--max-old-space-size") > -1) {
              execArgv.push(arg);
            }
          });
          return Object.assign({}, opts, {
            forkArgs: opts.forkArgs,
            forkOpts: Object.assign({}, opts.forkOpts, {
              execArgv: (
                (opts.forkOpts && opts.forkOpts.execArgv) ||
                []
              ).concat(execArgv),
            }),
          });
        }
        /**
         * Converts a serialized error to Error
         * @param {Object} obj Error that has been serialized and parsed to object
         * @return {Error} The equivalent Error.
         */

        function objectToError(obj) {
          console.log(
            "Executing FunctionDeclaration objectToError from file CompiledWorker.js at line 985"
          );

          var temp = new Error("");
          var props = Object.keys(obj);

          for (var i = 0; i < props.length; i++) {
            temp[props[i]] = obj[props[i]];
          }

          return temp;
        }
        /**
         * A WorkerHandler controls a single worker. This worker can be a child process
         * on node.js or a WebWorker in a browser environment.
         * @param {String} [script] If no script is provided, a default worker with a
         *                          function run will be created.
         * @param {WorkerPoolOptions} _options See docs
         * @constructor
         */

        function WorkerHandler(script, _options) {
          console.log(
            "Executing FunctionDeclaration WorkerHandler from file CompiledWorker.js at line 1005"
          );

          var me = this;
          var options = _options || {};
          this.script = script || getDefaultWorker();
          this.worker = setupWorker(this.script, options);
          this.debugPort = options.debugPort;
          this.forkOpts = options.forkOpts;
          this.forkArgs = options.forkArgs; // The ready message is only sent if the worker.add method is called (And the default script is not used)

          if (!script) {
            this.worker.ready = true;
          } // queue for requests that are received before the worker is ready

          this.requestQueue = [];
          this.worker.on("message", function (response) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 1020"
            );
            if (me.terminated) {
              return;
            }

            if (typeof response === "string" && response === "ready") {
              me.worker.ready = true;
              dispatchQueuedRequests();
            } else {
              // find the task from the processing queue, and run the tasks callback
              var id = response.id;
              var task = me.processing[id];

              if (task !== undefined) {
                if (response.isEvent) {
                  if (task.options && typeof task.options.on === "function") {
                    task.options.on(response.payload);
                  }
                } else {
                  // remove the task from the queue
                  delete me.processing[id]; // test if we need to terminate

                  if (me.terminating === true) {
                    // complete worker termination if all tasks are finished
                    me.terminate();
                  } // resolve the task's promise

                  if (response.error) {
                    task.resolver.reject(objectToError(response.error));
                  } else {
                    task.resolver.resolve(response.result);
                  }
                }
              }
            }
          }); // reject all running tasks on worker error

          function onError(error) {
            console.log(
              "Executing FunctionDeclaration onError from file CompiledWorker.js at line 1058"
            );

            me.terminated = true;

            for (var id in me.processing) {
              if (me.processing[id] !== undefined) {
                me.processing[id].resolver.reject(error);
              }
            }

            me.processing = Object.create(null);
          } // send all queued requests to worker

          function dispatchQueuedRequests() {
            console.log(
              "Executing FunctionDeclaration dispatchQueuedRequests from file CompiledWorker.js at line 1071"
            );

            var _iterator = _createForOfIteratorHelper(
                me.requestQueue.splice(0)
              ),
              _step;

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done; ) {
                var request = _step.value;
                me.worker.send(request);
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
          }

          var worker = this.worker; // listen for worker messages error and exit

          this.worker.on("error", onError);
          this.worker.on("exit", function (exitCode, signalCode) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 1090"
            );
            var message = "Workerpool Worker terminated Unexpectedly\n";
            message += "    exitCode: `" + exitCode + "`\n";
            message += "    signalCode: `" + signalCode + "`\n";
            message += "    workerpool.script: `" + me.script + "`\n";
            message += "    spawnArgs: `" + worker.spawnargs + "`\n";
            message += "    spawnfile: `" + worker.spawnfile + "`\n";
            message += "    stdout: `" + worker.stdout + "`\n";
            message += "    stderr: `" + worker.stderr + "`\n";
            onError(new Error(message));
          });
          this.processing = Object.create(null); // queue with tasks currently in progress

          this.terminating = false;
          this.terminated = false;
          this.terminationHandler = null;
          this.lastId = 0;
        }
        /**
         * Get a list with methods available on the worker.
         * @return {Promise.<String[], Error>} methods
         */

        WorkerHandler.prototype.methods = function () {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 1114"
          );
          return this.exec("methods");
        };
        /**
         * Execute a method with given parameters on the worker
         * @param {String} method
         * @param {Array} [params]
         * @param {{resolve: Function, reject: Function}} [resolver]
         * @param {ExecOptions}  [options]
         * @return {Promise.<*, Error>} result
         */

        WorkerHandler.prototype.exec = function (
          method,
          params,
          resolver,
          options
        ) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 1127"
          );
          if (!resolver) {
            resolver = Promise.defer();
          } // generate a unique id for the task

          var id = ++this.lastId; // register a new task as being in progress

          this.processing[id] = {
            id: id,
            resolver: resolver,
            options: options,
          }; // build a JSON-RPC request

          var request = {
            id: id,
            method: method,
            params: params,
          };

          if (this.terminated) {
            resolver.reject(new Error("Worker is terminated"));
          } else if (this.worker.ready) {
            // send the request to the worker
            this.worker.send(request);
          } else {
            this.requestQueue.push(request);
          } // on cancellation, force the worker to terminate

          var me = this;
          return resolver.promise["catch"](function (error) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 1158"
            );
            if (
              error instanceof Promise.CancellationError ||
              error instanceof Promise.TimeoutError
            ) {
              // remove this task from the queue. It is already rejected (hence this
              // catch event), and else it will be rejected again when terminating
              delete me.processing[id]; // terminate worker

              return me.terminateAndNotify(true).then(
                function () {
                  console.log(
                    "Executing FunctionExpression from file CompiledWorker.js at line 1164"
                  );
                  throw error;
                },
                function (err) {
                  console.log(
                    "Executing FunctionExpression from file CompiledWorker.js at line 1166"
                  );
                  throw err;
                }
              );
            } else {
              throw error;
            }
          });
        };
        /**
         * Test whether the worker is working or not
         * @return {boolean} Returns true if the worker is busy
         */

        WorkerHandler.prototype.busy = function () {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 1180"
          );
          return Object.keys(this.processing).length > 0;
        };
        /**
         * Terminate the worker.
         * @param {boolean} [force=false]   If false (default), the worker is terminated
         *                                  after finishing all tasks currently in
         *                                  progress. If true, the worker will be
         *                                  terminated immediately.
         * @param {function} [callback=null] If provided, will be called when process terminates.
         */

        WorkerHandler.prototype.terminate = function (force, callback) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 1193"
          );
          var me = this;

          if (force) {
            // cancel all tasks in progress
            for (var id in this.processing) {
              if (this.processing[id] !== undefined) {
                this.processing[id].resolver.reject(
                  new Error("Worker terminated")
                );
              }
            }

            this.processing = Object.create(null);
          }

          if (typeof callback === "function") {
            this.terminationHandler = callback;
          }

          if (!this.busy()) {
            // all tasks are finished. kill the worker
            var cleanup = function cleanup(err) {
              console.log(
                "Executing FunctionExpression cleanup from file CompiledWorker.js at line 1213"
              );

              me.terminated = true;

              if (me.worker != null && me.worker.removeAllListeners) {
                // removeAllListeners is only available for child_process
                me.worker.removeAllListeners("message");
              }

              me.worker = null;
              me.terminating = false;

              if (me.terminationHandler) {
                me.terminationHandler(err, me);
              } else if (err) {
                throw err;
              }
            };

            if (this.worker) {
              if (typeof this.worker.kill === "function") {
                if (this.worker.killed) {
                  cleanup(new Error("worker already killed!"));
                  return;
                }

                if (this.worker.isChildProcess) {
                  var cleanExitTimeout = setTimeout(function () {
                    console.log(
                      "Executing FunctionExpression from file CompiledWorker.js at line 1239"
                    );
                    if (me.worker) {
                      me.worker.kill();
                    }
                  }, CHILD_PROCESS_EXIT_TIMEOUT);
                  this.worker.once("exit", function () {
                    console.log(
                      "Executing FunctionExpression from file CompiledWorker.js at line 1244"
                    );
                    clearTimeout(cleanExitTimeout);

                    if (me.worker) {
                      me.worker.killed = true;
                    }

                    cleanup();
                  });

                  if (this.worker.ready) {
                    this.worker.send(TERMINATE_METHOD_ID);
                  } else {
                    this.requestQueue.push(TERMINATE_METHOD_ID);
                  }
                } else {
                  // worker_thread
                  this.worker.kill();
                  this.worker.killed = true;
                  cleanup();
                }

                return;
              } else if (typeof this.worker.terminate === "function") {
                this.worker.terminate(); // web worker

                this.worker.killed = true;
              } else {
                throw new Error("Failed to terminate worker");
              }
            }

            cleanup();
          } else {
            // we can't terminate immediately, there are still tasks being executed
            this.terminating = true;
          }
        };
        /**
         * Terminate the worker, returning a Promise that resolves when the termination has been done.
         * @param {boolean} [force=false]   If false (default), the worker is terminated
         *                                  after finishing all tasks currently in
         *                                  progress. If true, the worker will be
         *                                  terminated immediately.
         * @param {number} [timeout]        If provided and non-zero, worker termination promise will be rejected
         *                                  after timeout if worker process has not been terminated.
         * @return {Promise.<WorkerHandler, Error>}
         */

        WorkerHandler.prototype.terminateAndNotify = function (force, timeout) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 1294"
          );
          var resolver = Promise.defer();

          if (timeout) {
            resolver.promise.timeout = timeout;
          }

          this.terminate(force, function (err, worker) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 1301"
            );
            if (err) {
              resolver.reject(err);
            } else {
              resolver.resolve(worker);
            }
          });
          return resolver.promise;
        };

        module.exports = WorkerHandler;
        module.exports._tryRequireWorkerThreads = tryRequireWorkerThreads;
        module.exports._setupProcessWorker = setupProcessWorker;
        module.exports._setupBrowserWorker = setupBrowserWorker;
        module.exports._setupWorkerThreadWorker = setupWorkerThreadWorker;
        module.exports.ensureWorkerThreads = ensureWorkerThreads;

        /***/
      },

      /***/ 833: /***/ function (module) {
        console.log(
          "Executing FunctionExpression from file CompiledWorker.js at line 1321"
        );

        ("use strict");

        var MAX_PORTS = 65535;
        module.exports = DebugPortAllocator;

        function DebugPortAllocator() {
          console.log(
            "Executing FunctionDeclaration DebugPortAllocator from file CompiledWorker.js at line 1329"
          );

          this.ports = Object.create(null);
          this.length = 0;
        }

        DebugPortAllocator.prototype.nextAvailableStartingAt = function (
          starting
        ) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 1334"
          );
          while (this.ports[starting] === true) {
            starting++;
          }

          if (starting >= MAX_PORTS) {
            throw new Error(
              "WorkerPool debug port limit reached: " +
                starting +
                ">= " +
                MAX_PORTS
            );
          }

          this.ports[starting] = true;
          this.length++;
          return starting;
        };

        DebugPortAllocator.prototype.releasePort = function (port) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 1348"
          );
          delete this.ports[port];
          this.length--;
        };

        /***/
      },

      /***/ 828: /***/ function (
        module,
        __unused_webpack_exports,
        __webpack_require__
      ) {
        console.log(
          "Executing FunctionExpression from file CompiledWorker.js at line 1356"
        );

        var requireFoolWebpack = __webpack_require__(397); // source: https://github.com/flexdinesh/browser-or-node

        var isNode = function isNode(nodeProcess) {
          console.log(
            "Executing FunctionExpression isNode from file CompiledWorker.js at line 1361"
          );

          return (
            typeof nodeProcess !== "undefined" &&
            nodeProcess.versions != null &&
            nodeProcess.versions.node != null
          );
        };

        module.exports.isNode = isNode; // determines the JavaScript platform: browser or node

        module.exports.platform =
          typeof process !== "undefined" && isNode(process)
            ? "node"
            : "browser"; // determines whether the code is running in main thread or not
        // note that in node.js we have to check both worker_thread and child_process

        var worker_threads = tryRequireFoolWebpack("worker_threads");
        module.exports.isMainThread =
          module.exports.platform === "node"
            ? (!worker_threads || worker_threads.isMainThread) &&
              !process.connected
            : typeof Window !== "undefined"; // determines the number of cpus available

        module.exports.cpus =
          module.exports.platform === "browser"
            ? self.navigator.hardwareConcurrency
            : requireFoolWebpack("os").cpus().length;

        function tryRequireFoolWebpack(module) {
          console.log(
            "Executing FunctionDeclaration tryRequireFoolWebpack from file CompiledWorker.js at line 1375"
          );

          try {
            return requireFoolWebpack(module);
          } catch (err) {
            return null;
          }
        }

        /***/
      },

      /***/ 670: /***/ function (module) {
        console.log(
          "Executing FunctionExpression from file CompiledWorker.js at line 1386"
        );

        /**
         * embeddedWorker.js contains an embedded version of worker.js.
         * This file is automatically generated,
         * changes made in this file will be overwritten.
         */
        module.exports =
          '!function(){var __webpack_exports__={};!function(){var exports=__webpack_exports__,__webpack_unused_export__;function _typeof(r){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(r){return typeof r}:function(r){return r&&"function"==typeof Symbol&&r.constructor===Symbol&&r!==Symbol.prototype?"symbol":typeof r})(r)}var requireFoolWebpack=eval("typeof require !== \'undefined\' ? require : function (module) { throw new Error(\'Module \\" + module + \\" not found.\') }"),TERMINATE_METHOD_ID="__workerpool-terminate__",worker={exit:function(){}},WorkerThreads,parentPort;if("undefined"!=typeof self&&"function"==typeof postMessage&&"function"==typeof addEventListener)worker.on=function(r,e){addEventListener(r,function(r){e(r.data)})},worker.send=function(r){postMessage(r)};else{if("undefined"==typeof process)throw new Error("Script must be executed as a worker");try{WorkerThreads=requireFoolWebpack("worker_threads")}catch(error){if("object"!==_typeof(error)||null===error||"MODULE_NOT_FOUND"!==error.code)throw error}WorkerThreads&&null!==WorkerThreads.parentPort?(parentPort=WorkerThreads.parentPort,worker.send=parentPort.postMessage.bind(parentPort),worker.on=parentPort.on.bind(parentPort)):(worker.on=process.on.bind(process),worker.send=process.send.bind(process),worker.on("disconnect",function(){process.exit(1)}),worker.exit=process.exit.bind(process))}function convertError(o){return Object.getOwnPropertyNames(o).reduce(function(r,e){return Object.defineProperty(r,e,{value:o[e],enumerable:!0})},{})}function isPromise(r){return r&&"function"==typeof r.then&&"function"==typeof r.catch}worker.methods={},worker.methods.run=function(r,e){r=new Function("return ("+r+").apply(null, arguments);");return r.apply(r,e)},worker.methods.methods=function(){return Object.keys(worker.methods)};var currentRequestId=null;worker.on("message",function(e){if(e===TERMINATE_METHOD_ID)return worker.exit(0);try{var r=worker.methods[e.method];if(!r)throw new Error(\'Unknown method "\'+e.method+\'"\');currentRequestId=e.id;var o=r.apply(r,e.params);isPromise(o)?o.then(function(r){worker.send({id:e.id,result:r,error:null}),currentRequestId=null}).catch(function(r){worker.send({id:e.id,result:null,error:convertError(r)}),currentRequestId=null}):(worker.send({id:e.id,result:o,error:null}),currentRequestId=null)}catch(r){worker.send({id:e.id,result:null,error:convertError(r)})}}),worker.register=function(r){if(r)for(var e in r)r.hasOwnProperty(e)&&(worker.methods[e]=r[e]);worker.send("ready")},worker.emit=function(r){currentRequestId&&worker.send({id:currentRequestId,isEvent:!0,payload:r})},__webpack_unused_export__=worker.register,worker.emit}()}();';

        /***/
      },

      /***/ 397: /***/ function (module) {
        console.log(
          "Executing FunctionExpression from file CompiledWorker.js at line 1398"
        );

        // source of inspiration: https://github.com/sindresorhus/require-fool-webpack
        var requireFoolWebpack = eval(
          "typeof require !== 'undefined' " +
            "? require " +
            ": function (module) { throw new Error('Module \" + module + \" not found.') }"
        );
        module.exports = requireFoolWebpack;

        /***/
      },

      /***/ 744: /***/ function (__unused_webpack_module, exports) {
        console.log(
          "Executing FunctionExpression from file CompiledWorker.js at line 1407"
        );

        function _typeof(obj) {
          console.log(
            "Executing FunctionDeclaration _typeof from file CompiledWorker.js at line 1409"
          );

          ("@babel/helpers - typeof");
          return (
            (_typeof =
              "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
                ? function (obj) {
                    console.log(
                      "Executing FunctionExpression from file CompiledWorker.js at line 1409"
                    );
                    return typeof obj;
                  }
                : function (obj) {
                    console.log(
                      "Executing FunctionExpression from file CompiledWorker.js at line 1409"
                    );
                    return obj &&
                      "function" == typeof Symbol &&
                      obj.constructor === Symbol &&
                      obj !== Symbol.prototype
                      ? "symbol"
                      : typeof obj;
                  }),
            _typeof(obj)
          );
        }

        /**
         * worker must be started as a child process or a web worker.
         * It listens for RPC messages from the parent process.
         */
        // source of inspiration: https://github.com/sindresorhus/require-fool-webpack
        var requireFoolWebpack = eval(
          "typeof require !== 'undefined'" +
            " ? require" +
            " : function (module) { throw new Error('Module \" + module + \" not found.') }"
        );
        /**
         * Special message sent by parent which causes the worker to terminate itself.
         * Not a "message object"; this string is the entire message.
         */

        var TERMINATE_METHOD_ID = "__workerpool-terminate__"; // var nodeOSPlatform = require('./environment').nodeOSPlatform;
        // create a worker API for sending and receiving messages which works both on
        // node.js and in the browser

        var worker = {
          exit: function exit() {
            console.log(
              "Executing FunctionExpression exit from file CompiledWorker.js at line 1427"
            );
          },
        };

        if (
          typeof self !== "undefined" &&
          typeof postMessage === "function" &&
          typeof addEventListener === "function"
        ) {
          // worker in the browser
          worker.on = function (event, callback) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 1432"
            );
            addEventListener(event, function (message) {
              console.log(
                "Executing FunctionExpression from file CompiledWorker.js at line 1433"
              );
              callback(message.data);
            });
          };

          worker.send = function (message) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 1438"
            );
            console.log("worker message", message);
            postMessage(message);
          };
        } else if (typeof process !== "undefined") {
          // node.js
          var WorkerThreads;

          try {
            WorkerThreads = requireFoolWebpack("worker_threads");
          } catch (error) {
            if (
              _typeof(error) === "object" &&
              error !== null &&
              error.code === "MODULE_NOT_FOUND"
            ) {
              // no worker_threads, fallback to sub-process based workers
            } else {
              throw error;
            }
          }

          if (
            WorkerThreads &&
            /* if there is a parentPort, we are in a WorkerThread */
            WorkerThreads.parentPort !== null
          ) {
            var parentPort = WorkerThreads.parentPort;
            worker.send = parentPort.postMessage.bind(parentPort);
            worker.on = parentPort.on.bind(parentPort);
          } else {
            worker.on = process.on.bind(process);
            worker.send = process.send.bind(process); // register disconnect handler only for subprocess worker to exit when parent is killed unexpectedly

            worker.on("disconnect", function () {
              console.log(
                "Executing FunctionExpression from file CompiledWorker.js at line 1464"
              );
              process.exit(1);
            });
            worker.exit = process.exit.bind(process);
          }
        } else {
          throw new Error("Script must be executed as a worker");
        }

        function convertError(error) {
          console.log(
            "Executing FunctionDeclaration convertError from file CompiledWorker.js at line 1473"
          );

          return Object.getOwnPropertyNames(error).reduce(function (
            product,
            name
          ) {
            console.log(
              "Executing FunctionExpression from file CompiledWorker.js at line 1474"
            );
            return Object.defineProperty(product, name, {
              value: error[name],
              enumerable: true,
            });
          },
          {});
        }
        /**
         * Test whether a value is a Promise via duck typing.
         * @param {*} value
         * @returns {boolean} Returns true when given value is an object
         *                    having functions `then` and `catch`.
         */

        function isPromise(value) {
          console.log(
            "Executing FunctionDeclaration isPromise from file CompiledWorker.js at line 1489"
          );

          return (
            value &&
            typeof value.then === "function" &&
            typeof value["catch"] === "function"
          );
        } // functions available externally

        worker.methods = {};
        /**
         * Execute a function with provided arguments
         * @param {String} fn     Stringified function
         * @param {Array} [args]  Function arguments
         * @returns {*}
         */

        worker.methods.run = function run(fn, args) {
          console.log(
            "Executing FunctionExpression run from file CompiledWorker.js at line 1502"
          );

          var f = new Function("return (" + fn + ").apply(null, arguments);");
          return f.apply(f, args);
        };
        /**
         * Get a list with methods available on this worker
         * @return {String[]} methods
         */

        worker.methods.methods = function methods() {
          console.log(
            "Executing FunctionExpression methods from file CompiledWorker.js at line 1512"
          );

          return Object.keys(worker.methods);
        };

        var currentRequestId = null;
        worker.on("message", function (request) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 1517"
          );
          if (request === TERMINATE_METHOD_ID) {
            return worker.exit(0);
          }

          try {
            var method = worker.methods[request.method];

            if (method) {
              currentRequestId = request.id; // execute the function

              var result = method.apply(method, request.params);

              if (isPromise(result)) {
                // promise returned, resolve this and then return
                result
                  .then(function (result) {
                    console.log(
                      "Executing FunctionExpression from file CompiledWorker.js at line 1532"
                    );
                    worker.send({
                      id: request.id,
                      result: result,
                      error: null,
                    });
                    currentRequestId = null;
                  })
                  ["catch"](function (err) {
                    console.log(
                      "Executing FunctionExpression from file CompiledWorker.js at line 1539"
                    );
                    worker.send({
                      id: request.id,
                      result: null,
                      error: convertError(err),
                    });
                    currentRequestId = null;
                  });
              } else {
                // immediate result
                worker.send({
                  id: request.id,
                  result: result,
                  error: null,
                });
                currentRequestId = null;
              }
            } else {
              throw new Error('Unknown method "' + request.method + '"');
            }
          } catch (err) {
            worker.send({
              id: request.id,
              result: null,
              error: convertError(err),
            });
          }
        });
        /**
         * Register methods to the worker
         * @param {Object} methods
         */

        worker.register = function (methods) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 1572"
          );
          if (methods) {
            for (var name in methods) {
              if (methods.hasOwnProperty(name)) {
                worker.methods[name] = methods[name];
              }
            }
          }

          worker.send("ready");
        };

        worker.emit = function (payload) {
          console.log(
            "Executing FunctionExpression from file CompiledWorker.js at line 1584"
          );
          if (currentRequestId) {
            worker.send({
              id: currentRequestId,
              isEvent: true,
              payload: payload,
            });
          }
        };

        if (true) {
          exports.add = worker.register;
          exports.emit = worker.emit;
        }

        /***/
      },

      /******/
    };
    /************************************************************************/
    /******/ // The module cache
    /******/ var __webpack_module_cache__ = {};
    /******/
    /******/ // The require function
    /******/ function __webpack_require__(moduleId) {
      console.log(
        "Executing FunctionDeclaration __webpack_require__ from file CompiledWorker.js at line 1607"
      );

      /******/ // Check if module is in cache
      /******/ var cachedModule = __webpack_module_cache__[moduleId];
      /******/ if (cachedModule !== undefined) {
        /******/ return cachedModule.exports;
        /******/
      }
      /******/ // Create a new module (and put it into the cache)
      /******/ var module = (__webpack_module_cache__[moduleId] = {
        /******/ // no module.id needed
        /******/ // no module.loaded needed
        /******/ exports: {},
        /******/
      });
      /******/
      /******/ // Execute the module function
      /******/ __webpack_modules__[moduleId](
        module,
        module.exports,
        __webpack_require__
      );
      /******/
      /******/ // Return the exports of the module
      /******/ return module.exports;
      /******/
    }
    /******/
    /************************************************************************/
    var __webpack_exports__ = {};
    // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
    !(function () {
      console.log(
        "Executing FunctionExpression from file CompiledWorker.js at line 1630"
      );
      var exports = __webpack_exports__;
      var environment = __webpack_require__(828);
      /**
       * Create a new worker pool
       * @param {string} [script]
       * @param {WorkerPoolOptions} [options]
       * @returns {Pool} pool
       */

      exports.pool = function pool(script, options) {
        console.log(
          "Executing FunctionExpression pool from file CompiledWorker.js at line 1641"
        );

        var Pool = __webpack_require__(345);

        return new Pool(script, options);
      };
      /**
       * Create a worker and optionally register a set of methods to the worker.
       * @param {Object} [methods]
       */

      exports.worker = function worker(methods) {
        console.log(
          "Executing FunctionExpression worker from file CompiledWorker.js at line 1652"
        );

        var worker = __webpack_require__(744);

        worker.add(methods);
      };
      /**
       * Sends an event to the parent worker pool.
       * @param {any} payload
       */

      exports.workerEmit = function workerEmit(payload) {
        console.log(
          "Executing FunctionExpression workerEmit from file CompiledWorker.js at line 1663"
        );

        var worker = __webpack_require__(744);

        worker.emit(payload);
      };
      /**
       * Create a promise.
       * @type {Promise} promise
       */

      exports.Promise = __webpack_require__(219);
      exports.platform = environment.platform;
      exports.isMainThread = environment.isMainThread;
      exports.cpus = environment.cpus;
    })();
    /******/ return __webpack_exports__;
    /******/
  })();
});
//# sourceMappingURL=workerpool.js.map
const easings = [
  // Slow start and end, two bounces sandwich a fast motion
  function easeInOutElastic(t, magnitude = 0.65) {
    console.log(
      "Executing FunctionExpression easeInOutElastic from file CompiledWorker.js at line 1686"
    );

    const p = 1 - magnitude;

    if (t === 0 || t === 1) {
      return t;
    }

    const scaledTime = t * 2;
    const scaledTime1 = scaledTime - 1;

    const s = (p / (2 * Math.PI)) * Math.asin(1);

    if (scaledTime < 1) {
      return (
        -0.5 *
        (Math.pow(2, 10 * scaledTime1) *
          Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p))
      );
    }

    return (
      Math.pow(2, -10 * scaledTime1) *
        Math.sin(((scaledTime1 - s) * (2 * Math.PI)) / p) *
        0.5 +
      1
    );
  },
  // Bounce to completion
  function easeOutBounce(t) {
    console.log(
      "Executing FunctionExpression easeOutBounce from file CompiledWorker.js at line 1714"
    );

    const scaledTime = t / 1;

    if (scaledTime < 1 / 2.75) {
      return 7.5625 * scaledTime * scaledTime;
    } else if (scaledTime < 2 / 2.75) {
      const scaledTime2 = scaledTime - 1.5 / 2.75;
      return 7.5625 * scaledTime2 * scaledTime2 + 0.75;
    } else if (scaledTime < 2.5 / 2.75) {
      const scaledTime2 = scaledTime - 2.25 / 2.75;
      return 7.5625 * scaledTime2 * scaledTime2 + 0.9375;
    } else {
      const scaledTime2 = scaledTime - 2.625 / 2.75;
      return 7.5625 * scaledTime2 * scaledTime2 + 0.984375;
    }
  },

  // Decelerating to zero velocity
  function easeOutCubic(t) {
    console.log(
      "Executing FunctionExpression easeOutCubic from file CompiledWorker.js at line 1732"
    );

    const t1 = t - 1;
    return t1 * t1 * t1 + 1;
  },

  // Fast snap to backwards point then slow resolve to finish
  function easeOutBack(t, magnitude = 1.70158) {
    console.log(
      "Executing FunctionExpression easeOutBack from file CompiledWorker.js at line 1738"
    );

    const scaledTime = t / 1 - 1;

    return (
      scaledTime * scaledTime * ((magnitude + 1) * scaledTime + magnitude) + 1
    );
  },
];

function ease(easingType, ...args) {
  console.log(
    "Executing FunctionDeclaration ease from file CompiledWorker.js at line 1747"
  );

  return easings[easingType](...args);
}

// Bounce to completion
function easeOutBounce(t) {
  console.log(
    "Executing FunctionDeclaration easeOutBounce from file CompiledWorker.js at line 1752"
  );

  const scaledTime = t / 1;

  if (scaledTime < 1 / 2.75) {
    return 7.5625 * scaledTime * scaledTime;
  } else if (scaledTime < 2 / 2.75) {
    const scaledTime2 = scaledTime - 1.5 / 2.75;
    return 7.5625 * scaledTime2 * scaledTime2 + 0.75;
  } else if (scaledTime < 2.5 / 2.75) {
    const scaledTime2 = scaledTime - 2.25 / 2.75;
    return 7.5625 * scaledTime2 * scaledTime2 + 0.9375;
  } else {
    const scaledTime2 = scaledTime - 2.625 / 2.75;
    return 7.5625 * scaledTime2 * scaledTime2 + 0.984375;
  }
}

// Bounce increasing in velocity until completion
function easeInBounce(t) {
  console.log(
    "Executing FunctionDeclaration easeInBounce from file CompiledWorker.js at line 1770"
  );

  return 1 - easeOutBounce(1 - t);
}
const DEFAULT_DISPLACEMENT = 20; // arbitrary. Alternative: (start + end) / 2;

let desiredPoints, iterations, actualPoints, base, powerOf2Plus1;
function getRandom(min, max) {
  console.log(
    "Executing FunctionDeclaration getRandom from file CompiledWorker.js at line 1776"
  );

  return Math.random() * (max - min) + min;
}
function getEasingStep(iteration) {
  console.log(
    "Executing FunctionDeclaration getEasingStep from file CompiledWorker.js at line 1779"
  );

  const f = 1 / iterations;
  return iteration * f;
}
function setupAlgorithm() {
  console.log(
    "Executing FunctionDeclaration setupAlgorithm from file CompiledWorker.js at line 1783"
  );

  iterations = Math.floor(Math.log(desiredPoints * 2 - 1) / Math.log(2));
  powerOf2Plus1 = 2 ** iterations + 1;
  actualPoints = desiredPoints + (desiredPoints % 2 ? 1 : 0); // Make sure there's always a midpoint.
}
function setTotalSamples(samples) {
  console.log(
    "Executing FunctionDeclaration setTotalSamples from file CompiledWorker.js at line 1788"
  );

  if (samples === desiredPoints) {
    return;
  }

  desiredPoints = samples;
  setupAlgorithm();
}
function generateDataSeries(
  samples,
  min = getRandom(0, 50),
  max = getRandom(50, 100),
  smoothing = 1,
  displacement = null,
  displacementRatio = 0.5,
  easingType,
  start,
  end
) {
  console.log(
    "Executing FunctionDeclaration generateDataSeries from file CompiledWorker.js at line 1796"
  );

  start = typeof start !== "undefined" ? start : getRandom(min, max);
  end = typeof end !== "undefined" ? end : getRandom(min, max);

  if (typeof samples === "number") {
    setTotalSamples(samples);
  }

  let vDis =
    (displacement == "function" && displacement(start, end)) ||
    (typeof displacement == "number" && displacement) ||
    (start + end) / 2 ||
    start - end ||
    DEFAULT_DISPLACEMENT;
  let maxDis = vDis;

  const shouldUseEase = !!easings[easingType];

  let iteration = 1;
  const data = new Array(actualPoints).fill(0);
  data[0] = start;

  while (iteration <= iterations) {
    const skipDistance = ~~(powerOf2Plus1 / 2 ** iteration);
    const skips = 2 ** iteration - 1;

    for (
      let i = skipDistance;
      i <= skips * skipDistance;
      i += skipDistance * 2
    ) {
      if (i > actualPoints - 1) {
        break;
      }

      const a = data[i - skipDistance];
      let b = data[i + skipDistance];

      // The fallback to `end` is only needed for the first iteration,
      // because (at line 63) we stop calculating midpoints past the number of desired points.
      // Unless the number of desired points is exactly a power of 2,
      // the end point will be out of the scope of the base array.
      typeof b === "undefined" && (b = end);
      let midpoint = (a + b) / 2;
      const isPositiveDisplacement = Math.random() < displacementRatio;

      data[i] = isPositiveDisplacement
        ? Math.min(max, midpoint + vDis)
        : Math.max(min, midpoint - vDis);

      // Ensure a flat line when start and end are the same.
      if (start === end && iteration === 1) {
        data[i] = midpoint;
      }
    }

    if (shouldUseEase) {
      vDis = (1 - ease(easingType, getEasingStep(iteration))) * maxDis;
    } else {
      vDis = vDis * 2 ** -smoothing;
    }

    iteration++;
  }

  return { data, dataMin: min, dataMax: max };
}
function punchHolesInArray(array, replaceWith) {
  console.log(
    "Executing FunctionDeclaration punchHolesInArray from file CompiledWorker.js at line 1873"
  );

  const occurence = 30;
  const oFuzziness = 10;
  const oMin = ((occurence - oFuzziness) / 100) * array.length;
  const oMax = ((occurence + oFuzziness) / 100) * array.length;

  const sampleScale = 10;
  const sampleSize = (sampleScale / 100) * array.length;
  const sFuzziness = 20;

  const spacingOccurence = 100 - occurence;
  const spaceSize =
    (spacingOccurence / (occurence / sampleScale) / 100) * array.length * 0.9; // arbitrarily reduce spacing to maximize occurrence

  const getRandomSampleSize = () => {
    console.log(
      "Executing ArrowFunctionExpression from file CompiledWorker.js at line 1887"
    );

    return Math.round(
      getRandom(
        sampleSize - (sFuzziness / 100) * sampleSize,
        sampleSize + (sFuzziness / 100) * sampleSize
      )
    );
  };

  const getRandomSpacing = () => {
    console.log(
      "Executing ArrowFunctionExpression from file CompiledWorker.js at line 1895"
    );

    return Math.round(
      getRandom(
        spaceSize - (sFuzziness / 100) * spaceSize,
        spaceSize + (sFuzziness / 100) * spaceSize
      )
    );
  };

  // let isLastSectionASample = Math.random() >= 0.5; // Heads or tails
  let isLastSectionASample = true;
  const oLimit = Math.round(getRandom(oMin, oMax));
  let count = 0;
  let i = 0;

  while (count < oLimit && i <= array.length) {
    if (isLastSectionASample) {
      const space = getRandomSpacing();
      const adjustedSpaceSize =
        i + space > array.length ? array.length - i : space;
      i = i + adjustedSpaceSize;
      isLastSectionASample = false;
    } else {
      const sampleSize = getRandomSampleSize();
      let adjustedSampleSize = Math.min(
        i + sampleSize > array.length ? array.length - i : sampleSize,
        oLimit - count
      );

      if (typeof replaceWith === "undefined") {
        const prevItem = array[i - 1];
        const nextItem = array[i + adjustedSampleSize + 1];
        const step = (nextItem - prevItem) / adjustedSampleSize;

        array.splice(
          i,
          adjustedSampleSize,
          ...[...new Array(adjustedSampleSize)].map((_, j) => {
            console.log(
              "Executing ArrowFunctionExpression from file CompiledWorker.js at line 1931"
            );

            return prevItem + step * j;
          })
        );
      } else {
        array.splice(
          i,
          adjustedSampleSize,
          ...new Array(adjustedSampleSize).fill(NaN)
        );
      }

      count += adjustedSampleSize;
      i += adjustedSampleSize;
      isLastSectionASample = true;
    }

    if (count >= array.length || i >= array.length) {
      break;
    }
  }

  return array;
}

// Same signature as generateDataSeries
function generatePunchedDataSeries(...args) {
  console.log(
    "Executing FunctionDeclaration generatePunchedDataSeries from file CompiledWorker.js at line 1957"
  );

  const { data, dataMin, dataMax } = generateDataSeries(...args);
  return { data: punchHolesInArray(data), dataMin, dataMax };
}
// function limitArray(array, min, max, limitFactor = 1) {
//   const tmin = min * (1 - limitFactor);
//   const tmax = max * (1 - limitFactor);

//   array = array.map((value) => {
//     const fix = Math.max(tmin, Math.min(tmax), value);
//     console.log(value, fix, tmin, tmax, min, max);
//     return fix;
//   });

//   return { data: array, dataMin: min, dataMax: max };
// }

function limitArray(array, min, max, limitFactor = 1) {
  console.log(
    "Executing FunctionDeclaration limitArray from file CompiledWorker.js at line 1974"
  );

  min = Infinity;
  max = -Infinity;

  return {
    data: array.map((value) => {
      console.log(
        "Executing ArrowFunctionExpression from file CompiledWorker.js at line 1979"
      );

      min = Math.min(min, value);
      max = Math.max(max, value);
      return value * (1 - limitFactor);
    }),
    dataMin: min,
    dataMax: max,
  };
}
const DATA_GENERATOR_TASKS = {
  generateDataSeries: "generateDataSeries",
  generatePunchedDataSeries: "generatePunchedDataSeries",
  limitArray: "limitArray",
  setTotalSamples: "setTotalSamples",
};

function getDataTaskConfig(channel, samples) {
  console.log(
    "Executing FunctionDeclaration getDataTaskConfig from file CompiledWorker.js at line 1995"
  );

  return {
    name: DATA_GENERATOR_TASKS.generateDataSeries,
    data: {
      channel,
      samples,
    },
  };
}

function getPunchedDataTaskConfig(channel, samples) {
  console.log(
    "Executing FunctionDeclaration getPunchedDataTaskConfig from file CompiledWorker.js at line 2005"
  );

  return {
    name: DATA_GENERATOR_TASKS.generatePunchedDataSeries,
    data: {
      channel,
      samples,
    },
  };
}

function getLimitArrayTaskConfig(channel, channelData, limitFactor) {
  console.log(
    "Executing FunctionDeclaration getLimitArrayTaskConfig from file CompiledWorker.js at line 2015"
  );

  return {
    name: DATA_GENERATOR_TASKS.limitArray,
    data: {
      channel,
      channelData,
      limitFactor,
    },
  };
}
//#if _DEVELOPMENT
//importScripts();
//#endif

workerpool.worker({
  [DATA_GENERATOR_TASKS.generateDataSeries]: (data) => {
    console.log(
      "Executing ArrowFunctionExpression from file CompiledWorker.js at line 2030"
    );

    return generateDataSeries(
      data.samples,
      data.channel.dataMin,
      data.channel.dataMax,
      data.channel.smoothing,
      data.channel.displacement,
      data.channel.displacementRatio,
      data.channel.easingType,
      data.channel.start,
      data.channel.end
    );
  },
  [DATA_GENERATOR_TASKS.generatePunchedDataSeries]: (data) => {
    console.log(
      "Executing ArrowFunctionExpression from file CompiledWorker.js at line 2043"
    );

    return generatePunchedDataSeries(
      data.samples,
      data.channel.dataMin,
      data.channel.dataMax,
      data.channel.smoothing,
      data.channel.displacement,
      data.channel.displacementRatio,
      data.channel.easingType,
      data.channel.start,
      data.channel.end
    );
  },
  [DATA_GENERATOR_TASKS.setTotalSamples]: (data) => {
    console.log(
      "Executing ArrowFunctionExpression from file CompiledWorker.js at line 2056"
    );

    setTotalSamples(data.samples);
  },
  [DATA_GENERATOR_TASKS.limitArray]: (data) => {
    console.log(
      "Executing ArrowFunctionExpression from file CompiledWorker.js at line 2059"
    );

    return limitArray(
      data.channelData,
      data.dataMin,
      data.dataMax,
      data.limitFactor
    );
  },
});
