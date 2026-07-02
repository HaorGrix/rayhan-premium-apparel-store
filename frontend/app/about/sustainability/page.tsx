import { Metadata } from "next";
import SustainabilityClient from "./SustainabilityClient";

export const metadata: Metadata = {
  title: "Sustainability Commitment | Atelier",
  description: "Our environmental standards: GOTS organic cotton, traceable wools, and low-impact dyeing.",
};

export default function SustainabilityPage() {
  return <SustainabilityClient />;
}
