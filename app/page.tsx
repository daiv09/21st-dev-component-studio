import React from 'react';
import ExpandableShelf, {type ShelfItem } from "./type"; // Adjust path as needed

const items: ShelfItem[] = [
  {
    id: 1,
    title: "Neon Cybernetics",
    description: "Exploring the fusion of biology and machinery in a dystopian future.",
    imageSrc: "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=1000&auto=format&fit=crop",
    href: "/projects/cybernetics",
    meta: "2024 Design",
  },
  {
    id: 2,
    title: "Alpine Horizons",
    description: "A photographic journey through the silent giants of the Swiss Alps.",
    imageSrc: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop",
    href: "/photography/alpine",
    meta: "Photography",
  },
  {
    id: 3,
    title: "Urban Architecture",
    description: "Modern brutalist structures and the shadows they cast on city life.",
    imageSrc: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop",
    href: "/architecture/urban",
    meta: "Case Study",
  },
  {
    id: 4,
    title: "Deep Space",
    description: "Visualizing the unknown depths of the cosmos through data art.",
    imageSrc: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    href: "/science/space",
    meta: "Data Viz",
  },
  {
    id: 5,
    title: "Abstract Fluids",
    description: "Generative art experiments simulating fluid dynamics in zero gravity.",
    imageSrc: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
    href: "/art/fluids",
    meta: "Generative Art",
  },
];

const Page = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black">
      <ExpandableShelf items={items} />
    </div>
  );
};

export default Page;