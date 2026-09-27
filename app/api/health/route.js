import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic"; // Do not cache health check responses

export async function GET() {
  const startTime = Date.now();
  const uptime = process.uptime();
  const memory = process.memoryUsage();

  const healthReport = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(uptime),
    latencyMs: 0,
    environment: process.env.NODE_ENV || "development",
    version: "0.1.0",
    services: {
      database: {
        status: "unknown",
        latencyMs: null,
      },
      payments: {
        status: "unconfigured",
        mode: "unknown",
      },
    },
    system: {
      nodeVersion: process.version,
      memoryUsageMB: Math.round(memory.heapUsed / 1024 / 1024),
    },
  };

  // 1. Probe Supabase Database Health
  const dbStart = Date.now();
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const { error } = await supabase.from("roasts").select("id").limit(1);
      healthReport.services.database.latencyMs = Date.now() - dbStart;

      if (error) {
        healthReport.services.database.status = "degraded";
        healthReport.services.database.error = error.message;
      } else {
        healthReport.services.database.status = "healthy";
      }
    } else {
      healthReport.services.database.status = "mock_mode";
    }
  } catch (err) {
    healthReport.services.database.status = "unhealthy";
    healthReport.services.database.error = err.message;
    healthReport.status = "degraded";
  }

  // 2. Check Stripe Configuration Status
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey) {
    healthReport.services.payments.status = "configured";
    healthReport.services.payments.mode = stripeKey.startsWith("sk_live_") ? "live" : "test";
  } else {
    healthReport.services.payments.status = "missing_secret_key";
  }

  // Calculate total endpoint latency
  healthReport.latencyMs = Date.now() - startTime;

  // If critical database is down, return 503 so load balancers/monitors trigger alerts
  const isHealthy = healthReport.services.database.status !== "unhealthy";
  const httpStatus = isHealthy ? 200 : 503;

  return NextResponse.json(healthReport, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
