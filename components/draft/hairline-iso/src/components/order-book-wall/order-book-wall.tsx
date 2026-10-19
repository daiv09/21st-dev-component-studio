"use client";
import { makeFigure } from "../../kit/make";
import { mount } from "./order-book-wall-engine";

export default makeFigure({
  id: "order-book-wall", rest: "rest", engine: mount,
  label: "A liquidity wall of bids and asks forming mountain ranges. The pointer moves the mid price.",
}, "5 / 4");
