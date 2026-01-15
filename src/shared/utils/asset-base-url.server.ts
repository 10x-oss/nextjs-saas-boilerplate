const stripTrailingSlashes = (value: string) => value.replace(/\/+$/, "");
const stripLeadingSlashes = (value: string) => value.replace(/^\/+/, "");

const isCloudflareR2Host = (hostname: string) =>
  hostname.endsWith(".r2.cloudflarestorage.com") ||
  hostname.endsWith(".r2.dev");

const deriveDoCdnBaseUrl = (bucket: string, hostname?: string) => {
  const regionFromHostname = hostname?.split(".")?.[0];
  const region = process.env.SPACES_REGION || regionFromHostname || "sfo3";
  return `https://${bucket}.${region}.cdn.digitaloceanspaces.com`;
};

const deriveR2AccountBase = (bucket: string): string | undefined => {
  const accountId =
    process.env.R2_ACCOUNT_ID ||
    process.env.CLOUDFLARE_ACCOUNT_ID ||
    process.env.R2_ACCOUNT ||
    undefined;
  if (!accountId) return undefined;
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}`;
};

const deriveBaseFromEndpoint = (
  bucket: string,
  endpoint: string
): string | undefined => {
  const normalizedEndpoint = stripTrailingSlashes(endpoint);

  try {
    const { hostname, pathname } = new URL(normalizedEndpoint);
    if (isCloudflareR2Host(hostname)) {
      if (pathname && pathname !== "/" && pathname.includes(bucket)) {
        return stripTrailingSlashes(normalizedEndpoint);
      }
      return `${normalizedEndpoint}/${bucket}`;
    }

    if (hostname.endsWith(".digitaloceanspaces.com")) {
      if (pathname && pathname !== "/" && pathname.includes(bucket)) {
        return stripTrailingSlashes(normalizedEndpoint);
      }
      return deriveDoCdnBaseUrl(bucket, hostname);
    }
  } catch (_err) {
    // Fall through to the generic handling below if URL parsing fails
  }

  return `${normalizedEndpoint}/${bucket}`;
};

export function getServerAssetBaseUrl(): string | undefined {
  const explicitBase =
    process.env.ASSET_BASE_URL ||
    process.env.R2_PUBLIC_BASE_URL ||
    process.env.R2_PUBLIC_DOMAIN;
  if (explicitBase) return stripTrailingSlashes(explicitBase);

  const bucket = process.env.R2_BUCKET || process.env.SPACES_BUCKET;
  if (!bucket) return undefined;

  const endpoint =
    process.env.R2_PUBLIC_ENDPOINT ||
    process.env.R2_ENDPOINT ||
    process.env.SPACES_ENDPOINT;
  if (endpoint) {
    const derived = deriveBaseFromEndpoint(bucket, endpoint);
    if (derived) return stripTrailingSlashes(derived);
  }

  const r2AccountBase = deriveR2AccountBase(bucket);
  if (r2AccountBase) return stripTrailingSlashes(r2AccountBase);

  if (process.env.SPACES_REGION) {
    const doBase = deriveDoCdnBaseUrl(bucket);
    if (doBase) return stripTrailingSlashes(doBase);
  }

  return undefined;
}

export function buildServerAssetUrl(
  key: string | undefined | null
): string | undefined {
  if (!key) return undefined;
  const base = getServerAssetBaseUrl();
  if (!base) return undefined;
  return `${base}/${stripLeadingSlashes(key)}`;
}
