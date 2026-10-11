import type { Metadata } from "next";
import { AdminProviders } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin · E-Cell VIT", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
