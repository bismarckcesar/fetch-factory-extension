import { isUnsupportedPageUrl } from "../shared/config.js";
import { sendCapturedHtml } from "../shared/http.js";
import { getConfig, saveLatestApiResponse } from "../shared/storage.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== "CAPTURE_AND_SEND_HTML") {
    return false;
  }

  captureAndSendHtml(message)
    .then((result) => {
      sendResponse({ ok: true, ...result });
    })
    .catch((error) => {
      sendResponse({
        ok: false,
        message: error.message || "Nao foi possivel capturar e enviar o HTML."
      });
    });

  return true;
});

async function captureAndSendHtml({ tabId }) {
  if (!Number.isInteger(tabId)) {
    throw new Error("Nenhuma aba ativa foi encontrada.");
  }

  const tab = await getTab(tabId);

  if (isUnsupportedPageUrl(tab.url)) {
    throw new Error("Esta pagina nao permite captura pela extensao.");
  }

  const config = await getConfig();
  await injectCaptureScript(tabId);

  const captureResult = await sendMessageToTab(tabId, {
    type: "CAPTURE_HTML"
  });

  if (!captureResult || !captureResult.ok) {
    throw new Error(captureResult?.message || "Nao foi possivel capturar o HTML da pagina.");
  }

  const sendResult = await sendCapturedHtml({
    endpointUrl: config.endpointUrl,
    payloadType: config.payloadType,
    html: captureResult.html
  });

  await saveLatestApiResponse({
    receivedAt: new Date().toISOString(),
    status: sendResult.status,
    json: redactSensitiveApiResponse(sendResult.json)
  });

  await openResultTab();

  if (!sendResult.ok) {
    throw new Error(`O endpoint respondeu com status ${sendResult.status}. O JSON retornado foi aberto em uma nova aba.`);
  }

  return {
    status: sendResult.status
  };
}

function redactSensitiveApiResponse(value) {
  const sensitiveKeys = new Set(["html", "body", "content", "document", "pageHtml", "capturedHtml"]);

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveApiResponse(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(Object.entries(value).map(([key, entryValue]) => {
    if (sensitiveKeys.has(key)) {
      return [key, "[redigido pela extensao]"];
    }

    return [key, redactSensitiveApiResponse(entryValue)];
  }));
}

function getTab(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.get(tabId, (tab) => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(tab);
    });
  });
}

function openResultTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("src/result/result.html")
    }, (tab) => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(tab);
    });
  });
}

function injectCaptureScript(tabId) {
  return chrome.scripting.executeScript({
    target: { tabId },
    files: ["src/content/capture-html.js"]
  });
}

function sendMessageToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(response);
    });
  });
}
