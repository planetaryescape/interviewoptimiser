import { config } from "../../../config";

export async function GET() {
  const content = `
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /api/og/*
Disallow: /api/*

Sitemap: ${config.baseUrl}/sitemap.xml
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
