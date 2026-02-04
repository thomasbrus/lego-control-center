export { default as pybricksProgram } from "./program.py?raw";

export function minifyProgramCode(code: string): string {
  return code
    .split("\n")
    .map((line) => {
      // Remove comments
      line = line.replace(/(^|\s)#.*$/, "");
      // Convert multiples of 4 spaces to tabs
      line = line.replace(/^( {4})+/g, (match) => "\t".repeat(match.length / 4));
      return line;
    })
    .filter((line) => line.trim())
    .join("\n");
}
