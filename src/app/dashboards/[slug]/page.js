// src/app/dashboards/[slug]/page.js

import { notFound } from "next/navigation";
import { dashboards } from "@/dashboards";

export default async function DashboardPage({ params }) {
  const { slug } = await params;

  const Dashboard = dashboards[slug];

  if (!Dashboard) {
    notFound();
  }

  return <Dashboard />;
}
