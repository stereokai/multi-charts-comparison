export const RENDERERS = [
  //#RENDERERS
];

let pathname = document.location.pathname.toLowerCase();
pathname = pathname.substring(pathname.lastIndexOf("/") + 1);

export const renderer = RENDERERS.find(
  (renderer) => renderer.toLowerCase() === pathname
);

if (!renderer) document.location.pathname = `/${RENDERERS[0].toLowerCase()}`;
