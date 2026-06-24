export interface SiteAdapter {
  id: string;
  matches: (url: URL) => boolean;
  init: () => () => void;
}
