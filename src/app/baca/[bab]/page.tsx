import type { Metadata } from "next";
import Reader from "@/components/Reader";

export const metadata: Metadata = {
  title: "Baca",
};

export default function BacaPage() {
  return <Reader />;
}