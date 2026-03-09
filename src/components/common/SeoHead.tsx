import React from "react";
import { Helmet } from "react-helmet-async";
import {
  buildAbsoluteUrl,
  toAbsoluteImageUrl,
  toMetaDescription,
} from "@/utils/seo.utils";

type JsonLd = Record<string, unknown>;

interface SeoHeadProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string[];
  noindex?: boolean;
  jsonLd?: JsonLd | JsonLd[];
}

const SITE_NAME = "SEN";

const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  path = "/",
  image,
  type = "website",
  keywords,
  noindex = false,
  jsonLd,
}) => {
  const finalTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const finalDescription = toMetaDescription(description);
  const canonicalUrl = buildAbsoluteUrl(path);
  const imageUrl = toAbsoluteImageUrl(image);
  const jsonLdEntries = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}

      <link rel="canonical" href={canonicalUrl} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonicalUrl} />
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
