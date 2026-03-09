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

export const toAbsoluteImageUrl = (image?: string | null) => {
  if (!image) {
    return undefined;
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return buildAbsoluteUrl(image.startsWith("/") ? image : `/${image}`);
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
