import { pybricksProgram } from "./program";

export enum PybricksProgramRegionId {
  SystemCommands = "system-commands",
  LightCommands = "light-commands",
  StdinProcessing = "stdin-processing",
}

export function parseProgramRegions(program: string): Record<string, string> {
  const regionRegex = /#\s*region\s+([\w-]+)([\s\S]*?)#\s*endregion/g;
  return Object.fromEntries(Array.from(program.matchAll(regionRegex), ([, name, content]) => [name.trim(), content.trim()]));
}

const programRegions = parseProgramRegions(pybricksProgram);

export function requireProgramRegion(regionId: PybricksProgramRegionId): string {
  const programRegion = programRegions[regionId];

  if (!programRegion) {
    throw new Error(`Program region not found: ${regionId}`);
  }

  return programRegion;
}
