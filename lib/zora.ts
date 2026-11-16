import "server-only";
import { createPublicClient, defineChain, http, webSocket } from "viem";

const chain = defineChain({
  id: 7777777,
  name: "Zora Mainnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: process.env.ZORA_RPC_URL ? [process.env.ZORA_RPC_URL] : [],
      webSocket: process.env.ZORA_WSS ? [process.env.ZORA_WSS] : [],
    },
  },
});

export function getZoraReadClient() {
  const url = process.env.ZORA_RPC_URL;
  if (!url) throw new Error("ZORA_RPC_URL_NOT_CONFIGURED");
  return createPublicClient({ chain, transport: http(url) });
}

export function getZoraWatchClient() {
  const url = process.env.ZORA_WSS;
  if (!url) throw new Error("ZORA_WSS_NOT_CONFIGURED");
  return createPublicClient({ chain, transport: webSocket(url, {
    reconnect: { attempts: 10, delay: 1_000 },
    keepAlive: true,
  }) });
}

export function zoraStatus() {
  return {
    network: "Zora Mainnet",
    chainId: 7777777,
    nativeToken: "ETH",
    monitorEnabled: process.env.ZORA_MONITOR_ENABLED === "true",
    transactionSigningEnabled: false,
    withdrawalsEnabled: false,
  };
}
