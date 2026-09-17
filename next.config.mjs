/** @type {import('next').NextConfig} */

// El host de Supabase sale de la variable de entorno, así no hay dominios hardcodeados.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co').hostname;
  } catch {
    return 'placeholder.supabase.co';
  }
})();

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' },
    ],
  },
  webpack: (config) => {
    // pdfjs intenta resolver "canvas" (solo Node). En el navegador no hace falta.
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
};

export default nextConfig;
