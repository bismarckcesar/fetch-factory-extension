(function initializeFetchFactoryCapture() {
  if (window.__FETCH_FACTORY_CAPTURE_READY__) {
    return;
  }

  window.__FETCH_FACTORY_CAPTURE_READY__ = true;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || message.type !== "CAPTURE_HTML") {
      return false;
    }

    try {
      const html = document.documentElement ? document.documentElement.outerHTML : "";
      sendResponse({ ok: true, html });
    } catch {
      sendResponse({
        ok: false,
        message: "Nao foi possivel capturar o HTML."
      });
    }

    return false;
  });
})();
