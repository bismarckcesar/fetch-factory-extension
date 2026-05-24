# AGENTS.md

## 1. Visao Geral do Projeto

Este repositorio contem uma extensao para Brave/Google Chrome escrita em JavaScript puro com Node.js apenas para tooling local, quando necessario.

A extensao deve usar Manifest V3 e tem como objetivo capturar o HTML da pagina atual e enviar esse conteudo para um endpoint HTTP configuravel pelo usuario.

Principios centrais:

- Evitar frameworks pesados.
- Manter o codigo simples, legivel e bem organizado.
- Usar APIs nativas do navegador sempre que possivel.
- Proteger a privacidade do usuario por padrao.
- Nunca enviar HTML da pagina sem acao explicita do usuario ou sem configuracao clara.
- Nunca registrar HTML capturado em logs.
- Nunca hardcodar endpoint no codigo-fonte.

## 2. Estrutura Sugerida de Pastas

A estrutura abaixo e uma sugestao para manter o projeto claro e facil de manter:

```text
/
├── AGENTS.md
├── manifest.json
├── package.json
├── README.md
├── src/
│   ├── background/
│   │   └── service-worker.js
│   ├── content/
│   │   └── capture-html.js
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── options/
│   │   ├── options.html
│   │   ├── options.js
│   │   └── options.css
│   ├── shared/
│   │   ├── config.js
│   │   ├── http.js
│   │   └── storage.js
│   └── assets/
│       └── icons/
└── tests/
    └── manual/
```

Responsabilidades sugeridas:

- `manifest.json`: declaracao MV3, permissoes, scripts, popup, options page e icons.
- `src/background/service-worker.js`: coordenacao entre popup, content scripts, configuracao e envio HTTP.
- `src/content/capture-html.js`: captura do HTML da pagina atual, sem logs e sem envio direto se isso nao for explicitamente necessario.
- `src/popup/`: interface para acao manual, status e controles rapidos.
- `src/options/`: configuracao persistente do endpoint, metodo, headers opcionais e envio automatico.
- `src/shared/`: funcoes reutilizaveis para storage, validacao de configuracao e envio HTTP.
- `tests/manual/`: roteiros de teste manual, quando forem adicionados.

## Subagents

Este projeto possui subagents em `.codex/agents` para dividir responsabilidades de trabalho:

- `backend.md`: implementacao da extensao, Manifest V3, captura, storage, envio HTTP e seguranca.
- `reviewer.md`: revisao de codigo, privacidade, permissoes, Manifest V3 e riscos antes de finalizar.
- `test.md`: testes simples, checklists manuais, endpoint local/mock, falhas de rede, permissoes e storage.

Antes de qualquer subagent executar tarefas, ele deve sempre ler este `AGENTS.md` principal na raiz do projeto. Todos os subagents devem seguir estas regras globais alem das instrucoes especificas do seu arquivo em `.codex/agents`.

## 3. Regras de Desenvolvimento

- Usar Manifest V3.
- Preferir JavaScript puro, HTML e CSS simples.
- Evitar dependencias desnecessarias.
- Manter cada arquivo com uma responsabilidade clara.
- Preferir funcoes pequenas e nomes descritivos.
- Separar captura, configuracao e envio HTTP em modulos distintos.
- Tratar erros de forma explicita e amigavel para o usuario.
- Nao introduzir build step se o projeto puder funcionar diretamente como extensao unpacked.
- Se um build step for necessario, documentar claramente como executar e onde fica a saida carregavel no navegador.
- Nao alterar permissoes do `manifest.json` sem justificar a necessidade.
- Preservar o principio de menor privilegio.

## 4. Convencoes de Codigo JavaScript

