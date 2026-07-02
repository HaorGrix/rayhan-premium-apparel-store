import { Metadata } from "next";
import OurStoryClient from "./OurStoryClient";

export const metadata: Metadata = {
  title: "Our Story | Atelier",
  description: "Discover the journey of Atelier from a Manhattan creative studio to a global sustainable fashion label.",
};

export default function OurStoryPage() {
  return <OurStoryClient />;
}
