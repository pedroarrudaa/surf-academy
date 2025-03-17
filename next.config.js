/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'exafunction.github.io'
      },
      {
        protocol: 'https',
        hostname: 'placehold.co'
      },
      {
        protocol: 'https',
        hostname: 'codeium.com'
      },
      {
        protocol: 'https',
        hostname: 'images.codeium.com'
      },
      {
        protocol: 'https',
        hostname: 'cdn.codeium.com'
      },
      {
        protocol: 'https',
        hostname: 'opengraph.githubassets.com'
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com'
      }
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { isServer }) => {
    // Handle FFmpeg and native dependencies
    config.externals = [
      ...(config.externals || []),
      {
        'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
        '@ffmpeg-installer/ffmpeg': 'commonjs @ffmpeg-installer/ffmpeg',
        'ytdl-core': 'commonjs ytdl-core',
        'yt-dlp-exec': 'commonjs yt-dlp-exec',
      }
    ];
    
    return config;
  },
}

module.exports = nextConfig 