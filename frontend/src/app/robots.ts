import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.erinaassistance.in"; // Replace with your production domain

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/", // Protect backend API routes from being crawled
        "/tracking", // Prevent raw dynamic active tracking gates from indexing
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
