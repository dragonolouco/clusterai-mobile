import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";

const c = { bg: "#07111F", surface: "#0D1B2A", raised: "#10243A", border: "#1E3A56", text: "#E6F4FE", muted: "#8BA4B8", cyan: "#67E8F9", amber: "#FBBF24", green: "#34D399", red: "#FB7185" };

export default function ModelScreen() {
  const [model, setModel] = useState<{ name: string; size?: number; uri: string } | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function chooseModel() {
    setNotice("");
    setBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ["application/octet-stream", "*/*"], copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      const isSupported = /\.(gguf|pte)$/i.test(asset.name);
      if (!isSupported) {
        setNotice("Formato não reconhecido. Selecione um arquivo .gguf ou .pte.");
        return;
      }
      const safeName = asset.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const destination = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory}models/${safeName}`;
      const directory = `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory}models`;
      const info = await FileSystem.getInfoAsync(directory);
      if (!info.exists) await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      await FileSystem.copyAsync({ from: asset.uri, to: destination });
      setModel({ name: asset.name, size: asset.size, uri: destination });
      setNotice("Arquivo copiado para o armazenamento do aplicativo. O runtime de inferência ainda não está conectado.");
    } catch (error) {
      setNotice(`Falha ao importar o modelo: ${error instanceof Error ? error.message : "erro desconhecido"}`);
    } finally { setBusy(false); }
  }

  return <ScreenContainer className="px-5" containerClassName="bg-background"><View style={s.content}><Text style={s.eyebrow}>CLUSTERAI / MODELO</Text><Text style={s.title}>Modelos locais</Text><View style={s.runtime}><IconSymbol name="memory" size={20} color={c.amber} /><View style={{ flex: 1 }}><Text style={s.runtimeTitle}>Runtime não conectado</Text><Text style={s.runtimeBody}>O arquivo pode ser importado, mas ainda não será executado.</Text></View><Text style={s.pending}>PENDENTE</Text></View>
    {model ? <View style={s.selected}><View style={s.selectedIcon}><IconSymbol name="check" size={22} color={c.green} /></View><View style={{ flex: 1 }}><Text style={s.selectedLabel}>ARQUIVO IMPORTADO</Text><Text style={s.selectedName} numberOfLines={1}>{model.name}</Text><Text style={s.selectedMeta}>{model.size ? `${(model.size / 1024 ** 3).toFixed(2)} GB` : "Tamanho não informado"} · execução não iniciada</Text></View></View> : <View style={s.empty}><View style={s.icon}><IconSymbol name="memory" size={23} color={c.amber} /></View><Text style={s.heading}>Nenhum modelo selecionado</Text><Text style={s.body}>Escolha um arquivo GGUF ou PTE do armazenamento. O aplicativo validará apenas a extensão e manterá o arquivo localmente até a integração do runtime.</Text></View>}
    <Pressable onPress={chooseModel} disabled={busy} style={({ pressed }) => [s.primary, (pressed || busy) && { opacity: .7 }]}><IconSymbol name="folder" size={19} color={c.bg} /><Text style={s.primaryText}>{busy ? "Importando…" : model ? "Escolher outro arquivo" : "Selecionar modelo local"}</Text></Pressable>
    <View style={s.info}><Text style={s.label}>PRÓXIMA INTEGRAÇÃO</Text><Text style={s.infoTitle}>llama.cpp ou ExecuTorch</Text><Text style={s.body}>Depois do runtime nativo, o app poderá ler metadados, calcular memória do modelo, carregar o tokenizer e habilitar o Chat somente após o estado pronto.</Text></View>{notice ? <Text style={s.notice}>{notice}</Text> : null}</View></ScreenContainer>;
}
const s = StyleSheet.create({ content: { paddingTop: 18 }, eyebrow: { color: c.cyan, fontSize: 11, fontWeight: "800", letterSpacing: 1.5 }, title: { color: c.text, fontSize: 30, fontWeight: "800", marginTop: 4 }, runtime: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 17, padding: 14, marginTop: 22 }, runtimeTitle: { color: c.text, fontSize: 13, fontWeight: "800" }, runtimeBody: { color: c.muted, fontSize: 11, marginTop: 3 }, pending: { color: c.amber, fontSize: 9, fontWeight: "800" }, empty: { alignItems: "center", borderWidth: 1, borderColor: c.border, borderStyle: "dashed", borderRadius: 18, padding: 24, marginTop: 18 }, icon: { width: 48, height: 48, borderRadius: 15, backgroundColor: "#3A2C14", alignItems: "center", justifyContent: "center", marginBottom: 12 }, heading: { color: c.text, fontSize: 15, fontWeight: "800" }, body: { color: c.muted, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 8 }, selected: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.raised, borderWidth: 1, borderColor: c.border, borderRadius: 17, padding: 15, marginTop: 18 }, selectedIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: "#123A31", alignItems: "center", justifyContent: "center" }, selectedLabel: { color: c.green, fontSize: 9, fontWeight: "800", letterSpacing: 1 }, selectedName: { color: c.text, fontSize: 14, fontWeight: "800", marginTop: 4 }, selectedMeta: { color: c.muted, fontSize: 10, marginTop: 5 }, primary: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: c.cyan, borderRadius: 13, paddingVertical: 14, marginTop: 16 }, primaryText: { color: c.bg, fontSize: 12, fontWeight: "800" }, info: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 17, padding: 16, marginTop: 18 }, label: { color: c.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 }, infoTitle: { color: c.text, fontSize: 16, fontWeight: "800", marginTop: 7 }, notice: { color: c.cyan, backgroundColor: "#12283A", borderRadius: 12, padding: 12, fontSize: 11, lineHeight: 16, marginTop: 12 } });
