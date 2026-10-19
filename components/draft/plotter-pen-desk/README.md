# Plotter Pen Desk

AxiDraw-style gantry with pen-down ink strokes and dashed pen-up rapid travels.

**Tags:** `plotter` `cnc` `gantry` `svg` `toolpath`

## Math / Tech

Path sampled to polyline. Tool advances at `feed` when pen-down, `feed·travelMult` when pen-up. Gantry X/Y beams track head; ink vs travel paths separated by pen state machine.
