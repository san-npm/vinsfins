/**
 * Re-read DPD Shop2Home rates from the live account and print the table in the
 * shape `lib/dpd.ts` expects, so refreshing tariffs is a copy-paste rather than
 * a hand-typed guess.
 *
 *   DPD_API_KEY=... npx tsx scripts/dpd-rates.ts
 *
 * Read-only: it quotes services and books nothing.
 */
import { SHIP_COUNTRIES, type ShipCountry } from "../lib/dpd";

const API = "https://api.packlink.com/v1";
const SERVICE = "Shop2Home";
const FROM_ZIP = process.env.DPD_SENDER_ZIP || "2160";

/** A representative postcode per destination — rates are national, not local. */
const PROBE_ZIP: Record<ShipCountry, string> = {
  LU: "2160",
  FR: "57100",
  DE: "54290",
  BE: "6700",
};

/** One probe weight per tier the rate table declares. */
const PROBE_KG = [5, 15];

interface Service {
  name: string;
  transit_time: string;
  price: { total_price: number };
}

async function quote(country: ShipCountry, weight: number): Promise<Service | undefined> {
  const key = process.env.DPD_API_KEY;
  if (!key) throw new Error("DPD_API_KEY is not set");

  const params = new URLSearchParams({
    platform: "PRO",
    source: "PRO",
    "from[country]": "LU",
    "from[zip]": FROM_ZIP,
    "to[country]": country,
    "to[zip]": PROBE_ZIP[country],
    "packages[0][weight]": String(weight),
    "packages[0][length]": "40",
    "packages[0][width]": "33",
    "packages[0][height]": "30",
    contentValue: "150",
  });

  const res = await fetch(`${API}/services?${params}`, {
    headers: { Authorization: key, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`quote ${country} ${weight}kg failed: ${res.status}`);
  const services = (await res.json()) as Service[];
  return services.find((s) => s.name === SERVICE);
}

async function main() {
  const lines: string[] = [];
  const transit: string[] = [];

  for (const country of SHIP_COUNTRIES) {
    const tiers: string[] = [];
    for (const [i, kg] of PROBE_KG.entries()) {
      const service = await quote(country, kg);
      if (!service) {
        console.error(`  ${country} at ${kg}kg: no ${SERVICE} offered`);
        continue;
      }
      const maxKg = i === 0 ? 10 : 20;
      tiers.push(`{ maxKg: ${maxKg}, cents: ${Math.round(service.price.total_price * 100)} }`);
      if (i === 0) transit.push(`${country}: ${service.transit_time}`);
    }
    lines.push(`  ${country}: [${tiers.join(", ")}],`);
  }

  console.log(`\nPaste into RATE_TIERS in lib/dpd.ts:\n`);
  console.log("const RATE_TIERS: Record<ShipCountry, Tier[]> = {");
  console.log(lines.join("\n"));
  console.log("};\n");
  console.log(`Transit quoted today: ${transit.join(", ")}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
