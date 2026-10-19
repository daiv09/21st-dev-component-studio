# Balance Beam Scale

Analytical balance with torque ODE — knife-edge beam settles when m_L = m_R.

**Tags:** `balance` `ode` `physics` `canvas` `metrology`

## Math

```
I θ̈ + c θ̇ + κ sinθ = g(m_R − m_L)·L/2
```

Integrate with semi-implicit Euler. Equal masses → θ → 0. Pointer reads against fixed arc.
