# Project TODO

- [x] Identidade visual e configuração do aplicativo ClusterAI
- [x] Tela Cluster com capacidade agregada e estado da rede
- [ ] Descoberta automática de dispositivos na mesma rede Wi‑Fi
- [ ] Pareamento local e autenticação entre nós
- [x] Inventário de informações próprias e dos demais dispositivos
- [x] Exibição da porta interna descoberta sem configuração manual
- [x] Tela de detalhe de dispositivo
- [x] Tela de modelo e compatibilidade de recursos
- [x] Tela de execução distribuída com prompt e progresso
- [ ] Coordenador e papéis dos nós do cluster
- [ ] Persistência local das preferências
- [ ] Testes unitários da lógica de descoberta, pareamento e agregação
- [ ] Documentação de instalação, uso e limitações do APK

- [ ] Corrigir a assinatura Android EAS: configurar signing_key para o projeto EAS já vinculado

- [x] Preparar entrega do código-fonte atual em arquivo ZIP, sem APK

- [x] Remover dados de demonstração, números inventados, nomes fictícios e portas pré-preenchidas
- [x] Exibir apenas telemetria medida ou o estado explícito de indisponibilidade
- [x] Adicionar áreas reais de Chat, Modelo local e estado de inferência
- [x] Documentar arquitetura real de runtime Android e inferência distribuída
- [ ] Integrar descoberta NSD/mDNS e runtime nativo de inferência em etapa posterior

- [x] Entregar o código-fonte revisado diretamente em ZIP, sem publicação

- [x] Pesquisa detalhada sobre inferência distribuída heterogênea, gargalos e roadmap

- [x] Criar domínio tipado de nós, capacidades medidas e plano proporcional de camadas
- [x] Adicionar cálculo de capacidade com benchmark, memória, rede, bateria e temperatura
- [x] Aprimorar Cluster, Chat e Modelos com estados verificáveis e sem respostas simuladas
- [x] Atualizar documentação do aprimoramento e gerar novo ZIP do código-fonte

- [x] Adicionar aba Rede e Porta com porta real, estado do serviço e conexões ativas
- [x] Documentar acesso opcional por a‑Shell/terminal sem expor a porta como requisito manual
- [x] Garantir que informações técnicas só apareçam quando forem medidas ou realmente abertas

- [x] Criar modo de desenvolvimento sem autenticação com aviso explícito de rede confiável
- [x] Criar cliente a‑Shell com descoberta mDNS e porta compartilhada do protocolo
- [x] Criar instalador copiável e comandos de clonagem/execução para iPhone

- [x] Adaptar documentação e comandos para Android/iPhone com a‑Shell
- [x] Criar e publicar repositório GitHub privado com o código validado

- [ ] Implementar runtime de inferência local no Android (llama.cpp ou ExecuTorch)
- [x] Implementar seleção e validação de arquivo GGUF/PTE
- [ ] Conectar o chat a uma execução real, sem resposta simulada
- [ ] Integrar o estado do modelo local ao plano de distribuição do cluster

- [x] Pesquisar especificações e benchmarks separados do iPhone 12, realme C51, i7‑2760QM e Ryzen 5 5500
- [x] Criar perfis de hardware sem inventar resultados não medidos
- [x] Implementar seleção de modelo, benchmark e planejamento de execução real
- [x] Atualizar o repositório com a avaliação de hardware e o código de inferência

- [x] Atualizar perfil do PC: Ryzen 5 5500, RAM 2×8 GB dual‑channel e GT 740 GDDR5 apenas para vídeo
- [x] Excluir VRAM da GT 740 do cálculo de capacidade de inferência

- [x] Auditar segredos e arquivos internos antes de tornar o repositório público
- [x] Alterar `dragonolouco/clusterai-mobile` para público e verificar a URL

- [x] Corrigir bloco de instalação a‑Shell para não depender de git
- [x] Publicar README e instalador corrigidos com URLs reais do GitHub
