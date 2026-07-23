import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  getLocale,
  pageMeta,
  SITE_URL,
  localeUrl,
  breadcrumbNames,
  alternateUrls,
} from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const meta = pageMeta["cheques-cadeaux"][locale];

  return {
    title: meta.title,
    description: meta.description,
    alternates: alternateUrls("/cheques-cadeaux", locale),
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `${SITE_URL}/cheques-cadeaux`,
    },
  };
}

export default async function ChequesCadeauxLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <>
      <Breadcrumbs
        items={[
          { name: breadcrumbNames.home[locale], url: localeUrl("/", locale) },
          { name: breadcrumbNames["cheques-cadeaux"][locale], url: localeUrl("/cheques-cadeaux", locale) },
        ]}
      />
      {children}
    </>
  );
}
