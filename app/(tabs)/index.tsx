import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Battery from "expo-battery";
import * as Network from "expo-network";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";

const palette = {
  bg: "#07111F",
  surface: "#0D1B2A",
  surfaceSoft: "#10243A",
  border: "#1E3A56",
  text: "#E6F4FE",
  muted: "#8BA4B8",
  cyan: "#67E8F9",
  blue: "#38BDF8",
  green: "#34D399",
  amber: "#FBBF24",
};

type NodeStatus = "online" | "working" | "attention";
type ClusterNode = {
  id: string;
  name: string;
  role: string;
  ip: string;
  port: number;
  status: NodeStatus;
  battery: number;
  memory: string;
  model: string;
  load: number;
  latency: string;
  isLocal?: boolean;
};

const initialNodes: ClusterNode[] = [
  { id: "local", name: "Este dispositivo", role: "Coordenador", ip: "0.0.0.0", port: 0, status: "online", battery: -1, memory: "—", model: "Aguardando modelo", load: 0, latency: "—", isLocal: true },
  { id: "node-1", name: "Pixel de Rafael", role: "Worker", ip: "192.168.1.42", port: 47821, status: "working", battery: 86, memory: "8 GB", model: "Llama 3.2 3B Q4", load: 68, latency: "12 ms" },
  { id: "node-2", name: "Galaxy S24", role: "Worker", ip: "192.168.1.57", port: 47822, status: "online", battery: 73, memory: "12 GB", model: "Llama 3.2 3B Q4", load: 41, latency: "18 ms" },
];

function statusLabel(status: NodeStatus) {
  if (status === "working") return "Processando";
  if (status === "attention") return "Atenção";
  return "Online";
}

function statusColor(status: NodeStatus) {
  if (status === "working") return palette.cyan;
  if (status === "attention") return palette.amber;
  return palette.green;
}

