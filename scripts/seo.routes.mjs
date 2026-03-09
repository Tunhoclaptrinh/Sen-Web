import fs from "node:fs/promises";
import path from "node:path";

export const STATIC_PUBLIC_ROUTES = [
  "/",
  "/heritage-sites",
  "/artifacts",
  "/history",
  "/exhibitions",
];

const DEFAULT_SITE_URL = "https://sen.vn";
const DEFAULT_API_BASE_URL = "http://localhost:3000/api";

export const getSiteUrl = () =>
  (process.env.VITE_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/g, "");

export const getApiBaseUrl = () =>
  (process.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/g, "");

const requestTimeoutMs = Number(process.env.SEO_API_TIMEOUT_MS || 12000);

const withTimeoutFetch = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed ${response.status} for ${url}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const toDataArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.result)) {
    return payload.result;
  }

  return [];
};

const normalizeId = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const id = String(value).trim();
  return id ? id : null;
};

const buildEndpointUrl = (resourcePath, query = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = new URL(resourcePath.replace(/^\/+/, ""), `${baseUrl}/`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

const fetchList = async (resourcePath, query = {}) => {
  try {
    const data = await withTimeoutFetch(buildEndpointUrl(resourcePath, query));
    return toDataArray(data);
  } catch (error) {
    console.warn(`[seo] Skip dynamic routes from ${resourcePath}:`, error.message);
    return [];
  }
};

export const buildSeoRoutes = async () => {
  const routes = new Set(STATIC_PUBLIC_ROUTES);

  const [heritages, artifacts, histories, exhibitions] = await Promise.all([
    fetchList("heritage-sites", { status: "published", isActive: true, limit: 1000 }),
    fetchList("artifacts", { status: "published", limit: 1000 }),
    fetchList("history", { status: "published", limit: 1000 }),
    fetchList("exhibitions", { status: "published", isActive: true, _limit: 1000 }),
  ]);

  for (const item of heritages) {
    const id = normalizeId(item?.id ?? item?._id);
    if (id) {
      routes.add(`/heritage-sites/${id}`);
    }
  }

  for (const item of artifacts) {
    const id = normalizeId(item?.id ?? item?._id);
    if (id) {
      routes.add(`/artifacts/${id}`);
    }
  }

  for (const item of histories) {
    const id = normalizeId(item?.id ?? item?._id);
    if (id) {
      routes.add(`/history/${id}`);
    }
  }

  for (const item of exhibitions) {
    const id = normalizeId(item?.id ?? item?._id);
    if (id) {
      routes.add(`/exhibitions/${id}`);
    }
  }

  return Array.from(routes).sort((a, b) => a.localeCompare(b));
};

export const writeJsonFile = async (outputPath, data) => {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};
