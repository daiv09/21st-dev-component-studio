# Marionette IK

FABRIK inverse-kinematics puppet with catenary control strings from a crossbar.

**Tags:** `ik` `fabrik` `catenary` `svg` `puppet`

## Math

FABRIK forward/backward reaches pin end-effector to target while preserving bone lengths. Strings: samples along `lerp(A,B) + sag·sin(πt)` approximating a catenary sag between bar and limb.
