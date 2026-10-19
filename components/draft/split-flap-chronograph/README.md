# Split-Flap Chronograph

Airport split-flap display with per-module cascade and mechanical inertia timing.

**Tags:** `split-flap` `typography` `kinematics` `airport` `chronograph`

## Math / Tech

Each module walks charset index `i → (i+1) mod N` until target. Half-period rotateX(-90°) on departing top flap, then commit + coast delay `stepMs · U(0.35,0.75)` for inertia stagger. Column delay `i · staggerMs` produces the cascade.
