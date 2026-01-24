export function minifyPybricksCode(code: string): string {
  return code
    .split("\n")
    .map((line) => {
      // Doesn't account for # inside strings
      let cleanLine = line.split("#")[0];
      return cleanLine.trimEnd();
    })
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      let modifiedLine = line;
      while (modifiedLine.startsWith("    ")) {
        modifiedLine = "\t" + modifiedLine.slice(4);
      }
      return modifiedLine;
    })
    .join("\n");
}
