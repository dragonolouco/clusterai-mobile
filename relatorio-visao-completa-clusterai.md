# Visão completa do ClusterAI: inferência distribuída em celulares heterogêneos

## Resumo executivo

A ideia é tecnicamente viável, mas não funciona como uma simples soma de “TOPS” ou como a abertura de uma porta entre celulares. O sistema precisa transformar aparelhos diferentes em uma **linha de processamento distribuída**: cada nó recebe uma parte do modelo, calcula sua etapa e envia ativações intermediárias ao próximo nó. O dispositivo mais forte pode receber mais camadas, mas essa decisão deve considerar não apenas CPU/GPU/NPU, mas também memória livre, velocidade sustentada, temperatura, bateria, latência e largura de banda.

A recomendação é construir o produto em etapas. Primeiro, descoberta, autenticação, medição e carregamento de um modelo em um único Android. Depois, distribuição de camadas em dois nós. Em seguida, scheduler heterogêneo, cache KV, recuperação de falhas e otimizações. O app Expo/React Native pode continuar sendo a interface, mas a inferência e a rede de baixa latência precisarão de módulos Android nativos em Kotlin/C++.

## 1. O que exatamente significa “juntar os celulares”

Existem três formas diferentes de colaboração e elas não devem ser confundidas.

| Técnica | O que cada aparelho faz | Aumenta o tamanho máximo do modelo? | Melhor uso |
|---|---|---:|---|
| Paralelismo de dados | Cada aparelho executa o modelo inteiro em entradas diferentes | Não | Muitas requisições simultâneas |
| Paralelismo de modelo por camadas | Cada aparelho mantém um conjunto de camadas e encaminha ativações | Sim | Fazer caber um modelo maior |
| Paralelismo tensorial | Uma operação matricial é dividida entre aparelhos | Sim, em teoria | Hardware rápido e rede de baixa latência |
| Pipeline paralelo | Diferentes estágios processam diferentes solicitações em sobreposição | Sim, quando combinado com model parallelism | Aumentar throughput com fila de requisições |
| Especulação | Um nó pequeno prevê tokens e um nó maior valida | Não necessariamente | Reduzir latência de geração |

Para o objetivo descrito, o núcleo é **paralelismo de modelo por camadas**, possivelmente organizado como pipeline. Em um Transformer decoder-only, os blocos normalmente têm dimensões de entrada/saída compatíveis, então é possível colocar sequências de blocos em nós diferentes. O nó inicial trata a entrada e o nó final calcula logits/amostragem; os nós intermediários processam blocos e transportam ativações. O trabalho MDI-LLM descreve justamente essa organização em nós com troca de ativações e atribuição de diferentes quantidades de blocos conforme a capacidade do dispositivo [1].

## 2. Por que o aparelho mais forte recebe mais trabalho

Uma divisão igual de camadas é incorreta quando os aparelhos são diferentes. Se o telefone A termina sua etapa em 20 ms e o telefone B demora 80 ms, todo o pipeline fica limitado pelo estágio B. O telefone A ficará ocioso esperando o mais lento, mesmo tendo capacidade sobrando.

A unidade correta é o **tempo de estágio**, não a quantidade bruta de camadas. Para um nó `i`, podemos estimar:

```text
stage_time_i = compute_time_i(layers_i, tokens, context)
             + receive_time_i(activation)
             + send_time_i(activation)
             + synchronization_overhead_i
```

O objetivo é escolher `layers_i` para que os tempos dos estágios sejam próximos, respeitando as restrições de memória:

```text
minimize max(stage_time_i)
subject to model_memory_i + kv_cache_i + runtime_memory_i <= free_memory_i * safety_factor
```

O `safety_factor` precisa deixar margem para o Android e para variação térmica. Não se deve usar toda a memória disponível, porque o sistema pode matar o processo ou provocar pressão de memória.

### Medição necessária

Cada nó deve executar um benchmark curto com o mesmo bloco representativo ou com uma pequena faixa de camadas. O benchmark deve medir throughput sustentado, não apenas um pico inicial. Também deve medir latência de rede em ambos os sentidos, jitter, perda de conexão, memória livre, bateria, estado de carregamento e estado térmico.

Um score inicial pode ser calculado apenas como mecanismo de ordenação, nunca como verdade absoluta:

```text
capacity_i = sustained_compute_i
              * memory_headroom_factor_i
              * network_factor_i
              * thermal_factor_i
              * battery_factor_i
```

