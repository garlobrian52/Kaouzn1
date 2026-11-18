import { logs, metrics, SeverityNumber, SpanStatusCode, trace } from "@opentelemetry/api";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const SERVICE_NAME = "ai-revenue-os";
const SITE_ID = "cmpvumwna03l8pgrm497iyh3t";

let sdk: NodeSDK | undefined;
let shutdownHooksRegistered = false;

function registerShutdownHooks() {
  if (shutdownHooksRegistered) return;
  shutdownHooksRegistered = true;

  const shutdown = () => {
    void shutdownTelemetry().catch((error) => {
      console.error("[otel] graceful shutdown failed", error);
    });
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}

export function initTelemetry(): NodeSDK | undefined {
  if (sdk) return sdk;

  const apiKey = process.env.INSTATUS_API_KEY;
  if (!apiKey) {
    console.warn("[otel] INSTATUS_API_KEY is not configured; telemetry export is disabled.");
    return undefined;
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "X-Instatus-Site-Id": SITE_ID,
  };

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: SERVICE_NAME,
    }),
    spanProcessors: [
      new BatchSpanProcessor({
        exporter: new OTLPTraceExporter({
          url: "https://otel.instatus.com/v1/traces",
          headers,
        }),
      }),
    ],
    logRecordProcessors: [
      new BatchLogRecordProcessor({
        exporter: new OTLPLogExporter({
          url: "https://otel.instatus.com/v1/logs",
          headers,
        }),
      }),
    ],
    metricReaders: [new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: "https://otel.instatus.com/v1/metrics",
        headers,
      }),
      exportIntervalMillis: 15000,
    })],
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-runtime-node": { enabled: true },
      }),
    ],
  });

  sdk.start();
  registerShutdownHooks();
  return sdk;
}

export async function forceFlushTelemetry(): Promise<void> {
  if (!sdk) throw new Error("OTEL_NOT_INITIALIZED: configure INSTATUS_API_KEY and restart the server.");
  await sdk.forceFlush();
}

export async function shutdownTelemetry(): Promise<void> {
  const current = sdk;
  if (!current) return;
  sdk = undefined;
  await current.shutdown();
}

export function emitInstatusTestSignals(): void {
  if (!sdk) throw new Error("OTEL_NOT_INITIALIZED");

  const logger = logs.getLogger(SERVICE_NAME, "1.0.0");
  logger.emit({
    severityNumber: SeverityNumber.INFO,
    severityText: "INFO",
    body: "Instatus OpenTelemetry test log",
    attributes: {
      "test.signal": "logs",
      "service.name": SERVICE_NAME,
    },
  });

  const tracer = trace.getTracer(SERVICE_NAME, "1.0.0");
  tracer.startActiveSpan("instatus.test.trace", (span) => {
    span.setAttribute("test.signal", "traces");
    span.addEvent("Instatus trace test event");
    span.end();
  });

  const meter = metrics.getMeter(SERVICE_NAME, "1.0.0");
  const counter = meter.createCounter("instatus_test_total", {
    description: "Count of manual Instatus telemetry connectivity tests",
  });
  counter.add(1, { "test.signal": "metrics" });
}
