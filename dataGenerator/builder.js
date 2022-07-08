import { readdirSync, readFileSync, statSync } from "fs";
import { basename, join, parse } from "path";
import { toPosixPath } from "../utils.js";

const ALGORITHM_DIR = "algorithm";
const thisFile = basename(__filename);
const algorithmDirPath = join(__dirname, ALGORITHM_DIR);
const algorithmFiles = [];
const algorithmESModuleFiles = [];

getAlgorithmFiles(algorithmDirPath);

export const algorithmESModuleParts = [
  ...algorithmESModuleFiles,
  "../DataGeneratorTasks.js",
].reduce((o, file) => {
  o[getPleaceholder(file)] = readFileSync(
    join(algorithmDirPath, file)
  ).toString();
  return o;
}, {});

export const workerFiles = [
  ...algorithmFiles.map((file) => join(ALGORITHM_DIR, file)),
  "DataGeneratorTasks.js",
  "WorkerAPI.js",
].map((file) => toPosixPath(join(__dirname, file)));

function getAlgorithmFiles(srcPath) {
  readdirSync(srcPath).filter((file) => {
    if (statSync(join(srcPath, file)).isFile() && file !== thisFile) {
      if (file.indexOf(".esm.") > -1) {
        algorithmESModuleFiles.push(file);
      } else {
        algorithmFiles.push(file);
      }
    }
  });
}

function getPleaceholder(file) {
  return `//#${parse(file)
    .name.trim()
    .split(/(?=[A-Z])/)
    .join("_")
    .replace(/\./g, "_")
    .toUpperCase()}`;
}
