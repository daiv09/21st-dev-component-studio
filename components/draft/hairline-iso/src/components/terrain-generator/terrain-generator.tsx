"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./terrain-generator-engine";

export default makeFigure({
  id: "terrain-generator", rest: "rest", engine: mount,
  label: "A voxel terrain generated from noise, with sliders for elevation, water level and sun angle.",
}, "5 / 4");
