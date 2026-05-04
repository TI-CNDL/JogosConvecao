// Simulação Omni-Catch - Validação das cotas fixas por tempo
const BASE_TIME_SECONDS = 30;
const BASE_COUNTS = { target: 24, decoy: 70 };
const BASE_TOTAL = BASE_COUNTS.target + BASE_COUNTS.decoy;

function computeQuotas(timeLimitSeconds) {
    const scale = Math.max(0, timeLimitSeconds) / BASE_TIME_SECONDS;
    const targetTotal = Math.max(1, Math.round(BASE_TOTAL * scale));

    const rawTarget = BASE_COUNTS.target * scale;
    const rawDecoy = BASE_COUNTS.decoy * scale;

    const counts = { target: Math.floor(rawTarget), decoy: Math.floor(rawDecoy) };

    let remainder = targetTotal - (counts.target + counts.decoy);
    const fractions = [
        { type: 'target', frac: rawTarget - counts.target },
        { type: 'decoy', frac: rawDecoy - counts.decoy },
    ].sort((a, b) => b.frac - a.frac);

    let idx = 0;
    while (remainder > 0) {
        counts[fractions[idx % fractions.length].type] += 1;
        remainder -= 1;
        idx += 1;
    }
    return counts;
}

console.log(`\n📊 OMNI-CATCH - Validação de Cotas Fixas`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

const durations = [15, 30, 45, 60, 90, 120];
for (const dur of durations) {
    const c = computeQuotas(dur);
    const total = c.target + c.decoy;
    const pct = ((c.target / total) * 100).toFixed(1);
    console.log(`  ${dur}s → ⭐ Target: ${c.target}, ❌ Decoy: ${c.decoy}, Total: ${total} (${pct}% bons)`);
}
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
