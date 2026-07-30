const AMAZON_HOST_PATTERN =
  /(?:^|\.)amazon\.(com|[a-z]{2}|(?:com|co)\.[a-z]{2})$/;
const PRODUCT_PATH_PATTERN =
  /\/(?:dp|gp\/product|gp\/aw\/d)\/([a-z0-9]{10})(?:\/|$)/i;

/**
 * Amazonの商品URLを https://www.amazon.<地域>/dp/<ASIN> に正規化する。
 *
 * 対応パス:
 * - /dp/B012345678
 * - /gp/product/B012345678
 * - /gp/aw/d/B012345678
 */
export function toCleanAmazonUrl(rawUrl: string): string | null {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const hostMatch = url.hostname.toLowerCase().match(AMAZON_HOST_PATTERN);
  const asinMatch = url.pathname.match(PRODUCT_PATH_PATTERN);

  if (!hostMatch || !asinMatch) {
    return null;
  }

  const amazonSuffix = hostMatch[1]!;
  const asin = asinMatch[1]!;

  return `https://www.amazon.${amazonSuffix}/dp/${asin.toUpperCase()}`;
}
