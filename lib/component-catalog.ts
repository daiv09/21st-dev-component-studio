export type ComponentStatus = "available" | "submitted" | "todo";

export type ComponentEntry = {
  title: string;
  slug: string;
  href: string;
  status: ComponentStatus;
  description: string;
};

const mechanicalComponents = [
  "armillary-sphere",
  "astrolabe-rete",
  "balance-beam-scale",
  "block-and-tackle",
  "cable-stayed-bridge",
  "calder-mobile",
  "cam-follower-bench",
  "drafter-parallel-motion",
  "foucault-pendulum",
  "gear-train-differential",
  "guilloche-engine",
  "harmonograph-plotter",
  "letterpress-bed",
  "louver-aperture",
  "marionette-ik",
  "metronome-escapement",
  "origami-rigid-fold",
  "pantograph-tracer",
  "phenakistoscope-disk",
  "phonograph-groove",
  "plotter-pen-desk",
  "reaction-diffusion-dish",
  "retractable-tape",
  "split-flap-chronograph",
  "string-art-loom",
  "sundial-gnomon",
  "theremin-field",
  "wire-edm-path",
  "zipper-seam",
];

const submittedComponents = [
  "featured/focus-rail",
  "featured/hypertext-with-decryption",
  "flip-disk-matrix",
];

function toTitle(slug: string) {
  return slug
    .split("/")
    .at(-1)!
    .split("-")
    .map((word) =>
      word.length <= 3 && /\d/.test(word)
        ? word.toUpperCase()
        : word[0].toUpperCase() + word.slice(1),
    )
    .join(" ");
}

function toEntry(
  slug: string,
  status: ComponentStatus,
  description: string,
): ComponentEntry {
  const section = status === "available" ? "components" : status;

  return {
    title: toTitle(slug),
    slug,
    href: `/${section}/${slug}`,
    status,
    description,
  };
}

export const componentCatalog: ComponentEntry[] = [
  ...mechanicalComponents.map((slug) =>
    toEntry(slug, "available", "Interactive kinetic study with a dedicated route."),
  ),
  ...submittedComponents.map((slug) =>
    toEntry(slug, "submitted", "Submitted component preserved as a gallery route."),
  ),
].sort((a, b) => a.title.localeCompare(b.title));

export const componentCounts = componentCatalog.reduce(
  (counts, component) => {
    counts[component.status] += 1;
    return counts;
  },
  {
    available: 0,
    submitted: 0,
    todo: 0,
  } satisfies Record<ComponentStatus, number>,
);
