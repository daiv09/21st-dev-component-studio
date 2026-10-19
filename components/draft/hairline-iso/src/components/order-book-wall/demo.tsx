"use client";

import OrderBookWall from "./order-book-wall";

export default function OrderBookWallDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <OrderBookWall className="w-full max-w-md" intensity={0.5} aria-label="Order Book Depth Wall" />
    </div>
  );
}
