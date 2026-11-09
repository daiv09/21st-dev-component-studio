"use client"

import * as React from "react"
import * as THREE from "three"
import gsap from "gsap"

/* ------------------------------------------------------------------ */
/* Data Types & Default Content                                       */
/* ------------------------------------------------------------------ */

export type InstantPhoto = {
  id: string
  image: string
  caption?: string
  date?: string
  rotation?: number
}

export interface InstantPhotoDevelopProps {
  photos?: InstantPhoto[]
  height?: string
  className?: string
  hint?: string
}

export const DEFAULT_PHOTOS: InstantPhoto[] = [
  {
    id: "p1",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800",
    caption: "The long drive up",
    date: "Aug '23",
    rotation: -8,
  },
  {
    id: "p2",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    caption: "Morning tide",
    date: "Sep '23",
    rotation: 4,
  },
  {
    id: "p3",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800",
    caption: "Under the stars",
    date: "Oct '23",
    rotation: -3,
  },
]

/* ------------------------------------------------------------------ */
/* Asset Generation (Canvas-based Textures)                           */
/* ------------------------------------------------------------------ */

const PW = 420  // Physical width ratio
const PH = 500  // Physical height ratio
const INNER_M = 30 // Margin sides/top
const BOTTOM_M = 120 // Bottom margin for caption

// Creates the white cardboard frame and handwritten text texture
function createFrameTexture(photo: InstantPhoto, seed: number): HTMLCanvasElement {
  const c = document.createElement("canvas")
  c.width = PW
  c.height = PH
  const ctx = c.getContext("2d")!

  // Base paper color
  ctx.fillStyle = "#fcfbfa"
  ctx.fillRect(0, 0, PW, PH)

  // Paper texture / slight noise
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.05)"
    ctx.fillRect(Math.random() * PW, Math.random() * PH, 2, 2)
  }

  // Knockout the center for the image to show through
  ctx.globalCompositeOperation = "destination-out"
  ctx.fillRect(INNER_M, INNER_M, PW - INNER_M * 2, PH - INNER_M - BOTTOM_M)
  ctx.globalCompositeOperation = "source-over"

  // Inner shadow/bevel for the image cutout
  ctx.strokeStyle = "rgba(0,0,0,0.1)"
  ctx.lineWidth = 2
  ctx.strokeRect(INNER_M, INNER_M, PW - INNER_M * 2, PH - INNER_M - BOTTOM_M)

  // Handwriting
  ctx.fillStyle = "#2c3e50"
  if (photo.caption) {
    ctx.font = "italic 28px 'Georgia', serif"
    ctx.translate(PW / 2, PH - 60)
    ctx.rotate((Math.random() - 0.5) * 0.04) // Slight slant
    ctx.textAlign = "center"
    ctx.fillText(photo.caption, 0, 0)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  if (photo.date) {
    ctx.fillStyle = "#7f8c8d"
    ctx.font = "18px 'Courier New', monospace"
    ctx.textAlign = "right"
    ctx.fillText(photo.date, PW - INNER_M - 10, PH - 30)
  }

  return c
}

/* ------------------------------------------------------------------ */
/* WebGL Shaders & Geometry                                           */
/* ------------------------------------------------------------------ */

// A simple plane, but we add a slight Z-curve to simulate thick photo paper
function createPhotoGeometry() {
  const geo = new THREE.PlaneGeometry(PW / PH, 1, 16, 16)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    // Subtle curl: edges lift up slightly
    const curl = (x * x) * 0.05 + (y * y) * 0.02
    pos.setZ(i, curl)
  }
  geo.computeVertexNormals()
  return geo
}

