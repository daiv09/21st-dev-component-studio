"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./vector-space-engine";

export default makeFigure({
  id: "vector-space", rest: "rest", engine: mount,
  label: "A 3D scatter of embedding clusters. Hover a point to see its nearest neighbours by cosine similarity.",
}, "5 / 4");
