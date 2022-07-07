import replace from "@rollup/plugin-replace";
import { readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import copy from "rollup-plugin-copy-merge";
import jscc from "rollup-plugin-jscc";
import { defineConfig } from "vite";
import dynamicImport from "vite-plugin-dynamic-import";
import handlebars from "vite-plugin-handlebars";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import {
  algorithmESModuleParts,
  workerFiles,
} from "./dataGenerator/builder.js";
import { default as toolbarConfiguration } from "./models/ui.js";
import { aliasesForVite } from "./pathbroker.mjs";
import { toPosixPath } from "./utils.js";

function getDirectories(srcPath) {
  return readdirSync(srcPath).filter((file) =>
    statSync(join(srcPath, file)).isDirectory()
  );
}

// Sources
const workerpool = "node_modules/workerpool/dist/workerpool.js";
const renderers = getDirectories(resolve(__dirname, "renderers"))
  .map((dirName) => `"${dirName}"`)
  .join(",");

const replaceRules = {
  ...algorithmESModuleParts,
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
    src: [...workerFiles],
    file: toPosixPath(resolve(__dirname, "dataGenerator", "CompiledWorker.js")),
  },
];

console.log(copyTargets);

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
    createSvgIconsPlugin({
      iconDirs: [resolve(__dirname, "assets/icons")],
      symbolId: "icon-[name]",
    }),
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
          // if (id.includes("@arction")) {
          //   return "lcjs";
          // }
          if (id.includes("echarts")) {
            return "echarts.renderer";
          }
          if (id.includes("lightningchart")) {
            return "lightningchart.renderer";
          }
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
