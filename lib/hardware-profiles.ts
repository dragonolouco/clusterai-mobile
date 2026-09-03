export type HardwareProfile = {
  id: string;
  label: string;
  platform: "ios" | "android" | "linux" | "windows";
  memoryBytes?: number;
  memoryLayout?: string;
  processor: string;
  accelerator: string;
  inferenceRole: string;
  benchmarkRequired: boolean;
  notes: string;
};

/** Static hardware facts only; runtime performance is never filled in here. */
export const HARDWARE_PROFILES: HardwareProfile[] = [
  {
    id: "iphone12-a14",
    label: "iPhone 12",
    platform: "ios",
    memoryBytes: 4 * 1024 ** 3,
    processor: "Apple A14 Bionic",
    accelerator: "GPU/Neural Engine Apple; backend precisa ser validado",
    inferenceRole: "worker forte ou coordenador móvel",
    benchmarkRequired: true,
    notes: "O usuário já confirmou execução local de LFM2-2.6B Q8_0; medir novamente no runtime escolhido.",
  },
  {
    id: "realme-c51-rmx3830",
    label: "realme C51 (RMX3830)",
    platform: "android",
    memoryBytes: 4 * 1024 ** 3,
    memoryLayout: "4 GB LPDDR4X + expansão virtual no armazenamento (não contabilizar como RAM)",
    processor: "Unisoc T612, octa-core até 1,82 GHz",
    accelerator: "GPU integrada; backend de inferência ainda não validado",
    inferenceRole: "worker de fatia pequena ou nó auxiliar",
    benchmarkRequired: true,
    notes: "A expansão dinâmica não é memória física e não entra no score de capacidade.",
  },
  {
    id: "notebook-i7-2760qm",
    label: "Notebook i7-2760QM",
    platform: "windows",
    memoryBytes: 8 * 1024 ** 3,
    processor: "Intel Core i7-2760QM, 4 núcleos/8 threads",
    accelerator: "GPU não informada; CPU é o recurso considerado",
    inferenceRole: "coordenador temporário ou worker",
    benchmarkRequired: true,
    notes: "Desempenho sustentado depende de refrigeração, memória e sistema operacional.",
  },
  {
    id: "desktop-ryzen5-5500",
    label: "PC Ryzen 5 5500",
    platform: "windows",
    memoryBytes: 16 * 1024 ** 3,
    memoryLayout: "2×8 GB dual-channel",
    processor: "AMD Ryzen 5 5500, 6 núcleos/12 threads",
    accelerator: "GT 740 4 GB GDDR5 tratada como saída de vídeo, não como acelerador de IA",
    inferenceRole: "coordenador principal e worker de maior memória",
    benchmarkRequired: true,
    notes: "A capacidade de inferência será calculada pelo Ryzen e pela RAM; a VRAM não será somada.",
  },
];

export function inferenceMemoryBytes(profile: HardwareProfile): number | undefined {
  return profile.memoryBytes;
}

export function isInferenceAccelerator(profile: HardwareProfile): boolean {
  return profile.id !== "desktop-ryzen5-5500";
}
