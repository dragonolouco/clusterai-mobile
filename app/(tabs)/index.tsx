import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Battery from "expo-battery";
import * as Network from "expo-network";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";

const colors = {
  bg: "#07111F",
  surface: "#0D1B2A",
  raised: "#10243A",
  border: "#1E3A56",
  text: "#E6F4FE",
  muted: "#8BA4B8",
  cyan: "#67E8F9",
  green: "#34D399",
  amber: "#FBBF24",
};

type DeviceFacts = {
  ip: string;
  network: string;
  battery: number | null;
};

export default function ClusterScreen() {
  const [facts, setFacts] = useState<DeviceFacts>({ ip: "Não disponível", network: "Verificando…", battery: null });
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");

  async function readDeviceFacts() {
    try {
      const state = await Network.getNetworkStateAsync();
      const ip = Platform.OS === "web" ? "0.0.0.0" : await Network.getIpAddressAsync();
      const battery = Platform.OS === "web" ? null : await Battery.getBatteryLevelAsync();
      setFacts({
        ip: ip && ip !== "0.0.0.0" ? ip : "Não disponível",
        network: state.type === Network.NetworkStateType.WIFI ? "Wi‑Fi local" : String(state.type),
        battery: battery !== null && battery >= 0 ? battery : null,
      });
    } catch {
      setFacts({ ip: "Não disponível", network: "Não disponível", battery: null });
    }
  }

  useEffect(() => { readDeviceFacts(); }, []);

  async function refresh() {
    setRefreshing(true);
    await readDeviceFacts();
    setRefreshing(false);
  }

  return (
    <ScreenContainer edges={["top", "left", "right"]} className="px-5" containerClassName="bg-background">
      <FlatList
        data={[]}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.cyan} />}
        renderItem={() => null}
        ListHeaderComponent={<>
          <View style={styles.header}>
            <View><Text style={styles.eyebrow}>CLUSTERAI / LOCAL</Text><Text style={styles.title}>Seu cluster</Text></View>
            <View style={styles.liveBadge}><View style={styles.dot} /><Text style={styles.liveText}>LOCAL</Text></View>
          </View>

          <View style={styles.networkCard}>
            <View style={styles.networkIcon}><IconSymbol name="wifi" size={20} color={colors.cyan} /></View>
            <View style={styles.networkCopy}><Text style={styles.networkTitle}>{facts.network}</Text><Text style={styles.networkSub}>Descoberta automática aguardando integração nativa</Text></View>
            <ActivityIndicator size="small" color={colors.cyan} />
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>ESTADO DO CLUSTER</Text>
            <Text style={styles.summaryTitle}>Nenhum nó autenticado</Text>
            <Text style={styles.summaryBody}>O aplicativo ainda não encontrou um dispositivo autenticado para formar o cluster. Nenhuma capacidade é somada antes de uma conexão real.</Text>
            <View style={styles.summaryLine} />
            <View style={styles.metricsRow}><Metric label="nós conectados" value="0" /><Metric label="memória agregada" value="—" /><Metric label="tarefas ativas" value="0" /></View>
          </View>

          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Este dispositivo</Text><Text style={styles.sectionMeta}>dados medidos localmente</Text></View>
          <View style={styles.deviceCard}>
            <View style={styles.deviceHeader}><View style={styles.deviceIcon}><IconSymbol name="smartphone" size={20} color={colors.cyan} /></View><View style={{ flex: 1 }}><Text style={styles.deviceName}>Dispositivo atual</Text><Text style={styles.deviceRole}>Coordenador ainda não iniciado</Text></View><View style={styles.statusTag}><View style={styles.dot} /><Text style={styles.statusText}>Disponível</Text></View></View>
            <View style={styles.factsGrid}><Fact label="IP LOCAL" value={facts.ip} /><Fact label="PORTA" value="Não aberta" /><Fact label="BATERIA" value={facts.battery === null ? "Não disponível" : `${Math.round(facts.battery * 100)}%`} /><Fact label="MODELO" value="Nenhum carregado" /></View>
          </View>

          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Dispositivos na rede</Text><Text style={styles.sectionMeta}>0 autenticados</Text></View>
          <View style={styles.emptyCard}><View style={styles.emptyIcon}><IconSymbol name="search" size={22} color={colors.cyan} /></View><Text style={styles.emptyTitle}>Nenhum dispositivo confirmado</Text><Text style={styles.emptyBody}>Quando a descoberta NSD/mDNS estiver ativa, os aparelhos reais aparecerão aqui com o endereço, porta aberta, telemetria e modelo verificados.</Text><Pressable onPress={() => setNotice("A descoberta automática precisa da ponte Android NSD/mDNS; nenhum dispositivo foi inventado nesta tela.")} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>Ver requisitos da conexão</Text></Pressable></View>

          <View style={styles.modelCard}><View style={styles.modelHeader}><View><Text style={styles.cardLabel}>MODELO LOCAL</Text><Text style={styles.modelTitle}>Nenhum modelo carregado</Text></View><View style={styles.modelIcon}><IconSymbol name="memory" size={22} color={colors.amber} /></View></View><Text style={styles.modelBody}>O chat só será habilitado depois que um arquivo de modelo compatível for carregado e validado pelo runtime Android.</Text><View style={styles.requirement}><View style={styles.requirementDot} /><Text style={styles.requirementText}>Runtime nativo: pendente</Text></View><View style={styles.requirement}><View style={styles.requirementDot} /><Text style={styles.requirementText}>Arquivo GGUF/PTE: não selecionado</Text></View></View>

          {notice ? <View style={styles.notice}><Text style={styles.noticeText}>{notice}</Text></View> : null}
          <Text style={styles.footer}>Dados não disponíveis são exibidos como “—” ou “Não disponível”. O aplicativo não usa números de demonstração.</Text>
        </>}
      />
    </ScreenContainer>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <View><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>; }
