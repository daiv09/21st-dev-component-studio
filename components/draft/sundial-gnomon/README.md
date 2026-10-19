# Sundial Gnomon

Horizontal sundial whose style is elevated to latitude φ — hard-edge shadow polygon tracks solar hour angle.

**Tags:** `sundial` `astronomy` `shadow` `svg` `latitude`

## Math

Style angle = φ. Shadow azimuth:

```
tan A = sin H / (sin φ · cos H − cos φ · tan δ)
```

Altitude from `sin a = sin φ sin δ + cos φ cos δ cos H`. Shadow length ∝ cot(a).
