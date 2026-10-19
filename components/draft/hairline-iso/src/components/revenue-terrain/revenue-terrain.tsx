"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./revenue-terrain-engine";

export default makeFigure({
  id: "revenue-terrain", rest: "rest", engine: mount,
  label: "Monthly recurring revenue as a terrain. Scrub sideways to lift flat contours into cliffs.",
}, "5 / 4");
