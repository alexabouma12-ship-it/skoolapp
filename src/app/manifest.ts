import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Skoolapp : suivi des élèves",
    short_name: "Skoolapp",
    description: "Le suivi de vos élèves, partout avec vous.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f6f8",
    theme_color: "#000000",
    lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
