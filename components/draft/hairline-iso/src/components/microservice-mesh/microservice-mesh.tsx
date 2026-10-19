"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./microservice-mesh-engine";

export default makeFigure({
  id: "microservice-mesh", rest: "rest", engine: mount,
  label: "A grid of service racks linked by fibre; packets pulse along the links. Hover a service to light its links.",
}, "5 / 4");
