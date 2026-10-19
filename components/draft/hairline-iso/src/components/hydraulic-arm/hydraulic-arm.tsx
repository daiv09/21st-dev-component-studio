"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./hydraulic-arm-engine";

export default makeFigure({
  id: "hydraulic-arm", rest: "rest", engine: mount,
  label: "A fully autonomous three-axis robotic arm continuously seeking, picking up, and dropping randomly generated blocks around a grid.",
}, "5 / 4");