export function makeVariants(input: string): string[] {
  const base = input.trim().replace(/^@/, "").replace(/\\s+/g, "");
  if (!base) return [];

  const candidates = [
    base,
    base.toLowerCase(),
    base.toUpperCase(),
    base.replace(/[._-]+/g, ""),
    base.replace(/[._-]+/g, "_"),
    base.replace(/[._-]+/g, "."),
    `${base}_`,
    `_${base}`,
    `${base}.official`,
    `the_${base}`,
  ];

  return [...new Set(candidates)].filter((value) => value.length >= 2 && value.length <= 30).slice(0, 10);
}
