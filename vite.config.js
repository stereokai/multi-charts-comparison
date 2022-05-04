import replace from "@rollup/plugin-replace";
import { readFileSync } from "fs";
import { resolve } from "path";
import copy from "rollup-plugin-copy-merge";
import jscc from "rollup-plugin-jscc";
import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
import { default as toolbarConfiguration } from "./models/ui.js";

function toPosixPath(address) {
  return address.replace(/\\/g, "/");
}

// Sources
const workerpool = "node_modules/workerpool/dist/workerpool.js";
const algSrc = readFileSync(
  resolve(__dirname, "dataGenerator", "algorithm.src.js")
).toString();
const algImp = readFileSync(
  resolve(__dirname, "dataGenerator", "algorithm.imports.js")
).toString();
const algExp = readFileSync(
  resolve(__dirname, "dataGenerator", "algorithm.exports.js")
).toString();
const dataGeneratorTasks = readFileSync(
  resolve(__dirname, "dataGenerator", "DataGeneratorTasks.js")
).toString();

const replaceRules = {
  "//#ALG_ESM_IMPORTS": algImp,
  "//#ALGORITHM": algSrc,
  "//#ALG_ESM_EXPORTS": algExp,
  "//#DATA_GENERATOR_TASKS": dataGeneratorTasks,
  delimiters: ["", ""],
};

const jsccRules = {
  values: {
    _DEVELOPMENT: process.env.NODE_ENV === "development",
  },
  options: {
    asloader: false,
  },
};

const copyTargets = [
  {
    src: [
      toPosixPath(resolve(__dirname, "dataGenerator", "algorithm.src.js")),
      toPosixPath(resolve(__dirname, "dataGenerator", "DataGeneratorTasks.js")),
      toPosixPath(
        resolve(__dirname, "dataGenerator", "DataGeneratorWorker.js")
      ),
    ],
    file: toPosixPath(resolve(__dirname, "dataGenerator", "CompiledWorker.js")),
  },
];

if (process.env.NODE_ENV === "production") {
  copyTargets[0].src.unshift(
    toPosixPath(resolve(__dirname, ...workerpool.split("/")))
  );
}
if (process.env.NODE_ENV === "development") {
  replaceRules["//importScripts()"] = `importScripts("/${workerpool}")`;
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    copy({
      hook: "buildStart",
      targets: copyTargets,
    }),
    replace(replaceRules),
    jscc(jsccRules),
    handlebars({
      context: {
        toolbar: toolbarConfiguration,
      },
      partialDirectory: resolve(__dirname, "partials"),
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          workerpool: ["workerpool"],
          echarts: ["echarts"],
        },
      },
    },
  },
});
