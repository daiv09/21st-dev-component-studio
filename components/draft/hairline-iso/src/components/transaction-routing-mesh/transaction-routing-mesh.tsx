"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./transaction-routing-mesh-engine";

export default makeFigure({
  id: "transaction-routing-mesh", rest: "rest", engine: mount,
  label: "A map of nine payment gateways with packets flowing between them. Click a gateway to take it down.",
}, "5 / 4");
