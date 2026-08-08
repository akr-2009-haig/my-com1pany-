/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode:true,
  images:{ domains:["res.cloudinary.com","localhost"], remotePatterns:[{protocol:"https",hostname:"**"}] },
  experimental:{}
};
module.exports = nextConfig;
