import type { NextRequest } from "next/server";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initTelemetry } = await import("./lib/telemetry");
    initTelemetry();
  }
}

export async function onRequestError(
  error: unknown,
  _request: NextRequest,
  _context: {
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "middleware";
  },
) {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { recordActiveSpanError } = await import("./lib/telemetry");
    recordActiveSpanError(error);
  }
}
