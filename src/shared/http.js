import { validateEndpointUrl } from "./config.js";

export async function sendCapturedHtml({ endpointUrl, html }) {
  const validation = validateEndpointUrl(endpointUrl);

  if (!validation.ok) {
    throw new Error(validation.message);
  }

  if (typeof html !== "string" || !html.trim()) {
    throw new Error("Nenhum HTML foi capturado para envio.");
  }

  const response = await fetch(validation.url.href, {
    method: "POST",
    headers: {
      "Content-Type": "text/html; charset=UTF-8"
    },
    body: html,
    credentials: "omit",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`O endpoint respondeu com status ${response.status}.`);
  }

  return {
    status: response.status
  };
}
