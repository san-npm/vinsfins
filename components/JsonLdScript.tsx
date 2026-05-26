import Script from "next/script";
import { jsonLdToScript } from "@/lib/structured-data";

/**
 * Uniform wrapper for emitting JSON-LD as a nonce-tagged inline <script>.
 * Every inline JSON-LD block in the app should go through this helper so
 * escape rules (see `jsonLdToScript`) and CSP nonce handling stay in one
 * place.
 */
interface Props {
  id: string;
  data: unknown;
  nonce?: string;
}

export default function JsonLdScript({ id, data, nonce }: Props) {
  const html = jsonLdToScript(data);
  return (
    <Script
      id={id}
      type="application/ld+json"
      nonce={nonce}
      // Inline JSON-LD is plain JSON with `<` escaped to `<` in
      // jsonLdToScript() (see lib/structured-data.ts). The wrapper is a
      // `type="application/ld+json"` script — the browser does NOT execute
      // it as JavaScript — so the next line cannot XSS even with
      // attacker-shaped data values.
      // nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
