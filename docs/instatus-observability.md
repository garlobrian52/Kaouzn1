# Instatus OpenTelemetry

The Next.js Node.js runtime and the Elysium watcher export OpenTelemetry logs, traces, and metrics to Instatus over OTLP/HTTP. The app resource is named `ai-revenue-os`.

## Configure the secret

Create an Instatus API key at https://dashboard.instatus.com/developer with the permissions needed to send telemetry. Add it as the server-side environment variable `INSTATUS_API_KEY`:

- Local: put `INSTATUS_API_KEY=your_key` in `.env.local` (never commit that file).
- Vercel: Project Settings → Environment Variables → add `INSTATUS_API_KEY` for the environments you use, then redeploy.

Do not prefix this variable with `NEXT_PUBLIC_`. The exporter attaches both required headers to every OTLP request:

- `Authorization: Bearer <INSTATUS_API_KEY>`
- `X-Instatus-Site-Id: cmpvumwna03l8pgrm497iyh3t`

The three OTLP/HTTP destinations are `https://otel.instatus.com/v1/logs`, `https://otel.instatus.com/v1/traces`, and `https://otel.instatus.com/v1/metrics`.

## Send a test log, trace, and metric

Start the app locally:

```bash
npm install
npm run dev
```

In a second terminal, enter the key into a hidden prompt so it is available to `curl` without placing it in shell history:

```bash
read -s -p "Instatus API key: " INSTATUS_API_KEY; printf '\n'; export INSTATUS_API_KEY
curl -i -X POST http://localhost:3000/api/observability/test \
  -H "Authorization: Bearer $INSTATUS_API_KEY"
```

A successful response is HTTP `200` and lists `logs`, `traces`, and `metrics`. The endpoint is protected by the same server-side key and forces an export flush before responding. The telemetry should appear in Instatus under **Observability** within a few seconds.

For a deployed environment, replace the localhost URL with the app's HTTPS origin and run the same command from a trusted terminal. Do not put the key in browser code or a public URL.

## Instrumentation and lifecycle

- Node auto-instrumentation covers Node HTTP server/client calls, Undici/fetch and supported database drivers; Supabase traffic in this app uses its HTTP client.
- W3C Trace Context is the Node SDK default propagator, so trace context is propagated across supported outgoing HTTP calls.
- Runtime metrics are enabled through the Node auto-instrumentation bundle.
- The Next.js `instrumentation.ts` hook initializes telemetry before the server handles requests. The standalone Elysium watcher initializes the same SDK and flushes on SIGTERM/SIGINT through SDK shutdown.
- No Pino, Winston, or other structured logging library is currently configured in the repository, so there is no existing logger to bridge.
- The test route is intended for operator smoke tests; it requires the Instatus API key in the Authorization header and does not expose the key in its response.
