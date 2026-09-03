# ClusterAI Mobile

Aplicativo Android/iPhone em desenvolvimento para organizar nós de computação local na mesma rede Wi‑Fi. A interface não inventa métricas: valores aparecem apenas quando são medidos no dispositivo ou quando um serviço real informa o dado.

## Repositório

Código-fonte: https://github.com/dragonolouco/clusterai-mobile

## a‑Shell no iPhone

No a‑Shell, cole:

```sh
cd ~
rm -rf clusterai-mobile
git clone https://github.com/dragonolouco/clusterai-mobile.git
cd clusterai-mobile/tools/ashell
sh install.sh
python3 clusterai_ashell.py
```

Remova o espaço antes de `git clone` ao colar. O cliente procura `_clusterai._tcp.local` via mDNS e consulta apenas serviços realmente encontrados. Ele não usa IP ou porta fixa.

## Estado atual

O aplicativo possui as áreas Cluster, Chat, Modelos e Rede. A aba Rede e Porta mostra o IP local, o estado do serviço, a porta e as conexões somente quando essas informações estão disponíveis. O cliente a‑Shell está pronto para consultar um endpoint `/health` quando o módulo nativo Android anunciar o serviço.

Ainda falta implementar no APK o serviço nativo NSD/mDNS, o endpoint HTTP real, o runtime local de inferência e a divisão de camadas do modelo. Portanto, o cliente pode informar “nenhum serviço encontrado” até que um nó real esteja ativo.

## Segurança de teste

O modo de desenvolvimento sem autenticação é destinado somente a uma rede Wi‑Fi controlada. Nesse modo, qualquer dispositivo com acesso à rede pode tentar consultar a porta. O fluxo de produção deverá exigir pareamento e autenticação de sessão.

## Estrutura relevante

- `app/`: telas Expo/React Native.
- `lib/cluster-domain.ts`: tipos, score de capacidade e plano proporcional de camadas.
- `tools/ashell/`: cliente Python, instalador e documentação para a‑Shell.
- `research-distributed-clusters.md`: pesquisa de arquitetura e roadmap.
- `docs-terminal-access.md`: contrato previsto para acesso de terminal.

## Modelos locais

Na aba Modelos, o usuário pode selecionar um arquivo `.gguf` ou `.pte`; o app copia o arquivo para o armazenamento interno e informa o tamanho quando o sistema fornece esse dado. Importar um arquivo não significa que ele já foi executado. O chat só deve ser habilitado depois que um runtime nativo confirmar o carregamento do modelo e disponibilizar a geração de tokens.