export default function ClusterScreen() {
  const [nodes, setNodes] = useState(initialNodes);
  const [networkType, setNetworkType] = useState("Verificando Wi‑Fi");
  const [localIp, setLocalIp] = useState("0.0.0.0");
  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning] = useState(true);

  const connectedCount = nodes.filter((node) => node.status !== "attention").length;
  const aggregateMemory = "28 GB";
  const aggregateCompute = "18,4 TOPS";

  const localNode = useMemo(() => nodes.find((node) => node.isLocal), [nodes]);

  async function readLocalDevice() {
    try {
      const state = await Network.getNetworkStateAsync();
      const ip = await Network.getIpAddressAsync();
      setNetworkType(state.type === Network.NetworkStateType.WIFI ? "Wi‑Fi local" : String(state.type));
      setLocalIp(ip || "0.0.0.0");
      const level = Platform.OS === "web" ? -1 : await Battery.getBatteryLevelAsync();
      setNodes((current) => current.map((node) => node.isLocal ? { ...node, ip: ip || "0.0.0.0", battery: level } : node));
    } catch {
      setNetworkType("Rede indisponível");
    }
  }

  useEffect(() => {
    readLocalDevice();
    const timer = setTimeout(() => setScanning(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  async function refreshCluster() {
    setRefreshing(true);
    setScanning(true);
    await readLocalDevice();
    setTimeout(() => {
      setScanning(false);
      setRefreshing(false);
    }, 700);
  }

  function toggleExecution() {
    setNodes((current) => current.map((node) => node.isLocal ? node : { ...node, status: node.status === "working" ? "online" : "working", load: node.status === "working" ? 41 : Math.min(92, node.load + 12) }));
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-background" className="px-5">
      <FlatList
        data={nodes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshCluster} tintColor={palette.cyan} />}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>CLUSTERAI / LOCAL</Text>
                <Text style={styles.title}>Seu cluster</Text>
              </View>
              <View style={styles.headerIcon}><IconSymbol name="chevron.right" size={20} color={palette.cyan} /></View>
            </View>

            <View style={styles.networkPill}>
              <View style={styles.pulse} />
              <Text style={styles.networkText}>{scanning ? "Procurando dispositivos próximos…" : `${networkType}  ·  ${localIp}`}</Text>
              {scanning && <ActivityIndicator size="small" color={palette.cyan} />}
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View><Text style={styles.cardLabel}>CAPACIDADE AGREGADA</Text><Text style={styles.heroValue}>{aggregateCompute}</Text></View>
                <View style={styles.stackIcon}><IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={palette.cyan} /></View>
              </View>
              <View style={styles.metricsRow}>
                <View><Text style={styles.metricValue}>{connectedCount}</Text><Text style={styles.metricLabel}>dispositivos</Text></View>
                <View><Text style={styles.metricValue}>{aggregateMemory}</Text><Text style={styles.metricLabel}>memória total</Text></View>
                <View><Text style={styles.metricValue}>0</Text><Text style={styles.metricLabel}>tarefas ativas</Text></View>
              </View>
              <Pressable onPress={toggleExecution} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <Text style={styles.primaryButtonText}>Iniciar execução distribuída</Text>
                <IconSymbol name="chevron.right" size={18} color={palette.bg} />
              </Pressable>
            </View>

            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Dispositivos na rede</Text><Text style={styles.sectionMeta}>{nodes.length} encontrados</Text></View>
          </>
        }
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => [styles.nodeCard, pressed && styles.pressed]}>
            <View style={styles.nodeTop}>
              <View style={[styles.nodeDot, { backgroundColor: statusColor(item.status) }]} />
              <View style={styles.nodeIdentity}><Text style={styles.nodeName}>{item.name}</Text><Text style={styles.nodeRole}>{item.role} {item.isLocal ? "· este aparelho" : "· pareado automaticamente"}</Text></View>
              <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
            </View>
            <View style={styles.nodeGrid}>
              <View><Text style={styles.nodeLabel}>ENDEREÇO</Text><Text style={styles.nodeValue}>{item.ip}</Text></View>
              <View><Text style={styles.nodeLabel}>PORTA</Text><Text style={styles.nodeValue}>{item.port || "—"}</Text></View>
              <View><Text style={styles.nodeLabel}>BATERIA</Text><Text style={styles.nodeValue}>{item.battery >= 0 ? `${item.battery}%` : "—"}</Text></View>
              <View><Text style={styles.nodeLabel}>LATÊNCIA</Text><Text style={styles.nodeValue}>{item.latency}</Text></View>
            </View>
            <View style={styles.modelRow}><View><Text style={styles.nodeLabel}>MODELO</Text><Text style={styles.modelText}>{item.model}</Text></View><Text style={styles.loadText}>{item.load}% carga</Text></View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(item.load, 3)}%`, backgroundColor: statusColor(item.status) }]} /></View>
          </Pressable>
        )}
        ListFooterComponent={<View style={styles.footer}><Text style={styles.footerText}>A porta é descoberta automaticamente pelo serviço local. Nenhuma configuração manual é necessária.</Text><Text style={styles.footerSub}>Protocolo ClusterAI 0.1  ·  pareamento protegido</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 30 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  eyebrow: { color: palette.cyan, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: palette.text, fontSize: 30, fontWeight: "800", marginTop: 4 },
  headerIcon: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: palette.border, alignItems: "center", justifyContent: "center", transform: [{ rotate: "90deg" }] },
  networkPill: { minHeight: 40, borderRadius: 12, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.green },
  networkText: { color: palette.muted, fontSize: 12, flex: 1 },
  heroCard: { backgroundColor: palette.surfaceSoft, borderRadius: 22, borderWidth: 1, borderColor: palette.border, padding: 18, marginBottom: 26 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardLabel: { color: palette.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  heroValue: { color: palette.cyan, fontSize: 34, fontWeight: "800", marginTop: 8 },
  stackIcon: { backgroundColor: "#16344D", borderRadius: 14, width: 46, height: 46, alignItems: "center", justifyContent: "center" },
  metricsRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: palette.border, marginTop: 20, paddingTop: 15, marginBottom: 18 },
  metricValue: { color: palette.text, fontSize: 19, fontWeight: "800" },
  metricLabel: { color: palette.muted, fontSize: 11, marginTop: 3 },
  primaryButton: { height: 48, borderRadius: 14, backgroundColor: palette.cyan, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryButtonText: { color: palette.bg, fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 },
  sectionTitle: { color: palette.text, fontSize: 18, fontWeight: "800" },
  sectionMeta: { color: palette.muted, fontSize: 12 },
  nodeCard: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 18, padding: 15, marginBottom: 11 },
  nodeTop: { flexDirection: "row", alignItems: "center" },
  nodeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  nodeIdentity: { flex: 1 },
  nodeName: { color: palette.text, fontSize: 15, fontWeight: "800" },
  nodeRole: { color: palette.muted, fontSize: 11, marginTop: 3 },
  statusText: { fontSize: 11, fontWeight: "800" },
  nodeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14, borderTopWidth: 1, borderTopColor: palette.border, marginTop: 13, paddingTop: 12 },
  nodeLabel: { color: palette.muted, fontSize: 9, letterSpacing: 0.8, fontWeight: "800" },
  nodeValue: { color: palette.text, fontSize: 12, fontWeight: "700", marginTop: 4 },
  modelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 14 },
  modelText: { color: palette.text, fontSize: 12, marginTop: 4, fontWeight: "600" },
  loadText: { color: palette.muted, fontSize: 11 },
  progressTrack: { height: 4, backgroundColor: "#183047", borderRadius: 2, marginTop: 10, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  footer: { paddingTop: 13, paddingHorizontal: 4 },
  footerText: { color: palette.muted, fontSize: 11, lineHeight: 16 },
  footerSub: { color: "#57758D", fontSize: 10, marginTop: 7 },
});
