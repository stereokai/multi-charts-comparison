import replace from "@rollup/plugin-replace";
import { readdirSync, readFileSync, statSync } from "fs";
import { join, resolve } from "path";
import copy from "rollup-plugin-copy-merge";
import jscc from "rollup-plugin-jscc";
import { defineConfig } from "vite";
import dynamicImport from "vite-plugin-dynamic-import";
import handlebars from "vite-plugin-handlebars";
import { default as toolbarConfiguration } from "./models/ui.js";
import { aliasesForVite } from "./pathbroker.mjs";

function toPosixPath(address) {
  return address.replace(/\\/g, "/");
}
function getDirectories(srcPath) {
  return readdirSync(srcPath).filter((file) =>
    statSync(join(srcPath, file)).isDirectory()
  );
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
const renderers = getDirectories(resolve(__dirname, "renderers"))
  .map((dirName) => `"${dirName}"`)
  .join(",");

const replaceRules = {
  "//#ALG_ESM_IMPORTS": algImp,
  "//#ALGORITHM": algSrc,
  "//#ALG_ESM_EXPORTS": algExp,
  "//#DATA_GENERATOR_TASKS": dataGeneratorTasks,
  "//#RENDERERS": renderers,
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
    dynamicImport(),
  ],
  resolve: {
    alias: [...aliasesForVite],
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks(id) {
          id = id.replace(__dirname, "").toLowerCase();

          if (id.includes("workerpool")) {
            return "workerpool";
          }
          if (id.includes("echarts@") || id.includes("zrender@")) {
            return "echarts";
          }
          if (id.includes("echarts")) {
            return "echarts.renderer";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
