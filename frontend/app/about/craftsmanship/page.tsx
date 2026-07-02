import { Metadata } from "next";
import CraftsmanshipClient from "./CraftsmanshipClient";

export const metadata: Metadata = {
  title: "Craftsmanship & Tailoring | Atelier",
  description: "A look inside the workshops and meticulous methods behind Atelier's handcrafted silhouettes.",
};

export default function CraftsmanshipPage() {
  return <CraftsmanshipClient />;
}
