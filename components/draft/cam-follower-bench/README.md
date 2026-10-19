# Cam Follower Bench

Plate cam profiles (harmonic, cycloidal, plateau, dwell) driving a spring-loaded flat follower with live lift scope.

**Tags:** `cam` `kinematics` `spring` `mechanical` `canvas`

## Math

Harmonic rise: `h(β) = (L/2)(1 − cos(πβ/βr))`. Cycloidal: `h = L(β/βr − sin(2πβ/βr)/(2π))`. Follower ODE: `ÿ = k(y_cam − y) − cẏ` with unilateral contact constraint.
