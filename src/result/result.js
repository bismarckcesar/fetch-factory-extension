import { getLatestApiResponse } from "../shared/storage.js";

const metadataElement = document.querySelector("#metadata");
const outputElement = document.querySelector("#json-output");

renderLatestApiResponse();

async function renderLatestApiResponse() {
  try {
    const result = await getLatestApiResponse();

    if (!result) {
      metadataElement.textContent = "Nenhum resultado encontrado nesta sessao.";
      outputElement.textContent = "{}";
      return;
    }

    metadataElement.textContent = `Status ${result.status} recebido em ${formatDate(result.receivedAt)}.`;
    outputElement.textContent = JSON.stringify(result.json, null, 2);
  } catch {
    metadataElement.textContent = "Nao foi possivel carregar o resultado.";
    outputElement.textContent = "{}";
  }
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "data desconhecida";
  }

  return date.toLocaleString("pt-BR");
}
