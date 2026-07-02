import { Metadata } from "next";
import CareersClient from "./CareersClient";

export const metadata: Metadata = {
  title: "Careers at Atelier | Atelier",
  description: "Join the House of Atelier. View open positions in design, operations, and retail styling.",
};

export default function CareersPage() {
  return <CareersClient />;
}
