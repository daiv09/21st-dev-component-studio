"use client";

import TimeseriesAggregator from "./timeseries-aggregator";

export default function TimeseriesAggregatorDemo() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-10">
      <TimeseriesAggregator className="w-full max-w-md" intensity={0.5} aria-label="Timescale Database Aggregator" />
    </div>
  );
}
