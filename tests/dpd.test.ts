import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  BOTTLES_PER_PARCEL,
  PARCEL_MAX_KG,
  SHIP_COUNTRIES,
  deliveryEstimateDays,
  getShippingCents,
  isShipCountry,
  parcelWeights,
  singleBottleRateEur,
} from "@/lib/dpd";

describe("parcelWeights", () => {
  it("keeps every parcel within DPD's 20kg ceiling", () => {
    // The whole cart cap, so no reachable order can produce an illegal parcel.
    for (let bottles = 1; bottles <= 120; bottles++) {
      for (const kg of parcelWeights(bottles)) {
        expect(kg).toBeLessThanOrEqual(PARCEL_MAX_KG);
      }
    }
  });

  it("splits into full cases plus a remainder", () => {
    expect(parcelWeights(1)).toHaveLength(1);
    expect(parcelWeights(BOTTLES_PER_PARCEL)).toHaveLength(1);
    expect(parcelWeights(BOTTLES_PER_PARCEL + 1)).toHaveLength(2);
    expect(parcelWeights(120)).toHaveLength(10);
  });

  it("a full case weighs 17.1kg (12 bottles plus packaging)", () => {
    expect(parcelWeights(12)).toEqual([17.1]);
  });
});

describe("getShippingCents", () => {
  it("charges the published Shop2Home rate for a single bottle", () => {
    expect(getShippingCents(1, "LU")).toBe(689);
    expect(getShippingCents(1, "BE")).toBe(1170);
    expect(getShippingCents(1, "DE")).toBe(1434);
    expect(getShippingCents(1, "FR")).toBe(1966);
  });

  it("steps up to the heavy tier once a parcel passes 10kg", () => {
    // 6 bottles = 9.3kg (light tier); 7 bottles = 10.6kg (heavy tier).
    expect(getShippingCents(6, "LU")).toBe(689);
    expect(getShippingCents(7, "LU")).toBe(930);
  });

  it("bills per parcel, so a second case costs a second rate", () => {
    expect(getShippingCents(24, "FR")).toBe(2444 * 2);
  });

  it("never quotes a flat rate that undercharges a bulk order", () => {
    // The bug this replaces: a 120-bottle cart used to ship for one flat rate.
    const one = getShippingCents(1, "FR");
    const many = getShippingCents(120, "FR");
    expect(many).toBeGreaterThan(one * 9);
  });

  it("rises monotonically with bottle count", () => {
    for (const country of SHIP_COUNTRIES) {
      let previous = 0;
      for (let bottles = 1; bottles <= 120; bottles++) {
        const cents = getShippingCents(bottles, country);
        expect(cents).toBeGreaterThanOrEqual(previous);
        previous = cents;
      }
    }
  });

  it("costs more to France than to Luxembourg at every size", () => {
    for (let bottles = 1; bottles <= 120; bottles += 7) {
      expect(getShippingCents(bottles, "FR")).toBeGreaterThan(getShippingCents(bottles, "LU"));
    }
  });
});

describe("isShipCountry", () => {
  it("accepts the four served countries and nothing else", () => {
    for (const country of SHIP_COUNTRIES) expect(isShipCountry(country)).toBe(true);
    for (const bad of ["US", "CH", "lu", "", null, undefined, 42, {}]) {
      expect(isShipCountry(bad)).toBe(false);
    }
  });
});

describe("deliveryEstimateDays", () => {
  it("quotes a wider window for France, which DPD transits in two days", () => {
    expect(deliveryEstimateDays("LU")).toEqual({ minimum: 1, maximum: 3 });
    expect(deliveryEstimateDays("FR")).toEqual({ minimum: 2, maximum: 4 });
  });
});

describe("singleBottleRateEur", () => {
  it("matches the 'delivery from' figure quoted in site copy", () => {
    expect(singleBottleRateEur("LU")).toBe(6.89);
  });
});

describe("published prices match the rate table", () => {
  // The four rates are repeated by hand across the T&Cs and the FAQ in four
  // languages. `npm run dpd:rates` refreshes lib/dpd.ts only, so without this
  // check a tariff update would silently leave the legal copy quoting a price
  // the shop no longer charges.
  const sources = [
    "app/legal/cgv/page.tsx",
    "data/faq.ts",
  ].map((rel) => readFileSync(resolve(__dirname, "..", rel), "utf8"));

  for (const country of SHIP_COUNTRIES) {
    it(`quotes the current ${country} rate everywhere it is published`, () => {
      const rate = singleBottleRateEur(country);
      const french = rate.toFixed(2).replace(".", ",");
      const english = rate.toFixed(2);
      for (const [i, text] of sources.entries()) {
        expect(text, `source ${i} is missing the ${country} rate ${french}`).toContain(french);
        expect(text, `source ${i} is missing the ${country} rate ${english}`).toContain(english);
      }
    });
  }
});
