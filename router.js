let hash = location.hash.substring(1).toLowerCase();
const allFeaturesFlag = "+extrafeatures";

export const hasAllFeatures = hash.lastIndexOf(allFeaturesFlag) > -1;

export const RENDERERS = [
  //#RENDERERS
];

hash = hash.substring(
  0,
  hasAllFeatures ? hash.lastIndexOf(allFeaturesFlag) : hash.length
);

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
