/* src/app/[slug]/page.js */

import { notFound } from "next/navigation";
import demos from "@/demos";

export default async function DemoPage({ params }) {
  const { slug } = await params;

  const Demo = demos[slug];

  if (!Demo) {
    notFound();
  }

  return <Demo />;
}
