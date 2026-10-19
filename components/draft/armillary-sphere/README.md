# Armillary Sphere

Nested celestial rings (equator, tropics, ecliptic, meridian) via perspective projection — R3F fallback.

**Tags:** `astronomy` `3d-projection` `canvas` `armillary` `celestial`

## Math

Ring points `(R cos θ, R sin θ, 0)` rotated by ring tilt, then view `R_y(yaw) R_x(pitch)`, projected with `x' = f·x/(z+f)`. Ecliptic tilted by obliquity ε. Painter’s algorithm sorts segments by depth.
