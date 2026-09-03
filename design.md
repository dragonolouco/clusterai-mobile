# Design do ClusterAI Mobile

## Direção do produto
O ClusterAI será uma ferramenta Android de operação local para transformar vários celulares em um cluster cooperativo. A interface deve parecer uma central técnica nativa, mas compreensível, com leitura rápida em orientação retrato e uso com uma mão.

## Telas

| Tela | Conteúdo e função |
|---|---|
| Cluster | Resumo do grupo, estado da rede, quantidade de nós, capacidade agregada, modelo carregado e ação para iniciar/parar uma execução. |
| Dispositivos | Lista dos celulares descobertos automaticamente, com nome, estado, endereço local, porta, bateria, memória, CPU, armazenamento e papel no cluster. |
| Detalhe do dispositivo | Informações completas do nó selecionado, último heartbeat, versão do protocolo, modelo disponível e tarefas recentes. |
| Modelo | Modelo ativo, tamanho, quantização, memória exigida, nós participantes e progresso de carregamento. |
| Execução | Campo de prompt, fila de tarefas, progresso, tokens/resultado e indicador de quais nós estão trabalhando. |
| Configurações | Nome do dispositivo, descoberta automática, modo coordenador/nó, privacidade da telemetria e redefinição do pareamento local. |
|

## Fluxos principais

### Entrada automática no cluster
1. O usuário abre o aplicativo conectado ao Wi‑Fi.
2. O aplicativo registra e anuncia o serviço local.
3. A tela Cluster mostra “Procurando dispositivos próximos”.
4. Nós com o mesmo identificador de aplicativo e protocolo aparecem em Dispositivos.
5. O usuário confirma o primeiro pareamento por código curto ou QR; depois, a sessão pode ser reconectada automaticamente na mesma rede.
6. O cluster exibe os recursos agregados e o papel de cada telefone.

### Ver informações da porta e do nó
1. O usuário toca no card de um dispositivo.
2. A tela de detalhe mostra endereço local, porta interna descoberta, transporte, latência, heartbeat e capacidade.
3. A porta é somente informativa; não há campo para digitação manual.

### Rodar modelo
1. O usuário abre Modelo e escolhe um modelo disponível localmente.
2. O aplicativo valida memória e compatibilidade dos nós.
3. O coordenador distribui a tarefa entre os participantes.
4. Execução mostra progresso, estado de cada nó e resultado consolidado.

## Visual

A marca usa fundo azul-marinho quase preto `#07111F`, superfícies `#0D1B2A`, azul elétrico `#38BDF8` para ações e ciano `#67E8F9` para destaque de capacidade. Verde `#34D399` indica conectado/saudável, âmbar `#FBBF24` indica atenção e vermelho `#FB7185` indica falha. O estilo usa cards discretos, bordas finas, números monoespaçados somente para métricas técnicas e tipografia de sistema para o restante.

## Acessibilidade e interação

Os alvos de toque terão pelo menos 44 pontos, os estados terão texto além de cor e os cards usarão feedback de opacidade/haptics. A tela principal prioriza o resumo do cluster no topo e a lista de nós abaixo, permitindo alcançar ações principais com uma mão.
