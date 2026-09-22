import { hallOfFlame, mockRoasts } from "../data/mockRoasts.js";
import { fromDbRoast } from "../lib/roastMappers.js";
import {
  sanitizeHandle,
  sanitizeText,
  validateAmount,
  validateRoastId,
  getSafeOrigin,
} from "../lib/sanitize.js";
import assert from "node:assert/strict";

console.log("==================================================");
console.log("🧪 BOUNTYROAST CI UNIT & INTEGRATION TEST SUITE");
console.log("==================================================");

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log("PASS: ", name);
    passed++;
  } catch (err) {
    console.error("FAIL: ", name);
    console.error(err);
    process.exit(1);
  }
}

// ----------------------------------------------------
// 1. SECURITY & INPUT SANITIZATION
// ----------------------------------------------------

console.log("\n[SUITE 1] Security & Input sanitization");

test("sanitization removed '@' prefix and enforced alphanumeric format", () => {
  assert.equal(sanitizeHandle("@elonmusk"), "elonmusk");
  assert.equal(sanitizeHandle("founder_123"), "founder_123");
  assert.equal(sanitizeHandle("invalid handle with spaces!"), null);
  assert.equal(sanitizeHandle(""), null);
});

test("sanitizeText strips dangerous HTML/XSS payload", () => {
  const dirty = "<script>alert('pwned')</script>Hello World!";
  const clean = sanitizeText(dirty);
  assert.equal(clean.includes("<script>"), false);
  assert.equal(clean.includes("Hello World!"), true);
});

test("validateAmount prevents negative numbers and exploits", () => {
  assert.equal(validateAmount(25), 25);
  assert.equal(validateAmount("50.50"), 50.5);
  assert.equal(validateAmount(-10), null, "Negative amounts must be rejected");
  assert.equal(validateAmount(0), null, "Zero amounts must be rejected");
  assert.equal(
    validateAmount(99999999),
    null,
    "Out-of-bounds amounts must be rejected",
  );
});

test("validateRoastId enforces roast ID format", () => {
  assert.equal(validateRoastId("roast-001"), "roast-001");
  assert.equal(validateRoastId("invalid-format"), null);
  assert.equal(validateRoastId(""), null);
});

test("getSafeOrigin blocks phishing & malicious redirect domains", () => {
  const mockEvilReq = { headers: { get: (name) => (name === "origin" ? "https://evil-phishing-site.com" : null) } };
  const mockSafeReq = { headers: { get: (name) => (name === "origin" ? "http://localhost:3000" : null) } };

  assert.equal(getSafeOrigin(mockEvilReq), "http://localhost:3000"); // fell back to safe localhost
  assert.equal(getSafeOrigin(mockSafeReq), "http://localhost:3000"); // allowed
});

// ----------------------------------------------------
// 2. DATA MAPPERS (Database <-> Frontend Roundtrip)
// ----------------------------------------------------
console.log("\n[SUITE 2] Data Mappers");

test("fromDbRoast converts snake_case PostgreSQL row to camelCase frontend object", () => {
  const row = {
    id: "roast-100",
    target_handle: "alice",
    target_name: "Alice",
    roast_text: "You code in production!",
    bounty_amount: "50.00",
    roaster_handle: "bob",
    defense_status: "none",
    created_at: "2026-09-01T00:00:00Z",
  };

  const roast = fromDbRoast(row);
  assert.equal(roast.id, "roast-100");
  assert.equal(roast.target.handle, "alice");
  assert.equal(roast.bountyAmount, 50);
  assert.equal(roast.defenseStatus, "none");
});

// ----------------------------------------------------
// 3. DATA INTEGRITY (Hall of Flame & Mock Data)
// ----------------------------------------------------
console.log("\n[SUITE 3] Data Integrity");

test("Hall of Flame entries have valid tiers, titles, and IDs", () => {
  assert.ok(
    hallOfFlame.length >= 8,
    "Expected at least 8 Hall of Flame entries",
  );

  for (const item of hallOfFlame) {
    assert.ok(item.id, "Entry must have an id");
    assert.ok(
      ["mythic", "legendary", "epic", "rare"].includes(item.tier),
      `Invalid tier: ${item.tier}`,
    );
    assert.ok(item.bountyAmount > 0, "Bounty amount must be positive");
    assert.ok(item.target, "Entry must have a target handle");
  }
});

test("Active mock roasts have valid IDs and targets", () => {
  assert.ok(mockRoasts.length >= 5, "Expected at least 5 mock roasts");
  for (const roast of mockRoasts) {
    assert.ok(roast.id, "Roast must have an id");
    assert.ok(roast.bountyAmount > 0, "Bounty must be positive");
    assert.ok(roast.target?.handle, "Roast must have a target handle");
  }
});

console.log("\n==================================================");
console.log(`🎉 ALL ${passed} TESTS PASSED CLEANLY WITH ZERO DEPENDENCIES!`);
console.log("==================================================");
