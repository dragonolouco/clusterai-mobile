export type NodeRole = "coordinator" | "worker";
export type NodeState = "discovered" | "paired" | "authorized" | "offline";

export type MeasuredCapability = {
  sustainedTokensPerSecond?: number;
  freeMemoryBytes?: number;
  memoryRequiredBytes?: number;
  networkLatencyMs?: number;
  networkMbps?: number;
  batteryLevel?: number;
  isCharging?: boolean;
  thermalStatus?: number;
  measuredAt?: string;
};

export type ClusterNode = {
  nodeId: string;
  displayName: string;
  role: NodeRole;
  state: NodeState;
  address?: string;
  port?: number;
  modelId?: string;
  capabilities: MeasuredCapability;
};

export type LayerAssignment = {
  nodeId: string;
  startLayer: number;
  endLayer: number;
  capacityWeight: number;
};

export type LayerPlan = {
  assignments: LayerAssignment[];
  reason?: string;
};

function finitePositive(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/** Returns undefined when the node lacks enough measurements for a trustworthy score. */
export function capacityScore(node: ClusterNode): number | undefined {
  const compute = node.capabilities.sustainedTokensPerSecond;
  if (!finitePositive(compute)) return undefined;

  const freeMemory = node.capabilities.freeMemoryBytes;
  const requiredMemory = node.capabilities.memoryRequiredBytes;
  const memoryFactor = finitePositive(freeMemory) && finitePositive(requiredMemory)
    ? Math.min(1, Math.max(0, (freeMemory - requiredMemory) / freeMemory))
    : 1;

  const latency = node.capabilities.networkLatencyMs;
  const networkFactor = finitePositive(latency) ? 1 / (1 + latency / 100) : 1;
  const batteryFactor = typeof node.capabilities.batteryLevel === "number"
    ? node.capabilities.batteryLevel < 0.15 && !node.capabilities.isCharging ? 0.25 : 1
    : 1;
  const thermalFactor = typeof node.capabilities.thermalStatus === "number"
    ? Math.max(0.2, 1 - Math.min(node.capabilities.thermalStatus, 4) * 0.15)
    : 1;

  return compute * memoryFactor * networkFactor * batteryFactor * thermalFactor;
}

/**
 * Allocates contiguous transformer layers by measured capacity.
 * It intentionally refuses to produce a plan when a participating node has no benchmark.
 */
export function buildLayerPlan(nodes: ClusterNode[], totalLayers: number): LayerPlan {
  if (!Number.isInteger(totalLayers) || totalLayers <= 0) {
    return { assignments: [], reason: "Número de camadas do modelo não validado." };
  }
  const eligible = nodes.filter((node) => node.state === "authorized");
  if (eligible.length === 0) return { assignments: [], reason: "Nenhum nó autorizado." };

  const scored = eligible.map((node) => ({ node, score: capacityScore(node) }));
  if (scored.some(({ score }) => score === undefined)) {
    return { assignments: [], reason: "Benchmark sustentado incompleto; o plano não será estimado." };
  }
  const totalScore = scored.reduce((sum, item) => sum + (item.score ?? 0), 0);
  if (!finitePositive(totalScore)) return { assignments: [], reason: "Capacidade medida insuficiente." };

  let cursor = 0;
  const assignments: LayerAssignment[] = [];
  scored.forEach(({ node, score }, index) => {
    const remainingNodes = scored.length - index - 1;
    const remainingLayers = totalLayers - cursor;
    const suggested = index === scored.length - 1
      ? remainingLayers
      : Math.max(1, Math.round((score! / totalScore) * totalLayers));
    const count = Math.min(suggested, remainingLayers - remainingNodes);
    assignments.push({ nodeId: node.nodeId, startLayer: cursor, endLayer: cursor + count - 1, capacityWeight: score! / totalScore });
    cursor += count;
  });
  return { assignments };
}

export function aggregateFreeMemory(nodes: ClusterNode[]): number | undefined {
  const values = nodes
    .filter((node) => node.state === "authorized")
    .map((node) => node.capabilities.freeMemoryBytes)
    .filter(finitePositive);
  if (values.length === 0) return undefined;
  return values.reduce((total, value) => total + value, 0);
}
