import assert from "node:assert";
import type { PromoCode } from "@prisma/client";
import { evaluatePromoCode } from "./modules/promo-codes/promo-code.service";

function makePromo(o: Partial<PromoCode> = {}): PromoCode {
  return { id: "p1", code: "SALE10", discountPercent: 10, minOrderAmount: 0, usageLimit: null, usageCount: 0, startsAt: null, endsAt: null, isActive: true, createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-01"), ...o };
}
const now = new Date("2026-06-15T12:00:00Z");
assert.equal(evaluatePromoCode(null, 1000, now).ok, false);
assert.equal(evaluatePromoCode(makePromo({ isActive: false }), 1000, now).ok, false);
assert.equal((evaluatePromoCode(makePromo({ startsAt: new Date("2026-07-01") }), 1000, now) as any).reason, "PROMO_NOT_STARTED");
assert.equal((evaluatePromoCode(makePromo({ endsAt: new Date("2026-06-01") }), 1000, now) as any).reason, "PROMO_EXPIRED");
assert.equal((evaluatePromoCode(makePromo({ usageLimit: 5, usageCount: 5 }), 1000, now) as any).reason, "PROMO_USAGE_LIMIT_REACHED");
assert.equal((evaluatePromoCode(makePromo({ minOrderAmount: 2000 }), 1000, now) as any).reason, "PROMO_MIN_ORDER_NOT_MET");
const ok = evaluatePromoCode(makePromo({ discountPercent: 10 }), 1055, now);
assert.equal(ok.ok, true);
assert.equal((ok as any).discountAmount, 105);
assert.equal(evaluatePromoCode(makePromo({ minOrderAmount: 1000 }), 1000, now).ok, true);
console.log("[ok] evaluatePromoCode: все ветки проходят");
