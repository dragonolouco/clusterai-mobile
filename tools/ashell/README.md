# Cliente ClusterAI para a‑Shell e Termux

Este diretório contém um cliente de diagnóstico de rede. Ele procura `_clusterai._tcp.local` via mDNS e consulta `/health` nos serviços reais encontrados. Ele não abre a porta do aplicativo Android, não instala o aplicativo móvel e não executa um modelo de IA sozinho.

## 1. iPhone com a‑Shell

### 1.1 Instalar o terminal

Instale o **a‑Shell** pela [App Store](https://apps.apple.com/us/app/a-shell/id1473805438). Essa etapa é obrigatoriamente feita pela App Store; nenhum comando do próprio a‑Shell consegue instalar outro aplicativo iOS. Use a versão completa do a‑Shell, aberta normalmente, e não uma execução limitada dentro de uma extensão do Shortcuts.

O a‑Shell já inclui um ambiente Unix-like e comandos próprios baseados em `ios_system`. Para este cliente, o conjunto necessário é `cd`, `mkdir`, `curl`, `sh`, `chmod` e `python3`. O a‑Shell não deve ser tratado como Linux e não possui o fluxo `pkg update`, APT ou Termux. As atualizações do próprio aplicativo são feitas pela App Store. `git` não é requisito e não deve ser usado no procedimento principal.

### 1.2 Instalar o cliente

Abra o a‑Shell. Cole **uma linha por vez**, aguardando o prompt voltar após cada comando:

```sh
cd ~
mkdir -p ~/clusterai-ashell
curl -fL https://raw.githubusercontent.com/dragonolouco/clusterai-mobile/main/tools/ashell/clusterai_ashell.py -o ~/clusterai-ashell/clusterai_ashell.py
curl -fL https://raw.githubusercontent.com/dragonolouco/clusterai-mobile/main/tools/ashell/install.sh -o ~/clusterai-ashell/install.sh
sh ~/clusterai-ashell/install.sh
python3 ~/clusterai-ashell/clusterai_ashell.py --timeout 5
```

Os comandos usam caminhos e URLs literais de propósito. Não substitua por `$BASE`, `$DIR`, `$(...)` ou por um bloco colado como uma única linha. Para JSON, execute:

```sh
python3 ~/clusterai-ashell/clusterai_ashell.py --json
```

Para atualizar o cliente, repita as duas linhas `curl` e depois execute novamente `sh ~/clusterai-ashell/install.sh`.

### 1.3 Limitações do a‑Shell

O a‑Shell não instala o próprio aplicativo por terminal, não é um daemon permanente e não mantém o cliente executando quando o iOS suspende o aplicativo. O cliente só consulta nós enquanto o a‑Shell está aberto. A extensão do Shortcuts pode ter comandos e bibliotecas mais limitados; para a instalação e o diagnóstico, use o app principal.

## 2. Android com Termux

### 2.1 Instalar o aplicativo

Instale o **Termux** por uma fonte oficial: [F-Droid](https://f-droid.org/packages/com.termux/) ou [GitHub oficial](https://github.com/termux/termux-app). Não misture a instalação do aplicativo de uma fonte com complementos de outra. Depois de instalar, abra o Termux uma vez.

O Termux instala automaticamente um sistema mínimo. Os pacotes adicionais são instalados pelo `pkg`/APT. Para este cliente, `python` e `curl` não devem ser presumidos como presentes; o bloco abaixo os instala. `git` é opcional e só é necessário para clonar o repositório completo.

### 2.2 Instalação sem git

No Termux, cole este bloco. O primeiro comando atualiza os índices; o segundo instala as dependências; os comandos seguintes baixam e executam o cliente:

```sh
pkg update -y
pkg install -y python curl
mkdir -p ~/clusterai-termux
curl -fL https://raw.githubusercontent.com/dragonolouco/clusterai-mobile/main/tools/ashell/clusterai_ashell.py -o ~/clusterai-termux/clusterai_ashell.py
curl -fL https://raw.githubusercontent.com/dragonolouco/clusterai-mobile/main/tools/ashell/install-termux.sh -o ~/clusterai-termux/install-termux.sh
sh ~/clusterai-termux/install-termux.sh
python3 ~/clusterai-termux/clusterai_ashell.py --timeout 5
```

### 2.3 Clonagem opcional do repositório

Para obter o projeto completo, instale `git` depois de atualizar os pacotes:

```sh
pkg update -y
pkg install -y git python
cd ~
rm -rf clusterai-mobile
git clone https://github.com/dragonolouco/clusterai-mobile.git
cd ~/clusterai-mobile/tools/ashell
sh install-termux.sh
python3 clusterai_ashell.py --timeout 5
```

A clonagem é opcional. O cliente funciona pelo download direto e não precisa carregar o aplicativo Expo dentro do Termux.

### 2.4 Armazenamento, execução contínua e diagnóstico

O cliente não precisa acessar fotos ou arquivos compartilhados. Se outro script precisar acessar o armazenamento público do Android, o comando oficial do Termux é `termux-setup-storage`; isso não é necessário para o ClusterAI.

Para uma consulta prolongada, mantenha o Termux aberto e desative a otimização de bateria do Android para o Termux. O cliente não instala o aplicativo ClusterAI nem cria o serviço Android: ele apenas consulta um nó que já esteja anunciando e respondendo.

Se Python não for encontrado, execute `pkg install -y python`. Se `curl` falhar, execute `curl -I https://raw.githubusercontent.com`. Se não houver serviços, confirme que o aplicativo Android está aberto, que o serviço `_clusterai._tcp.local` foi realmente anunciado e que o roteador não isola os clientes ou bloqueia multicast mDNS.

## 3. O que cada terminal faz

| Ambiente | Instalação de dependências | Clonagem | Papel no ClusterAI |
|---|---|---|---|
| a‑Shell completo | Já traz o necessário para este cliente; não há `pkg update` | Não presumir `git`; usar `curl` | Cliente de consulta no iPhone |
| Termux | `pkg update -y` e `pkg install -y python curl` | `git` opcional | Cliente de consulta no Android |
| Aplicativo ClusterAI | Instalação separada do APK/app | Não é instalada pelo terminal | Nó que deverá anunciar a porta e o serviço real |

O mesmo Wi‑Fi não garante descoberta. A rede precisa permitir comunicação entre clientes e multicast. A porta só deve aparecer quando um serviço real a anunciar; um resultado vazio não significa que o instalador falhou.

## Fontes oficiais

[a‑Shell no GitHub](https://github.com/holzschu/a-shell) · [Termux](https://termux.dev/en/) · [Termux App no GitHub](https://github.com/termux/termux-app) · [Termux no F-Droid](https://f-droid.org/packages/com.termux/)
