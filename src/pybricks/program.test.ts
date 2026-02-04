import { expect, it, describe } from "vitest";
import { minifyProgramCode } from "./program";

const originalCode = `
# This is a comment
def foo():
    print("Hello, World!") # Another comment

async def bar():
    await wait(1000)
    `;

const minifiedCode = `def foo():
\tprint("Hello, World!")
async def bar():
\tawait wait(1000)`;

describe("minifyProgramCode", () => {
  it("minifies code", () => {
    expect(minifyProgramCode(originalCode)).toBe(minifiedCode);
  });
});
