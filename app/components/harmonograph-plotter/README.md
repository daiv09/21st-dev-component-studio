# Harmonograph Plotter

Dual-pendulum damped Lissajous curves drawn in real time — a digital twin of a Victorian harmonograph.

**Tags:** `svg-canvas` `kinematics` `lissajous` `physics` `generative`

## Math

```
x(t) = A · sin(2π·fₐ·t + φₐ) · e^(-d·t)
y(t) = A · sin(2π·fᵦ·t + φᵦ) · e^(-d·t)
```

Frequency ratios near integers yield closed figures; irrational ratios fill the plane. Exponential damping collapses amplitude over time, producing the classic nested spiral decay.
