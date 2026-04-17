import type { Metadata } from "next";

// Transactional pages depend on per-session cart state and should not be
// indexed — thin/unstable content for search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function PanierLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
