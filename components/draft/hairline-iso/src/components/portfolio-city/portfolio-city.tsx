"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./portfolio-city-engine";

export default makeFigure({
  id: "portfolio-city", rest: "rest", engine: mount,
  label: "A city of towers, one per asset: height shows risk-adjusted return, footprint shows allocation. Hover a tower for details.",
}, "5 / 4");
