import svg from "./areazoom.svg?raw";
export { svg };

let rect, startX;

export function init(container) {
  container.insertAdjacentHTML("beforeend", svg);
  rect = document.getElementById("areazoom-rect");
}

export function setHeight(height) {
  rect.setAttribute("height", height);
}

export function setPosition(x) {
  startX = x;
  rect.setAttribute("x", x);
}

export function move(x) {
  if (x > startX) {
    rect.setAttribute("width", x - startX);
  } else {
    rect.setAttribute("width", startX - x);
    rect.setAttribute("x", x);
  }
}

export function hide() {
  const x = rect.getAttribute("x");
  const width = rect.getAttribute("width");
  rect.setAttribute("width", 0);

  return { x: x | 0, width: width | 0 };
}
