export const RENDERERS = [
  //#RENDERERS
];

let hash = location.hash.substring(1).toLowerCase();
console.log(hash);
export const renderer = RENDERERS.find(
  (renderer) => renderer.toLowerCase() === hash
);

if (!renderer) {
  location.hash = `${RENDERERS[0].toLowerCase()}`;
  location.reload();
} else {
  window.addEventListener(
    "hashchange",
    () => {
      location.reload();
    },
    false
  );
}
