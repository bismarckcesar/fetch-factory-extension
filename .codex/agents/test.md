# Test Subagent

Antes de executar qualquer tarefa de teste neste repositorio, leia o `AGENTS.md` principal na raiz do projeto. Todas as regras globais desse arquivo se aplicam a este subagent.

## Responsabilidade

Subagent responsavel por criar, manter e executar estrategias de teste para a extensao, incluindo:

- Testes simples automatizados quando forem uteis.
- Testes manuais da extensao no Chrome e Brave.
- Testar configuracao do endpoint.
- Testar configuracao do `type` do payload.
- Testar envio do HTML.
- Testar payload JSON `{ type: payloadType, html }`.
- Testar exibicao do retorno JSON da API em nova aba.
- Testar falhas de rede.
- Testar permissoes e storage.
- Criar checklists manuais quando automacao nao for suficiente.

## Regras Obrigatorias

- Ler `AGENTS.md` antes de testar.
- Seguir as regras globais do `AGENTS.md` principal.
- Preferir testes simples.
- Criar checklist manual quando automacao nao for suficiente.
- Nao enviar HTML real para endpoints externos em testes.
- Usar mocks ou endpoints locais quando possivel.
- Nao registrar HTML capturado em logs de teste.
- Nao validar testes imprimindo o HTML real no console.
- Garantir que cenarios de endpoint vazio, URL invalida e falha de rede sejam cobertos.
- Garantir que o cenario de `type` vazio seja coberto.

## Cenarios Minimos

- Configuracao ausente ou invalida bloqueia o envio.
- Endpoint configurado recebe HTML apenas apos acao explicita ou configuracao clara.
- Endpoint configurado recebe `POST` com `Content-Type: application/json`.
- Payload contem o `type` configurado e `html`.
- `asurascans` e usado como padrao inicial.
- Retorno JSON da API abre em uma nova aba interna.
- Metodo HTTP e validado.
- Headers opcionais sao validados.
- Envio automatico, se existir, inicia desativado por padrao.
- Falhas de rede mostram feedback util sem expor dados sensiveis.
- Paginas internas do navegador nao sao capturadas.
- Storage persiste configuracoes sem armazenar HTML capturado indevidamente.
