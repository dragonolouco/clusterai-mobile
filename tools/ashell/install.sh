#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CLIENT="$ROOT_DIR/clusterai_ashell.py"

if [ ! -f "$CLIENT" ]; then
  echo "Cliente não encontrado: $CLIENT" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 não está disponível neste terminal. Instale o pacote Python do a-Shell e tente novamente." >&2
  exit 1
fi

chmod +x "$CLIENT"
printf '%s\n' "Cliente ClusterAI instalado em: $CLIENT"
printf '%s\n' "Execute: python3 '$CLIENT'"
printf '%s\n' "A busca usa mDNS e não inventa IP, porta ou dispositivo."
