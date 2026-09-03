# Cliente ClusterAI para a‑Shell

Este cliente funciona no iPhone sem `git`. Ele usa os comandos que o a‑Shell normalmente oferece: `curl`, `mkdir`, `chmod`, `sh` e `python3`. Ele procura `_clusterai._tcp.local` via mDNS e consulta apenas serviços reais encontrados na mesma rede Wi‑Fi.

## Instalação direta — copie este bloco inteiro

```sh
BASE="https://raw.githubusercontent.com/dragonolouco/clusterai-mobile/main/tools/ashell"
DIR="$HOME/clusterai-ashell"
mkdir -p "$DIR"
curl -fL "$BASE/clusterai_ashell.py" -o "$DIR/clusterai_ashell.py"
curl -fL "$BASE/install.sh" -o "$DIR/install.sh"
sh "$DIR/install.sh"
python3 "$DIR/clusterai_ashell.py"
```

Esse fluxo não usa `git clone`, não depende de uma pasta que ainda não existe e pode ser executado novamente para atualizar os arquivos. Se `curl` retornar erro, verifique a conexão com a internet e se o endereço do repositório continua correto.

## Comandos de consulta

```sh
python3 "$HOME/clusterai-ashell/clusterai_ashell.py" --timeout 5
python3 "$HOME/clusterai-ashell/clusterai_ashell.py" --json
```

A saída informa somente o nome anunciado, endereço, porta e resultado de `/health` dos serviços encontrados. Se nenhum aplicativo Android estiver anunciando o serviço, o resultado correto será “nenhum serviço encontrado”.

## Limites

O a‑Shell é um cliente de terminal; ele não transforma o iPhone em um worker de inferência por si só. O aplicativo Android precisa publicar um serviço `_clusterai._tcp.local` e responder em `/health`. A rede também precisa permitir multicast mDNS e comunicação entre clientes. O modo sem autenticação é apenas para uma rede de teste controlada.