Depois, o particionador atribui camadas aproximadamente na proporção dos `capacity_i`, mas corrige a divisão usando os tempos observados por estágio. O scheduler deve recalibrar entre sessões e pode reduzir a participação de um nó que aqueceu ou perdeu desempenho.

## 3. A rede é tão importante quanto o processador

A geração de texto é sequencial: para produzir o próximo token, a ativação precisa atravessar os estágios na ordem correta. Portanto, adicionar celulares pode aumentar a memória total e ainda assim piorar o tempo por token se as ativações forem grandes ou o Wi‑Fi tiver latência/jitter altos.

O sistema precisa separar duas métricas:

| Métrica | Significado | Objetivo |
|---|---|---|
| TTFT | Tempo até o primeiro token | Reduzir carregamento, prefill e sincronização inicial |
| TPOT | Tempo por token depois do primeiro | Balancear estágios e reduzir comunicação |
| Throughput | Tokens por segundo com várias requisições | Usar pipeline e evitar nós ociosos |
| Latência de ativação | Tempo de transporte entre estágios | Escolher topologia e pontos de divisão |
| Jitter | Variação da latência | Evitar que o pipeline fique esperando |

O cache KV é fundamental. Sem ele, cada novo token pode exigir que informações do contexto sejam recalculadas ou transmitidas em mensagens grandes. O trabalho MDI-LLM descreve o uso de KV cache para transmitir somente o estado necessário do último token e manter chaves/valores por sessão, reduzindo comunicação e computação repetida [1].

Para um cluster Wi‑Fi, a primeira versão deve preferir comunicação direta entre nós com mensagens binárias compactas, compressão opcional e backpressure. JSON pode ser usado para controle, descoberta e telemetria, mas não para transportar tensores em cada token.

## 4. Topologia recomendada

O aplicativo deve ter um **coordenador** e vários **workers**. O coordenador pode também processar uma parte do modelo, mas não deve ser um servidor central obrigatório para cada ativação se isso criar um gargalo.

O fluxo recomendado é:

```text
Usuário
  ↓
Coordenador: tokenizer, sessão, planejamento e amostragem
  ↓ ativação binária
Worker 1: camadas 0..a
  ↓ ativação + estado da sessão
Worker 2: camadas a+1..b
  ↓
Worker N: camadas finais
  ↓ logits ou token escolhido
Coordenador: próximo token, streaming e histórico
```

O projeto distributed-llama usa um nó raiz que carrega pesos, sincroniza o estado e processa sua própria fatia, além de workers que processam suas fatias. Também estabelece que o nó raiz precisa de mais memória que os workers [6]. Esse padrão é adequado para a primeira versão do ClusterAI, desde que o coordenador tenha mecanismos de heartbeat, timeout e replanejamento.

## 5. Descoberta, identidade e segurança

O Android NSD implementa DNS-SD/mDNS e permite anunciar e descobrir serviços em uma rede local, incluindo outros dispositivos móveis [2]. Isso resolve a descoberta de hostname, serviço e porta dinâmica, mas não resolve confiança. Um dispositivo malicioso na mesma rede poderia anunciar um serviço com o mesmo nome.

O protocolo precisa ter:

| Componente | Função |
|---|---|
| Identidade persistente do nó | Chave pública gerada na primeira execução |
| Anúncio NSD | Nome do serviço, versão e metadados mínimos |
| Desafio-resposta | Provar posse da chave privada sem transmiti-la |
| Pareamento | Confirmação inicial por código curto ou QR |
| Sessão | Nonce, chave efêmera e autenticação mútua |
| Telemetria | Somente dados autorizados pelo usuário |
| Revogação | Remover um nó e invalidar sua sessão |

A autenticação automática deve significar “reconectar um nó previamente pareado”, e não “confiar em qualquer APK encontrado”. O app deve exibir claramente quando o nó está apenas descoberto, quando está pareado e quando está autorizado a receber pesos ou ativações.

## 6. Runtime local do modelo

O React Native não é o motor de inferência. Para Android, há duas bases técnicas documentadas:

**llama.cpp.** A integração Android do llama.cpp inclui binding nativo, leitura de metadados GGUF e carregamento de modelos no armazenamento privado ou por `ContentResolver`. A documentação também descreve aceleração para diferentes capacidades de hardware Android/ChromeOS [3]. É uma opção prática para modelos GGUF e uma primeira prova de conceito.

