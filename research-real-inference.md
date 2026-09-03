# Pesquisa para a revisão real do ClusterAI

## Conclusões

O aplicativo precisa separar três níveis que não devem ser confundidos: descoberta de dispositivos, inventário verificável e inferência distribuída. Descobrir um telefone na rede não soma automaticamente a memória ou o processador dele ao modelo; a inferência distribuída precisa dividir pesos/camadas ou tarefas, sincronizar estados e transportar tensores entre nós.

O Android oferece o Network Service Discovery (NSD), baseado em DNS-SD/mDNS, para anunciar e descobrir serviços na rede local. Isso é adequado para localizar instâncias do ClusterAI e resolver uma porta dinâmica, mas não fornece por si só autenticação, telemetria ou inferência.

Para executar um modelo localmente, há dois caminhos documentados. O llama.cpp possui integração Android, suporta modelos GGUF e fornece bindings nativos com aceleração de hardware conforme o dispositivo. O ExecuTorch fornece bibliotecas Android AAR, API Java/Kotlin e integração JNI para modelos exportados, incluindo casos de LLM. Ambos exigem um módulo nativo Android; o Expo/React Native sozinho não executa esses runtimes.

## Arquitetura recomendada

A primeira implementação real deve usar um app Android com camada nativa para: medir recursos do próprio aparelho; registrar o serviço NSD; aceitar/recusar pareamento; carregar um modelo local escolhido pelo usuário; e executar inferência. O React Native deve ser a camada de interface e coordenação visual.

O chat deve possuir estados explícitos: “nenhum modelo carregado”, “modelo carregando”, “modelo pronto”, “cluster conectado” e “inferência em andamento”. Sem runtime nativo e sem arquivo de modelo, o botão de enviar deve permanecer desabilitado ou explicar a condição, nunca inventar uma resposta.

## Dados permitidos na UI

| Dado | Fonte válida |
|---|---|
| IP local | API de rede do dispositivo, quando disponível |
| Tipo de rede | estado de conectividade do dispositivo |
| Bateria | API de bateria do dispositivo |
| Nome do aparelho | nome fornecido pelo sistema ou definido pelo usuário |
| Memória e CPU | API nativa Android; se indisponível, mostrar “não disponível” |
| Porta | socket/serviço efetivamente aberto pelo app; nunca um número fixo de demonstração |
| Modelo | arquivo/modelo realmente encontrado e validado no aparelho |
| Uso e latência | medições da execução atual; nunca valores pré-preenchidos |
| Outros nós | apenas peers realmente descobertos e autenticados |

## Fontes consultadas

1. Android Developers, “Use network service discovery”: https://developer.android.com/develop/connectivity/wifi/use-nsd
2. ggml-org/llama.cpp, “Android”: https://github.com/ggml-org/llama.cpp/blob/master/docs/android.md
3. PyTorch ExecuTorch, “Using ExecuTorch on Android”: https://docs.pytorch.org/executorch/1.0/using-executorch-android.html
4. Google for Developers, “Nearby Connections Overview”: https://developers.google.com/nearby/connections/overview
