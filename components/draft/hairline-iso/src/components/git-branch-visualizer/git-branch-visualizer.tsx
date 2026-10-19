"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./git-branch-visualizer-engine";

export default makeFigure({
  id: "git-branch-visualizer", rest: "rest", engine: mount,
  label: "A commit tree where branches split and merge into main, with conflict nodes to resolve.",
}, "5 / 4");
