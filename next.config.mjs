/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [], // Add any external image domains here if needed
  },
  eslint: {
    ignoreDuringBuilds: true, // Optional: if you want to bypass ESLint during build
  },
}

export default nextConfig 