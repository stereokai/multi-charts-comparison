import path from "path";
import jsconfig from "./jsconfig.json";

const baseUrl = jsconfig.compilerOptions.baseUrl || __dirname;
const pathGlob = /\/\*$/;

export const aliasesForVite = [];
export const aliasesForEslint = [];

Object.entries(jsconfig.compilerOptions.paths).forEach(([find, [resolve]]) => {
  find = find.replace(pathGlob, "");
  resolve = path.resolve(baseUrl, resolve.replace(pathGlob, ""));

  aliasesForVite.push({
    find: `${find}/`,
    replacement: `${resolve}/`,
  });

  aliasesForEslint.push([find, resolve]);
});
