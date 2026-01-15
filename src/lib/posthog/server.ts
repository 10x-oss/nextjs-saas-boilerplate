import { PostHog } from "posthog-node";

type CaptureArgs = {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
};

const globalPosthog = globalThis as unknown as {
  __posthogServerClient?: PostHog | null;
  __posthogEventsPending?: boolean;
};

function sanitize(
  properties?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!properties) return undefined;
  return Object.fromEntries(
    Object.entries(properties).filter(
      ([, value]) => value !== undefined && value !== null
    )
  );
}

export function getPosthogServerClient(): PostHog | null {
  if (typeof globalPosthog.__posthogServerClient !== "undefined") {
    return globalPosthog.__posthogServerClient;
  }

  // Use the same project key as client-side (NEXT_PUBLIC_ is accessible server-side too)
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) {
    globalPosthog.__posthogServerClient = null;
    return null;
  }

  globalPosthog.__posthogServerClient = new PostHog(apiKey, {
    host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
  });
  globalPosthog.__posthogEventsPending = false;
  return globalPosthog.__posthogServerClient;
}

export async function capturePosthogEvent({
  distinctId,
  event,
  properties,
}: CaptureArgs) {
  if (!distinctId || !event) return;
  const client = getPosthogServerClient();
  if (!client) return;

  client.capture({
    distinctId,
    event,
    properties: sanitize(properties),
  });

  globalPosthog.__posthogEventsPending = true;
}

export async function flushPosthog() {
  const client = getPosthogServerClient();
  if (!client) return;
  if (!globalPosthog.__posthogEventsPending) return;

  const candidate = client as unknown as {
    flushAsync?: () => Promise<void>;
    flush?: (callback: (err?: unknown) => void) => void;
  };

  try {
    if (typeof candidate.flushAsync === "function") {
      await candidate.flushAsync();
    } else if (typeof candidate.flush === "function") {
      await new Promise<void>((resolve, reject) => {
        candidate.flush?.((err?: unknown) =>
          err ? reject(err) : resolve()
        );
      });
    } else {
      await new Promise<void>((resolve) => setImmediate(resolve));
    }
  } finally {
    globalPosthog.__posthogEventsPending = false;
  }
}

export async function shutdownPosthog() {
  const client = getPosthogServerClient();
  if (!client) return;
  const candidate = client as unknown as {
    shutdown?: (shutdownTimeoutMs?: number) => void;
    _shutdown?: (shutdownTimeoutMs?: number) => Promise<void>;
  };
  if (typeof candidate._shutdown === "function") {
    await candidate._shutdown();
  } else if (typeof candidate.shutdown === "function") {
    candidate.shutdown();
  }
  globalPosthog.__posthogServerClient = null;
  globalPosthog.__posthogEventsPending = false;
}
