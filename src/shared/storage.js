import { DEFAULT_CONFIG, normalizeConfig } from "./config.js";

export function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_CONFIG, (storedConfig) => {
      resolve(normalizeConfig(storedConfig));
    });
  });
}

export function saveConfig(config) {
  const normalizedConfig = normalizeConfig(config);

  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(normalizedConfig, () => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(normalizedConfig);
    });
  });
}
