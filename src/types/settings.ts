export interface ExtensionSettings {
  titlePrefixToRemove: string;
  autoAllowEnabled: boolean;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  titlePrefixToRemove: 'Daniel Brooks - ',
  autoAllowEnabled: false,
};
