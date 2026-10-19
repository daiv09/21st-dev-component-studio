"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./attention-matrix-engine";

export default makeFigure({
  id: "attention-matrix", rest: "rest", engine: mount,
  label: "A three-layer attention map over seven tokens. Hover a token in the top layer to trace its attention downward.",
}, "5 / 4");
