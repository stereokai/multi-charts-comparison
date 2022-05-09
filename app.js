import * as graphs from "@/Graphs/Graphs.js";

function init() {
  graphs.initGraph();
  console.log("this should log");
  graphs.on("finish", () => {
    console.log("dummy_log");
  });
}

if (document.readyState == "complete") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    init();
  });
}
