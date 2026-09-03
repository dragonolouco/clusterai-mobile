#!/data/data/com.termux/files/usr/bin/sh
set -eu

pkg update -y
pkg install -y python curl

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CLIENT="$ROOT_DIR/clusterai_ashell.py"

if [ ! -f "$CLIENT" ]; then
  echo "Cliente não encontrado: $CLIENT" >&2
  exit 1
fi

chmod +x "$CLIENT"
printf '%s\n' "Cliente ClusterAI pronto no Termux."
printf '%s\n' "Execute: python3 '$CLIENT'"
printf '%s\n' "Nenhuma porta local é aberta por este cliente; ele apenas descobre e consulta nós ClusterAI."