**ExecuTorch.** O ExecuTorch fornece uma biblioteca Android AAR, APIs Java/Kotlin e JNI. A documentação mostra o carregamento de módulos `.pte` e execução de tensores via `Module`/`EValue` [4]. É uma opção mais orientada a modelos exportados e backends específicos.

A decisão deve ser feita depois de escolher o formato de modelo e o conjunto de aparelhos. Para um produto inicial focado em LLMs quantizados, GGUF + llama.cpp tende a reduzir o caminho até o primeiro protótipo. Para uma arquitetura controlada com exportação e backends móveis, ExecuTorch pode ser melhor.

## 7. Modelo de dados que o aplicativo realmente precisa

### Nó

```text
Node {
  nodeId: public-key fingerprint
  displayName: user-defined or system-provided
  appVersion
  protocolVersion
  role: coordinator | worker
  discoveryState: unseen | discovered | paired | authorized | offline
  localAddress: measured
  servicePort: runtime-assigned
  cpu/gpu/npu facts: native Android data when available
  freeMemoryBytes: measured
  batteryLevel: measured or unavailable
  chargingState: measured or unavailable
  thermalStatus: measured or unavailable
  benchmark: sustained throughput and timestamp
  assignedLayers: range
  modelId: verified local model identifier
  lastHeartbeat
}
```

### Sessão de inferência

```text
InferenceSession {
  sessionId
  modelId
  tokenizerId
  contextLength
  kvCachePolicy
  participants
  layerPlan
  status: idle | loading | ready | running | degraded | failed
  ttft
  tpot
  generatedTokens
  failureReason
}
```

O aplicativo não deve exibir `memory`, `TOPS`, `model`, `port` ou `latency` se esses campos não vierem de uma fonte real. Quando a API não existir ou o usuário não autorizar acesso, deve mostrar “Não disponível”.

## 8. Scheduler heterogêneo proposto

### Fase A: elegibilidade

O coordenador elimina nós que não têm o runtime compatível, não têm memória mínima, estão offline, estão em estado térmico crítico ou não foram autenticados. O modelo só pode ser carregado quando o arquivo e seus metadados tiverem sido validados.

### Fase B: benchmark

Cada nó elegível executa um teste curto. O teste deve ser cancelável, limitar temperatura e não usar a bateria como recurso infinito. Os resultados têm timestamp e confiança.

### Fase C: planejamento

O particionador ordena os nós pela capacidade medida, calcula uma primeira distribuição de camadas e testa estimativas de memória. O nó mais forte pode receber mais blocos; porém, se estiver distante na topologia ou tiver alta latência, pode ser melhor uma distribuição menos desigual para reduzir comunicação.

### Fase D: execução

O pipeline processa tokens e coleta métricas. O scheduler observa filas, tempo em cada estágio, retransmissões, bateria e temperatura. Ele não deve mover camadas no meio de uma geração sem uma estratégia de migração do KV cache.

### Fase E: adaptação

Entre requisições, o scheduler pode recalcular a divisão. Durante uma sessão, deve aplicar ações graduais: reduzir concorrência, pausar um worker, usar uma partição alternativa previamente carregada ou encerrar a sessão de modo explícito. Não deve fingir que o nó continua contribuindo quando ele caiu.

## 9. Estados de produto necessários

O app deve possuir pelo menos estes estados visíveis:

| Estado | Comportamento correto |
|---|---|
| Sem Wi‑Fi local | Informar que a descoberta local está indisponível |
| Procurando | Mostrar busca sem afirmar que encontrou peers |
| Encontrado, não pareado | Mostrar identidade mínima e pedir confirmação |
| Pareado, não autorizado | Aguardar autorização para participar de uma sessão |
| Nó autorizado | Mostrar telemetria verificada e heartbeat |
| Sem modelo | Chat desabilitado e explicação clara |
| Modelo carregando | Mostrar progresso baseado em bytes reais |
| Modelo pronto | Habilitar chat local |
| Cluster pronto | Mostrar participantes, plano de camadas e capacidade medida |
| Execução degradada | Informar quais nós saíram e se a sessão pode continuar |
| Falha | Mostrar causa, não substituir por números de demonstração |

## 10. Lacunas do código atual

