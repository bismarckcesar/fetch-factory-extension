import { validateEndpointUrl, validatePayloadType } from "../shared/config.js";
import { getConfig, saveConfig } from "../shared/storage.js";

const form = document.querySelector("#options-form");
const endpointUrlInput = document.querySelector("#endpoint-url");
const payloadTypeInput = document.querySelector("#payload-type");
const statusElement = document.querySelector("#status");

initOptions();

async function initOptions() {
  try {
    const config = await getConfig();
    endpointUrlInput.value = config.endpointUrl;
    payloadTypeInput.value = config.payloadType;
  } catch {
    setStatus("Nao foi possivel carregar a configuracao.", "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const endpointUrl = endpointUrlInput.value.trim();
  const validation = validateEndpointUrl(endpointUrl);
  const typeValidation = validatePayloadType(payloadTypeInput.value);

  if (!validation.ok) {
    setStatus(validation.message, "error");
    return;
  }

  if (!typeValidation.ok) {
    setStatus(typeValidation.message, "error");
    return;
  }

  try {
    await saveConfig({
      endpointUrl,
      payloadType: payloadTypeInput.value,
      autoSendEnabled: false
    });

    setStatus("Configuracao salva.", "success");
  } catch {
    setStatus("Nao foi possivel salvar a configuracao.", "error");
  }
});

function setStatus(message, kind) {
  statusElement.textContent = message;
  statusElement.dataset.kind = kind;
}
