import { DEFAULT_CONFIG, normalizeConfig } from "./config.js";

const LATEST_API_RESPONSE_KEY = "latestApiResponse";

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

export function saveLatestApiResponse(result) {
  return new Promise((resolve, reject) => {
    chrome.storage.session.set({ [LATEST_API_RESPONSE_KEY]: result }, () => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(result);
    });
  });
}

export function getLatestApiResponse() {
  return new Promise((resolve, reject) => {
    chrome.storage.session.get(LATEST_API_RESPONSE_KEY, (storedData) => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(storedData[LATEST_API_RESPONSE_KEY] || null);
    });
  });
}
