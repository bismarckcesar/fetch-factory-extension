# Fetch Factory Extension

Extensao Manifest V3 para Chrome/Brave que captura o HTML da aba atual e envia para um endpoint HTTP configuravel pelo usuario.

## Estado

Primeira versao funcional, sem build step e sem dependencias externas.

Fluxo implementado:

1. O usuario abre o popup.
2. Configura a URL do endpoint e o `type` do payload.
3. Clica em `Capturar e enviar`.
4. A extensao captura o HTML da aba atual.
5. O background envia um `POST` JSON para o endpoint configurado.
6. A extensao abre uma nova aba interna exibindo o JSON retornado pela API.

## Contrato da API

Metodo:

```text
POST
```

Headers:

```text
Content-Type: application/json; charset=UTF-8
```

Body:

```json
{
  "type": "<type-configurado>",
  "html": "<html>...</html>"
}
```

O valor inicial sugerido para `type` e `asurascans`, mas ele pode ser alterado no popup ou na tela de opcoes.

Retorno esperado:

```json
{
  "ok": true
}
```

O retorno pode ter qualquer estrutura JSON valida. A extensao mostra esse JSON em uma nova aba.

## Estrutura

```text
/
|-- manifest.json
|-- package.json
|-- README.md
|-- AGENTS.md
|-- .codex/
|   `-- agents/
|-- src/
|   |-- background/
|   |   `-- service-worker.js
|   |-- content/
|   |   `-- capture-html.js
|   |-- options/
|   |   |-- options.html
|   |   |-- options.css
|   |   `-- options.js
|   |-- popup/
|   |   |-- popup.html
|   |   |-- popup.css
|   |   `-- popup.js
|   |-- result/
|   |   |-- result.html
|   |   |-- result.css
|   |   `-- result.js
|   `-- shared/
|       |-- config.js
|       |-- http.js
|       `-- storage.js
`-- tests/
    `-- manual/
```

## Como carregar no Chrome/Brave

1. Abra `chrome://extensions` ou `brave://extensions`.
2. Ative o modo de desenvolvedor.
3. Clique em `Load unpacked` ou `Carregar sem compactacao`.
4. Selecione a raiz deste projeto.
5. Abra uma pagina comum da web.
6. Abra o popup da extensao.
7. Configure um endpoint HTTPS ou `http://localhost`.
8. Configure o `type` do payload, por exemplo `asurascans`.
9. Clique em `Capturar e enviar`.
10. Confirme que uma nova aba abre com o JSON retornado pela API.

## Regras de seguranca

- O endpoint nunca e hardcoded.
- O `type` do payload e configuravel e salvo nas configuracoes da extensao.
- O HTML capturado nao e salvo em storage persistente.
- O HTML capturado nao e registrado em logs.
- A URL do endpoint e validada antes do envio.
- O envio automatico nao possui controle na interface nesta primeira versao.
- A extensao pede permissao apenas para a origem do endpoint configurado. O manifest declara permissoes opcionais para `https://*/*` porque o endpoint e configuravel pelo usuario, e limita `http://` a `localhost` e `127.0.0.1` para desenvolvimento local.
- A aba de resultado mostra apenas o JSON retornado pela API.
- Se a API devolver campos com nomes sensiveis como `html`, `body`, `content`, `document`, `pageHtml` ou `capturedHtml`, a aba de resultado mostra esses valores como redigidos.

## Endpoint de teste local

Use um endpoint local controlado durante desenvolvimento:

```bash
npm run start:local-endpoint
```

Depois configure o endpoint como:

```text
http://localhost:3000/capture
```

O endpoint local valida o JSON recebido e registra apenas metadados, nunca o HTML completo.
