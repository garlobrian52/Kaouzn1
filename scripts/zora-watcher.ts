import { getZoraWatchClient } from "../lib/zora";

if (process.env.ZORA_MONITOR_ENABLED !== "true") throw new Error("ZORA_MONITOR_ENABLED must be true in the trusted worker.");
if (process.env.ZORA_TX_SIGNING_ENABLED === "true" || process.env.ZORA_WITHDRAWALS_ENABLED === "true") throw new Error("Watcher is read-only; signing and withdrawals must remain disabled.");

const client = getZoraWatchClient();
console.info("[zora] read-only watcher starting; chainId=7777777");
client.watchBlocks({
  onBlock(block) {
    console.info("[zora] new block", { number: block.number?.toString(), hash: block.hash, transactions: block.transactions.length });
  },
  onError(error) { console.error("[zora] websocket error", error.message); },
});
