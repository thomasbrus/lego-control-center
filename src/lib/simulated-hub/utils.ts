export function isSimulated() {
  return new URLSearchParams(window.location.search).get("simulated") === "true";
}
