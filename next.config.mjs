/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Hide the Next.js header to prevent version fingerprinting
  poweredByHeader: false,

  // 2. Production HTTP Security Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://api.dicebear.com https://*.supabase.co https://*.stripe.com https://pbs.twimg.com https://abs.twimg.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://checkout.stripe.com",
              "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://twitter.com",
              "base-uri 'self'",
              "form-action 'self' https://checkout.stripe.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
