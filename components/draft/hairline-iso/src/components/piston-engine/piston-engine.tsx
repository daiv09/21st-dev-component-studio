"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./piston-engine";

export default makeFigure({
  id: "piston-engine", rest: "rest", engine: mount,
  label: "Four pistons driven by a crankshaft. The pointer's height sets the revs.",
}, "5 / 4");
