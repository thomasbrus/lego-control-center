import main from "@/lib/program/main.py?raw";

function parseRegions(source: string): Record<string, string> {
  const regions: Record<string, string> = {};
  const lines = source.split("\n");

  let currentRegion: string | null = null;

  for (const line of lines) {
    const regionMatch = line.match(/#\s*region\s+(\w+)/);
    const endRegionMatch = line.match(/#\s*endregion/);

    if (regionMatch) {
      currentRegion = regionMatch[1];
      regions[currentRegion] = "";
    } else if (endRegionMatch) {
      currentRegion = null;
    } else if (currentRegion) {
      regions[currentRegion] += line + "\n";
    }
  }

  return regions;
}

export const programModules = parseRegions(main);
