import React from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import {
  buildAbsoluteUrl,
  toAbsoluteImageUrl,
  toMetaDescription,
  getBrandedOgImage,
} from "@/utils/seo.utils";

type JsonLd = Record<string, unknown>;

interface SeoHeadProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  preloadImage?: string;
  type?: "website" | "article";
  keywords?: string[];
  noindex?: boolean;
  useBrandedOg?: boolean;
  jsonLd?: JsonLd | JsonLd[];
}

const SITE_NAME = "SEN";
const SUPPORTED_LANGUAGES = ["vi", "en"];

const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  path = "/",
  image,
  preloadImage,
  type = "website",
  keywords,
  noindex = false,
  useBrandedOg = false,
  jsonLd,
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "vi";

  const finalTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const finalDescription = toMetaDescription(description);
  const canonicalUrl = buildAbsoluteUrl(path);
  const imageUrl = useBrandedOg 
    ? getBrandedOgImage(title, image) 
    : toAbsoluteImageUrl(image);
  const preloadImageUrl = toAbsoluteImageUrl(preloadImage);
  const jsonLdEntries = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}

      {preloadImageUrl && (
        <link rel="preload" as="image" href={preloadImageUrl} />
      )}

      <link rel="canonical" href={canonicalUrl} />
      
      {/* Hreflang support */}
      {SUPPORTED_LANGUAGES.map((lang) => (
        <link
          key={`hreflang-${lang}`}
          rel="alternate"
          hrefLang={lang}
          href={canonicalUrl} // For now, the URL doesn't have lang prefix in path
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={currentLang === "vi" ? "vi_VN" : "en_US"} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}

      <meta name="twitter:card" content={imageUrl ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      {jsonLdEntries.map((entry, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
        >{`${JSON.stringify(entry)}`}</script>
      ))}
    </Helmet>
  );
};

export default SeoHead;
