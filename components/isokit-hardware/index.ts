"use client";

import NvidiaDgxPod from "../../app/submitted/NvidiaDgxPod";
import TensorCoreGpu from "./TensorCoreGpu";
import CpuSocketLga from "./CpuSocketLga";
import Hbm3MemoryStack from "./Hbm3MemoryStack";
import NvmeRaidArray from "./NvmeRaidArray";
import LiquidCoolingManifold from "./LiquidCoolingManifold";
import SfpNetworkSwitch from "./SfpNetworkSwitch";
import ModularPsu1600W from "./ModularPsu1600W";
import PcieRiserSwitch from "./PcieRiserSwitch";
import QuantumCryoDilution from "./QuantumCryoDilution";
import NpuInferenceAccelerator from "./NpuInferenceAccelerator";
import RackUpsBatteryBank from "./RackUpsBatteryBank";
import DualBiosRomSwitch from "./DualBiosRomSwitch";
import LiquidNitrogenPot from "./LiquidNitrogenPot";
import FpgaDevBoard from "./FpgaDevBoard";
import OpticalInterconnectTransceiver from "./OpticalInterconnectTransceiver";
import TapeArchiveAutoloader from "./TapeArchiveAutoloader";
import KvmConsoleCrashCart from "./KvmConsoleCrashCart";

export {
  NvidiaDgxPod,
  TensorCoreGpu,
  CpuSocketLga,
  Hbm3MemoryStack,
  NvmeRaidArray,
  LiquidCoolingManifold,
  SfpNetworkSwitch,
  ModularPsu1600W,
  PcieRiserSwitch,
  QuantumCryoDilution,
  NpuInferenceAccelerator,
  RackUpsBatteryBank,
  DualBiosRomSwitch,
  LiquidNitrogenPot,
  FpgaDevBoard,
  OpticalInterconnectTransceiver,
  TapeArchiveAutoloader,
  KvmConsoleCrashCart,
};

export const HARDWARE = [
  { title: "NVIDIA DGX SuperPOD", Component: NvidiaDgxPod },
  { title: "Tensor-core GPU", Component: TensorCoreGpu },
  { title: "LGA CPU socket", Component: CpuSocketLga },
  { title: "HBM3e stack", Component: Hbm3MemoryStack },
  { title: "NVMe RAID array", Component: NvmeRaidArray },
  { title: "Edge AI NPU", Component: NpuInferenceAccelerator },
  { title: "FPGA dev board", Component: FpgaDevBoard },
  { title: "Silicon photonics", Component: OpticalInterconnectTransceiver },
  { title: "KVM crash cart", Component: KvmConsoleCrashCart },
] as const;
