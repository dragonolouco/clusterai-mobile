import { describe, expect, it } from "vitest";
import { canFitSingleNode, estimateWeightBytes, MODEL_CATALOG, recommendForMemory } from "../lib/model-catalog";

describe("model-catalog", () => {
  it("estima Q8 maior que Q4 para a mesma quantidade de parâmetros", () => {
    expect(estimateWeightBytes({ parametersB: 2.6, quantization: "Q8" })).toBeGreaterThan(estimateWeightBytes({ parametersB: 2.6, quantization: "Q4" }));
  });

  it("não recomenda modelo quando não há memória livre válida", () => {
    expect(recommendForMemory(MODEL_CATALOG, 0)).toEqual([]);
    expect(canFitSingleNode(MODEL_CATALOG[0], Number.NaN)).toBe(false);
  });

  it("retorna candidatos ordenados por tamanho estimado", () => {
    const candidates = recommendForMemory(MODEL_CATALOG, 16 * 1024 ** 3);
    for (let i = 1; i < candidates.length; i += 1) {
      expect(estimateWeightBytes(candidates[i])).toBeGreaterThanOrEqual(estimateWeightBytes(candidates[i - 1]));
    }
  });
});
