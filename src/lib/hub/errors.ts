export class HubConnectionError extends Error {
  constructor(
    message: string,
    public readonly deviceId?: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "HubConnectionError";
  }

  static isUserCancellation(error: unknown): boolean {
    return error instanceof DOMException && error.name === "NotFoundError";
  }
}
