import { SeverityNumber } from "@opentelemetry/api";
import { emitTelemetryLog, initTelemetry } from "../lib/telemetry";
import { getElysiumWatchClient } from "../lib/elysium";

initTelemetry();

if (process.env.ELYSIUM_MONITOR_ENABLED !== "true") throw new Error("ELYSIUM_MONITOR_ENABLED must be true in the trusted worker.");
if (process.env.ELYSIUM_TX_SIGNING_ENABLED === "true" || process.env.ELYSIUM_WITHDRAWALS_ENABLED === "true") throw new Error("Watcher is read-only; signing and withdrawals must remain disabled.");

const client = getElysiumWatchClient();
console.info("[elysium] read-only watcher starting; chainId=99901");
emitTelemetryLog("Elysium read-only watcher starting", SeverityNumber.INFO, "INFO", { "chain.id": 99901, "worker.name": "elysium-watcher" });

client.watchBlocks({
  onBlock(block) {
    const attributes = { number: block.number?.toString() ?? "unknown", hash: block.hash ?? "unknown", transactions: block.transactions.length };
    console.info("[elysium] new block", attributes);
    emitTelemetryLog("Elysium new block", SeverityNumber.INFO, "INFO", { ...attributes, "worker.name": "elysium-watcher" });
  },
  onError(error) {
    console.error("[elysium] websocket error", error.message);
    emitTelemetryLog("Elysium websocket error", SeverityNumber.ERROR, "ERROR", { "error.message": error.message, "worker.name": "elysium-watcher" });
  },
});