- Usar JavaScript moderno compativel com extensoes Chromium atuais.
- Preferir `const` por padrao e `let` apenas quando houver reatribuicao.
- Evitar `var`.
- Usar `async`/`await` para codigo assincromo.
- Usar nomes claros, por exemplo `endpointUrl`, `httpMethod`, `customHeaders`, `autoSendEnabled`.
- Evitar abreviacoes obscuras.
- Validar entradas vindas do usuario antes de usar.
- Isolar acesso a `chrome.storage` em helpers.
- Isolar chamadas HTTP em uma funcao dedicada.
- Evitar estado global mutavel quando nao for necessario.
- Comentarios devem explicar decisoes importantes, nao repetir o que o codigo ja mostra.
- Nao registrar dados sensiveis em `console.log`, especialmente HTML capturado, headers privados ou respostas com informacoes sensiveis.

Exemplo de separacao desejada:

```js
// Bom: envio HTTP isolado e configuracao recebida como argumento.
async function sendCapturedHtml({ endpointUrl, httpMethod, customHeaders, html }) {
  // validar configuracao antes do envio
}
```

## 5. Como Lidar com Permissoes da Extensao

Permissoes devem ser minimas e justificadas.

Permissoes comuns para este projeto podem incluir:

- `storage`: salvar configuracoes do usuario.
- `activeTab`: acessar a pagina atual apos acao explicita do usuario.
- `scripting`: injetar ou executar codigo de captura quando necessario no Manifest V3.

Evite pedir permissoes amplas como:

- `<all_urls>` sem necessidade real.
- `tabs` quando `activeTab` for suficiente.
- host permissions globais sem uma justificativa clara.

Regras:

- Prefira `activeTab` para captura iniciada pelo usuario.
- Para envio automatico, avalie cuidadosamente quais host permissions sao realmente necessarias.
- Se uma permissao nova for adicionada, documente o motivo no PR ou na alteracao.
- Nunca adicione permissoes apenas por conveniencia.
- Permissoes para o endpoint devem considerar que a URL e configuravel pelo usuario. Valide a URL em runtime e evite assumir hosts fixos.

## 6. Como Lidar com Configuracao do Endpoint

O endpoint deve ser sempre configuravel pelo usuario.

Configuracoes esperadas:

- URL do endpoint.
- Metodo HTTP, provavelmente `POST` por padrao.
- Headers opcionais.
- Ativar/desativar envio automatico.

Regras importantes:

- Nunca hardcodar endpoint no codigo-fonte.
- Nunca enviar HTML se a URL do endpoint estiver vazia, invalida ou ambigua.
- Validar se a URL usa `https://`, exceto em ambiente local de desenvolvimento quando isso estiver documentado.
- Validar metodo HTTP contra uma lista permitida, por exemplo `POST` e opcionalmente `PUT`.
- Validar headers opcionais antes de enviar.
- Nao permitir headers perigosos ou controlados pelo navegador, como `Host`, `Content-Length`, `Origin` e similares.
- Armazenar configuracoes em `chrome.storage.sync` ou `chrome.storage.local`, conforme a necessidade do projeto.
- Tratar configuracao ausente como estado normal e mostrar uma mensagem clara ao usuario.

Formato sugerido para configuracao:

```js
const defaultConfig = {
  endpointUrl: '',
  httpMethod: 'POST',
  customHeaders: {},
  autoSendEnabled: false
};
```

## 7. Cuidados de Seguranca e Privacidade ao Capturar HTML

HTML de uma pagina pode conter dados pessoais, tokens, informacoes privadas, conteudo de sessoes autenticadas e dados sensiveis.

Regras obrigatorias:

- Nunca envie HTML da pagina sem acao explicita do usuario ou sem configuracao clara.
- Nunca registre HTML capturado em logs.
- Nunca hardcodar endpoint no codigo-fonte.
- O usuario deve conseguir entender para onde o HTML sera enviado.
- O usuario deve conseguir desativar envio automatico.
- O envio automatico deve vir desativado por padrao.
- Nao capture HTML em paginas internas do navegador, como `chrome://`, `brave://` ou `chrome-extension://`.
- Nao tente burlar restricoes do navegador para paginas protegidas.
- Nao salve HTML capturado em storage persistente, salvo se houver uma necessidade explicita, documentada e aprovada pelo usuario.
- Evite expor HTML capturado na UI, exceto em preview explicitamente solicitado e com cuidado.
- Nao inclua cookies manualmente em requests.
- Nao colete dados adicionais alem do necessario para a funcionalidade.

