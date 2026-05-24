import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.erina-assistance.com"; // Replace with your production domain

  const routes = [
    "",
    "/about",
    "/contact",
    "/booking",
    "/membership",
    "/partner",
    "/login",
    "/tracking",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
