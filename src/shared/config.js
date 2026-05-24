export const DEFAULT_PROFILE_ID = "asurascans";

export const DEFAULT_PROFILES = [
  {
    id: "asurascans",
    name: "Asura Scans",
    endpointUrl: "",
    payloadType: "asurascans",
    extraParams: {
      paramcustom1: "",
      paramcustom2: ""
    }
  },
  {
    id: "generic",
    name: "Generico",
    endpointUrl: "",
    payloadType: "generic",
    extraParams: {}
  },
  {
    id: "custom",
    name: "Custom",
    endpointUrl: "",
    payloadType: "custom",
    extraParams: {}
  }
];

export const DEFAULT_CONFIG = {
  activeProfileId: DEFAULT_PROFILE_ID,
  profiles: DEFAULT_PROFILES,
  endpointUrl: "",
  payloadType: "asurascans",
  extraParams: {},
  autoSendEnabled: false
};

const LOCAL_HTTP_HOSTS = new Set(["localhost", "127.0.0.1"]);
const RESERVED_EXTRA_PARAM_KEYS = new Set(["type", "html"]);
const UNSUPPORTED_PAGE_PROTOCOLS = new Set([
  "about:",
  "brave:",
  "chrome:",
  "chrome-extension:",
  "edge:"
]);

export function normalizeConfig(config = {}) {
  const profiles = normalizeProfiles(config);
  const activeProfileId = profiles.some((profile) => profile.id === config.activeProfileId)
    ? config.activeProfileId
    : profiles[0].id;
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId) || profiles[0];

  return {
    activeProfileId,
    profiles,
    endpointUrl: activeProfile.endpointUrl,
    payloadType: activeProfile.payloadType,
    extraParams: activeProfile.extraParams,
    autoSendEnabled: Boolean(config.autoSendEnabled)
  };
}

export function getActiveProfile(config) {
  const normalizedConfig = normalizeConfig(config);
  return normalizedConfig.profiles.find((profile) => profile.id === normalizedConfig.activeProfileId) || normalizedConfig.profiles[0];
}

export function upsertActiveProfile(config, profileUpdates) {
  const normalizedConfig = normalizeConfig(config);
  const activeProfileId = typeof profileUpdates.activeProfileId === "string"
    ? profileUpdates.activeProfileId
    : normalizedConfig.activeProfileId;
  const profiles = normalizedConfig.profiles.map((profile) => {
    if (profile.id !== activeProfileId) {
      return profile;
    }

    return normalizeProfile({
      ...profile,
      ...profileUpdates
    }, profile);
  });

  return normalizeConfig({
    ...normalizedConfig,
    activeProfileId,
    profiles
  });
}

function normalizeProfiles(config) {
  const defaultProfiles = DEFAULT_PROFILES.map((profile) => normalizeProfile(profile));
  const incomingProfiles = Array.isArray(config.profiles) ? config.profiles : [];
  const profilesById = new Map(defaultProfiles.map((profile) => [profile.id, profile]));

  for (const profile of incomingProfiles) {
    const normalizedProfile = normalizeProfile(profile);
    profilesById.set(normalizedProfile.id, normalizedProfile);
  }

  if (!incomingProfiles.length && (config.endpointUrl || config.payloadType || config.extraParams)) {
    profilesById.set(DEFAULT_PROFILE_ID, normalizeProfile({
      ...profilesById.get(DEFAULT_PROFILE_ID),
      endpointUrl: config.endpointUrl,
      payloadType: config.payloadType,
      extraParams: config.extraParams
    }));
  }

  return Array.from(profilesById.values());
}

function normalizeProfile(profile = {}, fallback = {}) {
  const fallbackId = typeof fallback.id === "string" ? fallback.id : DEFAULT_PROFILE_ID;
  const fallbackName = typeof fallback.name === "string" ? fallback.name : fallbackId;
  const fallbackPayloadType = typeof fallback.payloadType === "string" ? fallback.payloadType : DEFAULT_CONFIG.payloadType;

  return {
    id: normalizeProfileId(profile.id, fallbackId),
    name: typeof profile.name === "string" && profile.name.trim() ? profile.name.trim() : fallbackName,
    endpointUrl: typeof profile.endpointUrl === "string" ? profile.endpointUrl.trim() : "",
    payloadType: typeof profile.payloadType === "string" && profile.payloadType.trim() ? profile.payloadType.trim() : fallbackPayloadType,
    extraParams: normalizeExtraParams(profile.extraParams)
  };
}

function normalizeProfileId(profileId, fallbackId) {
  if (typeof profileId !== "string") {
    return fallbackId;
  }

  const normalizedId = profileId.trim();
  return /^[a-zA-Z0-9._:-]{1,80}$/.test(normalizedId) ? normalizedId : fallbackId;
}

function normalizeExtraParams(extraParams) {
  if (!isPlainObject(extraParams)) {
    return {};
  }

  return Object.fromEntries(Object.entries(extraParams).map(([key, value]) => [key.trim(), value]).filter(([key]) => key));
}

export function validatePayloadType(payloadType) {
  const normalizedType = typeof payloadType === "string" ? payloadType.trim() : "";

  if (!normalizedType) {
    return {
      ok: false,
      message: "Configure o type antes de enviar."
    };
  }

  if (normalizedType.length > 80 || !/^[a-zA-Z0-9._:-]+$/.test(normalizedType)) {
    return {
      ok: false,
      message: "Use um type com ate 80 caracteres, contendo apenas letras, numeros, ponto, hifen, dois-pontos ou underline."
    };
  }

  return {
    ok: true,
    value: normalizedType
  };
}

export function validateExtraParams(extraParams) {
  if (!isPlainObject(extraParams)) {
    return {
      ok: false,
      message: "Parametros extras devem ser um objeto JSON."
    };
  }

  for (const key of Object.keys(extraParams)) {
    if (RESERVED_EXTRA_PARAM_KEYS.has(key)) {
      return {
        ok: false,
        message: "Parametros extras nao podem usar as chaves reservadas type ou html."
      };
    }

    if (key.length > 80 || !/^[a-zA-Z0-9._:-]+$/.test(key)) {
      return {
        ok: false,
        message: "Cada parametro extra deve usar apenas letras, numeros, ponto, hifen, dois-pontos ou underline."
      };
    }
  }

  try {
    JSON.stringify(extraParams);
  } catch {
    return {
      ok: false,
      message: "Parametros extras precisam ser serializaveis em JSON."
    };
  }

  return {
    ok: true,
    value: extraParams
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

  return `${validation.url.protocol}//${validation.url.hostname}/*`;
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

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
