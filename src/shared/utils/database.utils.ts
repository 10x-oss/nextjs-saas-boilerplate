import "server-only";
import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// Enable WebSocket for environments that need it (local dev with Node < 22)
// Node 22+ has native WebSocket support
if (typeof globalThis.WebSocket === "undefined") {
  // Only import ws if WebSocket is not available
  import("ws").then((ws) => {
    neonConfig.webSocketConstructor = ws.default;
  });
}

// Type the global object for development caching
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // Use Neon serverless driver for optimal performance on Vercel
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // During build time, DATABASE_URL may not be available
    // Return a minimal client that will fail gracefully at runtime
    console.warn("DATABASE_URL not set - database operations will fail");
    return new PrismaClient();
  }

  const pool = new Pool({ connectionString });
  // @ts-expect-error - PrismaNeon expects PoolConfig but Pool works correctly
  const adapter = new PrismaNeon(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// Reuse client in development to prevent connection exhaustion during hot reload
const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
