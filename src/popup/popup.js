import { getActiveProfile, getEndpointOriginPattern, isUnsupportedPageUrl, upsertActiveProfile, validateEndpointUrl, validateExtraParams, validatePayloadType } from "../shared/config.js";
import { getConfig, saveConfig } from "../shared/storage.js";

const form = document.querySelector("#settings-form");
const profileSelect = document.querySelector("#profile-select");
const profileNameInput = document.querySelector("#profile-name");
const endpointUrlInput = document.querySelector("#endpoint-url");
const payloadTypeInput = document.querySelector("#payload-type");
const extraParamsInput = document.querySelector("#extra-params");
const openResultTabEnabledInput = document.querySelector("#open-result-tab-enabled");
const captureButton = document.querySelector("#capture-button");
const statusElement = document.querySelector("#status");
let currentConfig = null;

initPopup();

async function initPopup() {
  try {
    currentConfig = await getConfig();
    renderProfileOptions();
    fillActiveProfile();
  } catch {
    setStatus("Nao foi possivel carregar a configuracao.", "error");
  }
}

profileSelect.addEventListener("change", () => {
  currentConfig = {
    ...currentConfig,
    activeProfileId: profileSelect.value
  };
  fillActiveProfile();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    currentConfig = await saveConfig(buildConfigFromForm());
    renderProfileOptions();
    setStatus("Configuracao salva.", "success");
  } catch (error) {
    setStatus(error.message || "Nao foi possivel salvar a configuracao.", "error");
  }
});

captureButton.addEventListener("click", async () => {
  setBusy(true);
  setStatus("Capturando e enviando...", "");
  let feedbackTabId = null;

  try {
    const nextConfig = buildConfigFromForm();
    const activeProfile = getActiveProfile(nextConfig);
    const [tab] = await queryActiveTab();
    const tabId = Number.isInteger(tab?.id) ? tab.id : null;
    feedbackTabId = tabId;

    if (!tabId) {
      setFeedback("Nenhuma aba ativa foi encontrada.", "error", nextConfig.openResultTabEnabled, tabId);
      return;
    }

    if (isUnsupportedPageUrl(tab.url)) {
      setFeedback("Esta pagina nao permite captura pela extensao.", "error", nextConfig.openResultTabEnabled, tabId);
      return;
    }

    const hasPermission = await ensureEndpointPermission(activeProfile.endpointUrl);

    if (!hasPermission) {
      setFeedback("Permissao para o endpoint nao foi concedida.", "error", nextConfig.openResultTabEnabled, tabId);
      return;
    }

    currentConfig = await saveConfig(nextConfig);
    renderProfileOptions();

    const result = await sendRuntimeMessage({
      type: "CAPTURE_AND_SEND_HTML",
      tabId
    });

    if (!result || !result.ok) {
      setFeedback(result?.message || "Nao foi possivel enviar o HTML.", "error", nextConfig.openResultTabEnabled, tabId);
      return;
    }

    const resultTabMessage = result.resultTabOpened ? " Resultado aberto em nova aba." : " Aba de resultado desativada.";
    setFeedback(`HTML enviado. Status ${result.status}.${resultTabMessage}`, "success", result.resultTabOpened, tabId);
  } catch (error) {
    setFeedback(error.message || "Nao foi possivel capturar e enviar.", "error", openResultTabEnabledInput.checked, feedbackTabId);
  } finally {
    setBusy(false);
  }
});

function buildConfigFromForm() {
  const endpointValidation = validateEndpointUrl(endpointUrlInput.value);
  const typeValidation = validatePayloadType(payloadTypeInput.value);
  const extraParams = parseExtraParams();
  const extraParamsValidation = validateExtraParams(extraParams);

  if (!endpointValidation.ok) {
    throw new Error(endpointValidation.message);
  }

  if (!typeValidation.ok) {
    throw new Error(typeValidation.message);
  }

  if (!extraParamsValidation.ok) {
    throw new Error(extraParamsValidation.message);
  }

  return upsertActiveProfile(currentConfig, {
    activeProfileId: profileSelect.value,
    name: profileNameInput.value,
    endpointUrl: endpointUrlInput.value,
    payloadType: payloadTypeInput.value,
    extraParams: extraParamsValidation.value,
    openResultTabEnabled: openResultTabEnabledInput.checked,
    autoSendEnabled: false
  });
}

function renderProfileOptions() {
  profileSelect.replaceChildren();

  for (const profile of currentConfig.profiles) {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name;
    profileSelect.append(option);
  }

  profileSelect.value = currentConfig.activeProfileId;
}

function fillActiveProfile() {
  const activeProfile = getActiveProfile(currentConfig);

  profileNameInput.value = activeProfile.name;
  endpointUrlInput.value = activeProfile.endpointUrl;
  payloadTypeInput.value = activeProfile.payloadType;
  extraParamsInput.value = JSON.stringify(activeProfile.extraParams, null, 2);
  openResultTabEnabledInput.checked = currentConfig.openResultTabEnabled;
}

function parseExtraParams() {
  const rawValue = extraParamsInput.value.trim();

  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    throw new Error("Parametros extras devem ser um JSON valido.");
  }
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

function setFeedback(message, kind, resultTabOpened, tabId) {
  setStatus(message, kind);

  if (!resultTabOpened && Number.isInteger(tabId)) {
    showWindowAlert(tabId, message);
  }
}

function showWindowAlert(tabId, message) {
  sendRuntimeMessage({
    type: "SHOW_TAB_ALERT",
    tabId,
    message
  }).catch(() => {});
}
