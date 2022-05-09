import replace from "@rollup/plugin-replace";
import { readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { defineConfig } from "vite";
import dynamicImport from "vite-plugin-dynamic-import";
import { aliasesForVite } from "./pathbroker.mjs";

function getDirectories(srcPath) {
  return readdirSync(srcPath).filter((file) =>
    statSync(join(srcPath, file)).isDirectory()
  );
}

const renderers = getDirectories(resolve(__dirname, "renderers"))
  .map((dirName) => `"${dirName}"`)
  .join(",");

const replaceRules = {
  "//#RENDERERS": renderers,
  delimiters: ["", ""],
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [replace(replaceRules), dynamicImport()],
  resolve: {
    alias: [...aliasesForVite],
  },
  build: {
    target: "esnext",
    minify: false,
  },
});
