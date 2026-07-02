import { Metadata } from "next";
import TeamClient from "./TeamClient";

export const metadata: Metadata = {
  title: "Meet the Team | Atelier",
  description: "Get to know the executive directors, designers, and operations leads behind Atelier.",
};

export default function TeamPage() {
  return <TeamClient />;
}
