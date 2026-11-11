import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  renderSeoHead,
  SITE_NAME,
  LOGO_URL,
} from "../seoMetadata";

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }

  element.setAttribute("content", content);
}

function setCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.append(element);
  }

  element.href = url;
}

export default function RouteSEO() {
  const { pathname } = useLocation();

  useEffect(() => {
    const {
      title,
      description,
      canonicalUrl,
      robots,
      structuredData: schema,
    } =
      renderSeoHead(pathname);

    document.title = title;
    setMeta("name", "description", description);
    setMeta("name", "robots", robots);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", LOGO_URL);
    setMeta("property", "og:image:alt", `${SITE_NAME} logo`);
    setMeta("property", "og:locale", "en_US");
    setMeta("name", "twitter:card", "summary");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", LOGO_URL);
    setCanonical(canonicalUrl);

    let schemaElement = document.getElementById("college-structured-data");

    if (schema) {
      if (!schemaElement) {
        schemaElement = document.createElement("script");
        schemaElement.id = "college-structured-data";
        schemaElement.type = "application/ld+json";
        document.head.append(schemaElement);
      }

      schemaElement.textContent = JSON.stringify(schema).replace(
        /</g,
        "\\u003c"
      );
    } else if (schemaElement) {
      schemaElement.remove();
    }
  }, [pathname]);

  return null;
}
