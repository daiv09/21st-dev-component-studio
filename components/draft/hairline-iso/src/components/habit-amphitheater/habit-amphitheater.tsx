"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./habit-amphitheater-engine";

export default makeFigure({
  id: "habit-amphitheater", rest: "rest", engine: mount,
  label: "A circular amphitheater of habit days. Completed days rise toward a crown that grows with your streak. Click a day to log it.",
}, "5 / 4");
