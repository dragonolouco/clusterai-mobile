export type Quantization = "Q4" | "Q5" | "Q8";

export type ModelCandidate = {
  id: string;
  label: string;
  parametersB: number;
  quantization: Quantization;
  contextTokens: number;
  sourceFormat: "GGUF" | "PTE";
  verifiedOnDevice: boolean;
  note: string;
};

export const MODEL_CATALOG: ModelCandidate[] = [
  { id: "lfm2-2.6b-q8", label: "LFM2 2.6B Q8_0", parametersB: 2.6, quantization: "Q8", contextTokens: 4096, sourceFormat: "GGUF", verifiedOnDevice: false, note: "Referência confirmada pelo usuário no iPhone 12; o runtime escolhido ainda precisa ser identificado." },
  { id: "qwen-3b-q4", label: "Modelo 3B Q4", parametersB: 3, quantization: "Q4", contextTokens: 4096, sourceFormat: "GGUF", verifiedOnDevice: false, note: "Candidato para o primeiro benchmark cruzado." },
  { id: "gemma-4b-q4", label: "Modelo 4B Q4", parametersB: 4, quantization: "Q4", contextTokens: 4096, sourceFormat: "GGUF", verifiedOnDevice: false, note: "Pode ser testado no iPhone 12 ou em distribuição com o notebook." },
  { id: "qwen-7b-q4", label: "Modelo 7B Q4", parametersB: 7, quantization: "Q4", contextTokens: 4096, sourceFormat: "GGUF", verifiedOnDevice: false, note: "Alvo de cluster; não afirmar compatibilidade antes do teste de memória e rede." },
  { id: "model-12b-q4", label: "Modelo 12B Q4", parametersB: 12, quantization: "Q4", contextTokens: 4096, sourceFormat: "GGUF", verifiedOnDevice: false, note: "Experimento futuro com Ryzen e outros nós; requer planejamento de camadas." },
];

const bitsPerWeight: Record<Quantization, number> = { Q4: 4, Q5: 5, Q8: 8 };

/** Estimate only the weight storage; KV cache and runtime overhead are intentionally added separately. */
export function estimateWeightBytes(model: Pick<ModelCandidate, "parametersB" | "quantization">): number {
  return model.parametersB * 1e9 * bitsPerWeight[model.quantization] / 8 * 1.1;
}

export function canFitSingleNode(model: ModelCandidate, freeMemoryBytes: number, safetyFactor = 0.7): boolean {
  if (!Number.isFinite(freeMemoryBytes) || freeMemoryBytes <= 0) return false;
  return estimateWeightBytes(model) < freeMemoryBytes * safetyFactor;
}

export function recommendForMemory(models: ModelCandidate[], freeMemoryBytes: number): ModelCandidate[] {
  return models.filter((model) => canFitSingleNode(model, freeMemoryBytes)).sort((a, b) => estimateWeightBytes(a) - estimateWeightBytes(b));
}
