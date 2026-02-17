import type { Metadata } from "next";
import { wines } from "@/data/wines";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";

type Props = {
  params: { id: string };
};

export async function generateStaticParams() {
  return wines.map((wine) => ({ id: wine.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const wine = wines.find((w) => w.id === params.id);
  if (!wine) return { title: "Vin introuvable" };

  const categoryFr: Record<string, string> = {
    red: "Rouge",
    white: "Blanc",
    rosé: "Rosé",
    orange: "Orange",
    sparkling: "Pétillant",
  };

  return {
    title: `${wine.name} — ${categoryFr[wine.category] || wine.category}, ${wine.region}`,
    description: `${wine.description.fr} ${wine.grape}, ${wine.region}, ${wine.country}. ${wine.priceGlass}€ au verre, ${wine.priceBottle}€ la bouteille chez Vins Fins, Luxembourg.`,
    alternates: {
      canonical: `https://vinsfins.lu/vins/${wine.id}`,
    },
    openGraph: {
      title: `${wine.name} | Vins Fins Luxembourg`,
      description: wine.description.fr,
      url: `https://vinsfins.lu/vins/${wine.id}`,
      images: [{ url: wine.image, width: 600, height: 800, alt: wine.name }],
    },
  };
}

export default function WineLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const wine = wines.find((w) => w.id === params.id);

  return (
    <>
      {wine && (
        <Breadcrumbs
          items={[
            { name: "Accueil", url: "https://vinsfins.lu" },
            { name: "Vins", url: "https://vinsfins.lu/vins" },
            { name: wine.name, url: `https://vinsfins.lu/vins/${wine.id}` },
          ]}
        />
      )}
      {children}
    </>
  );
}
