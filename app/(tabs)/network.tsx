import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import * as Network from "expo-network";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";

const c = { bg: "#07111F", surface: "#0D1B2A", raised: "#10243A", border: "#1E3A56", text: "#E6F4FE", muted: "#8BA4B8", cyan: "#67E8F9", green: "#34D399", amber: "#FBBF24" };

export default function NetworkScreen() {
  const [ip, setIp] = useState("Não disponível");
  const [network, setNetwork] = useState("Verificando…");
  const [refreshing, setRefreshing] = useState(true);
  const [notice, setNotice] = useState("");

  async function readNetwork() {
    setRefreshing(true);
    try {
      const state = await Network.getNetworkStateAsync();
      const address = Platform.OS === "web" ? "0.0.0.0" : await Network.getIpAddressAsync();
      setNetwork(state.type === Network.NetworkStateType.WIFI ? "Wi‑Fi local" : String(state.type));
      setIp(address && address !== "0.0.0.0" ? address : "Não disponível");
    } catch {
      setNetwork("Não disponível");
      setIp("Não disponível");
    } finally { setRefreshing(false); }
  }

  useEffect(() => { readNetwork(); }, []);

  return <ScreenContainer className="px-5" containerClassName="bg-background"><View style={s.content}><View style={s.header}><View><Text style={s.eyebrow}>CLUSTERAI / REDE</Text><Text style={s.title}>Rede e porta</Text></View><Pressable onPress={readNetwork} style={({ pressed }) => [s.refresh, pressed && { opacity: .65 }]}><IconSymbol name="refresh" size={20} color={c.cyan} /></Pressable></View>
    <View style={s.statusCard}><View style={s.statusIcon}><IconSymbol name="router" size={23} color={c.cyan} /></View><View style={{ flex: 1 }}><Text style={s.statusTitle}>{network}</Text><Text style={s.statusBody}>Endereço local: {ip}</Text></View>{refreshing ? <ActivityIndicator color={c.cyan} /> : <View style={s.statusPill}><View style={s.dot} /><Text style={s.statusPillText}>REDE</Text></View>}</View>
    <View style={s.section}><Text style={s.sectionTitle}>Serviço do ClusterAI</Text><Text style={s.sectionMeta}>somente dados reais</Text></View>
    <View style={s.card}><Row label="Estado do serviço" value="Não iniciado" tone="amber" /><Row label="Porta" value="Não aberta" /><Row label="Transporte" value="Módulo Android pendente" /><Row label="Conexões ativas" value="0" /></View>
    <View style={s.infoCard}><View style={s.infoHeader}><IconSymbol name="lock" size={19} color={c.green} /><Text style={s.infoTitle}>Conexão automática</Text></View><Text style={s.infoBody}>Quando o serviço nativo estiver ativo, o aplicativo abrirá uma porta dinâmica, anunciará o serviço por NSD/mDNS e exibirá aqui a porta efetivamente aberta. O usuário não precisará digitá-la para conectar outro aparelho.</Text></View>
    <View style={s.section}><Text style={s.sectionTitle}>Acesso avançado</Text><Text style={s.sectionMeta}>opcional</Text></View>
    <View style={s.terminalCard}><View style={s.terminalHeader}><IconSymbol name="terminal" size={19} color={c.cyan} /><Text style={s.terminalTitle}>Terminal na mesma rede</Text></View><Text style={s.terminalBody}>a‑Shell no iPhone ou um terminal Android poderá consultar o nó quando houver uma porta real, o serviço estiver ativo e a sessão estiver autorizada.</Text><View style={s.codeBox}><Text style={s.codeText}>Porta: —</Text><Text style={s.codeText}>Estado: serviço não iniciado</Text><Text style={s.codeHint}>Nenhum comando é exibido enquanto não existir um endpoint real.</Text></View><Pressable onPress={() => setNotice("O acesso por terminal será habilitado somente após o serviço nativo abrir uma porta e autenticar a sessão.")} style={({ pressed }) => [s.outline, pressed && { opacity: .7 }]}><Text style={s.outlineText}>Como funcionará</Text></Pressable></View>
    {notice ? <Text style={s.notice}>{notice}</Text> : null}
  </View></ScreenContainer>;
}
function Row({ label, value, tone }: { label: string; value: string; tone?: "amber" }) { return <View style={s.row}><Text style={s.rowLabel}>{label}</Text><Text style={[s.rowValue, tone === "amber" && { color: c.amber }]}>{value}</Text></View>; }
const s = StyleSheet.create({ content: { paddingTop: 18, paddingBottom: 34 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }, eyebrow: { color: c.cyan, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 }, title: { color: c.text, fontSize: 30, fontWeight: "800", marginTop: 4 }, refresh: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, borderColor: c.border, alignItems: "center", justifyContent: "center" }, statusCard: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 17, padding: 14 }, statusIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#14324B", alignItems: "center", justifyContent: "center" }, statusTitle: { color: c.text, fontSize: 14, fontWeight: "800" }, statusBody: { color: c.muted, fontSize: 11, marginTop: 4 }, statusPill: { flexDirection: "row", alignItems: "center", gap: 5 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.green }, statusPillText: { color: c.green, fontSize: 9, fontWeight: "800" }, section: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 26, marginBottom: 11 }, sectionTitle: { color: c.text, fontSize: 18, fontWeight: "800" }, sectionMeta: { color: c.muted, fontSize: 10 }, card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 17, paddingHorizontal: 15 }, row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: c.border }, rowLabel: { color: c.muted, fontSize: 12 }, rowValue: { color: c.text, fontSize: 12, fontWeight: "700", maxWidth: "55%", textAlign: "right" }, infoCard: { backgroundColor: c.raised, borderWidth: 1, borderColor: c.border, borderRadius: 17, padding: 16, marginTop: 15 }, infoHeader: { flexDirection: "row", alignItems: "center", gap: 9 }, infoTitle: { color: c.text, fontSize: 14, fontWeight: "800" }, infoBody: { color: c.muted, fontSize: 11, lineHeight: 17, marginTop: 11 }, terminalCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 17, padding: 16 }, terminalHeader: { flexDirection: "row", alignItems: "center", gap: 9 }, terminalTitle: { color: c.text, fontSize: 14, fontWeight: "800" }, terminalBody: { color: c.muted, fontSize: 11, lineHeight: 17, marginTop: 11 }, codeBox: { backgroundColor: c.bg, borderRadius: 12, padding: 13, marginTop: 13, borderWidth: 1, borderColor: c.border }, codeText: { color: c.cyan, fontFamily: "monospace", fontSize: 11, marginBottom: 5 }, codeHint: { color: c.muted, fontSize: 10, lineHeight: 15, marginTop: 3 }, outline: { alignSelf: "flex-start", borderWidth: 1, borderColor: c.border, borderRadius: 11, paddingHorizontal: 13, paddingVertical: 10, marginTop: 14 }, outlineText: { color: c.cyan, fontSize: 11, fontWeight: "800" }, notice: { color: c.cyan, backgroundColor: "#12283A", padding: 12, borderRadius: 12, fontSize: 11, lineHeight: 16, marginTop: 12 } });