Quando houver erro:

- Mostre mensagens genericas e uteis.
- Nao inclua HTML capturado em mensagens de erro.
- Nao inclua headers sensiveis nos logs.

## 8. Como Testar Manualmente a Extensao no Chrome/Brave

Roteiro basico:

1. Abra Chrome ou Brave.
2. Acesse `chrome://extensions` ou `brave://extensions`.
3. Ative o modo de desenvolvedor.
4. Clique em `Load unpacked` ou `Carregar sem compactacao`.
5. Selecione a pasta do projeto ou a pasta de build documentada.
6. Abra uma pagina comum da web para teste.
7. Abra o popup da extensao.
8. Configure a URL do endpoint na pagina de opcoes, se ainda nao estiver configurada.
9. Execute uma captura manual.
10. Verifique se o endpoint recebeu o HTML esperado.
11. Confirme que o console nao contem o HTML capturado.
12. Teste comportamento com endpoint vazio, URL invalida e falha de rede.
13. Teste que o envio automatico fica desativado por padrao.
14. Teste ativar e desativar envio automatico, se essa funcionalidade existir.
15. Teste paginas onde a captura deve falhar ou ser bloqueada, como `chrome://extensions`.

Sugestoes para endpoint local de teste:

- Usar um servidor HTTP local simples apenas durante desenvolvimento.
- Documentar claramente qualquer uso de `http://localhost`.
- Nao trocar a regra de producao que deve preferir `https://`.

## 9. O Que Evitar

- Nao usar frameworks pesados sem necessidade.
- Nao adicionar bundlers, transpiladores ou toolchains complexas sem motivo claro.
- Nao hardcodar endpoint, tokens ou headers privados.
- Nao enviar HTML automaticamente por padrao.
- Nao capturar mais dados do que o HTML necessario.
- Nao registrar HTML capturado em logs.
- Nao armazenar HTML capturado em storage persistente sem aprovacao explicita.
- Nao adicionar permissoes amplas ao Manifest V3 sem justificativa.
- Nao misturar UI, captura, storage e envio HTTP no mesmo arquivo quando isso puder ser evitado.
- Nao mascarar falhas de envio; o usuario deve receber feedback claro.
- Nao depender de APIs indisponiveis em Manifest V3.
- Nao quebrar compatibilidade com Brave quando usar APIs Chromium.

## 10. Checklist Antes de Finalizar Alteracoes

Antes de concluir qualquer alteracao, verifique:

- [ ] A extensao continua usando Manifest V3.
- [ ] O endpoint nao esta hardcoded no codigo-fonte.
- [ ] O HTML capturado nao e registrado em logs.
- [ ] O HTML nao e enviado sem acao explicita do usuario ou sem configuracao clara.
- [ ] O envio automatico, se existir, esta desativado por padrao.
- [ ] A URL do endpoint e validada antes do envio.
- [ ] O metodo HTTP e validado contra uma lista permitida.
- [ ] Headers opcionais sao validados e nao incluem headers proibidos.
- [ ] Permissoes no `manifest.json` seguem o principio de menor privilegio.
- [ ] Paginas internas do navegador sao tratadas com erro claro ou bloqueio seguro.
- [ ] Erros nao expoem HTML, tokens, headers sensiveis ou dados privados.
- [ ] O codigo esta organizado em responsabilidades claras.
- [ ] Nao foram adicionadas dependencias pesadas sem necessidade.
- [ ] O fluxo manual foi testado em Chrome ou Brave.
- [ ] A configuracao ausente ou invalida mostra feedback util ao usuario.
- [ ] Documentacao relevante foi atualizada quando necessario.




