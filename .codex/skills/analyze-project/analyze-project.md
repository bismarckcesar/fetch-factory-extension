---
name: analyze-project
description: Analise completa deste projeto de extensao Chrome/Brave em JavaScript puro, com foco em Manifest V3, backend da extensao, seguranca, privacidade, storage, comunicacao interna, envio de HTML para endpoint configuravel e revisao geral. Use quando o usuario pedir uma auditoria, revisao completa, analise de seguranca ou levantamento de riscos do projeto inteiro usando os subagents existentes.
---

# Analyze Project

Use esta skill para analisar o projeto inteiro da extensao Chrome/Brave sem alterar codigo automaticamente.

## Leitura obrigatoria

Antes de iniciar qualquer analise, leia sempre estes arquivos, nesta ordem:

1. `AGENTS.md`
2. `.codex/agents/security.md`
3. `.codex/agents/reviewer.md`
4. `.codex/agents/backend.md`

Use o contexto combinado desses arquivos. Se algum arquivo nao existir ou nao puder ser lido, marque isso em `Contexto lido` e trate como risco de processo.

## Regra de nao modificacao

Nao altere codigo, configuracoes, manifests, testes ou documentacao durante a analise, a menos que o usuario peca explicitamente para corrigir algo.

Comandos permitidos por padrao devem ser de leitura, como listar arquivos, abrir arquivos e buscar padroes com `rg`. Evite comandos que instalem dependencias, iniciem servidores, formatem codigo, gerem arquivos ou modifiquem storage/local state.

## Como analisar

1. Leia o contexto obrigatorio.
2. Mapeie a estrutura do projeto com foco em:
   - `manifest.json`
   - `src/background/` ou service worker equivalente
   - `src/content/`
   - `src/popup/`
   - `src/options/`
   - `src/result/`
   - `src/shared/`
   - `package.json`
   - `tests/` e roteiros manuais
3. Revise arquivos relevantes buscando riscos com `rg`, incluindo:
   - `chrome.runtime`, `chrome.tabs`, `chrome.scripting`, `chrome.storage`
   - `fetch`, `XMLHttpRequest`, `postMessage`
   - `innerHTML`, `outerHTML`, `insertAdjacentHTML`
   - `eval`, `new Function`, inline scripts
   - `console.log`, `console.error`, `console.warn`
   - `endpoint`, `payloadType`, `asurascans`, `autoSend`
   - `content_security_policy`, `host_permissions`, `permissions`
4. Verifique se o contrato de envio esta preservado:
   - metodo `POST`
   - `Content-Type: application/json; charset=UTF-8`
   - corpo `{ type: payloadType, html }`
   - `payloadType` configuravel, com `asurascans` apenas como padrao inicial
   - endpoint configuravel, nunca hardcoded
   - retorno JSON exibido em aba interna da extensao
5. Trate HTML capturado como dado sensivel durante toda a revisao.
6. Se houver duvida sobre seguranca, classifique como risco e explique a incerteza.

## Criterios de severidade

Classifique como `Problemas criticos` quando houver risco de:

- envio de HTML sem acao explicita do usuario ou sem configuracao clara
- endpoint hardcoded ou URL nao validada antes de enviar HTML
- permissao ampla sem justificativa, especialmente `<all_urls>`
- armazenamento persistente de HTML capturado
- logs contendo HTML, tokens, headers sensiveis ou dados privados
- exposicao de HTML para paginas, outras extensoes, DOM inseguro ou mensagens globais
- `window.postMessage` inseguro ou confianca em mensagens da pagina
- XSS em popup/options/result que possa expor dados sensiveis
- `eval`, `new Function`, scripts inline ou CSP frouxa

Classifique como `Problemas importantes` quando houver:

- validacao incompleta de `payloadType`, headers ou URL
- tratamento de erro confuso, silencioso ou sem feedback util
- mistura excessiva de responsabilidades entre captura, storage, envio e UI
- ausencia de bloqueio claro para paginas internas (`chrome://`, `brave://`, `chrome-extension://`)
- fluxo de resultado que possa confundir JSON retornado com HTML capturado
- lacunas relevantes em testes manuais ou automatizados
- uso desnecessario de dependencias, build step ou APIs nao essenciais

Use `Sugestoes` para melhorias que reduzem manutencao, melhoram DX, documentacao ou testabilidade sem representar risco imediato.

## Areas obrigatorias

Cubra todas as areas abaixo, mesmo que seja para declarar que nao encontrou arquivos ou evidencias suficientes:

- Manifest V3 e permissoes
- Content script
- Background/service worker
- Popup/options
- Comunicacao interna
- Storage
- Endpoint configuravel
- Seguranca e privacidade
- Testabilidade

## Formato obrigatorio do relatorio

Responda sempre exatamente com esta estrutura de secoes:

```markdown
# Relatorio de Analise do Projeto

## Contexto lido
- AGENTS.md: sim/nao
- security.md: sim/nao
- reviewer.md: sim/nao
- backend.md: sim/nao

## Resumo executivo
Explicar em poucas linhas o estado geral do projeto.

## Problemas criticos
Listar falhas que podem causar vazamento de dados, permissoes perigosas ou envio indevido de HTML.

## Problemas importantes
Listar problemas que devem ser corrigidos, mas nao bloqueiam totalmente.

## Sugestoes
Melhorias de organizacao, DX, testes e manutencao.

## Analise por area

### Manifest V3 e permissoes
### Content script
### Background/service worker
### Popup/options
### Comunicacao interna
### Storage
### Endpoint configuravel
### Seguranca e privacidade
### Testabilidade

## Checklist final
- Permissoes minimas?
- Endpoint configuravel?
- HTML tratado como dado sensivel?
- Sem logs sensiveis?
- Sem storage permanente de HTML?
- Sem window.postMessage inseguro?
- Sem innerHTML inseguro?
- CSP restritiva?
- Fluxo de envio claro?
- Testes manuais definidos?

## Proximas acoes recomendadas
Listar no maximo 5 acoes prioritarias.
```

## Regras de saida

- Seja direto e especifico, com referencias a arquivos e linhas quando possivel.
- Nao inclua HTML capturado, tokens, headers privados ou dados sensiveis no relatorio.
- Se nao houver problemas em uma categoria, diga isso explicitamente.
- Se algo nao puder ser confirmado por falta de arquivo, teste ou contexto, marque como risco ou lacuna.
- Priorize seguranca, privacidade, menor privilegio e clareza do fluxo de envio.
