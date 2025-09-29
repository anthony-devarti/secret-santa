import { describe, it, expect } from "vitest";
import { makeAssignment } from "../src/assign.js";

function isTwoCycle(pairs) {
  const map = new Map(pairs.map(({ giver, receiver }) => [giver, receiver]));
  for (const [g, r] of map) {
    if (map.get(r) === g) return true;
  }
  return false;
}

describe("makeAssignment", () => {
  it("throws for < 3 participants", () => {
    expect(() => makeAssignment(["A", "B"])).toThrow();
    expect(() => makeAssignment(["A"])).toThrow();
  });

  it("no self-matches and no 2-cycles", () => {
    const names = ["Alice", "Bob", "Charlie", "Dana", "Eve", "Frank"];
    for (let k = 0; k < 25; k++) {
      const pairs = makeAssignment(names);
      expect(pairs.length).toBe(names.length);

      const givers = new Set(pairs.map(p => p.giver));
      expect(givers.size).toBe(names.length);

      const receivers = new Set(pairs.map(p => p.receiver));
      expect(receivers.size).toBe(names.length);

      for (const p of pairs) {
        expect(p.giver).not.toBe(p.receiver);
      }

      expect(isTwoCycle(pairs)).toBe(false);
    }
  });
});
