"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./sorting-conveyor-engine";

export default makeFigure({
  id: "sorting-conveyor", rest: "rest", engine: mount,
  label: "A conveyor that routes packages into three lanes by size.",
}, "5 / 4");
