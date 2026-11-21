/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['localhost', 'musclegreedbackend.weprixe.in', 'adminmuscle.weprixe.in'],
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.b-cdn.net',
      },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