| Lacuna | Impacto | Implementação necessária |
|---|---|---|
| Descoberta NSD/mDNS real | Nenhum peer real aparece | Módulo Android para registrar, descobrir e resolver serviço |
| Servidor/cliente local | Não existe transporte de ativações | Socket TCP/QUIC/WebSocket nativo com framing binário |
| Pareamento seguro | Não há autenticação real | Chaves, QR/código, desafio-resposta e revogação |
| Informações de CPU/RAM/thermal | A UI não pode medir tudo com Expo | Bridge Kotlin/Java para APIs Android |
| Runtime de modelo | O chat não gera texto | llama.cpp ou ExecuTorch integrado ao APK |
| Seleção de arquivo | Nenhum GGUF/PTE é carregado | Document picker, validação de formato e armazenamento |
| Tokenizer e sessão | Não há geração real | Tokenizer compatível, contexto e controle de cancelamento |
| Particionamento | Nenhuma camada é distribuída | Leitura de metadados, mapa de camadas e carregamento por nó |
| KV cache distribuído | Geração seria inviável em contexto maior | Estado por sessão, serialização e recuperação |
| Scheduler heterogêneo | Não existe equilíbrio real | Benchmark, estimativa, planejamento e adaptação |
| Falhas e reconexão | Um celular desligado quebraria a sessão | Heartbeat, timeout, replanejamento e estados degradados |
| Energia e temperatura | Risco de throttling e consumo excessivo | PowerManager, Battery, política térmica e limites configuráveis |
| Observabilidade | Usuário não sabe o que é real | Métricas medidas, timestamps, origem e logs técnicos |
| Testes multi-dispositivo | Preview web não representa Android real | Testes instrumentados com pelo menos dois aparelhos |

## 11. Roadmap recomendado

### Marco 1 — nó único real

Implementar seleção de um GGUF/PTE, validação, carregamento pelo runtime nativo, chat local, streaming de tokens, cancelamento e métricas reais de TTFT/TPOT. Antes disso, o chat deve permanecer desabilitado.

### Marco 2 — descoberta e inventário

Adicionar NSD/mDNS, identidade, pareamento, heartbeat e inventário. Cada telefone deve mostrar seus próprios fatos medidos. O coordenador deve visualizar peers reais, sem nomes ou valores inventados.

### Marco 3 — dois nós e paralelismo de camadas

Carregar um modelo compatível em dois aparelhos, dividir blocos, trocar ativações binárias e gerar uma resposta real. Começar com contexto pequeno e mensagens sem compressão para facilitar a depuração.

### Marco 4 — heterogeneidade

Adicionar benchmark, cálculo de capacidade, plano de camadas proporcional, limites de memória e replanejamento entre sessões. O telefone mais forte recebe mais trabalho somente quando os benchmarks e a rede justificarem.

### Marco 5 — produção local

Adicionar cache KV robusto, criptografia de sessão, recuperação, compressão de ativações, telemetria, controle de bateria/temperatura e testes com aparelhos de diferentes fabricantes.

## 12. Critérios honestos de sucesso

O projeto só deve afirmar que “juntou os celulares” quando um modelo que não cabe em um único aparelho tiver sido carregado e executado com pesos/camadas realmente distribuídos entre dois ou mais nós autenticados. A demonstração deve registrar o modelo, o plano de camadas, a memória usada por nó, os tempos de estágio, TTFT, TPOT, tokens gerados, falhas e energia/temperatura quando disponível.

A comparação correta não é apenas “quantos TOPS foram somados”. Deve comparar: um aparelho sozinho, o cluster com dois nós, o cluster com três ou mais nós, diferentes planos de camadas, diferentes condições de Wi‑Fi e comportamento térmico sustentado. Em alguns cenários, adicionar um telefone fraco pode aumentar a capacidade de memória, mas reduzir a velocidade; isso é um resultado válido e deve ser mostrado ao usuário.

## Referências

[1]: https://arxiv.org/html/2505.18164v1 "Model-Distributed Inference for Large Language Models at the Edge"
[2]: https://developer.android.com/develop/connectivity/wifi/use-nsd "Android Developers — Use network service discovery"
[3]: https://github.com/ggml-org/llama.cpp/blob/master/docs/android.md "llama.cpp — Android"
[4]: https://docs.pytorch.org/executorch/1.0/using-executorch-android.html "ExecuTorch — Using ExecuTorch on Android"
[5]: https://source.android.com/docs/core/power/thermal-mitigation "Android Open Source Project — Thermal mitigation"
[6]: https://github.com/b4rtaz/distributed-llama "distributed-llama — Distributed LLM inference"