function Fact({ label, value }: { label: string; value: string }) { return <View style={styles.fact}><Text style={styles.factLabel}>{label}</Text><Text style={styles.factValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  content: { paddingTop: 18, paddingBottom: 34 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }, eyebrow: { color: colors.cyan, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 }, title: { color: colors.text, fontSize: 30, fontWeight: "800", marginTop: 4 }, liveBadge: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }, liveText: { color: colors.muted, fontSize: 10, fontWeight: "800" }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green }, networkCard: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 13, marginBottom: 14 }, networkIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#14324B", alignItems: "center", justifyContent: "center" }, networkCopy: { flex: 1 }, networkTitle: { color: colors.text, fontSize: 13, fontWeight: "800" }, networkSub: { color: colors.muted, fontSize: 10, marginTop: 3 }, summaryCard: { backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.border, borderRadius: 22, padding: 18, marginBottom: 25 }, cardLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 }, summaryTitle: { color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 9 }, summaryBody: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 }, summaryLine: { height: 1, backgroundColor: colors.border, marginVertical: 18 }, metricsRow: { flexDirection: "row", justifyContent: "space-between" }, metricValue: { color: colors.text, fontSize: 20, fontWeight: "800" }, metricLabel: { color: colors.muted, fontSize: 10, marginTop: 3 }, sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 11 }, sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "800" }, sectionMeta: { color: colors.muted, fontSize: 10 }, deviceCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 15, marginBottom: 24 }, deviceHeader: { flexDirection: "row", alignItems: "center", gap: 10 }, deviceIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#14324B", alignItems: "center", justifyContent: "center" }, deviceName: { color: colors.text, fontSize: 14, fontWeight: "800" }, deviceRole: { color: colors.muted, fontSize: 10, marginTop: 3 }, statusTag: { flexDirection: "row", alignItems: "center", gap: 5 }, statusText: { color: colors.green, fontSize: 10, fontWeight: "800" }, factsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 17, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 14, paddingTop: 13 }, fact: { minWidth: "40%" }, factLabel: { color: colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: .8 }, factValue: { color: colors.text, fontSize: 12, fontWeight: "700", marginTop: 4 }, emptyCard: { alignItems: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", borderRadius: 18, padding: 22, marginBottom: 24 }, emptyIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: "#14324B", alignItems: "center", justifyContent: "center", marginBottom: 11 }, emptyTitle: { color: colors.text, fontWeight: "800", fontSize: 14 }, emptyBody: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 7 }, secondaryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10, marginTop: 15 }, secondaryButtonText: { color: colors.cyan, fontSize: 11, fontWeight: "800" }, modelCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 16, marginBottom: 18 }, modelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, modelTitle: { color: colors.text, fontSize: 16, fontWeight: "800", marginTop: 7 }, modelIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#3A2C14", alignItems: "center", justifyContent: "center" }, modelBody: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 14 }, requirement: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }, requirementDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.amber }, requirementText: { color: colors.muted, fontSize: 11 }, notice: { backgroundColor: "#12283A", borderRadius: 12, padding: 12, marginBottom: 12 }, noticeText: { color: colors.cyan, fontSize: 11, lineHeight: 16 }, footer: { color: "#57758D", fontSize: 10, lineHeight: 15, textAlign: "center", paddingHorizontal: 10 }, pressed: { opacity: .7, transform: [{ scale: .985 }] },
});

function ChatScreen() {
  return <ScreenContainer className="px-5" containerClassName="bg-background"><View style={styles.content}><Text style={styles.eyebrow}>CLUSTERAI / CHAT</Text><Text style={styles.title}>Conversa local</Text><View style={[styles.emptyCard, { marginTop: 24 }]}><Text style={styles.emptyTitle}>Chat indisponível</Text><Text style={styles.emptyBody}>Carregue um modelo local validado para habilitar a geração. Nenhuma resposta será simulada pelo aplicativo.</Text><TextInput editable={false} placeholder="Carregue um modelo primeiro…" placeholderTextColor={colors.muted} style={chatStyles.input} /></View></View></ScreenContainer>;
}

export { ChatScreen };
const chatStyles = StyleSheet.create({ input: { alignSelf: "stretch", borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.muted, marginTop: 16, backgroundColor: colors.bg } });
