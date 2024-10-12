import { config } from "@/lib/config";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api",
          "/api/*",
          "/_next",
          "/_next/*",
          "/admin",
          "/admin/*",
        ],
      },
      {
        userAgent: "Googlebot", // Additional rule for Googlebot, allowing everything
        allow: ["/"],
      },
      {
        userAgent: "Bingbot", // Additional rule for Bingbot, allowing everything
        allow: ["/"],
      },
    ],
    sitemap: `${config.baseUrl}/sitemap.xml`,
    host: `${config.baseUrl}`,
  };
}
