/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions:{
            allowedOrigins: ['http://localhost:3000','projectrack.akshatchopra.live','*.projectrack.akshatchopra.live'],
            bodySizeLimit:'50mb'
        }
    }
};

export default nextConfig;


