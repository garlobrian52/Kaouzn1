import "server-only";
import { createPublicClient, defineChain, http, webSocket } from "viem";

const chain = defineChain({
  id: 99901,
  name: "Elysium Mainnet",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  rpcUrls: {
    default: {
      http: process.env.ELYSIUM_RPC_URL ? [process.env.ELYSIUM_RPC_URL] : [],
      webSocket: process.env.ELYSIUM_WSS ? [process.env.ELYSIUM_WSS] : [],
    },
  },
});

export function getElysiumReadClient() {
  const url = process.env.ELYSIUM_RPC_URL;
  if (!url) throw new Error("ELYSIUM_RPC_URL_NOT_CONFIGURED");
  return createPublicClient({ chain, transport: http(url) });
}

export function getElysiumWatchClient() {
  const url = process.env.ELYSIUM_WSS;
  if (!url) throw new Error("ELYSIUM_WSS_NOT_CONFIGURED");
  return createPublicClient({ chain, transport: webSocket(url, {
    reconnect: { attempts: 10, delay: 1_000 },
    keepAlive: true,
  }) });
}

export function elysiumStatus() {
  return {
    network: "Elysium Mainnet",
    chainId: 99901,
    nativeToken: "HYPE",
    monitorEnabled: process.env.ELYSIUM_MONITOR_ENABLED === "true",
    transactionSigningEnabled: false,
    withdrawalsEnabled: false,
  };
}
