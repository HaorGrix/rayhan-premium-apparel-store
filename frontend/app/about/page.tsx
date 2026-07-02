import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About the House | Atelier",
  description: "Explore the heritage, brand philosophy, craftsmanship, and ecological commitment of the House of Atelier.",
};

export default function AboutPage() {
  return <AboutClient />;
}
