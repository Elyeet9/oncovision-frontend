import type { NextConfig } from "next";
import { API_IP, API_PORT } from "./src/utils/config";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{
      protocol: "http",
      hostname: "localhost",
      port: "8080",
      pathname: "/**",
    }, {
      protocol: "http",
      hostname: API_IP,
      port: API_PORT,
      pathname: "/**",
    },
  ],
  },
};

export default nextConfig;
