import replace from "@rollup/plugin-replace";
import { readFileSync } from "fs";
import { resolve } from "path";
import jscc from "rollup-plugin-jscc";
import { defineConfig } from "vite";
import handlebars from "vite-plugin-handlebars";
// import manifest from "./dist/manifest.json";
import toolbarConfiguration from "./toolbarConfiguration.js";

const algSrc = readFileSync(
  resolve(__dirname, "dataGenerator", "algorithm.src.js")
).toString();
const algImp = readFileSync(
  resolve(__dirname, "dataGenerator", "algorithm.imports.js")
).toString();
const algExp = readFileSync(
  resolve(__dirname, "dataGenerator", "algorithm.exports.js")
).toString();
const utils = readFileSync(resolve(__dirname, "utils.js")).toString();

const imports = {};
// manifest["index.html"].imports.reduce((obj, item) => {
//   obj[item.slice(1).split(".")[0]] = manifest[item].file;
//   return obj;
// }, {});

const replaceRules = {
  "//#ALG_ESM_IMPORTS": algImp,
  "//#ALGORITHM": algSrc,
  "//#ALG_ESM_EXPORTS": algExp,
  "//#IMPORT_UTILS": utils.replaceAll("export", ""),
  delimiters: ["", ""],
};

const jsccRules = {
  values: {
    _DEVELOPMENT: process.env.NODE_ENV === "development",
    _PRODUCTION: process.env.NODE_ENV === "production",
    _WORKERPOOL_IMPORT:
      process.env.NODE_ENV === "production"
        ? imports["workerpool"]
        : "node_modules/workerpool/dist/workerpool.js",
    _WORKER_IMPORT_PROD: imports["DataGeneratorWorker"],
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
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
    manifest: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          workerpool: ["workerpool"],
          echarts: ["echarts"],
          DataGeneratorWorker: ["./dataGenerator/DataGeneratorWorker.js"],
        },
      },
    },
  },
});
