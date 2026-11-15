import "dotenv/config";
import { getElysiumWatchClient } from "../lib/elysium";

if (process.env.ELYSIUM_MONITOR_ENABLED !== "true") throw new Error("ELYSIUM_MONITOR_ENABLED must be true in the trusted worker.");
if (process.env.ELYSIUM_TX_SIGNING_ENABLED === "true" || process.env.ELYSIUM_WITHDRAWALS_ENABLED === "true") throw new Error("Watcher is read-only; signing and withdrawals must remain disabled.");

const client = getElysiumWatchClient();
console.info("[elysium] read-only watcher starting; chainId=99901");
client.watchBlocks({
  onBlock(block) {
    console.info("[elysium] new block", { number: block.number?.toString(), hash: block.hash, transactions: block.transactions.length });
  },
  onError(error) { console.error("[elysium] websocket error", error.message); },
});
