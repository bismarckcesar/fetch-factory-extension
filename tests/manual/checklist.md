# Checklist Manual

- [ ] Carregar a extensao como unpacked no Chrome.
- [ ] Carregar a extensao como unpacked no Brave.
- [ ] Abrir uma pagina comum e executar `Capturar e enviar`.
- [ ] Confirmar que endpoint vazio bloqueia envio.
- [ ] Confirmar que type vazio bloqueia envio.
- [ ] Confirmar que URL invalida bloqueia envio.
- [ ] Confirmar que `http://` externo e bloqueado.
- [ ] Confirmar que `https://` e aceito.
- [ ] Confirmar que `http://localhost` e aceito.
- [ ] Confirmar que o endpoint recebe metodo `POST`.
- [ ] Confirmar que o endpoint recebe `Content-Type: application/json`.
- [ ] Confirmar que o payload contem o type configurado no popup/opcoes.
- [ ] Confirmar que o payload contem `html`.
- [ ] Confirmar que uma nova aba abre com o JSON retornado pela API.
- [ ] Confirmar que o console nao exibe HTML capturado.
- [ ] Confirmar que paginas `chrome://` ou `brave://` nao sao capturadas.
- [ ] Confirmar que falha de rede mostra erro no popup.
- [ ] Confirmar que a configuracao persiste ao reabrir o popup.
