import { MetadataRoute } from "next";
import { SEO_LOCATIONS, SEO_SERVICES } from "@/lib/seo-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.erinaassistance.in"; // Replace with your production domain

  const baseRoutes = [
    "",
    "/about",
    "/contact",
    "/booking",
    "/membership",
    "/partner",
    "/login",
    "/tracking",
  ];

  const dynamicRoutes: string[] = [];
  SEO_SERVICES.forEach((service) => {
    SEO_LOCATIONS.forEach((location) => {
      dynamicRoutes.push(`/${service.slug}-in-${location.slug}`);
    });
  });

  const routes = [...baseRoutes, ...dynamicRoutes];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : (baseRoutes.includes(route) ? 0.8 : 0.6),
  }));
}
