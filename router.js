let pathname = document.location.pathname.toLowerCase();
const allFeaturesFlag = "+extrafeatures";

export const hasAllFeatures = pathname.lastIndexOf(allFeaturesFlag) > -1;

export const RENDERERS = [
  //#RENDERERS
];

pathname = pathname.substring(
  pathname.lastIndexOf("/") + 1,
  hasAllFeatures ? pathname.lastIndexOf(allFeaturesFlag) : pathname.length
);

export const renderer = RENDERERS.find(
  (renderer) => renderer.toLowerCase() === pathname
);

if (!renderer) document.location.pathname = `/${RENDERERS[0].toLowerCase()}`;