const PHOTO_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const PHOTO_FRAG = /* glsl */ `
uniform sampler2D uFrame;
uniform sampler2D uImage;
uniform float uDevelop; // 0.0 to 1.0
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;

// Simplex-ish noise for chemical blooms
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
}

void main() {
  vec4 frameColor = texture2D(uFrame, vUv);
  vec4 imgColor = texture2D(uImage, vUv);
  
  // Chemical development effect
  // Stage 0: Dark teal/grey (unexposed)
  // Stage 0.4: Milky white/blue clouds
  // Stage 1.0: Full color, slight vintage saturation
  
  float n = noise(vUv * 8.0 + uTime * 0.1);
  float n2 = noise(vUv * 20.0 - uTime * 0.15);
  
  // Offset development based on noise to create patchy blooming
  float dev = clamp(uDevelop + (n * 0.2 - 0.1), 0.0, 1.0);
  
  vec3 unexposed = vec3(0.1, 0.15, 0.18);
  vec3 milky = vec3(0.8, 0.85, 0.9) + (n2 * 0.1);
  
  vec3 chemColor = mix(unexposed, milky, smoothstep(0.0, 0.4, dev));
  chemColor = mix(chemColor, imgColor.rgb, smoothstep(0.3, 1.0, dev));
  
  // Vintage grade: slightly lift blacks, warm highlights
  chemColor = mix(chemColor, vec3(dot(chemColor, vec3(0.299, 0.587, 0.114))), -0.1); // slight saturation boost
  chemColor += vec3(0.05, 0.02, 0.0) * dev; // warm tint
  
  // Determine if we are drawing the frame or the image
  // If frameColor.a is 0, it means it was knocked out by destination-out
  vec3 finalColor = mix(chemColor, frameColor.rgb, frameColor.a);
  
  // Basic lighting based on the curled geometry
  vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
  float diff = max(dot(vNormal, lightDir), 0.0);
  finalColor *= (0.85 + diff * 0.2); // subtle shading
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`

/* ------------------------------------------------------------------ */
/* 3D Engine Setup                                                    */
/* ------------------------------------------------------------------ */

type PhotoState = {
  mesh: THREE.Mesh
  uniforms: any
  develop: number
  isHovered: boolean
  targetX: number
  targetY: number
  targetRot: number
  baseRot: number
}

function createEngine(host: HTMLDivElement, photos: InstantPhoto[]) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const el = renderer.domElement
  el.style.position = "absolute"
  el.style.inset = "0"
  el.style.width = "100%"
  el.style.height = "100%"
  el.style.pointerEvents = "none"
  host.appendChild(el)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000)
  camera.position.z = 5

  const textureLoader = new THREE.TextureLoader()
  const photoStates: PhotoState[] = []

  const geo = createPhotoGeometry()

  photos.forEach((photo, i) => {
    // 1. Create Frame Texture
    const frameCanvas = createFrameTexture(photo, i)
    const frameTex = new THREE.CanvasTexture(frameCanvas)
    frameTex.minFilter = THREE.LinearMipmapLinearFilter

    // 2. Load Image Texture
    const imgTex = textureLoader.load(photo.image)

    // 3. Setup Material
    const uniforms = {
      uFrame: { value: frameTex },
      uImage: { value: imgTex },
      uDevelop: { value: 0.0 },
      uTime: { value: 0.0 }
    }

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: PHOTO_VERT,
      fragmentShader: PHOTO_FRAG,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(geo, mat)

    // Initial drop positions (scattered)
    const row = Math.floor(i / 3)
    const col = i % 3
    const baseRot = (photo.rotation || (Math.random() * 20 - 10)) * (Math.PI / 180)

    mesh.position.set(
      (col - 1) * 1.2 + (Math.random() - 0.5) * 0.4,
      -(row) * 1.2 + (Math.random() - 0.5) * 0.4,
      i * 0.01 // Slight Z-stacking to prevent z-fighting
    )
    mesh.rotation.z = baseRot

    // Add subtle drop shadow
    const shadowGeo = new THREE.PlaneGeometry(PW / PH, 1)
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 })
    const shadow = new THREE.Mesh(shadowGeo, shadowMat)
    shadow.position.z = -0.05
    shadow.position.x = 0.02
    shadow.position.y = -0.02
    mesh.add(shadow)

    scene.add(mesh)

    photoStates.push({
      mesh,
      uniforms,
      develop: 0.0,
      isHovered: false,
      targetX: mesh.position.x,
      targetY: mesh.position.y,
      targetRot: baseRot,
      baseRot
    })
  })

  let raf: number
  let time = 0

  const render = () => {
    raf = requestAnimationFrame(render)
    time += 0.01

    photoStates.forEach((state, i) => {
      // Auto-develop slowly, but accelerate if hovered
      if (state.isHovered) {
        state.develop += 0.008
        // Shake effect when developing
        state.mesh.rotation.z = state.baseRot + Math.sin(time * 30 + i) * 0.02
      } else {
        state.develop += 0.0005
        // Smoothly return to base rotation
        state.mesh.rotation.z += (state.targetRot - state.mesh.rotation.z) * 0.1
      }

      state.develop = Math.min(state.develop, 1.0)
      state.uniforms.uDevelop.value = state.develop
      state.uniforms.uTime.value = time

      // Smooth position interpolation
      state.mesh.position.x += (state.targetX - state.mesh.position.x) * 0.1
      state.mesh.position.y += (state.targetY - state.mesh.position.y) * 0.1
    })

    renderer.render(scene, camera)
  }
  render()

  return {
    resize: (w: number, h: number) => {
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()

      // Responsive layout adjustments
      const isMobile = w < 768
      photoStates.forEach((state, i) => {
        if (isMobile) {
          state.targetX = 0
          state.targetY = 1.2 - (i * 1.2)
        } else {
          const col = i % 3
          state.targetX = (col - 1) * 1.5
          state.targetY = 0
        }
      })
    },
    setHover: (index: number, hovered: boolean) => {
      if (photoStates[index]) {
        photoStates[index].isHovered = hovered
        if (hovered) {
          // Lift up slightly
          gsap.to(photoStates[index].mesh.position, { z: 0.5, duration: 0.3 })
          gsap.to(photoStates[index].mesh.scale, { x: 1.1, y: 1.1, duration: 0.3 })
        } else {
          // Drop down
          gsap.to(photoStates[index].mesh.position, { z: index * 0.01, duration: 0.3 })
          gsap.to(photoStates[index].mesh.scale, { x: 1, y: 1, duration: 0.3 })
        }
      }
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      renderer.dispose()
      el.remove()
    }
  }
}

