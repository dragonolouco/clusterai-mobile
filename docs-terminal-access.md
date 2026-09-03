# Acesso avançado por terminal

O modo normal do ClusterAI não exige que o usuário conheça ou digite uma porta. O aplicativo deve anunciar o serviço local por NSD/mDNS e resolver automaticamente os nós pareados.

O acesso por a‑Shell no iPhone ou por terminal no Android é um modo opcional de diagnóstico e automação. Ele só deve ser habilitado quando o serviço Android tiver aberto uma porta dinâmica real, o nó estiver autorizado e o terminal estiver na mesma rede local. O aplicativo deve mostrar o endereço, a porta, o transporte e o estado da sessão na aba **Rede e Porta**.

Nenhum comando pode ser documentado com um número fixo enquanto o serviço não estiver implementado. O formato planejado é equivalente a:

```text
curl http://<endereco-local>:<porta-descoberta>/health
curl http://<endereco-local>:<porta-descoberta>/cluster
```

Esses comandos são ilustrativos do protocolo futuro, não endpoints disponíveis na versão atual. O endpoint de saúde deve retornar apenas estado, versão do protocolo, identidade pública do nó e timestamp. O endpoint de cluster deve exigir autenticação e não deve entregar pesos do modelo ou dados de conversa sem uma sessão autorizada.

O protocolo final deve usar desafio-resposta ou token de sessão efêmero. Exibir uma porta não significa confiar automaticamente em qualquer cliente que tente acessá-la.
