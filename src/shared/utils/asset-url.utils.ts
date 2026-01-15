const stripSlashes = (value: string) => value.replace(/\/+$/, "");

const ensureKey = (key: string) => key.replace(/^\/+/, "");

export function getAssetBaseUrl(): string | undefined {
  const base = process.env.NEXT_PUBLIC_ASSET_BASE_URL;
  if (!base) return undefined;
  return stripSlashes(base);
}

export function buildAssetUrlFromKey(
  key?: string | null,
  fallbackUrl?: string | null
): string | undefined {
  if (key) {
    const base = getAssetBaseUrl();
    if (base) {
      return `${base}/${ensureKey(key)}`;
    }
  }
  return fallbackUrl ?? undefined;
}

export interface BlockAssetLike {
  url?: string | null;
  key?: string | null;
}

export function resolveBlockAssetUrl(
  data: BlockAssetLike | null | undefined
): string | undefined {
  if (!data) return undefined;
  return buildAssetUrlFromKey(data.key ?? undefined, data.url ?? undefined);
}
