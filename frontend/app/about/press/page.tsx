import { Metadata } from "next";
import PressClient from "./PressClient";

export const metadata: Metadata = {
  title: "Press & Media Room | Atelier",
  description: "Read the latest news features, press releases, and download the official Atelier media kit.",
};

export default function PressPage() {
  return <PressClient />;
}
