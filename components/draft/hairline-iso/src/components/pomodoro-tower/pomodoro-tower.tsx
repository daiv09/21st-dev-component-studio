"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./pomodoro-tower-engine";

export default makeFigure({
  id: "pomodoro-tower", rest: "rest", engine: mount,
  label: "An hourglass of blocks: time dissolves the left tower and builds the right monolith. Click to pause.",
}, "5 / 4");
