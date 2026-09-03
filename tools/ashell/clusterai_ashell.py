#!/usr/bin/env python3
"""ClusterAI a-Shell client: discover and inspect real nodes on the local Wi-Fi."""
import argparse
import json
import socket
import struct
import sys
import time
import urllib.request

SERVICE = "_clusterai._tcp.local"
MDNS = ("224.0.0.251", 5353)


def encode_name(name):
    return b"".join(bytes([len(part)]) + part.encode() for part in name.rstrip(".").split(".")) + b"\0"


def read_name(data, offset):
    labels, jumped = [], False
    original = offset
    while True:
        length = data[offset]
        if length == 0:
            offset += 1
            break
        if length & 0xC0 == 0xC0:
            pointer = ((length & 0x3F) << 8) | data[offset + 1]
            part, _ = read_name(data, pointer)
            labels.append(part)
            offset += 2
            jumped = True
            break
        offset += 1
        labels.append(data[offset:offset + length].decode("utf-8", "replace"))
        offset += length
    return ".".join(labels), (original + 2 if jumped else offset)


def query_mdns(timeout):
    query_id = 0
    packet = struct.pack("!HHHHHH", query_id, 0, 1, 0, 0, 0) + encode_name(SERVICE) + struct.pack("!HH", 12, 1)
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
    sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 1)
    sock.settimeout(0.25)
    services = {}
    try:
        sock.sendto(packet, MDNS)
        end = time.time() + timeout
        while time.time() < end:
            try:
                data, _ = sock.recvfrom(65535)
            except socket.timeout:
                continue
            if len(data) < 12:
                continue
            _, _, qd, an, ns, ar = struct.unpack("!HHHHHH", data[:12])
            offset = 12
            for _ in range(qd):
                _, offset = read_name(data, offset)
                offset += 4
            records = []
            for _ in range(an + ns + ar):
                name, offset = read_name(data, offset)
                if offset + 10 > len(data):
                    break
                rtype, rclass, ttl, rdlength = struct.unpack("!HHIH", data[offset:offset + 10])
                offset += 10
                rdata_start = offset
                rdata = data[offset:offset + rdlength]
                offset += rdlength
                records.append((name.rstrip("."), rtype, rdata, rdata_start))
            for name, rtype, rdata, rdata_start in records:
                if rtype == 12:
                    instance, _ = read_name(data, rdata_start)
                    services.setdefault(instance.rstrip("."), {})["service"] = name
                elif rtype == 33 and len(rdata) >= 6:
                    port = struct.unpack("!H", rdata[4:6])[0]
                    target, _ = read_name(data, rdata_start + 6)
                    services.setdefault(name, {}).update(port=port, host=target.rstrip("."))
                elif rtype == 1 and len(rdata) == 4:
                    services.setdefault(name, {})["address"] = socket.inet_ntoa(rdata)
    finally:
        sock.close()
    result = []
    for name, item in services.items():
        if item.get("port") and (item.get("address") or item.get("host")):
            result.append({"name": name, "host": item.get("host"), "address": item.get("address"), "port": item["port"]})
    return result


def health(node, timeout):
    address = node.get("address") or node.get("host")
    url = f"http://{address}:{node['port']}/health"
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            body = json.loads(response.read().decode("utf-8"))
            return {"reachable": True, "url": url, "health": body}
    except Exception as exc:
        return {"reachable": False, "url": url, "error": str(exc)}


def main():
    parser = argparse.ArgumentParser(description="Descobre nós ClusterAI na mesma rede Wi-Fi via mDNS.")
    parser.add_argument("--timeout", type=float, default=3.0, help="tempo de escuta mDNS em segundos")
    parser.add_argument("--health-timeout", type=float, default=1.5, help="timeout de cada consulta HTTP")
    parser.add_argument("--json", action="store_true", help="imprime JSON para automação")
    args = parser.parse_args()
    try:
        nodes = query_mdns(args.timeout)
    except OSError as exc:
        print(f"Não foi possível abrir o socket mDNS: {exc}", file=sys.stderr)
        return 2
    inspected = [{**node, **health(node, args.health_timeout)} for node in nodes]
    if args.json:
        print(json.dumps(inspected, ensure_ascii=False, indent=2))
        return 0
    if not inspected:
        print("Nenhum serviço _clusterai._tcp.local foi encontrado nesta rede.")
        print("Confirme que o aplicativo Android está aberto, no mesmo Wi-Fi e com o serviço local iniciado.")
        return 0
    for node in inspected:
        status = "alcançável" if node["reachable"] else "não alcançável"
        address = node.get("address") or node.get("host")
        print(f"{node['name']}  {address}:{node['port']}  {status}")
        if node.get("health"):
            print("  " + json.dumps(node["health"], ensure_ascii=False, separators=(", ", ": ")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
