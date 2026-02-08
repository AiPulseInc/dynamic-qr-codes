import type { MetadataRoute } from "next";

import { getServerEnv } from "@/lib/env/server";

export default function sitemap(): MetadataRoute.Sitemap {
  const env = getServerEnv();
  const baseUrl = env.APP_BASE_URL.replace(/\/$/, "");

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
