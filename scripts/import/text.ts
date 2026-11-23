/** "basketboll femra" / "Çiklizëm" → "basketboll-femra" / "ciklizem". */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "ENISA QOSJA" → "Enisa Qosja". */
export function titleCase(value: string) {
  return value
    .toLocaleLowerCase("sq")
    .replace(/(^|[\s'-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toLocaleUpperCase("sq"));
}
