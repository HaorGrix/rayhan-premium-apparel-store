import { Metadata } from "next";
import PhilosophyClient from "./PhilosophyClient";

export const metadata: Metadata = {
  title: "Brand Philosophy | Atelier",
  description: "Explore Atelier's dedication to minimalism, design utility, representation, and conscious luxury.",
};

export default function PhilosophyPage() {
  return <PhilosophyClient />;
}
