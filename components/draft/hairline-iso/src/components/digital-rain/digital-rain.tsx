"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./digital-rain-engine";

export default makeFigure({
  id: "digital-rain", rest: "rest", engine: mount,
  label: "A monolith of falling glyphs. Hover or touch to resolve glyphs into solid blocks.",
}, "5 / 4");
