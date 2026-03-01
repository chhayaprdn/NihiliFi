export function parseCSV(text: string): any[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/"/g, "").toLowerCase());

  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const row: any = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || "";
      });
      return row;
    })
    .filter((row) => row.amount || row.debit || row.credit);
}
