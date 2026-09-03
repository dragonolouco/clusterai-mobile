# ClusterAI a‑Shell client

Cliente de diagnóstico e conexão para iPhone usando [a‑Shell](https://github.com/holzschu/a-shell). O cliente procura serviços `_clusterai._tcp.local` por mDNS na mesma rede Wi‑Fi, lista endereço e porta anunciados e consulta o endpoint `/health` quando ele existir.

## Instalação rápida no a‑Shell

Abra o a‑Shell no iPhone e cole este bloco:

```sh
cd ~
rm -rf clusterai-ashell
mkdir -p clusterai-ashell
cd clusterai-ashell
curl -L https://github.com/SEU_USUARIO/clusterai-mobile/raw/main/tools/ashell/clusterai_ashell.py -o clusterai_ashell.py
curl -L https://github.com/SEU_USUARIO/clusterai-mobile/raw/main/tools/ashell/install.sh -o install.sh
sh install.sh
python3 clusterai_ashell.py
```

Depois que o repositório tiver uma URL definitiva, substitua `SEU_USUARIO/clusterai-mobile` pela URL real. O bloco não usa IP ou porta fixa. A porta vem do registro mDNS publicado pelo nó ClusterAI.

## Clonar o repositório completo

Quando o `git` estiver disponível no ambiente a‑Shell, o fluxo completo é:

```sh
cd ~
rm -rf clusterai-mobile
git clone https://github.com/SEU_USUARIO/clusterai-mobile.git
cd clusterai-mobile/tools/ashell
sh install.sh
python3 clusterai_ashell.py
```

O espaço antes de `git clone` deve ser removido ao colar; ele está separado aqui apenas para destacar o comando. O instalador não abre portas, não finge conexão e não instala um daemon de fundo.

## Opções

```sh
python3 clusterai_ashell.py --timeout 5
python3 clusterai_ashell.py --json
```

A saída só contém serviços encontrados na rede e o resultado da consulta de saúde. Se não houver serviço, o cliente informa que nenhum nó foi encontrado.

## Contrato esperado do nó ClusterAI

O aplicativo Android deverá anunciar `_clusterai._tcp.local` por NSD/DNS‑SD. O endpoint HTTP mínimo planejado é:

```text
GET /health
```

A resposta deverá ser JSON com estado do serviço, versão do protocolo, identidade pública do nó e timestamp. Os endpoints de cluster e inferência devem ser adicionados somente depois que o transporte nativo e o modelo local existirem.

## Limitações reais

O a‑Shell é um cliente opcional de terminal. Ele não transforma o iPhone em um worker de inferência Android nem cria, sozinho, uma porta no aplicativo. O aplicativo Android precisa estar aberto, anunciar o serviço e fornecer um endpoint real. A rede Wi‑Fi precisa permitir multicast mDNS e comunicação entre clientes; redes com isolamento de clientes podem impedir a descoberta.

O modo de desenvolvimento pode operar sem autenticação apenas em uma rede controlada de testes. Nesse caso, qualquer aparelho que alcançar a porta poderá tentar consultar o endpoint. Não use esse modo em uma rede pública ou compartilhada. O fluxo de produção deve exigir pareamento e sessão autenticada.
