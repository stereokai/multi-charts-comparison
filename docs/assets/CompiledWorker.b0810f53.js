/**
 * workerpool.js
 * https://github.com/josdejong/workerpool
 *
 * Offload tasks to a pool of workers on node.js and in the browser.
 *
 * @version 6.2.0
 * @date    2022-01-15
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
 */(function(r,o){typeof exports=="object"&&typeof module=="object"?module.exports=o():typeof define=="function"&&define.amd?define("workerpool",[],o):typeof exports=="object"?exports.workerpool=o():r.workerpool=o()})(typeof self<"u"?self:this,function(){return function(){var __webpack_modules__={345:function(e,r,o){var u=o(219),m=o(751),d=o(828),k=o(833),l=new k;function p(n,i){typeof n=="string"?this.script=n||null:(this.script=null,i=n),this.workers=[],this.tasks=[],i=i||{},this.forkArgs=Object.freeze(i.forkArgs||[]),this.forkOpts=Object.freeze(i.forkOpts||{}),this.debugPortStart=i.debugPortStart||43210,this.nodeWorker=i.nodeWorker,this.workerType=i.workerType||i.nodeWorker||"auto",this.maxQueueSize=i.maxQueueSize||1/0,this.onCreateWorker=i.onCreateWorker||function(){return null},this.onTerminateWorker=i.onTerminateWorker||function(){return null},i&&"maxWorkers"in i?(_(i.maxWorkers),this.maxWorkers=i.maxWorkers):this.maxWorkers=Math.max((d.cpus||4)-1,1),i&&"minWorkers"in i&&(i.minWorkers==="max"?this.minWorkers=this.maxWorkers:(T(i.minWorkers),this.minWorkers=i.minWorkers,this.maxWorkers=Math.max(this.minWorkers,this.maxWorkers)),this._ensureMinWorkers()),this._boundNext=this._next.bind(this),this.workerType==="thread"&&m.ensureWorkerThreads()}p.prototype.exec=function(n,i,a){if(i&&!Array.isArray(i))throw new TypeError('Array expected as argument "params"');if(typeof n=="string"){var f=u.defer();if(this.tasks.length>=this.maxQueueSize)throw new Error("Max queue size of "+this.maxQueueSize+" reached");var v=this.tasks,y={method:n,params:i,resolver:f,timeout:null,options:a};v.push(y);var A=f.promise.timeout;return f.promise.timeout=function(M){return v.indexOf(y)!==-1?(y.timeout=M,f.promise):A.call(f.promise,M)},this._next(),f.promise}else{if(typeof n=="function")return this.exec("run",[String(n),i]);throw new TypeError('Function or string expected as argument "method"')}},p.prototype.proxy=function(){if(arguments.length>0)throw new Error("No arguments expected");var n=this;return this.exec("methods").then(function(i){var a={};return i.forEach(function(f){a[f]=function(){return n.exec(f,Array.prototype.slice.call(arguments))}}),a})},p.prototype._next=function(){if(this.tasks.length>0){var n=this._getWorker();if(n){var i=this,a=this.tasks.shift();if(a.resolver.promise.pending){var f=n.exec(a.method,a.params,a.resolver,a.options).then(i._boundNext).catch(function(){if(n.terminated)return i._removeWorker(n)}).then(function(){i._next()});typeof a.timeout=="number"&&f.timeout(a.timeout)}else i._next()}}},p.prototype._getWorker=function(){for(var n=this.workers,i=0;i<n.length;i++){var a=n[i];if(a.busy()===!1)return a}return n.length<this.maxWorkers?(a=this._createWorkerHandler(),n.push(a),a):null},p.prototype._removeWorker=function(n){var i=this;return l.releasePort(n.debugPort),this._removeWorkerFromList(n),this._ensureMinWorkers(),new u(function(a,f){n.terminate(!1,function(v){i.onTerminateWorker({forkArgs:n.forkArgs,forkOpts:n.forkOpts,script:n.script}),v?f(v):a(n)})})},p.prototype._removeWorkerFromList=function(n){var i=this.workers.indexOf(n);i!==-1&&this.workers.splice(i,1)},p.prototype.terminate=function(n,i){var a=this;this.tasks.forEach(function(O){O.resolver.reject(new Error("Pool terminated"))}),this.tasks.length=0;var f=function(M){this._removeWorkerFromList(M)},v=f.bind(this),y=[],A=this.workers.slice();return A.forEach(function(O){var M=O.terminateAndNotify(n,i).then(v).always(function(){a.onTerminateWorker({forkArgs:O.forkArgs,forkOpts:O.forkOpts,script:O.script})});y.push(M)}),u.all(y)},p.prototype.stats=function(){var n=this.workers.length,i=this.workers.filter(function(a){return a.busy()}).length;return{totalWorkers:n,busyWorkers:i,idleWorkers:n-i,pendingTasks:this.tasks.length,activeTasks:i}},p.prototype._ensureMinWorkers=function(){if(this.minWorkers)for(var n=this.workers.length;n<this.minWorkers;n++)this.workers.push(this._createWorkerHandler())},p.prototype._createWorkerHandler=function(){var n=this.onCreateWorker({forkArgs:this.forkArgs,forkOpts:this.forkOpts,script:this.script})||{};return new m(n.script||this.script,{forkArgs:n.forkArgs||this.forkArgs,forkOpts:n.forkOpts||this.forkOpts,debugPort:l.nextAvailableStartingAt(this.debugPortStart),workerType:this.workerType})};function _(n){if(!W(n)||!g(n)||n<1)throw new TypeError("Option maxWorkers must be an integer number >= 1")}function T(n){if(!W(n)||!g(n)||n<0)throw new TypeError("Option minWorkers must be an integer number >= 0")}function W(n){return typeof n=="number"}function g(n){return Math.round(n)==n}e.exports=p},219:function(e){"use strict";function r(d,k){var l=this;if(!(this instanceof r))throw new SyntaxError("Constructor must be called with the new operator");if(typeof d!="function")throw new SyntaxError("Function parameter handler(resolve, reject) missing");var p=[],_=[];this.resolved=!1,this.rejected=!1,this.pending=!0;var T=function(i,a){p.push(i),_.push(a)};this.then=function(n,i){return new r(function(a,f){var v=n?o(n,a,f):a,y=i?o(i,a,f):f;T(v,y)},l)};var W=function(i){return l.resolved=!0,l.rejected=!1,l.pending=!1,p.forEach(function(a){a(i)}),T=function(f,v){f(i)},W=g=function(){},l},g=function(i){return l.resolved=!1,l.rejected=!0,l.pending=!1,_.forEach(function(a){a(i)}),T=function(f,v){v(i)},W=g=function(){},l};this.cancel=function(){return k?k.cancel():g(new u),l},this.timeout=function(n){if(k)k.timeout(n);else{var i=setTimeout(function(){g(new m("Promise timed out after "+n+" ms"))},n);l.always(function(){clearTimeout(i)})}return l},d(function(n){W(n)},function(n){g(n)})}function o(d,k,l){return function(p){try{var _=d(p);_&&typeof _.then=="function"&&typeof _.catch=="function"?_.then(k,l):k(_)}catch(T){l(T)}}}r.prototype.catch=function(d){return this.then(null,d)},r.prototype.always=function(d){return this.then(d,d)},r.all=function(d){return new r(function(k,l){var p=d.length,_=[];p?d.forEach(function(T,W){T.then(function(g){_[W]=g,p--,p==0&&k(_)},function(g){p=0,l(g)})}):k(_)})},r.defer=function(){var d={};return d.promise=new r(function(k,l){d.resolve=k,d.reject=l}),d};function u(d){this.message=d||"promise cancelled",this.stack=new Error().stack}u.prototype=new Error,u.prototype.constructor=Error,u.prototype.name="CancellationError",r.CancellationError=u;function m(d){this.message=d||"timeout exceeded",this.stack=new Error().stack}m.prototype=new Error,m.prototype.constructor=Error,m.prototype.name="TimeoutError",r.TimeoutError=m,e.exports=r},751:function(e,r,o){"use strict";function u(s,c){var t=typeof Symbol<"u"&&s[Symbol.iterator]||s["@@iterator"];if(!t){if(Array.isArray(s)||(t=m(s))||c&&s&&typeof s.length=="number"){t&&(s=t);var h=0,b=function(){};return{s:b,n:function(){return h>=s.length?{done:!0}:{done:!1,value:s[h++]}},e:function(x){throw x},f:b}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var S=!0,P=!1,w;return{s:function(){t=t.call(s)},n:function(){var x=t.next();return S=x.done,x},e:function(x){P=!0,w=x},f:function(){try{!S&&t.return!=null&&t.return()}finally{if(P)throw w}}}}function m(s,c){if(!!s){if(typeof s=="string")return d(s,c);var t=Object.prototype.toString.call(s).slice(8,-1);if(t==="Object"&&s.constructor&&(t=s.constructor.name),t==="Map"||t==="Set")return Array.from(s);if(t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return d(s,c)}}function d(s,c){(c==null||c>s.length)&&(c=s.length);for(var t=0,h=new Array(c);t<c;t++)h[t]=s[t];return h}function k(s){return k=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(c){return typeof c}:function(c){return c&&typeof Symbol=="function"&&c.constructor===Symbol&&c!==Symbol.prototype?"symbol":typeof c},k(s)}var l=o(219),p=o(828),_=o(397),T="__workerpool-terminate__",W=1e3;function g(){var s=i();if(!s)throw new Error("WorkerPool: workerType = 'thread' is not supported, Node >= 11.7.0 required");return s}function n(){if(typeof Worker!="function"&&((typeof Worker>"u"?"undefined":k(Worker))!=="object"||typeof Worker.prototype.constructor!="function"))throw new Error("WorkerPool: Web Workers not supported")}function i(){try{return _("worker_threads")}catch(s){if(k(s)==="object"&&s!==null&&s.code==="MODULE_NOT_FOUND")return null;throw s}}function a(){if(p.platform==="browser"){if(typeof Blob>"u")throw new Error("Blob not supported by the browser");if(!window.URL||typeof window.URL.createObjectURL!="function")throw new Error("URL.createObjectURL not supported by the browser");var s=new Blob([o(670)],{type:"text/javascript"});return window.URL.createObjectURL(s)}else return __dirname+"/worker.js"}function f(s,c){if(c.workerType==="web")return n(),v(s,Worker);if(c.workerType==="thread")return t=g(),y(s,t);if(c.workerType==="process"||!c.workerType)return A(s,O(c),_("child_process"));if(p.platform==="browser")return n(),v(s,Worker);var t=i();return t?y(s,t):A(s,O(c),_("child_process"))}function v(s,c){var t=new c(s);return t.isBrowserWorker=!0,t.on=function(h,b){this.addEventListener(h,function(S){b(S.data)})},t.send=function(h){this.postMessage(h)},t}function y(s,c){var t=new c.Worker(s,{stdout:!1,stderr:!1});return t.isWorkerThread=!0,t.send=function(h){this.postMessage(h)},t.kill=function(){return this.terminate(),!0},t.disconnect=function(){this.terminate()},t}function A(s,c,t){var h=t.fork(s,c.forkArgs,c.forkOpts);return h.isChildProcess=!0,h}function O(s){s=s||{};var c=process.execArgv.join(" "),t=c.indexOf("--inspect")!==-1,h=c.indexOf("--debug-brk")!==-1,b=[];return t&&(b.push("--inspect="+s.debugPort),h&&b.push("--debug-brk")),process.execArgv.forEach(function(S){S.indexOf("--max-old-space-size")>-1&&b.push(S)}),Object.assign({},s,{forkArgs:s.forkArgs,forkOpts:Object.assign({},s.forkOpts,{execArgv:(s.forkOpts&&s.forkOpts.execArgv||[]).concat(b)})})}function M(s){for(var c=new Error(""),t=Object.keys(s),h=0;h<t.length;h++)c[t[h]]=s[t[h]];return c}function R(s,c){var t=this,h=c||{};this.script=s||a(),this.worker=f(this.script,h),this.debugPort=h.debugPort,this.forkOpts=h.forkOpts,this.forkArgs=h.forkArgs,s||(this.worker.ready=!0),this.requestQueue=[],this.worker.on("message",function(w){if(!t.terminated)if(typeof w=="string"&&w==="ready")t.worker.ready=!0,S();else{var E=w.id,x=t.processing[E];x!==void 0&&(w.isEvent?x.options&&typeof x.options.on=="function"&&x.options.on(w.payload):(delete t.processing[E],t.terminating===!0&&t.terminate(),w.error?x.resolver.reject(M(w.error)):x.resolver.resolve(w.result)))}});function b(w){t.terminated=!0;for(var E in t.processing)t.processing[E]!==void 0&&t.processing[E].resolver.reject(w);t.processing=Object.create(null)}function S(){var w=u(t.requestQueue.splice(0)),E;try{for(w.s();!(E=w.n()).done;){var x=E.value;t.worker.send(x)}}catch(D){w.e(D)}finally{w.f()}}var P=this.worker;this.worker.on("error",b),this.worker.on("exit",function(w,E){var x=`Workerpool Worker terminated Unexpectedly
`;x+="    exitCode: `"+w+"`\n",x+="    signalCode: `"+E+"`\n",x+="    workerpool.script: `"+t.script+"`\n",x+="    spawnArgs: `"+P.spawnargs+"`\n",x+="    spawnfile: `"+P.spawnfile+"`\n",x+="    stdout: `"+P.stdout+"`\n",x+="    stderr: `"+P.stderr+"`\n",b(new Error(x))}),this.processing=Object.create(null),this.terminating=!1,this.terminated=!1,this.terminationHandler=null,this.lastId=0}R.prototype.methods=function(){return this.exec("methods")},R.prototype.exec=function(s,c,t,h){t||(t=l.defer());var b=++this.lastId;this.processing[b]={id:b,resolver:t,options:h};var S={id:b,method:s,params:c};this.terminated?t.reject(new Error("Worker is terminated")):this.worker.ready?this.worker.send(S):this.requestQueue.push(S);var P=this;return t.promise.catch(function(w){if(w instanceof l.CancellationError||w instanceof l.TimeoutError)return delete P.processing[b],P.terminateAndNotify(!0).then(function(){throw w},function(E){throw E});throw w})},R.prototype.busy=function(){return Object.keys(this.processing).length>0},R.prototype.terminate=function(s,c){var t=this;if(s){for(var h in this.processing)this.processing[h]!==void 0&&this.processing[h].resolver.reject(new Error("Worker terminated"));this.processing=Object.create(null)}if(typeof c=="function"&&(this.terminationHandler=c),this.busy())this.terminating=!0;else{var b=function(w){if(t.terminated=!0,t.worker!=null&&t.worker.removeAllListeners&&t.worker.removeAllListeners("message"),t.worker=null,t.terminating=!1,t.terminationHandler)t.terminationHandler(w,t);else if(w)throw w};if(this.worker)if(typeof this.worker.kill=="function"){if(this.worker.killed){b(new Error("worker already killed!"));return}if(this.worker.isChildProcess){var S=setTimeout(function(){t.worker&&t.worker.kill()},W);this.worker.once("exit",function(){clearTimeout(S),t.worker&&(t.worker.killed=!0),b()}),this.worker.ready?this.worker.send(T):this.worker.requestQueue.push(T)}else this.worker.kill(),this.worker.killed=!0,b();return}else if(typeof this.worker.terminate=="function")this.worker.terminate(),this.worker.killed=!0;else throw new Error("Failed to terminate worker");b()}},R.prototype.terminateAndNotify=function(s,c){var t=l.defer();return c&&(t.promise.timeout=c),this.terminate(s,function(h,b){h?t.reject(h):t.resolve(b)}),t.promise},e.exports=R,e.exports._tryRequireWorkerThreads=i,e.exports._setupProcessWorker=A,e.exports._setupBrowserWorker=v,e.exports._setupWorkerThreadWorker=y,e.exports.ensureWorkerThreads=g},833:function(e){"use strict";var r=65535;e.exports=o;function o(){this.ports=Object.create(null),this.length=0}o.prototype.nextAvailableStartingAt=function(u){for(;this.ports[u]===!0;)u++;if(u>=r)throw new Error("WorkerPool debug port limit reached: "+u+">= "+r);return this.ports[u]=!0,this.length++,u},o.prototype.releasePort=function(u){delete this.ports[u],this.length--}},828:function(e,r,o){var u=o(397),m=function(p){return typeof p<"u"&&p.versions!=null&&p.versions.node!=null};e.exports.isNode=m,e.exports.platform=typeof process<"u"&&m(process)?"node":"browser";var d=k("worker_threads");e.exports.isMainThread=e.exports.platform==="node"?(!d||d.isMainThread)&&!process.connected:typeof Window<"u",e.exports.cpus=e.exports.platform==="browser"?self.navigator.hardwareConcurrency:u("os").cpus().length;function k(l){try{return u(l)}catch{return null}}},670:function(e){e.exports=`!function(){var __webpack_exports__={};!function(){var exports=__webpack_exports__,__webpack_unused_export__;function _typeof(r){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(r){return typeof r}:function(r){return r&&"function"==typeof Symbol&&r.constructor===Symbol&&r!==Symbol.prototype?"symbol":typeof r})(r)}var requireFoolWebpack=eval("typeof require !== 'undefined' ? require : function (module) { throw new Error('Module \\" + module + \\" not found.') }"),TERMINATE_METHOD_ID="__workerpool-terminate__",worker={exit:function(){}},WorkerThreads,parentPort;if("undefined"!=typeof self&&"function"==typeof postMessage&&"function"==typeof addEventListener)worker.on=function(r,e){addEventListener(r,function(r){e(r.data)})},worker.send=function(r){postMessage(r)};else{if("undefined"==typeof process)throw new Error("Script must be executed as a worker");try{WorkerThreads=requireFoolWebpack("worker_threads")}catch(error){if("object"!==_typeof(error)||null===error||"MODULE_NOT_FOUND"!==error.code)throw error}WorkerThreads&&null!==WorkerThreads.parentPort?(parentPort=WorkerThreads.parentPort,worker.send=parentPort.postMessage.bind(parentPort),worker.on=parentPort.on.bind(parentPort)):(worker.on=process.on.bind(process),worker.send=process.send.bind(process),worker.on("disconnect",function(){process.exit(1)}),worker.exit=process.exit.bind(process))}function convertError(o){return Object.getOwnPropertyNames(o).reduce(function(r,e){return Object.defineProperty(r,e,{value:o[e],enumerable:!0})},{})}function isPromise(r){return r&&"function"==typeof r.then&&"function"==typeof r.catch}worker.methods={},worker.methods.run=function(r,e){r=new Function("return ("+r+").apply(null, arguments);");return r.apply(r,e)},worker.methods.methods=function(){return Object.keys(worker.methods)};var currentRequestId=null;worker.on("message",function(e){if(e===TERMINATE_METHOD_ID)return worker.exit(0);try{var r=worker.methods[e.method];if(!r)throw new Error('Unknown method "'+e.method+'"');currentRequestId=e.id;var o=r.apply(r,e.params);isPromise(o)?o.then(function(r){worker.send({id:e.id,result:r,error:null}),currentRequestId=null}).catch(function(r){worker.send({id:e.id,result:null,error:convertError(r)}),currentRequestId=null}):(worker.send({id:e.id,result:o,error:null}),currentRequestId=null)}catch(r){worker.send({id:e.id,result:null,error:convertError(r)})}}),worker.register=function(r){if(r)for(var e in r)r.hasOwnProperty(e)&&(worker.methods[e]=r[e]);worker.send("ready")},worker.emit=function(r){currentRequestId&&worker.send({id:currentRequestId,isEvent:!0,payload:r})},__webpack_unused_export__=worker.register,worker.emit}()}();`},397:function(module){var requireFoolWebpack=eval(`typeof require !== 'undefined' ? require : function (module) { throw new Error('Module " + module + " not found.') }`);module.exports=requireFoolWebpack},744:function(__unused_webpack_module,exports){function _typeof(e){return _typeof=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(r){return typeof r}:function(r){return r&&typeof Symbol=="function"&&r.constructor===Symbol&&r!==Symbol.prototype?"symbol":typeof r},_typeof(e)}var requireFoolWebpack=eval(`typeof require !== 'undefined' ? require : function (module) { throw new Error('Module " + module + " not found.') }`),TERMINATE_METHOD_ID="__workerpool-terminate__",worker={exit:function e(){}};if(typeof self<"u"&&typeof postMessage=="function"&&typeof addEventListener=="function")worker.on=function(e,r){addEventListener(e,function(o){r(o.data)})},worker.send=function(e){postMessage(e)};else if(typeof process<"u"){var WorkerThreads;try{WorkerThreads=requireFoolWebpack("worker_threads")}catch(e){if(!(_typeof(e)==="object"&&e!==null&&e.code==="MODULE_NOT_FOUND"))throw e}if(WorkerThreads&&WorkerThreads.parentPort!==null){var parentPort=WorkerThreads.parentPort;worker.send=parentPort.postMessage.bind(parentPort),worker.on=parentPort.on.bind(parentPort)}else worker.on=process.on.bind(process),worker.send=process.send.bind(process),worker.on("disconnect",function(){process.exit(1)}),worker.exit=process.exit.bind(process)}else throw new Error("Script must be executed as a worker");function convertError(e){return Object.getOwnPropertyNames(e).reduce(function(r,o){return Object.defineProperty(r,o,{value:e[o],enumerable:!0})},{})}function isPromise(e){return e&&typeof e.then=="function"&&typeof e.catch=="function"}worker.methods={},worker.methods.run=function e(r,o){var u=new Function("return ("+r+").apply(null, arguments);");return u.apply(u,o)},worker.methods.methods=function e(){return Object.keys(worker.methods)};var currentRequestId=null;worker.on("message",function(e){if(e===TERMINATE_METHOD_ID)return worker.exit(0);try{var r=worker.methods[e.method];if(r){currentRequestId=e.id;var o=r.apply(r,e.params);isPromise(o)?o.then(function(u){worker.send({id:e.id,result:u,error:null}),currentRequestId=null}).catch(function(u){worker.send({id:e.id,result:null,error:convertError(u)}),currentRequestId=null}):(worker.send({id:e.id,result:o,error:null}),currentRequestId=null)}else throw new Error('Unknown method "'+e.method+'"')}catch(u){worker.send({id:e.id,result:null,error:convertError(u)})}}),worker.register=function(e){if(e)for(var r in e)e.hasOwnProperty(r)&&(worker.methods[r]=e[r]);worker.send("ready")},worker.emit=function(e){currentRequestId&&worker.send({id:currentRequestId,isEvent:!0,payload:e})},exports.add=worker.register,exports.emit=worker.emit}},__webpack_module_cache__={};function __webpack_require__(e){var r=__webpack_module_cache__[e];if(r!==void 0)return r.exports;var o=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e](o,o.exports,__webpack_require__),o.exports}var __webpack_exports__={};return function(){var e=__webpack_exports__,r=__webpack_require__(828);e.pool=function(u,m){var d=__webpack_require__(345);return new d(u,m)},e.worker=function(u){var m=__webpack_require__(744);m.add(u)},e.workerEmit=function(u){var m=__webpack_require__(744);m.emit(u)},e.Promise=__webpack_require__(219),e.platform=r.platform,e.isMainThread=r.isMainThread,e.cpus=r.cpus}(),__webpack_exports__}()});const easings=[function e(r,o=.65){const u=1-o;if(r===0||r===1)return r;const m=r*2,d=m-1,k=u/(2*Math.PI)*Math.asin(1);return m<1?-.5*(Math.pow(2,10*d)*Math.sin((d-k)*(2*Math.PI)/u)):Math.pow(2,-10*d)*Math.sin((d-k)*(2*Math.PI)/u)*.5+1},function e(r){const o=r/1;if(o<1/2.75)return 7.5625*o*o;if(o<2/2.75){const u=o-.5454545454545454;return 7.5625*u*u+.75}else if(o<2.5/2.75){const u=o-.8181818181818182;return 7.5625*u*u+.9375}else{const u=o-.9545454545454546;return 7.5625*u*u+.984375}},function e(r){const o=r-1;return o*o*o+1},function e(r,o=1.70158){const u=r/1-1;return u*u*((o+1)*u+o)+1}];function ease(e,...r){return easings[e](...r)}function easeOutBounce(e){const r=e/1;if(r<1/2.75)return 7.5625*r*r;if(r<2/2.75){const o=r-.5454545454545454;return 7.5625*o*o+.75}else if(r<2.5/2.75){const o=r-.8181818181818182;return 7.5625*o*o+.9375}else{const o=r-.9545454545454546;return 7.5625*o*o+.984375}}function easeInBounce(e){return 1-easeOutBounce(1-e)}const DEFAULT_DISPLACEMENT=20;let desiredPoints,iterations,actualPoints,base,powerOf2Plus1;function getRandom(e,r){return Math.random()*(r-e)+e}function getEasingStep(e){const r=1/iterations;return e*r}function setupAlgorithm(){iterations=Math.floor(Math.log(desiredPoints*2-1)/Math.log(2)),powerOf2Plus1=2**iterations+1,actualPoints=desiredPoints+(desiredPoints%2?1:0)}function setTotalSamples(e){e!==desiredPoints&&(desiredPoints=e,setupAlgorithm())}function generateDataSeries(e,r=getRandom(0,50),o=getRandom(50,100),u=1,m=null,d=.5,k,l,p){l=typeof l<"u"?l:getRandom(r,o),p=typeof p<"u"?p:getRandom(r,o),typeof e=="number"&&setTotalSamples(e);let _=m=="function"&&m(l,p)||typeof m=="number"&&m||(l+p)/2||l-p||DEFAULT_DISPLACEMENT,T=_;const W=!!easings[k];let g=1;const n=new Array(actualPoints).fill(0);for(n[0]=l;g<=iterations;){const i=~~(powerOf2Plus1/2**g),a=2**g-1;for(let f=i;f<=a*i&&!(f>actualPoints-1);f+=i*2){const v=n[f-i];let y=n[f+i];typeof y>"u"&&(y=p);let A=(v+y)/2;const O=Math.random()<d;n[f]=O?Math.min(o,A+_):Math.max(r,A-_),l===p&&g===1&&(n[f]=A)}W?_=(1-ease(k,getEasingStep(g)))*T:_=_*2**-u,g++}return{data:n,dataMin:r,dataMax:o}}function punchHolesInArray(e,r){const m=.2*e.length,d=(30+10)/100*e.length,k=10,l=k/100*e.length,p=20,T=(100-30)/(30/k)/100*e.length*.9,W=()=>Math.round(getRandom(l-p/100*l,l+p/100*l)),g=()=>Math.round(getRandom(T-p/100*T,T+p/100*T));let n=!0;const i=Math.round(getRandom(m,d));let a=0,f=0;for(;a<i&&f<=e.length;){if(n){const v=g(),y=f+v>e.length?e.length-f:v;f=f+y,n=!1}else{const v=W();let y=Math.min(f+v>e.length?e.length-f:v,i-a);if(typeof r>"u"){const A=e[f-1],M=(e[f+y+1]-A)/y;e.splice(f,y,...[...new Array(y)].map((R,s)=>A+M*s))}else e.splice(f,y,...new Array(y).fill(NaN));a+=y,f+=y,n=!0}if(a>=e.length||f>=e.length)break}return e}function generatePunchedDataSeries(...e){const{data:r,dataMin:o,dataMax:u}=generateDataSeries(...e);return{data:punchHolesInArray(r),dataMin:o,dataMax:u}}const DATA_GENERATOR_TASKS={generateDataSeries:"generateDataSeries",generatePunchedDataSeries:"generatePunchedDataSeries",setTotalSamples:"setTotalSamples"};function getDataTaskConfig(e,r){return{name:DATA_GENERATOR_TASKS.generateDataSeries,data:{channel:e,samples:r}}}function getPunchedDataTaskConfig(e,r){return{name:DATA_GENERATOR_TASKS.generatePunchedDataSeries,data:{channel:e,samples:r}}}workerpool.worker({[DATA_GENERATOR_TASKS.generateDataSeries]:e=>generateDataSeries(e.samples,e.channel.dataMin,e.channel.dataMax,e.channel.smoothing,e.channel.displacement,e.channel.displacementRatio,e.channel.easingType,e.channel.start,e.channel.end),[DATA_GENERATOR_TASKS.generatePunchedDataSeries]:e=>generatePunchedDataSeries(e.samples,e.channel.dataMin,e.channel.dataMax,e.channel.smoothing,e.channel.displacement,e.channel.displacementRatio,e.channel.easingType,e.channel.start,e.channel.end),[DATA_GENERATOR_TASKS.setTotalSamples]:e=>{setTotalSamples(e.samples)}});
