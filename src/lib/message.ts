export function encodeMessage(message: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(message);
}

export function decodeMessage(data: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(data);
}
