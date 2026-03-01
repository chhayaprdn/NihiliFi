export function parseICS(text: string): any[] {
  const events: any[] = [];
  const blocks = text.split("BEGIN:VEVENT");

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const get = (key: string) => {
      const match = block.match(new RegExp(`${key}[^:]*:(.+)`));
      return match ? match[1].trim() : "";
    };

    events.push({
      summary: get("SUMMARY"),
      start: get("DTSTART"),
      end: get("DTEND"),
      description: get("DESCRIPTION"),
    });
  }

  return events;
}
