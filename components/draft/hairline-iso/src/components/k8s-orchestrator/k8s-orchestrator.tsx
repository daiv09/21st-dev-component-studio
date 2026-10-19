"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./k8s-orchestrator-engine";

export default makeFigure({
  id: "k8s-orchestrator", rest: "rest", engine: mount,
  label: "A Kubernetes cluster of three nodes with pods that autoscale, throttle and restart. Press to spike the load.",
}, "5 / 4");
