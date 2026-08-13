# Guilloche Engine

Rose-engine hypotrochoid engraving — banknote-grade guilloché from rolling-circle kinematics.

**Tags:** `hypotrochoid` `generative` `canvas` `security-pattern` `kinematics`

## Math

```
x(θ) = (R − r) cos θ + d cos(((R − r)/r)·θ)
y(θ) = (R − r) sin θ − d sin(((R − r)/r)·θ)
```

When R/r is rational the curve closes; irrational ratios dense-fill an annular band. Dual offset strokes simulate engraved depth without gradients.
