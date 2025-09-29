// Fisher–Yates
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Returns an array of { giver, receiver } such that:
 * - No one gets themselves
 * - No 2-cycles (i -> j and j -> i)
 * Requires n >= 3 to be possible.
 */
export function makeAssignment(names, maxTries = 10000) {
  const clean = Array.from(
    new Map(
      names
        .map(s => (s || "").trim())
        .filter(Boolean)
        .map(n => [n.toLowerCase(), n]) // dedupe case-insensitive
    ).values()
  );

  const n = clean.length;
  if (n < 3) throw new Error("Need at least 3 unique participants.");

  const idx = [...Array(n).keys()];

  for (let t = 0; t < maxTries; t++) {
    const perm = shuffle(idx);
    let ok = true;
    for (let i = 0; i < n; i++) {
      if (perm[i] === i) { ok = false; break; }             // no self
      if (perm[perm[i]] === i) { ok = false; break; }       // no 2-cycles
    }
    if (ok) {
      return idx.map(i => ({ giver: clean[i], receiver: clean[perm[i]] }));
    }
  }
  throw new Error("Could not find a valid assignment in time. Re-run.");
}

// Small helpers for the UI
export const b64encode = (obj) =>
  btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
export const b64decode = (str) => {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(str))));
  } catch {
    return null;
  }
};
