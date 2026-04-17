import Link from "next/link";
import Script from "next/script";

type BreadcrumbItem = {
  name: string;
  url: string;
};

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      "@id": item.url,
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  const scriptId = `breadcrumbs-${items.map(i => i.url).join("-").replace(/[^a-z0-9-]/gi, "")}`;

  return (
    <>
      <Script
        id={scriptId}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav
        aria-label="Breadcrumb"
        className="max-w-6xl mx-auto px-6 pt-24 pb-2 text-[11px] tracking-wider uppercase text-stone/70"
      >
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.url} className="flex items-center gap-2">
                {isLast ? (
                  <span aria-current="page" className="text-ink">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.url} className="hover:text-ink transition-colors">
                    {item.name}
                  </Link>
                )}
                {!isLast && <span className="text-stone/40" aria-hidden="true">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
