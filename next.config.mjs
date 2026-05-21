/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 关键配置：让 Next.js 生成静态 HTML
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
