import { validateEndpointUrl, validateExtraParams, validatePayloadType } from "./config.js";

export async function sendCapturedHtml({ endpointUrl, payloadType, extraParams = {}, html }) {
  const validation = validateEndpointUrl(endpointUrl);

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const typeValidation = validatePayloadType(payloadType);

  if (!typeValidation.ok) {
    throw new Error(typeValidation.message);
  }

  const extraParamsValidation = validateExtraParams(extraParams);

  if (!extraParamsValidation.ok) {
    throw new Error(extraParamsValidation.message);
  }

  if (typeof html !== "string" || !html.trim()) {
    throw new Error("Nenhum HTML foi capturado para envio.");
  }

  const response = await fetch(validation.url.href, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify({
      type: typeValidation.value,
      html,
      ...extraParamsValidation.value
    }),
    credentials: "omit",
    cache: "no-store"
  });

  let json;

  try {
    json = await response.json();
  } catch {
    throw new Error("O endpoint nao retornou um JSON valido.");
  }

  return {
    ok: response.ok,
    status: response.status,
    json
  };
}
