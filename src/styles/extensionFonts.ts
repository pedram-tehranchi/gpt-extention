/**
 * Font-face CSS using extension URLs so Shadow DOM on chatgpt.com can load fonts.
 */
export function getExtensionFontFaceCss(): string {
  const regular = chrome.runtime.getURL('fonts/PlusJakartaSans-Regular.woff2');
  const medium = chrome.runtime.getURL('fonts/PlusJakartaSans-Medium.woff2');
  const semibold = chrome.runtime.getURL('fonts/PlusJakartaSans-SemiBold.woff2');

  return `
@font-face {
  font-family: 'Plus Jakarta Sans';
  src: url('${regular}') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Plus Jakarta Sans';
  src: url('${medium}') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Plus Jakarta Sans';
  src: url('${semibold}') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
`.trim();
}

export function withExtensionFonts(contentCss: string): string {
  return `${getExtensionFontFaceCss()}\n${contentCss}`;
}
