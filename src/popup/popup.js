import { getEndpointOriginPattern, isUnsupportedPageUrl, validateEndpointUrl } from "../shared/config.js";
import { getConfig, saveConfig } from "../shared/storage.js";

const form = document.querySelector("#settings-form");
const endpointUrlInput = document.querySelector("#endpoint-url");
const autoSendEnabledInput = document.querySelector("#auto-send-enabled");
const captureButton = document.querySelector("#capture-button");
const statusElement = document.querySelector("#status");

initPopup();

async function initPopup() {
  try {
    const config = await getConfig();
    endpointUrlInput.value = config.endpointUrl;
    autoSendEnabledInput.checked = config.autoSendEnabled;
  } catch {
    setStatus("Nao foi possivel carregar a configuracao.", "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await saveCurrentConfig();
    setStatus("Configuracao salva.", "success");
  } catch {
    setStatus("Nao foi possivel salvar a configuracao.", "error");
  }
});

captureButton.addEventListener("click", async () => {
  const endpointUrl = endpointUrlInput.value.trim();
  const validation = validateEndpointUrl(endpointUrl);

  if (!validation.ok) {
    setStatus(validation.message, "error");
    return;
  }

  setBusy(true);
  setStatus("Capturando e enviando...", "");

  try {
    const hasPermission = await ensureEndpointPermission(endpointUrl);

    if (!hasPermission) {
      setStatus("Permissao para o endpoint nao foi concedida.", "error");
      return;
    }

    await saveCurrentConfig();

    const [tab] = await queryActiveTab();

    if (!tab || !Number.isInteger(tab.id)) {
      setStatus("Nenhuma aba ativa foi encontrada.", "error");
      return;
    }

    if (isUnsupportedPageUrl(tab.url)) {
      setStatus("Esta pagina nao permite captura pela extensao.", "error");
      return;
    }

    const result = await sendRuntimeMessage({
      type: "CAPTURE_AND_SEND_HTML",
      tabId: tab.id,
      tabUrl: tab.url
    });

    if (!result || !result.ok) {
      setStatus(result?.message || "Nao foi possivel enviar o HTML.", "error");
      return;
    }

    setStatus(`HTML enviado. Status ${result.status}.`, "success");
  } catch (error) {
    setStatus(error.message || "Nao foi possivel capturar e enviar.", "error");
  } finally {
    setBusy(false);
  }
});

function saveCurrentConfig() {
  return saveConfig({
    endpointUrl: endpointUrlInput.value,
    autoSendEnabled: autoSendEnabledInput.checked
  });
}

function ensureEndpointPermission(endpointUrl) {
  const originPattern = getEndpointOriginPattern(endpointUrl);

  if (!originPattern) {
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    chrome.permissions.request({ origins: [originPattern] }, (granted) => {
      const requestError = chrome.runtime.lastError;

      if (requestError) {
        reject(new Error(requestError.message));
        return;
      }

      resolve(Boolean(granted));
    });
  });
}

function queryActiveTab() {
  return chrome.tabs.query({
    active: true,
    currentWindow: true
  });
}

function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(response);
    });
  });
}

function setBusy(isBusy) {
  captureButton.disabled = isBusy;
}

function setStatus(message, kind) {
  statusElement.textContent = message;
  statusElement.dataset.kind = kind;
}
