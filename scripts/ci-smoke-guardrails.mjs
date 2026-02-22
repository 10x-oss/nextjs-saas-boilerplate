#!/usr/bin/env node

import { spawn } from "node:child_process";
import { once } from "node:events";
import { rmSync } from "node:fs";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

const PROJECT_NAME = "Boilerplate";
const CHECKOUT_PATH = "/api/stripe/create-checkout-session";
const WEBHOOK_PATH = "/api/webhook/stripe";
const REQUIRED_SECURITY_HEADERS = [
  "strict-transport-security",
  "x-frame-options",
  "x-content-type-options",
];
const CSP_HEADER_NAMES = [
  "content-security-policy",
  "content-security-policy-report-only",
];

const port = Number.parseInt(process.env.CI_SMOKE_PORT || "4123", 10);
const host = "127.0.0.1";
const baseUrl = `http://${host}:${port}`;
const startupTimeoutMs = Number.parseInt(
  process.env.CI_SMOKE_STARTUP_TIMEOUT_MS || "120000",
  10
);

const env = {
  ...process.env,
  CI: process.env.CI || "1",
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || baseUrl,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || baseUrl,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || baseUrl,
  BASE_URL: process.env.BASE_URL || baseUrl,
  CANCEL_URL: process.env.CANCEL_URL || `${baseUrl}/`,
  NEXTAUTH_SECRET:
    process.env.NEXTAUTH_SECRET || "ci-smoke-nextauth-secret-0123456789",
  STRIPE_SECRET_KEY:
    process.env.STRIPE_SECRET_KEY || "sk_test_ci_smoke_guardrails",
  STRIPE_WEBHOOK_SECRET:
    process.env.STRIPE_WEBHOOK_SECRET || "whsec_ci_smoke_guardrails",
  STRIPE_PRICE_ID_BASIC: process.env.STRIPE_PRICE_ID_BASIC || "price_ci_basic",
  STRIPE_PRICE_ID_YEARLY:
    process.env.STRIPE_PRICE_ID_YEARLY || "price_ci_yearly",
  STRIPE_PRICE_ID_FOUNDING:
    process.env.STRIPE_PRICE_ID_FOUNDING || "price_ci_founding",
  STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO || "price_ci_pro",
  DATABASE_URL:
    process.env.DATABASE_URL || "postgresql://ci:ci@127.0.0.1:5432/ci_smoke",
  DIRECT_URL:
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL ||
    "postgresql://ci:ci@127.0.0.1:5432/ci_smoke",
};

const logs = [];
const captureLogs = (source, chunk) => {
  const lines = chunk.toString().split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    logs.push(`[${source}] ${line}`);
  }
  if (logs.length > 200) {
    logs.splice(0, logs.length - 200);
  }
};

rmSync(".next/dev/lock", { force: true });

const nextBin =
  process.platform === "win32" ? "node_modules/.bin/next.cmd" : "node_modules/.bin/next";

const server = spawn(nextBin, ["dev", "--hostname", host, "--port", String(port)], {
  env,
  stdio: ["ignore", "pipe", "pipe"],
});

server.stdout.on("data", (chunk) => captureLogs("next:stdout", chunk));
server.stderr.on("data", (chunk) => captureLogs("next:stderr", chunk));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForServer() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < startupTimeoutMs) {
    if (server.exitCode !== null) {
      throw new Error(`Next dev server exited early with code ${server.exitCode}`);
    }

    try {
      const res = await fetch(`${baseUrl}/`, { redirect: "manual" });
      if (res.status >= 200 && res.status < 600) {
        return;
      }
    } catch {
      // Retry until timeout.
    }

    await delay(500);
  }

  throw new Error(`Timed out waiting for Next dev server after ${startupTimeoutMs}ms`);
}

async function shutdownServer() {
  if (server.exitCode !== null) {
    return;
  }

  server.kill("SIGTERM");

  try {
    await Promise.race([
      once(server, "exit"),
      delay(10_000).then(() => {
        throw new Error("Timed out waiting for Next dev server to exit");
      }),
    ]);
  } catch {
    server.kill("SIGKILL");
  }
}

async function run() {
  await waitForServer();

  const checkoutRes = await fetch(`${baseUrl}${CHECKOUT_PATH}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
    redirect: "manual",
  });

  assert(
    checkoutRes.status === 401,
    `Expected unauthenticated checkout to return 401, got ${checkoutRes.status}`
  );

  for (const headerName of REQUIRED_SECURITY_HEADERS) {
    const value = checkoutRes.headers.get(headerName);
    assert(value && value.trim().length > 0, `Missing required security header: ${headerName}`);
  }

  const cspHeaderName = CSP_HEADER_NAMES.find((name) =>
    Boolean(checkoutRes.headers.get(name))
  );
  assert(
    cspHeaderName,
    `Missing CSP header. Expected one of: ${CSP_HEADER_NAMES.join(", ")}`
  );

  const webhookMissingSignatureRes = await fetch(`${baseUrl}${WEBHOOK_PATH}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
    redirect: "manual",
  });

  assert(
    webhookMissingSignatureRes.status === 400,
    `Expected webhook without signature to return 400, got ${webhookMissingSignatureRes.status}`
  );

  const webhookInvalidSignatureRes = await fetch(`${baseUrl}${WEBHOOK_PATH}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": "t=1700000000,v1=invalid-signature",
    },
    body: "{}",
    redirect: "manual",
  });

  assert(
    webhookInvalidSignatureRes.status === 400,
    `Expected webhook with invalid signature to return 400, got ${webhookInvalidSignatureRes.status}`
  );

  console.log(
    `✅ ${PROJECT_NAME} CI smoke guardrails passed: checkout(401), webhook(missing=400, invalid=400), headers(${REQUIRED_SECURITY_HEADERS.join(
      ", "
    )}, ${cspHeaderName})`
  );
}

try {
  await run();
} catch (error) {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(`❌ ${PROJECT_NAME} CI smoke guardrails failed`);
  console.error(message);
  if (logs.length) {
    console.error("\nRecent Next.js logs:");
    console.error(logs.slice(-40).join("\n"));
  }
  process.exitCode = 1;
} finally {
  await shutdownServer();
  if (process.exitCode) {
    process.exit(process.exitCode);
  }
}
