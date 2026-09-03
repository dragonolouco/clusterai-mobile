# Pesquisa de instalação: a‑Shell e Termux

## a‑Shell no iPhone

A documentação e o repositório oficiais do a‑Shell descrevem um terminal Unix-like para iOS, com comandos próprios baseados em `ios_system`. O projeto inclui integração com Shortcuts; comandos podem ser executados dentro do app ou em uma extensão mais limitada. O a‑Shell é instalado pelo usuário pela App Store; não existe um comando de terminal que instale o próprio aplicativo iOS.

O fluxo ClusterAI não deve pressupor `git`, Bash completo, expansão de variáveis ou um ambiente Linux convencional. O bloco de instalação deve usar caminhos e URLs literais, comandos simples e separados. A instalação do cliente deve baixar arquivos via `curl`, gravá-los em `~/clusterai-ashell` ou em `Documents/clusterai-ashell` e executar Python apenas depois de verificar que o arquivo existe. O cliente não abre a porta do app; ele pesquisa serviços mDNS e consulta um endpoint que já esteja ativo.

Fonte primária: https://github.com/holzschu/a-shell

## Termux no Android

O site oficial do Termux o descreve como emulador de terminal e ambiente Linux para Android, sem root, com pacotes adicionais instalados pelo gerenciador APT. O fluxo deve começar pela instalação do aplicativo a partir das fontes recomendadas pelo projeto, especialmente F-Droid ou GitHub, sem misturar builds de fontes diferentes. Dentro do Termux, `pkg`/APT pode instalar `python`, `curl` e, opcionalmente, `git`.

O fluxo sem git é o caminho mais robusto para o cliente: `pkg update -y`, `pkg install -y python curl`, download por URLs literais, execução de `python3`. O fluxo com clone deve ser opcional. O Termux também precisa permanecer aberto para o cliente continuar executando; ele não transforma o telefone em um serviço de inferência persistente automaticamente.

Fonte primária: https://termux.dev/en/

## Limites

A presença no mesmo Wi‑Fi não garante mDNS: o roteador pode bloquear multicast ou isolar clientes. Um resultado vazio é válido e deve orientar o usuário a verificar o aplicativo Android, o serviço `_clusterai._tcp.local`, a rede e a porta anunciada. A porta e o endpoint devem ser informados apenas quando um serviço real responder.

## Fontes primárias consultadas em 03/09/2026

O repositório oficial do a‑Shell confirma que ele é um terminal para iOS com comandos baseados em `ios_system` e integração com Apple Shortcuts. O README também diferencia execução “In App” e “In Extension”; a extensão é mais limitada e adequada a comandos leves. Fonte: https://github.com/holzschu/a-shell

O site oficial do Termux confirma que ele é um emulador de terminal e ambiente Linux para Android sem root, com um sistema mínimo instalado automaticamente e pacotes adicionais via APT/pkg. O site cita curl, Git e versões atualizadas de Python entre os recursos disponíveis. Fontes: https://termux.dev/en/ e https://github.com/termux/termux-app

Conclusão operacional: o guia deve separar a instalação do aplicativo pela App Store/F-Droid/GitHub da instalação do cliente. No a‑Shell, o caminho mais conservador usa comandos simples, URLs literais e não exige git; no Termux, `pkg update` e `pkg install python curl` são o fluxo base, com git como opção. Nenhum desses terminais, por si só, cria o serviço ClusterAI ou executa inferência móvel nativa; eles apenas podem rodar o cliente enquanto o nó real existir.
