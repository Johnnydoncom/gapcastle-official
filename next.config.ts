import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      // blog cover uploads are capped at 3 MB in the action; leave headroom for the other fields
      bodySizeLimit: "4mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  /* Keep links and search rankings from the WordPress site working. */
  async redirects() {
    return [
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/our-services", destination: "/services", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/application-for-school-loan", destination: "/apply/school-fee-loan", permanent: true },
      { source: "/application-for-travel-loan", destination: "/apply/travel-loan", permanent: true },
      { source: "/gap-castles-fun-food-factory", destination: "/fun-food-factory", permanent: true },
    ];
  },
};

export default nextConfig;
