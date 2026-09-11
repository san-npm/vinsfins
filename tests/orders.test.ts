import { describe, it, expect } from "vitest";
import { parseOrderItems } from "@/app/api/admin/orders/route";

const names = new Map([["wine-1", "Riesling Grand Cru"], ["wine-2", "Pinot Noir"]]);

describe("parseOrderItems", () => {
  it("resolves wine ids to names", () => {
    const out = parseOrderItems(JSON.stringify([{ id: "wine-1", qty: 6 }]), names);
    expect(out).toEqual([{ name: "Riesling Grand Cru", qty: 6 }]);
  });

  it("falls back to the id when the wine was renamed or deleted", () => {
    const out = parseOrderItems(JSON.stringify([{ id: "wine-gone", qty: 2 }]), names);
    expect(out).toEqual([{ name: "wine-gone", qty: 2 }]);
  });

  it("returns an empty list rather than throwing on malformed metadata", () => {
    expect(parseOrderItems("{not json", names)).toEqual([]);
    expect(parseOrderItems(undefined, names)).toEqual([]);
    // A JSON scalar parses fine but is not a basket; .map would throw on it.
    expect(parseOrderItems("42", names)).toEqual([]);
  });

  it("keeps every line of a multi-wine order, in order", () => {
    const out = parseOrderItems(
      JSON.stringify([{ id: "wine-2", qty: 1 }, { id: "wine-1", qty: 12 }]),
      names,
    );
    expect(out).toEqual([{ name: "Pinot Noir", qty: 1 }, { name: "Riesling Grand Cru", qty: 12 }]);
  });
});