/* ------------------------------------------------------------------ */
/* React Component                                                    */
/* ------------------------------------------------------------------ */

export function InstantPhotoDevelop({
  photos = DEFAULT_PHOTOS,
  height = "80vh",
  className = "",
  hint = "Hover to shake and develop photos faster",
}: InstantPhotoDevelopProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const glRef = React.useRef<HTMLDivElement>(null)
  const engineRef = React.useRef<ReturnType<typeof createEngine> | null>(null)

  React.useEffect(() => {
    if (!glRef.current) return

    const engine = createEngine(glRef.current, photos)
    engineRef.current = engine

    const handleResize = () => {
      if (rootRef.current) {
        const { width, height } = rootRef.current.getBoundingClientRect()
        engine.resize(width, height)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize() // init size

    // Drop-in animation on mount
    gsap.from(glRef.current, {
      y: -100,
      opacity: 0,
      duration: 1.5,
      ease: "power3.out"
    })

    return () => {
      window.removeEventListener("resize", handleResize)
      engine.dispose()
    }
  }, [photos])

  return (
    <div
      ref={rootRef}
      className={`relative w-full overflow-hidden bg-zinc-900 rounded-xl ${className}`}
      style={{ height }}
    >
      {/* Wood / Desk Texture overlay */}
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      <div ref={glRef} className="absolute inset-0" />

      {/* Invisible interaction layer mapped roughly to photo positions */}
      <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 z-10">
        {photos.map((_, i) => (
          <div
            key={i}
            className="w-48 h-56 cursor-pointer"
            onMouseEnter={() => engineRef.current?.setHover(i, true)}
            onMouseLeave={() => engineRef.current?.setHover(i, false)}
            aria-label={`Interact with photo ${i + 1}`}
          />
        ))}
      </div>

      {hint && (
        <p className="absolute bottom-6 w-full text-center text-zinc-400 font-mono text-sm tracking-wide pointer-events-none z-20">
          {hint}
        </p>
      )}
    </div>
  )
}