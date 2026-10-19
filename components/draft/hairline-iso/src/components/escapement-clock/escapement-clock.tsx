"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./escapement-clock-engine";

export default makeFigure({
  id: "escapement-clock", rest: "rest", engine: mount,
  label: "A pendulum clock escapement. Drag sideways to set the mainspring tension.",
}, "5 / 4");
