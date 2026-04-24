import type { Metadata } from "next";
import HubLayout, { hubMetadata } from "@/components/WineHubLayout";

export async function generateMetadata(): Promise<Metadata> {
  return hubMetadata("luxembourg");
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  return <HubLayout slug="luxembourg">{children}</HubLayout>;
}
