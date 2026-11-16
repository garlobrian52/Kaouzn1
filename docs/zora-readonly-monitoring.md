# Zora Mainnet monitoring — Hello Kaouzn

This integration is read-only. It adds an authenticated health check and a separate long-running WebSocket watcher. It does not create wallets, hold private keys, sign transactions, submit transactions, bridge assets, or withdraw funds.

## Network
- Zora Mainnet; chain ID 7777777; native gas token ETH.
- Alchemy HTTPS RPC: https://zora-mainnet.g.alchemy.com/v2/<API_KEY>
- Alchemy WebSocket: wss://zora-mainnet.g.alchemy.com/v2/<API_KEY>

## Vercel environment
Add ZORA_RPC_URL and ZORA_WSS as Sensitive/Encrypted server-side variables. Keep ZORA_MONITOR_ENABLED=false initially, and keep ZORA_TX_SIGNING_ENABLED=false and ZORA_WITHDRAWALS_ENABLED=false. Never use NEXT_PUBLIC_ prefixes. Rotate keys pasted into chat or committed to Git.

## Health check
After deployment/configuration, sign in and call GET /api/zora/health. It verifies the HTTPS RPC chain ID and latest block; Clerk protects this route.

## Persistent watcher
Vercel serverless functions are not a persistent daemon. Run npm run zora:watch in a trusted long-running worker with the same encrypted environment variables. Enable ZORA_MONITOR_ENABLED=true only in that worker. It observes new blocks only.

## Spending and withdrawals
Signing and withdrawals are disabled. A future transaction path requires human approval bound to exact chain, asset, amount, destination and expiry; signer isolation/HSM or managed custody; allowlists; simulation; per-transaction and daily limits; replay protection; atomic one-time approval consumption; and auditable receipts. Never infer approval from an AI agent instruction.
