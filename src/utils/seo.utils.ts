const DEFAULT_SITE_URL = "https://sen.vn";
const DEFAULT_DESCRIPTION =
  "SEN la nen tang kham pha di san van hoa Viet Nam voi trai nghiem tuong tac va hoc tap hien dai.";

const normalizeSiteUrl = (value: string) => value.replace(/\/+$/g, "");

export const getSiteUrl = () => {
  const envSiteUrl = import.meta.env.VITE_SITE_URL;
  if (!envSiteUrl || typeof envSiteUrl !== "string") {
    return DEFAULT_SITE_URL;
  }

  return normalizeSiteUrl(envSiteUrl);
};

export const buildAbsoluteUrl = (routePath = "/") => {
  if (/^https?:\/\//i.test(routePath)) {
    return routePath;
  }

  const normalizedPath = routePath.startsWith("/") ? routePath : `/${routePath}`;
  return `${getSiteUrl()}${normalizedPath}`;
};

const BASE_URL = window.location.origin;

export const toAbsoluteImageUrl = (image?: string): string => {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `${BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

/**
 * Generates a branded OG image URL with text overlay.
 * Note: This uses a placeholder service that simulates how a real OG image service would work.
 * Ideally, this would be a specialized API or a cloud function.
 */
export const getBrandedOgImage = (title: string, backgroundImage?: string): string => {
  const brand = "SEN Culture";
  const titleParam = encodeURIComponent(title);
  const brandParam = encodeURIComponent(brand);
  const bgParam = backgroundImage ? encodeURIComponent(toAbsoluteImageUrl(backgroundImage)) : "";
  
  // Simulation of a dynamic service (can be replaced with actual endpoint)
  return `https://og-image-sen.vercel.app/${titleParam}.png?theme=dark&md=1&fontSize=100px&images=https%3A%2F%2Fsen-culture.vn%2Flogo.png&caption=${brandParam}${bgParam ? `&bg=${bgParam}` : ""}`;
};

export const stripHtmlTags = (value?: string | null) => {
  if (!value) {
    return "";
  }

  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

export const truncateText = (value: string, maxLength = 160) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}...`;
};

export const toMetaDescription = (
  value?: string | null,
  fallback = DEFAULT_DESCRIPTION,
  maxLength = 160
) => {
  const normalized = truncateText(stripHtmlTags(value), maxLength);
  if (normalized) {
    return normalized;
  }

  return truncateText(fallback, maxLength);
};

export const DEFAULT_SEO_DESCRIPTION = DEFAULT_DESCRIPTION;
