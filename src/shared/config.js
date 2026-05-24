export const DEFAULT_CONFIG = {
  endpointUrl: "",
  payloadType: "asurascans",
  autoSendEnabled: false
};

const LOCAL_HTTP_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const UNSUPPORTED_PAGE_PROTOCOLS = new Set([
  "about:",
  "brave:",
  "chrome:",
  "chrome-extension:",
  "edge:"
]);

export function normalizeConfig(config = {}) {
  return {
    endpointUrl: typeof config.endpointUrl === "string" ? config.endpointUrl.trim() : "",
    payloadType: typeof config.payloadType === "string" ? config.payloadType.trim() : DEFAULT_CONFIG.payloadType,
    autoSendEnabled: Boolean(config.autoSendEnabled)
  };
}

export function validatePayloadType(payloadType) {
  const normalizedType = typeof payloadType === "string" ? payloadType.trim() : "";

  if (!normalizedType) {
    return {
      ok: false,
      message: "Configure o type antes de enviar."
    };
  }

  return {
    ok: true,
    value: normalizedType
  };
}

export function validateEndpointUrl(endpointUrl) {
  const trimmedUrl = typeof endpointUrl === "string" ? endpointUrl.trim() : "";

  if (!trimmedUrl) {
    return {
      ok: false,
      message: "Configure a URL do endpoint antes de enviar."
    };
  }

  let url;

  try {
    url = new URL(trimmedUrl);
  } catch {
    return {
      ok: false,
      message: "A URL do endpoint e invalida."
    };
  }

  if (url.username || url.password) {
    return {
      ok: false,
      message: "A URL do endpoint nao deve conter usuario ou senha."
    };
  }

  const isHttps = url.protocol === "https:";
  const isLocalHttp = url.protocol === "http:" && LOCAL_HTTP_HOSTS.has(url.hostname);

  if (!isHttps && !isLocalHttp) {
    return {
      ok: false,
      message: "Use HTTPS ou HTTP apenas para localhost."
    };
  }

  return {
    ok: true,
    url
  };
}

export function getEndpointOriginPattern(endpointUrl) {
  const validation = validateEndpointUrl(endpointUrl);

  if (!validation.ok) {
    return null;
  }

  return `${validation.url.protocol}//${validation.url.host}/*`;
}

export function isUnsupportedPageUrl(pageUrl) {
  if (!pageUrl) {
    return false;
  }

  try {
    const url = new URL(pageUrl);
    return UNSUPPORTED_PAGE_PROTOCOLS.has(url.protocol);
  } catch {
    return true;
  }
}
