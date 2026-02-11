import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "zrcrwjraseuazkljcrlk.supabase.co" },
    ],
  },
};

export default nextConfig;
