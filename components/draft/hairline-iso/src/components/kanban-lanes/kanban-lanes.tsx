"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./kanban-lanes-engine";

export default makeFigure({
  id: "kanban-lanes", rest: "rest", engine: mount,
  label: "A kanban board of three isometric lanes. Drag cards between lanes.",
}, "5 / 4");
