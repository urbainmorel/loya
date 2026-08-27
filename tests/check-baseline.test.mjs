import assert from "node:assert/strict";
import test from "node:test";
import { verifyBaseline } from "../scripts/check-baseline.mjs";

test("les sources normatives correspondent au manifeste", async () => {
  assert.deepEqual(await verifyBaseline(), []);
});
