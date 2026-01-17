export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw Error(message);
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mapWithoutKey = <K, V>(map: Map<K, V>, key: K): Map<K, V> => {
  const next = new Map(map);
  next.delete(key);
  return next;
};

export function safeInvoke<T extends (...args: any[]) => any>(fn: T | undefined, ...args: Parameters<T>): ReturnType<T> | undefined {
  if (fn) {
    return fn(...args);
  }
  return undefined;
}
