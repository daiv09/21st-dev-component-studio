# String Art Loom

Greedy chord weaving around pegs — each thread maximizes residual darkness along the line.

**Tags:** `string-art` `greedy` `generative` `svg` `optimization`

## Math

Maintain residual image R. From peg i pick j maximizing ∫_chord R. Burn R along chord. Repeat. Motifs seed R via implicit fields (heart, annulus, spiral).
