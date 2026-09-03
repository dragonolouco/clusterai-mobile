# Achados da pesquisa sobre clusters heterogêneos

## 1. O que é preciso combinar
Um cluster de celulares pode aumentar a capacidade de memória disponível e permitir que um modelo maior seja dividido entre dispositivos, mas o resultado não é uma soma simples de TOPS. Durante a geração autoregressiva, cada token atravessa uma sequência de camadas; os dispositivos precisam trocar ativações intermediárias, manter estado KV e sincronizar o próximo token.

## 2. Paralelismo de modelo
O trabalho MDI-LLM descreve um overlay em anel no qual nós trocam ativações intermediárias por TCP/IP. Ele particiona blocos Transformer entre dispositivos e coloca as camadas inicial/final no nó inicial. O número de blocos de cada nó deve refletir a capacidade computacional dele. O trabalho também usa pipeline paralelo recorrente para reduzir o tempo ocioso quando há múltiplas amostras.

## 3. KV cache e comunicação
Para modelos com contexto longo, transmitir novamente todo o contexto é caro. O KV cache permite propagar apenas o embedding do último token e estender o estado local, reduzindo mensagens e computação repetida. O sistema precisa, portanto, ter gerenciamento de cache por sessão, reconexão e controle de memória.

## 4. Evidência recente em clusters domésticos
O artigo Prima.cpp, publicado nos proceedings do ICLR 2026, descreve um sistema para clusters domésticos heterogêneos com CPUs/GPUs diferentes, RAM/VRAM insuficiente, discos lentos e Wi‑Fi. Ele usa pipelined-ring parallelism para sobrepor I/O, computação e comunicação, e o scheduler Halda para co-otimizar carga CPU/GPU, seleção de dispositivos e restrições de memória. O resumo relata resultados em quatro dispositivos, mas esses números não devem ser transferidos para celulares sem benchmark específico.

## 5. Implicação para o ClusterAI
O hardware mais forte não deve receber a mesma quantidade de camadas do mais fraco. A unidade de decisão deve ser a capacidade efetiva medida durante um benchmark curto, combinada com memória disponível, largura de banda, latência, temperatura, bateria e estabilidade. O balanceamento deve buscar tempos de estágio semelhantes, não apenas dividir camadas pelo número de aparelhos.

## Fontes
1. Macario, Seferoglu e Koyuncu, “Model-Distributed Inference for Large Language Models at the Edge”, arXiv, 2025: https://arxiv.org/html/2505.18164v1
2. Li et al., “Prima.cpp: Fast 30-70B LLM Inference on Heterogeneous and Low-Resource Home Clusters”, ICLR 2026: https://proceedings.iclr.cc/paper_files/paper/2026/hash/e991e5587c1daa49bbf9a818b3f02f9a-Abstract-Conference.html
3. ggml-org, “llama.cpp Android”: https://github.com/ggml-org/llama.cpp/blob/master/docs/android.md
4. PyTorch, “Using ExecuTorch on Android”: https://docs.pytorch.org/executorch/1.0/using-executorch-android.html

## 6. Organização prática do cluster

A implementação aberta distributed-llama usa um nó raiz que carrega o modelo/pesos, coordena o estado e também processa sua própria fatia; os workers processam as fatias atribuídas. Isso confirma que um cluster precisa de um coordenador, protocolo de capacidades, distribuição de pesos e sincronização de estado. A configuração do projeto não deve pressupor que todo telefone é equivalente.

## 7. Temperatura e desempenho sustentado

A documentação AOSP informa que o Android expõe status térmico por polling e callbacks via PowerManager, e que o sistema pode reduzir o desempenho quando há estresse térmico. Portanto, uma capacidade medida no início não é constante: o scheduler deve atualizar o peso do nó durante a sessão, reduzir sua fatia ou retirá-lo temporariamente quando o thermal status piorar.

## 8. Consequência para o algoritmo

O peso inicial de um nó deve ser uma estimativa, não uma promessa. Uma forma correta é medir throughput sustentado de um bloco representativo, medir latência de envio/recebimento e observar memória, bateria e status térmico. A quantidade de camadas atribuída deve ser ajustada para que o tempo de estágio mais a comunicação fique próximo entre os nós. Se um aparelho ficar lento, o scheduler deve redistribuir somente em um novo ciclo seguro, porque mover camadas no meio de uma geração pode invalidar o estado KV.

Fontes adicionais:
5. Android Open Source Project, “Thermal mitigation”: https://source.android.com/docs/core/power/thermal-mitigation
6. b4rtaz, “distributed-llama”: https://github.com/b4rtaz/distributed-llama
