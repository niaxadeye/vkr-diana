/**
 * Разовый скрипт пересчёта reservedStock по фактическим активным заказам.
 *
 * Устраняет уже накопившиеся рассинхроны («резерв не сходится»): для каждого
 * варианта пересчитывает сумму quantity по позициям заказов в активных статусах
 * (CREATED / CONFIRMED / ASSEMBLING) и приводит ProductVariant.reservedStock
 * к этому значению.
 *
 * Запуск:
 *   npx tsx src/reconcile-reserved-stock.ts          // показать расхождения (dry-run)
 *   npx tsx src/reconcile-reserved-stock.ts --apply  // применить исправления
 */
import { prisma } from "./prisma/prisma";

const RESERVED_ORDER_STATUSES = ["CREATED", "CONFIRMED", "ASSEMBLING"] as const;

async function main() {
    const apply = process.argv.includes("--apply");

    // Фактический резерв по активным заказам: сумма quantity на каждый variantId.
    const grouped = await prisma.orderItem.groupBy({
        by: ["variantId"],
        where: {
            variantId: { not: null },
            order: {
                status: { in: [...RESERVED_ORDER_STATUSES] },
            },
        },
        _sum: { quantity: true },
    });

    const expectedByVariant = new Map<string, number>();
    for (const row of grouped) {
        if (row.variantId) {
            expectedByVariant.set(row.variantId, row._sum.quantity ?? 0);
        }
    }

    const variants = await prisma.productVariant.findMany({
        select: { id: true, sku: true, stock: true, reservedStock: true },
    });

    const mismatches: {
        id: string;
        sku: string;
        current: number;
        expected: number;
    }[] = [];

    for (const variant of variants) {
        const expected = expectedByVariant.get(variant.id) ?? 0;
        if (variant.reservedStock !== expected) {
            mismatches.push({
                id: variant.id,
                sku: variant.sku,
                current: variant.reservedStock,
                expected,
            });
        }
    }

    if (mismatches.length === 0) {
        console.log("OK: расхождений нет, все reservedStock сходятся.");
        return;
    }

    console.log(`Найдено расхождений: ${mismatches.length}`);
    for (const m of mismatches) {
        console.log(
            `  ${m.sku} (${m.id}): reservedStock=${m.current} -> ${m.expected}`,
        );
    }

    if (!apply) {
        console.log("\nDry-run. Запустите с флагом --apply, чтобы применить.");
        return;
    }

    await prisma.$transaction(
        mismatches.map((m) =>
            prisma.productVariant.update({
                where: { id: m.id },
                data: { reservedStock: m.expected },
            }),
        ),
    );

    console.log(`\nГотово: исправлено ${mismatches.length} вариантов.`);
}

main()
    .catch((error) => {
        console.error("RECONCILE_FAILED:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
