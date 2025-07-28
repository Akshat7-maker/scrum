// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;


// changed

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   experimental: {
//     serverActions: {
//       allowedOrigins: ['localhost:3000', 'your-app-name.vercel.app'],
//       bodySizeLimit: '2mb',
//     },
//   },
  
//   // Updated for Next.js 15 - moved from experimental
//   serverExternalPackages: ['@clerk/nextjs', '@prisma/client'],
  
//   // Turbopack configuration instead of webpack for Next.js 15
//   turbo: {
//     rules: {
//       '*.svg': {
//         loaders: ['@svgr/webpack'],
//         as: '*.js',
//       },
//     },
//   },
  
//   // Optional: Add logging for debugging
//   logging: {
//     fetches: {
//       fullUrl: true,
//     },
//   },
// };

// export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'projectrack.akshatchopra.live'],
      bodySizeLimit: '2mb',
    },
  },
  
  // Updated for Next.js 15 - moved from experimental
  serverExternalPackages: ['@clerk/nextjs', '@prisma/client'],
};

export default nextConfig;
