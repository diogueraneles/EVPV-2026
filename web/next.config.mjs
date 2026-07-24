/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.camara.leg.br" },
      { protocol: "https", hostname: "**.senado.leg.br" },
      { protocol: "https", hostname: "**.senado.gov.br" },
    ],
  },
  async redirects() {
    return [
      { source: "/metodologia", destination: "/como-funciona", permanent: true },
      { source: "/faq", destination: "/como-funciona", permanent: true },
    ];
  },
};

export default nextConfig;
