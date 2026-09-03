import { describe, expect, it } from "vitest";
import { buildLayerPlan, capacityScore, type ClusterNode } from "../lib/cluster-domain";

const node = (nodeId: string, sustainedTokensPerSecond?: number): ClusterNode => ({
  nodeId,
  displayName: nodeId,
  role: "worker",
  state: "authorized",
  capabilities: {
    sustainedTokensPerSecond,
    freeMemoryBytes: 8 * 1024 * 1024 * 1024,
    memoryRequiredBytes: 2 * 1024 * 1024 * 1024,
    networkLatencyMs: 10,
    batteryLevel: 0.8,
    thermalStatus: 0,
  },
});

describe("cluster-domain", () => {
  it("não calcula capacidade sem benchmark sustentado", () => {
    expect(capacityScore(node("sem-benchmark"))).toBeUndefined();
    expect(buildLayerPlan([node("sem-benchmark")], 24).assignments).toEqual([]);
  });

  it("atribui mais camadas ao nó com maior capacidade medida", () => {
    const plan = buildLayerPlan([node("forte", 20), node("fraco", 5)], 24);
    const strong = plan.assignments.find((item) => item.nodeId === "forte");
    const weak = plan.assignments.find((item) => item.nodeId === "fraco");
    expect(strong).toBeDefined();
    expect(weak).toBeDefined();
    expect((strong!.endLayer - strong!.startLayer)).toBeGreaterThan(weak!.endLayer - weak!.startLayer);
  });
});
