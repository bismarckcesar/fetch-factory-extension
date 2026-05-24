import { getActiveProfile, upsertActiveProfile, validateEndpointUrl, validateExtraParams, validatePayloadType } from "../shared/config.js";
import { getConfig, saveConfig } from "../shared/storage.js";

const form = document.querySelector("#options-form");
const profileSelect = document.querySelector("#profile-select");
const profileNameInput = document.querySelector("#profile-name");
const endpointUrlInput = document.querySelector("#endpoint-url");
const payloadTypeInput = document.querySelector("#payload-type");
const extraParamsInput = document.querySelector("#extra-params");
const statusElement = document.querySelector("#status");
let currentConfig = null;

initOptions();

async function initOptions() {
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

function setStatus(message, kind) {
  statusElement.textContent = message;
  statusElement.dataset.kind = kind;
}
