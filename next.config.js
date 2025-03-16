/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'exafunction.github.io',
      'placehold.co',
      'codeium.com',
      'images.codeium.com',
      'cdn.codeium.com',
      'opengraph.githubassets.com',
      'i.ytimg.com'
    ],
  },
}

module.exports = nextConfig 