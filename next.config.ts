import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    incomingRequests: {
      ignore: [/^\/api\/integrations\/strava\/callback(?:\?|$)/],
    },
  },
  outputFileTracingRoot: __dirname,
  typedRoutes: true,
};

export default nextConfig;
