import type { EngineCtx, EngineInstance } from "../../kit/mount";
import { alpha, box, circle, dot, grid, line, poly, proj, type View } from "../../kit/iso";
import { clamp, damp } from "../../kit/motion";

/**
 * Fully Autonomous Hydraulic Robotic Arm.
 * Operates on an infinite state-machine loop, picking and placing blocks
 * at random empty locations with precisely calculated claw geometry.
 */
type Blk = { x: number; y: number; z: number; col: string };
type OpMode = 'none' | 'grab' | 'drop';

const L1 = 3.3, L2 = 3.1, BZ = 0.9, HALF = 4;

export function mount(c: EngineCtx): EngineInstance {
  const blocks: Blk[] = [];
  const colors = ["#f59e0b", "#38bdf8", "#a78bfa", "#ec4899", "#10b981", "#ef4444"];
  
  // Populate the grid with random blocks
  while (blocks.length < 8) {
    const rx = Math.floor(Math.random() * (HALF * 2 + 1)) - HALF;
    const ry = Math.floor(Math.random() * (HALF * 2 + 1)) - HALF;
    // Keep the center clear for the robotic base
    if (Math.hypot(rx, ry) < 1.5) continue;
    if (!blocks.some(b => b.x === rx && b.y === ry)) {
      blocks.push({ x: rx, y: ry, z: 0, col: colors[Math.floor(Math.random() * colors.length)] });
    }
  }
  
  let held: Blk | null = null;
  let yaw = 0.6, rr = 3.5, zz = 3.2, grip = 0.75;
  
  // Infinite loop State Machine
  let op: OpMode = 'none';
  let opX = 0, opY = 0, opTime = 0;
  let opBlock: Blk | null = null;

  const occupied = (x: number, y: number, ex?: Blk) => 
    blocks.some((b) => b !== ex && Math.abs(b.x - x) < 0.5 && Math.abs(b.y - y) < 0.5);

  const frame = (dt: number, t: number) => {
    const { g, w, h } = c, pal = c.pal();
    const s = Math.min(w / 17, h / 13);
    const v: View = { s, ox: w / 2, oy: h * 0.58 };
    const ln = alpha(pal.fg, 0.35);

    // 1. Autonomous AI Director
    if (op === 'none') {
      if (!held) {
        // Pick a random block to grab
        const targetBlock = blocks[Math.floor(Math.random() * blocks.length)];
        op = 'grab';
        opX = targetBlock.x;
        opY = targetBlock.y;
        opBlock = targetBlock;
        opTime = 0;
      } else {
        // Find a random empty space to drop
        let cx = 0, cy = 0, tries = 0;
        do {
          cx = Math.floor(Math.random() * (HALF * 2 + 1)) - HALF;
          cy = Math.floor(Math.random() * (HALF * 2 + 1)) - HALF;
          tries++;
        } while ((occupied(cx, cy, held) || Math.hypot(cx, cy) < 1.5) && tries < 100);
        op = 'drop';
        opX = cx; opY = cy; opTime = 0;
      }
    }

    // 2. Timeline Sequence Logic
    let targetZ = 3.2; // High clearance flying altitude
    let targetR = clamp(Math.hypot(opX, opY), 1.2, L1 + L2 - 0.1);
    let targetYaw = Math.atan2(opY, opX);
    let targetGrip = held ? 0.44 : 0.75; // 0.44 precisely hugs the 0.8 wide blocks

    if (op !== 'none') {
      opTime += dt;
      if (opTime < 0.6) {
        targetZ = 3.2; // Sweeping over to location
        targetGrip = held ? 0.44 : 0.75;
      } else if (opTime < 1.1) {
        targetZ = 1.5; // Descending to precisely touch the 0.8h block
      } else if (opTime < 1.4) {
        targetZ = 1.5; // Action phase
        if (op === 'grab') {
          targetGrip = 0.44; // Claws clamp exactly onto block
          if (opTime > 1.3 && opBlock) { held = opBlock; opBlock = null; }
        } else if (op === 'drop') {
          targetGrip = 0.75; // Claws release
          if (opTime > 1.3 && held) { 
            held.x = opX; held.y = opY; held.z = 0; 
            held = null; 
          }
        }
      } else if (opTime < 1.9) {
        targetZ = 3.2; // Ascending back up
      } else {
        op = 'none'; // Cycle complete, triggers AI Director next frame
      }
    }

    // 3. Smooth Physical Damping (Motors & Hydraulics)
    let dyaw = targetYaw - yaw;
    dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw)); 
    yaw += dyaw * (1 - Math.exp(-8 * dt));
    rr = damp(rr, targetR, 10, dt);
    zz = damp(zz, targetZ, 10, dt);
    grip = damp(grip, targetGrip, 20, dt); // Fast snappy claws

    // 4. Inverse Kinematics & Geometry Math
    const shZ = BZ + 0.2;
    const dz = zz - shZ, d = clamp(Math.hypot(rr, dz), 0.8, L1 + L2 - 0.02);
    const a = Math.atan2(dz, rr), sh = a + Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const er = L1 * Math.cos(sh), ez = shZ + L1 * Math.sin(sh);
    const cy = Math.cos(yaw), sy = Math.sin(yaw);

    const RZ = (r: number, z: number, offset: number = 0) => proj(v, r * cy - sy * offset, r * sy + cy * offset, z);
    const getP = (pct: number, rA: number, zA: number, rB: number, zB: number, zOff: number) => 
      RZ(rA + (rB - rA) * pct, zA + (zB - zA) * pct + zOff);

    const shoulder = RZ(0, shZ);
    const elbow = RZ(er, ez);
    const wrist = RZ(rr, zz);

    // 5. Rendering
    grid(g, v, -HALF - 0.5, HALF + 0.5, -HALF - 0.5, HALF + 0.5, 1, alpha(pal.fg, 0.12));

    // Target Cell Highlight
    if (op !== 'none') {
      poly(g, [
        proj(v, opX - .5, opY - .5), proj(v, opX + .5, opY - .5),
        proj(v, opX + .5, opY + .5), proj(v, opX - .5, opY + .5)
      ], alpha(pal.accent, 0.25), pal.accent);
    }

    // Dynamic Floor Shadows
    const drawShadow = (bx: number, by: number, rad: number, alphaMult = 1) => 
      poly(g, circle(v, bx, by, rad, 0, "z"), alpha(pal.fg, 0.12 * alphaMult), "transparent");
    for (const b of blocks) if (b !== held) drawShadow(b.x, b.y, 0.4);
    
    // Flying shadow size changes based on altitude (zz)
    const shadowScale = clamp(3.0 / zz, 0.5, 1.2);
    drawShadow(rr * cy, rr * sy, 0.35 * shadowScale, shadowScale); 

    // Blocks on floor
    const sorted = [...blocks].filter((b) => b !== held).sort((A, B) => A.x + A.y - B.x - B.y);
    for (const b of sorted) box(g, v, b.x - 0.4, b.y - 0.4, b.z, 0.8, 0.8, 0.8, b.col, ln);

    // Heavy Industrial Base
    box(g, v, -0.8, -0.8, 0, 1.6, 1.6, BZ - 0.15, pal.bg, ln);
    box(g, v, -0.6, -0.6, BZ - 0.15, 1.2, 1.2, 0.15, pal.border, ln); // Turntable

    // Arm Links
    const lw = Math.max(6, s * 0.35);
    const drawLink = (p1: number[], p2: number[]) => {
      line(g, p1, p2, pal.fg, lw);
      line(g, p1, p2, alpha(pal.bg, 0.3), lw * 0.2); // Inner mechanical crease
    };
    drawLink(shoulder, elbow);
    drawLink(elbow, wrist);

    // Dynamic Hydraulic Cylinders
    const drawHydraulic = (pA: number[], pB: number[]) => {
      const mid = [pA[0] * 0.55 + pB[0] * 0.45, pA[1] * 0.55 + pB[1] * 0.45];
      line(g, pA, mid, pal.border, lw * 0.7); // Thick barrel
      line(g, mid, pB, pal.accent, lw * 0.25); // Thin chrome rod
    };
    drawHydraulic(RZ(-0.6, shZ - 0.1), getP(0.45, 0, shZ, er, ez, 0.3)); // Main boom piston
    drawHydraulic(getP(0.7, 0, shZ, er, ez, 0.25), getP(0.35, er, ez, rr, zz, 0.25)); // Elbow piston

    // Joint Caps
    for (const j of [shoulder, elbow, wrist]) {
      dot(g, j, lw * 0.85, pal.bg);
      dot(g, j, lw * 0.45, pal.accent);
      dot(g, j, lw * 0.15, pal.fg);
    }

    // Articulated Perfect-Fit Gripper
    const handBase = RZ(rr, zz - 0.3);
    line(g, wrist, handBase, pal.fg, lw * 0.8);
    dot(g, handBase, lw * 0.5, pal.bg); dot(g, handBase, lw * 0.2, pal.fg);

    const drawJaw = (sign: number) => {
      const j0 = RZ(rr, zz - 0.3, 0); // Center knuckle
      const j1 = RZ(rr, zz - 0.3, grip * sign); // Extend outward
      const j2 = RZ(rr, zz - 0.7, grip * sign); // Drop down
      const j3 = RZ(rr, zz - 0.7, (grip - 0.15) * sign); // Inward lip to securely cradle the block
      line(g, j0, j1, pal.fg, lw * 0.5);
      line(g, j1, j2, pal.fg, lw * 0.5);
      line(g, j2, j3, pal.fg, lw * 0.4);
    };
    drawJaw(1); drawJaw(-1);

    // Held Block Rendering
    for (const b of blocks) if (b !== held) b.z = damp(b.z, 0, 15, dt);
    if (held) {
      held.x = rr * cy; held.y = rr * sy; 
      held.z = zz - 1.5; // Positions the block perfectly inside the claw tips
      box(g, v, held.x - 0.4, held.y - 0.4, held.z, 0.8, 0.8, 0.8, held.col, ln);
    }

    // A11y Reporting
    c.read(held ? "Autonomous arm is relocating a block" : "Autonomous arm is securing the next block");
    
    void t;
  };

  return { frame };
}