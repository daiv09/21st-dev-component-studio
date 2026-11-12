# 3D Cylinder Ring

A high-performance 3D cylindrical carousel showcasing items in continuous orbital rotation with interactive pointer physics, responsive cylindrical radius calculations, and GSAP-accelerated motion.

## Features

- **Dynamic 3D Geometry**: Automatic cylindrical trigonometry based on item count and responsive container width.
- **Interactive Velocity & Tilt**: Smooth pointer tilt with GSAP acceleration and directional velocity shifts.
- **Responsive Layout**: Fluid breakpoints adapting card dimensions and perspective for mobile, tablet, and desktop.
- **Dark/Light Mode**: Ambient lighting highlights and sleek border treatment matching Tailwind dark theme.

## Props

- `images` (`CylinderItem[]`): Array of image items with `src`, `alt`, and optional `title`.
- `duration` (`number`): Full rotation duration in seconds (default: `18`).
- `perspective` (`number`): CSS 3D perspective depth in pixels (default: `1100`).
- `initialTiltX` (`number`): Initial tilt angle around X-axis in degrees (default: `-14`).
- `interactiveTilt` (`boolean`): Whether pointer interaction tilts and accelerates the cylinder (default: `true`).
- `className` (`string`): Additional container styles.
- `cardClassName` (`string`): Additional card styles.

Tags: 3d-cylinder, carousel, gsap, react, tailwindcss, motion, hero, showcase
