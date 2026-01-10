export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw Error(message);
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
