"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./equalizer-grid-engine";

export default makeFigure({
  id: "equalizer-grid", rest: "rest", engine: mount,
  label: "A grid of frequency bars across time. Press M to drive it from your microphone.",
}, "5 / 4");
