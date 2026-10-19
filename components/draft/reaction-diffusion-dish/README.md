# Reaction Diffusion Dish

Gray-Scott two-species ink in a Petri dish — binary threshold only, no gradients.

**Tags:** `gray-scott` `pde` `generative` `canvas` `ink`

## Math

```
∂u/∂t = Du∇²u − uv² + f(1−u)
∂v/∂t = Dv∇²v + uv² − (f+k)v
```

Pixel is ink if v &gt; 0.2 else paper. Feed/kill select spots, worms, or mazes.
