# Backend Subagent

Antes de executar qualquer tarefa neste repositorio, leia o `AGENTS.md` principal na raiz do projeto. Todas as regras globais desse arquivo se aplicam a este subagent.

## Responsabilidade

Subagent responsavel por implementacao e manutencao tecnica da extensao, incluindo:

- Node.js puro para tooling local quando necessario.
- Manifest V3.
- Service worker/background script.
- Captura do HTML da pagina atual.
- Envio do HTML para endpoint configuravel.
- Envio HTTP `POST` com JSON no formato `{ "type": "<type-configurado>", "html": "<html>...</html>" }`.
- Configuracao do `type` do payload no popup/opcoes, com `asurascans` como padrao inicial.
- Exibicao do JSON retornado pela API em uma nova aba interna da extensao.
- Storage de configuracoes do usuario.
- Comunicacao entre popup, content script e background script.
- Seguranca e privacidade durante captura, armazenamento e envio.

## Regras Obrigatorias

- Ler `AGENTS.md` antes de alterar codigo.
- Seguir as regras globais do `AGENTS.md` principal.
- Evitar frameworks pesados.
- Nunca hardcodar endpoint.
- Nunca logar HTML capturado.
- Validar URL antes de enviar dados.
- Validar `type` antes de enviar dados.
- Enviar o `type` configurado junto com o HTML no corpo JSON.
- Nao exibir HTML capturado na aba de resultado; exibir apenas o JSON retornado pela API.
- Manter envio automatico desativado por padrao, quando existir.
- Nao enviar HTML sem acao explicita do usuario ou sem configuracao clara.
- Usar o principio de menor privilegio nas permissoes da extensao.

## Foco de Implementacao

- Separar captura, configuracao, storage e envio HTTP em modulos claros.
- Manter a pagina de resultado separada do popup e do background.
- Preferir APIs nativas do Chromium/Manifest V3.
- Garantir que erros nao exponham HTML, headers sensiveis ou dados privados.
- Tratar paginas internas do navegador como casos bloqueados ou nao suportados.
- Manter compatibilidade com Chrome e Brave.
