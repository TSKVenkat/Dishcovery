/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: false
  },
  // Ensure proper handling of react-webcam and other external libraries
  transpilePackages: ['react-webcam']
};

module.exports = nextConfig; 