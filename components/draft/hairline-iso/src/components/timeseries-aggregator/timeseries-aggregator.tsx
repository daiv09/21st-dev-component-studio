"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./timeseries-aggregator-engine";

export default makeFigure({
  id: "timeseries-aggregator", rest: "rest", engine: mount,
  label: "Time-series telemetry rolling up into aggregate columns. Hover a column to read its bucket.",
}, "5 / 4");
