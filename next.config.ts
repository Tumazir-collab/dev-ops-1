import type { NextConfig } from "next";

// Extra hosts for `next dev` when you open the app by EC2 IP (HMR / dev scripts are cross-origin vs localhost).
const extraDevHosts =
  process.env.NEXT_DEV_ALLOWED_HOSTS?.split(",")
    .map((h) => h.trim())
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    ...extraDevHosts,
    "localhost",
    "127.0.0.1",
    "15.135.194.215",
  ],
};

export default nextConfig;
